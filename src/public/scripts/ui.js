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
	
	// bind save remote
	_.bind(_.dom.get('#save_new_remote'), 'click', function() {
		nougit.api.post('/remotes/add/' + nougit.repos.current.name, _.dom.parseForm(_.dom.get('#add_remote_form')), function(data) {
			uialert(data.message, 'success');
			reloadPanel();
			hideDialog('#addremote');
		}, function(err) {
			uialert(err.error, 'error');
		});
	});
	
	// bind new branch
	_.bind(_.dom.get('#save_new_branch'), 'click', function() {
		nougit.api.post('/branch/' + nougit.repos.current.name, _.dom.parseForm(_.dom.get('#new_branch_form')), function(data) {
			uialert(data.message, 'success');
			reloadPanel();
			hideDialog('#newbranch');
		}, function(err) {
			uialert(err.error, 'error');
			hideDialog('#newbranch');
		});
	});
	
	// bind update remote
	_.bind(_.dom.get('#update_existing_remote'), 'click', function() {
		nougit.api.put('/remotes/update/' + nougit.repos.current.name, _.dom.parseForm(_.dom.get('#edit_remote_form')), function(data) {
			uialert(data.message, 'success');
			reloadPanel();
			hideDialog('#editremote');
		}, function(err) {
			uialert(err.error, 'error');
		});
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
				_.dom.deleteClass(alert_elm, 'error');
				_.dom.deleteClass(alert_elm, 'success');
				_.dom.insertClass(alert_elm, 'success');
			} else {
				_.dom.deleteClass(alert_elm, 'error');
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
						    untracked = Array.prototype.slice.call(_.dom.get('.selected', _.dom.get('#untracked_list'))),
						    notstaged = Array.prototype.slice.call(_.dom.get('.selected', _.dom.get('#notstaged_list'))),
						    files = [];
						
						_.each(untracked.concat(notstaged), function() {
							files.push({
								file : this.innerHTML,
								status : this.title
							});
						});
						setTimeout(function() {
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
						}, 100);
					}
					
					function stageAll() {
						var staged = _.dom.get('#staged_list'),
						    untracked = Array.prototype.slice.call(_.dom.get('li', _.dom.get('#untracked_list'))),
						    notstaged = Array.prototype.slice.call(_.dom.get('li', _.dom.get('#notstaged_list'))),
						    files = [];
						
						_.each(untracked.concat(notstaged), function() {
							files.push({
								file : this.innerHTML,
								status : this.title
							});
						});
						
						setTimeout(function() {						
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
						}, 100);
					}
					
					function unstageSelected() {
						var selected = _.dom.get('.selected', _.dom.get('#staged_list')),
						    untracked = _.dom.get('#untracked_list'),
							files = [];
							console.log(selected);
						_.each(selected, function() {
							files.push({
								file : this.innerHTML,
								status : this.title
							});
						});
						
						console.log(files);
						
						setTimeout(function() {
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
						}, 100);
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
			
			nougit.api.get('/repositories/info/' + nougit.repos.current.name, function(data) {
				neckbeard.get('info', function(temp) {
					content.innerHTML = neckbeard.compile(temp, data);
					var origin = _.dom.get('#origin'),
					    cloneat = encodeURI(location.origin + '/repositories/' + nougit.repos.current.name);
					origin.innerHTML = cloneat;
				});
			}, function(err) {
				uialert(err.error, 'error');
			})
		},
		
		'admin' : function() {
			current.innerHTML = 'Admin';
			content.innerHTML = '';
			
			var remotes, branches = [];
			
			neckbeard.get('admin', function(temp) {
				content.innerHTML = temp;
				
				nougit.api.get('/remotes/list/' + nougit.repos.current.name, function(remlist) {
					remotes = remlist;

					// populate select list
					if (JSON.stringify(remlist).length > 2) {
						_.each(remlist, function(key, val) {
							var option = document.createElement('option');
							option.innerHTML = key;
							option.value = key;
							_.dom.get('#selected_remote').appendChild(option);
							
							neckbeard.get('remote_list', function(temp) {
								_.dom.get('#remotes').innerHTML += neckbeard.compile(temp, {
									name : key,
									url : val
								});
								
								var items = _.dom.get('.remote_item', _.dom.get('#remotes')),
								    item = items[items.length - 1];
								
								_.bind(item, 'click', function() {
									var remotes_all = _.dom.get('.remote_item');

									if (!_.dom.hasClass(this, 'selected')) {
										_.each(remotes_all, function() {
											_.dom.deleteClass(this, 'selected');
										});
										_.dom.insertClass(this, 'selected');
									} else {
										_.dom.deleteClass(this, 'selected');
									}

								});
							});
						});
						_.dom.get('#push_pull').style.display = 'block';
					} else {
						var option = document.createElement('option');
						option.innerHTML = '---';
						option.value = null;
						_.dom.get('#selected_remote').appendChild(option);
					}
				});
				
				nougit.api.get('/repositories/info/' + nougit.repos.current.name, function(info) {
					branches.push(info.branches.current);
					branches = branches.concat(info.branches.others);

					// populate select list
					_.each(branches, function() {
						var option = document.createElement('option');
						option.innerHTML = this;
						option.value = this;
						_.dom.get('#selected_branch').appendChild(option);
						
						var branchListItem = document.createElement('li');
						branchListItem.className = 'branch_item';
						branchListItem.innerHTML = this;
						_.dom.get('#branches').appendChild(branchListItem);
						
						// bind branch list item logic here
						_.bind(branchListItem, 'click', function() {
							var branches_all = _.dom.get('.branch_item');
							
							if (!_.dom.hasClass(this, 'selected')) {
								_.each(branches_all, function() {
									_.dom.deleteClass(this, 'selected');
								});
								_.dom.insertClass(this, 'selected');
							} else {
								_.dom.deleteClass(this, 'selected');
							}
							
						});
					});
				});
				
				// bind admin buttons
				var buttons = {
					push : _.dom.get('#action_push'),
					pull : _.dom.get('#action_fetch'),
					addremote : _.dom.get('#add_remote'),
					editremote : _.dom.get('#edit_remote'),
					checkout : _.dom.get('#checkout_branch'),
					newbranch : _.dom.get('#create_branch')
				}
				
				// push to remote
				_.bind(buttons.push, 'click', function(e) {
					var remote = _.dom.get('#selected_remote').value,
					    branch = _.dom.get('#selected_branch').value;
					nougit.api.get('/push/' + nougit.repos.current.name + '/' + remote + '/' + branch, function(data) {
						uialert(data.message, 'success');
						reloadPanel();
					}, function(err) {
						uialert(err.error, 'error');
						reloadPanel();
					});
				});
				
				// fetch from remote
				_.bind(buttons.pull, 'click', function(e) {
					var remote = _.dom.get('#selected_remote').value,
					    branch = _.dom.get('#selected_branch').value;
					nougit.api.get('/pull/' + nougit.repos.current.name + '/' + remote + '/' + branch, function(data) {
						uialert(data.message, 'success');
						reloadPanel();
					}, function(err) {
						uialert(err.error, 'error');
						reloadPanel();
					});
				});
				
				// create a new remote
				_.bind(buttons.addremote, 'click', function(e) {
					showDialog(e.target.href);
				});
				
				// edit existing remote
				_.bind(buttons.editremote, 'click', function(e) {
					var selected = _.dom.get('.selected', _.dom.get('#remotes'))[0];
					if (selected) {
						var name = _.dom.get('#edit_remote_name'),
						    url = _.dom.get('#edit_remote_url');
						
						name.value = _.dom.get('.remoteName', selected)[0].innerHTML;
						url.value = _.dom.get('.remoteUrl', selected)[0].innerHTML;
						showDialog(e.target.href);
					} else {
						uialert('No remote selected.', 'error');
					}
				});
				
				// checkout a branch
				_.bind(buttons.checkout, 'click', function(e) {
					var branch = _.dom.get('.selected', _.dom.get('#branches'))[0];
					if (branch) {
						nougit.api.get('/checkout/' + nougit.repos.current.name + '/' + branch.innerHTML, function(data) {
							uialert(data.message, 'success');
							reloadPanel();
						}, function(err) {
							uialert(err.error, 'error');
						});
					} else {
						uialert('Please select a branch to checkout.', 'error');
					}
				});
				
				// create new branch
				_.bind(buttons.newbranch, 'click', function(e) {
					showDialog(e.target.href);
				});
				
			});
			
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