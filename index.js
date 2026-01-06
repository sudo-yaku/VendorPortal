import React from 'react'
import config from './config'
import ajax from './ajax'
import reduxConfig from './redux/src/config'
import './style'
import ReactDOM from 'react-dom'
import {syncHistoryWithStore} from 'react-router-redux'
import {createBrowserHistory} from 'history'
const browserHistory=createBrowserHistory();
import store from './store'
import routes from './routes'
import App from './App'
import { LoaderRedirectionWrapper } from './Users/components/LoaderRedirectionWrapper'
import { BrowserRouter } from 'react-router-dom'
// import getMuiTheme from 'material-ui/styles/getMuiTheme'
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
// import injectTapEventPlugin from 'react-tap-event-plugin'
const history = syncHistoryWithStore(browserHistory, store, {selectLocationState: state => state.get('Routes').toJS()})

reduxConfig.ajax = ajax
// injectTapEventPlugin()
console.log(config) // eslint-disable-line no-console
const palette = {
  primary1Color: '#000000',
}



const render = props => {
  console.log("render app is called");
  ReactDOM.render(
  // <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
  <BrowserRouter>
    <LoaderRedirectionWrapper>
      <App {...props}/>
      </LoaderRedirectionWrapper>
      </BrowserRouter>
  // </MuiThemeProvider>
  ,document.getElementById('app')
  )
}

const renderApp = () => render({store, history, routes})

renderApp();

if (module.hot) {
  module.hot.accept('./routes', () => {
    const newRoutes = require('./routes').default
    render({store, history, newRoutes})
  })
}
