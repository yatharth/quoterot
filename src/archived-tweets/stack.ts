// import {resolve} from 'app-root-path'

import {App, Stack} from '@aws-cdk/core'

import {makeTable} from '../helpers/cdk/stack/dynamodb'
import {Table} from '@aws-cdk/aws-dynamodb'
import {TweetId} from './store/types'
// import {pathRelativeTo} from '../helpers/javascript/path'


export class ArchivedTweetsStack extends Stack {

    public archivedTweetsTable: Table

    constructor(app: App) {

        super(app, 'ArchivedTweetsStack')

        this.archivedTweetsTable = makeTable(this, 'archivedTweetsTable', TweetId)

        // const lambdasDir = resolve('src/archived-tweets/lambdas/')
        // const pathToLambda = pathRelativeTo(lambdasDir)
        //
        // pathToLambda
        // archivedTweetsTable

    }


}