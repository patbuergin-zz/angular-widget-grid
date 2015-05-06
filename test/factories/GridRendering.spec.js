/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/* global inject */

describe('GridRendering', function () {
  beforeEach(module('widgetGrid'));
  
  var GridRendering, Grid, Widget;
  var minGrid, medGrid;
  
  beforeEach(inject(function (_GridRendering_, _Grid_, _Widget_) {
    GridRendering = _GridRendering_;
    Grid = _Grid_;
    Widget = _Widget_;
    
    minGrid = new Grid({ columns: 1, rows: 1 });
    medGrid = new Grid({ columns: 12, rows: 8 });
  }));
  
  describe('#rasterizeCoords', function () {
    it('returns the closest cell when passed coords within the grid container', function () {
      var rendering = new GridRendering(minGrid, {});
      expect(rendering.rasterizeCoords(1, 1, 1, 1)).toEqual({ i: 1, j: 1 });
      
      rendering = new GridRendering(new Grid({ columns: 2, rows: 2 }), {});
      expect(rendering.rasterizeCoords(1, 1, 2, 2)).toEqual({ i: 1, j: 1 });
      expect(rendering.rasterizeCoords(2, 1, 2, 2)).toEqual({ i: 1, j: 2 });
      expect(rendering.rasterizeCoords(1, 2, 2, 2)).toEqual({ i: 2, j: 1 });
      expect(rendering.rasterizeCoords(2, 2, 2, 2)).toEqual({ i: 2, j: 2 });
    });
    
    it('returns the closest cell when passed a coords that exceed the width and/or the height of the container', function () {
      var rendering = new GridRendering(medGrid, {});
      expect(rendering.rasterizeCoords(4200, 1337, 1200, 800)).toEqual({ i: 8, j: 12 });
      expect(rendering.rasterizeCoords(650, 1337, 1200, 800)).toEqual({ i: 8, j: 7 });
      expect(rendering.rasterizeCoords(-1, 333, 1200, 800)).toEqual({ i: 4, j: 1 });
      expect(rendering.rasterizeCoords(150, -1, 1200, 800)).toEqual({ i: 1, j: 2 });
    });
  });
  
  describe('#getWidgetIdAt', function () {
    it('returns the respective widget when the coords hit one, else null', function () {
      var p1 = { top: 1, height: 4, left: 1, width: 5 };
      var p2 = { top: 5, height: 4, left: 6, width: 7 };
      var w1 = new Widget(p1);
      var w2 = new Widget(p2);
      medGrid.add(w1);
      medGrid.add(w2);
      
      var render = {};
      render[w1.id] = p1;
      render[w2.id] = p2;
      
      var rendering = new GridRendering(medGrid, render);
      
      expect(rendering.getWidgetIdAt(1, 1)).toEqual(w1.id);
      expect(rendering.getWidgetIdAt(4, 5)).toEqual(w1.id);
      expect(rendering.getWidgetIdAt(5, 6)).toEqual(w2.id);
      expect(rendering.getWidgetIdAt(6, 8)).toEqual(w2.id);
      expect(rendering.getWidgetIdAt(8, 12)).toEqual(w2.id);
      
      expect(rendering.getWidgetIdAt(4, 6)).toBeNull();
      expect(rendering.getWidgetIdAt(4, 12)).toBeNull();
      expect(rendering.getWidgetIdAt(5, 5)).toBeNull();
      expect(rendering.getWidgetIdAt(7, 3)).toBeNull();
      
      rendering = new GridRendering(minGrid, []);
      expect(rendering.getWidgetIdAt(1, 1)).toBeNull();
    });
    
    it('considers the renderedPositions, if they differ from the original ones', function () {
      var p1 = { top: 1, height: 4, left: 1, width: 5 };
      var p1Rendered = { top: 5, height: 4, left: 6, width: 7 };
      var w1 = new Widget(p1);
      medGrid.add(w1);
      
      var render = {};
      render[w1.id] = p1Rendered;
      
      var rendering = new GridRendering(medGrid, render);
      
      expect(rendering.getWidgetIdAt(1, 1)).toBeNull();
      expect(rendering.getWidgetIdAt(4, 5)).toBeNull();
      expect(rendering.getWidgetIdAt(5, 6)).toEqual(w1.id);
      expect(rendering.getWidgetIdAt(8, 12)).toEqual(w1.id);    
    });
  });
  
  describe('#isObstructed', function () {
    it('returns true when the coords hit a widget, else false', function () {
      var p1 = { top: 1, height: 4, left: 1, width: 5 };
      var p2 = { top: 5, height: 4, left: 6, width: 7 };
      var w1 = new Widget(p1);
      var w2 = new Widget(p2);
      medGrid.add(w1);
      medGrid.add(w2);
      
      var render = {};
      render[w1.id] = p1;
      render[w2.id] = p2;
      
      var rendering = new GridRendering(medGrid, render);
      expect(rendering.isObstructed(1, 1)).toBe(true);
      expect(rendering.isObstructed(4, 5)).toBe(true);
      expect(rendering.isObstructed(5, 6)).toBe(true);
      expect(rendering.isObstructed(6, 8)).toBe(true);
      expect(rendering.isObstructed(8, 12)).toBe(true);
      
      expect(rendering.isObstructed(4, 6)).toBe(false);
      expect(rendering.isObstructed(4, 12)).toBe(false);
      expect(rendering.isObstructed(5, 5)).toBe(false);
      expect(rendering.isObstructed(7, 3)).toBe(false);
      
      rendering = new GridRendering(minGrid, {});
      expect(rendering.isObstructed(1, 1)).toBe(false);
    });
    
    it('returns true when coords are not within the left, top, and/or right bounds of the grid', function () {
      var rendering = new GridRendering(medGrid, {});
      expect(rendering.isObstructed(9, 5)).toBe(false);
      expect(rendering.isObstructed(4, 13)).toBe(true);
      expect(rendering.isObstructed(0, 5)).toBe(true);
      expect(rendering.isObstructed(5, 0)).toBe(true);
    });
  });
  
  describe('#getStyle', function () {
    it('returns sane percentage values when passed sane data', function () {
      var grid = new Grid({ columns: 4, rows: 6 });
      var pos = { top: 2, left: 3, height: 4, width: 2 };
      var widget = new Widget(pos);
      grid.add(widget);
      
      var renderedPositions = {};
      renderedPositions[widget.id] = pos;
      var rendering = new GridRendering(grid, renderedPositions);
      
      var style = rendering.getStyle(widget.id);
      expect(style).toEqual({ top: '16.67%', height: '66.68%',  left: '50%', width: '50%' });
    });
  });
});
