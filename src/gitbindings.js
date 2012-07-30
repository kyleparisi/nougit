/*
	Nougit - gitbindings.js
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

	function commitLog(callback) {
		var output = '[',
			command = 'git log --pretty=format:\'{%n "commit": "%H",%n  "author": "%an <%ae>",%n  "date": "%ad",%n  "message": "%s"%n},\'';

		require('util').exec(command, function(err, stdout, stderr) {
			if (err || stderr) {
				console.log(err || stderr);
			} else if (stdout) {
				output += stdout.substring(0,stdout.length - 1);
				output += ']';
				output = JSON.parse(output);
				if (callback) {
					callback.call(this, output);
				}
			}
		});
	}
	
	return {
		commitLog : commitLog
	};
  
})();

