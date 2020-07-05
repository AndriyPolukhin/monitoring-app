/**
 * Primary file for the API
 */

// * Dependencies
// * module to create a server
const http = require('http');
// * module to work with the url
const url = require('url');
// * module to get the payload
const StringDecoder = require('string_decoder').StringDecoder;

// ? Define what the server does

// * The server should respond to all requests  with a string
const server = http.createServer((req, res) => {
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

    // * Send the responce
    res.end('Hello world\n');

    // * Log the request data
    console.log(
      `Request is recieved on:
    1. path: ${trimmedPath}
    2. method: ${method}
    3. query: ${JSON.stringify(queryStringObject)}
    4. headers: ${JSON.stringify(headers)}
    5. payload: ${buffer}
    `
    );
  });
});

// * Start the server, adn have it listen on a port 3000
server.listen(3000, () => {
  console.log(`The server is listening on port 3000 now`);
});
