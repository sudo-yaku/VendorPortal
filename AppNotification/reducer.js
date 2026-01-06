import * as actions from './actions'
import { Map, List, fromJS } from 'immutable'
import browserStorage from '../browserStorage'


export function AppNotificationReducer(state = Map(), action) {
  switch (action.type) {
    case actions.UPDATE_APP_NOTIFICATION:
      return state.setIn(["appNotification"], action.notificationObj)
    default:
      return state
  }
}

export default AppNotificationReducer;