import * as actions from './actions'
import {Map,List,fromJS} from 'immutable';

export function Alarms (state = Map(), action) {

  switch (action.type) {
  case actions.FETCH_VSM_ALARMS_FOR_SITE_REQUEST:
    return state
      .setIn(['values',action.id,'isLoading'], true);
  case actions.FETCH_VSM_ALARMS_FOR_SITE_SUCCESS:
    return state
          .setIn(['values',action.id],fromJS({isLoading:false,alarms:action.alarms}))
  case actions.FETCH_VSM_ALARMS_FOR_SITE_FAILURE:
      return state
      .setIn(['values',action.id,'isLoading'],false)
      .setIn(['values',action.id,'error'],Map(action.errors));
  default:
    return state
  }
}

export default Alarms

