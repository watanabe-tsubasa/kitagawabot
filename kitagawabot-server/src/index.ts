import { 
  messagingApi,
  webhook,
} from '@line/bot-sdk'
import { Hono } from 'hono'
import HmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";

type Bindings = {
  CHANNEL_ACCESS_TOKEN: string,
  CHANNEL_SECRET: string,
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/webhook', async (c) => {
  const body = await c.req.text() // JSONではなくテキストで取得
  const channelAccessToken = c.env.CHANNEL_ACCESS_TOKEN || process.env.CHANNEL_ACCESS_TOKEN || ''
  const channelSecret = c.env.CHANNEL_SECRET || process.env.CHANNEL_SECRET || ''

  // シグネチャの取得
  const signature = c.req.header('x-line-signature')
  if (!signature) {
    return c.text('Missing signature', 400)
  }

  // HMACを使ってシグネチャを生成
  const hash = await generateHmac(channelSecret, body);

  // シグネチャの検証
  if (signature !== hash) {
    return c.text('Invalid signature', 403)
  }

  const events = JSON.parse(body).events
  const promises = events.map((event: webhook.Event) => handleEvent(event, channelAccessToken))
  await Promise.all(promises)

  return c.text('OK')
})

const handleEvent = async (
  event: webhook.Event,
  accessToken: string,
) => {
  if (event.type !== 'message' || event.message.type !== 'text') return;
  if (!event.replyToken) return;
  const { text } = event.message;
  fetch('https://api.line.me/v2/bot/chat/loading/start', {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({"chatId": event.source?.userId})
  })

  const responseBody: messagingApi.ReplyMessageRequest = {
    replyToken: event.replyToken,
    messages: [
      {'type': 'text', 'text': text}
    ] 
  }
  
  return fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(responseBody)
  })
}

export default app

const generateHmac = async (secret: string, message: string) => {
  const hmac = HmacSHA256(message, secret);
  return Base64.stringify(hmac);
}