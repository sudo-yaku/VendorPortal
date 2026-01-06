import ajax, { rawClient } from '../ajax'
import { createAction } from '../redux_utils'
import * as schema from './schema'

export const CAPITAL_PROJECT_SELECTED_ROW = "CAPITAL_PROJECT_SELECTED_ROW"
export const capitalProjectSelectedRowSuccess = createAction(CAPITAL_PROJECT_SELECTED_ROW, 'selectedRow')
export function capitalProjectSelectedRow(selectedRow) {
    return dispatch => {
        dispatch(capitalProjectSelectedRowSuccess(selectedRow))
    }
}

export const GET_PROJECT_INFO_SLR_REQUEST = 'GET_PROJECT_INFO_SLR_REQUEST'
export const GET_PROJECT_INFO_SLR_SUCCESS = 'GET_PROJECT_INFO_SLR_SUCCESS'
export const GET_PROJECT_INFO_SLR_FAILURE = 'GET_PROJECT_INFO_SLR_FAILURE'

export const getProjectInfoSlrRequest = createAction(GET_PROJECT_INFO_SLR_REQUEST)
export const getProjectInfoSlrSuccess = createAction(GET_PROJECT_INFO_SLR_SUCCESS, 'getProjectInfoSlr')
export const getProjectInfoSlrFailure = createAction(GET_PROJECT_INFO_SLR_FAILURE, 'errors')

export function getProjectInfoSlr(projectNum) {
    return dispatch => {
        dispatch(getProjectInfoSlrRequest(projectNum))
        return ajax.post(`/graphql4g`, {
            query: schema.getProjectInfoSlr,
            variables: { projectNum }
        })
            .then(res => {
                return dispatch(getProjectInfoSlrSuccess(res.data.data.getProjectInfoSlr))
            })
            .catch(errors => dispatch(getProjectInfoSlrFailure(errors)))
    }
}
export const GET_SNAP_PROJECTS_REQUEST = 'GET_SNAP_PROJECTS_REQUEST'
export const GET_SNAP_PROJECTS_SUCCESS = 'GET_SNAP_PROJECTS_SUCCESS'
export const GET_SNAP_PROJECTS_FAILURE = 'GET_SNAP_PROJECTS_FAILURE'

export const getSNAPProjetcsRequest = createAction(GET_SNAP_PROJECTS_REQUEST)
export const getSNAPProjetcsSuccess = createAction(GET_SNAP_PROJECTS_SUCCESS, 'snapProjects')
export const getSNAPProjetcsFailure = createAction(GET_SNAP_PROJECTS_FAILURE, 'errors')

export function getSNAPProjects(market, submarket) {
    return dispatch => {
        dispatch(getSNAPProjetcsRequest(market, submarket))
        return ajax.post(`/graphql4g`, {
            query: schema.getSNAPProjects,
            variables: { market, submarket }
        })
            .then(res => {
                return dispatch(getSNAPProjetcsSuccess(res.data.data.getCbandSnapProjects))
            })
            .catch(errors => dispatch(getSNAPProjetcsFailure(errors)))
    }
}

export const FETCH_HOSTNAME_MAPPING_REQUEST = "FETCH_HOSTNAME_MAPPING_REQUEST";
export const FETCH_HOSTNAME_MAPPING_SUCCESS = "FETCH_HOSTNAME_MAPPING_SUCCESS";
export const FETCH_HOSTNAME_MAPPING_FAILURE = "FETCH_HOSTNAME_MAPPING_FAILURE";
export const fetchHostnameMappingRequest = createAction(
  FETCH_HOSTNAME_MAPPING_REQUEST,
  "siteId"
);
export const fetchHostnameMappingSuccess = createAction(
  FETCH_HOSTNAME_MAPPING_SUCCESS,
  "siteId",
  "hostnameMapping"
);
export const fetchHostnameMappingFailure = createAction(
  FETCH_HOSTNAME_MAPPING_FAILURE,
  "siteId",
  "errors"
);

export function getHostnameMapping(siteId) {
    
  return (dispatch) => {
    
    dispatch(fetchHostnameMappingRequest(siteId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.GetHostnameMapping,
        variables: { 
          method: "getHostnameMappingV3",
          site: siteId 
        },
      })
      .then((res) => {
        if (
          res?.data?.data?.getHostnameMapping?.data
        ) {
          return dispatch(
            fetchHostnameMappingSuccess(
              siteId,
              res.data.data.getHostnameMapping.data
            )
          );
        } else if (res.data?.errors && res.data.errors.length > 0) {
          const message = res.data.errors[0]?.message || 
                          res.data.errors[0]?.data?.message || 
                          res.data.errors[0]?.data?.detail || 
                          "Unknown error occurred";
          return dispatch(fetchHostnameMappingFailure(siteId, { message }));
        } else {
          return dispatch(
            fetchHostnameMappingFailure(siteId, { 
              message: "No hostname mapping data found" 
            })
          );
        }
      })
      .catch((errors) => {
        const errorMessage = errors?.message || "Failed to fetch hostname mapping";
        return dispatch(
          fetchHostnameMappingFailure(siteId, { message: errorMessage })
        );
      });
  };
}

export const GET_SITE_TYPES_REQUEST = 'GET_SITE_TYPES_REQUEST'
export const GET_SITE_TYPES_SUCCESS = 'GET_SITE_TYPES_SUCCESS'
export const GET_SITE_TYPES_FAILURE = 'GET_SITE_TYPES_FAILURE'

export const getSiteTypesRequest = createAction(GET_SITE_TYPES_REQUEST)
export const getSiteTypesSuccess = createAction(GET_SITE_TYPES_SUCCESS, 'siteTypes')
export const getSiteTypesFailure = createAction(GET_SITE_TYPES_FAILURE, 'errors')

export function getSiteTypes() {
    return dispatch => {
        dispatch(getSiteTypesRequest())
        return ajax.post('/graphql4g', {
            query: schema.getSiteTypes
        })
        .then(res => {
            if (res?.data?.data?.getSiteTypes) {
                const { statusCode, message, site_types } = res.data.data.getSiteTypes;
                
                if (statusCode === 200) {
                    dispatch(getSiteTypesSuccess(site_types || []));
                    return site_types || [];
                } else {
                    const errorMessage = message || 'Failed to fetch site types';
                    dispatch(getSiteTypesFailure(errorMessage));
                    throw new Error(errorMessage);
                }
            } else if (res.data?.errors && res.data.errors.length > 0) {
                const errorMessage = res.data.errors[0]?.message || 
                                   res.data.errors[0]?.data?.message || 
                                   res.data.errors[0]?.data?.detail || 
                                   "Unknown error occurred";
                dispatch(getSiteTypesFailure(errorMessage));
                throw new Error(errorMessage);
            } else {
                const errorMessage = "No site types data found";
                dispatch(getSiteTypesFailure(errorMessage));
                throw new Error(errorMessage);
            }
        })
        .catch(errors => {
            const errorMessage = errors?.message || "Failed to fetch site types";
            dispatch(getSiteTypesFailure(errorMessage));
        });
    };
}

export const SEARCH_HPOV_SERVER_REQUEST = "SEARCH_HPOV_SERVER_REQUEST";
export const SEARCH_HPOV_SERVER_SUCCESS = "SEARCH_HPOV_SERVER_SUCCESS";
export const SEARCH_HPOV_SERVER_FAILURE = "SEARCH_HPOV_SERVER_FAILURE";

export const searchHpovServerRequest = createAction(
    SEARCH_HPOV_SERVER_REQUEST,
    "hostname"
  );
  export const searchHpovServerSuccess = createAction(
    SEARCH_HPOV_SERVER_SUCCESS,
    "hostname",
    "serverData"
  );
  export const searchHpovServerFailure = createAction(
    SEARCH_HPOV_SERVER_FAILURE,
    "hostname",
    "errors"
  );

  export function searchHpovServer(identifier, options = {}) {
    const { 
      flag = 0, // 0 for site number, 1 for IP address
      requestApplication = "SiteBoss",
      siteUnid = "",
      requesterName = ""
    } = options;
    
    return (dispatch) => {
      dispatch(searchHpovServerRequest(identifier));
      
      // Construct the reqBody object based on flag value
      const reqBody = {
        hostname: identifier,
        requestApplication: requestApplication,
        siteUnid: siteUnid,
        requesterName: requesterName,
        flag: flag
      };
      
      return ajax
        .post(`/graphql4g`, {
          query: schema.searchHpovServer,
          variables: { 
            method: "search_hpov_server_V2",
            proc: "check",
            reqBody: reqBody // Send the complete reqBody object
          },
        })
        .then((res) => {
          if (
            res?.data?.data?.searchHpovServer?.data
          ) {
            return dispatch(
              searchHpovServerSuccess(
                identifier,
                res.data.data.searchHpovServer.data
              )
            );
          } else if (res.data?.errors && res.data.errors.length > 0) {
            const message = res.data.errors[0]?.message || 
                            res.data.errors[0]?.data?.message || 
                            res.data.errors[0]?.data?.detail || 
                            "Unknown error occurred";
            return dispatch(searchHpovServerFailure(identifier, { message }));
          } else {
            return dispatch(
              searchHpovServerFailure(identifier, { 
                message: "No server data found" 
              })
            );
          }
        })
        .catch((errors) => {
          const errorMessage = errors?.message || "Failed to search HPOV server";
          return dispatch(
            searchHpovServerFailure(identifier, { message: errorMessage })
          );
        });
    };
  }
  export const PING_HOST_REQUEST = "PING_HOST_REQUEST";
  export const PING_HOST_SUCCESS = "PING_HOST_SUCCESS";
  export const PING_HOST_FAILURE = "PING_HOST_FAILURE";
  
  export const pingHostRequest = createAction(
    PING_HOST_REQUEST,
    "host"
  );
  export const pingHostSuccess = createAction(
    PING_HOST_SUCCESS,
    "host",
    "pingResult"
  );
  export const pingHostFailure = createAction(
    PING_HOST_FAILURE,
    "host",
    "errors"
  );
  
  export function pingHostAction(host) {

    return (dispatch) => {
      dispatch(pingHostRequest(host));
      return ajax
        .post(`/graphql4g`, {
          query: schema.pingHost,
          variables: { 
            method: "ping_it",
            host: host 
          },
        })
        .then((res) => {
          if (
            res?.data?.data?.pingHost?.data
          ) {
            return dispatch(
              pingHostSuccess(
                host,
                res.data.data.pingHost.data
              )
            );
          } else if (res.data?.errors && res.data.errors.length > 0) {
            const message = res.data.errors[0]?.message || 
                            res.data.errors[0]?.data?.message || 
                            res.data.errors[0]?.data?.detail || 
                            "Unknown error occurred";
            return dispatch(pingHostFailure(host, { message }));
          } else {
            return dispatch(
              pingHostFailure(host, { 
                message: "No ping result data found" 
              })
            );
          }
        })
        .catch((errors) => {
          const errorMessage = errors?.message || "Failed to ping host";
          return dispatch(
            pingHostFailure(host, { message: errorMessage })
          );
        });
    };
  }

  export const CREATE_RMU_REQUEST = "CREATE_RMU_REQUEST";
export const CREATE_RMU_SUCCESS = "CREATE_RMU_SUCCESS";
export const CREATE_RMU_FAILURE = "CREATE_RMU_FAILURE";

export const createRMURequestAction = createAction(CREATE_RMU_REQUEST, "formData");
export const createRMUSuccess = createAction(CREATE_RMU_SUCCESS, "response");
export const createRMUFailure = createAction(CREATE_RMU_FAILURE, "errors");

export function submitRMURequest(formData) {
  return (dispatch) => {
    // Dispatch the request action
    dispatch(createRMURequestAction(formData));
    
    // Make the GraphQL API call with the form data directly
    return ajax
      .post(`/graphql4g`, {
        query: schema.createRMURequest,
        variables: { input: formData }
      })
      .then((res) => {
       
        
        const response = res?.data?.data?.createHPOVRegistration;
       
        
        if (response) {
          // Check if statusCode is 200 for success
          if (response.statusCode === 200) {
            // Success - dispatch success action
            return dispatch(createRMUSuccess(response));
          } else {
            // Non-200 status code means something went wrong
            const errorMessage = response.message || `Request failed with status code: ${response.statusCode}`;
            return dispatch(createRMUFailure({ 
              message: errorMessage,
              statusCode: response.statusCode,
              response: response
            }));
          }
        } else {
          // No response data
          return dispatch(createRMUFailure({ 
            message: "No response data received"
          }));
        }
      })
      .catch((error) => {
        console.error("API request error:", error);
        const errorMessage = error?.message || 
                           error?.response?.data?.errors?.[0]?.message ||
                           "Failed to submit RMU request";
        
        return dispatch(createRMUFailure({ message: errorMessage }));
      });
  };
}


export const GET_CBAND_PROJECTS_REQUEST = 'GET_CBAND_PROJECTS_REQUEST'
export const GET_CBAND_PROJECTS_SUCCESS = 'GET_CBAND_PROJECTS_SUCCESS'
export const GET_CBAND_PROJECTS_FAILURE = 'GET_CBAND_PROJECTS_FAILURE'

export const getCbandProjDetailsRequest = createAction(GET_CBAND_PROJECTS_REQUEST)
export const getCbandProjDetailsSuccess = createAction(GET_CBAND_PROJECTS_SUCCESS, 'cBandProjectDetails')
export const getCbandProjDetailsFailure = createAction(GET_CBAND_PROJECTS_FAILURE, 'errors')

export function getCbandProjDetails(projectNum) {
    return dispatch => {
        dispatch(getCbandProjDetailsRequest(projectNum))
        return ajax.post('/graphql4g', {
            query: schema.getCbandProjDetails,
            variables: { projectNum }
        })
            .then(res => {
                dispatch(getCbandProjDetailsSuccess(res.data.data.getCbandProjDetails))
                return res.data.data.getCbandProjDetails;
            })
            .catch(errors => dispatch(getCbandProjDetailsFailure(errors)))
    }
}

//capital search enhancement - start

export const GET_PROJECTS_REQUEST = 'GET_PROJECTS_REQUEST'
export const GET_PROJECTS_SUCCESS = 'GET_PROJECTS_SUCCESS'
export const GET_PROJECTS_FAILURE = 'GET_PROJECTS_FAILURE'

export const getProjectDetailsRequest = createAction(GET_PROJECTS_REQUEST)
export const getProjectDetailsSuccess = createAction(GET_PROJECTS_SUCCESS, 'project_details')
export const getProjectDetailsFailure = createAction(GET_PROJECTS_FAILURE, 'errors')

export function getProjectDetails(projectNumber, market, submarket) {
    return dispatch => {
        dispatch(getProjectDetailsRequest(projectNumber, market, submarket))
        return ajax.post('/graphql4g', {
            query: schema.getProjectDetails,
            variables: { projectNumber,  market, submarket}
        })
        .then(res => {
            dispatch(getProjectDetailsSuccess(res.data.data.getProjectDetails))
            return res.data.data.getProjectDetails;
        })
        .catch(errors => dispatch(getProjectDetailsFailure(errors)))
    }
}

export const GET_PROJECTS_LIST_REQUEST = 'GET_PROJECTS_LIST_REQUEST'
export const GET_PROJECTS_LIST_SUCCESS = 'GET_PROJECTS_LIST_SUCCESS'
export const GET_PROJECTS_LIST_FAILURE = 'GET_PROJECTS_LIST_FAILURE'

export const getProjectsListRequest = createAction(GET_PROJECTS_LIST_REQUEST)
export const getProjectsListSuccess = createAction(GET_PROJECTS_LIST_SUCCESS, 'project_list')
export const getProjectsListFailure = createAction(GET_PROJECTS_LIST_FAILURE, 'errors')

export function getProjectsList(mdg_id,startDate,endDate ,submarket) {
    return dispatch => {
        dispatch(getProjectsListRequest(mdg_id,startDate,endDate, submarket))
        return ajax.post('/graphql4g', {
            query: schema.getProjectsList,
            variables: { mdg_id,startDate,endDate, submarket}
        })
        .then(res => {
            dispatch(getProjectsListSuccess(res.data.data.getProjectsList))
            return res.data.data.getProjectsList;
        })
        .catch(errors => dispatch(getProjectsListFailure(errors)))
    }
}

//capital search enhancement - end

export const SAVE_DEVICE_TO_ENODEB_REQUEST = 'SAVE_DEVICE_TO_ENODEB_REQUEST'
export const SAVE_DEVICE_TO_ENODEB_SUCCESS = 'SAVE_DEVICE_TO_ENODEB_SUCCESS'
export const SAVE_DEVICE_TO_ENODEB_FAILURE = 'SAVE_DEVICE_TO_ENODEB_FAILURE'

export const saveDeviceToEnodebRequest = createAction(SAVE_DEVICE_TO_ENODEB_REQUEST)
export const saveDeviceToEnodebSuccess = createAction(SAVE_DEVICE_TO_ENODEB_SUCCESS, 'saveDeviceToEnodeb')
export const saveDeviceToEnodebFailure = createAction(SAVE_DEVICE_TO_ENODEB_FAILURE, 'errors')

export function saveDeviceToEnodeb(reqObj) {
    return dispatch => {
        dispatch(saveDeviceToEnodebRequest(reqObj))
        return ajax.post('/graphql4g', {
            query: schema.saveDeviceToEnodebInp,
            variables: {
                "saveDeviceToEnodebInp": {
                    "data": reqObj
                }
            }
        })
            .then(res => {
                return dispatch(saveDeviceToEnodebSuccess(res.data.data.saveDeviceToEnodeb))
            })
            .catch(errors => dispatch(saveDeviceToEnodebFailure(errors)))
    }
}


export const GET_5GREPEATER_PROJECTS_REQUEST = 'GET_5GREPEATER_PROJECTS_REQUEST'
export const GET_5GREPEATER_PROJECTS_SUCCESS = 'GET_5GREPEATER_PROJECTS_SUCCESS'
export const GET_5GREPEATER_PROJECTS_FAILURE = 'GET_5GREPEATER_PROJECTS_FAILURE'

export const get5gRepeaterProjectDetailsRequest = createAction(GET_5GREPEATER_PROJECTS_REQUEST)
export const get5gRepeaterProjectDetailsSuccess = createAction(GET_5GREPEATER_PROJECTS_SUCCESS, 'atoll_info')
export const get5gRepeaterProjectDetailsFailure = createAction(GET_5GREPEATER_PROJECTS_FAILURE, 'errors')

export function get5gRepeaterProjectDetails(projectNum) {
    return dispatch => {
        dispatch(get5gRepeaterProjectDetailsRequest(projectNum))
        return ajax.post('/graphql4g', {
            query: schema.get5gRepeaterProjectDetails,
            variables: { projectNum }
        })
            .then(res => {
                dispatch(get5gRepeaterProjectDetailsSuccess(res.data))
                return res.data;
            })
            .catch(errors => dispatch(get5gRepeaterProjectDetailsFailure(errors)))
    }
}

export const UPDATE_SERIAL_NUMBER_REQUEST = 'UPDATE_SERIAL_NUMBER_REQUEST'
export const UPDATE_SERIAL_NUMBER_SUCCESS = 'UPDATE_SERIAL_NUMBER_SUCCESS'
export const UPDATE_SERIAL_NUMBER_FAILURE = 'UPDATE_SERIAL_NUMBER_FAILURE'

export const updateSerialNumberRequest = createAction(UPDATE_SERIAL_NUMBER_REQUEST)
export const updateSerialNumberSuccess = createAction(UPDATE_SERIAL_NUMBER_SUCCESS, 'updateSerialNumber')
export const updateSerialNumberFailure = createAction(UPDATE_SERIAL_NUMBER_FAILURE, 'errors')

export function updateSerialNumber(reqObj) {
    return dispatch => {
        dispatch(updateSerialNumberRequest(reqObj))
        return ajax.post('/graphql4g', {
            query: schema.updateSerialNumber,
            variables: {
                "atoll_info_input": reqObj
            }
        })
            .then(res => {
                return dispatch(updateSerialNumberSuccess(res.data))
            })
            .catch(errors => dispatch(updateSerialNumberFailure(errors)))
    }
}

export const GET_ALARM_TEST_INFO_REQUEST = 'GET_ALARM_TEST_INFO_REQUEST';
export const GET_ALARM_TEST_INFO_SUCCESS = 'GET_ALARM_TEST_INFO_SUCCESS';
export const GET_ALARM_TEST_INFO_FAILURE = 'GET_ALARM_TEST_INFO_FAILURE';

export const getAlarmTestInfoRequest = createAction(GET_ALARM_TEST_INFO_REQUEST);
export const getAlarmTestInfoSuccess = createAction(GET_ALARM_TEST_INFO_SUCCESS, 'alarmTestInfo');
export const getAlarmTestInfoFailure = createAction(GET_ALARM_TEST_INFO_FAILURE, 'errors');

export function getAlarmTestInfo(siteUnid, site,method) {
    return dispatch => {
        dispatch(getAlarmTestInfoRequest(siteUnid));
        return ajax.post('/graphql4g', {
            query: schema.getTestInfo,
            variables: { siteUnid, site ,method }
        })
        .then(res => {
            dispatch(getAlarmTestInfoSuccess(res.data.data));
            return res.data.data;
        })
        .catch(errors => {
            dispatch(getAlarmTestInfoFailure(errors))
            return errors
        });
    };
}

export function getOpenTest(siteUnid) {
    return ajax.post('/graphql4g', {
        query: schema.getOpenTest,
        variables: { siteUnid }
    })
    .then(res => {
        return res.data.data;
    })
    .catch(errors =>{
        dispatch(getAlarmTestInfoFailure(errors))
        return errors
    });

}

export function createEatTestRequest(payload) {
    return ajax.post('/graphql4g', {
        query: schema.createEatTestRequest,
        variables: payload
    })
    .then(res => {
        return res.data.data;
    })
    .catch(errors => {
        dispatch(getAlarmTestInfoFailure(errors))
        return errors
    });
}
export function cancelEatTestRequest(payload) {
    return ajax.post('/graphql4g', {
        query: schema.cancelEatTestRequest,
        variables: payload
    })
    .then(res => {
        return res.data.data;
    })
    .catch(errors => {
        dispatch(getAlarmTestInfoFailure(errors))
        return errors
    });
}
export function startEatTestRequest(payload) {
    return ajax.post('/graphql4g', {
        query: schema.startEatTestRequest,
        variables: payload
    })
    .then(res => {
        return res.data.data;
    })
    .catch(errors => {
        dispatch(getAlarmTestInfoFailure(errors))
        return errors
    });
}

export function stopEatTestRequest(payload) {
  return ajax.post('/graphql4g', {
      query: schema.stopEatTestRequest,
      variables: payload
  })
  .then(res => {
      return res.data.data;
  })
  .catch(errors => {
      dispatch(getAlarmTestInfoFailure(errors))
      return errors
  });
}

export function completeEatTestRequest(payload) {
    return ajax.post('/graphql4g', {
        query: schema.completeEatTestRequest,
        variables: payload
    })
    .then(res => {
        return res.data.data;
    })
    .catch(errors => {
        dispatch(getAlarmTestInfoFailure(errors))
        return errors
    });
}

export function getTestStatusRequest(payload) {
    return ajax.post('/graphql4g', {
        query: schema.getTestStatus,
        variables: payload
    })
    .then(res => {
        return res.data.data;
    })
    .catch(errors => {
        dispatch(getAlarmTestInfoFailure(errors))
        return errors
    });
}




export const GET_TEST_HISTORY_REQUEST = 'GET_TEST_HISTORY_REQUEST'
export const GET_TEST_HISTORY_SUCCESS = 'GET_TEST_HISTORY_SUCCESS'
export const GET_TEST_HISTORY_FAILURE = 'GET_TEST_HISTORY_FAILURE'

export const getTestHistoryRequest = createAction(GET_TEST_HISTORY_REQUEST)
export const getTestHistorySuccess = createAction(GET_TEST_HISTORY_SUCCESS, 'testHistory')
export const getTestHistoryFailure = createAction(GET_TEST_HISTORY_FAILURE, 'errors')

export function getTestHistory(siteUnid) {
    return dispatch => {
        dispatch(getTestHistoryRequest(siteUnid))
        return ajax.post('/graphql4g', {
            query: schema.getTestHistory,
            variables: { siteUnid }
        })
            .then(res => {

                dispatch(getTestHistorySuccess(res.data.data.getTestHistory))
                console.log("getTestHistory response--->", res.data.data.getTestHistory);
                
                return res.data.data.getTestHistory;
            })
            .catch(errors => dispatch(getTestHistoryFailure(errors)))
    }
}

// EAT Audit Actions
export const GET_EAT_AUDIT_REQUEST = 'GET_EAT_AUDIT_REQUEST';
export const GET_EAT_AUDIT_SUCCESS = 'GET_EAT_AUDIT_SUCCESS';
export const GET_EAT_AUDIT_FAILURE = 'GET_EAT_AUDIT_FAILURE';

export const getEatAuditRequest = createAction(GET_EAT_AUDIT_REQUEST);
export const getEatAuditSuccess = createAction(GET_EAT_AUDIT_SUCCESS, 'auditData');
export const getEatAuditFailure = createAction(GET_EAT_AUDIT_FAILURE, 'errors');

export function getEatAudit(eatTestId) {
    return dispatch => {
        dispatch(getEatAuditRequest(eatTestId));
        return ajax.post('/graphql4g', {
            query: schema.getTestAuditDetails,
            variables: { eatTestId: parseInt(eatTestId) }
        })
        .then(res => {
            if (res?.data?.data?.getTestAuditDetails) {
                const { statusCode, message, audit_info } = res.data.data.getTestAuditDetails;
                
                if (statusCode === 200) {
                    dispatch(getEatAuditSuccess(audit_info || []));
                    return audit_info || [];
                } else {
                    const errorMessage = message || 'Failed to fetch audit details';
                    dispatch(getEatAuditFailure(errorMessage));
                    throw new Error(errorMessage);
                }
            } else if (res.data?.errors && res.data.errors.length > 0) {
                const errorMessage = res.data.errors[0]?.message || 
                                   res.data.errors[0]?.data?.message || 
                                   res.data.errors[0]?.data?.detail || 
                                   "Unknown error occurred";
                dispatch(getEatAuditFailure(errorMessage));
                throw new Error(errorMessage);
            } else {
                const errorMessage = "No audit data found";
                dispatch(getEatAuditFailure(errorMessage));
                throw new Error(errorMessage);
            }
        })
        .catch(errors => {
            const errorMessage = errors?.message || "Failed to fetch audit details";
            dispatch(getEatAuditFailure(errorMessage));
        });
    };
}
