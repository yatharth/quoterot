import {Got} from 'got'

import {jsonStringifyPretty} from '../javascript/stringify'
import {baseClient} from './_request'
import {authenticateClient, PasswordAuth, readAuthFromEnvironment} from './_auth'


// XXX: Could consider turning this into an npm package, under the name save-page-now
// XXX: Consider converting types to runtypes, so can validate at RunTime.

// Documentation for Save Page Now API:
//  https://docs.google.com/document/d/1Nsv52MvSjbLb2PCpHlat0gkzw0EvtSgpKHu4mk0MnrA/edit#


export type UserStatus = Partial<{
    available: number,
    daily_captures: number,
    daily_captures_limit: number,
    processing: number,
}>

type PendingJobStatus = {
    status: 'pending',
    resources: unknown[],
}

type ErrorJobStatus = {
    status: 'error',
    status_ext: string,
    message: string,
}

type SuccessJobStatus = {
    status: 'success',

    original_url: string,
    first_archive?: boolean,

    resources: string[],
    outlinks: string[],
    counters: { outlinks: number, embeds: number },

    timestamp: string,
    duration_sec: number,
}

export type JobStatus = Partial<{
    job_id: string,
} & (SuccessJobStatus | PendingJobStatus | ErrorJobStatus)>

type SuccessSaveRequest = {
    job_id: string,
}

type ErrorSaveRequest = {
    message: string,
}

export type SaveRequest = Partial<{
    url: string,
} & (SuccessSaveRequest | ErrorSaveRequest | ErrorJobStatus)>


export type SaveRequestResult = {
    status: 'success'
    jobId: string,
} | {
    status: 'alreadyExists',
    response: Partial<ErrorSaveRequest>,
} | {
    status: 'hostBusy',
    response: Partial<ErrorJobStatus>,
}


export default class SavePageNow {

    /* Client and authentication */

    client: Got = baseClient

    async authenticate(auth: PasswordAuth) {
        this.client = await authenticateClient(this.client, auth)
    }

    /* Construction */

    // Forbid construction, as people might forget to call authenticate().
    private constructor() {}

    // Instead, people can use this to asynchronously construct & authenticate.
    static async create(auth?: PasswordAuth) {
        if (!auth) auth = readAuthFromEnvironment()
        const spn = new SavePageNow()
        await spn.authenticate(auth)
        return spn
    }

    /* Methods */

    async fetchUserStatus() {
        const data = await this.client.get('status/user').json()
        return data as UserStatus
    }

    async fetchJobStatus(jobId: string) {
        // Alternatively, client.post('status', { form: { job_id: jobId } })
        const data = await this.client.get(`status/${jobId}`).json()
        return data as JobStatus
    }

    async fetchJobStatuses(jobIds: string[]) {
        const data = await this.client.post('status', {form: {job_ids: jobIds.join(',')}}).json()
        return data as JobStatus[]
    }

    // This will error if the URL has been archived in the last 30 days.
    async requestSave(url: string): Promise<SaveRequestResult> {

        const saveRequestOptions = {
            if_not_archived_within: '30d',
            skip_first_archive: 1,
            capture_all: 1,
        }

        // TODO: Seems like some complicated code. Could runtypes help with this?

        const data = await this.client.post('', {form: {url, ...saveRequestOptions}}).json() as SaveRequest

        if ('status_ext' in data && data.status_ext == 'error:host-crawling-paused') {
            return {status: 'hostBusy', response: data}
        }

        if ('message' in data && data.message?.includes("The same snapshot had been made")) {
            return {status: 'alreadyExists', response: data}
        }

        if ('status' in data && data.status == 'error') {
            console.error(`SPN API returned job error for url: ${url}`)
            console.error(jsonStringifyPretty(data))
            throw `SPN API returned job error for url: ${url}`
        } else if ('message' in data && data.message) {
            console.error(`SPN API returned request error for url: ${url}`)
            console.error(jsonStringifyPretty(data))
            throw `SPN request returned job error for url: ${url}`
        } else if ('job_id' in data && data.job_id) {
            if (data.url != url) throw `SPN API response url did not match requested url.`
            return {status: 'success', jobId: data.job_id}
        } else {
            throw `Unexpected response from SPN API: ${jsonStringifyPretty(data)}`
        }

    }

}
