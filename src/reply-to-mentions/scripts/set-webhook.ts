import {autohook} from './_autohook'
import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'


export async function setWebhook(url: string) {

    try {

        console.log()
        console.log(await autohook.getWebhooks())

        console.log()
        console.log('Removing existing webhooks...')
        await autohook.removeWebhooks()

        console.log()
        console.log('Registering new webhook...')
        await autohook.start(url)

        console.log()
        console.log('Subscribing to ourself...')
        await autohook.subscribe({
            oauth_token: readFromEnv('TWITTER_ACCESS_TOKEN'),
            oauth_token_secret: readFromEnv('TWITTER_ACCESS_TOKEN_SECRET'),
        })

        console.log()
        console.log('Finished.')
        console.log()

    } catch (err) {
        console.error(err)
        process.exit(1)
    }

}

if (require.main == module) {
    const url = process.argv[2]
    if (!url) throw "URL not supplied."
    setWebhook(url)
}