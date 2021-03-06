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
// ! @todo: only let an authenticated user to access it's data, dont let them access anyone elses
handlers._users.get = (data, callback) => {
  // * Check if the phone number is valid
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    // * Get the token from the headers
    const token =
      typeof data.headers.token === 'string' ? data.headers.token : false;
    // * Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
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
        callback(403, {
          Error: 'Missing required token in header, or token is invalid',
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// * Users put
// * Required data: phone
// * Optional data: firstName, lastName, password (at least one should be specified)
// ! @todo: only let an authenticated user to update it's own object, not anyone elses
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
      // * Get the token from the headers
      const token =
        typeof data.headers.token === 'string' ? data.headers.token : false;
      // * Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
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
          callback(403, {
            Error: 'Missing required token in header, or token is invalid',
          });
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
// ! @todo: only let an authenticated user to delete it's object
// * @todo:  clean up any other data file assocciated with this user
handlers._users.delete = (data, callback) => {
  // * Check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    const token =
      typeof data.headers.token === 'string' ? data.headers.token : false;
    // * Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
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
        callback(403, {
          Error: 'Missing required token in header, or token is invalid',
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// * Tokens
handlers.tokens = (data, callback) => {
  // * Acceptable methods for the user route
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// * Container for the users submethods
handlers._tokens = {};

//  * Tokens - post
//  * Required data: phone, password
//  * Optional data: none
handlers._tokens.post = (data, callback) => {
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

  if (phone && password) {
    // * Look up the user who matches the phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // * Hash the sent password and compare it to the password stored in the user obj
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          //  * If valid create a new token with a random name, set exparation date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            id: tokenId,
            phone: phone,
            expires: expires,
          };

          //  * Store the token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: 'Could not create the new token' });
            }
          });
        } else {
          callback(400, {
            Error:
              "Password did not matched the specified user's stored password",
          });
        }
      } else {
        callback(400, { Error: 'Could not find the specified user' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};
//  * Tokens - get
//  * Required data: id
//  * Optional data: none
handlers._tokens.get = (data, callback) => {
  // * Check that the id is valid
  const id =
    typeof data.queryStringObject.id === 'string' &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // * Look up the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && data) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};
//  * Tokens - put
//  * Required data: id, extend
//  * Optional data: none
handlers._tokens.put = (data, callback) => {
  // * Check that the id and extend are valid
  const id =
    typeof data.payload.id === 'string' && data.payload.id.trim().length === 20
      ? data.payload.id.trim()
      : false;
  const extend =
    typeof data.payload.extend == 'boolean' && data.payload.extend == true
      ? data.payload.extend
      : false;

  if (id && extend) {
    // * Look up the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // * Check to make sure that the token isn't expired
        if (tokenData.expires > Date.now()) {
          // * Set the exparation an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // * Store the new updates
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                Error: "Could not update the token's exparation",
              });
            }
          });
        } else {
          callback(400, {
            Error: 'The token has already expired, and cannot be extended',
          });
        }
      } else {
        callback(400, { Error: 'Specified token does not exists' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields or fields are invalid' });
  }
};
//  * Tokens - delete
//  * Required data: id
//  * Optional data: none
handlers._tokens.delete = (data, callback) => {
  // * Check that the id is valid
  const id =
    typeof data.queryStringObject.id === 'string' &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // * Look up the token
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        // * Remove the token
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete the specified token' });
          }
        });
      } else {
        callback(400, { Error: 'Could not find  a specified token' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// * Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // * Look up the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // * Check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
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
