import express, {Request as ExpressRequest, Response as ExpressResponse} from 'express'

import {webhookHandler} from '../webhook/webhook'
import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'


export const PORT = 3000
export const filename = __filename

const CONSUMER_SECRET = readFromEnv('TWITTER_CONSUMER_SECRET')

function webhookAdapter(req: ExpressRequest, res: ExpressResponse) {
    const response = webhookHandler(req.method, req.query, req.body, CONSUMER_SECRET)
    res.send(response)
}

export function serveWebhook() {
    const app = express()
    app.use(express.json())  // Interprets request data as JSON and puts it in `req.body`.
    app.get('/', webhookAdapter)
    app.post('/', webhookAdapter)
    app.listen(PORT, () => console.log(`Webhook running on port ${PORT}!`))
}

if (require.main == module) {
    serveWebhook()
}
