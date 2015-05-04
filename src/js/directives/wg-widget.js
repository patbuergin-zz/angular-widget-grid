(function () {
  angular.module('widgetGrid').controller('wgWidgetController', ['$scope', 'Widget', function($scope, Widget) {
    var self = this;
    
    var widgetOptions = $scope.position;
    
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
      controllerAs: 'widgetCtrl',
      require: '^wgGrid',
      transclude: true,
      replace: true,
      link: function (scope, element, attrs, gridCtrl) {
        gridCtrl.addWidget(scope.widgetCtrl.widget);
      },
      templateUrl: 'wg-widget'
    };
  }
})();
