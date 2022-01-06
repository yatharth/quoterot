// Print status of current webhooks registered with Twitter.

import {autohook} from './_autohook'

export async function getWebhook() {
    console.log(await autohook.getWebhooks())
}

if (require.main == module) {
    getWebhook()
}