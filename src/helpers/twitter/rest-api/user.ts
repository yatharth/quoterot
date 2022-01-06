// Functions for fetching and manipulating information about a Twitter user.

import {verifyNoErrors} from './_errors'
import {client} from './_auth'
import {UsersV2Params} from 'twitter-api-v2/dist/types/v2/user.v2.types'
import {UserV2} from 'twitter-api-v2'


export {
    UserV2
}

export const userParamsToFetch: Partial<UsersV2Params> = {
    'user.fields': 'protected',
}

export async function getUser(userId: string) {
    const result = await client.v2.user(userId, userParamsToFetch)
    verifyNoErrors(result, "getting username")
    return result.data
}

export async function getUserByUsername(username: string) {
    const result = await client.v2.userByUsername(username, userParamsToFetch)
    verifyNoErrors(result, "getting username")
    return result.data
}

export async function getFollowers(userId: string) {
    const result = await client.v2.followers(userId, userParamsToFetch)
    verifyNoErrors(result, "getting followers")
    return result.data
}
