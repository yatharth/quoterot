import {autohook} from './_autohook'

export async function getWebhook() {
    console.log(await autohook.getWebhooks())
}

if (require.main == module) {
    getWebhook()
}