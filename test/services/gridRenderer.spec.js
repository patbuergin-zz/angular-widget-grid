/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/* global inject */

describe('gridRenderer', function () {
  beforeEach(module('widgetGrid'));
  
  var gridRenderer, Grid, GridRendering, Widget;
  
  beforeEach(inject(function (_gridRenderer_, _Grid_, _GridRendering_, _Widget_) {
    gridRenderer = _gridRenderer_;
    Grid = _Grid_;
    GridRendering = _GridRendering_;
    Widget = _Widget_;
  }));
  
  describe('#render', function () {
    var xsGrid, smGrid, mdGrid, p1, p2, p3, p4, w1, w2, w3, w4;
    
    beforeEach(function () {
      xsGrid = new Grid({ columns: 5, rows: 6 });
      smGrid = new Grid({ columns: 8, rows: 8 });
      mdGrid = new Grid({ columns: 12, rows: 8 });
      p1 = { top: 1, height: 4, left: 1, width: 5 };
      p2 = { top: 5, height: 4, left: 6, width: 7 };
      p3 = { top: 8, height: 1, left: 3, width: 3 };
      p4 = { top: 1, height: 2, left: 7, width: 3 };
      w1 = new Widget(p1);
      w2 = new Widget(p2);
      w3 = new Widget(p3);
      w4 = new Widget(p4);
    });
    
    it('returns an empty GridRendering when passed an empty/no grid', function () {
      var grid = new Grid({ columns: 2, rows: 2 });
      expect(gridRenderer.render(grid).positions).toEqual({});
      expect(gridRenderer.render().positions).toEqual({});
    });
    
    it('adopts the original positioning if there are no conflicts', function () {
      mdGrid.add(w1);
      mdGrid.add(w2);
      mdGrid.add(w3);
      mdGrid.add(w4);
      
      var positions = gridRenderer.render(mdGrid).positions;
      expect(positions[w1.id]).toEqual(p1);
      expect(positions[w2.id]).toEqual(p2);
      expect(positions[w3.id]).toEqual(p3);
      expect(positions[w4.id]).toEqual(p4);
    });
    
    it('moves overlapping widgets left-to-right, top-to-bottom', function () {
      var minGrid = new Grid({ columns: 2, rows: 2 });
      var ov1 = new Widget({ top: 1, height: 1, left: 1, width: 1 });
      var ov2 = new Widget({ top: 1, height: 1, left: 1, width: 1 });
      var ov3 = new Widget({ top: 1, height: 1, left: 1, width: 1 });
      minGrid.add(ov1);
      minGrid.add(ov2);
      minGrid.add(ov3);
      
      var positions = gridRenderer.render(minGrid).positions;
      expect(positions[ov1.id]).toEqual({ top: 1, height: 1, left: 1, width: 1 });
      expect(positions[ov2.id]).toEqual({ top: 1, height: 1, left: 2, width: 1 });
      expect(positions[ov3.id]).toEqual({ top: 2, height: 1, left: 1, width: 1 });
    });
    
    it('extends the effective grid vertically, if necessary', function () {
      var minGrid = new Grid({ columns: 2, rows: 1 });
      var ov1 = new Widget({ top: 1, height: 1, left: 1, width: 2 });
      var ov2 = new Widget({ top: 1, height: 1, left: 1, width: 1 });
      minGrid.add(ov1);
      minGrid.add(ov2);
      
      var positions = gridRenderer.render(minGrid).positions;
      expect(positions[ov1.id]).toEqual({ top: 1, height: 1, left: 1, width: 2 });
      expect(positions[ov2.id]).toEqual({ top: 2, height: 1, left: 1, width: 1 });
    });
    
    it('evenly scales widgets whose width exceeds the width of the grid', function () {
      xsGrid.add(w2);
      var positions = gridRenderer.render(xsGrid).positions;
      // (height 4, width 7) + container width 5 => (height 3, width 5)
      expect(positions[w2.id]).toEqual({ top: 1, height: 3, left: 1, width: 5 });
    });
    
    it('considers a minimum height of 1 when scaling widgets', function () {
      var minGrid = new Grid({ columns: 1, rows: 1 });
      var widget = new Widget({ top: 42, left: 777, width: 9001, height: 1 });
      minGrid.add(widget);
      var positions = gridRenderer.render(minGrid).positions;
      expect(positions[widget.id]).toEqual({ top: 1, height: 1, left: 1, width: 1 });
    });
    
    it('considers the current row when searching for a free slot', function () {
      smGrid.add(w1);
      smGrid.add(w4);
      var positions = gridRenderer.render(smGrid).positions;
      expect(positions[w4.id]).toEqual({ top: 1, height: 2, left: 6, width: 3 });
    });
    
    it('prioritizes elements top-to-bottom, left-to-right', function () {
      xsGrid.add(w1);
      xsGrid.add(w2);
      xsGrid.add(w3);
      xsGrid.add(w4);
      
      // expected rendering order: w1 (1,1), w4 (1,7), w2 (5,6), w3 (8,3)
      var positions = gridRenderer.render(xsGrid).positions;
      expect(positions[w1.id]).toEqual({ top: 1, height: 4, left: 1, width: 5 });
      expect(positions[w4.id]).toEqual({ top: 5, height: 2, left: 1, width: 3 });
      expect(positions[w2.id]).toEqual({ top: 7, height: 3, left: 1, width: 5 });
      expect(positions[w3.id]).toEqual({ top: 10, height: 1, left: 1, width: 3 });
    });
    
    it('does not change the passed grid object', function () {
      mdGrid.add(w1);
      mdGrid.add(w2);
      mdGrid.add(w3);
      
      expect(_).toBeDefined();
      var gridClone = _.cloneDeep(mdGrid);
      
      var rendering = gridRenderer.render(mdGrid);
      expect(rendering).toBeDefined();
      expect(JSON.stringify(mdGrid)).toEqual(JSON.stringify(gridClone));
    }); 
  });
});
