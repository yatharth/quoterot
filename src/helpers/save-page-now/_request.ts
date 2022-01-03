import assert from 'assert'
import {URLSearchParams} from 'url'
import got, {AfterResponseHook, BeforeRequestHook} from 'got'


// Add a random _t query parameter to all GET requests, to bust through any cache.
const cacheBuster: BeforeRequestHook = (options) => {

    if (options.method == 'GET') {

        if (!options.searchParams)
            options.searchParams = new URLSearchParams()

        const timestamp = Date.now().toString()
        options.searchParams.set('_t', timestamp)

    }

}


// Ensure response code is 200.
const ensure200Code: AfterResponseHook = (response) => {
    assert(response.statusCode == 200, `Expected status code 200; got ${response.statusCode}.`)
    return response
}


// const refreshCookie: AfterResponseHook = (response, retryWithMergedOptions) => {
//     // Filter for 401 requests.
//     if (response.statusCode != 401) return response
//
//     const updatedOptions = {
//         headers: {
//             'cookie': fetchCookieFromPassword(...)
//         }
//     }
//
//     client.defaults.options.merge(updatedOptions)
//     return retryWithMergedOptions(updatedOptions)
// }


export let baseClient = got.extend({

    prefixUrl: 'https://web.archive.org/save/',

    headers: {

        // Doesn’t affect the response, but nice to include.
        'Accept': 'application/json',

    },

    // Parse response body as JSON.
    responseType: 'json',

    // Set timeout for request in ms.
    timeout: {
        request: 4000,
    },

    // Don’t retry on requests.
    retry: {
        limit: 0,
    },

    hooks: {
        beforeRequest: [cacheBuster],
        afterResponse: [ensure200Code],
    },

})
