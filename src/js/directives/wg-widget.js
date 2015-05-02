(function () {
  var DEFAULT_WIDTH = 1,
      DEFAULT_HEIGHT = 1,
      DEFAULT_TOP = 0,
      DEFAULT_LEFT = 0;
  
  angular.module('widgetGrid').controller('wgWidgetController', function($scope) {
    var self = this;
    
    self.width = parseInt($scope.position.width) || DEFAULT_WIDTH;
    self.height = parseInt($scope.position.height) || DEFAULT_HEIGHT;
    
    self.top = parseInt($scope.position.top) || DEFAULT_TOP;
    self.left = parseInt($scope.position.left) || DEFAULT_LEFT;
    
    self.style = {};
  });
  
  angular.module('widgetGrid').directive('wgWidget', widgetDirective);
  function widgetDirective() {
    return {
      scope: {
        position: '=position'
      },
      restrict: 'E',
      controller: 'wgWidgetController',
      controllerAs: 'widget',
      require: '^wgGrid',
      transclude: true,
      replace: true,
      link: function (scope, element, attrs, gridCtrl) {
        gridCtrl.addWidget(scope.widget);
      },
      template: '<div class="wg-widget" ng-style="widget.style" ng-transclude></div>'
    };
  }
})();
