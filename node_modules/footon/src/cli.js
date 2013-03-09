#! /usr/bin/env node

/*
 * footon - simple file-system based JSON store with querying, built for packaged node-webkit applications
 * author: gordon hall <gordon@gordonwritescode.com>
 *
 * command-line-interface
 */

var program = require('commander')
  , clc = require('cli-color')
  , util = require('util')
  , config = require('./config.js')
  , footon = require('./footon.js');

program
	.version('0.0.1')
	.option('-d, --database [database name]', 'select database to load')
	.option('-c, --collection [collection_name]', 'select collection to query')
	.option('-q, --query [query]', 'query collection [{}]')
	.option('-S, --server [port]', 'starts a footon server on specified port [3333]')
.parse(process.argv);

if (program.database && program.server) {
	var port = parseInt(program.server) || config.net.port;
	
	// print information
	printLogo(true);
	console.log(
		clc.bold.cyan('Footon: '), 
		clc.white('starting servers...')
	);

	var server = footon.createServer(program.database, function() {
		// inform log of net server
		console.log(
			clc.bold.cyan('Footon: '), 
			clc.white('database "'), 
			clc.bold.white(program.database), 
			clc.white('" listening on port "'), 
			clc.bold.whiteBright(port), 
			clc.white('"')
		);
		// inform log of query server
		console.log(
			clc.bold.cyan('Footon: '), 
			clc.white('rest api listening on port "'), 
			clc.bold.whiteBright(port + 1), 
			clc.white('"')
		);
	});

	server.listen(port);
} 
else if (program.database && program.collection && program.query) {
	var db = footon(program.database, true);

	db.on('ready', function() {
		var collection = db.get(program.collection)
		  , results = collection.find(JSON.parse(program.query));
		console.log(
			clc.bold.cyan('Footon: '), 
			clc.white('results in collection "'), 
			clc.bold.whiteBright(program.collection),
			clc.white('"'),
			clc.white('using database "'),
			clc.bold.whiteBright(program.database),
			clc.white('" :')
		);
		console.log(util.inspect(results, false, null, true));
	});
}
else {
	program.help();
}

function printLogo(alt) {
	if (alt) {
		console.log(clc.cyan('    __  _____           _               __   '));
		console.log(clc.blue('   / / |  ___|__   ___ | |_ ___  _ __   \\ \\  '));
		console.log(clc.cyan('  | |  | |_ / _ \\ / _ \\| __/ _ \\| \'_ \\   | | '));
		console.log(clc.blue(' < <   |  _| (_) | (_) | || (_) | | | |   > >'));
		console.log(clc.cyan('  | |  |_|  \\___/ \\___/ \\__\\___/|_| |_|  | | '));
		console.log(clc.blue('   \\_\\                                  /_/  '));
		console.log('');
	} else {
		console.log(clc.cyan('    ______            __            '));
		console.log(clc.blue('   / ____/___  ____  / /_____  ____ '));
		console.log(clc.cyan('  / /_  / __ \\/ __ \\/ __/ __ \\/ __ \\'));
		console.log(clc.blue(' / __/ / /_/ / /_/ / /_/ /_/ / / / /'));
		console.log(clc.cyan('/_/    \\____/\\____/\\__/\\____/_/ /_/ '));
		console.log('');
	}
};