# Quote Rot

## Developer Notes

This repo uses [AWS CDK][cdk] to define its instrastructure declaratively. This makes deploying to AWS super easy.

Error monitoring is done using [Dashbird][dashbird].


### Code layout

- `src/`
    - `infrastructure/`
      - `stack/`: defines the entire infrastructure stack
      - `lambdas/`: individual lambda functions
    - `lib/`: domain-specific helper code
      - `twitter/` for accessing the Twitter API
      - `archiving/` for accessing web archiving APIs


### AWS architecture

1. EventBridge event rule runs every so often.
2. This triggers a lambda function called `checkFollowersToQueue`.
3. That lambda checks our `@quoterot` Twitter bot’s followers on Twitter, then puts all of them in an SQS queue `followersToCheckQueue`.
4. That queue feeds into a lambda function called `parseFollowerTimelines`, which takes a follower, pulls in their tweets from the last day or few hours, sees which ones quote other tweets, and makes a list of those quoted tweets.
5. Those quotes tweets get inserted into an SQS queue called `tweetsToArchiveQueue`.
6. That queue feeds into a lambda function called `archiveTweets` which then requests an online web archiving system to archive those quoted tweets for future reference.

Right now, parts (1–5) are implemented; (6) is not.


### Documentation

`docs/infrastructure/` contains some miscellanous personal notes on using CDK. That’s about it.



## Installation

### Getting your AWS tools ready

First, get the AWS CLI tools on your computer. On macOS, this is as easy as:

```
brew install awscli
brew install aws-cdk
brew tap aws/tap
brew install sam-cli
```

Then configure the AWL CLI tool.

```
aws configure
```

You’ll want to enter:

1. AWS Access ID.
2. AWS Secret Access Key.
3. Default region — choose `us-east-1` to make life easy.
4. Output format — choose whatever you want; I prefer `text`.

The first two are secrets associated with whichever the IAM account you’re deploying from. If you’re working with [Yatharth][yatharthemail], he’ll have sent you these; otherwise, create your own IAM account using the one-time setup below.




### Installing the project

Clone this repo using, then install the packages:

```
git clone https://github.com/yatharth/quoterot
cd quoterot 
npm install
```

### Deploying and testing

You can now run

* `npm run sanitycheck` to make sure your CDK configuration looks good.
* `npm run diff` to check what resources will be changed on deployment.
* `npm run local` to test out the API locally with SAM.
* `npm run deploy` to deploy to AWS.
* `npm run destroy` to tear down whatever has been created.


### Testing locally 

You can do a limited amount of testing locally. 

You need to have Docker installed and running. Then just run `npm run local`.

This uses AWS SAM under the hood. SAM can run the API gateway and the lambda functions locally, but it can’t simulate SQS, SNS, or other services. Thus, you’ll have to already have deployed these resources those to AWS, have captured their URLs or ARNs, and then pass those in as environment variables into the lambda functions appropriately. This is complicated enough that I haven’t bothered doing this.


## First-time setup

You can ignore this, if you are working with Yatharth, as this only needs to be done once and is separate from the codebase. These steps can’t be automated or declared with code, unfortunately.


### AWS

1. Create an IAM user using the online AWS console.
2. Be sure to note down the Access ID and Secret Access Key associated with it.


### Twitter

1. Go to the Twitter Developer Portal and apply for access to the v2 API. Wait for approval.
2. Go to your Twitter Developer Portal and note down the secrets for your project.
3. Add them here. 


### Dashbird

1. Create a [Dashbird][dashbird] account. Connect it to your AWS using the steps they walk you through.
2. Add all the emails you want to be notified in case of an error.
3. Create a Resource Group with all the Lambdas.
4. Create 2 Alarms for when the maximum of error counts or throttles exceeds 0.
5. Test to see if everything works.


[cdk]: https://aws.amazon.com/cdk/
[dashbird]: https://dashbird.io
[yatharthemail]: mailto:yatharth999@gmail.com