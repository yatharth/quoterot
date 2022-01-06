// The ArchiveInfoStack just defines a simple table to record some information about the tweets we archive.
//
// It is needed, because when we save tweets, we save them by a particular URL, like https://twitter.com/mrbean/status/364372659274569425748
// While that number in the URL is the tweet ID and never changes, the username might change. It the account does change their username,
//  we won’t be able to find the link as originally archived, unless we remember the original username.
// Therefore, we keep track of the original username and URL as we saw it when archiving tweets.


import {App, Stack, StackProps} from '@aws-cdk/core'

import {TableInfrastructure} from '../../helpers/cdk/stack/table-infra'
import {archiveInfoDefinition} from './tables/archive-info'


export class ArchiveInfoStack extends Stack {

    // WHY DOES THIS INSTANCE VARIABLE EXIST?
    // This way, the table can be made available for other stacks to use.
    archiveInfoTable: TableInfrastructure

    constructor(app: App, stackProps: StackProps) {

        super(app, 'ArchiveInfoStack', stackProps)

        this.archiveInfoTable = new TableInfrastructure(this, archiveInfoDefinition)

    }


}