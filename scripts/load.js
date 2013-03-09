/*
 * Nougit - load.js
 * Author : Gordon Hall
 */
var load = function(load_array, callback) {
	var current = 0,
	    total = load_array.length;

	deploy();

	function deploy() {
		var length = load_array[current].length,
		    isScript = (load_array[current].substring(length - 3, length) === '.js'),
		    isCss = (load_array[current].substring(length - 4, length) === '.css');

		if (isScript) {
			importScript(load_array[current], function() {
				current++;
				if (current === total) {
					if (callback) {
						callback.call(this);
					}
				} else {
					deploy();
				}
			});
		} else if (isCss) {
			importCSS(load_array[current], function() {
				current++;
				if (current === total) {
					if (callback) {
						callback.call(this);
					}
				} else {
					deploy();
				}
			});
		} else {
			current++;
			deploy();
			throw new Error('Unable to load "' + load_array[current] + '".');
		}
	}

	function importScript(script_path, onComplete) {
		var head = document.getElementsByTagName('head')[0],
		    script = document.createElement('script');

		script.type = 'text/javascript';
		script.src = script_path;

		head.appendChild(script); // append script to head

		script.onload = script.onreadystatechange = function() {
		    if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
		        if (onComplete) {
		        	onComplete.call(this); // fire callback
		        }
		        // clean up and handle memory leak in ie
		        script.onload = script.onreadystatechange = null;
		        head.removeChild(script);
		    }
		}
	}

	function importCSS(stylesheet_path, onComplete) {
		var head = document.getElementsByTagName('head')[0],
		    styles = document.createElement('link');

		styles.rel = 'stylesheet';
	    styles.type = 'text/css';
	    styles.href = stylesheet_path;
		head.appendChild(styles);
		if (onComplete) {
        	onComplete.call(this); // fire callback
        }
	}
}