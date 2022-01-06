// This stack is responsible for monitoring mentions of @quoterot and
//  replying to them with archive links to quoted tweets.
//
// There are two lambdas:
// - serveWebhook for exposing a webhook for Twitter’s Account Activity API to call
// - registerWebhook for registering the webhook with Twitter
//
// registerWebhook is periodically called just to make sure our webhook is still
//  registered and valid.

import {resolve} from 'app-root-path'

import {App, Duration, Stack, StackProps} from '@aws-cdk/core'

import {addLambdaToEndpoint, makeRestApi} from '../../helpers/cdk/stack/api-gateway'
import {makeLambda, scheduleLambdaEvery} from '../../helpers/cdk/stack/lambda'
import {pathRelativeTo} from '../../helpers/javascript/path'
import {ArchiveInfoStack} from '../archive-info/stack'
import {readSecretsFromEnvFile} from '../../helpers/cdk/stack/secrets'
import {Schedule} from '@aws-cdk/aws-events'


export class ReplyToMentionsStack extends Stack {

    constructor(app: App, stackProps: StackProps, archiveInfoStack: ArchiveInfoStack) {

        super(app, 'ReplyToMentionsStack', stackProps)

        // Helpers for lambdas.
        const pathToLambda = pathRelativeTo(resolve('src/stacks/reply-to-mentions/lambdas/'))
        const secrets = readSecretsFromEnvFile(resolve('secrets/.env'))

        // Twitter webhook to receive events for @quoterot account.
        const serveWebhook = makeLambda(this, 'serveWebhook', pathToLambda('serve-webhook.ts'), secrets)
        archiveInfoStack.archiveInfoTable.connectLambda(serveWebhook)

        // Expose webhook to the world.
        const webhookApi = makeRestApi(this, 'replyToMentionsWebhookApi')
        addLambdaToEndpoint(webhookApi, ['GET', 'POST'], webhookApi.root, serveWebhook, true)

        // Lambda to register our webhook and keep making sure it’s registered.
        const registerWebhook = makeLambda(this, 'registerWebhook', pathToLambda('register-webhook.ts'), secrets)
        registerWebhook.addEnvironment('WEBHOOK_URL', webhookApi.url)

        // Expose helper lambda to the world.
        const helperApi = makeRestApi(this, 'replyToMentionsHelperApi')
        addLambdaToEndpoint(helperApi, ['GET', 'POST'], helperApi.root, registerWebhook, true)

        // Run the helper lambda every so often to check the webhook is still valid.
        const registerWebhookSchedule = Schedule.rate(Duration.hours(4))
        scheduleLambdaEvery(this, 'registerWebhookEventRule', registerWebhook, registerWebhookSchedule)

    }
}