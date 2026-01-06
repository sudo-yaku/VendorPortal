import {Lazy} from './lazy'
import React from 'react'

const ENodebAnalyzerTabs = React.lazy(() => import('./ENodebAnalyzerTabs'))

// eslint-disable-next-line react/prop-types
export default function LazyENodebAnalyzerTabs({type, id}) {
  return (
    <Lazy>
      <ENodebAnalyzerTabs type={type} id={id} />
    </Lazy>
  )
}
