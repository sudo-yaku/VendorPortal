import React, { useEffect, useState, useCallback } from "react"
import PropTypes from "prop-types"
import { useSelector, useDispatch } from "react-redux"
import { List, Map } from "immutable"
import * as SiteActions from "../actions"
import SiteLoginForm from './SiteLoginForm'
import WorkWithFAST from './WorkWithFAST'
import SiteLogoutForm from './SiteLogoutForm'
import Loader from '../../Layout/components/Loader'
import { fetchVSMAlarmsForSite } from '../../Alarms/actions'
import IVRInstruction from '../../IVRLoginInstruction.docx'
import moment from 'moment-timezone'
import DeviceTest from './DeviceTest'
import _ from "lodash"
import "react-table/react-table.css"
import SiteAlarms from "./SiteAlarms"
import VDUReplacement from "./VDUReplacement"

const selectLoginId = state => state.getIn(["Users", "currentUser", "loginId"], "")
const selectSite = (state, loginId) => state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List())
const selectSiteDetail = (state, loginId, unid) => state.getIn(["Sites", loginId, "site", "siteDetails", unid], List())
const selectShowLoginForm = (state, loginId, site_unid) => state.getIn(["Sites", loginId, "site", site_unid, "showLoginForm"])
const selectShowLogoutForm = (state, loginId, site_unid) => state.getIn(["VendorDashboard", loginId, "site", site_unid, "showLogoutForm"])
const selectSiteDetaisLoading = (state, loginId) => state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false)
const selectUser = (state, loginId) => state.getIn(["Users", "entities", "users", loginId], Map())
const selectUserRole = (state, loginId) => state.getIn(['Users', 'entities', 'users', loginId, 'vendor_role'])
const selectConfig = state => state.getIn(['Users', 'configData', 'configData'], List())
const selectSubmarket = (state, loginId) => state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
const selectIvrInfo = state => state.getIn(['ivr', 'login'], false)

const SiteAccess = (props) => {
  const dispatch = useDispatch()
  const [lock_unlock_request_id, setLockUnlockRequestId] = useState('')
  const [vendorids, setVendorIds] = useState([])
  const [types, setTypes] = useState([])
  const [pageLoading, setPageLoading] = useState(false)
  const [enodeBData, setEnodeBData] = useState({})
  const [alarmsData, setAlarmsData] = useState([])

  // Get props from selectors
  const loginId = useSelector(selectLoginId)
  const workORderInfo = props.workORderInfo
  const selectedRow = props.selectedRow
  const unid = workORderInfo ? (workORderInfo.get('site_unid') ? workORderInfo.get('site_unid') : null) : selectedRow ? selectedRow.site_unid : ''
  const site = useSelector(state => selectSite(state, loginId))
  const siteDetail = useSelector(state => selectSiteDetail(state, loginId, unid))
  const site_unid = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails", "site_unid"]))
  const showLoginForm = useSelector(state => selectShowLoginForm(state, loginId, site_unid))
  const showLogoutForm = useSelector(state => selectShowLogoutForm(state, loginId, site_unid))
  const siteDetaisLoading = useSelector(state => selectSiteDetaisLoading(state, loginId))
  const user = useSelector(state => selectUser(state, loginId))
  const userRole = useSelector(state => selectUserRole(state, loginId))
  const config = useSelector(selectConfig)
  const submarket = useSelector(state => selectSubmarket(state, loginId))
  const ivrInfo = useSelector(selectIvrInfo)
  const vendorId = user.get('vendor_id')
  const loggedIn = useSelector(state => {
    const reason = state.getIn(['ivr', 'login', site_unid, 'login_reason'])
    return (reason && reason.length > 0) ? true : false
  })
  const configData = useSelector(selectConfig)
  const loader = <Loader color="#cd040b" size="35px" margin="4px" className="text-center" />
  const defaultTab = loggedIn ? 'WWF' : 'ECOA'
  const [deviceTestSelected, setDeviceTestSelected] = useState(defaultTab)

  const getLockUnlockReq = (lock_unlock_request_id) => {
    props.getLockUnlockReq(lock_unlock_request_id)
    setLockUnlockRequestId(lock_unlock_request_id)
    return
  }

  const resetProps = useCallback((keys, value) => {
    dispatch(SiteActions.resetProps(keys, value))
  }, [dispatch])

  const openLoginForm = useCallback((site_unid) => {
    var keys = [loginId, "site", site_unid, "showLoginForm"]
    resetProps(keys, '')
    resetProps(keys, true)
  }, [loginId, resetProps])

  const openLogoutForm = useCallback((site_unid) => {
    var keys = [loginId, "site", site_unid, "showLogoutForm"]
    resetProps(keys, '')
    resetProps(keys, true)
  }, [loginId, resetProps])

  const openLoginLogoutForm = useCallback((site_unid) => {
    if (loggedIn) {
      openLogoutForm(site_unid)
    } else {
      openLoginForm(site_unid)
    }
    return
  }, [loggedIn, openLoginForm, openLogoutForm])

  const initialiseComponent = useCallback(async () => {
    let switch_name = ''
    openLoginLogoutForm(unid)
    if (siteDetail && siteDetail.size > 0) {
      let action = siteDetail.toJS()
      switch_name = action && action.switch || ''
      let enodeBDataArr = action.node_details && action.node_details.length > 0 ? action.node_details : []
      let config_data = config.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "HEALTHCHECK_INVD_SBMARKET")
      let submarkets_arr = []
      if (config_data && config_data.length > 0 && config_data[0].ATTRIBUTE_VALUE) {
        submarkets_arr = config_data[0].ATTRIBUTE_VALUE.split(",")
      }
      let submarketfilter = submarkets_arr.filter(_ => _ == action.region)
      if (submarketfilter.length > 0) {
        enodeBDataArr = enodeBDataArr.filter(e => e.type === "4G")
      }
      let radio_cell_list = enodeBDataArr.length > 0 ? enodeBDataArr.map(inval => ({
        "enodeb_id": inval.node ? inval.node : '',
        "radio_units": [],
        "cell_list": [],
        "vendor": inval.vendor ? inval.vendor : ''
      })) : []
      setEnodeBData({ radio_cell_list: radio_cell_list })
      setPageLoading(false)
    } else {
      setPageLoading(true)
      await dispatch(SiteActions.fetchSiteDetails(loginId, unid)).then(async action => {
        if (action && action.type === "FETCH_SITEDETAILS_SUCCESS") {
          let switch_name = action && action.site && action.site.switch || ''
          let enodeBDataArr = action && action.site && action.site.node_details && action.site.node_details.length > 0 ? action.site.node_details : []
          let config_data = config.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "HEALTHCHECK_INVD_SBMARKET")
          let submarkets_arr = []
          if (config_data && config_data.length > 0) {
            submarkets_arr = config_data[0].ATTRIBUTE_VALUE.split(",")
          }
          let submarketfilter = submarkets_arr.filter(_ => _ == action.site.region)
          if (submarketfilter.length > 0) {
            enodeBDataArr = enodeBDataArr.filter(e => e.type === "4G")
          }
          let radio_cell_list = enodeBDataArr.length > 0 ? enodeBDataArr.map(inval => ({
            "enodeb_id": inval.node ? inval.node : '',
            "radio_units": [],
            "cell_list": [],
            "vendor": inval.vendor ? inval.vendor : ''
          })) : []
          setEnodeBData({ radio_cell_list: radio_cell_list })
          setPageLoading(false)
        } else {
          setPageLoading(false)
        }
      })
    }
    if (user.get('vendor_category') !== 'Nest Evaluation') {
      await dispatch(SiteActions.fetchSectorLockData(vendorId, loginId, unid)).then(async action => {
        if (action.type === "FETCH_SECTORLOCKDATA_SUCCESS") {
          const refData = !!action.sectorLockData && !!action.sectorLockData.getSectorLockData && !!action.sectorLockData.getSectorLockData.refData ? action.sectorLockData.getSectorLockData.refData : []
          var lock_unlock_request_id
          const vendorids = refData.map(val => val.VENDOR_ID)
          const siteData = !!action.sectorLockData && !!action.sectorLockData.getSectorLockData && !!action.sectorLockData.getSectorLockData.siteData ? action.sectorLockData.getSectorLockData.siteData.filter(v => v.SECTOR_REQUEST_TYPE !== "Breakfix") : null
          var statusArr = ["CANCELLED", "COMPLETED"]
          var workPendingStatus = ['NEW', 'IN_PROGRESS']
          let filteredLockData = siteData.filter(val => val.WORK_ORDER_ID === workORderInfo.get('workorder_id') && ((!statusArr.includes(val.REQUEST_STATUS)) || (val.REQUEST_STATUS === 'HAND_OFF' && moment(val.CREATED_DATE).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))))
          if (siteData.filter(v => v.WORK_ORDER_ID !== workORderInfo.get('workorder_id')).length === 0 || siteData.filter(v => v.WORK_ORDER_ID !== workORderInfo.get('workorder_id') && ((workPendingStatus.includes(v.REQUEST_STATUS)) || (v.REQUEST_STATUS === 'HAND_OFF' && moment(v.CREATED_DATE).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')))).length === 0) {
            if (!!filteredLockData && filteredLockData.length === 0) {
              lock_unlock_request_id = ''
            } else if (!!filteredLockData && filteredLockData.length > 0) {
              lock_unlock_request_id = siteData.filter(val => !statusArr.includes(val.REQUEST_STATUS) && val.WORK_ORDER_ID === workORderInfo.get('workorder_id')).sort((a, b) => {
                if (new Date(a.CREATED_DATE) < new Date(b.CREATED_DATE)) {
                  return 1
                } else if (new Date(a.CREATED_DATE) > new Date(b.CREATED_DATE)) {
                  return -1
                } else {
                  return 0
                }
              })[0].LOCK_UNLOCK_REQUEST_ID.toString()
            } else {
              lock_unlock_request_id = ''
            }
          } else {
            lock_unlock_request_id = ''
          }
          const types = refData.map(val => val.WORK_TYPE.toUpperCase().trim()).join(',').split(',')
          setVendorIds(vendorids)
          setTypes(types)
          getLockUnlockReq(lock_unlock_request_id)
        }
      })
    }
    var keys = [loginId, "site", unid, "showLoginForm"]
    resetProps(keys, false)
    var keys2 = [loginId, "site", unid, "showLogoutForm"]
    if (loggedIn) {
      resetProps(keys2, true)
    } else {
      resetProps(keys, true)
      resetProps(keys2, false)
    }
  }, [dispatch, loginId, unid, siteDetail, config, user, vendorId, workORderInfo, loggedIn, resetProps])

  useEffect(() => {
    let { appNotification } = props
    if (appNotification && appNotification.notificaionReceived && appNotification.notificationType === "Project") {
      setDeviceTestSelected("WWF")
    }
    initialiseComponent()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    initialiseComponent()

    if (!loggedIn && deviceTestSelected !== 'ECOA') {
      setDeviceTestSelected('ECOA')
    } else if (loggedIn) {
      setDeviceTestSelected('WWF')
    }
    // eslint-disable-next-line
  }, [loggedIn])

  const displaySiteAccessTabs = useCallback(() => {
    return (
      <div className="row" style={{ "background": "#FFF", margin: "25px 0px 2px 0px" }}>
        <div className="subnav" style={{ borderBottom: deviceTestSelected === 'ECOA' ? "3px solid black" : "3px solid white" }}>
          <button className="subnavbtn" onClick={() => setDeviceTestSelected('ECOA')}>Site Alarms</button>
        </div>
        {loggedIn && showLogoutForm &&<div className="subnav" style={{ borderBottom: deviceTestSelected === 'WWF' ? "3px solid black" : "3px solid white" }}>
          <button className="subnavbtn" onClick={() => setDeviceTestSelected('WWF')}>Work with FAST</button>
        </div>}
        {loggedIn && showLogoutForm && (workORderInfo.get('project_initiative') === "C-BAND" || workORderInfo.get('project_initiative') === "VRAN") ?
          <div className="subnav" style={{ borderBottom: deviceTestSelected === 'DT' ? "3px solid black" : "3px solid white" }}>
            <button className="subnavbtn" onClick={() => setDeviceTestSelected('DT')}>Device Test</button>
          </div>
          : null}
        {loggedIn && showLogoutForm && (workORderInfo.get('project_initiative') === "C-BAND" || workORderInfo.get('project_initiative') === "VRAN") ?
          <div className="subnav" style={{ borderBottom: deviceTestSelected === 'VDU' ? "3px solid black" : "3px solid white" }}>
            <button className="subnavbtn" onClick={() => setDeviceTestSelected('VDU')}>vDU Replacement</button>
          </div>
          : null}
      </div>
    )
  },[loggedIn,showLogoutForm,deviceTestSelected])
 
  const displaySiteAccessData = useCallback(() => {
    return (
      <>
        {displaySiteAccessTabs()}
        {deviceTestSelected === 'VDU' && workORderInfo.get('project_initiative') === "C-BAND" && <VDUReplacement selectedRow={selectedRow} notifref={props.notifref} loginId={loginId} />}
        {deviceTestSelected === 'DT' && workORderInfo.get('project_initiative') === "C-BAND" && <DeviceTest selectedRow={selectedRow} notifref={props.notifref} loginId={loginId} />}
        {deviceTestSelected === 'WWF' && <WorkWithFAST
          site_unid={site.get('site_unid')}
          workORderInfo={workORderInfo}
          notifref={props.notifref}
          getLockUnlockReq={getLockUnlockReq}
          lock_unlock_request_id={lock_unlock_request_id}
          enodeBData={enodeBData}
          isSnap={true}
          selectedRow={selectedRow}
          fromRecentActivity={props.fromRecentActivity}
          selectedRecentActivity={props.selectedRecentActivity} />}
        {deviceTestSelected === 'ECOA' && <SiteAlarms
          workORderInfo={workORderInfo}
          selectedRow={selectedRow}
          fetchVSMAlarmsForSite={fetchVSMAlarmsForSite}
        />}
      </>
    )
  },[deviceTestSelected,loggedIn,showLogoutForm,lock_unlock_request_id])

  const renderIcon = (row) => {
    let color = ''
    if (row.row.severity === 'Indeterminate') {
      color = '#008330'
    } else if (row.row.severity === 'Minor') {
      color = '#FFBC3D'
    } else if (row.row.severity === 'Major') {
      color = '#ED7000'
    } else if (row.row.severity === 'Critical') {
      color = 'red'
    } else if (row.row.severity === 'Warning') {
      color = '#0077B4'
    } else {
      color = 'black'
    }
    return <span className="btn" style={{ color: '#fff', backgroundColor: color, borderRadius: '3px !important' }}>{row.row.severity}</span>
  }

  const formatDateCell = (date) => {
    return <span>{moment(date).utc().format('MM/DD/YYYY HH:MM a')} UTC</span>
  }

  if (siteDetaisLoading || pageLoading || (user && user.get('vendor_name') == null)) return loader
  const workType = workORderInfo && workORderInfo.get('work_type') ? workORderInfo.get('work_type') : null
  const isPendingStatus = workORderInfo && workORderInfo.get('workorder_status') ? workORderInfo.get('workorder_status').toUpperCase() === 'WORKPENDING' : null
  let bird_nest_activity = site.get('bird_nest_activity') ? site.get('bird_nest_activity') : null

  return (
    <div className="row" style={{ "margin": "0px" }}>
      <div className="col-md-12">
        <section className="design-process-section" id="process-tab">
          <div className="">
            <div className="row" style={{ "border": "1px solid #cecece" }}>
              <style>
                {`
                  a.info-ivr:hover,a.info-ivr:active {
                    color: #ed3e44 !important;
                  }
                `}
              </style>
              {user.get('vendor_category') !== 'Nest Evaluation' ? !loggedIn && showLoginForm &&
                <div className="col-12" style={{ "background": "#ECEFF1", "padding": "20px" }}>
                  <div className="col-md-12" style={{ "padding": "10px 0px", "background": "black", "color": "#FFF", "textAlign": "center" }}>
                    IVR LOGIN <a href={IVRInstruction} className="info-ivr" download="IVRLoginInstruction.docx" style={{ "float": "right", "margin": "0 8px", "fontSize": "16px", "cursor": "pointer", "color": "#FFF", "transition": "0.1s" }}><i className="fa fa-info-circle"></i></a>
                  </div>
                  <SiteLoginForm
                    site_unid={site.get('site_unid')}
                    enableSectorLock={true}
                    lock_unlock_request_id={lock_unlock_request_id}
                    workORderInfo={workORderInfo}
                  />
                  {displaySiteAccessData()}
                </div>
                : null}

              {user.get('vendor_category') !== 'Nest Evaluation' ? loggedIn && showLogoutForm &&
                <div className="col-12" style={{ "background": "#ECEFF1", "padding": "20px" }}>
                  <div className="col-md-12" style={{ "padding": "10px 0px", "background": "black", "color": "#FFF", "textAlign": "center" }}>
                    IVR LOGOUT <a href={IVRInstruction} className="info-ivr" download="IVRLoginInstruction.docx" style={{ "float": "right", "margin": "0 8px", "fontSize": "16px", "cursor": "pointer", "color": "#FFF", "transition": "0.1s" }}><i className="fa fa-info-circle"></i></a>
                  </div>
                  <SiteLogoutForm
                    site_unid={site.get('site_unid')}
                    workORderInfo={workORderInfo}
                    lock_unlock_request_id={lock_unlock_request_id}
                    isSnap={true}
                    notifref={props.notifref}
                  />
                  {displaySiteAccessData()}
                </div>
                : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

SiteAccess.propTypes = {
  site: PropTypes.object,
  fetchSiteDetails: PropTypes.func,
  loginId: PropTypes.string,
  siteDetaisLoading: PropTypes.bool,
  showLoginForm: PropTypes.bool,
  showLogoutForm: PropTypes.bool,
  loggedIn: PropTypes.bool,
  getQuotes: PropTypes.bool,
  workORderInfo: PropTypes.object,
  ivrInfo: PropTypes.bool,
  isWorkInProgress: PropTypes.bool,
  user: PropTypes.object,
  techId: PropTypes.string,
  userRole: PropTypes.string,
  resetProps: PropTypes.func
}

export default SiteAccess