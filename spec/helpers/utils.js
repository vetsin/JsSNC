import ServiceNowClient from '../../lib/client.js'
import * as dotenv from 'dotenv'
dotenv.config()

function loadInstance() {
    return new ServiceNowClient(
        process.env['instance'], 
        [process.env['username'], process.env['password']]
        )
}

export default {
    loadInstance
}