// @ts-ignore (Typing is not available for twitter-autohook, sadly.)
import {Autohook} from 'twitter-autohook'

import {readSecret} from '../../helpers/cdk/lambdas/secrets'


const AUTOHOOK_CONFIG = {
    consumer_key: readSecret('TWITTER_CONSUMER_KEY'),
    consumer_secret: readSecret('TWITTER_CONSUMER_SECRET'),
    token: readSecret('TWITTER_ACCESS_TOKEN'),
    token_secret: readSecret('TWITTER_ACCESS_TOKEN_SECRET'),
    ngrok_secret: readSecret('NGROK_AUTH_TOKEN'),
    env: readSecret('TWITTER_WEBHOOK_ENV'),
}

export const autohook = new Autohook(AUTOHOOK_CONFIG)
