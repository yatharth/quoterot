import {forEach} from 'p-iteration'

import {SQS} from 'aws-sdk'

import {readFromEnv} from './secrets'


export type QueueParams = {
    queueId: string,
    queueUrlEnvVar: string,
}


// Convenient, as not every queue has to define it’s own table name environment variable,
//  but it only allows one table to be connected to a lambda at a time then.
export const DEFAULT_QUEUE_URL_ENVIRONMENT_VARIABLE = 'QUEUE_URL'

export function readDefaultQueueUrl() {
    return readFromEnv(DEFAULT_QUEUE_URL_ENVIRONMENT_VARIABLE)
}


// TODO: Make these typesafe, requiring an explicit parameter type (<T = void> default-voided generic).

export async function publishToQueue(queueUrl: string, messageBody: any) {

    const params: SQS.Types.SendMessageRequest = {
        QueueUrl: queueUrl,
        MessageBody: messageBody,
    }

    return await new SQS().sendMessage(params).promise()
}

export async function publishAllToQueue(queueUrl: string, messageBodies: any[]) {

    // We could make batch requests to SQS, but it only allows up to 10 items per batch,
    //  and we’d have to check for the success/fail status of each record, greatly
    //  complicating the code for little benefit.

    // Make requests concurrently, and wait for all to finish.
    await forEach(messageBodies, async (messageBody) => {
        await publishToQueue(queueUrl, messageBody)
    })

}


// When SNS pushes records to SQS, it formats the records as a JSON object with the following fields:
//  {Subject: string; Message: string}


// If you want to play around with publishing messages to SQS in the node console, you can run this:
/*
AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'})
sqs = new AWS.SQS()
var paramsCorrect = {
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/122557655356/QuoteRotStack-tweetsToArchiveQueue8907B390-S7K6HNR9CNF1",
    MessageBody: "testing from node 1"
}
var paramsWrong = {
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/122557655356/nosuchqueue",
    MessageBody: "testing from node 2"
}

async function testing(params) {
    console.log("before promise")
    promise = sqs.sendMessage(params).promise()
    console.log("after promise")
    result = await promise
    console.log("after await")
    return result
}

testing(paramsWrong)
await testing(paramsWrong)
*/

