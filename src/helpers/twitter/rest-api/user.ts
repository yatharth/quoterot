import {verifyNoErrors} from './_errors'
import {client} from './_auth'


export async function getFollowers(userId: string) {

    const result = await client.v2.followers(userId, {
        'user.fields': 'protected',
    })

    verifyNoErrors(result, "getting followers")

    return result.data

}
