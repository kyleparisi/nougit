/*
	Nougit - main.js
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
	
	// get modules
	var fs = require('fs'),
	    repos,
	    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
		
	/*
	 * getRepositories() - public
	 * retrieves repo list and passes it to callback
	 */
	function repositories(callback) {
		if (fs.existsSync('./repos.json', 'utf8')) {
			repos = fs.readFileSync('./repos.json', 'utf8');
			callback.call(this, JSON.parse(repos));
		} else {
			generatefile(callback);
		}		
	}
	
	/*
	 * getRepositories() - public
	 * retrieves repo list and passes it to callback
	 */
	function generatefile(callback) {	
		repos = [];
		console.log(config['repository_dir']);
		var repodir = fs.readdirSync(config['repository_dir']);
		repodir.forEach(function(val, key) {
			// Query the entry
			var stats = fs.lstatSync(config['repository_dir'] + '/' + val);
		    // is it a directory
			if (stats.isDirectory()) {
				var repo = {
					name : val,
					desc : '',
					date_added : new Date()
				}
				repos.push(repo);
		    }
		});
		fs.writeFile('./repos.json', JSON.stringify(repos), function() {
			if (callback) {
				callback.call(this, repos);
			}
		});
	}
	
	return {
		repositories : repositories,
		generatefile : generatefile
	};
	
})();