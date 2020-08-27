/**
 * Primary file for the API
 */

// * Dependencies
// * module to create a server
const http = require('http');
const https = require('https');
// * module to work with the url
const url = require('url');
// * module to get the payload
const StringDecoder = require('string_decoder').StringDecoder;
// * Require the current environment to use
const config = require('./lib/config');
// * Reading files from the system
const fs = require('fs');
// * Require the handlers
const handlers = require('./lib/handlers');
// * Require Helpers
const helpers = require('./lib/helpers');

// ? Define what the server does
// * Instantiating the HTTP Server
const httpServer = http.createServer((req, res) => unifiedServer(req, res));

// * Start the server, adn have it listen on a  http port
httpServer.listen(config.httpPort, () => {
  console.log(`The server is listening on port: ${config.httpPort}`);
});

// * Insitantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) =>
  unifiedServer(req, res)
);

// * Start the server, and have it listen on a https port
httpsServer.listen(config.httpsPort, () => {
  console.log(`The server is listening on port: ${config.httpsPort}`);
});
// * All the server logic for both the http and https server
const unifiedServer = (req, res) => {
  // * 1. Get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  // * 2. Get the path from the url
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // * 3. Get the Method^
  const method = req.method.toLowerCase();

  //  * 4. Get the query string as an object
  const queryStringObject = parsedUrl.query;

  //  * 5. Get the headers as an object
  const headers = req.headers;

  // * 6. Get the payload if there is any
  const decoder = new StringDecoder('utf-8');
  // * Store the data from a stream
  let buffer = '';
  req.on('data', (data) => (buffer += decoder.write(data)));
  // * Event on data end
  req.on('end', () => {
    // * End the stream
    buffer += decoder.end();

    // * Choose a handler this request should go to
    // * If one is not found go to the 404 handler
    let chosenHandler =
      typeof router[trimmedPath] !== 'undefined'
        ? router[trimmedPath]
        : handlers.notFound;

    // * Construct a data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parsedJsonToObject(buffer),
    };

    // * Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // * Use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
      // * Use the payload called back by the handler, or default to an empty object
      payload = typeof payload === 'object' ? payload : {};
      // * Convert the payload to a string
      const payloadString = JSON.stringify(payload);
      // * Return the use the Content-Type
      res.setHeader('Content-Type', 'application/json');
      // * Return the response
      res.writeHead(statusCode);
      // * Send the response payload
      res.end(payloadString);

      // * Log the request data
      console.log(
        `Return this response:
          1. statusCode: ${statusCode}
          2. payloadString: ${payloadString}
          `
      );
    });
  });
};

// * Define a request router
const router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
};
