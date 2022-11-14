'use strict';

export class Query {
  #subQuery
  #conditions
  #order

  constructor() {
    this.#subQuery = []
    this.#conditions = []
  }

  addActiveQuery() {
    return this.addQuery('active', true)
  }

  addNullQuery(field) {
    return this.addQuery(field, '', 'ISEMPTY')
  }

  addNotNullQuery(field) {
    return this.addQuery(field, '', 'ISNOTEMPTY')
  }

  addQuery(name, operator, value) {
    let qc = new QueryCondition(name, operator, value)
    this.addQueryCondition(qc)
    return qc
  }
  
  addQueryCondition(qc) {
    this.#conditions.push(qc)
  }

  setOrderBy(column) {
    if(column)
      this.#order = `ORDERBY${column}`
    else
      this.#order = undefined
  }

  setOrderByDesc(column) {
    if(column)
      this.#order = `ORDERBYDESC${column}`
    else
      this.#order = undefined
  }

  generateQuery(encodedQuery) {
    let query = this.#conditions.map(c => c.generate())
    query = query.concat(this.#subQuery.map(sq => sq.generate()))
    if(encodedQuery)
      query.push(encodedQuery)
    if(this.#order)
      query.push(this.#order)
    return query.join('^')
  }
}

class BaseCondition {
  constructor(name, operator, value) {
    this.name = name
    this.operator = value ? operator : '='
    this.value = value || operator
  }

  generate() {
    throw new Error('must be implemented')
  }
}

export class OrConditon extends BaseCondition {
  generate() {
    return `OR${this.name}${this.operator}${this.value}`
  }
}

export class QueryCondition extends BaseCondition {
  #subQuery

  constructor(name, operator, value) {
    super(name, operator, value)
    this.#subQuery = []
  }

  addOrCondition(name, operator, value) {
    let subQuery = new OrConditon(name, operator, value)
    this.#subQuery.push(subQuery)
    return this.subQuery
  }

  generate() {
    let q =  [`${this.name}${this.operator}${this.value}`]
    this.#subQuery.forEach(sq => q.push(sq.generate()))
    return q.join('^')
  }
}