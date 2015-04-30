(function () {
	'use strict';
	
	angular.module('widgetGrid').controller('wgWidgetController', function() {
		var self = this;
	});
	
	angular.module('widgetGrid').directive('wgWidget', widgetDirective);
	function widgetDirective() {
		return {
			scope: { wgGrid: '=' },
			controller: 'wgWidgetController',
			compile: function () {
				return {};
			}
		};
	}
})();