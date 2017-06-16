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
  } else {
    // FIXME: request.url dissapears when attempting to get it for /favicon.ico, see why it is
    // suddenly become undefined when adding another if abothe this condition.
    console.log("Received different url: " + request.url);
  }
}

function isAcceptingContent(request, contentType) {
  // Accept: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.1
  return (request.headers.accept.includes(contentType)
        || request.headers.accept.includes("*/*"))
}
