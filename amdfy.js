/**
 * @license RequireJS AMDfy 0.0.1 Copyright (c) 2013, Leo Giovanetti All Rights Reserved
 * Available via MIT license.
 * see: http:// http://github.com/leog/amdfy for details
 */
/*jslint regexp: true */
/*global require: false, navigator: false, define: false */

/**
 * This plugin handles amdfy! prefixed modules. It does the following:
 *
 */
(function () {
    'use strict';

    var mainRegex = /([^()]+)/g;
    var allDepsRegex = /([a-zA-Z]+)(?=:)/g;
	var allDepsNamesRegex = /([a-zA-Z]+)(?=,)/g;
    var wrapper = "define(['0'],function(){1});";

    Array.prototype.run = function(func) {
        var i = 0, output = [];
        for (i; i < this.length; i++) {
            output.push(func.call(this, this[i], i));
        }
        return output;
    };

    define(['require'], function(require) {
        return {
            version: '0.0.1',
            /**
             * Called when a dependency needs to be loaded.
             */
            load: function (name, req, onload, config) {
                // Separating file from dependencies
                var base = name.match(mainRegex);
				// Apply AMDfy to first declared file (need it as text)
				var mainFile = [base[0]].run(function(dep){return "../requirejs-text/text!"+req.toUrl(dep);});
				// Extracting dependencies
				var allDeps = base[1].match(allDepsRegex);
				// Extracting dependencies names
				var allDepsNames = (base[1]+',').match(allDepsNamesRegex);
				// Start the magic!
                require(mainFile, function(mainFileTxt) {
					// Set dependencies
                    wrapper = wrapper.replace("0", allDeps.join("','"));
					// Construct evaluable dependencies name array
					var namesArray = "eval(\"var depNames = ['" + allDepsNames.join("',") + "']\");";
					// Construct evaluable dependency to name matching iterator
					var depNameIterator = "eval(\"for(var i = 0; i < arguments.length; i++) {eval('var '+depNames[i]+'=arguments[i]')}\");";
					// Set dependencies names
					wrapper = wrapper.replace("1", namesArray + depNameIterator + mainFileTxt);
					// Evaluate from amdfy
					onload.fromText(wrapper);				
                });
            }/*,
			normalize: function (name, normalize) {
				// Separating file from dependencies
                var base = name.match(mainRegex);
				// Extracting dependencies
				var allDeps = base[1].match(allDepsRegex);
				// Extracting dependencies names
				var allDepsNames = (base[1]+',').match(allDepsNamesRegex);
				// Normalize each dependency
				var normalizedDeps = allDeps.run(function(dep){return normalize(dep)});
				// Construct and return normalized name
				return normalize(base[0]) + "(" + normalizedDeps.run(function(normDep, i) {return normDep+':'+allDepsNames[i];}) + ")";
			}*/
        }
    });
}());