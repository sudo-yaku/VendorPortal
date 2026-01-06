import ajax from '../ajax'
import {createAction} from '../redux_utils'
import * as schema from './schema'
import * as utils from "./utils"
import moment from "moment"

export const RESET_PROPS = "RESET_PROPS"

export const FETCH_AWAITING_WR_REQUEST = 'FETCH_AWAITING_WR_REQUEST'
export const FETCH_AWAITING_WR_SUCCESS = 'FETCH_AWAITING_WR_SUCCESS'
export const FETCH_AWAITING_WR_FAILURE = 'FETCH_AWAITING_WR_FAILURE'

export const fetchAwaitingWRRequest = createAction(FETCH_AWAITING_WR_REQUEST, 'loginId')
export const fetchAwaitingWRSuccess = createAction(FETCH_AWAITING_WR_SUCCESS, 'loginId', 'AwaitingWR')
export const fetchAwaitingWRFailure = createAction(FETCH_AWAITING_WR_FAILURE, 'loginId', 'errors')

export const FETCH_WR_REQUEST = 'FETCH_WR_REQUEST'
export const FETCH_WR_SUCCESS = 'FETCH_WR_SUCCESS'
export const FETCH_WR_FAILURE = 'FETCH_WR_FAILURE'

export const FETCH_COMPLETED_WR_REQUEST = 'FETCH_COMPLETED_WR_REQUEST'
export const FETCH_COMPLETED_WR_SUCCESS = 'FETCH_COMPLETED_WR_SUCCESS'

export const DELETE_SAVED_GENREAD_MSG = "DELETE_SAVED_GENREAD_MSG"

export const fetchWRRequest = createAction(FETCH_WR_REQUEST, 'loginId')
export const fetchCompletedPanelRequest = createAction(FETCH_COMPLETED_WR_REQUEST, 'loginId')
export const fetchWRSuccess = createAction(FETCH_WR_SUCCESS, 'loginId', 'workOrders')
export const fetchCompletedWRSuccess = createAction(FETCH_COMPLETED_WR_SUCCESS, 'loginId', 'completedItems')
export const fetchWRFailure = createAction(FETCH_WR_FAILURE, 'loginId', 'errors')

export const FETCH_EXCEL_DATA_REQUEST = 'FETCH_EXCEL_DATA_REQUEST'
export const FETCH_EXCEL_DATA_SUCCESS = 'FETCH_EXCEL_DATA_SUCCESS'
export const FETCH_EXCEL_DATA_FAILURE = 'FETCH_EXCEL_DATA_FALURE'

export const fetchExportExcelDataRequest = createAction(FETCH_EXCEL_DATA_REQUEST, 'loginId')
export const fetchExportExcelDataSuccess = createAction(FETCH_EXCEL_DATA_SUCCESS, 'loginId', 'exportData')
export const fetchExportExcelDataFailure = createAction(FETCH_EXCEL_DATA_FAILURE, 'loginId', 'errors')

export const FETCH_SITEDETAILS_REQUEST = 'FETCH_SITEDETAILS_REQUEST'
export const FETCH_SITEDETAILS_SUCCESS = 'FETCH_SITEDETAILS_SUCCESS'
export const FETCH_SITEDETAILS_FAILURE = 'FETCH_SITEDETAILS_FAILURE'

export const fetchSiteDetailsRequest = createAction(FETCH_SITEDETAILS_REQUEST, 'loginId')
export const fetchSiteDetailsSuccess = createAction(FETCH_SITEDETAILS_SUCCESS, 'loginId', 'siteunid', 'site')
export const fetchSiteDetailsFailure = createAction(FETCH_SITEDETAILS_FAILURE, 'loginId', 'errors')

export const SUBMIT_QUOTE_REQUEST = 'SUBMIT_QUOTE_REQUEST'
export const SUBMIT_QUOTE_SUCCESS = 'SUBMIT_QUOTE_SUCCESS'
export const SUBMIT_QUOTE_ERROR = 'SUBMIT_QUOTE_ERROR'
export const SUBMIT_QUOTE_FAILURE = 'SUBMIT_QUOTE_FAILURE'

export const submitQuoteRequest = createAction(SUBMIT_QUOTE_REQUEST, 'loginId')
export const submitQuoteSuccess = createAction(SUBMIT_QUOTE_SUCCESS, 'loginId', 'savedMessage')
export const submitQuoteError = createAction(SUBMIT_QUOTE_ERROR, 'loginId', 'errorMessage')
export const submitQuoteFailure = createAction(SUBMIT_QUOTE_FAILURE, 'loginId', 'errors')


export const SUBMIT_WORKORDER_FILE_SUCCESS = 'SUBMIT_WORKORDER_FILE_SUCCESS'
export const SUBMIT_WORKORDER_FILE_ERROR = 'SUBMIT_WORKORDER_FILE_ERROR'
export const SUBMIT_WORKORDER_FILE_REQUEST = 'SUBMIT_WORKORDER_FILE_REQUEST'

export const submitWorkorderFileRequest = createAction(SUBMIT_WORKORDER_FILE_REQUEST, 'loginId')
export const submitWorkorderFileSuccess = createAction(SUBMIT_WORKORDER_FILE_SUCCESS, 'loginId', 'savedMessage')
export const submitWorkorderFileError = createAction(SUBMIT_WORKORDER_FILE_ERROR, 'loginId', 'errorMessage')


export const SUBMIT_QUOTE_FILE_SUCCESS = 'SUBMIT_QUOTE_FILE_SUCCESS'
export const SUBMIT_QUOTE_FILE_ERROR = 'SUBMIT_QUOTE_FILE_ERROR'
export const SUBMIT_QUOTE_FILE_REQUEST = 'SUBMIT_QUOTE_FILE_REQUEST'

export const submitQuoteFileRequest = createAction(SUBMIT_QUOTE_FILE_REQUEST, 'loginId')
export const submitQuoteFileSuccess = createAction(SUBMIT_QUOTE_FILE_SUCCESS, 'loginId', 'savedMessage')
export const submitQuoteFileError = createAction(SUBMIT_QUOTE_FILE_ERROR, 'loginId', 'errorMessage')


export const DELETE_SAVED_MSG_FILEUPLOAD = "DELETE_SAVED_MSG_FILEUPLOAD"

export const SUBMIT_FIle_VWO_REQUEST = 'SUBMIT_FIle_VWO_REQUEST'
export const SUBMIT_FIle_VWO_SUCCESS = 'SUBMIT_FIle_VWO_SUCCESS'
export const SUBMIT_FIle_VWO_FAILURE = 'SUBMIT_FIle_VWO_FAILURE'

export const submitFileVwoRequest = createAction(SUBMIT_FIle_VWO_REQUEST, 'loginId')
export const submitFileVwoSuccess = createAction(SUBMIT_FIle_VWO_SUCCESS, 'loginId', 'data')
export const submitFileVwoFailure = createAction(SUBMIT_FIle_VWO_FAILURE, 'loginId', 'errors')

export const DELETE_SAVED_MSG = "DELETE_SAVED_MSG"

export const FETCH_WR_REQUEST_FOR_DATES = 'FETCH_WR_REQUEST'
export const FETCH_WR_SUCCESS_FOR_DATES = 'FETCH_WR_SUCCESS'
export const FETCH_WR_FAILURE_FOR_DATES = 'FETCH_WR_FAILURE'

export const UPDATE_WORKORDER_STATUS_SUCCESS = 'UPDATE_WORKORDER_STATUS_SUCCESS'
export const UPDATE_WORKORDER_STATUS_ERROR = 'UPDATE_WORKORDER_STATUS_ERROR'
export const UPDATE_WORKORDER_STATUS_REQUEST = 'UPDATE_WORKORDER_STATUS_REQUEST'

export const updateWorkorderStatusRequest = createAction(UPDATE_WORKORDER_STATUS_REQUEST, 'loginId')
export const updateWorkorderStatusSuccess = createAction(UPDATE_WORKORDER_STATUS_SUCCESS, 'loginId', 'savedMessage', 'unid', 'input', 'userFullName')
export const updateWorkorderStatusError = createAction(UPDATE_WORKORDER_STATUS_ERROR, 'loginId', 'errorMessage')

export const FETCH_ATTACHMENTS_SUCCESS = 'FETCH_ATTACHMENTS_SUCCESS'
export const FETCH_ATTACHMENTS_ERROR = 'FETCH_ATTACHMENTS_ERROR'
export const FETCH_ATTACHMENTS_REQUEST = 'FETCH_ATTACHMENTS_REQUEST'

export const fetchAttachmentFileRequest = createAction(FETCH_ATTACHMENTS_REQUEST, 'loginId')
export const fetchAttachmentFileSuccess = createAction(FETCH_ATTACHMENTS_SUCCESS, 'loginId', 'workorderId', 'unid', 'list', 'category')
export const fetchAttachmentFileError = createAction(FETCH_ATTACHMENTS_ERROR, 'loginId', 'errorMessage')

export const DOWNLOAD_FILE_SUCCESS = 'DOWNLOAD_FILE_SUCCESS'
export const DOWNLOAD_FILE_ERROR = 'DOWNLOAD_FILE_ERROR'
export const DOWNLOAD_FILE_REQUEST = 'DOWNLOAD_FILE_REQUEST'

export const downloadFileRequest = createAction(DOWNLOAD_FILE_REQUEST, 'loginId')
export const downloadFileSuccess = createAction(DOWNLOAD_FILE_SUCCESS, 'loginId', 'unid', 'filename', 'filedata')
export const downloadFileError = createAction(DOWNLOAD_FILE_ERROR, 'loginId', 'errorMessage')

export const DOWNLOAD_VS_FILE_SUCCESS = 'DOWNLOAD_VS_FILE_SUCCESS'
export const DOWNLOAD_VS_FILE_ERROR = 'DOWNLOAD_VS_FILE_ERROR'
export const DOWNLOAD_VS_FILE_REQUEST = 'DOWNLOAD_VS_FILE_REQUEST'

export const downloadVSFileRequest = createAction(DOWNLOAD_VS_FILE_REQUEST, 'loginId')
export const downloadVSFileSuccess = createAction(DOWNLOAD_VS_FILE_SUCCESS, 'loginId', 'filename', 'filedata')
export const downloadVSFileError = createAction(DOWNLOAD_VS_FILE_ERROR, 'loginId', 'errorMessage')

export const SUBMIT_WORKORDER_REQUEST_SUCCESS = 'SUBMIT_WORKORDER_REQUEST_SUCCESS'
export const SUBMIT_WORKORDER_REQUEST_ERROR = 'SUBMIT_WORKORDER_REQUEST_ERROR'
export const SUBMIT_WORKORDER_REQUEST_REQUEST = 'SUBMIT_WORKORDER_REQUEST_REQUEST'

export const submitWorkorderRequestRequest = createAction(SUBMIT_WORKORDER_REQUEST_REQUEST, 'loginId')
export const submitWorkorderRequestSuccess = createAction(SUBMIT_WORKORDER_REQUEST_SUCCESS, 'loginId', 'savedMessage')
export const submitWorkorderRequestError = createAction(SUBMIT_WORKORDER_REQUEST_ERROR, 'loginId', 'errorMessage')

/* Event Scheduling constants starts here */
export const FETCH_EVENTDETAILS_REQUEST = 'FETCH_EVENTDETAILS_REQUEST'
export const FETCH_EVENTDETAILS_SUCCESS = 'FETCH_EVENTDETAILS_SUCCESS'
export const FETCH_EVENTDETAILS_FAILURE = 'FETCH_EVENTDETAILS_FAILURE'

export const GET_CALENDER_EVENTS_FOR_SITE_REQUEST = 'GET_CALENDER_EVENTS_FOR_SITE_REQUEST'
export const GET_CALENDER_EVENTS_FOR_SITE_SUCCESS = 'GET_CALENDER_EVENTS_FOR_SITE_SUCCESS'
export const GET_CALENDER_EVENTS_FOR_SITE_FAILURE = 'GET_CALENDER_EVENTS_FOR_SITE_FAILURE'

export const GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_REQUEST = 'GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_REQUEST'
export const GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_SUCCESS = 'GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_SUCCESS'
export const GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_FAILURE = 'GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_FAILURE'

export const GET_LATEST_OSW_REQUEST = 'GET_LATEST_OSW_REQUEST'
export const GET_LATEST_OSW_SUCCESS = 'GET_LATEST_OSW_SUCCESS'
export const GET_LATEST_OSW_FAILURE = 'GET_LATEST_OSW_FAILURE'

export const FETCH_VENDOR_DISPATCH_DISTANCE_REQUEST = 'FETCH_VENDOR_DISPATCH_DISTANCE_REQUEST'
export const FETCH_VENDOR_DISPATCH_DISTANCE_SUCCESS = 'FETCH_VENDOR_DISPATCH_DISTANCE_SUCCESS'
export const FETCH_VENDOR_DISPATCH_DISTANCE_FAILURE = 'FETCH_VENDOR_DISPATCH_DISTANCE_FAILURE'

export const fetchVendorDispatchDistanceRequest = createAction(FETCH_VENDOR_DISPATCH_DISTANCE_REQUEST)
export const fetchVendorDispatchDistanceSuccess = createAction(FETCH_VENDOR_DISPATCH_DISTANCE_SUCCESS,'getWorkOrderDistanceDetails')
export const fetchVendorDispatchDistanceFailure = createAction(FETCH_VENDOR_DISPATCH_DISTANCE_FAILURE,'errors')

export const FETCH_EVENTDETAILS_SITE_REQUEST = 'FETCH_EVENTDETAILS_SITE_REQUEST'
export const FETCH_EVENTDETAILS_SITE_SUCCESS = 'FETCH_EVENTDETAILS_SITE_SUCCESS'
export const FETCH_EVENTDETAILS_SITE_FAILURE = 'FETCH_EVENTDETAILS_SITE_FAILURE'

export const fetchEventDetailsRequest = createAction(FETCH_EVENTDETAILS_REQUEST, 'loginId')
export const fetchEventDetailsSuccess = createAction(FETCH_EVENTDETAILS_SUCCESS, 'loginId', 'events')
export const fetchEventDetailsFailure = createAction(FETCH_EVENTDETAILS_FAILURE, 'loginId', 'errors')

export const getCalenderEventsForSiteRequest = createAction(GET_CALENDER_EVENTS_FOR_SITE_REQUEST, 'loginId')
export const getCalenderEventsForSiteSuccess = createAction(GET_CALENDER_EVENTS_FOR_SITE_SUCCESS, 'loginId', 'events')
export const getCalenderEventsForSiteFailure = createAction(GET_CALENDER_EVENTS_FOR_SITE_FAILURE, 'loginId', 'errors')

export const getConflictkirkeEventsForSiteRequest = createAction(GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_REQUEST, 'loginId')
export const getConflictkirkeEventsForSiteSuccess = createAction(GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_SUCCESS, 'loginId', 'events')
export const getConflictkirkeEventsForSiteFailure = createAction(GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_FAILURE, 'loginId', 'errors')

export const getLatestOswDateRequest = createAction(GET_LATEST_OSW_REQUEST, 'loginId')
export const getLatestOswDateSuccess = createAction(GET_LATEST_OSW_SUCCESS, 'loginId', 'oswdates')
export const getLatestOswDateFailure = createAction(GET_LATEST_OSW_FAILURE, 'loginId', 'errors')

export const fetchEventsBySiteUnidRequest = createAction(FETCH_EVENTDETAILS_SITE_REQUEST, 'loginId')
export const fetchEventsBySiteUnidSuccess = createAction(FETCH_EVENTDETAILS_SITE_SUCCESS, 'loginId', 'events')
export const fetchEventsBySiteUnidFailure = createAction(FETCH_EVENTDETAILS_SITE_FAILURE, 'loginId', 'errors')

export const SUBMIT_SCHEDULE_REQUEST_SUCCESS = 'SUBMIT_SCHEDULE_REQUEST_SUCCESS'
export const SUBMIT_SCHEDULE_REQUEST_ERROR = 'SUBMIT_SCHEDULE_REQUEST_ERROR'
export const SUBMIT_SCHEDULE_REQUEST_REQUEST = 'SUBMIT_SCHEDULE_REQUEST_REQUEST'

export const submitScheduleRequestRequest = createAction(SUBMIT_SCHEDULE_REQUEST_REQUEST, 'loginId')
export const submitScheduleRequestSuccess = createAction(SUBMIT_SCHEDULE_REQUEST_SUCCESS, 'loginId', 'savedMessage')
export const submitScheduleRequestError = createAction(SUBMIT_SCHEDULE_REQUEST_ERROR, 'loginId', 'errorMessage')

export const UPDATE_SCHEDULE_REQUEST_SUCCESS = 'UPDATE_SCHEDULE_REQUEST_SUCCESS'
export const UPDATE_SCHEDULE_REQUEST_ERROR = 'UPDATE_SCHEDULE_REQUEST_ERROR'
export const UPDATE_SCHEDULE_REQUEST_REQUEST = 'UPDATE_SCHEDULE_REQUEST_REQUEST'

export const updateScheduleRequestRequest = createAction(UPDATE_SCHEDULE_REQUEST_REQUEST, 'loginId')
export const updateScheduleRequestSuccess = createAction(UPDATE_SCHEDULE_REQUEST_SUCCESS, 'loginId', 'savedMessage')
export const updateScheduleRequestError = createAction(UPDATE_SCHEDULE_REQUEST_ERROR, 'loginId', 'errorMessage')
/* Event Scheduling constants end here */

// Fetch Work order details by wo unid
export const FETCH_WO_UNID_REQUEST = 'FETCH_WO_UNID_REQUEST'
export const FETCH_WO_UNID_SUCCESS = 'FETCH_WO_UNID_SUCCESS'
export const FETCH_WO_UNID_FAILURE = 'FETCH_WO_UNID_FAILURE'

export const fetchWoUnidRequest = createAction(FETCH_WO_UNID_REQUEST, 'unid')
export const fetchWoUnidSuccess = createAction(FETCH_WO_UNID_SUCCESS, 'unid', 'vendor_wo_details', 'quoteItemDetails', 'loginId')
export const fetchWoUnidFailure = createAction(FETCH_WO_UNID_FAILURE, 'unid', 'errors')

// Fetch Generator Details by site UNID
export const FETCH_GENERATORDETAILS_REQUEST = 'FETCH_GENERATORDETAILS_REQUEST'
export const FETCH_GENERATORDETAILS_SUCCESS = 'FETCH_GENERATORDETAILS_SUCCESS'
export const FETCH_GENERATORDETAILS_FAILURE = 'FETCH_GENERATORDETAILS_FAILURE'

export const fetchGeneratorDetailsRequest = createAction(FETCH_GENERATORDETAILS_REQUEST, 'unid')
export const fetchGeneratorDetailsSuccess = createAction(FETCH_GENERATORDETAILS_SUCCESS, 'unid', 'generators')
export const fetchGeneratorDetailsFailure = createAction(FETCH_GENERATORDETAILS_FAILURE, 'unid', 'errors')

// fetch pending work order details request

export const FETCH_PENDINGWODETAILS_REQUEST = 'FETCH_PENDINGWODETAILS_REQUEST'
export const FETCH_PENDINGWODETAILS_SUCCESS = 'FETCH_PENDINGWODETAILS_SUCCESS'
export const FETCH_PENDINGWODETAILS_FAILURE = 'FETCH_PENDINGWODETAILS_FAILURE'

export const fetchPendingWorkOrderDetailsRequest = createAction(FETCH_PENDINGWODETAILS_REQUEST, 'loginId', 'vendorId')
export const fetchPendingWorkOrderDetailsSuccess = createAction(FETCH_PENDINGWODETAILS_SUCCESS, 'loginId', 'vendorId', 'pendingWorkOrderDetails')
export const fetchPendingWorkOrderDetailsFailure = createAction(FETCH_PENDINGWODETAILS_FAILURE, 'loginId', 'vendorId', 'errors')

// Fetch Generator Fuel tank Details by site UNID
export const FETCH_GENTANKDETAILS_REQUEST = 'FETCH_GENTANKDETAILS_REQUEST'
export const FETCH_GENTANKDETAILS_SUCCESS = 'FETCH_GENTANKDETAILS_SUCCESS'
export const FETCH_GENTANKDETAILS_FAILURE = 'FETCH_GENTANKDETAILS_FAILURE'

export const fetchGenTankDetailsRequest = createAction(FETCH_GENTANKDETAILS_REQUEST, 'unid')
export const fetchGenTankDetailsSuccess = createAction(FETCH_GENTANKDETAILS_SUCCESS, 'unid', 'genTank')
export const fetchGenTankDetailsFailure = createAction(FETCH_GENTANKDETAILS_FAILURE, 'unid', 'errorMessage')

// Submitting Generator Fuel tank Details by PM_UNID
export const SUBMIT_GENTANKDETAILS_REQUEST = 'SUBMIT_GENTANKDETAILS_REQUEST'
export const SUBMIT_GENTANKDETAILS_SUCCESS = 'SUBMIT_GENTANKDETAILS_SUCCESS'
export const SUBMIT_GENTANKDETAILS_FAILURE = 'SUBMIT_GENTANKDETAILS_FAILURE'

export const submitGenTankDetailsRequest = createAction(SUBMIT_GENTANKDETAILS_REQUEST, 'unid')
export const submitGenTankDetailsSuccess = createAction(SUBMIT_GENTANKDETAILS_SUCCESS, 'unid', 'savedMessage')
export const submitGenTankDetailsFailure = createAction(SUBMIT_GENTANKDETAILS_FAILURE, 'unid', 'errors')


// Fetch HVAC Details by site UNID
export const FETCH_HVACDETAILS_REQUEST = 'FETCH_HVACDETAILS_REQUEST'
export const FETCH_HVACDETAILS_SUCCESS = 'FETCH_HVACDETAILS_SUCCESS'
export const FETCH_HVACDETAILS_FAILURE = 'FETCH_HVACDETAILS_FAILURE'

export const fetchHvacDetailsRequest = createAction(FETCH_HVACDETAILS_REQUEST, 'unid')
export const fetchHvacDetailsSuccess = createAction(FETCH_HVACDETAILS_SUCCESS, 'unid', 'hvacs')
export const fetchHvacDetailsFailure = createAction(FETCH_HVACDETAILS_FAILURE, 'unid', 'errors')

// Fetch Advanced History from search filter feilds - Vendor Dashboard
export const FETCH_ADVANCED_HISTORY = 'FETCH_ADVANCED_HISTORY'
export const FETCH_ADVANCED_HISTORY_SUCCESS = 'FETCH_ADVANCED_HISTORY_SUCCESS'
export const FETCH_ADVANCED_HISTORY_FAILURE = 'FETCH_ADVANCED_HISTORY_FAILURE'
export const RESET_HISTORY_PROPS = "RESET_HISTORY_PROPS"

export const fetchAdvancedHistoryRequest = createAction(FETCH_ADVANCED_HISTORY, 'loginId')
export const fetchAdvancedHistoryByWorkOrderIdSuccess = createAction(FETCH_ADVANCED_HISTORY_SUCCESS, 'loginId', 'searchType', 'searchHistoryData')
export const fetchAdvancedHistoryByWorkOrderIdFailure = createAction(FETCH_ADVANCED_HISTORY_FAILURE, 'loginId', 'searchType', 'errors')


export function submitWorkorderRequest (loginId, input) {
  return dispatch => {
    dispatch(submitWorkorderRequestRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.submitworequest, variables: {loginId: loginId,wo_request_input: input}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.submitWORequest) {
          return dispatch(submitWorkorderRequestSuccess(loginId, res.data.data.submitWORequest))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(submitWorkorderRequestError(loginId, {message}))
        } else {
          throw {message: "Unknow Error! Please contact administrator."}
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(updateWorkorderStatusError(loginId, {message: errors[0].message}))
        } else {
          return dispatch(updateWorkorderStatusError(loginId, {message: "Unknow Error! Please contact administrator."}))
        }
      })
  }
}

export function fetchVendorDispatchDistance (siteunid,userid) {
  return dispatch => {
    dispatch(fetchVendorDispatchDistanceRequest())
    return ajax.post(`/graphql4g`, {query: schema.getVendorDispatchLocation, variables: {siteUnid: siteunid,userId:userid}})
      .then(res =>{dispatch(fetchVendorDispatchDistanceSuccess(res?.data?.data?.getWorkOrderDistanceDetails))})
      .catch(errors => dispatch(fetchVendorDispatchDistanceFailure(errors)))
  }
}

export function submitGenReadingsRequest (pm_unid, input) {

  return dispatch => {
    dispatch(submitGenTankDetailsRequest(pm_unid))
    return ajax.post(`/graphql4g`, {query: schema.submitgenreadingsrequest, variables: {gen_reading_request: input}})
      .then(res => dispatch(submitGenTankDetailsSuccess(pm_unid, res.data.data.submitGenReadings)))
      .catch(ex => dispatch(submitGenTankDetailsFailure(pm_unid, ex)))


  }
}

export function deleteSavedGenReadMsg () {
  return {
    type: DELETE_SAVED_GENREAD_MSG
  }
}

export function fetchGenTankDetails (unid) {
  return dispatch => {
    dispatch(fetchGenTankDetailsRequest(unid))
    return ajax.post(`/graphql4g`, {query: schema.getGenTanknfoForUnid, variables: {unid: unid}})
      .then(res => dispatch(fetchGenTankDetailsSuccess(unid, res.data.data.getGenTanknfoForUnid.genTank)))
      .catch(errors => dispatch(fetchGenTankDetailsFailure(unid, errors)))
  }
}

export function fetchWoByUnidDetails (unid, loginId, dashboardData=null) {
  return dispatch => {
    dispatch(fetchWoUnidRequest(unid))
    return ajax.post(`/graphql4g`, {query: schema.getVendorWoByUnid, variables: {unid: unid, loginId: loginId}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.getVendorWoByUnid
          && res.data.data.getVendorWoByUnid.vendor_wo_details && Object.keys(res.data.data.getVendorWoByUnid.vendor_wo_details).length > 0) {
          let loginId = (dashboardData && dashboardData.loginId) ? dashboardData.loginId : null
          let quoteItemData = (dashboardData && dashboardData.tableTitle.includes('Advanced')) ?(new utils.QuoteItems(res.data.data.getVendorWoByUnid.vendor_wo_details)): null
          return dispatch(fetchWoUnidSuccess(unid, res.data.data.getVendorWoByUnid.vendor_wo_details, quoteItemData, loginId))
        } else {
          return dispatch(fetchWoUnidFailure(unid, "WO Details are for given Unid are not present"))
        }
      }).catch(errors => dispatch(fetchWoUnidFailure(unid, errors)))

  }
}

export function fetchEventsBySiteUnid (loginId, siteunid) {
  return dispatch => {
    dispatch(fetchEventsBySiteUnidRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.getEventsBySiteUnid, variables: {siteunid: siteunid}})
      .then(res => dispatch(fetchEventsBySiteUnidSuccess(loginId, res.data.data)))
      .catch(errors => dispatch(fetchEventsBySiteUnidFailure(loginId, errors)))
  }
}
export function getCalenderEventsForSite (loginId, startDate, endDate, siteUnid) {
  let startDt = moment(startDate).subtract(1, 'month').format('YYYY-MM-DD')
  let endDt = moment(endDate).subtract(1, 'month').format('YYYY-MM-DD')
  let variables = {startDate: startDt, endDate: endDt, siteUnid: siteUnid}
  return dispatch => {
    dispatch(getCalenderEventsForSiteRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.getCalenderEventsForSite, variables: variables})
      .then(res => {
        if(res.data && res.data.errors && res.data.errors.length > 0) {
          return dispatch(getCalenderEventsForSiteFailure(loginId, res.data.errors))
        }
        return dispatch(getCalenderEventsForSiteSuccess(loginId, res.data.data))
      })
      .catch(errors => {
        console.log("errors", errors)
        return dispatch(fetchEventDetailsFailure(loginId, errors))
      }
        )
  }
}
export function getConflictkirkeEventsForSite (loginId, startDate, endDate, siteUnid) {
  let startDt = moment(startDate).subtract(1, 'month').format('YYYY-MM-DD')
  let endDt = moment(endDate).subtract(1, 'month').format('YYYY-MM-DD')
  let variables = {startDate: startDt, endDate: endDt, siteUnid: siteUnid}
  return dispatch => {
    dispatch(getConflictkirkeEventsForSiteRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.getConflictkirkeEventsForSite, variables: variables})
      .then(res => {
        if(res.data && res.data.errors && res.data.errors.length > 0) {
          return dispatch(getConflictkirkeEventsForSiteFailure(loginId, res.data.errors))
        }
        return dispatch(getConflictkirkeEventsForSiteSuccess(loginId, res.data.data))
      })
  }
}
export function getLatestOswDate(loginId, work_order_id){
  return dispatch => {
    dispatch(getLatestOswDateRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.getLatestOswDate, variables: {work_order_id : work_order_id}})
      .then(res => {
        if(res.data?.data?.getLatestOswDate?.Osw_Date){
          return dispatch(getLatestOswDateSuccess(loginId, res.data.data.getLatestOswDate))
        }
        else if(res.data && res.data.errors && res.data.errors.length > 0) {
          return dispatch(getLatestOswDateFailure(loginId, res.data.errors))
        }else {
          throw {message: "Unknown Error! Please contact the administrator."}
        }
      }).catch(errors=>{
        console.log("errors", errors)
        return dispatch(getLatestOswDateFailure(loginId, errors))
      })
    }
}
// FETCH EVENT DETAILS
export function fetchEventDetails (loginId, vendorId, type) {
  let variables = {vendorId: vendorId, loginId: loginId}
  if (type) {
    variables = {vendorId: vendorId, loginId: loginId, type:type}
  }
  return dispatch => {
    dispatch(fetchEventDetailsRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchEventDetails, variables: variables})
      .then(res => {
        if(res.data && res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchEventDetailsFailure(loginId, res.data.errors))
        }
        return dispatch(fetchEventDetailsSuccess(loginId, res.data.data))
      })
      .catch(errors => {
        console.log("errors", errors)
        return dispatch(fetchEventDetailsFailure(loginId, errors))
      }
        )
  }
}

export function submitScheduleRequest (loginId, input) {
  return dispatch => {
    dispatch(submitScheduleRequestRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.submitschedulerequest, variables: {schedule_request_input: input}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.submitScheduleRequest && res.data.data.submitScheduleRequest.message) {
          return dispatch(submitScheduleRequestSuccess(loginId, res.data.data.submitScheduleRequest.message))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(submitScheduleRequestError(loginId, {message}))
        } else {
          throw {message: "Unknown Error! Please contact the administrator."}
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(submitScheduleRequestError(loginId, {message: errors[0].message}))
        } else {
          return dispatch(submitScheduleRequestError(loginId, {message: "Unknown Error! Please contact the administrator."}))
        }
      })
  }
}

export function updateScheduleRequest (loginId, input) {
  return dispatch => {
    dispatch(updateScheduleRequestRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.updateschedulerequest, variables: {update_schedule_request_input: input}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.updateScheduleRequest && res.data.data.updateScheduleRequest.message) {
          return dispatch(updateScheduleRequestSuccess(loginId, res.data.data.updateScheduleRequest.message))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(updateScheduleRequestError(loginId, {message}))
        } else {
          throw {message: "Unknown Error! Please contact administrator."}
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].data && errors[0].data.message) {
          return dispatch(updateScheduleRequestError(loginId, {message: errors[0].data.message}))
        }
        else if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(updateScheduleRequestError(loginId, {message: errors[0].message}))
        } else {
          return dispatch(updateScheduleRequestError(loginId, {message: "Unknown Error! Please contact administrator."}))
        }
      })
  }
}

export function fetchFileList (loginId, workorderId, unid, category) {
  return dispatch => {
    dispatch(fetchAttachmentFileRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.fileList, variables: {loginId:loginId, unid: unid, attachment_type: category}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.getAttachmentsList) {
          let files = res.data.data.getAttachmentsList.attachments
          let filesByCategory = []
          for (let fl = 0; fl < files.length; fl++) {
            if(files[fl]?.file_name?.toLowerCase().includes("vwrs_esa_po")){
              return 
            }
            if (files[fl].category === category || files[fl].category== "quote" || files[fl].category == "invoice") {
              filesByCategory.push(files[fl])
            } else if (category == "workorder" && files[fl].category == "" && !files[fl].file_name.toLowerCase().includes("vwrs_po")) {
              filesByCategory.push(files[fl])
            }

          }

          return dispatch(fetchAttachmentFileSuccess(loginId, workorderId, unid, filesByCategory, category))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(fetchAttachmentFileError(loginId, {message}))
        } else {
          return dispatch(fetchAttachmentFileError(loginId, {message: "Unknow Error! Please contact administrator."}))
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(fetchAttachmentFileError(loginId, {message: errors[0].message}))
        } else {
          return dispatch(fetchAttachmentFileError(loginId, errors))
        }
      })
  }
}

export function downloadFile (loginId, unid, file_name, attachment_id, category) {
  return dispatch => {
    dispatch(downloadFileRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.downloadFile, variables: {loginId: loginId, unid: unid, file_name: file_name, attachment_id: attachment_id, category: category}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.downloadFile) {
          return dispatch(downloadFileSuccess(loginId, unid, file_name, res.data.data.downloadFile))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(downloadFileError(loginId, {message}))
        } else {
          return dispatch(downloadFileError(loginId, {message: "Unknow Error! Please contact administrator."}))
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(downloadFileError(loginId, {message: errors[0].message}))
        } else {
          return dispatch(downloadFileError(loginId, errors))
        }
      })
  }
}

export function downloadVSFile (loginId, file_Id) {
  return dispatch => {
    dispatch(downloadVSFileRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.downloadVSFile, variables: {file_Id: file_Id}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.downloadVSFile) {
          return dispatch(downloadVSFileSuccess(loginId, file_Id, res.data.data.downloadVSFile))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(downloadVSFileError(loginId, {message}))
        } else {
          return dispatch(downloadVSFileError(loginId, {message: "Unknown Error! Please contact administrator."}))
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(downloadVSFileError(loginId, {message: errors[0].message}))
        } else {
          return dispatch(downloadVSFileError(loginId, errors))
        }
      })
  }
}



export function updateWorkorderStatus (input, loginId, unid, userFullName) {
  return dispatch => {
    dispatch(updateWorkorderStatusRequest(loginId))
    return ajax.post(`/graphql4g`, {query: schema.updateWOStatus, variables: {loginId:loginId, wo_status_change_input: input}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.updateWOStatus) {
          return dispatch(updateWorkorderStatusSuccess(loginId, res.data.data.updateWOStatus, unid, input, userFullName))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(updateWorkorderStatusError(loginId, {message}))
        } else {
          throw {message: "Unknow Error! Please contact administrator."}
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(updateWorkorderStatusError(loginId, {message: errors[0].message}))
        } else {
          return dispatch(updateWorkorderStatusError(loginId, {message: "Unknow Error! Please contact administrator."}))
        }
      })
  }
}
export const UPLOAD_FILES_SUCCESS_WO = 'UPLOAD_FILES_SUCCESS_WO'
export const UPLOAD_FILES_ERROR_WO = 'UPLOAD_FILES_ERROR_WO'

export const uploadFilesWOSuccess = createAction(UPLOAD_FILES_SUCCESS_WO, 'loginId', 'unid', 'uploadFilesSubmissionStatusWO')
export const uploadFilesWOError = createAction(UPLOAD_FILES_ERROR_WO, 'loginId', 'unid', 'uploadFilesSubmissionerrorMessageWO')

export function uploadFilesWO (loginId, unid, category, input) {
  return dispatch => {

    return ajax.post(`/graphql4g`, {query: schema.uploadFilesWO, variables: {uploadFilesInputWO: input, unid: unid, category: category}})

      .then(res => {

        if (!!res.data.data.uploadFilesWO && res.data.data.uploadFilesWO.fileResp && res.data.data.uploadFilesWO.fileResp.filter(val => val.status != 'Success').length == 0) {
          return dispatch(uploadFilesWOSuccess(loginId, unid, res.data.data.uploadFilesWO))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(uploadFilesWOError(loginId, unid, {message}))
        } else {
          throw {message: "Unknow Error! Please contact administrator."}
        }




      })
      .catch(errors => {

        // throw {message: "Unknow Error! Please contact administrator."}
      })
  }
}
export function submitFilesInvoice (loginId, quote_unid, input, category) {

  return dispatch => {
    // dispatch(submitFileVwoRequest(loginId))
    if (category === 'workorder') {
      dispatch(submitWorkorderFileRequest(loginId))
    }
    return ajax.post(`/graphql4g`, {query: schema.submitFilesvwrs, variables: {loginId: loginId, file_inputvwrs: {files: input, quote_unid: quote_unid}}})
      .then(res => {
        if (category === 'workorder') {
          if (res.data && res.data.data && res.data.data.submitFilesvwrs) {
            return dispatch(submitWorkorderFileSuccess(loginId, res.data.data.submitFilesvwrs))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(submitWorkorderFileError(loginId, {message}))
          } else {
            return dispatch(submitQuoteError(loginId, {message: "Unknow Error! Please contact administrator."}))
          }
        } else if (res.data && res.data.data && res.data.data.submitFilesvwrs) {
          return dispatch(submitQuoteFileSuccess(loginId, res.data.data.submitFilesvwrs))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(submitQuoteError(loginId, {message}))
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(submitQuoteError(loginId, {message: errors[0].message}))
        } else {
          return dispatch(submitFileVwoFailure(loginId, errors))
        }
      })
  }
}

export function resetProps (keys, value) {
  return {type: RESET_PROPS, keys, value}
}


export function deleteMsg (loginId) {
  return {
    type: DELETE_SAVED_MSG,
    loginId
  }
}


export function deleteMsgFileUpload (loginId) {
  return {
    type: DELETE_SAVED_MSG_FILEUPLOAD,
    loginId
  }
}




export function fetchPendingWorkOrderDetails (loginId, vendorId) {

  return dispatch => {
    dispatch(fetchPendingWorkOrderDetailsRequest(loginId, vendorId))
    return ajax.post(`/graphql4g`, {query: schema.getPendingWorkOrderDetails, variables: {vendorId: vendorId}})
      // .then(res => console.log('ress', res))
      // .catch(errors => console.log('errr', errors))
      .then(res => dispatch(fetchPendingWorkOrderDetailsSuccess(loginId, vendorId, res.data.data)))
      .catch(errors => dispatch(fetchPendingWorkOrderDetailsFailure(loginId, vendorId, errors)))
  }
}


export function fetchGeneratorDetails (unid, type) {
  return dispatch => {
    dispatch(fetchGeneratorDetailsRequest(unid, type))
    return ajax.post(`/graphql4g`, {query: schema.getGeneratorInfoForUnid, variables: {unid: unid, type: type}})
      .then(res => dispatch(fetchGeneratorDetailsSuccess(unid, res.data.data.getGeneratorInfoForUnid.generators)))
      .catch(errors => dispatch(fetchGeneratorDetailsFailure(unid, errors)))
  }
}

export function fetchHvacDetails (unid, type) {
  return dispatch => {
    dispatch(fetchHvacDetailsRequest(unid, type))
    return ajax.post(`/graphql4g`, {query: schema.getHvacInfoForUnid, variables: {unid: unid, type: type}})
      .then(res => dispatch(fetchHvacDetailsSuccess(unid, res.data.data.getHvacInfoForUnid.hvacs)))
      .catch(errors => dispatch(fetchHvacDetailsFailure(unid, errors)))
  }
}
 export function fetchDataToExport (loginId, startdate, enddate, mdgId = null) {
    return dispatch => {
      dispatch(fetchExportExcelDataRequest(loginId))
      return ajax.post(`/graphql4g`, { query: schema.getWorkorder, variables: { loginId: loginId, startdate, enddate, mdgId } })
      .then(res => {
        const pendingItems = []
        const waitingItems = []
        const completedWorkOrderItems = []
        let workOrderMap = {}
        if (res.data.data.getVendorWorkOrder.vendor_wo_details.length) {
          res.data.data.getVendorWorkOrder.vendor_wo_details.forEach(function (element) {
            workOrderMap[element.workorder_id] = element
            if ((element.quote_statuses === utils.QUOTEPENDING) || (element.workorder_status === utils.WORKPENDING) || (element.quote_statuses === utils.QUOTEAPPROVED)) {
              pendingItems.push(element.workorder_id + "")
            } else if ((element.quote_statuses === utils.QUOTERECEIVED) || (element.quote_statuses === utils.AWAITING_PO) || (element.workorder_status === utils.PO_REQUEST)) {
              waitingItems.push(element.workorder_id + "")
            } else if ((element.workorder_status === utils.WORKACCEPTED) || (element.workorder_status === utils.WORKCOMPLETE)) {
              completedWorkOrderItems.push(element.workorder_id + "")
            }
          })
        }
        dispatch(fetchExportExcelDataSuccess(loginId, {
          allworkorders: res.data.data.getVendorWorkOrder.vendor_wo_details,
        }))
        if (res.data.data.getVendorWorkOrder.errors && res.data.data.getVendorWorkOrder.errors.length > 0) {
          dispatch(fetchExportExcelDataFailure(loginId, {
            errors: res.data.data.getVendorWorkOrder.errors
          }))
        }
        return res.data.data.getVendorWorkOrder

      })
      .catch(errors => {
        dispatch(fetchExportExcelDataFailure(loginId, errors))})
    }
 }

export function fetchWorkOrder (loginId, startdate, enddate, isCompleted, mdgId = null, unscheduledWorkTypes) {
  return dispatch => {
    if (isCompleted) {dispatch(fetchCompletedPanelRequest(loginId))} else {dispatch(fetchWRRequest(loginId))}

    return ajax.post(`/graphql4g`, {query: schema.getWorkorder, variables: {loginId, startdate, enddate, mdgId }})
      .then(res => {
        const pendingItems = []
        const waitingItems = []
        const completedWorkOrderItems = []
        let workOrderMap = {}
        let user_dash = []
        let unswoType = []
        let swoType = []
        let sData = []
        let unData = []
        let antennaRf = 0;
        let smduType = []
        let unsMduType = []
        let mduSData = []
        let mduUnData = []
        let unscheduledWos = []
        if (res.data.data.getVendorWorkOrder.vendor_wo_details.length) {
          let woData = res.data.data.getVendorWorkOrder.vendor_wo_details;
          for(let i = 0; i < woData.length; i++){
          let wOrder =  woData[i];
	      	if(wOrder.work_type && wOrder.vendor_portal_status == "Work Pending"){
            for(let u = 0; u < unscheduledWorkTypes.length; u++){
              if(wOrder.work_type && wOrder.work_type.toLowerCase().includes(unscheduledWorkTypes[u].toLowerCase())){
                antennaRf = 1;
                break;
              }
            }
            if(antennaRf){
              antennaRf = 1;
              break;
            }
	        }
          }
          res.data.data.getVendorWorkOrder.vendor_wo_details.forEach(function (element) {
            workOrderMap[element.workorder_id] = element
            if(antennaRf){
              if(element.work_type?.toLowerCase() != "mdu"){
                if(element.vendor_portal_status == "Work Pending"){
                  if(element.events && element.events.length > 0){
                    let recentEvents = element.events.sort((a,b) => a.eventId - b.eventId);
                    let recentevent = recentEvents[recentEvents.length-1];
                    if(recentevent?.status?.toUpperCase() != "UNSCHEDULED" && (moment(recentevent.end).isAfter(moment().format('DD-MMM-YY')))){
                      element.vendor_portal_status = "Work Pending Scheduled";
                      sData.push(element.workorder_id+"")
                      swoType.push(element.site_type)
                    }
                    else{
                      element.vendor_portal_status = "Work Pending Unscheduled";
                      unData.push(element.workorder_id+"")
                      unscheduledWos.push(element.workorder_id+"")
                      unswoType.push(element.site_type)
                    }
                  }else{
                    element.vendor_portal_status = "Work Pending Unscheduled";
                    unData.push(element.workorder_id+"")
                    unscheduledWos.push(element.workorder_id+"")
                    unswoType.push(element.site_type)
                  }
                }
              }else{
                if(element.vendor_portal_status == "Work Pending"){
                  if(element.events && element.events.length > 0){
                    let recentEvents = element.events.sort((a,b) => a.eventId - b.eventId);
                    let recentevent = recentEvents[recentEvents.length-1];
                    if(recentevent?.status?.toUpperCase() != "UNSCHEDULED" && (moment(recentevent.end).isAfter(moment().format('DD-MMM-YY')))){
                      element.vendor_portal_status = "Work Pending Scheduled";
                      mduSData.push(element.workorder_id+"")
                      smduType.push(element.site_type)
                    }
                    else{
                      element.vendor_portal_status = "Work Pending Unscheduled";
                      mduUnData.push(element.workorder_id+"")
                      unscheduledWos.push(element.workorder_id+"")
                      unsMduType.push(element.site_type)
                    }
                  }else{
                    element.vendor_portal_status = "Work Pending Unscheduled";
                    mduUnData.push(element.workorder_id+"")
                    unscheduledWos.push(element.workorder_id+"")
                    unsMduType.push(element.site_type)
                  }
                }
              }
            } else {
              if(element.vendor_portal_status == "Work Pending"){
                if(element.events && element.events.length > 0){
                  let recentEvents = element.events.sort((a,b) => a.eventId - b.eventId);
                  let recentevent = recentEvents[recentEvents.length-1];
                  if(recentevent?.status?.toUpperCase() != "UNSCHEDULED" && (moment(recentevent.end).isAfter(moment().format('DD-MMM-YY')))){
                    // work order is scheduled
                  } else {
                    unscheduledWos.push(element.workorder_id+"")
                  }
                }else{
                  unscheduledWos.push(element.workorder_id+"")
                }
              }
            }

            if ((element.quote_statuses === utils.QUOTEPENDING) || (element.workorder_status === utils.WORKPENDING) || (element.quote_statuses === utils.QUOTEAPPROVED)) {
              pendingItems.push(element.workorder_id + "")
            } else if ((element.quote_statuses === utils.QUOTERECEIVED) || (element.quote_statuses === utils.AWAITING_PO) || (element.workorder_status === utils.PO_REQUEST)) {
              waitingItems.push(element.workorder_id + "")
            } else if ((element.workorder_status === utils.WORKACCEPTED) || (element.workorder_status === utils.WORKCOMPLETE)) {
              completedWorkOrderItems.push(element.workorder_id + "")
            }
          })
        }
        user_dash = res.data.data.getVendorWorkOrder.user_dashboard;
         user_dash && user_dash.work.forEach(e=>{
           if(e.name == "Work Pending Unscheduled"){
            e.data = unData;
            e.woType = unswoType;
           }
           if(e.name == "Work Pending Scheduled"){
             e.data = sData;
             e.woType = swoType;
            }
         })
         user_dash && user_dash.mduwork.forEach(e=>{  
          if(e.name == "Work Pending Unscheduled"){
           e.data = mduUnData;
           e.woType = unsMduType;
          }
          if(e.name == "Work Pending Scheduled"){
            e.data = mduSData;
            e.woType = smduType;
           }
        })
        dispatch(fetchWRSuccess(loginId, {
          isCompleted: isCompleted,
          pendingWorkOrder: pendingItems,
          waitingWorkOrder: waitingItems,
          completedWorkOrder: completedWorkOrderItems,
          workOrderMap: workOrderMap,
          allworkorders: res.data.data.getVendorWorkOrder.vendor_wo_details,
          dashboard: res.data.data.getVendorWorkOrder.dashboard,
          startdate,
          enddate,
          user_dashboard: user_dash,
          vendor_wo_details: res.data.data.getVendorWorkOrder,
          WorkType: res.data.data.getVendorWorkOrder.WorkType,
          rma_data: res.data.data.getVendorWorkOrder.rma_data,
          unscheduledWos: unscheduledWos?.length
        }))
        return res.data.data.getVendorWorkOrder
      })
      .catch(errors => dispatch(fetchWRFailure(loginId, errors)))
  }
}

export function resetHistoryProps (loginId) {
  return {type: RESET_HISTORY_PROPS, loginId}
}

export function fetchAdvancedHistory (loginId, vendorId, workOrderId=null, startDate=null, endDate=null, statusSelected=null) {
  if (workOrderId) {
    return dispatch => {
      dispatch(fetchAdvancedHistoryRequest(loginId))
      return ajax.post(`/graphql4g`, {query: schema.getVendorWoByWorkOrderId, variables: {loginId:loginId, workOrderId: workOrderId, vendorId: vendorId}})
        .then(res => {
          let historyMap = {}
          let historyBucket = {name: 'History', data: [], color: '', woType: []}
          if (res.data && res.data.data && res.data.data.getVendorWoByWorkOrderId
            && res.data.data.getVendorWoByWorkOrderId.vendor_wo_details && Object.keys(res.data.data.getVendorWoByWorkOrderId.vendor_wo_details).length > 0) {
            [res.data.data.getVendorWoByWorkOrderId.vendor_wo_details].forEach(function (element) {
              historyMap[element.workorder_id] = element
              historyBucket.data.push(element.workorder_id)
              historyBucket.woType.push(element.site_type)
            })
            console.log("actions data", loginId, res.data.data.getVendorWoByWorkOrderId.vendor_wo_details, historyMap, historyBucket)
            return dispatch(fetchAdvancedHistoryByWorkOrderIdSuccess(loginId, 'workOrderID', {
              allHistoryData: [res.data.data.getVendorWoByWorkOrderId.vendor_wo_details],
              historyMap,
              historyBucket: [historyBucket]
            }))
          } else {
            return dispatch(fetchAdvancedHistoryByWorkOrderIdFailure(loginId, 'workOrderID', res.data.errors[0].message))
          }
        })
    }
  } else {
    return dispatch => {
      dispatch(fetchAdvancedHistoryRequest(loginId))
      return ajax.post(`/graphql4g`, {query: schema.getVendorDataByStatusFilter, variables: {loginId:loginId, vendorId: vendorId+'', startdt: startDate, enddt: endDate, statusList: statusSelected}})
        .then(res => {
          let historyMap = {}
          let historyBucket = {name: 'History', data: [], color: '', woType: []}
          if (res.data && res.data.data && res.data.data.getVendorDataByStatusFilter
            && res.data.data.getVendorDataByStatusFilter.listItems && res.data.data.getVendorDataByStatusFilter.listItems.length > 0) {
            res.data.data.getVendorDataByStatusFilter.listItems.forEach(function (element) {
              historyMap[element.workorder_id] = element
              historyBucket.data.push(element.workorder_id)
              historyBucket.woType.push(element.site_type)
            })
            return dispatch(fetchAdvancedHistoryByWorkOrderIdSuccess(loginId, 'statusFilter', {
              allHistoryData: res.data.data.getVendorDataByStatusFilter.listItems,
              historyMap,
              historyBucket: [historyBucket]
            }))
          } else {
            return dispatch(fetchAdvancedHistoryByWorkOrderIdFailure(loginId, 'statusFilter', res.data.errors[0].message))
          }
        })
    }
  }
}

// FIXED PRICING MATRIX

export const FETCH_FIXEDPRICINGSERVICES_REQUEST = 'FETCH_FIXEDPRICINGSERVICES_REQUEST'
export const FETCH_FIXEDPRICINGSERVICES_SUCCESS = 'FETCH_FIXEDPRICINGSERVICES_SUCCESS'
export const FETCH_FIXEDPRICINGSERVICES_FAILURE = 'FETCH_FIXEDPRICINGSERVICES_FAILURE'
export const fetchFixedPricingServRequest = createAction(FETCH_FIXEDPRICINGSERVICES_REQUEST, 'vendorId', 'loginId')
export const fetchFixedPricingServSuccess = createAction(FETCH_FIXEDPRICINGSERVICES_SUCCESS, 'vendorId', 'loginId', 'workorderId', 'FixedPricingServ')
export const fetchFixedPricingServFailure = createAction(FETCH_FIXEDPRICINGSERVICES_FAILURE, 'vendorId', 'loginId', 'workorderId', 'FixedPricingServErr')

export function fetchFixedPricingServ (vendorId, loginId,workorderId, requestParams) {
  let {market, submarket, national, listname, worktype, costtype, sitetype, fixed, nonfixed, zipcode,matrix, nonmatrix, matrixeligible} = requestParams
  
  let variables = {loginId, market, submarket, national, listname, worktype, costtype, sitetype, fixed, nonfixed, zipcode,matrix, nonmatrix, matrixeligible}

  return dispatch => {
    dispatch(fetchFixedPricingServRequest(vendorId, loginId, workorderId))
    return ajax.post(`/graphql4g`, {query: schema.fetchFixedPricingServ, variables: variables})



      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchFixedPricingServFailure(vendorId, loginId, workorderId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.getFixedPricingServ && !!res.data.data.getFixedPricingServ) {
          return dispatch(fetchFixedPricingServSuccess(vendorId, loginId, workorderId, res.data.data.getFixedPricingServ))
        }
      }

      )
      .catch(errors => {

        dispatch(fetchFixedPricingServFailure(vendorId, loginId, errors))
      })
  }
}

export const FETCH_FIXEDPRCEXTSERVICES_REQUEST = 'FETCH_FIXEDPRCEXTSERVICES_REQUEST'
export const FETCH_FIXEDPRCEXTSERVICES_SUCCESS = 'FETCH_FIXEDPRCEXTSERVICES_SUCCESS'
export const FETCH_FIXEDPRCEXTSERVICES_FAILURE = 'FETCH_FIXEDPRCEXTSERVICES_FAILURE'
export const fetchFixedPricingExistServRequest = createAction(FETCH_FIXEDPRCEXTSERVICES_REQUEST, 'vendorId', 'loginId')
export const fetchFixedPricingExistServSuccess = createAction(FETCH_FIXEDPRCEXTSERVICES_SUCCESS, 'vendorId', 'loginId', 'unid', 'FixedPricingExtServ')
export const fetchFixedPricingExistServFailure = createAction(FETCH_FIXEDPRCEXTSERVICES_FAILURE, 'vendorId', 'loginId', 'unid', 'FixedPricingExtServErr')

export function fetchFixedPricingExistServ (vendorId, loginId, unid) {


  let variables = {loginId,unid}

  return dispatch => {
    dispatch(fetchFixedPricingExistServRequest(vendorId, loginId, unid))
    return ajax.post(`/graphql4g`, {query: schema.fetchFixedPricingExistServ, variables: variables})



      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchFixedPricingExistServFailure(vendorId, loginId, unid, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.getFixedPricingExistServ && !!res.data.data.getFixedPricingExistServ) {
          return dispatch(fetchFixedPricingExistServSuccess(vendorId, loginId, unid, res.data.data.getFixedPricingExistServ))
        }
      }

      )
      .catch(errors => {

        dispatch(fetchFixedPricingExistServFailure(vendorId, loginId, errors))
      })
  }
}
export const UPDATE_VENDORSTATUS_REQUEST= 'UPDATE_VENDORSTATUS_REQUEST'
export const UPDATE_VENDORSTATUS_SUCCESS = 'UPDATE_VENDORSTATUS_SUCCESS'
export const UPDATE_VENDORSTATUS_FAILURE = 'UPDATE_VENDORSTATUS_FAILURE'

export const updateVendorStatusRequest = createAction(UPDATE_VENDORSTATUS_REQUEST)
export const updateVendorStatusSuccess = createAction(UPDATE_VENDORSTATUS_SUCCESS,'vendorStatus')
export const updateVendorStatusFailure = createAction(UPDATE_VENDORSTATUS_FAILURE,'errors')

export const UPDATE_VENDORSTATUSCOMMENTS_REQUEST= 'UPDATE_VENDORSTATUSCOMMENTS_REQUEST'
export const UPDATE_VENDORSTATUSCOMMENTS_SUCCESS = 'UPDATE_VENDORSTATUSCOMMENTS_SUCCESS'
export const UPDATE_VENDORSTATUSCOMMENTS_FAILURE = 'UPDATE_VENDORSTATUSCOMMENTS_FAILURE'

export const updateVendorStatusCommentsRequest = createAction(UPDATE_VENDORSTATUSCOMMENTS_REQUEST)
export const updateVendorStatusCommentsSuccess = createAction(UPDATE_VENDORSTATUSCOMMENTS_SUCCESS,'vendorStatusComments')
export const updateVendorStatusCommentsFailure = createAction(UPDATE_VENDORSTATUSCOMMENTS_FAILURE,'errors')

export const SUBMIT_FPQUOTE_SUCCESS = 'SUBMIT_FPQUOTE_SUCCESS'
export const SUBMIT_FPQUOTE_ERROR = 'SUBMIT_FPQUOTE_ERROR'
export const submitFixedQuoteInvoiceSuccess = createAction(SUBMIT_FPQUOTE_SUCCESS, 'vendorId', 'loginId', 'quoteUnid', 'submitFixedQuoteInvoiceStatus')
export const submitFixedQuoteInvoiceError = createAction(SUBMIT_FPQUOTE_ERROR, 'vendorId', 'loginId', 'quoteUnid', 'submitFixedQuoteInvoiceerrorMessage')



export function submitFixedQuoteInvoice (vendorId, loginId, quoteUnid, quoteAction, input, woUnid) {
  return dispatch => {

    return ajax.post(`/graphql4g`, {query: quoteAction == 'rfqreply' || quoteAction == 'rfqvendordecline'? schema.submitFPQuoteInvoice : schema.submitFPInvoice, variables:quoteAction == 'rfqreply'  || quoteAction == 'rfqvendordecline' ? {loginId: loginId, submitFPQuoteInvoiceInp: input, quoteUnid, quoteAction} : {loginId: loginId, submitFPInvoiceInp: input, quoteUnid, quoteAction}})
      .then(res => {
        console.log("submit invoice response --", res)
        if (quoteAction == 'rfqreply' || quoteAction == 'rfqvendordecline') {
            if (res.data?.data?.submitFPQuoteInvoice?.woInfo?.workorder_quote_id) {
            return dispatch(submitFixedQuoteInvoiceSuccess(vendorId, loginId, quoteUnid, res.data.data.submitFPQuoteInvoice))
            } else if (res.data?.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0]?.data?.message || res.data.errors[0]?.data?.detail || res.data.errors[0]?.message
            return dispatch(submitFixedQuoteInvoiceError(vendorId, loginId, quoteUnid, {message}))
            } else {
            throw {message: "Unknown Error! Please contact administrator."}
            }
        } else {
          if (res?.data?.data?.submitFPInvoice?.woInfo?.workorder_quote_id) {
            return dispatch(submitFixedQuoteInvoiceSuccess(vendorId, loginId, quoteUnid, res.data.data.submitFPInvoice))
          } else if (res?.data?.errors?.length > 0) {
            let message = "";
            if(res?.data?.errors[0]?.data){
              let errorMessage = res.data?.errors[0]?.data[1] ? res.data?.errors[0]?.data[1] : res.data?.errors[0]?.data[0];
              let resultMessage = errorMessage ? errorMessage?.resultmessage : null;
              let detailMessage = errorMessage ? errorMessage?.detail : null;
              message = resultMessage || detailMessage || errorMessage.message;
              }else{
              message = res.data.errors[0]?.data?.message || res.data.errors[0]?.data?.detail || res.data.errors[0]?.message;
            }
            return dispatch(submitFixedQuoteInvoiceError(vendorId, loginId, woUnid, {message}))
          } else {
            throw {message: "Unknown Error! Please contact administrator."}
          }
        }
      })
      .catch(errors => {
        throw {message: "Unknown Error! Please contact administrator."}
      })
  }
}

export function fetchWOTypes (loginId) {
  return ajax.post(`/graphql4g`, {query: schema.WOTypes,
    variables: {loginId, workType: 'WORKORDER_WORKTYPE'}})
    .then(res => {
      if (res.data) {
        return res.data
      } else {
        throw {message: "Unknow Error! Please contact administrator."}
      }
    })
    .catch(errors => {
      throw {message: "Unknow Error! Please contact administrator."}
    })
}


export function logActioninDB (user_id, email, vendor_id, workorder_id, market, sub_market, action, action_name, action_option, osw_id) {

    return ajax.post(`/graphql4g`, {query: schema.logAction,
      variables: {user_id, email, vendor_id, workorder_id, market, sub_market, action,action_name, action_option, osw_id}})
      .then(res => {
        if (res.data) {
          return res.data
        } else {
          throw {message: "Unknow Error! Please contact administrator."}
        }
      })
      .catch(errors => {
        throw {message: "Unknow Error! Please contact administrator."}
      })
}

export function updateAcknowledgeStatus(loginId, input, quoteId, status){
  return dispatch => {
    dispatch(updateVendorStatusRequest())
    return ajax.post(`/graphql4g`,{query:schema.updateVendorStatus ,variables: {loginId, input, quoteId, status}})
    .then(res=>{
      if (!!res && !!res.data && !!res.data.data.updateVendorStatus && !!res.data.data.updateVendorStatus.errors)
      return dispatch(updateVendorStatusFailure(res.data.data.updateVendorStatus.errors))
      else if (!!res && !!res.data && !!res.data.data.updateVendorStatus && !!res.data.data.updateVendorStatus.woInfo)
      return dispatch(updateVendorStatusSuccess(res.data.data.updateVendorStatus));
      else {
        throw {message: "Unknown Error! Please contact administrator."}
      }
    })
    .catch(err => dispatch(updateVendorStatusFailure(err)))
  }

}
export function bulkUpdatePendingAck(input) {
  return dispatch => {
    return ajax.post(`/graphql4g`, { query: schema.bulkUpdatePendingAck, variables: { input } })
      .then(res => {
        if (!!res && !!res.data && !!res.data.data.bulkUpdatePendingAck && !!res.data.data.bulkUpdatePendingAck.errors)
          return res.data.data.bulkUpdatePendingAck.errors
        else if (!!res && !!res.data && !!res.data.data.bulkUpdatePendingAck)
          return res.data.data.bulkUpdatePendingAck
        else {
          throw { message: "Unknown Error! Please contact administrator." }
        }
      })
      .catch(err => console.log(err))
  }
}
export function bulkUpdatePendingAckFromRedis(userId, vendorId) {
  return dispatch => {
    return ajax.post(`/graphql4g`, {query: schema.bulkUpdatePendingAckFromRedis, variables: {userId, vendorId}})
      .then(res => {
        return res.data.data;
      })
      .catch(errors => {
        console.log(errors)
      })
  }
}
export function updateVendorStatusComments(input){
  return dispatch => {
    dispatch(updateVendorStatusCommentsRequest())
    return ajax.post(`/graphql4g`,{query:schema.updateVendorStatusComments ,variables: {input}})
    .then(res=>{
      if (!!res && !!res.data && !!res.data.data.updateVendorStatusComments && !!res.data.data.updateVendorStatusComments.errors)
      return dispatch(updateVendorStatusCommentsFailure(res.data.data.updateVendorStatusComments.errors))
      else if (!!res && !!res.data && !!res.data.data.updateVendorStatusComments && !!res.data.data.updateVendorStatusComments.woInfo)
      return dispatch(updateVendorStatusCommentsSuccess(res.data.data.updateVendorStatusComments));
      else {
        throw {message: "Unknown Error! Please contact administrator."}
      }
    })
    .catch(err => dispatch(updateVendorStatusCommentsFailure(err)))
  }

}

export const VENDOR_WORK_ORDER_SELECTED_ROW = "VENDOR_WORK_ORDER_SELECTED_ROW"
export const vendorWorkOrderSelectedRowSuccess = createAction(VENDOR_WORK_ORDER_SELECTED_ROW, 'loginId', 'selectedRow')
export function vendorWorkOrderSelectedRow(loginId, selectedRow) {
  return dispatch => {
    dispatch(vendorWorkOrderSelectedRowSuccess(loginId, selectedRow))
  }
}

export const RMA_DETAILS_REQUEST = "RMA_DETAILS_REQUEST";
export const RMA_DETAILS_SUCCESS = "RMA_DETAILS_SUCCESS";
export const RMA_DETAILS_FAILURE = "RMA_DETAILS_FAILURE";

export const rmaDetails = createAction(RMA_DETAILS_REQUEST,"loginId","vwrsId");
export const rmaDetailsSuccess = createAction(RMA_DETAILS_SUCCESS,"loginId","vwrsId","result");
export const rmaDetailsFailure = createAction(RMA_DETAILS_FAILURE,"loginId","vwrsId", "errors");

export const UPLOAD_RMA_DETAILS_REQUEST = "UPLOAD_RMA_DETAILS_REQUEST";
export const UPLOAD_RMA_DETAILS_SUCCESS = "UPLOAD_RMA_DETAILS_SUCCESS";
export const UPLOAD_RMA_DETAILS_FAILURE = "UPLOAD_RMA_DETAILS_FAILURE";

export const uploadrmaDetails = createAction(UPLOAD_RMA_DETAILS_REQUEST,"loginId");
export const uploadrmaDetailsSuccess = createAction(UPLOAD_RMA_DETAILS_SUCCESS,"loginId","vwrsId","result");
export const uploadrmaDetailsFailure = createAction(UPLOAD_RMA_DETAILS_FAILURE,"loginId","vwrsId","errors");

export function getRmaDetails(loginId, vwrsId, rma_id) {
  return (dispatch) => {
    dispatch(rmaDetails(loginId,vwrsId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getRMADetails,
        variables: { vwrsId, rma_id },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getRMAInformation &&
          !!res.data.data.getRMAInformation.result
        ) {
          return dispatch(
            rmaDetailsSuccess(loginId, vwrsId, res.data.data.getRMAInformation.result)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data[0].title) {
          return dispatch(
            rmaDetailsFailure(loginId, vwrsId, res.data.errors[0].data[0].title)
          );
        }
        else if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            rmaDetailsFailure(loginId, vwrsId, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(rmaDetailsFailure(loginId, vwrsId,'Something went wrong fetching RMA details')));
  };
}
export function uploadRMAImages(loginId, vwrsId, input){
  return (dispatch) => {
    dispatch(uploadrmaDetails(vwrsId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.uploadRMApictures,
        variables: { loginId,input },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.uploadRMApictires &&
          !!res.data.data.uploadRMApictires.message && 
          ( ["Attachment uploaded successfully","Attachments uploaded successfully"].includes(res.data.data.uploadRMApictires.message) )
        ) {
          return dispatch(
            uploadrmaDetailsSuccess(loginId, vwrsId, res.data.data.uploadRMApictires.message)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data[0].title) {
          return dispatch(
            uploadrmaDetailsFailure(loginId, vwrsId, res.data.errors[0].data[0].title)
          );
        }
        else if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            uploadrmaDetailsFailure(loginId, vwrsId, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(uploadrmaDetailsFailure(loginId,'Something went wrong while uploading RMA details')));
  };
}
export const RMA_STATUS_REQUEST = "RMA_STATUS_REQUEST";
export const RMA_STATUS_SUCCESS = "RMA_STATUS_SUCCESS";
export const RMA_STATUS_FAILURE = "RMA_STATUS_FAILURE";

export const rmaStatus = createAction(RMA_STATUS_REQUEST,"loginId","vendorId");
export const rmaStatusSuccess = createAction(RMA_STATUS_SUCCESS,"loginId","vendorId","rmaStatus");
export const rmaStatusFailure = createAction(RMA_STATUS_FAILURE,"loginId","vendorId", "errors");

export function getRmaStatus(loginId, vendorId) {
  return (dispatch) => {
    dispatch(rmaStatus(loginId,vendorId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getRMAStatus,
        variables: { vendorId },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getRMADetails &&
          !!res.data.data.getRMADetails.data
        ) {
          return dispatch(
            rmaStatusSuccess(loginId, vendorId, res.data.data.getRMADetails.data)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data.title) {
          return dispatch(
            rmaStatusFailure(loginId, vendorId, res.data.errors[0].data.title)
          );
        }
        else if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            rmaStatusFailure(loginId, vendorId, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(rmaStatusFailure(loginId, vendorId,'Something went wrong fetching RMA Status')));
  };
}
export const RMA_PICTURES_REQUEST = "RMA_PICTURES_REQUEST";
export const RMA_PICTURES_SUCCESS = "RMA_PICTURES_SUCCESS";
export const RMA_PICTURES_FAILURE = "RMA_PICTURES_FAILURE";

export const rmaPictures = createAction(RMA_PICTURES_REQUEST, "loginId", "attachmentId");
export const rmaPicturesSuccess = createAction(RMA_PICTURES_SUCCESS, "loginId", "attachmentId", "data");
export const rmaPicturesFailure = createAction(RMA_PICTURES_FAILURE, "loginId", "attachmentId", "errors");

export function getRmaPictures(loginId, category, attachmentId, includeLinkedAttachments) {
  return (dispatch) => {
    dispatch(rmaPictures(loginId, category, attachmentId, includeLinkedAttachments));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getRMApictures,
        variables: { loginId, category, attachmentId, includeLinkedAttachments }
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getRMApictures &&
          !!res.data.data.getRMApictures.data
        ) {
          const { attachments } = res.data.data.getRMApictures.data
          return dispatch(
            rmaPicturesSuccess(loginId, attachmentId, [...attachments])
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data[0].title) {
          return dispatch(
            rmaPicturesFailure(loginId, attachmentId, res.data.errors[0].data[0].title)
          );
        }
        if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            rmaPicturesFailure(loginId, attachmentId, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(rmaPicturesFailure(loginId, attachmentId, 'Something went wrong fetching RMA attachments')));
  };
}
export const RMA_PICTURES_PREV_REQUEST = "RMA_PICTURES_PREV_REQUEST";
export const RMA_PICTURES_PREV_SUCCESS = "RMA_PICTURES_PREV_SUCCESS";
export const RMA_PICTURES_PREV_FAILURE = "RMA_PICTURES_PREV_FAILURE";

export const rmaPicturesPrev = createAction(RMA_PICTURES_PREV_REQUEST, "categoryId", "attachmentId");
export const rmaPicturesSuccessPrev = createAction(RMA_PICTURES_PREV_SUCCESS, "categoryId", "attachmentId", "data");
export const rmaPicturesFailurePrev = createAction(RMA_PICTURES_PREV_FAILURE, "categoryId", "attachmentId", "errors");

export function getRmaPicturesPrev(loginId, categoryId, attachmentId) {
  return (dispatch) => {
    dispatch(rmaPicturesPrev(categoryId, attachmentId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getRMApicturesPreview,
        variables: { loginId: loginId, categoryID: categoryId, attachmentId }
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getRMApicturesPreview &&
          !!res.data.data.getRMApicturesPreview.attachment
        ) {
          return dispatch(
            rmaPicturesSuccessPrev(categoryId, attachmentId, res.data.data.getRMApicturesPreview.attachment)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data[0].title) {
          return dispatch(
            rmaPicturesFailurePrev(attachmentId, res.data.errors[0].data[0].title)
          );
        }
        if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            rmaPicturesFailurePrev(categoryId, attachmentId, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(rmaPicturesFailurePrev(categoryId, attachmentId, 'Something went wrong fetching RMA picture preview')));
  };
}

// Bid Unit Rules Action Types
export const FETCH_BID_UNIT_RULES_REQUEST = 'FETCH_BID_UNIT_RULES_REQUEST';
export const FETCH_BID_UNIT_RULES_SUCCESS = 'FETCH_BID_UNIT_RULES_SUCCESS';
export const FETCH_BID_UNIT_RULES_FAILURE = 'FETCH_BID_UNIT_RULES_FAILURE';

export const fetchBidUnitRulesRequest = createAction(FETCH_BID_UNIT_RULES_REQUEST);
export const fetchBidUnitRulesSuccess = createAction(FETCH_BID_UNIT_RULES_SUCCESS, 'bidUnitRules'); 
export const fetchBidUnitRulesFailure = createAction(FETCH_BID_UNIT_RULES_FAILURE, 'errors');

export function fetchBidUnitRules(userId) {
  return dispatch => {
    dispatch(fetchBidUnitRulesRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getBidUnitRules,
      variables: { userId }
    })
      .then(res => {
        if (res.data && res.data.data.getBidUnitRules) {
          const bidUnitRulesData = res.data.data.getBidUnitRules;
          if (bidUnitRulesData.statusCode == 200) {
            return dispatch(fetchBidUnitRulesSuccess(bidUnitRulesData.data));
          } else {  
            throw { message: bidUnitRulesData.message || "Unknown Error! Please contact administrator." };
          }
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(fetchBidUnitRulesFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(fetchBidUnitRulesFailure({ message: errors[0].message }));
        } else {
          return dispatch(fetchBidUnitRulesFailure(errors));
        }
      });
  };
}
// LineItems Action Types
export const FETCH_LINE_ITEMS_REQUEST = 'FETCH_LINE_ITEMS_REQUEST';
export const FETCH_LINE_ITEMS_SUCCESS = 'FETCH_LINE_ITEMS_SUCCESS';
export const FETCH_LINE_ITEMS_FAILURE = 'FETCH_LINE_ITEMS_FAILURE';

export const fetchLineItemsRequest = createAction(FETCH_LINE_ITEMS_REQUEST);
export const fetchLineItemsSuccess = createAction(FETCH_LINE_ITEMS_SUCCESS, 'lineItems');
export const fetchLineItemsFailure = createAction(FETCH_LINE_ITEMS_FAILURE, 'errors');

export function fetchLineItems(userId, workOrderId) {
  return dispatch => {
    dispatch(fetchLineItemsRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getLineItemsByWorkOrderId,
      variables: { workOrderId,userId }
    })
      .then(res => {
        if (res.data && res.data.data.getLineItemsByWorkOrderId) {
          const lineItemsData = res.data.data.getLineItemsByWorkOrderId;
          if (lineItemsData.statusCode == 200) {
            return dispatch(fetchLineItemsSuccess(lineItemsData.data));
          } else {
            throw { message: lineItemsData.message || "Unknown Error! Please contact administrator." };
          }
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(fetchLineItemsFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(fetchLineItemsFailure({ message: errors[0].message }));
        } else {
          return dispatch(fetchLineItemsFailure(errors));
        }
      });
  };
}

// Attachments Action Types
export const FETCH_ATTACHMENTS_WORKORDER_REQUEST = 'FETCH_ATTACHMENTS_WORKORDER_REQUEST';
export const FETCH_ATTACHMENTS_WORKORDER_SUCCESS = 'FETCH_ATTACHMENTS_WORKORDER_SUCCESS';
export const FETCH_ATTACHMENTS_WORKORDER_FAILURE = 'FETCH_ATTACHMENTS_WORKORDER_FAILURE';

export const fetchAttachmentsWorkOrderRequest = createAction(FETCH_ATTACHMENTS_WORKORDER_REQUEST);
export const fetchAttachmentsWorkOrderSuccess = createAction(FETCH_ATTACHMENTS_WORKORDER_SUCCESS, 'attachments');
export const fetchAttachmentsWorkOrderFailure = createAction(FETCH_ATTACHMENTS_WORKORDER_FAILURE, 'errors');

export function fetchAttachmentsWorkOrder(userId, workOrderId) {
  return dispatch => {
    dispatch(fetchAttachmentsWorkOrderRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getAttachmentsByWorkOrderId,
      variables: {workOrderId, userId }
    })
      .then(res => {
        if (res.data && res.data.data.getAttachmentsByWorkOrderId) {
          const attachmentsData = res.data.data.getAttachmentsByWorkOrderId;
          if (attachmentsData.statusCode == 200) {
            return dispatch(fetchAttachmentsWorkOrderSuccess(attachmentsData.data));
          } else {
            throw { message: attachmentsData.message || "Unknown Error! Please contact administrator." };
          }
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(fetchAttachmentsWorkOrderFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(fetchAttachmentsWorkOrderFailure({ message: errors[0].message }));
        } else {
          return dispatch(fetchAttachmentsWorkOrderFailure(errors));
        }
      });
  };
}

// Action Types for Vendor Work Order
export const FETCH_VENDOR_WORK_ORDER_REQUEST = 'FETCH_VENDOR_WORK_ORDER_REQUEST';
export const FETCH_VENDOR_WORK_ORDER_SUCCESS = 'FETCH_VENDOR_WORK_ORDER_SUCCESS';
export const FETCH_VENDOR_WORK_ORDER_FAILURE = 'FETCH_VENDOR_WORK_ORDER_FAILURE';

export const fetchVendorWorkOrderRequest = createAction(FETCH_VENDOR_WORK_ORDER_REQUEST);
export const fetchVendorWorkOrderSuccess = createAction(FETCH_VENDOR_WORK_ORDER_SUCCESS,'vendorWorkOrder');
export const fetchVendorWorkOrderFailure = createAction(FETCH_VENDOR_WORK_ORDER_FAILURE, 'error');

export function fetchVendorWorkOrder(userId, workOrderId) {
  return dispatch => {
    dispatch(fetchVendorWorkOrderRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getVendorWorkOrderByWorkOrderId,
      variables: {workOrderId, userId}
    })
      .then(res => {
        if (res.data && res.data.data.getVendorWorkOrderByWorkOrderId) {
          const vendorWorkOrderData = res.data.data.getVendorWorkOrderByWorkOrderId;
          if (vendorWorkOrderData.statusCode === 200) {
            return dispatch(fetchVendorWorkOrderSuccess(vendorWorkOrderData.data));
          } else {
            throw { message: vendorWorkOrderData.message || "Unknown Error! Please contact administrator." };
          }
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(fetchVendorWorkOrderFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(fetchVendorWorkOrderFailure({ message: errors[0].message }));
        } else {
          return dispatch(fetchVendorWorkOrderFailure(errors));
        }
      });
  };
}

// Action Types for Audit Work Order
export const FETCH_AUDIT_WORK_ORDER_REQUEST = 'FETCH_AUDIT_WORK_ORDER_REQUEST';
export const FETCH_AUDIT_WORK_ORDER_SUCCESS = 'FETCH_AUDIT_WORK_ORDER_SUCCESS';
export const FETCH_AUDIT_WORK_ORDER_FAILURE = 'FETCH_AUDIT_WORK_ORDER_FAILURE';

export const fetchAuditWorkOrderRequest = createAction(FETCH_AUDIT_WORK_ORDER_REQUEST);
export const fetchAuditWorkOrderSuccess = createAction(FETCH_AUDIT_WORK_ORDER_SUCCESS, 'auditWorkOrder');
export const fetchAuditWorkOrderFailure = createAction(FETCH_AUDIT_WORK_ORDER_FAILURE, 'error');

export function fetchAuditWorkOrder(userId, workOrderId) {
  return dispatch => {
    dispatch(fetchAuditWorkOrderRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getAuditByWorkOrderByWorkOrderId,
      variables: { workOrderId, userId }
    })
      .then(res => {
        if (res.data && res.data.data.getAuditByWorkOrderByWorkOrderId) {
          const auditWorkOrderData = res.data.data.getAuditByWorkOrderByWorkOrderId;
          if (auditWorkOrderData.statusCode === 200) {
            return dispatch(fetchAuditWorkOrderSuccess(auditWorkOrderData.data));
          } else {
            throw { message: auditWorkOrderData.message || "Unknown Error! Please contact administrator." };
          }
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(fetchAuditWorkOrderFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(fetchAuditWorkOrderFailure({ message: errors[0].message }));
        } else {
          return dispatch(fetchAuditWorkOrderFailure(errors));
        }
      });
  };
}



// Action Types for Post Invoice Submit
export const POST_INVOICE_SUBMIT_REQUEST = 'POST_INVOICE_SUBMIT_REQUEST';
export const POST_INVOICE_SUBMIT_SUCCESS = 'POST_INVOICE_SUBMIT_SUCCESS';
export const POST_INVOICE_SUBMIT_FAILURE = 'POST_INVOICE_SUBMIT_FAILURE';

export const postInvoiceSubmitRequest = createAction(POST_INVOICE_SUBMIT_REQUEST);
export const postInvoiceSubmitSuccess = createAction(POST_INVOICE_SUBMIT_SUCCESS, 'invoiceData');
export const postInvoiceSubmitFailure = createAction(POST_INVOICE_SUBMIT_FAILURE, 'error');

export function postInvoiceSubmit(input) {
  return dispatch => {
    dispatch(postInvoiceSubmitRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.postInvoiceSubmit,
      variables:  input 
    })
      .then(res => {
        if (res.data && res.data.data.postInvoiceSubmit) {
          const invoiceData = res.data.data.postInvoiceSubmit;
          console.log("Invoice Data from postInvoiceSubmit action: ", invoiceData);
          return dispatch(postInvoiceSubmitSuccess(invoiceData));
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(postInvoiceSubmitFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(postInvoiceSubmitFailure({ message: errors[0].message }));
        } else {
          return dispatch(postInvoiceSubmitFailure(errors));
        }
      });
  };
}
//  Actions for patch for audit
export const PATCH_AUDIT_REQUEST = 'PATCH_AUDIT_REQUEST';
export const PATCH_AUDIT_SUCCESS = 'PATCH_AUDIT_SUCCESS';
export const PATCH_AUDIT_FAILURE = 'PATCH_AUDIT_FAILURE';

export const patchAuditRequest = createAction(PATCH_AUDIT_REQUEST);
export const patchAuditSuccess = createAction(PATCH_AUDIT_SUCCESS, 'patchAuditData');
export const patchAuditFailure = createAction(PATCH_AUDIT_FAILURE, 'error');

export function patchAudit(auditId,input, userId ) {
  return dispatch => {
    dispatch(patchAuditRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.CompleteInvoiceTransaction,
      variables: {auditId,input, userId }
    })
      .then(res => {
        if (res.data && res.data.data.completeInvoiceTransaction) {
          const patchAuditData = res.data.data.completeInvoiceTransaction;
          if (patchAuditData.statusCode === 200) {
            return dispatch(patchAuditSuccess(patchAuditData));
          } else {
            throw { message: patchAuditData.message || "Unknown Error! Please contact administrator." };
          }
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(patchAuditFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(patchAuditFailure({ message: errors[0].message }));
        } else {
          return dispatch(patchAuditFailure(errors));
        }
      });
  };
}

// Action Types for Audit Invoice  
export const FETCH_AUDIT_INVOICE_REQUEST = 'FETCH_AUDIT_INVOICE_REQUEST';
export const FETCH_AUDIT_INVOICE_SUCCESS = 'FETCH_AUDIT_INVOICE_SUCCESS';
export const FETCH_AUDIT_INVOICE_FAILURE = 'FETCH_AUDIT_INVOICE_FAILURE';

export const fetchAuditInvoiceRequest = createAction(FETCH_AUDIT_INVOICE_REQUEST);
export const fetchAuditInvoiceSuccess = createAction(FETCH_AUDIT_INVOICE_SUCCESS, 'auditInvoiceData');
export const fetchAuditInvoiceFailure = createAction(FETCH_AUDIT_INVOICE_FAILURE, 'error');

export function fetchAuditInvoice(workOrderId, userId) {
  return dispatch => {
    dispatch(fetchAuditInvoiceRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getAuditInvoiceByWorkOrderId,
      variables: { workOrderId, userId }
    })
      .then(res => {
        if (res.data && res.data.data.getAuditInvoiceByWorkOrderId) {
          const auditInvoiceData = res.data.data.getAuditInvoiceByWorkOrderId;
          if (auditInvoiceData.statusCode === 200) {
            return dispatch(fetchAuditInvoiceSuccess(auditInvoiceData.data));
          } else {
            throw { message: auditInvoiceData.message || "Unknown Error! Please contact administrator." };
          }
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(fetchAuditInvoiceFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(fetchAuditInvoiceFailure({ message: errors[0].message }));
        } else {
          return dispatch(fetchAuditInvoiceFailure(errors));
        }
      });
  };
  
}
export const RECALCULATE_MILEAGE_REQUEST = 'RECALCULATE_MILEAGE_REQUEST';
export const RECALCULATE_MILEAGE_SUCCESS = 'RECALCULATE_MILEAGE_SUCCESS';
export const RECALCULATE_MILEAGE_FAILURE = 'RECALCULATE_MILEAGE_FAILURE';

export const recalculateDistanceRequest = createAction(RECALCULATE_MILEAGE_REQUEST);
export const recalculateDistanceSuccess = createAction(RECALCULATE_MILEAGE_SUCCESS, 'recalculateDistance');
export const recalculateDistanceFailure = createAction(RECALCULATE_MILEAGE_FAILURE, 'error');

export function recalculateDistance(workOrderId, userId) {
  return dispatch => {
    dispatch(recalculateDistanceRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.recalculateDistance,
      variables: { workOrderId, userId }
    })
      .then(res => {
        if (res.data && res.data.data.recalculateDistance) {
            return dispatch(recalculateDistanceSuccess(res.data.data.recalculateDistance));
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(recalculateDistanceFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(recalculateDistanceFailure({ message: errors[0].message }));
        } else {
          return dispatch(recalculateDistanceFailure(errors));
        }
      });
  };
  
}

export const OSW_INFO_REQUEST = 'OSW_INFO_REQUEST';
export const OSW_INFO_SUCCESS = 'OSW_INFO_SUCCESS';
export const OSW_INFO_FAILURE = 'OSW_INFO_FAILURE';

export const oswInfoRequest = createAction(OSW_INFO_REQUEST);
export const oswInfoSuccess = createAction(OSW_INFO_SUCCESS, 'oswInfoData');
export const oswInfoFailure = createAction(OSW_INFO_FAILURE, 'error');

export function fetchOSWInfo(workOrderId) {
  return dispatch => {
    dispatch(oswInfoRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getOSWInfo,
      variables: { workOrderId }
    })
      .then(res => {
        if (res.data && res.data.data.getOSWInfo) {
          const oswInfoData = res.data.data.getOSWInfo;
          if (oswInfoData.statusCode == 200) {
            return dispatch(oswInfoSuccess(oswInfoData.data));
          } else {
            throw { message: oswInfoData.message || "Unknown Error! Please contact administrator." };
          }
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ?
            res.data.errors[0].data.message ?
              res.data.errors[0].data.message :
              res.data.errors[0].data.detail ?
                res.data.errors[0].data.detail :
                res.data.errors[0].message :
            res.data.errors[0].message;
          return dispatch(oswInfoFailure({ message }));
        } else {
          throw { message: "Unknown Error! Please contact administrator." };
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(oswInfoFailure({ message: errors[0].message }));
        } else {
          return dispatch(oswInfoFailure(errors));
        }
      });
  };
}


export const FETCH_DASHBOARD_CONFIG_REQUEST = 'FETCH_DASHBOARD_CONFIG_REQUEST'
export const FETCH_DASHBOARD_CONFIG_SUCCESS = 'FETCH_DASHBOARD_CONFIG_SUCCESS'
export const FETCH_DASHBOARD_CONFIG_FAILURE = 'FETCH_DASHBOARD_CONFIG_FAILURE'

export const fetchDashboardConfigRequest = createAction(FETCH_DASHBOARD_CONFIG_REQUEST)
export const fetchDashboardConfigSuccess = createAction(FETCH_DASHBOARD_CONFIG_SUCCESS, 'dashboardConfig')
export const fetchDashboardConfigFailure = createAction(FETCH_DASHBOARD_CONFIG_FAILURE, 'errors')

export function fetchDashboardConfig() {
  return dispatch => {
    dispatch(fetchDashboardConfigRequest())
    return ajax.post(`/graphql4g`, { query: schema.getDashboardConfig })
      .then(res => {
        if (res.data && res.data.data && res.data.data.getDashboardConfig) {
          return dispatch(fetchDashboardConfigSuccess(res.data.data.getDashboardConfig.dashboardConfig))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? 
            res.data.errors[0].data.message ? 
              res.data.errors[0].data.message : 
              res.data.errors[0].data.detail ? 
                res.data.errors[0].data.detail : 
                res.data.errors[0].message : 
            res.data.errors[0].message
          return dispatch(fetchDashboardConfigFailure({ message }))
        } else {
          throw { message: "Unknown Error! Please contact administrator." }
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(fetchDashboardConfigFailure({ message: errors[0].message }))
        } else {
          return dispatch(fetchDashboardConfigFailure(errors))
        }
      })
  }
}