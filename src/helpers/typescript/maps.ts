export interface AnyValued {
    [key: string]: unknown,
}

export interface StringValued {
    [key: string]: string;
}

export interface StringValuedOptional {
    [name: string]: string | undefined;
}
