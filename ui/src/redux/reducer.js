import { combineReducers } from 'redux'
import * as actions from './actions'

const config = ( state = {}, { type, payload }) => {
    switch(type){
        case actions.UPDATE_CONFIG:
        return payload.config

        default:
        return state
    }    
}

export default combineReducers({
    config
})