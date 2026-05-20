const fs = require('fs')
const http = require('http')
const path = require('path')

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8'
  return 'text/plain; charset=utf-8'
}

async function startStaticServer(rootDir) {
  const server = http.createServer((request, response) => {
    const requestPath = new URL(request.url || '/', 'http://127.0.0.1').pathname
    const normalizedPath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, '')
    const filePath = path.join(rootDir, normalizedPath === '/' ? 'checkout.html' : normalizedPath)

    if (!filePath.startsWith(rootDir)) {
      response.writeHead(403)
      response.end('Forbidden')
      return
    }

    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404)
        response.end('Not found')
        return
      }

      response.writeHead(200, { 'content-type': contentType(filePath) })
      response.end(body)
    })
  })

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))

  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise(resolve => server.close(resolve))
  }
}

module.exports = { startStaticServer }

