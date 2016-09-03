/*
 * grunt-nuget
 * https://github.com/spatools/grunt-nuget
 * Copyright (c) 2013 SPA Tools
 * Code below is licensed under MIT License
 *
 * Permission is hereby granted, free of charge, to any person 
 * obtaining a copy of this software and associated documentation 
 * files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, 
 * publish, distribute, sublicense, and/or sell copies of the Software, 
 * and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be 
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR 
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var path = require("path");
var nugetPath = path.join(__dirname, "nuget.exe");

module.exports = function (grunt) {
    var _ = grunt.util._,
        useMono = (process.platform !== 'win32'),
        executable = useMono ? 'mono' : nugetPath;

        createArguments = function (command, path, args) {
            var result = [];

            if (useMono) {
                result.push(nugetPath);
            }

            result.push(command);
            result.push(path);

            for (var key in args) {
                var argKey = "-" + key[0].toUpperCase() + key.slice(1);
                result.push(argKey);

                if (args[key] && args[key] !== true)
                    result.push(args[key]);
            }

            return result;
        },

        createSpawnCallback = function (path, args, callback) {
            return function (error, result, code) {
                if (error) {
                    var _error = "Error while trying to execute NuGet Command Line on file " + path + "\n" + error;
                    callback(error);
                }
                else {
                    if ("verbose" in args || "verbosity" in args) {
                        grunt.log.writeln(result);
                    }

                    grunt.log.ok();
                    callback();
                }
            }
        },

        isSpecFile = function (file) {
            return path.extname(file) === ".nuspec" || path.extname(file) === ".csproj";
        },

        isPackageFile = function (file) {
            return path.extname(file) === ".nupkg";
        },
        isSolutionFile = function (file) {
            return path.extname(file) === ".sln";
        },
        isConfigFile = function (file) {
            return path.basename(file) === "packages.config";
        },

        pack = function (path, args, callback) {
            if (!isSpecFile(path)) {
                callback("File path '" + path + "' is not a NuGet specification file !");
                return;
            }

            grunt.log.writeln("Trying to create NuGet package from " + path + ". ");
            grunt.util.spawn({ cmd: executable, args: createArguments("Pack", path, args) }, createSpawnCallback(path, args, callback));
        },

        push = function (path, args, callback) {
            if (!isPackageFile(path)) {
                callback("File path '" + path + "' is not a NuGet package file !");
                return;
            }

            grunt.log.writeln("Trying to publish NuGet package " + path + ". ");
            grunt.util.spawn({ cmd: executable, args: createArguments("Push", path, args) }, createSpawnCallback(path, args, callback));
        },
        restore = function (path, args, callback) {
            if (!isSolutionFile(path) && !isConfigFile(path)) {
                callback("File path '" + path + "' is not a valid solution file or packages.config !");
                return;
            }

            grunt.log.writeln("Trying to restore NuGet packages for " + path + ". ");
            grunt.util.spawn({ cmd: executable, args: createArguments("Restore", path, args) }, createSpawnCallback(path, args, callback));
        },
        setapikey = function (key, args, callback) {
            grunt.util.spawn({ cmd: executable, args: createArguments("SetApiKey", key, args) }, createSpawnCallback(null, args, callback));
        };

    return {
        isSpecFile: isSpecFile,
        isPackageFile: isPackageFile,

        pack: pack,
        push: push,
        restore: restore,
        setapikey: setapikey
    };
};
