import { combineReducers } from 'redux-immutable'
import { deleteCookie } from './http_utils'
import { Users } from './Users/reducer'
import Tables from './Layout/table_reducer'
import Forms from './Forms/reducer'
import { LOCATION_CHANGE } from 'react-router-redux'
import { fromJS } from 'immutable'
import VendorDashboard from './VendorDashboard/reducer'
import PmDashboard from './PreventiveMaintenance/reducer'
import CapitalDashboard from './CapitalDashboard/reducer'
import UserDashboard from './UserDashboard/reducer'
import Switch from './Switch/reducer'
import ivr from './redux/src/ivr/reducer'
import http from './redux/src/http/http'
import Alarms from './Alarms/reducer'
import Elog from './Elog/reducer'
import Sites from './sites/reducer'
import GenRunReport from './GenRunReport/reducer'
import CapitalProjectDashboard from './CapitalProjectDashboard/reducer'
import AppNotificationReducer from './AppNotification/reducer'

const initialState = fromJS({ locationBeforeTransitions: null })

function Routes(state = initialState, { type, payload } = {}) {
  if (type === LOCATION_CHANGE) {
    return state.merge({ locationBeforeTransitions: fromJS(payload) })
  }

  return state
}

const appReducer = combineReducers({
  PmDashboard,
  VendorDashboard,
  CapitalDashboard,
  UserDashboard,
  ivr,
  http,
  Forms,
  Routes,
  Alarms,
  Tables,
  Users,
  Elog,
  Sites,
  Switch,
  CapitalProjectDashboard,
  AppNotificationReducer,
  GenRunReport
  // issueInformation
})

const rootReducer = (state, action) => {

  if (action.type === 'USER_LOGOUT') {
    state = undefined
  }

  const result = appReducer(state, action)

  if (action.type === 'USER_LOGOUT') {
    deleteCookie('IOP_AUTH')
    deleteCookie('IOP_AUTH_ERROR')
  }
  return result
}

export default rootReducer
