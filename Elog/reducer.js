import * as actions from './actions'
import {Map, fromJS} from 'immutable'

export function Elog (state = Map(), action) {
  switch (action.type) {

  case actions.FETCH_ELOG_SUCCESS:
    return state.setIn(["elogLoading"], false)
                .setIn(["listItems"], fromJS(action.elogs))
  case actions.FETCH_ELOG_REQUEST:
    return state.setIn(["elogLoading"], true)
  case actions.FETCH_ELOG_FAILURE:
    return state.setIn(["elogLoading"], false)
                .setIn(["errors"], fromJS(action.errors))
   
  case actions.FETCH_ELOGCOMMENT_SUCCESS:
    return state.setIn(["elogCommentLoading"], false)
      .setIn(["elogComments"], fromJS(action.elogcomments))
  case actions.FETCH_ELOGCOMMENT_REQUEST:
     return state.setIn(["elogCommentLoading"], true)
   case actions.FETCH_ELOGCOMMENT_FAILURE:
     return state.setIn(["elogCommentLoading"], false)
       .setIn(["errors"], fromJS(action.errors))

  case actions.FETCH_SAVE_ELOG_SUCCESS:
    return state.setIn(["elogSaveLoading"], false)
                .setIn(["elogSaveMsg"], fromJS(action.elogsavemsg))
  case actions.FETCH_SAVE_ELOG_REQUEST:
    return state.setIn(["elogSaveLoading"], true)
  case actions.FETCH_SAVE_ELOG_FAILURE:
    return state.setIn(["elogSaveLoading"], false)
                .setIn(["elogSaveLoading", "errors"], fromJS(action.errors))
  case actions.FETCH_SAVE_ELOGCOMMENT_SUCCESS:
     return state.setIn(["elogCommentSaveLoading"], false)
       .setIn(["elogcommentsavemsg"], fromJS(action.elogcommentsavemsg))
  case actions.FETCH_SAVE_ELOGCOMMENT_REQUEST:
      return state.setIn(["elogCommentSaveLoading"], true)
        .setIn(["elogCommenterrors"], null)
  case actions.FETCH_SAVE_ELOGCOMMENT_FAILURE:
      return state.setIn(["elogCommentSaveLoading"], false)
        .setIn(["elogCommenterrors"], fromJS(action.errors))

  case actions.DOWNLOAD_ELOG_FILE_REQUEST:
      return state
        .setIn(['ElogDownloads'], { isLoading: true })
  case actions.DOWNLOAD_ELOG_FILE_SUCCESS:
      return state
        .setIn(['ElogDownloads'], fromJS({ isLoading: false, filename: action.filename, filedata: action.filedata }))
  case actions.DOWNLOAD_ELOG_FILE_ERROR:
      return state
        .setIn(['ElogDownloads'], fromJS({ isLoading: false, message: action.errorMessage }))

  case actions.DELETE_ELOG_MSG:
    return state.deleteIn(['elogSaveMsg'])
  case actions.DELETE_ELOGCOMMENT_MSG:
      return state.deleteIn(['elogcommentsavemsg'])
            .deleteIn(['elogCommenterrors'])

  default:
    return state
  }
}
export default Elog
