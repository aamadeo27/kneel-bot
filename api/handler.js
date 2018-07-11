const actions = require('../redux/actions')
const logger = require('../logger')

module.exports = (error, store) => {
		if ( typeof error === 'string' ){
			if ( error.match(/502 Bad Gateway/))
				logger.error("bad-gateway")
		} else {
			if ( error.code === 'ECONNREFUSED' ){
        logger.error("Connection refused", Object.assign({}, error))
        store.dispatch(actions.loggedOut())
			} else if( ! error.enoughTroops || ! error.notEmpty ) {
				logger.error("mission-error", { error })
			}
		}
}