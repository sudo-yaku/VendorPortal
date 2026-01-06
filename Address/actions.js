/**
  Copyright: Verizon Data Services 

  File Name: actions.js
  ******************************************************************************************
  Release Date    Change Date      Name          Description
                  02/25/2022       shade86       Initial creation
 
 *******************************************************************************************/

import ajax from '../ajax';
import { createAction } from '../redux_utils';
import * as schema from './schema';


function getDispatchAddress(unid='', mdgId) {
    return dispatch => {
      return ajax.post(`/graphql4g`, { query: schema.getDispatchAddress, variables: { unid, mdgId } })
        .then(res => {
            let locations = res.data && res.data.data && res.data.data.getDispatchLocations
                ? res.data.data.getDispatchLocations 
                : {};
          return locations;
        })
    }
}

function createDispatchAddress(payload={}) {
    return dispatch => {
      return ajax.post(`/graphql4g`, { query: schema.creteDispatchAddress, variables: { payload: payload } })
        .then(res => {
            let result = res.data && res.data.data && res.data.data.createDispatchAddress && res.data.data.createDispatchAddress.resultmessage
                ? res.data.data.createDispatchAddress.resultmessage
                : 'Error in adding dispatch address';
          return result;
        })
    }
}

function deleteDispatchAddress(locationUnid= '') {
  return dispatch => {
    return ajax.post(`/graphql4g`, { query: schema.deleteDispatchLocation, variables: { locationUnid } })
    .then(res => {
        let message = res.data && res.data.data && res.data.data.deleteDispatchAddress
          ? res.data.data.deleteDispatchAddress : (res.data && res.data && res.data.errors && res.data.errors.length>0) ? res.data
          : {};
        return message;
      })
  }
}

function validateAddress(location='') {
  return dispatch => {
    return ajax.post(`/graphql4g`, { query: schema.validateAddress, variables: { location } })
      .then(res => {
          let result = res.data && res.data.data && res.data.data.validateAddress && res.data.data.validateAddress.results
              ? res.data.data.validateAddress
              : [];
        return result;
      })
  }
}
export const UPDATE_ADDRESS_REQUEST = "UPDATE_ADDRESS_REQUEST"
export const UPDATE_ADDRESS_SUCCESS = "UPDATE_ADDRESS_SUCCESS"
export const UPDATE_ADDRESS_FAILURE = "UPDATE_ADDRESS_FAILURE"


export const updateAddress = createAction(UPDATE_ADDRESS_REQUEST, 'loginId')
export const updateAddressSuccess = createAction(UPDATE_ADDRESS_SUCCESS, 'loginId','resultmessage')
export const updateAddressFailure = createAction(UPDATE_ADDRESS_FAILURE, 'loginId','errors')

export function updateDispatchAddress(loginId, payload, locationUnid) {
  return dispatch => {
    dispatch(updateAddress(payload,locationUnid))
    console.log("action",payload)
    return ajax.post(`/graphql4g`, { query: schema.updateDispatchAddress, variables: {payload:payload, locationUnid :locationUnid} })
      .then(res => {
        if (!!res && !!res.data && !!res.data.data.updateDispatchAddress && !!res.data.data.updateDispatchAddress.resultmessage)
          return dispatch(updateAddressSuccess(loginId, res.data.data.updateDispatchAddress.resultmessage))
          if (!!res.data && !!res.data.errors && res.data.errors.length > 0) {
            return dispatch(updateAddressFailure( loginId, res.data.errors[0].data.resultmessage))
          }
          if (!!res.data && !!res.data.errors && res.data.errors.length > 0 && res.data.errors[0].message) {
            return dispatch(updateAddressFailure( loginId, res.data.errors[0].message))
          }
      })
      .catch(errors => dispatch(updateAddressFailure(loginId, errors)))
  }
}
export { getDispatchAddress, createDispatchAddress, validateAddress, deleteDispatchAddress };
