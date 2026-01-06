import ajax from '../ajax'
import { push } from 'react-router-redux'
import { Map, fromJS } from 'immutable'
import * as userUtils from '../Users/utils'
import { createAction } from '../redux_utils'
import * as schema from './schema'
import config from '../config'
import store from '../store'
import moment from 'moment'
import { establishSocket, disconnectSocket } from '../AppNotification/socket-client'

export const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST'
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS'
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE'
export const SET_CURRENT_USER_ID = 'SET_CURRENT_USER_ID'

/*get user IVR String constants*/
export const GET_USER_IVRDETAILS_REQUEST="GET_USER_IVRDETAILS_REQUEST"
export const GET_USER_IVRDETAILS_SUCCESS="GET_USER_IVRDETAILS_SUCCESS"
export const GET_USER_IVRDETAILS_FAILURE="GET_USER_IVRDETAILS_FAILURE"

/*update Ivr pin string constants*/
export const UPDATE_IVRPIN_REQUEST="UPDATE_IVRPIN_REQUEST"
export const UPDATE_IVRPIN__SUCCESS="UPDATE_IVRPIN__SUCCESS"
export const UPDATE_IVRPIN__FAILURE="UPDATE_IVRPIN__FAILURE"


export const SWITCH_USER = 'SWITCH_USER'
export const RESTORE_USER = 'RESTORE_USER'

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAIL = 'LOGIN_FAIL'

export const GET_PEERS_BY_TECH_REQUEST = 'GET_PEERS_BY_TECH_REQUEST'
export const GET_PEERS_BY_TECH_SUCCESS = 'GET_PEERS_BY_TECH_SUCCESS'
export const GET_PEERS_BY_TECH_FAILURE = 'GET_PEERS_BY_TECH_FAILURE'

export const GET_OPEN_OSW_REQUEST = 'GET_OPEN_OSW_REQUEST'
export const GET_OPEN_OSW_SUCCESS = 'GET_OPEN_OSW_SUCCESS'
export const GET_OPEN_OSW_FAILURE = 'GET_OPEN_OSW_FAILURE'
export const CLEAR_OPEN_OSW_DATA = 'CLEAR_OPEN_OSW_DATA';
export const ATTEMPT_CLEAR_MESSAGE = 'ATTEMPT_CLEAR_MESSAGE'

export const fetchUserRequest = createAction(FETCH_USER_REQUEST)
export const fetchUserSuccess = createAction(FETCH_USER_SUCCESS, 'user', 'initialLoad')
export const fetchUserFailure = createAction(FETCH_USER_FAILURE, 'ex')
export const setCurrentUserId = createAction(SET_CURRENT_USER_ID, 'login_id')

/*action creators get userivrdetails*/
export const getUserIVRDetailsRequest=createAction(GET_USER_IVRDETAILS_REQUEST)
export const getUserIVRDetailsSuccess=createAction(GET_USER_IVRDETAILS_SUCCESS,'ivr_Details')
export const getUserIVRDetailsFailure=createAction(GET_USER_IVRDETAILS_FAILURE,'errors')

/*action creators update ivr pin*/
export const updateIVRPinRequest=createAction(UPDATE_IVRPIN_REQUEST)
export const updateIVRPinSuccess=createAction(UPDATE_IVRPIN__SUCCESS,'status')
export const updateIVRPinFailure=createAction(UPDATE_IVRPIN__FAILURE,'errors')

export const getOpenOswRequest = () => ({ type: GET_OPEN_OSW_REQUEST })
export const getOpenOswSuccess = (data) => ({ type: GET_OPEN_OSW_SUCCESS, data })
export const getOpenOswFailure = (error) => ({ type: GET_OPEN_OSW_FAILURE, error })
export const clearOpenOswData = () => ({ type: CLEAR_OPEN_OSW_DATA })


export const setUserPassword = createAction('SET_USER_PASSWORD', 'login_id', 'password')



export const loginRequest = createAction(LOGIN_REQUEST)
export const loginSuccess = createAction(LOGIN_SUCCESS, 'user', 'password')
export const loginFail = createAction(LOGIN_FAIL, 'errors')

export const getPeersByTechRequest = createAction(GET_PEERS_BY_TECH_REQUEST, 'loginId')
export const getPeersByTechSuccess = createAction(GET_PEERS_BY_TECH_SUCCESS, 'users', 'loginId')
export const getPeersByTechFail = createAction(GET_PEERS_BY_TECH_FAILURE, 'loginId', 'ex')


export const clearMessages = createAction(ATTEMPT_CLEAR_MESSAGE, 'user')




export const GET_DEVICE_COL_LIST_REQUEST = 'GET_DEVICE_COL_LIST_REQUEST'
export const GET_DEVICE_COL_LIST_SUCCESS = 'GET_DEVICE_COL_LIST_SUCCESS'
export const GET_DEVICE_COL_LIST_FAILURE = 'GET_DEVICE_COL_LIST_FAILURE'

export const getDeviceColListRequest = createAction(GET_DEVICE_COL_LIST_REQUEST, 'loginId')
export const getDeviceColListSuccess = createAction(GET_DEVICE_COL_LIST_SUCCESS, 'loginId', 'response')
export const getDeviceColListFailure = createAction(GET_DEVICE_COL_LIST_FAILURE, 'loginId', 'error')

export const UPDATE_DEVICE_DETAIL_REQUEST = 'UPDATE_DEVICE_DETAIL_REQUEST'
export const UPDATE_DEVICE_DETAIL_SUCCESS = 'UPDATE_DEVICE_DETAIL_SUCCESS'
export const UPDATE_DEVICE_DETAIL_FAILURE = 'UPDATE_DEVICE_DETAIL_FAILURE'

export const updateDeviceDetailRequest = createAction(UPDATE_DEVICE_DETAIL_REQUEST, 'loginId')
export const updateDeviceDetailSuccess = createAction(UPDATE_DEVICE_DETAIL_SUCCESS, 'loginId', 'response')
export const updateDeviceDetailFailure = createAction(UPDATE_DEVICE_DETAIL_FAILURE, 'loginId', 'error')

export const GET_VENDOR_LIST_REQUEST = 'GET_VENDOR_LIST_REQUEST'
export const GET_VENDOR_LIST_SUCCESS = 'GET_VENDOR_LIST_SUCCESS'
export const GET_VENDOR_LIST_FAILURE = 'GET_VENDOR_LIST_FAILURE'


export const getVendorListRequest = createAction(GET_VENDOR_LIST_REQUEST, 'loginId')
export const getVendorListSuccess = createAction(GET_VENDOR_LIST_SUCCESS, 'loginId', 'response')
export const getVendorListFail = createAction(GET_VENDOR_LIST_FAILURE, 'loginId', 'response')

export const GET_VENDOR_USER_AUTH_SUCCESS = 'GET_VENDOR_USER_AUTH_SUCCESS'

export const getVendorUserAuthSuccess = createAction(GET_VENDOR_USER_AUTH_SUCCESS, 'loginId', 'response')

export const GET_VENDOR_USER_AUTH_VENDOR_ID_REQUEST = 'GET_VENDOR_USER_AUTH_VENDOR_ID_REQUEST'
export const GET_VENDOR_USER_AUTH_VENDOR_ID_SUCCESS = 'GET_VENDOR_USER_AUTH_VENDOR_ID_SUCCESS'
export const GET_VENDOR_USER_AUTH_VENDOR_ID_FAILURE = 'GET_VENDOR_USER_AUTH_VENDOR_ID_FAILURE'

export const getVendorUserAuthForVendorIdRequest = createAction(GET_VENDOR_USER_AUTH_VENDOR_ID_REQUEST, 'loginId')
export const getVendorUserAuthForVendorIdSuccess = createAction(GET_VENDOR_USER_AUTH_VENDOR_ID_SUCCESS, 'loginId', 'response')
export const getVendorUserAuthForVendorIdFailure = createAction(GET_VENDOR_USER_AUTH_VENDOR_ID_FAILURE, 'loginId', 'response')

export const CREAT_USER_REQUEST = 'CREAT_USER_REQUEST'
export const CREAT_USER_SUCCESS = 'CREAT_USER_SUCCESS'
export const CREAT_USER_FAILURE = 'CREAT_USER_FAILURE'

export const createUserRequest = createAction(CREAT_USER_REQUEST, 'loginId')
export const createUserSuccess = createAction(CREAT_USER_SUCCESS, 'loginId', 'response')
export const createUserFail = createAction(CREAT_USER_FAILURE, 'loginId', 'response')

export const UPDATE_USER_REQUEST = 'UPDATE_USER_REQUEST'
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS'
export const UPDATE_USER_FAILURE = 'UPDATE_USER_FAILURE'

export const updateUserRequest = createAction(UPDATE_USER_REQUEST, 'loginId')
export const updateUserSuccess = createAction(UPDATE_USER_SUCCESS, 'loginId', 'response', 'user')
export const updateUserFail = createAction(UPDATE_USER_FAILURE, 'loginId', 'response')


export const DELETE_USER_REQUEST = 'DELETE_USER_REQUEST'
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS'
export const DELETE_USER_FAILURE = 'DELETE_USER_FAILURE'
export const DELETE_SAVED_MSG = 'DELETE_SAVED_MSG'

export const deleteUserRequest = createAction(DELETE_USER_REQUEST, 'loginId')
export const deleteUserSuccess = createAction(DELETE_USER_SUCCESS, 'loginId', 'response')
export const deleteUserFail = createAction(DELETE_USER_FAILURE, 'loginId', 'response')

export const GET_IVR_VENDOR_TECH_LIST_REQUEST = 'GET_IVR_VENDOR_TECH_LIST_REQUEST'
export const GET_IVR_VENDOR_TECH_LIST_SUCCESS = 'GET_IVR_VENDOR_TECH_LIST_SUCCESS'
export const GET_IVR_VENDOR_TECH_LIST_FAILURE = 'GET_IVR_VENDOR_TECH_LIST_FAILURE'

export const getIvrVendorTechListRequest = createAction(GET_IVR_VENDOR_TECH_LIST_REQUEST, 'loginId', 'vendorId')
export const getIvrVendorTechListSuccess = createAction(GET_IVR_VENDOR_TECH_LIST_SUCCESS, 'loginId', 'response')
export const getIvrVendorTechListFailure = createAction(GET_IVR_VENDOR_TECH_LIST_FAILURE, 'loginId', 'response')

export const GET_CURRENT_IVRPIN_REQUEST = 'GET_CURRENT_IVRPIN_REQUEST'
export const GET_CURRENT_IVRPIN_SUCCESS = 'GET_CURRENT_IVRPIN_SUCCESS'
export const GET_CURRENT_IVRPIN_FAILURE = 'GET_CURRENT_IVRPIN_FAILURE'

export const getCurrentIvrPinRequest = createAction(GET_CURRENT_IVRPIN_REQUEST, 'loginId', 'userId')
export const getCurrentIvrPinSuccess = createAction(GET_CURRENT_IVRPIN_SUCCESS, 'loginId', 'response')
export const getCurrentIvrPinFailure = createAction(GET_CURRENT_IVRPIN_FAILURE, 'loginId', 'response')


export const UNLINK_USER_FROM_VENDOR_ID_SUCCESS = "UNLINK_USER_FROM_VENDOR_ID_SUCCESS";
export const UNLINK_USER_FROM_VENDOR_ID_FAILURE = "UNLINK_USER_FROM_VENDOR_ID_FAILURE";

export const unlinkUserFromVendorIdSuccess = createAction(UNLINK_USER_FROM_VENDOR_ID_SUCCESS, 'loginId', 'response');
export const unlinkUserFromVendorIdFailure = createAction(UNLINK_USER_FROM_VENDOR_ID_FAILURE, 'loginId', 'response');

export const GET_MANAGER_SUBMARKET_REQUEST = 'GET_MANAGER_SUBMARKET_REQUEST'
export const GET_MANAGER_SUBMARKET_SUCCESS = 'GET_MANAGER_SUBMARKET_SUCCESS'
export const GET_MANAGER_SUBMARKET_FAILURE = 'GET_MANAGER_SUBMARKET_FAILURE'

export const getManagerSubmarketRequest = createAction(GET_MANAGER_SUBMARKET_REQUEST, 'subMarket')
export const getManagerSubmarketSuccess = createAction(GET_MANAGER_SUBMARKET_SUCCESS, 'subMarket', 'users')
export const getManagerSubmarketFailure = createAction(GET_MANAGER_SUBMARKET_FAILURE, 'subMarket', 'errors')

export const CREATE_UPD_IVR_USER_REQUEST = 'CREATE_UPD_IVR_USER_REQUEST'
export const CREATE_UPD_IVR_USER_SUCCESS = 'CREATE_UPD_IVR_USER_SUCCESS'
export const CREATE_UPD_IVR_USER_FAILURE = 'CREATE_UPD_IVR_USER_FAILURE'

export const createUpdIvrUserRequest = createAction(CREATE_UPD_IVR_USER_REQUEST, 'loginId')
export const createUpdIvrUserSuccess = createAction(CREATE_UPD_IVR_USER_SUCCESS, 'loginId', 'techId')
export const createUpdIvrUserFailure = createAction(CREATE_UPD_IVR_USER_FAILURE, 'loginId', 'error')

export const RELATED_VENDORS_REQUEST = 'RELATED_VENDORS_REQUEST'
export const RELATED_VENDORS_SUCCESS = 'RELATED_VENDORS_SUCCESS'
export const RELATED_VENDORS_FAILURE = 'RELATED_VENDORS_FAILURE'

export const fetchRelatedVendorRequest = createAction(RELATED_VENDORS_REQUEST, 'searchText')
export const fetchRelatedVendorSuccess = createAction(RELATED_VENDORS_SUCCESS, 'searchText', 'relatedVendors')
export const fetchRelatedVendorFailure = createAction(RELATED_VENDORS_FAILURE, 'searchText', 'errors')


export const VENDOR_PROFILE_REQUEST = 'VENDOR_PROFILE_REQUEST'
export const VENDOR_PROFILE_SUCCESS = 'VENDOR_PROFILE_SUCCESS'
export const VENDOR_PROFILE_FAILURE = 'VENDOR_PROFILE_FAILURE'

export const fetchVendorProfileRequest = createAction(VENDOR_PROFILE_REQUEST, 'request')
export const fetchVendorProfileSuccess = createAction(VENDOR_PROFILE_SUCCESS, 'singleVendors')
export const fetchVendorProfileFailure = createAction(VENDOR_PROFILE_FAILURE, 'errors')

export const RELATED_USERS_REQUEST = 'RELATED_USERS_REQUEST'
export const RELATED_USERS_SUCCESS = 'RELATED_USERS_SUCCESS'
export const RELATED_USERS_FAILURE = 'RELATED_USERS_FAILURE'

export const fetchRelatedUserRequest = createAction(RELATED_USERS_REQUEST, 'loginId')
export const fetchRelatedUserSuccess = createAction(RELATED_USERS_SUCCESS, 'relatedUsers')
export const fetchRelatedUserFailure = createAction(RELATED_USERS_FAILURE, 'errors')

export const DELETE_IVR_USER_REQUEST = 'DELETE_IVR_USER_REQUEST'
export const DELETE_IVR_USER_SUCCESS = 'DELETE_IVR_USER_SUCCESS'
export const DELETE_IVR_USER_FAILURE = 'DELETE_IVR_USER_FAILURE'

export const deleteIvrUserRequest = createAction(DELETE_IVR_USER_REQUEST, 'userId')
export const deleteIvrUserSuccess = createAction(DELETE_IVR_USER_SUCCESS, 'userId', 'response')
export const deleteIvrUserFailure = createAction(DELETE_IVR_USER_FAILURE, 'userId', 'error')

export const CREATE_UPD_TECH_VENDOR_COMPANY_REQUEST = 'CREATE_UPD_TECH_VENDOR_COMPANY_REQUEST'
export const CREATE_UPD_TECH_VENDOR_COMPANY_SUCCESS = 'CREATE_UPD_TECH_VENDOR_COMPANY_SUCCESS'
export const CREATE_UPD_TECH_VENDOR_COMPANY_FAILURE = 'CREATE_UPD_TECH_VENDOR_COMPANY_FAILURE'

export const createUpdTechVendorCompanyRequest = createAction(CREATE_UPD_TECH_VENDOR_COMPANY_REQUEST, 'login')
export const createUpdTechVendorCompanySuccess = createAction(CREATE_UPD_TECH_VENDOR_COMPANY_REQUEST, 'login', 'response')
export const createUpdTechVendorCompanyFailure = createAction(CREATE_UPD_TECH_VENDOR_COMPANY_REQUEST, 'login', 'error')

export const IVR_EMAIL_NOTIFICATION_REQUEST = 'IVR_EMAIL_NOTIFICATION_REQUEST'
export const IVR_EMAIL_NOTIFICATION_SUCCESS = 'IVR_EMAIL_NOTIFICATION_SUCCESS'
export const IVR_EMAIL_NOTIFICATION_FAILURE = 'IVR_EMAIL_NOTIFICATION_FAILURE'

export const ivrEmailNotificationRequest = createAction(IVR_EMAIL_NOTIFICATION_REQUEST)
export const ivrEmailNotificationSuccess = createAction(IVR_EMAIL_NOTIFICATION_SUCCESS, 'response')
export const ivrEmailNotificationFailure = createAction(IVR_EMAIL_NOTIFICATION_FAILURE, 'error')

export const ASSIGN_VENDOR_TECH_REQUEST = 'ASSIGN_VENDOR_TECH_REQUEST'
export const ASSIGN_VENDOR_TECH_SUCCESS = 'ASSIGN_VENDOR_TECH_SUCCESS'
export const ASSIGN_VENNDOR_TECH_FAILURE = 'ASSIGN_VENDOR_TECH_FAILURE'

export const assignVendorTechRequest = createAction(ASSIGN_VENDOR_TECH_REQUEST)
export const assignVendorTechSuccess = createAction(ASSIGN_VENDOR_TECH_SUCCESS, 'response')
export const assignVendorTechFailure = createAction(ASSIGN_VENNDOR_TECH_FAILURE, 'error')

export const ACTIVATE_USER_REQUEST = 'ACTIVATE_USER_REQUEST'
export const ACTIVATE_USER_SUCCESS = 'ACTIVATE_USER_SUCCESS'
export const ACTIVATE_USER_FAILURE = 'ACTIVATE_USER_FAILURE'

export const activateUserRequest = createAction(ACTIVATE_USER_REQUEST, 'loginId')
export const activateUserSuccess = createAction(ACTIVATE_USER_SUCCESS, 'loginId', 'response')
export const activateUserFail = createAction(ACTIVATE_USER_FAILURE, 'loginId', 'response')

export const SAVE_FILTERS = 'SAVE_FILTERS'

export const CONFIG_DATA_SUCCESS = "CONFIG_DATA_SUCCESS"
export const OSW_CLOSURE_SUCCESS = "OSW_CLOSURE_SUCCESS"

export const configDataSuccess = createAction(CONFIG_DATA_SUCCESS, "configData")
export const oswClosureCodesSuccess = createAction(OSW_CLOSURE_SUCCESS, "oswClosureCodes")

export function saveFilterPreferences(loginId, orderTypes, customerTypes, status, stateCode, city, genTypes) {
  let obj = {
    ordertype: orderTypes,
    customertype: customerTypes,
    status: status,
    genType: genTypes,
    state: stateCode && stateCode.length > 0 ? stateCode.map(i => i.value) : [],
    cities: city
  }
  return { type: SAVE_FILTERS, loginId, obj }
}

export function resendActivation5g(loginId, data) {
  return dispatch => {
    dispatch(activateUserRequest())
    return ajax.post(`/graphql5g`, data)
      .then(res => dispatch(activateUserSuccess(loginId, res.data)))
      .catch(ex => dispatch(activateUserFail(loginId, ex)))
  }
}

export function fetchUser(login_id,navigate) {
  return dispatch => dispatch(simpleLogin(login_id, '',navigate))
}

export function fetchUserIfNeeded(loginId) {
  return (dispatch, getState) => {
    const user = getState().getIn(['Users', 'entities', 'users', loginId], Map())
    if (!user.get('login_id')) {
      return dispatch(fetchUser(loginId))
    }
  }
}

export function fetchCurrentUser() {
  return dispatch => {
    dispatch(fetchUserRequest())
    return ajax.post(`/graphql4g`, {
      query: schema.userAuth, variables: {
        "input": getUserAuthInput("")
      }
    })
      .then(res => dispatch(fetchUserSuccess(res.data)))
      .catch(ex => dispatch(fetchUserFailure(ex)))
  }
}

export function fetchRelatedVendors(keyword) {
  return dispatch => {
    dispatch(fetchRelatedVendorRequest())
    return ajax.post(`/graphql4g`, {query: schema.getRelatedVendors, variables: {keyword}})
    .then(res => {
      if (!!res && !!res.data && !!res.data.data.getRelatedVendors && !!res.data.data.getRelatedVendors.data) {
        return dispatch(fetchRelatedVendorSuccess(res.data.data.getRelatedVendors.data))
      }
      if (!!res && !!res.data && !!res.data.errors && !!res.data.errors.length > 0) {
        return dispatch(fetchRelatedVendorFailure(res.data.errors[0].data))
      }
    })
    .catch(errors => dispatch(fetchRelatedVendorFailure(errors)))
  }
}

export function fetchVendorProfile(vendorId) {
  return dispatch => {
    dispatch(fetchVendorProfileRequest())
    return ajax.post(`/graphql4g`, {query: schema.getVendorProfile, variables: {vendorId}})
    .then(res => {
      if (!!res && !!res.data && !!res.data.data.getVendorProfile && !!res.data.data.getVendorProfile.data) {
        return dispatch(fetchVendorProfileSuccess(res.data.data.getVendorProfile.data))
      }
      if (!!res && !!res.data && !!res.data.errors && !!res.data.errors.length > 0) {
        return dispatch(fetchVendorProfileFailure(res.data.errors[0].data))
      }
    })
    .catch(errors => dispatch(fetchVendorProfileFailure(errors)))
  }
}

export function fetchRelatedUsers(keyword) {
  return dispatch => {
    dispatch(fetchRelatedUserRequest())
    return ajax.post(`/graphql4g`, {query: schema.getRelatedUsers, variables: {keyword}})
    .then(res => {
      if (!!res && !!res.data && !!res.data.data.getRelatedUsers && !!res.data.data.getRelatedUsers.data) {
        return dispatch(fetchRelatedUserSuccess(res.data.data.getRelatedUsers.data))
      }
      if (!!res && !!res.data && !!res.data.errors && !!res.data.errors.length > 0) {
        return dispatch(fetchRelatedUserFailure(res.data.errors[0].data))
      }
    })
    .catch(errors => dispatch(fetchRelatedUserFailure(errors)))
  }
}

export const SAVE_PREFERENCE_REQUEST = 'SAVE_PREFERENCE_REQUEST'
export const SAVE_PREFERENCE_SUCCESS = 'SAVE_PREFERENCE_SUCCESS'
export const SAVE_PREFERENCE_FAILURE = 'SAVE_PREFERENCE_FAILURE'

export const savePreferenceRequest = createAction(SAVE_PREFERENCE_REQUEST, 'loginid')
export const savePreferenceSuccess = createAction(SAVE_PREFERENCE_SUCCESS, 'loginid', 'response', 'data', 'prefType')
export const savePreferenceFailure = createAction(SAVE_PREFERENCE_FAILURE, 'loginid', 'errors')


export function savePreferencer(loginId, input) {
  let body = {
    query: schema.updatePreference,
    variables: {
      userPreferenceInput: input
    }
  }
  return (dispatch) => {
    dispatch(savePreferenceRequest(loginId))
    return ajax.post(`/graphql5g`, body)
      .then(res => {
        if (res.data && res.data.data && res.data.data.savePreference && res.data.data.savePreference
          && res.data.data.savePreference.code && res.data.data.savePreference.code === "200") {
          try {
            return dispatch(savePreferenceSuccess(loginId, res.data.data.savePreference, JSON.parse(input.Body.preference), input.Body.type))
          } catch (ex) {
            return dispatch(savePreferenceSuccess(loginId, res.data.data.savePreference, {}, input.Body.type))
          }

        } else {
          return dispatch(savePreferenceFailure(loginId, res.data.data.savePreference))
        }
      }).catch(() => dispatch(savePreferenceFailure(loginId, { message: "Unable to save the preference" })))
  }
}

export function updateDeviceDetails(loginId, inputObj) {
  let input = {
    query: schema.deleteDeviceDetail,
    variables: {
      testDeviceInput: inputObj
    }
  }

  return (dispatch) => {
    dispatch(updateDeviceDetailRequest(loginId))
    return ajax.post(`/graphql5g`, input)
      .then(res => {
        if (res.data && res.data.data && res.data.data.saveTestDevice) {
          const { Header, Body } = res.data.data.saveTestDevice
          if (Header.code == "200") {
            const { device } = Body
            return dispatch(updateDeviceDetailSuccess(loginId, device))
          }
        }
        return dispatch(updateDeviceDetailFailure(loginId, res.data.data))
      })
      .catch(ex => dispatch(updateDeviceDetailFailure(loginId, ex)))
  }
}

export function deviceColDetails(loginId, vendorId) {
  return (dispatch) => {
    dispatch(getDeviceColListRequest(loginId))
    return ajax.post(`/graphql5g`, { query: schema.getDeviceDetail, variables: { vendorId: vendorId } })
      .then(res => {


        if (res.data.data.getTestDevice && res.data.data.getTestDevice.Body) {
          const { deviceList, deviceColumnDef } = res.data.data.getTestDevice.Body
          let devicesObj = {}
          for (let i = 0; i < deviceList.length; i++) {
            devicesObj[deviceList[i].id] = {
              id: deviceList[i].id,
              status: deviceList[i].status,
              createdBy: deviceList[i].createdBy
            }
            let details = JSON.parse(deviceList[i].deviceDetails)
            for (let x in details) {
              devicesObj[deviceList[i].id][x] = details[x]
            }

          }
          return dispatch(getDeviceColListSuccess(loginId, {
            deviceList: devicesObj, deviceColumnDef
          }))
        }


      }).catch(errors => { dispatch(getDeviceColListFailure(loginId, errors)) })
  }
}

export function switchMarket(user) {
  let modUser = { user: user }
  return dispatch => {
    dispatch(fetchUserSuccess(modUser, false))
    ajax.post(`/graphql4g`, { query: schema.getConfigData, variables: { vendorId : user.vendor_id} })
              .then(resp => {
                dispatch(configDataSuccess(resp.data.data.getConfigData))})
  }
}

export function switchUser(user) {
  return {
    type: SWITCH_USER,
    user
  }
}

export function restoreUser(loginId) {
  return {
    type: RESTORE_USER,
    loginId
  }
}

export function login(loginId, password,navigate) {
  return dispatch => dispatch(simpleLogin(loginId, password,navigate)) 
}


export function updateIVRPin(input){
  return dispatch => {
    dispatch(updateIVRPinRequest())
    return ajax.post(`/graphql4g`,{query:schema.resetIVRPinSchema,variables: {input}})
    .then(res=>{
      if (!!res && !!res.data && !!res.data.data.resetIvrPin && !!res.data.data.resetIvrPin.errors)
      return dispatch(updateIVRPinFailure(res.data.data.resetIvrPin.errors))
      else if (!!res && !!res.data && !!res.data.data.resetIvrPin && !!res.data.data.resetIvrPin)
      return dispatch(updateIVRPinSuccess(res.data.data.resetIvrPin))
    })
    .catch(err => dispatch(updateIVRPinFailure(err)))
  }

}




export function getUserIVRDetails(userId){
  return dispatch => {
    dispatch(getUserIVRDetailsRequest())
    return ajax.post(`/graphql4g`,{query:schema.getIvrDetailsSchema,variables: {userId}})
    .then(res=>{
      dispatch(getUserIVRDetailsSuccess(res.data.data.getUserIVRDetails.ivr_profile))
    })
    .catch(err => dispatch(getUserIVRDetailsFailure(err)))

  }
  }

export function getVendorList(loginId, data) {

  return dispatch => {
    dispatch(getVendorListRequest())
    return ajax.post(`/graphql4g`, data)
      .then(res => {

        if (res && res.data && res.data.data && res.data.data.getVendorList && res.data.data.getVendorList.length > 0) {
          return dispatch(getVendorUserAuthByVendorId(loginId, res.data))
        }

        else if (res && res.data && res.data.data.getVendorList && res.data.data.getVendorList.length == 0) {
          let obj={
            "data":{
            "getVendorList":[{
              "vendor_id" : data.variables && data.variables.vendor_id
            }]
          }}
          return dispatch(getVendorUserAuthByVendorId(loginId, obj, true))
        }
        else if (res && res.data && res.data.errors && res.data.errors.length > 0) {
          return dispatch(getVendorListFail(loginId, res.data.errors))
        }

        //  dispatch(getVendorListSuccess(loginId, res.data))
      })
      .catch(ex => dispatch(getVendorListFail(loginId, ex)))
  }
}

function populateCompanyMap(companies) {
  let companyMap = {};
  for (let company of companies) {
    companyMap[company.VENDOR_ID.toString()] = company;
  }
  return companyMap;
}

export function getVendorUserAuthByVendorId(loginId, vendorList, noUsersInSubmarket) {
  return dispatch => {
    let vendorListParsed = vendorList['data']['getVendorList'];
    if (vendorListParsed && vendorListParsed.length > 0) {
      let vendorId = vendorListParsed[0].vendor_id;
      dispatch(getVendorUserAuthForVendorIdRequest())
      return ajax.post('/graphql4g', { query: schema.getVendorUserAuthForVendorId, variables: { vendorId: vendorId } }).then(innerResp => {
        if (innerResp && innerResp.data && innerResp.data.data && innerResp.data.data.getUserInfoVendorLinked && innerResp.data.data.getUserInfoVendorLinked.output) {
          let unfilteredLinkedUsers = innerResp.data.data.getUserInfoVendorLinked.output;
          let filteredLinkedUsers = [];
          for (let unfilteredUser of unfilteredLinkedUsers.users) {
            if (unfilteredUser.LINK_STATUS === "Y") {
              filteredLinkedUsers.push(unfilteredUser);
            }
          }
          unfilteredLinkedUsers.users = filteredLinkedUsers;
          let usersLinkedFromOutsideCompany = []
          if(noUsersInSubmarket){
            usersLinkedFromOutsideCompany = []
          }
          else usersLinkedFromOutsideCompany = vendorListParsed;

          if (vendorList && unfilteredLinkedUsers) {
            let companyMap = populateCompanyMap(unfilteredLinkedUsers.companies);
            if(noUsersInSubmarket){
              vendorListParsed = []
            }
            for (let user of unfilteredLinkedUsers.users) {
              let isUserExists = false;
              for (let vendor of vendorListParsed) {
                if (vendor.userid === user.OPSTRACKER_USERID) {
                  isUserExists = true;
                  break;
                }
              }
              if (!isUserExists) {
                let companyObj = companyMap[user.LINKED_VENDOR_ID];
                let newUser = {
                  "contact_unid": user.CONTACT_UNID,
                  "userid": user.OPSTRACKER_USERID,
                  "email": user.EMAIL_ADDRESS,
                  "vendor_id": user.LINKED_VENDOR_ID,
                  "fname": user.FIRST_NAME,
                  "lname": user.LAST_NAME,
                  "phone": user.PHONE_NUMBER,
                  "name": user.FIRST_NAME + " , " + user.LAST_NAME,
                  "vendor_role": "PORTALUSER",
                  "vendor_service_email": companyObj && companyObj.VENDOR_SERVICE_EMAIL ? companyObj.VENDOR_SERVICE_EMAIL : null,
                  "vendor_sponsor_email": companyObj && companyObj.VENDOR_SPONSER_EMAIL ? companyObj.VENDOR_SPONSER_EMAIL : null,
                  "vendor_sponsor_id": companyObj && companyObj.VENDOR_SPONSORID ? companyObj.VENDOR_SPONSORID : null,
                  "techID": null,
                  "ivr_status": user.IVR_ACTIVE,
                  "vendor_sponsor_id":companyObj &&  companyObj.VENDOR_SPONSORID ? companyObj.VENDOR_SPONSORID : null,
                  "vendor_region": companyObj && companyObj.VENDOR_REGION ? companyObj.VENDOR_REGION : null,
                  "vendor_peoplesoft_id": companyObj && companyObj.VENDOR_PEOPLESOFTID ? companyObj.VENDOR_PEOPLESOFTID : null,
                  "vendor_name": companyObj && companyObj.VENDOR_NAME ? companyObj.VENDOR_NAME : null,
                  "vendor_category": companyObj && companyObj.VENDOR_CATEGORY ? companyObj.VENDOR_CATEGORY : null,
                  "vendor_area": companyObj && companyObj.VENDOR_AREA ? companyObj.VENDOR_AREA : null,
                  "vendor_address": companyObj && companyObj.VENDOR_ADDRESS ? companyObj.VENDOR_ADDRESS : null
                }
                usersLinkedFromOutsideCompany.push(newUser);
              }
            }
            vendorList['data']['getVendorList'] = usersLinkedFromOutsideCompany;
            dispatch(getVendorUserAuthForVendorIdSuccess(loginId, unfilteredLinkedUsers));
            dispatch(getVendorListSuccess(loginId, vendorList));
          }
        } else {
          dispatch(getVendorUserAuthForVendorIdFailure(loginId))
        }
      })
    }

  }
}


export function unlinkUserFromVendorId(login, linkedUserId) {
  return dispatch => {
    return ajax.post(`/graphql4g`, { query: schema.unlinkUserFromVendorId, variables: { id: linkedUserId, name: login } })
      .then(res => {
        let response = res.data.data.unLinkVendor.output.unlink_status;
        if (response.status === "Success") {
          return unlinkUserFromVendorIdSuccess(login, res.data);
        } else {
          return unlinkUserFromVendorIdFailure(login, "Unlink failed :" + response.status);
        }

      })
      .catch(ex => unlinkUserFromVendorIdFailure(login, ex))
  }
}


export function createUser(loginId, data) {

  return dispatch => {
    dispatch(createUserRequest())
    return ajax.post(`/graphql4g`, data)
      .then(res => dispatch(createUserSuccess(loginId, res.data)))
      .catch(ex => dispatch(createUserFail(loginId, ex)))
  }
}
export const LINK_USER_SUCCESS = 'LINK_USER_SUCCESS'
export const LINK_USER_FAILURE = 'LINK_USER_FAILURE'
export const linkUserToCmpSuccess = createAction(LINK_USER_SUCCESS, 'loginId', 'response')
export const linkUserToCmpFail = createAction(LINK_USER_FAILURE, 'loginId', 'error')
export function linkUserToCmp(loginId, data) {

  return dispatch => {

    return ajax.post(`/graphql4g`, data)
      .then(res => dispatch(linkUserToCmpSuccess(loginId, res.data)))
      .catch(ex => dispatch(linkUserToCmpFail(loginId, ex)))
  }
}

export const USER_INFO_LINKED_SUCCESS = 'USER_INFO_LINKED_SUCCESS'
export const USER_INFO_LINKED_FAILURE = 'USER_INFO_LINKED_FAILURE'
export const getUserInfoLinkedSuccess = createAction(USER_INFO_LINKED_SUCCESS, 'loginId', 'response')
export const getUserInfoLinkedFail = createAction(USER_INFO_LINKED_FAILURE, 'loginId', 'error')

export const ACTIVE_DOMAIN_REQUEST ='ACTIVE_DOMAIN_REQUEST'
export const ACTIVE_DOMAIN_SUCCESS = 'ACTIVE_DOMAIN_SUCCESS'
export const ACTIVE_DOMAIN_FAILURE = 'ACTIVE_DOMAIN_FAILURE'
export const activeDomainRequest = createAction(ACTIVE_DOMAIN_REQUEST, 'loginId', 'response')
export const activeDomainsSuccess = createAction(ACTIVE_DOMAIN_SUCCESS, 'loginId', 'response')
export const activeDomainsFailure = createAction(ACTIVE_DOMAIN_FAILURE, 'loginId', 'errors')

export function getUserInfoLinked(loginId, data) {

  return dispatch => {

    return ajax.post(`/graphql4g`, data)
      .then(res => dispatch(getUserInfoLinkedSuccess(loginId, res.data)))
      .catch(ex => dispatch(getUserInfoLinkedFail(loginId, ex)))
  }
}


export function updateUser(loginId, data, user) {

  return dispatch => {
    dispatch(updateUserRequest())
    return ajax.post(`/graphql4g`, data)
      .then(res => {
        if (user && data.variables.VendorInput.phone) { user.phone = data.variables.VendorInput.phone }
        return dispatch(updateUserSuccess(loginId, res.data, user))
      })
      .catch(ex => dispatch(updateUserFail(loginId, ex)))
  }
}


export function activeDomains(loginId, userId){
  return dispatch => {
    dispatch(activeDomainRequest(loginId, userId))
    return ajax.post(`/graphql4g`, { query: schema.activeDomainsDef, variables: { userId:userId} })
      .then(res =>{
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
         return dispatch(activeDomainsFailure(loginId, res.data.errors))
        }
       if (res.data && res.data.data && res.data.data.getVendorDomains)
       return dispatch(activeDomainsSuccess(loginId, res.data.data.getVendorDomains))})
      .catch(errors => dispatch(activeDomainsFailure(loginId, errors)))
  }
}


export function deleteUser(loginId, data) {

  return dispatch => {
    dispatch(deleteUserRequest())
    return ajax.post(`/graphql4g`, data)
      .then(res => dispatch(deleteUserSuccess(loginId, res.data)))
      .catch(ex => dispatch(deleteUserFail(loginId, ex)))
  }
}

export function createUser5g(loginId, data) {

  return dispatch => {
    dispatch(createUserRequest())
    return ajax.post(`/graphql5g`, data)
      .then(res => dispatch(createUserSuccess(loginId, res.data)))
      .catch(ex => dispatch(createUserFail(loginId, ex)))
  }
}

export function updateUser5g(loginId, data, user) {

  return dispatch => {
    dispatch(updateUserRequest())
    return ajax.post(`/graphql5g`, data)
      .then(res => {
        if (user && data.variables.VendorInput.phone) { user.phone = data.variables.VendorInput.phone }
        return dispatch(updateUserSuccess(loginId, res.data, user))
      })
      .catch(ex => dispatch(updateUserFail(loginId, ex)))
  }
}


export function deleteUser5g(loginId, data) {

  return dispatch => {
    dispatch(deleteUserRequest())
    return ajax.post(`/graphql5g`, data)
      .then(res => dispatch(deleteUserSuccess(loginId, res.data)))
      .catch(ex => dispatch(deleteUserFail(loginId, ex)))
  }
}
export function getUserAuthInput(loginId = "") {
  return {
    Header: {
      transactionId: `get_user_auth${moment().valueOf()}`,
      client_name: "NVP"
    },
    Body: {
      appName: "NVP",
      email: loginId
    }
  }
}
export function simpleLogin(loginId, password,navigate) {
  return (dispatch, getState) => {
    const quarterStartMonths = [1,4,7,10]; // January, April, July, October
    const isQuarterStart = quarterStartMonths.includes(new Date().getMonth() + 1);
    dispatch(loginRequest())
    return ajax.post(`/graphql4g`, { query: schema.userAuth, variables: {"input": getUserAuthInput(loginId)}})
      .then(async res => {
        const userStatus = res?.data?.data?.getUserAuth?.user?.user_status && res?.data?.data?.getUserAuth?.user?.user_status.toLowerCase();
        if(isQuarterStart && userStatus !== 'active' && userStatus !== null && userStatus !== "") {
          ajax.post('graphql4g', { query: schema.getVendorListDef, variables: { vendor_id: res.data.data.getUserAuth.user.vendor_id } })
            .then(response => {
              const portalAdminList = response?.data?.data?.getVendorList?.filter(vendor => vendor.vendor_role === 'PORTALADMIN'),
                    loggedInId = res?.data?.data?.getUserAuth?.user?.userid;
              navigate(config.filepath + 'suspended', { state: { portalAdminList, loggedInId } })
            })
        } else {
          await dispatch(loginSuccess(res.data.data.getUserAuth, password))
          let wno_user = res?.data?.data?.getUserAuth?.user?.wno_user;
          if(wno_user == 'Y'){
            navigate(config.filepath + 'vwrsSearch')
          } else if (res?.data?.data?.getUserAuth?.user) {
            ajax.post('/graphql4g', {query: schema.getOpenOswForUser, variables: {"user_id": res.data.data.getUserAuth.user.userid}})
                .then(slrResonse => {
                  if(slrResonse && slrResonse.data && slrResonse.data.data && slrResonse.data.data.getOpenOswForUser && slrResonse.data.data.getOpenOswForUser.openOsw.length > 0) {
                   dispatch(getOpenOswSuccess(slrResonse.data.data.getOpenOswForUser))
                    try {
                      establishSocket(res.data.data.getUserAuth.user.userid)
                    } catch {
                      console.log("error in establishing the socket connection")
                    }
                  }
                  else{
                    dispatch(getOpenOswFailure('No data'))
                  }
                })
                dispatch({ type: 'SYNC_USER_PREFERENCES' })
                let path = ''
                let user = res.data.data.getUserAuth.user
                // to pass username & userid to new relic
                try {
                  console.log("User name, userid--", user.name, user.userid)
                  window.newrelic.interaction()
                    .setAttribute('username', user.name)
                    .setAttribute('userId', user.userid)
                } catch (e) {
                  console.log("Newrelic username setting up error-")
                }       
                let favVendorId = null;
                let lastAccessVendorId = null;
                if (user.favoriteSubMarket) {
                  let favSubMarket = user.favoriteSubMarket.split('-');
                  favVendorId = favSubMarket[favSubMarket.length - 1];
                }
                if (user.lastAccessedSubMarket) {
                  let lastAccSubMkt = user.lastAccessedSubMarket.split('-');
                  lastAccessVendorId = lastAccSubMkt[lastAccSubMkt.length - 1]
                }
                let vendorId;
                if (favVendorId !== null && favVendorId !== undefined && favVendorId !== "undefined") {
                  vendorId = favVendorId;
                } else if (lastAccessVendorId !== null && lastAccessVendorId !== undefined && lastAccessVendorId !== "undefined") {
                  vendorId = lastAccessVendorId;
                } else {
                  vendorId = user.vendor_id;
                }
                ajax.post(`/graphql4g`, { query: schema.getConfigData, variables: { vendorId : vendorId} })
                    .then(resp => {
                      let osw_closure_codes_obj = {};
                      if (resp?.data?.data?.getConfigData?.oswClosureCodes) {
                        resp.data.data.getConfigData.oswClosureCodes.forEach(element => {
                          if (osw_closure_codes_obj[element['ATTRIBUTE_NAME']]) {
                            osw_closure_codes_obj[element['ATTRIBUTE_NAME']].push(element['ATTRIBUTE_VALUE']);
                          } else {
                            osw_closure_codes_obj[element['ATTRIBUTE_NAME']] = [element['ATTRIBUTE_VALUE']];
                          }
                        });
                      }
                      dispatch(oswClosureCodesSuccess(osw_closure_codes_obj))
                      dispatch(configDataSuccess(resp?.data?.data?.getConfigData))
                      ajax.post('graphql4g', { query: schema.getVendorListDef, variables: { vendor_id: res.data.data.getUserAuth.user.vendor_id } })
                        .then(response => {
                          dispatch(getVendorUserAuthByVendorId(loginId, response.data))
                          dispatch(getVendorListSuccess(loginId, response.data))
                          ajax.post('/graphql4g', { query: schema.getVendorUserAuth, variables: { vendorEmail: res.data.data.getUserAuth.user.email } }).then(innerResp => {
                            if (innerResp?.data?.data?.getVendorUserAuth?.output) {
                              dispatch(getVendorUserAuthSuccess(loginId, innerResp.data.data.getVendorUserAuth.output))
                              path = userUtils.getHomePath(getState())
                              navigate(userUtils.getHomePath(getState()))
                            }
                          })
                        })
                    })         
          }else {
            navigate(config.filepath + 'login')
            dispatch(loginFail(res.data.errors))
            return res.data;
          }
        }
      })
      .catch(errors => dispatch(loginFail(errors)))
  }
}

export const logout = (query,navigate) => {
  sessionStorage.removeItem('oswRedirect');
  return dispatch => {
    dispatch(deleteUserRequest())
    disconnectSocket()
    return ajax.post(`/graphql4g`, { query })
      .then(() => {
        const ssoUser = userUtils.isSSOUSER(store.getState())
        if (ssoUser) {
          const logoutSSOURL = userUtils.ssoLogoutUrl(store.getState())
          console.log('logoutSSOURL', logoutSSOURL)
          if (logoutSSOURL) {
            //  window.location.replace(logoutSSOURL)
          }
        } else {
          dispatch({ type: 'USER_LOGOUT' })
          navigate(config.filepath + 'logged-out')
        }
        if (window.timeoutID) {
          clearTimeout(window.timeoutID)
          window.timeoutID = 0
        }
      })
      .catch(ex => dispatch(deleteUserFail("DELETEALL", ex)))
  }

}

export const session = (query, navigate) => {
  return dispatch => {
    return ajax.post(`/graphql4g`, { query })
      .then((res) => {
        if (res && res.data && res.data.errors && res.data.errors.length > 0 && res.data.errors[0]["name"] === "UnAuthorized") {
          dispatch({ type: 'USER_LOGOUT' })
          dispatch(navigate(config.filepath + 'logged-out'))
          if (window.timeoutID) {
            clearTimeout(window.timeoutID)
            window.timeoutID = 0
          }
        }

      })
      .catch(ex => dispatch(deleteUserFail("DELETEALL", ex)))
  }

}

export const expires = (query,navigate) => {

  return dispatch => {
    dispatch(deleteUserRequest())
    return ajax.post(`/graphql4g`, { query })
      .then(() => {
        dispatch({ type: 'USER_LOGOUT' })
        navigate(config.filepath + 'sesion-expires')
        if (window.timeoutID) {
          clearTimeout(window.timeoutID)
          window.timeoutID = 0
        }
      })
      .catch(ex => dispatch(deleteUserFail("DELETEALL", ex)))
  }

}
export function deleteMsg(loginId) {
  return {
    type: DELETE_SAVED_MSG,
    loginId
  }
}
export function getManagerInfoSubmarket(submarket) {
  return dispatch => {
    dispatch(getManagerSubmarketRequest())
    return ajax.post(`/graphql4g`, { query: schema.getManagersForSubmarket, variables: { submarket } })
      .then(res => dispatch(getManagerSubmarketSuccess(submarket, res.data)))
      .catch(ex => dispatch(getManagerSubmarketFailure(submarket, ex)))
  }
}

export function createUpdVendorTechCompany(login, data) {
  return dispatch => {
    dispatch(createUpdTechVendorCompanyRequest())
    return ajax.post(`/graphql4g`, data)
      .then(res => dispatch(createUpdTechVendorCompanySuccess(login, res.data)))
      .catch(ex => dispatch(createUpdTechVendorCompanyFailure(login, ex)))
  }
}

export function createUpdIvr(loginId, data) {
  return dispatch => {
    dispatch(createUpdIvrUserRequest())
    return ajax.post(`/graphql4g`, data)
      .then(res => dispatch(createUpdIvrUserSuccess(loginId, res.data)))
      .catch(ex => dispatch(createUpdIvrUserFailure(loginId, ex)))
  }
}

export function getIvrVendorTech(login, vendorId) {
  return dispatch => {
    dispatch(getIvrVendorTechListRequest())
    return ajax.post(`/graphql4g`, { query: schema.getVendorTechForVendorId, variables: { login, vendorId } })
      .then(res => dispatch(getIvrVendorTechListSuccess(login, res.data)))
      .catch(ex => dispatch(getIvrVendorTechListFailure(login, ex)))
  }
}

export function getIvrDetailsForVendor(login, vendorId) {
  return dispatch => {
    dispatch(getIvrVendorTechListRequest())
  return ajax.post(`/graphql4g`, { query: schema.getVendorTechForVendorId, variables: { login, vendorId } })
    .then(res => 
      dispatch(getIvrVendorTechListSuccess(login, res.data)))
    .catch(ex => 
      dispatch(getIvrVendorTechListFailure(login, ex)))
}}

export function getCurrentIvrPin(login, userId) {
  return dispatch => {
    dispatch(getCurrentIvrPinRequest())
    return ajax.post(`/graphql4g`, { query: schema.getCurrentPinBYUserId, variables: { login, userId } })
      .then(res => dispatch(getCurrentIvrPinSuccess(login, res.data)))
      .catch(ex => dispatch(getCurrentIvrPinFailure(login, ex)))
  }
}

export function deleteIvrUser(login, userId) {
  return dispatch => {
    dispatch(deleteIvrUserRequest())
    return ajax.post(`/graphql4g`, { query: schema.delIvrTechUser, variables: { login, userId } })
      .then(res => dispatch(deleteIvrUserSuccess(userId, res.data)))
      .catch(ex => dispatch(deleteIvrUserFailure(userId, ex)))
  }
}

export function ivrEmailNotify(login, data) {
  return dispatch => {
    dispatch(ivrEmailNotificationRequest())
    return ajax.post(`/graphql4g`, data)
      .then(res => dispatch(ivrEmailNotificationSuccess(res.data)))
      .catch(ex => dispatch(ivrEmailNotificationFailure(ex)))

  }
}

export function assignVendorTech(login, data) {
  return dispatch => {
    dispatch(assignVendorTechRequest())
    return ajax.post(`/graphql4g`, data)
      .then(res => dispatch(assignVendorTechSuccess(res.data)))
      .catch(ex => dispatch(assignVendorTechFailure(ex)))
  }
}

// Api call to Update the Release Note Popup flag
export const UPDATE_RELEASE_NOTES_POPUP_SUCCESS = 'UPDATE_RELEASE_NOTES_POPUP_SUCCESS'
export const updateReleaseNotesSuccess = createAction(UPDATE_RELEASE_NOTES_POPUP_SUCCESS, 'loginId')
export function releaseNotesPopupApiCall(loginId, reqBody) {
  return dispatch => {
    return ajax.post(`/graphql5g`, reqBody)
      .then(res => {
        if (res.data.data.saveReleaseNotesStatus.Body.releaseNotes.status && res.data.data.saveReleaseNotesStatus.Body.releaseNotes.status == "Success") {
          dispatch(updateReleaseNotesSuccess(loginId))
        }
      })
      .catch(err => {
        console.log(err, "error updating the Release Notes Status")
      })
  }
}

export const MAKEME_USER_REQUEST = 'MAKEME_USER_REQUEST'
export const makemeUserRequest = createAction(MAKEME_USER_REQUEST, 'selecteduser')

export function makemeUser(selecteduser) {
  return async dispatch => {
    let dispatchedItem = await dispatch(makemeUserRequest(selecteduser))
    ajax.post(`/graphql4g`, { query: schema.getConfigData, variables: { vendorId: selecteduser.vendor_id } })
      .then(resp => {
        dispatch(configDataSuccess(resp.data.data.getConfigData))
      })


    return dispatchedItem
  }
}

export function resendUserActivationInvite(data) {
  return ajax.post('graphql4g', data)
}

export function issueReportRequest(data) {
  return ajax.post('graphql4g', data)
}

export function issoResetAccountReq(data) {
  return ajax.post('graphql4g', data)
}



export const UPDATE_USER_OBJ = "UPDATE_USER_OBJ";
export const updateUserObjReducer = createAction(UPDATE_USER_OBJ, 'updatedUser')

export const NAVBAR_LOAD_REQUEST = 'NAVBAR_LOAD_REQUEST'
export const initialNavbarLoadRequest = createAction(NAVBAR_LOAD_REQUEST, 'loaded')

export const VENDOR_BANNER_TOGGLE = "VENDOR_BANNER_TOGGLE"
export const toggleVendorDeactivateBannerReducer = createAction(VENDOR_BANNER_TOGGLE, 'data')
