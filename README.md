# Quote Rot

## Developer Notes

This repo uses [AWS CDK][cdk] to define its instrastructure declaratively. This makes deploying to AWS super easy.

[cdk]: https://aws.amazon.com/cdk/


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

The first two are secrets for the IAM account you’re deploying from. Ask [Yatharth][yatharth_contact] for these if you don’t have them already, or make your own.

[yatharth_contact]: mailto:yatharth999@gmail.com


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
