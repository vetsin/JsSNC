import GlideRecord from './lib/record.js'

function getInstance(instance) {
  // return a well formed instance or raise
  if(instance.includes('://'))
    return instance.replace(/(\s|\/)+$/gm, '')
  if(!instance.includes('.'))
    return `https://${instance}.service-now.com`
  throw new Error(`invalid instance argument ${instance}`)
}

class Client {
  constructor(instance, auth, proxy) {
    this.instance = getInstance(instance)
    this.auth = auth
    this.proxy = proxy
  }

  list() {

  }
}


function ServiceNowClient(instance, auth, proxy) {
  if(typeof instance === 'undefined')
    throw new Error('undefined is not a valid instance')
  if(typeof auth === 'undefined')
    throw new Error('must provide authentication information')

  let self = this
  const client = new Client(instance, auth, proxy)

  return {
    GlideRecord: function(table) {
      if(typeof table === 'undefined') 
        throw new Error('undefined is not a valid table')
      return new GlideRecord(client, table)
    }
  }
}

export default ServiceNowClient