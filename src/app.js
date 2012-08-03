/*
	Nougit - app.js
	Author: Gordon Hall

	Copyright (c) 2012 Gordon Hall

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
	documentation files (the "Software"), to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
	to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of
	the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
	THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
	CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	DEALINGS IN THE SOFTWARE.
*/

(function() {
	
	// init vars
	var config,
	// get native modules
	    fs = require('fs'),
	// get app modules
	    setup = require('./setup.js'),
	    git = require('./git.js'),
    	nougit = require('./main.js'),
	// get middleware
	    express = require('express'),
	    jade = require('jade'),
	    db = require('mongojs'),
	// create express server
	    app = module.exports = express.createServer();

	// get user configs
	setup.init(function(data) {
		config = data;
	});

	// config server
	app.configure(function() {

		// set view directory and engine
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');

		// methodOverride checks req.body.method for the HTTP method override
		// bodyParser parses the request body and populates req.body
		app.use(express.methodOverride());
		app.use(express.bodyParser());

		// use cookie parser
		app.use(express.cookieParser());

		// set public directory for static files
		app.use(express.static(__dirname + '/public'));

		// use router for non-static files
		app.use(app.router);

	});

	// dev env
	app.configure('development', function(){
		app.use(express.errorHandler({
			dumpExceptions: true, 
			showStack: true 
		}));
	});

	// prod env
	app.configure('production', function(){
		app.use(express.errorHandler());
	});
		
	/*
	 * http routes
	 */
	
	// render app
	app.get('/', function(req, res) {
		var cookies = req.cookies;
		res.render('index', { });
	});

	// get array of repository objects
	app.get('/repositories', function(req, res) {
		nougit.repositories(function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	
	// create a new repository
	app.post('/repositories/create', function(req, res) {
		var name = req.body.name,
		    description = req.body.description;
		git.create(name, description, config['repository_dir'], function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			nougit.generatefile();
			res.end();
		}); 
	});
	
	// commit to a repository
	app.post('/commit/:repo', function(req, res) {
		var msg = req.body.message;
		git.commit(config['repository_dir'] + '/' + req.param('repo'), msg, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		}); 
	});
	
	// get status of repository
	app.get('/status/:repo', function(req, res) {
		git.status(config['repository_dir'] + '/' + req.param('repo'), function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		}); 
	});
	
	// get array of repository objects
	app.delete('/repositories/destroy', function(req, res) {
		var name = req.body.name,
		    deletefiles = req.body.deletefiles;
		
		git.destroy(config['repository_dir'] + '/' + name, deletefiles, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			nougit.generatefile();
			res.end();
		});
	});
	
	// get commit log of repository
	app.get('/history/:repo', function(req, res) {
		var repo = config.repository_dir + '/' + req.param('repo');
		git.history(repo, function(data) {
			if (data['error']) {
				res.writeHead(500);
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	
	/*
	 * start server
	 */

	app.listen(8080, function() {
		console.log('Nougit Application Running at port 8080');
	});
	
	
})();