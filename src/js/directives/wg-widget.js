(function () {
  angular.module('widgetGrid').controller('wgWidgetController', function($scope, $compile) {
    this.innerCompile = function (element) {
      $compile(element)($scope);
    };
  });


  /**
   * @ngdoc directive
   * @name widgetGrid.wgWidget
   *
   * @description
   * Container for dashboard elements ("widgets").
   *
   * @restict AE
   * @requires widgetGrid.Widget
   */
  angular.module('widgetGrid').directive('wgWidget', function (Widget) {
    return {
      scope: {
        position: '=',
        editable: '@?'
      },
      restrict: 'AE',
      controller: 'wgWidgetController',
      require: '^wgGrid',
      transclude: true,
      templateUrl: 'wg-widget',
      replace: true,
      link: function (scope, element, attrs, gridCtrl) {
        var widget = new Widget(scope.position);

        scope.editable = 'false';
        scope.widget = widget;

        scope.setWidgetPosition = setWidgetPosition;

        scope.$watch('position', function(){
           setWidgetPosition(scope.position);
        }, true);

        scope.$on('wg-update-rendering', updateView);
        scope.$on('$destroy', function () {
          gridCtrl.removeWidget(widget);
        });

        gridCtrl.addWidget(widget);


        /**
         * @ngdoc method
         * @name setWidgetPosition
         * @methodOf widgetGrid.wgWidget
         *
         * @description
         * Updates the position of the associated widget instance, and updates the view.
         *
         * @param {GridArea} position Position
         * @return {GridRendering} Rendering
         */
        function setWidgetPosition(position) {
          var oldPosition = widget.getPosition();
          widget.setPosition(position);
          var newPosition = widget.getPosition();

          if (!angular.equals(oldPosition, newPosition)) {
            gridCtrl.updateWidget(widget);
          }
          updateView();
        }


        function updateView() {
          element.css(gridCtrl.getWidgetStyle(widget));
          scope.position = scope.position || {};
          angular.extend(scope.position, widget.getPosition());
        }
      }
    };
  });
})();
