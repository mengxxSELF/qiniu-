const router = require('koa-router')()
const fs = require('fs')
const qiniu = require('qiniu')
router.prefix('/users')

const bucket = 'cancan'
const accessKey = '2LC7KPjwnYdcxxx'
const secretKey = 'SXrdqdvoxxx'
const domain = 'http://pqxxx'

function get_token () {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const policyParams = { scope: bucket }
  const putPolicy = new qiniu.rs.PutPolicy(policyParams);
  const uploadToken = putPolicy.uploadToken(mac);
  return uploadToken
}


router.post('/upload', async (ctx) => {
  // 获取到上传到服务器的文件信息
  const { img } = ctx.request.files
  // path 拿到地址
  const { path } = img

  // key 是给图片的命名
  const key = Math.random() * 100 + '.png'

  const result = await uploadFile(path, key)

  // 删除临时文件
  fs.unlink(path, (err) => {
    if (err) throw err;
    console.log('文件已删除', path);
  })

  ctx.body = result
})
 
router.get('/qiniu', async (ctx) => {
  const uploadToken = get_token()
  ctx.body = uploadToken
})


async function uploadFile(localFile, key) {
  const uploadToken = get_token()

  const config = new qiniu.conf.Config();
  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z0;

  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  return new Promise((resolve, reject) => {
    // 文件上传
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject('error')
      }
      if (respInfo.statusCode == 200) {
        // console.log(respBody);
        const { key } = respBody
        resolve(`${domain}/${key}`)
      } 
    });
  })
}

module.exports = router
