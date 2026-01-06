import React from "react"
import { connect } from "react-redux"
import MainContent from "../../Layout/components/MainContent"
import * as VendorActions from "../actions"
import Modal from "../../Layout/components/Modal"
import WorkOrderDetails from "./WorkOrderDetails"
import SnapModal from "../../CapitalProjectDashboard/SnapModal"
import * as utils from "../utils"
import "./style.css"
import moment from 'moment'
import Loader from '../../Layout/components/Loader'
import 'react-dates/initialize'
import { Map, List, fromJS } from 'immutable'
import { capitalProjectSelectedRow, getProjectInfoSlr } from "../../CapitalProjectDashboard/actions"
import { getConflictkirkeEventsForSite, getCalenderEventsForSite } from "../../VendorDashboard/actions"
import WorkOrderGrid from './WorkOrderGrid'
import Dashboard from './Dashboard'
import PanVZRF from '../../Layout/components/PanVZRF'
import { FILTER_STATUS } from '../utils'
import { fetchSitesBySubmarket } from '../../sites/actions'
import { fetchSwitchesBySubmarket } from '../../Switch/actions'
import { fetchBannerDetails } from '../../PreventiveMaintenance/actions'
import { fetchDataToExport } from '../../VendorDashboard/actions'
import RadioButtonStyle from '../../Forms/components/RadioButtonStyle'
import SiteGrid from '../../sites/components/SiteGrid'
import SwitchGrid from '../../Switch/components/SwitchGrid'
import VSCalendar from '../../Calendar/components/VSCalendar'
import CreateWORequest from './CreateWORequest'
import NotificationSystem from 'react-notification-system'
import AdvancedFilter from './AdvancedFilter'
import WorkOrderAGgrid from './WorkOrderAGgrid'
import RMAGrid from './RMAGrid'
import MDUWorkorderGrid from './MDUWorkorderGrid'
import ReactTooltip from 'react-tooltip'
import WorkRequest from '../../sites/images/Request.svg'
import EventRequest from '../../sites/images/calendar_blk.svg'
import Reporter from './Reporter'
import RescheduleIcon from '../../Calendar/assets/Rescheduled.png'
import DetectAppVersion from "../../Utils/DetectAppVersion"
import * as AppNotificationActions from '../../AppNotification/actions'
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import { formatDate } from "../../date_utils";
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { attemptLogoutOfIVR, clearIVRLogoutRequest } from "../../redux/src/ivr/actions"
import { resetProps } from "../../sites/actions"
import { logActioninDB } from "../actions"
let DISPLAY_FORMAT_2 = "MM/DD/YYYY"

const divStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: 'auto',
  width: '650px'
}

class VendorDashboard extends React.Component {

  componentDidMount() {
    let { fetchBannerDetails, realVendorId, realLoginId } = this.props
    fetchBannerDetails(realLoginId, realVendorId)
    this.onVendorLoad();
  }

  componentDidUpdate(prevProps, prevState) {
    let prev_user = this.props.user
    let new_user = prevProps.user
    let { vendorWorkOrderSelectedRowObj, appNotification, allworkorders } = this.props;
    let workorders = allworkorders?.toJS()
    if (prev_user.get("vendor_id") != new_user.get("vendor_id")) {
      this.onVendorLoad()
      this.onClosePan()
      this.loadSitesBySubmarket()
      this.loadSwitchesBySubmarket()
    }
    else if (vendorWorkOrderSelectedRowObj.workorder_id && prevProps.appNotification.notificaionProject && prevProps.appNotification.notificaionProject != vendorWorkOrderSelectedRowObj.workorder_id) {
      if (this.state.isModalshown && appNotification.notificationClicked && appNotification.notificationType === "Work") {
        this.setState({ isModalshown: false });
        this.props.vendorWorkOrderSelectedRow(this.props.loginId, { workorder_id: appNotification.notificaionProject })
        this.getWorkOrderDetails()
      }
    } else if (Object.keys(vendorWorkOrderSelectedRowObj).length == 0 || vendorWorkOrderSelectedRowObj.size == 0) {
      if (!this.state.isModalshown && appNotification.notificationClicked && appNotification.notificationType === "Work") {
        this.props.vendorWorkOrderSelectedRow(this.props.loginId, { workorder_id: appNotification.notificaionProject })
        this.getWorkOrderDetails()
      }
    }
    if (prevProps.allworkorders != this.props.allworkorders && this.props.allworkorders.size) {
      if (workorders?.some(wo => wo.work_type.toLowerCase() !== 'mdu')) {
        this.setState({ selectedTab: 'vendordashboard' })
      } else {
        this.setState({ selectedTab: 'mdu' })
      }
    }

    if (!prevState.isInitialized && this.state.isInitialized) {
      this.fetchOpenOSWs()
    }
  }
  fetchOpenOSWs = () => {
    try {
      const oswData = this.props?.openOswData?.toJS?.() || [];
      if (oswData.length > 0) {
        const firstOSW = oswData[0];
        this.redirectopenosw({ row: firstOSW })
      }
    } catch (error) {
      console.error("Error fetching open OSWs:", error);
    }
  };
  handleHideModalForProject = () => {
    this.setState({ projectViewModel: false })
    this.props.capitalProjectSelectedRow({})
  }
  renderProjectViewModel = () => {

    return (<Modal title="Project Details" handleHideModal={this.handleHideModalForProject} style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px" }}>
      <SnapModal
        notifref={this._notificationSystem}
        calendarevents={this.state.calendarevents}
        handleHideModal={this.handleHideModalForProject}
        selectedRow={this.state.selectedProject}
        workORderInfo={null}
        isSiteAccessExpandable={true}
        appNotification={{}}
        capitalProjectSelectedRowObj={{}}
        fromRecentActivity={true}
        selectedRecentActivity={this.state.selectedRecentActivity}
      />
    </Modal>)
  }

  redirectopenosw = async (firstOSW) => {
    const { loginId, user } = this.props;



    let selectedRow = firstOSW
    this.setState({ selectedRecentActivity: selectedRow.row })


    if (selectedRow.row.WORK_TYPE.toUpperCase() == "PROJECT") {
      this.props.capitalProjectSelectedRow(selectedRow.row)

      this.props.getProjectInfoSlr(selectedRow.row.WORK_ORDER_ID)
        .then(async response => {

          if (response && response.type == "GET_PROJECT_INFO_SLR_SUCCESS" && response.getProjectInfoSlr) {

            this.setState({ selectedProject: response.getProjectInfoSlr })
            this.props.getConflictkirkeEventsForSite(loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD'), response.getProjectInfoSlr.site_unid)
            await this.props.getCalenderEventsForSite(loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD'), response.getProjectInfoSlr.site_unid).then(res => {
              if (res.events && res.events.getCalenderEventsForSite && res.events.getCalenderEventsForSite.data) {
                this.setState({ calendarevents: res.events.getCalenderEventsForSite.data || [] })
                // setEvents(res.events.getCalenderEventsForSite.data)
              } else {
                this.setState({ calendarevents: [] })

              }

              this.setState({ projectViewModel: true })


            })
          }
        })
    } else {


      let vendorId = this.props.vendorId;
      let groupVendors = user.get('group_vendors') ? user.get('group_vendors').toJS() : null;
      let vendorIds = groupVendors ? groupVendors.map(g => g.vendor_id).toString() : vendorId
      this.props.vendorWorkOrderSelectedRow(loginId, selectedRow.row)

      this.props.fetchAdvancedHistory(loginId, vendorIds, selectedRow.row.WORK_ORDER_ID)
        .then(async action => {

          if (action.type == 'FETCH_ADVANCED_HISTORY_SUCCESS' && action.searchHistoryData) {
            let vendorWODetailsObj = action.searchHistoryData.allHistoryData[0]

            this.setState({ showOSW: true })
            this.onRowClickBackMethod(fromJS(vendorWODetailsObj))

          }
        })
    }
  }

  onVendorLoad() {
    let user = this.props.user ? this.props.user.toJS() : {}
    let vendorId = user.vendor_id
    let { config } = this.props
    let unscheduledWorkTypes = [];
    let unscheduledWork = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE").ATTRIBUTE_VALUE
    if (unscheduledWork) {
      unscheduledWorkTypes = unscheduledWork && unscheduledWork.split(",");
    }
    this.props.fetchWorkOrder(this.state.loginId, this.state.startDate.format("YYYY-MM-DD"), this.state.endDate.format("YYYY-MM-DD"), null, null, unscheduledWorkTypes)
      .then(resp => {
        let { appNotification } = this.props
        if (appNotification.notificationType === "Work" && appNotification.notificationClicked) {
          let woWork = resp && resp.user_dashboard ? resp.user_dashboard.work : []
          let woWorkObj = woWork.find(e => (e.name === 'Work Pending' || e.name === 'Work Pending Scheduled' || e.name === 'Work Pending Unscheduled'));
          this.onPanClick(woWorkObj)
          this.setState({ isSiteAccessExpandable: true })
          this.getWorkOrderDetails()
        }
        this.setState({ isInitialized: true })
      })
    this.props.fetchEventDetails(this.state.loginId, vendorId)
    this.props.getRmaStatus(this.state.loginId, vendorId)
    this._notificationSystem = this.refs.notificationSystem
  }
  getWorkOrderDetails() {
    let { loginId, appNotification, user } = this.props;
    let vendorId = user.get('vendor_id')
    if (appNotification.notificationType === "Work" && appNotification.notificationClicked) {
      let groupVendors = user.get('group_vendors') ? user.get('group_vendors').toJS() : null;
      let vendorIds = groupVendors ? groupVendors.map(g => g.vendor_id).toString() : vendorId
      this.props.fetchAdvancedHistory(loginId, vendorIds, appNotification.notificaionProject).then(async action => {
        if (action.type == 'FETCH_ADVANCED_HISTORY_SUCCESS') {
          let vendorWODetailsObj = action.searchHistoryData.allHistoryData[0]
          this.setState({ isSiteAccessExpandable: true })
          this.props.vendorWorkOrderSelectedRow(this.props.loginId, vendorWODetailsObj)
          this.onRowClickBackMethod(fromJS(vendorWODetailsObj))
        }
      })
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      isModalshown: false,
      isInitialized: false,
      showOSW: false,
      isopenOSW: false,
      isCalendarView: false,
      selectedRecentActivity: {},
      events: [],
      isWOSchedulingModalShown: false,
      isDirty: false,
      selectedProject: [],
      selectedWR: null,
      calendarevents: [],
      getQuotes: false,
      isWorkInProgress: false,
      isCompleted: false,
      isAcceptedWork: false,
      isQuoteReceived: false,
      loginId: props.loginId,
      startDate: moment().subtract(7, 'days'),
      endDate: moment(),
      focusedInput: null,
      searchVal: '',
      gloableSearch: null,
      filterWorkType: null,
      filterStatus: null,
      listOfTableData: null,
      optionsForStatusDropDown: null,
      uniqueUId: '',
      searchOn: 'Workorder',
      projectViewModel: false,
      isShowCreateWoRequest: false,
      selectedSites: [],
      selectAllSites: false,
      siteInformation: {},
      isShowSwitchCreateWoRequest: false,
      selectedSwitches: [],
      selectAllSwitches: false,
      switchInformation: {},
      isAdvancedSearchModalShown: false,
      advancedModalSearchParams: null,
      isSiteAccessExpandable: false,
      exportExcelData: [],
      vendorCalenderViewModel: false,
      workOrderStatus: "",
      selectedTab: "vendordashboard",
      lock_unlock_request_id:null,
      isRMAView: false,
      openRmaAccordion: false
    }
    this.ivrLogoutInProgress = false
    this.createWorkOrderFile = this.createWorkOrderFile.bind(this)
  }

  resetMessages = () => {
    const { site, clearIVRLogoutRequest } = this.props
    clearIVRLogoutRequest(site?.site_unid)
  }
  handlehideOSW = () => {
    this.setState({ isModalshown: false })
    this.props.vendorWorkOrderSelectedRow(this.props.loginId, {})
  }
  handleHideModal = (notifymsg) => {
    this.setState({ isModalshown: false, selectedWR: null, vendorCalenderViewModel: false,isopenOSW:false,showOSW:false })
    let { appNotification, loginId, site } = this.props;
    if (appNotification.notificaionReceived) {
      this.props.updateAppNotification({
        ...appNotification,
        notificationClicked: false
      })
      this.props.vendorWorkOrderSelectedRow(this.props.loginId, {})
    }
    if (this.props.IVRLoginDetails?.toJS()?.state_switch_cd && this.props.IVRLoginDetails?.toJS()?.cell_num && this.props.IVRLoginDetails?.toJS()?.message == "Login into site was successful") {
      if (this.ivrLogoutInProgress) {
        return;
      }
      this.ivrLogoutInProgress = true;
      let login = {
        "loginId": loginId,
        "state_switch_cd": this.props.IVRLoginDetails?.toJS()?.state_switch_cd,
        "generate_alarms": "yes",
        "cell_num": this.props.IVRLoginDetails?.toJS()?.cell_num
      }

      this.resetMessages()
      this.props.attemptLogoutOfIVR(site?.site_unid, login).then(action => {
        if (action.login && action.login.message && action.login.message.includes("successful"))
          this.props.logActioninDB(loginId, this.props.user && this.props.user.get('email'), this.props.user && this.props.user.get('vendor_id'), this.props.vendorWorkOrderSelectedRowObj && this.props.vendorWorkOrderSelectedRowObj.get('workorder_id'), this.props.user && this.props.user.get('vendor_area'), this.props.user && this.props.user.get('vendor_region'), "Logout of IVR","IVR","Logout","");
        var keys = [loginId, "site", "showLoginForm"]
        this.props.resetProps(keys, true)
        var keys2 = [loginId, "site", "showLogoutForm"]
        this.props.resetProps(keys2, false)
      this.ivrLogoutInProgress = false;
      }).catch(error => {
        this.ivrLogoutInProgress = false;
      })
    }
    if (notifymsg && notifymsg.length > 0) {
      this.fetchData()
      this._notificationSystem.addNotification({
        title: 'Success',
        position: "br",
        level: 'success',
        autoDismiss: 10,
        message: notifymsg
      })
      this.onClosePan()
    }
    if (this.state.isDirty) {
      let { config } = this.props
      let unscheduledWorkTypes = [];
      let unscheduledWork = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE").ATTRIBUTE_VALUE
      if (unscheduledWork) {
        unscheduledWorkTypes = unscheduledWork && unscheduledWork.split(",");
      }
      this.props.fetchWorkOrder(this.state.loginId, this.state.startDate.format('YYYY-MM-DD'), this.state.endDate.format('YYYY-MM-DD'), null, null, unscheduledWorkTypes).then(() => {
        this.onDirtyChange(false)
      })
    }
  }
  hideCreateWORequest() {
    this.setState({ isShowCreateWoRequest: false })
    this.fetchData()
  }
  hideSwitchCreateWoRequest() {
    this.setState({ isShowSwitchCreateWoRequest: false })
    this.fetchData()
  }
  onDirtyChange(isDirty) {
    this.setState({ isDirty })
  }

  fetchData = () => {
    let user = this.props.user ? this.props.user.toJS() : {}
    let vendorId = user.vendor_id
    let { startDate, endDate, loginId } = this.state
    this.onClosePan()
    let { config } = this.props
    let unscheduledWorkTypes = [];
    let unscheduledWork = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE").ATTRIBUTE_VALUE
    if (unscheduledWork) {
      unscheduledWorkTypes = unscheduledWork && unscheduledWork.split(",");
    }
    this.props.fetchWorkOrder(loginId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), null, null, unscheduledWorkTypes)
    this.props.fetchEventDetails(loginId, vendorId)
    this.props.getRmaStatus(loginId, vendorId)

  }
  onDatesChange = ({ startDate, endDate }) => {
    this.setState({ startDate, endDate })
  }
  onFocusChanged = (focusedInput) => {
    this.setState({ focusedInput })
  }


  selectedWorkInProgresWRCallBack() {
    this.setState({ getQuotes: false, isWorkInProgress: true, isAcceptedWork: false, isCompleted: false, isQuoteReceived: false })
  }
  selectedCompletedWRCallBack() {
    this.setState({ getQuotes: false, isWorkInProgress: false, isAcceptedWork: false, isQuoteReceived: false, isCompleted: true })
  }

  selectedAcceptedWrok() {
    this.setState({ getQuotes: false, isWorkInProgress: false, isAcceptedWork: true, isQuoteReceived: false, isCompleted: false })
  }
  selectedQuoteReceivedWrok() {
    this.setState({ getQuotes: false, isWorkInProgress: false, isAcceptedWork: true, isQuoteReceived: true, isCompleted: false })
  }

  selectedAwaitingWRCallBack() {
    this.setState({ getQuotes: true, isWorkInProgress: false, isAcceptedWork: false, isCompleted: false, isQuoteReceived: false })
  }

  setWRAndRenderModal(WR) {
    this.setState({ isModalshown: true, selectedWR: WR })
  }
  setWRAndRenderModalOSW(WR) {
    this.setState({ isModalshown: true, isopenOSW: true, selectedWR: WR })
  }

  setVendorCalenderViewClicked = (WR) => {
    this.setState({ vendorCalenderViewModel: true, selectedWR: fromJS(WR) },)
  }
  showAdvanceSearchModal = () => {
    this.setState({ isAdvancedSearchModalShown: true })
  }

  showReportIssue = () => {
    this.setState({ isReportIssueShown: true })
  }
  hideAdvanceSearchModal = () => {
    this.setState({ isAdvancedSearchModalShown: false })
  }
  hideReportSearchModal = () => {
    this.setState({ isReportIssueShown: false })
  }

  renderAdvancedSeachModal = () => {
    return (
      <Modal title="ADVANCED SEARCH" handleHideModal={this.hideAdvanceSearchModal} style={{ maxWidth: "60%", top: "-10% !important" }}>
        <AdvancedFilter onAdvancedSearchClick={this.onAdvancedSearchClick} />
      </Modal>)
  }

  renderReportIssue = () => {
    return (
      <Modal title="Report Issue" handleHideModal={this.hideReportSearchModal} style={{ maxWidth: "60%", top: "-10% !important" }}>
        <Reporter notifref={this._notificationSystem} />
      </Modal>)
  }

  onRowClickBackMethod = (currentObj, openRmaAccordion = false) => {
    this.setState({ openRmaAccordion })
    this.resetMessages();
    this.props.vendorWorkOrderSelectedRow(this.props.loginId, currentObj.toJS())
    switch (currentObj.get("quote_statuses")) {
      case utils.QUOTEPENDING:
        this.selectedAwaitingWRCallBack(currentObj)
        break
      case utils.QUOTERECEIVED:
        this.selectedQuoteReceivedWrok(currentObj)
        break
      case utils.QUOTEDECLINED:
        this.selectedAwaitingWRCallBack(currentObj)
        break
      case utils.AWAITING_PO:
        if (currentObj.get("workorder_status") === utils.WORKPENDING || currentObj.get("workorder_status") === 'WORKDECLINED') {
          this.selectedWorkInProgresWRCallBack(currentObj)
          break
        } else {
          this.selectedQuoteReceivedWrok(currentObj)
          break
        }

      case utils.QUOTEAPPROVED:
        this.selectedWorkInProgresWRCallBack(currentObj)
        break
      case (utils.COMPLETED):
        if (currentObj.get("workorder_status") === utils.WORKPENDING || currentObj.get("workorder_status") === 'WORKDECLINED') {
          this.selectedWorkInProgresWRCallBack(currentObj)
          break;
        } else {
          this.selectedCompletedWRCallBack(currentObj)
          break;
        }

      case utils.PENDING_WOAPPROVAL:
        this.selectedQuoteReceivedWrok(currentObj)
        break
    }
    { this.state.showOSW ? this.setWRAndRenderModalOSW(currentObj) : this.setWRAndRenderModal(currentObj) }

  }
  onRMARowClickBackMethod = (currentObj) => {
    const { allworkorders } = this.props;
    const rmaData = currentObj.toJS ? currentObj.toJS() : currentObj;
    const workOrderId = rmaData.VWRS_ID;
    const workorders = allworkorders?.toJS() || [];
    const matchingWorkOrder = workorders.find(wo => wo.workorder_id === workOrderId || wo.workorder_id === parseInt(workOrderId));

    if (matchingWorkOrder) {
      this.props.vendorWorkOrderSelectedRow(this.props.loginId, matchingWorkOrder);
      let openRmaAccordion = true;
      this.onRowClickBackMethod(fromJS(matchingWorkOrder), openRmaAccordion);
    } else {
      if (this._notificationSystem) {
        this._notificationSystem.addNotification({
          title: 'Info',
          position: "tr",
          level: 'warning',
          autoDismiss: 5,
          message: `Work Order ${workOrderId} not found in current data.`
        });
      }
    }
  }

  async exportDataToExcel() {
    let user = this.props.user ? this.props.user.toJS() : {}
    let exportExcelData = []
    // let group_vendor = user && user.group_vendors && user.group_vendors.find(el=> el.vendor_id == user.vendor_id )
    await this.props.fetchDataToExport(this.state.loginId, this.state.startDate.format("YYYY-MM-DD"), this.state.endDate.format("YYYY-MM-DD"), user.vendor_mdg_id || '')
      .then(async resp => {
        if (resp && resp.vendor_wo_details && resp.vendor_wo_details.length > 0) {
          exportExcelData = resp && resp.vendor_wo_details
          this.setState({ exportExcelData })
          await this.createWorkOrderFile()
        }
        else {
          this.refs.notificationSystem.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            message: 'Error exporting to excel'
          })
        }
      })
  }

  createWorkOrderFile() {
    let tableName = 'WorkOrder (All Markets)'
    let userRole = this.props.path
    let input = this.state.exportExcelData
    const pages = Array.isArray(input) ? input : [input]
    const data = []
    for (let page = Object.keys(pages), j = 0, end = page.length; j < end; j++) {
      let key = page[j], value = pages[key]
      let exceldata = {
        "WorkOrderNumber": value.workorder_id,
        "Site": value.site_type == 'SITE' ? value.site_name : null,
        "Switch": value.switch,
        "Manager": value.sitemanager_name,
        "Requested By": value.requested_by_name,
        "Priority": value.priority,
        "Work Type": value.work_type,
        "Work Scope": value.work_scope,
        "Work Order Status": value.workorder_status,
        "Quote Status": value.quote_statuses,
        "Area" : value.area,
        "Region" : value.region,
        "Market" : value.market,
        "Work Award Date": value.work_award_date && value.work_award_date.length > 0 ? formatDate(value.work_award_date, DISPLAY_FORMAT_2) : "",
        "Work Completed By": value.work_due_date && value.work_due_date.length > 0 ? formatDate(value.work_due_date, DISPLAY_FORMAT_2) : ""
      }
      exceldata["Vendor Status"] = value.vendor_status || ''
      exceldata["WO approved date"] = value.work_order_appr_date && value.work_order_appr_date.length > 0 ?
        formatDate(value.work_order_appr_date, DISPLAY_FORMAT_2) : ""
      if ([utils.QUOTEAPPROVED, utils.COMPLETED].indexOf(value.quote_statuses) > -1) {
        exceldata["PO#"] = value.po_number
        exceldata["PO Status"] = value.po_status
        exceldata["PO received status"] = value.po_rcpt_status
        exceldata["Actual Completion Datetime"] = value.work_completed_date && value.work_completed_date.length > 0 ? formatDate(value.work_completed_date) : ""
      }
      if (!([utils.QUOTECANCELLED, utils.QUOTEPENDING].indexOf(value.quote_statuses) > -1) && userRole === utils.PORTALADMIN) {
        if (value.quoteitems && value.quoteitems.length > 0 && [utils.QUOTERECEIVED, utils.AWAITING_PO].indexOf(value.quote_statuses) > -1) {
          exceldata["Quote SubTotal"] = value.quoteitems[0].quote_total
          exceldata["Materials SubTotal"] = value.quoteitems[0].quote_materials_total
          exceldata["Labor SubTotal"] = value.quoteitems[0].quote_labor_total
          exceldata["Generator Fuel SubTotal"] = value.quoteitems[0].quote_fuel_total
        } else if (value.quoteitems && value.quoteitems.length > 0 && [utils.COMPLETED, utils.QUOTEAPPROVED].indexOf(value.quote_statuses) > -1) {
          exceldata["Actual Invoice Total"] = value.quoteitems[0].actual_total
          exceldata["Actual Invoice Materials"] = value.quoteitems[0].actual_materials_total
          exceldata["Actual Invoice Labor"] = value.quoteitems[0].actual_labor_total
          exceldata["Actual Generator Fuel Total"] = value.quoteitems[0].actual_fuel_total
        }
      }
      data.push(exceldata)
    }
    let ws = XLSX.utils.json_to_sheet(data)
    let wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "WorkOrder")
    let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' })
    let buf = new ArrayBuffer(wbout.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `${tableName}.xlsx`)

    this.refs.notificationSystem.addNotification({
      title: 'Success',
      position: "br",
      level: 'success',
      message: 'Successfully exported to Excel'
    })
  }

  onExcelDownload = () => {
    let uniqueId = this.guid()
    this.setState({ uniqueUId: uniqueId })
  }
  rmaExcelDownload = () => {
    let { vendor_wo_details, rmaStatusData } = this.props
    let workorders = vendor_wo_details?.toJS().vendor_wo_details || []
    let woIds = workorders.filter(wo => wo.workorder_status === 'WORKPENDING' && wo.vendor_status !== 'Acknowledge Pending').map(wo => wo.workorder_id)
    let rmaIds = []
    rmaIds = rmaStatusData.reduce((acc, rma) => {
      if (woIds.includes(Number(rma.vwrs_id))) {
        acc.push(...rma.rma_list.map(id => id.rma_id))
      }
      return acc
    }, [])
    if (rmaIds.length > 0) {
      this.props.getRmaDetails(this.props.loginId, null, rmaIds.toString()).then((res) => {
        if (res.type === 'RMA_DETAILS_FAILURE') {
          this.refs.notificationSystem.addNotification({
            title: 'Error',
            position: "br",
            level: 'error',
            message: res.errors || 'Something went wrong fetching RMA details'
          })
        }
        if (this.props.rmaDetailsExcel.length > 0) {
          let tableName = 'RMA Info'
          let input = this.props.rmaDetailsExcel.map(rma => {
            let wo = workorders.find(wo => wo.workorder_id === Number(rma.VWRS_ID)) || {}
            return {
              ...rma,
              workorder_id: wo.workorder_id || '',
              site_type: wo.site_type || '',
              site_name: wo.site_name || '',
              workorder_status: wo.workorder_status || '',
              quote_statuses: wo.quote_statuses || ''
            }
          })
          const pages = Array.isArray(input) ? input : [input]
          const data = []
          for (let page = Object.keys(pages), j = 0, end = page.length; j < end; j++) {
            let key = page[j], value = pages[key]
            let exceldata = {
              "Work Order id": value.workorder_id,
              "Site Name": value.site_type == 'SITE' ? value.site_name : null,
              "Work Order Status": value.workorder_status,
              "Quote Status": value.quote_statuses,
              "RMA Number": value.RMA_NUMBER,
              "RMA Status": value.STATUS,
              "Shipped From": '',
              "Shipped To": '',
              "Shipping Tracking ID": value.TRACKING_NO,
              "Delivered": formatDate(value.REQUESTED_DELIVERY_DATE, DISPLAY_FORMAT_2),
              "Delivery Address": '',
              "Scanned in Date": '',
              "Logical Installation": formatDate(value.ACTIVATION_DATE, DISPLAY_FORMAT_2),
              "Scanned OutDate": '',
              "Scanned Defective Serial Number": '',
              "Return Tracking ID": value.REPLACEMENT_TRACKING_NUMBER,
              "Return Shipping Label Scanned": formatDate(value.REPLACEMENT_SHIPMENT_DATE, DISPLAY_FORMAT_2),
              "Return Delivered": '',
              "Goods Receipt ": '',
              "RMA Complete ": ''
            }
            data.push(exceldata)
          }
          let ws = XLSX.utils.json_to_sheet(data)
          let wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, "RMA")
          let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' })
          let buf = new ArrayBuffer(wbout.length)
          let view = new Uint8Array(buf)
          for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF
          saveAs(new Blob([buf], { type: "application/octet-stream" }), `${tableName}.xlsx`)

          this.refs.notificationSystem.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            message: 'Successfully exported to Excel'
          })

        }
      })
    } else {
      this.refs.notificationSystem.addNotification({
        title: 'Success',
        position: "br",
        level: 'success',
        message: 'No RMAs available to export'
      })
    }
  }

  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4()
  }

  hideWOSchedulingModal = (notifymsg) => {
    this.setState({ isWOSchedulingModalShown: false })
    if (notifymsg && notifymsg.length > 0) {
      this._notificationSystem.addNotification({
        title: 'Success',
        position: "br",
        level: 'success',
        autoDismiss: 0,
        message: 'Success'
      })
    }
  }

  onGridReady = params => {
    this.gridOptions = params
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    this.gridApi.setFilterModel(null)
    if (params.api && params.api.sizeColumnsToFit) { params.api.sizeColumnsToFit() }
    params.api.sizeColumnsToFit()
    this.gridApi.sizeColumnsToFit()
    window.addEventListener('resize', function () {
      setTimeout(function () {
        params.api.sizeColumnsToFit();
      })
    })
  };

  renderWorkOrderModal() {
    let { historyWorkOrders } = this.props;
    let { listOfTableData, vendorCalenderViewModel } = this.state;
    historyWorkOrders = historyWorkOrders.toJS()
    if (this.state.listOfTableData == null) {
      this.onPanClick()
    }
    let name = ''
    let workOrderSelected = this.state.selectedWR.get('workorder_id')
    let historyWorkOrderData = historyWorkOrders[workOrderSelected]
    if (this.state.listOfTableData && this.state.listOfTableData.name && workOrderSelected && historyWorkOrderData) {
      name = this.state.listOfTableData.name
    }
    return (
      <Modal title={vendorCalenderViewModel ? "VENDOR SCHEDULE" : "WORK ORDER DETAILS"} handleHideModal={this.handleHideModal} style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px" }}>
        <WorkOrderDetails
          workOrderInfo={this.state.selectedWR}
          getQuotes={this.state.getQuotes}
          isWorkInProgress={this.state.isWorkInProgress}
          isCompleted={this.state.isCompleted}
          isQuoteReceived={this.state.isQuoteReceived}
          isAcceptedWork={this.state.isAcceptedWork}
          onDirtyChange={this.onDirtyChange.bind(this)}
          userRole={this.props.userRole}
          handleHideModal={this.handleHideModal}
          notifref={this._notificationSystem}
          tableTitle={name}
          bannerName={listOfTableData && listOfTableData.name}
          title="SEARCH"
          isSiteAccessExpandable={this.state.isopenOSW ? true : this.state.isSiteAccessExpandable}
          vendorCalenderViewModel={vendorCalenderViewModel} 
          onLockUnlockReqReceived={this.onLockUnlockReqReceived}
          defaultRmaOpen={this.state.openRmaAccordion}/>
      </Modal>)
  }

  renderCreateWoRequestModal() {
    return (
      <Modal title="SITE INFORMATION" handleHideModal={this.hideCreateWORequest.bind(this)} style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px" }}>
        <CreateWORequest Unid={this.state.selectedSites[0]} type={this.state.searchOn} />
      </Modal>)
  }

  renderSwitchCreateWoRequestModal() {
    return (
      <Modal title="SWITCH INFORMATION" handleHideModal={this.hideSwitchCreateWoRequest.bind(this)} style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px" }}>
        <CreateWORequest Unid={this.state.selectedSwitches[0]} type={this.state.searchOn} />
      </Modal>)
  }

  onSiteRowClick = () => {
    this.setState({ isShowCreateWoRequest: true })
  }

  onSwitchRowClick = () => {
    this.setState({ isShowSwitchCreateWoRequest: true })
  }

  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="50px"
      margin="4px"
      className="text-center loader-centered" />
    )
  }
  onChangeSearch = (val) => {
    this.setState({ gloableSearch: val, selectAllSites: false, selectedSites: [], selectAllSwitches: false, selectedSwitches: [] })
  }
  handlePaste = (e) => {
    e.preventDefault();
    let pastedText = e.clipboardData.getData('text');
    pastedText = pastedText.trim(); // remove leading and trailing spaces
    this.setState({ gloableSearch: pastedText });
  }
  onClickClose = () => {
    this.setState({ searchVal: "" })
  }

  onPanClick = (data) => {
    if (data && data != null && data.name) {
      let optionsForStatusDropDown = data && data.name && FILTER_STATUS[data.name] ? FILTER_STATUS[data.name] : null
      
      const rmaStatuses = ['shipped', 'delivered', 'returned', 'closed', 'received', 'installed']
      const isRMAView = data.name && data.name.toLowerCase().includes('rma') || (data.name && rmaStatuses.some(status => data.name.toLowerCase().includes(status)))
      if(data?.name?.toLowerCase().includes('rma')) {
        data = this.props.rmaDeliveredData?.find(type => type?.name?.toLowerCase() == 'delivered')
      }
      this.setState({ 
        listOfTableData: data, 
        optionsForStatusDropDown, 
        advancedModalSearchParams: null, 
        filterWorkType: null, 
        filterStatus: null,
        isRMAView: isRMAView
      }, function () {
        if (this.gridApi && this.gridApi.sizeColumnsToFit) { this.gridApi.sizeColumnsToFit() }
      })
    }
  }
  onClosePan = () => {
    this.setState({ listOfTableData: null, optionsForStatusDropDown: null, filterWorkType: null, filterStatus: null, searchVal: null, isRMAView: false })
  }

  onWorkTypeChange = (selectedOption) => {
    this.setState({ "filterWorkType": selectedOption })
  }
  onFilterStatusChange = (selectedOption) => {
    this.setState({ "filterStatus": selectedOption })
  }
  onChangeRadioButton = (e) => {
    this.onClosePan()
    if (e.target.value === 'Site' && this.props.sites && this.props.sites.size === 0) {
      this.loadSitesBySubmarket()
    }
    if (e.target.value === 'Switch' && this.props.switches && this.props.switches.size === 0) {
      this.loadSwitchesBySubmarket()
    }
    this.setState({
      searchOn: e.target.value,
      selectedSites: [],
      selectAllSites: false,
      selectAllSwitches: false,
      selectedSwitches: []
    })
  }

  loadSitesBySubmarket() {
    let { user, fetchSitesBySubmarket, loginId } = this.props
    if (user) {
      fetchSitesBySubmarket(loginId, user.get("vendor_region"))
    }
  }

  loadSwitchesBySubmarket() {
    let { user, fetchSwitchesBySubmarket, loginId } = this.props
    if (user) {
      fetchSwitchesBySubmarket(loginId, user.get("vendor_region"))
    }
  }

  toggleSelection = (key) => {
    if (key.indexOf('select-') > -1) {
      key = key.split('select-')[1]
    }
    if (this.state.searchOn == 'Site') {
      let selectedSites = [...this.state.selectedSites]
      const keyIndex = selectedSites.indexOf(key)
      if (keyIndex >= 0) {
        selectedSites = [
          ...selectedSites.slice(0, keyIndex),
          ...selectedSites.slice(keyIndex + 1)
        ]
      } else {
        selectedSites.push(key)
      }
      this.setState({ selectedSites })
      if (this.state.searchOn !== 'Site' || this.state.selectedSites.length == 0 || this.state.selectedSites.length > 1) {
        this.setState({ isCalendarView: false })
      }
    }

    if (this.state.searchOn == 'Switch') {
      let selectedSwitches = [...this.state.selectedSwitches]
      const keyIndex = selectedSwitches.indexOf(key)
      if (keyIndex >= 0) {
        selectedSwitches = [
          ...selectedSwitches.slice(0, keyIndex),
          ...selectedSwitches.slice(keyIndex + 1)
        ]
      } else {
        selectedSwitches.push(key)
      }
      this.setState({ selectedSwitches })
      if (this.state.searchOn !== 'Switch' || this.state.selectedSwitches.length == 0 || this.state.selectedSwitches.length > 1) {
        this.setState({ isCalendarView: false })
      }
    }
  };

  checkboxTable = () => {

  }
  setRef = (r) => {
    return this.checkboxTable = r
  }
  toggleAll = () => {
    if (this.state.searchOn == 'Site') {
      const selectAllSites = this.state.selectAllSites ? false : true
      const selectedSites = []
      if (selectAllSites) {
        const wrappedInstance = this.checkboxTable.getWrappedInstance()
        const currentRecords = wrappedInstance.getResolvedState().sortedData
        currentRecords.forEach(item => {
          selectedSites.push(item._original.site_unid)
        })
      }
      this.setState({ selectAllSites, selectedSites })
    }

    if (this.state.searchOn == 'Switch') {
      const selectAllSwitches = this.state.selectAllSwitches ? false : true
      const selectedSwitches = []
      if (selectAllSwitches) {
        const wrappedInstance = this.checkboxTable.getWrappedInstance()
        const currentRecords = wrappedInstance.getResolvedState().sortedData
        currentRecords.forEach(item => {
          selectedSwitches.push(item._original.site_unid)
        })
      }
      this.setState({ selectAllSwitches, selectedSwitches })
    }
  };

  isSelected = key => {
    if (this.state.searchOn == 'Site') {
      return this.state.selectedSites.includes(key)
    }
    if (this.state.searchOn == 'Switch') {
      return this.state.selectedSwitches.includes(key)
    }
  };

  onCreateVWR = () => {
    let siteUnid = this.state.selectedSites && this.state.selectedSites[0];
    let userId = this.props.user && this.props.user.toJS().userid;
    this.props.fetchVendorDispatchDistance(siteUnid, userId);
    this.state.searchOn == 'Site' ? this.onSiteRowClick() : (this.state.searchOn == 'Switch' ? this.onSwitchRowClick() : null)
  }

  viewCalendar = () => {
    if (this.state.searchOn == 'Workorder' || this.state.selectedSites.length == 0 || this.state.selectedSites.length > 1
      || this.state.selectedSwitches.length == 0 || this.state.selectedSwitches.length > 1) {
      this.setState({ isCalendarView: false })
    }
    if (this.state.searchOn == 'Site') {
      var filteredEvents = this.props.events.filter((events) => events.siteUnid == this.state.selectedSites[0])
      let filteredSite = this.props.sites.toJS().filter((site) => site.site_unid == this.state.selectedSites[0])
      this.setState({ events: filteredEvents, isCalendarView: true, siteInformation: filteredSite[0] })
    }
    if (this.state.searchOn == 'Switch') {
      var filteredEvents = this.props.events.filter((events) => events.switchUnid == this.state.selectedSwitches[0] && events.siteUnid == null)
      let filteredSwitch = this.props.switches.toJS().filter((switches) => switches.switch_unid == this.state.selectedSwitches[0])
      this.setState({ events: filteredEvents, isCalendarView: true, switchInformation: filteredSwitch[0] })
    }
  }

  onAdvancedSearchClick = ({ history, searchVal, filterStatus, startDate, endDate, historyData }) => {
    history['name'] = 'Advanced History'
    this.setState({ listOfTableData: history, advancedModalSearchParams: { searchVal, filterStatus, startDate, endDate }, workOrderStatus: historyData.workorder_status }, function () {
      this.hideAdvanceSearchModal()
      if (this.gridApi?.sizeColumnsToFit) {
        this.gridApi.sizeColumnsToFit()
      }
    })
  }

  renderCreateScheduleActions = () => {
    if (this.state.searchOn === 'Site') {
      return (((this.state.selectedSites.length == 0) || (this.state.selectedSites.length > 1)) ? null : (<div>
        <a onClick={this.onCreateVWR} className="pointer" data-tip data-for="Request">
          <small>
            <img src={WorkRequest} style={{ height: '24px' }} />
          </small>
        </a>&nbsp;&nbsp;&nbsp;
        <ReactTooltip id="Request" place="left" effect="float">
          <span>Request</span>
        </ReactTooltip>

        <a onClick={this.viewCalendar} className="pointer" data-tip data-for="Schedule">
          <small>
            <img src={EventRequest} style={{ height: '24px' }} />
          </small>
        </a>
        <ReactTooltip id="Schedule" place="right" effect="float">
          <span>Schedule</span>
        </ReactTooltip>

      </div>))
    }
    if (this.state.searchOn == 'Switch') {
      return (((this.state.selectedSwitches.length == 0) || (this.state.selectedSwitches.length > 1)) ? null : (<div>
        <a onClick={this.onCreateVWR} className="navbar-brand pointer" data-tip data-for="RequestSwitch">
          <small>
            <img src={WorkRequest} style={{ height: '24px' }} />
          </small>
        </a>&nbsp;&nbsp;&nbsp;
        <ReactTooltip id="RequestSwitch" place="left" effect="float">
          <span>Request</span>
        </ReactTooltip>

        <a onClick={this.viewCalendar} className="navbar-brand pointer" data-tip data-for="ScheduleSwitch">
          <small>
            <img src={EventRequest} style={{ height: '24px' }} />
          </small>
        </a>
        <ReactTooltip id="ScheduleSwitch" place="right" effect="float">
          <span>Schedule</span>
        </ReactTooltip>

      </div>))
    }
  }


  renderSearchFilter() {
    let placeHolder = ''
    if (this.state.searchOn == 'Site') {
      placeHolder = 'Site Search'
    } else if (this.state.searchOn == 'Switch') {
      placeHolder = 'Switch Search'
    } else {
      placeHolder = 'Work Order Search'
    }

    return (
      <div className="row" style={{ marginBottom: '10px' }}>
        <div className="col-md-12 no-padding">
          {this.renderTitle()}
          <div className="search-bar col-sm-2 float-left"  >
            <input
              placeholder={placeHolder}
              style={{ height: "31.25px", borderRadius: "0px" }}
              className="form-control title-div-style"
              ref="search"
              value={this.state.gloableSearch}
              onChange={e => this.onChangeSearch(e.target.value)}
              onPaste={this.handlePaste}
            />
          </div>
          <div className="col-md-2 float-left"  >
            <RadioButtonStyle onchange={this.onChangeRadioButton} NoVal={'Site'} yesVal={'Workorder'} switchVal={'Switch'} isrequired={true} selected={this.state.searchOn} />
          </div>

          <div className="col-md-3 float-right">
            <a onClick={this.showReportIssue} className="navbar-brand pointer float-right" data-tip data-for="ReportIssue">
              <ReportProblemIcon fontSize="large" style={{ fill: 'black' }}></ReportProblemIcon>
            </a>
            <ReactTooltip id="ReportIssue" place="top" effect="float">
              <span>Report Issue</span>
            </ReactTooltip>
            <a onClick={this.fetchData} className="navbar-brand pointer float-right" data-tip data-for="Refresh" >
              <RefreshIcon fontSize="large" style={{ fill: 'black' }}></RefreshIcon>
            </a>
            <ReactTooltip id="Refresh" place="top" effect="float">
              <span>Refresh</span>
            </ReactTooltip>
            <a onClick={this.showAdvanceSearchModal} className="navbar-brand pointer float-right" data-tip data-for="Search">
              <SearchIcon fontSize="large" style={{ fill: 'black' }}></SearchIcon>
            </a>
            <ReactTooltip id="Search" place="top" effect="float">
              <span>Advance Search</span>
            </ReactTooltip>
            <a onClick={this.exportDataToExcel.bind(this)} className="navbar-brand pointer float-right" data-tip data-for="Download">
              {this.props.exportExcelLoading && this.props.exportExcelLoading == true ? this.renderLoading() :
                <LibraryAddCheckIcon fontSize="large" style={{ fill: 'black' }}></LibraryAddCheckIcon>}
            </a>
            <ReactTooltip id="Download" place="left" effect="float">
              <span>Download Work Orders from all Markets</span>
            </ReactTooltip>

          </div>
        </div>
      </div>
    )
  }

  renderCalendar() {
    let { switchInformation, siteInformation } = this.state
    let calendarTitle = this.state.searchOn === 'Site' ? `Calendar for Site: "${siteInformation.site_name}" ` : `Calendar for Switch: "${switchInformation.switch_name}" `
    let Unid = this.state.selectedSites.length ? this.state.selectedSites[0] : this.state.selectedSwitches[0]
    let conditionSite = (this.state.gloableSearch && this.state.gloableSearch.length > 0 && (this.state.searchOn === 'Site') && this.state.isCalendarView == true &&
      !(this.state.selectedSites.length == 0 || this.state.selectedSites.length > 1))
    let conditionSwitch = (this.state.gloableSearch && this.state.gloableSearch.length > 0 && (this.state.searchOn === 'Switch') && this.state.isCalendarView == true &&
      !(this.state.selectedSwitches.length == 0 || this.state.selectedSwitches.length > 1))
    return (<div className="col-md-12">
      <DetectAppVersion />
      {(this.state.searchOn === 'Site' ? conditionSite : conditionSwitch) ?
        <div style={{ paddingTop: '8px' }}>
          <br />
          <PanVZRF title={calendarTitle} bottomMargin={true}>
            {
              <div>
                <VSCalendar switchInfo={switchInformation} typeWO={this.state.searchOn} Unid={Unid} onloadevents={this.state.events} />
                <br />
                <div className="col-md-12 col-md-offset-3" style={divStyle}>
                  <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
                    <i className="fa fa fa-calendar fa-lg" style={{ color: 'rgb(3, 169, 244)' }} /> <span style={{ marginLeft: 8 }}>{'Scheduled'}</span>
                  </div>
                  <div className="col-md-3 col-sm-3" style={{ paddingTop: 10 }}>
                    <img src={RescheduleIcon} style={{ height: '19px' }} /> <span style={{ marginLeft: 8 }}>{'Rescheduled'}</span>
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
          </PanVZRF>
        </div>
        : null}
    </div>)
  }

  renderSiteList() {
    const filtered = [{ id: "all", value: this.state.gloableSearch }]

    return (<div className="col-md-12">
      {(this.state.gloableSearch && this.state.gloableSearch.length > 0 && (this.state.searchOn === 'Site')) ?
        <div><PanVZRF title={`Search Result for sites "${this.state.gloableSearch}"`} bottomMargin={true}>
          {this.props.isSiteBySubmarketLoading ?
            this.renderLoading() :
            this.props.sites.size ?
              <SiteGrid
                setRef={this.setRef}
                onCreateVWR={this.onCreateVWR.bind(this)}
                viewCalendar={this.viewCalendar.bind(this)}
                renderCreateScheduleActions={this.renderCreateScheduleActions.bind(this)}
                isSelected={this.isSelected}
                toggleSelection={this.toggleSelection}
                toggleAll={this.toggleAll}
                selectAllSites={this.state.selectAllSites}
                selectedSites={this.state.selectedSites}
                sites={this.props.sites.toJS()}
                onRowClickCallBack={this.onSiteRowClick}
                filtered={filtered} /> : null}
        </PanVZRF>
        </div>
        : null}
    </div>)
  }

  renderSwitchList() {
    const filtered = [{ id: "all", value: this.state.gloableSearch }]
    return (<div className="col-md-12">
      {(this.state.gloableSearch && this.state.gloableSearch.length > 0 && (this.state.searchOn === 'Switch')) ?
        <div><PanVZRF title={`Search Result for switch "${this.state.gloableSearch}"`} bottomMargin={true}>
          {this.props.isSwitchBySubmarketLoading ?
            this.renderLoading() :
            this.props.switches.size ?
              <SwitchGrid
                setRef={this.setRef}
                onCreateVWR={this.onCreateVWR.bind(this)}
                viewCalendar={this.viewCalendar.bind(this)}
                renderCreateScheduleActions={this.renderCreateScheduleActions.bind(this)}
                isSelected={this.isSelected}
                toggleSelection={this.toggleSelection}
                toggleAll={this.toggleAll}
                selectAllSwitches={this.state.selectAllSwitches}
                selectedSwitches={this.state.selectedSwitches}
                switches={this.props.switches.toJS()}
                onRowClickCallBack={this.onSwitchRowClick}
                filtered={filtered} /> : null}
        </PanVZRF>
        </div>
        : null}
    </div>)
  }
  renderTitle = () => {
    let { allworkorders } = this.props
    let workorders = allworkorders?.toJS()
    return (
      <div className="title-div-style mb-3" style={{ marginTop: "20px", marginLeft: "15px" }} >
        <div style={{ display: 'flex' }}>
          {!this.props.isLoading && !workorders?.length && <h4 style={{ paddingRight: '20px', cursor: 'pointer', color: this.state.selectedTab == 'vendordashboard' ? "red" : null }} >Cell/Switch Work Order </h4>}
          {(workorders?.length && workorders?.some(wo => wo.work_type.toLowerCase() !== 'mdu')) ? <h4 style={{ paddingRight: '20px', cursor: 'pointer', color: this.state.selectedTab == 'vendordashboard' ? "red" : null }} onClick={() => this.setState({ selectedTab: 'vendordashboard', listOfTableData: null })}>Cell/Switch Work Order </h4> : ""}
          {(workorders?.length && workorders?.some(wo => wo.work_type.toLowerCase() == 'mdu')) ? <h4 style={{ cursor: 'pointer', color: this.state.selectedTab == 'mdu' ? "red" : null }} onClick={() => this.setState({ selectedTab: 'mdu', listOfTableData: null })}>MDU Work Order</h4> : ""}
        </div>
      </div>
    )
  }
  onLockUnlockReqReceived = (lock_unlock_request_id) => {
    this.setState({ lock_unlock_request_id });
  }
  render() {
    const { filterStatus, filterWorkType, listOfTableData, startDate, endDate, gloableSearch } = this.state
    const internalfiltered = [
      { id: "all", value: this.state.searchVal, "WorkType": filterWorkType ? filterWorkType.value : null, "vendor_portal_status": filterStatus ? filterStatus.value : null, startDate, endDate }
    ]
    const GloableFilter = [
      { id: "all", value: gloableSearch, "WorkType": null, "vendor_portal_status": null, startDate, endDate }
    ]

    const { allworkorders, userRole, user } = this.props
    let filteredworkorders
    let vendorworkorders = allworkorders?.toJS();
    let bannerEnabled = false
    if (!!this.props.notificationDetals && this.props.notificationDetals.notifications && this.props.notificationDetals.notifications.filter(val => val.NOTIFY_DISPLAY == 'Y').length > 0) {
      bannerEnabled = true
    }
    //bannerEnabled ? {paddingTop: '5rem'} : 
    if (allworkorders.size) {

      if (this.state.selectedTab == 'vendordashboard') {
        filteredworkorders = vendorworkorders?.filter(wo => wo.work_type.toLowerCase() !== 'mdu')
      } else {
        filteredworkorders = vendorworkorders?.filter(wo => wo.work_type.toLowerCase() == 'mdu')
      }
    }
    return (
      // console.log(this.)
      <MainContent>
        <div className="container-fluid">

          {this.renderSearchFilter()}
          {this.renderSiteList()}
          {this.renderSwitchList()}
          {this.renderCalendar()}
          {this.state.gloableSearch && this.state.gloableSearch.length > 0 && allworkorders.size && this.state.searchOn === 'Workorder' ? (
            <div className="col-md-12 no-padding float-left">
              <PanVZRF title={`Search result for Workorder  "${gloableSearch}"`} >
                <WorkOrderGrid isAllWorkOrder={true} workorders={fromJS(filteredworkorders)} onRowClickCallBack={this.onRowClickBackMethod.bind(this)} filtered={GloableFilter} path={userRole} />
              </PanVZRF>
            </div>) : null}
          {this.props.isLoading ? this.renderLoading() : (<div className="col-md-12  float-left" style={{ padding: "0px" }}>
            {(this.state.searchOn === 'Workorder' || this.state.searchOn === 'Site' || this.state.searchOn === 'Switch') && <Dashboard onPanClick={this.onPanClick} searchToggle={this.state.searchOn} selectedTab={this.state.selectedTab} />} </div>)}
          {/* this.props.isLoading ? this.renderLoading() : (this.state.isCalendarView == false || this.state.searchOn === 'Workorder' ? <div className="col-md-12 no-padding float-left"> <Dashboard onPanClick={this.onPanClick} /></div> : null)*/}
          {listOfTableData && listOfTableData.name ? (
            this.state.selectedTab == 'vendordashboard' ?
              <div className="col-md-12 no-padding float-left margin-top-bottom-10 ">
                <PanVZRF title={listOfTableData.name} gridHeader={true} advancedFilterOptions={this.state.advancedModalSearchParams} onClose={this.onClosePan} onExcelDownload={listOfTableData.data.length > 0 ? this.onExcelDownload : null} rmaExcelDownload={user && user.get('vendor_pricing_macro_ant_tow') && user.get('vendor_pricing_macro_ant_tow') == '1' ? this.rmaExcelDownload : null} rmaLoading={this.props.rmaLoading} selectedTab={this.state.selectedTab}>

                  {this.state.isRMAView ? (
                    <RMAGrid 
                      rmaDetails={listOfTableData.data}
                      onRowClickCallBack={this.onRMARowClickBackMethod}
                      filtered={internalfiltered}
                      path={userRole}
                      title={listOfTableData.name}
                      workOrders={vendorworkorders}
                    />
                  ) : (
                    <WorkOrderAGgrid gridApi={this.gridApi} onGridReady={this.onGridReady} onRowClickCallBack={this.onRowClickBackMethod.bind()}
                      ordersList={this.state.listOfTableData} filtered={internalfiltered} path={userRole} title={listOfTableData.name}
                      uniqueUId={this.state.uniqueUId} workorders={listOfTableData.data}
                      vendorCalenderIconClicked={this.setVendorCalenderViewClicked}
                      workOrderStatus={this.state.workOrderStatus}
                      handleHideModal={this.handleHideModal}
                      notifref={this._notificationSystem} />
                  )}
                </PanVZRF>
              </div> :
              <div className="col-md-12 no-padding float-left margin-top-bottom-10 ">
                <PanVZRF title={listOfTableData.name} gridHeader={true} advancedFilterOptions={this.state.advancedModalSearchParams} onClose={this.onClosePan} onExcelDownload={listOfTableData.data.length > 0 ? this.onExcelDownload : null} rmaExcelDownload={user && user.get('vendor_pricing_macro_ant_tow') && user.get('vendor_pricing_macro_ant_tow') == '1' ? this.rmaExcelDownload : null} rmaLoading={this.props.rmaLoading} selectedTab={this.state.selectedTab}>

                  {this.state.isRMAView ? (
                    <RMAGrid 
                      rmaDetails={listOfTableData.data}
                      onRowClickCallBack={this.onRMARowClickBackMethod}
                      filtered={internalfiltered}
                      path={userRole}
                      title={listOfTableData.name}
                      workOrders={vendorworkorders}
                    />
                  ) : (
                    <MDUWorkorderGrid gridApi={this.gridApi} onGridReady={this.onGridReady} onRowClickCallBack={this.onRowClickBackMethod.bind()}
                      ordersList={this.state.listOfTableData} filtered={internalfiltered} path={userRole} title={listOfTableData.name}
                      uniqueUId={this.state.uniqueUId} workorders={listOfTableData.data}
                      vendorCalenderIconClicked={this.setVendorCalenderViewClicked}
                      workOrderStatus={this.state.workOrderStatus}
                      handleHideModal={this.handleHideModal}
                      notifref={this._notificationSystem} />
                  )}
                </PanVZRF>
              </div>
          ) : null}
        </div>
        <NotificationSystem ref="notificationSystem" />
        {this.state.isModalshown ? this.renderWorkOrderModal() : null}
        {this.state.projectViewModel ? this.renderProjectViewModel() : null}
        {this.state.isShowCreateWoRequest ? this.renderCreateWoRequestModal() : null}
        {this.state.isShowSwitchCreateWoRequest ? this.renderSwitchCreateWoRequestModal() : null}
        {this.state.isWOSchedulingModalShown ? this.renderWOSchedulingModal() : null}
        {this.state.isAdvancedSearchModalShown ? this.renderAdvancedSeachModal() : null}
        {this.state.isReportIssueShown ? this.renderReportIssue() : null}
        {this.state.vendorCalenderViewModel ? this.renderWorkOrderModal() : null}
      </MainContent>

    )
  }
}

function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let siteDetails = state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List())
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user.toJS().vendor_id
  let isLoading = state.getIn(["VendorDashboard", loginId, "workOrders", "wrloading"], false)
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  let openOswData = state.getIn(['Users', 'openOsw', 'data'], List())

  const realuser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let realVendorId = realuser.get('vendor_id')
  let isCompletedPanelLoading = state.getIn(["VendorDashboard", loginId, "workOrders", "completedPanelLoading"], false)
  let userRole = state.getIn(['Users', 'entities', 'users', loginId, 'vendor_role'], "")
  let allworkorders = state.getIn(["VendorDashboard", loginId, "allworkorders"], Map())
  let WorkType = state.getIn(["VendorDashboard", loginId, "WorkType"], List())
  let sites = state.getIn(["Sites", loginId, "sitesbysubmarket", "sites"], Map())
  let site = state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()).toJS()
  let events = state.getIn(["VendorDashboard", loginId, "events", "eventsDetails"], Map())
  events = events.toJS().getEventDetails
  let isSiteBySubmarketLoading = state.getIn(["Sites", loginId, "sitesbysubmarket", "siteBySubmarketisLoading"], false)
  // const UsersList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let switches = state.getIn(["Switch", loginId, "switchesbysubmarket", "switches"], Map())
  let isSwitchBySubmarketLoading = state.getIn(["Switch", loginId, "switchesbysubmarket", "switchBySubmarketisLoading"], false)
  let historyWorkOrders = state.getIn(["VendorDashboard", loginId, "historyMap"], Map())
  const notificationDetals = state.getIn(['PmDashboard', realLoginId, realVendorId, "pm", 'BannerDetails']) ? state.getIn(['PmDashboard', realLoginId, realVendorId, "pm", 'BannerDetails'], List()).toJS() : null
  const appNotification = state.getIn(['AppNotificationReducer', 'appNotification'], Map())
  const vendorWorkOrderSelectedRowObj = state.getIn(["VendorDashboard", loginId, "workOrders", "selectedRow"], Map())
  let work = state.getIn(["VendorDashboard", loginId, "user_dashboard", "work"], List())
  let vendor_wo_details = state.getIn(["VendorDashboard", loginId, "vendor_wo_details"], List())
  let exportExcelLoading = state.getIn(["VendorDashboard", loginId, "exportData", "exportDataLoading"], false)
  let IVRLoginDetails = state.getIn(['ivr', 'login', siteDetails?.toJS()?.site_unid], Map());
  let config = state.getIn(['Users', 'configData', 'configData'], List())
  let rmaStatusData = state.getIn(["VendorDashboard", loginId, vendorId, "rmaStatusData"], List()).toJS()
  const rmaDetailsExcel = state.getIn(["VendorDashboard", loginId, null, "result"], List()).toJS()
  const rmaLoading = state.getIn(["VendorDashboard", loginId, null, "rmaLoading"], false)
  let rmaDeliveredData = state.getIn(["VendorDashboard", loginId, "user_dashboard", "rma"], List()).toJS()
  return {
    user,
    loginId,
    openOswData,
    vendorId,
    realVendorId,
    isLoading,
    isCompletedPanelLoading,
    userRole,
    allworkorders,
    IVRLoginDetails,
    WorkType,
    sites,
    site,
    realLoginId,
    events,
    isSiteBySubmarketLoading,
    switches,
    isSwitchBySubmarketLoading,
    historyWorkOrders,
    notificationDetals,
    appNotification,
    vendorWorkOrderSelectedRowObj,
    work,
    vendor_wo_details,
    exportExcelLoading,
    config,
    rmaStatusData,
    rmaDetailsExcel,
    rmaLoading, rmaDeliveredData
  }
}

export default connect(stateToProps, { ...AppNotificationActions, ...VendorActions, getProjectInfoSlr, capitalProjectSelectedRow, getCalenderEventsForSite, getConflictkirkeEventsForSite, logActioninDB, resetProps, fetchSitesBySubmarket, fetchSwitchesBySubmarket, attemptLogoutOfIVR, clearIVRLogoutRequest, fetchBannerDetails, fetchDataToExport })(VendorDashboard)
