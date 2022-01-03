import {map} from 'p-iteration'
import {Static, Runtype} from 'runtypes'

import {SQS} from 'aws-sdk'
import {SQSEvent} from 'aws-lambda'

import {jsonStringifyPretty} from '../../javascript/stringify'
import {verifyNoError} from './_errors'
import {readFromEnv} from './secrets'
import {APIGatewayEventType, APIGatewayReturnType, makeResponse} from './api-gateway'
import {parseJSONData} from './rest-api'


type MessageHandler<Message> = (message: Message) => Promise<unknown>
type SQSHandler = (event: SQSEvent) => Promise<void>
type WebHandler = (event: APIGatewayEventType) => APIGatewayReturnType


export type QueueParams<R extends Runtype> = {

    baseId: string,

    // The runtype to validate all messages sent and receiving from the queue.
    runtype: R,

    // Set to 'NO_LIMIT' for normal, non-FIFO queue that might spin up any number of lambdas.
    // Set to a positive integer to use a FIFO queue that uses that many message group IDs to limit
    //  concurrency to only that many lambdas. FIFOs wait for the lambda to finish before processing the next
    //  message in their message group ID.
    concurrency: number | 'NO_LIMIT',

}


function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}


export class QueueRuntime<R extends Runtype<Message>, Message = Static<R>> {

    queueParams: QueueParams<R>

    constructor(queueParams: QueueParams<R>) {
        this.queueParams = queueParams
    }

    get queueId() {
        return `${this.queueParams.baseId}Queue`
    }

    get queueUrlEnvVar() {
        return `${this.queueParams.baseId}QueueUrl`
    }

    // If not limiting concurrency, then not a FIFO queue, and we let MessageGroupId be undefined.
    // If we are limiting concurrency, then we choose MessageGroupId as a random number between 1 and the limit.
    private chooseMessageGroupId(): string | undefined {
        if (this.queueParams.concurrency == 'NO_LIMIT') {
            return
        } else {
            return getRandomInt(1, this.queueParams.concurrency).toString()
        }
    }

    async publish(message: Message): Promise<SQS.SendMessageResult> {

        const params: SQS.Types.SendMessageRequest = {
            QueueUrl: readFromEnv(this.queueUrlEnvVar),
            MessageBody: jsonStringifyPretty(message),
            MessageGroupId: this.chooseMessageGroupId(),
        }

        const result = await new SQS().sendMessage(params).promise()
        return verifyNoError(result, "queueing message")

    }

    async publishAll(messages: Message[]): Promise<SQS.SendMessageResult[]> {

        // We could make batch requests to SQS, but it only allows up to 10 items per batch,
        //  and we’d have to check for the success/fail status of each record, greatly
        //  complicating the code for little benefit.

        // Make requests concurrently, and wait for all to finish.
        return await map(messages, this.publish)

    }

    parseMessage(rawMessage: string): Message {
        try {
            return this.queueParams.runtype.check(JSON.parse(rawMessage))
        } catch (err) {
            console.error(`Could not parse message type for ${this.queueParams.baseId}:`)
            console.error(rawMessage)
            throw err
        }
    }

    makeSqsHandler(messageHandler: MessageHandler<Message>): SQSHandler {
        return async (sqsEvent: SQSEvent) => {

            const rawMessages = sqsEvent.Records.map(event => event.body)
            const messages = rawMessages.map(this.parseMessage)

            // Run one at a time.
            for (const message of messages) {
                await messageHandler(message)
            }

        }
    }

    makeWebHandler(messageHandler: MessageHandler<Message>): WebHandler {
        return async (webEvent: APIGatewayEventType) => {
            const rawMessage = parseJSONData(webEvent.body)
            const message = this.parseMessage(rawMessage)
            const result = messageHandler(message)
            return makeResponse(200, result)
        }
    }

}
