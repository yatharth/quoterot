import * as fs from 'fs'
import {join} from 'path'
import {resolve} from 'app-root-path'

import {Function} from '@aws-cdk/aws-lambda'


// Instead of using AWS secrets, I just read the secrets from a local (Git-ignored) folder and pass them
//  into my lambda functions as environment variables.
// Why? Because @aws-cdk/aws-secretsmanager doesn’t actually let you create or update the value of a secret
//  from a pre-existing strings (to help prevent people from accidentally committing secrets to code).
// So you would have to update the AWS secret using a separate companion script anyway.
// And even then, I think it’s normal to fetch the secret in the CDK code and pass it to the lambda function
//  as an environment variable.
// Thus,  at that point, one may as well do pass in the secrets from the local folder directly.

const secretsFolder = resolve('secrets/')

export function readLocalSecret(secretName: string) {
    const secretFile = join(secretsFolder, secretName)
    const secret = fs.readFileSync(secretFile, 'utf8').trim()
    if (!secret) throw `Secret ${secretName} was empty.`
    return secret
}

export function passLocalSecretToFunction(lambda: Function, secretName: string) {
    const secret = readLocalSecret(secretName)
    lambda.addEnvironment(secretName, secret)
}
