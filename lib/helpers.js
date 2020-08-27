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

//  * Create a string of random alphanumeric characters of a given length
helpers.createRandomString = (strLength) => {
  //  * Check if we have the right type of data
  strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    //  *  Define all the characters that can go into the string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    //  * Start the final string
    let str = '';
    for (i = 1; i <= strLength; i++) {
      //  * Get a random character from a possible characters string
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      // * Append this character to the final strings
      str += randomCharacter;
    }
    //  * Return the final string
    return str;
  } else {
    return false;
  }
};

// * Exports the container
module.exports = helpers;
