import React from 'react'
import {SitePrbAnalyzer, InPlaceSitePrbAnalyzer} from './SitePRBAnalyzer'

export function PrbAnalyzer({siteUnid,SiteTools, mode}) {
  return mode === 'modal' ? <SitePrbAnalyzer siteUnid={siteUnid}/> : <InPlaceSitePrbAnalyzer siteUnid={siteUnid}  SiteTools={SiteTools}/>
}
