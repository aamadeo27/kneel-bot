const {combineReducers} = require('redux')
const { 
	LOGGED_IN,
	LOGGED_OUT,
	UPDATE_USER,
	UPDATE_PARAMS,
	UPDATE_VILLAGE,
	REFRESH,
	PREPARE,
	NEW_ORDER,
	REMOVE_ORDER,
	UPDATE_TASKS,
	UPDATE_MISSIONS,
	UPDATE_DIPLOMACY,
	SAVE_FOR,
	ADD_TARGETS,
	EXTEND_DISCOVER,
	GATHER_TROOPS,
	UPDATE_CONFIG
} = require('./actions').constants

const userInfo = ( state = {}, { type, payload} ) => {
	switch(type){
		case LOGGED_IN:
		case UPDATE_USER:
			return Object.assign({}, state, payload.userInfo)
		case LOGGED_IN:
			return {}
		default:
			return state
	}
}

const loggedIn = (state = false, { type } ) => {
	if ( type === LOGGED_IN ){
		return true
	}

	if ( type === LOGGED_OUT ){
		return false
	}
	
	return state
}

const village = (state = {}, { type, payload}) => {
	if ( type === UPDATE_VILLAGE ){
		return Object.assign({}, payload.village)
	}

	if ( type === LOGGED_OUT ){
		return {}
	}
	
	return state
}

const params = (state = {}, { type, payload }) => {
	if ( type === UPDATE_PARAMS ){
		return Object.assign({}, payload.params)
	}
	
	if ( type === LOGGED_OUT ){
		return {}
	}

	return state
}

const lastAction = (state = "", { type }) => {
	return type
}

const orders = (state = [], { type, payload }) => {
	switch( type ){
		case NEW_ORDER: return [...state, payload.order]
		case REMOVE_ORDER:
			return state.filter( e => e.id !== payload.order.id )
	}
	
	return state
}

const executingOrder = (state = false, { type }) => {
	if ( type === REMOVE_ORDER ){
		return false
	}
	
	return state || type === NEW_ORDER
}

const tasks = (state = [], { type, payload}) => {
	if ( type === UPDATE_TASKS ){
		return payload.tasks
	}
	
	if ( type === LOGGED_OUT ){
		return []
	}

	return state
}

const missions = (state = [], { type, payload}) => {
	if ( type === UPDATE_MISSIONS ){
		return payload.missions
	}
	
	if ( type === LOGGED_OUT ){
		return []
	}

	return state
}

const saveFor = (state = '', { type, payload }) => {
	if( type === SAVE_FOR ) return payload.item
	
	return state
}

const cells = (state = [], { payload, type}) => {
	if ( type === LOGGED_OUT ){
		return []
	}

	if ( type == "UPDATE_MAP" ){
		return [...payload.cells]
	}

	if ( type == 'UPDATE_SECTION' ){
		const setCells = new Set()
		const center = centerOfSection(payload.point, payload.radius)

		const filteredCells = state.filter( cell => {
			if ( withinSection(center, cell, payload.radius) ) return false
			setCells.add(`${cell.x}:${cell.y}`)

			return true
		})

		const newState = [...filteredCells]
		
		action.cells.forEach( cell => {
			if (setCells.has(`${cell.x}:${cell.y}`)) return
			newState.push(cell)
		})

		return newState
	}

	return state
}

const diplomacy = (state = {}, { type, payload }) => {
	if ( type === LOGGED_OUT ){
		return {}
	}

	if ( type === UPDATE_DIPLOMACY ){
		return payload.diplomacy
	}
	
	return state
}

const targets = (state = [], { type, payload }) => {
	if ( type === LOGGED_OUT )	return []
	if ( type !== ADD_TARGETS ) return state
	
	const knownTargets = new Set()
	state.forEach( t => knownTargets.add(t.type+":"+t.id) )
	
	const unknownTargets = payload.targets.filter( t => 
		! knownTargets.has(t.type+":"+t.id)
	)
	
	return [ ...state, ...unknownTargets]
}

const discoverRadius = (state = 0, { type }) => {
	if ( type === EXTEND_DISCOVER ) return state + 1
	
	return state
}

const gatherTroops = (state = 0, { type, payload }) => {
	if ( type === GATHER_TROOPS ) return payload.troops
	
	return state
}

const config = ( state = {}, { type, payload }) => {
	switch(type){
	case UPDATE_CONFIG: 
			return payload.config
	default:
			return state
	}
}

const lastRemovedOrder = ( state = {}, { type, payload }) => {
	switch(type){
		case REMOVE_ORDER:
			return Object.assign({}, payload.order)
		default:
			return state
	}
}

module.exports = combineReducers({
	userInfo,
	discoverRadius,
	loggedIn,
	params,
	targets,
	diplomacy,
	village,
	orders,
	executingOrder,
	lastRemovedOrder,
	saveFor,
	tasks,
	missions,
	cells,
	lastAction,
	gatherTroops,
	config
})