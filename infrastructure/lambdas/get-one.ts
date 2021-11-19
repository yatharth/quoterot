import {makeResponse} from './helpers/response'

export const handler = async (event: any = {}): Promise<any> => {

    const requestedId = event.pathParameters.id;
    if (!requestedId) {
        return makeResponse(400, "Error: You are missing the path parameter id");
    }

    try {

        if (!requestedId.startsWith("foo")) {
            return makeResponse(404, `No resource called ${requestedId} found.`);
        }

        return makeResponse(200, `We found a resource called ${requestedId}.`);

    } catch (error) {
        return makeResponse(500, `Unknown error: ${error}`);
    }

};