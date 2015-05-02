angular.module('widgetGridDemo', ["widgetGrid"])
.controller('DemoController', function($timeout) {
  var vm = this;
  
  vm.columns = 12;
  vm.rows = 8;
  
  vm.widgets = [{
    position: {
      top: 3,
      left: 3,
      height: 4,
      width: 4
    },
    color: '#981254'
  },{
    position: {
      top: 1,
      left: 2,
      height: 1,
      width: 1
    },
    color: '#ef4512'
  }];
  
  function updateGridSize() {
    $timeout(function () {
      var grid = document.getElementById('demo-grid');
      vm.gridWidth = grid.clientWidth;
      vm.gridHeight = grid.clientHeight;
    });
  }
  updateGridSize();
  window.onresize = updateGridSize;
});