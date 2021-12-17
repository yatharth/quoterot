import {SQSEvent} from 'aws-lambda'

import {jsonStringifyCompact} from '../../helpers/stringify'


export async function handler(event: SQSEvent) {

    const tweetIds = event.Records.map(record => record.body)

    if (tweetIds.some((tweetId) => tweetId.includes("fail"))) {
        throw `Oops! Received fail keyword in: ${jsonStringifyCompact(tweetIds)}`
    }

    console.log(`Consumed SQS messages: ${jsonStringifyCompact(tweetIds)}`)

}