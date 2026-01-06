import React from 'react'
import Loader from '../../Layout/components/Loader'
import { usePrbAnalyzerQuery } from './prb-analyzer.data'
import { Tab, Tabs } from './SimpleTabs'
import { fromJS } from 'immutable'
import { formatData } from './utils'
import { PRBContourChart } from './PRBContourChart'
import ErrorBoundary from './ErrorBoundary'
import { WarnIcon } from './icons'


export function ENodeBAnalazyerTabs({id}) {
  console.log("Node id:", id)
  const query = usePrbAnalyzerQuery(id)
  console.log("Query result:", query)
  if (query.loading) {
    return <Loader />
  }
  if (query.error) {
    return <WarnIcon />
  }
  if (!query.data) {
    return <div>Rendering...</div>
  }
  return (
    <>
      <Tabs headless>
        {Object.keys(query.data ?? {}).map((id) => (
          <Tab key={id}
            title={<span style={{ display: 'inline-block', margin: '0 10px' }}>{id}</span>}
            id={id}>
            <ErrorBoundary errorMessage="Failed to render analyzer charts.">
              <AnalyzerCharts id={id} data={query.data[id]} />
            </ErrorBoundary>
          </Tab>
        ))}
      </Tabs>
    </>
  )
}

function AnalyzerCharts({id, data}) {
  const contourData = React.useMemo(() => {
    if (!data) {
      return fromJS({})
    }
    const lpt = data.vendor === 'Ericsson' ? 'elpt' : data.vendor === 'Samsung' ? 'samsung' : 'alpt'
    return fromJS({[id.replaceAll('_', '-')]: formatData(lpt, data.data)})
  }, [id, data])
  const cluster = React.useMemo(
    () => fromJS({vendor: data?.vendor, 'market-type': data?.vendor === 'Ericsson' ? 'ELPT' : 'ALPT'}),
    [data]
  )

  if (!data) {
    return <div>Rendering...</div>
  }
  const [enb, sec, car] = id.split('_')
  const context = String(cluster.get('market-type', '')).toLowerCase()
  return (
    <PRBContourChart
      contourData={contourData}
      cluster={cluster}
      enb={enb}
      sec={sec}
      car={car}
      height={750}
      width={1000}
      context={context}
      isAlpt={context === 'alpt'}
    />
  )
}

export default ENodeBAnalazyerTabs
