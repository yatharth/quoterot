# Quote Rot


## Developer Notes

This repo uses [AWS CDK][cdk] to define its infrastructure declaratively. This makes deploying to AWS super easy.

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

If you’re working with Yatharth, follow these instructions, and you’ll be good to go. If you’re deploying this project independently, then make sure to complete the “First-time setup” section below first.


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

Create a file called `TWITTER_V2_BEARER_TOKEN` inside the `secrets/` folder. Paste bearer token secret for Twitter API access. Ask [Yatharth][yatharthemail] for this, or create your own using the first-time setup instructions below.


### Deploying and testing

You can now run

* `npm run sanitycheck` to make sure your CDK configuration looks good.
* `npm run diff` to check what resources will be changed on deployment.
* `npm run local` to test out the API locally with SAM.
* `npm run deploy` to deploy to AWS.
* `npm run destroy` to tear down whatever has been created.

You can run with specific stacks! In this case . . . TODO: blah


### Testing locally 

You can do a limited amount of testing locally. 

You need to have Docker installed and running. Then just run `npm run local`.

This uses AWS SAM under the hood. SAM can run the API gateway and the lambda functions locally, but it can’t simulate SQS, SNS, or other services. Thus, you’ll have to already have deployed these resources those to AWS, have captured their URLs or ARNs, and then pass those in as environment variables into the lambda functions appropriately. This is complicated enough that I haven’t bothered doing this.



## First-time setup

If you’re working with Yatharth, ignore this section. He’s done this already.

If you’re deploying this project independently, then follow these instructions. These steps can’t be automated or declared with code, unfortunately. So they have to be done manually.


### AWS

1. Create an IAM user using [this guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html).
2. On the Details page, check both “AWS Management Console access” and “Programmatic access”. The latter generates an Access ID and Secret Access Key for the user that you’ll need for the AWS CLI.
3. Note down the Access ID and Secret Access Key.


### Twitter

1. Go to the Twitter Developer Portal and apply for access to the v2 API. Wait for approval.
2. In the portal, find your project, and note down its consumer secrets.
3. Generate a bearer token and note it down. 
4. Generate OAuth secrets and note them down.
5. Generate access token secrets and note them down.
6. Apply for Elevated access (to use the Account Activity API). Wait for approval.
7. In the portal, create an Account Activity API dev environment and note its name down.


### Dashbird

1. Create a [Dashbird][dashbird] account. Connect it to your AWS using the steps they walk you through.
2. Add all the emails you want to be notified in case of an error.
3. Create a Resource Group with all the Lambdas.
4. Create 2 Alarms for when the error counts or throttles exceeds 0.


[cdk]: https://aws.amazon.com/cdk/
[dashbird]: https://dashbird.io
[yatharthemail]: mailto:yatharth999@gmail.com
