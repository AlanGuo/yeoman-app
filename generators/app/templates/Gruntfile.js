// Generated on 2014-09-17 using generator-angular 0.9.8
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var fs = require('fs');

<% var tmodjs = false,compass = false, seajs = false, bootstrap = false, karma = false, backend = false; %>
<% if(plugins.pluginlist.indexOf('tmodjs')>-1){tmodjs=true} %>
<% if(plugins.pluginlist.indexOf('compass')>-1){compass=true} %>
<% if(plugins.pluginlist.indexOf('seajs')>-1){seajs=true} %>
<% if(plugins.pluginlist.indexOf('bootstrap')>-1){bootstrap=true} %>
<% if(plugins.pluginlist.indexOf('karma')>-1){karma=true} %>
<% if(plugins.pluginlist.indexOf('backend')>-1){backend=true} %>

<%if(backend){%>
//for cgi
var bodyParser = require('body-parser');
var path = require('path');
<%}%>

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: 'app',
    dist: 'dist'
  };

  var cdn = '/',
      local = '/',
      localstorageJSPrefix = cdn + 'script/',
      localstorageCSSPrefix = cdn + 'style/',
      localstorageCSSLocalPrefix = local + 'style/',
      //pri越大，加载越靠前
      localstoragePriority = [
        {key:'sea',pri:2},
        {key:'app.combo',pri:1}
      ];

  <%if(backend){%>
  //for cgi
  //后台相关配置
  var webconfig = {
    'handler':{
        'prefix':'/cgi-bin',
        'module':'backend/requesthandler'
    },
    'port':8080,
    'expires':[{
      'fileMatch': '.gif|png|jpg|jpeg|js|css|mp3|ogg',
      'maxAge': 606024365
    }],
    'log':'web.log',
    'index':'index.html',
    'singlePage': true,
    'webSocket':{
      'handle':{
          'prefix':'websocket'
      },
      'sub-protocol':['echo-protocol-pc','echo-protocol-mobile']
    }
  };
  <%}%>

  var localStorageRewriteScript=function(contents,filePath,prefix){
    //把源代码转换成一个function
    var filenameArray = filePath.split(/\//).slice(-1)[0].split('.');
    if(filenameArray.length>2){
      //有版本号, 删除版本号
      filenameArray.splice(filenameArray.length-2,1);
    }
    return 'window[\''+prefix+filenameArray.join('.')+'\'] = function(){'+contents+'}';
  };

  var localStorageRewriteIndex=function(contents,prefix){
    var versions = {};
    //javascripts
    var scripts = fs.readdirSync('dist/script'),
        styles = fs.readdirSync('dist/style');

    var assets = scripts.concat(styles);
    //console.log(assets);
    //脚本按照优先级排序
    assets.sort(function(a,b){
      //item.key 和 item.ext 都相同
      var ap = localstoragePriority.filter(function(item){
        if(a.indexOf(item.key)>-1 && (a.split('.').slice(-1)[0] === item.ext)){
          return item;
        }
      });
      var bp = localstoragePriority.filter(function(item){
        if(b.indexOf(item.key)>-1  && (b.split('.').slice(-1)[0] === item.ext)){
          return item;
        }
      });

      if(ap && ap[0]) {
        ap = ap[0].pri;
      }
      else{
        ap = 0;
      }
      if(bp && bp[0]) {
        bp = bp[0].pri;
      }
      else{
        bp = 0;
      }

      return bp-ap;
    });

    for(var i=0;i<assets.length;i++){
      var p = assets[i];
      var filenameArray = p.split('.');
      var ext = filenameArray[filenameArray.length-1],
          version = '',
          filename = '';
      if(filenameArray.length>2){
        //有版本号
        version = filenameArray[filenameArray.length-2];
        filename = filenameArray.slice(0,filenameArray.length-2).join('.')+'.'+ext;
      }
      else{
        filename = p;
      }
      versions[prefix[ext]+filename] = {v:version,cdn:prefix[ext+'cdn'],ext:ext};
    }

    return contents.replace(/\/\*\{\{localstorage\}\}\*\//ig,'window.versions='+JSON.stringify(versions)+';\n'+fs.readFileSync('util/localstorage.js')).
                    replace(/\/\*\{\{localstorage\-onload\-start\}\}\*\//ig,'window.onlsload=function(){').
                    replace(/\/\*\{\{localstorage\-onload\-end\}\}\*\//ig,'}').
                    replace(/<\!\-\-localstorage\-remove\-start\-\-\>[\s\S]*?<\!\-\-localstorage\-remove\-end\-\-\>/ig,'');
  };

  <%if(backend){%>
  //for cgi
  var createHandlerRecursive = function(cgirouteParam, handleParam, prefix){

    var makeHandler = function(handler){
      return function(pathname, request, response){
        response.writeHead('200');
        response.writeHead('Content-Type','appliction/json');
        response.end(handler,'utf-8');
      };
    };

    for(var p in handleParam){
      if(/function/i.test(typeof handleParam[p])){
        cgirouteParam[prefix+'/'+p] = handleParam[p];
      }
      else if(/object/i.test(typeof handleParam[p])){
        //cgirouteParam[prefix+'/'+p] = {};
        createHandlerRecursive(cgirouteParam, handleParam[p],prefix+'/'+p);
      }
      else if(/string/i.test(typeof handleParam[p])){
        //字符串直接输出
        cgirouteParam[prefix+'/'+p] = makeHandler(handleParam[p]);
      }
    }

  };
  <%}%>


  var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%%= yeoman.app %>/script/**/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%%= connect.options.livereload %>'
        }
      },
      css:{
        files: ['<%%= yeoman.app %>/style/**/*.css'],
        tasks: ['newer:jshint:all','newer:autoprefixer'],
        options: {
          livereload: '<%%= connect.options.livereload %>'
        }
      },
      <%if(tmodjs){%>
      view:{
        files: ['<%%= yeoman.app %>/view/**/*.html'],
        tasks: ['newer:tmod'],
        options: {
          livereload: '<%%= connect.options.livereload %>'
        }
      },
      <%}%>
      <%if(karma){%>
      jsTest: {
        files: ['test/spec/**/*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      <%}else{%>
      jsTest: {
        files: ['test/spec/**/*.js'],
        tasks: ['newer:jshint:test']
      },
      <%}%>
      <%if(compass){%>
      compass: {
        files: ['<%%= yeoman.app %>/style/**/*.{scss,sass}'],
        tasks: ['css','compass:server', 'autoprefixer']
      },
      <%}%>


      <%if(backend){%>
      //for cgi
      backend:{
        files: ['backend/**/*.js'],
        tasks:['rerun:conn:connect:livereload:keepalive:go'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      <%}%>

      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%%= connect.options.livereload %>'
        },
        files: [
          '<%%= yeoman.app %>/**/*.html',
          '<%%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    <%if(backend){%>
    //for cgi
    rerun: {
      conn: {
        options: {
          tasks: ['connect:livereload:keepalive']
        }
      }
    },
    <%}%>

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      rules: [
          // Internal rewrite
          {from: '^/[a-zA-Z0-9/_?&=]*$', to: '/index.html'}
      ],
      livereload: {
        options: {
          //open: 'http://localhost:9000/',
          middleware: function (connect) {
            <% if(backend){ %>
              //for cgi
              var cgiArray = [],
                  cgiroute = {},
                  requestHandler = null;

              var requestPath = path.resolve(__dirname, webconfig.handler.module + '.js');
              if(fs.existsSync(requestPath)){
                requestHandler = require(requestPath);
              }

              if(requestHandler){
                createHandlerRecursive(cgiroute, requestHandler, webconfig.handler.prefix);
                var makefunc = function(p,handler){
                  return function(req, res){
                     handler(p, req, res, webconfig);
                  };
                };
                for(var p in cgiroute){
                  cgiArray.push(connect().use(p,makefunc(p,cgiroute[p])));
                }
              }

              return [rewriteRulesSnippet,
                bodyParser.raw({ extended: false })].
                concat(cgiArray).
                concat([connect.static('.tmp'),
                connect().use(
                  '/bower_components',
                  connect.static('./bower_components')
                ),
                connect().use(
                  '/spm_modules',
                  connect.static('./spm_modules')
                ),
                connect.static(appConfig.app),
                connect.static('.')]);
            <%}else{%>
              return [
                rewriteRulesSnippet,
                connect.static('.tmp'),
                connect().use(
                  '/bower_components',
                  connect.static('./bower_components')
                ),
                connect().use(
                  '/spm_modules',
                  connect.static('./spm_modules')
                ),
                connect.static(appConfig.app),
                connect.static('.')
              ];
            <%}%>
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use(
                '/spm_modules',
                connect.static('./spm_modules')
              ),
              connect.static(appConfig.app),
              connect.static('.')
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%%= yeoman.app %>/script/**/*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/**/*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            <%if(compass){%>
            '.sass-cache',
            <%}%>
            '<%%= yeoman.dist %>/**/*',
            '!<%%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp',
      css:'.tmp/style/*.css'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      <%if(compass){%>
      servecss: {
        files: [{
          expand: true,
          cwd: '.tmp/style/',
          src: '**/*.css',
          dest: '.tmp/style/'
        }]
      },
      <%}else{%>
        servecss: {
          files: [{
            expand: true,
            cwd: '<%%= yeoman.app %>/style/',
            src: '**/*.css',
            dest: '.tmp/style/'
          }]
        }
      <%}%>
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%%= yeoman.app %>/index.html'],
        ignorePath:  /\.\.\//
      }<%if(compass){%>,
      sass: {
        src: ['<%%= yeoman.app %>/style/**/*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
      <%}%>
    },

    <%if(compass){%>
    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%%= yeoman.app %>/style',
        cssDir: '.tmp/style',
        //用于合成雪碧图
        generatedImagesDir: '.tmp/image/generated',
        imagesDir: '<%%= yeoman.app %>/image',
        javascriptsDir: '<%%= yeoman.app %>/script',
        fontsDir: '<%%= yeoman.app %>/style/font',
        importPath: './bower_components',
        httpImagesPath: '/image',
        httpGeneratedImagesPath: '/image/generated',
        httpFontsPath: '/style/font',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%%= yeoman.dist %>/image/generated'
        }
      },
      server: {
        options: {
          debugInfo: false
        }
      }
    },
    <%}%>

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%%= yeoman.dist %>/script/**/*.js',
          '!**/script/sea.js**',
          '<%%= yeoman.dist %>/style/**/*.css',
          '<%%= yeoman.dist %>/image/**/*.{png,jpg,jpeg,gif,webp,svg}'
          //'<%%= yeoman.dist %>/style/font/**/*.{eot,svg,ttf,woff}'
        ]
      }
    },

  // Reads HTML for usemin blocks to enable smart builds that automatically
  // concat, minify and revision files. Creates configurations in memory so
  // additional tasks can operate on them
  // <!-- build:<type>(alternate search path) <path> -->
  // ... HTML Markup, list of script / link tags.
  // <!-- endbuild -->
  //设定处理顺序，html文件
    useminPrepare: {
      html: ['<%%= yeoman.app %>/index.html','<%%= yeoman.app %>/storage.html'],
      options: {
        dest: '<%%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%%= yeoman.dist %>/**/*.html','<%%= yeoman.dist %>/script/**/*.js'],
      css: ['<%%= yeoman.dist %>/style/**/*.css'],
      options: {
        assetsDirs: ['<%%= yeoman.dist %>','<%%= yeoman.dist %>/image','<%%= yeoman.dist %>/style/font']
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%%= yeoman.dist %>/style/vendor.css': [
    //         '<%%= yeoman.dist %>/style/**/*.css'
    //       ]
    //     }
    //   }
    // },

    uglify: {
      dist: {
        files: {
          '<%%= yeoman.dist %>/script/app.combo.js': [
            '<%%= yeoman.dist %>/script/app.combo.js'
          ]
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= yeoman.app %>/image',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%%= yeoman.dist %>/image'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= yeoman.app %>/image',
          src: '**/*.svg',
          dest: '<%%= yeoman.dist %>/image'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true,
          minifyJS:true,
          minifyCSS:true
        },
        files: [{
          expand: true,
          cwd: '<%%= yeoman.dist %>',
          src: ['*.html', 'view/**/*.html'],
          dest: '<%%= yeoman.dist %>'
        }]
      }
    },

    <%if(useangular){%>
    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/script',
          src: ['*.js', '!oldieshim.js'],
          dest: '.tmp/concat/script'
        }]
      }
    },
    <%}%>

  // Replace Google CDN references
    cdnify: {
      dist: {
        options: {
          base: ''
        },
        files: [{
          expand: true,
          cwd: '<%%= yeoman.dist %>',
          src: '**/*.{css,html}',
          dest: '<%%= yeoman.dist %>'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          //匹配.开头的文件
          dot: true,
          cwd: '<%%= yeoman.app %>',
          dest: '<%%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            <%if(seajs){%>
            '../spm_modules/seajs/2.3.0/dist/sea.js',
            <%if(!usecombo){%>
            'script/**/*.js', //for no combo
            <%}else{%>
            '*.js',
            <%}%>
            <%}%>
            //'*.js', //for combo
            'image/**/*.{webp}'
          ]
        //图片
        }, {
          expand: true,
          cwd: '.tmp/image',
          dest: '<%%= yeoman.dist %>/image',
          src: ['generated/*']
        //seajs
        }, {
          expand: true,
          cwd: 'app/font',
          dest: '<%%= yeoman.dist %>/font',
          src: ['*.*']
        }<%if(seajs){%>,{
          expand:true,
          cwd:'spm_modules/seajs/2.3.0/dist/',
          dest:'<%%= yeoman.dist %>/script',
          src:['sea.js']
        }<%}%><%if(compass && bootstrap){%>,{
          expand: true,
          cwd: '.',
          src: ['bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*'],
          dest: '<%%= yeoman.dist %>'
        }
        <%}%>]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        <%if(compass){%>
        'compass:server'
        <%}%>
      ],
      test: [
        <%if(compass){%>
        'compass'
        <%}%>
      ],
      dist: [
        <%if(compass){%>
        'compass:dist',
        <%}%>
        'imagemin',
        'svgmin'
      ]
    },

    <%if(karma){%>
    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },
    <%}%>

    <%if(tmodjs){%>
    tmod: {
      template: {
        src: '<%%= yeoman.app %>/view/**/*.html',
        dest: '<%%= yeoman.app %>/view/compiled/view.js',
        options: {
            base: '<%%= yeoman.app %>/view',
            minify:false,
            namespace:'<%= name %>tmpl'
        } 
      }
    },
    <%}%>

    rewrite: {
        localstorageScript:{
          src:'dist/script/*.js',
          editor:function(contents,filePath){
            return localStorageRewriteScript(contents, filePath, localstorageJSPrefix);
          }
        },
        localstorageIndex:{
            src:'dist/index.html',
            editor:function(contents){
              return localStorageRewriteIndex(contents, {js:localstorageJSPrefix,css:localstorageCSSLocalPrefix,csscdn:localstorageCSSPrefix});
            }
        }<%if(seajs && usecombo){%>,
        dist: {
          src: 'dist/index.html',
          editor: function(contents) {
            return contents.replace(/<\!\-\-\{\{combo\}\}\-\->/ig,'<script type="text/javascript" src="script/app.combo.js"></script>');
          }
        }
      },
      combo: {
        dist:{
        options: {
          base:'/',
          destPath:'/',
          dest:'dist/script/app.combo.js'
          },
          files: [{
              expand: true,
              cwd: './',
              src: ['app/script/entry.js','app/script/home.js','app/script/about.js','app/script/contact.js']
          }]
        }
      }
    <%}else{%>
    }
    <%}%>
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function () {
    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      <%if(tmodjs){%>
      'tmod',
      <%}%>
      'jshint',
      'configureRewriteRules',
      <%if(backend){%>
      'rerun:conn',
      <%}else{%>
      'connect:livereload',
      <%}%>
      'watch'
    ]);
  });

  // grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
  //   grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
  //   grunt.task.run(['serve:' + target]);
  // });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    <%if(karma){%>
    'karma'
    <%}%>
  ]);


  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'autoprefixer',
    'useminPrepare',
    'concurrent:dist',
    'jshint',
    'concat',
    <%if(tmodjs){%>
    'tmod',
    <%}%>
    <%if(useangular){%>
    'ngAnnotate',
    <%}%>
    'copy:dist',
    <%if(seajs && usecombo){%>
    'combo',
    'rewrite:dist',
    <%}%>
    
    'cssmin',
    'usemin',
    'cdnify'
  ]);

  grunt.registerTask('buildmin', [
    'clean:dist',
    'wiredep',
    'autoprefixer',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'jshint',
    'concat',
    <%if(tmodjs){%>
    'tmod',
    <%}%>
    <%if(useangular){%>
    'ngAnnotate',
    <%}%>
    'copy:dist',
    <%if(seajs && usecombo){%>
    'combo',
    'rewrite:dist',
    <%}%>
    
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'cdnify',
    'rewrite:localstorageScript',
    'rewrite:localstorageIndex',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
