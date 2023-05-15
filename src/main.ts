import * as path from 'path';
import { Worker } from 'worker_threads';
import { app, BrowserWindow, ipcMain, shell } from "electron";

import type { MessageToMain } from 'server';

class AppProcess {
    static win: BrowserWindow;


    static create(port: number) {
        this.win = new BrowserWindow({
            webPreferences: {
                preload: path.join(__dirname, "app.preload.js")
            },
            resizable: true,
            width: 370,
            height: 700,
            alwaysOnTop: true
        });

        this.win.loadURL(`http://localhost:${port}/`, {
            userAgent: "twitch-electron",
        });

        this.win.removeMenu();

        this.win.on("close", () => {});

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
                    
                    MainProcess.runApp();
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

            app.on("activate", function() {
                if (BrowserWindow.getAllWindows().length === 0) {
                    AppProcess.create(this.opened_port);
                }
            })
        })

        // quit program
        app.on("window-all-closed", function() {
            if (process.platform === "darwin") {
                app.quit();
            }
        })
    }

    static eventListener() {
        ipcMain.handle("open-browser", (event, url) => {
            shell.openExternal(`${url}?port=${this.opened_port}`);
        })
    }
}

function main() {
    MainProcess.eventListener();
    MainProcess.run();
}

main();