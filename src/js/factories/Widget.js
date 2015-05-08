/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {
  var DEFAULT_WIDTH = 1,
      DEFAULT_HEIGHT = 1,
      DEFAULT_TOP = 0,
      DEFAULT_LEFT = 0;
  
  angular.module('widgetGrid').factory('Widget', ['gridUtil', function (gridUtil) {
    var Widget = function Widget(options) {
      this.id = gridUtil.getUID();
      
      options = options || {};
      
      this.width = parseInt(options.width) || DEFAULT_WIDTH;
      this.height = parseInt(options.height) || DEFAULT_HEIGHT;
      
      this.top = parseInt(options.top) || DEFAULT_TOP;
      this.left = parseInt(options.left) || DEFAULT_LEFT;
      
      this.style = {};
    };
    
    return Widget;
  }]);
})();