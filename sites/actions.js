import axios from "axios";
import ajax from "../ajax";
import { createAction } from "../redux_utils";
import * as schema from "./schema";
import { getAnteenaInformation } from "../VendorDashboard/schema";
import { getRadioInfo } from "../VendorDashboard/schema";
import { metroRootActiveDates } from "../Utils/metroRootUtils";

export const RESET_PROPS = "RESET_PROPS";

export const DOWNLOAD_HC_DETAILS_REQUEST = "DOWNLOAD_HC_DETAILS_REQUEST";
export const DOWNLOAD_HC_DETAILS_SUCCESS = "DOWNLOAD_HC_DETAILS_SUCCESS";
export const DOWNLOAD_HC_DETAILS_ERROR = "DOWNLOAD_HC_DETAILS_ERROR";

export const downloadHcDetailsRequest = createAction(
  DOWNLOAD_HC_DETAILS_REQUEST,
  "loginId"
);
export const downloadHcDetailsSuccess = createAction(
  DOWNLOAD_HC_DETAILS_SUCCESS,
  "loginId",
  "result"
);
export const downloadHcDetailsError = createAction(
  DOWNLOAD_HC_DETAILS_ERROR,
  "loginId",
  "errorMessage"
);

export const FETCH_SITEDETAILS_REQUEST = "FETCH_SITEDETAILS_REQUEST";
export const FETCH_SITEDETAILS_SUCCESS = "FETCH_SITEDETAILS_SUCCESS";
export const FETCH_SITEDETAILS_FAILURE = "FETCH_SITEDETAILS_FAILURE";

// export const FETCH_ISSUE_SUCCESS = "FETCH_ISSUE_SUCCESS";

export const FETCH_LOCKDATA_REQUEST = "FETCH_LOCKDATA_REQUEST";
export const FETCH_LOCKDATA_SUCCESS = "FETCH_LOCKDATA_SUCCESS";
export const FETCH_LOCKDATA_FAILURE = "FETCH_LOCKDATA_FAILURE";

export const FETCH_SECTORINFO_REQUEST = "FETCH_SECTORINFO_REQUEST";
export const FETCH_SECTORINFO_SUCCESS = "FETCH_SECTORINFO_SUCCESS";
export const FETCH_SECTORINFO_FAILURE = "FETCH_SECTORINFO_FAILURE";

export const getSectorInfoRequest = createAction(
  FETCH_SECTORINFO_REQUEST,
  "loginId"
);
export const getSectorInfoSuccess = createAction(
  FETCH_SECTORINFO_SUCCESS,
  "loginId",
  "enodeb_id",
  "sectorInfo"
);
export const getSectorInfoFailure = createAction(
  FETCH_SECTORINFO_FAILURE,
  "loginId",
  "errors"
);

export const fetchSiteDetailsRequest = createAction(
  FETCH_SITEDETAILS_REQUEST,
  "loginId"
);
export const fetchSiteDetailsSuccess = createAction(
  FETCH_SITEDETAILS_SUCCESS,
  "loginId",
  "siteunid",
  "site"
);
export const fetchSiteDetailsFailure = createAction(
  FETCH_SITEDETAILS_FAILURE,
  "loginId",
  "errors"
);

export const fetchSiteDataRequest = createAction(
  FETCH_SITEDETAILS_REQUEST,
  "loginId"
);
export const fetchSiteDataSuccess = createAction(
  FETCH_SITEDETAILS_SUCCESS,
  "loginId",
  "siteunid",
  "site"
);
export const fetchSiteDataFailure = createAction(
  FETCH_SITEDETAILS_FAILURE,
  "loginId",
  "errors"
);
export const fetchLockDataRequest = createAction(
  FETCH_LOCKDATA_REQUEST,
  "loginId",
  "vendorId",
  "workOrderId",
  "lockReqId"
);
export const fetchLockDataSuccess = createAction(
  FETCH_LOCKDATA_SUCCESS,
  "loginId",
  "vendorId",
  "workOrderId",
  "lockReqId",
  "lockReqData"
);
export const fetchLockDataFailure = createAction(
  FETCH_LOCKDATA_FAILURE,
  "loginId",
  "vendorId",
  "workOrderId",
  "lockReqId",
  "errors"
);

export const FETCH_SITES_BY_SUBMARKET_REQUEST =
  "FETCH_SITES_BY_SUBMARKET_REQUEST";
export const FETCH_SITES_BY_SUBMARKET_SUCCESS =
  "FETCH_SITES_BY_SUBMARKET_SUCCESS";
export const FETCH_SITES_BY_SUBMARKET_FAILURE =
  "FETCH_SITES_BY_SUBMARKET_FAILURE";

export const fetchSitesBySubmarketRequest = createAction(
  FETCH_SITES_BY_SUBMARKET_REQUEST,
  "loginId"
);
export const fetchSitesBySubmarketSuccess = createAction(
  FETCH_SITES_BY_SUBMARKET_SUCCESS,
  "loginId",
  "sites"
);
export const fetchSitesBySubmarketFailure = createAction(
  FETCH_SITES_BY_SUBMARKET_FAILURE,
  "loginId",
  "errors"
);

export const FETCH_TECHS_BY_SUBMARKET_SUCCESS =
  "FETCH_TECHS_BY_SUBMARKET_SUCCESS";

export const fetchTechsBySubmarketSuccess = createAction(
  FETCH_TECHS_BY_SUBMARKET_SUCCESS,
  "loginId",
  "techs"
);

export const DOWNLOAD_LOCK_FILE_SUCCESS = "DOWNLOAD_LOCK_FILE_SUCCESS";
export const DOWNLOAD_LOCK_FILE_ERROR = "DOWNLOAD_LOCK_FILE_ERROR";
export const DOWNLOAD_LOCK_FILE_REQUEST = "DOWNLOAD_LOCK_FILE_REQUEST";
export const LOADING_iSSUES="LOADING_iSSUES"

export const downloadLockFileRequest = createAction(
  DOWNLOAD_LOCK_FILE_REQUEST,
  "loginId"
);
export const downloadLockFileSuccess = createAction(
  DOWNLOAD_LOCK_FILE_SUCCESS,
  "loginId",
  "attachmentData"
);
export const downloadLockFileError = createAction(
  DOWNLOAD_LOCK_FILE_ERROR,
  "loginId",
  "errorMessage"
);

export function downloadLockFile(loginId, file_Id) {
  return (dispatch) => {
    dispatch(downloadLockFileRequest(loginId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.downloadLockUnlockAttachment,
        variables: { file_Id: file_Id },
      })
      .then((res) => {
        if (
          res.data &&
          res.data.data &&
          res.data.data.downloadLockUnlockAttachment
        ) {
          return dispatch(
            downloadLockFileSuccess(
              loginId,
              res.data.data.downloadLockUnlockAttachment
            )
          );
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data
            ? res.data.errors[0].data.message
              ? res.data.errors[0].data.message
              : res.data.errors[0].data.detail
              ? res.data.errors[0].data.detail
              : res.data.errors[0].message
            : res.data.errors[0].message;
          return dispatch(downloadLockFileError(loginId, { message }));
        } else {
          return dispatch(
            downloadLockSFileError(loginId, {
              message: "Unknown Error! Please contact administrator.",
            })
          );
        }
      })
      .catch((errors) => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(
            downloadLockFileError(loginId, { message: errors[0].message })
          );
        } else {
          return dispatch(downloadLockFileError(loginId, errors));
        }
      });
  };
}


export function downloadHcDetails(loginId, requestid) {
  return (dispatch) => {
    dispatch(downloadHcDetailsRequest(loginId, requestid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.downloadHealthCheck,
        variables: { requestid },
      })
      .then((res) => {
        if (res.data && res.data.data && res.data.data.getDownloadHealthcheck) {
          return dispatch(
            downloadHcDetailsSuccess(
              loginId,
              res.data.data.getDownloadHealthcheck.data
            )
          );
        }
      })
      .catch((errors) => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(
            downloadHcDetailsError(loginId, { message: errors[0].message })
          );
        } else {
          return dispatch(downloadHcDetailsError(loginId, errors));
        }
      });
  };
}

export const FETCH_HEALTHCHECK_REQUEST = "FETCH_HEALTHCHECK_REQUEST";
export const FETCH_HEALTHCHECK_SUCCESS = "FETCH_HEALTHCHECK_SUCCESS";
export const FETCH_HEALTHCHECK_FAILURE = "FETCH_HEALTHCHECK_FAILURE";



export const fetchHealthCheck = createAction(
  FETCH_HEALTHCHECK_REQUEST,
  "loginId"
);
export const fetchHealthCheckSuccess = createAction(
  FETCH_HEALTHCHECK_SUCCESS,
  "loginId",
  "healthCheckReqs"
);
export const fetchHealthCheckFailure = createAction(
  FETCH_HEALTHCHECK_FAILURE,
  "loginId",
  "errors"
);
/*sqi Information componenet action*/
export const FETCH_ISSUE_REQUEST = "FETCH_ISSUE_REQUEST";
export const FETCH_ISSUE_SUCCESS = "FETCH_ISSUE_SUCCESS";
export const FETCH_ISSUE_FAILURE = "FETCH_ISSUE_FAILURE";

export const SUBMIT_RESOLUTION_REQUEST = "SUBMIT_RESOLUTION_REQUEST";
export const SUBMIT_RESOLUTION_SUCCESS = "SUBMIT_RESOLUTION_SUCCESS";
export const SUBMIT_RESOLUTION_FAILURE = "SUBMIT_RESOLUTION_FAILURE";

export const ADD_RESTRICTION_REQUEST = "ADD_RESTRICTION_REQUEST";
export const ADD_RESTRICTION_SUCCESS = "ADD_RESTRICTION_SUCCESS";
export const ADD_RESTRICTION_FAILURE = "ADD_RESTRICTION_FAILURE";

export const FETCH_RESOLUTION_REQUEST = "FETCH_RESOLUTION_REQUEST";
export const FETCH_RESOLUTION_SUCCESS = "FETCH_RESOLUTION_SUCCESS";
export const FETCH_RESOLUTION_FAILURE = "FETCH_RESOLUTION_FAILURE";

export const fetchResolutiondata = createAction(
  FETCH_RESOLUTION_REQUEST,
  "loginId"
);
export const fetchResolutiondataSuccess = createAction(
  FETCH_RESOLUTION_SUCCESS,
  "loginId",
  "issueResolutionData"
);
export const fetchResolutiondataFailure = createAction(
  FETCH_RESOLUTION_FAILURE,
  "loginId",
  "errors"
);

export const FETCH_ANTEENADETAILS_REQUEST = "FETCH_ANTEENADETAILS_REQUEST";
export const FETCH_ANTEENADETAILS_SUCCESS = "FETCH_ANTEENADETAILS_SUCCESS";
export const FETCH_ANTEENADETAILS_FAILURE = "FETCH_ANTEENADETAILS_FAILURE";

export const fetchAnteenadata = createAction(
  FETCH_ANTEENADETAILS_REQUEST,
  "loginId"
);
export const fetchAnteenadataSuccess = createAction(
  FETCH_ANTEENADETAILS_SUCCESS,
  "loginId",
  "anteenaInfo"
);
export const fetchAnteenadataFailure = createAction(
  FETCH_ANTEENADETAILS_FAILURE,
  "loginId",
  "errors"
);
export const FETCH_RADIODETAILS_REQUEST = "FETCH_RADIODETAILS_REQUEST";
export const FETCH_RADIODETAILS_SUCCESS = "FETCH_RADIODETAILS_SUCCESS";
export const FETCH_RADIODETAILS_FAILURE = "FETCH_RADIODETAILS_FAILURE";

export const fetchRadiodata = createAction(
  FETCH_RADIODETAILS_REQUEST,
  "loginId"
);
export const fetchRadiodataSuccess = createAction(
  FETCH_RADIODETAILS_SUCCESS,
  "loginId",
  "radioInfo"
);
export const fetchRadiodataFailure = createAction(
  FETCH_RADIODETAILS_FAILURE,
  "loginId",
  "errors"
);

export const submitResolutiondata = createAction(
  SUBMIT_RESOLUTION_REQUEST,
  "loginId"
);
export const submitResolutiondataSuccess = createAction(
  SUBMIT_RESOLUTION_SUCCESS,
  "loginId",
  "update_comments"
);
export const submitResolutiondataFailure = createAction(
  SUBMIT_RESOLUTION_FAILURE,
  "loginId",
  "errors"
);
/*Restriction actions */
export const addRestrictionData = createAction(
  ADD_RESTRICTION_REQUEST,
  "loginId"
);
export const addRestrictionDataSuccess = createAction(
  ADD_RESTRICTION_SUCCESS,
  "loginId",
  "updated_access_restriction"
);
export const addRestrictionDataFailure = createAction(
  ADD_RESTRICTION_FAILURE,
  "loginId",
  "errors"
);

export const fetchissuedata = createAction(
  FETCH_ISSUE_REQUEST,
  "loginId"
);
export const fetchissuedataSuccess = createAction(
  FETCH_ISSUE_SUCCESS,
  "loginId",
  "issueData"
);
export const fetchissuedataFailure = createAction(
  FETCH_ISSUE_FAILURE,
  "loginId",
  "errors"
);
export function getIssueDetails(loginId, unid) {
  return (dispatch) => {
    dispatch(fetchissuedata(loginId, unid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getIssues,
        variables: {unid},
      })
      .then((res) => {
        return dispatch(
          fetchissuedataSuccess(loginId, res.data.data.getIssues.qissue_details)
        );
      })
      .catch((errors) => dispatch(fetchissuedataFailure(loginId, errors)));
  };
}

export function getResolutionTypes(loginId,problemType) {
  return (dispatch) => {
    dispatch(fetchResolutiondata(loginId, problemType));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getResolutionTypeData,
        variables: {problemType},
      })
      .then((res) => {
        return dispatch(
          fetchResolutiondataSuccess(loginId, res.data.data.getProblemData.resolution_type)
        );
      })
      .catch((errors) => dispatch(fetchResolutiondataFailure(loginId, errors)));
  };
}


export function submitResolutionTypes(loginId, input,unid) {
  return (dispatch) => {
    dispatch(submitResolutiondata(loginId,input,unid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.updateResolution,
        variables: { unid,input },
      })
      .then((res) => {
        return dispatch(
          submitResolutiondataSuccess(loginId, res.data.data.updateResolution)
        );
      })
      .catch((errors) => dispatch(submitResolutiondataFailure(loginId, errors)));
  };
}
/*Get Anteena Informtion*/
export function getAnteenaInformationDetails(loginId,siteUnid) {
  return (dispatch) => {
    dispatch(fetchAnteenadata(loginId));
    return ajax
      .post(`/graphql4g`, {
        query:getAnteenaInformation,
        variables: { siteUnid },
      })
      .then((res) => {
        return dispatch(
        fetchAnteenadataSuccess(loginId, res?.data?.data?.getAnteenaInformation?.towerdetails?.antenna_info_for_site)
        );
      })
      .catch((errors) => dispatch(fetchAnteenadataFailure(loginId, errors)));
  };
}
/*Get Radio Informtion*/
export function getRadioInfoDetails(loginId, siteUnid) {
  return (dispatch) => {
    dispatch(fetchRadiodata(loginId));
    return ajax
      .post(`/graphql4g`, {
        query:getRadioInfo,
        variables: { siteUnid },
      })
      .then((res) => {
        return dispatch(
        fetchRadiodataSuccess(loginId, res?.data?.data?.getRadioInfo?.radioInfo)
        );
      })
      .catch((errors) => dispatch(fetchRadiodataFailure(loginId, errors)));
  };
}
/*Add restrictions*/
export function addRestriction(loginId,input,unid, fuzeSiteId) {
  return (dispatch) => {
    dispatch(addRestrictionData(loginId,input,unid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.updateRestriction,
        variables: {loginId,fuzeSiteId,unid,input},
      })
      .then((res) => {
        return dispatch(
          addRestrictionDataSuccess(loginId, res.data.data.updateAccessRestrictions.updated_access_restriction)
        );
      })
      .catch((errors) => dispatch(addRestrictionDataFailure(loginId, errors)));
  };
}


export const FETCH_CBANDTOOLS_REQUEST = "FETCH_CBANDTOOLS_REQUEST";
export const FETCH_CBANDTOOLS_SUCCESS = "FETCH_CBANDTOOLS_SUCCESS";
export const FETCH_CBANDTOOLS_FAILURE = "FETCH_CBANDTOOLS_FAILURE";

export const DOWNLOAD_MMU_RESULT_REQUEST = "DOWNLOAD_MMU_RESULT_REQUEST";
export const DOWNLOAD_MMU_RESULT_SUCCESS = "DOWNLOAD_MMU_RESULT_SUCCESS";
export const DOWNLOAD_MMU_RESULT_FAILURE = "DOWNLOAD_MMU_RESULT_FAILURE";

export const fetchCbandToolsRequest = createAction(
  FETCH_CBANDTOOLS_REQUEST,
  "loginId"
);
export const fetchCbandToolsSuccess = createAction(
  FETCH_CBANDTOOLS_SUCCESS,
  "loginId",
  "cbandTools"
);
export const fetchCbandToolsFailure = createAction(
  FETCH_CBANDTOOLS_FAILURE,
  "loginId",
  "errors"
);

export const downloadMMUResultRequest = createAction(
  DOWNLOAD_MMU_RESULT_REQUEST,
  "loginId"
);
export const downloadMMUResultSuccess = createAction(
  DOWNLOAD_MMU_RESULT_SUCCESS,
  "loginId",
  "downloadResult"
);
export const downloadMMUResultFailure = createAction(
  DOWNLOAD_MMU_RESULT_FAILURE,
  "loginId",
  "errors"
);

export const CREATE_HEALTHCHECK_REQUEST = "CREATE_HEALTHCHECK_REQUEST";
export const CREATE_HEALTHCHECK_SUCCESS = "CREATE_HEALTHCHECK_SUCCESS";
export const CREATE_HEALTHCHECK_FAILURE = "CREATE_HEALTHCHECK_FAILURE";

export const LOAD_CQ_DATA = "LOAD_CQ_DATA";
export const LOAD_CQ_DATA_SUCCESS = "LOAD_CQ_DATA_SUCCESS";
export const LOAD_CQ_DATA_FAILURE = "LOAD_CQ_DATA_FAILURE";

export const createHealthCheck = createAction(
  CREATE_HEALTHCHECK_REQUEST,
  "loginId"
);
export const createHealthCheckSuccess = createAction(
  CREATE_HEALTHCHECK_SUCCESS,
  "loginId",
  "reqhealthcheck"
);
export const createHealthCheckFailure = createAction(
  CREATE_HEALTHCHECK_FAILURE,
  "loginId",
  "errors"
);

export const loadCqDataRequest = createAction(LOAD_CQ_DATA, "loginId");
export const loadCqDataSuccess = createAction(
  LOAD_CQ_DATA_SUCCESS,
  "loginId",
  "loadCqData"
);
export const loadCqDataFailure = createAction(
  LOAD_CQ_DATA_FAILURE,
  "loginId",
  "errors"
);

export const HEALTHCHECK_REQUEST = "HEALTHCHECK_REQUEST";
export const HEALTHCHECK_DISABLE = "HEALTHCHECK_SUCCESS";
export const HEALTHCHECK_ENABLE = "HEALTHCHECK_FAILURE";

export const SITEACCESS_REFRESH_ENABLE = "SITEACCESS_REFRESH_ENABLE";
export const SITEACCESS_REFRESH_DISABLE = "SITEACCESS_REFRESH_DISABLE";

export const MMU_DISABLE = "MMU_DISABLE";
export const MMU_ENABLE = "MMU_ENABLE";

export const FETCH_HEALTHCHECK_DETAILS_REQUEST =
  "FETCH_HEALTHCHECK_DETAILS_REQUEST";
export const FETCH_HEALTHCHECK_DETAILS_SUCCESS =
  "FETCH_HEALTHCHECK_DETAILS_SUCCESS";
export const FETCH_HEALTHCHECK_DETAILS_FAILURE =
  "FETCH_HEALTHCHECK_DETAILS_FAILURE";

export const fetchHealthCheckDetailsRequest = createAction(
  FETCH_HEALTHCHECK_DETAILS_REQUEST,
  "loginId"
);
export const fetchHealthCheckDetailsSuccess = createAction(
  FETCH_HEALTHCHECK_DETAILS_SUCCESS,
  "loginId",
  "result"
);
export const fetchHealthCheckDetailsFailure = createAction(
  FETCH_HEALTHCHECK_DETAILS_FAILURE,
  "loginId",
  "errors"
);

export const healthCheckDisable = createAction(
  HEALTHCHECK_DISABLE,
  "isRequested"
);
export const healthCheckEnable = createAction(
  HEALTHCHECK_ENABLE,
  "isRequested"
);

export const siteAccessRefreshEnable = createAction(
  SITEACCESS_REFRESH_ENABLE,
  "refreshEnable"
);
export const siteAccessRefreshDisable = createAction(
  SITEACCESS_REFRESH_DISABLE,
  "refreshEnable"
);
export const mmuLinkDisable = createAction(MMU_DISABLE, "isDisabled");
export const mmuLinkEnable = createAction(MMU_ENABLE, "isDisabled");

export const GENERATE_VALIDATION_REQUEST = "GENERATE_VALIDATION_REQUEST";
export const GENERATE_VALIDATION_SUCCESS = "GENERATE_VALIDATION_SUCCESS";
export const GENERATE_VALIDATION_FAILURE = "GENERATE_VALIDATION_FAILURE";
export const generateValidationRequest = createAction(
  GENERATE_VALIDATION_REQUEST,
  "loginId"
);
export const generateValidationSuccess = createAction(
  GENERATE_VALIDATION_SUCCESS,
  "loginId",
  "generateValidationMMU"
);
export const generateValidationFailure = createAction(
  GENERATE_VALIDATION_FAILURE,
  "loginId",
  "errors"
);

export function fetchHealthCheckReqs(loginId, siteunid) {
  return (dispatch) => {
    dispatch(fetchHealthCheck(loginId, siteunid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getHealthChecks,
        variables: { siteunid },
      })
      .then((res) => {
        return dispatch(
          fetchHealthCheckSuccess(loginId, res.data.data.getHealthCheckDetails)
        );
      })
      .catch((errors) => dispatch(fetchHealthCheckFailure(loginId, errors)));
  };
}

export function fetchCbandTools(loginId, project_id) {
  return (dispatch) => {
    dispatch(fetchCbandToolsRequest(loginId, project_id));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getMMURequests,
        variables: { project_id },
      })
      .then((res) => {
        return dispatch(
          fetchCbandToolsSuccess(loginId, res.data.data.getMMURequests)
        );
      })
      .catch((errors) => dispatch(fetchCbandToolsFailure(loginId, errors)));
  };
}
export function generateValidationMMU(loginId, input) {
  return (dispatch) => {
    dispatch(generateValidationRequest(loginId, input));
    return ajax
      .post(`/graphql4g`, {
        query: schema.generateValidationMMU,
        variables: { validateData: input },
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(generateValidationFailure(loginId, res.data.errors));
        }
        if (res.data && res.data.data && res.data.data.generateValidationMMU) {
          return dispatch(
            generateValidationSuccess(
              loginId,
              res.data.data.generateValidationMMU
            )
          );
        }
      })
      .catch((errors) => dispatch(generateValidationFailure(loginId, errors)));
  };
}
export function downloadMMUResult(loginId, request_id) {
  return (dispatch) => {
    dispatch(downloadMMUResultRequest(loginId, request_id));
    return ajax
      .post(`/graphql4g`, {
        query: schema.viewMMUDownload,
        variables: { request_id },
      })
      .then((res) => {
        return dispatch(
          downloadMMUResultSuccess(loginId, res.data.data.viewMMUDownload)
        );
      })
      .catch((errors) => dispatch(downloadMMUResultFailure(loginId, errors)));
  };
}

export function fetchHealthCheckDetails(loginId, requestid) {
  return (dispatch) => {
    dispatch(fetchHealthCheckDetailsRequest(loginId, requestid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getHealthDetails,
        variables: { requestid },
      })
      .then((res) => {
        dispatch(
          fetchHealthCheckDetailsSuccess(
            loginId,
            res.data.data.getHealthRequestDetails
          )
        );
      })
      .catch((errors) =>
        dispatch(fetchHealthCheckDetailsFailure(loginId, errors))
      );
  };
}

export function createHealthCheckReq(loginId, input, siteunid) {
  return (dispatch) => {
    dispatch(createHealthCheck(loginId, input, siteunid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.requestHealthCheck,
        variables: { healthReqBody: input, siteunid },
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(createHealthCheckFailure(loginId, res.data.errors));
        }
        if (res.data && res.data.data && res.data.data.requestHealthCheck) {
          return dispatch(
            createHealthCheckSuccess(loginId, res.data.data.requestHealthCheck)
          );
        }
      })
      .catch((errors) => dispatch(createHealthCheckFailure(loginId, errors)));
  };
}

export function loadCqData(loginId, input) {
  return (dispatch) => {
    dispatch(loadCqDataRequest(loginId, input));
    return ajax
      .post(`/graphql4g`, {
        query: schema.loadCqData,
        variables: { cqData: input },
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(loadCqDataFailure(loginId, res.data.errors));
        }
        if (res.data && res.data.data && res.data.data.loadCqData) {
          return dispatch(loadCqDataSuccess(loginId, res.data.data.loadCqData));
        }
      })
      .catch((errors) => dispatch(loadCqDataFailure(loginId, errors)));
  };
}

// FETCH SITE DETAILS
export function fetchSiteDetails(loginId, siteunid) {
  return (dispatch) => {
    dispatch(fetchSiteDetailsRequest(loginId, siteunid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getSiteDetail,
        variables: { siteunid },
      })
      .then((res) =>
        dispatch(
          fetchSiteDetailsSuccess(
            loginId,
            siteunid,
            res.data.data.getSiteDetails.sitedetails
          )
        )
      )
      .catch((errors) => dispatch(fetchSiteDetailsFailure(loginId, errors)));
  };
}

// FETCH SITE DETAILS IN NEST EVALUATION
export function fetchSiteData(loginId, siteunid) {
  return (dispatch) => {
    dispatch(fetchSiteDataRequest(loginId, siteunid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.fetchSiteData,
        variables: { siteunid },
      })
      .then((res) =>
        dispatch(
          fetchSiteDataSuccess(
            loginId,
            siteunid,
            res.data.data.fetchSiteData.sitedetails
          )
        )
      )
      .catch((errors) => dispatch(fetchSiteDataFailure(loginId, errors)));
  };
}

export function getSectorInfo(loginId, enodeb_id, site_unid) {
  return (dispatch) => {
    dispatch(getSectorInfoRequest(loginId, enodeb_id));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getSectorInfo,
        variables: { enodeb_id: enodeb_id, site_unid },
      })
      .then((res) => {
       if (
          res &&
          res.data &&
          res.data.data &&
          res.data.data.getSectorInfo &&
          res.data.data.getSectorInfo.enodeb_sector_info
        ) {
          dispatch(
            getSectorInfoSuccess(
              loginId,
              enodeb_id,
              res.data.data.getSectorInfo.enodeb_sector_info
            )
          );
        } else if (
          res &&
          res.data &&
          res.data.errors
        )
          dispatch(getSectorInfoFailure(loginId, res.data.errors));
      })
      .catch((errors) => dispatch(getSectorInfoFailure(loginId, errors)));
  };
}

export function fetchSitesBySubmarket(loginId, sub_market) {
  return (dispatch) => {
    dispatch(fetchSitesBySubmarketRequest(loginId, sub_market));
    return ajax
      .post(`/graphql4g`, {
        query: schema.fetchSitesBySubmarket,
        variables: { site_region: sub_market },
      })
      .then((res) => {
        if (res.data && res.data.data && res.data.data.getSitesBySubmarket) {
          let sites = [];
          let techsOptions = [];

          res.data.data.getSitesBySubmarket.sites.map((r) => {
            sites.push({ _id: r.site_unid, ...r });
          });
          if (res.data.data.getSitesBySubmarket.techs) {
            res.data.data.getSitesBySubmarket.techs.map((r) => {
              if (
                r.userid.toLowerCase().indexOf("vp0") !== 0 &&
                r.userid.toLowerCase().indexOf("vzw") !== 0
              ) {
                techsOptions.push({
                  name: "requested_by",
                  label: `${r.name}`,
                  value: `${r.name}`,
                  ...r,
                });
              }
            });
            dispatch(fetchTechsBySubmarketSuccess(loginId, techsOptions));
          }

          return dispatch(fetchSitesBySubmarketSuccess(loginId, sites));
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data
            ? res.data.errors[0].data.message
              ? res.data.errors[0].data.message
              : res.data.errors[0].data.detail
              ? res.data.errors[0].data.detail
              : res.data.errors[0].message
            : res.data.errors[0].message;
          return dispatch(fetchSitesBySubmarketFailure(loginId, { message }));
        } else {
          throw { message: "Unknow Error! Please contact administrator." };
        }
      })
      .catch((errors) => {
        if (errors && errors.length > 0 && errors[0].message) {
          return dispatch(
            fetchSitesBySubmarketFailure(loginId, {
              message: errors[0].message,
            })
          );
        } else {
          return dispatch(
            fetchSitesBySubmarketFailure(loginId, {
              message: "Unknow Error! Please contact administrator.",
            })
          );
        }
      });
  };
}

export function resetProps(keys, value) {
  return { type: "RESET_PROPS", keys, value };
}

export const SUBMIT_LOCK_SUCCESS = "SUBMIT_LOCK_SUCCESS";
export const SUBMIT_LOCK_FAILURE = "SUBMIT_LOCK_FAILURE";

export const submitLockSuccess = createAction(
  SUBMIT_LOCK_SUCCESS,
  "vendorId",
  "loginId",
  "workOderId",
  "submitLockResp"
);
export const submitLockError = createAction(
  SUBMIT_LOCK_FAILURE,
  "vendorId",
  "loginId",
  "workOderId",
  "errors"
);

export function updateSLRStatusRequest(input, lockReqId) {
  return (dispatch) => {
    return ajax.post('/graphql4g', {
      query: schema.updateSLRStatusRequest,
      variables: {updateBodyLock:input, lockReqId: lockReqId}
    }).then(response => {
      return response;
    })
  }
}
export function createLockRequest(input, siteUnid) {
  return (dispatch) => {
    return ajax.post('/graphql4g', {
      query: schema.createLockRequest,
      variables: {lockUnlockInput: input, siteUnid: siteUnid}
    }).then(response => {
      return response;
    })
  }
}
export function createUnlockRequest(input, siteUnid) {
  return (dispatch) => {
    return ajax.post('/graphql4g', {
      query: schema.createUnlockRequest,
      variables: {unlockInput: input, siteUnid: siteUnid}
    }).then(response => {
      return response;
    })
  }
}
export function submitLockRequest(vendorId, loginId, workOderId, input) {
  return (dispatch) => {
    return ajax
    .post(`/graphql4g`, {
        query: schema.submitLockRequest,
        variables: { createReqBodyInput: input },
      })
      .then((res) => {
        if (
          !!res.data &&
          !!res.data.data &&
          !!res.data.data.submitLockRequest &&
          !!res.data.data.submitLockRequest &&
          (!!res.data.data.submitLockRequest.createRequestData ||
            res.data.data.submitLockRequest.LockRequest)
        ) {
          return dispatch(
            submitLockSuccess(
              vendorId,
              loginId,
              workOderId,
              res.data.data.submitLockRequest
            )
          );
        } else if (!!res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data
            ? res.data.errors[0].data.message
              ? res.data.errors[0].data.message
              : res.data.errors[0].data.detail
              ? res.data.errors[0].data.detail
              : res.data.errors[0].message
            : res.data.errors[0].message;
          return dispatch(
            submitLockError(vendorId, loginId, workOderId, { message })
          );
        } else if (
          !!res.data &&
          !!res.data.data &&
          !!res.data.data.submitLockRequest.errors
        ) {
          let message =
            !!res.data &&
            !!res.data.data &&
            !!res.data.data.submitLockRequest.errors &&
            res.data.data.submitLockRequest.errors.length > 0
              ? res.data.data.submitLockRequest.errors[0].detail
              : "";
          return dispatch(
            submitLockError(vendorId, loginId, workOderId, { message })
          );
        } else {
          throw { message: "Unknow Error! Please contact administrator." };
        }
      })
      .catch((errors) => {
        let message =
          errors.length > 0 && errors[0].data
            ? errors[0].data.message
              ? errors[0].data.message
              : errors[0].data.detail
              ? errors[0].data.detail
              : errors[0].message
            : errors;
        dispatch(submitLockError(vendorId, loginId, workOderId, { message }));
      });
  };
}
export const SUBMIT_UNLOCK_SUCCESS = "SUBMIT_UNLOCK_SUCCESS";
export const SUBMIT_UNLOCK_FAILURE = "SUBMIT_UNLOCK_FAILURE";

export const submitUnlockSuccess = createAction(
  SUBMIT_UNLOCK_SUCCESS,
  "vendorId",
  "loginId",
  "workOderId",
  "lockReqId",
  "submitUnlockResp"
);
export const submitUnlockError = createAction(
  SUBMIT_UNLOCK_FAILURE,
  "vendorId",
  "loginId",
  "workOderId",
  "lockReqId",
  "errors"
);

export const SUBMIT_NOTES_SUCCESS = "SUBMIT_NOTES_SUCCESS";
export const SUBMIT_NOTES_FAILURE = "SUBMIT_NOTES_FAILURE";

export const submitNotesSuccess = createAction(
  SUBMIT_NOTES_SUCCESS,
  "vendorId",
  "loginId",
  "workOderId",
  "lockReqId",
  "submitNotesResp"
);
export const submitNotesError = createAction(
  SUBMIT_NOTES_FAILURE,
  "vendorId",
  "loginId",
  "workOderId",
  "lockReqId",
  "errors"
);

export const SUBMIT_ATTS_SUCCESS = "SUBMIT_ATTS_SUCCESS";
export const SUBMIT_ATTS_FAILURE = "SUBMIT_ATTS_FAILURE";

export const submitAttachmentSuccess = createAction(
  SUBMIT_ATTS_SUCCESS,
  "vendorId",
  "loginId",
  "workOderId",
  "lockReqId",
  "submitAttsResp"
);
export const submitAttachmentError = createAction(
  SUBMIT_ATTS_FAILURE,
  "vendorId",
  "loginId",
  "workOderId",
  "lockReqId",
  "errors"
);

export function manualOSWReason(ManualOswRsnInput, lockReqId) {
  return (dispatch) => {
    return ajax.post(`/graphql4g`, {
      query: schema.manualOSWReason,
      variables: { ManualOswRsnInput: ManualOswRsnInput, lockReqId: lockReqId },
    })
    .then((res) => {
      return res
    })
  }
}
export function fetchBucketCraneSiteDetails(siteunid) {
  return (dispatch) => {
    return ajax.post(`/graphql4g`, {
      query: schema.fetchBucketCraneSiteDetails,
      variables: { siteunid: siteunid},
    })
    .then((res) => {
      return res?.data?.data
    })
  }
}
export function updateStayAutoFlag(osw_request_id) {
  return (dispatch) => {
    return ajax.post(`/graphql4g`, {
      query: schema.updateStayAutoFlag,
      variables: { osw_request_id: osw_request_id },
    })
    .then((res) => {
      return res
    })
  }
}

export function submitNotes(vendorId, loginId, workOderId, input, lockReqId) {
  return (dispatch) => {
    return ajax
      .post(`/graphql4g`, {
        query: schema.submitNotes,
        variables: { submitNotesInput: input, lockReqId },
      })
      .then((res) => {
        if (
          !!res.data &&
          !!res.data.data &&
          !!res.data.data.submitNotes &&
          !!res.data.data.submitNotes.message &&
          res.data.data.submitNotes.message === "Note added successfully"
        ) {
          return dispatch(
            submitNotesSuccess(
              vendorId,
              loginId,
              workOderId,
              lockReqId,
              res.data.data.submitNotes.message
            )
          );
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data
            ? res.data.errors[0].data.message
              ? res.data.errors[0].data.message
              : res.data.errors[0].data.detail
              ? res.data.errors[0].data.detail
              : res.data.errors[0].message
            : res.data.errors[0].message;
          return dispatch(
            submitNotesError(vendorId, loginId, workOderId, lockReqId, {
              message,
            })
          );
        } else {
          throw { message: "Unknow Error! Please contact administrator." };
        }
      })
      .catch((errors) => {
        let message =
          errors.length > 0 && errors[0].data
            ? errors[0].data.message
              ? errors[0].data.message
              : errors[0].data.detail
              ? errors[0].data.detail
              : errors[0].message
            : errors;
        dispatch(
          submitNotesError(vendorId, loginId, workOderId, lockReqId, {
            message,
          })
        );
      });
  };
}

export function submitAttachment(
  vendorId,
  loginId,
  workOderId,
  input,
  lockReqId
) {
  return (dispatch) => {
    return ajax
      .post(`/graphql4g`, {
        query: schema.submitAttachment,
        variables: { submitAttachmentInput: input, lockReqId },
      })
      .then((res) => {
        if (
          !!res.data &&
          !!res.data.data &&
          !!res.data.data.submitAttachment &&
          !!res.data.data.submitAttachment.message &&
          res.data.data.submitAttachment.message ===
            "File(s) uploaded successfully"
        ) {
          return dispatch(
            submitAttachmentSuccess(
              vendorId,
              loginId,
              workOderId,
              lockReqId,
              res.data.data.submitAttachment.message
            )
          );
        } else if (res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data
            ? res.data.errors[0].data.message
              ? res.data.errors[0].data.message
              : res.data.errors[0].data.detail
              ? res.data.errors[0].data.detail
              : res.data.errors[0].message
            : res.data.errors[0].message;
          return dispatch(
            submitAttachmentError(vendorId, loginId, workOderId, lockReqId, {
              message,
            })
          );
        } else {
          throw { message: "Unknow Error! Please contact administrator." };
        }
      })
      .catch((errors) => {
        let message =
          errors.length > 0 && errors[0].data
            ? errors[0].data.message
              ? errors[0].data.message
              : errors[0].data.detail
              ? errors[0].data.detail
              : errors[0].message
            : errors;
        dispatch(
          submitAttachmentError(vendorId, loginId, workOderId, lockReqId, {
            message,
          })
        );
      });
  };
}

export function fetchLockData(loginId, vendorId, workOrderId, lockReqId) {
  return (dispatch) => {
    dispatch(fetchLockDataRequest(loginId, vendorId, workOrderId, lockReqId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getLockData,
        variables: { lockReqId },
      })

      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getLockData &&
          !!res.data.data.getLockData.lockRequest
        ) {
          return dispatch(
            fetchLockDataSuccess(
              loginId,
              vendorId,
              workOrderId,
              lockReqId,
              res.data.data.getLockData
            )
          );
        } else {
          return dispatch(
            fetchLockDataFailure(
              loginId,
              vendorId,
              workOrderId,
              lockReqId,
              errors
            )
          );
        }
      })
      .catch((errors) =>
        dispatch(
          fetchLockDataFailure(
            loginId,
            vendorId,
            workOrderId,
            lockReqId,
            errors
          )
        )
      );
  };
}
export const FETCH_SECTORLOCKDATA_REQUEST = "FETCH_SECTORLOCKDATA_REQUEST";
export const FETCH_SECTORLOCKDATA_SUCCESS = "FETCH_SECTORLOCKDATA_SUCCESS";
export const FETCH_SECTORLOCKDATA_FAILURE = "FETCH_SECTORLOCKDATA_FAILURE";

export const fetchSectorLockDataRequest = createAction(
  FETCH_SECTORLOCKDATA_REQUEST,
  "vendorId",
  "loginId"
);
export const fetchSectorLockDataSuccess = createAction(
  FETCH_SECTORLOCKDATA_SUCCESS,
  "vendorId",
  "loginId",
  "unid",
  "sectorLockData"
);
export const fetchSectorLockDataFailure = createAction(
  FETCH_SECTORLOCKDATA_FAILURE,
  "vendorId",
  "loginId",
  "unid",
  "errorsSectorLockData"
);

export function fetchSectorLockData(vendorId, loginId, unid) {
  let variables = { unid: unid };

  return (dispatch) => {
    // dispatch(fetchSectorLockDataRequest(vendorId, loginId))
    return ajax
      .post(`/graphql4g`, {
        query: schema.fetchSectorLockData,
        variables: variables,
      })

      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(
            fetchSectorLockDataFailure(vendorId, loginId, unid, res.data.errors)
          );
        } else if (!!res.data && !!res.data.data) {
          return dispatch(
            fetchSectorLockDataSuccess(vendorId, loginId, unid, res.data.data)
          );
        }
      })
      .catch((errors) => {
        dispatch(fetchSectorLockDataFailure(vendorId, loginId, unid, errors));
      });
  };
}

export const FETCH_ENODEB_REQUEST = "FETCH_ENODEB_REQUEST";
export const FETCH_ENODEB_SUCCESS = "FETCH_ENODEB_SUCCESS";
export const FETCH_ENODEB_FAILURE = "FETCH_ENODEB_FAILURE";

export const fetchenodebDataRequest = createAction(
  FETCH_ENODEB_REQUEST,
  "vendorId",
  "loginId"
);
export const fetchenodebDataSuccess = createAction(
  FETCH_ENODEB_SUCCESS,
  "vendorId",
  "loginId",
  "unid",
  "enodebData"
);
export const fetchenodebDataFailure = createAction(
  FETCH_ENODEB_SUCCESS,
  "vendorId",
  "loginId",
  "unid",
  "errorsenodebData"
);

export function fetchenodebData(vendorId, loginId, unid) {
  let variables = { unid: unid };

  return (dispatch) => {
    // dispatch(fetchenodebDataRequest(vendorId, loginId))
    return ajax
      .post(`/graphql4g`, { query: schema.getEnodebData, variables: variables })

      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(
            fetchenodebDataFailure(vendorId, loginId, unid, res.data.errors)
          );
        } else if (!!res.data && !!res.data.data) {
          return dispatch(
            fetchenodebDataSuccess(vendorId, loginId, unid, res.data.data)
          );
        }
      })
      .catch((errors) => {
        dispatch(fetchenodebDataFailure(vendorId, loginId, unid, errors));
      });
  };
}

export const CREATE_DEVICE_TEST_REQ_REQUEST = "CREATE_DEVICE_TEST_REQ_REQUEST";
export const CREATE_DEVICE_TEST_REQ_SUCCESS = "CREATE_DEVICE_TEST_REQ_SUCCESS";
export const CREATE_DEVICE_TEST_REQ_FAILURE = "CREATE_DEVICE_TEST_REQ_FAILURE";

export const createDeviceTestReqRequest = createAction(
  CREATE_DEVICE_TEST_REQ_REQUEST
);
export const createDeviceTestReqSuccess = createAction(
  CREATE_DEVICE_TEST_REQ_SUCCESS
);
export const createDeviceTestReqFailure = createAction(
  CREATE_DEVICE_TEST_REQ_FAILURE
);

export function createDeviceTestReq(payload) {
  return (dispatch) => {
    dispatch(createDeviceTestReqRequest());
    return ajax
      .post(`/graphql4g`, {
        query: schema.createDeviceTestRequest,
        variables: payload,
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(createDeviceTestReqFailure(res.data));
          return res.data;
        } else if (
          !!res.data &&
          !!res.data.data &&
          !!res.data.data.createDeviceTestRequest
        ) {
          dispatch(createDeviceTestReqSuccess(res.data));
          return res.data;
        }
      });
  };
}

export const DEVICE_TEST_DETAILS_REQUEST = "DEVICE_TEST_DETAILS_REQUEST";
export const DEVICE_TEST_DETAILS_SUCCESS = "DEVICE_TEST_DETAILS_SUCCESS";
export const DEVICE_TEST_DETAILS_FAILURE = "DEVICE_TEST_DETAILS_FAILURE";

export const deviceTestDetailsRequest = createAction(
  DEVICE_TEST_DETAILS_REQUEST
);
export const deviceTestDetailsSuccess = createAction(
  DEVICE_TEST_DETAILS_SUCCESS
);
export const deviceTestDetailsFailure = createAction(
  DEVICE_TEST_DETAILS_FAILURE
);

export function deviceTestDetails(project_num) {
  return (dispatch) => {
    dispatch(deviceTestDetailsRequest());
    return ajax
      .post(`/graphql4g`, {
        query: schema.deviceTestDetails,
        variables: { project_num },
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(deviceTestDetailsFailure(res.data.errors));
          return res.data;
        } else if (res.data) {
          dispatch(deviceTestDetailsSuccess(res.data.data));
          return res.data;
        }
      });
  };
}
export const VDU_LOADCQ_DATA = "VDU_LOADCQ_DATA";
export const VDU_LOADCQ_DATA_SUCCESS = "VDU_LOADCQ_DATA_SUCCESS";
export const VDU_LOADCQ_DATA_FAILURE = "VDU_LOADCQ_DATA_FAILURE";

export const getVduLoadCqData = createAction(
  VDU_LOADCQ_DATA
);
export const getVduLoadCqDataSuccess = createAction(
  VDU_LOADCQ_DATA_SUCCESS
);
export const getVduLoadCqDataFailure = createAction(
  VDU_LOADCQ_DATA_FAILURE
);
export function getLoadCqData(input) {
  return (dispatch) => {
    dispatch(getVduLoadCqData());
    return ajax
      .post(`/graphql4g`, {
        query: schema.getLoadCqData,
        variables: { input },
      })
      .then((res) => { 
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(getVduLoadCqDataFailure(res.data.errors));
          return res.data;
        } else if (res.data.data) {
          dispatch(getVduLoadCqDataSuccess(res.data.data?.getLoadCqData?.cfg_request));
          return res.data.data;
        }
      });
  };
}
export const SKINNY_OS_HISTORY = "SKINNY_OS_HISTORY";
export const SKINNY_OS_HISTORY_SUCCESS = "SKINNY_OS_HISTORY_SUCCESS";
export const SKINNY_OS_HISTORY_FAILURE = "SKINNY_OS_HISTORY_FAILURE";

export const getSkinnyOsHistory = createAction(
  SKINNY_OS_HISTORY
);
export const getSkinnyOsHistorySuccess = createAction(
  SKINNY_OS_HISTORY_SUCCESS
);
export const getSkinnyOsHistoryFailure = createAction(
  SKINNY_OS_HISTORY_FAILURE
);
export function getSkinnyOsHistoryData(vdu_id) {
  return (dispatch) => {
    dispatch(getSkinnyOsHistory());
    return ajax
      .post(`/graphql4g`, {
        query: schema.getSkinnyOsHistory,
        variables: { vdu_id:vdu_id },
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(getSkinnyOsHistoryFailure(res.data.errors));
          return res.data;
        } else if (res.data.data) {
          dispatch(getSkinnyOsHistorySuccess(res.data.data?.getvduHistoryForProject));
          return res.data.data;
        }
      });
  };
}
export const SKINNY_OS_SERVER_TEST = "SKINNY_OS_SERVER_TEST";
export const SKINNY_OS_SERVER_TEST_SUCCESS = "SKINNY_OS_SERVER_TEST_SUCCESS";
export const SKINNY_OS_SERVER_TEST_FAILURE = "SKINNY_OS_SERVER_TEST_FAILURE";

export const getSkinnyOsServerTest = createAction(
  SKINNY_OS_SERVER_TEST
);
export const getSkinnyOsServerTestSuccess = createAction(
  SKINNY_OS_SERVER_TEST_SUCCESS
);
export const getSkinnyOsServerTestFailure = createAction(
  SKINNY_OS_SERVER_TEST_FAILURE
);
export function triggerEricssonTest(input) {
  return (dispatch) => {
    dispatch(getSkinnyOsServerTest(input));
    return ajax
      .post(`/graphql4g`, {
        query: schema.triggerEricssonServerTest,
        variables: {input} ,
      })
      .then((res) => { 
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(getSkinnyOsServerTestFailure(res.data.errors));
          return res.data;
        } else if (res.data.data) {
          dispatch(getSkinnyOsServerTestSuccess(res.data.data?.ericssionServerTest));
          return res.data.data;
        }
      });
  };
}
export const DEVICE_TEST_HISTORY_REQUEST = "DEVICE_TEST_HISTORY_REQUEST";
export const DEVICE_TEST_HISTORY_SUCCESS = "DEVICE_TEST_HISTORY_SUCCESS";
export const DEVICE_TEST_HISTORY_FAILURE = "DEVICE_TEST_HISTORY_FAILURE";

export const getDeviceTestHistoryRequest = createAction(
  DEVICE_TEST_HISTORY_REQUEST
);
export const getDeviceTestHistorySuccess = createAction(
  DEVICE_TEST_HISTORY_SUCCESS
);
export const getDeviceTestHistoryFailure = createAction(
  DEVICE_TEST_HISTORY_FAILURE
);

export function getDeviceTestHistory(project_num, test_type, vdu_type) {
  return (dispatch) => {
    dispatch(getDeviceTestHistoryRequest());
    return ajax
      .post(`/graphql4g`, {
        query: schema.getDeviceTestHistory,
        variables: { project_num, test_type, vdu_type },
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(getDeviceTestHistoryFailure(res.data.errors));
          return res.data;
        } else if (res.data) {
          dispatch(getDeviceTestHistorySuccess(res.data.data));
          return res.data;
        }
      });
  };
}

export const DEVICE_CONFIG_VIEW_REQUEST = "DEVICE_CONFIG_VIEW_REQUEST";
export const DEVICE_CONFIG_VIEW_SUCCESS = "DEVICE_CONFIG_VIEW_SUCCESS";
export const DEVICE_CONFIG_VIEW_FAILURE = "DEVICE_CONFIG_VIEW_FAILURE";

export const deviceConfigViewRequest = createAction(DEVICE_CONFIG_VIEW_REQUEST);
export const deviceConfigViewSuccess = createAction(DEVICE_CONFIG_VIEW_SUCCESS);
export const deviceConfigViewFailure = createAction(DEVICE_CONFIG_VIEW_FAILURE);

export function deviceConfigView(request_id) {
  return (dispatch) => {
    dispatch(deviceConfigViewRequest());
    return ajax
      .post(`/graphql4g`, {
        query: schema.deviceConfigView,
        variables: { request_id },
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(deviceConfigViewFailure(res.data.errors));
          return res.data;
        } else if (res.data) {
          dispatch(deviceConfigViewSuccess(res.data.data));
          return res.data;
        }
      });
  };
}

export const FETCH_FAST_HISTORY_REQUEST = "FETCH_FAST_HISTORY_REQUEST";
export const FETCH_FAST_HISTORY_SUCCESS = "FETCH_FAST_HISTORY_SUCCESS";
export const FETCH_FAST_HISTORY_FAILURE = "FETCH_FAST_HISTORY_FAILURE";

export const fetchFastHistory = createAction(
  FETCH_FAST_HISTORY_REQUEST,
  "loginId"
);
export const fetchFastHistorySuccess = createAction(
  FETCH_FAST_HISTORY_SUCCESS,
  "loginId",
  "slrhistory"
);
export const fetchFastHistoryFailure = createAction(
  FETCH_FAST_HISTORY_FAILURE,
  "loginId",
  "errors"
);

export function getFastHistory(loginId, siteunid) {
  return (dispatch) => {
    dispatch(fetchFastHistory(loginId, siteunid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getFastHistory,
        variables: { siteunid },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getFastHistory &&
          !!res.data.data.getFastHistory.slrhistory
        ) {
          return dispatch(
            fetchFastHistorySuccess(loginId, res.data.data.getFastHistory)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(
            fetchFastHistoryFailure(loginId, res.data.errors[0].data.message)
          );
        }
        if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            fetchFastHistoryFailure(loginId, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(fetchFastHistoryFailure(loginId, errors)));
  };
}
export const FETCH_DANGEROUS_SITE_REQUEST = "FETCH_DANGEROUS_SITE_REQUEST";
export const FETCH_DANGEROUS_SITE_SUCCESS = "FETCH_DANGEROUS_SITE_SUCCESS";
export const FETCH_DANGEROUS_SITE_FAILURE = "FETCH_DANGEROUS_SITE_FAILURE";

export const fetchDangerousSite = createAction(
  FETCH_DANGEROUS_SITE_REQUEST,
  "loginId"
);
export const fetchDangerousSiteSuccess = createAction(
  FETCH_DANGEROUS_SITE_SUCCESS,
  "loginId",
  "dangerousSite"
);
export const fetchDangerousSiteFailure = createAction(
  FETCH_DANGEROUS_SITE_FAILURE,
  "loginId",
  "errors"
);

export function getDangerousSite(loginId, siteUnid) {
  return (dispatch) => {
    dispatch(fetchDangerousSite(loginId, siteUnid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getDangerousSite,
        variables: { siteUnid },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getDangerousSite &&
          !!res.data.data.getDangerousSite.dangerousSite
        ) {
          return dispatch(
            fetchDangerousSiteSuccess(
              loginId,
              res.data.data.getDangerousSite.dangerousSite
            )
          );
        }

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(
            fetchDangerousSiteFailure(loginId, res.data.errors[0].data.message)
          );
        }
        if (!!res.errors && res.errors.length > 0 && res.errors[0].message) {
          return dispatch(
            fetchDangerousSiteFailure(loginId, res.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(fetchDangerousSiteFailure(loginId, errors)));
  };
}
export const FETCH_ROOFTOP_REQUEST = "FETCH_ROOFTOP_REQUEST";
export const FETCH_ROOFTOP_SUCCESS = "FETCH_ROOFTOP_SUCCESS";
export const FETCH_ROOFTOP_FAILURE = "FETCH_ROOFTOP_FAILURE";

export const fetchRoofTopInfo = createAction(FETCH_ROOFTOP_REQUEST, "loginId");
export const fetchRoofTopInfoSuccess = createAction(
  FETCH_ROOFTOP_SUCCESS,
  "loginId",
  "roofTopInfo"
);
export const fetchRoofTopInfoFailure = createAction(
  FETCH_ROOFTOP_FAILURE,
  "loginId",
  "errors"
);

export function getRoofTopInfo(loginId, metaId) {
  return (dispatch) => {
    dispatch(fetchRoofTopInfo(loginId, metaId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getRoofTopInfo,
        variables: { metaId },
      })
      .then((res) => {
        if (!!res && !!res.data && !!res.data.data.getRoofTopInfo) {
          return dispatch(
            fetchRoofTopInfoSuccess(loginId, res.data.data.getRoofTopInfo)
          );
        }

        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(
            fetchRoofTopInfoFailure(loginId, res.data.errors[0].data)
          );
        }
        if (!!res.errors && res.errors.length > 0 && res.errors[0].message) {
          return dispatch(fetchRoofTopInfoFailure(loginId, res.errors[0]));
        }
      })
      .catch((errors) => dispatch(fetchRoofTopInfoFailure(loginId, errors)));
  };
}
export const FETCH_HOLIDAYEVENTS_REQUEST = "FETCH_HOLIDAYEVENTS_REQUEST";
export const FETCH_HOLIDAYEVENTS_SUCCESS = "FETCH_HOLIDAYEVENTS_SUCCESS";
export const FETCH_HOLIDAYEVENTS_FAILURE = "FETCH_HOLIDAYEVENTS_FAILURE";

export const fetchHolidayEvents = createAction(FETCH_HOLIDAYEVENTS_REQUEST);
export const fetchHolidayEventSuccess = createAction(
  FETCH_HOLIDAYEVENTS_SUCCESS,
  "holidayEvents"
);
export const fetchHolidayEventsFailure = createAction(
  FETCH_HOLIDAYEVENTS_FAILURE,
  "errors"
);

export function getHolidayEvents() {
  return (dispatch) => {
    dispatch(fetchHolidayEvents());
    return ajax
      .post(`/graphql4g`, { query: schema.getHolidayEvents })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getHolidayEvents &&
          !!res.data.data.getHolidayEvents.holidayEvents
        ) {
          return dispatch(
            fetchHolidayEventSuccess(
              res.data.data.getHolidayEvents.holidayEvents
            )
          );
        }
        if (
          !!res &&
          !!res.data &&
          !!res.data.errors &&
          !!res.data.errors.length > 0
        ) {
          return dispatch(fetchHolidayEventsFailure(res.data.errors[0].data));
        }
      })
      .catch((errors) => dispatch(fetchHolidayEventsFailure(errors)));
  };
}

export const FETCH_OFFHOURS_REQUEST = "FETCH_OFFHOURS_REQUEST";
export const FETCH_OFFHOURS_SUCCESS = "FETCH_OFFHOURS_SUCCESS";
export const FETCH_OFFHOURS_FAILURE = "FETCH_OFFHOURS_FAILURE";

export const fetchOffHours = createAction(FETCH_OFFHOURS_REQUEST);
export const fetchOffHoursSuccess = createAction(
  FETCH_OFFHOURS_SUCCESS,
  "offhours"
);
export const fetchOffHoursFailure = createAction(
  FETCH_OFFHOURS_FAILURE,
  "errors"
);

export function getOffHours(id, submarket) {
  return (dispatch) => {
    dispatch(fetchOffHours());
    return ajax
      .post(`/graphql4g`, {
        query: schema.getOffHours,
        variables: { id, submarket },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getOffHours &&
          !!res.data.data.getOffHours.offhours
        ) {
          return dispatch(
            fetchOffHoursSuccess(res.data.data.getOffHours.offhours)
          );
        }
        if (
          !!res &&
          !!res.data &&
          !!res.data.errors &&
          !!res.data.errors.length > 0
        ) {
          return dispatch(fetchOffHoursFailure(res.data.errors[0].data));
        }
      })
      .catch((errors) => dispatch(fetchOffHoursFailure(errors)));
  };
}

export const VDU_REPLACEMENT_STEP_STATUS_REQUEST = "VDU_REPLACEMENT_STEP_STATUS_REQUEST"
export const VDU_REPLACEMENT_STEP_STATUS_SUCCESS = "VDU_REPLACEMENT_STEP_STATUS_SUCCESS"
export const VDU_REPLACEMENT_STEP_STATUS_FAILURE = "VDU_REPLACEMENT_STEP_STATUS_FAILURE"

export const vduReplacementStepStatusRequest = createAction(VDU_REPLACEMENT_STEP_STATUS_REQUEST);
export const vduReplacementStepStatusSuccess = createAction(VDU_REPLACEMENT_STEP_STATUS_SUCCESS);
export const vduReplacementStepStatusFailure = createAction(VDU_REPLACEMENT_STEP_STATUS_FAILURE);

export function vduReplacementStepStatusGet(projectId, vduId, siteunid, siteName, vendorId, vendorName) {
  return (dispatch) => {
    dispatch(vduReplacementStepStatusRequest());
    return ajax.post(`/graphql4g`, {
        query: schema.vduReplacementStepStatusSchema,
        variables: { projectId, vduId, siteunid, siteName, vendorId, vendorName },
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(vduReplacementStepStatusFailure(res.data.errors));
          return res.data.data;
        } else if (res.data) {
          dispatch(vduReplacementStepStatusSuccess(res.data.data.getVduStepStatus));
          return res.data.data.getVduStepStatus;
        }
      });
  };
}

export const VDU_REPLACEMENT_REQUEST = "VDU_REPLACEMENT_REQUEST"
export const VDU_REPLACEMENT_SUCCESS = "VDU_REPLACEMENT_SUCCESS"
export const VDU_REPLACEMENT_FAILURE = "VDU_REPLACEMENT_FAILURE"

export const vduReplacementRequest = createAction(VDU_REPLACEMENT_REQUEST);
export const vduReplacementSuccess = createAction(VDU_REPLACEMENT_SUCCESS);
export const vduReplacementFailure = createAction(VDU_REPLACEMENT_FAILURE);

export function vduReplacement(input, siteunid, siteName, vendorId, vendorName) {
  return (dispatch) => {
    dispatch(vduReplacementRequest());
    return ajax.post(`/graphql4g`, {
        query: schema.vduReplacementSchema,
        variables: {input, siteunid, siteName, vendorId, vendorName},
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          dispatch(vduReplacementFailure(res.data.errors));
          return res.data.data;
        } else if (res.data) {
          dispatch(vduReplacementSuccess(res.data.data.vduReplacement));
          return res.data.data.vduReplacement;
        }
      });
  };
}
export const FETCH_SITE_SECTORS_REQUEST = "FETCH_SITE_SECTORS_REQUEST";
export const FETCH_SITE_SECTORS_SUCCESS = "FETCH_SITE_SECTORS_SUCCESS";
export const FETCH_SITE_SECTORS_FAILURE = "FETCH_SITE_SECTORS_FAILURE";

export const fetchSiteSectors = createAction(FETCH_SITE_SECTORS_REQUEST,"unid");
export const fetchSiteSectorsSuccess = createAction(FETCH_SITE_SECTORS_SUCCESS,"unid","nodes");
export const fetchSiteSectorsFailure = createAction(FETCH_SITE_SECTORS_FAILURE,"unid","errors");
export function getSectorCarriers(siteunid) {
  return (dispatch) => {
    dispatch(fetchSiteSectors(siteunid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getSiteSectorCarriers,
        variables: { siteunid },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getSiteSectorCarriers &&
          !!res.data.data.getSiteSectorCarriers.nodes
        ) {
          return dispatch(
            fetchSiteSectorsSuccess(siteunid,res.data.data.getSiteSectorCarriers.nodes)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data?.detail) {
          return dispatch(
            fetchSiteSectorsFailure(siteunid, res.data.errors[0].data.detail)
          );
        }
        if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            fetchSiteSectorsFailure(siteunid, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(fetchSiteSectorsFailure(siteunid, 'Something went wrong fetching sector carriers')));
  };
}
export const FETCH_SPEC_HISTORY_REQUEST = "FETCH_SPEC_HISTORY_REQUEST";
export const FETCH_SPEC_HISTORY_SUCCESS = "FETCH_SPEC_HISTORY_SUCCESS";
export const FETCH_SPEC_HISTORY_FAILURE = "FETCH_SPEC_HISTORY_FAILURE";

export const fetchSpecHistory = createAction(FETCH_SPEC_HISTORY_REQUEST,"unid");
export const fetchSpecHistorySuccess = createAction(FETCH_SPEC_HISTORY_SUCCESS,"unid","spectrum_requests");
export const fetchSpecHistoryFailure = createAction(FETCH_SPEC_HISTORY_FAILURE,"unid","errors");

export function getSpecHistory(siteunid) {
  return (dispatch) => {
    dispatch(fetchSpecHistory(siteunid));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getSpectrumHistory,
        variables: { siteunid},
      })
      .then((res) => {
       if (
          !!res &&
          !!res.data &&
          !!res.data.data.getSpectrumHistory &&
          !!res.data.data.getSpectrumHistory.spectrum_requests
        ) {
          return dispatch(
            fetchSpecHistorySuccess(siteunid, res.data.data.getSpectrumHistory.spectrum_requests)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data?.detail) {
          return dispatch(
            fetchSpecHistoryFailure(siteunid,res.data.errors[0].data.detail)
          );
        }
        if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            fetchSpecHistoryFailure(siteunid, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(fetchSpecHistoryFailure(siteunid,'Something went wrong fetching spectrum requests')));
  };
}

export const CREATE_SPECTRUM_REQUEST = "CREATE_SPECTRUM_REQUEST";
export const CREATE_SPECTRUM_SUCCESS = "CREATE_SPECTRUM_SUCCESS";
export const CREATE_SPECTRUM_FAILURE = "CREATE_SPECTRUM_FAILURE";

export const createSpectrumRequestRequest = createAction(
  CREATE_SPECTRUM_REQUEST
);
export const createSpectrumRequestSuccess = createAction(
  CREATE_SPECTRUM_SUCCESS,"createSpectrumAnalyzer"
);
export const createSpectrumRequestFailure = createAction(
  CREATE_SPECTRUM_FAILURE,"errors"
);
export function createSpectrumRequest(payload) {
  return (dispatch) => {
    dispatch(createSpectrumRequestRequest());
    return ajax
      .post(`/graphql4g`, {
        query: schema.createSpectrumRequest,
        variables: {createSpectrumBody : payload},
      })
      .then((res) => {
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
          return dispatch(createSpectrumRequestFailure(res.data));
        } else if (
          !!res.data &&
          !!res.data.data &&
          !!res.data.data.createSpectrumAnalyzer
        ) {
          return dispatch(createSpectrumRequestSuccess(res.data.data.createSpectrumAnalyzer));
        }
      })
      .catch((errors) => dispatch(fetchSpecHistoryFailure('Error in creating Spectrum analysis')));;
  };
}

export const VIEW_SPECTRUM_REQUEST = "VIEW_SPECTRUM_REQUEST";
export const VIEW_SPECTRUM_SUCCESS = "VIEW_SPECTRUM_SUCCESS";
export const VIEW_SPECTRUM_FAILURE = "VIEW_SPECTRUM_FAILURE";

export const viewSpectrum = createAction(VIEW_SPECTRUM_REQUEST);
export const viewSpectrumSuccess = createAction(VIEW_SPECTRUM_SUCCESS,"spectrum_result");
export const viewSpectrumFailure = createAction(VIEW_SPECTRUM_FAILURE,"errors");

export function viewSpectrumAnalysis(request_id) {
  return (dispatch) => {
    dispatch(viewSpectrum( request_id));
    return ajax
      .post(`/graphql4g`, {
        query: schema.viewSpecResult,
        variables: { request_id },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getSpectrumResult &&
          !!res.data.data.getSpectrumResult.spectrum_result
        ) {
          return dispatch(
            viewSpectrumSuccess(res.data.data.getSpectrumResult.spectrum_result)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data?.detail) {
          return dispatch(
            viewSpectrumFailure(res.data.errors[0].data.detail)
          );
        }
        if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            viewSpectrumFailure( res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(viewSpectrumFailure('Something wnet wrong')));
  };
}
export const DOWNLOAD_SPECTRUM_REQUEST = "DOWNLOAD_SPECTRUM_REQUEST";
export const DOWNLOAD_SPECTRUM_SUCCESS = "DOWNLOAD_SPECTRUM_SUCCESS";
export const DOWNLOAD_SPECTRUM_FAILURE = "DOWNLOAD_SPECTRUM_FAILURE";

export const downloadSpectrum = createAction(DOWNLOAD_SPECTRUM_REQUEST);
export const downloadSpectrumSuccess = createAction(DOWNLOAD_SPECTRUM_SUCCESS,"download");
export const downloadSpectrumFailure = createAction(DOWNLOAD_SPECTRUM_FAILURE,"errors");

export function downloadSpectrumAnalysis(request_id) {
  return (dispatch) => {
    dispatch(downloadSpectrum( request_id));
    return ajax
      .post(`/graphql4g`, {
        query: schema.downloadSpectrum,
        variables: { request_id },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getSpectrumDownload &&
          !!res.data.data.getSpectrumDownload.download
        ) {
          return dispatch(
            downloadSpectrumSuccess(res.data.data.getSpectrumDownload.download)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data?.detail) {
          return dispatch(
            downloadSpectrumFailure(res.data.errors[0].data.detail)
          );
        }
        if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            downloadSpectrumFailure( res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(downloadSpectrumFailure('Something went wrong')));
  };
}

export const OSW_AUTO_REPLY_MESSAGES_REQUEST = "OSW_AUTO_REPLY_MESSAGES_REQUEST";
export const OSW_AUTO_REPLY_MESSAGES_SUCCESS = "OSW_AUTO_REPLY_MESSAGES_SUCCESS";
export const OSW_AUTO_REPLY_MESSAGES_FAILURE = "OSW_AUTO_REPLY_MESSAGES_FAILURE";

export const oswAutoReplyMessagesRequest = createAction(OSW_AUTO_REPLY_MESSAGES_REQUEST);
export const oswAutoReplyMessagesSuccess = createAction(OSW_AUTO_REPLY_MESSAGES_SUCCESS, "response");
export const oswAutoReplyMessagesFailure = createAction(OSW_AUTO_REPLY_MESSAGES_FAILURE, "errors");

export function getOSWAutoReplyMessagesByUnid(siteUnid) {
  return (dispatch) => {
    dispatch(oswAutoReplyMessagesRequest())
    return ajax
      .post(`/graphql4g`, {
        query: schema.getOSWAutoReplyMessagesByUnid,
        variables: { siteUnid },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.getOSWAutoReplyMessagesByUnid
        ) {
          dispatch(oswAutoReplyMessagesSuccess(res))
          return res.data.data.getOSWAutoReplyMessagesByUnid;
        } else {
          dispatch(oswAutoReplyMessagesSuccess(res))
          return res.data.data.getOSWAutoReplyMessagesByUnid;
        }
      })
      .catch((errors) => dispatch(oswAutoReplyMessagesFailure(res)));
    }
}

export function trggerUpdateSamsungSN(site_unid, input) {
  return (dispatch) => {
    // dispatch(oswAutoReplyMessagesRequest())
    return ajax
      .post(`/graphql4g`, {
        query: schema.trggerUpdateSamsungSN,
        variables: { site_unid, input },
      })
      .then((res) => {
        if (
          !!res &&
          !!res.data &&
          !!res.data.data.updateSamsungSN
        ) {
          // dispatch(oswAutoReplyMessagesSuccess(res))
          return res.data.data.updateSamsungSN;
        } else {
          // dispatch(oswAutoReplyMessagesSuccess(res))
          return res.data.data.updateSamsungSN;
        }
      })
      // .catch((errors) => dispatch(oswAutoReplyMessagesFailure(res)));
    }
}
export function getSamsungRadioUpdateDetails(osw_request_id) {
  return (dispatch) => {
    // dispatch(oswAutoReplyMessagesRequest())
    return ajax
      .post(`/graphql4g`, {
        query: schema.getSamsungRadioUpdateDetails,
        variables: { osw_request_id },
      })
      .then((res) => {
        if ( res?.data?.data?.getSamsungRadioUpdateDetails) {
          // dispatch(oswAutoReplyMessagesSuccess(res))
          return res.data.data.getSamsungRadioUpdateDetails;
        } 
        // dispatch(oswAutoReplyMessagesSuccess(res))
        return res.data.data.getSamsungRadioUpdateDetails;
      })
      // .catch((errors) => dispatch(oswAutoReplyMessagesFailure(res)));
    }
}

export function triggerRETScan(payload) {
  return (dispatch) => {
    return ajax
      .post(`/graphql4g`, {
        query: schema.triggerRETScan,
        variables: { payload },
      })
      .then((res) => {
        if( res?.data?.data?.requestRETScan?.request_id || res?.data?.data?.requestRETScan?.errors)
        return res?.data?.data?.requestRETScan;

        return res.data
      })
      .catch((errors) => {
        return errors;
      });
    }
}
export const GET_RET_SCAN_REQUEST = "GET_RET_SCAN_REQUEST";
export const GET_RET_SCAN_SUCCESS = "GET_RET_SCAN_SUCCESS";
export const GET_RET_SCAN_FAILURE = "GET_RET_SCAN_FAILURE";

export const getRetDetails = createAction(GET_RET_SCAN_REQUEST,"oswId");
export const getRetDetailsSuccess = createAction(GET_RET_SCAN_SUCCESS,"oswId","result");
export const getRetDetailsFailure = createAction(GET_RET_SCAN_FAILURE,"oswId","errors");

export function getRETScanDetails(oswId) {
  return (dispatch) => {
    dispatch(getRetDetails(oswId));
    return ajax
      .post(`/graphql4g`, {
        query: schema.getRETScanDetails,
        variables: { oswId : Number(oswId)},
      })
      .then((res) => {
       if (
          !!res &&
          !!res.data &&
          !!res.data.data.getRETScanDetails &&
          !!res.data.data.getRETScanDetails.result
        ) {
          return dispatch(
            getRetDetailsSuccess(oswId, res.data.data.getRETScanDetails.result)
          );
        }
        if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].data?.detail) {
          return dispatch(
            getRetDetailsFailure(oswId,res.data.errors[0].data.detail)
          );
        }
        if (
          !!res.data &&
          !!res.data.errors &&
          res.data.errors.length > 0 &&
          res.data.errors[0].message
        ) {
          return dispatch(
            getRetDetailsFailure(oswId, res.data.errors[0].message)
          );
        }
      })
      .catch((errors) => dispatch(getRetDetailsFailure(oswId,'Something went wrong fetching spectrum requests')));
  };
}

export const GET_AP_RADIO_INFO_REQUEST = "GET_AP_RADIO_INFO_REQUEST";
export const GET_AP_RADIO_INFO_SUCCESS = "GET_AP_RADIO_INFO_SUCCESS";
export const GET_AP_RADIO_INFO_FAILURE = "GET_AP_RADIO_INFO_FAILURE";

export const getAPRadioInfo = createAction(GET_AP_RADIO_INFO_REQUEST,"fuzeSiteId");
export const getAPRadioInfoSuccess = createAction(GET_AP_RADIO_INFO_SUCCESS,"fuzeSiteId","apRadioInfo");
export const getAPRadioInfoFailure = createAction(GET_AP_RADIO_INFO_FAILURE,"fuzeSiteId","apRadioInfo");

export function getAPRadioDetails(fuzeSiteId, managerId) {
  return dispatch => {
    dispatch(getAPRadioInfo(fuzeSiteId));
    return ajax.post(`/graphql4g`, {
        query: schema.getAPRadioDetails,
        variables: { fuzeSiteId : fuzeSiteId, managerId: managerId},
      }).then(res => {
        if(res?.data?.data?.getAPRadioDeviceDetails) {
          return dispatch(getAPRadioInfoSuccess(fuzeSiteId, res?.data.data.getAPRadioDeviceDetails))
        } else {
          return dispatch(getAPRadioInfoFailure(fuzeSiteId, []))
        }
      }).catch(error => {
        dispatch(getAPRadioInfoFailure(fuzeSiteId, []));
      });
  }
}

export const GET_OSW_ISSUE_TYPES_REQUEST = "GET_OSW_ISSUE_TYPES_REQUEST";
export const GET_OSW_ISSUE_TYPES_SUCCESS = "GET_OSW_ISSUE_TYPES_SUCCESS";
export const GET_OSW_ISSUE_TYPES_FAILURE = "GET_OSW_ISSUE_TYPES_FAILURE";

export const getOswIssueTypesRequest = createAction(GET_OSW_ISSUE_TYPES_REQUEST);
export const getOswIssueTypesSuccess = createAction(GET_OSW_ISSUE_TYPES_SUCCESS, "issueTypes");
export const getOswIssueTypesFailure = createAction(GET_OSW_ISSUE_TYPES_FAILURE, "issueTypes");

export function getOswIssueTypes() {
  return (dispatch) => {
    dispatch(getOswIssueTypesRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getOswIssueTypes,
    }).then((res) => {
      if (res?.data?.data?.getOswIssueTypes?.issue_type) {
        return dispatch(getOswIssueTypesSuccess(res.data.data.getOswIssueTypes.issue_type));
      } else {
        return dispatch(getOswIssueTypesFailure([]));
      }
    }).catch((errors) => dispatch(getOswIssueTypesFailure([])));
  };
}

export const GET_METRO_ROOT_SCHEDULES_REQUEST = "GET_METRO_ROOT_SCHEDULES_REQUEST";
export const GET_METRO_ROOT_SCHEDULES_SUCCESS = "GET_METRO_ROOT_SCHEDULES_SUCCESS";
export const GET_METRO_ROOT_SCHEDULES_FAILURE = "GET_METRO_ROOT_SCHEDULES_FAILURE";

export const getMetroRootSchedulesRequest = createAction(GET_METRO_ROOT_SCHEDULES_REQUEST);
export const getMetroRootSchedulesSuccess = createAction(GET_METRO_ROOT_SCHEDULES_SUCCESS, "schedules");
export const getMetroRootSchedulesFailure = createAction(GET_METRO_ROOT_SCHEDULES_FAILURE, "schedules");

export function getMetroRootSchedules(caId) {
  return (dispatch) => {
    dispatch(getMetroRootSchedulesRequest());
    return ajax.post(`/graphql4g`, {
      query: schema.getMetroRootSchedules,
      variables: { caId }
    }).then((res) => {
      if (res?.data?.data?.getMetroRootSchedules) {
        const schedules = res.data.data.getMetroRootSchedules;
        const continuousRanges = metroRootActiveDates({ schedules });
        return dispatch(getMetroRootSchedulesSuccess({
          schedules: schedules,
          dateRanges: continuousRanges
        }));
      } else {
        return dispatch(getMetroRootSchedulesFailure([]));
      }
    }).catch((errors) => dispatch(getMetroRootSchedulesFailure([])));
  };
}


