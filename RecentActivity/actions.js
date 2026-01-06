import ajax, { rawClient } from '../ajax'
import { createAction } from '../redux_utils'
import * as schema from './schema'

export const RECENT_ACTIVITY_REQUEST = 'RECENT_ACTIVITY_REQUEST'
export const RECENT_ACTIVITY_SUCCESS = 'RECENT_ACTIVITY_SUCCESS'
export const RECENT_ACTIVITY_FAILURE = 'RECENT_ACTIVITY_FAILURE'

export const updateRecentActivityRequest = createAction(RECENT_ACTIVITY_REQUEST)
export const updateRecentActivitySuccess = createAction(RECENT_ACTIVITY_SUCCESS, 'recentActivity')
export const updateRecentActivityFailure = createAction(RECENT_ACTIVITY_FAILURE, 'errors')

export function getRecentActivity(userId) {
    return dispatch => {
        dispatch(updateRecentActivityRequest(userId))
        return ajax.post('/graphql4g', {
            query: schema.getRecentActivity,
            variables: { userId: userId }
        })
            .then(res => {
                dispatch(updateRecentActivitySuccess(res.data.data.getRecentActivity.recent_activities))
                return res.data.data.getRecentActivity.recent_activities;
            })
            .catch(errors => dispatch(updateRecentActivityFailure(errors)))
    }
}