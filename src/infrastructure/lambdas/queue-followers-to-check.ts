import assert from 'assert'

import {publishAllToQueue} from './helpers/sqs'
import {makeResponse} from './helpers/response'
import {getBotFollowers} from '../../lib/twitter/botFollowers'
import {jsonStringifyCompact} from '../../helpers/stringify'
import {UserV2} from 'twitter-api-v2'
import {partition} from '../../helpers/array'


export async function handler() {

    const queueUrl = process.env['QUEUE_URL']
    assert(queueUrl, "No QUEUE_URL provided.")

    const followers = await getBotFollowers()

    const isUserProtected = (user: UserV2) => user.protected
    const getUserId = (user: UserV2) => user.id

    const [lockedFollowers, unlockedFollowers] = partition(followers, isUserProtected)
    const lockedFollowerIds = lockedFollowers.map(getUserId)
    const unlockedFollowerIds = unlockedFollowers.map(getUserId)

    console.log(`Not queuing ${lockedFollowers.length} locked followers: ${jsonStringifyCompact(lockedFollowerIds)}`)
    console.log(`Queuing ${unlockedFollowers.length} unlocked followers: ${jsonStringifyCompact(unlockedFollowerIds)}`)

    await publishAllToQueue(queueUrl, unlockedFollowerIds)

    console.log(`All done with ${followers.length} followers!`)

    return makeResponse(200, `Of ${followers.length} followers, queued ${unlockedFollowers.length} and ignored ${lockedFollowers.length} locked accounts.`)
}