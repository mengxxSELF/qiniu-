const router = require('koa-router')()
const qiniu = require('qiniu')

const bucket = 'cancan'
const accessKey = '2LC7KPjwnYdcfXbUZVcbhscpwo3iV3WS8rWrNoz3'
const secretKey = 'SXrdqdvo9nkKQ2SxaJkwbXfVnrs2XXYlS1-YlnBp'
const domain = 'http://pq3smgjbr.bkt.clouddn.com'

function get_token() {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const policyParams = { scope: bucket }
  const putPolicy = new qiniu.rs.PutPolicy(policyParams);
  const uploadToken = putPolicy.uploadToken(mac);
  return uploadToken
}

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.post('/stream', async (ctx) => {
  const { file } = ctx.request.files
  const {path, name} = file
  console.log( 'path', name);
  ctx.body = { path }
  return

  if (!data) {
    ctx.body = 'error'
    return
  }
  console.log(data, 'data -- data -- data');

  // key 是给图片的命名
  const key = Math.random() * 100 + '.png'

  await uploadFile(data, key)

  ctx.body = 123
})

async function uploadFile(readableStream, key) {
  const uploadToken = get_token()

  const config = new qiniu.conf.Config();
  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z0;

  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  return new Promise((resolve, reject) => {
    // 文件上传
    formUploader.putStream(uploadToken, key, readableStream, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        throw respErr;
      }

      if (respInfo.statusCode == 200) {
        console.log(respBody);
        const { key } = respBody
        resolve(`${domain}/${key}`)
      } else {
        console.log(respInfo.statusCode);
        console.log(respBody);
      }
    });
  })
}




module.exports = router
