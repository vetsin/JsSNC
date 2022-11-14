'use strict';
import { Query } from './conditions.js'

class GlideRecord {

  #currentIdx
  #page
  #query
  #results
  #total
  #fields
  #isNewRecord

  constructor(client, table, batchSize = 200) {
    this.client = client

    this.table = table
    this.batchSize = batchSize

    this.limit = null
    this.encodedQuery = null

    this.#clearQuery()
    this.#results = []
    this.#currentIdx = -1
    this.#page = -1
    this.#isNewRecord = false
    this.#fields = null
  }

  get fields() {
    if(this.#fields)
      return this.#fields
    if(this.#results.length > 0) {
      return Object.getOwnPropertyNames(this.#results[0])
    }
    return undefined
  }

  set fields(values) {
    if(typeof values === 'string')
      this.#fields = values.split(',')
    else
      this.#fields = values
  }

  _clearQuery() {
    this.#query = new Query()
  }

  _current() {
    if(this.#currentIdx > -1 && this.#currentIdx < this.#results.length)
      return this.#results[this.#currentIdx]
    return null
  }

  _parameters() {
    let query_params = {
      sysparm_query: this.#query.generateQuery(this.encodedQuery)
    }
    // fields
    if(this.#fields && this.#fields.length > 0) {
      let f = this.#fields
      if(!f.includes('sys_id')) {
        f.push('sys_id')
      }
      query_params['sysparm_fields'] = f.join(',')
    }

    // limit
    let l = null
    if(this.limit) {
      if(this.limit >= this.batchSize) {
        l = this.limit - this.#currentIdx - 1
      } else if(this.limit <= this.batchSize || this.limit > 0) {
        l = this.limit
      }
    }
    if(!l && this.batchSize) {
      // no limit? set to batch size
      query_params['sysparm_limit'] = this.batchSize
    } else if (l) {
      query_params['sysparm_limit'] = l
    }

    // offset
    if(this.#currentIdx == -1)
      ret['sysparm_offset'] = 0
    else
      ret['sysparm_offset'] = this.#currentIdx + 1
  }

  /**
   * Setup GR for insertion of a new record. Clears any query results if they exist
   */
  initialize() {
    this.#results = [{}]
    this.#currentIdx = 0
    this.#total = 1
    this.#isNewRecord = true
  }

  isNewRecord() {
    return this.#results.length == 1 && this.#isNewRecord
  }

  getRowCount() {
    return this.#total || 0
  }

  addQuery(name, condition, operator) {
    return this.#query.addQuery(name, condition, operator)
  }

  orderBy(field) {
    this.#query.orderBy(field)
  }

  orderByDesc(field) {
    this.#query.orderByDesc(field)
  }

  addActiverQuery() {
    return this.#query.addActiveQuery()
  }

  addNullQuery(field) {
    return this.#query.addNullQuery(field)
  }

  addNotNullQuery(field) {
    return this.#query.addNotNullQuery(field)
  }


  query() {

    //let actualQuery = this.#query.generateQuery(this.encodedQuery)
    let response = this.client.list(this)
  }

  /**
   * so you can re-iterate the current GlideRecord
   */
  rewind() {
    this.#currentIdx = -1
  }

  /**
   * the next()
   */
  *[Symbol.iterator]() {
    return {
      hasNext: () => (!this.#currentIdx in this.#results),
      next: () => {
        this.#currentIdx += 1
        return {
          value: this,
          done: !(this.#currentIdx in this.#results)
        }
      }
    }

  }

}

export default GlideRecord