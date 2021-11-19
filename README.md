# Quote Rot

## Developer Notes

This repo uses AWS CDK to define the instrastructure it is deployed on declaratively. This makes deploying the code super easy.

The infrastructure definitions are stored in `infrastructure/`. The “business logic” is stored in `lib/`. The AWS Lambda functions make use of this business logic stored there.


## Installation

### Getting your AWS tools ready

Get the AWS CLI tools for CDK and SAM. On macOS, this is as easy as:

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
3. Default region (choose `us-east-1` to make life easy).
4. Output format (choose whatever; I prefer `text`).

The first two are secrets for whatever IAM account you’re deploying from.


### Installing the package

Clone this repo, then run:

```
npm install
```

### Deploying and testing

You can now run

* `npm run sanitycheck` to make sure your CDK configuration looks good.
* `npm run local` to test out the API locally.
* `npm run deploy` to deploy to AWS.
* `npm run destroy` to tear down whatever has been created.

