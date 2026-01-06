import * as actions from './actions'
import {Map, List, fromJS} from 'immutable'

export function CapitalDashboard (state = Map(), action) {
  switch (action.type) {
  case actions.GET_PROJECTS_REQUEST:
    return state.setIn([action.loginId, "getCapitalWork", "isloading"], true)
  case actions.GET_POJETCS_SUCCESS:
    return state.setIn([action.loginId, "getCapitalWork", "isloading"], false)
                .setIn([action.loginId, "getCapitalWork", "projects"], fromJS(action.projects))
  case actions.GET_PROJETCS_FAILURE:
    return state.setIn([action.loginId, "getCapitalWork", "isloading"], false)
                .setIn([action.loginId, "getCapitalWork", "errors"], fromJS(action.errors))
  default:
    return state

  }
}
export default CapitalDashboard