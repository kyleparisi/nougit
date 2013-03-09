/*
 * manchu - carefree handlebars template pre-compilation at runtime
 * author : gordon hall <gordon@gordonwritescode.com>
 */

var path = require('path')
  , fs = require('fs')
  , clc = require('cli-color')
  , exec = require('child_process').exec
  , bin = __dirname + '/../../node_modules/.bin/'
  , createCommand
  , Directive = require('./directive.js')
  , Builder;

Builder = function(directives, callback) {
	this.directives = directives;
	this.onComplete = callback || new Function();
	this.current = 0;
};

Builder.prototype.exec = function(noExec) {
	var builder = this
	  , directive = builder.directives[builder.current];

	if (builder.current < builder.directives.length) {
		var command = createCommand(directive);
		
		console.log(
			clc.magenta.bold('Manchu:'),
			clc.white('building "'),
			clc.whiteBright.bold(directive.name),
			clc.white('" to file "'),
			clc.whiteBright.bold(directive.output),
			clc.white('"')
		);
		
		if (!noExec) {
			var proc = exec(command, function(err, stdout, stderr) {
				if (err || stderr) {
					console.log(clc.red.bold(err || stderr));
					console.log(
						clc.magenta.bold('Manchu:'),
						clc.white('build failed - terminating process')
					);
					process.exit();
				} else {
					if (directive.type === 'stylesheet') {
						fs.writeFileSync(directive.output, stdout);
					}
				}
			});

			proc.on('close', function() {
				builder.current++;
				builder.exec();
			});
		}
	} else {
		builder.current = 0;
		console.log(
			clc.magenta.bold('Manchu:'),
			clc.white('builder executed all directives successfully')
		);
		this.onComplete.call(this);
	}
};

createCommand = function(directive) {
	var cmd = {
		handlebars : bin + 'handlebars ',
		stylesheet : bin + 'lessc ',
		javascript : bin + 'uglifyjs '
	} , command = '', inputs = [];

	directive.input.forEach(function(val, index) {
		if (val.isDirectory) {
			var contents = fs.readdirSync(val.path)
			  , basePath = val.path;
			// iterate over dir contents
			contents.forEach(function(val, index) {
				if (fs.statSync(basePath + '/' + val).isFile()) {
					inputs.push(basePath + '/' + val);
				}
			});
		} else {
			inputs.push(val.path);
		}
	});

	command += cmd[directive.type];
	command += directive.flags.join(' ') + ' ';
	command += inputs.join(' ') + ' ';
	command += (directive.type === 'stylesheet') ? ' --compress ' : '--output ' + directive.output;

	return command;
};

module.exports = Builder;
