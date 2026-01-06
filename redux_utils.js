import {fromJS, List, Map} from 'immutable'
import {createSelector, createStructuredSelector} from 'reselect'

export function createAction (type, ...argNames) {
  return function (...args) {
    let action = {type}
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index]
    })
    return action
  }
}

export function setLoading (state, funcName = '', id, bool = true) {
  return state.setIn(['requests', funcName, id, 'loading'], bool)
}

export function handleError (state, funcName = '', id, errors = []) {
  return state.setIn(['requests', funcName, id], fromJS({
    loading: false,
    errors
  }))
}

export function setMessage (state, funcName = '', id, message = '') {
  return state.setIn(['requests', funcName, id], Map({
    loading: false,
    message
  }))
}

export function clearRequest (state, funcName = '', id) {
  return state.deleteIn(['requests', funcName, id])
}

export function addEntities (state, list = [], idKey = '', optionalKey) {
  list.forEach(item => {
    state = addEntity(state, item, idKey, optionalKey)
  })
  return state
}


export function addPrePop (state, list = [], keyPath) {
  const path = typeof keyPath === 'string' ? ['prepops', keyPath] : ['prepops', ...keyPath]
  return state.setIn(path, fromJS(list))
}

export function addEntity (state, item = {}, idKey = '', optionalKey) {
  return state.mergeIn(optionalKey ? ['entities', optionalKey, item[idKey]] : ['entities', item[idKey]], fromJS(item))
}

export function addRelationship (state, relName = '', id, list = [], listIdKey = '') {
  return state.setIn(['relationships', relName, id], List(list.map(item => item[listIdKey])))
}

export function updateRelationship (state, pathExt = [], list = []) {
  const path = ['relationships', ...pathExt]
  const currentList = state.getIn(path, List())
  const newItems = List(list).filter(id => !currentList.includes(id))

  return state.setIn(path, currentList.concat(newItems))
}

/*
* used to determine whether a list that is updated from two
* separate API calls should be overwritten or updated
* e.g. fetchTechsForManager and fetchTechLocationsForMgr both
* update the mgr-techs relationship
*/
export function shouldOverwrite (state, func1, func2) {
  const loading = func => state.getIn(['requests', func, 'loading'], false)
  return loading(func1) && loading(func2)
}

// list and entities are input selectors, idKey is what the entities are keyed by
export function selectEntitiesInList (list, entities) {
  return createSelector([list, entities], (ids, things) => ids.map(id => things.get(id)))
}

export function createStructuredMapSelector (mapSelectorsToProps) {
  const selector = createStructuredSelector(mapSelectorsToProps)
  return (state, props) => Map(selector(state, props))
}
