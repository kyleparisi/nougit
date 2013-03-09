/*
 * footon - simple file-system based JSON store with querying, built for packaged node-webkit applications
 * author: gordon hall <gordon@gordonwritescode.com>
 *
 * class -> Collection
 * descr -> Creates a collection instance from the passed contents
 */

var fs = require('fs')
  , util = require('util')
  , path = require('path')
  , clc = require('cli-color')
  , helpers = require('../helpers.js')
  , config = require('../config.js')
  , EventEmitter = require('events').EventEmitter
  , Document = require('./document.js')
  , Collection;
  
Collection = function(contents, name, database) {
	var collection = this;
	// save contents
	this.contents = [];
	
	if (contents instanceof Array) {
		contents.forEach(function(val) {
			var doc = new Document(val, collection);
			collection.contents.push(doc);
		});
	}
	
	Object.defineProperty(this, 'database', {
		enumerable : false,
		value : database,
		writable : false
	});
	
	if (!database.socket) {
		Object.defineProperty(this, 'path', {
			enumerable : false,
			value : database.path + '/' + name,
			writable : false
		});
	}
	
	Object.defineProperty(this, 'name', {
		enumerable : false,
		value : name,
		writable : false
	});
};

// inherit from EventEmitter
util.inherits(Collection, EventEmitter);

// querying documents in a collection
Collection.prototype.find = function(query) {
	// are we targeting by id explicitly ( { __id : String } ) or implicitly ( String )
	if ((typeof query === 'object' && query.__id) || (typeof query === 'string')) {
		var id = query.__id || query
		  , doc = helpers.getObjectById(id, this.contents);
		return (doc) ? new Document(doc, this) : null;
	}
	// otherwise query the collection
	var docs = helpers.queryCollection(query, this.contents);
	return docs;
};

// save a new document to this collection
Collection.prototype.add = function(document) {
	var doc = null;
	if (typeof document === 'object') {
		// if it's a valid object, create a document instance
		doc = new Document(document, this);
		// add to contents
		this.contents.push(doc);
	}
	return doc;
};

// update collection file on disk
Collection.prototype.save = function(callback, sync) {
	if (!this.database.socket) {
		var collection = this;
		// this method can be called expilicity
		// but is automatically called by Document.update()
		var file = JSON.stringify(collection.contents);
		// update collection file on disk
		if (sync) {
			fs.writeFileSync(collection.path, file);
		} else {
			fs.writeFile(collection.path, file, function(err) {
				if (err) collection.emit('err');
				if (callback) callback.call(collection, err);
			});
		}
	}
};

module.exports = Collection;