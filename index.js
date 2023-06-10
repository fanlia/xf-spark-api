
import WebSocket from 'isomorphic-ws'
import hmacSHA256 from 'crypto-js/hmac-sha256.js'
import Base64 from 'crypto-js/enc-base64.js'
import Utf8 from 'crypto-js/enc-utf8.js'

export class SparkApi {
  constructor({
    appid,
    api_key,
    api_secret,
    gpt_url,
  }) {
    this.appid = appid
    this.api_key = api_key
    this.api_secret = api_secret
    this.gpt_url = gpt_url

    const url = new URL(this.gpt_url)
    this.host = url.hostname
    this.path = url.pathname
  }

  create_url() {
    // 生成RFC1123格式的时间戳
    const date = new Date().toGMTString()

    // 拼接字符串
    let signature_origin = "host: " + this.host + "\n"
    signature_origin += "date: " + date + "\n"
    signature_origin += "GET " + this.path + " HTTP/1.1"

    // 进行hmac-sha256进行加密
    const signature_sha = hmacSHA256(signature_origin, this.api_secret)

    const signature_sha_base64 = Base64.stringify(signature_sha)

    const authorization_origin = `api_key="${this.api_key}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature_sha_base64}"`

    const authorization = Base64.stringify(Utf8.parse(authorization_origin))

    // 将请求的鉴权参数组合为字典
    const v = {
        "authorization": authorization,
        "date": date,
        "host": this.host
    }
    // 拼接鉴权参数，生成url
    const url = this.gpt_url + '?' + new URLSearchParams(v)
    return url
  }

  gen_params(question) {
    const data = {
      "header": {
        "app_id": this.appid,
        "uid": "1234"
      },
      "parameter": {
        "chat": {
          "domain": "general",
          "random_threshold": 0.5,
          "max_tokens": 2048,
          "auditing": "default"
        }
      },
      "payload": {
        "message": {
          "text": [
            {"role": "user", "content": question}
          ]
        }
      }
    }

    return data
  }

  async run({
    question,
    onanswer = console.log,
  }) {
    return new Promise((resolve, reject) => {
      const wsUrl = this.create_url()
      const ws = new WebSocket(wsUrl)
      ws.onmessage = (e) => {
        const message = JSON.parse(e.data)
        if (message.header.code !== 0) {
          const e = new Error(message.header.message)
          reject(e)
          ws.close()
        } else {
          const choices = message.payload.choices
          const content = choices.text[0].content
          if (typeof onanswer === 'function') {
            onanswer(content)
          }
          if (choices.status === 2) {
            resolve()
            ws.close()
          }
        }
      }
      ws.onerror = reject
      ws.onopen = () => {
        const data = typeof question === 'string' ? this.gen_params(question) : question
        ws.send(JSON.stringify(data))
      }
    })
  }
}
