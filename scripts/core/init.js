/*
 * Nougit - init.js
 * Author : Gordon Hall
 */

(function() {
	var manchu = require('manchu')
	  , fs = require('fs')
	  , home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
	  , templates
	  , TEMPLATE_PATH = home + '/.nougit/templates.js'
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
	    output : TEMPLATE_PATH
	});

	// build templates and load core
	manchu.build([templates], loadCore);

	// load all core modules here
	function loadCore() {
		// load core modules
		load([
			core + 'bindings.js',
			core + 'main.js',
			TEMPLATE_PATH
		], function() {
			console.log('Nougit:', 'Core Modules Loaded!');
			// some namespacing setup...
			if (window.nougit) {
				nougit.views = Handlebars.templates
			}
		});
	};
})();