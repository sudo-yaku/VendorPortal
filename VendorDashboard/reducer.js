import * as actions from './actions'
import {Map, fromJS} from 'immutable'
import moment from 'moment'
import merge from 'lodash/merge'

export function VendorDashboard (state = Map(), action) {
  switch (action.type) {
    case actions.VENDOR_WORK_ORDER_SELECTED_ROW:
      return state.setIn([action.loginId, "workOrders", "selectedRow"], action.selectedRow)
    // workerList
  case actions.FETCH_AWAITING_WR_REQUEST:
    return state.setIn([action.loginId, "workOrders", "loadingAwaitingWR"], true)
  case actions.FETCH_AWAITING_WR_SUCCESS:
    return state.setIn([action.loginId, "workOrders", "loadingAwaitingWR"], false)
        .setIn([action.loginId, "workOrders", "workerOrdersAwaiting"], fromJS(action.AwaitingWR))
  case actions.FETCH_AWAITING_WR_FAILURE:
    return state.setIn([action.loginId, "workOrders", "loadingAwaitingWR"], false)
        .setIn([action.loginId, "workOrders", "errors"], fromJS(action.errors))

  case actions.SUBMIT_WORKORDER_REQUEST_REQUEST:
    return state.setIn([action.loginId, "workOrdersrequest", "isloading"], true)
  case actions.SUBMIT_WORKORDER_REQUEST_SUCCESS:
    return state.setIn([action.loginId, "workOrdersrequest", "isloading"], false)
        .setIn([action.loginId, "workOrdersrequest", "success"], fromJS(action.savedMessage))
  case actions.SUBMIT_WORKORDER_REQUEST_ERROR:
    return state.setIn([action.loginId, "workOrdersrequest", "isloading"], false)
        .setIn([action.loginId, "workOrdersrequest", "errors"], fromJS(action.errorMessage))

  case actions.FETCH_SITEDETAILS_SUCCESS:
    return state
        .setIn([action.loginId, "site", "siteDetaisLoading"], false)
        .setIn([action.loginId, "site", "siteDetails"], fromJS(action.site))
  case actions.FETCH_SITEDETAILS_REQUEST:
    return state.setIn([action.loginId, "site", "siteDetaisLoading"], true)
  case actions.FETCH_SITEDETAILS_FAILURE:
    return state
    .setIn([action.loginId, "site"], fromJS({siteDetaisLoading: false, errors: action.errors}))

  case actions.FETCH_EVENTDETAILS_REQUEST:
    return state
            .setIn([action.loginId, "events", "eventsDetaisLoading"], true)
            .setIn([action.loginId, "events", "errors"], null)
  case actions.FETCH_EVENTDETAILS_SUCCESS:
    return state
        .setIn([action.loginId, "events", "eventsDetaisLoading"], false)
        .setIn([action.loginId, "events", "eventsDetails"], fromJS(action.events))
        .setIn([action.loginId, "events", "allEvents", "eventsDetails"], fromJS(action.events))
      .setIn([action.loginId, "events", "errors"], null)
  case actions.FETCH_EVENTDETAILS_FAILURE:
    return state
      .setIn([action.loginId, "events", "eventsDetaisLoading"], false)
      .setIn([action.loginId, "events", "errors"], action.errors)
  case actions.GET_CALENDER_EVENTS_FOR_SITE_REQUEST:
    return state.setIn([action.loginId, "eventsforSite", "eventsforSiteLoading"], true)
  case actions.GET_CALENDER_EVENTS_FOR_SITE_SUCCESS:
    return state
        .setIn([action.loginId, "eventsforSite", "eventsforSiteLoading"], false)
        .setIn([action.loginId, "eventsforSite", "eventsforSiteDetails"], fromJS(action.events))
  case actions.GET_CALENDER_EVENTS_FOR_SITE_FAILURE:
    return state
         .setIn([action.loginId, "eventsforSite"], fromJS({eventsDetaisLoading: false, errors: action.errors}))
         .setIn([action.loginId, "eventsforSite", "eventsforSiteLoading"], false)
  case actions.GET_LATEST_OSW_REQUEST:
          return state.setIn([action.loginId, "oswlatest", "oswdateLoading"], true)
  case actions.GET_LATEST_OSW_SUCCESS:
          return state
              .setIn([action.loginId, "oswlatest", "oswdateLoading"], false)
              .setIn([action.loginId, "oswlatest", "oswdate"], fromJS(action.oswdates))
  case actions.GET_LATEST_OSW_FAILURE:
          return state
               .setIn([action.loginId, "oswlatest"], fromJS({oswdateLoading: false, errors: action.errors}))
               .setIn([action.loginId, "oswlatest", "oswdateLoading"], false)
         case actions.GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_REQUEST:
    return state.setIn([action.loginId, "conflictEventsforSite", "conflictEventsforSiteLoading"], true)
  case actions.GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_SUCCESS:
    return state
        .setIn([action.loginId, "conflictEventsforSite", "conflictEventsforSiteLoading"], false)
        .setIn([action.loginId, "conflictEventsforSite", "conflictEventsforSiteDetails"], fromJS(action.events))
  case actions.GET_CONFLICT_KIRKE_CALENDER_EVENTS_FOR_SITE_FAILURE:
    return state
        .setIn([action.loginId, "conflictEventsforSite", "conflictEventsforSiteLoading"], false)
         .setIn([action.loginId, "conflictEventsforSite"], fromJS({ errors: action.errors}))
    case actions.FETCH_EVENTDETAILS_SITE_REQUEST:
      return state.setIn([action.loginId, "events", "eventsDetaisLoading"], true)
    case actions.FETCH_EVENTDETAILS_SITE_SUCCESS:
      return state
          .setIn([action.loginId, "events", "eventsDetaisLoading"], false)
          .setIn([action.loginId, "events", "eventsDetails"], fromJS(action.events))
    case actions.FETCH_EVENTDETAILS_SITE_FAILURE:
      return state.setIn([action.loginId, "events"], fromJS({eventsDetaisLoading: false, errors: action.errors}))
  
  case actions.SUBMIT_SCHEDULE_REQUEST_REQUEST:
    return state.setIn([action.loginId, "schedulerequest", "isloading"], true)
  case actions.SUBMIT_SCHEDULE_REQUEST_SUCCESS:
    return state.setIn([action.loginId, "schedulerequest", "isloading"], false)
        .setIn([action.loginId, "schedulerequest", "success"], fromJS(action.savedMessage))
  case actions.SUBMIT_SCHEDULE_REQUEST_ERROR:
    return state.setIn([action.loginId, "schedulerequest", "isloading"], false)
        .setIn([action.loginId, "schedulerequest", "errors"], fromJS(action.errorMessage))

  case actions.UPDATE_SCHEDULE_REQUEST_REQUEST:
    return state.setIn([action.loginId, "schedulerequest", "isloading"], true)
  case actions.UPDATE_SCHEDULE_REQUEST_SUCCESS:
    return state.setIn([action.loginId, "schedulerequest", "isloading"], false)
        .setIn([action.loginId, "schedulerequest", "success"], fromJS(action.savedMessage))
  case actions.UPDATE_SCHEDULE_REQUEST_ERROR:
    return state.setIn([action.loginId, "schedulerequest", "isloading"], false)
        .setIn([action.loginId, "schedulerequest", "errors"], fromJS(action.errorMessage))

  case actions.SUBMIT_GENTANKDETAILS_REQUEST:
    return state.setIn(["genReadingsRequest", "isloading"], true)
  case actions.SUBMIT_GENTANKDETAILS_SUCCESS:
    return state.setIn(["genReadingsRequest", "isloading"], false)
        .setIn(["genReadingsRequest", "success"], fromJS(action.savedMessage))
  case actions.SUBMIT_GENTANKDETAILS_FAILURE:
    return state.setIn(["genReadingsRequest", "isloading"], false)
        .setIn(["genReadingsRequest", "errors"], fromJS(action.errorMessage))

  case actions.FETCH_GENTANKDETAILS_SUCCESS:
    return state.setIn(["genTank"], fromJS(action.genTank))

  case actions.FETCH_GENTANKDETAILS_FAILURE:
    return state.setIn(["genTankerrors"], fromJS(action.errors))

  case actions.DELETE_SAVED_GENREAD_MSG:
    return state.setIn(["genReadingsRequest", "success"], null)
        .setIn(["genReadingsRequest", "errors"], null)

  case actions.FETCH_EXCEL_DATA_SUCCESS:
    return state
          .setIn([action.loginId, "exportData", "exportDataLoading"], false)
          .setIn([action.loginId, "exportData", "allworkorders"], fromJS(action.exportData.allworkorders))

  case actions.FETCH_WR_SUCCESS:
    if (!action.workOrders.isCompleted) {
      return state
          .setIn([action.loginId, "workOrders", "wrloading"], false)
          .setIn([action.loginId, "workOrders", "completedPanelLoading"], false)
          .setIn([action.loginId, "workOrders", "workerOrdersAwaiting"], fromJS(action.workOrder))
          .setIn([action.loginId, "workOrders", "pending"], fromJS(action.workOrders.pendingWorkOrder))
          .setIn([action.loginId, "workOrders", "awaiting"], fromJS(action.workOrders.waitingWorkOrder))
          .setIn([action.loginId, "workOrders", "completed"], fromJS(action.workOrders.completedWorkOrder))
          .setIn([action.loginId, "dateSearch", "startDate"], moment(action.workOrders.startdate).format('YYYY-MM-DD'))
          .setIn([action.loginId, "dateSearch", "endDate"], moment(action.workOrders.enddate).format('YYYY-MM-DD'))
          .setIn([action.loginId, "workOrderMap"], fromJS(action.workOrders.workOrderMap))
          .setIn([action.loginId, "allworkorders"], fromJS(action.workOrders.allworkorders))
          .setIn([action.loginId, "dashboard"], fromJS(action.workOrders.dashboard))
          .setIn([action.loginId, "WorkType"], fromJS(action.workOrders.WorkType))
          .setIn([action.loginId, "user_dashboard"], fromJS(action.workOrders.user_dashboard))
          .setIn([action.loginId, "vendor_wo_details"], fromJS(action.workOrders.vendor_wo_details))
          .setIn([action.loginId, "rma_data"], fromJS(action.workOrders.rma_data))
          .setIn([action.loginId, "unscheduledWos"], fromJS(action.workOrders.unscheduledWos))
    } else {
      return state
          .setIn([action.loginId, "workOrders", "completedPanelLoading"], false)
          .setIn([action.loginId, "workOrders", "completed"], fromJS(action.workOrders.completedWorkOrder))
          .setIn([action.loginId, "dateSearch", "startDate"], fromJS(action.workOrders.startdate))
          .setIn([action.loginId, "dateSearch", "endDate"], fromJS(action.workOrders.enddate))
    }
  case actions.FETCH_COMPLETED_WR_SUCCESS:
    return state
        .setIn([action.loginId, "workOrders", "completedPanelLoading"], false)
        .setIn([action.loginId, "workOrders", "completed"], fromJS(action.completedItems.completedWorkOrderItems))
        .setIn([action.loginId, "dateSearch", "startDate"], fromJS(action.completedItems.startdate))
        .setIn([action.loginId, "dateSearch", "endDate"], fromJS(action.completedItems.enddate))

  case actions.FETCH_ATTACHMENTS_REQUEST:
    return state
        .setIn([action.loginId, "workOrderMap", action.unid, 'files'], {isLoading: true})

  case actions.FETCH_ATTACHMENTS_SUCCESS: {
    switch (action.category) {
    case "workorder":
      return state.setIn([action.loginId, "workOrderMap", action.workorderId, 'files', action.category], fromJS({isLoading: false, attachments: action.list}))
    case "quote":
      return state.setIn([action.loginId, "workOrderMap", action.workorderId, 'files', action.category], fromJS({isLoading: false, attachments: action.list}))
    case "invoice":
      return state.setIn([action.loginId, "workOrderMap", action.workorderId, 'files', action.category], fromJS({isLoading: false, attachments: action.list}))
    }
    break
  }
  case actions.FETCH_ATTACHMENTS_ERROR:
    return state
        .setIn([action.loginId, "workOrderMap", action.unid, 'files'], fromJS({isLoading: false, attachments: [], message: action.errorMessage}))

  case actions.FETCH_WO_UNID_REQUEST:
    return state
        .setIn(["workOrderDetail", "isWoLoading", action.unid], true)

  case actions.FETCH_WO_UNID_SUCCESS:
    if (action.quoteItemDetails) {
      let workOrderMapData = (state.getIn([action.loginId, "workOrderMap"]).toJS())
      let workOrderid = action.vendor_wo_details["workorder_id"]
      let searchType = state.getIn([action.loginId, "advancedHistory", "searchType"])
      let workOrder = state.getIn([action.loginId, "workOrderMap", workOrderid]).toJS()
      if (searchType == 'statusFilter') {
        workOrder.quoteitems = [{...action.quoteItemDetails}]
        return state
          .setIn(["workOrderDetail", "isWoLoading", action.unid], false)
          .setIn([action.loginId, "workOrderMap", workOrderid], fromJS(workOrder))
          .setIn(["workOrderDetail", action.unid], fromJS(action.vendor_wo_details))
      }
    }
    return state
      .setIn(["workOrderDetail", "isWoLoading", action.unid], false)
      .setIn(["workOrderDetail", action.unid], fromJS(action.vendor_wo_details))
      .setIn(["workOrderDetail", "deviceInfo"], fromJS(action.vendor_wo_details.device_uts_id))
  case actions.FETCH_WO_UNID_FAILURE:
    return state
      .setIn(["workOrderDetail", "isWoLoading", action.unid], false)

  // case actions.FETCH_VENDOR_DISPATCH_DISTANCE_REQUEST:
  //   return state
  //       .setIn(["getWorkOrderDistanceDetails", "isLoading"], true)

  case actions.FETCH_VENDOR_DISPATCH_DISTANCE_SUCCESS:
    return state
      .setIn(["getWorkOrderDistanceDetails", "isLoading"], false)
      .setIn(["getWorkOrderDistanceDetails"], fromJS(action.getWorkOrderDistanceDetails))
  case actions.FETCH_VENDOR_DISPATCH_DISTANCE_FAILURE:
    return state
      .setIn(["getWorkOrderDistanceDetails", "isLoading"], false)
      .setIn(["getWorkOrderDistanceDetails", "errors"], fromJS(action.errors))


  case actions.DOWNLOAD_FILE_REQUEST:
    return state
        .setIn([action.loginId, "workOrderMap", action.unid, 'toDownloads'], {isLoading: true})

  case actions.DOWNLOAD_FILE_SUCCESS:
    return state
        .setIn([action.loginId, "workOrderMap", action.unid, 'toDownloads'], fromJS({isLoading: false, filename: action.filename, filedata: action.filedata}))

  case actions.DOWNLOAD_FILE_ERROR:
    return state
        .setIn([action.loginId, "workOrderMap", action.unid, 'toDownloads'], fromJS({isLoading: false, message: action.errorMessage}))

  case actions.DOWNLOAD_VS_FILE_REQUEST:
    return state
        .setIn([action.loginId, "schedulerequest", 'toDownloads'], {isLoading: true})
  case actions.DOWNLOAD_VS_FILE_SUCCESS:
    return state
        .setIn([action.loginId, "schedulerequest", 'toDownloads'], fromJS({isLoading: false, filename: action.filename, filedata: action.filedata}))
  case actions.DOWNLOAD_VS_FILE_ERROR:
    return state
        .setIn([action.loginId, "schedulerequest", 'toDownloads'], fromJS({isLoading: false, message: action.errorMessage}))

  case actions.FETCH_WR_REQUEST:
    return state
          .setIn([action.loginId, "workOrders", "wrloading"], true)
          .setIn([action.loginId, "advancedHistory", "isLoading"], false)

  case actions.FETCH_COMPLETED_WR_REQUEST:
    return state.setIn([action.loginId, "workOrders", "completedPanelLoading"], true)

  case actions.FETCH_WR_FAILURE:
    return state.setIn([action.loginId, "workOrders", "wrloading"], false)
        .setIn([action.loginId, "workOrders", "errors"], fromJS(action.errors))
  case actions.FETCH_EXCEL_DATA_REQUEST:
    return state.setIn([action.loginId, "exportData", "exportDataLoading"], true)
  
  case actions.FETCH_EXCEL_DATA_FAILURE:
    return state.setIn([action.loginId, "exportData", "exportDataLoading"], false)
                .setIn([action.loginId, "exportData", "errors"], action.errors)
  case actions.SUBMIT_QUOTE_REQUEST:
    return state.setIn([action.loginId, "WorkOrderForm", "loading"], true)
  case actions.SUBMIT_QUOTE_SUCCESS:
    return state.setIn([action.loginId, "WorkOrderForm", "loading"], false)
        .setIn([action.loginId, "WorkOrderForm", "savedMessage"], fromJS(action.savedMessage))
  case actions.SUBMIT_QUOTE_ERROR:
    return state.setIn([action.loginId, "WorkOrderForm", "loading"], false)
        .setIn([action.loginId, "WorkOrderForm", "errorMessage"], fromJS(action.errorMessage))
  case actions.SUBMIT_QUOTE_FAILURE:
    return state.setIn([action.loginId, "WorkOrderForm", "loading"], false)
        .setIn([action.loginId, "WorkOrderForm", "errors"], fromJS(action.errors))
  case actions.DELETE_SAVED_MSG:
    return state.setIn([action.loginId, "WorkOrderForm", "savedMessage"], null)
        .setIn([action.loginId, "WorkOrderForm", "errorMessage"], null)

  case actions.UPLOAD_FILES_SUCCESS_WO:
    return state.setIn([action.loginId, "WorkOrderForm", "SubmitUploadDetailsRespWO", action.unid], fromJS(action.uploadFilesSubmissionStatusWO))
  case actions.UPLOAD_FILES_ERROR_WO:
    return state.setIn([action.loginId, "WorkOrderForm", "SubmitUploadDetailsRespWO", action.unid], fromJS(action.uploadFilesSubmissionerrorMessageWO))

  case actions.SUBMIT_WORKORDER_FILE_REQUEST:
    return state.setIn([action.loginId, "workOrderFileUpload", "loading"], true)
  case actions.SUBMIT_WORKORDER_FILE_SUCCESS:
    return state.setIn([action.loginId, "workOrderFileUpload", "loading"], false)
        .setIn([action.loginId, "workOrderFileUpload", "savedMessage"], fromJS(action.savedMessage))
  case actions.SUBMIT_WORKORDER_FILE_ERROR:
    return state.setIn([action.loginId, "workOrderFileUpload", "loading"], false)
        .setIn([action.loginId, "workOrderFileUpload", "errorMessage"], fromJS(action.errorMessage))

        case actions.SUBMIT_QUOTE_FILE_REQUEST:
          return state.setIn([action.loginId, "quoteInvoiceFileUpload", "loading"], true)
        case actions.SUBMIT_QUOTE_FILE_SUCCESS:
          return state.setIn([action.loginId, "quoteInvoiceFileUpload", "loading"], false)
              .setIn([action.loginId, "quoteInvoiceFileUpload", "savedMessage"], fromJS(action.savedMessage))
        case actions.SUBMIT_QUOTE_FILE_ERROR:
          return state.setIn([action.loginId, "quoteInvoiceFileUpload", "loading"], false)
              .setIn([action.loginId, "quoteInvoiceFileUpload", "errorMessage"], fromJS(action.errorMessage))
      
  case actions.UPDATE_VENDORSTATUS_REQUEST:
    return state.setIn(["vendorStatus", "loading"], true)
  case actions.UPDATE_VENDORSTATUS_SUCCESS:
    return state.setIn([ "vendorStatus", "loading"], false)
        .setIn([ "vendorStatus", "vendorstatus"], fromJS(action.vendorStatus))
  case actions.UPDATE_VENDORSTATUS_FAILURE:
    return state.setIn([ "vendorStatus", "loading"], false)
        .setIn([ "vendorStatus", "errorMessage"], fromJS(action.errors))

   case actions.UPDATE_VENDORSTATUSCOMMENTS_REQUEST:
     return state.setIn(["vendorStatusComments", "loading"], true)
   case actions.UPDATE_VENDORSTATUSCOMMENTS_SUCCESS:
     return state.setIn([ "vendorStatusComments", "loading"], false)
         .setIn([ "vendorStatusComments", "vendorstatus"], fromJS(action.vendorStatusComments))
   case actions.UPDATE_VENDORSTATUSCOMMENTS_FAILURE:
     return state.setIn([ "vendorStatusComments", "loading"], false)
         .setIn([ "vendorStatusComments", "errorMessage"], fromJS(action.errors))
                        
      

  case actions.UPDATE_WORKORDER_STATUS_REQUEST:
    return state.setIn([action.loginId, "workorderStatusUpdate", "loading"], true)
  case actions.UPDATE_WORKORDER_STATUS_SUCCESS:
    return state.setIn([action.loginId, "workorderStatusUpdate", "loading"], false)
        .setIn([action.loginId, "workorderStatusUpdate", "savedMessage"], fromJS(action.savedMessage))
        .updateIn(["workOrderDetail", action.unid], (o) => {
          if (o) {
            let q = {
              ...(o.toJS()), vendor_status: action.input.vendor_status,
              vendor_status_date: moment().format("YYYY-MM-DD hh:mm:ss"), vendor_status_by: action.userFullName
            }
            return Map(q)
          }
        })
  case actions.UPDATE_WORKORDER_STATUS_ERROR:
    return state.setIn([action.loginId, "workorderStatusUpdate", "loading"], false)
        .setIn([action.loginId, "workorderStatusUpdate", "errorMessage"], fromJS(action.errorMessage))


  case actions.DELETE_SAVED_MSG_FILEUPLOAD:
    return state.setIn([action.loginId, "workOrderFileUpload", "savedMessage"], null)
        .setIn([action.loginId, "workOrderFileUpload", "errorMessage"], null)
  case actions.SUBMIT_FIle_VWO_REQUEST:
    return state.setIn([action.loginId, "WorkOrderForm", "loading"], true)
  case actions.SUBMIT_FIle_VWO_SUCCESS:
    return state.setIn([action.loginId, "WorkOrderForm", "loading"], false)
        .setIn([action.loginId, "WorkOrderForm", "savedMessage"], fromJS({message: action.data.message}))
        .setIn([action.loginId, "WorkOrderForm", "Failedfiles"], fromJS({message: action.data.failed}))
        .setIn([action.loginId, "WorkOrderForm", "Uploadedfiles"], fromJS({message: action.data.uploaded}))

  case actions.SUBMIT_FIle_VWO_FAILURE:
    return state.setIn([action.loginId, "WorkOrderForm", "loading"], false)
        .setIn([action.loginId, "WorkOrderForm", "errors"], fromJS(action.errors))

  case actions.RESET_PROPS:
    return state.setIn(action.keys, fromJS(action.value))

  case actions.FETCH_GENERATORDETAILS_SUCCESS:
    return state.setIn(["generator"], fromJS(action.generators))

  case actions.FETCH_GENERATORDETAILS_FAILURE:
    return state.setIn(["generrors"], fromJS(action.errors))

  case actions.FETCH_HVACDETAILS_SUCCESS:
    return state.setIn(["hvac"], fromJS(action.hvacs))

  case actions.FETCH_HVACDETAILS_FAILURE:
    return state.setIn(["hvacerrors"], fromJS(action.errors))

  case actions.RESET_HISTORY_PROPS:
    return state
        .setIn([action.loginId, "advancedHistory", "isLoading"], false)
        .setIn([action.loginId, "advancedHistory", "errorMessage"], fromJS(null))

  case actions.FETCH_ADVANCED_HISTORY:
    return state
        .setIn([action.loginId, "advancedHistory", "isLoading"], true)
        .setIn([action.loginId, "advancedHistory", "searchType"], '')
        .setIn([action.loginId, "historyMap"], fromJS({}))
        .setIn([action.loginId, "allHistoryWorkOrders"], fromJS([]))
        .setIn([action.loginId, "user_dashboard", "history"], fromJS({}))
        .setIn([action.loginId, "advancedHistory", "errorMessage"], fromJS(null))
  case actions.FETCH_ADVANCED_HISTORY_SUCCESS:
    let workOrderMapDataList = state.hasIn([action.loginId, "workOrderMap"]) && state.getIn([action.loginId, "workOrderMap"]).toJS()
    Object.keys(action.searchHistoryData.historyMap).forEach(itemKey => {
      if (workOrderMapDataList[itemKey]) {
        let mergedData = {}
        mergedData[itemKey] = merge(action.searchHistoryData.historyMap[itemKey], workOrderMapDataList[itemKey])
        workOrderMapDataList = {...workOrderMapDataList, ...mergedData}
      } else {
        let mergedData = {}
        mergedData[itemKey] = action.searchHistoryData.historyMap[itemKey]
        workOrderMapDataList = {...workOrderMapDataList, ...mergedData}
      }
    })
    let workOrderMap;
    if(state.hasIn([action.loginId, "workOrderMap"])) {
      workOrderMap = {...(state.getIn([action.loginId, "workOrderMap"]).toJS()), ...workOrderMapDataList}
    } else {
      workOrderMap = {...workOrderMapDataList}
    }
    return state
        .setIn([action.loginId, "advancedHistory", "isLoading"], false)
        .setIn([action.loginId, "advancedHistory", "searchType"], action.searchType)
        .setIn([action.loginId, "historyMap"], fromJS(action.searchHistoryData.historyMap))
        .setIn([action.loginId, "workOrderMap"], fromJS(workOrderMap))
        .setIn([action.loginId, "allHistoryWorkOrders"], fromJS(action.searchHistoryData.allHistoryData))
        .setIn([action.loginId, "user_dashboard", "history"], fromJS(action.searchHistoryData.historyBucket))

  case actions.FETCH_ADVANCED_HISTORY_FAILURE:
    return state
      .setIn([action.loginId, "advancedHistory", "isLoading"], false)
      .setIn([action.loginId, "advancedHistory", "errorMessage"], fromJS(action.errors))

  case actions.FETCH_PENDINGWODETAILS_REQUEST:
    return state.setIn([action.loginId, action.vendorId, "WODetailsLoading"], true)
  case actions.FETCH_PENDINGWODETAILS_SUCCESS:
    return state
      .setIn([action.loginId, action.vendorId, "WODetailsLoading"], false)
      .setIn([action.loginId, action.vendorId, "WODetails"], fromJS(action.pendingWorkOrderDetails))

  case actions.FETCH_PENDINGWODETAILS_FAILURE:
    return state
      .setIn([action.loginId, action.vendorId, "pm", "WODetailsLoading"], false)
      .setIn([action.loginId, action.vendorId, "pm", "WODetailsErrors"], fromJS(action.errors))

  case actions.FETCH_FIXEDPRICINGSERVICES_SUCCESS:
    return state
            .setIn([action.loginId, action.vendorId, action.workorderId, "Fixed Pricing", "servicesLoading"], false)
            .setIn([action.loginId, action.vendorId, action.workorderId, "Fixed Pricing", "servicesLoading"], fromJS(action.FixedPricingServ))
  case actions.FETCH_FIXEDPRICINGSERVICES_REQUEST:
    return state.setIn([action.loginId, action.vendorId, action.workorderId, "Fixed Pricing", "servicesLoading"], true)
  case actions.FETCH_FIXEDPRICINGSERVICES_FAILURE:
    return state.setIn([action.loginId, action.vendorId, action.workorderId, "Fixed Pricing"], fromJS({servicesLoading: false, errors: action.FixedPricingServErr}))
  case actions.FETCH_FIXEDPRCEXTSERVICES_SUCCESS:
    return state
            .setIn([action.loginId, action.vendorId, action.unid, "Fixed Pricing", "servicesLoading"], false)
            .setIn([action.loginId, action.vendorId, action.unid, "Fixed Pricing", "servicesLoading"], fromJS(action.FixedPricingExtServ))
  case actions.FETCH_FIXEDPRCEXTSERVICES_REQUEST:
    return state.setIn([action.loginId, action.vendorId, action.unid, "Fixed Pricing", "servicesLoading"], true)
  case actions.FETCH_FIXEDPRCEXTSERVICES_FAILURE:
    return state.setIn([action.loginId, action.vendorId, action.unid, "Fixed Pricing"], fromJS({servicesLoading: false, errors: action.FixedPricingExtServErr}))
  case actions.SUBMIT_FPQUOTE_SUCCESS:
    return state.setIn([action.loginId, action.vendorId, action.quoteUnid, "Fixed Pricing", "submitRes"], fromJS(action.submitFixedQuoteInvoiceStatus))
  case actions.SUBMIT_FPQUOTE_ERROR:
      return state.setIn([action.loginId, action.vendorId, action.quoteUnid, "Fixed Pricing", "submitRes"], fromJS({ errors: action.submitFixedQuoteInvoiceerrorMessage }))
    case actions.RMA_DETAILS_REQUEST:
      return state
        .setIn([action.loginId, action.vwrsId, "rmaLoading"], true)

    case actions.RMA_DETAILS_SUCCESS:
      return state
        .setIn([action.loginId, action.vwrsId, "rmaLoading"], false)
        .setIn([action.loginId, action.vwrsId, "result"], fromJS(action.result))

    case actions.RMA_DETAILS_FAILURE:
      return state
        .setIn([action.loginId, action.vwrsId, "rmaLoading"], false)
        .setIn([action.loginId, action.vwrsId, "rmaDetails", "errors"], fromJS(action))
    case actions.RMA_STATUS_REQUEST:
      return state
        .setIn([action.loginId, action.vendorId, "rmaStatusLoading"], true)

    case actions.RMA_STATUS_SUCCESS:
      return state
        .setIn([action.loginId, action.vendorId, "rmaStatusLoading"], false)
        .setIn([action.loginId, action.vendorId, "rmaStatusData"], fromJS(action.rmaStatus))

    case actions.RMA_STATUS_FAILURE:
      return state
        .setIn([action.loginId, action.vendorId, "rmaStatusLoading"], false)
        .setIn([action.loginId, action.vendorId, "rmaStatus", "errors"], fromJS(action))
        
    case actions.RMA_PICTURES_REQUEST:
      return state
        .setIn([action.loginId, action.attachmentId, "rmaPicturesLoading"], true)

    case actions.RMA_PICTURES_SUCCESS:
      return state
        .setIn([action.loginId, action.attachmentId, "rmaPicturesLoading"], false)
        .setIn([action.loginId, action.attachmentId, "rmaPicturesData"], fromJS(action.data))
        .setIn([action.loginId, action.attachmentId, "rmaPictures", "errors"], null)

    case actions.RMA_PICTURES_FAILURE:
      return state
        .setIn([action.loginId, action.attachmentId, "rmaPicturesLoading"], false)
        .setIn([action.loginId, action.attachmentId, "rmaPictures", "errors"], fromJS(action.errors))

    case actions.RMA_PICTURES_PREV_REQUEST:
      return state
        .setIn([action.categoryId, action.attachmentId, "rmaPicturesPrevLoading"], true)

    case actions.RMA_PICTURES_PREV_SUCCESS:
      return state
        .setIn([action.categoryId, action.attachmentId, "rmaPicturesPrevLoading"], false)
        .setIn([action.categoryId, action.attachmentId, "rmaPicturePrev"], fromJS(action.attachment))

    case actions.RMA_PICTURES_PREV_FAILURE:
      return state
        .setIn([action.categoryId, action.attachmentId, "rmaPicturesPrevLoading"], false)
        .setIn([action.categoryId, action.attachmentId, "rmaPicturesPrev", "errors"], fromJS(action.errors))

    case actions.FETCH_BID_UNIT_RULES_REQUEST:
      return state
        .setIn(["bidUnitRules", "loading"], true)
        .setIn(["bidUnitRules", "errors"], null)

    case actions.FETCH_BID_UNIT_RULES_SUCCESS:
      return state
        .setIn(["bidUnitRules", "loading"], false)
        .setIn(["bidUnitRules", "data"], fromJS(action.bidUnitRules))
        .setIn(["bidUnitRules", "errors"], null)

    case actions.FETCH_BID_UNIT_RULES_FAILURE:
      return state
        .setIn(["bidUnitRules", "loading"], false)
        .setIn(["bidUnitRules", "errors"], fromJS(action.errors))

    case actions.FETCH_LINE_ITEMS_REQUEST:
      return state
        .setIn(["lineItems", "loading"], true)
        .setIn(["lineItems", "errors"], null)

    case actions.FETCH_LINE_ITEMS_SUCCESS:
      return state
        .setIn(["lineItems", "loading"], false)
        .setIn(["lineItems", "data"], fromJS(action.lineItems))
        .setIn(["lineItems", "errors"], null)

    case actions.FETCH_LINE_ITEMS_FAILURE:
      return state
        .setIn(["lineItems", "loading"], false)
        .setIn(["lineItems", "errors"], fromJS(action.errors))

    case actions.FETCH_ATTACHMENTS_WORKORDER_REQUEST:
      return state
        .setIn(["attachments", "loading"], true)
        .setIn(["attachments", "errors"], null)

    case actions.FETCH_ATTACHMENTS_WORKORDER_SUCCESS:
      return state
        .setIn(["attachments", "loading"], false)
        .setIn(["attachments", "data"], fromJS(action.attachments))
        .setIn(["attachments", "errors"], null)

    case actions.FETCH_ATTACHMENTS_WORKORDER_FAILURE:
      return state
        .setIn(["attachments", "loading"], false)
        .setIn(["attachments", "errors"], fromJS(action.errors))

    case actions.FETCH_VENDOR_WORK_ORDER_REQUEST:
      return state
        .setIn(["vendorWorkOrder", "loading"], true)
        .setIn(["vendorWorkOrder", "errors"], null)

    case actions.FETCH_VENDOR_WORK_ORDER_SUCCESS:
      return state
        .setIn(["vendorWorkOrder", "loading"], false)
        .setIn(["vendorWorkOrder", "data"], fromJS(action.vendorWorkOrder))
        .setIn(["vendorWorkOrder", "errors"], null)

    case actions.FETCH_VENDOR_WORK_ORDER_FAILURE:
      return state
        .setIn(["vendorWorkOrder", "loading"], false)
        .setIn(["vendorWorkOrder", "errors"], fromJS(action.errors))

    case actions.POST_INVOICE_SUBMIT_REQUEST:
      return state
        .setIn(["invoiceSubmit", "loading"], true)
        .setIn(["invoiceSubmit", "error"], null)
        
    case actions.POST_INVOICE_SUBMIT_SUCCESS:
      return state
        .setIn(["invoiceSubmit", "loading"], false)
        .setIn(["invoiceSubmit", "data"], fromJS(action.invoiceData))
        .setIn(["invoiceSubmit", "error"], null)

    case actions.POST_INVOICE_SUBMIT_FAILURE:
      return state
        .setIn(["invoiceSubmit", "loading"], false)
        .setIn(["invoiceSubmit", "error"], fromJS(action.error))

    case actions.FETCH_AUDIT_WORK_ORDER_REQUEST:
      return state
        .setIn(["auditWorkOrder", "loading"], true)
        .setIn(["auditWorkOrder", "errors"], null)

    case actions.FETCH_AUDIT_WORK_ORDER_SUCCESS:
      return state
        .setIn(["auditWorkOrder", "loading"], false)
        .setIn(["auditWorkOrder", "data"], fromJS(action.auditWorkOrderData))
        .setIn(["auditWorkOrder", "errors"], null)

    case actions.FETCH_AUDIT_WORK_ORDER_FAILURE:
      return state
        .setIn(["auditWorkOrder", "loading"], false)
        .setIn(["auditWorkOrder", "errors"], fromJS(action.errors))

  case actions.PATCH_AUDIT_REQUEST:
    return state
      .setIn(["patchAuditData", "patchLoading"], true)
      .setIn(["patchAuditData", "patchError"], null)

  case actions.PATCH_AUDIT_SUCCESS:
    return state
      .setIn(["patchAuditData", "patchLoading"], false)
      .setIn(["patchAuditData", "patchData"], fromJS(action.patchAuditData))
      .setIn(["patchAuditData", "patchError"], null)

  case actions.PATCH_AUDIT_FAILURE:
    return state
      .setIn(["patchAuditData", "patchLoading"], false)
      .setIn(["patchAuditData", "patchError"], fromJS(action.patchAuditError))


      case actions.FETCH_AUDIT_INVOICE_REQUEST:
        return state
          .setIn(["auditInvoice", "loading"], true)
          .setIn(["auditInvoice", "error"], null)
  
      case actions.FETCH_AUDIT_INVOICE_SUCCESS:
        return state
          .setIn(["auditInvoice", "loading"], false)
          .setIn(["auditInvoice", "data"], fromJS(action.auditInvoiceData))
          .setIn(["auditInvoice", "error"], null)
  
      case actions.FETCH_AUDIT_INVOICE_FAILURE:
        return state
          .setIn(["auditInvoice", "loading"], false)
          .setIn(["auditInvoice", "error"], fromJS(action.error))
  
      case actions.RECALCULATE_MILEAGE_REQUEST:
        return state
          .setIn(["mileageDistance", "loading"], true)
          .setIn(["mileageDistance", "error"], null)
  
      case actions.RECALCULATE_MILEAGE_SUCCESS:
        return state
          .setIn(["mileageDistance", "loading"], false)
          .setIn(["mileageDistance", "data"], fromJS(action.recalculateDistance))
          .setIn(["mileageDistance", "error"], null)
  
      case actions.RECALCULATE_MILEAGE_FAILURE:
        return state
          .setIn(["mileageDistance", "loading"], false)
          .setIn(["mileageDistance", "error"], fromJS(action.error))

      case actions.OSW_INFO_REQUEST:
        return state
          .setIn(["oswInfo", "loading"], true)
          .setIn(["oswInfo", "error"], null)

      case actions.OSW_INFO_SUCCESS:
        return state
          .setIn(["oswInfo", "loading"], false)
          .setIn(["oswInfo", "data"], fromJS(action.oswInfoData))
          .setIn(["oswInfo", "error"], null)

      case actions.OSW_INFO_FAILURE:
        return state
          .setIn(["oswInfo", "loading"], false)
          .setIn(["oswInfo", "error"], fromJS(action.error))

    case actions.FETCH_DASHBOARD_CONFIG_REQUEST:
      return state
        .setIn(["dashboardConfig", "loading"], true)
        .setIn(["dashboardConfig", "errors"], null)

    case actions.FETCH_DASHBOARD_CONFIG_SUCCESS:
      return state
        .setIn(["dashboardConfig", "loading"], false)
        .setIn(["dashboardConfig", "data"], fromJS(action.dashboardConfig))
        .setIn(["dashboardConfig", "errors"], null)

    case actions.FETCH_DASHBOARD_CONFIG_FAILURE:
      return state
        .setIn(["dashboardConfig", "loading"], false)
        .setIn(["dashboardConfig", "errors"], fromJS(action.errors))

    default:
      return state
  }
}
export default VendorDashboard
