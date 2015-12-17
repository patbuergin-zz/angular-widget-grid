/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/* global inject */

describe('GridRendering', function () {
  beforeEach(module('widgetGrid'));
  
  var Grid, GridArea, GridRendering, GridPoint, Widget;
  var minGrid, medGrid;
  
  beforeEach(inject(function (_Grid_, _GridArea_, _GridRendering_, _GridPoint_, _Widget_) {
    Grid = _Grid_;
    GridArea = _GridArea_;
    GridRendering = _GridRendering_;
    GridPoint = _GridPoint_;
    Widget = _Widget_;
    
    minGrid = new Grid(1, 1);
    medGrid = new Grid(8, 12);
  }));
  
  describe('#rasterizeCoords', function () {
    it('returns the closest cell when passed coords within the grid container', function () {
      var rendering = new GridRendering(minGrid);
      expect(rendering.rasterizeCoords(0, 0, 1, 1)).toEqual(new GridPoint(1, 1));
      
      rendering = new GridRendering(new Grid(2, 2), {});
      expect(rendering.rasterizeCoords(0, 0, 2, 2)).toEqual(new GridPoint(1, 1));
      expect(rendering.rasterizeCoords(1, 0, 2, 2)).toEqual(new GridPoint(1, 2));
      expect(rendering.rasterizeCoords(0, 1, 2, 2)).toEqual(new GridPoint(2, 1));
      expect(rendering.rasterizeCoords(1, 1, 2, 2)).toEqual(new GridPoint(2, 2));
      
      rendering = new GridRendering(new Grid(3, 3), {});
      expect(rendering.rasterizeCoords(2, 3, 6, 6)).toEqual(new GridPoint(2, 2));
      expect(rendering.rasterizeCoords(200, 300, 600, 600)).toEqual(new GridPoint(2, 2));
      
      rendering = new GridRendering(medGrid, {});
      expect(rendering.rasterizeCoords(499, 399, 1200, 800)).toEqual(new GridPoint(4, 5));
      expect(rendering.rasterizeCoords(500, 400, 1200, 800)).toEqual(new GridPoint(5, 6));
    });
    
    it('returns the closest cell when passed a coords that exceed the width and/or the height of the container', function () {
      var rendering = new GridRendering(medGrid, {});
      expect(rendering.rasterizeCoords(4200, 1337, 1200, 800)).toEqual(new GridPoint(8, 12));
      expect(rendering.rasterizeCoords(650, 1337, 1200, 800)).toEqual(new GridPoint(8, 7));
      expect(rendering.rasterizeCoords(-1, 333, 1200, 800)).toEqual(new GridPoint(4, 1));
      expect(rendering.rasterizeCoords(150, -1, 1200, 800)).toEqual(new GridPoint(1, 2));
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
      
      var rendering = new GridRendering(medGrid);
      rendering.setWidgetPosition(w1.id, p1);
      rendering.setWidgetPosition(w2.id, p2);
      
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
      
      var rendering = new GridRendering(medGrid);
      rendering.setWidgetPosition(w1.id, p1Rendered);
      
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
      
      var rendering = new GridRendering(medGrid);
      rendering.setWidgetPosition(w1.id, p1);
      rendering.setWidgetPosition(w2.id, p2);
      
      rendering.printObstructions();
      
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
    
    it('returns true when coords are not the bounds of the grid', function () {
      var rendering = new GridRendering(medGrid, {});
      expect(rendering.isObstructed(9, 5)).toBe(true);
      expect(rendering.isObstructed(4, 13)).toBe(true);
      expect(rendering.isObstructed(0, 5)).toBe(true);
      expect(rendering.isObstructed(5, 0)).toBe(true);
    });
  });
  
  describe('#getStyle', function () {
    xit('returns sane percentage values when passed sane data', function () {
      var grid = new Grid({ columns: 4, rows: 6 });
      var pos = { top: 2, left: 3, height: 4, width: 2 };
      var widget = new Widget(pos);
      grid.add(widget);
      
      var rendering = new GridRendering(grid);
      rendering.setWidgetPosition(widget.id, pos);
      
      var style = rendering.getStyle(widget.id);
      expect(style).toEqual({ top: '16.6667%', height: '66.6668%',  left: '50%', width: '50%' });
    });
  });
  
  describe('#getNextPosition', function () {
    it('returns the position of the largest non-obstructed rectangular area in the grid', function () {
      var p1 = { top: 1, height: 4, left: 1, width: 5 };
      var p2 = { top: 5, height: 4, left: 6, width: 7 };
      var w1 = new Widget(p1);
      var w2 = new Widget(p2);
      medGrid.add(w1);
      medGrid.add(w2);
      
      var rendering = new GridRendering(medGrid);
      rendering.setWidgetPosition(w1.id, p1);
      rendering.setWidgetPosition(w2.id, p2);
      
      var nextPosition = rendering.getNextPosition();
      expect(nextPosition).toEqual(new GridArea(1, 6, 4, 7));
      
      var w3 = new Widget(nextPosition);
      medGrid.add(w3);
      rendering.setWidgetPosition(w3.id, nextPosition);
      
      nextPosition = rendering.getNextPosition();
      expect(nextPosition).toEqual(new GridArea(5, 1, 4, 5));
    });
    
    it('considers obstructions that are surrounded by free spots', function () {
      var p1 = { top: 1, height: 4, left: 1, width: 5 };
      var p2 = { top: 5, height: 4, left: 6, width: 7 };
      var p3 = { top: 3, height: 1, left: 9, width: 1 };
      var w1 = new Widget(p1);
      var w2 = new Widget(p2);
      var w3 = new Widget(p3);
      medGrid.add(w1);
      medGrid.add(w2);
      medGrid.add(w3);
      
      var rendering = new GridRendering(medGrid);
      rendering.setWidgetPosition(w1.id, p1);
      rendering.setWidgetPosition(w2.id, p2);
      rendering.setWidgetPosition(w3.id, p3);
      
      var nextPosition = rendering.getNextPosition();
      expect(nextPosition).toEqual(new GridArea(5, 1, 4, 5));
    });
    
    it('returns null if the grid is full', function () {
      var p1 = { top: 1, height: 8, left: 1, width: 12 };
      var w1 = new Widget(p1);
      medGrid.add(w1);
      
      var rendering = new GridRendering(medGrid);
      rendering.setWidgetPosition(w1.id, p1);
      
      var nextPosition = rendering.getNextPosition();
      expect(nextPosition).toBeNull();
    });
  });
});
