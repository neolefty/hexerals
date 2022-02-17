import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {AppOld} from "./old/main/AppOld"
import './index.css'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(
    <AppOld/>,
    document.getElementById('root') as HTMLElement
)
registerServiceWorker()
