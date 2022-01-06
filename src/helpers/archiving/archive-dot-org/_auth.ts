import got, {Got} from 'got'
import setCookie from 'set-cookie-parser'

import {readFromEnv} from '../../cdk/lambdas/secrets'
import assert from 'assert'


// export interface S3LikeAuth {
//     accessKey: string,
//     secretKey: string,
// }
//
// export function readAuth(): S3LikeAuth {
//     return {
//         accessKey: readFromEnv('ARCHIVEDOTORG_S3LIKE_ACCESS_KEY'),
//         secretKey: readFromEnv('ARCHIVEDOTORG_S3LIKE_SECRET_KEY'),
//     }
// }


export interface PasswordAuth {
    username: string,
    password: string,
}

interface CookiesAuth {
    'logged-in-user': string,
    'logged-in-sig': string,
}

async function fetchCookieFromPassword(auth: PasswordAuth): Promise<CookiesAuth> {

    // Will throw 401 error if authentication was invalid.
    const response = await got.post('https://archive.org/account/login', {
        headers: {
            'Cookie': 'test-cookie=1',
        },
        form: {
            ...auth,
        },
        responseType: 'json',
    })

    const body = response.body as { status?: string }
    assert(body.status == 'ok')

    const cookieHeaders = response.headers['set-cookie']
    assert(cookieHeaders)

    const cookies = setCookie.parse(cookieHeaders, {map: true})
    assert(cookies['logged-in-user'])
    assert(cookies['logged-in-sig'])

    // These usually last about an hour.
    return {
        'logged-in-sig': cookies['logged-in-sig'].value,
        'logged-in-user': cookies['logged-in-user'].value,
    }

}


function formatCookies(cookies: any) {
    return Object.keys(cookies).map((key) => `${key}=${encodeURIComponent(cookies[key])}`).join('; ')
}

export function readAuthFromEnvironment(): PasswordAuth {
    return {
        username: readFromEnv('ARCHIVEDOTORG_ACCOUNT_USERNAME'),
        password: readFromEnv('ARCHIVEDOTORG_ACCOUNT_PASSWORD'),
    }
}

export async function authenticateClient(client: Got, auth: PasswordAuth): Promise<Got> {
    const cookies = await fetchCookieFromPassword(auth)
    return client.extend({
        headers: {
            'cookie': formatCookies(cookies),
        },
    })
}
