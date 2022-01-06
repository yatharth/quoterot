import {jsonStringifyCompact} from '../../../helpers/javascript/stringify'
import {partition} from '../../../helpers/javascript/array'
import {APIGatewayReturnType, makeResponse} from '../../../helpers/cdk/lambdas/api-gateway'
import {getFollowers, UserV2} from '../../../helpers/twitter/rest-api/user'
import {readFromEnv} from '../../../helpers/cdk/lambdas/secrets'
import {followersToCheckClient} from '../queues/followers-to-check'


export async function handler(): Promise<APIGatewayReturnType> {

    // Get followers of @quoterot account.

    const botUserId = readFromEnv('TWITTER_USERID')
    const followers = await getFollowers(botUserId)

    // Ignore the locked accounts, since we can’t get their tweets.

    const isUserProtected = (user: UserV2) => user.protected
    const getUserId = (user: UserV2) => user.id

    const [lockedFollowers, unlockedFollowers] = partition(followers, isUserProtected)
    const lockedFollowerIds = lockedFollowers.map(getUserId)
    const unlockedFollowerIds = unlockedFollowers.map(getUserId)

    console.log(`Not queuing ${lockedFollowers.length} locked followers: ${jsonStringifyCompact(lockedFollowerIds)}`)
    console.log(`Queuing ${unlockedFollowers.length} unlocked followers: ${jsonStringifyCompact(unlockedFollowerIds)}`)

    // Queue the unlocked followers’ account IDs to be processed.

    const messagesForQueue: (typeof followersToCheckClient.message)[] = unlockedFollowerIds.map(followerId => ({ followerId }))
    await followersToCheckClient.publishAll(messagesForQueue)

    // Success!

    console.log(`All done with ${followers.length} followers!`)

    return makeResponse(200, `Of ${followers.length} followers, queued ${unlockedFollowers.length} and ignored ${lockedFollowers.length} locked accounts.`)

}