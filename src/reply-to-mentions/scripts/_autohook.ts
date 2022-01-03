// @ts-ignore (Typing is not available for twitter-autohook, sadly.)
import {Autohook} from 'twitter-autohook'

import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'


const AUTOHOOK_CONFIG = {
    consumer_key: readFromEnv('TWITTER_CONSUMER_KEY'),
    consumer_secret: readFromEnv('TWITTER_CONSUMER_SECRET'),
    token: readFromEnv('TWITTER_ACCESS_TOKEN'),
    token_secret: readFromEnv('TWITTER_ACCESS_TOKEN_SECRET'),
    ngrok_secret: readFromEnv('NGROK_AUTH_TOKEN'),
    env: readFromEnv('TWITTER_WEBHOOK_ENV'),
}

export const autohook = new Autohook(AUTOHOOK_CONFIG)
