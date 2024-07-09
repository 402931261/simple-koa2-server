import Koa from 'koa'
import path from 'path'
import { fileURLToPath } from 'node:url'  // fileURLToPath 作用是将文件 URL 转换为平台特定的本地文件路径
import staticServer from 'koa-static'
import setRawHeaders from './config/rawHeaders.mjs'

import chalk from 'chalk' // 打印内容变色

import proxy from './config/proxy.mjs'


const PORT = 3001
const app = new Koa()

// import.meta： 为 import 命令添加了一个元属性import.meta，返回当前模块的元信息
const __fileUrl = fileURLToPath(import.meta.url) // 返回当前模块(js)的 URL 路径
const __dirname = path.dirname(__fileUrl) // 组装当前静态文件所在的目录

// staticServer传入当前静态目录路径
app.use(staticServer(path.join(__dirname, './static')))

app.use(setRawHeaders)

// 请求打印
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${chalk.green(ctx.method)} ${ctx.originalUrl} - ${chalk.blueBright(ms)}ms`)
})


app.use(proxy)

app.listen(PORT, () => {
    console.log('listen: ' + PORT)
})