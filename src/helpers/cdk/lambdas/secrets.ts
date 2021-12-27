// Access secrets, from within the AWS Lambda environment or the local environment.

// TODO: Make sure no process.env anywhere.

// There should be NO process.env calls anywhere in the repo except here.
//  This way, you can see ALL the environment variables the repo uses by looking at usages of this function.

export function readSecret(secretName: string) {
    const secret = process.env[secretName]?.trim()
    if (!secret) throw `Secret ${secretName} not found in environment.`
    return secret
}

