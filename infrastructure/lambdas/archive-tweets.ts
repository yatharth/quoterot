import {APIGatewayProxyResultV2, SQSEvent} from 'aws-lambda';
import {makeResponse} from './helpers/response'

export async function handler(event: SQSEvent): Promise<APIGatewayProxyResultV2> {

    const messages = event.Records.map(record => {
        const body = JSON.parse(record.body) as {Subject: string; Message: string};
        return {subject: body.Subject, message: body.Message};
    });

    if (messages) throw "Oops!"

    console.log('messages 👉', JSON.stringify(messages, null, 2));

    return makeResponse(200, {messages})
}