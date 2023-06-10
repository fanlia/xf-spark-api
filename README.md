# xf-spark-api
讯飞 spark api

https://www.xfyun.cn/doc/spark/Web.html

## Getting started

```sh
npm i xf-spark-api
```

## Usage

```js

import { SparkApi } from 'xf-spark-api'

const options = {
  appid: "",
  api_key: "",
  api_secret: "",
  gpt_url: "",
}

const question="你是谁？你能做什么？"

const spark = new SparkApi(options)

await spark.run({
  question,
  onanswer: console.log,
})

```

## License

MIT
