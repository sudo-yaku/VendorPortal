import * as actions from "./actions";
import { Map, List, fromJS } from "immutable";

export function CapitalProjectDashboard(state = Map(), action) {
  switch (action.type) {
    case actions.CAPITAL_PROJECT_SELECTED_ROW:
      return state.setIn(
        ["getSNAPProjects", "selectedRow"],
        action.selectedRow
      );
    case actions.GET_SNAP_PROJECTS_REQUEST:
      return state.setIn(["getSNAPProjects", "isloading"], true);
    case actions.GET_SNAP_PROJECTS_SUCCESS:
      return state.setIn(["getSNAPProjects", "isloading"], false)
        .setIn(["getSNAPProjects", "snapProjects"], fromJS(action.snapProjects))
    case actions.GET_SNAP_PROJECTS_FAILURE:
      return state.setIn(["getSNAPProjects", "isloading"], false)
        .setIn(["getSNAPProjects", "errors"], fromJS(action.errors))
    case actions.GET_CBAND_PROJECTS_REQUEST:
      return state.setIn(["getCbandProjDetails", "isLoading"], true)
    case actions.GET_CBAND_PROJECTS_SUCCESS:
      return state.setIn(["getCbandProjDetails", "isloading"], false)
        .setIn(["getCbandProjDetails", "cBandProjectDetails"], fromJS(action.cBandProjectDetails))
    case actions.GET_SNAP_PROJECTS_FAILURE:
      return state.setIn(["getCbandProjDetails", "isloading"], false)
        .setIn(["getCbandProjDetails", "errors"], fromJS(action.errors))
    case actions.GET_PROJECTS_LIST_REQUEST:
      return state.setIn(["getProjectsList", "isLoading"], true)
    case actions.GET_PROJECTS_LIST_SUCCESS:
      return state.setIn(["getProjectsList", "isloading"], false)
        .setIn(["getProjectsList", "cBandProjectDetails"], fromJS(action.project_list))
    case actions.GET_PROJECTS_LIST_FAILURE:
      return state.setIn(["getProjectsList", "isloading"], false)
        .setIn(["getProjectsList", "errors"], fromJS(action.errors))
        case actions.FETCH_HOSTNAME_MAPPING_REQUEST:
  return state
    .setIn(["hostnameMapping", action.siteId, "loading"], true)
    .setIn(["hostnameMapping", action.siteId, "error"], null);

case actions.FETCH_HOSTNAME_MAPPING_SUCCESS:

  return state
    .setIn(["hostnameMapping", action.siteId, "loading"], false)
    .setIn(["hostnameMapping", action.siteId, "data"], fromJS(action.hostnameMapping));

case actions.FETCH_HOSTNAME_MAPPING_FAILURE:
  return state
    .setIn(["hostnameMapping", action.siteId, "loading"], false)
    .setIn(["hostnameMapping", action.siteId, "error"], fromJS(action.errors));
    case actions.SEARCH_HPOV_SERVER_REQUEST:
  return state
    .setIn(["hpovServer", action.hostname, "loading"], true)
    .setIn(["hpovServer", action.hostname, "error"], null);

case actions.SEARCH_HPOV_SERVER_SUCCESS:
  return state
    .setIn(["hpovServer", action.hostname, "loading"], false)
    .setIn(["hpovServer", action.hostname, "data"], fromJS(action.serverData));

case actions.SEARCH_HPOV_SERVER_FAILURE:
  return state
    .setIn(["hpovServer", action.hostname, "loading"], false)
    .setIn(["hpovServer", action.hostname, "error"], fromJS(action.errors));
    case actions.PING_HOST_REQUEST:
      return state
        .setIn(["pingHost", action.host, "loading"], true)
        .setIn(["pingHost", action.host, "error"], null);
    
    case actions.PING_HOST_SUCCESS:
     
      return state
        .setIn(["pingHost", action.host, "loading"], false)
        .setIn(["pingHost", action.host, "data"], fromJS(action.pingResult));
    
    case actions.PING_HOST_FAILURE:
      return state
        .setIn(["pingHost", action.host, "loading"], false)
        .setIn(["pingHost", action.host, "error"], fromJS(action.errors));
    case actions.GET_TEST_HISTORY_REQUEST:
      return state.setIn(["getTestHistory", "isLoading"], true)
    case actions.GET_TEST_HISTORY_SUCCESS:
      return state.setIn(["getTestHistory", "isLoading"], false)
        .setIn(["getTestHistory", "testHistory"], fromJS(action.testHistory))
    case actions.GET_TEST_HISTORY_FAILURE:
      return state.setIn(["getTestHistory", "isLoading"], false)
        .setIn(["getTestHistory", "errors"], fromJS(action.errors))
   
    case actions.GET_SNAP_PROJECTS_FAILURE:
      return state
        .setIn(["getSNAPProjects", "isloading"], false)
        .setIn(["getSNAPProjects", "errors"], fromJS(action.errors));
    case actions.GET_CBAND_PROJECTS_REQUEST:
      return state.setIn(["getCbandProjDetails", "isLoading"], true);
    case actions.GET_CBAND_PROJECTS_SUCCESS:
      return state
        .setIn(["getCbandProjDetails", "isloading"], false)
        .setIn(
          ["getCbandProjDetails", "cBandProjectDetails"],
          fromJS(action.cBandProjectDetails)
        );
    case actions.GET_SNAP_PROJECTS_FAILURE:
      return state
        .setIn(["getCbandProjDetails", "isloading"], false)
        .setIn(["getCbandProjDetails", "errors"], fromJS(action.errors));
    case actions.GET_PROJECTS_LIST_REQUEST:
      return state.setIn(["getProjectsList", "isLoading"], true);
    case actions.GET_PROJECTS_LIST_SUCCESS:
      return state
        .setIn(["getProjectsList", "isloading"], false)
        .setIn(
          ["getProjectsList", "cBandProjectDetails"],
          fromJS(action.project_list)
        );
    case actions.GET_PROJECTS_LIST_FAILURE:
      return state
        .setIn(["getProjectsList", "isloading"], false)
        .setIn(["getProjectsList", "errors"], fromJS(action.errors));
    case actions.GET_ALARM_TEST_INFO_REQUEST:
      return state.setIn(["getAlarmTestInfo", "isLoading"], true);
    case actions.GET_ALARM_TEST_INFO_SUCCESS:
      return state
        .setIn(["getAlarmTestInfo", "isLoading"], false)
        .setIn(
          ["getAlarmTestInfo", "alarmTestInfo"],
          fromJS(action.alarmTestInfo)
        );
    case actions.GET_ALARM_TEST_INFO_FAILURE:
      return state
        .setIn(["getAlarmTestInfo", "isLoading"], false)
        .setIn(["getAlarmTestInfo", "errors"], fromJS(action.errors));
    case actions.FETCH_HOSTNAME_MAPPING_REQUEST:
      return state
        .setIn(["hostnameMapping", action.siteId, "loading"], true)
        .setIn(["hostnameMapping", action.siteId, "error"], null);

    case actions.FETCH_HOSTNAME_MAPPING_SUCCESS:
      return state
        .setIn(["hostnameMapping", action.siteId, "loading"], false)
        .setIn(
          ["hostnameMapping", action.siteId, "data"],
          fromJS(action.hostnameMapping)
        );

    case actions.FETCH_HOSTNAME_MAPPING_FAILURE:
      return state
        .setIn(["hostnameMapping", action.siteId, "loading"], false)
        .setIn(
          ["hostnameMapping", action.siteId, "error"],
          fromJS(action.errors)
        );
        case actions.SEARCH_HPOV_SERVER_REQUEST:
          return state
            .setIn(["hpovServer", action.hostname, "loading"], true)
            .setIn(["hpovServer", action.hostname, "error"], null);
        
        case actions.SEARCH_HPOV_SERVER_SUCCESS:
          return state
            .setIn(["hpovServer", action.hostname, "loading"], false)
            .setIn(["hpovServer", action.hostname, "data"], fromJS(action.serverData));
        
        case actions.SEARCH_HPOV_SERVER_FAILURE:
          return state
            .setIn(["hpovServer", action.hostname, "loading"], false)
            .setIn(["hpovServer", action.hostname, "error"], fromJS(action.errors));
    case actions.PING_HOST_REQUEST:
      return state
        .setIn(["pingHost", action.host, "loading"], true)
        .setIn(["pingHost", action.host, "error"], null);

    case actions.PING_HOST_SUCCESS:
      return state
        .setIn(["pingHost", action.host, "loading"], false)
        .setIn(["pingHost", action.host, "data"], fromJS(action.pingResult));

    case actions.PING_HOST_FAILURE:
      return state
        .setIn(["pingHost", action.host, "loading"], false)
        .setIn(["pingHost", action.host, "error"], fromJS(action.errors));
    case actions.GET_TEST_HISTORY_REQUEST:
      return state.setIn(["getTestHistory", "isLoading"], true);
    case actions.GET_TEST_HISTORY_SUCCESS:
      return state
        .setIn(["getTestHistory", "isLoading"], false)
        .setIn(["getTestHistory", "testHistory"], fromJS(action.testHistory));
    case actions.GET_TEST_HISTORY_FAILURE:
      return state
        .setIn(["getTestHistory", "isLoading"], false)
        .setIn(["getTestHistory", "errors"], fromJS(action.errors));

    // Handle RMU submission request
case actions.CREATE_RMU_REQUEST:
  return state
    .setIn(["rmuSubmission", "loading"], true)
    .setIn(["rmuSubmission", "error"], null)
    .setIn(["rmuSubmission", "data"], null);

// Handle RMU submission success
case actions.CREATE_RMU_SUCCESS:
  return state
    .setIn(["rmuSubmission", "loading"], false)
    .setIn(["rmuSubmission", "data"], fromJS(action.response))
    .setIn(["rmuSubmission", "timestamp"], Date.now());

// Handle RMU submission failure
case actions.CREATE_RMU_FAILURE:
  return state
    .setIn(["rmuSubmission", "loading"], false)
    .setIn(["rmuSubmission", "error"], fromJS(action.errors))
    .setIn(["rmuSubmission", "timestamp"], Date.now());

    // Add the site types cases here
case actions.GET_SITE_TYPES_REQUEST:
  return state
    .setIn(["siteTypes", "loading"], true)
    .setIn(["siteTypes", "error"], null);

case actions.GET_SITE_TYPES_SUCCESS:
  return state
    .setIn(["siteTypes", "loading"], false)
    .setIn(["siteTypes", "data"], fromJS(action.siteTypes))
    .setIn(["siteTypes", "error"], null);

case actions.GET_SITE_TYPES_FAILURE:
  return state
    .setIn(["siteTypes", "loading"], false)
    .setIn(["siteTypes", "error"], action.errors);
    case actions.GET_EAT_AUDIT_REQUEST:
      return state.setIn(["getEatAudit", "isLoading"], true)
        .setIn(["getEatAudit", "errors"], null);
    case actions.GET_EAT_AUDIT_SUCCESS:
      return state
        .setIn(["getEatAudit", "isLoading"], false)
        .setIn(["getEatAudit", "auditData"], fromJS(action.auditData));
    case actions.GET_EAT_AUDIT_FAILURE:
      return state
        .setIn(["getEatAudit", "isLoading"], false)
        .setIn(["getEatAudit", "errors"], fromJS(action.errors));
        case 'RESET_PING_HOST_DATA':
  
  return state.setIn(["pingHost", action.ipAddress], fromJS({
    loading: false,
    data: null,
    error: null
  }));


case 'RESET_HPOV_SERVER_DATA':
  return state.setIn(["hpovServer", action.hostname], fromJS({
    loading: false,
    data: null,
    error: null
  }));
    default:
      return state;
  }
}
export default CapitalProjectDashboard;
