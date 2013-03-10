/*
 * Nougit - main.js
 * Author : Gordon Hall
 */

nougit.VIEWS = Handlebars.templates;
nougit.HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
nougit.CORE = './scripts/core/';
nougit.MODULES = './scripts/modules/';
nougit.DB = require('footon')('nougit');

// when local db is ready, get the repo collection
// and generate the user interface
nougit.DB.on('ready', function(db) {
	// generate repo list
	var repositories = db.get('repositories')
	  , all_repos = repositories.find({});
	nougit.actions.renderRepositoryList(all_repos)
	$('#loader').hide();
	$('#app').removeClass('blocked');
});