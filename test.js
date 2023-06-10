
import { SparkApi } from './index.js'

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
