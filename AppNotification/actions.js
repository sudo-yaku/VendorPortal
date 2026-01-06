import { createAction } from '../redux_utils'
import config from '../config'

export const UPDATE_APP_NOTIFICATION = "UPDATE_APP_NOTIFICATION"
export const updateAppNotification = createAction(UPDATE_APP_NOTIFICATION, 'notificationObj')
export function redirectOnClickOfNotification(path, navigate) {
    return dispatch => dispatch(navigate(config.filepath+path))
  }