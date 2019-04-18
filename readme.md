
![](https://user-gold-cdn.xitu.io/2019/4/18/16a2c2031196dda2?w=1168&h=364&f=png&s=218162)

项目中的例子涉及到的图片上传，都是将文件上传到服务器然后再去传到七牛空间，这种操作方式，相当于在自己的服务器做了一层中转站。开发者可以在中转站对图片做一些处理然后在传到七牛空间。但是有一些缺点

* 内存占用量增大

* 临时文件占用磁盘空间，需要每次上传之后需要进行文件删除

如果开发中不需要中转站，可以考虑直接从前端将图片上传到七牛空间

参考七牛的API文档，基本可以涉及到的是

* [上传凭证的生成](https://developer.qiniu.com/kodo/sdk/1289/nodejs#simple-uptoken)

* [前端文件上传](https://developer.qiniu.com/kodo/sdk/1283/javascript)

* [区域](https://developer.qiniu.com/kodo/manual/1671/region-endpoint)

* [上传策略参数设置](https://developer.qiniu.com/kodo/manual/1206/put-policy)

#### 获取上传凭证 token

[git](https://github.com/mengxxSELF/qiniu-/blob/master/routes/users.js)

```js
router.get('/qiniu', async (ctx, next) => {
  const bucket = 'activity'
  const accessKey = '2LCxxxrxxx'
  const secretKey = 'SXrdqdvxxx'

  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const policyParams = { scope: bucket }
  const putPolicy = new qiniu.rs.PutPolicy(policyParams);
  const uploadToken = putPolicy.uploadToken(mac);
  ctx.body = uploadToken
})
```

#### 前端上传代码

##### html

```html
<input type="file" />
```
#### js

* base64转 blob

```js
    function base64ToBlob(dataurl) { 
      var arr = dataurl.split(','), 
      mime = arr[0].match(/:(.*?);/)[1], 
      bstr = atob(arr[1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n); 
      while (n--) { 
        u8arr[n] = bstr.charCodeAt(n); 
      } 
      return new Blob([u8arr], { type: mime }); 
    }
```

* 基本参数

```js
// 这个token 就是 server接口返回的token
const token = '2LC7KTxxx'

const config = {
  useCdnDomain: true,
  region: qiniu.region.z1
};

const putExtra = {
  fname: "",
  params: {},
  mimeType: [] || null
};

```

* 核心上传

```js
const inputTarget = document.querySelector('input')
inputTarget.onchange = (data) => {
    const imgfile = inputTarget.files[0]
   
    const reader = new FileReader();
    reader.readAsDataURL(imgfile);
    reader.onload = function (e) {
      const urlData = this.result;
      const blobData = base64ToBlob(urlData)
      
      // 这里第一个参数的形式是blob
      const observable = qiniu.upload(blobData, 'filename.png', token, putExtra, config)
      
      const observer = {
        next(res) {console.log(res)},
        error(err) {console.log(err)},
        complete(res) {console.log(res)}
       }
       // 注册observer 对象
      observable.subscribe(observer)
    }
    
}
```


![result](https://user-gold-cdn.xitu.io/2019/4/18/16a2c16b3f762c32?w=1446&h=174&f=png&s=50909)

文件就可以被传到七牛了

可以看到这里返回的是一个hash和key，图片最后完整的访问路径，是你的七牛上配置的域名+key

在七牛创建一个新空间的话，会提供一个30天的免费域名可以使用


#### 遇到的坑

* cdnUphost 解析失败

![](https://user-gold-cdn.xitu.io/2019/4/18/16a2c18b6ee09296?w=1194&h=280&f=png&s=77757)


![](https://user-gold-cdn.xitu.io/2019/4/18/16a2c18deaf558fc?w=1172&h=158&f=png&s=58091)

原来是把

```js
 const config = {
    useCdnDomain: true,
    region: 'qiniu.region.z0'
 }
```
这里的region 写错了，不应是字符串，就是一个七牛的变量

```js
 const config = {
    useCdnDomain: true,
    region: qiniu.region.z0
 }
```
这个参数是取决于你的空间存储区域选择的是哪里

![](https://user-gold-cdn.xitu.io/2019/4/18/16a2c4a9d9d480f4?w=1694&h=284&f=png&s=64360)

对照文档 [区域](https://developer.qiniu.com/kodo/manual/1671/region-endpoint)  进行z0 z1的选择


* 图片上传之后却无法读取，显示已损坏

是因为第一次的时候，直接将 input的files[0] 值上传，但其实这个的格式是base64，而文档里对这个参数的要求是blob，所以记得这里需要转化一下文件格式


以前的demo写的一直失败就搁置了，今天重新跑了一次，再次吐槽七牛的文档，写的真是让人头大