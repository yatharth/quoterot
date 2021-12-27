import {TwitterApi} from 'twitter-api-v2'

import {readSecret} from '../../cdk/lambdas/secrets'


export const client = new TwitterApi({
    appKey: readSecret('TWITTER_CONSUMER_KEY'),
    appSecret: readSecret('TWITTER_CONSUMER_SECRET'),
    accessToken: readSecret('TWITTER_ACCESS_TOKEN'),
    accessSecret: readSecret('TWITTER_ACCESS_TOKEN_SECRET'),
})
