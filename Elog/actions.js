import ajax from '../ajax'
import {createAction} from '../redux_utils'
import * as schema from './schema'
// Fetch Elog  by WorkOrder ID
export const FETCH_ELOG_REQUEST = 'FETCH_ELOG_REQUEST'
export const FETCH_ELOG_SUCCESS = 'FETCH_ELOG_SUCCESS'
export const FETCH_ELOG_FAILURE = 'FETCH_ELOG_FAILURE'

export const fetchElogRequest = createAction(FETCH_ELOG_REQUEST, 'workOrderID')
export const fetchElogSuccess = createAction(FETCH_ELOG_SUCCESS, 'workOrderID', 'elogs')
export const fetchElogFailure = createAction(FETCH_ELOG_FAILURE, 'workOrderID', 'errors')
// res.data.data.getElogForWorkorder
export function fetchElogByWorkOrderID (vendor, workorder_id) {
  return dispatch => {
    dispatch(fetchElogRequest(workorder_id))
    return ajax.post(`/graphql4g`, {query:schema.getElogforWorkOrder, variables:{vendor, workorder_id}})
      .then(res => dispatch(fetchElogSuccess(workorder_id, res.data.data.getElogForWorkorder.listItems)))
      .catch(errors => dispatch(fetchElogFailure(workorder_id, errors)))
  }
}

// Fetch ElogComment  by ELOG INFO ID
export const FETCH_ELOGCOMMENT_REQUEST = 'FETCH_ELOGCOMMENT_REQUEST'
export const FETCH_ELOGCOMMENT_SUCCESS = 'FETCH_ELOGCOMMENT_SUCCESS'
export const FETCH_ELOGCOMMENT_FAILURE = 'FETCH_ELOGCOMMENT_FAILURE'

export const fetchElogCommentRequest = createAction(FETCH_ELOGCOMMENT_REQUEST, 'elogInfoId')
export const fetchElogCommentSuccess = createAction(FETCH_ELOGCOMMENT_SUCCESS, 'elogInfoId', 'elogcomments')
export const fetchElogCommentFailure = createAction(FETCH_ELOGCOMMENT_FAILURE, 'elogInfoId', 'errors')
// res.data.data.getElogCommentForInfoId
export function fetchElogCommentByInfoID (userId, eloginfoid, fromsystem) {
  return dispatch => {
    dispatch(fetchElogCommentRequest(userId, eloginfoid, fromsystem))
    return ajax.post(`/graphql4g`, {query:schema.getElogCommentForInfoId, variables:{userId, eloginfoid, fromsystem}})
      .then(res => dispatch(fetchElogCommentSuccess(eloginfoid, res.data.data.getElogCommentForInfoId.listItems)))
      .catch(errors => dispatch(fetchElogCommentFailure(eloginfoid, errors)))
  }
}

// Save Elog
export const FETCH_SAVE_ELOG_REQUEST = 'FETCH_SAVE_ELOG_REQUEST'
export const FETCH_SAVE_ELOG_SUCCESS = 'FETCH_SAVE_ELOG_SUCCESS'
export const FETCH_SAVE_ELOG_FAILURE = 'FETCH_SAVE_ELOG_FAILURE'

export const fetchSaveElogRequest = createAction(FETCH_SAVE_ELOG_REQUEST, 'loginId')
export const fetchSaveElogSuccess = createAction(FETCH_SAVE_ELOG_SUCCESS, 'loginId', 'elogsavemsg')
export const fetchSaveElogFailure = createAction(FETCH_SAVE_ELOG_FAILURE, 'loginId', 'errors')

export function saveElogByWorkOrderID (loginId, elog) {
  return dispatch => {
    dispatch(fetchSaveElogRequest(loginId))
    return ajax.post(`/graphql4g`, {query:schema.submitElog, variables:{ELogInput:elog}})
      .then(res => dispatch(fetchSaveElogSuccess(loginId, res.data.data.submitElog)))
      .catch(errors => dispatch(fetchSaveElogFailure(loginId, errors)))
  }
}

// Save Elog Comments
export const FETCH_SAVE_ELOGCOMMENT_REQUEST = 'FETCH_SAVE_ELOGCOMMENT_REQUEST'
export const FETCH_SAVE_ELOGCOMMENT_SUCCESS = 'FETCH_SAVE_ELOGCOMMENT_SUCCESS'
export const FETCH_SAVE_ELOGCOMMENT_FAILURE = 'FETCH_SAVE_ELOGCOMMENT_FAILURE'

export const fetchSaveElogCommentRequest = createAction(FETCH_SAVE_ELOGCOMMENT_REQUEST, 'loginId')
export const fetchSaveElogCommentSuccess = createAction(FETCH_SAVE_ELOGCOMMENT_SUCCESS, 'loginId', 'elogcommentsavemsg')
export const fetchSaveElogCommentFailure = createAction(FETCH_SAVE_ELOGCOMMENT_FAILURE, 'loginId', 'errors')

export function saveElogCommentByWorkOrderID (loginId, elogcomment) {
  return dispatch => {
    dispatch(fetchSaveElogCommentRequest(loginId))
    return ajax.post(`/graphql4g`, {query:schema.submitElogComment, variables:{ELogComment:elogcomment}})
    .then(res => dispatch(fetchSaveElogCommentSuccess(loginId, res.data.data.submitElogComment)))
    .catch(errors => dispatch(fetchSaveElogCommentFailure(loginId, errors)))
  }
}

export const DELETE_ELOG_MSG = 'DELETE_ELOG_MSG'

export function deletElogMsg () {
  return {
    type: DELETE_ELOG_MSG,
  }
}

export const DELETE_ELOGCOMMENT_MSG = 'DELETE_ELOGCOMMENT_MSG'

export function deleteElogCommentMsg () {
  return {
    type: DELETE_ELOGCOMMENT_MSG,
  }
}

export const DOWNLOAD_ELOG_FILE_SUCCESS = 'DOWNLOAD_ELOG_FILE_SUCCESS'
export const DOWNLOAD_ELOG_FILE_ERROR = 'DOWNLOAD_ELOG_FILE_ERROR'
export const DOWNLOAD_ELOG_FILE_REQUEST = 'DOWNLOAD_ELOG_FILE_REQUEST'

export const downloadElogFileRequest = createAction(DOWNLOAD_ELOG_FILE_REQUEST, 'loginId')
export const downloadElogFileSuccess = createAction(DOWNLOAD_ELOG_FILE_SUCCESS, 'loginId', 'filename', 'filedata')
export const downloadElogFileError = createAction(DOWNLOAD_ELOG_FILE_ERROR, 'loginId', 'errorMessage')

export function downloadElogFile(loginId, file_Id) {
  return dispatch => {
    dispatch(downloadElogFileRequest(loginId))
    return ajax.post(`/graphql4g`, { query: schema.downloadElogFile, variables: { file_Id: file_Id } })
      .then(res => {
        if (res.data && res.data.data && res.data.data.downloadElogFile) {
          return dispatch(downloadElogFileSuccess(loginId, file_Id, res.data.data.downloadElogFile))
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data ? res.data.errors[0].data.message ? res.data.errors[0].data.message : res.data.errors[0].data.detail ? res.data.errors[0].data.detail : res.data.errors[0].message : res.data.errors[0].message
          return dispatch(downloadElogFileError(loginId, { message }))
        } else {
          return dispatch(downloadElogSFileError(loginId, { message: "Unknown Error! Please contact administrator." }))
        }
      })
      .catch(errors => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(downloadElogFileError(loginId, { message: errors[0].message }))
        } else {
          return dispatch(downloadElogFileError(loginId, errors))
        }
      })
  }
}
