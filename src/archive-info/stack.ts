import {App, Stack, StackProps} from '@aws-cdk/core'

import {DynamoDbTable} from '../helpers/cdk/stack/dynamodb'
import {archiveInfoTableParams} from './tables/archive-info'

export class ArchiveInfoStack extends Stack {

    // Make this available for other stacks to use.
    archiveInfoTable: DynamoDbTable

    constructor(app: App, stackProps: StackProps) {

        super(app, 'ArchiveInfoStack', stackProps)

        this.archiveInfoTable = new DynamoDbTable(this, archiveInfoTableParams)

    }


}