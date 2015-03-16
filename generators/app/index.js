var generators = require('yeoman-generator');
var options = {};

module.exports = generators.Base.extend({
	initializing:function(){
	},

	prompting:function(){
		//这里询问一些基础配置
		var done = this.async();
	    this.prompt({
	      type    : 'input',
	      name    : 'name',
	      message : 'Your project name',
	      default : this.appname // Default to current folder name
	    }, function (answers1) {
	      //是否使用angular
	      options.name = answers1.name;
		    this.prompt({
		      type    : 'confirm',
		      name    : 'useangular',
		      message : 'Use angular',
		      default : false // Default to current folder name
		    }, function (answers2) {
		      options.useangular = answers2.useangular;
		      //其他组件
		      this.prompt({
		      	type:'checkbox',
		      	name:'pluginlist',
		      	message:'Other plugins you may need',
		      	choices:[
		      		'seajs',
		      		'compass',
		      		'tmodjs',
		      		'confui',
		      		'spaseed'
		      	]
		      },function(answers3){
		      	options.plugins = answers3;
		      	done();
		      });
		    }.bind(this));
	    }.bind(this));
	},

	configuring:function(){
		//配置目录
		this.mkdir('app');
		if(!options.useangular){
			//no angular
			this.mkdir('app/script');
			this.mkdir('app/style');
			this.mkdir('app/view');
			this.mkdir('app/image');
		}
		else{
			//angular
		}
		this.mkdir('bower_components');
		this.mkdir('test');
		this.mkdir('dist');
	},

	writing:function(){
		console.log(options)
		this.template('package.json','package.json',options);
		this.template('bower.json','bower.json',options);
		this.template('Gruntfile.js','Gruntfile.js',options);
		this.src.copy('.jshintrc','.jshintrc',true);

		//复制首页文件
		this.src.copy('app/index.html','app/index.html',true);
		this.src.copy('app/favicon.ico','app/favicon.ico',true);
	},

	install:function(){
		var npmPackage = [
			"connect-livereload",
		    "grunt",
		    "grunt-autoprefixer",
		    "grunt-concurrent",
		    "grunt-connect-rewrite",
		    "grunt-connect-proxy",
		    "grunt-contrib-clean",
		    "grunt-contrib-concat",
		    "grunt-contrib-connect",
		    "grunt-contrib-copy",
		    "grunt-contrib-cssmin",
		    "grunt-contrib-htmlmin",
		    "grunt-contrib-imagemin",
		    "grunt-contrib-jshint",
		    "grunt-contrib-uglify",
		    "grunt-contrib-watch",
		    "grunt-filerev",
		    "grunt-ftpush",
		    "grunt-qc-cdnify",
		    "grunt-karma",
		    "grunt-livereload",
		    "grunt-newer",
		    "grunt-svgmin",
		    "grunt-usemin",
		    "grunt-wiredep",
		    "jshint-stylish",
		    "karma-jasmine",
		    "karma-phantomjs-launcher",
		    "load-grunt-tasks",
		    "time-grunt"
		];
		var bowerPackage = [];

		var pluginlist = options.plugins.pluginlist;
		if(pluginlist.indexOf('compass')>-1){
			//compass
			npmPackage.push("grunt-contrib-compass");
		}
		if(pluginlist.indexOf('tmodjs')>-1){
			//tmodjs
			npmPackage.push("grunt-alan-tmod");
		}
		this.npmInstall(npmPackage, { 'saveDev': true });
	},

	end:function(){
		
	}
});