import * as React from "react"
import InputRange, {Range as MinMax} from "react-input-range"

export function MakeInputRange(
    labelBefore: string, labelAfter: (value: number) => string,
    title: string, value: number,
    min: number, max: number,
    onChange: (n: number, highFidelity: boolean) => void,
) {
    // console.log(`${labelBefore} ${value} — ${labelAfter(value)} — ${min} - ${max}`)
    return (
        <label
            className="InputRange Row"
            title={title}
        >
            <span className="LabelBefore">{labelBefore}</span>
            <InputRange
                minValue={min}
                maxValue={max}
                value={value}
                formatLabel={() => ''}
                onChangeComplete={(value: number | MinMax) =>
                    onChange(value as number, true)
                }
                onChange={(value: number | MinMax) =>
                    onChange(value as number, false)
                }
            />
            <span className="LabelAfter">{labelAfter(value)}</span>
        </label>
    )
}
