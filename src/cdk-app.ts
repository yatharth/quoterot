import {App} from '@aws-cdk/core'

import {ArchiveQuotedTweetsStack} from './archive-quoted-tweets/stack'
import {ReplyToMentionsStack} from './reply-to-mentions/stack'
import {TestStack} from './test-stack/stack'
import {ArchivedTweetsStack} from './archived-tweets/stack'


const app = new App()
const archivedTweetStack = new ArchivedTweetsStack(app)
new ArchiveQuotedTweetsStack(app, archivedTweetStack.archivedTweetsTable)
new ReplyToMentionsStack(app, archivedTweetStack.archivedTweetsTable)
new TestStack(app)
app.synth()