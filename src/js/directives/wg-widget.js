(function () {
  angular.module('widgetGrid').controller('wgWidgetController', ['$scope', '$compile', 'Widget', function($scope, $compile) {    
    this.innerCompile = function (element) {
      $compile(element)($scope);
    };
  }]);
  
  angular.module('widgetGrid').directive('wgWidget', ['$compile', 'Widget', function ($compile, Widget) {
    return {
      scope: {
        position: '=',
        editable: '=?'
      },
      restrict: 'E',
      controller: 'wgWidgetController',
      require: '^wgGrid',
      transclude: true,
      replace: true,
      templateUrl: 'wg-widget',
      link: function (scope, element, attrs, gridCtrl) {
        var widgetOptions = scope.position;
        var widget = new Widget(widgetOptions);
        
        scope.editable = false;
        scope.widget = widget;
        
        scope.setWidgetPosition = function (position) {
          widget.setPosition(position);
          gridCtrl.updateWidget(widget);
          element.css(gridCtrl.getWidgetStyle(widget));
        };
        
        scope.$on('rendering-finished', function () {
          element.css(gridCtrl.getWidgetStyle(widget));
        });
        
        gridCtrl.addWidget(widget);
      }
    };
  }]);
})();
