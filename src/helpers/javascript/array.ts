export function partition<T>(array: T[], predicate: (value: T, index: number, array: T[]) => unknown): [T[], T[]] {
    let pass: T[] = [], fail: T[] = []
    array.forEach((elem, i, arr) => (predicate(elem, i, arr) ? pass : fail).push(elem))
    return [pass, fail]
}


export function findElementByProperty<Element, Key extends keyof Element>(
    arr: Element[], key: Key, value: Element[Key]): Element | undefined {
    return arr.find((element) => element[key] == value)
}