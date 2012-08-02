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

nougit['ui'] = (function() {	
	
	// init vars
	var actions = _.dom.get('.action'),
	    dialogs = {},
	    overlay = _.dom.get('#dialogs');
	
	// bind hiding logic to overlay
	_.bind(overlay, 'click', function() {
		_.each(dialogs, function(key, val) {
			if (_.dom.hasClass(val, 'visible')) {
				nougit.ui.hideDialog(key);
			}
		});
	});
	
	// bind view logic to dialogs
	_.each(actions, function() {
		_.bind(this, 'click', function() {
			var dialog = _.dom.get(this.href);
			dialogs[this.href] = dialog;
			nougit.ui.showDialog(this.href);
		});
	});
	
	
	function showDialog(id) {
		_.dom.insertClass(overlay, 'active');
		_.dom.insertClass(_.dom.get(id), 'visible');
	}
	
	function hideDialog(id) {
		_.dom.deleteClass(overlay, 'active');
		_.dom.deleteClass(_.dom.get(id), 'visible');
	}
	
	function init() {
		// initialize
		console.log('Nougit Ready!');
		loadRepos();
	}
	
	function loadRepos() {
		nougit.api.get('/repositories', function(data) {
			nougit.repos.all = data;
			var repolist = _.dom.get('.list', _.dom.get('#repositories'))[0];
			repolist.innerHTML = '';
			if (data.length) {
				// get neckbeard template
				neckbeard.get('list_repo', function(temp) {
					_.each(data, function() {
						repolist.innerHTML += neckbeard.compile(temp, this);
					});
					_.each(_.dom.get('.repo'), function() {
						_.bind(this, 'click', function() {
							_.each(_.dom.get('.repo'), function() {
								_.dom.deleteClass(_.dom.get('a', this)[0], 'active');
							})
							_.dom.insertClass(_.dom.get('a', this)[0], 'active');
							nougit.repos.current = nougit.repos.all[_.dom.whichChild(this) - 1];
							// use current repo to load commit data
						})
					});
				});
			} else {
				neckbeard.get('no_repos', function(temp) {
					repolist.innerHTML += neckbeard.compile(temp, {});
				});
			}
		}, function(err) {
			
		});
	}
	
	function uialert(message) {
		
	}
	
	//
		
	return {
		init : init,
		dialogs : dialogs,
		showDialog : showDialog,
		hideDialog : hideDialog,
		alert : uialert
	};
	
})();