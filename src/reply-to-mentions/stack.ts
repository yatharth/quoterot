import {resolve} from 'app-root-path'

import {App, Stack, StackProps} from '@aws-cdk/core'

import {addLambdaToNewEndpoint, makeRestApi} from '../helpers/cdk/stack/api-gateway'
import {makeLambda} from '../helpers/cdk/stack/lambda'
import {pathRelativeTo} from '../helpers/javascript/path'
import {ArchiveInfoStack} from '../archive-info/stack'
import {readSecretsFromEnvFile} from '../helpers/cdk/stack/secrets'


export class ReplyToMentionsStack extends Stack {

    constructor(app: App, stackProps: StackProps, archiveInfoStack: ArchiveInfoStack) {

        super(app, 'ReplyToMentionsStack', stackProps)


        // HELPERS.

        const api = makeRestApi(this, 'replyToMentionsApi')

        const lambdasDir = resolve('src/reply-to-mentions/lambdas/')
        const pathToLambda = pathRelativeTo(lambdasDir)

        const secrets = readSecretsFromEnvFile(resolve('secrets/.env'))


        // LAMBDAS.

        // Twitter webhook to receive events for @quoterot account.
        const twitterWebhook = makeLambda(this, 'twitterWebhook', pathToLambda('twitter-webhook.ts'), secrets)
        addLambdaToNewEndpoint(api, ['GET', 'POST'], api.root, 'twitterWebhook', twitterWebhook, true)
        archiveInfoStack.archiveInfoTable.connectLambda(twitterWebhook)

    }
}