
const https = require('node:https')
import { URL, URLSearchParams } from 'node:url'

function getInstance(instance) {
  // return a well formed instance or raise
  if(instance.includes('://'))
    return instance.replace(/(\s|\/)+$/gm, '')
  if(!instance.includes('.'))
    return `https://${instance}.service-now.com`
  throw new Error(`invalid instance argument ${instance}`)
}

class TableAPI {
  #agent

  constructor(instance, auth, proxy, verify) {
    this.instance = getInstance(instance)
    if(Array.isArray(auth) && auth.length == 2)
      this.auth = `${auth[0]}:${auth[1]}`
    else
      this.auth = auth
    this.proxy = proxy
    this.#agent = new https.Agent()
    this.verify = verify
  }

  _target(table, sys_id) {
    return new URL(`${this.instance}/api/now/table/${table}${(sys_id) ? '/'+sys_id: ''}`)
  }

  _parameters(record) {
    let params = (record) ? record.#parameters() : {}
    params['sysparm_display_value'] = 'all'
    params['sysparm_exclude_reference_link'] = 'true'
    params['sysparm_suppress_pagination_header'] = 'true'
    if(params.includes('sysparm_offset'))
      delete params['sysparm_offset']
    return new URLSearchParams(params)
  }

  _request(url, options, cb) {
    options.agent = this.#agent
    options.auth = this.#auth
    options.headers = {
      'Accept': 'application/json'
    }
    const req = https.request(url, options, (res) => {
      let data = []

      res.on('data', (chunk) => {
        data.push(chunk)
      })

      res.on('end', () => {
        if(res.statusCode >= 400)
          throw new Error(`${res.statusCode} Error`)
        else
          return cb(JSON.parse(Buffer.concat(data).toString()))
      })


    })
    req.on('error', (e) => {
      throw new Error(e)
    })
    req.end()
    return req
  }

  get(record, sys_id) {

  }

  list(record) {
    let searchParams = this.#parameters(record)
    let url = this.#target(record.table)
    url.searchParams = searchParams

    let opts = {
      method: 'GET',
    }

    let req = this.#request(url, opts, (res) => {

    })
  }

}

export default Client