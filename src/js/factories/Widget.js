(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.Widget
   * 
   * @description
   * Describes a widget container.
   * 
   * @requires widgetGrid.gridUtil
   */
  angular.module('widgetGrid').factory('Widget', function (gridUtil, GridArea) {
    /**
     * @ngdoc method
     * @name Widget
     * @methodOf widgetGrid.Widget
     * 
     * @description
     * Constructor.
     * 
     * @param {GridArea} gridArea Widget position
     */
    var Widget = function Widget(gridArea) {
      this.id = gridUtil.getUID();
      this.style = {};

      gridArea = gridArea || GridArea.empty;
      this.top = parseInt(gridArea.top) || 0;
      this.left = parseInt(gridArea.left) || 0;
      this.width = parseInt(gridArea.width) || 0;
      this.height = parseInt(gridArea.height) || 0;
    };


    /**
     * @ngdoc method
     * @name getPosition
     * @methodOf widgetGrid.Widget
     * 
     * @description
     * Gets the position of a widget.
     * 
     * @return {GridArea} Widget position
     */
    Widget.prototype.getPosition = function () {
      return new GridArea(this.top, this.left, this.height, this.width);
    };


    /**
     * @ngdoc method
     * @name setPosition
     * @methodOf widgetGrid.Widget
     * 
     * @description
     * Updates the position of a widget.
     * 
     * @param {GridArea} gridArea Widget position
     */
    Widget.prototype.setPosition = function (gridArea) {
      this.top =  angular.isNumber(gridArea.top) ? gridArea.top : this.top;
      this.left = angular.isNumber(gridArea.left) ? gridArea.left : this.left;
      this.width = angular.isNumber(gridArea.width) ? gridArea.width : this.width;
      this.height = angular.isNumber(gridArea.height) ? gridArea.height : this.height;
    };

    return Widget;
  });
})();
