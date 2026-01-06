import React, { Component } from 'react'
import { connect } from "react-redux"
import Datetime from 'react-datetime'
import PropTypes from 'prop-types'
import moment from "moment"
import Select from 'react-select'
import { List, Map, fromJS } from "immutable"
import Dropzone from 'react-dropzone'
import TextField from '@material-ui/core/TextField'
import * as formActions from "../../Forms/actions"
import { submitScheduleRequest, updateScheduleRequest, resetProps, fetchEventDetails, fetchWoByUnidDetails } from "../../VendorDashboard/actions"
import VScheduleFileUpload from '../../VendorDashboard/components/VScheduleFileUpload'
import MessageBox from '../../Forms/components/MessageBox'
import Loader from '../../Layout/components/Loader'
import '../../../node_modules/react-datetime/css/react-datetime.css'
import { CATEGORY, WORKTYPE } from '../../VendorDashboard/utils'
import '../assets/style.css'
import OpsComments from './OpsComments'
import difference from 'lodash/difference'
import { updateWorkorderStatus, fetchWorkOrder } from '../../VendorDashboard/actions'
import { ivrEmailNotify } from '../../Users/actions'
import { ivrEmailNotification } from '../../Users/schema'
import { getHolidayEvents } from "../../sites/actions";
import isEqual from 'lodash/isEqual'
const DATE_TIME_FORMAT = "MM-DD-YYYY hh:mm A"
const formName = "CreateVScheduleRequestForm"

export class VSCreateScheduler extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      startDate: '',
      ISOstart: '',
      ISOend: '',
      endDate: '',
      startDateValErr: null,
      endDateValErr: null,
      startSlotBookedErr: "",
      endSlotBookedErr: "",
      searchText: '',
      statusState: 'In Progress',
      isChangeStatusMessageShown: false,
      isInfoMessageShown: false,
      isStatusChangeDone: false,
      scheduleStatus: 'Request for',
      filesData: [],
      workIDarray: [],
      isFileSizeError: false,
      requestorEmail: null,
      siteSwitchname: null,
      workOrderDetailInfo:{},
      holidays : []
    }
  }

  componentDidMount() {
    let { currentEventObj, startDate, endDate, work, eventWorkIds } = this.props
    this.initializeWorkIdArray(eventWorkIds)
    if (currentEventObj && currentEventObj?.status !== "UNSCHEDULED" ) {
      this.setState({
        oldData: currentEventObj, scheduleStatus: 'Update', title: currentEventObj.title, description: currentEventObj.description,
        ISOstart: currentEventObj.start ? moment(currentEventObj.start).toISOString() : moment(startDate).toISOString(),
        ISOend: currentEventObj.end ? moment(currentEventObj.end).toISOString() : moment(endDate).toISOString()
      })
      if (currentEventObj.status == 'INPROGRESS') {
        this.setState({ statusState: 'Done', isChangeStatusMessageShown: true })
      }
      if (currentEventObj.status == 'SCHEDULED') {
        this.setState({ isChangeStatusMessageShown: true })
      }
      let workIDarray = []
      workIDarray.push({ label: currentEventObj.title, value: currentEventObj.title })
      this.setState({ workIDarray: workIDarray })
      // Edit or Add new
      this.updateForm()
    } else {
      this.initializeForm(false)
      this.setState({
        startDate: this.validateDateStr(startDate,true),
        endDate: this.validateDateStr(endDate,false),
        ISOstart: moment(startDate).toISOString(),
        ISOend: moment(endDate).toISOString()
      })
     
    }
    this.props.getHolidayEvents().then(res => {
      if (res.type === 'FETCH_HOLIDAYEVENTS_SUCCESS') {
          const holidays = res.holidayEvents && res.holidayEvents.length > 0 ? res.holidayEvents.map((hol) => hol.HOLIDAY_DATE && hol.HOLIDAY_DATE.length > 10 && hol.HOLIDAY_DATE.substring(0, 10)) : []
          this.setState({holidays: holidays})
      }
  })
    this.validateScheduleDateData()
  }

  initializeWorkIdArray(eventWorkIds) {
    let { work, allworkorders, siteInfo, switchInfo, typeWO } = this.props
    let tempWorkIDarray, workIDarray = []
    let filteredWorkIDarray = work.filter((idx) => {
      return (idx.name == "Work Pending" || idx.name == "Work Pending Scheduled" || idx.name == "Work Pending Unscheduled")
    }).map((filt) => {
      tempWorkIDarray = filt.data
      return filt
    })
    let siteOrSwitchWorkIDarray = allworkorders.filter(function (elem) {
      if (typeWO == 'Site') {
        return elem.site_unid == siteInfo.site_unid
      }
      if (typeWO == 'Switch') {
        return elem.site_unid == switchInfo.switch_unid
      }
    }).map(function (el) {
      return JSON.stringify(el.workorder_id)
    })
    let finalWorkIDArray = tempWorkIDarray.filter(element => siteOrSwitchWorkIDarray.includes(element));
    let workPendingAndUnscheduledIDs = _.difference(finalWorkIDArray, eventWorkIds);
    workPendingAndUnscheduledIDs.forEach(function (element) {
      workIDarray.push({ label: element, value: element })
    });
    this.setState({ workIDarray: workIDarray })
  }

  validateScheduleDateData() {
    let momentStartDate = moment(this.state.startDate), momentEndDate = moment(this.state.endDate)

    if (momentStartDate && momentStartDate.isSameOrBefore(moment())) {
      this.setState({ startDateValErr: 'Start Date Time should be more than Current Date Time' })
    } 
    else {
      this.setState({ startDateValErr: null })
    }

    if (momentEndDate && momentEndDate.isSameOrBefore(momentStartDate)) {
      this.setState({ endDateValErr: 'End Date Time should be more than Start Date Time' })
    }else if(momentEndDate && momentEndDate.isSameOrBefore(moment())) {
      this.setState({ endDateValErr: 'End Date Time should not be less than the Current Date Time' })
    } 
    else {
      this.setState({ endDateValErr: null})
    }
  }

  componentDidUpdate(prevProps, prevState) {
        if (!(isEqual(prevProps.eventWorkIds, this.props.eventWorkIds)) || !(isEqual(prevProps.siteInfo, this.props.siteInfo)) || !(isEqual(prevProps.switchInfo, this.props.switchInfo))) {
      this.initializeWorkIdArray(this.props.eventWorkIds)
    }
    if (prevState.filesData.length != this.state.filesData.length) {
      let totalFileSize = this.state.filesData.reduce((a, b) => +a + +b.file_size, 0);
      if (totalFileSize > 49000000) {
        this.setState({ isFileSizeError: true })
      }
      if (totalFileSize < 49000000) {
        this.setState({ isFileSizeError: false })
      }
    }

    if((this.state.startDate && !moment(prevState.startDate).isSame(moment(this.state.startDate))) || (this.state.endDate && !moment(prevState.endDate).isSame(moment(this.state.endDate)))) {
      this.validateScheduleDateData()
    }
  }

  componentWillUnmount() {
    this.setState({
      startDate: '',
      ISOstart: '',
      ISOend: '',
      endDate: '',
      startDateValErr: null,
      endDateValErr: null,
      searchText: '',
      statusState: 'In Progress',
      isChangeStatusMessageShown: false,
      isInfoMessageShown: false,
      isStatusChangeDone: false,
      scheduleStatus: 'Request for',
      filesData: [],
      workIDarray: [],
      isFileSizeError: false,
      requestorEmail: null,
      siteSwitchname: null,
      workOrderDetailInfo:{}
    })
  }

  initializeForm(isTriggerFromClear) {
    let { setInitialValues, setValue } = this.props
    setInitialValues(formName, {})
    setValue(formName, 'category', { name: "category", label: "Vendor Work Order", value: "Vendor Work Order" })
    setValue(formName, 'workId', '')
    setValue(formName, 'workType', '')
    setValue(formName, 'description', '')
    setValue(formName, 'newcomment', '')
    this.setState({ searchText: '', filesData: [] })
    if (isTriggerFromClear) {
      this.setState({
        startDate: '',
        endDate: '',
        searchText: '',
        title: '',
        description: '',
        eventStatusId: '0',
        filesData: []
      })
      setValue(formName, 'start', '')
      setValue(formName, 'end', '')
    }
  }

  setValue(field, value) {
    this.props.setValue(formName, field, value)
  }

  updateForm() {
    let { currentEventObj, setInitialValues, setValue, allworkorders, fetchWoByUnidDetails } = this.props

    
    if (currentEventObj.files) {
      if (currentEventObj.files.length > 0 || currentEventObj.files.size > 0) {
        this.setState({
          filesData: currentEventObj.files
        })
      }
    }
    if (currentEventObj.workId) {
      this.setState({
        searchText: currentEventObj.workId
      })
      setValue(formName, 'workId', currentEventObj.workId)
      let selectedWorkOrder = allworkorders.filter((el) => {
        return el.workorder_id.toString() == currentEventObj.workId
      })
      if ( selectedWorkOrder?.length > 0 && selectedWorkOrder[0].meta_universalid) {
        fetchWoByUnidDetails(selectedWorkOrder[0].meta_universalid, this.props.loginId).then(action => {
          if (action.type == 'FETCH_WO_UNID_SUCCESS') {
            this.setState({ requestorEmail: action.vendor_wo_details.requestor_email, siteSwitchname: selectedWorkOrder[0].switch, workOrderDetailInfo : action.vendor_wo_details})
          }
        }).catch(error => {
          console.error("Error fetching work order details:", error);
        });
      }
    }
    if (currentEventObj.workType) {
      setValue(formName, 'workType', currentEventObj.workType)
    }
    if (currentEventObj.description) {
      setValue(formName, 'description', '')
    }
    if (currentEventObj.comments) {
      setValue(formName, 'comments', '')
    }

    setInitialValues(formName, {})
    setValue(formName, 'newcomment', '')
    for (var key in currentEventObj) {
      setValue(formName, key, currentEventObj[key])
      if (key == 'start') {
        this.setState({ startDate: this.validateDateStr(currentEventObj[key],true) })
      }
      if (key == 'end') {
        this.setState({ endDate: this.validateDateStr(currentEventObj[key],false) })
      }
    }
    if (currentEventObj.category) {
      setValue(formName, 'category', { name: "category", label: currentEventObj.category, value: currentEventObj.category })
     }
  }

  validateDateStr(dateObj,isFromdate) {
    var result = ''
    var filteredEvents = this.props.events?.filter((event) => event.siteUnid == this.props.Unid) || []
    let {allowKirkeFreesEventWO} = this.props
    if(this.props.currentEventObj){
      filteredEvents = filteredEvents.filter(e=>e.eventId !== this.props.currentEventObj.eventId)
    }
    var filteredEventsData=[...filteredEvents,...this.props.conflictEvents]
    if (dateObj) {
      result = moment(dateObj).format(DATE_TIME_FORMAT)
    }
    if (isFromdate) {
      let invaliddate=[]
      invaliddate=filteredEventsData.filter(range => 
        moment(dateObj).isBetween(moment(range.start), moment(range.end)) || 
        range?.conflictKirkeData && moment(dateObj).isBetween(moment(range?.conflictKirkeData?.start), moment(range?.conflictKirkeData?.end)) ||
        moment(dateObj).isSame(moment(range.start))           
      )
      if( allowKirkeFreesEventWO === 'No' && invaliddate && invaliddate.length >0){
        this.setState({ startSlotBookedErr: 'Time slot is not available' })
      }
      else{
        this.setState({ startSlotBookedErr: null })
      }
    }
    else{
      let invaliddate=[]
      invaliddate=filteredEventsData.filter(range => 
        moment(dateObj).isBetween(moment(range.start), moment(range.end)) ||
        range?.conflictKirkeData && moment(dateObj).isBetween(moment(range?.conflictKirkeData?.start), moment(range?.conflictKirkeData?.end)) || 
        moment(dateObj).isSame(moment(range.end))           
      )
      if(allowKirkeFreesEventWO === 'No' && invaliddate && invaliddate.length >0){        
        this.setState({ endSlotBookedErr: 'Time slot is not available' })
      }
      else{
        this.setState({ endSlotBookedErr: null })
      }
    }
    return result
  }

  onEventDateChange(isFromdate, milisecs) {
    let {allowKirkeFreesEventWO} = this.props
    var filteredEvents = this.props.events?.filter((event) => event.siteUnid == this.props.Unid) || []

    if(this.props.currentEventObj){
      filteredEvents = filteredEvents.filter(e=>e.eventId !== this.props.currentEventObj.eventId)
    }
    var filteredEventsData=[...filteredEvents,...this.props.conflictEvents]
    if (typeof milisecs === 'object') {
      var isoRepresentation = new Date(milisecs).toISOString()

      var momentDate = moment(isoRepresentation)
      if (isFromdate) {
        this.setState({ startDate: momentDate.format(DATE_TIME_FORMAT), ISOstart: isoRepresentation })
        if (this.state.endDate) {
        var diff = moment(this.state.endDate, 'MM-DD-YYYY hh:mm a').diff(momentDate)
          if (diff < 0) {
            this.setState({ startDateValErr: 'Should be before end date' })
          } else {
            this.setState({ startDateValErr: null, endDateValErr: null })
          }
        
          var endmomentDate = moment(this.state.ISOend)
          let invaliddate = []
          invaliddate = filteredEventsData.filter(range =>
            moment(endmomentDate.format()).isBetween(moment(range.start), moment(range.end)) ||
            range?.conflictKirkeData && moment(endmomentDate.format()).isBetween(moment(range?.conflictKirkeData?.start), moment(range?.conflictKirkeData?.end)) ||
            moment(endmomentDate.format()).isSame(moment(range.end))
          )
          if ( allowKirkeFreesEventWO === 'No' && invaliddate && invaliddate.length > 0 ) {
            this.setState({ endSlotBookedErr: 'Time slot is not available' })
          }
          else {
            this.setState({ endSlotBookedErr: null })
          }          
        }
        let invaliddate = []
        invaliddate = filteredEventsData.filter(range =>
          moment(momentDate.format()).isBetween(moment(range.start), moment(range.end)) ||
          range?.conflictKirkeData && moment(momentDate.format()).isBetween(moment(range?.conflictKirkeData?.start), moment(range?.conflictKirkeData?.end)) ||
          moment(momentDate.format()).isSame(moment(range.start))
        )
        if ( allowKirkeFreesEventWO === 'No' && invaliddate && invaliddate.length > 0 ) {
          this.setState({ startSlotBookedErr: 'Time slot is not available' })
        }
        else {
          this.setState({ startSlotBookedErr: null })
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
          var startmomentDate = moment(this.state.ISOstart)
          let invaliddate = []
          invaliddate = filteredEventsData.filter(range =>
            moment(startmomentDate.format()).isBetween(moment(range.start), moment(range.end)) ||
            range?.conflictKirkeData && moment(startmomentDate.format()).isBetween(moment(range?.conflictKirkeData?.start), moment(range?.conflictKirkeData?.end)) ||
            moment(startmomentDate.format()).isSame(moment(range.start))
          )
          if ( allowKirkeFreesEventWO === 'No' && invaliddate && invaliddate.length > 0 ) {
            this.setState({ startSlotBookedErr: 'Time slot is not available' })
          }
          else {
            this.setState({ startSlotBookedErr: null })
          }          
        }
        let invaliddate = []
        invaliddate = filteredEventsData.filter(range =>
          moment(momentDate.format()).isBetween(moment(range.start), moment(range.end)) ||
          range?.conflictKirkeData && moment(momentDate.format()).isBetween(moment(range?.conflictKirkeData?.start), moment(range?.conflictKirkeData?.end)) ||
          moment(momentDate.format()).isSame(moment(range.end))
        )
        if ( allowKirkeFreesEventWO === 'No' && invaliddate && invaliddate.length > 0 ) {

          this.setState({ endSlotBookedErr: 'Time slot is not available' })
        }
        else {
          this.setState({ endSlotBookedErr: null })
        }
      }
    }
    this.validateScheduleDateData()
  }
  onAttachRemove(index) {
    this.setState({
      filesData: this.state.filesData.filter((_, i) => i !== index)
    })
    this.forceUpdate()
  }

  onFileDrop(files) {
    let { savedMessage, errorsMessage } = this.props
    if (savedMessage.size || errorsMessage.size || savedMessage.length > 0 || errorsMessage.length > 0) {
      this.resetInfo()
    }
    this.state.isFileSizeError == false && files.forEach(file => {
      if (file['size'] > 0) {
        var reader = new window.FileReader()
        reader.onload = function () {
          var dataURL = reader.result
          var droppedFile = {
            file_name: file['name'],
            file_type: file['type'],
            file_size: file['size'] + '',
            file_data: dataURL,
            preview: file['preview'],
            filename: file['name'],
            last_modified: file['lastModifiedDate']
          }
          this.setState({
            filesData: this.state.filesData.concat(droppedFile)
          })
          this.forceUpdate()
        }.bind(this)
        reader.readAsDataURL(file)
      }
    })
  }

  onDataChange = (e) => {
    let { savedMessage, errorsMessage } = this.props
    if (savedMessage.size || errorsMessage.size || savedMessage.length > 0 || errorsMessage.length > 0) {
      this.resetInfo()
    }
    if (e && e.target) {
      if (e.target.name && e.target.value) { this.setValue(e.target.name, e.target.value) }
    } else {
      this.setValue(e.name, e.value)
    }
  }

  changeStatus(changedVal) {
    let self = this
    if (changedVal == 'inprogress') {
      this.setValue("status", 'INPROGRESS')
      this.setState({ isChangeStatusMessageShown: false, isInfoMessageShown: true, isStatusChangeDone: true })
    }
    if (changedVal == 'done') {
      this.setValue("status", 'DONE')
      this.setState({ isChangeStatusMessageShown: false, isInfoMessageShown: true, isStatusChangeDone: true })
    }
    if (changedVal == 'dismiss') {
      this.setState({ isChangeStatusMessageShown: false, isInfoMessageShown: false })
    }
    setTimeout(function () {
      self.setState({ isInfoMessageShown: false })
    }, 2500)
  }

  onSubmitVendorStatus = (status, workId, isFromCreateSchedule = false) => {
    let { typeWO, allworkorders } = this.props
    let {config} = this.props
    let unscheduledWorkTypes = [];
    let unscheduledWork = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE").ATTRIBUTE_VALUE
    if(unscheduledWork){
      unscheduledWorkTypes = unscheduledWork && unscheduledWork.split(",");
    }
    let siteUnid = typeWO == 'Switch' ? null : this.props.siteInfo.site_unid
    let switchUnid = typeWO == 'Switch' ? this.props.switchInfo.switch_unid : null
    let selectedWorkOrder = []
    let self = this
    selectedWorkOrder = allworkorders.filter((el) => {
      return el.workorder_id == workId
    })
    let meta_univ_id = selectedWorkOrder[0].meta_universalid
    let vendorStatus = this.props.currentValues.toJS().status == 'DONE' ? 'Work Completed' : this.props.currentValues.toJS().status == 'INPROGRESS' ? 'In Progress' : status
    let o = {
      "vendor_status": status,
      "userid": this.props.loginId,
      "vendor_wo_unid": meta_univ_id,
      "site_unid": typeWO == 'Switch' ? switchUnid : siteUnid
    }
    let stDate = moment().subtract(7, 'days')
    let edDate = moment()
    this.props.updateWorkorderStatus(o, this.props.loginId, meta_univ_id, this.props.userFullName).then((action) => {
      if (action.type === 'UPDATE_WORKORDER_STATUS_SUCCESS') {
        this.state.isStatusChangeDone ? self.sendEmailNotificationForVendorStatus(vendorStatus, selectedWorkOrder[0]) : null;
        this.props.fetchWorkOrder(this.props.loginId, stDate.format('YYYY-MM-DD'), edDate.format('YYYY-MM-DD'), null,null,unscheduledWorkTypes)
      }
    })
  }
  
  onSubmit = (cancelSchedule = false) => {
    let { siteInfo, switchInfo, loginId, submitScheduleRequest, updateScheduleRequest, typeWO ,user} = this.props
    let userDetailsobj = user ? user?.toJS() : {}
    let vendorId = userDetailsobj.vendor_id
    let vendorStatus = 'Scheduled'
    let workOrderDetailInfo = this.state.workOrderDetailInfo
    let engineerLoginId = workOrderDetailInfo && workOrderDetailInfo.requested_by
    let ticketNumber = workOrderDetailInfo && workOrderDetailInfo.wb360_id
    let ticketSource = "WB360"
    //let typeofWO = typeWO == 'Switch' ? 'switch' : 'cell'
    var techName = userDetailsobj.lname + ', ' + userDetailsobj.fname
    const fileData = this.state.filesData

    let values = this.props.currentValues.toJS()
    if (typeof values.category == 'object') {
      values.category = values.category.value
    }
    values.start = this.state.ISOstart
    values.end = this.state.ISOend
    values.workId = this.state.searchText
    values.files = fileData
    values.market = typeWO == 'Switch' ? switchInfo.market : siteInfo.market
    values.submarket = typeWO == 'Switch' ? switchInfo.region : siteInfo.region
    values.siteNo = typeWO == 'Switch' ? null : parseInt(siteInfo.siteid)
    values.siteName = typeWO == 'Switch' ? null : siteInfo.sitename
    values.siteUnid = typeWO == 'Switch' ? null : siteInfo.site_unid
    values.switchUnid = typeWO == 'Switch' ? switchInfo.switch_unid : null
    values.switchName = typeWO == 'Switch' ? switchInfo.switch_name : this.state.siteSwitchname
    values.vendorCompanyName = userDetailsobj.vendor_name
    values.vendorTechName = techName
    if (this.state.scheduleStatus !== 'Update') {
      values.status = 'SCHEDULED'
      values.engineerLoginId = engineerLoginId
      values.ticketNo = ticketNumber
      values.ticketSource = ticketSource
    }
    values.vendorId = vendorId
    values.loginId = this.props.loginId
    values.loginName = techName
    values.workType = workOrderDetailInfo.work_type
    let devices = workOrderDetailInfo.device_uts_id;
    values.comments = values.newcomment;
    delete values.newcomment;
    let deviceInfo = values.category == "Vendor Work Order" ? devices && JSON.parse(devices) : null;
    let woDevices = deviceInfo && deviceInfo.length > 0 && deviceInfo.map(e => {
        return {
            "deviceId": e.tid,
            "devicename": e.name,
            "devicevendor": e.vendor
        }
    })
    var self = this


    if (this.state.scheduleStatus == 'Update') {
      values.kirkeId = this.state.oldData?.autoCreatedKirkeRequest ? this.state.oldData.autoCreatedKirkeRequest : null;
      values.engineerLogin = engineerLoginId
      if (values.comments) {
        delete values.comments
      }
      if (this.state.oldData.status = "SCHEDULED") {
        values.status = 'RESCHEDULED'
        vendorStatus = 'Rescheduled'
    }
    if (this.state.oldData.status = "RESCHEDULED") {
        values.status = 'RESCHEDULED'
        vendorStatus = 'Rescheduled'
    }
     
      if (values.status == 'DONE') {
        vendorStatus = 'Work Completed'
      }
      if (values.status == 'INPROGRESS') {
        vendorStatus = 'In Progress'
      }
      if (values.category == "Vendor Work Order") {
        values.woDevices = woDevices || null;
      }
      if(cancelSchedule) {
        values.status = 'UNSCHEDULED'
        vendorStatus = 'Unscheduled'
      }
      values.woDevices = woDevices || null;
      values.description = this.props.currentValues.get('description').substring(0, 498)
      values.newcomment = this.props.currentValues.get('newcomment').substring(0, 999)
      var updateObj = {}
      updateObj.newData = values
      values.loginId = engineerLoginId

      updateObj.oldData = this.state.oldData

      updateScheduleRequest(loginId, updateObj).then((action) => {
        if (action.type === 'UPDATE_SCHEDULE_REQUEST_SUCCESS') {
          self.initializeForm(false)
          let { fetchEventDetails, loginId } = self.props
          //fetchEventDetails(loginId, vendorId, typeofWO)
          fetchEventDetails(loginId, vendorId)
          if (action.savedMessage) {
            self.props.notifref.addNotification({
              title: 'Success',
              position: "br",
              level: 'success',
              autoDismiss: 3,
              message: action.savedMessage
            })
            self.onSubmitVendorStatus(vendorStatus, values.workId)
            self.resetInfo()
            self.props.hideCreateEditEventModal()
            !this.state.isStatusChangeDone ? self.sendEmailNotification(updateObj.newData) : null;
          }
          if (action.errorsMessage) {
            self.resetInfo()
          }
        }
      })
    }
    if (this.state.scheduleStatus !== 'Update') {
      values.woDevices = woDevices || null;
      submitScheduleRequest(loginId, values).then((action) => {
        if (action.type === 'SUBMIT_SCHEDULE_REQUEST_SUCCESS') {
          self.initializeForm(false)
          let { loginId, fetchEventDetails } = self.props
          //fetchEventDetails(loginId, vendorId, typeofWO)
          fetchEventDetails(loginId, vendorId)
          if (action.savedMessage) {
            self.props.notifref.addNotification({
              title: 'Success',
              position: "br",
              level: 'success',
              autoDismiss: 3,
              message: action.savedMessage
            })
            self.onSubmitVendorStatus('Scheduled', values.workId, true)
            self.resetInfo()
            self.props.hideCreateEditEventModal()
            self.sendEmailNotification(values)
          }
          if (action.errorsMessage) {
            self.resetInfo()
          }
        }
      })
    }
  }

  sendEmailNotificationForVendorStatus = (status, workOrderDetailInfo) => {
    workOrderDetailInfo = fromJS(workOrderDetailInfo)
    let bodyMessage =
      '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
      '	<h1 style="background:#ff9800;color:#ffffff;padding:5px;margin:0px"> Vendor Status Notification </h1>' +
      '	<div style="padding:10px;color:#607d8b">' +
      '		<div>Vendor Status       : ' + status + '</div>' +
      '		<div>Work Order #       : ' + workOrderDetailInfo.get("workorder_id") + '</div>' +
      '		<div>Work Type: ' + workOrderDetailInfo.get("work_type") + '</div>' +
      '		<div>Work Order Status : ' + workOrderDetailInfo.get('workorder_status') + '</div>' +
      '		<div>Quote Status : ' + workOrderDetailInfo.get('quote_statuses') + '</div>' +
      '		<div>Requested By : ' + workOrderDetailInfo.get("requested_by_name") + '</div>' +
      '		<div>Requested Date : ' + workOrderDetailInfo.get("requested_date") + '</div>' +
      '		<div>Location   : ' + workOrderDetailInfo.get("switch") + '</div>' +
      '		<div>Site       : ' + workOrderDetailInfo.get("site_name") + '</div>' +
      '		<div>Work type   : ' + workOrderDetailInfo.get("work_type") + '</div>' +
      '		<div>Priority : ' + workOrderDetailInfo.get("priority") + '</div>' +
      '</div>' +
      '</div>';
    let requesterEmail = workOrderDetailInfo.get("requestor_email")
    let emailNotification = {
      body: bodyMessage,
      from: 'Vendor Portal',
      recipients: [this.state.requestorEmail],
      sourceName: 'Vendor Portal',
      subject: 'Vendor Status Update Notification - ' + workOrderDetailInfo.get("workorder_id"),
      transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
    }
    this.props.ivrEmailNotify(this.props.loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } }).then(action => {
      if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
        this.props.notifref.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: action.response.data.ivrEmailNotification.message + ' to ' + this.state.requestorEmail
        })
      }
    })
  }

  sendEmailNotification(data) {
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
      '		<div>Location   : ' + (data.switchName ? data.switchName.toString() : '') + '</div>' +
      '		<div>Site       : ' + (data.siteName ? data.siteName.toString() : '') + '</div>' +
      '		<div>Work Order #       : ' + (data.workId ? data.workId.toString() : '') + '</div>' +
      '		<div>Category   : ' + (data.category ? data.category.toString() : '') + '</div>' +
      '		<div>Event Status : ' + (data.status ? data.status.toString() : '') + '</div>' +
      '</div>' +
      '</div>';

    let emailNotification = {
      body: bodyMessage,
      from: 'Vendor Portal',
      recipients: [this.state.requestorEmail],
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
          message: action.response.data.ivrEmailNotification.message + ' to ' + this.state.requestorEmail
        })
      }
    })
  }

  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )
  }

  resetInfo = () => {
    let { resetProps, loginId } = this.props
    resetProps([loginId, "schedulerequest"], { isloading: false, errors: '', success: '' })
  }

  handleUpdateInput = (targetValue) => {
    let { allworkorders, fetchWoByUnidDetails } = this.props
    let selectedWorkOrder = []
    if (targetValue) {
      this.setState({ searchText: targetValue.value })
      selectedWorkOrder = allworkorders.filter((el) => {
        return el.workorder_id == targetValue.value
      })
      if (selectedWorkOrder.length > 0 && selectedWorkOrder[0].meta_universalid) {
        fetchWoByUnidDetails(selectedWorkOrder[0].meta_universalid,this.props.loginId).then(action => {
          if (action.type == 'FETCH_WO_UNID_SUCCESS') {
            this.setState({ requestorEmail: action.vendor_wo_details.requestor_email, siteSwitchname: selectedWorkOrder[0].switch, workOrderDetailInfo : action.vendor_wo_details })
          }
        })
      }
      this.setValue("workType", selectedWorkOrder[0].work_type)
      this.setValue("description", selectedWorkOrder[0].work_scope)
    }
    else {
      this.setState({ searchText: "" })
    }
    if (targetValue == '' || targetValue == ' ') {
      this.setState({
        validUser: 'yes'
      })
    }
  }

  handleNewRequest(value) {
    this.setState({
      searchText: value.name
    })
  }

  validInputDateTime=(current,isEnd) => {
      let yesterday = moment().subtract(1, 'day');
      if(isEnd){
        var momentDate = moment(this.state.ISOstart)
          return !this.state.holidays.includes(moment(current).format("YYYY-MM-DD")) && (!current.isBefore(moment(this.state.ISOstart)) || 
          moment(current.format('MM/DD/YYYY')).isSame(momentDate.format('MM/DD/YYYY')))
      }else{
          return !this.state.holidays.includes(moment(current).format("YYYY-MM-DD")) && current.isAfter(yesterday) 
      }
  
  }

  resetInfoMsg = () => {
    this.setState({ isInfoMessageShown: false })
  }

  render() {
        let { isLoading, savedMessage, errorsMessage } = this.props
    let { workIDarray } = this.state
    let { currentValues } = this.props
    const labelStyle = { "marginTop": "8px", "marginBottom": "8px", "color": "black", "fontSize": "1em", "float": "left" }

    if (isLoading) {
      return this.renderLoading()
    }
    return (
      <div className="table-responsive vp_stepper_content">
        {this.state.isFileSizeError && (<MessageBox messages={List(["The size of attachments should be less than 50 MB!"])} />)}
        {this.state.isInfoMessageShown && (<MessageBox messages={List(["Schedule Status changed! Please update your changes!"])} onClear={this.resetInfoMsg.bind(this)} className="alert-success" />)}
        {savedMessage && savedMessage.size ? (<MessageBox messages={List([savedMessage.get("message")])} className="Alert--success" iconClassName="fa-thumbs-up" onClear={this.resetInfo} />) : null}
        {errorsMessage && errorsMessage.size ? (<MessageBox messages={List([errorsMessage.toJS().message])} onClear={this.resetInfo} />) : null}
        {savedMessage && savedMessage.length > 0 ? (<MessageBox messages={List([savedMessage])} className="Alert--success" iconClassName="fa-thumbs-up" onClear={this.resetInfo} />) : null}
        {errorsMessage && errorsMessage.length > 0 ? (<MessageBox messages={List([errorsMessage])} onClear={this.resetInfo} />) : null}
        <style>
          {`
                .Form-label {
                    font-size: 1em;
                }
                input[disabled]{ background-color: #fff !important;}
               .lableMaterial{ margin: 11px 0px;font-size: 10px;font-weight: normal;color: rgba(0, 0, 0, 0.3);font-family: Roboto, sans-serif;}
               .rdt >  input{
                border-top: 0px;
                border-right: 0px;
                border-left: 0px;
                 }`
          }
        </style>
        <table className="table sortable table-bordered text-center site-table" style={{ minHeight: "288px", "background": "#FFF" }}>
          <tbody className="vzwtable text-left">
           {this.state.scheduleStatus !== 'Update' &&
              <tr>
                <td colSpan="2">
                  <p className="iopStandard" style={{ paddingTop: 5, marginBottom: -2 }}><strong>Status:</strong> {"UNSCHEDULED"}</p>
                </td>
              </tr>
            }
            <tr>
              <td colSpan="1">
                <div className="col-md-9 form-group" style={{ paddingLeft: 0 }}>
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Category</h5></label>
                  <Select
                    name="Category"
                    clearable={false}
                    value={currentValues.get("category") || { name: "category", label: "Vendor Work Order", value: "Vendor Work Order" }}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={(e) => e ? this.setValue("category", e.value) : this.setValue("category", "")}
                    options={CATEGORY}
                    required />
                </div>
              </td>
              <td colSpan="1">
                <div className="col-md-9" style={{ paddingLeft: 0 }}>
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Work Type</h5></label>
                  <Select
                    name="Work Type"
                    clearable="true"
                    value={{value : currentValues.get("workType") || '', label: currentValues.get("workType") || ''}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={(e) => e ? this.setValue("workType", e.value) : this.setValue("workType", "")}
                    options={WORKTYPE}
                    required />
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan="1">
                <div className="col-md-9" style={{ paddingLeft: 0 }}>
                     <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Start Date/Time</h5></label> 
                     {this.state.startDate ? this.state.startSlotBookedErr ? <span style={labelStyle}><h6 style={{ color: 'red', marginLeft:'5px' }}>{this.state.startSlotBookedErr}</h6></span> : 
                     this.state.errorText ? <span style={labelStyle}><h6 style={{ color: 'red', marginLeft:'5px'  }}>{this.state.errorText}</h6></span> : null : null}                    
                  {this.state.startDate ? this.state.startDateValErr ? <span style={labelStyle}><h6 style={{ color: 'red', marginLeft:'5px' }}>{this.state.startDateValErr}</h6></span> : 
                    this.state.errorText ? <span style={labelStyle}><h6 style={{ color: 'red', marginLeft:'5px'  }}>{this.state.errorText}</h6></span> : null : null}
                  <Datetime  isValidDate={value => this.validInputDateTime(value,false)} timeFormat dateFormat="MM-DD-YYYY" value={this.state.startDate || ''} closeOnSelect onChange={value => this.onEventDateChange(true, value)} />
                </div>
              </td>
              <td colSpan="1">
                <div className="col-md-9" style={{ paddingLeft: 0 }}>
                     <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>End Date/Time</h5></label>  
                     {this.state.endDate ? this.state.endSlotBookedErr ? <span style={labelStyle}><h6 style={{ color: 'red', marginLeft:'5px'  }}>{this.state.endSlotBookedErr}</h6></span> :
                     this.state.errorText ? <span style={labelStyle}><h6 style={{ color: 'red', marginLeft:'5px'  }}>{this.state.errorText}</h6></span> : null: null}                   
                  {this.state.endDate ? this.state.endDateValErr ? <span style={labelStyle}><h6 style={{ color: 'red', marginLeft:'5px'  }}>{this.state.endDateValErr}</h6></span> :
                     this.state.errorText ? <span style={labelStyle}><h6 style={{ color: 'red', marginLeft:'5px'  }}>{this.state.errorText}</h6></span> : null: null}
                  <Datetime isValidDate={value => this.validInputDateTime(value,true)}
                    timeFormat dateFormat="MM-DD-YYYY" value={this.state.endDate || ''}
                    closeOnSelect onChange={value => this.onEventDateChange(false, value)}
                    renderInput={(props) => {
                      return <input {...props} value={(this.state.endDate) ? props.value : ''} />
                    }} />
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan="1">
                <div className="col-md-9" style={{ paddingLeft: 0 }}>
                  <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Work ID</h5></label>
                  <Select
                    id="WorkID"
                    name="Work ID"
                    clearable="true"
                    value={{value:this.state.searchText || '',label:this.state.searchText || ''}}
                    className="col-12 col-md-12 no-padding float-left"
                    onChange={this.handleUpdateInput}
                    options={workIDarray}
                    required />
                </div>
              </td>
            </tr>
            <tr >
              <td colSpan="2">
                <label style={{ "marginTop": "10px", "color": "black", "fontSize": "1em" }}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Work Description</h5></label>
                <div style={{ margin: '10px' }}>
                  <textarea
                    rows={2}
                    id="description"
                    name="description"
                    style={{ padding: "10px", "borderRadius": "3px", width: '100%' }}
                    value={currentValues.get("description") || ''}
                    onChange={(e) => e ? this.setValue("description", e.target.value) : this.setValue("description", "")}
                    maxLength="500" />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'blue', fontSize:14 }}>Note: Work Description length cannot exceed 500 characters, Please provide work description accordingly.</span>
                    {currentValues.get('description') && <span style={{ fontSize:14 }}>Characters count: {currentValues.get('description').length}</span>}
                  </div>
                </div>
              </td>
            </tr>
            
            <tr> <td colSpan="2">
              <label style={{ "marginTop": "10px", "color": "black", "fontSize": "1em" }}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Comments (Min 7 characters required)</h5></label>
              <div style={{ margin: '10px' }}>
              <textarea
                    rows={2}
                    id="newcomment"
                    name="newcomment"
                    style={{ padding: "10px", "borderRadius": "3px", width: '100%' }}
                    defaultvalue=''
                    onChange={(e) => e ? this.setValue("newcomment", e.target.value) : this.setValue("newcomment", "")}
                    maxLength="999" />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'blue', fontSize: 14 }}>Note: Comments length cannot exceed 999 characters, Please do not copy/paste the work description into the comments field</span>
                  {currentValues.get('newcomment') && <span style={{ fontSize:14 }}>Characters count: {currentValues.get('newcomment').length}</span>}
                </div>
              </div>

            </td>
            </tr>
              {this.state.scheduleStatus == 'Update' ?
              (
                <tr>
                  <td colSpan="2">
                    <div className="row" >
                      <div className="col-md-12 col-sm-12">
                        <tr style={{ border: 0 }}>
                          <p className="iopStandard"><strong>Comments:</strong></p>
                          <OpsComments comments={currentValues.get("comments")} />
                        </tr>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : null
            }
            
            <tr>
              <td colSpan="2">
                <div className={"col-md-3 float-left"}>
                  <Dropzone onDrop={this.onFileDrop.bind(this)}>
                    {/* <div style={{ 'textAlign': 'center', 'paddingTop': '10%' }}>Drop files here, or click to select files to upload</div> */}
                    {({ getRootProps, getInputProps }) => (
                      <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                </div>
                <div className="col-md-3 float-left">
                  <VScheduleFileUpload fileList={this.state.filesData} loginId={this.props.loginId} onRemoveClick={this.onAttachRemove.bind(this)} />
                </div>
                <button type="submit"
                  className="Button--secondary float-right"
                  disabled={currentValues.get('category') === ''|| currentValues.get('newcomment')?.trim().length < 7 || currentValues.get('description') === ''  || this.state.startDate === '' || this.state.endDate === '' || this.state.searchText === '' || currentValues.get('workType') === '' || currentValues.get('description') === '' || this.state.startDateValErr !== null || this.state.endDateValErr !== null || this.state.isFileSizeError == true || this.state.startSlotBookedErr !== null || this.state.endSlotBookedErr !== null}
                  style={{ marginRight: "5px" }}
                  onClick={() =>this.onSubmit(false)}>
                  {this.state.scheduleStatus} Schedule
                </button>
                {this.state.scheduleStatus == "Update" &&  !moment().isAfter(this.props?.currentEventObj?.start) && <button type="submit"
                  className="Button--secondary float-right"
                  disabled={currentValues.get('category') === ''|| currentValues.get('newcomment')?.trim().length < 7 || currentValues.get('description') === ''  || this.state.startDate === '' || this.state.endDate === '' || this.state.searchText === '' || currentValues.get('workType') === '' || currentValues.get('description') === '' || this.state.startDateValErr !== null || this.state.endDateValErr !== null || this.state.isFileSizeError == true || this.state.startSlotBookedErr !== null || this.state.endSlotBookedErr !== null}
                  style={{ marginRight: "5px" }}
                  onClick= {() => this.onSubmit(true)}
                  >Cancel Schedule
                  </button>
                    }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }


}

function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(["Users", "entities", "users", loginId], Map())
  let work = state.getIn(["VendorDashboard", loginId, "user_dashboard", "work"], List())
  work = work.toJS()
  let allworkorders = state.getIn(["VendorDashboard", loginId, "allworkorders"], Map())
  allworkorders = allworkorders.toJS()
  let userFullName = state.getIn(["Users", "entities", "users", loginId, "name"], "")
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  let conflictEvents = state.getIn(["VendorDashboard", loginId, "conflictEventsforSite", "conflictEventsforSiteDetails"], Map())
  conflictEvents=conflictEvents?.toJS()?.getConflictEventDetails ? conflictEvents?.toJS()?.getConflictEventDetails?.data : [];
  let configData = config && config.toJS() && config.toJS().configData;
  let allowKirkeFreesEventWO = configData && configData?.find(e => e.ATTRIBUTE_NAME === "ALLOW_KIRKE_FREEZE_EVENTS_WO")?.ATTRIBUTE_VALUE;
  return {
    currentValues: state.getIn(["Forms", formName, "currentValues"], List()),
    isLoading: state.getIn(["VendorDashboard", loginId, 'schedulerequest', 'isloading'], false),
    errorsMessage: state.getIn(["VendorDashboard", loginId, 'schedulerequest', 'errors'], Map()),
    savedMessage: state.getIn(["VendorDashboard", loginId, 'schedulerequest', "success"], Map()),
    loginId,
    eventsDetaisLoading: state.getIn(["VendorDashboard", loginId, "events", "eventsDetaisLoading"], false),
    user,
    userdetails: state.getIn(["Users", "entities", "users", loginId], Map()),
    work,
    allworkorders,
    conflictEvents,
    userFullName,
    config,
    allowKirkeFreesEventWO
  }
}

export default connect(stateToProps, { ...formActions, submitScheduleRequest,getHolidayEvents, updateScheduleRequest, fetchEventDetails, resetProps, ivrEmailNotify, updateWorkorderStatus, fetchWorkOrder, fetchWoByUnidDetails })(VSCreateScheduler)
