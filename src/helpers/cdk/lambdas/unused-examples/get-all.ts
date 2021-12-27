import {Runtime} from '@aws-cdk/aws-lambda'
import {makeResponse} from '../api-gateway'

export const handler = async (): Promise<any> => {
    Runtime.NODEJS_14_X;
    return makeResponse(200, `Your list of items is [foo*].`)
};