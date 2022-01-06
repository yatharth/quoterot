// This file defines the entire app to be run on AWS.
//
// The app is split into three different “stacks”:
//
// - `ArchiveQuotedTweetsStack` monitors followers of the @quoterot Twitter account and archives any tweets they quote.
// - `ReplyToMentionsStack` monitors any mentions of the @quoterot account and replies to them with archive links as needed.
// - `ArchiveInfoStack` is a simple persistence layer to store information about the tweets archived.
//
// Each stack is defined in its own folder. The folders have a `stack.ts` file, which defines the stack,
//  and initialises any resources used by that stack. The resources are put into folders like `lambdas/`, `tables/`,
//  `queues/`, etc.


import {App, StackProps, Tags} from '@aws-cdk/core'

import {ArchiveQuotedTweetsStack} from './stacks/archive-quoted-tweets/stack'
import {ReplyToMentionsStack} from './stacks/reply-to-mentions/stack'
import {ArchiveInfoStack} from './stacks/archive-info/stack'


const stackProps: StackProps = {

    // WHY DO I SELECT A PARTICULAR ENVIRONMENT?
    //
    // There is a difference between “environment-agnostic” stacks and stacks pinned to a particular environment.
    //  The latter kind have more features available to them. In particular, I needed to make environment-specific
    //  stacks so that cdk-watch would work. cdk-watch is a library that allows for easy hot-swapping of lambda functions
    //  during development, making debugging them very easy.
    env: {
        region: 'us-east-1',
    },

}


// WHY DO I PASS THE `ArchiveInfoStack` TO THE OTHER STACKS?
//
// Here, I instantiate all the stacks. The `ArchiveInfoStack` instance is passed to the other two stacks,
//  as they use a construct from it in their definitions.

const app = new App()

const archiveInfoStack = new ArchiveInfoStack(app, stackProps)
new ArchiveQuotedTweetsStack(app, stackProps, archiveInfoStack)
new ReplyToMentionsStack(app, stackProps, archiveInfoStack)

Tags.of(app).add("app", "quoterot")

app.synth()
