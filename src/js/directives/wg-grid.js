(function () {
	'use strict';
	
	angular.module('widgetGrid').controller('wgGridController', function() {
		var self = this;
	});
	
	angular.module('widgetGrid').directive('wgGrid', gridDirective);
	function gridDirective() {
		return {
			scope: { wgGrid: '=' },
			controller: 'wgGridController',
			compile: function () {
				return {};
			}
		};
	}
})();