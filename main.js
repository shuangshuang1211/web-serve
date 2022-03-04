const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')
const mime = require('mime')
const {promisify} = require('util')
const ejs = require('ejs')

function mergeConfig (config) {
  return {
    port: 1234,
    directory: process.cwd(),
    ...config
  }
}
class Server {
  constructor(cmd) {
    this.config = mergeConfig(cmd)
  }

  start (cb) {
    try {
      const httpServer = http.createServer(this.serverHandler.bind(this))
      httpServer.listen(this.config.port, () => {
        console.log('服务端启动了')
      })
      if (cb) {
        cb()
      }
    } catch (err) {
      console.log(err)
    }
  }

  async serverHandler (req, res) {
    let {pathname} = url.parse(req.url)
    pathname = decodeURIComponent(pathname)
    const absPathname = path.join(this.config.directory, pathname)
    const fsPromises = fs.promises
    try {
      const staObj = await fsPromises.stat(absPathname)
      if (staObj.isFile()) {
        this.fileHandler(req,res, absPathname)
      } else {
        // 是个目录
        let dirs = await fsPromises.readdir(absPathname)
        console.log('===dirs1', dirs, pathname)
        dirs = dirs.map(item => ({
          path: path.join(pathname, item),
          dir: item
        }))
        console.log('===dirs', dirs)
        let renderFile = promisify(ejs.renderFile)
        let parentPath = path.dirname(pathname)
        console.log('===parentPath', parentPath)
        let ret = await renderFile(path.resolve(__dirname, 'template.html'), {
          arr: dirs,
          parent: pathname === '/' ? false : true,
          title: path.basename(absPathname),
          parentPath: parentPath
        })
        res.end(ret)
      }
    } catch (error) {
      this.errorHandler(req,res,error)
    }
  }

  fileHandler (req,res, absPathname) {
    res.statusCode = 200
    res.setHeader('Centent-type', mime.getType(absPathname) + ';charset=utf-8')
    fs.createReadStream(absPathname).pipe(res)
  }

  errorHandler (req, res, error) {
    console.log(error)
    res.statusCode = 404
    res.setHeader('Content-type', 'text/html;charset=utf-8')
    res.end('Not Found')
  }
}

module.exports = Server