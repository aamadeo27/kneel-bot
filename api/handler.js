const actions = require('../redux/actions')
const logger = require('../logger')

module.exports = (error, store) => {
    if ( error.code === 'ECONNREFUSED' ){
        logger.error(Object.assign({}, error))
        store.dispatch(actions.loggedOut())
    }
}