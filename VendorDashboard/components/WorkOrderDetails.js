import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { List, Map } from "immutable"
import * as formActions from "../../Forms/actions"
import MessageBox from '../../Forms/components/MessageBox'
import SiteInformation from '../../sites/components/SiteInformation'
import SQIInformation from "../../sites/components/SQIInformation"
import SiteDetails from '../../sites/components/SiteDetails'

import SwitchDetails from '../../Switch/components/SwitchDetails'
import WorkOrderFormFixedPricing from './WorkOrderFormFixedPricing'
import ElogForm from '../../Elog/components/ElogForm'
import { Step, Stepper, StepLabel, StepContent } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/AlarmAdd'
import BackIcon from '@material-ui/icons/Undo'
import VSMinimalCalendar from '../../Calendar/components/VSMinimalCalendar'
import VSMinimalCreateScheduler from "../../Calendar/components/VSMinimalCreateScheduler"
import moment from "moment"
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as utils from "../utils"
import * as VendorActions from "../actions"
import * as elogActions from "../../Elog/actions"
import * as VendorActionsNew from "../../sites/actions"
import Loader from '../../Layout/components/Loader'
import WorkorderFileUpload from './WorkorderFileUpload'
import Select from 'react-select'
import { formatDate, utcToLocal } from '../../date_utils'
import { fetchSiteDetails } from "../../sites/actions"
import { getIssueDetails} from "../../sites/actions"
import { fetchSwitchDetails } from "../../Switch/actions"
import { getCalenderEventsForSite,getConflictkirkeEventsForSite, submitScheduleRequest, updateScheduleRequest } from "../../VendorDashboard/actions"
import { getVendorStatus } from '../utils'
import isEqual from 'lodash/isEqual'
import { ivrEmailNotify } from '../../Users/actions'
import { ivrEmailNotification } from '../../Users/schema'
import Datetime from 'react-datetime'
import '../../../node_modules/react-datetime/css/react-datetime.css'
import RescheduleIcon from '../../Calendar/assets/Rescheduled.png'
import RootActive from './../../Images/Root_Active.png'
import blackbird from './../../Images/black-bird.png'
import { FaSnowflake } from 'react-icons/fa';
import VSI from './../../Images/VSI.svg'
import Arrow from './../../Images/Arrow.svg'
import HealthCheck from "../../sites/components/HealthCheck"
import FastHistory from "../../sites/components/FastHistory"
import RMAComponent from "./RMAComponentAccordion"
import AnteenaInformation from "../../sites/components/AnteenaInformation"
import VendorScheduleCalender from "../../Calendar/components/VendorScheduleCalender"
import RMADetails from "./RMADetails"
import CbandTools from "../../CapitalProjectDashboard/CbandTools"
import ReactTooltip from "react-tooltip"
import { PrbAnalyzer }  from '../../SiteTools/PRBAnalyzer/PrbAnalyzer.js';
import WorkInProgressWorkOrders from "./WorkInProgressWorkOrders"

const formName = "WorkOrderDetails"
const DATE_TIME_FORMAT = "MM-DD-YYYY hh:mm A"

class WorkOrderDetails extends React.Component {
  static propTypes = {
    workORderInfo: PropTypes.object,
    currentValues: PropTypes.object,
    userdetails: PropTypes.object,
    getQuotes: PropTypes.bool,
    isWorkInProgress: PropTypes.bool,
    isAcceptedWork: PropTypes.bool,
    setInitialValues: PropTypes.func,
    fetchElogByWorkOrderID: PropTypes.func,
    fetchGeneratorDetails: PropTypes.func,
    fetchGenTankDetails: PropTypes.func,
    fetchHvacDetails: PropTypes.func,
    elogs: PropTypes.object,
    isQuoteReceived: PropTypes.bool,
    isCompleted: PropTypes.bool,
    onDirtyChange: PropTypes.func,
    userRole: PropTypes.string,
    elogLoading: PropTypes.bool,
    loginId: PropTypes.string,
    updateWorkorderStatus: PropTypes.func,
    resetProps: PropTypes.func,
    saveVenderStatusLoading: PropTypes.bool,
    savedStatusMessage: PropTypes.object,
    saveStatusError: PropTypes.object,
    userFullName: PropTypes.string,
    handleHideModal: PropTypes.func,
    title: PropTypes.string,
    setValue: PropTypes.func,
    submitGenReadingsRequest: PropTypes.func,
    deleteSavedGenReadMsg: PropTypes.func,
    fetchSiteDetails: PropTypes.func,
    fetchSwitchDetails: PropTypes.func,
    ivrEmailNotify: PropTypes.func,
    tableTitle: PropTypes.string,
    onLockUnlockReqReceived: PropTypes.func
  };

  constructor(props) {
    super(props)
    this.aList = List();
    this.eventError = false;
    this.state = {
      toggleProvideQuote: false, isSiteDetailShown: false, isCreateFormShown: false, isInfoMessageShown: false, isErrorMessageShown: false,
      validationMessage: '', toggleCompleteWRForm: false, finished: false, stepIndex: 0, eventWorkIds: [],
      vendor_status: "", isGeneratorInfo: false, isHvacInfo: false, isWRFShown: false, isWRFEditable: false, isWodEditable: true,
      isWoPending: false,isRmaWO: false, selectedTitle: '', filteredEvents: [], isSwitchDetailShown: false, isAcknowledgementPending: false, workPendingElog: {
        isEmpty: false
      }, startDate: moment(new Date()).set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0),
      ISOstart: '', ISOend: '',
      endDate: moment(new Date()).set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0), startDateValErr: null, endDateValErr: null,
      fastHistorySelected: false,
      eventError: false,
      refreshNotes: false, siteArea:'', siteRegion:'', quoteVendorId:'', quoteVendorName:'',deviceInfo:[], cbandSelected: false, samsung5gnodes:[],submitFlag: true, vendor_status_wo : '', prbHeatMapSelected: false,
    }

  }
  async getSiteInfo() {
    if (this.props.siteDetailInfo && this.props.siteDetailInfo.size > 0) {
      let siteDetails = this.props.siteDetailInfo.toJS();
      let allnodeDetails = siteDetails.node_details;
      let nodes = allnodeDetails.length>0 ?  allnodeDetails.filter(i => i.vendor?.toLowerCase() === 'samsung' && i.type?.toUpperCase() == "5G"  && i.node.length > 0 &&  i.node[i.node?.length - 4] === '3') : [];
      this.setState({ samsung5gnodes: nodes, siteArea: siteDetails?.area || '', siteRegion: siteDetails?.region || '' })
    }else{
       await this.props.fetchSiteDetails(this.props.loginId, this.props.workORderInfo.get("site_unid")).then(res => {
        if(res.type == "FETCH_SITEDETAILS_SUCCESS"){
          let allnodeDetails =  res.site?.node_details;
          let nodes = allnodeDetails.length>0 ?  allnodeDetails.filter(i => i.vendor?.toLowerCase() === 'samsung' && i.type?.toUpperCase() == "5G" && i.node.length > 0 &&  i.node[i.node?.length - 4] === '3') : [];
          this.setState({ samsung5gnodes: nodes, siteArea: res?.site?.area || '', siteRegion: res?.site?.region || '' })
        }else{
          this.setState({ samsung5gnodes: [] })
        }
      })
    }
  }
  getHealthcheckFastTabs = () => {
    let { fastHistorySelected, cbandSelected, samsung5gnodes, prbHeatMapSelected } = this.state;
    return (
      <div className="row" style={{ "background": "#FFF", margin: "0px 0px 25px 0px" }}>
        <div className="subnav" style={{ borderBottom:  cbandSelected || prbHeatMapSelected || (!cbandSelected && fastHistorySelected) ? "3px solid white" : "3px solid black" }}>
          <button className="subnavbtn" onClick={() => this.setState({ fastHistorySelected: false, cbandSelected: false, prbHeatMapSelected: false })}>HealthCheck</button>
        </div>
        {/* PRB Heat Map tab */}
        <div className="subnav" style={{ borderBottom: prbHeatMapSelected ? "3px solid black" : "3px solid white" }}>
          <button className="subnavbtn" onClick={() => this.setState({ prbHeatMapSelected: true, fastHistorySelected: false, cbandSelected: false })}>PRB Heat Map</button>
        </div>
        {samsung5gnodes.length > 0 && 
                    <div className="subnav" style={{borderBottom: cbandSelected ? "3px solid black" : "3px solid white"}}>
                        <button className="subnavbtn" onClick={() => this.setState({cbandSelected: true, prbHeatMapSelected: false})}>CBAND Tools</button>
                    </div>}
        <div className="subnav" style={{ borderBottom:  cbandSelected || prbHeatMapSelected || (!cbandSelected && !fastHistorySelected)  ? "3px solid white" : "3px solid black" }}>
          <button className="subnavbtn" onClick={() => this.setState({ fastHistorySelected: true, cbandSelected: false, prbHeatMapSelected: false })}>FAST History</button>
        </div>        
      </div>)
  }
  resetInfo = () => {
    this.setState({ isInfoMessageShown: false, isErrorMessageShown: false, validationMessage: '' })
    this.props.deleteSavedGenReadMsg()
  }
  
  componentDidMount() {
    if(this.props.vendorWorkOrderSelectedRowObj?.site_unid){
      this.props.getIssueDetails(this.props.loginId,this.props.vendorWorkOrderSelectedRowObj.site_unid);}
      this.initializeWOForm()
  }

  initializeWOForm = () => {
    this.props.deleteSavedGenReadMsg()
    this.getSiteInfo()
    let { workORderInfo, fetchElogByWorkOrderID, userdetails, isQuoteReceived, isCompleted, fetchGeneratorDetails,
      fetchGenTankDetails, fetchHvacDetails, fetchWoByUnidDetails, title, setInitialValues,
      fetchSwitchDetails, getCalenderEventsForSite,getConflictkirkeEventsForSite, tableTitle, rma_data } = this.props
    let vendor_id = `${userdetails.get("vendor_id")}-${userdetails.get("vendor_name")}`
    let workorder_id = workORderInfo.get("workorder_id")
    let woHasRma = rma_data?.toJS()?.some(rma => rma.VWRS_ID == String(workorder_id))
    setInitialValues(formName, {})
    setInitialValues(formName, { "work_type": workORderInfo.get('work_type') })
    this.resetMessages()
    if (isQuoteReceived) {
      this.handleNext(1)
    }
    if (isCompleted) {
      this.handleNext(2)
    }

    this.setState({ vendor_status: workORderInfo.get("vendor_status") + "" })
    if (workORderInfo.get("site_unid") && workORderInfo.get("work_type")) {
      let user = this.props.userdetails ? this.props.userdetails.toJS() : {}
      let vendorId = user.vendor_id
      if (workORderInfo.get("work_type").toLowerCase().includes('generator') || 'ENGIE-FUEL' == workORderInfo.get("work_type")) {
        fetchGeneratorDetails(workORderInfo.get("site_unid"), workORderInfo.get("site_type")).then((action) => {
          if (action.type === 'FETCH_GENERATORDETAILS_SUCCESS') {
            this.setState({ isGeneratorInfo: true })
          }
        })
        fetchGenTankDetails(workORderInfo.get("site_unid")).then((action) => {
          if (action.type === 'FETCH_GENTANKDETAILS_SUCCESS') {
            this.setState({ isGeneratorInfo: true })
          }
        })
      }
      if (workORderInfo.get("work_type") == 'HVAC') {
        fetchHvacDetails(workORderInfo.get("site_unid"), workORderInfo.get("site_type")).then((action) => {
          if (action.type === 'FETCH_HVACDETAILS_SUCCESS') {
            this.setState({ isHvacInfo: true })
          }
        })
      }

      if (workORderInfo.get("site_type") == 'SITE') {
       
        getConflictkirkeEventsForSite(this.props.loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') , workORderInfo.get("site_unid"))
        getCalenderEventsForSite(this.props.loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') , workORderInfo.get("site_unid"))
        // let filteredEvents = this.props.events.filter((events) => events.siteUnid == workORderInfo.get("site_unid"))
        let filteredEvents = (this.props.events ? this.props.events.filter((events) => events.siteUnid == workORderInfo.get("site_unid")) : [])
        let eventWorkIds = []
        eventWorkIds = [...new Set(eventWorkIds)]
        this.setState({ filteredEvents: filteredEvents, eventWorkIds: eventWorkIds })
      } else if (workORderInfo.get("site_type") == 'SWITCH') {
        fetchSwitchDetails(this.props.loginId, workORderInfo.get("site_unid"))
        getConflictkirkeEventsForSite(this.props.loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') , workORderInfo.get("site_unid"))
         getCalenderEventsForSite(this.props.loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD'), workORderInfo.get("site_unid"))
        // let filteredEvents = this.props.events.filter((events) => events.siteUnid == workORderInfo.get("site_unid"))
        let filteredEvents = (this.props.events ? this.props.events.filter((events) => events.switchUnid == workORderInfo.get("site_unid")) : [])
        let eventWorkIds = []
        eventWorkIds = [...new Set(eventWorkIds)]
        this.setState({ filteredEvents: filteredEvents, eventWorkIds: eventWorkIds })
      }
    }
    if (workORderInfo.get("meta_universalid")) {
      fetchWoByUnidDetails(workORderInfo.get("meta_universalid"),this.props.loginId, { tableTitle, loginId: this.props.loginId }).then((action) => {
        if(action.type == "FETCH_WO_UNID_SUCCESS"){
        let devices = action.vendor_wo_details && action.vendor_wo_details.device_uts_id;
        let deviceInfo = devices && JSON.parse(devices);
         this.setState({deviceInfo});
          this.setState({
            quoteVendorId: action.vendor_wo_details && action.vendor_wo_details.cfd_quote_vendorid_1 ? action.vendor_wo_details.cfd_quote_vendorid_1: '',
            quoteVendorName : action.vendor_wo_details && action.vendor_wo_details.cfd_quote_vendorname_1 ? action.vendor_wo_details.cfd_quote_vendorname_1: '',
          })
          this.setState({
            vendor_status_wo: action.vendor_wo_details && action.vendor_wo_details.vendor_status ? action.vendor_wo_details.vendor_status : ''})

        }
      })
    }
    if (title == "SEARCH") {
      title = getVendorStatus(workORderInfo.get("workorder_status"), workORderInfo.get("quote_statuses"), workORderInfo.get("vendor_status"), workORderInfo.get("work_type"), workORderInfo.get("priority") )
      this.setState({ selectedTitle: title })
    }
    fetchElogByWorkOrderID(vendor_id, workorder_id).then((action) => {
      if (action.type === 'FETCH_ELOG_SUCCESS') {
        if (action.elogs && (["Work Pending"].indexOf(title) > -1)) {
          this.handleNext(2)
          if (action.elogs.length == 0) {
            this.setState({ workPendingElog: { isEmpty: true } })
          }
        } else {
          if (action.elogs && action.elogs.length > 0) {
            this.handleNext(2)
          } else {
            this.handleNext(1)
          }
        }
      }else{
        if(["Work Pending"].indexOf(title) > -1) {
          this.handleNext(2)
        }else{
          this.handleNext(1)
        }
      }
    })
    const iswrfshown = (["Quote Pending", "Quote Received", "Pending Approval", "Quote Declined"].indexOf(title) > -1) ? true : false
    const iswrfeditable = (["Awaiting PO", "Work Pending", "Acknowledge Pending"].indexOf(title) > -1) ? true : false
    const iswodeditable = (["Work Completed", "Work Accepted", "Work Declined", "Work Cancelled"].indexOf(title) > -1) ? true : false
    const isWorkPending = (["Work Pending"].indexOf(title) > -1) ? true : false

    if (!iswrfshown) {
      this.setState({ isWRFShown: true })
    }
    // if (workORderInfo.get("quote_statuses") === utils.STATUS_AWAITING_PO && title == "Work Pending") {
    //   this.setState({ isWRFShown: false })
    // }
    if (iswrfeditable) {
      this.setState({ isWRFEditable: true })
    }
    if (iswodeditable) {
      this.setState({ isWodEditable: false })
    }
    if (isWorkPending) {
      this.setState({ isWoPending: true })
    }
    if(woHasRma) {
      this.setState({ isRmaWO: true })
    }
  }

  setElogState = () => {
    this.setState({ workPendingElog: { isEmpty: false } })
    return null;
  }
getLockUnlockReq = (lock_unlock_request_id) => {
    this.setState({ lock_unlock_request_id });
    if (this.props.onLockUnlockReqReceived) {
      this.props.onLockUnlockReqReceived(lock_unlock_request_id);
    }
    
  }
  handleChangeStatus = (vendor_status) => {
    this.setState({ vendor_status: (vendor_status && vendor_status.value) ? vendor_status.value : "" })
    if(vendor_status.value == 'Pending Vendor Invoice'){
      this.setState({submitFlag: false})
    }
    this.resetMessages()
  }

  componentDidUpdate(prevProps) {
    let { vendorWorkOrderSelectedRowObj, appNotification, loginId, vendorId, workORderInfo } = this.props;
    if (appNotification && vendorWorkOrderSelectedRowObj && appNotification.notificationType === "Work" && vendorWorkOrderSelectedRowObj.workorder_id && prevProps.appNotification.notificaionProject && prevProps.appNotification.notificaionProject == vendorWorkOrderSelectedRowObj.workorder_id) {
      if (this.state.refreshNotes == false) {
        this.setState({ refreshNotes: true })
        this.props.user.get('vendor_category') != 'Nest Evaluation' && this.props.fetchSectorLockData(vendorId, this.props.loginId, workORderInfo.get('site_unid')).then(async action => {
          if (action.type == "FETCH_SECTORLOCKDATA_SUCCESS") {
            let lock_unlock_request_id = ''
            const siteData = !!action.sectorLockData && !!action.sectorLockData.getSectorLockData && !!action.sectorLockData.getSectorLockData.siteData ? action.sectorLockData.getSectorLockData.siteData.filter(v => v.SECTOR_REQUEST_TYPE == "Breakfix") : null
            var statusArr = [
              "CANCELLED",
              "COMPLETED"]
            var workPendingStatus = ['NEW', 'IN_PROGRESS']
            let filteredLockData = siteData.filter(val => val.WORK_ORDER_ID == workORderInfo.get('workorder_id') && ((!statusArr.includes(val.REQUEST_STATUS)) || (val.REQUEST_STATUS === 'HAND_OFF' && moment(val.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'))))
            if (siteData.filter(v => v.WORK_ORDER_ID != workORderInfo.get('workorder_id')).length == 0 || siteData.filter(v => v.WORK_ORDER_ID != workORderInfo.get('workorder_id') && val.VENDOR_MDG_ID == this.props.user.get('vendor_mdg_id') && ((workPendingStatus.includes(v.REQUEST_STATUS)) || (v.REQUEST_STATUS === 'HAND_OFF' && moment(v.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')))).length == 0) {
              if (!!filteredLockData && filteredLockData.length === 0) {
                lock_unlock_request_id = ''
              } else if (!!filteredLockData && filteredLockData.length > 0) {
                lock_unlock_request_id = siteData.filter(val => !statusArr.includes(val.REQUEST_STATUS) && val.WORK_ORDER_ID == workORderInfo.get('workorder_id')).sort((a, b) => {
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
            this.props.fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), lock_unlock_request_id)
          }
        })
      }
    }
    if (!(isEqual(prevProps.events, this.props.events))) {
      if (prevProps.workORderInfo.get("site_type") == 'SWITCH') {
        var filteredEvents = this.props.events ?
          this.props.events.filter((event) => event.switchUnid == prevProps.workORderInfo.get("site_unid") && event.siteUnid == null) : [];
        let eventWorkIds = []
        eventWorkIds = [...new Set(eventWorkIds)]
        this.setState({ filteredEvents: filteredEvents, eventWorkIds: eventWorkIds })
      }
      if (prevProps.workORderInfo.get("site_type") == 'SITE') {
        var filteredEvents = this.props.events ?
          this.props.events.filter((event) => event.siteUnid == prevProps.workORderInfo.get("site_unid")) : [];
        let eventWorkIds = []
        eventWorkIds = [...new Set(eventWorkIds)]
        this.setState({ filteredEvents: filteredEvents, eventWorkIds: eventWorkIds })
      }
    }
    if ((prevProps.workOrderDetailInfo.get("vendor_status") != this.props.workOrderDetailInfo.get("vendor_status")) &&
      prevProps.workOrderDetailInfo.get("vendor_status") !== undefined && this.props.workOrderDetailInfo.get("vendor_status") !== undefined) {
      
      this.initializeWOForm()
      this.setState({ vendor_status: this.props.workOrderDetailInfo.get("vendor_status") + "" })
    } else if (prevProps.workOrderDetailInfo.get("vendor_status") === undefined && 
      this.props.workOrderDetailInfo.get("vendor_status") !== undefined) {

      this.setState({ vendor_status: this.props.workOrderDetailInfo.get("vendor_status") + "" })
    }
  }

  onSubmitVendorStatus = (that, status, fieldFrom, invoiceComments, comments) => {
    let unscheduledWorkTypes = [];
    let unscheduledWork = this.props.configData?.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE")?.ATTRIBUTE_VALUE;
    if(unscheduledWork){
      unscheduledWorkTypes = unscheduledWork?.split(",");
    }
    let o = {
      "vendor_status": status ? status : this.state.vendor_status,
      "userid": this.props.loginId,
      "vendor_wo_unid": this.props.workOrderDetailInfo.get("meta_universalid"),
      "site_unid": this.props.workOrderDetailInfo.get('site_key')
    }
    this.setState({submitFlag: true})
    if(comments){
      o["vendor_status_comments"] = comments;
    }
    
    if (status && status == 'Work Completed' && fieldFrom && fieldFrom == 'workOrderForm') {
      o["work_completed"] = "yes"
      o["work_completed_comments"] = invoiceComments
    }
    if(this.state.vendor_status_wo.toLowerCase() != 'pending vendor invoice' && this.state.vendor_status_wo.toLowerCase() != 'work completed'){
    this.props.updateWorkorderStatus(o, this.props.loginId, this.props.workOrderDetailInfo.get("meta_universalid"), this.props.userFullName).then((action) => {
      if (action.type === 'UPDATE_WORKORDER_STATUS_SUCCESS') {
        let stDate = moment().subtract(7, 'days')
        let edDate = moment()
        this.props.fetchWorkOrder(this.props.loginId, stDate.format('YYYY-MM-DD'), edDate.format('YYYY-MM-DD'), null,null,unscheduledWorkTypes)
        if (fieldFrom && fieldFrom == 'workOrderForm') {
          null
        } else if (fieldFrom && fieldFrom == 'NotifyAdmin') {
          this.sendEmailNotification("Work Completed")
        }
        else {
          this.sendEmailNotification(this.state.vendor_status)
        }
        if (status) {
          this.setState({ vendor_status: status })
        }
      }
    })
  }
    // this.props.updateVendorStatusComments(o).then((action) => {
    //   if (action.type === 'UPDATE_VENDORSTATUSCOMMENTS_SUCCESS') {
    //     if (fieldFrom && fieldFrom == 'workOrderForm') {
    //       null
    //     } else if (fieldFrom && fieldFrom == 'NotifyAdmin') {
    //       console.log("Notify admin")
    //       this.sendEmailNotification("Work Completed")
    //     }
    //     else {
    //       this.onSubmit()
    //       this.setState({ showTooltip: false })
    //       console.log("in else")
    //       this.sendEmailNotification(this.state.vendor_status)
    //     }
    //     if (status) {
    //       this.setState({ vendor_status: status })
    //     }
    //   }
    // })
  }

  onSubmit = () => {
    let self = this
    let workOrderInfo = this.props.workOrderInfo.toJS()
    let siteSwitchInfo = workOrderInfo ? workOrderInfo.site_type == "SITE" ? this.props.site.toJS() : this.props.switchInfo.toJS() : {}
    let typeWO = workOrderInfo ? workOrderInfo.site_type == "SITE" ? "SITE" : "SWITCH" : ""
    let { loginId, submitScheduleRequest, updateScheduleRequest } = this.props
    let user = this.props.user.toJS()
    let vendorId = user.vendor_id
    let techName = user.lname + ', ' + user.fname
    let fileData = []
    let currentWOEvent = {}
    if (this.props && this.props.workOrderDetailInfo && this.props.workOrderDetailInfo.get("workorder_id") && this.state.filteredEvents) {
      let isAlreadyScheduled = true
      isAlreadyScheduled = this.state.eventWorkIds.indexOf(this.props.workOrderDetailInfo.get("workorder_id")) > -1
      if ((isAlreadyScheduled == false && this.state.vendor_status != 'Work Completed') || isAlreadyScheduled == true) {
        isAlreadyScheduled == true ?
          currentWOEvent = (this.state.filteredEvents.filter((elem) => {
            return elem.workId == this.props.workOrderDetailInfo.get("workorder_id")
          }))[0] : {}
        let scheduleStatus = isAlreadyScheduled == true ? 'Update' : 'New'
        let isoRepresentationStart = new Date().toISOString()
        let isoRepresentationEnd = new Date().toISOString()

        if (typeof (this.state.startDate) === 'object') {
          isoRepresentationStart = new Date(this.state.startDate).toISOString()
          this.setState({ ISOstart: isoRepresentationStart })
        }
        if (typeof (this.state.endDate) === 'object') {
          isoRepresentationEnd = new Date(this.state.endDate).toISOString()
          this.setState({ ISOend: isoRepresentationEnd })
        }

        let values = this.props.currentValues.toJS()
        values.category = 'Vendor Work Order'
        values.description = workOrderInfo.work_scope
        values.workType = workOrderInfo.work_type
        values.workId = workOrderInfo.workorder_id
        values.start = Object.keys(currentWOEvent).length > 0 ? currentWOEvent.start : this.state.ISOstart != '' ? this.state.ISOstart : isoRepresentationStart
        values.end = Object.keys(currentWOEvent).length > 0 ? currentWOEvent.end : this.state.ISOend != '' ? this.state.ISOend : isoRepresentationEnd
        values.workId = workOrderInfo.workorder_id
        values.files = Object.keys(currentWOEvent).length > 0 ? currentWOEvent.files : fileData
        values.market = siteSwitchInfo.market
        values.submarket = siteSwitchInfo.region
        values.siteNo = typeWO == 'SWITCH' ? null : parseInt(siteSwitchInfo.siteid)
        values.siteName = typeWO == 'SWITCH' ? null : siteSwitchInfo.sitename
        values.siteUnid = typeWO == 'SWITCH' ? null : siteSwitchInfo.site_unid
        values.switchUnid = typeWO == 'SWITCH' ? siteSwitchInfo.switch_unid : null
        values.switchName = typeWO == 'SWITCH' ? siteSwitchInfo.switch_name : null
        values.vendorCompanyName = user.vendor_name
        values.vendorTechName = techName
        if (Object.keys(currentWOEvent).length > 0) {
          values.title = currentWOEvent.title
          values.eventId = currentWOEvent.eventId
        }
        if (this.state.vendor_status == 'Scheduled') {
          values.status = 'SCHEDULED'
          values.start = this.state.ISOstart != '' ? this.state.ISOstart : isoRepresentationStart
          values.end = this.state.ISOend != '' ? this.state.ISOend : isoRepresentationEnd
        }
        if (this.state.vendor_status == 'Rescheduled') {
          values.status = 'RESCHEDULED'
          values.start = this.state.ISOstart != '' ? this.state.ISOstart : isoRepresentationStart
          values.end = this.state.ISOend != '' ? this.state.ISOend : isoRepresentationEnd
        }
        if (this.state.vendor_status == 'In Progress') {
          values.status = 'INPROGRESS'
        }
        if (this.state.vendor_status == 'Rejected') {
          values.status = 'REJECTED'
        }
        if (this.state.vendor_status == 'Work Completed') {
          values.status = 'DONE'
        }
        values.vendorId = vendorId
        values.loginId = this.props.loginId
        values.loginName = techName
        if (values.work_type) {
          values.workType = values.work_type
          delete values.work_type
        }

        if (scheduleStatus == 'Update') {
          if (values.comments) {
            delete values.comments
          }
          var updateObj = {}
          updateObj.newData = values
          updateObj.oldData = currentWOEvent
          updateScheduleRequest(loginId, updateObj).then((action) => {
            if (action.type === 'UPDATE_SCHEDULE_REQUEST_SUCCESS') {
              let { getCalenderEventsForSite, loginId } = self.props
              if (action.savedMessage) {
                self.props.notifref.addNotification({
                  title: 'Success',
                  position: "br",
                  level: 'success',
                  autoDismiss: 3,
                  message: action.savedMessage
                })
                getCalenderEventsForSite(loginId, this.props.loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') , this.props.workORderInfo.get("site_unid"))
                self.sendEmailNotificationForScheduling(updateObj.newData)
              }
            }
          })
        }
        if (scheduleStatus !== 'Update') {
          submitScheduleRequest(loginId, values).then((action) => {
            if (action.type === 'SUBMIT_SCHEDULE_REQUEST_SUCCESS') {
              let { loginId, getCalenderEventsForSite } = self.props
              if (action.savedMessage) {
                self.props.notifref.addNotification({
                  title: 'Success',
                  position: "br",
                  level: 'success',
                  autoDismiss: 3,
                  message: action.savedMessage
                })
              }
              getCalenderEventsForSite(loginId, this.props.loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD'), this.props.workORderInfo.get("site_unid"))
              self.sendEmailNotificationForScheduling(values);
            }
          })
        }
      }
    }
  }

  sendEmailNotificationForScheduling(data) {
    let locationForSiteWO = this.props.workOrderInfo.toJS().switch
    let bodyMessage =
      '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
      '	<h1 style="background:#ff9800;color:#ffffff;padding:5px;margin:0px"> Vendor Schedule Notification </h1>' +
      '	<div style="padding:10px;color:#607d8b">' +
      '		<div>Work Description: ' + data.workType + ' - ' + (data.description ? data.description.toString() : '') + '</div>' +
      '		<div>Start Date : ' + (data.start ? moment(data.start).format(DATE_TIME_FORMAT) : '') + '</div>' +
      '		<div>End Date : ' + (data.end ? moment(data.end).format(DATE_TIME_FORMAT) : '') + '</div>' +
      '		<div>Vendor Company : ' + (data.vendorCompanyName ? data.vendorCompanyName.toString() : '') + '</div>' +
      '		<div>Created By : ' + (data.loginName ? data.loginName.toString() : '') + '</div>' +
      '		<div>Market : ' + (data.submarket ? data.submarket.toString() : '') + '</div>' +
      '		<div>Location   : ' + (data.switchName ? data.switchName.toString() : locationForSiteWO) + '</div>' +
      '		<div>Site       : ' + (data.siteName ? data.siteName.toString() : 'NA') + '</div>' +
      '		<div>Work Order #       : ' + (data.workId ? data.workId.toString() : '') + '</div>' +
      '		<div>Category   : ' + (data.category ? data.category.toString() : '') + '</div>' +
      '		<div>Event Status : ' + (data.status ? data.status.toString() : '') + '</div>' +
      '</div>' +
      '</div>';
    let requesterEmail = this.props.workOrderDetailInfo.get("requestor_email")
    let emailNotification = {
      body: bodyMessage,
      from: 'Vendor Portal',
      recipients: [this.props.user.get("email"), requesterEmail],
      sourceName: 'Vendor Portal',
      subject: 'Vendor Scheduling Notification - ' + data.workId,
      transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
    }
    this.props.ivrEmailNotify(this.props.loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } }).then(action => {
      if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
        this.props.notifref.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: action.response.data.ivrEmailNotification.message
        })
      }
    })
  }


  sendEmailNotification(data) {

    let userData = (this.props.userList && this.props.userList.toJS() && (this.props.userList.toJS().length > 0)) ? this.props.userList.toJS() : []
    let vendorServiceEmail = userData && userData.length > 0 ? userData[0].vendor_service_email : null;


    let completedMessage =
      '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
      '	<h1 style="background:#ff9800;color:#ffffff;padding:5px;margin:0px"> Vendor Status Notification </h1>' +
      '	<div style="padding:10px;color:#607d8b">' +
      '		<div>Work Order #       : ' + this.props.workOrderDetailInfo.get("workorder_id") + '</div>' +
      '		<div>Switch   : ' + this.props.workORderInfo.get("switch") + '</div>' +
      '		<div>Site       : ' + this.props.workOrderDetailInfo.get("site_name") + '</div>' +
      '		<div>Work Order Status : ' + this.props.workOrderDetailInfo.get('workorder_status') + '</div>' +
      '		<div>Quote Status : ' + this.props.workOrderDetailInfo.get('cfd_quote_status_1') + '</div>' +
      '		<div>Vendor Status       : ' + data + '</div>' +
      '		<div>Requested By : ' + this.props.workORderInfo.get("requested_by_name") + '</div>' +
      '		<div>Requested Date : ' + this.props.workOrderDetailInfo.get("requested_date") + '</div>' +
      '		<div>Priority : ' + this.props.workOrderDetailInfo.get("priority") + '</div>' +
      '		<div>Work Type: ' + this.props.workOrderDetailInfo.get("work_type") + '</div>' +
      '		<div>Work Scope   : ' + this.props.workOrderDetailInfo.get("work_scope") + '</div>' +
      ' <div style="color:#FF0000;font-weight:bold; padding-top:2vh"> '
      + ' (*** Please note: the work order is still pending. Please login vendor portal as a vendor admin to submit the invoice to complete the work order***)' +
      '</div>' +
      '</div>' +
      '</div>'

    let bodyMessage =
      '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
      '	<h1 style="background:#ff9800;color:#ffffff;padding:5px;margin:0px"> Vendor Status Notification </h1>' +
      '	<div style="padding:10px;color:#607d8b">' +
      '		<div>Work Order #       : ' + this.props.workOrderDetailInfo.get("workorder_id") + '</div>' +
      '		<div>Switch   : ' + this.props.workORderInfo.get("switch") + '</div>' +
      '		<div>Site       : ' + this.props.workOrderDetailInfo.get("site_name") + '</div>' +
      '		<div>Work Order Status : ' + this.props.workOrderDetailInfo.get('workorder_status') + '</div>' +
      '		<div>Quote Status : ' + this.props.workOrderDetailInfo.get('cfd_quote_status_1') + '</div>' +
      '		<div>Vendor Status       : ' + data + '</div>' +
      '		<div>Requested By : ' + this.props.workORderInfo.get("requested_by_name") + '</div>' +
      '		<div>Requested Date : ' + this.props.workOrderDetailInfo.get("requested_date") + '</div>' +
      '		<div>Priority : ' + this.props.workOrderDetailInfo.get("priority") + '</div>' +
      '		<div>Work Type: ' + this.props.workOrderDetailInfo.get("work_type") + '</div>' +
      '		<div>Work Scope   : ' + this.props.workOrderDetailInfo.get("work_scope") + '</div>' +
      '</div>' +
      '</div>'
    let requesterEmail = this.props.workOrderDetailInfo.get("requestor_email")
    let messageBody = data && data == 'Work Completed' && this.props.workOrderDetailInfo.get('workorder_status') != 'WORKCOMPLETE' ? completedMessage : bodyMessage
    let emailNotification = {
      body: messageBody,
      from: 'Vendor Portal',
      recipients: [requesterEmail, vendorServiceEmail],
      sourceName: 'Vendor Portal',
      subject: 'Vendor Status Update Notification - ' + this.props.workOrderDetailInfo.get("workorder_id"),
      transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
    }

    this.props.ivrEmailNotify(this.props.loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } }).then(action => {
      if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
        this.props.notifref.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: action.response.data.ivrEmailNotification.message + ' to ' + requesterEmail, vendorServiceEmail
        })
      }
    })
  }

  handleNext = (num) => {
    let wigetToOpen = 1
    if (typeof num === "number") {
      wigetToOpen = num
    }
    const { stepIndex } = this.state
    this.setState({
      stepIndex: stepIndex + wigetToOpen,
      finished: stepIndex >= 2,
    })
  };

  handlePrev = () => {
    const { stepIndex } = this.state
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 })
    }
  }

  toggleSwitchDetails() {
    this.setState({ isSwitchDetailShown: !this.state.isSwitchDetailShown })
  }
  toggleSiteDetails() {
    this.setState({ isSiteDetailShown: !this.state.isSiteDetailShown })
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
    let workOrderInfo = this.props.workOrderInfo.toJS()
    let currentEventObj = {}
    currentEventObj.category = 'Vendor Work Order'
    currentEventObj.status = 'UNSCHEDULED'
    currentEventObj.start = moment().set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0)
    currentEventObj.end = moment().set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0)
    currentEventObj.description = workOrderInfo.work_scope
    currentEventObj.workType = workOrderInfo.work_type
    currentEventObj.workId = workOrderInfo.workorder_id

    this.setState({ isCreateFormShown: !this.state.isCreateFormShown, loadFormCalendar: true, currentEventObj: currentEventObj })
    setTimeout(
      function () {
        this.setState({ loadFormCalendar: false })
      }
        .bind(this),
      200
    )
  }

  renderStatusLoading = () => {
    return (<
      Loader color="#cd040b"
      size="35px"
      margin="4px"
      className="text-center" />
    )
  }

  resetMessages = () => {
    this.props.resetProps([this.props.loginId, "workorderStatusUpdate"], { loading: false })
  }
  onAttachRemove = (index) => {
    this.aList = this.aList.remove(index)
    this.forceUpdate()
  }

  onChangeInput = (e, gennum, fuelnum) => {
    if (e && e.target && e.target.name) {
      if (e.target.name) {
        if (e.target.name == "totalruntime") {
          let name = "totalruntime_" + gennum
          this.validatefuelGallonsAndRuntime(e.target.value, "totalruntime")
          this.setValue(name, e.target.value)
        }
        if (e.target.name == "fuel_level") {
          let name = "fuel_level_" + gennum + "_" + fuelnum
          this.validateFuelLevel(e.target.value)
          this.setValue(name, e.target.value)
        }
        if (e.target.name == "fuel_gallonsadded") {
          let name = "fuel_gallonsadded_" + gennum + "_" + fuelnum
          this.validatefuelGallonsAndRuntime(e.target.value, "fuel_gallonsadded")
          this.setValue(name, e.target.value)
        }
      }
    }
  }

  validateFuelLevel(fuelgal) {
    function IsInRange(number) {
      return number > 0 && number <= 100
    }
    if (fuelgal && fuelgal.length > 0 && !(isNaN(fuelgal)) && IsInRange(fuelgal)) {
      this.setState({ isErrorMessageShown: false })
    } else if (fuelgal && fuelgal.length == 0) {
      this.setState({ isErrorMessageShown: false })
    } else {
      this.setState({ validationMessage: 'Please enter a Fuel Level Percentage between 0 and 100!', isErrorMessageShown: true })
    }
  }

  validatefuelGallonsAndRuntime(fuelgal, fieldname) {
    if (fuelgal && fuelgal.length > 0 && !(isNaN(fuelgal))) {
      this.setState({ isErrorMessageShown: false })
    } else if (fuelgal && fuelgal.length == 0) {
      this.setState({ isErrorMessageShown: false })
    } else {
      if (fieldname == "totalruntime") {
        this.setState({ validationMessage: 'Please enter a valid Run time!', isErrorMessageShown: true })
      }
      if (fieldname == "fuel_gallonsadded") {
        this.setState({ validationMessage: 'Please enter a valid Fuel value in gallons!', isErrorMessageShown: true })
      }
    }
  }

  formGenReadings = () => {
    let genInfo = {}
    let fuelInfo = []
    if (this.props.generatorInfo) {
      genInfo = this.props.generatorInfo.toJS()
    }
    if (this.props.genTankInfo) {
      fuelInfo = this.props.genTankInfo.toJS()
    }
    let genValues = this.props.currentValues
    let isGenReq = false
    let readings = []
    let readingsObj = {}
    let genTankReadingInput = {}
    let pm_unid = this.randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')

    if (genValues.get("work_type") && (genValues.get("work_type") == 'Generator' ||
      genValues.get("work_type") == 'ENGIE-FUEL')) {
      if (genInfo && genInfo.length > 0) {
        for (let i = 0; i < genInfo.length; i++) {
          let odoreading = "totalruntime_" + i
          let fuelLevel1 = "fuel_level_" + i + "_" + 0
          let fuelLevel2 = "fuel_level_" + i + "_" + 1
          let fuelLevel3 = "fuel_level_" + i + "_" + 2
          let fuelLevel4 = "fuel_level_" + i + "_" + 3
          let fuelgallonsadded1 = "fuel_gallonsadded_" + i + "_" + 0
          let fuelgallonsadded2 = "fuel_gallonsadded_" + i + "_" + 1
          let fuelgallonsadded3 = "fuel_gallonsadded_" + i + "_" + 2
          let fuelgallonsadded4 = "fuel_gallonsadded_" + i + "_" + 3
          if (genValues.get(odoreading) > 0 || genValues.get(fuelLevel1) > 0 || genValues.get(fuelLevel2) > 0 || genValues.get(fuelLevel3) > 0
            || genValues.get(fuelLevel4) > 0 || genValues.get(fuelgallonsadded1) > 0 || genValues.get(fuelgallonsadded2) > 0
            || genValues.get(fuelgallonsadded3) > 0 || genValues.get(fuelgallonsadded4) > 0) {
            isGenReq = true
            if (genValues.get(odoreading) != undefined) { readingsObj.totalruntime = genValues.get(odoreading) } else { readingsObj.totalruntime = "" }
            if (genValues.get(fuelLevel1) != undefined) { readingsObj.fuel_level1 = (genValues.get(fuelLevel1) / 100).toFixed(2) } else { readingsObj.fuel_level1 = "" }
            if (genValues.get(fuelgallonsadded1) != undefined) { readingsObj.fuel_gallonsadded1 = genValues.get(fuelgallonsadded1) } else { readingsObj.fuel_gallonsadded1 = "" }
            if (genValues.get(fuelLevel2) != undefined) { readingsObj.fuel_level2 = (genValues.get(fuelLevel2) / 100).toFixed(2) } else { readingsObj.fuel_level2 = "" }
            if (genValues.get(fuelgallonsadded2) != undefined) { readingsObj.fuel_gallonsadded2 = genValues.get(fuelgallonsadded2) } else { readingsObj.fuel_gallonsadded2 = "" }
            if (genValues.get(fuelLevel3) != undefined) { readingsObj.fuel_level3 = (genValues.get(fuelLevel3) / 100).toFixed(2) } else { readingsObj.fuel_level3 = "" }
            if (genValues.get(fuelgallonsadded3) != undefined) { readingsObj.fuel_gallonsadded3 = genValues.get(fuelgallonsadded3) } else { readingsObj.fuel_gallonsadded3 = "" }
            if (genValues.get(fuelLevel4) != undefined) { readingsObj.fuel_level4 = (genValues.get(fuelLevel4) / 100).toFixed(2) } else { readingsObj.fuel_level4 = "" }
            if (genValues.get(fuelgallonsadded4) != undefined) { readingsObj.fuel_gallonsadded4 = genValues.get(fuelgallonsadded4) } else { readingsObj.fuel_gallonsadded4 = "" }
          }
          if (fuelInfo && fuelInfo.length) {
            for (let j = 0; j < fuelInfo.length; j++) {
              if (genInfo[i].generator_id == fuelInfo[j].gen_emis_id) {
                readingsObj.gen_meta_universalid = fuelInfo[j].gen_meta_universalid
                readingsObj.gen_emis_id = fuelInfo[j].gen_emis_id
              }

            }
            readings.push(readingsObj)
          }


        }
        genTankReadingInput["source_sys"] = "iopvendorportal"
        genTankReadingInput["source_unid"] = pm_unid
        genTankReadingInput["readings"] = readings
      }
    }
    if (isGenReq) {
      this.props.submitGenReadingsRequest(pm_unid, genTankReadingInput).then((action) => {
        if (action.type === 'SUBMIT_GENTANKDETAILS_SUCCESS') {
        }
      })
    }

  }

  randomString(length, chars) {
    var result = ''
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
    return result
  }

  setValue(field, value) {
    this.props.setValue(formName, field, value)
  }

  renderGeneratorinfo = () => {
    let genInfo = this.props.generatorInfo.toJS()
    let genColumns = []
    let genTkInfo = this.props.genTankInfo.toJS()
    let fuelTanks = 0
    let { currentValues } = this.props
    if (genInfo && genInfo.length > 0) {
      genColumns.push(
        <tr>
          <td colSpan="7" className="align-middle" style={{ 'textAlign': 'center' }} >
            <h4>
              Generator Information
            </h4>
          </td>
        </tr>
      )
      for (let i = 0; i < genInfo.length; i++) {
        fuelTanks = 0
        genColumns.push(
          <tr colSpan="7">
            <td className="Form-group"><label className="Form-label">Mfr</label></td>
            <td className="Form-group"><label className="Form-label">Model</label></td>
            <td className="Form-group"><label className="Form-label">Serial</label></td>
            <td className="Form-group"><label className="Form-label">Installed</label></td>
            {genInfo[i].gen_in_service == 'No' ? <td className="Form-group"><label className="Form-label" style={{ color: 'red' }}>Not In Service</label></td> : null}
          </tr>
        )
        genColumns.push(
          <tr colSpan="7">
            <td className="Form-group">{genInfo[i].gen_spec.manufacturer}</td>
            <td className="Form-group">{genInfo[i].gen_spec.model}</td>
            <td className="Form-group">{genInfo[i].gen_serial_no}</td>
            <td className="Form-group">{genInfo[i].gen_install_date}</td>
          </tr>
        )
        genColumns.push(
          <tr>
            <td className="Form-group">
              <label className="Form-label">Generator RunTime(hrs)</label>
              <input
                placeholder={"hrs"}
                className="form-control"
                name={"totalruntime"}
                type="number"
                min="0"
                value={currentValues.get("totalruntime_" + i)}
                onChange={e => this.onChangeInput(e, i, 0)}
                style={{ "text-align": "right" }}
                disabled={!this.state.isWoPending}
              />
            </td>

            {genInfo[i].fuel_tanks && genInfo[i].fuel_tanks.length > 0 ? <td className="Form-group">
              <label className="Form-label">Current Fuel Level(1-100)%</label>
              <input
                placeholder={"%"}
                className="form-control"
                name={"current_fuel_level"}
                type="number"
                value={(this.props.workOrderDetailInfo.get("fuel_level") * 100).toFixed(2)}
                style={{ "text-align": "right" }}
                disabled="disabled"
              />
            </td> : null}

            <td className="Form-group">
              <label className="Form-label">Generator Type</label>
              <input
                value={genInfo[i].gen_type}
                className="form-control"
                name="gen_type"
                disabled="disabled"
              />
            </td>
            <td className="Form-group" colSpan="2">
              <label className="Form-label">Fuel Type</label>
              <input
                className="form-control"
                name="fuel_type"
                value={genInfo[i].gen_spec.fuel_type}
                style={{ "text-align": "left" }}
                disabled="disabled"
              />
            </td>
            {genInfo[i].fuel_tanks && genInfo[i].fuel_tanks.length > 0 ? <td className="Form-group" colSpan="2">
              <label className="Form-label">Tank Type</label>
              <input
                className="form-control"
                name="tank_type"
                value={genInfo[i].fuel_tanks[0] && genInfo[i].fuel_tanks[0].tank_type ? genInfo[i].fuel_tanks[0].tank_type : ''}
                style={{ "text-align": "left" }}
                disabled="disabled"
              />
            </td> : null}


          </tr>
        )
        let isTankAvailable = false;
        if (genTkInfo && genTkInfo.length > 0) {
          for (let j = 0; j < genTkInfo.length; j++) {
            if (genInfo[i].generator_id == genTkInfo[j].gen_emis_id) {
              isTankAvailable = true;
              if (genTkInfo[j].tank1_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
              if (genTkInfo[j].tank2_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
              if (genTkInfo[j].tank3_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
              if (genTkInfo[j].tank4_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
            }
          }
        }
        if (fuelTanks > 0) {
          for (let k = 0; k < fuelTanks; k++) {
            genColumns.push(
              <tr>

                <td className="Form-group">
                  <label className="Form-label">New Fuel Level(1-100)%</label>
                  <input
                    placeholder={"%"}
                    className="form-control"
                    name={"fuel_level"}
                    type="number"
                    min={"0"}
                    max={"100"}
                    value={currentValues.get("fuel_level_" + i + "_" + k)}
                    onChange={e => this.onChangeInput(e, i, k)}
                    style={{ "text-align": "right" }}
                    disabled={!this.state.isWoPending}
                  />
                </td>
                <td className="Form-group">
                  <label className="Form-label">Fuel Gallons Added(gallons)</label>
                  <input
                    placeholder={"gal"}
                    className="form-control"
                    name={"fuel_gallonsadded"}
                    type="number"
                    min="0"
                    value={currentValues.get("fuel_gallonsadded_" + i + "_" + k)}
                    onChange={e => this.onChangeInput(e, i, k)}
                    style={{ "text-align": "right" }}
                    disabled={!this.state.isWoPending}
                  />
                </td>
                <td className="Form-group">
                  <label className="Form-label">Tank Capacity(gallons)</label>
                  <input
                    placeholder={"gal"}
                    className="form-control"
                    name="tank_capacity"
                    value={genInfo[i].fuel_tanks[0] && genInfo[i].fuel_tanks[0].capacity ? genInfo[i].fuel_tanks[0].capacity : ''}
                    style={{ "text-align": "left" }}
                    disabled="disabled"
                  />
                </td>
                <td className="Form-group">
                  <label className="Form-label">Generator Fuel Updated By</label>
                  {genInfo[i].gen_updated_by}
                </td>
                <td className="Form-group" colSpan="2">
                  <label className="Form-label">Generator Fuel Updated Date</label>
                  {genInfo[i].gen_update_date}
                </td>

              </tr>
            )
          }
        } else {
          genColumns.push(
            <tr>
              <td className="Form-group">
                <label className="Form-label" style={{ color: 'red' }}>
                  {!isTankAvailable ? 'No tank associated with the generator ' : 'No tank size available'}
                </label>
              </td>
            </tr>)
        }

      }
    }

    return genColumns
  }



  renderHvacinfo = () => {
    let hvacIfo = this.props.hvacInfo.toJS()
    let hvacColumns = []
    if (hvacIfo && hvacIfo.length > 0) {
      hvacColumns.push(
        <tr>
          <td colSpan="6" className="align-middle" style={{ 'textAlign': 'center' }} >
            <h4>
              HVAC Information
            </h4>
          </td>
        </tr>
      )
      hvacColumns.push(
        <tr colSpan="3">
          <td className="Form-group"><label className="Form-label">Model</label></td>
          <td className="Form-group"><label className="Form-label">SN</label></td>
          <td className="Form-group"><label className="Form-label">UnitID</label></td>
          <td className="Form-group"><label className="Form-label">UnitSize(tons)</label></td>
          <td className="Form-group"><label className="Form-label">Refrigerent</label></td>
          <td className="Form-group"><label className="Form-label">MFR Date</label></td>
        </tr>
      )
      for (let i = 0; i < hvacIfo.length; i++) {
        hvacColumns.push(
          <tr colSpan="3">
            <td className="Form-group" style={{ "width": "1px", "white-space": "nowrap" }}>{hvacIfo[i].model}</td>
            <td className="Form-group" style={{ "width": "1px", "white-space": "nowrap" }}>{hvacIfo[i].serial_no}</td>
            <td className="Form-group">{hvacIfo[i].hvac_unit_id}</td>
            <td className="Form-group">{hvacIfo[i].unit_size}</td>
            <td className="Form-group">{hvacIfo[i].refrigerant}</td>
            <td className="Form-group">{hvacIfo[i].manufacture_date}</td>
          </tr>
        )
      }
    }
    return hvacColumns
  }

  isGenReadingAvbl() {
    let genInfo = {}
    let fuelInfo = []
    if (this.props.generatorInfo) {
      genInfo = this.props.generatorInfo.toJS()
    }
    if (this.props.genTankInfo) {
      fuelInfo = this.props.genTankInfo.toJS()
    }
    let genvalues = this.props.currentValues
    let fuelTanks = 0
    let fuelLevel = 0
    let fuelGallons = 0
    let isGenReadings = false
    if (fuelInfo && fuelInfo.length > 0) {
      for (let m = 0; m < genInfo.length; m++) {
        for (let j = 0; j < fuelInfo.length; j++) {
          if (genInfo[m].generator_id == fuelInfo[j].gen_emis_id) {
            if (fuelInfo[j].tank1_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
            if (fuelInfo[j].tank2_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
            if (fuelInfo[j].tank3_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
            if (fuelInfo[j].tank4_size != "Not Installed") { fuelTanks = fuelTanks + 1 }
          }
        }
      }
    }
    if (genInfo && genInfo.length > 0) {
      for (let i = 0; i < genInfo.length; i++) {
        for (let k = 0; k < fuelTanks; k++) {
          let fuel_level = "fuel_level_" + i + "_" + k
          let fuel_gallonsadded = "fuel_gallonsadded_" + i + "_" + k
          if (genvalues.get(fuel_level) && genvalues.get(fuel_level) > 0) {
            fuelLevel = fuelLevel + 1
          } else if (genvalues.get(fuel_gallonsadded) && genvalues.get(fuel_gallonsadded) > 0) {
            fuelGallons = fuelGallons + 1
          }
        }

      }
    }
    if (fuelLevel > 0 || fuelGallons > 0) {
      isGenReadings = true
    } else {
      isGenReadings = false
    }
    return isGenReadings
  }

  renderCalloutzone = () => {
    let workOrderInfo = this.props.workORderInfo
    let callZoneInfo = {}
    if (workOrderInfo.get("site_type") == 'SITE') { callZoneInfo = this.props.site.toJS() } else if (workOrderInfo.get("site_type") == 'SWITCH') { callZoneInfo = this.props.switchInfo.toJS() }
    let callZoneColumns = []
    let callOutZones = callZoneInfo.callout_zones
    if (callOutZones && callOutZones.length > 0) {
      callZoneColumns.push(
        <tr colSpan={workOrderInfo.get("site_type") == 'SWITCH' ? "6" : "4"} >
          <td className="Form-group" colSpan={workOrderInfo.get("site_type") == 'SWITCH' ? "3" : "1"}><label className="Form-label">Zone Period</label></td>
          <td className="Form-group" colSpan={workOrderInfo.get("site_type") == 'SWITCH' ? "3" : "1"}><label className="Form-label">Phone#</label></td>
          {workOrderInfo.get("site_type") == 'SITE' ? <td className="Form-group" colSpan="5" rowSpan={callOutZones.length + 1}><label className="Form-label">Tower Managed By:</label>{callZoneInfo.tower_managed_by}</td> : null}
        </tr>
      )
      for (let i = 0; i < callOutZones.length; i++) {
        callZoneColumns.push(
          <tr colSpan={workOrderInfo.get("site_type") == 'SWITCH' ? "6" : "4"}>
            <td className="Form-group" colSpan={workOrderInfo.get("site_type") == 'SWITCH' ? "3" : "1"}>{callOutZones[i].period}</td>
            <td className="Form-group" colSpan={workOrderInfo.get("site_type") == 'SWITCH' ? "3" : "1"}>{callOutZones[i].phone_no}</td>
          </tr>
        )
      }
    }
    return callZoneColumns
  }
  renderDeviceInformation = () => {
    let deviceInfo = this.state.deviceInfo;
    return(
      <>
     {deviceInfo ? <tr >
          <th>Type</th>
          <th>TID</th>
          <th>Name</th>
          <th>Model</th>
          <th>Vendor</th>
          <th>Status</th> 
          <th>CreatedBySys</th>
      </tr>: <tr><td colSpan='7' style={{textAlign:'center'}}>No Device Data Found</td></tr>}
     { deviceInfo && deviceInfo.length>0 && deviceInfo.map(device => (
       <tr>
          <td>{device.type}</td>
          <td>{device.tid}</td>
          <td>{device.name}</td>
          <td>{device.model}</td>
          <td>{device.vendor}</td>
          <td>{device.status}</td> 
          <td>{device.createdBySys}</td>
       </tr>
        ))}
      </>
    )
  }

  renderSwitchDetails = () => {
    let { switchInfo } = this.props
    let switchDetails = []
    switchDetails.push(
      <tr colSpan="6">
        <td className="Form-group"><label>Address:</label></td>
        <td className="Form-group"><label>County:</label></td>
        <td className="Form-group"><label>Lat/Long:</label></td>
        <td className="Form-group"><label>Area:</label></td>
        <td className="Form-group"><label>Market:</label></td>
        <td className="Form-group"><label>Phone:</label></td>
      </tr>
    )
    switchDetails.push(
      <tr colSpan="6">
        <td className="Form-group"><a href={`http://maps.google.com/?q=${switchInfo.get('address')},${switchInfo.get('city')}, ${switchInfo.get('state')}, ${switchInfo.get('zip')}`} target="_blank">
          {switchInfo.get('address')},{switchInfo.get('city')}, {switchInfo.get('state')} {switchInfo.get('zip')}</a>
        </td>
        <td className="Form-group">{switchInfo.get('county')}</td>
        <td className="Form-group"> <a href={`http://google.com/maps/place/${switchInfo.get('latitude')},${switchInfo.get('longitude')}`} target="_blank">
          {switchInfo.get('latitude')}, {switchInfo.get('longitude')}
        </a>
        </td>
        <td className="Form-group">{switchInfo.get('area')}</td>
        <td className="Form-group">{switchInfo.get('region')}</td>
        <td className="Form-group">{switchInfo.get('phone')}</td>
      </tr >)
    return switchDetails
  }

  validInputDateTime(current) {
    return current.isSameOrAfter(Datetime.moment(this.state.startDate), 'day')
  }

  onEventDateChange(isFromdate, milisecs) {
    if (typeof milisecs === 'object') {
      var isoRepresentation = new Date(milisecs).toISOString()

      var momentDate = moment(isoRepresentation)
      if (isFromdate) {
        this.setState({ startDate: momentDate.format(DATE_TIME_FORMAT), ISOstart: isoRepresentation })
        if (this.state.endDate) {
          var diff = moment(this.state.endDate, 'MM-DD-YYYY hh:mm a').diff(momentDate)
          if (diff < 0) {
            this.setState({ startDateValErr: 'Dates Overlapping' })
          } else {
            this.setState({ startDateValErr: null, endDateValErr: null })
          }
        }
      } else {
        if (this.state.startDate) {
          this.setState({ endDate: momentDate.format(DATE_TIME_FORMAT), ISOend: isoRepresentation })
          diff = moment(momentDate).diff(this.state.startDate, 'MM-DD-YYYY hh:mm a')
          if (diff < 0) {
            this.setState({ endDateValErr: 'Dates Overlapping' })
          } else {
            this.setState({ endDateValErr: null, startDateValErr: null })
          }
        }
      }
    }
  }

  checkIfScheduledTimePassed = (vendorStatus) => {
    if (vendorStatus !== 'Scheduled' && vendorStatus !== 'Rescheduled') {
      return false;
    }
    const scheduledEvent = this.props.currentWorkOrderOEvent;
    if (scheduledEvent?.end) {
      const scheduledEndTime = moment(scheduledEvent.end);
      const currentTime = moment();
      return currentTime.isAfter(scheduledEndTime);
    }
    
    return false;
  }

  renderVendorStatusEdit = () => {
    let { isWoPending, selectedTitle } = this.state
    let isAcknowledgementPending = false;
   
    let { workOrderDetailInfo, bannerName, isWoloading } = this.props

    if((bannerName == "DA Acknowledge Pending" && isWoloading) || workOrderDetailInfo?.get('vendor_status') == "Acknowledge Pending")
    isAcknowledgementPending = true;

    let tooltipStyle = {
      style: {
        zIndex: 1050
      },
      arrowStyle: {
        zIndex: 1050
      }
    }
    let isAlreadyScheduled = true
    if (this.props && this.props.workOrderDetailInfo && this.props.workOrderDetailInfo.get("workorder_id")) {
      isAlreadyScheduled = this.state.eventWorkIds.indexOf(this.props.workOrderDetailInfo.get("workorder_id")) > -1
    }
    const isStatusDisabled = this.state.vendor_status_wo.toLowerCase() == 'pending vendor invoice' || this.state.vendor_status_wo.toLowerCase() == 'work completed';
    return (

      <tr>
        <td colSpan="3" className="Form-group" id="vendorStatusFeild" style={{ width: '10vw' }} data-tip data-for="vendorStatusFeild">
          <label className="Form-label">Vendor Status</label>
          {this.props.saveVenderStatusLoading ? this.renderStatusLoading() : (<div>
            {this.props.saveStatusError && this.props.saveStatusError.get("message") && (<MessageBox messages={List([this.props.saveStatusError.get("message")])} onClear={this.resetMessages} />)}
            {isWoPending ?
              <Select
              value={{ value: this.state.vendor_status || "", label: this.state.vendor_status || "Select status" }}
                onChange={this.handleChangeStatus}
                options={(() => {
                  const workType = workOrderDetailInfo?.get("work_type")?.toLowerCase();
                  const vendorStatus = workOrderDetailInfo.get("vendor_status");
                  
                  // Handle AP Radio and MDU work types
                  if (workType === 'ap radio' || workType === 'mdu') {
                    const hasScheduledTimePassed = this.checkIfScheduledTimePassed(vendorStatus);
                    if (isAcknowledgementPending) {
                      return utils.APRADIO_MDU_ACKNOWLEDGEMENT_PENDING_OPTIONS;
                    }
                    if (vendorStatus === 'Accepted') {
                      return utils.APRADIO_MDU_ACCEPTED_OPTIONS;
                    }
                    if ((vendorStatus === 'Scheduled' || vendorStatus === 'Rescheduled') && hasScheduledTimePassed) {
                      return [{ value: vendorStatus, label: vendorStatus }];
                    }
                    if (vendorStatus === 'Scheduled') {
                      return utils.APRADIO_MDU_SCHEDULED_OPTIONS;
                    }
                    if (vendorStatus === 'Rescheduled') {
                      return utils.APRADIO_MDU_RESCHEDULED_OPTIONS;
                    }
                    if(vendorStatus == 'Unscheduled') {
                      return utils.APRADIO_MDU_UNSCHEDULED_OPTIONS;
                    }
                    if (vendorStatus === 'OnSite Now') {
                      return utils.APRADIO_MDU_ONSITE_OPTIONS;
                    }
                    if(vendorStatus === 'Service Restored') {
                      return utils.APRADIO_MDU_REPAIR_RESTORED_OPTIONS;
                    }
                  }
                  if (isAcknowledgementPending) {
                    return utils.ACKNOWLEDGEMENTPENDINGOPTIONS;
                  }
                  if (vendorStatus === 'Acknowledged' || isAlreadyScheduled === false) {
                    return utils.UNSCHEDULEDACKNOWLEDGESTATUSOPTIONS;
                  }
                  if (vendorStatus === '' || isAlreadyScheduled === false) {
                    return utils.UNSCHEDULEDVENDORSTATUSOPTIONS;
                  }
                  if (vendorStatus === 'Scheduled') {
                    return utils.SCHEDULEDVENDORSTATUSOPTIONS;
                  }
                  if (vendorStatus === 'Awaiting Parts' && isAlreadyScheduled === true) {
                    return utils.RESCHEDULEDVENDORSTATUSOPTIONS;
                  }
                  if (vendorStatus === 'In Progress') {
                    return utils.INPROGRESSVENDORSTATUSOPTIONS;
                  }
                  if (vendorStatus === 'Rejected') {
                    return utils.REJECTEDVENDORSTATUSOPTIONS;
                  }
                  if (vendorStatus === 'Rescheduled') {
                    return utils.RESCHEDULEDVENDORSTATUSOPTIONS;
                  }
                  if (vendorStatus === 'Pending Vendor Invoice') {
                    return utils.PENDINGINVOICESTATUSOPTIONS;
                  }
                  if (vendorStatus === 'Work Completed') {
                    return utils.COMPLETEDVENDORSTATUSOPTIONS;
                  }
                  return utils.UNSCHEDULEDVENDORSTATUSOPTIONS;
                })()}
                isDisabled={isStatusDisabled}
                isClearable={false}
                style={{
                  "width": "75%",
                  "float": "left"
                }}
              /> :
              <Select
                value={{value: this.state.vendor_status, label: this.state.vendor_status}}
                onChange={this.handleChangeStatus}
                options={isAcknowledgementPending ? utils.ACKNOWLEDGEMENTPENDINGOPTIONS : utils.VENDORSTATUSOPTIONS}
                isDisabled={isStatusDisabled}
                isClearable={false}
                style={{
                  "width": "75%",
                  "float": "left"
                }}
              />}
            {(this.props.workOrderDetailInfo.get("vendor_status") != this.state.vendor_status)
              && (this.state.vendor_status == 'Scheduled' || this.state.vendor_status == 'Rescheduled')
              && this.state.isWodEditable ?
              <h5 style={{ float: 'left', color: '#ED7000', marginTop: 15 }}>
                Please select the start and end times =
              </h5> : null}
            {this.props.saveStatusError && this.props.saveStatusError.get("message") && (<MessageBox messages={List([this.props.saveStatusError.get("message")])} onClear={this.resetMessages} />)}
            {this.props.savedStatusMessage && this.props.savedStatusMessage.get("message") && (<span className="batch savedMessage">
              Saved Successfully
            </span>)}
          </div>)}
        </td>


        {(this.props.workOrderDetailInfo.get("vendor_status") != this.state.vendor_status) && (this.state.vendor_status == 'Scheduled' || this.state.vendor_status == 'Rescheduled') && this.state.isWodEditable ?
          <td colSpan="3" className="Form-group" >
            {this.props.saveVenderStatusLoading ? this.renderStatusLoading() : (<div>

              {(this.props.workOrderDetailInfo.get("vendor_status") != this.state.vendor_status) && this.state.isWodEditable ?
                <span style={{ marginTop: 30 }}>
                  <div className="col-md-9" style={{ paddingLeft: 0 }}>
                    {this.state.startDate ? this.state.startDateValErr ? <span><h6 style={{ color: 'red' }}>{this.state.startDateValErr}</h6></span> : <label style={{ "marginTop": "8px", "marginBottom": "8px", "color": "black", "fontSize": "1em", "float": "left" }}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Start Date/Time</h5></label>
                      : this.state.errorText ? <span><h6 style={{ color: 'red' }}>{this.state.errorText}</h6></span> : <label style={{ "marginTop": "8px", "marginBottom": "8px", "color": "black", "fontSize": "1em", "float": "left" }}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Start Date/Time</h5></label>}
                    <Datetime timeFormat dateFormat="MM-DD-YYYY" value={this.state.startDate || ''} closeOnSelect onChange={value => this.onEventDateChange(true, value)} />
                  </div>
                  <div className="col-md-9" style={{ paddingLeft: 0 }}>
                    {this.state.endDate ? this.state.endDateValErr ? <span><h6 style={{ color: 'red' }}>{this.state.endDateValErr}</h6></span> : <label style={{ "marginTop": "8px", "marginBottom": "8px", "color": "black", "fontSize": "1em", "float": "left" }}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>End Date/Time</h5></label>
                      : this.state.errorText ? <span><h6 style={{ color: 'red' }}>{this.state.errorText}</h6></span> : <label style={{ "marginTop": "8px", "marginBottom": "8px", "color": "black", "fontSize": "1em", "float": "left" }}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>End Date/Time</h5></label>}
                    <Datetime isValidDate={this.validInputDateTime.bind(this)} timeFormat dateFormat="MM-DD-YYYY" value={this.state.endDate || ''} closeOnSelect onChange={value => this.onEventDateChange(false, value)} />
                  </div>
                </span>
                : null}
            </div>)}
          </td> : null}

        {workOrderDetailInfo.get("vendor_status") == 'Work Completed' ? <ReactTooltip id ="vendorStatusFeild" place="top" effect="float">
          <div>
            <p>Saving Vendor status as Work Completed doesn't set Work Order as Completed. Please click on <b>Mark as Completed</b> button below(if available) to complete</p>
          </div>
        </ReactTooltip>: null}
        <td className="Form-group"><label className="Form-label">Vendor Status Updated By</label>{this.props.workOrderDetailInfo.get("vendor_status_by")}</td>
        <td className="Form-group"><label className="Form-label">Vendor Status Updated Date</label>{utcToLocal(formatDate(this.props.workOrderDetailInfo.get("vendor_status_date")))}</td>
      </tr>)
  }
  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="35px"
      margin="4px"
      className="text-center" />
    )
  }

  setIsElogEmpty = (isEmpty) => this.setState({ workPendingElog: { isEmpty } })
  refreshCalender = (stDate, endDate) => {
    this.props.getConflictkirkeEventsForSite(this.props.loginId, stDate, moment(endDate).add(2, 'months').endOf('month').format('YYYY-MM-DD'), this.props.workORderInfo.get("site_unid"))
    this.props.getCalenderEventsForSite(this.props.loginId, stDate, moment(endDate).add(2, 'months').endOf('month').format('YYYY-MM-DD'), this.props.workORderInfo.get("site_unid"))
  }
  
  render() {
    let { selectedTitle, cbandSelected, samsung5gnodes, prbHeatMapSelected } = this.state;
    let { esaFlag, siteDetailInfo } = this.props
    let isAcknowledgementPending = false;
    let allcurrentWorkOrderOEventStatus  = this.props.allcurrentWorkOrderOEvent && this.props.allcurrentWorkOrderOEvent.status;
    let allcurrentWorkOrderOEvent = this.props.allcurrentWorkOrderOEvent
    let currentWorkOrderOEventStatus = this.props.currentWorkOrderOEvent && this.props.currentWorkOrderOEvent.status
    let currentWorkOrderOEvent = this.props.currentWorkOrderOEvent && this.props.currentWorkOrderOEvent
    let { eventsError, workORderInfo, isAcceptedWork, getQuotes, isCompleted, isQuoteReceived, isWorkInProgress, elogs, notifref,
      onDirtyChange, elogLoading, userRole, loginId, bannerName, handleHideModal, title, isWoloading, workOrderDetailInfo, site, siteDetaisLoading, switchDetailsLoading, switchInfo } = this.props
      if (eventsError && !this.eventError) {
      this.eventError = true
      // this.props.notifref.addNotification({
      //   title: 'Error',
      //   position: "br",
      //   level: 'error',
      //   message: 'Error occured while fetching work order events'
      // })
    }
    if((bannerName == "DA Acknowledge Pending" && isWoloading) || workOrderDetailInfo?.get('vendor_status') == "Acknowledge Pending"){
      isAcknowledgementPending = true;
    }
    let FORM_HEADER = 'Quote Information'
    if (workORderInfo) {
      if (workORderInfo.get("quote_statuses") === utils.QUOTEPENDING) {
        FORM_HEADER = "Submit Quote"
      }
      if (workORderInfo.get("quote_statuses") === utils.QUOTEAPPROVED || (workORderInfo.get("workorder_status") === utils.WORKPENDING && (workORderInfo.get("quote_statuses") === utils.COMPLETED || workORderInfo.get("quote_statuses") === utils.AWAITING_PO))) {
        FORM_HEADER = "Submit Invoice"
      }
      if ((workORderInfo.get("quote_statuses") === utils.COMPLETED || workORderInfo.get("quote_statuses") === utils.AWAITING_PO) && workORderInfo.get("workorder_status") != utils.WORKPENDING) {
        FORM_HEADER = "Invoice"
      }
      if ((workORderInfo.get("priority") !== "DIRECT AWARD" && workORderInfo.get("quote_statuses") === utils.AWAITING_PO &&  workORderInfo.get("workorder_status") === utils.PO_REQUEST) && workORderInfo.get("workorder_status") != utils.WORKPENDING) {
        FORM_HEADER = "Quote Information"
      }
    }

   
    let WOInfo = workORderInfo.toJS()
    let Unid = WOInfo ? WOInfo.site_unid : ""
     const urgencyKey = WOInfo.work_urgency ? WOInfo.work_urgency.toLowerCase() : '';
    const urgencyColor = urgencyKey === 'high' ? 'red' : urgencyKey === 'medium' ? '#e67e22' : urgencyKey === 'low' ? '#2e7d32' : undefined
    let typeWO = WOInfo ? WOInfo.site_type == "SITE" ? "SITE" : "SWITCH" : ""
    let siteSwitchInfo = WOInfo ? WOInfo.site_type == "SITE" ? site.toJS() : switchInfo.toJS() : {}
    const { stepIndex, isSiteDetailShown, isCreateFormShown, isGeneratorInfo, isHvacInfo, isWRFShown, isWRFEditable, isWodEditable,
      isWoPending, isErrorMessageShown, validationMessage, isSwitchDetailShown, isRmaWO } = this.state
    let isAlreadyScheduled = true
    let workOrderType = this.props.workOrderDetailInfo.get('work_type')
    if (this.props && this.props.workOrderDetailInfo && this.props.workOrderDetailInfo.get("workorder_id")) {
      isAlreadyScheduled = this.state.eventWorkIds.indexOf(this.props.workOrderDetailInfo.get("workorder_id")) > -1
    }
    let calendarTitle = WOInfo ? WOInfo.site_type == 'SITE' ? <div>Calendar for Site: <span style={{fontSize:'15px', fontWeight:'bold', position:'relative', top:'1px'}}>{WOInfo.site_name} {site?.get("osw_freeze") === true ? (<FaSnowflake style={{marginLeft: 5, color : '#00bcd4'}} title = "Scheduled Freeze"/>) : null} </span> </div>: "Calendar for Switch: " + WOInfo.switch : "Calendar: "
    let { fastHistorySelected } = this.state
    let rmaDataForWO = this.props.rma_data?.toJS()?.filter(rma => rma.VWRS_ID == String(workORderInfo.get("workorder_id"))) || []
    if (this.props.vendorCalenderViewModel ) {
      return <div>
        <VendorScheduleCalender
          selectedWR={workORderInfo.toJS()}
          notifref={notifref}
          workORderInfo={workORderInfo}
          workOrderDetailInfo={workOrderDetailInfo}
          siteSwitchInfo={siteSwitchInfo}
          currentEventObj={this.props.allcurrentWorkOrderOEvent}
          deviceInfo={this.state.deviceInfo}
          typeWO={typeWO}
          onloadevents={this.state.filteredEvents}
          currentWorkOrderOEventStatus={allcurrentWorkOrderOEventStatus}
          refreshCalender={this.refreshCalender}
          setInitialValues={this.props.setInitialValues}
          setValue={this.props.setValue}
          workorderId={this.props.workorderId}
          createNewSchedule={this.createNewSchedule.bind(this)}
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
    } else {
    return (
      <div>
        {this.state.isInfoMessageShown && (<MessageBox messages={List(["Completed Successfully"])} onClear={this.resetInfo.bind(this)} className="alert-success" />)}
        <div className="row">
          {isWoPending && !isAcknowledgementPending && 
            <div style={{ margin: 'auto', width: '100%' }}>
              <Accordion
                style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  {calendarTitle}
                </AccordionSummary>
                <AccordionDetails>
                  {console.log('rendering calendar',WOInfo.work_due_date)}
                  <div style={{ width: "100%" }}>
                    <span style={{ marginRight: "20px" }}>Current Work Order ID {WOInfo.workorder_id}</span>
                    {WOInfo.work_due_date && (
                      <span>The work order due date is
                        <strong style={(() => {
                          const due = moment(WOInfo.work_due_date)
                          if (due.isBefore(moment())) return { color: 'red' }
                          return urgencyColor ? { color: urgencyColor } : {}
                        })()}
                          data-tip
                          data-for="dueDateTooltip"
                        >
                          {' '}{moment(WOInfo.work_due_date).format('MMMM DD, YYYY hh:mm:ss A')}
                        </strong>
                
                      </span>
                      
                    )}
                    {WOInfo.work_urgency && (
    <span style={{ marginLeft: "20px" }}>
      Work Urgency: 
      <strong style={{ 
        marginLeft: "5px"
      }}>
        {WOInfo.work_urgency.toUpperCase()}
      </strong>
    </span>
  )}
                    {isAlreadyScheduled == false ?
                      <Button
                        variant="contained"
                        onClick={((allcurrentWorkOrderOEventStatus == "SCHEDULED" || allcurrentWorkOrderOEventStatus == "RESCHEDULED") && (moment(allcurrentWorkOrderOEvent.end).isAfter(moment().format('DD-MMM-YY')))) ? this.ReScheduleEvent.bind(this, allcurrentWorkOrderOEvent) :this.createNewSchedule.bind(this)}
                        style={{ marginLeft: '5px', color: "#FFFFFF", marginTop: '-15px', border: 'none', background: "black", float: "right" }}
                        endIcon={this.state.isCreateFormShown ? <BackIcon></BackIcon> : <AddIcon></AddIcon>}>
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
                          notifref={notifref}
                          workORderInfo={workORderInfo}
                          workOrderDetailInfo={workOrderDetailInfo}
                          siteSwitchInfo={siteSwitchInfo}
                          currentEventObj={currentWorkOrderOEvent}
                          deviceInfo={this.state.deviceInfo}
                          typeWO={typeWO}
                          setInitialValues={this.props.setInitialValues}
                          refreshCalender={this.refreshCalender}
                          setValue={this.props.setValue}
                          selectedWR={workORderInfo.toJS()}
                          onloadevents={this.state.filteredEvents}
                          createNewSchedule={this.createNewSchedule.bind(this)}
                          />
                      </div>}
                    {!this.state.isCreateFormShown ?
                      <div><VSMinimalCalendar
                        onloadevents={this.state.filteredEvents}
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
              <br />
            </div>
          }

          {workORderInfo.get("site_type") == 'SITE' && workORderInfo.get("workorder_status") != "PENDINGAPPROVAL" && !isAcknowledgementPending ?
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
                      <SiteInformation notifref={this.props.notifref} isWorkInProgress={isWorkInProgress} getQuotes={getQuotes} workORderInfo={workORderInfo} renderCalloutzone={this.renderCalloutzone} renderDeviceInformation={this.renderDeviceInformation} deviceInfo = {this.state.deviceInfo}/>
                      {isSwitchDetailShown && (<SwitchDetails workORderInfo={workORderInfo} switchInfo={switchInfo} />)}
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              <br />
            </div> : null}
            { !isAcknowledgementPending && this.props.issueData && this.props.issueData.toJS().length>0 && workORderInfo.get("site_type") == 'SITE' && workORderInfo.get("workorder_status") != "PENDINGAPPROVAL" ?
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
                                        <SQIInformation loginId={loginId} unid={this.props.vendorWorkOrderSelectedRowObj.site_unid} workinfo={this.props.vendorWorkOrderSelectedRowObj} notifref={this.props.notifref} />
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                        <br />
                    </div>:null}

          {!isAcknowledgementPending ? (
            <div style={{ margin: 'auto', width: '100%' }}>
              <Accordion
                style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                TransitionProps={{ unmountOnExit: true }}>
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
                      <AnteenaInformation loginId={this.props.loginId} unid={this.props.vendorWorkOrderSelectedRowObj?.site_unid} vendorWorkOrderSelectedRowObj={this.props.vendorWorkOrderSelectedRowObj} capitalProject={true} isProject={true} />
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              <br />
            </div>
          ) : null}

          {workORderInfo.get("work_type")?.toLowerCase() == 'mdu' ? null : workORderInfo.get("site_type") == 'SITE' && workORderInfo.get("workorder_status") != "PENDINGAPPROVAL" && !isAcknowledgementPending && !this.props.isVendorDeactivated?
            <div style={{ margin: 'auto', width: '100%' }}>
              {this.props.isSiteAccessExpandable ?
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
                        <SiteDetails
                          notifref={this.props.notifref}
                          isWorkInProgress={isWorkInProgress}
                          getQuotes={getQuotes}
                          workORderInfo={workORderInfo}
                          getLockUnlockReq={this.getLockUnlockReq}
                          appNotification={this.props.appNotification}
                          vendorWorkOrderSelectedRowObj={this.props.vendorWorkOrderSelectedRowObj}
                          fromRecentActivity={this.props.fromRecentActivity}
                          selectedRecentActivity={this.props.selectedRecentActivity}
                        />
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion> : <div>
                  {this.state.refreshNotes ?
                    <Accordion
                      style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                      TransitionProps={{ unmountOnExit: true }}>
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
                            <SiteDetails
                              notifref={this.props.notifref}
                              isWorkInProgress={isWorkInProgress}
                              getQuotes={getQuotes}
                              workORderInfo={workORderInfo}
                              getLockUnlockReq={this.getLockUnlockReq}
                              appNotification={this.props.appNotification}
                              vendorWorkOrderSelectedRowObj={this.props.vendorWorkOrderSelectedRowObj}
                            />
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion> :
                    <Accordion
                      style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                      TransitionProps={{ unmountOnExit: true }}>
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
                            <SiteDetails
                              notifref={this.props.notifref}
                              isWorkInProgress={isWorkInProgress}
                              getQuotes={getQuotes}
                              workORderInfo={workORderInfo}
                              getLockUnlockReq={this.getLockUnlockReq}
                            />
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>}
                </div>
              }
              <br />
            </div> : null}
          {workORderInfo.get("work_type")?.toLowerCase() == 'mdu' ? null : isWoPending && workORderInfo.get("site_type") == 'SITE' && !isAcknowledgementPending ?
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
                  {console.log("rendering healthcheck",workORderInfo.toJS())}
                  <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                    <div className="col-lg-12" style={{ float: 'left' }}>
                      {this.getHealthcheckFastTabs()}
                      {cbandSelected ? <CbandTools selectedRow={workORderInfo?.toJS()} isWO={true} samsung5gnodes={samsung5gnodes}/> : fastHistorySelected ? <FastHistory selectedWO={this.props} workORderInfo={workORderInfo}/> : prbHeatMapSelected ? <PrbAnalyzer siteUnid={workORderInfo?.get('site_unid')} mode="in-place" /> : 
                    
                      <HealthCheck workORderInfo={workORderInfo} notifref={this.props.notifref} selectedWO={this.props} hcFromStandAloneToolsTab={true} />}
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              <br />

            </div>
            : null}
          {isRmaWO && workORderInfo.get("site_type") == 'SITE' && !isAcknowledgementPending ?
            <div style={{ margin: 'auto', width: '100%' }}>
              <Accordion
                style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                defaultExpanded={this.props.defaultRmaOpen}
                TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  RMA
                </AccordionSummary>
                <AccordionDetails>
                  <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                    <div className="col-lg-12" style={{ float: 'left' }}>
                      <RMAComponent rmaDataForWO={rmaDataForWO} />
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              <br />

            </div>
            : null}
          <div className={isSiteDetailShown || isSwitchDetailShown || isCreateFormShown ? "col-sm col-6" : "col-md-12"} style={isSiteDetailShown || isSwitchDetailShown || isCreateFormShown ? { float: 'left' } : { float: 'left' }}>
            <WorkInProgressWorkOrders
            siteArea={this.state.siteArea}
            siteRegion={this.state.siteRegion}
            quoteVendorId={this.state.quoteVendorId}
            quoteVendorName={this.state.quoteVendorName}
              renderVendorStatusEdit={this.renderVendorStatusEdit}
              startDate ={this.state.startDate}
              endDate = {this.state.endDate}
              startDateValErr={this.state.startDateValErr}
              endDateValErr={this.state.endDateValErr}
              vendor_status={this.state.vendor_status}
              bannerName={bannerName}
              isAcknowledgementPending={isAcknowledgementPending}
              hasScheduledTimePassed={this.checkIfScheduledTimePassed(workOrderDetailInfo.get("vendor_status"))}
              renderCalloutzone={this.renderCalloutzone}
              deviceInfo = {this.state.deviceInfo}
              renderDeviceInformation={this.renderDeviceInformation}
              renderSwitchDetails={this.renderSwitchDetails}
              renderGeneratorinfo={this.renderGeneratorinfo}
              formGenReadings={this.formGenReadings}
              resetInfo={this.resetInfo}
              isGenReadingAvbl={this.isGenReadingAvbl}
              isLoading={this.props.isLoading}
              savedMessage={this.props.savedMessage}
              renderHvacinfo={this.renderHvacinfo}
              handleChangeStatus={this.handleChangeStatus}
              loginId={loginId}
              isCompleted={isCompleted}
              isQuoteReceived={isQuoteReceived}
              quote_statuse={workORderInfo.get("quote_statuses")}
              stepIndex={stepIndex}
              isSiteDetailShown={isSiteDetailShown}
              isSwitchDetailShown={isSwitchDetailShown}
              isCreateFormShown={isCreateFormShown}
              isErrorMessageShown={isErrorMessageShown}
              validationMessage={validationMessage}
              isGeneratorInfo={isGeneratorInfo}
              isHvacInfo={isHvacInfo}
              isWRFShown={isWRFShown}
              isWRFEditable={isWRFEditable}
              isWodEditable={isWodEditable}
              isWoPending={isWoPending}
              user = {this.props.user}
              vendorWorkOrderSelectedRowObj={this.props.vendorWorkOrderSelectedRowObj}
              toggleSiteDetails={this.toggleSiteDetails.bind(this)}
              toggleSwitchDetails={this.toggleSwitchDetails.bind(this)}
              workORderInfo={workORderInfo}
              getQuotes={getQuotes}
              isWorkInProgress={isWorkInProgress}
              isAcceptedWork={isAcceptedWork}
              formHeader={FORM_HEADER}
              elogLoading={elogLoading}
              handleNext={this.handleNext}
              elogs={elogs}
              workPendingElog={this.state.workPendingElog}
              setIsElogEmpty={this.setIsElogEmpty}
              selectedWorkOrderTitle={this.state.selectedTitle}
              onDirtyChange={onDirtyChange}
              role={userRole}
              handleHideModal={handleHideModal}
              workOrderDetailInfo={workOrderDetailInfo}
              isWoloading={isWoloading}
              site={site}
              events={this.props.events}
              siteDetaisLoading={siteDetaisLoading}
              switchDetailsLoading={switchDetailsLoading}
              onSubmitVendorStatus={this.onSubmitVendorStatus}
              setElogState={this.setElogState} 
              rmaStatusData={this.props.rmaStatusData}
              appNotification={this.props.appNotification}
              esaFlag={esaFlag}
              submitFlag={this.state.submitFlag}
              vendor_status_wo={this.state.vendor_status_wo}
              currentWorkOrderOEvent={currentWorkOrderOEvent}
              />

          </div>
          <br /><br />
          {/* <div className="col-lg-6" style={{ float: 'left', paddingTop: "50px" }}>
            {isSiteDetailShown && (<SiteDetails isWorkInProgress={isWorkInProgress} getQuotes={getQuotes} workORderInfo={workORderInfo} />)}
            {isSwitchDetailShown && (<SwitchDetails workORderInfo={workORderInfo} switchInfo={switchInfo} />)}
          </div>*/}
        </div>
      </div>
    )
        }
  }
}

function stateToProps(state, props) {
  let workorderId = (props.workOrderInfo && props.workOrderInfo.get("workorder_id")) ? props.workOrderInfo.get("workorder_id") + "" : null
  let siteunid = (props.workOrderInfo && props.workOrderInfo.get("site_unid")) ? props.workOrderInfo.get("site_unid") + "" : null
  let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
  let user = state.getIn(["Users", "entities", "users", loginId], Map())
  let vendorId = user.get('vendor_id')
  let userList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let saveVenderStatusLoading = state.getIn(["VendorDashboard", loginId, "workorderStatusUpdate", "loading"], false)
  let saveStatusError = state.getIn(["VendorDashboard", loginId, "workorderStatusUpdate", "errorMessage"], Map())
  let savedStatusMessage = state.getIn(["VendorDashboard", loginId, "workorderStatusUpdate", "savedMessage"], Map())
  let userFullName = state.getIn(["Users", "entities", "users", loginId, "name"], "")
  let meta_unid = (props.workOrderInfo && props.workOrderInfo.get("meta_universalid")) ? props.workOrderInfo.get("meta_universalid") : null
  let events = state.getIn(["VendorDashboard", loginId, "eventsforSite", "eventsforSiteDetails"], Map())
  let eventsLoading = state.getIn(["VendorDashboard", loginId, "eventsforSite", "eventsforSiteLoading"], Map())
  let eventsError = state.getIn(["VendorDashboard", loginId, "eventsforSite"], Map())
  let issueData= state.getIn(["Sites", loginId, "issue","issueData"],Map())
  let allEvents = state.getIn(["VendorDashboard", loginId, "events", "allEvents", "eventsDetails"], Map())
  allEvents = allEvents?.toJS()?.getEventDetails ? allEvents?.toJS()?.getEventDetails : [];
  let allrecentCurrentWorkOrderOEvent = allEvents.filter((elem) => elem.workId == workorderId)
  let allrecentEventId = allrecentCurrentWorkOrderOEvent.sort((a,b) => a.eventId - b.eventId)
  let allcurrentWorkOrderOEvent = allrecentEventId[allrecentEventId.length-1]
  events = events?.toJS()?.getCalenderEventsForSite ? events?.toJS()?.getCalenderEventsForSite?.data : [];
  let recentCurrentWorkOrderOEvent = events.filter((elem) => elem.workId == workorderId)
  let recentEventId = recentCurrentWorkOrderOEvent.sort((a,b) => a.eventId - b.eventId)
  let currentWorkOrderOEvent = recentEventId[recentEventId.length-1]
  eventsError = eventsError?.toJS()?.errors;
  const appNotification = state.getIn(['AppNotificationReducer', 'appNotification'], Map())
  const vendorWorkOrderSelectedRowObj = state.getIn(["VendorDashboard", loginId, "workOrders", "selectedRow"], Map())
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;
  let rma_data = state.getIn(["VendorDashboard", loginId, "rma_data"], List())
  let configData = config?.toJS()?.configData;
  return {
    elogs: state.getIn(['Elog', 'listItems'], List()),
    elogLoading: state.getIn(['Elog', 'elogLoading'], false),
    userdetails: state.getIn(["Users", "entities", "users", loginId], Map()),
    workORderInfo: state.getIn(["VendorDashboard", loginId, "workOrderMap", workorderId], Map()),
    generatorInfo: state.getIn(["VendorDashboard", "generator"], List()),
    hvacInfo: state.getIn(["VendorDashboard", "hvac"], List()),
    genTankInfo: state.getIn(["VendorDashboard", "genTank"], List()),
    isLoading: state.getIn(["VendorDashboard", "genReadingsRequest", "isloading"], false),
    savedMessage: state.getIn(["VendorDashboard", "genReadingsRequest", "success"], null),
    errorMessage: state.getIn(["VendorDashboard", "genReadingsRequest", "errors"], null),
    currentValues: state.getIn(["Forms", formName, "currentValues"], List()),
    isWoloading: state.getIn(["VendorDashboard", "workOrderDetail", "isWoLoading", meta_unid], false),
    workOrderDetailInfo: state.getIn(["VendorDashboard", "workOrderDetail", meta_unid], Map()),
    site: state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()),
    siteDetaisLoading: state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false),
    switchInfo: state.getIn(["Switch", loginId, "switch", "switchDetails"], List()),
    switchDetailsLoading: state.getIn(["Switch", loginId, "switch", "switchDetailsLoading"], false),
    siteDetailInfo: state.getIn(["Sites", loginId, "site", "siteDetails", siteunid], List()),
    saveVenderStatusLoading,
    allcurrentWorkOrderOEvent,
    loginId,
    allEvents,
    issueData,
    saveStatusError,
    userFullName,
    user,
    userList,
    savedStatusMessage,
    events,
    eventsError,
    vendorWorkOrderSelectedRowObj,
    vendorId,
    esaFlag,
    currentWorkOrderOEvent,
    eventsLoading,
    rmaStatusData: state.getIn(["VendorDashboard", loginId, vendorId, "rmaStatusData"], List()).toJS(),
    appNotification: state.getIn(['AppNotificationReducer', 'appNotification'], Map()),
    workorderId,
    rma_data,
    isVendorDeactivated: state.getIn(['Users', 'isVendorBannerDisabled'], false),
    configData
  }
}
export default connect(stateToProps, { ...formActions, ...VendorActions, ...elogActions, ...VendorActionsNew, fetchSiteDetails,getIssueDetails, fetchSwitchDetails, getCalenderEventsForSite,getConflictkirkeEventsForSite, ivrEmailNotify, submitScheduleRequest, updateScheduleRequest })(WorkOrderDetails)
