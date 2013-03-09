/*
 * footon - simple file-system based JSON store with querying, built for packaged node-webkit applications
 * author: gordon hall <gordon@gordonwritescode.com>
 */

var Server = require('./classes/server.js')
  , Connection = require('./classes/connection.js')
  , Database = require('./classes/database.js');

// expose function to return new instance of "Database" class
// this is for local databases
module.exports = function(dbName, readOnly) {
	return new Database(dbName, readOnly);
};

module.exports.createServer = function(dbName, onReady) {
	return new Server(dbName, onReady);
};

module.exports.createConnection = function(host, port, user, pass) {
	return new Connection(host, port, user, pass);
};
