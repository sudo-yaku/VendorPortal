import React, { Component } from 'react'
import { BrowserRouter, Routes } from 'react-router-dom'
import { connect, Provider } from 'react-redux'
import SessionWrap from './session'
import { ToastContainer } from 'react-toastify';
import * as actions from './AppNotification/actions'
import AppNotification from './AppNotification/AppNotification'
import { Map } from 'immutable'
//import * as Sentry from '@sentry/browser';
import config from './config'
import Loader from './Layout/components/Loader'
import './Fonts/NHaasGroteskDSStd-55Rg.ttf'
import NavBar from './Navigation/components/NavBar'
import LazyLoader from './LazyLoader'

class App extends Component {

  componentDidMount() {
    // Sentry.init({
    //   dsn: 'https://3aac175fa2814bb5ae1c722194f7ffe8@sentry.ebiz.verizon.com/4194',
    //   release: config.RELEASE_VERSION,
    //   environment: global.NODE_ENV
    // });
  }
  renderLoading = () => {
    return (
      <Loader color="#cd040b"
        size="30px"
        margin="4px"
        className="text-center loader-centered" />
    )
  }
  render() {
    const { store, history, routes, pushNotification } = this.props
    return (

      <Provider store={store}>
        <SessionWrap>
          <ToastContainer closeOnClick autoClose={2000} />
          {pushNotification.notificaionReceived && <AppNotification />}
          <React.Suspense fallback={<LazyLoader/>}>
            <Routes history={history}>
              {routes}
            </Routes>
          </React.Suspense>
        </SessionWrap>
      </Provider>
    )
  }
}
function mapStateToProps(state) {
  const appNotification = state.getIn(['AppNotificationReducer', 'appNotification'], Map())
  return {
    pushNotification: appNotification
  }
}
export default connect(mapStateToProps, { ...actions })(App)
