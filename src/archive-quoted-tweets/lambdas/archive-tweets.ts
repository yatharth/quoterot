import {forEach} from 'p-iteration'

import {SQSEvent} from 'aws-lambda'

import {jsonStringifyCompact} from '../../helpers/javascript/stringify'


async function archiveTweetUrl(tweetUrl: string) {
    // 1. Make request to SPN
    // 2. Put record in db
    // 3. Queue checking for status in a bit

    // TODO: implement
    tweetUrl
}

export async function handler(event: SQSEvent) {
    const tweetUrlsToArchive = event.Records.map(record => record.body)
    await forEach(tweetUrlsToArchive, archiveTweetUrl)
    console.log(`Consumed SQS messages: ${jsonStringifyCompact(tweetUrlsToArchive)}`)
}
