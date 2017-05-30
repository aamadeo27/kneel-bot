const actions = require('../redux/actions')
const logger = require('../logger')

module.exports = (error, store) => {
    if ( error.code === 'ECONNREFUSED' ){
        logger.error("Connection refused", Object.assign({}, error))
        store.dispatch(actions.loggedOut())
    } else if( ! error.enoughTroops || ! error.notEmpty ) {
			logger.error("mission-error", { error })
		}
}