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
// * Required data: phone
// * Optional data: none
// * @todo: only let an authenticated user to access it's data, dont let them access anyone elses
handlers._users.get = (data, callback) => {
  // * Check if the phone number is valid
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // * Look up the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // * Remove the user password before returning the user object
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// * Users put
// * Required data: phone
// * Optional data: firstName, lastName, password (at least one should be specified)
// * @todo: only let an authenticated user to update it's own object, not anyone elses
handlers._users.put = (data, callback) => {
  // * Check for the required fields
  const phone =
    typeof data.payload.phone === 'string' &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;
  // * Check for the optional fields;
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

  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // * Error if the phone is invalid
  if (phone) {
    // * Error if nothing to send to update
    if (firstName || lastName || password) {
      // * Look up user
      _data.read('users', phone, (err, userData) => {
        if (!err && userData) {
          // * Update the fields neccessary
          if (firstName) {
            userData.firstName = firstName;
          }

          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }
          // * Store the new updates
          _data.update('users', phone, userData, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not update the user' });
            }
          });
        } else {
          callback(400, { Error: 'The specified user do not exist' });
        }
      });
    } else {
      callback(400, { Error: 'Missing fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing required filed' });
  }
};

// * Users delete
// * Required fields: phone
// * @todo: only let an authenticated user to delete it's object
// * @todo:  clean up any other data file assocciated with this user
handlers._users.delete = (data, callback) => {
  // * Check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // * Look up the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // * Remove the user
        _data.delete('users', phone, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete the specified user' });
          }
        });
      } else {
        callback(400, { Error: 'Could not find  a specified user' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// * Ping Handler
handlers.ping = (data, callback) => {
  callback(200);
};

// * Not Found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
