# angular-widget-grid
A flexible grid layout for responsive dashboards

#### Demo: http://patbuergin.github.io/angular-widget-grid/

## Installation
Install with [Bower](http://bower.io/):

```sh
$ bower install angular-widget-grid
```

Add `<script>` and `<link>` tags to your `index.html`:

```html
<link rel="stylesheet" href="bower_components/angular-widget-grid/angular-widget-grid.css">
<script src="bower_components/angular-widget-grid/angular-widget-grid.min.js"></script>
```

Add the angular-widget-grid module as a dependency to your application module:

```javascript
angular.module('myApp', ['widgetGrid']);
```

## Usage
#### Minimal Example
```html
<wg-grid columns="20" rows="15" style="width: 400px; height: 300px;">
  <wg-widget position="{ top: 2, left: 4, height: 6, width: 8 }">
    <div style="background-color: rgb(140, 198, 0);"></div>
  </wg-widget>
</wg-grid>
```
![Minimal Example](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-1.png)

### Adding Traits
#### Widgets
##### `wg-movable`
```html
<wg-widget wg-movable editable="true" position="[...]">
```
If `editable` is true, users will be able to move the respective widget.

![Moving Widgets](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-2.png)

##### `wg-resizable`
```html
<wg-widget wg-resizable editable="true" position="[...]">
```
If `editable` is true, users will be able to resize the respective widget.

![Resizing Widgets](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-3.png)

Optionally, you can limit the resize directions: 
```html
<wg-widget wg-resizable="{ directions: ['NW', 'NE', 'E', 'SW'] }" ...>
```

![Restricted Resizing](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-4.png)

#### Grid: Options
##### `showGrid` (default: `false`)  
```html
<wg-grid columns="20" rows="15" options="{ showGrid: true }">
```
Shows the grid's structure and provides visual feedback when resizing or moving widgets.

![Feedback on Resize (1/2)](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-5.png)
![Feedback on Resize (2/2)](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-6.png)

##### `highlightNextPosition` (default: `false`)
```html
<wg-grid columns="20" rows="15" options="{ highlightNextPosition: true }">
```
Highlights the largest free area in the grid, if any. This area will be automatically assigned to the next widget with an empty or conflicting position.

![Highlight Next Position (1/2)](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-7.png)
![Highlight Next Position (2/2)](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-8.png)

### Events
##### `wg-grid-full` & `wg-grid-space-available`
The grid emits `wg-grid-full` and `wg-grid-space-available` in the respective situations, so that you can e.g. enable/disable UI elements accordingly.

```js
$scope.$on('wg-grid-full', function () {
  // e.g. disable something
});
```