# 9lon/gl-form
Element for [9lon](https://github.com/9lon).

## Browser Support
![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/edge/edge_48x48.png) |
--- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ |

## Installing
Using bower:

```bash
$ bower install glon-gl-form
```
#Getting started
```bash
<link rel="import" href="bower_components/gl-form/gl-form.html">
```
##or
```bash
<link rel="import" href="bower_components/gl-form/gl-form-dropdown-menu.html">
<link rel="import" href="bower_components/gl-form/gl-form-input.html">
<link rel="import" href="bower_components/gl-form/gl-form-textarea.html">
<link rel="import" href="bower_components/gl-form/gl-form-label-input.html">
<link rel="import" href="bower_components/gl-form/gl-form-label-textarea.html">
<link rel="import" href="bower_components/gl-form/gl-form-panel.html">
```
#gl-form-label-input , gl-form-label-textarea
![gl-form-label](http://i.imgur.com/z85U3Fn.png)
```bash
<gl-form-label-input label="label" value="value"></gl-form-label-input>
<gl-form-label-textarea label="label" value="value"></gl-form-label-textarea>
```
#gl-form-input , gl-form-textarea
![gl-form-input](http://i.imgur.com/JKBJjpK.png)
![gl-form-input](http://i.imgur.com/oc0t2gZ.png)

```bash
<gl-form-input label="Input label"></gl-form-input>
<gl-form-textarea label="Input label"></gl-form-textarea>
```
format-number 
```bash
<gl-form-input label="Input label" id="price" format-number="on"></gl-form-input> //12,344,231.1223 
<gl-form-textarea label="Input label" format-number="on"></gl-form-textarea>
```
function getValue 
```bash
this.$$('#price').getValue(); //12344231.1223 
```

#gl-form-dropdown-menu
![gl-form-dropdown-menu](http://i.imgur.com/PP6SHgd.png)
![gl-form-dropdown-menu](http://i.imgur.com/fm2Xjrt.png)

```bash
<gl-form-dropdown-menu label="ทดสอบ (dropdown menu)" auto-validate required>
  <paper-listbox class="dropdown-content">
      <paper-item value="ตัวอักษร">ตัวอักษร</paper-item>
      <paper-item value="ขนาด">ขนาด</paper-item>
      <paper-item value="สี">สี</paper-item>
      <paper-item value="ความถูกต้อง">ความถูกต้อง</paper-item>
  </paper-listbox>
</gl-form-dropdown-menu>
```
#gl-form-panel
![gl-form-panel] (http://i.imgur.com/7Mi41Pi.png)
```bash
  <gl-form-panel set-padding="10px 20px 10px 20px" set-border="1px">
        <gl-form-panel-head label="Header" set-padding="10px" set-border="1px">
            <!--content-->
        </gl-form-panel-head>
        <gl-form-panel-body label="Body" set-padding="10px" set-border="1px">
            <!--content-->
        </gl-form-panel-body>
        <gl-form-panel-footer label="Footer" set-padding="10px">
           <!--content-->
        </gl-form-panel-footer>
    </gl-form-panel>
```
