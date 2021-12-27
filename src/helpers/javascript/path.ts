import {join} from 'path'

export function pathRelativeTo(basePath: string) {
    return (path: string) => join(basePath, path)
}