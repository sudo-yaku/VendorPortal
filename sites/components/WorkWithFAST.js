import React from 'react'
import { connect } from "react-redux"
import { List, Map } from "immutable"
import * as VendorActions from "../actions"
import Dropzone from 'react-dropzone'
import ListOfFiles from './ListOfFiles'
import RefreshPage from '../images/Reload.png'
import Loader from '../../Layout/components/Loader'
import moment from 'moment'
import MessageBox from '../../Forms/components/MessageBox'
import { createAndDownloadBlobFile } from '../../VendorDashboard/utils'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Locked from '../../sites/images/Locked.svg';
import LockedAux from '../../sites/images/lock-closed_aux.svg';
import LockOpenAux from '../../sites/images/lock-open_aux.svg';
import LockOpen from '../../sites/images/LockOpen.svg';
import HealthCheck from './HealthCheck'
import { uniqBy, sortBy } from 'lodash'
import VPButton from '../../CommonComponents/VPButton'
import { establishSocket } from '../../AppNotification/socket-client'
import NotesAndAttachments from './NotesAndAttachments'
import { logActioninDB } from '../../VendorDashboard/actions'
import MaterialRadioButtonsGroup from './MRadioGroup';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup } from "@material-ui/core"
import { updateUserObjReducer, ivrEmailNotify } from '../../Users/actions'
import { Alert } from '@mui/material'
import { ivrEmailNotification } from '../../Users/schema'
import "../../PreventiveMaintenance/assets/pmstyles.css"
import * as AppNotificationActions from '../../AppNotification/actions'
import { DataGrid } from "@mui/x-data-grid"

export class WorkWithFAST extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      Comments: '',
      timeOut: 300000,
      filesData: [],
      attsMessage: '',
      attsStatus: false,
      notesMessage: '',
      notesStatus: false,
      unlockMessage: '',
      unlockStatus: false,
      lock_unlock_request_id: '',
      submitLockSuccess: false,
      notesLoader: false,
      attsLoader: false,
      refreshPageLoader: false,
      clearTimeOut: false,
      radioCellList: [],
      root_drive: false,
      workPending: false,
      errorMessage: false,
      workPendingMSg: '',
      project_initiative: '',
      requestReason: true,
      requestCheck: this.props.isSnap ? true : false,
      nonServiceImpact: this.props.isSnap ? "" : "No",
      slrMessage: "",
      holidayEventMessage: 'FAST is currently closed. Please contact the NMC by calling the number posted at the site',
      offStartTime: '',
      offEndTime: '',
      timeZone: '',
      checkList: [],
      lockChange: true,
      showHealthCheck: false,
      enodeBSectorInfo: [],
      node_details: [],
      eNodeBOptions: [],
      isAutoSlrEnable: false,
      showWorkTaskNotesSection: false,
      workTaskNotes: "",
      selectedSectorLockUnlock: {},
      showLockUnlockConfirmAlert: false,
      lockedOrUnlockedSectors: [],
      lockedOrUnlockedEnodebs: [],
      lockedOrUnlockedSectorName: "",
      
      // sectorLockPendingMessage: "",
      lockedSectorsReqIds: [],
      
      showSectorLockAction: false,
      sectorLockUnlockTriggered: false,
      wholeSectorLockedByIOP: "",
      retryLogicExecuted: 0,
      retryLogicExecuted2: 0,
      sectorLockRetryCount: 0,
      sectorUnLockRetryCount: 0,
      preCheckCompleted: false,
      autoVpReminder: false,
      messageFastAck: '',
      messageFastAcknowledged: null,
      replacingAnteenaRadio: "",
      isCuttingOver: "",
      getSectorLockDataLoading: false,
      isVendorTrained: "",
      isHoliday: false,
      isOffHours: true,
      offHoursMessage: '',
      businessHoursMessage: "",
      offHoursStartTime: '',
      offHoursEndTime: '',
      offHoursObjResult: {},
      oswAutoReplyMessagesList: [],
      autoReplyMessages: [],
      showRadioUpdateInprogress: false,
      retScanRunning:false,
      mmwNote : null,
      showBanner : true
    }
    
    this.getLockData = this.getLockData.bind(this)
    this.getLockUnlockData = this.getLockUnlockData.bind(this)
  }


  componentDidMount() {
    let { configData, lock_unlock_request_id, user, site, fromRecentActivity, selectedRecentActivity } = this.props
    let autoSLRRefresh = configData && configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "OSW_REFRESH_INTERVAL")
    if (this.props.isSnap) {
      let workORderInfo = this.props.workORderInfo.toJS()
      let pi = workORderInfo && Array.isArray(workORderInfo.project_initiative) ? workORderInfo.project_initiative[0] : workORderInfo.project_initiative.split(',')[0]
      this.setState({ project_initiative: pi })
    }
    if (Object.keys(this.props.enodeBData).length > 0 && !!this.props.enodeBData.radio_cell_list && this.props.enodeBData.radio_cell_list.length > 0) {
      const radioCellList = this.props.enodeBData.radio_cell_list.map(val => ({
        ...val,
        itemSelected: true,
        DrpdwnCell: val.cell_list.length > 0 ? val.cell_list.map(inval => ({ label: inval, value: inval })) : [],
        DrpdwnRadio: val.radio_units.length > 0 ? val.radio_units.map(inval => ({ label: inval, value: inval })) : [],
        currValuesCell: val.cell_list.length > 0 ? val.cell_list.map(inval => ({ label: inval, value: inval })) : [],
        currValuesRadio: val.radio_units.length > 0 ? val.radio_units.map(inval => ({ label: inval, value: inval })) : []
      }))
      this.setState({ radioCellList })
    }
    this.props.getOSWAutoReplyMessagesByUnid(this.props.site_unid).then(result => {
      if(result && result.data && result.data.length > 0) {
        this.setState({ oswAutoReplyMessagesList: result.data }, () => this.getOSWAutoReplyMessage())
      }
    })
    console.log("Current User--", user.toJS())
    if (fromRecentActivity) {
      let group_vendors_list = user?.toJS()?.group_vendors;
      if(user?.toJS()?.vendor_id == selectedRecentActivity?.VENDOR_ID) {
        this.setState({ root_drive: site.get("root_drive"), isAutoSlrEnable: user.get("is_vpauto_enabled") == "Y" ? true : false })
      } else if (user && selectedRecentActivity?.VENDOR_ID && group_vendors_list.length > 0) {
        let vendorObj = group_vendors_list?.find(eachItem => eachItem.vendor_id == selectedRecentActivity.VENDOR_ID)
        this.setState({ root_drive: site.get("root_drive"), isAutoSlrEnable: vendorObj?.is_vpauto_enabled == "Y" ? true : false })
      } else {
        this.setState({ root_drive: site.get("root_drive"), isAutoSlrEnable: false })
      }
    } else {
      this.setState({ root_drive: site.get("root_drive"), isAutoSlrEnable: user.get("is_vpauto_enabled") == "Y" ? true : false })
    }
    let node_details = site.get("node_details") != null ? site.get("node_details").toJS() : [];
    let isErricson = node_details && node_details.length > 0 && node_details[0].vendor.toUpperCase() == "ERICSSON";
    let isSamsung = node_details && node_details.length > 0 && node_details[0].vendor.toUpperCase() == "SAMSUNG";
    let isSamsungErricson = isErricson || isSamsung;
    this.setState({ isErricson, isSamsung, isSamsungErricson })
    // Holiday Event API call
    this.props.getHolidayEvents().then(res => {
      if (res.type === 'FETCH_HOLIDAYEVENTS_FAILURE') {
        this.setState({ isHoliday: false })
      }
      if (res.type === 'FETCH_HOLIDAYEVENTS_SUCCESS') {
        let isHoliday = res.holidayEvents && res.holidayEvents.length > 0 && res.holidayEvents.find(events => {
          return moment.utc(moment.utc().format('YYYY-MM-DD')).diff(moment.utc(moment.utc(events.HOLIDAY_DATE).format('YYYY-MM-DD')), 'days') == 0
        })
        this.setState({ isHoliday: !!isHoliday })
      }
    })

    // Off hours API call
    let subMarket = this.props.submarket ? this.props.submarket : 'ALL'
    this.props.getOffHours(null, subMarket).then(res => {
      if (res.type === 'FETCH_OFFHOURS_FAILURE') {
        this.setState({ isOffHours: true })
      }
      else if (res.type === 'FETCH_OFFHOURS_SUCCESS' && res.offhours.length > 0) {
        let offHoursObjResult = res.offhours.find(site => {
          if (this.props.site.get('switch') && site.NAME.trim().toUpperCase() == this.props.site.get('switch').trim().toUpperCase()) {
            return site
          }
        })
        this.setState({offHoursObjResult})
        if (offHoursObjResult && Object.keys(offHoursObjResult).length !== 0) {
          if (offHoursObjResult.IS_WORK_DAY && offHoursObjResult.IS_WORK_DAY.toUpperCase() == 'Y') {
            this.setState({ IS_WORK_DAY: offHoursObjResult.IS_WORK_DAY, isHoliday: false })
          }

          if (offHoursObjResult.IS_WORK_DAY == null && (offHoursObjResult.EXCEPTION_START_TIME && offHoursObjResult.EXCEPTION_END_TIME)) {
            this.setState({ IS_WORK_DAY: 'Y', isHoliday: false })
          }

          let a = offHoursObjResult.START_TIME;
          if (offHoursObjResult.EXCEPTION_START_TIME) {
            a = offHoursObjResult.EXCEPTION_START_TIME;
          }

          let b = offHoursObjResult.END_TIME;
          if (offHoursObjResult.EXCEPTION_END_TIME) {
            b = offHoursObjResult.EXCEPTION_END_TIME;
          }

          let TimeZoneException = offHoursObjResult.TIMEZONE;
          let liveTime;
          let timeZone;

          if (offHoursObjResult.EXCEPTION_TIMEZONE) {
            if (offHoursObjResult.EXCEPTION_TIMEZONE.toUpperCase() == 'CST') {
              TimeZoneException = 'Central'
            } else if (offHoursObjResult.EXCEPTION_TIMEZONE.toUpperCase() == 'EST') {
              TimeZoneException = 'Eastern'
            } else if (offHoursObjResult.EXCEPTION_TIMEZONE.toUpperCase() == 'MST') {
              TimeZoneException = 'Mountain'
            } else if (offHoursObjResult.EXCEPTION_TIMEZONE.toUpperCase() == 'PST') {
              TimeZoneException = 'Pacific'
            } else {
              TimeZoneException = 'Central'
            }
          }

          if (TimeZoneException == 'Central') {
            liveTime = moment.tz(moment(), 'America/Chicago').format('h:mma')
            timeZone = 'CST'
          } else if (TimeZoneException == 'Eastern') {
            liveTime = moment.tz(moment(), 'America/New_York').format('h:mma')
            timeZone = 'EST'
          } else if (TimeZoneException == 'Mountain') {
            liveTime = moment.tz(moment(), 'America/Denver').format('h:mma')
            timeZone = 'MST'
          } else if (TimeZoneException == 'Pacific') {
            liveTime = moment.tz(moment(), 'America/Los_Angeles').format('h:mma')
            timeZone = 'PST'
          } else {
            liveTime = moment.tz(moment(), 'America/Chicago').format('h:mma')
            timeZone = 'CST'
          }
          let startTime = moment(a, 'h:mma');
          let endTime = moment(b, 'h:mma');
          let momentCurrentTime = moment(liveTime, 'h:mma');
          let offHoursValue = momentCurrentTime.isBetween(startTime, endTime);

          let message = `FAST is currently closed. Operating hours: ${a} to ${b} (${timeZone})`;
          let businessHoursMessage = `(FAST support hours are ${a} to ${b} ${timeZone})`
          this.setState({ isOffHours: offHoursValue, offHoursMessage: message, businessHoursMessage, timeZone: offHoursObjResult.TIMEZONE, offHoursStartTime: startTime, offHoursEndTime: endTime })
        }
        else {
          this.setState({ isOffHours: true })
        }
      }
      else {
        this.setState({ isOffHours: true })
      }
    })
    this.getLockData()
    this.fetchSectorInfoData()
    let intervalTime = 60000;
    if (autoSLRRefresh && Object.keys(autoSLRRefresh).length > 0 && autoSLRRefresh.ATTRIBUTE_VALUE) {
      intervalTime = autoSLRRefresh.ATTRIBUTE_VALUE
    }
    if (lock_unlock_request_id) {
      this.timerLockData = setInterval(() => {
        this.setState({ showLockUnlockConfirmAlert: false , showBanner : false})
        this.getLockData()
        this.fetchSectorInfoData()
        if(this.state.isSamsung && ["YES", "NOT SURE"].includes(this.props.replace_antenna_work) && this.props.sectorLockData?.length > 0 && this.props.sectorLockData[0].ACTION.toLowerCase() == "un lock" && this.props.lockData?.lockRequest?.request_detail?.stay_as_auto != "Y") {
         this.getSamsungRadioUpdateDetails(this.props.lock_unlock_request_id)
        }
      }, intervalTime)
    }
    this.setState({replacingAnteenaRadio: ""})
  }
  async componentDidUpdate(prevProps) {
    let { SectorInfoLoading, sectorInfoData, sectorInfoDataError, slrStatus, appNotification, workORderInfo, oswRequestId } = this.props;
    if (prevProps.SectorInfoLoading && prevProps.SectorInfoLoading !== SectorInfoLoading) {
      if (sectorInfoData.length > 0) {
        this.processEnodeBData()
      } else {
        if (sectorInfoDataError && sectorInfoDataError === "No sectors available") {
          this.setState({ enodeBSectorInfo: [] })
        }
        if (slrStatus === "AUTO" && sectorInfoDataError && sectorInfoDataError === "No sectors available") {
          let text = `VP: AUTO to NEW: unable to retrieve sector info due to backend timeout, please work with FAST`
          await this.updateSLRStatus("NEW", text, "VP Error")
        }
      }
    }
    if(appNotification?.notificaionReceived && appNotification?.notificaionProject == workORderInfo.get('workorder_id') && oswRequestId) {
      if(appNotification?.notificationDisplayed) {
        this.refreshSectorInfoTable();
        this.props.updateAppNotification({
          ...appNotification,
          notificationDisplayed: false
        }) 
      }
    }
    if(prevProps.refreshEnable != this.props.refreshEnable){
      this.refreshSectorInfoTable()
    }
  }
  componentWillUnmount() {
    clearInterval(this.interval)
    clearInterval(this.timerLockData)
  }
  getOSWAutoReplyMessage() {
    let messages = this.state.oswAutoReplyMessagesList;
    let daysOfWeek = ['SU', 'M', 'T', 'W', 'TH', 'F', 'S'];
    let day = daysOfWeek[moment().day()];
    if(messages.length > 0) {
      let filteredMessages = messages.filter(message => {
        const time = moment().utc()
        const startTime = moment().utc().hours(message.START_TIME.split(":")[0]).minutes(message.START_TIME.split(":")[1])
        const endTime = moment().utc().hours(message.END_TIME.split(":")[0]).minutes(message.END_TIME.split(":")[1])
        if (time.isBetween(startTime, endTime) && ((message.IS_SCHEDULED === '0' && moment(message.NOTIF_DATE).isSame(moment().utc().format("YYYY-MM-DD"))) || (message.IS_SCHEDULED === '1' && message.NOTIF_DATE.split(',').includes(day)))) {
          return message;
        }
      })
      // let scheduleAr = filteredMessages.find(msg => msg.IS_SCHEDULED === '0')
      // let autoReplyMessageObj = scheduleAr && Object.keys(scheduleAr).length > 0 ? scheduleAr : filteredMessages[0];
      // this.setState({ autoReplyMessage: autoReplyMessageObj && Object.keys(autoReplyMessageObj).length > 0 ? autoReplyMessageObj.MESSAGE : ""})
        this.setState({autoReplyMessages: filteredMessages})
    }
  }
  async fetchSectorInfoData() {
    let { loginId, site_unid, site, lockData } = this.props;
    let node_details = site.get("node_details") !== null ? site.get("node_details").toJS() : []
    let eNodeBOptions = node_details.filter(item => ["4G", "C-BAND", "CBRS", "5G", "5GMMW"].includes(item.type.toUpperCase()))
    if (eNodeBOptions && eNodeBOptions.length > 0) {
      let eNodes = [];
      eNodeBOptions.map(item => eNodes.push(item.node))
      eNodes = eNodes.filter(item => item.indexOf('FSU') != 0)
      if(eNodes.length > 0) {
        await this.props.getSectorInfo(loginId, eNodes.toString(), site_unid)
      }
    } else {
      // VP: AUTO to NEW because the site does not have nodes
      // let slrStatus = !!lockData && !!lockData.lockRequest && !!lockData.lockRequest.request_detail ? lockData.lockRequest.request_detail.display_status : ""
      if (this.props.slrStatus == "AUTO") {
        let text = `VP: AUTO to NEW, the nodes are not available for this site. Please work with FAST`
        await this.updateSLRStatus("NEW", text, "VP Error")
        return;
      }
    }
  }
  findPrelockedSectors() {
    //whole sector is already completely locked
    let { sectorInfoData } = this.props;
    let bydefaultLocked = []
    if (sectorInfoData && sectorInfoData.length > 0) {
      let lockedObjs = sectorInfoData.filter(item => item.lock_status.toUpperCase() == 'LOCKED')
      console.log("lockedObjs--", lockedObjs)
      if (lockedObjs && lockedObjs.length > 0) {
        let sectorsLockedByDefault = []
        lockedObjs.forEach(item => {
          let sectorNameList = item.sector.split("_");
          let sectorName = sectorNameList[sectorNameList.length - 2];
          if (sectorName && !sectorsLockedByDefault.includes(sectorName)) {
            sectorsLockedByDefault.push(sectorName)
          }
        })
        if (lockedObjs && lockedObjs.length > 0 && sectorsLockedByDefault.length > 0) {
          sectorsLockedByDefault.forEach(item => {
            let groupedBysectorList = [];
            sectorInfoData.forEach(value => {
              let sectorNameList = value.sector.split("_");
              let sectorName = sectorNameList[sectorNameList.length - 2];
              if (value.sector && sectorName && sectorName == item) {
                groupedBysectorList.push(value)
              }
            })
            if (groupedBysectorList.every(item => item.lock_status.toUpperCase() == "LOCKED")) {
              bydefaultLocked.push(item.toUpperCase())
            }
          })
        }
      }
    }
    return bydefaultLocked;
  }


  refreshSectorInfoTable = () => {
    this.setState({ showLockUnlockConfirmAlert: false, enodeBSectorInfo: [] })
    this.fetchSectorInfoData()
    this.getLockData()
    this.props.siteAccessRefreshDisable()
  }

  processEnodeBData() {
    let { sectorInfoData, lockData } = this.props;
    let eNodeBOptions = [];
    let node_details = this.props.site.get("node_details") !== null ? this.props.site.get("node_details").toJS() : []
    eNodeBOptions = node_details.filter(item => ["4G", "C-BAND", "CBRS", "5G", "5GMMW"].includes(item.type.toUpperCase()))
    if (sectorInfoData.length > 0) {
      let uniqueSectorInfo = [];
      // let slrStatus = !!lockData && !!lockData.lockRequest && !!lockData.lockRequest.request_detail ? lockData.lockRequest.request_detail.display_status : ""
      if (this.props.slrStatus != 'HAND OFF' && !!lockData && !!lockData.lockRequest && !!lockData.lockRequest.sectorlockdata && lockData.lockRequest.sectorlockdata.length > 0) {
        let lockUnlockSectorInprogress = Object.keys(lockData.lockRequest).length > 0 && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata.find(obj => ["NEW", "IN PROGRESS"].includes(obj.ACTION_STATUS.toUpperCase())) : {}
        uniqueSectorInfo = sectorInfoData.map(item => {
          let lockCompleted = Object.keys(lockData.lockRequest).length > 0 && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata.find(obj => obj.ACTION == "LOCK" && obj.ACTION_STATUS.toUpperCase() == "COMPLETED" && obj.SECTOR == item.sector) : {}
          return {
            ...item,
            lock_status: item.lock_status,
            sectorLockTriggered: (lockUnlockSectorInprogress && Object.keys(lockUnlockSectorInprogress).length > 0 || lockCompleted && Object.keys(lockCompleted).length > 0) ? true : false,
            reqId: lockCompleted && Object.keys(lockCompleted).length > 0 ? lockCompleted.LOCK_UNLOCK_ACTION_REQ_ID : ""
          }
        })
      } else {
        uniqueSectorInfo = sectorInfoData.map(item => Object.assign({ ...item, sectorLockTriggered: false }))
      }
      //Adding Nodetype from the site details rewponse
      uniqueSectorInfo = uniqueSectorInfo.map(item => {
        let obj = eNodeBOptions.find(item1 => item.enodeb_id == item1.node)
        return { ...item, node_type: obj && Object.keys(obj).length > 0 ? obj.type : "" }
      })
      this.setState({ enodeBSectorInfo: uniqueSectorInfo })
      this.validateSectorInfoResponse(uniqueSectorInfo)
      // Disable the sector lock unlock while Health check is running
      let healthCheckDetails = this.props.getHealthCheckReqs ? this.props.getHealthCheckReqs.toJS() : {}
      let hcResult = healthCheckDetails && Object.keys(healthCheckDetails).length > 0 && healthCheckDetails.enodeb_healthcheck && healthCheckDetails.enodeb_healthcheck.length > 0 ? healthCheckDetails.enodeb_healthcheck.filter(item => ["in progress", "new"].includes(item.status.toLowerCase())) : []
      if (hcResult && hcResult.length > 0 && this.props.slrStatus == "AUTO") {
        this.disableSectorlockActions(true)
      }
    }
  }
  async validateSectorInfoResponse(uniqueSectorInfo) {
    let eNodes = [];
    let eNodeBOptions = [];
    let node_details = this.props.site.get("node_details") !== null ? this.props.site.get("node_details").toJS() : []
    eNodeBOptions = node_details.filter(item => ["4G", "C-BAND", "CBRS", "5G", "5GMMW"].includes(item.type.toUpperCase()))
    eNodeBOptions.map(item => eNodes.push(item.node))
    eNodes = eNodes.filter(item => item.indexOf('FSU') != 0)
    let uniqueNodebInfo = uniqBy(uniqueSectorInfo, "enodeb_id");
    // let slrStatus = !!lockData && !!lockData.lockRequest && !!lockData.lockRequest.request_detail ? lockData.lockRequest.request_detail.display_status : ""
    // logic to check if sector info response has data for all the enodeb's from site
    let availbleEnods = uniqueNodebInfo.map(item => item.enodeb_id);
    let failedNodes = eNodes.filter(item => !availbleEnods.includes(item))
    if (failedNodes.length > 0 && this.props.slrStatus == "AUTO") {
      console.log("Failed to retrive sector info for--", failedNodes.toString())
      let text = `VP: AUTO to NEW, Unable to retrieve the sectors for ${failedNodes.toString()}, Please work with FAST`
      await this.updateSLRStatus("NEW", text, "VP Error")
      return;
    }
    // Changing OSW status to NEW if any lock status is empty
    let emptyLockStatusSectors = []
    uniqueSectorInfo.forEach(item => {
      if (item && item.lock_status !== null && item.lock_status.length == 0 && item.sector.split("_")[0] == item.enodeb_id) {
        emptyLockStatusSectors.push(item.sector)
      }
    })
    if (emptyLockStatusSectors.length > 0 && this.props.slrStatus == "AUTO") {
      let text = `VP: AUTO to NEW, Unable to retrieve sector lock status for ${emptyLockStatusSectors.toString()}, Please work with FAST`
      await this.updateSLRStatus("NEW", text, "VP Error")
      return;
    }
  }
  renderLoading() {
    return (
      <Loader color="#cd040b"
        size={this.state.attsLoader || this.state.notesLoader ? '20px' : '40px'}
        margin="3px"
        className="text-center" />
    )
  }
  async getLockUnlockData() {
    const { loginId, vendorId, fetchLockData, workORderInfo, lock_unlock_request_id } = this.props
    await this.setState({ refreshPageLoader: true })
    await fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), lock_unlock_request_id)
      .then(async action => {
        if (action.type == "FETCH_LOCKDATA_SUCCESS") {
          let lockData = action.lockReqData;
          await this.validateSectoLockUnlock(lockData)
         
          await this.showSectorLockAction()
        }
      })
    await this.setState({ refreshPageLoader: false, holidayEventMessage: 'FAST is currently closed. Please contact the NMC by calling the number posted at the site' })
  }
  validateSectoLockUnlock = async (lockData) => {
    if (lockData?.lockRequest?.sectorlockdata?.length > 0) {
      this.setState({ submitLockSuccess: true })
      let sectorLockUnlockFailedObjs = Object.keys(lockData?.lockRequest).length > 0 && lockData?.lockRequest?.sectorlockdata?.length > 0 ? lockData?.lockRequest?.sectorlockdata.find(item => item?.SECTOR_LOCK_UNLOCK_REQ_ID == this.props.lock_unlock_request_id && ["COMPLETED WITH ERRORS", "ERRORS", "FAILED"].includes(item?.ACTION_STATUS?.toUpperCase())) : {}
      let oswStatus = lockData?.lockRequest?.request_detail?.display_status?.toUpperCase();
      // Drop auto slr status to NEW if lock or unlock failed
      if (sectorLockUnlockFailedObjs && Object.keys(sectorLockUnlockFailedObjs).length > 0 && oswStatus == "AUTO") {
        let text = `Sector ${sectorLockUnlockFailedObjs?.ACTION} for ${sectorLockUnlockFailedObjs?.ENODEB_ID} on ${sectorLockUnlockFailedObjs?.SECTOR}, request ID: ${sectorLockUnlockFailedObjs?.LOCK_UNLOCK_ACTION_SEQ_ID}, ${sectorLockUnlockFailedObjs?.ACTION_STATUS}`
        // await this.updateSLRStatus("NEW", text)
        if(sectorLockUnlockFailedObjs?.ACTION?.toLowerCase() === 'lock') {
          await this.updateSLRStatus("NEW", text, 'Failed Lock')
        }else if(sectorLockUnlockFailedObjs?.ACTION?.toLowerCase() === 'unlock') {
          await this.updateSLRStatus("NEW", text, 'Failed Unlock')
        }
      }
      // Post HC failed count
      if (lockData?.lockRequest?.postCheckCount >= 5 && oswStatus == "AUTO" && this.props.lockData?.lockRequest?.request_detail?.stay_as_auto != "Y") {
        let text = `Post check failed for 5 times, On Site Work needs FAST help`
        await this.updateSLRStatus("NEW", text, "Failed PostCheck")
      }
      // Refresh the Sector Info table if Lock Unlock status completed
      let sectorLockUnlockCompletedObjs = Object.keys(lockData?.lockRequest).length > 0 && lockData?.lockRequest?.sectorlockdata?.length > 0 ? lockData?.lockRequest?.sectorlockdata.find(item => item?.SECTOR_LOCK_UNLOCK_REQ_ID == this.props.lock_unlock_request_id && ["COMPLETED"].includes(item?.ACTION_STATUS?.toUpperCase())) : {}
      if (sectorLockUnlockCompletedObjs && Object.keys(sectorLockUnlockCompletedObjs).length > 0 && oswStatus == "AUTO") {
        this.fetchSectorInfoData()
      }
    }
  }
  async getLockData() {
    const { loginId, vendorId, fetchLockData, workORderInfo, lock_unlock_request_id, fetchSectorLockData, site_unid } = this.props
    if(this.props.lock_unlock_request_id) {
      await fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), lock_unlock_request_id)
      .then(async action => {
        if (action.type == "FETCH_LOCKDATA_SUCCESS") {
          if (this.state.isErricson && (action?.lockReqData?.lockRequest?.replace_antenna_work?.toUpperCase() == 'YES' || action?.lockReqData?.lockRequest?.replace_antenna_work?.toUpperCase() == 'NOT SURE')) {
            this.setState({ checkList: [{ value: "RET(s)/Antenna(s)", checked: false },  { value: "CBRS(s)", checked: false }, { value: "None", checked: false }] });
          } else if (this.state.isSamsung && (action?.lockReqData?.lockRequest?.replace_antenna_work?.toUpperCase() == 'YES' || action?.lockReqData?.lockRequest?.replace_antenna_work?.toUpperCase() == 'NOT SURE')) {
            this.setState({ checkList: [ { value: "4G LTE", checked: false },{ value: "Cband/LS6", checked: false }, { value: "RET(s)/Antenna(s)", checked: false }, { value: "CBRS(s)", checked: false },
               { value: "5G MMW", checked: false }, { value: "None", checked: false }] });
          }
          if(this.state.isSamsung && ["YES", "NOT SURE"].includes(action?.lockReqData?.lockRequest?.replace_antenna_work?.toUpperCase()) && action?.lockReqData?.lockRequest?.request_detail.status === "AUTO" && action?.lockReqData?.lockRequest?.sectorlockdata?.length > 0 && action?.lockReqData?.lockRequest?.sectorlockdata[0]?.ACTION.toLowerCase() == "un lock" && this.props.lockData?.lockRequest?.request_detail?.stay_as_auto != "Y") {
           this.getSamsungRadioUpdateDetails(action?.lockReqData?.lockRequest?.request_detail.lock_unlock_request_id)
          }
          if (this.props.enableRetflag ==='Y' && (this.state.isSamsung || this.state.isErricson) && ["YES", "NOT SURE"].includes(action?.lockReqData?.lockRequest?.replace_antenna_work?.toUpperCase()) && action?.lockReqData?.lockRequest?.request_detail.status === "AUTO" && this.props.lockData?.lockRequest?.request_detail?.stay_as_auto != "Y") {
            this.getRETScanDetails(action?.lockReqData?.lockRequest?.request_detail.lock_unlock_request_id)
          } else if (this.state.retScanRunning) {
            this.setState({ retScanRunning: false })
          }
          this.setState({ messageFastAcknowledged: action.lockReqData.lockRequest.isReminderAcknowledged })
          let lockData = action.lockReqData;
          await this.validateSectoLockUnlock(lockData)
          // Enable Post health check after the sector unlock success
          await this.showSectorLockAction()
        }
      })
    }
    this.setState({ getSectorLockDataLoading: true })
    await fetchSectorLockData(vendorId, loginId, site_unid).then(action => {
      let statusArr = ["HAND_OFF", "CANCELLED", "COMPLETED"]
      let workPendingStatus = ['NEW', 'IN_PROGRESS', 'PAUSED']
      if (action.type == "FETCH_SECTORLOCKDATA_SUCCESS") {
        const siteData = action?.sectorLockData?.getSectorLockData?.siteData?.filter(v => this.props.isSnap ? v.SECTOR_REQUEST_TYPE != "Breakfix" : v.SECTOR_REQUEST_TYPE == "Breakfix")
        if (siteData.filter(v => v.WORK_ORDER_ID != workORderInfo.get('workorder_id')).length == 0 || siteData.filter(v => (v.WORK_ORDER_ID != workORderInfo.get('workorder_id') && (workPendingStatus.includes(v.REQUEST_STATUS))) || (v.WORK_ORDER_ID != workORderInfo.get('workorder_id') && (v.REQUEST_STATUS === 'HAND_OFF' && moment(v.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')))).length == 0) {
          let condition1 = siteData.filter(val => val.WORK_ORDER_ID == workORderInfo.get('workorder_id') && ((!statusArr.includes(val.REQUEST_STATUS)) || (val.REQUEST_STATUS === 'HAND_OFF' && moment.utc(val.CREATED_DATE).format('YYYY-MM-DD') == moment.utc().format('YYYY-MM-DD')))).length === 0
          let condtion2 = (!this.props.lockData || !this.props.lockData.lockRequest || (this.props.lockData.lockRequest.request_detail.status == 'COMPLETED' || this.props.lockData.lockRequest.request_detail.status == 'CANCELLED'))
          // if the status is HAND_OFF for a workorder, will call the api to update the reason
          if(siteData.filter(val => val.WORK_ORDER_ID == workORderInfo.get('workorder_id') && ((val.REQUEST_STATUS === 'HAND_OFF' && moment.utc(val.CREATED_DATE).format('YYYY-MM-DD') == moment.utc().format('YYYY-MM-DD')))).length !== 0) {            
            this.triggerManualOSWReason("Handoff EOD",lock_unlock_request_id)
          }
          if (!!siteData && (condition1 || condtion2)) {
            this.setState({ submitLockSuccess: false, getSectorLockDataLoading: false })
          } else {
            this.setState({ submitLockSuccess: true, getSectorLockDataLoading: false })
          }
        } else {
          this.setState({ submitLockSuccess: false, getSectorLockDataLoading: false, workPending: true, workPendingMSg: 'There is a On Site Work request already pending on this site, please call FAST to proceed further.' })
        }
        // if(this.props.isSnap && siteData.length > 0 && siteData.filter(val => ( val.WORK_ORDER_ID == workORderInfo.get('workorder_id') && val.VENDOR_MDG_ID != this.props.user.get('vendor_mdg_id'))).length > 0) {
        //   this.setState({ submitLockSuccess: false, getSectorLockDataLoading: false, workPending: true, workPendingMSg: 'There is a On Site Work request already pending on this site, please call FAST to proceed further.' })
        // }
      }
      if(!this.props.isSnap && this.state.isErricson && this.props.opexVendors ){
       if(!this.props.lock_unlock_request_id){
        if(!this.state.isHoliday && this.state.isOffHours){
        this.handleOSWCreateReq()
       }
       }else{
        this.setState({submitLockSuccess: true})
       }
      }
    })
  }

  getSamsungRadioUpdateDetails(osw_request_id) {
    this.props.getSamsungRadioUpdateDetails(osw_request_id).then(async response => {
      if(response?.data.length) {
        let error = "";
        let status = response.data[0].STATUS;
        if(status.indexOf("Failed") === 0) {
          if(status == 'Failed') {
            error = "Radio SN update automation has failed. Please review."
          } else if (status == 'Failed w/Errors') {
            error = "Radio SN update automation has failed. Please review."
          } else if (status == 'Failed w/No SN Change') {
            error = "Radio swap completed but no new radio SN was detected. Please review."
          } else if (status == 'Failed w/New radio FW Mismatch') {
            error = "New radio SN updated but it has a FW mismatch. Please review."
          } else if(status == 'Failed w/CBRS Replacement') {
            error = "A CBRS radio has been replaced and SN updated. Please review and update accordingly."
          } else if(status == 'Failed w/SN Change') {
            error = "Radio swap completed but no new radio SN was detected. Please review."
          }
          let text = `VP: AUTO to NEW: ${error}`
          await this.updateSLRStatus("NEW", text, "HW Replacement")
        }              
        if(status == 'In Progress') {
            this.setState({showRadioUpdateInprogress: true})
        }else{
          this.setState({showRadioUpdateInprogress: false})
        }
      }
    })
  }
  trggerUpdateSamsungSN = () => {
    const { site_unid, lock_unlock_request_id, user } = this.props;
    const groupedNodes = this.getNodesForUpdateSamsungSN();
    const getMatchingSectors = (nodes) => {
      const { lockedOrUnlockedSectorName, enodeBSectorInfo } = this.state;
      if (!lockedOrUnlockedSectorName) return [];
      const sectorNameLower = lockedOrUnlockedSectorName.toLowerCase();
      const nodeIds = Array.isArray(nodes) ? nodes : [nodes];
      return enodeBSectorInfo
        .filter(item => item && nodeIds.includes(item.enodeb_id) && item.sector.toLowerCase().includes(`_${sectorNameLower}_`))
        .map(item => item.sector);
    };

    const input = (nodes) => {
      const sectorsArr = getMatchingSectors(nodes);
      return {
        node_id: nodes,
        source: "VP",
        osw_id: lock_unlock_request_id,
        notes: "Replaced radio, updating SN",
        created_by: user.get("fname") + ' ' + user.get("lname"),
        sector: sectorsArr.length ? sectorsArr.join(',') : ''
      };
    };
   groupedNodes.forEach(group => {
        this.props.trggerUpdateSamsungSN(site_unid, input(group)).then(async resp => {
          if (this.props.lockData?.lockRequest?.request_detail?.stay_as_auto == "Y") {
            this.props.updateStayAutoFlag(this.props.oswRequestId).then(response =>{
              if(response?.data?.data?.updateStayAutoFlag) {
                this.props.notifref.addNotification({
                  title: 'Success',
                  position: "br",
                  level: "success",
                  autoDismiss: 10,
                  message: response?.data?.data?.updateStayAutoFlag?.message
                })
              }
              if(response?.errors?.length > 0) {
                this.props.notifref.addNotification({
                  title: 'Failure',
                  position: "br",
                  level: "error",
                  autoDismiss: 10,
                  message: "StayAuto Update Failed"
                })
              }
            })
          }
          if (resp?.errors?.length > 0) {
            this.props.notifref.addNotification({
              title: resp?.errors?.[0]?.title,
              position: "br",
              level: 'error',
              autoDismiss: 15,
              message: resp?.errors?.[0]?.detail
            })
            let errorNote = "";
            if (resp?.errors?.[0]?.detail == "Failed w/active radio SN update running") {
              errorNote = "An active Radio SN update is currently running, Please review"
            } else {
              errorNote = resp?.errors?.[0]?.detail
            }
            if(this.props.slrStatus === "AUTO") {
              let text = `VP: AUTO to NEW: ${errorNote}`
              await this.updateSLRStatus("NEW", text, "HW Replacement")
            }
          }else if(resp?.errors?.detail){
            if(this.props.slrStatus === "AUTO") {
              let nodeIds = Array.isArray(group) ? group.join(',') : group;
              let text = `VP: AUTO to NEW: Failed to trigger SN update for nodes ${nodeIds}`
              await this.updateSLRStatus("NEW", text, "HW Replacement")
            }
          } else {
            if (this.props.lockData?.lockRequest?.request_detail?.stay_as_auto != "Y") {
              this.setState({showRadioUpdateInprogress: true})
              setTimeout(() => {
                this.getSamsungRadioUpdateDetails(lock_unlock_request_id)
              }, 130000);
            }
          }
        })
      
    });
  }
  getNodesForUpdateSamsungSN = () => {
    let { site, radioUpdateNodeDetailsFilter } = this.props;
    let list = [];
    this.state.checkList.filter(item => {
      if (item.checked) { list.push(item.value) }
    })
    let node_details = site.get("node_details") !== null ? site.get("node_details").toJS() : []
    let node_ids = []
    let nodes4GLS3 =[]
    let nodeDetailsFilters = radioUpdateNodeDetailsFilter.map(type => type === "LS3" ? "2" : type === "LS6" ? "3" : type)
    if(list.includes('4G LTE')){
    nodeDetailsFilters.filter(type => {
      let nodes = node_details.filter(item => item.vendor.toUpperCase() == "SAMSUNG" && (item.commandList.toUpperCase() === "VLTE" && item?.node[7] === "2")).map(item => item.node)
      node_ids.push(...nodes)
      let nodes4gls3 = node_details.filter(item => item.vendor.toUpperCase() == "SAMSUNG" && (type === item.type.toUpperCase() || (item.node.length == 11 && item.node.substring(item.node.length - 4, item.node.length - 3) == type))).map(item => item.node)
        if(nodes4gls3.length){
            nodes4GLS3.push(...nodes4gls3)
            node_ids.push(nodes4GLS3)}
    })
    }
   if(list.includes('Cband/LS6')){
       let nodes = node_details.filter(item => item.vendor.toUpperCase() == "SAMSUNG" && ((item.commandList.toUpperCase() === "VLTE" && item?.node[7] === "3")|| (item.node.length == 11 && item.node.substring(item.node.length - 4, item.node.length - 3) == "3"))).map(item => item.node)
       node_ids.push(...nodes)
     }
    return uniqBy(node_ids);
  }
  formLockReq = () => {
    const { loginId, user, site_unid, workORderInfo, site } = this.props
    let vendorOpex = this.state.isErricson && this.props.opexVendors && !this.props.isSnap
    let { project_initiative,enodeBSectorInfo } = this.state
    let nodes4G = []
    let nodes5G = []
    let node_details = this.props.site.get("node_details") !== null ? this.props.site.get("node_details").toJS() : []
    nodes4G = node_details.filter(item => ["4G", "C-BAND", "CBRS"].includes(item.type.toUpperCase()))
    nodes5G = node_details.filter(item => ["5G", "5GMMW"].includes(item.type.toUpperCase()))
    nodes5G = nodes5G.filter(item => item?.node?.indexOf('FSU') != 0)
    let nokiaNodeobj = node_details.filter(item => item.vendor.toUpperCase() == "NOKIA");
    let addOSWStatus = "AUTO";
    let category = null;
    let preLockedSector = this.findPrelockedSectors()
    let bird_nest_activity = this.props.site.get('bird_nest_activity') ? site.get('bird_nest_activity').toJS() : null
    if (this.state.isAutoSlrEnable) {
      if (this.state.nonServiceImpact.toUpperCase() == "NO") {
        if ((node_details.length == 0 || nodes4G.length >= 5 || nodes5G.length >= 5 || preLockedSector.length > 0 || this.props.site.get("root_drive")) || this.state.isCuttingOver == "Yes" ) {
          addOSWStatus = "NEW"
          category = "VHLP"
        }
      }

      let mmwNodes = nodes5G.filter(i => i.vendor.toUpperCase() === "SAMSUNG" && i?.type?.toUpperCase() === '5G' && i.node.length == 11 && !["2","3"].includes(i.node[i.node.length-4]))
      let sectors4G =[]
      let sectors5G =[]
      if(node_details.length !== mmwNodes.length){
        enodeBSectorInfo.map(sector => {
        nodes4G.map(n =>  sector.enodeb_id === n.node && sector.sector !=="NA" && sectors4G.push(sector))
        mmwNodes.map(n =>  sector.enodeb_id === n.node && sector.sector !=="NA" && sectors5G.push(sector))
      })
      }
      if ((nokiaNodeobj.length > 0 && this.state.nonServiceImpact.toUpperCase() == "NO") || this.state.isVendorTrained == "No" || bird_nest_activity?.bird_restriction == "yes" || this.props.site.get("is_donor") || this.props.site.get("osw_freeze") ) {
        addOSWStatus = "NEW"
        category = "VHLP"
      }
      if(node_details.length === mmwNodes.length || (mmwNodes.length && sectors4G.length >0 && sectors4G.length !== 3) || (mmwNodes.length && sectors5G.length > 0 && sectors5G.length !== 3) ){
        addOSWStatus = "NEW"
        category = "VHLP"
        this.setState({mmwNote : 'The site has MMW nodes. Please verify sector numbering before putting back to AUTO and allow lock automation.'})
      }
    } else {
      addOSWStatus = "NEW"
    }
    return {
      "type": this.props.isSnap ? ['C-BAND', 'SNAP'].includes(project_initiative) ? `${project_initiative} Project` : `Project` : vendorOpex ? "Breakfix-Ericsson Opex" :  "Breakfix",
      "site_type": site.toJS().sitetype,
      "site_name": site.toJS().sitename,
      "market": site.toJS().area ? site.toJS().area : '',
      "submarket": site.toJS().region ? site.toJS().region : '',
      "source": "VP",
      "status": vendorOpex ? "NEW" : addOSWStatus,
      "gc_info": {
        "gc_tech_id": "",
        "gc_user_id": loginId,
        "name": user.get("fname") + ' ' + user.get("lname"),
        "company": user.get('vendor_name') !== null ? user.get('vendor_name') : '',
        "phone": user.get("phone"),
        "email": user.get("email")
      },
      "site_unid": site_unid ? site_unid : '',
      "switch_unid": "",
      "description": vendorOpex ? "Ericsson OPEX Program Work" : user.get('vendor_name') + ' On Site Work for ' + workORderInfo.get('workorder_id') + ':' + this.state.slrMessage,
      "lock_params": this.getLockParams(),
      "non_service_impacting": vendorOpex ? "No" : this.state.nonServiceImpact,
      "notify_email_address": [],
      "include_work_info": "1",
      "work_info": {
        "work_type": this.props.isSnap ? `Project` : workORderInfo.get('work_type') ? workORderInfo.get('work_type') : '',
        "work_id": workORderInfo.get('workorder_id') ? workORderInfo.get('workorder_id') : '',
        "work_info": this.props.isSnap ? workORderInfo.get('project_name') ? workORderInfo.get('project_name') : `${project_initiative} unlock request for ${workORderInfo.get('sitename')}, project number: ${workORderInfo.get('workorder_id')}` : workORderInfo.get('work_scope'),
      },
      "requested_by": user.get("fname") + ' ' + user.get("lname"),
      "vendor_id": user.get("vendor_id"),
      "category": vendorOpex ? "VMSG" : category,
      "replace_antenna_work": vendorOpex ? "No" : (this.props.isSnap &&  this.state.isCuttingOver == "Yes"  ? this.state.isCuttingOver : this.state.replacingAnteenaRadio),
      "is_vendor_trained": this.state.isVendorTrained,
      "opscalender_eventid": this.props.opscalender_eventid,
      "kirke_id": this.props.kirke_id,
      "event_start_date": this.props.event_start_date,
      "event_end_date": this.props.event_end_date,
      "vendor_mdg_id": user.get('vendor_mdg_id')
    }
  }
  getLockParams = () => {
    if (this.state.radioCellList.length > 0) {
      return this.state.radioCellList.map(inval => {
        return {
          "enodeb": inval.enodeb_id ? inval.enodeb_id : '',
          "radio": [],
          "lncell": [],
          "vendor": inval.vendor ? inval.vendor : '',
        }
      })
    } else {
      return []
    }
  }


  async handleOSWCreateReq() {
    const { vendorId, loginId, workORderInfo, submitLockRequest, user, site_unid, submitNotes, userList, fetchLockData, site } = this.props
    //Logic to validate the off hours time before user create OSW
    const { offHoursObjResult } = this.state;
    let bird_nest_activity = this.props.site.get('bird_nest_activity') ? site.get('bird_nest_activity').toJS() : null
    if (offHoursObjResult && Object.keys(offHoursObjResult).length !== 0) {
      if (offHoursObjResult.IS_WORK_DAY && offHoursObjResult.IS_WORK_DAY.toUpperCase() == 'Y') {
        this.setState({ IS_WORK_DAY: offHoursObjResult.IS_WORK_DAY, isHoliday: false })
      }

      if (offHoursObjResult.IS_WORK_DAY == null && (offHoursObjResult.EXCEPTION_START_TIME && offHoursObjResult.EXCEPTION_END_TIME)) {
        this.setState({ IS_WORK_DAY: 'Y', isHoliday: false })
      }

      let a = offHoursObjResult.START_TIME;
      if (offHoursObjResult.EXCEPTION_START_TIME) {
        a = offHoursObjResult.EXCEPTION_START_TIME;
      }

      let b = offHoursObjResult.END_TIME;
      if (offHoursObjResult.EXCEPTION_END_TIME) {
        b = offHoursObjResult.EXCEPTION_END_TIME;
      }

      let TimeZoneException = offHoursObjResult.TIMEZONE;
      let liveTime;
      let timeZone;

      if (offHoursObjResult.EXCEPTION_TIMEZONE) {
        if (offHoursObjResult.EXCEPTION_TIMEZONE.toUpperCase() == 'CST') {
          TimeZoneException = 'Central'
        } else if (offHoursObjResult.EXCEPTION_TIMEZONE.toUpperCase() == 'EST') {
          TimeZoneException = 'Eastern'
        } else if (offHoursObjResult.EXCEPTION_TIMEZONE.toUpperCase() == 'MST') {
          TimeZoneException = 'Mountain'
        } else if (offHoursObjResult.EXCEPTION_TIMEZONE.toUpperCase() == 'PST') {
          TimeZoneException = 'Pacific'
        } else {
          TimeZoneException = 'Central'
        }
      }

      if (TimeZoneException == 'Central') {
        liveTime = moment.tz(moment(), 'America/Chicago').format('h:mma')
        timeZone = 'CST'
      } else if (TimeZoneException == 'Eastern') {
        liveTime = moment.tz(moment(), 'America/New_York').format('h:mma')
        timeZone = 'EST'
      } else if (TimeZoneException == 'Mountain') {
        liveTime = moment.tz(moment(), 'America/Denver').format('h:mma')
        timeZone = 'MST'
      } else if (TimeZoneException == 'Pacific') {
        liveTime = moment.tz(moment(), 'America/Los_Angeles').format('h:mma')
        timeZone = 'PST'
      } else {
        liveTime = moment.tz(moment(), 'America/Chicago').format('h:mma')
        timeZone = 'CST'
      }
      let startTime = moment(a, 'h:mma');
      let endTime = moment(b, 'h:mma');
      let momentCurrentTime = moment(liveTime, 'h:mma');
      let offHoursValue = momentCurrentTime.isBetween(startTime, endTime);
      if(global.NODE_ENV === "development") {
        offHoursValue = true;
      }
      let message = `FAST is currently closed. Operating hours: ${a} to ${b} (${timeZone})`;
      let businessHoursMessage = `(FAST support hours are ${a} to ${b} ${timeZone})`
      this.setState({ isOffHours: offHoursValue, offHoursMessage: message, businessHoursMessage, timeZone: offHoursObjResult.TIMEZONE, offHoursStartTime: startTime, offHoursEndTime: endTime })
      if(!offHoursValue) {
        return;
      } else {
    const lockReq = { createReqBody: this.formLockReq() }
    const workOderId = workORderInfo.get('workorder_id')
    await this.setState({ unlockLoader: true })
    let preLockedSector = this.findPrelockedSectors()
    await submitLockRequest(vendorId, loginId, workOderId, lockReq).then(async action => {
      await this.setState({ unlockLoader: false })
      let unlockMessage
      let unlockStatus
      let lock_unlock_request_id
      if (action.type === 'SUBMIT_LOCK_SUCCESS') {
         let vendorOpex = this.state.isErricson && this.props.opexVendors && !this.props.isSnap
         let antennaReplaceValue = vendorOpex ? "No" : (this.props.isSnap &&  this.state.isCuttingOver == "Yes"  ? this.state.isCuttingOver : this.state.replacingAnteenaRadio)
         if(!this.props.isSnap || !(this.props.isSnap  &&  this.state.isCuttingOver == "Yes")){
           logActioninDB(loginId, user.get('email'), vendorId, workORderInfo.get('workorder_id'), user.get('vendor_area'), user.get('vendor_region'), "Created OSW","OSW Create", `OSWCreate - Equip Replace - ${antennaReplaceValue|| ""}`,action?.submitLockResp?.createRequestData?.lock_unlock_request_id);
         }
        if(this.props.isSnap){
           logActioninDB(loginId, user.get('email'), vendorId, workORderInfo.get('workorder_id'), user.get('vendor_area'), user.get('vendor_region'), "Created OSW","OSW Create", `OSWCreateProject - Work with other team - ${this.state.isCuttingOver}`,action?.submitLockResp?.createRequestData?.lock_unlock_request_id);
        }
        try {
          establishSocket(loginId)
        } catch {
          console.log("Error in establishing the socket connection")
        }
        if (!!action.submitLockResp && !!action.submitLockResp.createRequestData) {
          unlockMessage = !!action.submitLockResp && !!action.submitLockResp.createRequestData.message ? action.submitLockResp.createRequestData.message : 'Lock Request Initiation Success'
        } else if (!!action.submitLockResp && !!action.submitLockResp.LockRequest) {
          unlockMessage = ''
        }
        unlockStatus = true
        if (!!action.submitLockResp && !!action.submitLockResp.createRequestData) {
          lock_unlock_request_id = !!action.submitLockResp && !!action.submitLockResp.createRequestData.lock_unlock_request_id ? action.submitLockResp.createRequestData.lock_unlock_request_id : ''
        } else if (!!action.submitLockResp && !!action.submitLockResp.LockRequest) {
          lock_unlock_request_id = !!action.submitLockResp && !!action.submitLockResp.LockRequest.request_detail && !!action.submitLockResp.LockRequest.request_detail.lock_unlock_request_id ? action.submitLockResp.LockRequest.request_detail.lock_unlock_request_id : ''
        }
        this.props.getLockUnlockReq(lock_unlock_request_id)
        await this.setState({ submitLockSuccess: true })
        if (!!action.submitLockResp && !!action.submitLockResp.createRequestData) {
          this.submitSLRNotes(!this.props.isSnap && this.state.isErricson && this.props.opexVendors ? "Ericsson OPEX Program Work" : this.state.slrMessage)
          // VP: AOTO to NEW - Logic to verify the Nokia vendor avaible in site node details
          let node_details = this.props.site.get("node_details") != null ? this.props.site.get("node_details").toJS() : [];
          let vendorOpex = this.state.isErricson && this.props.opexVendors && !this.props.isSnap

          let nokiaNodeobj = node_details.filter(item => item.vendor.toUpperCase() == "NOKIA");
          let nonServiceImpactConditions = node_details?.length > 0 && this.state.isAutoSlrEnable && this.state.nonServiceImpact?.toUpperCase() == "NO"
          let nodes4G = node_details?.filter(item => ["4G", "C-BAND", "CBRS"].includes(item.type.toUpperCase())) || []
          let nodes5G = []
          nodes5G = node_details?.filter(item => ["5G", "5GMMW"].includes(item.type.toUpperCase()))
          nodes5G = nodes5G?.filter(item => item?.node?.indexOf('FSU') != 0)
          if(!vendorOpex){
            if (this.state.isVendorTrained == "Yes") {
              let modifiedUser = this.props.user.toJS();
              modifiedUser.is_vendor_trained = "Yes"
              this.props.updateUserObjReducer(modifiedUser)
            }
            if(!this.state.isAutoSlrEnable) {
              let text = `VP: ${user.get("vendor_name")} is not enabled with On-Site-Work Automation. Please work with FAST.`
              this.submitSLRNotes(text)
            } else if (this.props.site.get("osw_freeze")) {
              this.submitSLRNotes(`VP: This site has a freeze scheduled. Please verify before resuming work and respond accordingly`);
              this.triggerManualOSWReason("Scheduled Freeze", lock_unlock_request_id)
            } else if (nonServiceImpactConditions && this.props.site.get("root_drive")) {
              let text = `VP: Root is active, Please work with FAST`
              this.submitSLRNotes(text)
              this.triggerManualOSWReason("Root Active", lock_unlock_request_id)
            } else if (nonServiceImpactConditions && nodes4G?.length >= 5) {
              let text = `VP: 5+ 4G nodes at on site, Please work with FAST`
              this.submitSLRNotes(text)
              this.triggerManualOSWReason("5+ Nodes", lock_unlock_request_id)
            } else if (nonServiceImpactConditions && nodes5G?.length >= 5) {
              let text = `VP: 5+ 5G nodes at on site, Please work with FAST`
              this.submitSLRNotes(text)
              this.triggerManualOSWReason("5+ Nodes", lock_unlock_request_id)
            } else if (nonServiceImpactConditions && this.state.mmwNote) {
              this.submitSLRNotes(this.state.mmwNote)
              this.triggerManualOSWReason("5G MMW", lock_unlock_request_id)
            } else if (nonServiceImpactConditions && preLockedSector?.length > 0) {
              let secotrNamesWithNodes = [];
              preLockedSector.forEach(item => {
                let groupedByNodesList = [];
                this.props.sectorInfoData.forEach(value => {
                  let sectorNameList = value.sector.split("_");
                  let sectorName = sectorNameList[sectorNameList.length - 2];
                  if (value.sector && sectorName && sectorName == item.toLowerCase()) {
                    groupedByNodesList.push(value.enodeb_id)
                  }
                })
                secotrNamesWithNodes.push(`${item}-${groupedByNodesList.toString()}`)
              })
              let text = `VP: Sector ${secotrNamesWithNodes.toString()} pre locked, Please work with FAST`
              this.submitSLRNotes(text)
              this.triggerManualOSWReason("PreLocked Sector", lock_unlock_request_id)
            } else if (nonServiceImpactConditions && this.state.isCuttingOver && this.state.isCuttingOver == "Yes") {
              let text = `Vendor stated they will be working with other teams. Please direct them to the proper team and close OSW if needed.`
              this.submitSLRNotes(text)
              this.triggerManualOSWReason("Other Team", lock_unlock_request_id, text)
            } else if (this.state.isAutoSlrEnable && bird_nest_activity?.bird_restriction == "yes") {
              let text = `Active bird nest on site. Please review the details and act accordingly.`
              this.submitSLRNotes(text);
              this.triggerManualOSWReason("Bird Activity", lock_unlock_request_id)
            } else if (this.props.site.get("is_donor")) {
              let text = `This is a donor site. Please do NOT put back to auto and work with Tanglewood Team to lock AP radio`
              this.submitSLRNotes(text);
              this.triggerManualOSWReason("Donor Site", lock_unlock_request_id)
            } else if (this.state.isVendorTrained == "No") {
              let text = 'User has not been trained to use Automation. Please assist user with guidance on proper usage';
              this.submitSLRNotes(text);
              this.triggerManualOSWReason("Not Trained", lock_unlock_request_id)
            } else if (this.state.isAutoSlrEnable && nokiaNodeobj && Object.keys(nokiaNodeobj).length > 0 && this.state.nonServiceImpact.toUpperCase() == "NO") {
              let nokiaNodes = nokiaNodeobj.map(item => item.node).toString();
              let text = `VP: OSW self serve is not supported for Nokia node - ${nokiaNodes}. Please work with FAST`
              this.submitSLRNotes(text)
              this.triggerManualOSWReason("Nokia Node",lock_unlock_request_id)
            } else if (this.state.isAutoSlrEnable && node_details && node_details.length == 0) {
              let text = `Error: Failed to run health check. Please verify and run one if needed.`
              this.submitSLRNotes(text);
              this.triggerManualOSWReason("VP Error",lock_unlock_request_id, text )
            }
          }
          this.fetchSectorInfoData()
        } else if (!!action.submitLockResp && !!action.submitLockResp.LockRequest) {
          await fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), lock_unlock_request_id)
        }
        if (!this.props.workScheduled && this.props.oswNoScheduleWarning === "Y") {
          this.sendEmailNotification()
        }
      } else if (action.type === 'SUBMIT_LOCK_FAILURE') {
        unlockMessage = !!action.errors && !!action.errors.message ? action.errors.message : 'Lock Request Initiation Failed'
        unlockStatus = false
        this.setState({ errorMessage: true })
      } else {
        unlockMessage = ''
        unlockStatus = false
      }
      await this.setState({ unlockMessage, unlockStatus })
      setTimeout(() => { this.setState({ unlockMessage: '' }) }, 3000)
      })
      }
    }
    await this.setState({ unlockLoader: false })
  }
  sendEmailNotification() {
    let { workORderInfo, user, scheduleFoundFuture } = this.props;
    let email = user.get('service_email');
    let projectOrWorkorder = this.props.isSnap ? "Project" : "Work Order"
    let workId = workORderInfo.get('workorder_id')
    let bodyMessage = scheduleFoundFuture && Object.keys(scheduleFoundFuture).length >0 ?
    '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
      '	<h1 style="background:#ff9800;color:#ffffff;padding:5px;margin:0px;text-align:center"> Missing schedule for on-site work </h1>' +
      '	<div style="padding:10px;color:#607d8b">' +
      '	<span>Verizon policy requires all on-site work to be scheduled in Vendor Portal.</span>' +
      ' <span style="font-weight: bold">' + projectOrWorkorder + ' ' + workId + '</span>' +
      ` <span>was scheduled for ${moment(scheduleFoundFuture.start).format('DD/MM/YYYY')} for on-site work in Vendor Portal, yet there is no schedule for ${moment().format('DD/MM/YYYY')}. Going forward, please make sure to schedule all of your antenna/tower-related work for the day you plan to visit the location.</span>` +
      '</div>' +
      '</div>' :
      '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
      '	<h1 style="background:#ff9800;color:#ffffff;padding:5px;margin:0px;text-align:center"> Missing schedule for on-site work </h1>' +
      '	<div style="padding:10px;color:#607d8b">' +
      '	<span>Verizon policy requires all on-site work to be scheduled in Vendor Portal.</span>' +
      ' <span style="font-weight: bold">' + projectOrWorkorder + ' ' + workId + '</span>' +
      ' <span>was not scheduled for on-site work in Vendor Portal, but was allowed to proceed to support the Verizon Network. However, going forward, please make sure to schedule all of your antenna/tower-related on-site work in Vendor Portal or the work will not be allowed to proceed in the future.</span>' +
      '</div>' +
      '</div>';

    let emailNotification = {
      body: bodyMessage,
      from: 'Vendor Portal',
      recipients: [email],
      sourceName: 'Vendor Portal',
      subject: 'Missing schedule for on-site work - ' + workId,
      transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
    }
    this.props.ivrEmailNotify(this.props.loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } }).then(action => {
      if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
        this.props.notifref.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          message: action.response.data.ivrEmailNotification.message + ' to ' + email
        })
      }
    })
  }
  fileDownload = (file_name, file_Id) => {
    let { loginId, downloadLockFile } = this.props
    downloadLockFile(loginId, file_Id).then(action => {
      if (action.attachmentData && action.attachmentData.attachmentData) {
        let binaryString = window.atob(action.attachmentData.attachmentData)
        let bytes = new Uint8Array(binaryString.length)
        let blob = bytes.map((byte, i) => binaryString.charCodeAt(i))
        createAndDownloadBlobFile(blob, file_name)
      }
    })
  }

  async handleAddNotes() {
    const { site_unid, loginId, vendorId, submitNotes, userList, workORderInfo, lock_unlock_request_id, fetchLockData, user } = this.props
    const workOderId = workORderInfo.get('workorder_id')
    const notesPost = {
      "notesreqBody": {
        "site_unid": site_unid ? site_unid : '',
        "vp_req_id": lock_unlock_request_id,
        "text": this.state.Comments,
        "source": "VP",
        "created_by": user.get("fname") + ' ' + user.get("lname")
      },
      "notesAddedBy": {
        "user_id": loginId,
        "phone": !!userList && userList.toJS().length > 0 && userList.toJS().filter(val => val.userid == loginId.toString()).length > 0 && !!userList.toJS().filter(val => val.userid == loginId.toString())[0].phone ? userList.toJS().filter(val => val.userid == loginId.toString())[0].phone : '',
      }
    }
    await this.setState({ notesLoader: true })
    await submitNotes(vendorId, loginId, workOderId, notesPost, lock_unlock_request_id).then(async action => {

      let notesMessage = '';
      let notesStatus = '';
      let buttonName =  this.props.lockData?.lockRequest?.request_detail.status?.toUpperCase() == "AUTO" ? "Add Notes" : "Message FAST"
      if (action && action.type === 'SUBMIT_NOTES_SUCCESS') {
        notesMessage = 'Comments addition Success'
        notesStatus = true
        await fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), lock_unlock_request_id)
          logActioninDB(
              loginId,
              user.get('email'),
              vendorId,
              workOderId,
              user.get('vendor_area'),
              user.get('vendor_region'),
               buttonName,
               buttonName,
               buttonName,
              this.props.lock_unlock_request_id
            );
      } else if (action && action.type === 'SUBMIT_NOTES_FAILURE') {
        notesMessage = 'Comments addition Failure'
        notesStatus = false
      } else {
        notesMessage = ''
        notesStatus = false
      }

      document.getElementById('notesSection').value = ''
      await this.setState({ notesMessage, notesStatus, Comments: '' })
      setTimeout(() => { this.setState({ notesMessage: '' }) }, 3000)
    })
    await this.setState({ notesLoader: false })
  }
  onAttachRemove(index) {

    this.setState({
      filesData: this.state.filesData.filter((_, i) => i !== index)
    })
    this.forceUpdate()
  }
  onFileDrop(files) {


    files.forEach(file => {

      if (file['size'] > 0) {

        var reader = new window.FileReader()
        reader.onload = function () {

          var dataURL = reader.result
          var droppedFile = {
            file_name: file['name'],
            file_type: file['type'],
            file_size: file['size'] + '',
            file_data: dataURL.toString().split('data:' + file['type'] + ';base64,')[1],
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
  handleTextChange = (e) => {
    this.setState({ Comments: e.target.value })
  }
  async postAttachment() {
    const { site_unid, loginId, vendorId, submitAttachment, workORderInfo, lock_unlock_request_id, fetchLockData, user } = this.props
    const workOderId = workORderInfo.get('workorder_id')
    const attPost = {
      "attachmentreqBody": {
        "files": this.state.filesData.map(({ file_name, file_size, file_data }) => {
          return {
            "vp_req_id": lock_unlock_request_id,
            "source": "VP",
            "file_name": file_name,
            "file_size": file_size,
            "file_content": file_data
          }


        }
        ),
        "uploaded_by": user.get("fname") + ' ' + user.get("lname")
      }
    }
    await this.setState({ attsLoader: true })
    await submitAttachment(vendorId, loginId, workOderId, attPost, lock_unlock_request_id).then(async action => {

      let attsMessage = '';
      let attsStatus = '';
      if (action.type === 'SUBMIT_ATTS_SUCCESS') {
        attsMessage = 'Attachments addition Success'
        attsStatus = true
        await fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), lock_unlock_request_id)
      } else if (action.type === 'SUBMIT_ATTS_FAILURE') {
        attsMessage = 'Attachments addition Failure'
        attsStatus = false
      } else {
        attsMessage = ''
        attsStatus = false
      }
      await this.setState({ attsMessage, attsStatus, filesData: [] })
      setTimeout(() => { this.setState({ attsMessage: '' }) }, 3000)
    })
    await this.setState({ attsLoader: false })
  }

  resetMessages = () => {
    this.setState({ unlockMessage: '' })
  }
  resetMessagesWorPening = () => {
    this.setState({ workPendingMSg: '' })
  }

  updateReason = (e) => {
    if (e.target.value.length >= 1) {
      this.setState({ requestReason: false, slrMessage: e.target.value })
    } else if (e.target.value.length < 1) {
      this.setState({ requestReason: true })
    }
  }

  updateCheck = (e) => {
    if (e.target.value != '') {
      this.setState({ requestCheck: false, nonServiceImpact: e.target.value, replacingAnteenaRadio: "" })
    }
  }

  resetHolidayMessage = () => {
    this.setState({ holidayEventMessage: '' })
  }

  triggerManualOSWReason = (actionCode, lock_unlock_request_id, workTaskNotes) => {
    let commentsForOSW = ""
    if(["Vendor Assist", "VP Error"].includes(actionCode)) {
      if(actionCode === 'Vendor Assist') {
        commentsForOSW = workTaskNotes
      }else if(actionCode === "VP Error") {
        if(workTaskNotes.includes("backend timeout")) commentsForOSW = "Unable to retrieve sector info due to backend timeout"
        else if(workTaskNotes.includes("nodes are not available")) commentsForOSW = "The nodes are not available for this site"
        else if(workTaskNotes.includes("Unable to retrieve the sectors")) commentsForOSW = "Unable to retrieve the sectors"
        else if(workTaskNotes.includes("Unable to retrieve sector lock status")) commentsForOSW = "Unable to retrieve sector lock status"
        else if(workTaskNotes.includes("working with other teams")) commentsForOSW = "Vendor stated they will be working with other teams"
        else if(workTaskNotes.includes("Failed to run health check")) commentsForOSW = "Failed to run health check"
        else if(workTaskNotes.includes("No health check triggered")) commentsForOSW = "No health check triggered"
      }
    }
    let manualOSWPayload = {
      'manualoswrsn': actionCode,
      'manualoswrsn_comments': commentsForOSW,
      'user_id': this.props.lockData?.lockRequest?.request_detail?.assigned_to
    }
    if(actionCode) {
      this.props.manualOSWReason(manualOSWPayload, lock_unlock_request_id).then(response =>{
        if(response?.data?.data?.updateManualOswReason) {
          this.props.notifref.addNotification({
            title: 'Success',
            position: "br",
            level: "success",
            autoDismiss: 10,
            message: response?.data?.data?.updateManualOswReason?.message
          })
        }

        if(response?.errors?.length > 0) {
          this.props.notifref.addNotification({
            title: 'Failure',
            position: "br",
            level: "error",
            autoDismiss: 10,
            message: "Manual OSW Reason Update Failed"
          })
        }
    })
    }
  }

  updateSLRStatus = async (slrStatus, workTaskNotes,actionCode, faultcode, rescode) => {
    let { user, updateSLRStatusRequest, lock_unlock_request_id, loginId } = this.props;
    //option capture about the reminder of message fast 
    let {messageFastAck, messageFastAcknowledged} = this.state;
    //payload capture about the reminder of message fast 
    let payload = {
      "isReminderAcknowledged": messageFastAck != '' ? messageFastAck : messageFastAcknowledged,
      "status": this.state.messageFastAck === 'No' ? null : slrStatus,
      "updated_by": this.state.messageFastAck === 'No' ? null : user.get("fname") + ' ' + user.get("lname"),
      "work_task_notes": this.state.messageFastAck === 'No' ? null : [slrStatus == "COMPLETED" ? !this.props.isSnap ? `${workTaskNotes}^${faultcode}^${rescode}` : workTaskNotes : workTaskNotes]
    }
    
    await updateSLRStatusRequest(payload, lock_unlock_request_id).then(response => {
      if(actionCode != 'Vendor Assist') {
        this.triggerManualOSWReason(actionCode, lock_unlock_request_id, workTaskNotes)
      }
      if (response?.data?.data?.updateLockStatus) {
        this.props.notifref.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          autoDismiss: 10,
          message: response.data.data.updateLockStatus.iopUpdate.message
        })
        this.submitSLRNotes(workTaskNotes)
      }
    })
  }
  handleSectorLockUnlock = (row) => {
    let { enodeBSectorInfo } = this.state;
    let { lockData } = this.props;
    let reqIds = [];
    // Logic for multi enodeb's sending in the request when sector name matches
    let sectorNameList = row.sector.split("_");
    let selectedSectorName = sectorNameList[sectorNameList.length - 2];
    let lockedEnodebsArray = []
    let lockedSectorNames = []
    let sectorlockdata = !!lockData && !!lockData.lockRequest && !!lockData.lockRequest.sectorlockdata && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata : []
    if (row.lock_status == "locked" && sectorlockdata.length > 0) {
      enodeBSectorInfo.forEach(item => {
        if (item.lock_status && item.lock_status.toUpperCase() == "LOCKED") {
          let lockedObj = sectorlockdata.find(locked => locked.SECTOR.includes(item.sector) && locked.ACTION == "LOCK" && locked.ACTION_STATUS.toUpperCase() == "COMPLETED" && row.reqId == locked.LOCK_UNLOCK_ACTION_REQ_ID)
          if (lockedObj && Object.keys(lockedObj).length > 0) {
            lockedEnodebsArray.push(item.enodeb_id)
            lockedSectorNames.push(item.sector)
            if (!reqIds.includes(lockedObj.LOCK_UNLOCK_ACTION_REQ_ID)) {
              reqIds.push(lockedObj.LOCK_UNLOCK_ACTION_REQ_ID)
            }
          }
        }
      })
    }
    if (row.lock_status == "unlocked") {
      enodeBSectorInfo.forEach(item => {
        let sectorNameList = item.sector.split("_");
        let sectorName = sectorNameList[sectorNameList.length - 2];
        if (sectorName && (selectedSectorName.toUpperCase() == sectorName.toUpperCase()) && (item.lock_status == row.lock_status)) {
          lockedEnodebsArray.push(item.enodeb_id)
          lockedSectorNames.push(item.sector)
        }
      })
    }
    this.setState({
      selectedSectorLockUnlock: row,
      showLockUnlockConfirmAlert: row.lock_status == "unlocked" ? true : reqIds.length > 0,
      lockedOrUnlockedSectors: lockedSectorNames,
      lockedOrUnlockedEnodebs: lockedEnodebsArray,
      lockedOrUnlockedSectorName: selectedSectorName.toUpperCase(),
      lockedSectorsReqIds: reqIds
    })
  }

  triggerSectorLockUnlock = async () => {
    let row = this.state.selectedSectorLockUnlock;
    let { enodeBSectorInfo, lockedOrUnlockedSectors, lockedOrUnlockedEnodebs, checkList } = this.state;
    let { user, lock_unlock_request_id, loginId, vendorId, workORderInfo } = this.props;
    let optionValues = []
    checkList.filter(item => {
      if (item.checked) { optionValues.push(item.value) }
    })
    this.setState({
      showLockUnlockConfirmAlert: false,
      sectorLockUnlockTriggered: true,
      isReplaceAntenna: false,
      isReplacingEqipment: '',
      enodeBSectorInfo: enodeBSectorInfo.map(item => Object.assign({ ...item, sectorLockTriggered: true }))
    })
    if (row && row.lock_status == "unlocked") {
      let payLoad = {
        SECTOR_LOCK_UNLOCK_REQ_ID: lock_unlock_request_id,
        ENODEB_ID: lockedOrUnlockedEnodebs,
        RADIO_UNIT: "",
        LINKED_VENDOR_ID: "",
        EMAIL_ADDRESS: [],
        VENDOR: row.vendor,
        SECTOR: lockedOrUnlockedSectors,
        ACTION: "LOCK",
        ACTION_STATUS: "NEW",
        TIMEZONE: this.state.timeZone,
        REASON: "",
        SOURCE: "VP",
        CELL_LIST: "",
        RADIO_UNIT_LOCK_STATUS: "",
        CREATED_BY: user.get("fname") + ' ' + user.get("lname"),
        LAST_UPDATED_BY: user.get("fname") + ' ' + user.get("lname")
      }
      this.props.createLockRequest(payLoad, this.props.site_unid).then(async action => {
        if (action && action.data && action.data.data && action.data.data.createLockUnlock != null) {
          let lockRequIds = action.data.data.createLockUnlock.iopResponse.map(item => item.lock_request_id)
          let checkIfLockFailedStr = /^\d+$/.test(lockRequIds.toString().toLowerCase())

          if (checkIfLockFailedStr === true) {
            let text = `Sector LOCK request created for ${this.state.lockedOrUnlockedSectorName} on ${lockedOrUnlockedSectors.toString()} from VP-AUTO, request ID: ${lockRequIds.toString()}`
            this.submitSLRNotes(text);
            logActioninDB(loginId, user && user.get('email'), vendorId, workORderInfo.get('workorder_id'), user && user.get('vendor_area'), user && user.get('vendor_region'), "Lock created Successfully","Sector Lock","Sector Lock", this.props.lock_unlock_request_id);
            this.props.notifref.addNotification({
              title: 'Success',
              position: "br",
              level: 'success',
              autoDismiss: 10,
              message: `${action.data.data.createLockUnlock.iopResponse[0].message} - ${lockRequIds.toString()}`
            })

          } else {
            let text = `Sector LOCK failed on ${this.state.lockedOrUnlockedSectorName} with folowing sectors as ${lockedOrUnlockedSectors.toString()} from VP-AUTO, request ID: ${lockRequIds.toString()}, due to invalid response`
            await this.updateSLRStatus("NEW", text, "Failed Lock")
          }
          if (enodeBSectorInfo.length) {
            enodeBSectorInfo = enodeBSectorInfo.map(item => {
              if (lockedOrUnlockedEnodebs.includes(item.enodeb_id) && lockedOrUnlockedSectors.includes(item.sector)) {
                return {
                  ...item,
                  lock_status: row.lock_status == "unlocked" ? "locked" : "unlocked",
                  sectorLockTriggered: true
                }
              } else {
                return {
                  ...item,
                  sectorLockTriggered: true
                }
              }
            })
          }
          this.setState({ enodeBSectorInfo: enodeBSectorInfo })
        } else {
          if (this.state.sectorLockRetryCount < 2) {
            await this.setState({ sectorLockRetryCount: this.state.sectorLockRetryCount + 1 }, async () => {
              console.log("Sector lock retry logic executed --", this.state.sectorLockRetryCount)
              this.props.notifref.addNotification({
                title: 'Failure',
                position: "br",
                level: 'error',
                autoDismiss: 15,
                message: `Sector LOCK ${this.state.sectorLockRetryCount} ${this.state.sectorLockRetryCount == 1 ? `time` : `times`} failed, please try again`
              })
            })
          } else {
            this.props.notifref.addNotification({
              title: 'Failure',
              position: "br",
              level: 'error',
              autoDismiss: 10,
              message: "Sector Lock Failed"
            })
            let text = `Sector LOCK failed on ${this.state.lockedOrUnlockedSectorName} with folowing sectors as ${lockedOrUnlockedSectors.toString()} by ${user.get("fname")} ${user.get("lname")} for 3 times`
            await this.updateSLRStatus("NEW", text, "Failed Lock")
          }
        }
        this.setState({ sectorLockUnlockTriggered: false })
      })
    } else {
      if (this.state.lockedSectorsReqIds.length > 0) {
        let options = optionValues.toString()
        let payLoad = {
          request_id: this.state.lockedSectorsReqIds,
          enodeb_id: lockedOrUnlockedEnodebs,
          created_by: user.get("fname") + ' ' + user.get("lname"),
          radio_unit: "",
          sector: lockedOrUnlockedSectors,
          linked_vendor_id: null,
          reason: "",
          email_ids: [],
          timezone: this.state.timeZone,
          lock_type: "Lock",
          status: "Completed",
          vendor: row.vendor,
          osw_request_id: lock_unlock_request_id,
          optionValues: options
        }
        this.props.createUnlockRequest(payLoad, this.props.site_unid).then(async action => {
          if (action && action.data && action.data.data.unlockSector != null) {
            let text = `Sector UNLOCK request created for ${this.state.lockedOrUnlockedSectorName} on ${lockedOrUnlockedSectors.toString()} from VP-AUTO, request ID: ${this.state.lockedSectorsReqIds.toString()}`
            this.submitSLRNotes(text);
            logActioninDB(loginId, user && user.get('email'), vendorId, workORderInfo.get('workorder_id'), user && user.get('vendor_area'), user && user.get('vendor_region'), "Unlocked Successfully","Sector Unlock",`Sector Unlock - Equip Replace - ${options || "None"}`,this.props.lock_unlock_request_id);
            this.props.notifref.addNotification({
              title: 'Success',
              position: "br",
              level: 'success',
              autoDismiss: 10,
              message: action.data.data.unlockSector.iopResponse[0].message
            })
            if (enodeBSectorInfo.length) {
              enodeBSectorInfo = enodeBSectorInfo.map(item => {
                if (lockedOrUnlockedEnodebs.includes(item.enodeb_id) && lockedOrUnlockedSectors.includes(item.sector)) {
                  return {
                    ...item,
                    lock_status: row.lock_status == "unlocked" ? "locked" : "unlocked",
                    sectorLockTriggered: false
                  }
                } else {
                  return {
                    ...item,
                    sectorLockTriggered: false
                  }
                }
              })
            }
            this.setState({ enodeBSectorInfo: enodeBSectorInfo })
          } else {
            if (this.state.sectorUnLockRetryCount < 2) {
              await this.setState({ sectorUnLockRetryCount: this.state.sectorUnLockRetryCount + 1 }, async () => {
                console.log("Sector unlock retry logic executed --", this.state.sectorUnLockRetryCount)
                this.props.notifref.addNotification({
                  title: 'Failure',
                  position: "br",
                  level: 'error',
                  autoDismiss: 15,
                  message: `Sector UNLOCK  ${this.state.sectorUnLockRetryCount} ${this.state.sectorUnLockRetryCount == 1 ? `time` : `times`} failed, please try again`
                })
              })
            } else {
              this.props.notifref.addNotification({
                title: 'Failure',
                position: "br",
                level: 'error',
                autoDismiss: 10,
                message: "Sector UNLOCK Failed"
              })
              let text = `Sector UNLOCK failed on ${this.state.lockedOrUnlockedSectorName} with folowing sectors as ${lockedOrUnlockedSectors.toString()} by ${user.get("fname")} ${user.get("lname")} for 3 times`
              await this.updateSLRStatus("NEW", text, "Failed Unlock")
            }
          }
          this.setState({ sectorLockUnlockTriggered: false })
        })
      }
    }
  }



  handleAnttennaWork = async (event) => {
    let list = [];
    this.state.checkList.filter(item => {
      if (item.checked) { list.push(item.value) }
    })
    this.setState({ isReplaceAntenna: false })
    if(list.toString().includes("RET(s)/Antenna(s)") && this.props.slrStatus === "AUTO") {
      if(this.props.enableRetflag === 'Y'){
      const { site_unid, lock_unlock_request_id, loginId } = this.props;
      const { lockedOrUnlockedSectors } = this.state;
      let node_ids = this.getNodesForRETScan();
      let sectors = {};
      lockedOrUnlockedSectors.forEach(sector => {
        let nodeId = sector.split('_')[0];
        sectors = {...sectors, [nodeId] :  sector};
      })
      node_ids.forEach(node => {
        node.sector = sectors[node.node];
      })
      
      for(let i=0; i < node_ids.length; i++) {
        if(node_ids[i].sector){
        try {
          let response = await this.props.triggerRETScan({
            nodeId:node_ids[i].node,
            siteUnid: site_unid,
            OSW_ID : lock_unlock_request_id,
            reqType: "SCAN",
            source:"VP",
            userId: loginId,
            fullScan: global.NODE_ENV.includes('production') ? false : true,
            sector: node_ids[i].sector,
            notes:`VP RET Scan automation for OSW: ${lock_unlock_request_id}`
          })
          if (this.props.lockData?.lockRequest?.request_detail?.stay_as_auto == "Y") 
            this.props.updateStayAutoFlag(this.props.oswRequestId)
          if(response?.errors?.length > 0) {
            this.props.notifref.addNotification({
              title: 'Failure',
              position: "br",
              level: "error",
              autoDismiss: 10,
              message: `Failed to trigger RET Scan for node ${node_ids[i].node}`
            })
            if(this.props.slrStatus === "AUTO") {
              let text = `RET update on node ${node_ids[i].node} failed. Please review and update accordingly.`
              await this.updateSLRStatus("NEW", text, "HW Replacement")
            }
          } else if(response?.request_id){
            const notesText = `VP RET Scan started for node ${node_ids[i].node}`;
            this.submitSLRNotes(notesText);
              this.props.notifref.addNotification({
                title: 'Success',
                position: "br",
                level: "success",
                autoDismiss: 10,
                message: response.message
              })
              }
              if(i == lockedOrUnlockedSectors.length-1){
                this.getRETScanDetails(this.props.oswRequestId)
               }
        }
        catch(error) {
          this.props.notifref.addNotification({
            title: 'Failure',
            position: "br",
            level: "error",
            autoDismiss: 10,
            message: `RET Scan failed for OSW: ${lock_unlock_request_id}`
          })
          if (this.props.lockData?.lockRequest?.request_detail?.stay_as_auto == "Y") 
            this.props.updateStayAutoFlag(this.props.oswRequestId)
          if(this.props.slrStatus === "AUTO") {
            let text = `VP: AUTO to NEW: Failed to trigger RET scan`
            await this.updateSLRStatus("NEW", text, "VP Error")
          }
        }
        }
      }
    }else{
      let text = `VP: AUTO to NEW: ${list.toString()} have been swapped. Please review to update accordingly.`
      await this.updateSLRStatus("NEW", text, "HW Replacement")
    }
  }
    await this.triggerSectorLockUnlock();
    if(list.toString().includes("CBRS(s)")) {
      let text = `VP: AUTO to NEW ${list.toString()} have been swapped. Please review to update accordingly.`
      await this.updateSLRStatus("NEW", text, "HW Replacement")
    }
    if((list.toString().includes("Cband/LS6")) ||(this.state.isSamsung && list.toString().includes("4G LTE")) ){
      this.trggerUpdateSamsungSN()
    }
  }

  getNodesForRETScan = () => {
    let nodes4G = [];
    let nodes5G = [];
    let nodesLs6 = [];
    let { site } = this.props;
    let node_details = site.get("node_details") !== null ? site.get("node_details").toJS() : [];
    nodes4G = node_details.filter(item => ["4G", "C-BAND", "CBRS"].includes(item.type.toUpperCase()))
    nodes5G = node_details.filter(item => ["5G", "5GMMW"].includes(item.type.toUpperCase()))
    nodesLs6 = nodes5G.filter(i => i?.type?.toUpperCase() === '5G' && ["3"].includes(i.node[i.node.length-4]))
    let node_ids = [...nodes4G, ...nodesLs6];
    return uniqBy(node_ids);
  }
  async getRETScanDetails(lock_unlock_request_id) {
    await this.props.getRETScanDetails(lock_unlock_request_id)
    let response = this.props.retScanDetails?.toJS().sort(function(a,b){
      return new Date(b.created_on) - new Date(a.created_on);
    })
    const { lockData } = this.props
    let nodesData  = this.getNodesForRETScan()
    nodesData = nodesData.map(i => i.node)
    if (nodesData.length > 0) {
      let inProgressScans = response.filter(ret => 
        nodesData.includes(ret.node_id) && ret.status.toLowerCase() === 'in progress'
      )
      if (inProgressScans.length > 0) {
        this.setState({ retScanRunning: true })
      }else{
        this.setState({ retScanRunning: false })
      }
        let failedScans = []
        nodesData.map(nodeId => {
          let noderets= response.filter(ret => nodeId === ret.node_id) || []
          if(noderets.length && noderets[0].status.toLowerCase() === 'failed') failedScans.push(nodeId)
        })

      if (inProgressScans.length == 0 && failedScans.length > 0) {
        let text = `VP: AUTO to NEW: RET update on node ${failedScans.join(",")} failed. Please review and update accordingly.`
        await this.updateSLRStatus("NEW", text, "HW Replacement")
      }
    }

  }
  handleChange = (event) => {
    this.setState({ replacingAnteenaRadio: event.target.value })
  }

  handleCheckEquipValue = (value) => {
    this.setState({ replacingEquipment: value })
    let modifiedCheckList;
    if (value === "None") {
      // If "None" is selected, disable all other checkboxes
      const isNoneChecked = this.state.checkList.find(item => item.value === "None")?.checked;
      modifiedCheckList = this.state.checkList.map(item => {
        if (item.value === "None") {
          return { ...item, checked: !isNoneChecked };
        } else {
          return { ...item, checked: false }; // Uncheck all other options
        }
      });
    } else {
      // If any other checkbox is selected, uncheck "None"
      modifiedCheckList = this.state.checkList.map(item => {
        if (item.value === "None") {
          return { ...item, checked: false };
        } else if (item.value === value) {
          return { ...item, checked: !item.checked };
        } else {
          return item;
        }
      });
    }
    this.setState({ checkList: modifiedCheckList });
  }

  submitSLRNotes = (message) => {
    const { vendorId, loginId, workORderInfo, submitLockRequest, userList, lock_unlock_request_id, user, site_unid, submitNotes, fetchLockData } = this.props
    const workOderId = workORderInfo.get('workorder_id')
    const notesPost = {
      "notesreqBody": {
        "site_unid": site_unid ? site_unid : '',
        "vp_req_id": lock_unlock_request_id,
        "text": message,
        "source": "VP",
        "created_by": user.get("fname") + ' ' + user.get("lname")
      },
      "notesAddedBy": {
        "user_id": loginId,
        "phone": !!userList && userList.toJS().length > 0 && userList.toJS().filter(val => val.userid == loginId.toString()).length > 0 && !!userList.toJS().filter(val => val.userid == loginId.toString())[0].phone ? userList.toJS().filter(val => val.userid == loginId.toString())[0].phone : '',
      }
    }
    submitNotes(vendorId, loginId, workOderId, notesPost, lock_unlock_request_id).then(async action1 => {
      if (action1 && action1.type === 'SUBMIT_NOTES_SUCCESS') {
        this.props.notifref.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          autoDismiss: 10,
          message: action1.submitNotesResp
        })
        await fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), lock_unlock_request_id)
      }
    })
  }

  handleWorkTaskNotes = (e) => {
    this.setState({ workTaskNotes: e.target.value })
  }

  sectorInfoTable = () => {
    return this.state.radioCellList.map((val) => ({
      enodeb_id: val.enodeb_id ? val.enodeb_id : '',
      sector: val.cell_list.length > 0 ? val.cell_list.join(', ') : val.radio_units.length > 0 ? val.radio_units.join(', ') : '',
      vendor: val.vendor ? val.vendor : ''
    }))
  }

  renderRunHealthCheckBanner = () => {
    if (this.state.businessHoursMessage) {
      return <div className="col-md-12"><span>Run Health Check and Work with FAST</span><span style={{ margin: "15px", border: "3px solid white", padding: "5px" }}>{this.state.businessHoursMessage}</span></div>
    } else {
      return <div className="col-md-12"><span>Run Health Check and Work with FAST</span></div>
    }
  }
  displayLegendForLockUnlock = () => {
    return <div className='col-4'>
      <span style={{ float: "right" }}><span>Locked</span><img style={{ margin: "5px", height: "25px" }} src={LockedAux}></img></span>
      <span style={{ float: "right" }}><span>Unlocked</span><img style={{ margin: "5px", height: "25px" }} src={LockOpenAux}></img></span>
      <span style={{ float: "right" }}><span>Disabled</span><img src={Locked} style={{ margin: "5px", height: "25px", background: "lightgray", padding: "6px", borderRadius: "7px" }}></img></span>
    </div>
  }
  displayRefreshLink = () => {
    return <div className='col-4'>
      <a onClick={() => this.refreshSectorInfoTable()} className="pointer" data-tip data-for="Refresh" style={{ color: "black", textDecoration: "underline", fontSize: '14px', fontWeight: 'normal' }}>
        <small>
          <img src={RefreshPage} style={{ height: '20px' }} />
        </small>
        Refresh
      </a>
    </div>
  }
  renderActionsColumn = (params) => {
    const  data = params.row
    if (data.lock_status == "locked") {
      if (data.healthCheckInprogress == true) {
        return (
          <div style={{ 'backgroundColor': '#80808057', 'borderRadius': '30px', 'display': 'table-cell', "cursor": "pointer", textAlign: "center", pointerEvents: "none", height: "25px" }}>
            <img src={Locked} style={{ 'float': 'left', "paddingTop": "5px", "paddingLeft": "10px", "paddingRight": "5px", height: "22px" }}></img>
            <img src={LockOpen} style={{ 'float': 'left', "paddingTop": "5px", "paddingLeft": "10px", "paddingRight": "5px", height: "22px" }}></img>
          </div>
        )
      } else {
        return (
          <div onClick={() => this.handleSectorLockUnlock(data)} style={{ 'backgroundColor': '#80808057', 'borderRadius': '30px', 'display': 'table-cell', "cursor": "pointer", textAlign: "center", height: "25px" }}>
            <img src={LockedAux} style={{ 'float': 'left', height: "25px" }}></img>
            <img src={LockOpen} style={{ 'float': 'right', 'paddingRight': '5px', 'paddingTop': '5px', 'paddingLeft': '10px', height: "23px" }}></img>
          </div>
        )
      }
    } else if (data.lock_status == "unlocked") {
      if (data.sectorLockTriggered == true || data.healthCheckInprogress == true) {
        return (
          <div style={{ 'backgroundColor': '#80808057', 'borderRadius': '30px', 'display': 'table-cell', "cursor": "pointer", textAlign: "center", pointerEvents: "none", height: "25px" }}>
            <img src={Locked} style={{ 'float': 'left', "paddingTop": "5px", "paddingLeft": "10px", "paddingRight": "5px", height: "22px" }}></img>
            <img src={LockOpen} style={{ 'float': 'left', "paddingTop": "5px", "paddingLeft": "10px", "paddingRight": "5px", height: "22px" }}></img>
          </div>
        )
      } else {
        return (
          <div onClick={() => this.handleSectorLockUnlock(data)} style={{ 'backgroundColor': '#80808057', 'borderRadius': '30px', 'display': 'table-cell', "cursor": "pointer", textAlign: "center", height: "25px" }}>
            <img src={Locked} style={{ 'float': 'left', "paddingTop": "5px", "paddingLeft": "10px", "paddingRight": "5px", height: "22px" }}></img>
            <img src={LockOpenAux} style={{ 'float': 'right', 'paddingLeft': '5px', height: "25px" }}></img>
          </div>
        )
      }
    } else {
      return <div></div>
    }
  }

  showSectorLockAction = async () => {
    // Show/Hide Actions column in sector info table
    let preCheckCompleted = this.findPreCheckStatus();
    console.log("isAutoSlrEnabled--", this.state.isAutoSlrEnable, "Precheck", preCheckCompleted)
    if (this.state.isAutoSlrEnable && this.props.nsa == 'NO' && this.props.slrStatus == 'AUTO' && preCheckCompleted == true) {
      await this.setState({ showSectorLockAction: true, preCheckCompleted: preCheckCompleted })
    } else {
      await this.setState({ showSectorLockAction: false, preCheckCompleted: preCheckCompleted })
    }
  }
  disableSectorlockActions = (disable) => {
    if (this.state.enodeBSectorInfo.length > 0) {
      let eNodeBSectorData = this.state.enodeBSectorInfo.map(item => {
        return {
          ...item,
          healthCheckInprogress: disable,
        }
      })
      this.setState({ enodeBSectorInfo: eNodeBSectorData })
    }
  }
  findPreCheckStatus = () => {
    let fourGprechecks = [];
    let fiveGprechecks = [];
    let healthCheckDetails = this.props.getHealthCheckReqs ? this.props.getHealthCheckReqs.toJS() : {}
    let preChecks = healthCheckDetails && Object.keys(healthCheckDetails).length > 0 && healthCheckDetails.enodeb_healthcheck && healthCheckDetails.enodeb_healthcheck.length > 0 ? healthCheckDetails.enodeb_healthcheck.filter(item => item.req_type == "Pre-Check" && item.osw_request_id == this.props.lock_unlock_request_id) : []
    let node_details = this.props.site.get("node_details") !== null ? this.props.site.get("node_details").toJS() : []
    let fourGnodes = node_details.filter(item => ["4G", "C-BAND", "CBRS"].includes(item.type.toUpperCase()))
    let fiveGnodes = node_details.filter(item => ["5G", "5GMMW"].includes(item.type.toUpperCase()))
    let ericssonMMWnodes = node_details.filter(item => item?.vendor?.toLowerCase() === 'ericsson' && item?.type?.toUpperCase() === '5G' && item?.node?.length === 7 && !["7","9"].includes(item.node[3]));
  
    let nonEricssonMMWnodes = node_details.filter(item => !(item?.vendor?.toLowerCase() === 'ericsson' && item?.type?.toUpperCase() === '5G' && item?.node?.length === 7 && !["7","9"].includes(item.node[3])));

      if (nonEricssonMMWnodes.length > 0 && ericssonMMWnodes.length > 0) {
        preChecks = preChecks?.filter(preCheck => {
          return preCheck?.enodeb_ids?.some(nodeId => 
              !ericssonMMWnodes.some(mmwNode => mmwNode.node === nodeId)
          ); 
        });
      }

    if (preChecks && preChecks.length > 1 && node_details.length > 1 && fourGnodes.length > 0 && fiveGnodes.length > 0) {
      fourGnodes.forEach(siteDetailsNodes => {
        fourGprechecks = preChecks.filter(preCheck => {
          if (preCheck && preCheck.enodeb_ids && preCheck.enodeb_ids.length > 0 && preCheck.enodeb_ids.includes(siteDetailsNodes.node)) {
            return preCheck
          }
        })
      })
      fiveGnodes.forEach(siteDetailsNodes => {
        fiveGprechecks = preChecks.filter(preCheck => {
          if (preCheck && preCheck.enodeb_ids && preCheck.enodeb_ids.length > 0 && preCheck.enodeb_ids.includes(siteDetailsNodes.node)) {
            return preCheck
          }
        })
      })
    }
    if (preChecks && preChecks.length > 1 && fourGnodes.length > 0 && fiveGnodes.length > 0) {
      return fourGprechecks.length > 0 && fourGprechecks[0].status.toUpperCase() == "COMPLETED" && fiveGprechecks.length > 0 && fiveGprechecks[0].status.toUpperCase() == "COMPLETED";
    }else if (ericssonMMWnodes.length > 0 && nonEricssonMMWnodes.length === 0) {
      return preChecks && preChecks.length > 0 && ["COMPLETED", "COMPLETED WITH ERRORS"].includes(preChecks[0].status.toUpperCase())
    } else {
      return preChecks && preChecks.length > 0 && preChecks[0].status.toUpperCase() == "COMPLETED"
    }
  }

  enableConditionForMessageFastTextField = () => {
    if (this.state.isAutoSlrEnable && this.state.messageFastAcknowledged == null && this.state.messageFastAck === 'Yes') {
      return true
    } else if (this.state.isAutoSlrEnable && this.state.messageFastAcknowledged != null) {
      return true
    } else if (!this.state.isAutoSlrEnable && this.state.messageFastAcknowledged == null) {
      return true
    } else {
      return false
    }
  }

  enableConditionForMessageFastButton = () => {
    if (this.state.workTaskNotes == '' && this.state.messageFastAck == '') {
      return true
    } else if (this.state.messageFastAck === 'Yes' && this.state.workTaskNotes.length >= 1) {
      return false
    } else if (this.state.messageFastAck === 'No') {
      return false
    } else if (this.state.workTaskNotes.length >= 1) {
      return false
    } else {
      return true
    }
  }

  //reminder text message fast function
  handleOptionChange = (e) => {
    this.setState({ messageFastAck: e })
  }

  reminderTextForMessageFast = () => {

    let radioOptions = [
      { radioValue: 'Yes', radioLabel: 'Yes' },
      { radioValue: 'No', radioLabel: 'No' }
    ]
    if (this.state.isAutoSlrEnable) {
      return (
        <div>
          <div>
            <span style={{ color: 'red', fontSize: '13px' }}>Reminder: </span>
            You have the ability to use the automated features in Vendor Portal to proceed with your work without contacting FAST, unless you need support before getting started.
          </div>
          <div style={{ paddingTop: '2vh' }}>
            Do you need to contact FAST before starting your work?
          </div>
          <div style={{ marginLeft: '15px' }}>
            <MaterialRadioButtonsGroup 
              radioButtonList={radioOptions} 
              optionValue={this.state.messageFastAck}
              handleButtonChange={this.handleOptionChange} />
          </div>
        </div>
      )
    } else {
      return <div></div>
    }
  }

  //parameterised message fast update OSW
  updateMessageFast = async () => {
    if (this.state.messageFastAck === 'No') {
      this.setState({ messageFastAcknowledged: 'No' })
      await this.updateSLRStatus("NEW", this.state.workTaskNotes, "Vendor Assist")
      this.getLockData()
    } else {
      let text = `${this.state.workTaskNotes}`
      await this.updateSLRStatus("NEW", text, "Vendor Assist")
    }
  }

  render() {
    let { selectedRow, lockData, site, configData } = this.props
    let { isOffHours, isHoliday, offHoursMessage, IS_WORK_DAY } = this.state;
    let color = isHoliday ? '#BDBDBD' : ''
    let notesColor = this.state.notesStatus || this.state.attsStatus ? 'green' : 'red'
    let issoCondition = false
    let disableMessage = false
    let { realLoginId, loginId, isssouser, ssoUrl, realUser } = this.props
    let isReplaceAntennaWork = this.props.lockData && this.props.lockData.lockRequest && this.props.lockData.lockRequest.replace_antenna_work ? this.props.lockData.lockRequest.replace_antenna_work : '';
    let node_details = this.props.site.get("node_details") != null ? this.props.site.get("node_details").toJS() : []

    //offshore condition

    let offShore = false;
    if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
      offShore = realUser.toJS().isUserOffShore
    }

    if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.includes('ssologin') || offShore === "true") {
      issoCondition = true
    }
    if ([0, 6].includes(moment().day())) {
      const weekendExceptionMarkets = configData && configData.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "WEEKEND_EXCEPTION_OSW").length > 0 && configData && configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "WEEKEND_EXCEPTION_OSW").ATTRIBUTE_VALUE != null ?
        configData && configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "WEEKEND_EXCEPTION_OSW").ATTRIBUTE_VALUE.split(',') : [];
      if (weekendExceptionMarkets.includes(this.props.submarket) || (!this.props.isSnap && this.state.isErricson && this.props.opexVendors  && !this.state.isHoliday && this.state.isOffHours)) {
        disableMessage = false
      } else {
        disableMessage = true
      }
    }
    let isOffHourActive = !isOffHours ? isHoliday ? !isOffHours : isOffHours : isOffHours
    if (!isOffHourActive && !!this.props.lockData && !!this.props.lockData.lockRequest && !!this.props.lockData.lockRequest.request_detail && ['NEW', 'IN_PROGRESS', 'HAND_OFF'].includes(this.props.lockData.lockRequest.request_detail.status)) {
      isOffHourActive = true
      disableMessage = this.props.lockData.lockRequest.request_detail.status == 'HAND_OFF' ? true : disableMessage
    }
    // added this for AUTO SLR testing - to be removed later
    if (global.NODE_ENV == "development") {
      isOffHourActive = true
    }


    disableMessage = disableMessage ? !isOffHourActive ? false : disableMessage : disableMessage
    // console.log("enodeBSectorInfo",this.state.enodeBSectorInfo);
    if (IS_WORK_DAY && IS_WORK_DAY.toUpperCase() == 'Y') {
      disableMessage = false
      isHoliday = false
    }
    let backgroundColor = (!isHoliday || !!isOffHourActive) ? '#e9ecef' : ''
    if (this.state.submitLockSuccess) {
      const radioCellLists = this.sectorInfoTable() || []
      let healthCheckDetails = this.props.getHealthCheckReqs ? this.props.getHealthCheckReqs.toJS() : {}
      let preChecks = healthCheckDetails && Object.keys(healthCheckDetails).length > 0 && healthCheckDetails.enodeb_healthcheck && healthCheckDetails.enodeb_healthcheck.length > 0 ? healthCheckDetails.enodeb_healthcheck.filter(item => item.req_type == "Pre-Check" && item.osw_request_id == this.props.lock_unlock_request_id) : []
      let preChecksRunning = preChecks.length > 0 ? preChecks.filter(item => ["NEW", "IN PROGRESS"].includes(item.status.toUpperCase())) : []
      // let slrStatus = !!this.props.lockData && !!this.props.lockData.lockRequest && !!this.props.lockData.lockRequest.request_detail ? this.props.lockData.lockRequest.request_detail.display_status : ""
      let eNodeBSectorData = this.state.enodeBSectorInfo.length > 0 ? this.state.enodeBSectorInfo.map(item => {
        if (!!lockData && !!lockData.lockRequest && !!lockData.lockRequest.sectorlockdata && lockData.lockRequest.sectorlockdata.length > 0) {
         let lockUnlockSectorInfoObj = Object.keys(lockData.lockRequest).length > 0 && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata.find(obj => obj.SECTOR == item.sector && obj.ENODEB_ID == item.enodeb_id) : {}
          return {
            ...item,
            action_result: lockUnlockSectorInfoObj && Object.keys(lockUnlockSectorInfoObj).length > 0 ? ["NEW", "IN PROGRESS", "FAILED"].includes(lockUnlockSectorInfoObj.ACTION_STATUS.toUpperCase()) ? lockUnlockSectorInfoObj.ACTION_STATUS.toUpperCase() : item.lock_status.toUpperCase() : ""
          }
        } else {
          return {
            ...item,
            action_result: ""
          }
        }
      }) : []
      // Disable the sector lock if any sector lock is in progress 
      if (!!lockData && !!lockData.lockRequest && !!lockData.lockRequest.sectorlockdata && lockData.lockRequest.sectorlockdata.length > 0) {
        let lockUnlockSectorInprogress = Object.keys(lockData.lockRequest).length > 0 && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata.find(obj => ["NEW", "IN PROGRESS"].includes(obj.ACTION_STATUS.toUpperCase())) : {}
        let lockCompleted = Object.keys(lockData.lockRequest).length > 0 && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata.find(obj => obj.ACTION == "LOCK" && obj.ACTION_STATUS.toUpperCase() == "COMPLETED") : {}
        eNodeBSectorData = eNodeBSectorData.map(item => {
          return {
            ...item,
            sectorLockTriggered: (lockUnlockSectorInprogress && Object.keys(lockUnlockSectorInprogress).length > 0 || lockCompleted && Object.keys(lockCompleted).length > 0) ? true : false
          }
        })
      }
      let sectorInfoColumns = [
        {
          headerName: "eNodeB ID",
          field: "enodeb_id",
          flex: 1
        },
        {
          headerName: "Sector Name",
          field: "sector",
          flex: 1
        }, {
          headerName: this.state.isAutoSlrEnable ? "Vendor - Type" : "Vendor",
          field: "vendor",
          flex: 1,
          renderCell: row =>  {
            if (this.state.isAutoSlrEnable && row.row.vendor && row.row.node_type) {
              return `${row.row.vendor} - ${row.row.node_type}`
            } else {
              return row.row.vendor ? `${row.row.vendor}` : ""
            }
          }
        },
        {
          headerName: "Lock Status",
          field: "lock_status",
          flex: 1,
          renderCell: row =>  {
            if (row.row && row.row.lock_status) {
              return row.row.lock_status.toUpperCase()
            } else {
              return ""
            }
          }
        }
      ]
      let sectorInfoColumnsWithActions = [
        {
          headerName: "eNodeB ID",
          field: "enodeb_id",
          flex: 1.3
        }, 
        {
          headerName: "Sector Name",
          field: "sector",
          flex: 2
        }, 
        {
          headerName: this.state.isAutoSlrEnable ? "Vendor - Type" : "Vendor",
          field: "vendor",
          flex: 1,
          renderCell: row =>  {
            if (this.state.isAutoSlrEnable && row.row.vendor && row.row.node_type) {
              return `${row.row.vendor} - ${row.row.node_type}`
            } else {
              return row.row.vendor ? `${row.row.vendor}` : ""
            }
          }
        }, 
        {
          headerName: "Lock Status",
          field: "lock_status",
          flex: 0.8,
          renderCell: row =>  {
            if (row.row && row.row.lock_status) {
              return row.row.lock_status.toUpperCase()
            } else {
              return ""
            }
          }
        },
         {
          headerName: "Action",
          // field: "lock_status",
          flex: 0.8,
          renderCell : row => this.renderActionsColumn(row),
        },
         {
          headerName: "Action Result",
          field: "action_result",
          flex: 1
        }
      ]
      let notesSectionPlaceholder = this.props.slrStatus == "AUTO" ? "Notes ONLY. To get in touch with FAST, click Message FAST from the right-side of the screen." : "Enter Text"
      let enableReminderForMessageFast = this.props.slrStatus == 'AUTO' && this.state.messageFastAcknowledged === null;
      return (
        <div>
          <div style={{ "background": "#FFF" }}>
            {this.state.unlockLoader ? this.renderLoading() : this.state.unlockMessage.length > 0 && !isHoliday && isOffHourActive && <MessageBox messages={[this.state.unlockMessage]} onClear={this.resetMessages.bind(this)} className={this.state.unlockStatus ? "alert-success" : "alert-danger"} marginTop={true} />}
            <div className="row" style={{ "padding": "10px 0px", "margin": "20px 0px 0px 0px", "background": "black", "color": "#FFF", "textAlign": "center" }}>
              {this.renderRunHealthCheckBanner()}
            </div>
            {disableMessage ? <div className="text-danger" style={{ fontWeight: "bold" }}>FAST support is Monday through Friday. At this time, please contact on-call for sector lock requests</div> : null}
            {isHoliday && this.state.holidayEventMessage.length > 0 && <MessageBox messages={[this.state.holidayEventMessage]} onClear={this.resetHolidayMessage.bind(this)} className={"alert-danger"} marginTop={true} />}
            {!isOffHourActive && offHoursMessage.length > 0 && <MessageBox messages={[offHoursMessage]} className={"alert-danger"} marginTop={true} />}
            {!this.props.isSnap && this.state.showBanner && <Alert
                style={{ padding: '1px', marginRight: '25px' }}
                severity="warning">FAST will have the opportunity to rate the onsite work with rating from 1 (worst) to 5 (best).
              </Alert>}
            {/* TOP LABEL */}
            <div style={{ "display": "flex", "flexDirection": "row", "flexWrap": "wrap", "width": "100%", "height": "100px" }}>
              <div style={{ "padding": "15px", "display": "flex", "flexDirection": "column", "width": "100%" }} >
                <table>
                  <tbody>
                    <tr className="row" style={{ display: "flex", alignItems: "center" }}>
                      <td className="Form-group no-border col-lg-2">
                        <div ><b style={{ wordWrap: 'break-word', 'overflow': 'hidden' }}>Request ID</b></div>
                        <div style={{ wordWrap: 'break-word', 'overflow': 'hidden' }}>{!!this.props.lockData && !!this.props.lockData.lockRequest && !!this.props.lockData.lockRequest.request_detail ? this.props.lockData.lockRequest.request_detail.lock_unlock_request_id : ''}</div>
                      </td>
                      <td className="Form-group no-border col-lg-2">
                        <div><b style={{ wordWrap: 'break-word', 'overflow': 'hidden' }}>Request Status</b></div>
                        <div style={{ wordWrap: 'break-word', 'overflow': 'hidden', 'background': '#eeddbe99', 'color': '#ff8300', 'width': '100px', 'textAlign': 'center' }}>{this.props.slrStatus}</div>
                      </td>
                      <td className="Form-group no-border col-lg-5">
                        {this.state.isAutoSlrEnable &&
                          this.props.slrStatus == 'AUTO' &&
                          this.props.nsa == "NO" &&
                          this.state.enodeBSectorInfo.length > 0 &&
                          preChecksRunning.length > 0 &&
                          <span style={{ color: "blue" }}>Precheck is inprogress, please wait for sector lock ability</span>
                        }
                        {this.state.isAutoSlrEnable &&
                          this.props.slrStatus == 'AUTO' &&
                          this.state.retScanRunning&&
                          <span style={{ color: "blue" }}>RET scan/update in progress</span>
                        }
                        {this.state.isAutoSlrEnable &&
                          this.props.slrStatus == 'AUTO' &&
                          this.props.nsa == "NO" &&
                          this.state.enodeBSectorInfo.length > 0 &&
                          this.state.showRadioUpdateInprogress && <span style={{ color: "blue" }}>Samsung radio serial number update is running and it might take a few minutes to complete, Please wait…</span>}
                      </td>
                      <td className="Form-group no-border col-lg-3">
                        {this.props.slrStatus == 'AUTO' &&
                          <div style={{ display: "flex", justifyContent: "end" }}>
                            <VPButton buttonName="Message FAST" messageFAST={() => {
                              this.getOSWAutoReplyMessage()
                              this.setState({
                                showWorkTaskNotesSection: !this.state.showWorkTaskNotesSection,
                                messageFastAck: ''
                              })
                                logActioninDB(
                                    this.props.loginId,
                                    this.props.user && this.props.user.get('email'),
                                    this.props.vendorId,
                                    this.props.workORderInfo.get('workorder_id'),
                                    this.props.user && this.props.user.get('vendor_area'),
                                    this.props.user && this.props.user.get('vendor_region'),
                                    "Message FAST",
                                    "Message FAST",
                                    "Message FAST",
                                    this.props.lock_unlock_request_id 
                                  );
                            }} />
                          </div>
                        }
                      </td>
                    </tr>
                    {this.props.nsa == "YES" &&
                      !this.props.SectorInfoLoading &&
                      this.state.enodeBSectorInfo.length > 0 &&
                      <tr style={{ display: "flex", justifyContent: "center" }}>
                        <span style={{ color: "blue" }}>This OSW is for non service affecting work. Sector lock/unlock action is disabled</span></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            {this.state.showWorkTaskNotesSection &&
              <div>
                <div style={{ margin: "15px", border: "1px solid gray", padding: "10px" }}>
                  {this.state.autoReplyMessages.length > 0 && this.state.isAutoSlrEnable && this.props.auto_reply_sent == "N" &&
                    <div>
                      <Alert
                        style={{ padding: '1px' }}
                        severity="info">{this.state.autoReplyMessages.map(message => <div key={message.MESSAGE}>{message.MESSAGE}</div>)}
                      </Alert>
                    </div>}
                  {enableReminderForMessageFast ? this.reminderTextForMessageFast() : null}
                  {this.enableConditionForMessageFastTextField() ? <textarea
                    style={{ margin: "5px", width: "100%" }}
                    rows={2}
                    placeholder={this.state.messageFastAck === 'Yes' ? 'Please describe your support need or question to FAST' : 'Enter Work Task notes'}
                    onChange={this.handleWorkTaskNotes}
                  ></textarea>
                    : null}
                  <button
                    style={{ width: "fit-content", 'padding': '0.5em 2.14em' }}
                    className="Button--primary"
                    disabled={this.enableConditionForMessageFastButton()}
                    onClick={() => {
                      this.updateMessageFast()
                      this.setState({ showWorkTaskNotesSection: false })
                    }}>Submit</button>
                </div>
              </div>}
            <div className="row" style={{ display: "flex", alignItems: "end", margin: "0px" }}>
              {!this.props.SectorInfoLoading ? this.displayRefreshLink() : <div className='col-4'></div>}
              {this.props.SectorInfoLoading ||
                this.state.refreshPageLoader ||
                this.props.lockDataLoading ||
                this.state.sectorLockUnlockTriggered ? <div className="col-4">{this.renderLoading()}</div> : <div className="col-4"></div>}
              {this.state.isAutoSlrEnable &&
                this.props.nsa === 'NO' &&
                this.props.slrStatus == 'AUTO' &&
                this.state.preCheckCompleted &&
                this.state.enodeBSectorInfo.length > 0 && this.displayLegendForLockUnlock()}
            </div>
            {/*SECTOR INFO TABLE */}
            <div className="col-md-12" style={{ overflow: "hidden", minHeight : '200px', height: '300px' }} >
              {!this.props.SectorInfoLoading &&
                <DataGrid 
                columns={
                  this.props.slrStatus == "AUTO" &&
                  ( this.findPreCheckStatus() || this.props.lockData?.lockRequest?.request_detail?.stay_as_auto == "Y") &&
                        this.state.showRadioUpdateInprogress === false &&
                        this.props.nsa === "NO" ? sectorInfoColumnsWithActions : sectorInfoColumns
                }
                rows={this.state.enodeBSectorInfo.length > 0 ? eNodeBSectorData : []}
                getRowId={(row) => row.sector}
                rowHeight={35}
                columnHeaderHeight={35}
                initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10}
                    },
                  }}
                pageSizeOptions={[10, 15, 20]}
                sx={{ 
                    '& .MuiTablePagination-toolbar > *': {fontSize: '1rem'},
                    '& .MuiTablePagination-toolbar': {alignItems: 'flex-end'},
                    '& .MuiTablePagination-input': {marginBottom: '7px'},
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                    fontSize:'13px',
                    minheight:'100px'  
                    }}
                    disableRowSelectionOnClick
            />
                }
               
            </div>
            {this.state.showLockUnlockConfirmAlert &&
              <div className='row' style={{ display: "grid", border: "1px solid gray", margin: "5px", padding: "5px" }}>
                <>
                  <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Are you sure you want to {this.state.selectedSectorLockUnlock.lock_status == "unlocked" ? "LOCK" : "UN LOCK"} sector {this.state.lockedOrUnlockedSectorName} for {this.state.lockedOrUnlockedSectors.toString()}?</FormLabel>
                  <FormControl component="fieldset">
                    <RadioGroup
                      style={{ flexDirection: "initial" }}>
                    <FormControlLabel value="Yes" control={<Radio onChange={() => { this.state.selectedSectorLockUnlock.lock_status.toLowerCase() == "unlocked" ? this.triggerSectorLockUnlock() : (this.state.isSamsung && (isReplaceAntennaWork.toUpperCase() == "YES" || isReplaceAntennaWork.toUpperCase() == "NOT SURE") ? this.setState({ isReplaceAntenna: true }) : (this.state.isErricson && (isReplaceAntennaWork.toUpperCase() == "YES" || isReplaceAntennaWork?.toUpperCase() == 'NOT SURE')) ? this.setState({ isReplaceAntenna: true }) : this.triggerSectorLockUnlock()) }} color="primary" />} label="Yes" />                      <FormControlLabel value="No" control={<Radio onChange={() => this.setState({ showLockUnlockConfirmAlert: false, isReplaceAntenna: false, isReplacingEqipment: '' })} color="primary" />} label="No" />
                    </RadioGroup>
                  </FormControl>
                </>
                {/* {!this.props.isSnap && this.state.isAutoSlrEnable && this.state.isReplaceAntenna && this.state.isErricson && this.state.selectedSectorLockUnlock.lock_status.toLowerCase() == "locked" && isReplaceAntennaWork.toUpperCase() == 'YES' &&
                  <>
                    <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Are you replacing any more RET/Antenna/CBRS equipment on another sector?</FormLabel>
                    <FormControl component="fieldset">
                      <RadioGroup
                        style={{ flexDirection: "initial" }}>
                        <FormControlLabel value="Yes" control={<Radio onChange={() => this.triggerSectorLockUnlock()} color="primary" />} label="Yes" />
                        <FormControlLabel value="No" control={<Radio onChange={(event) => this.setState({ isReplacingEqipment: event.target.value })} color="primary" />} label="No" />
                      </RadioGroup>
                    </FormControl>
                  </>
                }
                {this.state.isAutoSlrEnable && this.state.isReplaceAntenna && this.state.isSamsung && this.state.selectedSectorLockUnlock.lock_status.toLowerCase() == "locked" && (isReplaceAntennaWork.toUpperCase() == 'YES' || isReplaceAntennaWork.toUpperCase() == 'NOT SURE') &&
                  <>
                    <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Did you replace RET/Antenna/Radio today?</FormLabel>
                    <FormControl component="fieldset">
                      <RadioGroup
                        style={{ flexDirection: "initial" }}>
                        <FormControlLabel value="Yes" control={<Radio onChange={(event) => this.setState({ isReplacingEqipment: event.target.value })} color="primary" />} label="Yes" />
                        <FormControlLabel value="No" control={<Radio onChange={() => this.triggerSectorLockUnlock()} color="primary" />} label="No" />
                      </RadioGroup>
                    </FormControl>
                  </>
                } */}
                {(this.state.selectedSectorLockUnlock?.lock_status?.toLowerCase() == "locked" && this.state.isSamsung && (isReplaceAntennaWork?.toUpperCase() == 'YES' || isReplaceAntennaWork?.toUpperCase() == 'NOT SURE') && this.state.isReplaceAntenna) &&
                  <>
                    <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Which equipment did you Replace?</FormLabel>
                    <FormControl component="fieldset">
                      <FormGroup style={{ flexDirection: "initial" }}>
                        {this.state.checkList && this.state.checkList.length >= 1 && this.state.checkList.map(item => {
                          return (
                            <div key={item.value} style={{ display: 'flex', alignItems: 'center' }}>
                              <Checkbox
                                checked={item.checked}
                                color="primary"
                                onChange={() => this.handleCheckEquipValue(item.value)}
                                inputProps={{ 'aria-label': 'controlled' }}
                                disabled={item.value !== "None" && this.state.checkList.find(i => i.value === "None")?.checked || item.value === "None" && this.state.checkList.some(i => i.value !== "None" && i.checked)}
                              /> <span>{item.value}</span></div>)
                        })}
                      </FormGroup>
                    </FormControl>
                    {this.state.replacingEquipment && this.state.replacingEquipment?.length > 0 &&
                      <div style={{ marginTop: '15px', marginLeft: '16px' }}>
                        <button className="Button--secondary btn btn-sm" onClick={(e) => this.handleAnttennaWork(e)} >
                          <b>Submit</b>
                        </button></div>}
                  </>}

                {(this.state.selectedSectorLockUnlock?.lock_status?.toLowerCase() == "locked" && this.state.isErricson && (isReplaceAntennaWork?.toUpperCase() == 'YES' || isReplaceAntennaWork?.toUpperCase() == 'NOT SURE') && this.state.isReplaceAntenna) &&
                  <>
                    <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Which equipment did you Replace?</FormLabel>
                    <FormControl component="fieldset">
                      <FormGroup style={{ flexDirection: "initial" }}>
                        {this.state.checkList && this.state.checkList.length >= 1 && this.state.checkList.map(item => {
                          return (
                            <div key={item.value} style={{ display: 'flex', alignItems: 'center' }}>
                              <Checkbox
                                checked={item.checked}
                                color="primary"
                                onChange={() => this.handleCheckEquipValue(item.value)}
                                inputProps={{ 'aria-label': 'controlled' }}
                                disabled={item.value !== "None" && this.state.checkList.find(i => i.value === "None")?.checked || item.value === "None" && this.state.checkList.some(i => i.value !== "None" && i.checked)}
                              /> <span>{item.value}</span></div>)
                        })}
                      </FormGroup>
                    </FormControl>
                    {this.state.replacingEquipment && this.state.replacingEquipment?.length > 0 &&
                      <div style={{ marginTop: '15px', marginLeft: '16px' }}>
                        <button className="Button--secondary btn btn-sm" onClick={(e) => this.handleAnttennaWork(e)} >
                          <b>Submit</b>
                        </button></div>}
                  </>}
              </div>}

            <div style={{ "display": "flex", "flexDirection": "row", "flexWrap": "wrap", "width": "100%" }}>
              {/* ADDITIONAL INFO */}
              <div style={{ "padding": "10px 10px 10px 10px", "minHeight": "200px", "display": "flex", "flexDirection": "column", "flexBasis": "100%", "flex": 1, "width": "50%" }}>
                <div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Additional Info</p>
                  </div>
                  {this.state.notesLoader ? this.renderLoading() : this.state.notesMessage.length > 0 && <b style={{ "color": notesColor, margin: '-28px', marginLeft: '100px' }}>{this.state.notesMessage}</b>}
                </div>
                <textarea rows={4} id="notesSection" name="ivrLoginSectorSection" style={{ height: "90px", "padding": "10px 10px 10px 10px", "borderRadius": "3px", width: '100%', color: color }} placeholder={notesSectionPlaceholder} onChange={this.handleTextChange.bind(this)} disabled={isHoliday || !isOffHourActive ? true : false} />
                <div className="mt-3"><button id="Login" type="submit" className="Button--secondary  btn btn-md u-floatRight" onClick={this.handleAddNotes.bind(this)} disabled={(!!this.props.lockData && !!this.props.lockData.lockRequest && (this.props.lockData.lockRequest.request_detail.status == 'HAND_OFF' || this.props.lockData.lockRequest.request_detail.status == 'COMPLETED' || this.props.lockData.lockRequest.request_detail.status == 'CANCELLED')) || this.state.Comments.length === 0 || issoCondition || disableMessage || isHoliday || !isOffHourActive} >
                  {!!this.props.lockData &&
                    !!this.props.lockData.lockRequest &&
                    !!this.props.lockData.lockRequest.request_detail &&
                    this.props.lockData.lockRequest.request_detail.status.toUpperCase() == "AUTO" ? "Add Notes" : "Message FAST"}
                </button></div>
                {this.state.root_drive === true && <div style={{ "padding": "10px 10px 10px 10px" }}>
                  <div className="mt-1 mb-2 text-center bg-danger text-white" style={{ "height": "6vh", "lineHeight": "6vh" }} > <b> Caution: Root Metrics is active in the area </b> </div>
                </div>
                }
              </div>
              {/* ATTACHMENTS */}
              <div style={{ "padding": "10px 10px 0px 10px", "display": "flex", "flexDirection": "column", "flexBasis": "100%", "flex": 1, "width": "50%" }} >
                <div style={{ 'paddingBottom': '6px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Attachments</p>
                  {this.state.attsLoader ? this.renderLoading() : this.state.attsMessage.length > 0 && <b style={{ "color": notesColor, paddingLeft: '10px' }}>{this.state.attsMessage}</b>}
                </div>
                <div className={"text-center dropzone-width"}>
                  <Dropzone onDrop={this.onFileDrop.bind(this)}>
                    {({ getRootProps, getInputProps }) => (
                      <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                  {this.state.filesData.length > 0 && <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />}
                </div>
                <div className="mt-3 mb-5"><button id="Login" type="submit" className="Button--secondary  btn btn-md u-floatRight" onClick={this.postAttachment.bind(this)} disabled={(!!this.props.lockData && !!this.props.lockData.lockRequest && (this.props.lockData.lockRequest.request_detail.status == 'HAND_OFF' || this.props.lockData.lockRequest.request_detail.status == 'COMPLETED' || this.props.lockData.lockRequest.request_detail.status == 'CANCELLED')) || this.state.filesData.length === 0 || issoCondition || isHoliday || disableMessage || !isOffHourActive} >ADD ATTACHMENTS</button></div>
              </div>
            </div>
            {/* HEALTH CHECKKKKKKK */}
            <div>
              <Accordion
                style={{ boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                TransitionProps={{ unmountOnExit: true }}
                defaultExpanded={true}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon style={{ "color": "#FFF" }} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  style={{ backgroundColor: "black", color: "white" }}>
                  <b>Health Check (The health check could take up to 15 mins to complete)</b>
                </AccordionSummary>
                <AccordionDetails>
                  <div style={{ width: "100%" }}>
                    <HealthCheck
                      notifref={this.props.notifref}
                      selectedRow={this.props.selectedRow}
                      healthCheckInSiteAccess={true}
                      lock_unlock_request_id={this.props.lock_unlock_request_id}
                      submitSLRNotes={this.submitSLRNotes}
                      isErricson={this.state.isErricson}
                      isReplacingRETAntennaRadio={isReplaceAntennaWork}
                      updateSLRStatus={this.updateSLRStatus}
                      oswStatus={this.props.slrStatus}
                      showSectorLockAction={this.showSectorLockAction}
                      disableSectorlockActions={this.disableSectorlockActions}
                      isWorkOrder={!this.props.isSnap}
                      timeZone={this.state.timeZone}
                      isSnap={this.props.isSnap}
                      lockData = {this.props.lockData}
                      selectedWO= {{workORderInfo : this.props.workORderInfo}}
                      workORderInfo = {this.props.workORderInfo}
                    />
                  </div>
                </AccordionDetails>
              </Accordion>
              <br />
            </div>
            <div>
              <Accordion
                defaultExpanded={true}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon style={{ "color": "#FFF" }} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  style={{ "background": "black", "color": "#FFF", "textAlign": "center" }}>
                  <b> Notes / Attachments </b>
                </AccordionSummary>
                <AccordionDetails style={{ "display": "inline" }}>
                  <NotesAndAttachments
                    timeZone={this.state.timeZone}
                    notesData={!!this.props.lockData && !!this.props.lockData.lockRequest && !!this.props.lockData.lockRequest.notes ? this.props.lockData.lockRequest.notes : []}
                    attachementsData={!!this.props.lockData && !!this.props.lockData.lockRequest && !!this.props.lockData.lockRequest.attachments ? this.props.lockData.lockRequest.attachments : []}
                    getLockUnlockData={this.getLockUnlockData}
                    lockDataLoading={this.props.lockDataLoading}
                    fileDownload={this.fileDownload}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </div>
      )
    } else {
      if (this.props.lockDataLoading || this.state.getSectorLockDataLoading || (this.state.isAutoSlrEnable && this.props.SectorInfoLoading)) return this.renderLoading()
      return (<div style={{ "background": "#FFF" }}>
        {this.state.unlockLoader ? this.renderLoading() : this.state.unlockMessage.length > 0 && !isHoliday && <MessageBox messages={[this.state.unlockMessage]} onClear={this.resetMessages.bind(this)} className={this.state.unlockStatus ? "alert-success" : "alert-danger"} marginTop={true} />}
        {this.state.workPendingMSg.length > 0 && !isHoliday && <MessageBox messages={[this.state.workPendingMSg]} onClear={this.resetMessagesWorPening.bind(this)} className={"alert-danger"} marginTop={true} />}
        <div className="">
          <div className="row mt-3 mb-3" style={{ "padding": "10px 0px", "margin": "20px 0px 0px 0px", "background": "black", "color": "#FFF", "textAlign": "center" }}>
            {this.renderRunHealthCheckBanner()}
            <div className="col-md-4">{this.state.root_drive === true && <div style={{ "backgroundColor": "red", "color": "white" }}>Caution: ROOT metrics is active in the area</div>}</div>
          </div>
          {isHoliday && this.state.holidayEventMessage.length > 0 && <MessageBox messages={[this.state.holidayEventMessage]} onClear={this.resetHolidayMessage.bind(this)} className={"alert-danger"} isHoliday={isHoliday} marginTop={true} />}
          {!isOffHourActive && offHoursMessage.length > 0 && <MessageBox messages={[offHoursMessage]} className={"alert-danger"} marginTop={true} />}
          {disableMessage ? <div className="text-danger ml-3 mb-3 mt-3" style={{ fontWeight: "bold" }}>FAST support is Monday through Friday. At this time, please contact on-call for sector lock requests</div> : null}
          <div className="row">
            {!this.props.workScheduled && this.props.oswNoScheduleWarning === "Y" && <div className="col-md-12" style={{ margin: '10px' }}>
              <Alert
                style={{ padding: '1px', marginRight: '25px' }}
                severity="warning">Verizon policy requires every onsite work to be scheduled in the Vendor Portal. This {this.props.isSnap ? "Project" : "Work Order"} {this.props.workORderInfo.get('workorder_id')} was NOT scheduled in the Vendor Portal. You can proceed with the onsite work at this time. However, please work with your portal admin personnel to schedule the work in Vendor Portal next time.
              </Alert>
            </div>}
            {this.state.autoReplyMessages.length > 0 && !this.state.isAutoSlrEnable &&
              <div className="col-md-12" style={{ margin: '10px' }}>
                <Alert
                  style={{ padding: '1px', marginRight: '25px' }}
                  severity="info">{this.state.autoReplyMessages.map(message => <div key={message.MESSAGE}>{message.MESSAGE}</div>)}
                </Alert>
              </div>}
            {this.props?.is_vendor_trained?.toUpperCase() !== "YES" && this.state.isAutoSlrEnable && <div className="col-md-12" style={{ margin: '12px' }}>
              <>
                <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Your company is currently using AUTOMATION, Have you been trained to use this function?</FormLabel>
                <FormControl component="fieldset">
                  <RadioGroup style={{ flexDirection: "initial" }}>
                    <FormControlLabel value="Yes" control={<Radio onChange={() => { this.setState({ isVendorTrained: "Yes" }) }} color="primary" />} label="Yes" disabled={isHoliday || !isOffHourActive || disableMessage || this.state.errorMessage || this.state.workPending ? true : false} />
                    <FormControlLabel value="No" control={<Radio onChange={() => { this.setState({ isVendorTrained: "No" }) }} color="primary" />} label="No" disabled={isHoliday || !isOffHourActive || disableMessage || this.state.errorMessage || this.state.workPending ? true : false} />
                  </RadioGroup>
                </FormControl>
              </>
            </div>}
            <div className="col-md-6">
              <div className="Form-group width80" style={{ width: '100%', marginLeft: '12px' }}>
                <textarea rows={2} placeholder="Please briefly describe the scope of work for the day, including what immediate action is required for support."
                  onChange={this.updateReason} className="form-control" required disabled={isHoliday || !isOffHourActive || disableMessage || this.state.errorMessage || this.state.workPending ? true : false} />
              </div>
            </div>
            <div className="col-md-2" >
              <label className="Form-label" >Service Affecting<span style={{ color: 'red' }}>*</span></label>
              <select style={{ height: '31px', padding: '0 0 0 20px', width: '200px', backgroundColor: backgroundColor }} role="combobox" className="Form-input"
                onChange={this.updateCheck} required defaultValue={this.props.isSnap ? "" : "No"} disabled={(!this.props.isSnap || isHoliday || !isOffHourActive || disableMessage) && true}>
                <option disabled value="" >Choose the option</option>
                <option value="No" disabled={isHoliday || !isOffHourActive || disableMessage || this.state.errorMessage || this.state.workPending ? true : false} >Yes, service affecting.</option>
                <option value="Yes" disabled={isHoliday || !isOffHourActive || disableMessage || this.state.errorMessage || this.state.workPending ? true : false} >No, non-service affecting.</option>
              </select>
            </div>
          </div>
          {this.state.nonServiceImpact.toUpperCase() == "NO" && this.props.isSnap &&
            <>
              <label style={{ paddingLeft: "15px" }}>Are you cutting over to new radio equipment TODAY with a group <span style={{ fontWeight: 'bold', color: 'red' }}>other</span> than FAST?</label>
              <label style={{ paddingLeft: "10px"}}>
                <input style={{ marginLeft: "5px" }} type="radio" onChange={(e) => { this.setState({ isCuttingOver: e.target.value ,replacingAnteenaRadio: "" }) }} value="Yes" name="cuttingOver" /> Yes, I will work with other teams today.
                <input style={{ marginLeft: "5px" }} type="radio" onChange={(e) => { this.setState({ isCuttingOver: e.target.value }) }} value="No" name="cuttingOver" /> No, I only need FAST/VP Automation today.
              </label>
            </>
          }
          {this.state.isSamsung && 
          ( (!this.props.isSnap) || 
            (this.props.isSnap && this.state.isCuttingOver === "No") 
          ) &&
            <div style={{ marginTop: '25px', marginLeft: '16px' }}>
              <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Are you replacing RET/Antenna/Radio equipment?</FormLabel>
              <FormControl component="fieldset">
                <RadioGroup
                  value={this.state.replacingAnteenaRadio}
                  onChange={this.handleChange}
                  style={{ flexDirection: "initial" }}>
                  <FormControlLabel value="Yes" control={<Radio color="primary" />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio color="primary" />} label="No" />
                  <FormControlLabel value="Not Sure" control={<Radio color="primary" />} label="Not Sure" />
                </RadioGroup>
              </FormControl>
            </div>}
          {this.state.isErricson && ((!this.props.isSnap) || (this.props.isSnap && this.state.isCuttingOver === "No")) &&
            <div style={{ marginTop: '25px', marginLeft: '16px' }}>
              <FormLabel component="legend" style={{ fontSize: '14px', fontWeight: 'bold' }}>Are you replacing RET/Antenna/CBRS equipment ?</FormLabel>
              <FormControl component="fieldset">
                <RadioGroup
                  value={this.state.replacingAnteenaRadio}
                  onChange={this.handleChange}
                  style={{ flexDirection: "initial" }}>
                  <FormControlLabel value="Yes" control={<Radio color="primary" />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio color="primary" />} label="No" />
                  <FormControlLabel value="Not Sure" control={<Radio color="primary" />} label="Not Sure" />
                </RadioGroup>
              </FormControl>
            </div>}
          <div style={{ padding: '12px' }}>
            <button className="Button--secondary btn btn-sm" onClick={this.handleOSWCreateReq.bind(this)} disabled={this.state.workPending || issoCondition || this.state.unlockLoader
              || this.state.requestCheck || this.state.requestReason || (!this.props.isSnap && this.state.replacingAnteenaRadio.length < 1 && this.state.isSamsungErricson) || isHoliday || !isOffHourActive || disableMessage || this.state.errorMessage || (this.props.isSnap && this.state.isCuttingOver.length <= 0 && this.state.nonServiceImpact.toUpperCase() == "NO")}>
              <b>Request</b>
            </button>
          </div>
          {Object.keys(this.props.enodeBData).length > 0 && !!this.props.enodeBData.radio_cell_list && this.props.enodeBData.radio_cell_list.length > 0 && !this.state.workPending && <div style={{ "padding": "7pt 10px 0px 10px" }}>
            <div><b>Sector Status</b></div>
            <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
              <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                <tr>
                  <th>eNodeb ID</th>
                  <th>Cell List / Radio Units</th>
                  <th>Vendor</th>
                </tr>
              </thead>
              <tbody>
                {this.state.radioCellList.map(val => {
                  return (<tr key={val.eenodeb_id}>
                    <td>{val.enodeb_id ? val.enodeb_id : ''}</td>
                    <td>{val.cell_list.length > 0 ? val.cell_list.join(', ') : val.radio_units.length > 0 ? val.radio_units.join(', ') : ''}</td>
                    <td>{val.vendor ? val.vendor : ''}</td>
                  </tr>)
                })}
              </tbody>
            </table>
          </div>}
        </div>
      </div>)
    }
  }
}



function stateToProps(state, props) {

  let { lock_unlock_request_id = '' } = props
  let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
  let user = state.getIn(["Users", "entities", "users", loginId], Map())
  let vendorId = user.get('vendor_id')
  let userList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let configData = state.getIn(['Users', 'configData', 'configData'], List())
  // Display warning message if no schedule while creating osw]
  let oswNoScheduleWarning = "N"
  let radioUpdateNodeDetailsFilter = []
  if(configData) {
    let configAttributeName = props.isSnap ? 'OSW_NO_SCHEDULE_MSG_PROJECT' : 'OSW_NO_SCHEDULE_MSG_VWRS'
    let cfgObject = configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === configAttributeName)
    if(cfgObject && Object.keys(cfgObject).length > 0) {
      oswNoScheduleWarning = cfgObject.ATTRIBUTE_VALUE;
    }
    let samsungRadioUpdateFilter = configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "SAMSUNG_SN_RADIO_UPDATE_FILTER")
    if(samsungRadioUpdateFilter) {
      radioUpdateNodeDetailsFilter = samsungRadioUpdateFilter.ATTRIBUTE_VALUE.split(",")
    }
  }
  let lockDataLoading = state.getIn(["Sites", loginId, vendorId, props.workORderInfo.get('workorder_id'), lock_unlock_request_id, "lockDataLoading"], false)
  let lockData = state.getIn(["Sites", loginId, vendorId, props.workORderInfo.get('workorder_id'), lock_unlock_request_id, "lockReqData"], Map())
  let nsa = '';
  let slrStatus = '';
  let auto_reply_sent = ''
  let replace_antenna_work = ''
  let sectorLockData = []
  let oswRequestId = ""
  if (lockData && lockData.size > 0) {
    lockData = lockData.toJS()
    if (lockData && lockData.lockRequest) {
      nsa = lockData && lockData.lockRequest && lockData.lockRequest.nsa && lockData.lockRequest.nsa.toUpperCase();
      slrStatus = lockData && lockData.lockRequest && lockData.lockRequest.request_detail && lockData.lockRequest.request_detail.display_status && lockData.lockRequest.request_detail.display_status.toUpperCase()
      auto_reply_sent = lockData && lockData.lockRequest && lockData.lockRequest.request_detail && lockData.lockRequest.request_detail.auto_reply_sent && lockData.lockRequest.request_detail.auto_reply_sent.toUpperCase()
      replace_antenna_work = lockData?.lockRequest?.replace_antenna_work?.toUpperCase()
      sectorLockData =  lockData?.lockRequest?.sectorLockData,
      oswRequestId = lockData?.lockRequest?.request_detail?.lock_unlock_request_id
    }
  }
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''
  let meta_unid = (props.workORderInfo && props.workORderInfo.get("meta_universalid")) ? props.workORderInfo.get("meta_universalid") : null
  let liveStatusDataLoading = state.getIn(['Sites', loginId, "sectorInfo", "sectorInfoLoading"], false)
  let liveStatusData = state.getIn(['Sites', loginId, "sectorInfo", "sectorInfoData", "sectors"], List())
  let sectorInfoDataError = state.getIn(['Sites', loginId, "sectorInfo", "sectorInfoData", "errors"], '')
  let uniqueSectorInfo = []
  if (!liveStatusDataLoading && liveStatusData && liveStatusData.size > 0) {
    uniqueSectorInfo = uniqBy(liveStatusData.toJS(), "sector")
    uniqueSectorInfo = sortBy(uniqueSectorInfo, ["enodeb_id", "sector"])
  }
  let events = state.getIn(["VendorDashboard", loginId, "eventsforSite", "eventsforSiteDetails"], Map())
  events = events?.toJS()?.getCalenderEventsForSite ? events?.toJS()?.getCalenderEventsForSite?.data : [];
    let today = moment().format('YYYY-MM-DD');
    let scheduleFound = events.find(item => (moment(today).isBetween(moment(item.start).format('YYYY-MM-DD'), moment(item.end).format('YYYY-MM-DD'), null, '[]')) && item.workId == props.workORderInfo.get('workorder_id'));
    let scheduleFoundFuture = !scheduleFound && events.find(item => (moment(today).isBefore(moment(item.start).format('YYYY-MM-DD'))) && item.workId == props.workORderInfo.get('workorder_id'));
    let opexVendors = configData.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "OSW_OPEX_VENDORS").length > 0 ? configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "OSW_OPEX_VENDORS").ATTRIBUTE_VALUE.split(",").includes(vendorId.toString()) : false
    let enableRetflag = configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "ENABLE_RET_SCAN")?.ATTRIBUTE_VALUE || 'N';
    return {
    sectorInfoData: uniqueSectorInfo,
    SectorInfoLoading: liveStatusDataLoading,
    sectorInfoDataError,
    site: state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()),
    switchInfo: state.getIn(["Switch", loginId, "switch", "switchDetails"], List()),
    market,
    submarket,
    vendorId,
    loginId,
    configData,
    user,
    userList,
    lockDataLoading,
    lockData,
    nsa,
    slrStatus,
    realLoginId,
    realUser,
    ssoUrl,
    isssouser,
    healthCheckDetails: state.getIn(["Sites", loginId, "siteDetails", "healthDetails"], List()),
    retScanDetails: state.getIn(["Sites", "retScan", oswRequestId, "result"], List()),
    getHealthCheckReqs: state.getIn(["Sites", loginId, "healthCheckReqs"], List()),
    isWoloading: state.getIn(["VendorDashboard", "workOrderDetail", "isWoLoading", meta_unid], false),
    workOrderDetailInfo: state.getIn(["VendorDashboard", "workOrderDetail", meta_unid], Map()),
    is_vendor_trained: user?.toJS()?.is_vendor_trained,
    workScheduled: scheduleFound && Object.keys(scheduleFound).length > 0,
    scheduleFoundFuture,
    oswNoScheduleWarning,
    opscalender_eventid: scheduleFound && Object.keys(scheduleFound).length > 0 ? scheduleFound.eventId : "",
    event_start_date: scheduleFound && Object.keys(scheduleFound).length > 0 ? scheduleFound.start : "",
    event_end_date: scheduleFound && Object.keys(scheduleFound).length > 0 ? scheduleFound.end : "",
    kirke_id: scheduleFound && Object.keys(scheduleFound).length > 0 ? scheduleFound.autoCreatedKirkeRequest : "",
    auto_reply_sent,
    radioUpdateNodeDetailsFilter,
    replace_antenna_work,
    appNotification: state.getIn(['AppNotificationReducer', 'appNotification'], Map()),
    oswRequestId,
    opexVendors,
    refreshEnable: state.getIn(["Sites", "refreshEnable"], false),
    enableRetflag
  }
}
export default connect(stateToProps, { ...AppNotificationActions, ...VendorActions, updateUserObjReducer, ivrEmailNotify })(WorkWithFAST)
