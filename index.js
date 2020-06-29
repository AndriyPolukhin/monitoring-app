/**
 * Primary file for the API
 */

// * Dependencies
const http = require('http');

// * Define what the server does

// * The server should respond to all requests  with a string
const server = http.createServer(function (req, res) {
  res.end('Hello World\n');
});
// * Start the server, adn have it listen on a port 3000
server.listen(3000, function () {
  console.log(`The server is listening on port 3000 now`);
});
