import { Map, List } from 'immutable'
import * as usStateCodes from 'us-state-codes'
import * as stateCities from 'state-cities'
import * as _ from 'lodash'
import config from '../config'

export function getStatesForCountry() {
  let states = stateCities.getStates()
  return states.map(state => { return ({ value: _.startCase(_.toLower(state)), label: _.startCase(_.toLower(state)), name: 'state', code: usStateCodes.getStateCodeByStateName(state) }) })
}

export function getCitiesForState(state) {
  if (!state || !stateCities) return
  let cityList = stateCities.getCities(state) || []
  cityList = cityList.sort()
  return cityList.map(city => { return ({ value: _.startCase(_.toLower(city)), label: _.startCase(_.toLower(city)), name: 'city' }) })
}

export const afterLogin = { pathname: null }

export function getCurrentUser(state = Map()) {
  const loginId = state.getIn(['Users', 'currentUser', 'loginId'])

  return state.getIn(['Users', 'entities', 'users', loginId], Map())
}
export function getAuthLoading(state = Map()) {
  return state.getIn(['Users', 'currentUser', 'loading'], false)
}
export function getRealUser(state = Map()) {
  const loginId = state.getIn(['Users', 'realUser', 'loginId'])

  return state.getIn(['Users', 'entities', 'users', loginId], Map())
}
export function isSSOUSER(state = Map()) {
  const loginId = state.getIn(['Users', 'currentUser', 'loginId'])
  const issoUser = state.getIn(['Users', 'entities', 'users', loginId, 'isssouser'], false)
  return issoUser;
}


export function ssoLogoutUrl(state = Map()) {
  const loginId = state.getIn(['Users', 'realUser', 'loginId'])
  const issoUser = state.getIn(['Users', 'entities', 'users', loginId, 'isssouser'], false)
  const ssoLogoutURL = issoUser ? state.getIn(['Users', 'entities', 'users', loginId, 'ssoLogoutURL'], null) : null
  let url = ssoLogoutURL ? `${ssoLogoutURL}` : null;
  return url;
}

export function getHomePath(state = Map()) {
  const loginId = state.getIn(['Users', 'currentUser', 'loginId'])
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''
  let userInfo = state.getIn(['Users', 'entities', 'users', loginId], Map())
  const Category = state.getIn(['Users', 'entities', 'users', loginId, 'vendor_category'])
  const secStateCategory = state.getIn(['vendor_category'])

  const url = window.location.href;
  const splitedUrl = url.split("?")
  const params = (splitedUrl && splitedUrl.length > 1 )? `?${splitedUrl[1]}`:null;

  const user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user && user.toJS() && user.toJS().vendor_id ? user.toJS().vendor_id : ''
  const configData = state.getIn(['Users', 'configData', "configData"], Map())
  const configDataObj = configData && configData.toJS() ? configData.toJS() : {}
  const configDataArray = configDataObj && configDataObj.hasOwnProperty("configData") ? configDataObj.configData.filter(item => ["CBAND", "SNAP", "5GR"].includes(item.ATTRIBUTE_CATEGORY)) : [];
  let UsersList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let UsersListObj = UsersList && UsersList.toJS() ? UsersList.toJS() : [];
 

  let isUserOffShore = false;
  if (userInfo && userInfo.toJS() && userInfo.toJS().isUserOffShore){
    isUserOffShore = userInfo.toJS().isUserOffShore
  }

  if ((ssoUrl && ssoUrl.includes('ssologin') && isssouser) || isUserOffShore=='true') {
    return config.filepath + 'userdashboard'
  }
  else if (userInfo && userInfo.get('vendor_category') && ((userInfo.get('vendor_category').toLowerCase()) == "capital vendor")) {
    return config.filepath + 'capitalDashboard'
  }
  else if (configDataArray.length > 0 && UsersListObj.length > 0 &&
    configDataArray.find(item => item.ATTRIBUTE_VALUE.split(",").includes(String(UsersListObj[0].vendor_peoplesoft_id)))
  ) {
    return config.filepath + 'dashboard';
  }
  else if (userInfo && userInfo.get('vendor_category') && ((userInfo.get('vendor_category').toLowerCase()) == "nest evaluation")) {
    return config.filepath + 'nestEvaluation'
  }
  else {
    return config.filepath + 'dashboard'
  }

    }


export function validateEmail(emailid) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (re.test(emailid)) {
    return true
  } else {
    return false
  }
}
export const NO_PROFILE_PIC = `data:image/png;base64,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`
