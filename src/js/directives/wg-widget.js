(function () {
  angular.module('widgetGrid').controller('wgWidgetController', ['$scope', 'Widget', function($scope, Widget) {
    var self = this;
    
    var widgetOptions = {
      width: $scope.options.width,
      height: $scope.options.height,
      top: $scope.options.top,
      left: $scope.options.left
    };
    
    self.widget = new Widget(widgetOptions);
  }]);
  
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
