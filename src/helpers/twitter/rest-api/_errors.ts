import {jsonStringifyPretty} from '../../javascript/stringify'


function throwError(errors: unknown, forWhat: string) {
    throw `API response for ${forWhat} had errors: ${jsonStringifyPretty(errors)}`
}

export function verifyNoErrors(result: any, forWhat: string) {

    // Most results returned by the twitter-api-v2 library have an errors field.
    //  I just make sure it’s empty, to not let any bugs silently pass.

    if (result.errors) {
        throwError(result.errors, forWhat)
    }

    // Sometimes, e.g. when fetching timeline of locked account, the returned TweetUserTimelineV2Paginator
    //  object has errors, but does not expose them through a result.errors field. Instead, I have to
    //  to access the protected variable _realData to peek around.

    if (result._realData?.errors) {
        throwError(result._realData.errors, forWhat)
    }

}