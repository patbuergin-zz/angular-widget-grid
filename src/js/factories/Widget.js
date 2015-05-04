/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {
  var DEFAULT_WIDTH = 1,
      DEFAULT_HEIGHT = 1,
      DEFAULT_TOP = 0,
      DEFAULT_LEFT = 0;
  
  angular.module('widgetGrid').factory('Widget', ['gridUtil', function (gridUtil) {
    var Widget = function Widget(options) {
      var self = this;
      
      self.id = gridUtil.getUID();
      
      options = options || {};
      
      self.width = parseInt(options.width) || DEFAULT_WIDTH;
      self.height = parseInt(options.height) || DEFAULT_HEIGHT;
      
      self.top = parseInt(options.top) || DEFAULT_TOP;
      self.left = parseInt(options.left) || DEFAULT_LEFT;
      
      self.style = {};
    };
    
    return Widget;
  }]);
})();