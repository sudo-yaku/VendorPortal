import {
    FETCH_WORKORDER_FOR_SITE_REQUEST,
    FETCH_WORKORDER_FOR_SITE_SUCCESS,
    FETCH_WORKORDER_FOR_SITE_FAILURE,
    FETCH_PRB_ANALYZER_REQUEST,
    FETCH_PRB_ANALYZER_SUCCESS,
    FETCH_PRB_ANALYZER_FAILURE,
    FETCH_NODES_REQUEST,
    FETCH_NODES_SUCCESS,
    FETCH_NODES_FAILURE,
    POST_TASK_TYPE_REQUEST,
    POST_TASK_TYPE_SUCCESS,
    POST_TASK_TYPE_FAILURE
} from './actions';

const initialState = {
    loading: false,
    error: null,
    workOrderData: null,
    prbAnalyzerData: null,
    nodesData: null,
};

const siteToolsReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_WORKORDER_FOR_SITE_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_WORKORDER_FOR_SITE_SUCCESS:
            return { ...state, loading: false, workOrderData: action.payload, error: null };
        case FETCH_WORKORDER_FOR_SITE_FAILURE:
            return { ...state, loading: false, error: action.error };
        case FETCH_PRB_ANALYZER_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_PRB_ANALYZER_SUCCESS:
            return { ...state, loading: false, prbAnalyzerData: action.payload, error: null };
        case FETCH_PRB_ANALYZER_FAILURE:
            return { ...state, loading: false, error: action.error };
        case FETCH_NODES_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_NODES_SUCCESS:
            return { ...state, loading: false, nodesData: action.payload, error: null };
        case FETCH_NODES_FAILURE:
            return { ...state, loading: false, error: action.error };
        case POST_TASK_TYPE_REQUEST:
            return { ...state, posting: true, error: null };
        case POST_TASK_TYPE_SUCCESS:
            return { ...state, posting: false, response: action.payload, error: null };
        case POST_TASK_TYPE_FAILURE:
            return { ...state, posting: false, error: action.error };
        default:
            return state;
    }
};

export default siteToolsReducer;
