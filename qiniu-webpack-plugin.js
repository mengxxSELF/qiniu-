
const qiniu = require('qiniu')
const path = require('path')

class QiuniuUploadPlugin {
  constructor(options) {
    const { bucket, accessKey, secretKey, domain, path } = options
    this.path = path
    this.domain = domain

    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const policyParams = { scope: bucket }

    const putPolicy = new qiniu.rs.PutPolicy(policyParams);

    // 生成token
    this.uploadToken = putPolicy.uploadToken(mac);

    const config = new qiniu.conf.Config();
    this.formUploader = new qiniu.form_up.FormUploader(config);
    this.putExtra = new qiniu.form_up.PutExtra();
  }

  uplaodQn(filename) {
    // 文件地址
    let localFile = path.resolve(__dirname, this.path, filename)
    // console.log(localFile, 'localFile');
    // 文件上传
    return new Promise((resolve) => {
      this.formUploader.putFile(this.uploadToken, filename, localFile, this.putExtra,  (respErr, respBody, respInfo) => {
        if (respErr) {
          reject('error')
        }
        if (respInfo.statusCode == 200) {
          const { key } = respBody
          console.log(`${this.domain}/${key}`)
          // resolve(`${this.domain}/${key}`)
        }
      });
    }) 
  }

  apply(compiler) {
    const pluginName = 'QiuniuUploadPlugin'
    // 事件钩子
    compiler.hooks.run.tap(pluginName, compilation => {
      console.log("webpack 构建过程开始！")
    });

    // afterEmit - 生成资源到 output 目录之后将触发  异步钩子 - tapPromise
    compiler.hooks.afterEmit.tapPromise(pluginName, (compilation) => {
      let { assets } = compilation
      // assets 这里拿到的assets个对象 key是文件名 value是先关参数
      // console.log(assets, 'assets');

      const allUplaod = Object.keys(assets).map((item) => {
        return this.uplaodQn(item)
      })

      return Promise.all(allUplaod)

    })
  }
}

module.exports = QiuniuUploadPlugin