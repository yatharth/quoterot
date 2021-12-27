import crypto from 'crypto'

import {QueryParameters} from '../../helpers/cdk/lambdas/rest-api'
import {handleAccountActivity} from './handle-account-activity'


function handleCrcVerification(query: QueryParameters, consumerSecret: string) {

    const crcToken = query['crc_token']
    if (!crcToken)
        throw 'crc_token missing from query.'
    if (typeof crcToken != 'string')
        throw "crc_token is not a string."

    const responseToken = crypto.createHmac('sha256', consumerSecret).update(crcToken).digest('base64')

    return {
        response_token: 'sha256=' + responseToken,
    }

}

export async function webhookHandler(method: string, query: QueryParameters, body: JSON, consumerSecret: string) {
    switch (method) {
        case 'GET':
            return handleCrcVerification(query, consumerSecret)
        case 'POST':
            return await handleAccountActivity(body)
        default:
            throw `Unrecognised HTTP method: ${method}.`
    }
}