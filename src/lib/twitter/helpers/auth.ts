import assert from 'assert'

import TwitterApi from 'twitter-api-v2'


const BEARER_TOKEN_FOR_V2_API = process.env['TWITTER_V2_BEARER_TOKEN']?.trim()
assert(BEARER_TOKEN_FOR_V2_API, "Twitter secret not found as environment variable.")

export const client = new TwitterApi(BEARER_TOKEN_FOR_V2_API)
