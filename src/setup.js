/*
	Nougit - setup.js
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

module.exports = (function() {
	
	var fs = require('fs'),
	    exec = require('child_process').exec,
	    config,
	    home_dir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
	
	/*
	 * complete() - private
	 * runs a check and returns boolean if needs configuration
	 */
	function complete() {
		var path = process.cwd() + '/config.json';
		if (fs.existsSync(path)) {
			config = JSON.parse(fs.readFileSync(path, 'utf8'));
			return (config['user'] && config['email'] && config['git_version'] && config['node_version'] && config['repository_dir']);
		} else {
			return false;
		}
	}
	
	/*
	 * config() - private
	 * takes a configuration object
	 */
	function setup(callback) {
		console.log('Running initial configuration...')
		var user,
		    email, 
		    git_version, 
		    node_version = process.versions['node'], 
		    repository_dir = process.cwd() + '/public/repositories';
						
		if (!fs.existsSync(repository_dir)) {
			fs.mkdirSync(repository_dir);
		}
		
		exec('git config --global user.name', function(err, stdout, stderr) {
			if (err || stderr) {
				console.log(err || stderr)
			} else if (stdout) {
				user = stdout.replace(/(\r\n|\n|\r)/gm,'');
				console.log('User: ' + user);
				exec('git config --global user.email', function(err, stdout, stderr) {
					if (err || stderr) {
						console.log(err || stderr)
					} else if (stdout) {
						email = stdout.replace(/(\r\n|\n|\r)/gm,'');
						console.log('Email: ' + email);
						exec('git --version', function(err, stdout, stderr) {
							if (err || stderr) {
								console.log(err || stderr)
							} else if (stdout) {
								git_version = stdout.replace(/(\r\n|\n|\r)/gm,'');
								console.log('Git Version: ' + git_version);
								
								console.log('Node Version: ' + node_version);
								console.log('Repository Directory: ' + repository_dir);
								
								config = {
									user : user,
									email : email,
									git_version : git_version,
									node_version : node_version,
									repository_dir : repository_dir
								}
								callback.call(this, config);
								fs.writeFileSync('config.json', JSON.stringify(config));
							}
						});
					}
				});
			}
		});
	}
	
	/*
	 * init() - public
	 */
	function init(callback) {
		if (!complete()) {
			setup(callback);
		} else {
			callback.call(this, config);
		}
	}
	
	return {
		init : init,
		config : config
	};
	
})();