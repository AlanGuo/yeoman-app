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
		      		'bootstrap',
		      		'confui',
		      		'spaseed'
		      	]
		      },function(answers3){
		      	options.plugins = answers3;

		      	//如果选择的seajs
		      	if(options.plugins.pluginlist.indexOf('seajs') > -1){

		      		this.prompt({
				      type    : 'confirm',
				      name    : 'usecombo',
				      message : 'Use seajs combo?',
				      default : false // Default to current folder name
				    }, function (answers4) {
				    	options.usecombo = answers4.usecombo;
				    	done();
				    });
				    
		      	}else{
		      		done();
		      	}

		      }.bind(this));
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
		this.template('app/index.html','app/index.html',options);
		this.src.copy('app/favicon.ico','app/favicon.ico',true);

		//css
		var pluginlist = options.plugins.pluginlist;
		if(pluginlist.indexOf('compass')>-1){
			this.src.copy('app/style/main.scss','app/style/main.scss',true);
		}
		else{
			this.src.copy('app/style/main.css','app/style/main.css',true);
		}

		//image
		this.src.copy('app/image/yeoman.png','app/image/yeoman.png',true);

		if(!options.useangular && pluginlist.indexOf('seajs')==-1){
			//javascript
			this.template('app/script/global/entry.js','app/script/entry.js',options);
			this.template('app/script/global/event.js','app/script/event.js',options);
			this.template('app/script/global/router.js','app/script/router.js',options);
			this.template('app/script/global/app.js','app/script/app.js',options);
			this.template('app/script/global/home.js','app/script/home.js',options);
			this.template('app/script/global/about.js','app/script/about.js',options);
			this.template('app/script/global/contact.js','app/script/contact.js',options);
		}
		else if(!options.useangular && pluginlist.indexOf('seajs')>-1){
			//javascript
			this.template('app/script/seajs/entry.js','app/script/entry.js',options);
			this.template('app/script/seajs/event.js','app/script/event.js',options);
			this.template('app/script/seajs/router.js','app/script/router.js',options);
			this.template('app/script/seajs/app.js','app/script/app.js',options);
			this.template('app/script/seajs/home.js','app/script/home.js',options);
			this.template('app/script/seajs/about.js','app/script/about.js',options);
			this.template('app/script/seajs/contact.js','app/script/contact.js',options);
		}

		if(pluginlist.indexOf('tmodjs')>-1){
			this.src.copy('view/home.html','view/home.html',true);
			this.src.copy('view/contact.html','view/contact.html',true);
			this.src.copy('view/about.html','view/about.html',true);
		}

		//test
		this.src.copy('test/.jshintrc','test/.jshintrc',true);
		this.src.copy('test/karma.conf.js','test/karma.conf.js',true);
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
		    "load-grunt-tasks",
		    "time-grunt",
		    "karma-jasmine",
		    "karma-phantomjs-launcher"
		];
		var bowerPackage = [];

		var pluginlist = options.plugins.pluginlist;
		if(pluginlist.indexOf('compass')>-1){
			//compass
			npmPackage.unshift('grunt-contrib-compass');
		}
		if(pluginlist.indexOf('tmodjs')>-1){
			//tmodjs
			npmPackage.unshift('grunt-alan-tmod');
		}
		if(pluginlist.indexOf('bootstrap')>-1){
			//bootstrap
			bowerPackage.push('bootstrap');
		}
		if(pluginlist.indexOf('confui')>-1){
			//confui
			bowerPackage.push('confui');
		}
		if(pluginlist.indexOf('seajs')>-1){
			//seajs
			npmPackage.push('grunt-seajs-combo');
			npmPackage.push('grunt-rewrite');
		}

		this.log('you can run "npm install & bower install & spm install" to install dependencies.');

		this.npmInstall(npmPackage, { 'saveDev': true });
		this.bowerInstall(bowerPackage, { 'save': true });
	},

	end:function(){
		
	}
});