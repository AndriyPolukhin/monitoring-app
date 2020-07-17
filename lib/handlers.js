/**
 * Request handlers
 */

// * Dependencies
const _data = require('./data');
const helpers = require('./helpers');
// * Define a request handler
const handlers = {};

// * Users handlers
handlers.users = (data, callback) => {
  // * Acceptable methods for the user route
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// * Container for the users submethods
handlers._users = {};

// * Users post
// * Required data: firstName, lastName, phone, password, tosAgreement
// * Optional: none
handlers._users.post = (data, callback) => {
  // * Check that all  requied fields are filled out
  const firstName =
    typeof data.payload.firstName === 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName === 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const phone =
    typeof data.payload.phone === 'string' &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  const tosAgreement =
    typeof data.payload.tosAgreement === 'boolean' &&
    data.payload.tosAgreement === true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // * Make sure that the user do not exists
    _data.read('users', phone, (err, data) => {
      if (err) {
        // * Hash the password with crypto
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // * Create the user object
          const userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true,
          };

          // * Store user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create a new user' });
            }
          });
        } else {
          callback(500, { Error: 'Could not hash the users password' });
        }
      } else {
        // * User already exists
        callback(400, {
          Error: 'A user with that phone number already exists',
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};

// * Users get
handlers._users.get = (data, callback) => {};

// * Users put
handlers._users.put = (data, callback) => {};

// * Users delete
handlers._users.delete = (data, callback) => {};

// * Ping Handler
handlers.ping = (data, callback) => {
  callback(200);
};

// * Not Found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
