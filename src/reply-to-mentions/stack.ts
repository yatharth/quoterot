import {resolve} from 'app-root-path'

import {App, Stack} from '@aws-cdk/core'

import {addLambdaToNewEndpoint, makeRestApi} from '../helpers/cdk/stack/api-gateway'
import {makeLambda} from '../helpers/cdk/stack/lambda'
import {pathRelativeTo} from '../helpers/javascript/path'
import {Table} from '@aws-cdk/aws-dynamodb'
import {connectLambdaToTable} from '../helpers/cdk/stack/dynamodb'


export class ReplyToMentionsStack extends Stack {
    constructor(app: App, archivedTweetsTable: Table) {

        super(app, 'ReplyToMentionsStack')

        // GENERAL STUFF.

        // API gateway used by all endpoints.
        const api = makeRestApi(this, 'replyToMentionsApi')

        // Lambda directory.
        const lambdasDir = resolve('src/reply-to-mentions/lambdas/')
        const pathToLambda = pathRelativeTo(lambdasDir)

        // Twitter webhook to receive events for @quoterot account.
        const twitterWebhook = makeLambda(this, 'twitterWebhook', pathToLambda('twitter-webhook.ts'), {})
        addLambdaToNewEndpoint(api, ['GET', 'POST'], api.root, 'twitterWebhook', twitterWebhook, true)
        connectLambdaToTable(twitterWebhook, archivedTweetsTable)

    }
}