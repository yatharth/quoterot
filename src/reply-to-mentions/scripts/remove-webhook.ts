import {autohook} from './_autohook'

export async function removeWebhook() {
    await autohook.removeWebhooks()
}

if (require.main == module) {
    removeWebhook()
}