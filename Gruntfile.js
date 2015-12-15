/*global module:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/**\n * @license <%= pkg.title || pkg.name %> v<%= pkg.version %>\n' +
      ' * (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
      ' * License: <%= pkg.license %>\n' +
      ' * <%= pkg.homepage %>\n */\n',
    ngtemplates: {
      app: {
        src: 'src/templates/**/*.html',
        dest: 'build/templates.js',
        options: {
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          },
          module: 'widgetGrid',
          url: function (url) {
            url = url.replace(/^src\/templates\//, '');
            return url.replace('.html', '');
          }
        }
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        // remove tsd and jshint annotations
        stripBanners: { block: true, line: true },
        sourceMap: true
      },
      dist: {
        src: ['src/js/**/*.js', '<%= ngtemplates.app.dest %>'],
        dest: '<%= pkg.name %>.js'
      }
    },
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      widgetGrid: {
        files: [{ expand: true, src: ['<%= pkg.name %>.js'] }]
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        sourceMap: true
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        jasmine: true,
        globals: {
          angular: false,
          console: false,
          module: false,
          _: false
        },
        force: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['src/**/*.js', 'test/**/*.js']
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true,
        reporters: ['dots']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: ['src/**/*.html', 'src/**/*.css', 'src/**/*.js', 'test/**/*.js', 'demo/*'],
        tasks: ['jshint:lib_test', 'test', 'build'],
        options: { livereload: true }
      }
    },
    copy:{
      main: {
        files: [
          { cwd: 'src/css', expand: true, src: ['*'], dest: '.' }
        ]
      },
      demo: {
        files: [
          { cwd: '.', expand: true, src: ['*.min.js', '*.css'], dest: 'demo/lib/' }
        ]
      }
    },
    clean: ['build'],
    'gh-pages': {
      options: {
        base: 'demo'
      },
      src: ['**']
    },
    connect: {
      server: {
        options: {
          base: 'demo',
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ng-annotate');

  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('build', ['ngtemplates', 'concat', 'ngAnnotate', 'uglify', 'clean', 'copy']);
  grunt.registerTask('default', ['jshint', 'test', 'build']);
};
