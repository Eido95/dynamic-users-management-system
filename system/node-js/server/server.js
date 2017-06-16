// https://nodejs.org/api/synopsis.html#synopsis_example

const Http = require('http');
const Fs = require('fs');
const Settings = require('./serversettings');

const server = Http.createServer((request, response) => {
  console.log("Received: " + request.method + " " + request.url + " " + request.httpVersion);
  console.log(request.headers);

  if (request.method == 'GET') {
    onGetRequested(request, response);
  }
});

server.listen(Settings.serverPort, Settings.serverIp, () => {
  console.log("Server listening at http://" + Settings.serverIp + ":" + Settings.serverPort + "...");
});

// Handles GET messages
function onGetRequested(request, response) {
  // Content-Type: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17
  if (request.url == "/" && isAcceptingContent(request, "text/html")) {
    Fs.readFile("../../index.html", "utf8", (error, data) => {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html');
      response.write(data);
      response.end();
    });
  } else if (request.url == "/style.css" && isAcceptingContent(request, "text/css")) {
    Fs.readFile("../../style.css", "utf8", (error, data) => {
      response.statusCode = 200;
      response.setHeader('Content-Type', "text/css");
      response.write(data);
      response.end();
    });
  } else if (request.url == "/script.js" && isAcceptingContent(request, "text/javascript")) {
    Fs.readFile("../../script.js", "utf8", (error, data) => {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/javascript");
      response.write(data);
      response.end();
    });
  } else if (request.url == "/favicon.ico" && isAcceptingContent(request, "image/*")) {
    Fs.readFile("../../favicon.ico", (error, data) => {
      response.statusCode = 200;
      response.setHeader('Content-Type', "image/ico");
      // CONSIDER: handle 'Accept-Encoding' of 'gizp' file compression, attempt to copress the image and send
      // it as compressed file
      response.write(data); // probably byte array filled with raw image data
      response.end();
    });
  } else {
    console.log("Received different url: " + request.url);
  }
}

function isAcceptingContent(request, contentType) {
  // Accept: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.1
  return (request.headers.accept.includes(contentType)
        || request.headers.accept.includes("*/*"))
}
