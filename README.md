# angular-widget-grid
A flexible grid layout for responsive dashboards

#### Demo: http://patbuergin.github.io/angular-widget-grid/

# Installation
1. `$ bower install angular-widget-grid`
2. include `bower_components/angular-widget-grid/angular-widget-grid.js` or `[...].min.js`
3. include `[...]/angular-widget-grid.css`

# Usage
#### Minimal Example
```html
<wg-grid columns="20" rows="15" style="width: 400px; height: 300px;">
  <wg-widget position="{ top: 2, left: 4, height: 6, width: 8 }">
    <div style="background-color: rgb(255, 190, 0);"/>
  </wg-widget>
</wg-widget>
```
![Minimal Example](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-1.png)
Please refer to `/demo` for a maximal example.

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

#### Grid
##### `show-grid`
```html
<wg-grid columns="20" rows="15" show-grid="true">
```
Shows the grid's structure and provides visual feedback when resizing or moving widgets.

![Feedback on Resize](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-4.png)
