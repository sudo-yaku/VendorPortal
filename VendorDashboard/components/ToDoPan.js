import React, {Component} from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import WorkOrderGrid from './WorkOrderGrid'
import {List} from "immutable"
import MessageBox from '../../Forms/components/MessageBox'

class ToDoPan extends React.Component {

  constructor (props) {
    super(props)
    this.state={
      expand: false,
      wo_selected_tab: null,
      selected_site: null,
      workorders:[]
    }
  }
  static propTypes = {
    data:PropTypes.object,
    month:PropTypes.object,
    title:PropTypes.string,
    onRowClickCallBack:PropTypes.func

  }

  onToggle = () => {
    this.setState({expand: !this.state.expand})
  };
  onTabChange = (key, value, workorders) => {
    if (value === 'site') {this.setState({selected_site:null})}
    this.setState({[key]: value, workorders:workorders})
  };

  renderSiteTab =(o) => {
    let {selected_site} = this.state
    return (<div
        className={
          selected_site === o.name
            ? "col-md-12 no-padding float-left site-bt selected-site-bt"
            : "col-md-12 no-padding  float-left site-bt"
        }
        onClick={() => this.onTabChange("selected_site", o.name, o.workorder)}
      >
        <span className="col-md-12 no-padding float-left site_label">
                {o.name}
          <span className="batch">{o.workorder.length }</span>
        </span>
      </div>)

  }

  render () {
    const {wo_selected_tab, expand, selected_site, workorders} = this.state
    const {dueThisWeek, dueToday, overDue, sites, workorder} = this.props.data

    if (!workorder) {return <span></span>}
    let rows =[]
    if (sites && sites.length) {
      for (let i=0;i<sites.length;i++) {
        rows.push(this.renderSiteTab(sites[i]))
      }
    }
    return (
      <div
        className={
          expand
            ? "col-md-12 float-left wo-pan no-padding"
            : "col-xl-4 col-lg-3 col-md-4 float-left wo-pan no-padding"
        }
      >
        <div className="col-md-12 wo-header no-padding">
          <span>{this.props.title}</span>
          {!this.state.expand ?<a onClick={this.onToggle}><i className="fas fa-expand-arrows-alt icon_expand" ></i></a> :
          <a onClick={this.onToggle}><i className="fas fa-times icon_expand"></i></a>}
        </div>
        {workorder.length === 0 ?<div className="col-md-12 wo-content no-padding" style={{'height':"322px"}}><MessageBox messages={List(["No record(s) found."])}/></div>:
        !this.state.expand ? (
          <div className="col-md-12 wo-content no-padding">
            <div className="col-md-12 numberfont1"style={{'height':"240px"}}>
              <span>{workorder.length}</span>
            </div>
            <div className="col-md-12 no-padding float-left">
              <div className="col-md-4 float-left wo-footpan no-padding" style={{
                "background": "black",
                "color": '#FFF'}}>
                <div className="col-md-12 font-title-1">Overdue</div>
                <div className="col-md-12 numberfont2">{overDue.length}</div>
              </div>
              <div className="col-md-4 float-left wo-footpan no-padding" style={{
                "background": "#757575",
                "color": '#FAFAFA'}}>
                <div className="col-md-12 font-title-1">Today</div>
                <div className="col-md-12 numberfont2">{dueToday.length}</div>
              </div>
              <div className="col-md-4 float-left wo-footpan no-padding" style={{
                "background": "#FAFAFA",
                "color": '#9E9E9E'}}>
                <div className="col-md-12 font-title-1">week</div>
                <div className="col-md-12 numberfont2">{dueThisWeek.length}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-md-12 wo-content no-padding">
            <div className="col-md-2 no-padding float-left">
              <div className="col-md-12 no-padding float-left">
                <div
                  className={
                    wo_selected_tab === "all"
                      ? "col-md-12 no-padding hz-tab-button selected-bt float-left"
                      : "col-md-12 no-padding hz-tab-button float-left"
                  }
                  onClick={() => this.onTabChange("wo_selected_tab", "all", workorder)}
                >
                  <div className="col-md-12 no-padding hz-bt-title float-left">
                    All
                  </div>
                  <div className="col-md-12 no-padding hz-bt-value float-left">
                    <span className>{workorder.length}</span>
                  </div>
                </div>
                <div
                  className={
                    wo_selected_tab === "Overdue"
                      ? "col-md-12 no-padding hz-tab-button selected-bt float-left"
                      : "col-md-12 no-padding hz-tab-button float-left"
                  }
                  onClick={() =>
                    this.onTabChange("wo_selected_tab", "Overdue", overDue)
                  }
                >
                  <div className="col-md-12 no-padding hz-bt-title float-left">
                    Overdue
                  </div>
                  <div className="col-md-12 no-padding hz-bt-value float-left">
                    <span className>{overDue.length}</span>
                  </div>
                </div>
                <div
                  className={
                    wo_selected_tab === "today"
                      ? "col-md-12 no-padding hz-tab-button selected-bt float-left"
                      : "col-md-12 no-padding hz-tab-button float-left"
                  }
                  onClick={() =>
                    this.onTabChange("wo_selected_tab", "today", dueToday)
                  }
                >
                  <div className="col-md-12 no-padding hz-bt-title float-left">
                    Today
                  </div>
                  <div className="col-md-12 no-padding hz-bt-value float-left">
                    <span className>{dueToday.length}</span>
                  </div>
                </div>
                <div
                  className={
                    wo_selected_tab === "week"
                      ? "col-md-12 no-padding hz-tab-button selected-bt float-left"
                      : "col-md-12 no-padding hz-tab-button float-left"
                  }
                  onClick={() =>
                    this.onTabChange("wo_selected_tab", "week", dueThisWeek)
                  }
                >
                  <div className="col-md-12 no-padding hz-bt-title float-left">
                    Week
                  </div>
                  <div className="col-md-12 no-padding hz-bt-value float-left">
                    <span className>{dueThisWeek.length}</span>
                  </div>
                </div>
                <div
                  className={
                    wo_selected_tab === "site"
                      ? "col-md-12 no-padding hz-tab-button selected-bt float-left"
                      : "col-md-12 no-padding hz-tab-button float-left"
                  }
                  onClick={() =>
                    this.onTabChange("wo_selected_tab", "site")
                  }
                >
                  <div className="col-md-12 no-padding hz-bt-title float-left">
                    By Sites
                  </div>
                  <div className="col-md-12 no-padding hz-bt-value float-left">
                    <span className>{sites.length}</span>
                  </div>
                </div>
              </div>
            </div>
            {wo_selected_tab === "site" ? (
              <div className="col-md-2 no-padding float-left">
                {rows}
              </div>
            ) : null}
            <div className={wo_selected_tab === "site" ? "col-8 no-padding float-right":"col-10 no-padding float-right"}>
              {workorders && workorders.length > 0 ? (
                    <WorkOrderGrid workorders={workorders} onRowClickCallBack={this.props.onRowClickCallBack.bind()}/>):
                    !wo_selected_tab || (wo_selected_tab === "site" && !selected_site) ? <MessageBox messages={List(["Please select the tab"])}/>:<MessageBox messages={List(["No record(s) found."])}/>}
            </div>
          </div>
        )}
      </div>)
  }
    }



export default connect()(ToDoPan)
