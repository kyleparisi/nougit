/*
 * NeckBeard.js (https://github.com/gordonhallart/NeckBeard)
 * Author: Gordon Hall
 * Version 0.5.0
 *
 * Requires BlueprintJS (https://gordonwritescode.com/BlueprintJS)
 * Licensed Under MIT (http://www.opensource.org/licenses/MIT)
 */

var neckbeard = (function() {
	
	// config properties
	var templates = {},
	    path = '/templates',
		async = false;
	
	// config method
	function config(options) {
		path = options.path || '/templates';
		async = options.async || false;
		if (options['load'] && options['load'].length > 0) {
			blueprint.each(options['load'], function() {
				templates[this] = null;
			});
		}
		return neckbeard;
	}
	
	// set a template
	function get(name, callback) {
		if (templates[name]) {
			callback.call(this, templates[name]);
		} else {
			blueprint.request({
				type : 'GET',
				url : path + '/' + name + '.nb',
				expect : 'text',
				async : async,
				success : function(res) {
					templates[name] = res;
					callback.call(this, res);
				},
				failure : function(res) {
					throw new Error(res);
				}
			});
		}
	}
	
	// takes a template object and data object and returns the compiled template
	function compile(template, view) {
		var temp = template, 
		    replaces = template.match(/#{[A-Za-z0-9.]+}/g); // get all neckbeard replace vars
		
		// for each found neackbeard var in template
		blueprint.each(replaces, function() {
			// get the text value
	  		var whichVar = this.replace('#{','').replace('}',''),
			// split at dot notation
			    varTree = whichVar.split('.'), 
			// ready to create property string to eval
			    prop = ''; 
			
			// for each dot seperated property
			blueprint.each(varTree, function() {
				// append the new property format
				prop += '["' + this + '"]';
			});
			
			// replace the neckbeard variable with it's value
			temp = temp.replace(this, eval('view' + prop));
		});
		
		// return compiled template
		return temp;
	}

	return {
		// public methods
		config : config,
		compile : compile,
		get : get,
		templates : templates
	};

})();
