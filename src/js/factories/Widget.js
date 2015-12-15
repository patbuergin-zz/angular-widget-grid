(function () {
  angular.module('widgetGrid').factory('Widget', function (gridUtil) {
    var Widget = function Widget(options) {
      this.id = gridUtil.getUID();
      this.style = {};

      options = options || {};
      this.top = parseInt(options.top) || 0;
      this.left = parseInt(options.left) || 0;
      this.width = parseInt(options.width) || 0;
      this.height = parseInt(options.height) || 0;
    };


    Widget.prototype.setPosition = function (position) {
      this.top =  angular.isNumber(position.top) ? position.top : this.top;
      this.left = angular.isNumber(position.left) ? position.left : this.left;
      this.height = angular.isNumber(position.height) ? position.height : this.height;
      this.width = angular.isNumber(position.width) ? position.width : this.width;
    };


    Widget.prototype.getPosition = function () {
      return {
        top: this.top,
        left: this.left,
        height: this.height,
        width: this.width
      };
    };

    return Widget;
  });
})();
