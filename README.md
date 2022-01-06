# @quoterot

People come and go. Links rot. Tweets get deleted.

@quoterot is a simple bot to protect your threads from bit rot.

When you make quote-tweets of other tweets, they become part of the fabric of your thread. If those tweets get lost, your thread might lose vital context too. @quoterot archives tweets you quote so you can recover the original meaning of your threads.


## HOW TO USE?

Follow [@quoterot][] on Twitter and the bot will automatically archive any tweets you quote.

If you go back to one of your threads and find a tweet you quoted has been deleted, you can recover an archived version of it by simply replying and tagging @quoterot. The bot will reply with an archive link if found.

![twitter-profile][]


## FAQ

### Where are quoted tweets archived to?

[The Wayback Machine][wayback].

### Does @quoterot store any data?

No data is stored by @quoterot itself.

### Does this archive tweets I quoted before I followed the bot?

No, the bot only starts archiving tweets you quote after you follow it.

### Can I tag @quoterot in other’s threads? 

Yes. If you encounter someone else’s quote-tweet of a tweet that has since been deleted, you can tag @quoterot, which will see if that deleted tweet had been archived on the Wayback Machine. 


[twitter-profile]: https://user-images.githubusercontent.com/1520684/148296717-3464b96c-3c4d-4f19-8bc0-02648ee0157f.png
[@quoterot]: https://twitter.com/quoterot
[wayback]: https://web.archive.org


## DEVELOPER NOTES

This repo uses infrastructure-as-code to run entirely on AWS.

The project is written in Typescript, and uses [AWS CDK][cdk] to define the infrastructure. The actual code is organised into two micro-services, each of which use lambda functions to work entirely serverlessly. 


### Architecture

The app is split into three “stacks”:

- `ArchiveQuotedTweets` monitors followers of the @quoterot Twitter account and archives any tweets they quote.
- `ReplyToMentions` monitors any mentions of the @quoterot account and replies to them with archive links as needed.
- `ArchiveInfo` is a simple persistence layer to store information about the tweets archived.


### Code layout

Start by looking at the `src/cdk-app.ts` file. It defines the entire app to be run on AWS.

You can look at the files it imports, then at the files those imports, and come to a pretty good understanding of the code.

The source code is organised into two main folders:

- `src/`
    - `cdk-app.ts`: defines the entire app
    - `stacks/`: the stacks that are part of the app
    - `helpers/`: helpers for the business logic inside the stacks
    
The helpers are organised as follows:

- `cdk/`
  - `lambdas/`: CDK helpers to be used inside Lambda functions during run-time
  - `stack/`: CDK helpers for defining the infrastructure at define-time
- `twitter/`
    - `rest-api/`: for calling Twitter’s REST API
- `archiving/`
  - `archive-is/`: for saving pages to [archive.today][]
  - `archive-dot-org/`: for saving pages to [archive.org][]
- `javascript/`: misc helpers with Javascript

There are three stacks, each of which has its own folder:

- `src/stacks/archive-quoted-tweets/`
- `src/stacks/reply-to-mentions/`
- `src/stacks/archive-info/`

Each stack has `stack.ts` file, which defines the stack and imports any AWS resources used by that stack, and sub-folders like `lambdas/`, `tables/`, `queues/`, etc. that define the actual AWS resources inside that stack.

There might also be a `scripts/` sub-folder, which contains useful scripts for things like starting the Twitter webhook locally, sending messages to an AWS queue, etc.

That’s basically it. Most files have a little comment at the top explaining what they are for.


### More detailed architecture

The `archive-quoted-tweets` stack works as follows:

 Cron job → runs **queueFollowersToCheck**  
  → queues to _followersToCheck_ → consumed by **parseFollowerTimeline**  
→ queues to _tweetsToArchive_ → consumed by **archiveTweet**  
→ queues to _savesToCheck_ → consumed by **checkSaveStatus**

In words:

1. The `queueFollowersToCheck` lambda function is run every 12 hours by an AWS Events cron job. It uses the Twitter REST API to get all the followers of the @quoterot accounts and queues the IDs of onto the `followersToCheckQueue` queue.

2. The `parseFollowerTimeline` lambda function consumes that queue. For each follower, the function calls the Twitter REST API to fetch their most recent tweets. If any of them are quote tweets of other  tweets, the URLs of the quoted tweets are put on the `tweetsToArchive` queue.

3. The `archiveTweet` lambda function consumes that queue. If the tweet was already archived, the function is done; otherwise, it requests the Wayback Macine to archive the tweet, and puts the job ID in the `savesToCheck` queue.

4. The `checkSaveRequest` lambda function consumes job IDs after 10-minute delay, to make sure the requested save was successfully completed.

If any of the lambdas fail to process an item, the item is sent to a “Dead Letter Queue” that holds those failed items. 

Error monitoring is done using [Dashbird][dashbird]. It sends an email when any lambda encounters an unexpected error by monitoring the logs.

---

The `reply-to-mention` stack works as follows:

It uses the Twitter Account Activity API to get notified whenever there is activity for the @quoterot account. It defines a webhook for the Account Activity API to call, which then handles the account activity.

The `webhook/` folder defines the webhook itself in an environment-agnostic way. You can run it locally using the `npm run webhook:dev` command or have it run on AWS.

The `lambdas/` folder has two lambdas: `serve-webhook`, which runs the webhook on AWS, and `register-webhook`, which registers the webhook with Twitter.

The `scripts/` folder defines some more useful commands, like `npm run webhook:get` to see the current status of the webhooks and so forth.


### TODOs convention

- `FIXME: <note>` for immediate, high-priority fixes
- `TODO: <note>` for improvements to get around to sometime
- `XXX: <note>` for minor, low-priority wishlist improvements.


## INSTALLATION

If you’re working with Yatharth, follow these instructions, and you’ll be good to go. If you’re deploying this project independently, then make sure to complete the “First-time setup” instructions first, inside the `docs/` folder.


### Getting your AWS tools ready

First, get the AWS CLI tools on your computer. On macOS, this is as easy as:

```shell
brew install awscli
brew install aws-cdk
brew tap aws/tap
brew install sam-cli
```

Then configure the AWL CLI tool.

```shell
aws configure
```

You’ll want to enter:

1. AWS Access ID — enter your secret
2. AWS Secret Access Key — enter your secret
3. Default region — choose `us-east-1` to make life easy.
4. Output format — choose whatever you want; I prefer `text`.

The first two are secrets associated with whichever the IAM account you’re deploying from. Ask [Yatharth][yatharthemail] to send you these, or create your own IAM account using the first-time setup instructions below.

Then run 

```shell
cdk bootstrap
```

To set up CDK for your region.



### Installing the project

Clone this repo using, then install the packages:

```shell
git clone https://github.com/yatharth/quoterot
cd quoterot 
npm install
```

Get some `.env` files from [Yatharth][yatharthemail] if you’re working with him and put them in the `secrets/` folders. They will contain secrets for Twitter and archive.org. If you’re working on your own, follow the first-time setup instructions below to get those secrets.


### Deploying

You can now run:

* `npm run -- cdk:sanitycheck --all` to make sure your CDK configuration looks good.
* `npm run -- cdk:diff --all` to check what resources will be changed on deployment.
* `npm run -- cdk:deploy --all` to deploy to AWS.
* `npm run -- cdk:destroy --all` to tear down whatever has been created.

Don’t forget the `--`. You need it to `npm run` doesn’t steal the command-line arguments for itself, but rather passes them to the cdk command.

For development, you can run 

* `npm run lambdas:watch` to hot-upload any changes to lambda function code near-instantly, show you logs of their execution, and watch for changes
* `npm run webhook:dev` to run the Twitter webhook locally, register it with Twitter, and watch the source file for changes, recompiling as necessary

Both of them speed up development by an order of magnitude.

There’s also other `npm run` commands which you can take a look at. 


