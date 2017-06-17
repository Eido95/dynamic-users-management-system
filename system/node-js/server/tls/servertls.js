const Https = require("https");
const Fs = require("fs");
const Settings = require(".././serversettings");

const options = {
  // Generate keys using git bash
  // https://stackoverflow.com/a/21180554/4188683
  // https://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server/
  // https://www.sitepoint.com/how-to-use-ssltls-with-node-js/
  // https://github.com/ZiCog/node-tls-example
  // https://gist.github.com/sandfox/1831932
  // https://nodejs.org/dist/latest-v6.x/docs/api/https.html#https_https_createserver_options_requestlistener
  key: Fs.readFileSync("private.key"),
  cert: Fs.readFileSync("public.crt"),
  // This is necessary only if using the client certificate authentication.
  requestCert: true,
  // This is necessary only if the client uses the self-signed certificate.
  // ca: [ Fs.readFileSync("public.crt") ]
};

const server = Https.createServer(options, (request, response) => {
  console.log("Authorized: " + request.socket.authorized);
  if (request.socket.authorized == false) {
    console.log("Authorization Error: " + request.socket.authorizationError);
    // FIXME: Authorized: false, Authorization Error: UNABLE_TO_GET_ISSUER_CERT
  }
  console.log(request.socket.getPeerCertificate(true));

  console.log("Received: " + request.method + " " + request.url + " " + request.httpVersion);
  console.log(request.headers);

  if (request.method == "GET") {
    onGetRequested(request, response);
  }
});

server.listen(Settings.serverSecurePort, Settings.serverIp, () => {
  console.log("Server securely listening at https://" + Settings.serverIp + ":"
              + Settings.serverSecurePort + "...");
});

// Handles GET messages
function onGetRequested(request, response) {
  // Content-Type: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17
  if (request.url == "/" && isAcceptingContent(request, "text/html")) {
    Fs.readFile("../../../index.html", "utf8", (error, data) => {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(data);
      response.end();
    });
  } else if (request.url == "/style.css" && isAcceptingContent(request, "text/css")) {
    Fs.readFile("../../../style.css", "utf8", (error, data) => {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/css");
      response.write(data);
      response.end();
    });
  } else if (request.url == "/script.js" && isAcceptingContent(request, "text/javascript")) {
    Fs.readFile("../../../script.js", "utf8", (error, data) => {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/javascript");
      response.write(data);
      response.end();
    });
  } else if (request.url == "/favicon.ico" && isAcceptingContent(request, "image/*")) {
    Fs.readFile("../../../favicon.ico", (error, data) => {
      response.statusCode = 200;
      response.setHeader("Content-Type", "image/ico");
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
