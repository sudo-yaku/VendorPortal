import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {List, fromJS} from "immutable"
import {connect} from "react-redux"
import WOPan from './WOPan'

class Dashboard extends React.Component {
  static propTypes = {
    requested: PropTypes.object,
    quote: PropTypes.object,
    work: PropTypes.object,
    rma: PropTypes.object,
    onPanClick: PropTypes.func,
    searchToggle: PropTypes.string
  }

  render () {
    const {quote, work, onPanClick, searchToggle, requested,selectedTab,mduquote,mdurequested,mduwork,rma} = this.props
    let woQuote = []
    let woRequested = []
    let woWork = []
    let quoteTitle = ''
    let workTitle = ''
    let requestedTitle = ''
    if (searchToggle == 'Site') {
      woQuote = []
      woWork = []
      woRequested = []
      quoteTitle = "Quote (Site)"
      workTitle = "Work (Site)"
      requestedTitle = "Requested (Site)"
      let siteQuote = selectedTab == 'vendordashboard'? quote.toJS(): mduquote?.toJS()
      let siteWork =  selectedTab == 'vendordashboard'? work.toJS() : mduwork?.toJS()
      let siteRequested =  selectedTab == 'vendordashboard'? requested.toJS() : mdurequested?.toJS()
      for (let i = 0; i < siteQuote.length; i++) {
        let siteWo = {}
        siteWo["color"] = siteQuote[i].color
        siteWo["name"] = siteQuote[i].name == 'Quote Received' ? 'Quote Submitted' : siteQuote[i].name
        siteWo["data"] = []
        if (siteQuote[i].woType) {
          for (let j = 0; j < siteQuote[i].woType.length; j++) {
            if (siteQuote[i].woType[j] == 'SITE') {
              if (siteQuote[i].data && siteQuote[i].data[j]) {
                siteWo["data"].push(siteQuote[i].data[j])
              }
            }

          }
        }
        woQuote.push(siteWo)
      }
      let sitewps = 0;
      let sitewpu = 0;
    
        for(let j=0; j < siteWork.length; j++){
          if(siteWork[j].name == "Work Pending Scheduled"){
            sitewps = siteWork[j].data.length;
          }
          if(siteWork[j].name == "Work Pending Unscheduled"){
            sitewpu = siteWork[j].data.length;
          }
      }

      for (let k = 0; k < siteWork.length; k++) {
        if(siteWork[k].name === 'Work Declined') {
          continue;
        }
        if(sitewps > 0 || sitewpu > 0){
          if(siteWork[k].name === 'Work Pending') {
            continue;
          }
        }else if(sitewps == 0 && sitewpu == 0){
          if(siteWork[k].name === 'Work Pending Unscheduled' || siteWork[k].name === 'Work Pending Scheduled') {
            continue;
          }
        }
        let siteWo = {}
        siteWo["color"] = siteWork[k].color
        siteWo["name"] = siteWork[k].name
        siteWo["data"] = []
        if (siteWork[k].woType) {
          for (let m = 0; m < siteWork[k].woType.length; m++) {
            if (siteWork[k].woType[m] == 'SITE') {
              if (siteWork[k].data && siteWork[k].data[m]) {
                siteWo["data"].push(siteWork[k].data[m])
              }
            }
          }
        }
        woWork.push(siteWo)
      }
      for (let m = 0; m < siteRequested.length; m++) {
        let siteWo = {}
        siteWo["color"] = siteRequested[m].color
        siteWo["name"] = siteRequested[m].name
        siteWo["data"] = []
        if (siteRequested[m].woType) {
          for (let p = 0; p < siteRequested[m].woType.length; p++) {
            if (siteRequested[m].woType[p] == 'SITE') {
              if (siteRequested[m].data && siteRequested[m].data[p]) {
                siteWo["data"].push(siteRequested[m].data[p])
              }
            }
          }
        }
        woRequested.push(siteWo)
      }

    } else if (searchToggle == 'Switch') {
      woQuote = []
      woWork = []
      woRequested = []
      quoteTitle = "Quote (Switch)"
      workTitle = "Work (Switch)"
      requestedTitle = "Requested (Switch)"
      let switchQuote =  selectedTab == 'vendordashboard'? quote.toJS() : mduquote?.toJS()
      let switchWork = selectedTab == 'vendordashboard'? work.toJS() : mduwork?.toJS()
      let switchRequested =  selectedTab == 'vendordashboard'? requested.toJS() : mdurequested.toJS()
      for (let i = 0; i < switchQuote.length; i++) {
        let switchWo = {}
        switchWo["color"] = switchQuote[i].color
        switchWo["name"] = switchQuote[i].name == 'Quote Received' ? 'Quote Submitted' : switchQuote[i].name
        switchWo["data"] = []
        if (switchQuote[i].woType) {
          for (let j = 0; j < switchQuote[i].woType.length; j++) {
            if (switchQuote[i].woType[j] == 'SWITCH') {
              if (switchQuote[i].data && switchQuote[i].data[j]) {
                switchWo["data"].push(switchQuote[i].data[j])
              }
            }
          }
        }
        woQuote.push(switchWo)
      }
      let switchwps = 0;
      let switchwpu = 0;
        for(let j=0; j < switchWork.length; j++){
          if(switchWork[j].name == "Work Pending Scheduled"){
            switchwps = switchWork[j].data.length;
          }
          if(switchWork[j].name == "Work Pending Unscheduled"){
            switchwpu = switchWork[j].data.length;
          }
      }
      for (let k = 0; k < switchWork.length; k++) {
        if(switchWork[k].name === 'Work Declined') {
          continue;
        }
        if(switchwps > 0 || switchwpu > 0){
          if(switchWork[k].name === 'Work Pending') {
            continue;
          }
        }else if(switchwps == 0 && switchwpu == 0){
          if(switchWork[k].name === 'Work Pending Unscheduled' || switchWork[k].name === 'Work Pending Scheduled') {
            continue;
          }
        }
        let switchWo = {}
        switchWo["color"] = switchWork[k].color
        switchWo["name"] = switchWork[k].name
        switchWo["data"] = []
        if (switchWork[k].woType) {
          for (let m = 0; m < switchWork[k].woType.length; m++) {
            if (switchWork[k].woType[m] == 'SWITCH') {
              if (switchWork[k].data && switchWork[k].data[m]) {
                switchWo["data"].push(switchWork[k].data[m])
              }
            }
          }
        }
        woWork.push(switchWo)
      }
      for (let m = 0; m < switchRequested.length; m++) {
        let switchWo = {}
        switchWo["color"] = switchRequested[m].color
        switchWo["name"] = switchRequested[m].name
        switchWo["data"] = []
        if (switchRequested[m].woType) {
          for (let p = 0; p < switchRequested[m].woType.length; p++) {
            if (switchRequested[m].woType[p] == 'SWITCH') {
              if (switchRequested[m].data && switchRequested[m].data[p]) {
                switchWo["data"].push(switchRequested[m].data[p])
              }
            }
          }
        }
        woRequested.push(switchWo)
      }
    } else {
      let wps = 0;
      let wpu = 0;
      woWork =  selectedTab == 'vendordashboard'? work.toJS() : mduwork?.toJS()
        for(let i=0; i < woWork.length; i++){
         if(woWork[i].name == "Work Pending Scheduled"){
          wps = woWork[i].data.length;
         }
         if(woWork[i].name == "Work Pending Unscheduled"){
          wpu = woWork[i].data.length;
         }
      }
      woWork = woWork?.filter(e => e.name !== 'Work Declined');
      if(wps == 0 && wpu == 0){
        woWork = woWork?.filter(e => (!['Work Pending Scheduled','Work Pending Unscheduled'].includes(e.name)));
      }else if(wps > 0 || wpu > 0){
        woWork = woWork?.filter(e => (e.name !== 'Work Pending'));
      }
      woRequested =  selectedTab == 'vendordashboard'? requested.toJS() : mdurequested?.toJS()
      quoteTitle = "Quote"
      workTitle = "Work"
      requestedTitle = "Requested"
      let woQuotefilter =  selectedTab == 'vendordashboard'? quote.toJS(): mduquote?.toJS()
      woQuote =  woQuotefilter?.map(v => {
        if(v.name == 'Quote Received'){
          return {
            ...v,
            name: 'Quote Submitted'
          }
        }
        else {
          return v
        }
      })

    }
    let woRma = rma?.toJS()

    return (
      <div className="Grid">
        <div className="Col Col-md-2" style={{lineHeight: 'normal'}}>
          <WOPan data={fromJS(woRequested)} role={this.props.userRole} title={requestedTitle} onPanClick={onPanClick} selectedTab={this.props.selectedTab} />
        </div>
        <div className="Col Col-md-2" style={{lineHeight: 'normal'}}>
          <WOPan data={fromJS(woQuote)} role={this.props.userRole} title={quoteTitle} onPanClick={onPanClick} selectedTab={this.props.selectedTab} />
        </div>
        <div className="Col Col-md-4" title="Work" style={{lineHeight: 'normal'}} >
          <WOPan data={fromJS(woWork)} role={this.props.userRole} title={workTitle} onPanClick={onPanClick} selectedTab={this.props.selectedTab} />
        </div>
        <div className="Col Col-md-4" title="RMA" style={{lineHeight: 'normal'}} >
          <WOPan data={fromJS(woRma)} role={this.props.userRole} title="RMA" onPanClick={onPanClick} selectedTab={this.props.selectedTab} />
        </div>
      </div>
    )
  }
}


function stateToProps (state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let isLoading = state.getIn(["VendorDashboard", loginId, "workOrders", "wrloading"], false)
  let isCompletedPanelLoading = state.getIn(["VendorDashboard", loginId, "workOrders", "completedPanelLoading"], false)
  let userRole = state.getIn(['Users', 'entities', 'users', loginId, 'vendor_role'], "")
  let quote = state.getIn(["VendorDashboard", loginId, "user_dashboard", "quote"], List())
  let work = state.getIn(["VendorDashboard", loginId, "user_dashboard", "work"], List())
  let requested = state.getIn(["VendorDashboard", loginId, "user_dashboard", "requested"], List())
  let mduquote = state.getIn(["VendorDashboard", loginId, "user_dashboard", "mduquote"], List())
  let mduwork = state.getIn(["VendorDashboard", loginId, "user_dashboard", "mduwork"], List())
  let mdurequested = state.getIn(["VendorDashboard", loginId, "user_dashboard", "mdurequested"], List())
  let rma = state.getIn(["VendorDashboard", loginId, "user_dashboard", "rma"], List())

  return {
    loginId,
    isLoading,
    isCompletedPanelLoading,
    userRole,
    quote,
    work,
    requested,
    mduquote,mdurequested,mduwork,
    rma
  }
}


export default connect(stateToProps, {})(Dashboard)
