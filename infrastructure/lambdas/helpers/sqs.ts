import {SQS} from 'aws-sdk'


// When SNS pushes records to SQS, I think SNS pushes it as a JSON object with the following fields:
// JSON.parse(record.body) as {Subject: string; Message: string}


export function publishToQueue(queueUrl: string, messageBody: any) {

    const params: SQS.Types.SendMessageRequest = {
        QueueUrl: queueUrl,
        MessageBody: messageBody,
    }

    return new SQS().sendMessage(params).promise()

}
