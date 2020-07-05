/**
 * Library for storing and editing data
 */

// * Dependencies
const fs = require('fs');
const path = require('path');

// * Container for the module
const lib = {};

// * base dir of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// * Create a @fn to Write data to a file
lib.create = (dir, file, data, callback) => {
  // * Open the file for wriing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'wx',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // * Convert the data to a string
        const stringData = JSON.stringify(data);

        // * Write to file and Close it
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback(`Error closing new file`);
              }
            });
          } else {
            callback('Error writing to a new file');
          }
        });
      } else {
        callback('Could not create a new file, it might already exists');
      }
    }
  );
};

// * Read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
    callback(err, data);
  });
};

// * Update the data in the file
lib.update = (dir, file, data, callback) => {
  // * open the file for writing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'r+',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // * Stringify the new data
        const stringData = JSON.stringify(data);

        // * Truncate the file data
        fs.truncate(fileDescriptor, (err) => {
          if (!err) {
            // * Write to the file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback('Error closing the file');
                  }
                });
              } else {
                callback('Error writing to existing file');
              }
            });
          } else {
            callback('Error truncating the file');
          }
        });
      } else {
        callback('Could not open the file for update, it may not exist yet');
      }
    }
  );
};

// * Delete a file
lib.delete = (dir, file, callback) => {
  // * unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting the file');
    }
  });
};

// * Export the Container
module.exports = lib;
