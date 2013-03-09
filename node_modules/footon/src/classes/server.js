/*
 * footon - simple file-system based JSON store with querying, built for packaged node-webkit applications
 * author: gordon hall <gordon@gordonwritescode.com>
 *
 * class -> Server
 * descr -> Creates a net.Server that passes data to remote footon.Connection
 */

var restify = require('restify')
  , util = require('util')
  , path = require('path')
  , clc = require('cli-color')
  , EventEmitter = require('events').EventEmitter
  , qs = require('querystring')
  , config = require('../config.js')
  , net = require('net')
  , Database = require('./database.js')
  , Collection = require('./collection.js')
  , Server;

Server = function(dbName, onReady) {
	var server = this;
 	// create query server
	server.server = restify.createServer({
		name: 'Footon',
	});
	// remember what to do on ready
	server.onReady = onReady;

	// get database
	server.db = new Database(dbName);
	server.db.on('ready', function() {
		// initialize routing
		server.setRestEndpoints();
	});

	// create tcp server
	server.socket = net.createServer(function(socket) {
		server.handleRemoteRequests(socket);
		// log where the connection came from
		console.log(
			clc.bold.cyan('Footon: '), 
			clc.white('client connected from "'), 
			clc.bold.whiteBright(socket.address().address),
			clc.white('"')
		);
		// send the client a copy of the data base for consumption
		socket.write(JSON.stringify(server.db));

		socket.on('end', function() {
			console.log(
				clc.bold.cyan('Footon: '), 
				clc.white('client disconnected - updating database')
			);
			server.db.save();
		});
	});
};

util.inherits(Server, EventEmitter);

Server.prototype.listen = function(port, host, backlog, callback) {
	var server = this
	  , queryServerListening = false
	  , socketServerListening = false;

	port = port || config.net.port;
	// go ahead and listen
	server.server.listen(port + 1, function() {
		queryServerListening = true;
		ready();
	});

	server.socket.listen(port, host, backlog, function() {
		socketServerListening = true;
		ready();
	});

	function ready() {
		if (queryServerListening && socketServerListening) {
			if (server.onReady) server.onReady.call(this, server.server);
			server.emit('ready', server);
		}
	};
};

Server.prototype.handleRemoteRequests = function(socket) {
	var server = this;
	// update databse when new data is received
	socket.on('data', function(data) {
		try {
			var collections = {}
			  , newCollections = JSON.parse(data.toString());
			if (typeof newCollections === 'object') {
				for (var coll in newCollections) {
					collections[coll] = new Collection(
						newCollections[coll].contents,
						coll,
						server.db
					);
					console.log(
						clc.bold.cyan('Footon: '), 
						clc.white('updating collection: "'),
						clc.white.bold(coll),
						clc.white('"')
					);
				}
				server.db.collections = collections;
			}
		} catch(e) {
			console.log(
				clc.bold.cyan('Footon: '), 
				clc.red('invalid data received - aborting database update')
			);
		}
	});
};

Server.prototype.setRestEndpoints = function() {
	var svc = this.server
	  , db = this.db;

	// for now we will just expose a json api
	// for querying only - jsonp also
	svc.get('/:collection', function(req, res) {

		var collName = req.params.collection
		  , query = JSON.parse(qs.parse(req.query()).query)
		  , jsonpCallback = qs.parse(req.query()).callback
		
		console.log('');
		console.log(
			clc.bold.cyan('Footon: '), 
			clc.white('received query request'), 
			'\n',
			clc.bold.whiteBright('* Collection: '),
			clc.white(collName),
			'\n',
			clc.bold.whiteBright('* Query: '), 
			clc.white(JSON.stringify(query))
		);

	  	var coll = db.get(collName)
	  	  , results = JSON.stringify(coll.find(query))
	  	  , response = (jsonpCallback) ? jsonpCallback + '(' + results + ')' : results;
	  	res.end(response);
	  	console.log(
			clc.bold.cyan('Footon: '), 
			clc.white('responded with ' + JSON.parse(results).length + ' matched documents')
		);
	});
};

module.exports = Server;