import * as path from 'path';
import { Worker } from 'worker_threads';
import { app, BrowserWindow, ipcMain, shell, session, globalShortcut } from "electron";

import type { MessageToMain } from 'server';

interface TwitchGQLResonpse {
    operationName?: "FollowButton_UnfollowUser" | "FollowButton_FollowUser",
    variables?: {
        input?: {
            targetID?: BroadcasterId
        }
    }
}

function arrayBufferToJson(buffer: ArrayBuffer) {
    return JSON.parse(String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))));
}

function shouldQuit() {
    if (AppProcess.isHide && PlayerProcess.isHide) {
        if (process.platform !== "darwin") {
            app.exit(0);
        }
        
        if (!app.isPackaged) {
            app.exit(0);
        }
    }
}

class MainLifeCycleProcess {
    static win?: BrowserWindow;
    
    static create() {
        this.win = new BrowserWindow({ show: false });

        this.win.on("closed", () => {
            app.exit(0);
        });
    }
}

class PlayerProcess {
    static win?: BrowserWindow;
    static isHide = true;

    static create() {
        session.defaultSession.webRequest.onCompleted({
            urls: [
                "https://gql.twitch.tv/gql"
            ]
        }, (details) => {
            const { uploadData } = details as any;

            if (uploadData && uploadData[0]?.bytes) {
                const payloadData = arrayBufferToJson(uploadData[0].bytes)[0] as TwitchGQLResonpse;

                if (payloadData?.operationName === "FollowButton_FollowUser"
                || payloadData?.operationName === "FollowButton_UnfollowUser") {
                    AppProcess.win!.webContents.send("follow-event-occur", {
                        type: payloadData?.operationName,
                        targetId: payloadData.variables?.input?.targetID
                    });
                }
            }
        })

        session.defaultSession.webRequest.onBeforeRequest({
            urls: [
              'https://embed.twitch.tv/*channel=*',
            ]
          }, (details, cb) => {

            var redirectURL = details.url;
            
            var params = new URLSearchParams(redirectURL.replace('https://embed.twitch.tv/',''));
            if (params.get('parent') != '') {
                cb({});
                return;
            }
            params.set('parent', 'locahost');
            params.set('referrer', 'https://localhost/');
        
            var redirectURL = 'https://embed.twitch.tv/?' + params.toString();
        
            cb({
              cancel: false,
              redirectURL
            });
          });
        
        session.defaultSession.webRequest.onHeadersReceived({
            urls: [
                'https://www.twitch.tv/*',
                'https://player.twitch.tv/*',
                'https://embed.twitch.tv/*'
            ]
        }, (details, cb) => {
            var responseHeaders = details.responseHeaders!;
        
            delete responseHeaders['Content-Security-Policy'];
        
            cb({
                cancel: false,
                responseHeaders
            });
        });
        
        this.win = new BrowserWindow({
            webPreferences: {
                preload: path.join(__dirname, "player.preload.js")
            },
            resizable: true,
            width: 1000,
            height: 700,
            show: false,
            alwaysOnTop: true
        });

        this.win!.loadFile(path.join(__dirname, "public", "player.html"));
        this.win.removeMenu();

        this.win.on("close", (e) => {
            e.preventDefault();
            this.win!.hide();
            this.win!.webContents.send("hide-window");

            this.isHide = true;
            shouldQuit();
        });

        this.win.on("show", () => this.isHide = false);

        // this.win.webContents.openDevTools({ mode: "detach" })
    }

    static open() {
        this.win!.show();
    }

    static changeChannel(channel: TChannel) {
        this.win!.loadFile(path.join(__dirname, "public", "player.html"), {
            query: {
                login: channel.broadcaster_login
            }
        });
    }
}

class AppProcess {
    static win: BrowserWindow;
    static isHide = false;

    static create(port: number) {
        this.win = new BrowserWindow({
            webPreferences: {
                preload: path.join(__dirname, "app.preload.js")
            },
            backgroundColor: "#1F1F23",
            resizable: false,
            width: 390,
            height: 730,
        });

        this.win.loadURL(`http://localhost:${port}/`, {
            userAgent: "twitch-electron",
        });

        this.win.removeMenu();

        this.win.on("close", (e) => {
            e.preventDefault();
            this.win!.hide();
            
            this.isHide = true;
            shouldQuit();
        });

        this.win.on("show", () => this.isHide = false);

        this.win.once("ready-to-show", () => {
            this.win.show();
        })
        // this.win.webContents.openDevTools({ mode: "detach" })
    }
}

class MainProcess {
    static opened_port = 0;

    static run() {
        const thread = new Worker(path.join(__dirname, 'server.js'));

        thread.on("message", (msg: MessageToMain) => {
            switch(msg.type) {
                case "sync port":
                    this.opened_port = msg.data.addressInfo!.port;
                    
                    this.runApp();
                    break;
                
                case "update user from web":
                    AppProcess.win
                        .webContents
                        .send("update-user", msg.data.userInfo);
            }

        })
    }
    
    static runApp() {
        // run program
        app.whenReady().then(() => {
            MainLifeCycleProcess.create();
            AppProcess.create(this.opened_port);
            PlayerProcess.create();

            app.on("activate", function() {
                AppProcess.win.show();
                AppProcess.win.focus();
            })
        })
    }

    static eventListener() {
        ipcMain.handle("open-browser", (event, url) => {
            shell.openExternal(`${url}?port=${this.opened_port}`);
        });

        ipcMain.handle("sync-aot", (_, { renderer, aot }) => {
            if (renderer === "app") {
                AppProcess.win.setAlwaysOnTop(aot, "screen-saver");
            }
            else {
                PlayerProcess.win?.setAlwaysOnTop(aot, "screen-saver");
            }

            return true;
        })

        ipcMain.handle("open-player", (_, channel) => {
            PlayerProcess.open();
            PlayerProcess.changeChannel(channel);
        })

        ipcMain.handle("focus-app", () => {
            AppProcess.win.show();
            AppProcess.win.focus();
        })
    }
}

function main() {
    MainProcess.eventListener();
    MainProcess.run();
}

main();