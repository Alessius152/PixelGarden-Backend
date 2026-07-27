
const isUUIDv7 = (str: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

const isValidUserAt = (str: string): boolean => {
    if (str.length < 3 || str.length > 32) return false
    return /^[a-z][a-z0-9_]*$/.test(str)
}

export {
    isUUIDv7,
    isValidUserAt
}
