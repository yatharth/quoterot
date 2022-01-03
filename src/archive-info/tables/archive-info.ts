import {Record, Static, String} from 'runtypes'

import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'
import {fetchItemByKey, makeDynamoClient, putInTable, TableParams} from '../../helpers/cdk/lambdas/dynamodb'
import {parseCanonicalTweetUrl} from '../../helpers/twitter/rest-api/tweet'


/* WHY DOES THIS TABLE EXIST?

The purpose of this table is as thus:

 Sometimes the username behind a tweet can change.
 The tweet id won’t change, though.

But to get the archive url, we need to know the link as we saved, which includes the username as we saved it.
 Thus, we want a simple mapping from tweet id to the username and tweet URL as we last requested it be saved.

This way, if we save a URL, we’ll know how to find it again. */


const PARTITION_KEY = 'tweetId'
const TABLE_ID = 'archiveInfo'
const TABLE_NAME_ENV_VAR = `${TABLE_ID}TableName`  // No hyphens allowed by AWS Lambda, and CFN outputs remove underscores.

export const archiveInfoTableParams: TableParams = {
    id: TABLE_ID,
    partitionKey: PARTITION_KEY,
    tableNameEnvVar: TABLE_NAME_ENV_VAR,
}


/* Types */

const ArchiveInfo = Record({

    [PARTITION_KEY]: String,

    usernameAsLastSeen: String,
    urlAsLastSeen: String,

})

type ArchiveInfo = Static<typeof ArchiveInfo>

// In the future, we could store more data, such as:
//
// export const ArchiveInfo = Record({
//
//     [partitionKey]: String,
//
//     usernameAsLastSeen: String,
//     urlAsLastSeen: String,
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
// })
//
// For now, keeping it very simple.


/* Functions for serverless code. */

const readTableName = () => readFromEnv(TABLE_NAME_ENV_VAR)

export async function recordTweetUrl(tweetUrl: string) {

    const {username, tweetId} = parseCanonicalTweetUrl(tweetUrl)

    // This will overwrite an item if it exists, which suits us just fine.
    await putInTable<ArchiveInfo>(makeDynamoClient(), readTableName(), {
        tweetId: tweetId,
        usernameAsLastSeen: username,
        urlAsLastSeen: tweetUrl,
    })

}

export async function getUrlAsLastSeen(tweetId: string): Promise<string | undefined> {

    const item = await fetchItemByKey<ArchiveInfo>(makeDynamoClient(), readTableName(), {
        tweetId: tweetId,
    })

    if (!item) return
    const archiveInfo = ArchiveInfo.check(item)
    return archiveInfo.urlAsLastSeen

}
