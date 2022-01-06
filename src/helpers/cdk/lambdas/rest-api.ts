// Helpers for constructing a nice REST API that uses query parameters, JSON data, etc.

import {parse, ParsedQs} from 'qs'


// This a nice agnostic type to hold query parameters.
// It’s the default type used by Express servers, and it’s easy enough
//  to parse any raw query string into this type.
export type QueryParameters = ParsedQs
export const parseQueryString = parse

export const parseJSONData = (rawData?: string|null) => JSON.parse(rawData || '{}')


// const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const
// export type HttpMethod = typeof HTTP_METHODS[number]
//
// export function isHttpMethod(method: string): method is HttpMethod {
//     return HTTP_METHODS.includes(method as HttpMethod)
// }
