import * as path from 'path';
import { Worker } from 'worker_threads';
import { app, BrowserWindow, ipcMain, shell, dialog, session, MessageChannelMain } from "electron";

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


class PlayerProcess {
    static win?: BrowserWindow;

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
            // console.log('Adjust to', redirectURL);
        
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
        
            // console.log('headers', details.url, responseHeaders);
        
            delete responseHeaders['Content-Security-Policy'];
            // console.log('after', responseHeaders);
        
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

        this.win!.loadFile(`public/player.html`);
        this.win.removeMenu();

        this.win.on("close", (e) => {
            e.preventDefault();
            this.win!.hide();
            this.win!.webContents.send("hide-window");
        });
    }

    static open() {
        this.win!.show();
    }

    static changeChannel(channel: TChannel) {
        this.win!.loadFile(`public/player.html`, {
            query: {
                login: channel.broadcaster_login
            }
        });
    }
}

class AppProcess {
    static win: BrowserWindow;

    static working = false;

    static create(port: number) {
        this.win = new BrowserWindow({
            webPreferences: {
                preload: path.join(__dirname, "app.preload.js")
            },
            resizable: false,
            width: 390,
            height: 730,
            alwaysOnTop: true
        });

        this.win.loadURL(`http://localhost:${port}/`, {
            userAgent: "twitch-electron",
        });

        this.win.removeMenu();

        this.win.on("close", (e) => {
            if (!this.working) {
                PlayerProcess.win?.destroy();
                return;
            }

            const confirm = dialog.showMessageBoxSync({
                type: "question before close",
                buttons: ["Yes", "No"],
                title: "still in progress...",
                message: "data are still in progress, if you close now, the app won't save data correctly, are you sure to close right now?"
            });

            if (confirm === 1) {
                e.preventDefault();
            }

            PlayerProcess.win?.destroy();
        });

        // remove when deploy
        this.win.webContents.openDevTools({ mode: "detach" })
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
            AppProcess.create(this.opened_port);
            PlayerProcess.create();

            app.on("activate", function() {
                if (BrowserWindow.getAllWindows().length === 0) {
                    AppProcess.create(this.opened_port);
                    PlayerProcess.create();
                }
            })
        })

        // quit program
        app.on("window-all-closed", function() {
            if (process.platform === "darwin") {
                app.quit();
            }
        })

        app.on("before-quit", () => {
            PlayerProcess.win?.destroy();
        })
    }

    static eventListener() {
        ipcMain.handle("open-browser", (event, url) => {
            shell.openExternal(`${url}?port=${this.opened_port}`);
        });

        ipcMain.handle("sync-aot", (_, { renderer, aot }) => {
            if (renderer === "app") {
                AppProcess.win.setAlwaysOnTop(aot);
            }
            else {
                PlayerProcess.win?.setAlwaysOnTop(aot);
            }

            return true;
        })

        ipcMain.handle("open-player", (_, channel) => {
            PlayerProcess.open();   
            PlayerProcess.changeChannel(channel);
        })
    }
}

function main() {
    MainProcess.eventListener();
    MainProcess.run();
}

main();