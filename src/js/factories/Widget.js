/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {
  var DEFAULT_WIDTH = 1,
      DEFAULT_HEIGHT = 1,
      DEFAULT_TOP = 0,
      DEFAULT_LEFT = 0;
  
  angular.module('widgetGrid').factory('Widget', [function () {
    var Widget = function Widget(options) {
      var self = this;
      
      self.width = parseInt(options.position.width) || DEFAULT_WIDTH;
      self.height = parseInt(options.position.height) || DEFAULT_HEIGHT;
      
      self.top = parseInt(options.position.top) || DEFAULT_TOP;
      self.left = parseInt(options.position.left) || DEFAULT_LEFT;
      
      self.style = {};
    };
    
    return Widget;
  }]);
})();