import {PromiseResult} from 'aws-sdk/lib/request'
import {AWSError} from 'aws-sdk/lib/error'

import {jsonStringifyPretty} from '../../javascript/stringify'


export function verifyNoError<T>(result: PromiseResult<T, AWSError>, whileDoingWhat: string): T {
    if (result.$response.error) {
        console.error(`AWS error while ${whileDoingWhat}`)
        console.error(jsonStringifyPretty(result.$response.error))
        throw `AWS error while ${whileDoingWhat}`
    }
    return result
}
