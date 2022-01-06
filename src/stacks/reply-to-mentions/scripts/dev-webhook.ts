// This script provides the complete developer experience.
//
// 1. It watches the project folder and keeps rebuilding and relaunching a local webhook server.
// 2. After the first such launch, it starts an ngrok tunnel to the webhook.
// 3. Once established, it registers the local webhook with Twitter.
//
// There is an `npm run` script to invoke it.

// By the way, you might have to patch ngrok.
//   cp (which ngrok) PROJECT_ROOT/node_modules/twitter-autohook/node_modules/ngrok/bin/ngrok
// There seems to be some error ngrok has with node 17.


import TscWatchClient from 'tsc-watch/client'
import ngrok from 'ngrok'

import {PORT, filename} from './serve-webhook'
import {setWebhook} from './set-webhook'
import {readFromEnv} from '../../../helpers/cdk/lambdas/secrets'


const watch = new TscWatchClient()

function fail(err: unknown) {
    console.log(err)
    watch.kill()
    process.exit(1)
}

watch.on('first_success', async () => {

    try {

        console.log()
        console.log("Connecting to ngrok...")
        await ngrok.authtoken(readFromEnv('NGROK_AUTH_TOKEN'))
        const url = await ngrok.connect(PORT)
        console.log(`Webhook now tunnelled to ${url}`)

        console.log()
        console.log("Registering webhook...")
        await setWebhook(url)
        console.log("Webhook now registered!")

    } catch (err) {
        fail(err)
    }

    // TODO: Consider adding something like this to package.json, or even catch the interrupt here:
    // "webhook:restore": "npm run webhook:set $(jq .ReplyToMentionsStack.twitterWebhookUrl cdk-outputs.json)"
    // Does CDK after launch register? Who registers?

})

export function devWebhook() {
    watch.start('--preserveWatchOutput', '--onSuccess', `node ${filename}`)
}

if (require.main == module) {
    devWebhook()
}
