import { render } from '@testing-library/react'

import HexSvgBoard from './hex-svg-board'

describe('HexSvgBoard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<HexSvgBoard />)
    expect(baseElement).toBeTruthy()
  })
})
