
import { Query, OrConditon, QueryCondition } from '../../lib/conditions.js'

describe('a query condition', () => {
  it('with two args', () => {
    let qc = new QueryCondition('foo', 'bar')
    expect(qc.generate()).toEqual("foo=bar")
  })

  it('with three args', () => {
    let qc = new QueryCondition('foo', 'CONTAINS', 'bar')
    expect(qc.generate()).toEqual("fooCONTAINSbar")
  })

  it('with conditions', () => {
    let qc = new QueryCondition('foo', 'CONTAINS', 'bar')
    qc.addOrCondition('lip', 'sum')
    expect(qc.generate()).toEqual("fooCONTAINSbar^ORlip=sum")
  })
})

describe('an or condition', () => {
  it('with two args', () => {
    let oc = new OrConditon('foo', 'bar')
    expect(oc.generate()).toEqual("ORfoo=bar")
  })
})

describe('a query', () => {
  it('is a standard query', () => {
    let q = new Query()
    q.addQuery('name', 'bob')
    q.addQuery('age', '>', '30')
    q.addQuery('last_login', '<=', 'javascript:gs.dt()') // i made up that gs func, doesn't matter

    expect(q.generateQuery()).toEqual('name=bob^age>30^last_login<=javascript:gs.dt()')
  })

  it('is is an or query', () => {
    let q = new Query()
    let c = q.addQuery('name', 'bob')
    c.addOrCondition('name', 'alice')

    expect(q.generateQuery()).toEqual('name=bob^ORname=alice')
  })

  it('is is a complex or query', () => {
    let q = new Query()
    let c = q.addQuery('name', 'bob')
    c.addOrCondition('name', 'alice')
    q.addQuery('age', '>', 30)

    expect(q.generateQuery()).toEqual('name=bob^ORname=alice^age>30')
  })

  it('supports the conv funcs', () => {
    let q = new Query()
    q.addActiveQuery()
    q.addNotNullQuery('name')
    q.addNullQuery('ego')

    expect(q.generateQuery()).toEqual('active=true^nameISNOTEMPTY^egoISEMPTY')
  })


})