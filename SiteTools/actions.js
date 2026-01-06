import * as schema from "./schema";
import ajax from "../ajax";

export const FETCH_WORKORDER_FOR_SITE_REQUEST = 'FETCH_WORKORDER_FOR_SITE_REQUEST';
export const FETCH_WORKORDER_FOR_SITE_SUCCESS = 'FETCH_WORKORDER_FOR_SITE_SUCCESS';
export const FETCH_WORKORDER_FOR_SITE_FAILURE = 'FETCH_WORKORDER_FOR_SITE_FAILURE';

export function fetchWorkOrderForSite(variables) {
  return (dispatch) => {
    dispatch({ type: FETCH_WORKORDER_FOR_SITE_REQUEST });
    return ajax
      .post(`/graphql4g`, {
        query: schema.getWorkOrderForSite,
        variables,
      })
      .then((res) => {
        if (
          res.data &&
          res.data.data &&
          res.data.data.getWorkOrderForSite
        ) {
          return dispatch({
            type: FETCH_WORKORDER_FOR_SITE_SUCCESS,
            payload: res.data.data.getWorkOrderForSite,
          });
        } else if (res.data && res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data
            ? res.data.errors[0].data.message
              ? res.data.errors[0].data.message
              : res.data.errors[0].data.detail
              ? res.data.errors[0].data.detail
              : res.data.errors[0].message
            : res.data.errors[0].message;
          return dispatch({
            type: FETCH_WORKORDER_FOR_SITE_FAILURE,
            error: message,
          });
        } else {
          return dispatch({
            type: FETCH_WORKORDER_FOR_SITE_FAILURE,
            error: "Unknown Error! Please contact administrator.",
          });
        }
      })
      .catch((errors) => {
        let message =
          errors && errors.length > 0 && errors[0].message
            ? errors[0].message
            : "Network error";
        dispatch({
          type: FETCH_WORKORDER_FOR_SITE_FAILURE,
          error: message,
        });
      });
  };
}

export const FETCH_PRB_ANALYZER_REQUEST = 'FETCH_PRB_ANALYZER_REQUEST';
export const FETCH_PRB_ANALYZER_SUCCESS = 'FETCH_PRB_ANALYZER_SUCCESS';
export const FETCH_PRB_ANALYZER_FAILURE = 'FETCH_PRB_ANALYZER_FAILURE';

export function fetchPrbAnalyzer({ node }) {
  return (dispatch) => {
    dispatch({ type: FETCH_PRB_ANALYZER_REQUEST });
    return ajax
      .post(`/graphql4g`, {
        query: schema.getPrbAnalyzer,
        variables: { node },
      })
      .then((res) => {
        if (
          res.data &&
          res.data.data &&
          res.data.data.getHeatMap &&
          res.data.data.getHeatMap.data
        ) {
          return dispatch({
            type: FETCH_PRB_ANALYZER_SUCCESS,
            payload: res.data.data.getHeatMap.data,
          });
        } else if (res.data && res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].message || "Unknown error";
          return dispatch({
            type: FETCH_PRB_ANALYZER_FAILURE,
            error: message,
          });
        } else {
          return dispatch({
            type: FETCH_PRB_ANALYZER_FAILURE,
            error: "Unknown Error! Please contact administrator.",
          });
        }
      })
      .catch((errors) => {
        let message =
          errors && errors.length > 0 && errors[0].message
            ? errors[0].message
            : "Network error";
        dispatch({
          type: FETCH_PRB_ANALYZER_FAILURE,
          error: message,
        });
      });
  };
}
export const FETCH_NODES_REQUEST = 'FETCH_NODES_REQUEST';
export const FETCH_NODES_SUCCESS = 'FETCH_NODES_SUCCESS';
export const FETCH_NODES_FAILURE = 'FETCH_NODES_FAILURE';

export function fetchNodes({ siteUnid }) {
  return (dispatch) => {
    dispatch({ type: FETCH_NODES_REQUEST });
    return ajax
      .post(`/graphql4g`, {
        query: schema.getNodes,
        variables: { siteUnid },
      })
      .then((res) => {
        if (
          res.data &&
          res.data.data &&
          res.data.data.getNodes &&
          res.data.data.getNodes.data
        ) {
          return dispatch({
            type: FETCH_NODES_SUCCESS,
            payload: res.data.data.getNodes.data,
          });
        } else if (res.data && res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].message || "Unknown error";
          return dispatch({
            type: FETCH_NODES_FAILURE,
            error: message,
          });
        } else {
          return dispatch({
            type: FETCH_NODES_FAILURE,
            error: "Unknown Error! Please contact administrator.",
          });
        }
      })
      .catch((errors) => {
        let message =
          errors && errors.length > 0 && errors[0].message
            ? errors[0].message
            : "Network error";
        dispatch({
          type: FETCH_NODES_FAILURE,
          error: message,
        });
      });
  };
}

export const POST_TASK_TYPE_REQUEST = 'POST_TASK_TYPE_REQUEST';
export const POST_TASK_TYPE_SUCCESS = 'POST_TASK_TYPE_SUCCESS';
export const POST_TASK_TYPE_FAILURE = 'POST_TASK_TYPE_FAILURE';

export function postTaskType(input) {
  return (dispatch) => {
    dispatch({ type: POST_TASK_TYPE_REQUEST });
    return ajax
      .post(`/graphql4g`, {
        query: schema.postTaskType,
        variables: { input }
      })
      .then((res) => {
        if (
          res.data &&
          res.data.data &&
          res.data.data.postTaskType
        ) {
          return dispatch({
            type: POST_TASK_TYPE_SUCCESS,
            payload: res.data.data.postTaskType,
          });
        } else if (res.data && res.data.errors && res.data.errors.length > 0) {
          let message = res.data.errors[0].data
            ? res.data.errors[0].data.message
              ? res.data.errors[0].data.message
              : res.data.errors[0].data.detail
              ? res.data.errors[0].data.detail
              : res.data.errors[0].message
            : res.data.errors[0].message;
          return dispatch({
            type: POST_TASK_TYPE_FAILURE,
            error: message,
          });
        } else {
            return dispatch({
              type: POST_TASK_TYPE_FAILURE,
              error: "Unknown Error! Please contact administrator.",
            });
        }
      })
      .catch((errors) => {
        let message =
          errors && errors.length > 0 && errors[0].message
            ? errors[0].message
            : "Network error";
        dispatch({
          type: POST_TASK_TYPE_FAILURE,
          error: message,
        });
      });
  };
}
