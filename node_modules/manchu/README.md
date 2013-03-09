manchu
======

fu manchu does not obtain his mighty 'stache without, first, pre-compiling it.

## about

manchu is an easy way to create build directives at your application runtime. it supports the following otherwise manual tasks:

* handlebars template pre-compilation
* css/less concatenation and compilation
* javascript compression and concatenation

## installation

	$ npm install manchu

## usage

this example illustrates how you might do the following:

1. precompile a directory of handlebars templates
2. uglify a directory of javascript files
3. concatenate selected css and less files and minify

```javascript
var manchu = require('manchu')
  , templates
  , scripts,
  , styles;

templates = manchu.createDirective({
	type : 'handlebars',
	input : __dirname + '/templates',
	output : __dirname + '/public/scripts/templates.js'
});

scripts = manchu.createDirective({
	type : 'javascript',
	input : __dirname + '/scripts',
	output : __dirname + '/public/scripts/app.js'
});

styles = manchu.createDirective({
	type : 'stylesheet',
	input : __dirname + '/styles',
	output : __dirname + '/public/styles/styles.css'
});

manchu.build([
	templates,
	styles,
	scripts
], function() {
	// start your server or something
});
```

## public api

### manchu.createDirective(options)

Returns a new `Directive` instance. The argument `options` takes the following properties.

* **type** - *String* ('handlebars', 'javascript', 'stylesheet')
	* Type will determine whether to precompile handlebars templates, uglify JavaScript files, or compile LESS
* **input** - *String* or *Array*
	* This can be a string path to a directory of files to use or and array of individual files or directories
	* The directory read is not recursive and will only read the immediate children of the directory
* **output** - *String*
	* Path to the desired output file.

### manchu.build(directives, callback)

Accepts an array of `Directive`s and executes them in sequence.

* **directives** - *Array*
	* Pass an array of `manchu.Directive` instances
* **callback** - *Function*
	* Gets called upon successful build of all directives

Returns a new instance

## class reference

### manchu.Builder

### manchu.Directive