module.exports = function (grunt) {
    grunt.initConfig({
        nugetpack: {
            options: {
                verbosity: "detailed"
            },

            dist: {
                src: 'tests/Package.nuspec',
                dest: 'tests/'
            }
        },
        nugetrestore: {
            restore: {
                src: 'tests/packages.config',
                dest: 'packages/'
            }
        },
        nugetupdate: {
            update: {
                src: 'tests/project.sln'
            }
        },
        clean: {
            pack: {
                src: 'tests/PackageTest.1.0.0.nupkg'
            },
            restore: {
                src: 'packages'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['clean', 'nugetpack', 'nugetrestore']);
};