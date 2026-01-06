import {generate} from './_generate'

export default {
  path: '/neops/prb/enodeb/:enodebId/analyzer',
  method: 'GET',
  response: (req, res) => {
    const enodebId = req.params.enodebId
    const data = generate(enodebId, '1', '2', 'elpt')
    return res.json({
      prbResults: [
        {
          [`${enodebId}_1_2`]: {
            vendor: 'Ericsson',
            data
          }
        }
      ]
    })
  },
  responses: [
    {
      title: 'ok',
      status: 200,
      response: {
        message: 'placeholder. make a request to see "real" data'
      }
    }
  ]
}
