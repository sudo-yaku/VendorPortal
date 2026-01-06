import ajax from '../ajax'
import {createAction} from '../redux_utils'
import * as schema from './schema'

export const FETCH_VSM_ALARMS_FOR_SITE_REQUEST = 'FETCH_VSM_ALARMS_FOR_SITE_REQUEST'
export const FETCH_VSM_ALARMS_FOR_SITE_SUCCESS = 'FETCH_VSM_ALARMS_FOR_SITE_SUCCESS'
export const FETCH_VSM_ALARMS_FOR_SITE_FAILURE = 'FETCH_VSM_ALARMS_FOR_SITE_FAILURE'

export const fetchVSMAlarmsForSiteRequest = createAction(FETCH_VSM_ALARMS_FOR_SITE_REQUEST, 'id')
export const fetchVSMAlarmsForSiteSuccess = createAction(FETCH_VSM_ALARMS_FOR_SITE_SUCCESS, 'id', 'alarms')
export const fetchVSMAlarmsForSiteFailure = createAction(FETCH_VSM_ALARMS_FOR_SITE_FAILURE, 'id', 'errors')

export function fetchVSMAlarmsForSite (site_unid) {
  return dispatch => {
    dispatch(fetchVSMAlarmsForSiteRequest(site_unid))
    return ajax.post(`/graphql4g`, {query: schema.getAlarmQuery, variables: {site_unid}})
      .then(res => {
        if (res.data && res.data.data && res.data.data.getAlarm && res.data.data.getAlarm.alarms) {
          return dispatch(fetchVSMAlarmsForSiteSuccess(site_unid, res.data.data.getAlarm.alarms))
        } else if (res.data && res.data.errors && res.data.errors.length > 0) {
          return dispatch(fetchVSMAlarmsForSiteFailure(site_unid, res.data.errors[0]))
        } else {
          return dispatch(fetchVSMAlarmsForSiteFailure(site_unid, res.data))
        }
      })
      .catch(ex => dispatch(fetchVSMAlarmsForSiteFailure(site_unid, ex)))
  }
}
