/*
 * footon - simple file-system based JSON store with querying, built for packaged node-webkit applications
 * author: gordon hall <gordon@gordonwritescode.com>
 *
 * configuration options
 */

module.exports = {
	path : process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.footon',
	net : {
		port : 3333,
		pass : null
	}
};