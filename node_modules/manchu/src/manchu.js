/*
 * manchu - carefree handlebars template pre-compilation at runtime
 * author : gordon hall <gordon@gordonwritescode.com>
 */

var Directive = require('./classes/directive.js')
  , Builder = require('./classes/builder.js')
  , clc = require('cli-color');

// create a new Directive
module.exports.createDirective = function(options) {
	return new Directive(options);
};

// run a consecutive sequence of Directives using a Builder
module.exports.build = function(directives, callback, noExec) {
	printInfo();
	var builder = new Builder(directives, callback);
	builder.exec(noExec);
	return builder;
};

function printInfo(big) {
	console.log(clc.white('---------------------------------------'));	
	if (big) {
		console.log(clc.magenta.bold('                         _           '));
		console.log(clc.white.bold('  /\\/\\   __ _ _ __   ___| |__  _   _ '));
		console.log(clc.magenta.bold(' /    \\ / _` | \'_ \\ / __| \'_ \\| | | |'));
		console.log(clc.white.bold('/ /\\/\\ \\ (_| | | | | (__| | | | |_| |'));
		console.log(clc.magenta.bold('\\/    \\/\\__,_|_| |_|\\___|_| |_|\\__,_|')); 
	} else {
		console.log(
			clc.magenta.bold('|\\/|'),
			clc.white.bold('/\\'),
			clc.magenta.bold('|\\|'),
			clc.white.bold('('),
			clc.magenta.bold('|-|'),
			clc.white.bold('|_|')
		);
	}     
	console.log(clc.magenta('Author:'), clc.white('Gordon Hall <gordon@gordonwritescode.com>'));
	console.log(clc.white('---------------------------------------'));			                
};