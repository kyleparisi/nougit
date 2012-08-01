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
	var fs = require('fs');
		
	/*
	 * getRepositories() - public
	 * retrieves repo list and passes it to callback
	 */
	function getRepositories(callback) {
		var repos,
		    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

		if (fs.existsSync('./repos.json', 'utf8')) {
			repos = fs.readFileSync('./repos.json', 'utf8');
			callback.call(this, repos);
		} else {
			repos = [];
			console.log(config['repository_dir']);
			var repodir = fs.readdirSync(config['repository_dir']);
			repodir.forEach(function(val, key) {
				var repo = {
					name : val,
					desc : '',
					date_added : new Date()
				}
				repos.push(repo);
			});
			fs.writeFileSync('./repos.json', JSON.stringify(repos));
			callback.call(this, repos);
		}
	}
	
	/*
	 * getRepositories() - public
	 * retrieves repo list and passes it to callback
	 */
	
	return {
		getRepositories : getRepositories
	};
	
})();