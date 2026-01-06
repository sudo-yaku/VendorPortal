const isTrue = val => {// eslint-disable-line
  return val === true || val === "true" || val === 1 || val === "1" || val === "yes"
}
let hostName = window.location.origin
let SSO_ENV = 'logindev'
let config = {
  application: 'IOP_LITE',
  environment: global.NODE_ENV,
  SSO: global.SSO,
  version: global.VERSION,
  baseSSOPath:global.baseSSOPath,
  apiBaseUrl: 'http://txsliopda8v.nss.vzwnet.com:8021/graphqlstaging/',
  refreshTokenInterval: 900000,
  filepath:"/",
  bannerDisplay: "no",
  enableDownload: true,
  assignMultiMarket: false,
  sessionMaxAge: 60,
  sessionRefreshCallBuffer:60, // seconds
  revertStatusFlag: false,
  enableDynamicHvacTmplt:true,
  notificationUrl: 'http://txsliopda8v.nss.vzwnet.com:8025',
  notificationPath: '/client',
  RELEASE_VERSION: "PI22Q4"

}
console.log("Config--", global.NODE_ENV)
// http://10.134.179.218:8003
if (global.NODE_ENV === 'dev') {
  config.apiBaseUrl ='https://opsportal.verizonwireless.com/5gdev'
  config.filepath= "/"
  config.revertStatusFlag= true
  SSO_ENV = 'logindev'

}

// API url change for ISSO path 
if(global.baseSSOPath){
  hostName = `${hostName}${global.baseSSOPath}`
}



if (global.NODE_ENV === 'staging') {
  config.apiBaseUrl =hostName+'/graphqlstaging/'
  config.filepath= "/vendorportaltest/"
  config.revertStatusFlag= true
  SSO_ENV = 'loginuat'
  config.notificationUrl= hostName,
  config.notificationPath= '/client'
}


if (global.NODE_ENV === 'production') {
  config.apiBaseUrl =hostName+'/graphql/'
  config.filepath= "/vpmadmin/"
  config.revertStatusFlag= false
  SSO_ENV = 'login' // prod_env
  config.notificationUrl= hostName,
  config.notificationPath= '/client'

}

if (global.NODE_ENV === 'production4g') {
  config.apiBaseUrl =hostName+'/graphql/'
  config.filepath= "/"
  config.revertStatusFlag= false
  SSO_ENV = 'login' // prod_env
  config.notificationUrl= hostName,
  config.notificationPath= '/client'
}


// file path change fro sso
if(global.baseSSOPath){
  config.filepath = `${global.baseSSOPath}${config.filepath}`
}


config.ssoLogoutURL= `https://${SSO_ENV}.ebiz.verizon.com/siteminderagent/forms/logout.jsp`

export default config
