
import https from 'node:https'
import crypto from 'crypto'
import { URL } from 'node:url'
import GlideRecord from './record.js'


function getInstance(instance) {
  // return a well formed instance or raise
  if(!instance)
    throw new Error(`invalid instance argument ${instance}`)
  if(instance.includes('://'))
    return instance.replace(/(\s|\/)+$/gm, '')
  if(!instance.includes('.'))
    return `https://${instance}.service-now.com`
  throw new Error(`invalid instance argument ${instance}`)
}

function getRandomID() {
  return crypto.randomBytes(16).toString("hex");
}


export class Request {

  constructor(method, url, body, headers=[], excludeResponseHeaders = false) {
    this.id = getRandomID()
    this.method = method
    this.url = url
    this.body = body
    this.headers = headers
    this.excludeResponseHeaders = excludeResponseHeaders
  }

  generateBatchRequest() {
    return {
      id: this.id,
      method: this.method,
      url: this.url,
      body: (this.body) ? Buffer.from(JSON.stringify(this.body)).toString('base64') : null,
      headers: this.headers,
      exclude_response_headers: this.excludeResponseHeaders
    }
  }

}

class AbstractAPI {
  _auth
  _agent

  constructor(instance, auth, proxy, verify) {
    if(this.constructor == AbstractAPI)
      throw new Error("AbstractAPI cannot be instantiated")
    this.instance = getInstance(instance)
    if(Array.isArray(auth) && auth.length == 2)
      this._auth = `${auth[0]}:${auth[1]}`
    else
      this._auth = auth
    this.proxy = proxy
    this._agent = new https.Agent()
    this.verify = verify
  }

  execute(...requests) {
    throw new Error("abstract method")
  }
}

export class BatchAPI extends AbstractAPI {
  #batchUri
  constructor(instance, auth, proxy, verify) {
    super(instance, auth, proxy, verify);
    this.#batchUri = new URL(`${this.instance}/api/now/batch`)
  }

  execute(...requests) {

    for(let req in requests) {
      options.agent = this._agent
      options.auth = this._auth
      options.headers = {
        'Accept': 'application/json'
      }

      let bodyParameters = {
        batch_request_id: '',
        rest_requests: [],
      }

      const req = https.request(this.#batchUri, options, (res) => {
        let data = []

        res.on('data', (chunk) => {
          data.push(chunk)
        })

        res.on('end', () => {
          if (res.statusCode >= 400)
            throw new Error(`${res.statusCode} Error`)
          else
            return JSON.parse(Buffer.concat(data).toString())
        })

      })
      req.on('error', (e) => {
        throw new Error(e)
      })
      req.end()
      return req
    }
  }

}

export class TableAPI extends AbstractAPI {

  constructor(instance, auth, proxy, verify) {
    super(instance, auth, proxy, verify);
  }

  /**
   * @param {String} table 
   * @param {String} sys_id 
   * @returns {URL} the URL
   */
  #tableUri(table, sys_id, searchParams) {
    let url = new URL(`${this.instance}/api/now/table/${table}${(sys_id) ? '/'+sys_id: ''}`)
    for (const prop in searchParams) {
      url.searchParams.append(prop, searchParams[prop])
    }
    return url
  }

  #parameters(record) {
    let params = (record) ? record._parameters() : {}
    params['sysparm_display_value'] = 'all'
    params['sysparm_exclude_reference_link'] = 'true'
    params['sysparm_suppress_pagination_header'] = 'true'
    if('sysparm_offset' in params)
      delete params['sysparm_offset']
    return params
  }

  execute(request) {
    const options = {}
    options.agent = this._agent
    options.auth = this._auth
    options.method = request.method
    options.headers = {
      'Accept': 'application/json'
    }
    options.headers = Object.assign({}, options.headers, request.headers)

    return https.request(this.url, options, (res) => {
      let data = []

      res.on('data', (chunk) => {
        data.push(chunk)
      })

      res.on('end', () => {
        if (res.statusCode >= 400)
          throw new Error(`${res.statusCode} Error`)
        else
          return cb(JSON.parse(Buffer.concat(data).toString()))
      })

    })
    .on('error', (e) => {
      throw new Error(e)
    }).end()

  }

  #request(url, options, cb) {
    options.agent = this._agent
    options.auth = this._auth
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
    let url = this.#tableUri(record.table, null, searchParams)
    return new Request('GET', url, null)
  }

}

export class ServiceNowClient {

  constructor(instance, auth, proxy, verify) {
    this.tableAPI = new TableAPI(instance, auth, proxy, verify)
    this.batchAPI = new BatchAPI(instance, auth, proxy, verify)
  }

  GlideRecord(table) {
    return new GlideRecord(this, table);
  }

}

export default ServiceNowClient