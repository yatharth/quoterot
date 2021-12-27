import {SQS} from 'aws-sdk'
import {forEach} from 'p-iteration'

export const ENVIRONMENT_VARIABLE = 'QUEUE_URL'

export function readQueueUrl() {
    const queueUrl = process.env[ENVIRONMENT_VARIABLE]
    if (!queueUrl) throw `${ENVIRONMENT_VARIABLE} not found in environment.`
    return queueUrl
}

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

