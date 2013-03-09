/*
 * footon - simple file-system based JSON store with querying, built for packaged node-webkit applications
 * author: gordon hall <gordon@gordonwritescode.com>
 *
 * class -> Document
 * descr -> Creates a document instance for the specified collection
 */

var fs = require('fs')
  , util = require('util')
  , path = require('path')
  , clc = require('cli-color')
  , helpers = require('../helpers.js')
  , config = require('../config.js')
  , EventEmitter = require('events').EventEmitter
  , Collection = require('./collection.js')
  , Document;


Document = function(object, collection) {
	// throw error if no collection
	if (!collection || !(collection instanceof Collection.constructor)) {
		throw new Error('Document must be instantied with a valid Collection.');
	}
	// take contents of object and set them to this object
	if (typeof object === 'object') {
		for (var prop in object) {
			this[prop] = object[prop];
		}
	}
	
	Object.defineProperty(this, '__collection', {
		enumerable : false,
		value : collection,
		writable : true
	});
	
	Object.defineProperty(this, '__id', {
		enumerable : false,
		value : helpers.createId(),
		writable : false
	});
};

// remove from collection and call Collection.write()
Document.prototype.remove = function(callback) {
	var position = this.__collection.contents.indexOf(this);
	if (position !== -1) {
		this.__collection.contents.splice(position, 1);
	}
};

module.exports = Document;