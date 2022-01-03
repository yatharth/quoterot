import {jsonStringifyPretty} from './stringify'


/*

For errors, I recommend handling them this way:

- use assert() calls for assumptions your code makes about runtime guarantees.
- use throw "..." for operational errors you foresee encountering at runtime.

The error messages should be short, and of the form “Expected X to be Y, but was Z.”
This way, if there are 50 repeated errors, they can be grouped together.

To print extra debugging information in a function, wrap your code in a try/catch as so:

    try {
        ...
    } catch (err) {
        errValue('param1', param1)
        errValue('response', response)
        throw err
    }

This will make sure those variables get printed in the logs right before your error.

 */


function formatValue(name: string, value: unknown) {
    return `${name} = ${jsonStringifyPretty(value)}`
}

export function logValue(name: string, value: unknown) {
    console.log(formatValue(name, value))
}

export function errValue(name: string, value: unknown) {
    console.error(formatValue(name, value))
}