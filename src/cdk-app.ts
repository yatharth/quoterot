import {App, StackProps} from '@aws-cdk/core'

import {ArchiveQuotedTweetsStack} from './archive-quoted-tweets/stack'
// import {ReplyToMentionsStack} from './reply-to-mentions/stack'
// import {TestStack} from './test-stack/stack'
import {ArchiveInfoStack} from './archive-info/stack'


const stackProps: StackProps = {
    env: {
        region: 'us-east-1',
    },
}

const app = new App()
const archiveInfoStack = new ArchiveInfoStack(app, stackProps)
new ArchiveQuotedTweetsStack(app, stackProps, archiveInfoStack)
// new ReplyToMentionsStack(app, stackProps, archiveInfoStack)
// new TestStack(app, stackProps)
app.synth()
