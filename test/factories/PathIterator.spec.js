/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/* global inject */

describe('PathIterator', function () {
  beforeEach(module('widgetGrid'));
  
  var GridPosition, PathIterator;
  
  beforeEach(inject(function (_GridPosition_, _PathIterator_) {
    GridPosition = _GridPosition_;
    PathIterator = _PathIterator_;
  }));

  it('yields exactly one value if startPos equals endPos', function () {
    var start = new GridPosition(4, 9);
    var end = new GridPosition(4, 9);
    var iter = new PathIterator(start, end);
    
    expect(iter.hasNext()).toBe(true);
    var next = iter.next();
    expect(next).toEqual(end);
    expect(iter.hasNext()).toBe(false);
    next = iter.next();
    expect(next).toBeNull();
  });
  
  it('yields a linear path from start to end when passed positions that share a coordinate', function () {
    var start = new GridPosition(4, 12);
    var end = new GridPosition(4, 9);
    var iter = new PathIterator(start, end);
    expect(iter.hasNext()).toBe(true);
    expect(iter.next()).toEqual(new GridPosition(4, 12));
    expect(iter.next()).toEqual(new GridPosition(4, 11));
    expect(iter.next()).toEqual(new GridPosition(4, 10));
    expect(iter.next()).toEqual(new GridPosition(4, 9));
    expect(iter.next()).toBeNull();

    start = new GridPosition(4, 8);
    iter = new PathIterator(start, end);
    expect(iter.next()).toEqual(new GridPosition(4, 8));
    expect(iter.next()).toEqual(new GridPosition(4, 9));
    expect(iter.next()).toBeNull();

    start = new GridPosition(6, 9);
    iter = new PathIterator(start, end);
    expect(iter.next()).toEqual(new GridPosition(6, 9));
    expect(iter.next()).toEqual(new GridPosition(5, 9));
    expect(iter.next()).toEqual(new GridPosition(4, 9));
    expect(iter.next()).toBeNull();
    
    start = new GridPosition(2, 9);
    iter = new PathIterator(start, end);
    expect(iter.next()).toEqual(new GridPosition(2, 9));
    expect(iter.next()).toEqual(new GridPosition(3, 9));
    expect(iter.next()).toEqual(new GridPosition(4, 9));
    expect(iter.next()).toBeNull();
  });
  
  it('yields diagonal paths if applicable', function () {
    var start = new GridPosition(7, 12);
    var end = new GridPosition(4, 9);
    var iter = new PathIterator(start, end);
    expect(iter.hasNext()).toBe(true);
    expect(iter.next()).toEqual(new GridPosition(7, 12));
    expect(iter.next()).toEqual(new GridPosition(6, 11));
    expect(iter.next()).toEqual(new GridPosition(5, 10));
    expect(iter.next()).toEqual(new GridPosition(4, 9));
    expect(iter.next()).toBeNull();

    start = new GridPosition(9, 8);
    iter = new PathIterator(start, end);
    expect(iter.next()).toEqual(new GridPosition(9, 8));
    expect(iter.next()).toEqual(new GridPosition(8, 8));
    expect(iter.next()).toEqual(new GridPosition(7, 8));
    expect(iter.next()).toEqual(new GridPosition(6, 9));
    expect(iter.next()).toEqual(new GridPosition(5, 9));
    expect(iter.next()).toEqual(new GridPosition(4, 9));
    expect(iter.next()).toBeNull();

    start = new GridPosition(3, 6);
    iter = new PathIterator(start, end);
    expect(iter.next()).toEqual(new GridPosition(3, 6));
    expect(iter.next()).toEqual(new GridPosition(3, 7));
    expect(iter.next()).toEqual(new GridPosition(4, 8));
    expect(iter.next()).toEqual(new GridPosition(4, 9));
    expect(iter.next()).toBeNull();

    start = new GridPosition(1, 10);
    iter = new PathIterator(start, end);
    expect(iter.next()).toEqual(new GridPosition(1, 10));
    expect(iter.next()).toEqual(new GridPosition(2, 10));
    expect(iter.next()).toEqual(new GridPosition(3, 9));
    expect(iter.next()).toEqual(new GridPosition(4, 9));
    expect(iter.next()).toBeNull();
  });
});
