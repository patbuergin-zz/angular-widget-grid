angular.module('widgetGridDemo', ["widgetGrid"])
.controller('DemoController', function($timeout, $sce) {
  var vm = this;
  
  vm.columns = 12;
  vm.rows = 8;
  
  vm.editable = false;
  
  vm.widgets = [{
    position: { top: 1, height: 4, left: 1, width: 5 },
    inner: $sce.trustAsHtml(
      '<div class="demo-widget-container" style="background-color: #981254;">' +
        '<h1 class="demo-widget-title">TODO</h1>' + 
      '</div>'
    )
  },{
    position: { top: 5, height: 4, left: 6, width: 7 },
    inner: $sce.trustAsHtml(
      '<div class="demo-widget-container" style="overflow: hidden">' +
       '<iframe frameborder="0" height="100%" width="100%" ' +
         'src="https://youtube.com/embed/V9tmsIbi4Kw?autoplay=0&controls=0&showinfo=0&autohide=1">' +
       '</iframe>' +
      '</div>'
    )
  },{
    position: { top: 8, height: 1, left: 3, width: 3 },
    inner: $sce.trustAsHtml(
      '<div class="demo-widget-container" style="background-color: #7C0BA5;">' +
        '<h1 class="demo-widget-title">Hi</h1>' + 
      '</div>'
    )
  },{
    position: { top: 1, height: 2, left: 7, width: 3 },
    inner: $sce.trustAsHtml(
      '<div class="demo-widget-container" style="background-color: #A5220B;">' +
        '<h1 class="demo-widget-title">Hi</h1>' +
      '</div>'
    )
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
