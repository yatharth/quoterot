// Get random integer between min and max (inclusive).
export function getRandomIntBetween(min: number, max: number): number {

    // HOW DOES THIS WORK?
    //
    // Math.random() returns a decimal number between [0, 1). That’s a span length of 1.
    // We first inflate that range to [0, spanLength), then shift the range up by adding `min` to get a float in [min, max+1).
    // We can then call Math.floor() to get an integer in [min, max].

    min = Math.ceil(min)
    max = Math.floor(max)

    const spanLength = max - min + 1

    return Math.floor(min + (Math.random() * spanLength))

}
