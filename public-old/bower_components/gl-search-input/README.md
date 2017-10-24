# \<gl-search-input\>


gl-search-input for web components

![alt text](http://i.imgur.com/oDFXoBX.png "gl-search-input")

## วิธีการติดตั้ง

```
$ bower install 9lon-gl-search-input --save
```
import ไฟล์gl-search-inputr ในหน้าที่่ต้องการใช้
```
 <link rel="import" href="bower_components/gl-search-input/gl-search-input.html">
```
มี 4 รูปแบบการค้นหาคือ
1. ใส่ชื่อ
2. ค้นหาตามประเภท
3. ค้นหาจากวันเริ่มต้น
4. ค้นหาถึงวันสุดท้าย

โดยถ้าจะใช้อันนั้นก็ส่งชื่อ แอดทิบิวข้างล่างไป แล้วส่งไปว่า true หรือ false
```
searchInput
searchInputType
searchData
```
true = ใช้ , false = ไม่ใช่งาน


## วิธีการใช้งาน

```
<gl-search-input result="{{result}}" search-data="true"></gl-search-input>
```
โดยค่าที่คืนกลับมาจะอยู่ในแอดทิบิวชื่อว่า result โดยจะต้องประกาศตัวแปรในการรับดังนี้
```
properties: {
          result: {
                    type: Object,
                    observer: '_result'
                 }
},
_result:function () {
    this.result;
},
```
เท่าที่ก็สามารถใช้งาน result ได้แล้ว
