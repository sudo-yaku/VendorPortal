import ajax, { rawClient } from '../ajax'
import { createAction } from '../redux_utils'
import * as schema from './schema'

export const AUTO_VP_PERMISSION_REQUEST = 'AUTO_VP_PERMISSION_REQUEST'
export const AUTO_VP_PERMISSION_SUCCESS = 'AUTO_VP_PERMISSION_SUCCESS'
export const AUTO_VP_PERMISSION_FAILURE = 'AUTO_VP_PERMISSION_FAILURE'

export const updateAutoVpPermissionRequest = createAction(AUTO_VP_PERMISSION_REQUEST)
export const updateAutoVpPermissionSuccess = createAction(AUTO_VP_PERMISSION_SUCCESS, 'AutoVpPermission')
export const updateAutoVpPermissionFailure = createAction(AUTO_VP_PERMISSION_FAILURE, 'errors')

// export function getAutoVpPermission(userId) {
//     return dispatch => {
//         dispatch(updateAutoVpPermissionRequest(userId))
//         return ajax.post('/graphql4g', {
//             query: schema.getAutoVpPermission,
//             variables: { userId: userId }
//         })
//             .then(res => {
//                 dispatch(updateAutoVpPermissionSuccess(res.data.data.getAutoVpPermission))
//                 return res.data.data.getAutoVpPermission;
//             })
//             .catch(errors => dispatch(updateAutoVpPermissionFailure(errors)))
//     }
// }

export const getCompaniesInfoForAllVendors = () => {
  return (dispatch) => {
    dispatch(updateAutoVpPermissionRequest());
    return ajax
      .post(`/graphql4g`, { query: schema.getCompaniesInfoForAllVendors })
      .then((res) => {
        // console.log("response from graphql",res);
        // console.log("response from graphql data",res.data.data.getCompaniesInfoForAllVendors.companyinfoforvendorDetails);
        dispatch(
          updateAutoVpPermissionSuccess(
            res.data.data.getCompaniesInfoForAllVendors
          )
        );
        return res.data.data.getCompaniesInfoForAllVendors;
      })
      .catch((err) => dispatch(updateAutoVpPermissionFailure(err)));
  };
};
