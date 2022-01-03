import {TwitterApi} from 'twitter-api-v2'

import {readFromEnv} from '../../cdk/lambdas/secrets'


export const client = new TwitterApi({
    appKey: readFromEnv('TWITTER_CONSUMER_KEY'),
    appSecret: readFromEnv('TWITTER_CONSUMER_SECRET'),
    accessToken: readFromEnv('TWITTER_ACCESS_TOKEN'),
    accessSecret: readFromEnv('TWITTER_ACCESS_TOKEN_SECRET'),
})
