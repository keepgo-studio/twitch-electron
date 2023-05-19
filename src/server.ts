import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import { parentPort } from "worker_threads"
import { AddressInfo } from "net";

interface MessageToMain {
	type: "update user from web" | "sync port";
	data: Partial<{
		userInfo: TUserInfo;
		addressInfo: AddressInfo
	}>;
}

export type {
  	MessageToMain
};

function UA(
	req: http.IncomingMessage,
	res: http.ServerResponse
	) {
	const allowedUser = [
		"twitch-electron"
	]
	const user = allowedUser.find(_user => _user === req.headers["user-agent"]);

	if (!user) {
		return -1;
	}

	return 0;
}

function CORS(
	req: http.IncomingMessage,
	res: http.ServerResponse
	) {
	const allowedOrigins = [
		"http://localhost:5000",
		"http://localhost:5002",
		"https://twitch-group.firebaseapp.com"
	];

	const url = allowedOrigins.find(_url => _url === req.headers.origin);

	if (!req.headers.origin || !url) {
		res.statusCode = 400;
		res.end("cannot recognize origin");
		return -1;
	}

	res.setHeader("Access-Control-Allow-Origin", url);

	return 0;
}

function main(
	req: http.IncomingMessage,
	res: http.ServerResponse
	) {
	if (UA(req, res) == -1 && CORS(req, res) == -1) return;

	switch (req.method) {
		case "GET":
		if (!req.url || req.url === "/") {
			sendResponse("public/index.html", "text/html", res);
		} else{
			sendResponse(req.url, getContentType(req.url), res);
		}
		break;
		
		case "POST":
		if (req.url === "/update") {
			let body = '';

			req.on('data', function (data) {
			body += data;
			});

			req.on('end', function () {
			parentPort?.postMessage({
				type: "update user from web",
				data: {
				userInfo: JSON.parse(body) as TUserInfo
				}
			} as MessageToMain)
			})

			res.statusCode = 200;
			res.end("received from server!");
		}
		break;
	}

}

function sendResponse(
	url: string,
	contentType: string,
	res: http.ServerResponse
	) {
	const filePath = path.join(__dirname, url);

	fs.readFile(filePath, (err, content) => {
		if (err) {
		res.writeHead(404);
		res.write(`File ${filePath} cannot found!\n`);
		res.end();
		} else {
		res.writeHead(200, { "Content-Type": contentType });
		res.write(content);
		res.end();
		}
	});
}

function getContentType(url: string) {
	switch (path.extname(url)) {
		case ".html":
		return "text/html";
		case ".css":
		return "text/css";
		case ".js":
		return "text/javascript";
		case ".json":
		return "application/json";
		default:
		return "application/octate-stream";
	}
}

function openServer(server:http.Server, port: number) {
	server.listen(port, () => {
		console.log("local server run at port:", server.address());

		parentPort?.postMessage({
		type: "sync port",
		data: {
			addressInfo: server.address()
		}
		} as MessageToMain)
	});
}

let DEFAULT_PORT = 8888;

let server = http.createServer(main)
openServer(server, DEFAULT_PORT);

server.on("error", (err) => {
	if (err.message.match(/EADDRINUSE/)) {
		server.close(() => {
			server = http.createServer(main)
			
			openServer(server, ++DEFAULT_PORT);
		})
	}
	else {
		console.error(err);
	}
});