'use strict';

define(function (require, exports, module) {
    var $ = require('$');
    var template = require('template');
    var asyncRequest = require('asyncrequest');
    var request = require('request');
    var stats = require('stats');
    var View = require('View');

    var About = View.extend({
        $elem:$('#body-container'),
        title: 'about',

        render: function () {
        	stats.trackEvent('page', 'view', 'pageName','#/about');
            this.$elem.html(template('about',{}));
        }

        destroy: function () {
        }
    });
        
    module.exports = About;
});