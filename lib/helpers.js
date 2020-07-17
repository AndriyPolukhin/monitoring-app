/**
 * Helpers @functions for various tasks
 */

// * Dependencies
const crypto = require('crypto');
const config = require('./config');
// * Container
const helpers = {};

// * Create a SHA256 hash
helpers.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');

    return hash;
  } else {
    return false;
  }
};

// * Parse a Json string to an object in all cases, withour throwing
helpers.parsedJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

// * Exports the container
module.exports = helpers;
