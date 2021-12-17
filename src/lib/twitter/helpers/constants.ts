import TwitterApi from 'twitter-api-v2'

export const QUOTEROT_USERID = '1460777590373769226'

// XXX: Move to AWS Secrets?
const BEARER_TOKEN_FOR_V2_API = 'AAAAAAAAAAAAAAAAAAAAAMj2VwEAAAAAxhAqlNP8HzK8uzmSmvAO5LhzNcA%3D8iuwR8sYY3jcfeGIlJ8dThKv7zoU0DhBqQArw3elaTD2mF73Ko'

export const client = new TwitterApi(BEARER_TOKEN_FOR_V2_API)


