# Quote Rot

## Developer Notes

This repo uses [AWS CDK][cdk] to define its instrastructure declaratively. This makes deploying to AWS super easy.

The infrastructure definitions are stored in `infrastructure/`. The “business logic” is stored in `lib/`. The AWS Lambda functions make use of the business logic stored there.

<!-- TODO: explain the SNS, SQS layout etc.; service structure  -->


[cdk]: https://aws.amazon.com/cdk/


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


### Installing the package

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

You can do a limited amount of testing locally. This uses AWS SAM under the hood. 

You need to have Docker installed and running. Then just run `npm run local`.

SAM can run the API gateway lambda functions, but it can’t simulate SQS, SNS, or other services. Thus, you’ll have to already have deployed these resources those to AWS, have captured their URLs or ARNs, and then pass those in as environment variables into the lambda functions appropriately. I haven’t figured out or cared to do this.

```
