import ajax, {rawClient} from '../ajax'
import {createAction} from '../redux_utils'
import * as schema from './schema'


export const GET_PROJECTS_REQUEST = 'GET_PROJETCS_REQUEST'
export const GET_POJETCS_SUCCESS = 'GET_PROJECTS_SUCCESS'
export const GET_PROJETCS_FAILURE = 'GET_PROJETCS_FAILURE'

export const getProjetcsRequest = createAction(GET_PROJECTS_REQUEST, 'loginId', 'latitude', 'longitude', 'proximity')
export const getProjetcsSuccess = createAction(GET_POJETCS_SUCCESS, 'loginId', 'projects')
export const getProjetcsFailure = createAction(GET_PROJETCS_FAILURE, 'loginId', 'errors')

export function getProjects (loginId, latitude, longitude, proximity) {
  return dispatch => {
    dispatch(getProjetcsRequest(loginId, latitude, longitude, proximity))
    return ajax.post(`/graphql4g`, {
      query: schema.getProjects,
      variables: {latitude: latitude, longitude: longitude, proximity: proximity, user_id: ""}
    })
            .then(res => dispatch(getProjetcsSuccess(loginId, res.data.data.getProjects.projects)))
            .catch(errors => dispatch(getProjetcsFailure(loginId, errors)))
  }
}
