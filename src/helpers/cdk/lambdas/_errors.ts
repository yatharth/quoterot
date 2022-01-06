import {PromiseResult} from 'aws-sdk/lib/request'
import {AWSError} from 'aws-sdk/lib/error'

import {jsonStringifyPretty} from '../../javascript/stringify'


// AWS API calls often return a result object annotated with some error codes.
// This function check to make explicitly sure no errors were returned.
export function verifyNoError<T>(result: PromiseResult<T, AWSError>, whileDoingWhat: string): T {

    if (result.$response.error) {
        console.error(`AWS error while ${whileDoingWhat}:`)
        console.error(jsonStringifyPretty(result.$response.error))
        throw `AWS error while ${whileDoingWhat}.`
    }

    // The result object is returned so callers can easily do a `return verifyNoError(result, "...")` in their code.
    return result

}
