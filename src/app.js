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
	// get mode
	    mode = process.argv[2] === 'server',
	// get native modules
	    fs = require('fs'),
	// get app modules
	    setup = require('./setup.js')(mode),
	    git = require('./git.js'),
    	nougit = require('./main.js'),
	// get middleware
	    express = require('express'),
	    jade = require('jade'),
	    db = require('mongojs'),
	    md = require("node-markdown").Markdown,
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
	
	// get repository info
	app.get('/repositories/info/:repo', function(req, res) {
		var info = {},
		    readme,
		    url = config['repository_dir'] + '/' + req.param('repo') + '.git',
		    branch = null;
		
		if (fs.existsSync(config['repository_dir'] + '/' + req.param('repo') + '/README.md')) {
			readme = md(fs.readFileSync(config['repository_dir'] + '/' + req.param('repo') + '/README.md', 'utf8'));
		} else {
			readme = null;
		}
		
		git.tree(config['repository_dir'] + '/' + req.param('repo'), function(data) {
			branch = data;
			if (data['error']) {
				res.writeHead(500);
			} else {
				res.writeHead(200);
			}
			info.readme = readme;
			info.url = url;
			info.branches = branch;
			info.server = mode;
			res.write(JSON.stringify(info));
			res.end();
		});
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
		    description = req.body.desc;
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
	
	// commit to a repository
	app.put('/stage/:repo', function(req, res) {
		var files = req.body.files,
		    add = [],
		    rm = [];
		
		files.forEach(function(val, key) {
			if (val.status === 'deleted') {
				rm.push(val.file);
			} else {
				add.push(val.file);
			}
		});
		
		git.add(config['repository_dir'] + '/' + req.param('repo'), add, function(adddata) {
			var staged = [],
			    errs = [];
			
			if (adddata['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
				staged.concat(adddata.added);
				errs.concat(adddata.errors);
			}
			console.log('Staged: ' + staged);
			console.log('Errors: ' + errs);
			git.remove(config['repository_dir'] + '/' + req.param('repo'), rm, function(rmdata) {
				
				if (!rmdata['error']) {
					staged.concat(rmdata.added);
					errs.concat(rmdata.errors);
				}
				
				console.log('Staged: ' + staged);
				console.log('Errors: ' + errs);
				
				res.write(JSON.stringify({
					added : staged,
					errors : errs
				}));
				res.end();
			});
		}); 
	});
	
	// commit to a repository
	app.put('/unstage/:repo', function(req, res) {
		var files = req.body.files,
		    rm = [];
		
		files.forEach(function(val, key) {
			rm.push(val.file);
		});
		
		git.unstage(config['repository_dir'] + '/' + req.param('repo'), rm, function(data) {
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
	
	// get list of remotes
	app.get('/remotes/list/:repo', function(req, res) {
		git.remote.list(config['repository_dir'] + '/' + req.param('repo'), function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		}); 
	});
	
	// add new remotes
	app.post('/remotes/add/:repo', function(req, res) {
		var remote = req.body.remote,
		    url = req.body.url;
		git.remote.add(config['repository_dir'] + '/' + req.param('repo'), remote, url, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		}); 
	});
	
	// update remotes
	app.put('/remotes/update/:repo', function(req, res) {
		var remote = req.body.remote,
		    url = req.body.url;
		git.remote.update(config['repository_dir'] + '/' + req.param('repo'), remote, url, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		}); 
	});
	
	// remove a remote from repo
	app.delete('/remotes/delete/:repo', function(req, res) {
		var remote = req.body.remote;
		git.remote.remove(config['repository_dir'] + '/' + req.param('repo'), remote, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		}); 
	});
	
	// checkout a branch
	app.get('/checkout/:repo/:branch', function(req, res) {
		git.checkout(config['repository_dir'] + '/' + req.param('repo'), req.param('branch'), function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	
	// push a repo
	app.get('/push/:repo/:remote/:branch', function(req, res) {
		git.push(config['repository_dir'] + '/' + req.param('repo'), req.param('remote'), req.param('branch'), function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	
	// fetch a repo
	app.get('/pull/:repo/:remote/:branch', function(req, res) {
		git.pull(config['repository_dir'] + '/' + req.param('repo'), req.param('remote'), req.param('branch'), function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	
	// new branch
	app.post('/branch/:repo', function(req, res) {
		git.branch(config['repository_dir'] + '/' + req.param('repo'), req.body.branch, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	
	// revert commit
	app.post('/reset/:repo', function(req, res) {
		var hash = req.body.hash
		git.reset(config['repository_dir'] + '/' + req.param('repo'), hash, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	
	// merge branch
	app.put('/merge/:repo', function(req, res) {
		var branch = req.body.branch
		git.merge(config['repository_dir'] + '/' + req.param('repo'), branch, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			res.end();
		});
	});
	
	// revert commit
	app.post('/clone', function(req, res) {
		var repo = req.body.repo
		git.clone(config['repository_dir'], repo, function(data) {
			if (data['error']) {
				res.writeHead(500)
			} else {
				res.writeHead(200);
			}
			res.write(JSON.stringify(data));
			nougit.generatefile(function() {
				res.end();
			});
		});
	});
	
	/*
	 * start server
	 */

	app.listen(8080, function() {
		console.log('Nougit Application Running at port 8080');
	});
	
	
})();