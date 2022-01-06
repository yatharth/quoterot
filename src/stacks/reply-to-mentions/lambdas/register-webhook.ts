// Register our webhook running on AWS with Twitter.

import {Record, String, Array, Boolean} from 'runtypes'

import {ScheduledEvent} from 'aws-lambda/trigger/cloudwatch-events'

import {readFromEnv} from '../../../helpers/cdk/lambdas/secrets'
import {
    APIGatewayEventType,
    APIGatewayReturnType,
    logAndMakeResponse,
    makeResponse,
} from '../../../helpers/cdk/lambdas/api-gateway'
import {autohook} from '../scripts/_autohook'
import {jsonStringifyPretty} from '../../../helpers/javascript/stringify'


const ExistingWebhooks = Array(Record({
    id: String,
    url: String,
    valid: Boolean,
    created_timestamp: String,
}))


export async function handler(event: APIGatewayEventType | ScheduledEvent): Promise<APIGatewayReturnType> {

    const webhookUrl = readFromEnv('WEBHOOK_URL')

    const rawExistingWebhooks = await autohook.getWebhooks()
    const existingWebhooks = ExistingWebhooks.check(rawExistingWebhooks)
    const existingWebhook = existingWebhooks[0]

    if (existingWebhook && existingWebhook.url == webhookUrl && existingWebhook.valid) {
        return logAndMakeResponse(200, `Our webhook is already registered and valid; nothing to do: ${webhookUrl}`)
    }

    if (existingWebhook && existingWebhook.url == webhookUrl) {
        console.log("Our webhook was registered, but had become invalid. Reregistering.")
    }

    if (existingWebhook && existingWebhook.url != webhookUrl && existingWebhook.valid) {
        console.log("There was a different webhook registered, which we will now remove.")
        console.log(jsonStringifyPretty(existingWebhooks))
    }

    await autohook.removeWebhooks()
    await autohook.start(webhookUrl)
    await autohook.subscribe({
        oauth_token: readFromEnv('TWITTER_ACCESS_TOKEN'),
        oauth_token_secret: readFromEnv('TWITTER_ACCESS_TOKEN_SECRET'),
    })

    console.log(`Successfully registered our webhook: ${webhookUrl}`)


    // TODO: Really, we should have a different lambda called verifyWebhook whose job it is to
    //  to throw on error, and this lambda called registerWebhook whose semantics are to not throw.
    //  Then any post-deployment CDK triggers ot automatic CloudWatch rules can call verifyWebhook,
    //  while any manual API calls can call registerWebhook.

    // The triggering event is either an API Gateway event, if we called the API endpoint manually.
    // Or it is the CloudWatch Event rule triggering this lambda function.
    const triggeredByAutomaticRule = 'detail-type' in event

    // If this lambda was called manually using its API Gateway endpoint, return success.
    // Otherwise, if it was part of a routine check, then throw an error to make sure we get notified our
    // webhook wasn’t registered and valid when the check ran.
    if (triggeredByAutomaticRule) {
        throw "On a routine check of the webhook, we found our webhook wasn’t registered and valid."
    } else {
        return makeResponse(200, `Successfully registered our webhook: ${webhookUrl}`)
    }

}
