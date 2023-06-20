import * as path from 'path';
import { Worker } from 'worker_threads';
import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";

import type { MessageToMain } from 'server';

class AppProcess {
    static win: BrowserWindow;

    static working = false;

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

        this.win.on("close", (e) => {
            if (!this.working) return;

            const confirm = dialog.showMessageBoxSync({
                type: "question before close",
                buttons: ["Yes", "No"],
                title: "still in progress...",
                message: "data are still in progress, if you close now, the app won't save data correctly, are you sure to close right now?"
            });

            if (confirm === 1) {
                e.preventDefault();
            }
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
        });

        ipcMain.handle("sync-aot", (_, aot) => {
            AppProcess.win.setAlwaysOnTop(aot);

            return true;
        })
    }
}

function main() {
    MainProcess.eventListener();
    MainProcess.run();
}

main();