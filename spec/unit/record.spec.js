import GlideRecord from '../../lib/record.js'

describe('A GlideRecord that doesnt make requests', () => {
  it('can be instanced', () => {
    let gr = new GlideRecord(null, 'problem')
    expect(gr).not.toBeNull()
    expect(gr.table).toEqual('problem')
  })

  it('has a default length of zero', () => {
    let gr = new GlideRecord(null, 'problem')
    expect(gr.getRowCount()).toEqual(0)
  })

  it('can have queries added', () => {
    let gr = new GlideRecord(null, 'problem')
    gr.addActiveQuery()
    gr.addQuery('name', 'bob')
    expect(gr.getEncodedQuery()).toEqual("active=true^name=bob")
  })

  it('supports complex queries', () => {
    let gr = new GlideRecord(null, 'problem')
    gr.addActiveQuery()
    let oq = gr.addQuery('name', 'bob')
    oq.addOrCondition('name', 'alice')

    gr.addQuery('age', '1')

    expect(gr.getEncodedQuery()).toEqual("active=true^name=bob^ORname=alice^age=1")
  })

})