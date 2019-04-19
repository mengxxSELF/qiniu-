const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const koaBody = require('koa-body')
const logger = require('koa-logger')
const cors = require('koa-cors');

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

function getUploadFileExt(name) {
  let ext = name.split('.');
  return ext[ext.length - 1];
}

// middlewares
app.use(json())
app.use(logger())
app.use(cors())
app.use(require('koa-static')(__dirname + '/public'))
app.use(koaBody({
  multipart: true,
  formidable: {
    // 设置上传文件大小最大限制，默认2M
    maxFileSize: 200 * 1024 * 1024,
    // keepExtensions: true,
    onFileBegin: (name, file) => {
      // 获取文件后缀
      const ext = getUploadFileExt(file.name);
      file.originname = name + ext
    },
  },
}))



// // global middlewares
app.use(views('views', {
  // root: __dirname + '/public',
  root: __dirname + '/views',
  map: { html: 'ejs' }
}));
// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
