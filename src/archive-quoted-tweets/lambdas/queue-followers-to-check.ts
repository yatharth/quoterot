import {UserV2} from 'twitter-api-v2'

import {publishAllToQueue, readQueueUrl} from '../../helpers/cdk/lambdas/sqs'
import {jsonStringifyCompact} from '../../helpers/javascript/stringify'
import {partition} from '../../helpers/javascript/array'
import {makeResponse} from '../../helpers/cdk/lambdas/api-gateway'
import {getFollowers} from '../../helpers/twitter/rest-api/user'
import {readSecret} from '../../helpers/cdk/lambdas/secrets'


export async function handler() {

    const queueUrl = readQueueUrl()

    const botUserId = readSecret('TWITTER_USERID')
    const followers = await getFollowers(botUserId)

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