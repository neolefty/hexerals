export class Comma {
    private called: boolean = false
    constructor(readonly first: string = '', readonly subsequent: string = ', ') {}
    toString(): string {
        const result = this.called ? this.subsequent : this.first
        this.called = true
        return result
    }
}