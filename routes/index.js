const router = require('koa-router')()
const urllib = require('urllib')

const url = 'https://api.github.com/users/github'

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  let data = await getRank()

  ctx.body = {
    data
  }
})

router.get('/manage', async (ctx, next) => {
  await ctx.render('manage.html', {
    title: 'manage'
  })
})

// 获取数据
async function getRank () {
  let {data} = await urllib.request(url, {dataType: 'json', method: 'GET'}) || {}
  return data
}

module.exports = router
