import {client, QUOTEROT_USERID} from './helpers/constants'


export async function getBotFollowers() {
    // XXX: Error-handling, etc.
    const response = await client.v2.followers(QUOTEROT_USERID, {
        'user.fields': 'protected',
    })
    return response.data
}
