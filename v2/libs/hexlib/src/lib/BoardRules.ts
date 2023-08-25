import { BoardConstraints } from "./Constraints"
import { RectEdges } from "./RectEdges"

export class BoardRules {
    constructor(
        readonly constraints: BoardConstraints,
        readonly edges: RectEdges = new RectEdges(constraints),
        readonly validator: MoveValidator = new MoveValidator(constraints),
        readonly stepper: PopStepper = new PopStepper(constraints.opts)
    ) {}

    private _niches?: Niches
    get niches(): Niches {
        if (!this._niches) this._niches = new Niches(this)
        return this._niches
    }
}
