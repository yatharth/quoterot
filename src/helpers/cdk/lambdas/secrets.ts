// Access secrets, from within the AWS Lambda environment or the local environment.

// There should be NO process.env calls anywhere in the repo except here.
//  This way, you can see ALL the environment variables the repo uses by looking at usages of this function.

export function readFromEnv(secretName: string) {
    const secret = process.env[secretName]?.trim()
    if (!secret) throw `Secret ${secretName} not found in environment.`
    return secret
}


// WHY DON’T I USE AWS SECRETS MANAGER?
//
// I could have used AWS Secrets Manager. However, I don’t. The CDK library (@aws-cdk/aws-secretsmanager) doesn’t
//  let you create or update the value of a secret from pre-existing strings. This supposedly to prevent people
//  from accidentally committing strings to code. This is frustrating. So I’d have to update AWS secrets using a
//  a companion script. Even if I did, the convention is for the lambdas to read the secrets passed in through an
//  environment variable anyway. So at that point, I would be storing secrets locally, having a companion script
//  upload them to AWS Secrets, then pull then from my CDK infrastructure code, only to pass them as environment
//  variables. At that point, I can just read the secrets locally and pass them in as local environment variables
//  directly. So that’s what I do.
