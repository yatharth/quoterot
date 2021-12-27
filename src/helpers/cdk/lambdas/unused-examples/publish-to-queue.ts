import {publishToQueue, readQueueUrl} from '../sqs'
import {makeResponse} from '../api-gateway'

export async function handler() {

    const queueUrl = readQueueUrl()

    const randomInt = Math.floor(Math.random() * Math.floor(10000)).toString()
    const message = `This is message ${randomInt}!`

    await publishToQueue( queueUrl, message)

    return makeResponse(200, `Published message: “${message}”.`)
}
