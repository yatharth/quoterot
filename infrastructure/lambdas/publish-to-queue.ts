import {makeResponse} from './helpers/response'
import {publishToQueue} from './helpers/sqs'
import assert from 'assert'

export async function handler() {

    const queueUrl = process.env['QUEUE_URL']
    assert(queueUrl)

    const randomInt = Math.floor(Math.random() * Math.floor(10000)).toString()
    const message = `This is message ${randomInt}!`

    await publishToQueue( queueUrl, message)

    return makeResponse(200, `Published message: “${message}”.`)
}
