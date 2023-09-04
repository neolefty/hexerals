export const inDev = () => process.env?.["NODE_ENV"] === "development"
export const inProd = () => process.env?.["NODE_ENV"] === "production"
export const inTest = () => process.env?.["NODE_ENV"] === "test"

export const devAssert = (condition: unknown, message?: string) => {
    if (!inProd() && !condition) throw new Error(message)
}
