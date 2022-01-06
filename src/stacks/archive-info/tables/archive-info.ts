import {Record, Static, String} from 'runtypes'

import {parseCanonicalTweetUrl} from '../../../helpers/twitter/rest-api/tweet'
import {TableDefinition} from '../../../helpers/cdk/lambdas/table-definition'
import {TableClient} from '../../../helpers/cdk/lambdas/table-client'


/* WHY DOES THIS TABLE EXIST?

The purpose of this table is as thus:

 Sometimes the username behind a tweet can change.
 The tweet id won’t change, though.

But to get the archive url, we need to know the original link as we saved it, which includes the username as we saved it under.
 Thus, we want store for each tweet id the username and tweet URL as we last requested it be saved.

This way, if we save a URL, we’ll know how to find it again. */


/* Table definition */

const PARTITION_KEY = 'tweetId'
const TABLE_ID = 'archiveInfo'
const TABLE_NAME_ENV_VAR = `${TABLE_ID}TableName`  // No hyphens allowed by AWS Lambda, and CFN outputs remove underscores.

export const archiveInfoDefinition: TableDefinition = {
    id: TABLE_ID,
    partitionKey: PARTITION_KEY,
    tableNameEnvVar: TABLE_NAME_ENV_VAR,
}


/* Type of records. */

const ArchiveInfo = Record({

    [PARTITION_KEY]: String,

    usernameAsLastSeen: String,
    urlAsLastSeen: String,

})

type ArchiveInfo = Static<typeof ArchiveInfo>

// In the future, we could store more data, such as:
//
//     saveStatus: Union(Literal('pending'), Literal('success'), Literal('error')),
//     saveUrl: String.optional(),
//     saveTime: String.optional(),
//
//     saveRequestHistory: Array(Unknown),
//
//     tweetObject: Unknown.optional(),
//     userObject: Unknown.optional(),
//
// For now, keeping it very simple.


/* Operations on table. */

const archiveInfoClient = new TableClient<ArchiveInfo>(archiveInfoDefinition)

export async function recordTweetUrl(tweetUrl: string) {

    const {username, tweetId} = parseCanonicalTweetUrl(tweetUrl)

    // This will overwrite an item if it exists, which suits us just fine.
    await archiveInfoClient.putInTable({
        tweetId: tweetId,
        usernameAsLastSeen: username,
        urlAsLastSeen: tweetUrl,
    })

}

export async function getUrlAsLastSeen(tweetId: string): Promise<string | undefined> {

    const item = await archiveInfoClient.fetchItemByKey(tweetId)

    if (!item) return

    const archiveInfo = ArchiveInfo.check(item)
    return archiveInfo.urlAsLastSeen

}
