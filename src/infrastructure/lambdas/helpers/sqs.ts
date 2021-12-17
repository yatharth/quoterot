import {SQS} from 'aws-sdk'
import {forEach} from 'p-iteration'


export async function publishToQueue(queueUrl: string, messageBody: any) {

    const params: SQS.Types.SendMessageRequest = {
        QueueUrl: queueUrl,
        MessageBody: messageBody,
    }

    return await new SQS().sendMessage(params).promise()
}


export async function publishAllToQueue(queueUrl: string, messageBodies: any[]) {

    // XXX: Consider making a batch requests.
    //  SQS allows making batch requests. However, it only allows at most 10 items per batch.
    //  And we might have to check for the success/fail status of each individual record,
    //   which would greatly complicate the code.
    //  So it’s probably best to leave this as is.

    // We want to make the requests concurrently, but we do want
    //   to collect the promises and wait for all of them to finish.
    //  The `forEach` function from `p-iteration` does that exactly.
    await forEach(messageBodies, async (messageBody) => {
        await publishToQueue(queueUrl, messageBody)
    })

}


// When SNS pushes records to SQS, it formats the records as a JSON object with the following fields:
//  JSON.parse(record.body) as {Subject: string; Message: string}


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

