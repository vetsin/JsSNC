import GlideRecord from '../../lib/record.js'
import {Request, TableAPI} from '../../lib/client.js'
import utils from '../helpers/utils.js'

describe('A client', () => {

  beforeEach(function() {
    this.client = utils.loadInstance()
  });

  it('can load it correctly', function() {
    expect(this.client).not.toBeNull()
    let gr = this.client.GlideRecord('problem')
    expect(gr).not.toBeNull()
    expect(gr).toBeInstanceOf(GlideRecord)
    expect(gr.table).toEqual('problem')
  })


  it('mock can generate a request', () => {
    let req = new Request('GET', 'https://instance/api/now/table/problem', {somebody: true})
    let obj = req.generate()
    expect(obj.method).toEqual('GET')
    expect(obj.body).toEqual('eyJzb21lYm9keSI6dHJ1ZX0=')
    expect(JSON.parse(Buffer.from(obj.body, 'base64'))).toEqual({somebody: true})
  })

  it('mock generates a request', () => {
    let gr = new GlideRecord(null, 'problem')
    gr.addActiveQuery()
    gr.addQuery('name', 'bob')

    let api = new TableAPI('bunkinstance')
    let req = api.list(gr)
    expect(req.method).toEqual('GET')
    expect(req.url.toString()).toEqual('https://bunkinstance.service-now.com/api/now/table/problem?sysparm_query=active%3Dtrue%5Ename%3Dbob&sysparm_limit=200&sysparm_display_value=all&sysparm_exclude_reference_link=true&sysparm_suppress_pagination_header=true')
    expect(req.body).toEqual(null)
  })

  it('can auth via tableapi', function() {
    let api = this.client.tableAPI;
    expect(api).not.toBeNull()

    let gr = new GlideRecord(this.client, 'problem')
    gr.addActiveQuery()
    gr.addQuery('name', 'bob')

    let req = api.list(gr)
    expect(req.method).toEqual('GET')
    expect(req.url.toString()).toEqual(`https://bunkinstance.service-now.com/api/now/table/problem?sysparm_query=active%3Dtrue%5Ename%3Dbob&sysparm_limit=200&sysparm_display_value=all&sysparm_exclude_reference_link=true&sysparm_suppress_pagination_header=true`)
    expect(req.body).toEqual(null)

    api.execute(req)

  });

})