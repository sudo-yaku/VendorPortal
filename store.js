import {Map} from 'immutable'
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'
import {routerMiddleware} from 'react-router-redux'
import {createBrowserHistory} from 'history'
const browserHistory=createBrowserHistory();
import browserStorage from './browserStorage'

const routingMiddleware = routerMiddleware(browserHistory)

const sessionMiddleware = _store => next => action => {
  let result = next(action)

  switch (action.type) {
  case 'LOGIN_SUCCESS':
    browserStorage.set({
      realUser: {
        loginId: action.user.user.login_id,
      },
      currentUser: {
        loginId: action.user.user.login_id,
      }
    })
    break
  case 'SWITCH_USER':
    browserStorage.set({
      currentUser: {
        loginId: action.user.user.login_id,
      }
    })
    break
  case 'RESTORE_USER':
    browserStorage.set({
      currentUser: {
        loginId: action.loginId,
      }
    })
    break
  case 'USER_LOGOUT':
    browserStorage.clear()
    break
  default:
    break
  }

  return result
}



export default createStore(
  reducer,
  Map(),
  compose(
    applyMiddleware(thunk, sessionMiddleware, routingMiddleware),
    window && window.devToolsExtension ? window.devToolsExtension() : f => f
  )
)