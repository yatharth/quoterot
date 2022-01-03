import {verifyNoErrors} from './_errors'
import {client} from './_auth'
import {UsersV2Params} from 'twitter-api-v2/dist/types/v2/user.v2.types'


export const userParams: Partial<UsersV2Params> = {
    'user.fields': 'protected',
}

export async function getUser(userId: string) {
    const result = await client.v2.user(userId, userParams)
    verifyNoErrors(result, "getting username")
    return result.data
}

export async function getUserByUsername(username: string) {
    const result = await client.v2.userByUsername(username, userParams)
    verifyNoErrors(result, "getting username")
    return result.data
}

export async function getFollowers(userId: string) {
    const result = await client.v2.followers(userId, userParams)
    verifyNoErrors(result, "getting followers")
    return result.data
}
