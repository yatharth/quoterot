import {jsonStringifyPretty} from '../../javascript/stringify'


function throwError(errors: unknown, forWhat: string) {
    console.error(`API response for ${forWhat} had errors:`)
    console.error(jsonStringifyPretty(errors))
    throw `API response for ${forWhat} had errors.`
}

type Errors = { detail?: string }[]
type WithErrors = { errors?: Errors, _realData?: { errors?: Errors } }

function verifyNoErrorsHelper(errors: Errors, forWhat: string, acceptableErrorMessages: string[] = []) {

    const unacceptableErrors = errors.filter(error =>
        !error.detail || acceptableErrorMessages.every(msg => !error.detail?.includes(msg)) )

    if (unacceptableErrors.length) {
        throwError(unacceptableErrors, forWhat)
    }
}

export function verifyNoErrors(result: WithErrors, forWhat: string, acceptableErrorMessages: string[] = []) {

    // Most results returned by the twitter-api-v2 library have an errors field.
    //  I just make sure it’s empty, to not let any bugs silently pass.

    if (result.errors) {
        verifyNoErrorsHelper(result.errors, forWhat, acceptableErrorMessages)
    }

    // Sometimes, e.g. when fetching timeline of locked account, the returned TweetUserTimelineV2Paginator
    //  object has errors, but does not expose them through a result.errors field. Instead, I have to
    //  to access the protected variable _realData to peek around.

    if (result._realData?.errors) {
        verifyNoErrorsHelper(result._realData?.errors, forWhat, acceptableErrorMessages)
    }

}