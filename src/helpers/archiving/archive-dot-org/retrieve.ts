import got from 'got'

export async function fetchClosestArchiveUrl(url: string): Promise<string|undefined> {
    const data = await got.get(`http://archive.org/wayback/available?url=${encodeURIComponent(url)}`).json() as any
    const archiveUrl = data.archived_snapshots?.closest?.url as string|undefined
    return archiveUrl
}
