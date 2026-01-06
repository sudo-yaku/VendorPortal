import axios from 'axios'
import config from './config'
import store from './store'
// import {getCookie} from './http_utils'

// var CSRF_TOKEN = ''
const client = axios.create({ baseURL: config.apiBaseUrl, withCredentials: true, maxRedirects: 0 })

client.interceptors.request.use(config => {
  const loginId = store.getState().getIn(['Users', 'currentUser', 'loginId'])
  const token = store.getState().getIn(['Users', 'entities', 'users', loginId, 'vendor_id'])
  if (token) {
    config.headers = { Authorization: token }
  }
  return config
})

export const responseInterceptor = resp => {


  const correctEnvironment = config.environment !== 'testing' && config.environment !== 'ci' && config.environment !== undefined
  if (correctEnvironment && resp instanceof Error) {
    console.error('Axios Error ', resp) // eslint-disable-line no-console
  }
  let errors = resp.response.data && resp.response.data.errors ? resp.response.data.errors : [{ detail: 'Error' }]

  if (resp.name && resp.name === 'Error' && resp.message) {
    if (resp.message.indexOf('413')) {
      errors = [{ code: 413, message: "Backend connection timed out" }]
    } else if (resp.message.indexOf('500')) {
      errors = [{ code: 500, message: "Internal server error" }]
    } else if (resp.message.indexOf('502')) {
      errors = [{ code: 502, message: "Gateway down! Please try after sometime." }]
    }
  }

  return Promise.reject(errors)
}

client.interceptors.response.use(resp => {
  if (resp.headers['content-type'].indexOf('text/html') > -1 && resp.request.responseURL && resp.request.responseURL.length > 0) {
    window.location.replace(resp.request.responseURL);
  }
  if (resp.config.url.indexOf('/services/auth/vendor/user') > -1) {
    // CSRF_TOKEN=resp.headers['x-csrf-token']
  }

  return resp
}, responseInterceptor)

export default client

export const rawClient = axios.create({ baseURL: config.apiBaseUrl, withCredentials: true })

