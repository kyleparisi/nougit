/*
 * footon - simple file-system based JSON store with querying, built for packaged node-webkit applications
 * author: gordon hall <gordon@gordonwritescode.com>
 *
 * class -> Connection
 * descr -> Sends a net.Request to a remote footon.Server to load a database
 */

var util = require('util')
  , crypto = require('crypto')
  , clc = require('cli-color')
  , EventEmitter = require('events').EventEmitter
  , config = require('../config.js')
  , net = require('net')
  , Database = require('./database.js')
  , Connection;

Connection = function(host, port, user, pass) {
	var connection = this;

	connection.isConnected = false;
	connection.host = host || '127.0.0.1';
	connection.port = port || 3333;
	connection.creds = {
		user : user || null,
		pass : (pass) ? crypto.createHash('sha1').update(pass).digest() : null
	};

	connection.socket = net.connect({
		host : connection.host,
		port : connection.port
	}, function() {
		connection.isConnected = true;
	});

	// when the server responds with db data
	connection.socket.on('data', function(data) {
		try {
			var response = JSON.parse(data);
			connection.database = new Database(response.name, false, connection.socket);
			console.log('response:',response.collections)
			connection.database.consume(response.collections);
			connection.emit('ready', connection.database);
		} catch(e) {
			console.log(
				clc.bold.cyan('Footon: '), 
				clc.red('invalid data recieved - aborting local update')
			);
		}
	});

	// when connection encounters an error
	connection.socket.on('error', function(err) {
		console.log(
			clc.bold.cyan('Footon: '), 
			clc.red('connection encountered an error:'),
			clc.red.bold(err || 'unknown')
		);
	});
};

util.inherits(Connection, EventEmitter);

Connection.prototype.close = function() {
	this.database.save();
	this.socket.destroy();
};

module.exports = Connection;