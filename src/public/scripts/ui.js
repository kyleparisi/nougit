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
	    overlay = _.dom.get('#dialogs'),
	    navigation = _.dom.get('.navaction'),
	    content = _.dom.get('#content'),
	    current = _.dom.get('#current');	
	
	// bind hiding logic to overlay
	_.bind(overlay, 'click', function(event) {
		if (event.target === this) {
			_.each(dialogs, function(key, val) {
				if (_.dom.hasClass(val, 'visible')) {
					nougit.ui.hideDialog(key);
				}
			});
		}
	});
	
	// bind view logic to dialogs
	_.each(actions, function() {
		_.bind(this, 'click', function() {
			var dialog = _.dom.get(this.href);
			dialogs[this.href] = dialog;
			nougit.ui.showDialog(this.href);
		});
	});
	
	// bind logic to cancel buttons
	_.each(_.dom.get('.cancel'), function() {
		_.bind(this, 'click', function() {
			var current = _.dom.get('.visible', _.dom.get('#dialogs'))[0];
			hideDialog('#' + current.id);
		});
	});
	
	// bind save repo
	_.bind(_.dom.get('#save_repo'), 'click', function() {
		newRepository(_.dom.parseForm(_.dom.get('#new_repo')));
	});
	
	function reloadPanel() {
		var current = _.dom.get('.active', _.dom.get('#footer'))[0];
		current.click();
	}
	
	function showDialog(id) {
		if (!_.dom.hasClass(_.dom.get(id), 'visible')) {
			_.dom.insertClass(overlay, 'active');
			_.dom.deleteClass(overlay, 'inactive');
			_.dom.insertClass(_.dom.get(id), 'visible');
		}
	}
	
	function hideDialog(id) {
		_.dom.deleteClass(overlay, 'active');
		_.dom.insertClass(overlay, 'inactive');
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
							});
							_.dom.insertClass(_.dom.get('a', this)[0], 'active');
							nougit.repos.current = nougit.repos.all[_.dom.whichChild(this) - 1];
							// use current repo to load commit data
							if (!_.dom.hasClass(_.dom.get('#footer'), 'active')) {
								toggleFooter();
							}
							console.log(_.dom.get('a', _.dom.get('#footer'))[0]);
							_.dom.get('a', _.dom.get('#footer'))[0].click();
						});
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
	
	function newRepository(obj) {
		nougit.api.post('/repositories/create', obj, 
		function(data) {
			if (data.success) {
				uialert(data.success, 'success');
				hideDialog('#addRepo');
				loadRepos();
				
				var inputs = _.dom.get('input', _.dom.get('#new_repo'));
				_.each(inputs, function() {
					this.value = '';
				});
				
				nougit.api.post('/commit/' + obj.name, {
					message : 'Initial Commit'
				}, function(data) {

				}, function(err) {
					uialert(data.error, 'error')
				});
				
			}
		}, function(err) {
			uialert(err['error'], 'error');
		});
	}
	
	function uialert(message, type) {
		var alert_elm = _.dom.get('#alert');
		alert_elm.innerHTML = message;
		if (!type) {
			_.dom.deleteClass(alert_elm, 'success');
			_.dom.deleteClass(alert_elm, 'error');
		} else {
			if (type === 'success') {
				_.dom.insertClass(alert_elm, 'success');
				_.dom.deleteClass(alert_elm, 'error');
			} else {
				_.dom.deleteClass(alert_elm, 'success');
				_.dom.insertClass(alert_elm, 'error');
			}
		}
		alert_elm.style.display = 'block';
		_.dom.animate(alert_elm, {
			opacity : 1
		}, 200, function() {
			setTimeout(function() {
				_.dom.animate(alert_elm, {
					opacity : 0
				}, 200, function() {
					alert_elm.style.display = 'none';
				});
			}, 2000);
		});
	}
	
	function toggleFooter() {
		var footer = _.dom.get('#footer');
		if (_.dom.hasClass(footer, 'active')) {
			_.dom.deleteClass(footer, 'active');
			_.dom.insertClass(footer, 'inactive');
		} else {
			_.dom.insertClass(footer, 'active');
			_.dom.deleteClass(footer, 'inactive');
		}
	}
	
	var repo_nav = {
		'history' : function() {
			current.innerHTML = 'History';
			content.innerHTML = '';
			
			var commit_list = document.createElement('ul');
			content.appendChild(commit_list);
			
			nougit.api.get('/history/' + nougit.repos.current.name, function(data) {
				_.each(data, function() {
					var commit = {
						author : this.author.split(' <')[0],
						email : this.author.split('<')[1].replace('>',''),
						commit : this.commit,
						message : this.message,
						date : this.date
					};
					neckbeard.get('commits', function(temp) {
						commit_list.innerHTML += neckbeard.compile(temp, commit);
					});
				});
			}, function(err) {
				uialert(err, 'error');
			});
		},
		
		'status' : function() {
			current.innerHTML = 'Status';
			content.innerHTML = '';
			
			nougit.api.get('/status/' + nougit.repos.current.name, function(data) {
				neckbeard.get('status', function(temp) {
					console.log(data);
					content.innerHTML = neckbeard.compile(temp, {});
					var stagedList = _.dom.get('#staged_list'),
					    notstagedList = _.dom.get('#notstaged_list'),
					    untrackedList = _.dom.get('#untracked_list');
					
					_.each(data.staged, function() {
						makeitem(this, stagedList);
					});
					
					_.each(data.not_staged, function() {
						makeitem(this, notstagedList);
					});
					
					_.each(data.untracked, function() {
						var item = {
							file : this,
							status : 'untracked'
						}
						makeitem(item, untrackedList);
					});
					
					bindfilelist();
					
					function bindfilelist() {
						var stageable_files = _.dom.get('.status_file');

						_.each(stageable_files, function() {
							var item = this;
							_.bind(item, 'click', function() {
								if (_.dom.hasClass(item, 'selected')) {
									_.dom.deleteClass(item, 'selected');
								} else {
									_.dom.insertClass(item, 'selected');
								}
							});
						});
					}
					
					function makeitem(text, appendto) {
						var item = document.createElement('li');
						item.className = 'status_file';
						item.innerHTML = text.file;
						item.title = text.status;
						appendto.appendChild(item);
					}
					
					function commit(message) {
						var staged = _.dom.get('#staged_list'),
						    files = [];
						_.each(staged.childNodes, function() {
							files.push(this.innerHTML);
						});
						// call api here
						nougit.api.post('/commit/' + nougit.repos.current.name, {
							message : message
						}, function(data) {
							console.log(data.message);
							uialert('Changes commited!', 'success');
							var commitbutton = _.dom.get('a', _.dom.get('#footer'))[1];
							commitbutton.click();
						}, function(err) {
							console.log(err);
							uialert('Nothing to commit!', 'error');
							reloadPanel();
						});
					}
					
					function stageSelected() {
						var staged = _.dom.get('#staged_list'),
						    untracked = _.dom.get('.selected', _.dom.get('#untracked_list')),
						    notstaged = _.dom.get('.selected', _.dom.get('#notstaged_list')),
						    files = [];
						
						_.each(untracked, function() {
							var newfile = this.cloneNode();
							newfile.innerHTML = this.innerHTML;
							_.dom.deleteClass(newfile, 'selected');
							staged.appendChild(newfile);
							this.parentNode.removeChild(this);
							files.push({
								file : this.innerHTML,
								status : this.title
							});
						});
						
						_.each(notstaged, function() {
							var newfile = this.cloneNode();
							newfile.innerHTML = this.innerHTML;
							_.dom.deleteClass(newfile, 'selected');
							staged.appendChild(newfile);
							this.parentNode.removeChild(this);
							files.push({
								file : this.innerHTML,
								status : this.title
							});
						});

						bindfilelist();
						
						// call api here
						nougit.api.put('/stage/' + nougit.repos.current.name, {
							files : files
						}, function(data) {
							console.log(data);
							uialert('Files Staged!', 'success');
							reloadPanel();
						}, function(err) {
							uialert(err.error);
							reloadPanel();
						});
					}
					
					function stageAll() {
						var staged = _.dom.get('#staged_list'),
						    untracked = _.dom.get('li', _.dom.get('#untracked_list')),
						    notstaged = _.dom.get('li', _.dom.get('#notstaged_list')),
						    files = [];
						
						_.each(untracked, function() {
							var newfile = this.cloneNode();
							newfile.innerHTML = this.innerHTML;
							_.dom.deleteClass(newfile, 'selected');
							staged.appendChild(newfile);
							this.parentNode.removeChild(this);
							files.push({
								file : this.innerHTML,
								status : this.title
							});
						});
						
						_.each(notstaged, function() {
							var newfile = this.cloneNode();
							newfile.innerHTML = this.innerHTML;
							_.dom.deleteClass(newfile, 'selected');
							staged.appendChild(newfile);
							this.parentNode.removeChild(this);
							files.push({
								file : this.innerHTML,
								status : this.title
							});
						});
						
						bindfilelist();
						
						// call api here
						nougit.api.put('/stage/' + nougit.repos.current.name, {
							files : files
						}, function(data) {
							console.log(data);
							uialert('Files staged!', 'success');
							reloadPanel();
						}, function(err) {
							uialert(err);
							reloadPanel();
						});
					}
					
					function unstageSelected() {
						var selected = _.dom.get('.selected', _.dom.get('#staged_list')),
						    untracked = _.dom.get('#untracked_list'),
							files = [];
							
						_.each(selected, function() {
							files.push({
								file : this.innerHTML,
								status : this.title
							});
							var newfile = this.cloneNode();
							newfile.innerHTML = this.innerHTML;
							_.dom.deleteClass(newfile, 'selected');
							this.parentNode.removeChild(this);
							untracked.appendChild(newfile);
						});
						
						bindfilelist();
						
						// call api here
						nougit.api.put('/unstage/' + nougit.repos.current.name, {
							files : files
						}, function(data) {
							console.log(data);
							uialert('Files Unstaged!', 'success');
							reloadPanel();
						}, function(err) {
							uialert(err);
							reloadPanel();
						});
					}
					
					/* Status Bindings
					*/
					var button = {
						commit : _.dom.get('#commit_files'),
						unstage : _.dom.get('#unstage_files'),
						stageall : _.dom.get('#stageAll'),
						stageselected : _.dom.get('#stageSelected')
					}
					
					_.bind(button.stageall, 'click', stageAll);
					_.bind(button.stageselected, 'click', stageSelected);
					_.bind(button.unstage, 'click', unstageSelected);
					_.bind(button.commit, 'click', function() {
						commit(_.dom.get('#commit_message').value);
					});
					
					
				});
			}, function(err) {
				uialert(err, 'error');
			});
		},
		
		'source' : function() {
			current.innerHTML = 'Source';
			content.innerHTML = '';
		},
		
		'info' : function() {
			current.innerHTML = 'Info';
			content.innerHTML = '';
		},
		
		'admin' : function() {
			current.innerHTML = 'Admin';
			content.innerHTML = '';
		}
	};
	
	// bind logic to navigation
	_.each(navigation, function() {
		_.bind(this, 'click', function(event) {
			_.each(navigation, function() {
				_.dom.deleteClass(this, 'active');
			});
			_.dom.insertClass(this, 'active');
			// content viewing logic
			repo_nav[this.href.split('#')[1]].call(this, event);
		});
	});
		
	return {
		init : init,
		dialogs : dialogs,
		showDialog : showDialog,
		hideDialog : hideDialog,
		alert : uialert,
		toggleFooter : toggleFooter
	};
	
})();