const router = require('koa-router')()
const qiniu = require('qiniu')
router.prefix('/users')


router.get('/qiniu', async (ctx, next) => {
  const bucket = 'cancan'
  const accessKey = '2LC7KPjwnYdcfXbUZVcbhscpwo3iV3WS8rWrNoz3'
  const secretKey = 'SXrdqdvo9nkKQ2SxaJkwbXfVnrs2XXYlS1-YlnBp'

  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const policyParams = { scope: bucket }
  const putPolicy = new qiniu.rs.PutPolicy(policyParams);
  const uploadToken = putPolicy.uploadToken(mac);
  ctx.body = uploadToken
})

module.exports = router