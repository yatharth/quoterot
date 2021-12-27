import {Function} from '@aws-cdk/aws-lambda'

import {readSecret} from '../lambdas/secrets'


export function passSecretToLambda(lambda: Function, secretName: string) {
    const secret = readSecret(secretName)
    lambda.addEnvironment(secretName, secret)
}

export function passSecretsToLambda(lambda: Function, secretNames: string[]) {
    for (const secretName of secretNames) {
        passSecretToLambda(lambda, secretName)
    }
}

function getSecretsPrefixedWith(prefix: string) {
    const envVars = Object.keys(process.env)
    return envVars.filter(envVar => envVar.startsWith(prefix))
}

export function passSecretsToLambdaPrefixedWith(lambda: Function, prefix: string) {
    const secretNames = getSecretsPrefixedWith(prefix)
    passSecretsToLambda(lambda, secretNames)
}
