import React from "react"
import {useMainDispatch, useMainState} from "../../../old/main/MainStateContext"
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {doChangeLocalOption, doOpenLocalGame} from "../../model/cycle/CycleAction"
import {CycleDispatch, } from '../../model/cycle/CycleReducer'
import {CycleView, CycleViewActions} from './CycleView'

