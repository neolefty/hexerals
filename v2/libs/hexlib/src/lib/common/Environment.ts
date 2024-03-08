export const inDev = () => true // process.env?.["NODE_ENV"] === "development"
export const inProd = () => false // process.env?.["NODE_ENV"] === "production"
export const inTest = () => false // process.env?.["NODE_ENV"] === "test"

export const devAssert = (condition: unknown, message?: string) => {
    if (!inProd() && !condition) throw new Error(message)
}
