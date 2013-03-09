/*
 * manchu - carefree handlebars template pre-compilation at runtime
 * author : gordon hall <gordon@gordonwritescode.com>
 *
 * Directive class
 */

var path = require('path')
  , fs = require('fs')
  , clc = require('cli-color')
  , error = clc.red.bold
  , warn = clc.yellow
  , notice = clc.blue
  , Directive;

Directive = function(options) {
	var required = ['type', 'input', 'output']
	  , validTypes = ['handlebars', 'javascript', 'stylesheet']
	  , inputs = [];
	// make sure all require options exist
	required.forEach(function(val) {
		if (!options[val] || !options[val].length) {
			throw new Error(error('Missing required Directive option: "' + val + '"'));
		}
	});
	// normalize convert input to array
	if (!(options.input instanceof Array)) {
		options.input = [options.input];
	}

	// setup inputs
	options.input.forEach(function(val, index) {
		var target = path.normalize(val);
		if (fs.existsSync(target)) {
			inputs.push({
				path : target,
				isDirectory : fs.statSync(target).isDirectory()
			});
		} else {
			console.log(warn('The target path: "' + val + '" does not exist.'));

		}
	});

	// verify output is valid
	var dirName = path.dirname(options.output);
	if (!fs.existsSync(dirName)) {
		throw new Error(error('The output directory: "' + dirName +'" does not exist.'));
	}

	// verify type is valid
	if (validTypes.indexOf(options.type) === -1) {
		throw new Error(error('"' + options.type + '" is not a valid type parameter.'));
	}

	// set options
	this.type = options.type;
	this.name = options.name || 'unknown';
	this.input = inputs;
	this.output = path.normalize(options.output);
	this.minify = Boolean(options.minify);
	this.flags = options.flags || [];
	this.isQueued = false;
};

module.exports = Directive;