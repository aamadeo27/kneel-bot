const constants = {
	LOGGED_IN: 'LOGGED_IN',
	LOGGED_OUT: 'LOGGED_OUT',
	UPDATE_VILLAGE: 'UPDATE_VILLAGE',
	PREPARE: 'PREPARE',
	NEW_ORDER: 'NEW_ORDER',
	REMOVE_ORDER: 'REMOVE_ORDER',
	UPDATE_PARAMS: 'UPDATE_PARAMS',
	UPDATE_TASKS: 'UPDATE_TASKS',
	UPDATE_MISSIONS: 'UPDATE_MISSIONS',
	UPDATE_MAP: 'UPDATE_MAP',
	UPDATE_DIPLOMACY: 'UPDATE_DIPLOMACY',
	ADD_TARGETS: 'ADD_TARGETS',
	SAVE_FOR: 'SAVE_FOR',
	EXTEND_DISCOVER: 'EXTEND_DISCOVER',
	GATHER_TROOPS: 'GATHER_TROOPS'
}

module.exports = {
	constants,
	
	loggedIn: (user, location) => ({ 
		type: constants.LOGGED_IN, 
		payload: { user, location } 
	}),

	loggedOut: () => ({ 
		type: constants.LOGGED_OUT
	}),
	
	updateVillage: village => ({
		type: constants.UPDATE_VILLAGE,
		payload: { village }
	}),
	
	prepare: () => ({ type: constants.PREPARE }),
	
	newOrder: order => ({
		type: constants.NEW_ORDER,
		payload: { order }
	}),
	
	removeOrder: order => ({ 
		type: constants.REMOVE_ORDER,
		payload: { order }
	}),
	
	updateParams: params => ({
		type: constants.UPDATE_PARAMS,
		payload: { params }
	}),
	
	updateTasks: tasks => ({
		type: constants.UPDATE_TASKS,
		payload: { tasks }
	}),
	
	updateMissions: missions => ({
		type: constants.UPDATE_MISSIONS,
		payload: { missions }
	}),
	
	updateMap: cells => ({
		type: constants.UPDATE_MAP,
		payload: { cells }
	}),
	
	saveFor: item => ({
		type: constants.SAVE_FOR,
		payload: { item }
	}),
	
	updateDiplomacy: diplomacy => ({
		type: constants.UPDATE_DIPLOMACY,
		payload: { diplomacy }
	}),
	
	addTargets: targets => ({
		type: constants.ADD_TARGETS,
		payload: { targets }
	}),
	
	extendDiscover: () => ({
		type: constants.EXTEND_DISCOVER
	}),
	
	gatherTroops: troops => ({
		type: constants.GATHER_TROOPS,
		payload: { troops }
	})
}