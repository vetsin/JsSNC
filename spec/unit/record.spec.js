import GlideRecord from '../../lib/record.js'

describe('A GlideRecord that doesnt make requests', () => {
  it('can be instanced', () => {
    let gr = new GlideRecord('problem')
    expect(gr).not.toBeNull()
  })

  it('has a default length of zero', () => {
    let gr = new GlideRecord('problem')
    expect(gr.getRowCount()).toEqual(0)
  })

  it('can have queries added', () => {
    let gr = new GlideRecord('problem')
    gr.addActiverQuery()
    gr.addQuery('name', 'bob')

    let params = gr.#parameters()
  })
})