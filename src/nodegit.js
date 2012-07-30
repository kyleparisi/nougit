/*
	Nougit - nodegit.js
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
	// get required modules
	var fs = require('fs'),
	    exec = require('child_process').exec;
	
	/*
	 * repository() - private
	 * checks the given path for git repo and if it exists, navigates to the directory
	 */
	function repository(path) {
		// does the path exist
		if (fs.existsSync(path)) {
			// get directory contents
			var contents = fs.readdirSync(path);
			// iterate over contents
			for (var item = 0; item < contents.length; item++) {
				// if the current item is .git
				if (contents[item] === '.git') {
					// move to dir
					process.chdir(path);
					console.log('"' + process.cwd() + '" is a valid Git repository. Switched to directory.');
					return true;
				// if current item is not .git
				} else {
					// if item is last in set
					if (contents[item] === contents[contents.length - 1]) {
						console.log('"' + path + '" is not a valid Git repository.')
						return false;
					}
				}
			}
		// return false if path invalid
		} else {
			return false;
		}
	}
	
	/*
	 * history() - public
	 * set process to run in specified directory and passes an array of commit objects into the callback
	 */
	function history(path, callback) {
		// create output string
		var output = '[',
		    command = '';
		// create bash command
			command += 'git log --pretty=format:\'{';
			command += '"commit": "%H",';
		 	command += '"author": "%an <%ae>",';
			command += '"date": "%ad",';
			command += '"message": "%s"';
			command += '},\'';
		// if the path is a valid repository, get the commit log
		if (repository(path)) {
			// execute bash command
			exec(command, function(err, stdout, stderr) {
				// if error, pass error object into callback
				if (err || stderr) {
					console.log(err || stderr);
					if (callback) {
						callback.call(this, {
							error : err || stderr
						});
					}
				// if successful, trim the trailing comma, and close output string
				// then parse the JSON object and pass into callback
				} else if (stdout) {
					output += stdout.substring(0, stdout.length - 1);
					output += ']';
					output = JSON.parse(output);
					if (callback) {
						callback.call(this, output);
					}
				}
			});
		} else {
			if (callback) {
				callback.call(this, {
					error : 'Invalid Repository'
				});
			}
		}
	}
	
	/*
	 * create() - public
	 * creates a new directory, initializes a git repo, and adds a readme, then passes result into callback
	 */
	function create(name, description, path, callback) {
		// is path valid
		if (fs.existsSync(path)) {
			// get path to repos
			var repos = fs.readdirSync(path),
			// create initial readme text
			    readme_txt = '# ' + name + '\n\n' + description;
			// iterate over items
			for (var repo = 0; repo < repos.length; repo++) {
				// does the repo already exist
				if (repos[repo] === name) {
					// pass error object into callback
					if (callback) {
						callback.call(this, {
							error : 'Directory already exists'
						});
					}
				// doesnt exist
				} else {
					// last in iteration
					if (repo === repos.length - 1) {
						// call ready()
						ready();
					}
				}
			}
			// called if all is good in the hood
			function ready() {
				// make sure the path format is good
				if (path.charAt(path.length - 1) !== '/') {
					path += '/';
				}
				// create the dir
				fs.mkdirSync(path + name);
				// move to the new dir
				process.chdir(path + name);
				// init git repo
				exec('git init', function(err, stdout, stderr) {
					// if error, pass error object into callback
					if (err || stderr) {
						console.log(err || stderr);
						if (callback) {
							callback.call(this, {
								error : err || stderr
							});
						}
					// all is good
					} else if (stdout) {
						// create readme file and place text inside
						fs.writeFile('README.md', readme_txt, function() {
							// pass success object into callback
							if (callback) {
								callback.call(this, {
									success : stdout
								});
							}	
						});
					}
				});
			}
		// path isnt valid
		} else {
			// pass error into callback
			if (callback) {
				callback.call(this, {
					error : 'Invalid path'
				});
			}
		}
	}
	
	/*
	 * destroy() - public
	 * deletes git repo and optionally all contents
	 */
	function destroy(path, deletefiles, callback) {
		// if the path exists
		if (fs.existsSync(path)) {
			// make sure the path format is good
			if (path.charAt(path.length - 1) !== '/') {
				path += '/';
			}
			// if delete all contents
			if (deletefiles) {
				// force deletion of entire dir
				rmdirSyncForce(path);
				// pass success into callback
				if (callback) {
					callback.call(this, {
						success : 'Repository destroyed and contents deleted'
					});
				}
			// if just remove repo
			} else {
				// force deletion of .git dir
				rmdirSyncForce(path + '.git');
				// pass success into callback
				if (callback) {
					callback.call(this, {
						success : 'Repository destroyed and contents preserved'
					});
				}
			}
		// if not pass error into callback
		} else {
			if (callback) {
				callback.call(this, {
					error : 'Invalid path'
				});
			}
		}
		// force delete of dir and contents
		function rmdirSyncForce(path) {
			// init vars
			var files, file, fileStats, filesLength;
			// make sure the path format is good
			if (path.charAt(path.length - 1) !== '/') {
				path += '/';
			}
			// get files in dir
			files = fs.readdirSync(path);
			// get amount of files
			filesLength = files.length;
			// if files exists
			if (filesLength) {
				// iterate over files
				for (var i = 0; i < filesLength; i += 1) {
					file = files[i];
					// get file info
					fileStats = fs.statSync(path + file);
					// if its a file
					if (fileStats.isFile()) {
						// kill it
						fs.unlinkSync(path + file);
					}
					// if its a dir
					if (fileStats.isDirectory()) {
						// kill it and it's contents recursively
						rmdirSyncForce(path + file);
					}
				}
			}
			// delete now empty dir
			fs.rmdirSync(path);
		}
	}
	
	return {
		history : history,
		create : create,
		destroy : destroy
	};
  
})();

