/*
 * Nougit - init.js
 * Author : Gordon Hall
 */

$(function() {
	var nougit = window.nougit = {}
	  , win = require('nw.gui').Window.get()
	  , manchu = require('manchu')
	  , fs = require('fs')
	  , home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
	  , templates
	  , template_path = home + '/.nougit/templates.js'
	  , core = './scripts/core/';

	// make sure we have a spot in the users home
	// if not - let's create it
	if (!fs.existsSync(home + '/.nougit')) {
		fs.mkdirSync(home + '/.nougit');
	}

	// create a build directive for templates
	templates = manchu.createDirective({
		type : 'handlebars',
		name : 'templates',
	    input : './templates',
	    output : template_path
	});

	// build templates and load core
	manchu.build([templates], loadCore);

	// show window since the dom is ready
	win.show();

	// load all core modules here
	function loadCore() {
		// load core modules
		load([
			template_path,
			core + 'actions.js',
			core + 'main.js',
			core + 'bindings.js'
		], function() {
			console.log('Nougit:', 'Core Modules Loaded!');
		});
	};
})();