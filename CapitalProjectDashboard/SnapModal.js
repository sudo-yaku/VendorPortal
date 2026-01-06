import React, { Component } from "react"
import { connect } from "react-redux"
import * as formActions from "../Forms/actions"
import {Map, fromJS, List} from "immutable"
import SiteInformation from '../sites/components/SiteInformation'
import SiteAccess from '../sites/components/SiteAccess'
import moment from "moment"
// import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { fetchSiteDetails,getIssueDetails} from "../sites/actions"
import * as pmActions from "./actions"
import * as VendorActionsNew from "../sites/actions"
import {SingleDatePicker} from 'react-dates'
import {dataURItoBlob, startDownload} from '../VendorDashboard/utils.js'
import "../PreventiveMaintenance/assets/pmstyles.css"
import HealthCheck from "../sites/components/HealthCheck"
import FastHistory from "../sites/components/FastHistory"
import FiveGRepeaterProjectDetails from "./FiveGRepeaterProjectDetails"
import CbandTools from "./CbandTools"
import SQIInformation from "../sites/components/SQIInformation"
import VSMinimalCalendar from '../Calendar/components/VSMinimalCalendar'
import VSMinimalCreateScheduler from "../Calendar/components/VSMinimalCreateScheduler"
import RescheduleIcon from '../Calendar/assets/Rescheduled.png'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/AlarmAdd'
import BackIcon from '@material-ui/icons/Undo'
import Loader from '../Layout/components/Loader'
import {getCalenderEventsForSite} from "../VendorDashboard/actions"
import VendorScheduleCalender from "../Calendar/components/VendorScheduleCalender"
import { FaSnowflake } from 'react-icons/fa';
import AnteenaInformation from "../sites/components/AnteenaInformation"
import RMUIntegration from "./RMUIntegration.js"
import { PrbAnalyzer }  from '../SiteTools/PRBAnalyzer/PrbAnalyzer.js';

class SnapModal extends Component {

  constructor (props) {
    super(props)
    this.state = {
      pageLoading: false,
      fastHistorySelected: false,
      cbandSelected: false,
      refreshNotes: false,
      isCreateFormShown: false,
      prbHeatMapSelected: false
    }
  }
  componentDidMount(){
    this.props.getIssueDetails(this.props.loginId,this.props.selectedRow.site_unid);
    this.props.fetchSiteDetails(this.props.loginId,this.props.selectedRow.site_unid).then(res=>{
    })
    let startDate = moment().startOf("month").format("YYYY-MM-DD");
    let endDate = moment().add(2, "months").endOf("month").format("YYYY-MM-DD");
    this.props.getCalenderEventsForSite(this.props.loginId, startDate, endDate, this.props.selectedRow.site_unid).then(res=>{
    })
    }
  componentDidUpdate(prevProps) {
    let { capitalProjectSelectedRowObj, appNotification, loginId, vendorId, workORderInfo } = this.props;
    if (appNotification && capitalProjectSelectedRowObj && appNotification.notificationType === "Project" && capitalProjectSelectedRowObj.proj_number && appNotification.notificaionProject && appNotification.notificaionProject == capitalProjectSelectedRowObj.proj_number, appNotification.notificationAction == false) {
      if(this.state.refreshNotes == false) {   
        this.setState({ refreshNotes: true})     
        this.props.user.get('vendor_category') != 'Nest Evaluation' && this.props.fetchSectorLockData(vendorId, this.props.loginId, capitalProjectSelectedRowObj.site_unid).then(async action => {
          if (action.type == "FETCH_SECTORLOCKDATA_SUCCESS") {            
            let lock_unlock_request_id = ''
            const siteData = !!action.sectorLockData && !!action.sectorLockData.getSectorLockData && !!action.sectorLockData.getSectorLockData.siteData ? action.sectorLockData.getSectorLockData.siteData.filter(v => v.SECTOR_REQUEST_TYPE != "Breakfix") : null
            var statusArr = [
              "CANCELLED",
              "COMPLETED"]
            var workPendingStatus = ['NEW', 'IN_PROGRESS']
            let filteredLockData = siteData.filter(val => val.WORK_ORDER_ID == capitalProjectSelectedRowObj.proj_number && ((!statusArr.includes(val.REQUEST_STATUS)) || (val.REQUEST_STATUS === 'HAND_OFF' && moment(val.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'))))    
            if (siteData.filter(v => v.WORK_ORDER_ID != capitalProjectSelectedRowObj.proj_number).length == 0 || siteData.filter(v => v.WORK_ORDER_ID != capitalProjectSelectedRowObj.proj_number && ((workPendingStatus.includes(v.REQUEST_STATUS)) || (v.REQUEST_STATUS === 'HAND_OFF' && moment(v.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')))).length == 0) {
              if (!!filteredLockData && filteredLockData.length === 0) {
                lock_unlock_request_id = ''
              } else if (!!filteredLockData && filteredLockData.length > 0) {
                lock_unlock_request_id = siteData.filter(val => !statusArr.includes(val.REQUEST_STATUS) && val.WORK_ORDER_ID == capitalProjectSelectedRowObj.proj_number).sort((a, b) => {
                  if (new Date(a.CREATED_DATE) < new Date(b.CREATED_DATE)) {
                    return 1
                  } else if (new Date(a.CREATED_DATE) > new Date(b.CREATED_DATE)) {
                    return -1
                  } else {
                    return 0
                  }
                })[0].LOCK_UNLOCK_REQUEST_ID.toString()  
              } else {
                lock_unlock_request_id = ''
              }
            } else {    
              lock_unlock_request_id = ''
            }    
            this.props.fetchLockData(loginId, vendorId, capitalProjectSelectedRowObj.proj_number, lock_unlock_request_id)
          }
        })
      }
    }
  }
  getHealthcheckFastTabs = () => {
    let {fastHistorySelected, cbandSelected, prbHeatMapSelected} = this.state
    let {project_initiative} = this.props.selectedRow

    return (
            <div className="row" style={{"background": "#FFF", margin: "15px 0px 15px 0px"}}>
                <div className="subnav" style={{borderBottom: cbandSelected || prbHeatMapSelected || (!cbandSelected && fastHistorySelected) ? "3px solid white" : "3px solid black"}}>
                    <button className="subnavbtn" onClick={() => this.setState({fastHistorySelected: false, cbandSelected: false, prbHeatMapSelected: false})}>HealthCheck</button>
                </div>
                {/* PRB Heat Map tab */}
                <div className="subnav" style={{borderBottom: prbHeatMapSelected ? "3px solid black" : "3px solid white"}}>
                    <button className="subnavbtn" onClick={() => this.setState({prbHeatMapSelected: true, fastHistorySelected: false, cbandSelected: false})}>PRB Heat Map</button>
                </div>
                {/* CBAND Tools tab for CBAND and VRAN projects */}
                {project_initiative && (project_initiative == 'C-BAND') &&
                    <div className="subnav" style={{borderBottom: cbandSelected ? "3px solid black" : "3px solid white"}}>
                        <button className="subnavbtn" onClick={() => this.setState({cbandSelected: true, prbHeatMapSelected: false})}>CBAND Tools</button>
                    </div>
                }
                <div className="subnav" style={{borderBottom: cbandSelected || prbHeatMapSelected || (!cbandSelected && !fastHistorySelected) ? "3px solid white" : "3px solid black"}}>
                    <button className="subnavbtn" onClick={() => this.setState({fastHistorySelected: true, cbandSelected: false, prbHeatMapSelected: false})}>FAST History</button>
                </div>
            </div>)
  }
  ReScheduleEvent(event){
    this.setState({ currentEventObj: (event ? event : null),  isCreateFormShown: !this.state.isCreateFormShown, loadFormCalendar: true })
    setTimeout(
      function () {
        this.setState({ loadFormCalendar: false })
      }
        .bind(this),
      200
    )
  }
  createNewSchedule() {
    let self = this
    let project = this.props.selectedRow
    let currentEventObj = {}
    currentEventObj.category = 'Capital Project'
    currentEventObj.status = 'UNSCHEDULED'
    currentEventObj.start = moment().set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0)
    currentEventObj.end = moment().set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0)
    currentEventObj.description = project.project_name
    currentEventObj.workType = project.project_type
    currentEventObj.workId = project.proj_number

    this.setState({ isCreateFormShown: !this.state.isCreateFormShown, loadFormCalendar: true, currentEventObj: currentEventObj })
    setTimeout(
      function () {
        this.setState({ loadFormCalendar: false })
      }
        .bind(this),
      200
    )
  }
  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )
  }
  getLockUnlockReq = (lock_unlock_request_id) => {
    this.setState({ lock_unlock_request_id });
    if (this.props.onLockUnlockReqReceived) {
      this.props.onLockUnlockReqReceived(lock_unlock_request_id);
    }
    
  }
  refreshCalender = (stDate, endDate) => {
    this.props.getCalenderEventsForSite(this.props.loginId, stDate, moment(endDate).add(2, 'months').endOf('month').format('YYYY-MM-DD'), this.props.selectedRow.site_unid).then(res=>{
    })
  }
  setCapitalModal = ()=>{
    this.setState({isCreateFormShown: !this.state.isCreateFormShown})
  }
  render () {
    let workORderInfo = this.props.selectedRow
    let events = this.props.allEvents
    let {fastHistorySelected, cbandSelected, prbHeatMapSelected} = this.state
    let {calendarevents} = this.props;
    if(workORderInfo && this.props.selectedRow) {
        workORderInfo['workorder_id'] = this.props.selectedRow.proj_number
        workORderInfo['description'] = this.props.selectedRow.project_name
    }
    const {proj_number, sitename, project_name, site_unid, project_type, project_status, project_initiative} = this.props.selectedRow
    let eventDetails = events && events.filter(element=>element.workId == proj_number)
    let siteEvents =  events && events.filter(element=>element.site_unid == site_unid)
    let allcurrentWorkOrderOEvent = this.props.allcurrentWorkOrderOEvent
    let allcurrentWorkOrderOEventStatus = allcurrentWorkOrderOEvent && allcurrentWorkOrderOEvent.status
    let currentWorkOrderOEvent = this.props.currentWorkOrderOEvent
    let currentWorkOrderOEventStatus = currentWorkOrderOEvent && currentWorkOrderOEvent.status
    let isAlreadyScheduled = true
    let Unid = workORderInfo ? workORderInfo.site_unid : ""
    let siteSwitchInfo = this.props.site && this.props.site.toJS()
    let typeWO = "SITE"
    if(this.props.vendorCalenderViewModel){
      return <div> <VendorScheduleCalender
          selectedWR={workORderInfo}
          isProject={true}
          notifref={this.props.notifref}
          workORderInfo={workORderInfo}
          workOrderDetailInfo={fromJS(this.props.workOrderDetailInfo)}
          siteSwitchInfo={siteSwitchInfo}
          currentEventObj={this.props.allcurrentWorkOrderOEvent}
          deviceInfo={this.state.deviceInfo}
          typeWO={typeWO}
          onloadevents={this.props.events.length>0 ? this.props.events: calendarevents.length> 0 ? calendarevents:[]}
          currentWorkOrderOEventStatus={allcurrentWorkOrderOEventStatus}
          refreshCalender={this.refreshCalender}
          setInitialValues={this.props.setInitialValues}
          setValue={this.props.setValue}
          createNewSchedule={this.createNewSchedule.bind(this)}
          workorderId={this.props.workorderId}
        />
        <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto', width: '650px' }}>
          <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
            <i className="fa fa fa-calendar fa-lg" style={{ color: 'rgb(3, 169, 244)' }} /> <span style={{ marginLeft: 8 }}>{'Scheduled'}</span>
          </div>
          <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
            <img src={RescheduleIcon} style={{ height: '19px' }} /><span style={{ marginLeft: 8 }}>{'Rescheduled'}</span>
          </div>
          <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
            <i className="fa fa-times-circle fa-lg" style={{ color: '#D52B1E' }} /> <span style={{ marginLeft: 8 }}>{'Unscheduled'}</span>
          </div>
          <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
            <i className="fas fa-chart-line fa-lg" style={{ color: 'rgb(234, 132, 23)' }} /> <span style={{ marginLeft: 8 }}>{'In Progress'}</span>
          </div>
          <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
            <i className="fa fa-thumbs-up fa-lg" style={{ color: '#009688' }} /> <span style={{ marginLeft: 8 }}>{'Done'}</span>
          </div>
          </div>
      </div>
    }
    else{
    return (
            <div className="container-fluid">
                <table className="table  sortable"
                    style={{minHeight: "100px", maxHeight: "100px", background: "#FFF", border: "none", margin: "0px"}}>
                    <tbody className="vzwtable text-left">
                        <tr className="row" style={{paddingLeft: "1.5em"}}>
                            <td className="Form-group no-border col-md-2">
                                <div><span className="fontLarge" style={{wordWrap:'break-word', 'overflow': 'hidden'}}>Project ID</span></div>
                                <div><span style={{wordWrap:'break-word', 'overflow': 'hidden', fontSize: "15px", fontWeight: "bold"}}>{proj_number}</span></div>
                            </td>
                            <td className="Form-group no-border col-md-2">
                                <div><span className="fontLarge" style={{wordWrap:'break-word', 'overflow': 'hidden'}}>Site Name</span></div>
                                <div><span style={{wordWrap:'break-word', 'overflow':'hidden', fontSize: "15px", fontWeight: "bold"}}>{sitename} {this.props.site?.toJS()?.osw_freeze === true ? (<FaSnowflake style={{ marginLeft: 5, color: '#00bcd4' }} title="Scheduled Freeze" />) : null}</span></div>
                            </td>
                            <td className="Form-group no-border col-md-2">
                                <div><span className="fontLarge" style={{wordWrap:'break-word', 'overflow': 'hidden'}}>Project Type</span></div>
                                <div><span style={{wordWrap:'break-word', 'overflow': 'hidden', fontSize: "15px", fontWeight: "bold"}}>{project_type}</span></div>
                            </td>
                            <td className="Form-group no-border col-md-2">
                                <div><span className="fontLarge" style={{wordWrap:'break-word', 'overflow': 'hidden'}}>Project Status</span></div>
                                <div><span style={{wordWrap:'break-word', 'overflow': 'hidden', fontSize: "15px", fontWeight: "bold"}}>{project_status}</span></div>
                            </td>
                            <td className="Form-group no-border col-md-2">
                                <div><span className="fontLarge" style={{wordWrap:'break-word', 'overflow': 'hidden'}}>Project Initiative</span></div>
                                <div><span style={{wordWrap: 'break-word', 'overflow': 'hidden', fontSize: "15px", fontWeight: "bold"}}>{project_initiative != "null"? project_initiative: ""}</span></div>
                            </td>
                            <td className="Form-group no-border col-md-2">
                                <div><span className="fontLarge" style={{wordWrap:'break-word', 'overflow': 'hidden'}}>Project Name</span></div>
                                <div><span style={{wordWrap:'break-word', 'overflow': 'hidden', fontSize: "15px", fontWeight: "bold"}}>{project_name}</span></div>
                            </td>
                        </tr>

                    </tbody>
                </table>
                
                {/* Hazardous Site Information */}
                {siteSwitchInfo?.is_hazardous_site === true && (
                  <div>
                    <table className="table  sortable" style={{background: "#FFF", border: "none", margin: "0px"}} >
                      <tbody className="vzwtable text-left">
                        <tr style={{paddingLeft: "1.5em"}}>
                          <td className="Form-group no-border col-md-2">
                            <div><span className="fontLarge" style={{wordWrap:'break-word', 'overflow': 'hidden', textDecoration: "underline", fontWeight: "bold"}}>Hazardous Info</span></div>
                            <div className="column" style={{fontSize: '12px'}}>
                              Warning: <span style={{color: 'red', marginLeft: '5px', fontWeight: 'bold'}}>{siteSwitchInfo?.hazard_type || '-'}</span>
                              <br />
                              Description: <span style={{color: 'red', marginLeft: '5px', fontWeight: 'bold'}}>{siteSwitchInfo?.hazard_justification || '-'}</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {/* below code commented for NTSBZ-12317 */}
                {/* {this.props.selectedRow.project_initiative === "C-BAND" ?
                    <div className="row">
                        <div style={{ margin: 'auto', width: '100%' }}>
                            <Card style={{ margin: 'auto', width: '96%' }}>
                                <CardHeader
                                    title={'C-BAND Nodes'}
                                    titleStyle={{ fontWeight: 'bold' }}
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                />
                                <CardText expandable={true}>
                                    <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                        <div className="col-lg-12" style={{ float: 'left' }}>
                                            <CBandProjectDetails selectedRow={this.props.selectedRow} notifref={this.props.notifref}/>
                                        </div>
                                    </div>
                                </CardText>
                            </Card>
                            <br />
                        </div>
                    </div>
                    : null} */}
                {this.props.selectedRow.project_initiative === "5G-Repeater" ?
                    <div className="row">
                        <div style={{ margin: 'auto', width: '100%' }}>
                        <Accordion 
                            style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
                            TransitionProps={{ unmountOnExit: true }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    5G Repeater
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                        <div className="col-lg-12" style={{ float: 'left' }}>
                                            <FiveGRepeaterProjectDetails selectedRow={this.props.selectedRow} notifref={this.props.notifref} />
                                        </div>
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                            <br />
                        </div>
                    </div>
                    : null}
                <div className="row mt-3">
                <div style={{ margin: 'auto', width: '100%', marginBottom:"22px" }}>   
                <Accordion
                style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                 <div>Calendar for site : <span style={{fontSize:'15px', fontWeight:'bold', position:'relative', top:'1px'}}>{sitename}  {this.props.site?.toJS()?.osw_freeze === true ? (<FaSnowflake style={{ marginLeft: 5, color: '#00bcd4' }} title="Scheduled Freeze" />) : null}</span></div>
                </AccordionSummary>
                <AccordionDetails>
                  <div style={{ width: "100%" }}>
                    {isAlreadyScheduled == true ?
                      <Button
                        variant="contained"
                        // onClick={this.createNewSchedule.bind(this)}
                        onClick={((allcurrentWorkOrderOEventStatus == "SCHEDULED" || allcurrentWorkOrderOEventStatus == "RESCHEDULED") && (moment(allcurrentWorkOrderOEvent.end).isAfter(moment().format('DD-MMM-YY'))))? this.ReScheduleEvent.bind(this, currentWorkOrderOEvent) :this.createNewSchedule.bind(this)}
                        style={{ marginLeft: '5px', color: "#FFFFFF", marginTop: '-32px', border: 'none', background: "black",float: "right" }}
                        endIcon={this.state.isCreateFormShown ? <BackIcon></BackIcon> : <AddIcon></AddIcon>}>
                        {/* {this.state.isCreateFormShown ? 'Return to my calendar' : 'Create New Schedule'} */}
                        {this.state.isCreateFormShown ? 'Return to my calendar' : ((allcurrentWorkOrderOEventStatus == "SCHEDULED" || allcurrentWorkOrderOEventStatus == "RESCHEDULED") && (moment(allcurrentWorkOrderOEvent.end).isAfter(moment().format('DD-MMM-YY')))) ? 'Update Schedule' : 'Create New Schedule' }

                      </Button>
                      : this.state.isCreateFormShown ?
                        <Button variant="contained"
                          onClick={this.createNewSchedule.bind(this)}
                          style={{ marginLeft: '5px', color: "#FFFFFF", marginTop: '-15px', border: 'none', background: "black" }}
                          label={'Return to my calendar'}
                          endIcon={<BackIcon></BackIcon>}>Return to my calendar</Button> : null}
                    {this.state.loadFormCalendar ? this.renderLoading() :
                      <div style={!this.state.isCreateFormShown ? { display: 'none' } : { display: 'block' }}>
                        <VSMinimalCreateScheduler
                          notifref={this.props.notifref}
                          workORderInfo={workORderInfo}
                          workOrderDetailInfo={fromJS(this.props.workOrderDetailInfo)}
                          siteSwitchInfo={siteSwitchInfo}
                          currentEventObj={this.props.currentWorkOrderOEvent}
                          typeWO={typeWO} 
                          selectedWR={workORderInfo}
                          setInitialValues={this.props.setInitialValues}
                          refreshCalender={this.refreshCalender}
                          setValue={this.props.setValue}
                          onloadevents = {this.props.events.length>0 ? this.props.events: calendarevents.length> 0 ? calendarevents:[]}
                          isProject={true}
                          setCapitalModal = {this.setCapitalModal}
                          />
                      </div>}
                    {!this.state.isCreateFormShown ?
                      <div><VSMinimalCalendar
                        onloadevents={this.props.events.length>0 ? this.props.events: calendarevents.length> 0 ? calendarevents:[]}
                        refreshCalender={this.refreshCalender}
                        Unid={Unid} />
                      </div> : null}
                    <br />
                    <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto', width: '650px' }}>
                      <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
                        <i className="fa fa fa-calendar fa-lg" style={{ color: 'rgb(3, 169, 244)' }} /> <span style={{ marginLeft: 8 }}>{'Scheduled'}</span>
                      </div>
                      <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
                        <img src={RescheduleIcon} style={{ height: '19px' }} /><span style={{ marginLeft: 8 }}>{'Rescheduled'}</span>
                      </div>
                      <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
                        <i className="fa fa-times-circle fa-lg" style={{ color: '#D52B1E' }} /> <span style={{ marginLeft: 8 }}>{'Unscheduled'}</span>
                      </div>
                      <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
                        <i className="fas fa-chart-line fa-lg" style={{ color: 'rgb(234, 132, 23)' }} /> <span style={{ marginLeft: 8 }}>{'In Progress'}</span>
                      </div>
                      <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
                        <i className="fa fa-thumbs-up fa-lg" style={{ color: '#009688' }} /> <span style={{ marginLeft: 8 }}>{'Done'}</span>
                      </div>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              </div>
                </div>
                <div className="row">
                    <div style={{ margin: 'auto', width: '100%' }}>
                        <Accordion 
                            style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
                            TransitionProps={{ unmountOnExit: true }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                Site Information
                            </AccordionSummary>

                            <AccordionDetails>
                                <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                    <div className="col-lg-12" style={{ float: 'left' }}>
                                        <SiteInformation notifref={this.props.notifref} isWorkInProgress={true} getQuotes={false} workORderInfo={this.props.workORderInfo} selectedRow={this.props.selectedRow} />
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                        <br />
                    </div>
                </div>
              {this.props.issueData&&this.props.issueData.toJS().length>0?<div className="row mt-3">
                    <div style={{ margin: 'auto', width: '100%' }}>
                        <Accordion 
                            style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
                            TransitionProps={{ unmountOnExit: true }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                SQI Information
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                    <div className="col-lg-12" style={{ float: 'left' }}>
                                        <SQIInformation loginId={this.props.loginId} unid={this.props.selectedRow.site_unid} workinfo={this.props.selectedRow} notifref={this.props.notifref}/>
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                        <br />
                    </div>
                </div>:null}
                <div className="row mt-3">
                  <div style={{ margin: 'auto', width: '100%' }}>
                    <Accordion 
                      style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", 
                      fontWeight: "bold" }} TransitionProps={{ unmountOnExit: true }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        Antenna / Radio
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                          <div className="col-lg-12" style={{ float: 'left' }}>
                            <AnteenaInformation loginId={this.props.loginId} unid={this.props.selectedRow.site_unid} workinfo={this.props.selectedRow} capitalProject={true} isProject={true} />
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                    <br />
                  </div>
                </div>
                <div className="row mt-3">
                    <div style={{ margin: 'auto', width: '100%' }}>
                        <Accordion 
                            style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
                            TransitionProps={{ unmountOnExit: true }}
                            defaultExpanded={this.props.isSiteAccessExpandable ? this.props.isSiteAccessExpandable : false}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                Site Access / Alarms
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                    <div className="col-lg-12" style={{ float: 'left' }}>
                                        <SiteAccess notifref={this.props.notifref} isWorkInProgress={true} getQuotes={false} workORderInfo={fromJS(workORderInfo)} selectedRow={this.props.selectedRow} fromRecentActivity={this.props.fromRecentActivity} selectedRecentActivity={this.props.selectedRecentActivity} getLockUnlockReq={this.getLockUnlockReq} />
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                        <br />
                    </div>
                </div>
                {this.props.RMUflag=='Y' &&(
                       <div className="row mt-3">
                       <div style={{ margin: 'auto', width: '100%' }}>
                      
                         <Accordion 
                           style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
                           TransitionProps={{ unmountOnExit: true }}>
                           <AccordionSummary
                             expandIcon={<ExpandMoreIcon />}
                             aria-controls="panel1a-content"
                             id="panel1a-header"
                           >
                             RMU Integration
                           </AccordionSummary>
                           <AccordionDetails>
                             <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                               <div className="col-lg-12" style={{ float: 'left' }}>
                               <RMUIntegration 
                             email={this.props.user.get('email')} 
                             proj_number={proj_number}
                             username={this.props.user.get('name')}
                             companyName={this.props.user.get('vendor_name')}
                             siteDetails={this.props.site?.toJS()} 
                             workORderInfo={this.props.workORderInfo} 
                             selectedRow={this.props.selectedRow} 
                             statusApiDelay={this.props.statusApiDelay}
                             loginId={this.props.loginId}
                             vendorId={this.props.vendorId}
                             rmuLegacy={this.props.rmuLegacy}
                           />
                               </div>
                             </div>
                           </AccordionDetails>
                         </Accordion>
                         <br />
                       </div>
                     </div>
                )}
           
                <div className="row">
                    <div style={{ margin: 'auto', width: '100%' }}>
                        <Accordion 
                            style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
                            TransitionProps={{ unmountOnExit: true }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                Standalone Health Check and FAST History
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                    <div className="col-lg-12" style={{ float: 'left', background: "rgb(236, 239, 241)" }}>
                                        {this.getHealthcheckFastTabs()}
                                        {cbandSelected ? <CbandTools selectedRow={this.props.selectedRow}/> : fastHistorySelected ?
                                         <FastHistory selectedRow={this.props.selectedRow} workORderInfo={fromJS(workORderInfo)} /> : prbHeatMapSelected ?
                                          <PrbAnalyzer siteUnid={this.props.selectedRow.site_unid} mode="in-place" /> :
                                           <HealthCheck notifref={this.props.notifref} selectedRow={this.props.selectedRow} hcFromStandAloneToolsTab={true} />}
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                        <br />
                    </div>
                </div>

            </div>
    )
  }
  }
}

function stateToProps (state, props) {
  let workorderId = (props.selectedRow && props.selectedRow.proj_number ? props.selectedRow.proj_number + "" : null)
  let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  let meta_unid = props.selectedRow.site_unid
  let user = state.getIn(["Users", "entities", "users", loginId], Map())
  let issueData= state.getIn(["Sites", loginId, "issue","issueData"],Map());
  let vendorId = user.toJS().vendor_id
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let allevents = state.getIn(["VendorDashboard", loginId, "events", "eventsDetails"], Map())
  allevents = allevents.toJS().getEventDetails;
  let events = state.getIn(["VendorDashboard", loginId, "eventsforSite", "eventsforSiteDetails"], Map())
  events = events?.toJS()?.getCalenderEventsForSite ? events?.toJS()?.getCalenderEventsForSite?.data : [];
  let recentCurrentWorkOrderOEvent = events.filter((elem) => elem.workId == workorderId)
  let recentEventId = recentCurrentWorkOrderOEvent.sort((a,b) => a.eventId - b.eventId)
  let currentWorkOrderOEvent = recentEventId[recentEventId.length-1]
  let allEvents = state.getIn(["VendorDashboard", loginId, "events", "allEvents", "eventsDetails"], Map())
  allEvents = allEvents?.toJS()?.getEventDetails ? allEvents?.toJS()?.getEventDetails : [];
  let allrecentCurrentWorkOrderOEvent = allEvents.filter((elem) => elem.workId == workorderId)
  let allrecentEventId = allrecentCurrentWorkOrderOEvent.sort((a,b) => a.eventId - b.eventId)
  let allcurrentWorkOrderOEvent = allrecentEventId[allrecentEventId.length-1]
  return {
    workOrderDetailInfo: state.getIn(["VendorDashboard", "workOrderDetail", meta_unid], Map()),
    siteDetaisLoading: state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false),
    RMUflag: config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "RMU_INTEGRATION_ENABLE")?.ATTRIBUTE_VALUE || 'N',
    rmuLegacy : config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "RMU_LEGACY_LINK_API")?.ATTRIBUTE_VALUE ,
    statusApiDelay: config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "EAT_SYNC_API_DELAY")?.ATTRIBUTE_VALUE ,

    site: state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()),
    loginId,
    allcurrentWorkOrderOEvent,
    vendorId,
    user,
    submarket,
    issueData,
    events,
    allevents,
    currentWorkOrderOEvent,
    workorderId
  }
}
export default connect(stateToProps, {...formActions, ...pmActions, ...VendorActionsNew,getIssueDetails,getCalenderEventsForSite, fetchSiteDetails})(SnapModal)