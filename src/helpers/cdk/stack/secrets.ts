// Helper for passing secrets and environment variables to lambda fucntions.

import dotenv from 'dotenv'
import * as fs from 'fs'

import {Function} from '@aws-cdk/aws-lambda'

import {readFromEnv} from '../lambdas/secrets'


function verifySecretName(secretName: string) {
    if (!/^\w+$/.test(secretName)) throw "Environment variables can only be alphanumeric with underscores in AWS Lambda."
}

export function passSecretToLambda(lambda: Function, secretName: string): void {
    verifySecretName(secretName)
    const secret = readFromEnv(secretName)
    lambda.addEnvironment(secretName, secret)
}

export function passSecretsToLambda(lambda: Function, secretNames: string[]): void {
    for (const secretName of secretNames) {
        passSecretToLambda(lambda, secretName)
    }
}

export function readSecretsFromEnvFile(envFile: string): Record<string, string> {
    const secrets = dotenv.parse(fs.readFileSync(envFile, 'utf8'), {debug: true})
    if (!secrets) throw `No secrets read from .env file ${envFile}`
    Object.keys(secrets).forEach(verifySecretName)
    return secrets
}
