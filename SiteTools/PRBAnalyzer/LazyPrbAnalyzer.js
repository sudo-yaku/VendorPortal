import {Lazy} from './lazy'
import React from 'react'

const PrbAnalyzer = React.lazy(() => import('./PrbAnalyzer'))

// eslint-disable-next-line react/prop-types
export default function LazyPrbAnalyzer({siteUnid, mode}) {
  return (
    <Lazy>
      <PrbAnalyzer siteUnid={siteUnid} mode={mode} />
    </Lazy>
  )
}
