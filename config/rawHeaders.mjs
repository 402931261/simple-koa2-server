// 设置头部字段为原始内容，而不是node转换后的都是小写的头部字段
const setRawHeaders = async (ctx, next) => {
  const originHeaders = convertRawHeadersToObject(ctx.req.rawHeaders)
  ctx.request.headers = originHeaders
  await next()
}

// ['requestId', '1234565', 'clienntId', '123456'] 转换成 {requestId: '123456', clienntId: '123456'}
const convertRawHeadersToObject = (rawHeaders) => {
  const headers = {}
  for (let i = 0; i < rawHeaders.length; i += 2) {
    headers[rawHeaders[i]] = rawHeaders[i + 1]
  }
  return headers
}

export default setRawHeaders
