import * as actions from './actions'
import {Map, fromJS} from 'immutable'


// export function issueInformation(state=Map(),action){
//   switch (action.type) {
//     case actions.FETCH_ISSUE_SUCCESS:
//       console.log(action);
//      return state.setIn(["issuedata"],action.issues);
//       break;
//     default:
//       return state;
//       break;
//   }
// }

export function Sites(state = Map(), action) {
  switch (action.type) {
    
     

    case actions.FETCH_ENODEB_SUCCESS:
      return state

        .setIn([action.loginId, action.vendorId, "sitenodebData", action.unid], fromJS(action.enodebData))

    case actions.FETCH_ENODEB_FAILURE:
      return state.setIn([action.loginId, action.vendorId, "enodebData", action.unid], fromJS(action.errorsenodebData))


    case actions.FETCH_SECTORLOCKDATA_SUCCESS:
      return state

        .setIn([action.loginId, action.vendorId, "sitsectorLockData", action.unid], fromJS(action.sectorLockData))

    case actions.FETCH_SECTORLOCKDATA_FAILURE:
      return state.setIn([action.loginId, action.vendorId, "sectorLockData", action.unid], fromJS(action.errorsSectorLockData))

    case actions.FETCH_SITEDETAILS_SUCCESS:
      return state
        .setIn([action.loginId, "site", "siteDetaisLoading"], false)
        .setIn([action.loginId, "site", "siteDetails"], fromJS(action.site))
        .setIn([action.loginId, "site", "siteDetails", action.siteunid], fromJS(action.site))
    case actions.FETCH_SITEDETAILS_REQUEST:
      return state.setIn([action.loginId, "site", "siteDetaisLoading"], true)
    case actions.FETCH_SITEDETAILS_FAILURE:
      return state.setIn([action.loginId, "site"], fromJS({ siteDetaisLoading: false, errors: action.errors }))

    case actions.FETCH_SECTORINFO_REQUEST:
      return state.setIn([action.loginId, "sectorInfo", "sectorInfoLoading"], true)
    case actions.FETCH_SECTORINFO_SUCCESS:
      return state
        .setIn([action.loginId, "sectorInfo", "sectorInfoLoading"], false)
        .setIn([action.loginId, "sectorInfo", "sectorInfoData"], fromJS(action.sectorInfo))
    case actions.FETCH_SECTORINFO_FAILURE:
      return state.setIn([action.loginId, "sectorInfo", "sectorInfoLoading"], false)
    /*Issue Reducer*/
      case actions.FETCH_ISSUE_REQUEST:
        return state.setIn([action.loginId, "issue", "issueLoading"], true)
      case actions.FETCH_ISSUE_SUCCESS:
        return state
          .setIn([action.loginId, "issue", "issueLoading"], false)
          .setIn([action.loginId, "issue", "issueData"], fromJS(action.issueData))
      case actions.FETCH_ISSUE_FAILURE:
        return state.setIn([action.loginId, "issue", "issueLoading"], false)
/*Resolution type Reducer*/
        case actions.FETCH_RESOLUTION_REQUEST:
          return state.setIn([action.loginId, "Resolutionissue", "ResolutionissueLoading"], true)
        case actions.FETCH_RESOLUTION_SUCCESS:
          return state
            .setIn([action.loginId, "Resolutionissue", "ResolutionissueLoading"], false)
            .setIn([action.loginId, "Resolutionissue", "ResolutionissueData"], fromJS(action.issueResolutionData))
        case actions.FETCH_RESOLUTION_FAILURE:
          return state.setIn([action.loginId, "Resolutionissue", "ResolutionissueLoading"], false)

          /*get Anteena Information reducer*/
          case actions.FETCH_ANTEENADETAILS_REQUEST:
          return state.setIn([action.loginId, "AnteenaInformation", "AnteenaInformationLoading"], true)
        case actions.FETCH_ANTEENADETAILS_SUCCESS:
          return state
            .setIn([action.loginId, "AnteenaInformation", "AnteenaInformationLoading"], false)
            .setIn([action.loginId, "AnteenaInformation", "AnteenaInformationData"], fromJS(action.anteenaInfo))
        case actions.FETCH_ANTEENADETAILS_FAILURE:
          return state
          .setIn([action.loginId, "AnteenaInformation", "AnteenaInformationLoading"], false)
          .setIn([action.loginId,"AnteenaInformation","errors"],fromJS(action.errors))
          
          /*get Radio Information reducer*/
          case actions.FETCH_RADIODETAILS_REQUEST:
          return state.setIn([action.loginId, "RadioInformation", "RadioInformationLoading"], true)
        case actions.FETCH_RADIODETAILS_SUCCESS:
          return state
            .setIn([action.loginId, "RadioInformation", "RadioInformationLoading"], false)
            .setIn([action.loginId, "RadioInformation", "RadioInformationData"], fromJS(action.radioInfo))
            
        case actions.FETCH_RADIODETAILS_FAILURE:
          return state
          .setIn([action.loginId, "RadioInformation", "RadioInformationLoading"], false)
          .setIn([action.loginId,"RadioInformation","errors"],fromJS(action.errors))

          /*submit reducer comments*/
          case actions.SUBMIT_RESOLUTION_REQUEST:
            return state.setIn([action.loginId, "submitResolutionissue", "submitResolutionissueLoading"], true)
          case actions.SUBMIT_RESOLUTION_SUCCESS:
            return state
              .setIn([action.loginId, "submitResolutionissue", "submitResolutionissueLoading"], false)
              .setIn([action.loginId, "submitResolutionissue", "submitResolutionissueData"], fromJS(action.update_comments))
          case actions.SUBMIT_RESOLUTION_FAILURE:
            return state.setIn([action.loginId, "submitResolutionissue", "submitResolutionissueLoading"], false)

                   /*update Restrictions*/
          case actions.ADD_RESTRICTION_REQUEST:
            return state.setIn([action.loginId, "addRestriction", "addRestrictionLoading"], true)
          case actions.ADD_RESTRICTION_SUCCESS:
            return state
              .setIn([action.loginId, "addRestriction", "addRestrictionLoading"], false)
              .setIn([action.loginId, "addRestriction", "addRestrictionData"], fromJS(action.updated_access_restriction))
          case actions.ADD_RESTRICTION_FAILURE:
            return state.setIn([action.loginId, "addRestriction", "addRestrictionLoading"], false)


    case actions.FETCH_SITES_BY_SUBMARKET_REQUEST:
      return state
        .setIn([action.loginId, "sitesbysubmarket", "siteBySubmarketisLoading"], true)
    case actions.FETCH_SITES_BY_SUBMARKET_SUCCESS:
      return state.setIn([action.loginId, "sitesbysubmarket", "siteBySubmarketisLoading"], false)
        .setIn([action.loginId, "sitesbysubmarket", "sites"], fromJS(action.sites))
    case actions.FETCH_SITES_BY_SUBMARKET_FAILURE:
      return state.setIn([action.loginId, "sitesbysubmarket"], fromJS({ siteBySubmarketisLoading: false, errors: action.errors }))
    case actions.DOWNLOAD_LOCK_FILE_REQUEST:
      return state
        .setIn(['LockDownloads'], { isLoading: true })
    case actions.DOWNLOAD_LOCK_FILE_SUCCESS:
      return state
        .setIn(['LockDownloads'], fromJS({ isLoading: false, attachmentData: action.attachmentData }))
    case actions.DOWNLOAD_LOCK_FILE_ERROR:
      return state
        .setIn(['LockDownloads'], fromJS({ isLoading: false, message: action.errorMessage }))

    case actions.DOWNLOAD_HC_DETAILS_REQUEST:
      return state
        .setIn(['HcDownloads'], { isLoading: true })
    case actions.DOWNLOAD_HC_DETAILS_SUCCESS:
      console.log("data1", action)
      return state
        .setIn(['HcDownloads'], fromJS({ isLoading: false, downloadHC: action.result }))
    case actions.DOWNLOAD_HC_DETAILS_ERROR:
      return state
        .setIn(['HcDownloads'], fromJS({ isLoading: false, message: action.errorMessage }))



    case actions.RESET_PROPS:
      return state.setIn(action.keys, fromJS(action.value))

    case actions.FETCH_LOCKDATA_SUCCESS:
      return state
        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, 'lockDataLoading'], false)
        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, "lockReqData"], fromJS(action.lockReqData))
    case actions.FETCH_LOCKDATA_REQUEST:
      return state.setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, 'lockDataLoading'], true)
    case actions.FETCH_LOCKDATA_FAILURE:
      return state
        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, 'lockDataLoading'], false)
        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, "lockReqData"], fromJS({ errors: action.errors }))
    case actions.SUBMIT_NOTES_SUCCESS:
      return state

        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, "submitNotesResp"], fromJS(action.submitNotesResp))

    case actions.SUBMIT_NOTES_FAILURE:
      return state

        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, "submitNotesResp"], fromJS({ errors: action.errors }))
    case actions.SUBMIT_ATTS_SUCCESS:
      return state

        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, "submitAttsResp"], fromJS(action.submitAttsResp))

    case actions.SUBMIT_ATTS_FAILURE:
      return state

        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, "submitAttsResp"], fromJS({ errors: action.errors }))
    case actions.SUBMIT_UNLOCK_SUCCESS:
      return state

        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, "submitUnlockResp"], fromJS(action.submitUnlockResp))

    case actions.SUBMIT_UNLOCK_FAILURE:
      return state

        .setIn([action.loginId, action.vendorId, action.workOrderId, action.lockReqId, "submitUnlockResp"], fromJS({ errors: action.errors }))

    case actions.SUBMIT_LOCK_SUCCESS:
      return state

        .setIn([action.loginId, action.vendorId, action.workOrderId, "submitLockResp"], fromJS(action.submitLockResp))

    case actions.SUBMIT_LOCK_FAILURE:
      return state

        .setIn([action.loginId, action.vendorId, action.workOrderId, "submitLockResp"], fromJS({ errors: action.errors }))

    case actions.HEALTHCHECK_DISABLE:
      return state.setIn(["isRequested"], true)

    case actions.HEALTHCHECK_ENABLE:
      return state.setIn(["isRequested"], false)

    case actions.SITEACCESS_REFRESH_ENABLE:
      return state.setIn(["refreshEnable"], true)
  
    case actions.SITEACCESS_REFRESH_DISABLE:
      return state.setIn(["refreshEnable"], false)
      
    case actions.MMU_DISABLE:
      return state.setIn(["isDisabled"], true)
    case actions.MMU_ENABLE:
      return state.setIn(["isDisabled"], false)
    case actions.FETCH_HEALTHCHECK_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "healthDataLoading"], true)


    case actions.FETCH_HEALTHCHECK_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "healthDataLoading"], false)
        .setIn([action.loginId, 'healthCheckReqs'], fromJS(action.healthCheckReqs))

    case actions.FETCH_HEALTHCHECK_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "healthDataLoading"], false)
        .setIn([action.loginId, "errors"], fromJS(action.errors))


    case actions.FETCH_CBANDTOOLS_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "cbandToolsLoading"], true)


    case actions.FETCH_CBANDTOOLS_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "cbandToolsLoading"], false)
        .setIn([action.loginId, 'cbandToolsData'], fromJS(action.cbandTools))

    case actions.FETCH_CBANDTOOLS_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "cbandToolsLoading"], false)
        .setIn([action.loginId, "errors"], fromJS(action.errors))

    case actions.DOWNLOAD_MMU_RESULT_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "mmudownloadLoading"], true)


    case actions.DOWNLOAD_MMU_RESULT_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "mmudownloadLoading"], false)
        .setIn([action.loginId, 'downloadMMU'], fromJS(action.downloadResult))

    case actions.DOWNLOAD_MMU_RESULT_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "mmudownloadLoading"], false)
        .setIn([action.loginId, "errors"], fromJS(action.errors))

    case actions.CREATE_HEALTHCHECK_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "healthDetailsLoading"], true)
    case actions.CREATE_HEALTHCHECK_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "healthDetailsLoading"], false)
        .setIn([action.loginId, "healthCheck"], fromJS(action.reqhealthcheck))

    case actions.CREATE_HEALTHCHECK_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "healthDetailsLoading"], false)
        .setIn([action.loginId, "siteDetails", "errors"], fromJS(action.errors))


    case actions.LOAD_CQ_DATA:
      return state
        .setIn([action.loginId, "siteDetails", "cqDataLoading"], true)
    case actions.LOAD_CQ_DATA_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "cqDataLoading"], false)
        .setIn([action.loginId, "cqData"], fromJS(action.loadCqData))

    case actions.LOAD_CQ_DATA_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "cqDataLoading"], false)
        .setIn([action.loginId, "cqData", "errors"], fromJS(action.errors))
    case actions.GENERATE_VALIDATION_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "validationLoading"], true)
    case actions.GENERATE_VALIDATION_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "validationLoading"], false)
        .setIn([action.loginId, "validationResult"], fromJS(action.generateValidationMMU))
    case actions.GENERATE_VALIDATION_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "validationLoading"], false)
        .setIn([action.loginId, "validationResult", "errors"], fromJS(action.errors))
    case actions.FETCH_HEALTHCHECK_DETAILS_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "healthDetailsLoading"], true)


    case actions.FETCH_HEALTHCHECK_DETAILS_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "healthDetailsLoading"], false)
        .setIn([action.loginId, "siteDetails", "healthDetails"], fromJS(action.result))

    case actions.FETCH_HEALTHCHECK_DETAILS_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "healthDetailsLoading"], false)
        .setIn([action.loginId, "sitedata", "errors"], fromJS(action.errors))
    case actions.FETCH_FAST_HISTORY_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "fastHistoryLoading"], true)


    case actions.FETCH_FAST_HISTORY_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "fastHistoryLoading"], false)
        .setIn([action.loginId, "siteDetails", "slrhistory"], fromJS(action.slrhistory.slrhistory))

    case actions.FETCH_FAST_HISTORY_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "fastHistoryLoading"], false)
        .setIn([action.loginId, "sitedata", "errors"], fromJS(action.errors))

    case actions.FETCH_DANGEROUS_SITE_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "dangerousSiteLoading"], true)


    case actions.FETCH_DANGEROUS_SITE_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "dangerousSiteLoading"], false)
        .setIn([action.loginId, "siteDetails", "dangerousSite"], fromJS(action.dangerousSite))

    case actions.FETCH_DANGEROUS_SITE_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "dangerousSiteLoading"], false)
        .setIn([action.loginId, "sitedata", "errors"], fromJS(action.errors))
    case actions.FETCH_ROOFTOP_REQUEST:
      return state
        .setIn([action.loginId, "siteDetails", "roofTopLoading"], true)


    case actions.FETCH_ROOFTOP_SUCCESS:
      return state
        .setIn([action.loginId, "siteDetails", "roofTopLoading"], false)
        .setIn([action.loginId, "siteDetails", "roofTopinfo"], fromJS(action.roofTopInfo))

    case actions.FETCH_ROOFTOP_FAILURE:
      return state
        .setIn([action.loginId, "siteDetails", "roofTopLoading"], false)
        .setIn([action.loginId, "sitedata", "errors"], fromJS(action.errors))
    case actions.FETCH_HOLIDAYEVENTS_REQUEST:
      return state
        .setIn(["siteDetails", "holidayEventsLoading"], true)

    case actions.FETCH_HOLIDAYEVENTS_SUCCESS:
      return state
        .setIn(["siteDetails", "holidayEventsLoading"], false)
        .setIn(["siteDetails", "holidayEvents"], fromJS(action.holidayEvents))

    case actions.FETCH_HOLIDAYEVENTS_FAILURE:
      return state
        .setIn(["siteDetails", "holidayEventsLoading"], false)
        .setIn(["siteDetails", "errors"], fromJS(action.errors))


    case actions.FETCH_OFFHOURS_REQUEST:
      return state
        .setIn(["siteDetails", "offhoursLoading"], true)

    case actions.FETCH_OFFHOURS_SUCCESS:
      return state
        .setIn(["siteDetails", "offhoursLoading"], false)
        .setIn(["siteDetails", "offhours"], fromJS(action.offhours))

    case actions.FETCH_OFFHOURS_FAILURE:
      return state
        .setIn(["siteDetails", "offhoursLoading"], false)
        .setIn(["siteDetails", "errors"], fromJS(action.errors))
    case actions.FETCH_SITE_SECTORS_REQUEST:
      return state
        .setIn([action.unid, "siteSectors", "nodes"], fromJS([]))
        .setIn([action.unid, "siteSectors", "sectorsLoading"], true)
        .setIn([action.unid, "siteSectors", "errors"], fromJS({}))

    case actions.FETCH_SITE_SECTORS_SUCCESS:
     
      return state
        .setIn([action.unid, "siteSectors", "sectorsLoading"], false)
        .setIn([action.unid, "siteSectors", "nodes"], fromJS(action.nodes))

    case actions.FETCH_SITE_SECTORS_FAILURE:
      return state
        .setIn([action.unid, "siteSectors", "sectorsLoading"], false)
        .setIn([action.unid, "siteSectors", "errors"], fromJS(action))

    case actions.FETCH_SPEC_HISTORY_REQUEST:
      return state
        .setIn([action.unid, "specHistory", "specLoading"], true)
        // .setIn([action.unid, "specHistory", "spectrum_requests"], fromJS([]))
        .setIn([action.unid, "specHistory", "errors"], fromJS({}))

    case actions.FETCH_SPEC_HISTORY_SUCCESS:
      return state
        .setIn([action.unid, "specHistory", "specLoading"], false)
        .setIn([action.unid, "specHistory", "spectrum_requests"], fromJS(action.spectrum_requests))

    case actions.FETCH_SPEC_HISTORY_FAILURE:
      return state
        .setIn([action.unid, "specHistory", "specLoading"], false)
        .setIn([action.unid, "specHistory", "errors"], fromJS(action))

    case actions.CREATE_SPECTRUM_REQUEST:
      return state
        .setIn(["specResult", "specCreateLoading"], true)
        .setIn(["specResult","createSpectrumAnalyzer"], fromJS({}))
        .setIn(["specResult", "errors"], fromJS({}))

    case actions.CREATE_SPECTRUM_SUCCESS:
      return state
        .setIn(["specResult", "specCreateLoading"], false)
        .setIn(["specResult","createSpectrumAnalyzer"], fromJS(action.createSpectrumAnalyzer))

    case actions.CREATE_SPECTRUM_FAILURE:
      return state
        .setIn(["specResult", "specCreateLoading"], false)
        .setIn(["specResult", "errors"], fromJS(action.errors))

    case actions.VIEW_SPECTRUM_REQUEST:
      return state
        .setIn(["siteSectors", "specViewLoading"], true)

    case actions.VIEW_SPECTRUM_SUCCESS:
      return state
        .setIn(["siteSectors", "specViewLoading"], false)
        .setIn(["siteSectors", "spectrum_result"], fromJS(action.spectrum_result))

    case actions.VIEW_SPECTRUM_FAILURE:
      return state
        .setIn(["siteSectors", "specViewLoading"], false)
        .setIn(["siteSectors","view", "errors"], fromJS(action))

    case actions.DOWNLOAD_SPECTRUM_REQUEST:
      return state
        .setIn(["siteSectors", "specdownloadLoading"], true)

    case actions.DOWNLOAD_SPECTRUM_SUCCESS:
      return state
        .setIn(["siteSectors", "specdownloadLoading"], false)
        .setIn(["siteSectors", "download"], fromJS(action.download))

    case actions.DOWNLOAD_SPECTRUM_FAILURE:
      return state
        .setIn(["siteSectors", "specdownloadLoading"], false)
        .setIn(["siteSectors","downloadSpec", "errors"], fromJS(action))
    case actions.GET_RET_SCAN_REQUEST:
      return state
        .setIn(["retScan",action.oswId, "retScanLoading"], true)

    case actions.GET_RET_SCAN_SUCCESS:
      return state
        .setIn(["retScan",action.oswId, "retScanLoading"], false)
        .setIn(["retScan", action.oswId,"result"], fromJS(action.result))

    case actions.GET_RET_SCAN_FAILURE:
      return state
        .setIn(["retScan",action.oswId, "retScanLoading"], false)
        .setIn(["retScan",action.oswId, "errors"], fromJS(action))
    
    case actions.GET_AP_RADIO_INFO_REQUEST:
      return state
        .setIn(["apRadio",action.fuzeSiteId, "apRadioLoading"], true)

    case actions.GET_AP_RADIO_INFO_SUCCESS:
      return state
        .setIn(["apRadio",action.fuzeSiteId, "apRadioLoading"], false)
        .setIn(["apRadio", action.fuzeSiteId,"apRadioInfo"], action.apRadioInfo)

    case actions.GET_AP_RADIO_INFO_FAILURE:
      return state
        .setIn(["apRadio",action.fuzeSiteId, "apRadioLoading"], false)
        .setIn(["apRadio",action.fuzeSiteId, "apRadioInfo"], action.apRadioInfo)

    case actions.GET_OSW_ISSUE_TYPES_REQUEST:
      return state
        .setIn(["oswIssueTypes", "loading"], true)

    case actions.GET_OSW_ISSUE_TYPES_SUCCESS:
      return state
        .setIn(["oswIssueTypes", "loading"], false)
        .setIn(["oswIssueTypes", "issueTypes"], action.issueTypes)

    case actions.GET_OSW_ISSUE_TYPES_FAILURE:
      return state
        .setIn(["oswIssueTypes", "loading"], false)
        .setIn(["oswIssueTypes", "issueTypes"], action.issueTypes)

    case actions.GET_METRO_ROOT_SCHEDULES_REQUEST:
      return state
        .setIn(["metroRootSchedules", "loading"], true)

    case actions.GET_METRO_ROOT_SCHEDULES_SUCCESS:
      return state
        .setIn(["metroRootSchedules", "loading"], false)
        .setIn(["metroRootSchedules", "schedules"], fromJS(action.schedules))

    case actions.GET_METRO_ROOT_SCHEDULES_FAILURE:
      return state
        .setIn(["metroRootSchedules", "loading"], false)
        .setIn(["metroRootSchedules", "schedules"], fromJS(action.schedules))
        
    default:
      return state
  }

}
export default Sites
