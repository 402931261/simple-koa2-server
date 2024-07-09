import { createProxyMiddleware } from 'http-proxy-middleware'
import Koa2Connect from 'koa2-connect' // 将 http-proxy-middleware 变为在koa中可使用 
import koaCompose from 'koa-compose' // 组合多个中间件
import zlib from 'zlib' // 压缩和解压缩

const proxies = [
  {
    pathFilter: '/api1', // 匹配以/api1开头的路径
    pathRewrite: {
      '/api1': ''
    }, // 把/api去除掉
    target: 'https://jsonplaceholder.typicode.com', // target host with the same base path
    changeOrigin: true, // needed for virtual hosted sites
  },
  {
    pathFilter: '/api2',
    pathRewrite: {
      '/api2': ''
    },
    target: 'https://jsonplaceholder.typicode.com', // target host with the same base path
    changeOrigin: true, // needed for virtual hosted sites
  },
]

// 给代理配置增加监听
proxies.forEach((proxy) => {
  proxy.on = (() => {
    return {
      // 打印转发请求
      proxyReq: function onProxyReq(proxyReq, req, res) {
        proxyReq.setHeader('Cache-Control', 'no-cache')
        console.log(' 🚀 ', req.method, req.url, '->', proxyReq.host + proxyReq.path)
      },
      // 打印转发响应
      proxyRes: async function onProxyRes(proxyRes, req, res) {
        const responseBody = await getBody(proxyRes)
        console.log(' 🌠 ', req.method, proxyRes.statusCode, req.url, '->', responseBody)
      },
      error: (err) => {
        console.log(chalk.red('error'), ' 😱 ', err.code)
      }
    }
  })()
})

// 解析获取转发返回响应内容
function getBody(proxyRes) {
  return new Promise((resolve) => {
    let body = []
    proxyRes.on('data', function (chunk) {
      body.push(chunk)
    })
    proxyRes.on('end', async function (val) {
      body = Buffer.concat(body)
      try {
        // 判断响应是否有使用了gzip
        if (proxyRes.headers['content-encoding']?.toLowerCase() === 'gzip') {
          const ungzip = await zlib.gunzipSync(body) // 同步解压缩数据
          resolve(JSON.parse(ungzip.toString()))
        } else {
          resolve(JSON.parse(body.toString()))
        }
      } catch (error) {
        // JSON.parse 报错直接返回body
        resolve(body)
      }
    })
  })
}

// 导出所有多个转发中间件
export default koaCompose(
  proxies.map(proxy => Koa2Connect(createProxyMiddleware(proxy)))
)

  
  
