import ajax from '../ajax'
import {createAction} from '../redux_utils'
import * as schema from './schema'


export const FETCH_TMPLTDATA_REQUEST = 'FETCH_TMPLTDATA_REQUEST'
export const FETCH_TMPLTDATA_SUCCESS = 'FETCH_TMPLTDATA_SUCCESS'
export const FETCH_TMPLTDATA_FAILURE = 'FETCH_TMPLTDATA_FAILURE'

export const FETCH_CRNTSYS_REQUEST = 'FETCH_CRNTSYS_REQUEST'
export const FETCH_CRNTSYS_SUCCESS = 'FETCH_CRNTSYS_SUCCESS'
export const FETCH_CRNTSYS_FAILURE = 'FETCH_CRNTSYS_FAILURE'

export const FETCH_PMSEARCHSITES_REQUEST = 'FETCH_PMSEARCHSITES_REQUEST'
export const FETCH_PMSEARCHSITES_SUCCESS = 'FETCH_PMSEARCHSITES_SUCCESS'
export const FETCH_PMSEARCHSITES_FAILURE = 'FETCH_PMSEARCHSITES_FAILURE'


export const FETCH_BUYERLISTDETAILS_REQUEST = 'FETCH_BUYERLISTDETAILS_REQUEST'
export const FETCH_BUYERLISTDETAILS_SUCCESS = 'FETCH_BUYERLISTDETAILS_SUCCESS'
export const FETCH_BUYERLISTDETAILS_FAILURE = 'FETCH_BUYERLISTDETAILS_FAILURE'


export const FETCH_EXPENSEPROJIDDATA_REQUEST = 'FETCH_EXPENSEPROJIDDATA_REQUEST'
export const FETCH_EXPENSEPROJIDDATA_SUCCESS = 'FETCH_EXPENSEPROJIDDATA_SUCCESS'
export const FETCH_EXPENSEPROJIDDATA_FAILURE = 'FETCH_EXPENSEPROJIDDATA_FAILURE'


export const FETCH_SITELISTDETAILS_REQUEST = 'FETCH_SITELISTDETAILS_REQUEST'
export const FETCH_SITELISTDETAILS_SUCCESS = 'FETCH_SITELISTDETAILS_SUCCESS'
export const FETCH_SITELISTDETAILS_FAILURE = 'FETCH_SITELISTDETAILS_FAILURE'

export const FETCH_PMLISTDETAILS_REQUEST = 'FETCH_PMLISTDETAILS_REQUEST'
export const FETCH_PMLISTDETAILS_SUCCESS = 'FETCH_PMLISTDETAILS_SUCCESS'
export const FETCH_PMLISTDETAILS_FAILURE = 'FETCH_PMLISTDETAILS_FAILURE'

export const FETCH_SYNCEDSITESINFO_REQUEST = 'FETCH_SYNCEDSITESINFO_REQUEST'
export const FETCH_SYNCEDSITESINFO_SUCCESS = 'FETCH_SYNCEDSITESINFO_SUCCESS'
export const FETCH_SYNCEDSITESINFO_FAILURE = 'FETCH_SYNCEDSITESINFO_FAILURE'

export const FETCH_PMGRIDDETAILS_REQUEST = 'FETCH_PMGRIDDETAILS_REQUEST'
export const FETCH_PMGRIDDETAILS_SUCCESS = 'FETCH_PMGRIDDETAILS_SUCCESS'
export const FETCH_PMGRIDDETAILS_FAILURE = 'FETCH_PMGRIDDETAILS_FAILURE'

export const FETCH_PMLISTDETAILSBYVENDORID_REQUEST = 'FETCH_PMLISTDETAILSBYVENDORID_REQUEST'
export const FETCH_PMLISTDETAILSBYVENDORID_SUCCESS = 'FETCH_PMLISTDETAILSBYVENDORID_SUCCESS'
export const FETCH_PMLISTDETAILSBYVENDORID_FAILURE = 'FETCH_PMLISTDETAILSBYVENDORID_FAILURE'

export const FETCH_PMGRIDDETAILSDRAFT_REQUEST = 'FETCH_PMGRIDDETAILSDRAFT_REQUEST'
export const FETCH_PMGRIDDETAILSDRAFT_SUCCESS = 'FETCH_PMGRIDDETAILSDRAFT_SUCCESS'
export const FETCH_PMGRIDDETAILSDRAFT_FAILURE = 'FETCH_PMGRIDDETAILSDRAFT_FAILURE'



export const FETCH_PMGRIDDETAILS_SUCCESS_MULTIPLE = 'FETCH_PMGRIDDETAILS_SUCCESS_MULTIPLE'
export const FETCH_PMGRIDDETAILS_FAILURE_MULTIPLE = 'FETCH_PMGRIDDETAILS_FAILURE_MULTIPLE'

export const FETCH_PMGRIDDETAILSDRAFT_SUCCESS_MULTIPLE = 'FETCH_PMGRIDDETAILSDRAFT_SUCCESS_MULTIPLE'
export const FETCH_PMGRIDDETAILSDRAFT_FAILURE_MULTIPLE = 'FETCH_PMGRIDDETAILSDRAFT_FAILURE_MULTIPLE'



export const FETCH_PMMODELATT_DETAILS_REQUEST = 'FETCH_PMMODELATT_DETAILS_REQUEST'
export const FETCH_PMMODELATT_DETAILS_SUCCESS = 'FETCH_PMMODELATT_DETAILS_SUCCESS'
export const FETCH_PMMODELATT_DETAILS_FAILURE = 'FETCH_PMMODELATT_DETAILS_FAILURE'

export const FETCH_HVACPMMODELATT_DETAILS_REQUEST = 'FETCH_HVACPMMODELATT_DETAILS_REQUEST'
export const FETCH_HVACPMMODELATT_DETAILS_SUCCESS = 'FETCH_HVACPMMODELATT_DETAILS_SUCCESS'
export const FETCH_HVACPMMODELATT_DETAILS_FAILURE = 'FETCH_HVACPMMODELATT_DETAILS_FAILURE'



export const SET_PM_FILTERS = 'SET_PM_FILTERS'
export const SET_VIDEO_SEL = 'SET_VIDEO_SEL'

export const STORE_TEMPLATE_DATA = 'STORE_TEMPLATE_DATA'
export const ADD_ATTCH_TO_LISTITEM = 'ADD_ATTCH_TO_LISTITEM'

export const REMOVE_ATTCH_FROM_LISTITEM = 'REMOVE_ATTCH_FROM_LISTITEM'

export const ADD_SELECTSTATUS_TO_LISTITEM = 'ADD_SELECTSTATUS_TO_LISTITEM'

export const ADD_SELECTSTATUS_TO_LIST = 'ADD_SELECTSTATUS_TO_LIST'

export const TOGGLE_EXPSTATUS_TO_LIST = 'TOGGLE_EXPSTATUS_TO_LIST'

export const SELECT_ALL_TO_LIST = 'SELECT_ALL_TO_LIST'


export const ADD_SELECTSTATUS_TO_ALL_LIST = 'ADD_SELECTSTATUS_TO_ALL_LIST'



export const MODIFY_COMPATT_DETAILS = 'MODIFY_COMPATT_DETAILS'

export const FILTER_SEARCHED_SITES = 'FILTER_SEARCHED_SITES'











// Fetch Generator Fuel tank Details by site UNID
export const FETCH_GENTANKDETAILS_REQUEST = 'FETCH_GENTANKDETAILS_REQUEST'
export const FETCH_GENTANKDETAILS_SUCCESS = 'FETCH_GENTANKDETAILS_SUCCESS'
export const FETCH_GENTANKDETAILS_FAILURE = 'FETCH_GENTANKDETAILS_FAILURE'

export const FETCH_HVACDETAILS_REQUEST = 'FETCH_HVACDETAILS_REQUEST'
export const FETCH_HVACDETAILS_SUCCESS = 'FETCH_HVACDETAILS_SUCCESS'
export const FETCH_HVACDETAILS_FAILURE = 'FETCH_HVACDETAILS_FAILURE'

export const FETCH_FILE_DETAILS_REQUEST = 'FETCH_FILE_DETAILS_REQUEST'
export const FETCH_FILE_DETAILS_SUCCESS = 'FETCH_FILE_DETAILS_SUCCESS'
export const FETCH_FILE_DETAILS_FAILURE = 'FETCH_FILE_DETAILS_FAILURE'


export const FETCH_ACTIVESITES_REQUEST = 'FETCH_ACTIVESITES_REQUEST'
export const FETCH_ACTIVESITES_SUCCESS = 'FETCH_ACTIVESITES_SUCCESS'
export const FETCH_ACTIVESITES_FAILURE = 'FETCH_ACTIVESITES_FAILURE'

export const FETCH_CREATELIST_REQUEST = 'FETCH_CREATELIST_REQUEST'
export const FETCH_CREATELIST_SUCCESS = 'FETCH_CREATELIST_SUCCESS'
export const FETCH_CREATELIST_FAILURE = 'FETCH_CREATELIST_FAILURE'

export const FETCH_PNDGSITES_REQUEST = 'FETCH_PNDGSITES_REQUEST'
export const FETCH_PNDGSITES_SUCCESS = 'FETCH_PNDGSITES_SUCCESS'
export const FETCH_PNDGSITES_FAILURE = 'FETCH_PNDGSITES_FAILURE'

export const HVACINFO_REQUEST = 'HVACINFO_REQUEST'
export const HVACINFO_SUCCESS = 'HVACINFO_SUCCESS'
export const HVACINFO_FAILURE = 'HVACINFO_FAILURE'


export const fetchGenTankDetailsRequest = createAction(FETCH_GENTANKDETAILS_REQUEST, 'vendorId', 'loginId', 'pmlistitemid')
export const fetchGenTankDetailsSuccess = createAction(FETCH_GENTANKDETAILS_SUCCESS, 'vendorId', 'loginId', 'pmlistitemid', 'genTank')
export const fetchGenTankDetailsFailure = createAction(FETCH_GENTANKDETAILS_FAILURE, 'vendorId', 'loginId', 'pmlistitemid', 'errorMessage')

export const fetchHvacDetailsRequest = createAction(FETCH_HVACDETAILS_REQUEST, 'vendorId', 'loginId', 'pmlistitemid')
export const fetchHvacDetailsSuccess = createAction(FETCH_HVACDETAILS_SUCCESS, 'vendorId', 'loginId', 'pmlistitemid', 'hvacs')
export const fetchHvacDetailsFailure = createAction(FETCH_HVACDETAILS_FAILURE, 'vendorId', 'loginId', 'pmlistitemid', 'errorMessage')


export const fetchTemplateDataRequest = createAction(FETCH_TMPLTDATA_REQUEST, 'vendorId', 'loginId', 'pmListId')
export const fetchTemplateDataSuccess = createAction(FETCH_TMPLTDATA_SUCCESS, 'vendorId', 'loginId', 'pmListId', 'fileData')
export const fetchTemplateDataFailure = createAction(FETCH_TMPLTDATA_FAILURE, 'vendorId', 'loginId', 'pmListId', 'errorfileData')

export const fetchCurrentSystemRecordsRequest = createAction(FETCH_CRNTSYS_REQUEST, 'vendorId', 'loginId', 'pmListId')
export const fetchCurrentSystemRecordsSuccess = createAction(FETCH_CRNTSYS_SUCCESS, 'vendorId', 'loginId', 'pmListId', 'readings')
export const fetchCurrentSystemRecordsFailure = createAction(FETCH_CRNTSYS_FAILURE, 'vendorId', 'loginId', 'pmListId', 'errorReadings')


export const fetchActiveSitesRequest = createAction(FETCH_ACTIVESITES_REQUEST, 'vendorId', 'loginId')
export const fetchActiveSitesSuccess = createAction(FETCH_ACTIVESITES_SUCCESS, 'vendorId', 'loginId', 'ActiveSitesResults')
export const fetchActiveSitesFailure = createAction(FETCH_ACTIVESITES_FAILURE, 'vendorId', 'loginId', 'errorsActiveSites')

export const fetchCreateListSitesRequest = createAction(FETCH_CREATELIST_REQUEST, 'vendorId', 'loginId', 'requestedYear')
export const fetchCreateListSitesSuccess = createAction(FETCH_CREATELIST_SUCCESS, 'vendorId', 'loginId', 'CreateListSitesResults')
export const fetchCreateListSitesFailure = createAction(FETCH_CREATELIST_FAILURE, 'vendorId', 'loginId', 'errorsCreateListSites')

export const fetchSearchedSitesRequest = createAction(FETCH_PMSEARCHSITES_REQUEST, 'vendorId', 'loginId')
export const fetchSearchedSitesSuccess = createAction(FETCH_PMSEARCHSITES_SUCCESS, 'vendorId', 'loginId', 'searchResults')
export const fetchSearchedSitesFailure = createAction(FETCH_PMSEARCHSITES_FAILURE, 'vendorId', 'loginId', 'errorsPmResults')

export const fetchPmListDetailsRequest = createAction(FETCH_PMLISTDETAILS_REQUEST, 'vendorId', 'loginId')
export const fetchPmListDetailsSuccess = createAction(FETCH_PMLISTDETAILS_SUCCESS, 'vendorId', 'loginId', 'pmListDetails')
export const fetchPmListDetailsFailure = createAction(FETCH_PMLISTDETAILS_FAILURE, 'vendorId', 'loginId', 'errorsPmList')

export const fetchSyncedSitesInfoRequest = createAction(FETCH_SYNCEDSITESINFO_REQUEST, 'vendorId', 'loginId')
export const fetchSyncedSitesInfoSuccess = createAction(FETCH_SYNCEDSITESINFO_SUCCESS, 'vendorId', 'loginId', 'syncedSitesInfo')
export const fetchSyncedSitesInfoFailure = createAction(FETCH_SYNCEDSITESINFO_FAILURE, 'vendorId', 'loginId', 'errorsSyncedSites')

export const fetchBuyerListtDetailsRequest = createAction(FETCH_BUYERLISTDETAILS_REQUEST, 'vendorId', 'loginId')
export const fetchBuyerListtDetailsSuccess = createAction(FETCH_BUYERLISTDETAILS_SUCCESS, 'vendorId', 'loginId', 'buyerListDetails')
export const fetchBuyerListtDetailsFailure = createAction(FETCH_BUYERLISTDETAILS_FAILURE, 'vendorId', 'loginId', 'errorsBuyerList')


export const fetchExpenseProjIdDataRequest = createAction(FETCH_EXPENSEPROJIDDATA_REQUEST, 'vendorId', 'loginId')
export const fetchExpenseProjIdDataSuccess = createAction(FETCH_EXPENSEPROJIDDATA_SUCCESS, 'vendorId', 'loginId', 'expenseProjId')
export const fetchExpenseProjIdDataFailure = createAction(FETCH_EXPENSEPROJIDDATA_FAILURE, 'vendorId', 'loginId', 'errorsExpenseProjId')


export const fetchSiteListtDetailsRequest = createAction(FETCH_SITELISTDETAILS_REQUEST, 'vendorId', 'loginId')
export const fetchSiteListtDetailsSuccess = createAction(FETCH_SITELISTDETAILS_SUCCESS, 'vendorId', 'loginId', 'siteListDetails')
export const fetchSiteListtDetailsFailure = createAction(FETCH_SITELISTDETAILS_FAILURE, 'vendorId', 'loginId', 'errorsSiteList')

export const fetchPendingSitesForUpdateRequest = createAction(FETCH_PNDGSITES_REQUEST, 'vendorId', 'loginId', 'pmListIds')
export const fetchPendingSitesForUpdateSuccess = createAction(FETCH_PNDGSITES_SUCCESS, 'vendorId', 'loginId', 'pmListIds', 'PendingSitesForUpdate')
export const fetchPendingSitesForUpdateFailure = createAction(FETCH_PNDGSITES_FAILURE, 'vendorId', 'loginId', 'pmListIds', 'errorsPendingSitesForUpdate')


export const fetchPmGridDetailsRequest = createAction(FETCH_PMGRIDDETAILS_REQUEST, 'vendorId', 'loginId')
export const fetchPmGridDetailsSuccess = createAction(FETCH_PMGRIDDETAILS_SUCCESS, 'vendorId', 'loginId', 'pmGridDetails')
export const fetchPmGridDetailsFailure = createAction(FETCH_PMGRIDDETAILS_FAILURE, 'vendorId', 'loginId', 'errorsPmGrid')

export const fetchPmListDetailsByVendorIdRequest = createAction(FETCH_PMLISTDETAILSBYVENDORID_REQUEST, 'vendorId', 'year')
export const fetchPmListDetailsByVendorIdSuccess = createAction(FETCH_PMLISTDETAILSBYVENDORID_SUCCESS, 'vendorId', 'year', 'pmListDetailsByVendorId')
export const fetchPmListDetailsByVendorIdFailure = createAction(FETCH_PMLISTDETAILSBYVENDORID_FAILURE, 'vendorId', 'year', 'errorsPmListDetailsByVendorId')


export const fetchDraftGridDetailsRequest = createAction(FETCH_PMGRIDDETAILSDRAFT_REQUEST, 'vendorId', 'loginId')
export const fetchDraftGridDetailsSuccess = createAction(FETCH_PMGRIDDETAILSDRAFT_SUCCESS, 'vendorId', 'loginId', 'pmGridDetailsDraft')
export const fetchDraftGridDetailsFailure = createAction(FETCH_PMGRIDDETAILSDRAFT_FAILURE, 'vendorId', 'loginId', 'errorsPmGridDraft')

export const hvacInfoToOpsRequest = createAction(HVACINFO_REQUEST, 'id')
export const hvacInfoToOpsSuccess = createAction(HVACINFO_SUCCESS, 'id', 'hvacInfoToOps')
export const hvacInfoToOpsFailure = createAction(HVACINFO_FAILURE, 'id', 'errors')

export const fetchPmGridDetailsSuccessMultiple = createAction(FETCH_PMGRIDDETAILS_SUCCESS_MULTIPLE, 'vendorId', 'loginId', 'pmGridDetailsMultiple')
export const fetchPmGridDetailsFailureMultiple = createAction(FETCH_PMGRIDDETAILS_FAILURE_MULTIPLE, 'vendorId', 'loginId', 'errorsPmGridMultiple')

export const fetchDraftGridDetailsSuccessMultiple = createAction(FETCH_PMGRIDDETAILSDRAFT_SUCCESS_MULTIPLE, 'vendorId', 'loginId', 'pmGridDetailsDraftMultiple')
export const fetchDraftGridDetailsFailureMultiple = createAction(FETCH_PMGRIDDETAILSDRAFT_FAILURE_MULTIPLE, 'vendorId', 'loginId', 'errorsPmGridDraftMultiple')



export const fetchFileDataRequest = createAction(FETCH_FILE_DETAILS_REQUEST, 'vendorId', 'loginId', 'pmListId')
export const fetchFileDataSuccess = createAction(FETCH_FILE_DETAILS_SUCCESS, 'vendorId', 'loginId', 'fileDetails')
export const fetchFileDataFailure = createAction(FETCH_FILE_DETAILS_FAILURE, 'vendorId', 'loginId', 'errorsFilesdetails')

export const fetchPmModelAttributeDetailsRequest = createAction(FETCH_PMMODELATT_DETAILS_REQUEST, 'vendorId', 'loginId')
export const fetchPmModelAttributeDetailsSuccess = createAction(FETCH_PMMODELATT_DETAILS_SUCCESS, 'vendorId', 'loginId', 'pmModelAttDetails')
export const fetchPmModelAttributeDetailsFailure = createAction(FETCH_PMMODELATT_DETAILS_FAILURE, 'vendorId', 'loginId', 'errorsPmModelAtt')

export const fetchPmHVACModelAttributeDetailsRequest = createAction(FETCH_HVACPMMODELATT_DETAILS_REQUEST, 'vendorId', 'loginId')
export const fetchPmHVACModelAttributeDetailsSuccess = createAction(FETCH_HVACPMMODELATT_DETAILS_SUCCESS, 'vendorId', 'loginId', 'pmType', 'HVACPMDetails')
export const fetchPmHVACModelAttributeDetailsFailure = createAction(FETCH_HVACPMMODELATT_DETAILS_FAILURE, 'vendorId', 'loginId', 'pmType', 'errorsHVACPM')

export const SUBMIT_PM_QUOTE_SUCCESS = 'SUBMIT_PM_QUOTE_SUCCESS'
export const SUBMIT_PM_QUOTE_ERROR = 'SUBMIT_PM_QUOTE_ERROR'

export const CREATE_PM_LIST_REQUEST = 'CREATE_PM_LIST_REQUEST'
export const CREATE_PM_LIST_SUCCESS = 'CREATE_PM_LIST_SUCCESS'
export const CREATE_PM_LIST_ERROR = 'CREATE_PM_LIST_ERROR'

export const UPLOAD_FILES_SUCCESS_BULKPO = 'UPLOAD_FILES_SUCCESS_BULKPO'
export const UPLOAD_FILES_ERROR_BULKPO = 'UPLOAD_FILES_ERROR_BULKPO'

export const UPLOAD_FILES_SUCCESS = 'UPLOAD_FILES_SUCCESS'
export const UPLOAD_FILES_ERROR = 'UPLOAD_FILES_ERROR'

export const FETCH_CMPLTDATTDET_REQUEST = 'FETCH_CMPLTDATTDET_REQUEST'
export const FETCH_CMPLTDATTDET_SUCCESS = 'FETCH_CMPLTDATTDET_SUCCESS'
export const FETCH_CMPLTDATTDET_FAILURE = 'FETCH_CMPLTDATTDET_FAILURE'

export const GENERATE_DATA_REQUEST = 'GENERATE_DATA_REQUEST'
export const GENERATE_DATA_SUCCESS = 'GENERATE_DATA_SUCCESS'
export const GENERATE_DATA_FAILURE = 'GENERATE_DATA_FAILURE'

export const generateDataRequest = createAction(GENERATE_DATA_REQUEST)
export const generateDataSuccess = createAction(GENERATE_DATA_SUCCESS, 'data')
export const generateDataFailure = createAction(GENERATE_DATA_FAILURE, 'errors')

export function generatePDFData () {
  return dispatch => {
    dispatch(generateDataRequest())
    return ajax.post(`/graphql4g`, {query: schema.generatePDFData})
      .then(res => {
        if(!!res && !!res.data && !!res.data.data && !!res.data.data.generatePDFData)
        return dispatch(generateDataSuccess(res.data.data.generatePDFData))
      })
      .catch(errors => dispatch(generateDataFailure(errors)))
  }
}


export const submitPMQuoteSuccess = createAction(SUBMIT_PM_QUOTE_SUCCESS, 'vendorId', 'loginId', 'pmlistitemid', 'PmdetailsSubmissionStatus')
export const submitPMQuoteError = createAction(SUBMIT_PM_QUOTE_ERROR, 'vendorId', 'loginId', 'pmlistitemid', 'PmDetailsSubmissionerrorMessage')

export const createPmListRequest = createAction(CREATE_PM_LIST_REQUEST, 'vendorId', 'loginId', 'refName', 'feGrouped')
export const createPMListSuccess = createAction(CREATE_PM_LIST_SUCCESS, 'vendorId', 'loginId', 'pmrefname', 'feGrouped', 'createPMListSubmissionStatus')
export const createPMListError = createAction(CREATE_PM_LIST_ERROR, 'vendorId', 'loginId', 'pmrefname', 'feGrouped', 'createPMListSubmissionerrorMessage')

export const uploadFilesSuccess = createAction(UPLOAD_FILES_SUCCESS, 'vendorId', 'loginId', 'pmlistitemid', 'uploadFilesSubmissionStatus')
export const uploadFilesError = createAction(UPLOAD_FILES_ERROR, 'vendorId', 'loginId', 'pmlistitemid', 'uploadFilesSubmissionerrorMessage')

export const uploadFilesSuccessBulkPO = createAction(UPLOAD_FILES_SUCCESS_BULKPO, 'vendorId', 'loginId', 'pmrefname', 'uploadFilesSubmissionStatus')
export const uploadFilesErrorBulkPO = createAction(UPLOAD_FILES_ERROR_BULKPO, 'vendorId', 'loginId', 'pmrefname', 'uploadFilesSubmissionerrorMessage')


export const fetchCompletedAttDetailsRequest = createAction(FETCH_CMPLTDATTDET_REQUEST, 'vendorId', 'loginId', 'pmlistitemid')
export const fetchCompletedAttDetailsSuccess = createAction(FETCH_CMPLTDATTDET_SUCCESS, 'vendorId', 'loginId', 'pmlistitemid', 'pmCompAttDetails')
export const fetchCompletedAttDetailsFailure = createAction(FETCH_CMPLTDATTDET_FAILURE, 'vendorId', 'loginId', 'pmlistitemid', 'errorsPmCompAttDetails')

export const setPmFiltersRequest = createAction(SET_PM_FILTERS, 'vendorId', 'loginId', 'pmFilters')

export const setVideoSelectionRequest = createAction(SET_VIDEO_SEL, 'vendorId', 'loginId', 'uniqId')

export const storeTemplateDataRequest = createAction(STORE_TEMPLATE_DATA, 'vendorId', 'loginId', 'pmListId', 'PmlistItems')
export const addAttachmentsToListItemRequest = createAction(ADD_ATTCH_TO_LISTITEM, 'vendorId', 'loginId', 'pmListId', 'locationId', 'attachment')

export const removeAttachmentFromListItemRequest = createAction(REMOVE_ATTCH_FROM_LISTITEM, 'vendorId', 'loginId', 'pmListId', 'locationId', 'index')

export const addSelectionStatusToTemplateDataRequest = createAction(ADD_SELECTSTATUS_TO_LISTITEM, 'vendorId', 'loginId', 'pmListId', 'selectedItemLocationId', 'selectedItem')

export const addDefaultStatusToAllpmListsRequest = createAction(ADD_SELECTSTATUS_TO_ALL_LIST, 'vendorId', 'loginId', 'selectionStatus', 'expansionStatus')
export const addSelectionStatusTopmListRequest = createAction(ADD_SELECTSTATUS_TO_LIST, 'vendorId', 'loginId', 'pmListId', 'selectedItem')
export const toggleExpStatusToPmlistRequest = createAction(TOGGLE_EXPSTATUS_TO_LIST, 'vendorId', 'loginId', 'pmListId')

export const selectAllToPmListRequest = createAction(SELECT_ALL_TO_LIST, 'vendorId', 'loginId', 'visiblePmLists', 'selectAllChecked')




export const modifyCompAttDetailsRequest = createAction(MODIFY_COMPATT_DETAILS, 'vendorId', 'loginId', 'pmlistitemid', 'modfdList')

export const filterSearchedSitesRequest = createAction(FILTER_SEARCHED_SITES, 'vendorId', 'loginId', 'searchString')

export function setPmFilters (vendorId, loginId, pmFilters) {


  return async dispatch => {

    let dispatchedItem = await dispatch(setPmFiltersRequest(vendorId, loginId, pmFilters))
    return dispatchedItem
  }
}
export function setVideoSelection (vendorId, loginId, uniqId) {


  return async dispatch => {

    let dispatchedItem = await dispatch(setVideoSelectionRequest(vendorId, loginId, uniqId))
    return dispatchedItem
  }
}


export function storeTemplateData (vendorId, loginId, pmListId, PmlistItems) {


  return async dispatch => {

    let dispatchedItem = await dispatch(storeTemplateDataRequest(vendorId, loginId, pmListId, PmlistItems))
    return dispatchedItem
  }
}

export function addAttachmentsToListItem (vendorId, loginId, pmListId, locationId, attachment) {


  return async dispatch => {

    let dispatchedItem = await dispatch(addAttachmentsToListItemRequest(vendorId, loginId, pmListId, locationId, attachment))
    return dispatchedItem
  }
}

export function removeAttachmentFromListItem (vendorId, loginId, pmListId, locationId, index) {


  return async dispatch => {

    let dispatchedItem = await dispatch(removeAttachmentFromListItemRequest(vendorId, loginId, pmListId, locationId, index))
    return dispatchedItem
  }
}

export function addSelectionStatusToTemplateData (vendorId, loginId, pmListId, selectedItemLocationId, selectedItem) {


  return async dispatch => {

    let dispatchedItem = await dispatch(addSelectionStatusToTemplateDataRequest(vendorId, loginId, pmListId, selectedItemLocationId, selectedItem))
    return dispatchedItem
  }
}

export function modifyCompAttDetails (loginId, vendorId, pmListItemId, modfdList) {


  return async dispatch => {

    let dispatchedItem = await dispatch(modifyCompAttDetailsRequest(vendorId, loginId, pmListItemId, modfdList))
    return dispatchedItem
  }
}

export function filterSearchedSites (vendorId, loginId, searchString) {


  return async dispatch => {

    let dispatchedItem = await dispatch(filterSearchedSitesRequest(vendorId, loginId, searchString))
    return dispatchedItem
  }
}


export function fetchTemplateData (vendorId, loginId, pmType, pmListId, postRequest) {
  let postRequestGen = postRequest

  let variables = pmType ==='HVAC PM' ? {postRequest} : pmType === 'GENERATOR PM' ? {postRequestGen} : {}

  return dispatch => {
    dispatch(fetchTemplateDataRequest(vendorId, loginId, pmListId))
    const fetchSchema = pmType === 'GENERATOR PM' ? {query: schema.fetchTemplateDataGen, variables: variables} : pmType === 'HVAC PM' ? {query: schema.fetchTemplateData, variables: variables} : {}

    return ajax.post(`/graphql4g`, fetchSchema)



      .then(res => {

        if (pmType === 'HVAC PM') {
          if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
            return dispatch(fetchTemplateDataFailure(vendorId, loginId, pmListId, res.data.errors))
          } else if (!!res.data && !!res.data.data && !!res.data.data.getTemplateData && !!res.data.data.getTemplateData) {
            return dispatch(fetchTemplateDataSuccess(vendorId, loginId, pmListId, res.data.data.getTemplateData))
          }
        } else if (pmType === 'GENERATOR PM') {
          if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
            return dispatch(fetchTemplateDataFailure(vendorId, loginId, pmListId, res.data.errors))
          } else if (!!res.data && !!res.data.data && !!res.data.data.getTemplateDataGen && !!res.data.data.getTemplateDataGen) {
            return dispatch(fetchTemplateDataSuccess(vendorId, loginId, pmListId, res.data.data.getTemplateDataGen))
          }
        }
      }

      )
      .catch(errors => dispatch(fetchTemplateDataFailure(vendorId, loginId, pmListId, errors)))
  }
}

export function fetchCurrentSystemRecords (vendorId, loginId, unids, pmType, pmListId) {
  let variables = {unids, pmType}
  var fetchSchema = pmType === 'GENERATOR' ? {query: schema.fetchCurrentSystemRecordsGen, variables: variables} : pmType === 'HVAC' ? {query: schema.fetchCurrentSystemRecords, variables: variables} : {}

  return dispatch => {
    dispatch(fetchCurrentSystemRecordsRequest(vendorId, loginId, pmListId))
    return ajax.post(`/graphql4g`, fetchSchema)

      .then(res => {
        if (pmType === 'HVAC') {
          if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
            return dispatch(fetchCurrentSystemRecordsFailure(vendorId, loginId, pmListId, res.data.errors))
          } else if (!!res.data && !!res.data.data && !!res.data.data.getCurrentSystemRecords && !!res.data.data.getCurrentSystemRecords.filteredList) {
            return dispatch(fetchCurrentSystemRecordsSuccess(vendorId, loginId, pmListId, res.data.data.getCurrentSystemRecords.filteredList))
          }
        } else if (pmType === 'GENERATOR') {
          if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
            return dispatch(fetchCurrentSystemRecordsFailure(vendorId, loginId, pmListId, res.data.errors))
          } else if (!!res.data && !!res.data.data && !!res.data.data.getCurrentSystemRecordsGen && !!res.data.data.getCurrentSystemRecordsGen.filteredList) {
            return dispatch(fetchCurrentSystemRecordsSuccess(vendorId, loginId, pmListId, res.data.data.getCurrentSystemRecordsGen.filteredList))
          }
        }

      }

      )
      .catch(errors => dispatch(fetchCurrentSystemRecordsFailure(vendorId, loginId, pmListId, errors)))
  }
}

export function fetchActiveSites (vendorId, loginId, submarket, manager_id, poItemIds) {
  let variables = {vendorId, submarket, managerId:manager_id, poItemIds}

  return dispatch => {
    dispatch(fetchActiveSitesRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchActiveSites, variables: variables})

      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchActiveSitesFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.getActiveSites && !!res.data.data.getActiveSites.listItems) {
          return dispatch(fetchActiveSitesSuccess(vendorId, loginId, res.data.data.getActiveSites.listItems))
        }
      }

      )
      //
      .catch(errors => dispatch(fetchActiveSitesFailure(vendorId, loginId, errors)))
  }
}
export function fetchCreateListSites (vendorId, loginId, Year) {
  console.log("year in action", Year)
  let variables = {vendorId: vendorId, year:Year}

  return dispatch => {
    dispatch(fetchCreateListSitesRequest(vendorId, loginId, Year))
    return ajax.post(`/graphql4g`, {query: schema.fetchCreateListSites, variables: variables})

      .then(res => {
        console.log('resp', res)
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchCreateListSitesFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.getCreateListSites && !!res.data.data.getCreateListSites) {
          return dispatch(fetchCreateListSitesSuccess(vendorId, loginId, res.data.data.getCreateListSites))
        }
      }

      )
      .catch(errors => dispatch(fetchCreateListSitesFailure(vendorId, loginId, errors)))
  }
}
export function fetchSearchedSites (vendorId, loginId, search ='', year='2021') {
  let variables = {vendorId: vendorId, search, year}

  return dispatch => {
    dispatch(fetchSearchedSitesRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchSearchedSites, variables: variables})



      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchSearchedSitesFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.getSearchedSites && !!res.data.data.getSearchedSites.searchResults) {
          return dispatch(fetchSearchedSitesSuccess(vendorId, loginId, res.data.data.getSearchedSites.searchResults))
        }
      }

      )
      .catch(errors => dispatch(fetchSearchedSitesFailure(vendorId, loginId, errors)))
  }
}

export function fetchpPmListDetails (vendorId, loginId, year) {
  let variables = { vendorId: vendorId, pmType: 'GENERATOR,HVAC', year: year}

  return dispatch => {
    dispatch(fetchPmListDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchPmListDetails, variables: variables})

      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchPmListDetailsFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data) {
          return dispatch(fetchPmListDetailsSuccess(vendorId, loginId, res.data.data))
        }
      }

      )
      .catch(errors => dispatch(fetchPmListDetailsFailure(vendorId, loginId, errors)))
  }
}

export function fetchBuyerListDetails (vendorId, loginId, market, submarket) {
  let variables = {loginId: loginId, market: market, submarket:submarket, source:'vendorportal'}

  return dispatch => {
    dispatch(fetchBuyerListtDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchBuyerListDetails, variables: variables})

      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchBuyerListtDetailsFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data) {
          return dispatch(fetchBuyerListtDetailsSuccess(vendorId, loginId, res.data.data))
        }
      }

      )
      .catch(errors => {
        dispatch(fetchBuyerListtDetailsFailure(vendorId, loginId, errors))
      }
      )
  }
}

export function fetchSyncedSitesInfo (vendorId, loginId, submarket, managerId, pmType='') {
  console.log('pmType', pmType)
  let pmtype = (pmType && pmType.includes('GENERATOR')) ? 'generator' : (pmType.includes('HVAC')) ? 'hvac' : 'pole'
  let variables = {submarket:submarket, managerId:managerId, pmType:pmtype}
console.log('variables', variables)
  return dispatch => {
    dispatch(fetchSyncedSitesInfoRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchSyncedSitesInfo, variables: variables})

      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchSyncedSitesInfoFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data) {
          return dispatch(fetchSyncedSitesInfoSuccess(vendorId, loginId, res.data.data))
        }
      }

      )
      .catch(errors => {
        dispatch(fetchSyncedSitesInfoFailure(vendorId, loginId, errors))
      }
      )
  }
}

export function fetchExpenseProjIdData (vendorId, loginId, submarket, managerId) {
  let variables = {loginId: loginId, submarket:submarket, managerId: managerId}

  return dispatch => {
    dispatch(fetchExpenseProjIdDataRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchExpenseProjIdData, variables: variables})

      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchExpenseProjIdDataFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data) {
          return dispatch(fetchExpenseProjIdDataSuccess(vendorId, loginId, res.data.data))
        }
      }

      )
      .catch(errors => {
        dispatch(fetchExpenseProjIdDataFailure(vendorId, loginId, errors))
      }
      )
  }
}


export function fetchPendingSitesForUpdate (vendorId, loginId, pmListIds, pmType) {
  let variables = {pmListIds, pmType}

  return dispatch => {

    dispatch(fetchPendingSitesForUpdateRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchPendingItemsForUpdate, variables: variables})

      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchPendingSitesForUpdateFailure(vendorId, loginId, pmListIds, res.data.errors))
        } else if (!!res.data && !!res.data.data) {
          return dispatch(fetchPendingSitesForUpdateSuccess(vendorId, loginId, pmListIds, res.data.data))
        }
      }

      )
      .catch(errors => {

        dispatch(fetchPendingSitesForUpdateFailure(vendorId, loginId, pmListIds, errors))
      }
      )
  }
}
export function fetchSiteListDetails (vendorId, loginId, market, submarket, managerId, pmType, location) {
  let variables = {market: market, submarket:submarket, managerId: managerId, pmType:pmType, location:'SITE'}

  return dispatch => {

    dispatch(fetchSiteListtDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchSiteListDetails, variables: variables})

      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchSiteListtDetailsFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data) {
          return dispatch(fetchSiteListtDetailsSuccess(vendorId, loginId, res.data.data))
        }
      }

      )
      .catch(errors => {
        dispatch(fetchSiteListtDetailsFailure(vendorId, loginId, errors))
      }
      )
  }
}

export function fetchPmListDetailsByVendorId(vendorId, year) {
  let variables = { vendorId: vendorId, year: year }

  return dispatch => {

    dispatch(fetchPmListDetailsByVendorIdRequest(vendorId, year))
    return ajax.post(`/graphql4g`, { query: schema.fetchPmListDetailsByVendorId, variables: variables })

      .then(res => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchPmListDetailsByVendorIdFailure(vendorId, year, res.data.errors))
        } else if (!!res.data && !!res.data.data) {
          return dispatch(fetchPmListDetailsByVendorIdSuccess(vendorId, year, res.data.data.getPmListDetailsByVendorId))
        }
      })

      .catch(errors => dispatch(fetchPmListDetailsByVendorIdFailure(vendorId, errors)))
  }
}

export function fetchPmGridDetails (vendorId, loginId, pmListId, reqType = '') {
  let variables = {pmListIds: pmListId}

  return dispatch => {

    dispatch(fetchPmGridDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchPmGridDetails, variables: variables})

       .then(res => {
         if (reqType === 'MULTIPLE_LISTS') {
           if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
             return dispatch(fetchPmGridDetailsFailureMultiple(vendorId, loginId, res.data.errors))
           } else if (!!res.data && !!res.data.data) {
             return dispatch(fetchPmGridDetailsSuccessMultiple(vendorId, loginId, res.data.data))
           }
         } else {
           if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
             return dispatch(fetchPmGridDetailsFailure(vendorId, loginId, res.data.errors))
           } else if (!!res.data && !!res.data.data) {
             return dispatch(fetchPmGridDetailsSuccess(vendorId, loginId, res.data.data))
           }
         }



       })
     .catch(errors => {
       if (reqType === 'MULTIPLE_LISTS') {
         return dispatch(fetchPmGridDetailsFailureMultiple(vendorId, loginId, res.data.errors))
       } else {return dispatch(fetchPmGridDetailsFailure(vendorId, loginId, errors))}
     })
  }
}

export function fetchDraftGridDetails (vendorId, loginId, pmListId, reqType = '', isGo95, isTower) {
  let variables = {pmListIds: pmListId, isGo95, isTower}

  return dispatch => {

    dispatch(fetchDraftGridDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchDraftGridDetails, variables: variables})

       .then(res => {
         if (reqType === 'MULTIPLE_LISTS') {
           if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
             return dispatch(fetchDraftGridDetailsFailureMultiple(vendorId, loginId, res.data.errors))
           } else if (!!res.data && !!res.data.data) {
             return dispatch(fetchDraftGridDetailsSuccessMultiple(vendorId, loginId, res.data.data))
           }
         } else {
           if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
             return dispatch(fetchDraftGridDetailsFailure(vendorId, loginId, res.data.errors))
           } else if (!!res.data && !!res.data.data) {
             return dispatch(fetchDraftGridDetailsSuccess(vendorId, loginId, res.data.data))
           }
         }






       })
     .catch(errors => {

       if (reqType === 'MULTIPLE_LISTS') {
         return dispatch(fetchDraftGridDetailsFailureMultiple(vendorId, loginId, res.data.errors))
       } else {
         return dispatch(fetchDraftGridDetailsFailure(vendorId, loginId, errors))
       }

     })
  }
}





export function fetchPmHVACModelAttributeDetails (vendorId, loginId, pmType, unid) {
  let variables = {pmType: pmType, unid:unid}

  return dispatch => {
    dispatch(fetchPmHVACModelAttributeDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchHVACPmModelAttDetails, variables: variables})
        .then(res => {
          if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
            return dispatch(fetchPmHVACModelAttributeDetailsFailure(vendorId, loginId, pmType, res.data.errors))
          } else if (!!res.data && !!res.data.data) {
            return dispatch(fetchPmHVACModelAttributeDetailsSuccess(vendorId, loginId, pmType, res.data.data))
          }


        })

     .catch(errors => dispatch(fetchPmHVACModelAttributeDetailsFailure(vendorId, loginId, pmType, errors)))
  }
}

export function fetchPmModelAttributeDetails (vendorId, loginId, pmType, poItemId) {
  let variables = {pmType: pmType, po_item_id:poItemId}

  return dispatch => {
    dispatch(fetchPmModelAttributeDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchPmModelAttDetails, variables: variables})
        .then(res => {
          if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
            return dispatch(fetchPmModelAttributeDetailsFailure(vendorId, loginId, res.data.errors))
          } else if (!!res.data && !!res.data.data) {
            return dispatch(fetchPmModelAttributeDetailsSuccess(vendorId, loginId, res.data.data))
          }


        })

     .catch(errors => dispatch(fetchPmModelAttributeDetailsFailure(vendorId, loginId, errors)))
  }
}

export function fetchGenTankDetails (vendorId, loginId, unid, pmlistitemid) {
  return dispatch => {
    dispatch(fetchGenTankDetailsRequest(vendorId, loginId, pmlistitemid))
    return ajax.post(`/graphql4g`, {query: schema.getGenTanknfoForUnid, variables: {unid: unid}})
      .then(res => dispatch(fetchGenTankDetailsSuccess(vendorId, loginId, pmlistitemid, res.data.data.getGenTanknfoForUnid.genTank)))
      .catch(errors => dispatch(fetchGenTankDetailsFailure(vendorId, loginId, pmlistitemid, errors)))
  }
}


export function fetchHvacDetails (vendorId, loginId, unid, pmlistitemid, type) {
  return dispatch => {
    dispatch(fetchHvacDetailsRequest(vendorId, loginId, pmlistitemid, type))
    return ajax.post(`/graphql4g`, {query: schema.getHvacInfoForUnid, variables: {unid: unid, type: type}})
      .then(res => dispatch(fetchHvacDetailsSuccess(vendorId, loginId, pmlistitemid, res.data.data.getHvacInfoForUnid.hvacs)))
      .catch(errors => dispatch(fetchHvacDetailsFailure(vendorId, loginId, pmlistitemid, errors)))
  }
}

export function uploadFiles (vendorId, loginId, pmlistitemid, input, bulkPO = false) {
  return dispatch => {

    return ajax.post(`/graphql4g`, {query: schema.uploadFiles, variables: {uploadFilesInput: input}})

      .then(res => {
        if (!bulkPO) {
          if (res.data.data.uploadFiles.result === 'All files uploaded successfuly') {
            return dispatch(uploadFilesSuccess(vendorId, loginId, pmlistitemid, res.data.data.uploadFiles.result))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(uploadFilesQuoteError(vendorId, loginId, pmlistitemid, {message}))
          } else {
            throw {message: "Unknow Error! Please contact administrator."}
          }
        } else if (bulkPO) {
          if (res.data.data.uploadFiles.result === 'All files uploaded successfuly') {
            return dispatch(uploadFilesSuccessBulkPO(vendorId, loginId, pmlistitemid, res.data.data.uploadFiles.result))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(uploadFilesErrorBulkPO(vendorId, loginId, pmlistitemid, {message}))
          } else {
            throw {message: "Unknow Error! Please contact administrator."}
          }
        }


      })
      .catch(errors => {
        throw {message: "Unknow Error! Please contact administrator."}
      })
  }
}
export function submitPMQuote (vendorId, loginId, pmlistitemid, input) {
  return dispatch => {

    return ajax.post(`/graphql4g`, {query: schema.submitPMDetails, variables: {PMDetailsInput: input}})
      .then(res => {

        if (res.data.data.submitPMDetails.RESULT_MSG === 'SUCCESS') {
          return dispatch(submitPMQuoteSuccess(vendorId, loginId, pmlistitemid, res.data.data.submitPMDetails.RESULT_MSG))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(submitPMQuoteError(vendorId, loginId, pmlistitemid, {message}))
        } else {
          throw {message: "Unknow Error! Please contact administrator."}
        }
      })
      .catch(errors => {
        throw {message: "Unknow Error! Please contact administrator."}
      })
  }
}
export function createPMList (vendorId, loginId, refName, feGrouped, input, schedUpdate=false) {
  return dispatch => {
    dispatch(createPmListRequest(vendorId, loginId, refName, feGrouped))
    schedUpdate ? input.source = 'VP' : null
    const schemaObj = schedUpdate ? {query: schema.schedDateUpdate, variables: {updateScheduleDatereq: input, refName}}: {query: schema.createPMList, variables: {createPMListInput: input, refName, feGrouped}}
    return ajax.post(`/graphql4g`, schemaObj)
      .then(res => {

        if (schedUpdate) {
          if (res.data.data.updateScheduleDate.RESULT_MSG.length > 0) {

            return dispatch(createPMListSuccess(vendorId, loginId, refName, feGrouped, res.data.data.updateScheduleDate.RESULT_MSG))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(createPMListError(vendorId, loginId, refName, feGrouped, {message}))
          } else {
            throw dispatch(createPMListError(vendorId, loginId, refName, feGrouped,{message: "Unknown Error! Please contact administrator."}))
          }
        } else {
          if (res.data.data.createPMList && res.data.data.createPMList.RESULT_MSG.length > 0) {
            return dispatch(createPMListSuccess(vendorId, loginId, refName, feGrouped, res.data.data.createPMList.RESULT_MSG[0]))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(createPMListError(vendorId, loginId, refName, feGrouped, {message}))
          } else {
            throw dispatch(createPMListError(vendorId, loginId, refName, feGrouped,{message: "Unknown Error! Please contact administrator."}))
          }
        }

      })
      .catch(errors => {

        throw {message: "Unknow Error! Please contact administrator."}
      })
  }
}



export function fetchFileData (loginId, vendorId, pmListId, pmListItemId, updateType, fileName = '', isCommonFile = '') {

  return dispatch => {
    dispatch(fetchFileDataRequest(vendorId, loginId, pmListId))
    return ajax.post(`/graphql4g`, {query: schema.getFileDataForPmlist, variables: {pmListId: pmListId, pmListItemId: pmListItemId, updateType: updateType, name: fileName,
      isCommonFile: isCommonFile
    }})

      .then(res => dispatch(fetchFileDataSuccess(vendorId, loginId, res.data.data)))
      .catch(errors => dispatch(fetchFileDataFailure(vendorId, loginId, errors)))
  }
}
export const FETCH_TRAININGMATERIAL_REQUEST = 'FETCH_TRAININGMATERIAL_REQUEST'
export const FETCH_TRAININGMATERIAL_SUCCESS = 'FETCH_TRAININGMATERIAL_SUCCESS'
export const FETCH_TRAININGMATERIAL_FAILURE = 'FETCH_TRAININGMATERIAL_FAILURE'
export const fetchTrainingMaterialRequest = createAction(FETCH_TRAININGMATERIAL_REQUEST, 'vendorId', 'loginId')
export const fetchTrainingMaterialSuccess = createAction(FETCH_TRAININGMATERIAL_SUCCESS, 'vendorId', 'loginId', 'TrainingMaterial')
export const fetchTrainingMaterialFailure = createAction(FETCH_TRAININGMATERIAL_FAILURE, 'vendorId', 'loginId', 'errorsTrainingMaterial')
export function fetchTrainingMaterial (vendorId, loginId) {

  return dispatch => {
    dispatch(fetchTrainingMaterialRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.getTrainingMaterial})

      .then(res => dispatch(fetchTrainingMaterialSuccess(vendorId, loginId, res.data.data.getTrainingMaterial))
      )
      .catch(errors => dispatch(fetchTrainingMaterialFailure(vendorId, loginId, errors)))
  }
}
export function fetchCompletedAttDetails (loginId, vendorId, pmListId) {
  return dispatch => {
    dispatch(fetchCompletedAttDetailsRequest(vendorId, loginId, pmListId))
    return ajax.post(`/graphql4g`, {query: schema.getCompletedAttDetails, variables: {pmListId: pmListId}})


      .then(res => dispatch(fetchCompletedAttDetailsSuccess(vendorId, loginId, pmListId, res.data.data.getCompletedAttDetails)))
      .catch(errors => dispatch(fetchCompletedAttDetailsFailure(vendorId, loginId, pmListId, errors)))
  }
}

export function passHvacInfoToOpstracker(loginId, unid, input){
  return dispatch => {
    dispatch(hvacInfoToOpsRequest(unid))
    return ajax.post(`/graphql4g`, {query: schema.hvacInfoToOpstracker, variables: { unid, input}})
      .then(res => {
        if(res && res.data && res.data.data && res.data.data.hvacInfoToOpstracker && res.data.data.hvacInfoToOpstracker.updatedData){
        return dispatch(hvacInfoToOpsSuccess(unid, res.data.data.hvacInfoToOpstracker.updatedData))
        }else if(res.data && res.data.data && res.data.data.errors && res.data.data.errors.length > 0){
          return dispatch(hvacInfoToOpsFailure(unid, res.data.data.errors[0]))
        }else{
          return dispatch(hvacInfoToOpsFailure(unid, res.data))
        }
      })
      
      .catch(errors => dispatch(hvacInfoToOpsFailure(unid, errors)))
  }
}

export function addSelectionStatusTopmList (vendorId, loginId, pmListId, selectedItem) {


  return async dispatch => {

    let dispatchedItem = await dispatch(addSelectionStatusTopmListRequest(vendorId, loginId, pmListId, selectedItem))
    return dispatchedItem
  }
}
export function addDefaultStatusToAllpmLists (vendorId, loginId, selectionStatus, expansionStatus) {


  return async dispatch => {

    let dispatchedItem = await dispatch(addDefaultStatusToAllpmListsRequest(vendorId, loginId, selectionStatus, expansionStatus))
    return dispatchedItem
  }
}
export function toggleExpStatusToPmlist (vendorId, loginId, pmListId) {


  return async dispatch => {

    let dispatchedItem = await dispatch(toggleExpStatusToPmlistRequest(vendorId, loginId, pmListId))
    return dispatchedItem
  }
}

export function selectAllToPmList (vendorId, loginId, visiblePmLists, selectAllChecked) {


  return async dispatch => {

    let dispatchedItem = await dispatch(selectAllToPmListRequest(vendorId, loginId, visiblePmLists, selectAllChecked))
    return dispatchedItem
  }
}

export const FETCH_GO95POLEINFO_REQUEST = 'FETCH_GO95POLEINFO_REQUEST'
export const FETCH_GO95POLEINFO_SUCCESS = 'FETCH_GO95POLEINFO_SUCCESS'
export const FETCH_GO95POLEINFO_FAILURE = 'FETCH_GO95POLEINFO_FAILURE'
export const fetchGO95PoleInfoRequest = createAction(FETCH_GO95POLEINFO_REQUEST, 'vendorId', 'loginId', 'poleUnid')
export const fetchGO95PoleInfoSuccess = createAction(FETCH_GO95POLEINFO_SUCCESS, 'vendorId', 'loginId', 'poleUnid', 'GO95PoleInfo')
export const fetchGO95PoleInfoFailure = createAction(FETCH_GO95POLEINFO_FAILURE, 'vendorId', 'loginId', 'poleUnid', 'errorsGO95PoleInfo')
// GO95
export function fetchGO95PoleInfo (loginId, vendorId, subMarket, poleUnid, pmListItemId, pmListId) {
  return dispatch => {

    dispatch(fetchGO95PoleInfoRequest(vendorId, loginId, poleUnid))


    return ajax.post(`/graphql4g`, {query: schema.getGO95PoleInfo, variables: {subMarket, poleUnid, pmListItemId, pmListId}})

      .then(res => dispatch(fetchGO95PoleInfoSuccess(vendorId, loginId, poleUnid, res.data.data.getGO95PoleInfo)))
      .catch(errors => dispatch(fetchGO95PoleInfoFailure(vendorId, loginId, poleUnid, errors)))
  }
}
export const SUBMIT_GO95INFO_SUCCESS = 'SUBMIT_GO95INFO_SUCCESS'
export const SUBMIT_GO95INFO_ERROR = 'SUBMIT_GO95INFO_ERROR'
export const submitInspectionInfoSuccess = createAction(SUBMIT_GO95INFO_SUCCESS, 'vendorId', 'loginId', 'pmlistitemid', 'submitInspectionInfoStatus')
export const submitInspectionInfoError = createAction(SUBMIT_GO95INFO_ERROR, 'vendorId', 'loginId', 'pmlistitemid', 'submitInspectionInfoerrorMessage')



export function submitInspectionInfo (vendorId, loginId, pmlistitemid, input) {
  return dispatch => {

    return ajax.post(`/graphql4g`, {query: schema.submitInspectionInfo, variables: {InspectionInfoInput: input}})
      .then(res => {

        if (res.data.data.submitInspectionInfo.vpInsertResponse.RESULT_MSG === 'SUCCESS') {
          return dispatch(submitInspectionInfoSuccess(vendorId, loginId, pmlistitemid, res.data.data.submitInspectionInfo))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(submitInspectionInfoError(vendorId, loginId, pmlistitemid, {message}))
        } else {
          throw {message: "Unknow Error! Please contact administrator."}
        }
      })
      .catch(errors => {

        throw {message: "Unknow Error! Please contact administrator."}
      })
  }
}

export const FETCH_BANNERDETAILS_REQUEST = 'FETCH_BANNERDETAILS_REQUEST'
export const FETCH_BANNERDETAILS_SUCCESS = 'FETCH_BANNERDETAILS_SUCCESS'
export const FETCH_BANNERDETAILS_FAILURE = 'FETCH_BANNERDETAILS_FAILURE'
export const fetchBannerDetailsSuccess = createAction(FETCH_BANNERDETAILS_SUCCESS, 'vendorId', 'loginId', 'BannerDetails')
export const fetchBannerDetailsFailure = createAction(FETCH_BANNERDETAILS_FAILURE, 'vendorId', 'loginId', 'errorsBannerDetails')

export function fetchBannerDetails (loginId, vendorId, category='NVP') {
  return dispatch => {
   // dispatch(fetchBannerDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.getBannerDetails, variables: { category }})


      .then(res => dispatch(fetchBannerDetailsSuccess(vendorId, loginId, res.data.data.getNotifications)))
      .catch(errors => dispatch(fetchBannerDetailsFailure(vendorId, loginId, errors)))
  }
}
export const UPLOAD_FILES_SUCCESS_GO95 = 'UPLOAD_FILES_SUCCESS_GO95'
export const UPLOAD_FILES_ERROR_GO95 = 'UPLOAD_FILES_ERROR_GO95'
export const uploadFilesSuccessGO95 = createAction(UPLOAD_FILES_SUCCESS_GO95, 'vendorId', 'loginId', 'unid', 'uploadFilesSubmissionStatusgo95')
export const uploadFilesErrorGO95 = createAction(UPLOAD_FILES_ERROR_GO95, 'vendorId', 'loginId', 'uploadFilesSubmissionerrorMessagego95')

export function uploadFilesGO95 (vendorId, loginId, unid, input) {
  return dispatch => {

    return ajax.post(`/graphql4g`, {query: schema.uploadFilesGO95, variables: {uploadFilesInputGO95: input, unid: unid}})

      .then(res => {

        if (!!res.data.data.uploadFilesGO95 && res.data.data.uploadFilesGO95.fileResp && res.data.data.uploadFilesGO95.fileResp.filter(val => val.status != 'Success').length == 0) {
          return dispatch(uploadFilesSuccess(vendorId, loginId, unid, res.data.data.uploadFilesGO95))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(uploadFilesErrorGO95(vendorId, loginId, unid, {message}))
        } else {
          throw {message: "Unknow Error! Please contact administrator."}
        }




      })
      .catch(errors => {

        // throw {message: "Unknow Error! Please contact administrator."}
      })
  }
}
export const FETCH_AUDITDETAILS_REQUEST = 'FETCH_AUDITDETAILS_REQUEST'
export const FETCH_AUDITDETAILS_SUCCESS = 'FETCH_AUDITDETAILS_SUCCESS'
export const FETCH_AUDITDETAILS_FAILURE = 'FETCH_AUDITDETAILS_FAILURE'
export const fetchAuditDetailsRequest = createAction(FETCH_AUDITDETAILS_REQUEST, 'vendorId', 'loginId', 'pmListItemId')
export const fetchAuditDetailsSuccess = createAction(FETCH_AUDITDETAILS_SUCCESS, 'vendorId', 'loginId', 'pmListItemId', 'auditDetails')
export const fetchAuditDetailsFailure = createAction(FETCH_AUDITDETAILS_FAILURE, 'vendorId', 'loginId', 'pmListItemId', 'errorsauditDetails')
// GO95
export function fetchAuditDetails (loginId, vendorId, pmListItemId) {
  return dispatch => {

    dispatch(fetchAuditDetailsRequest(vendorId, loginId, pmListItemId))


    return ajax.post(`/graphql4g`, {query: schema.getAuditDetails, variables: {pmListItemId}})

      .then(res => dispatch(fetchAuditDetailsSuccess(vendorId, loginId, pmListItemId, res.data.data.getAuditDetails)))
      .catch(errors => dispatch(fetchAuditDetailsFailure(vendorId, loginId, pmListItemId, errors)))
  }
}

export const FETCH_FILE_DETAILSGO95_REQUEST = 'FETCH_FILE_DETAILSGO95_REQUEST'
export const FETCH_FILE_DETAILSGO95_SUCCESS = 'FETCH_FILE_DETAILSGO95_SUCCESS'
export const FETCH_FILE_DETAILSGO95_FAILURE = 'FETCH_FILE_DETAILSGO95_FAILURE'
export const fetchFileDataGO95Request = createAction(FETCH_FILE_DETAILSGO95_REQUEST, 'vendorId', 'loginId', 'unid')
export const fetchFileDataGO95Success = createAction(FETCH_FILE_DETAILSGO95_SUCCESS, 'vendorId', 'loginId', 'unid', 'fileName', 'fileDetailsgo95')
export const fetchFileDataGO95Failure = createAction(FETCH_FILE_DETAILSGO95_FAILURE, 'vendorId', 'loginId', 'unid', 'fileName', 'errorsFilesdetailsgo95')

export function fetchFileDataGO95 (loginId, vendorId, fileName, unid) {

  return dispatch => {
    dispatch(fetchFileDataGO95Request(vendorId, loginId, unid))
    return ajax.post(`/graphql4g`, {query: schema.getFileDataForGO95, variables: {loginId, unid, name: fileName}})

      .then(res => dispatch(fetchFileDataGO95Success(vendorId, loginId, unid, fileName, res.data.data)))
      .catch(errors => dispatch(fetchFileDataGO95Failure(vendorId, loginId, unid, fileName, errors)))
  }
}

// TOWER INSPECTION

export const FETCH_TOWERINSP_REQUEST = 'FETCH_TOWERINSP_REQUEST'
export const FETCH_TOWERINSP_SUCCESS = 'FETCH_TOWERINSP_SUCCESS'
export const FETCH_TOWERINSP_FAILURE = 'FETCH_TOWERINSP_FAILURE'
export const fetchTowerInspItemsRequest = createAction(FETCH_TOWERINSP_REQUEST, 'vendorId', 'loginId', 'unid')
export const fetchTowerInspItemsSuccess = createAction(FETCH_TOWERINSP_SUCCESS, 'vendorId', 'loginId', 'unid', 'inspData')
export const fetchTowerInspItemsFailure = createAction(FETCH_TOWERINSP_FAILURE, 'vendorId', 'loginId', 'unid', 'inspData')

export function fetchTowerInspItems (vendorId, loginId, submarket, pmListItemId, unid, pmListId, pmTypeId) {
  let variables = {pmTypeId, submarket, pmListItemId, unid, pmListId}

  return dispatch => {
    dispatch(fetchTowerInspItemsRequest(vendorId, loginId, unid))
    return ajax.post(`/graphql4g`, {query: schema.fetchTowerInspItems, variables: variables})
        .then(res => {

          if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
            return dispatch(fetchTowerInspItemsFailure(vendorId, loginId, unid, res.data.errors))
          } else if (!!res.data && !!res.data.data) {
            return dispatch(fetchTowerInspItemsSuccess(vendorId, loginId, unid, res.data.data))
          }


        })

     .catch(errors => dispatch(fetchTowerInspItemsFailure(vendorId, loginId, unid, errors)))
  }
}

export const SUBMIT_TOWERINSP_SUCCESS = 'SUBMIT_TOWERINSP_SUCCESS'
export const SUBMIT_TOWERINSP_ERROR = 'SUBMIT_TOWERINSP_ERROR'
export const submitTowerInspSuccess = createAction(SUBMIT_TOWERINSP_SUCCESS, 'vendorId', 'loginId', 'pmlistitemid', 'submitTowerInspStatus')
export const submitTowerInspError = createAction(SUBMIT_TOWERINSP_ERROR, 'vendorId', 'loginId', 'pmlistitemid', 'submitTowerInsperrorMessage')



export function submitTowerInsp (vendorId, loginId, pmlistitemid, input) {
  return dispatch => {

    return ajax.post(`/graphql4g`, {query: schema.submitTowerInsp, variables: {TowerInspectionInfoInput: input}})
      .then(res => {

        if (res.data.data.submitTowerInsp.vpInsertResponse.RESULT_MSG === 'SUCCESS') {
          return dispatch(submitTowerInspSuccess(vendorId, loginId, pmlistitemid, res.data.data.submitTowerInsp))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(submitTowerInspError(vendorId, loginId, pmlistitemid, {message}))
        } else {
          throw {message: "Unknow Error! Please contact administrator."}
        }
      })
      .catch(errors => {

        throw {message: "Unknow Error! Please contact administrator."}
      })
  }
}

export const GENERATE_PDF_SUCCESS = 'GENERATE_PDF_SUCCESS'
export const GENERATE_PDF_ERROR = 'GENERATE_PDF_ERROR'
export const generatePdfSuccess = createAction(GENERATE_PDF_SUCCESS, 'vendorId', 'loginId', 'pmlistitemid', 'generatePdfMessage')
export const generatePdfError = createAction(GENERATE_PDF_ERROR, 'vendorId', 'loginId', 'pmlistitemid', 'generatePdferrorMessage')



export function generateInspPDF (vendorId, loginId, pmlistitemid, input, type) {

  return dispatch => {
    let currentTypeSchema = type == 'TOWER' ? schema.generateInspPDF : type == 'GENERATOR' ? schema.generateInspPDFGen : ['HVAC', 'FIREINSPECTION', 'EXTERMINATOR', 'FIREEXTINGUISHER', 'BATTERY', 'LANDSCAPING'].includes(type) ? schema.generateInspPDFHvac : type === "GO95" ? schema.generateInspectionPDFGo95 :null
    let inputVal = type == 'TOWER' ? {towerInspItemsInput: input, type: type} : type == 'GENERATOR' ? {genInspItemsInput: input, type: type} :['HVAC', 'FIREINSPECTION', 'EXTERMINATOR', 'FIREEXTINGUISHER', 'BATTERY', 'LANDSCAPING'].includes(type)? {hvacInspItemsInput: input, type: type}: type === "GO95" ? {go95InspItemsInput: input, type: "POLE"} : null
    return ajax.post(`/graphql4g`, {query: currentTypeSchema, variables: inputVal})
      .then(res => {
        if (type == 'TOWER') {
          if (res.data.data.generateInspPDF.output.pdfFiles[0].status === 'Success') {
            return dispatch(generatePdfSuccess(vendorId, loginId, pmlistitemid, res.data.data.generateInspPDF))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(generatePdfError(vendorId, loginId, pmlistitemid, {message}))
          } else {
            throw {message: "Unknow Error! Please contact administrator."}
          }
        } else if (type === 'GENERATOR') {
          if (res.data.data.generateInspPDFGen.output.pdfFiles.result == 'All files uploaded successfuly') {
            return dispatch(generatePdfSuccess(vendorId, loginId, pmlistitemid, res.data.data.generateInspPDFGen))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(generatePdfError(vendorId, loginId, pmlistitemid, {message}))
          } else {
            throw {message: "Unknow Error! Please contact administrator."}
          }
        } else if (['HVAC', 'FIREINSPECTION', 'EXTERMINATOR', 'FIREEXTINGUISHER', 'BATTERY', 'LANDSCAPING'].includes(type)) {
          if (res.data.data.generateInspPDFHvac.output.pdfFiles.result == 'All files uploaded successfuly') {
            return dispatch(generatePdfSuccess(vendorId, loginId, pmlistitemid, res.data.data.generateInspPDFHvac))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(generatePdfError(vendorId, loginId, pmlistitemid, {message}))
          } else {
            throw {message: "Unknow Error! Please contact administrator."}
          }
        } else if (type === "GO95") {
          console.log("go95 pdf response", res)
          if (res.data.data.generateInspPDFGO95.output.pdfFiles.result == 'All files uploaded successfuly') {
            return dispatch(generatePdfSuccess(vendorId, loginId, pmlistitemid, res.data.data.generateInspPDFGO95))
          } else if (res.data.errors && res.data.errors.length > 0) {
            let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
            return dispatch(generatePdfError(vendorId, loginId, pmlistitemid, {message}))
          } else {
            throw {message: "Unknow Error! Please contact administrator."}
          }
        }
      })
      .catch(errors => {

        throw {message: "Unknow Error! Please contact administrator."}
      })
  }
}

//* **********************Nest Evaluation******************************************/

export const FETCH_NESTEVALUATIONQS_REQUEST = 'FETCH_NESTEVALUATIONQS_REQUEST'
export const FETCH_NESTEVALUATIONQS_SUCCESS = 'FETCH_NESTEVALUATIONQS_SUCCESS'
export const FETCH_NESTEVALUATIONQS_FAILURE = 'FETCH_NESTEVALUATIONQS_FAILURE'
export const fetchNestQsRequest = createAction(FETCH_NESTEVALUATIONQS_REQUEST, 'vendorId', 'loginId')
export const fetchNestQsSuccess = createAction(FETCH_NESTEVALUATIONQS_SUCCESS, 'vendorId', 'loginId', 'nestData')
export const fetchNestQsFailure = createAction(FETCH_NESTEVALUATIONQS_FAILURE, 'vendorId', 'loginId', 'nestErr')

export function fetchNestQs (vendorId, loginId) {
  let variables = {vendorId: vendorId}

  return dispatch => {
    dispatch(fetchNestQsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchNestQs, variables: variables})



      .then(res => {

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchNestQsFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.getNestEvaluationQs && !!res.data.data.getNestEvaluationQs.data) {
          return dispatch(fetchNestQsSuccess(vendorId, loginId, res.data.data.getNestEvaluationQs.data))
        }
      }

      )
      .catch(errors => dispatch(fetchNestQsFailure(vendorId, loginId, errors)))
  }
}


export const FETCH_NESTDETAILS_REQUEST = 'FETCH_NESTDETAILS_REQUEST'
export const FETCH_NESTDETAILS_SUCCESS = 'FETCH_NESTDETAILS_SUCCESS'
export const FETCH_NESTDETAILS_FAILURE = 'FETCH_NESTDETAILS_FAILURE'
export const fetchNestDetailsRequest = createAction(FETCH_NESTDETAILS_REQUEST, 'vendorId', 'loginId')
export const fetchNestDetailsSuccess = createAction(FETCH_NESTDETAILS_SUCCESS, 'vendorId', 'loginId', 'nestDetails')
export const fetchNestDetailsFailure = createAction(FETCH_NESTDETAILS_FAILURE, 'vendorId', 'loginId', 'nestDetailsErr')

export function fetchNestDetails (vendorId, loginId, unid) {
  let variables = {unid: unid}

  return dispatch => {
    dispatch(fetchNestDetailsRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchNestDetails, variables: variables})



      .then(res => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchNestDetailsFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.getNestModelDetails && !!res.data.data.getNestModelDetails.data) {
          return dispatch(fetchNestDetailsSuccess(vendorId, loginId, res.data.data.getNestModelDetails.data))
        }
      }

      )
      .catch(errors => dispatch(fetchNestDetailsFailure(vendorId, loginId, errors)))
  }
}

export const FETCH_ATTACHMENTLISTOPSTRACKER_REQUEST = 'FETCH_ATTACHMENTLISTOPSTRACKER_REQUEST'
export const FETCH_ATTACHMENTLISTOPSTRACKER_SUCCESS = 'FETCH_ATTACHMENTLISTOPSTRACKER_SUCCESS'
export const FETCH_ATTACHMENTLISTOPSTRACKER_FAILURE = 'FETCH_ATTACHMENTLISTOPSTRACKER_FAILURE'
export const fetchAttachmentListOpsTrackerRequest = createAction(FETCH_ATTACHMENTLISTOPSTRACKER_REQUEST, 'vendorId', 'loginId')
export const fetchAttachmentListOpsTrackerSuccess = createAction(FETCH_ATTACHMENTLISTOPSTRACKER_SUCCESS, 'vendorId', 'loginId', 'attachmentsList')
export const fetchAttachmentListOpsTrackerFailure = createAction(FETCH_ATTACHMENTLISTOPSTRACKER_FAILURE, 'vendorId', 'loginId', 'attachmentsListErr')

export const FETCH_ATTACHMENTCONTENT_REQUEST = 'FETCH_ATTACHMENTCONTENT_REQUEST'
export const FETCH_ATTACHMENTCONTENT_SUCCESS = 'FETCH_ATTACHMENTCONTENT_SUCCESS'
export const FETCH_ATTACHMENTCONTENT_FAILURE = 'FETCH_ATTACHMENTCONTENT_FAILURE'
export const fetchAttachmentContentRequest = createAction(FETCH_ATTACHMENTCONTENT_REQUEST, 'unid', 'loginId')
export const fetchAttachmentContentSuccess = createAction(FETCH_ATTACHMENTCONTENT_SUCCESS, 'unid', 'loginId', 'attachmentsList')
export const fetchAttachmentContentFailure = createAction(FETCH_ATTACHMENTCONTENT_FAILURE, 'unid', 'loginId', 'attachmentsListErr')


export function fetchAttachmentContent (loginId, unid) {
  let variables = {unid: unid}

  return dispatch => {
    dispatch(fetchAttachmentContentRequest(unid, loginId))
    return ajax.post(`/graphql4g`, {query: schema.fetchAttachmentContent, variables: variables})
      .then(res => {
        if (res?.data?.errors?.length > 0) {
          return dispatch(fetchAttachmentContentFailure(unid, loginId, res.data.errors))
        } else if (res?.data?.data?.getAttachmentContent) {
          return dispatch(fetchAttachmentContentSuccess(unid, loginId, res.data.data.getAttachmentContent))
        }
      }
      )
      .catch(errors => dispatch(fetchAttachmentContentFailure(unid, loginId, errors)))
  }
}


export const FETCH_UPDATEQUESTIONNAIRE_REQUEST = 'FETCH_UPDATEQUESTIONNAIRE_REQUEST'
export const FETCH_UPDATEQUESTIONNAIRE_SUCCESS = 'FETCH_UPDATEQUESTIONNAIRE_SUCCESS'
export const FETCH_UPDATEQUESTIONNAIRE_FAILURE = 'FETCH_UPDATEQUESTIONNAIRE_FAILURE'
export const updateQuestionnaireRequest = createAction(FETCH_UPDATEQUESTIONNAIRE_REQUEST, 'siteUnid', 'loginId')
export const updateQuestionnaireSuccess = createAction(FETCH_UPDATEQUESTIONNAIRE_SUCCESS, 'siteUnid', 'loginId', 'updateQuestionnaire')
export const updateQuestionnaireFailure = createAction(FETCH_UPDATEQUESTIONNAIRE_FAILURE, 'siteUnid', 'loginId', 'updateQuestionnaireErr')

export const FETCH_UPDATEQUESTIONNAIREATTACHMENT_REQUEST = 'FETCH_UPDATEQUESTIONNAIREATTACHMENT_REQUEST'
export const FETCH_UPDATEQUESTIONNAIREATTACHMENT_SUCCESS = 'FETCH_UPDATEQUESTIONNAIREATTACHMENT_SUCCESS'
export const FETCH_UPDATEQUESTIONNAIREATTACHMENT_FAILURE = 'FETCH_UPDATEQUESTIONNAIREATTACHMENT_FAILURE'
export const updateQuestionnaireAttachmentsRequest = createAction(FETCH_UPDATEQUESTIONNAIREATTACHMENT_REQUEST, 'siteUnid', 'loginId')
export const updateQuestionnaireAttachmentsSuccess = createAction(FETCH_UPDATEQUESTIONNAIREATTACHMENT_SUCCESS, 'siteUnid', 'loginId', 'updateQuestionnaireAttachments')
export const updateQuestionnaireAttachmentsFailure = createAction(FETCH_UPDATEQUESTIONNAIREATTACHMENT_FAILURE, 'siteUnid', 'loginId', 'updateQuestionnaireAttachmentseErr')


export function updateQuestionnaire (loginId, input, siteUnid) {
  let variables = {loginId:loginId,questionnaireInput:input, siteUnid: siteUnid}

  return dispatch => {
    dispatch(updateQuestionnaireRequest(siteUnid, loginId))
    return ajax.post(`/graphql4g`, {query: schema.updateQuestionnaire, variables: variables})

      .then(res => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(updateQuestionnaireFailure(siteUnid, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.updateQuestionnaire && !!res.data.data.updateQuestionnaire.message && res.data.data.updateQuestionnaire.message.includes("success")) {
          return dispatch(updateQuestionnaireSuccess(siteUnid, loginId, res.data.data.updateQuestionnaire.message))
        }
      }
      )
      .catch(errors => dispatch(updateQuestionnaireFailure(siteUnid, loginId, errors)))
  }
}

export function updateQuestionnaireAttachments (loginId, input, siteUnid) {
  let variables = {loginId: loginId, nestModelDetailsObjInput: input, siteUnid: siteUnid}

  return dispatch => {
    dispatch(updateQuestionnaireAttachmentsRequest(siteUnid, loginId))
    return ajax.post(`/graphql4g`, {query: schema.updateQuestionnaireAttachments, variables: variables})

      .then(res => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(updateQuestionnaireAttachmentsFailure(siteUnid, loginId, res.data.errors))
        } else if (res?.data?.data?.updateQuestionnaireAttachments?.message?.toLowerCase()?.includes("success")) {
          return dispatch(updateQuestionnaireAttachmentsSuccess(siteUnid, loginId, res.data.data.updateQuestionnaireAttachments.message))
        }
      }
      )
      .catch(errors => dispatch(updateQuestionnaireAttachmentsFailure(siteUnid, loginId, errors)))
  }
}

export const FETCH_VALIDATEPONUM_REQUEST = 'FETCH_VALIDATEPONUM_REQUEST'
export const FETCH_VALIDATEPONUM_SUCCESS = 'FETCH_VALIDATEPONUM_SUCCESS'
export const FETCH_VALIDATEPONUM_FAILURE = 'FETCH_VALIDATEPONUM_FAILURE'
export const validatePONumRequest = createAction(FETCH_VALIDATEPONUM_REQUEST, 'vendorId', 'loginId')
export const validatePONumSuccess = createAction(FETCH_VALIDATEPONUM_SUCCESS, 'vendorId', 'loginId', 'validationData')
export const validatePONumFailure = createAction(FETCH_VALIDATEPONUM_FAILURE, 'vendorId', 'loginId', 'validationErr')

export function validatePONum (loginId, vendorId, poId, submarket, psLocId) {
  let variables = {poId: poId, submarket:submarket, psLocId:psLocId}

  return dispatch => {
    dispatch(validatePONumRequest(vendorId, loginId))
    return ajax.post(`/graphql4g`, {query: schema.validatePONum, variables: variables})



      .then(res => {
        console.log('res', res)
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(validatePONumFailure(vendorId, loginId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.validatePONum && !!res.data.data.validatePONum) {
          return dispatch(validatePONumSuccess(vendorId, loginId, res.data.data.validatePONum))
        }
      }

      )
      .catch(errors => dispatch(validatePONumFailure(vendorId, loginId, errors)))
  }
}

export const GET_POINVOICE_SITES_REQUEST = 'GET_POINVOICE_SITES_REQUEST'
export const GET_POINVOICE_SITES_SUCCESS = 'GET_POINVOICE_SITES_SUCCESS'
export const GET_POINVOICE_SITES_FAILURE = 'GET_POINVOICE_SITES_FAILURE'
export const getPOInvoiceSitesRequest = createAction(GET_POINVOICE_SITES_REQUEST, 'vendorId')
export const getPOInvoiceSitesSuccess = createAction(GET_POINVOICE_SITES_SUCCESS, 'vendorId', 'receivedSites')
export const getPOInvoiceSitesFailure = createAction(GET_POINVOICE_SITES_FAILURE, 'vendorId', 'error')

export function getPOInvoiceSites ( vendorId) {
 return dispatch => {
    dispatch(getPOInvoiceSitesRequest(vendorId))
    return ajax.post(`/graphql4g`, {query: schema.getReceivedSitesVendor, variables: {vendorId:vendorId}})
      .then(res => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(getPOInvoiceSitesFailure(vendorId, res.data.errors))
        } else if (!!res.data && !!res.data.data && !!res.data.data.getReceivedSitesVendor) {
          return dispatch(getPOInvoiceSitesSuccess(vendorId, res.data.data.getReceivedSitesVendor))
        }
      }

      )
      .catch(errors => dispatch(getPOInvoiceSitesFailure(vendorId, errors)))
  }
}

export function deleteAvianAttachment(attachmentId= '') {
  return dispatch => {
    return ajax.post(`/graphql4g`, { query: `mutation($attachmentId: String!){
    deleteAvianAttachment(attachmentId: $attachmentId){
        message
    }
}`, variables: { attachmentId } })
    .then(res => {
        return res?.data?.data?.deleteAvianAttachment;
      })
  }
}

export function uploadAvianAttachment(input) {
  return dispatch => {
    return ajax.post(`/graphql4g`, { query: `mutation($input:uploadAvianAttachmentInput!){
      uploadAvianAttachment(input:$input) {
        success
        message
      }
    }`, 
    variables: { input } }).then(res => {
      return res?.data?.data?.uploadAvianAttachment;
    })
  }
}

export function sendEmailNotificationForAvianUpdate(meta_universalid, input) {
  return dispatch => {
    return ajax.post(`/graphql4g`, { query: `mutation($meta_universalid:String! , $input:nestModelDetailsObjInput!){
      sendEmailNotificationForAvianUpdate(meta_universalid:$meta_universalid, input:$input) {
        success
        status
      }
    }`, 
    variables: { meta_universalid, input } }).then(res => {
      return res?.data?.data?.sendEmailNotificationForAvianUpdate;
    })
  }
}