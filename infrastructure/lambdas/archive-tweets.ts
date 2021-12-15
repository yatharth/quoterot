import {SQSEvent} from 'aws-lambda';

export async function handler(event: SQSEvent) {

    const allMessages = event.Records.map(record => record.body).join(";")

    if (allMessages.includes("fail")) {
        throw `Oops! Failed for '${allMessages}'.`
    }

    console.log(`Consumed SQS messages: ${allMessages}.`)

}