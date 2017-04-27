process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const request = require('request')
const url = require('./api/urls').users

const params = process.argv.filter((e,i) => i > 1)
const form = { 
    user: 'u' + params[0],
    password: 'u',
    villageName: 'v' + params[0]
}

const reqData = { url, form }

request.post( reqData, (err, response, body) => {
    if ( err ) 
        return console.log("Error: " + err)

    body = JSON.parse(body)
    console.log("Response:\n",body)
})