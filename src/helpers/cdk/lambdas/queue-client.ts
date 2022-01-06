// Define a run-time interface for lambdas to enqueue and receive messages from a queue in a type-safe way.

import {forEach, map} from 'p-iteration'
import {Runtype, Static} from 'runtypes'

import {SQS} from 'aws-sdk'
import {SQSEvent} from 'aws-lambda'

import {APIGatewayEventType, APIGatewayReturnType, makeResponse} from './api-gateway'
import {getRandomIntBetween} from '../../javascript/random'
import {jsonStringifyPretty} from '../../javascript/stringify'
import {verifyNoError} from './_errors'
import {QueueDefinition, queueUrlEnvVar} from './queue-definition'
import {readFromEnv} from './secrets'
import {parseJSONData} from './rest-api'


type MessageHandler<Message> = (message: Message) => Promise<unknown>
type SQSHandler = (event: SQSEvent) => Promise<void>
type WebHandler = (event: APIGatewayEventType) => Promise<APIGatewayReturnType>


// HOW DOES THE TYPING WORK?
//
// `Message` is the unadorned Javascript type, e.g., `{ baseId: string }` etc.
// `R` is the type of the Runtype definition, e.g., `runtypes.Record({ baseId: runtypes.String })`
//
// You can derive `Message` from `R` using the `Static` type: `Message = Static<R>`.
// You can derive `R` from `Message` by just saying `R = Runtype<Message>`.
//
// You would think having both as generic type parameters in the same type would be a circular reference,
//  but for reasons I don’t understand, Typescript doesn’t complain.
//
// The downside of this approach is that assigning default generic type parameters or default runtypes won’t work.

export class QueueClient<R extends Runtype<Message>, Message = Static<R>> {

    // This just exists, so you can do `typeof queueClient.message` and get the Message type.
    message: Message

    constructor(
        public definition: QueueDefinition,
        public runtype: R
    ) {
        this.message = runtype._falseWitness
    }

    // Helper for publishing messages.
    private chooseMessageGroupId(): string | undefined {

        // If we’re NOT limiting concurrency, then we use a regular (non-FIFO) queue and MessageGroupId should be undefined.
        // Otherwise, if we’re limiting concurrency, we set MessageGroupId to a random number between 1 and the max concurrency
        //  to assign the message to a random message group.

        if (this.definition.concurrency == 'NO_LIMIT') {
            return
        } else {
            return getRandomIntBetween(1, this.definition.concurrency).toString()
        }
    }

    // Publish message to queue.
    async publish(message: Message): Promise<SQS.SendMessageResult> {

        const params: SQS.Types.SendMessageRequest = {
            QueueUrl: readFromEnv(queueUrlEnvVar(this.definition)),
            MessageBody: jsonStringifyPretty(message),
            MessageGroupId: this.chooseMessageGroupId(),
        }

        const result = await new SQS().sendMessage(params).promise()
        return verifyNoError(result, "queueing message")

    }

    // Publish many messages to the queue.
    async publishAll(messages: Message[]): Promise<SQS.SendMessageResult[]> {

        // WHY DON’T WE BATCH REQUESTS?
        //
        // We could make batch requests to SQS, but it only allows up to 10 items per batch,
        //  and we’d have to check for the success/fail status of each record, greatly
        //  complicating the code for little benefit. Therefore, we just make the API calls individually.

        // Make requests concurrently, and wait for all to finish.
        const publish = this.publish.bind(this)
        return await map(messages, publish)

    }

    // Parse a raw message in a string to the type of record of the queue.
    parseMessage(rawMessage: string): Message {
        try {
            return this.runtype.check(JSON.parse(rawMessage))
        } catch (err) {
            console.error(`Could not parse the following message into the right type for queue ${this.definition.baseId}:`)
            console.error(rawMessage)
            throw err
        }
    }

    // In any lambda file, you can just type:
    //
    //      `export const handler = queue.makeSqsHandler(callback)`
    //
    // And it will automatically create a handler that responds to SQS events, validates
    //  the type of reach record, and calls `callback` for each message with the right typings. Easy!
    makeSqsHandler(messageHandler: MessageHandler<Message>, shouldRunConcurrently: boolean = false): SQSHandler {
        const parseMessage = this.parseMessage.bind(this)
        return async function handler(sqsEvent: SQSEvent) {

            const rawMessages = sqsEvent.Records.map(event => event.body)
            const messages = rawMessages.map(parseMessage)

            if (shouldRunConcurrently) {

                // Run concurrently, and wait for all to finish.
                await forEach(messages, messageHandler)

            } else {

                // Run one at a time.
                for (const message of messages) {
                    await messageHandler(message)
                }

            }

        }
    }

    // In any lambda file, you can just type:
    //
    //      `export const handler = queue.makeSqsHandler(callback)`
    //
    // And it will automatically create a handler that responds to a API Gateway event,
    //  parses the body data into JSON, validates the type of the record, and calls `callback`
    //  for it with the right typings.
    //
    // You can easily export both a web handler and SQS event handler in your file so your one callback function
    //  can handle both easily without worrying about where the data is coming from, validating it, etc.
    makeWebHandler(messageHandler: MessageHandler<Message>): WebHandler {
        const parseMessage = this.parseMessage.bind(this)
        return async function handler(webEvent: APIGatewayEventType) {
            const rawMessage = parseJSONData(webEvent.body)
            const message = parseMessage(rawMessage)
            const result = messageHandler(message)
            return makeResponse(200, result)
        }
    }

}