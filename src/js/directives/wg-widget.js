(function () {
  angular.module('widgetGrid').controller('wgWidgetController', ['$scope', '$compile', 'Widget', function($scope, $compile, Widget) {
    var self = this;
    var widgetOptions = $scope.position;
    
    self.editable = false;
    self.widget = new Widget(widgetOptions);
    
    self.innerCompile = function (element) {
      $compile(element)($scope);
    };
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
      templateUrl: 'wg-widget',
      link: {
        post: function (scope, element, attrs, gridCtrl) {
          gridCtrl.addWidget(scope.widgetCtrl.widget);
          attrs.$observe('editable', function (newVal) {
            scope.widgetCtrl.editable = newVal === 'true';
          });
        }
      }
    };
  }
})();
