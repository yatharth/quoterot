# Quote Rot

## Developer Notes

This repo uses [AWS CDK][cdk] to define its instrastructure declaratively. This makes deploying to AWS super easy.

The infrastructure definitions are stored in `infrastructure/`. The “business logic” is stored in `lib/`. The AWS Lambda functions make use of the business logic stored there.


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
* `npm run local` to test out the API locally.
* `npm run deploy` to deploy to AWS.
* `npm run destroy` to tear down whatever has been created.

