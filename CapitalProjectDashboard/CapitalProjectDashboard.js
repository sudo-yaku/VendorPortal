import React, { useState, useEffect, useRef } from "react"
import Modal from "../Layout/components/Modal"
import MainContent from "../Layout/components/MainContent"
import Loader from '../Layout/components/Loader'
import { Map, List, fromJS } from 'immutable'
import ReactTooltip from 'react-tooltip'
import CapitalProjectGrid from "./CapitalProjectGrid"
import * as CapitalProjectActions from "./actions"
import SnapModal from './SnapModal'
import DetectAppVersion from "../Utils/DetectAppVersion"
var NotificationSystem = require('react-notification-system')
import * as AppNotificationActions from '../AppNotification/actions'
import { getRecentActivity } from '../RecentActivity/actions'
import { fetchEventDetails } from "../VendorDashboard/actions"
import moment from "moment";
import {getCalenderEventsForSite,getConflictkirkeEventsForSite} from '../VendorDashboard/actions'
import searchIcon from '../Images/search.png'
import { attemptLogoutOfIVR,clearIVRLogoutRequest } from "../redux/src/ivr/actions"
import { resetProps } from "../sites/actions"
import { logActioninDB } from "../VendorDashboard/actions"
import { useSelector,useDispatch} from "react-redux"
import './Capital.css'
import ProjectPan from "./ProjectPan"

function CapitalProjectDashboard(props) {
  let dispatch=useDispatch();
  let loginId =useSelector(state=>state.getIn(["Users", "currentUser", "loginId"], ""));
  let siteDetails=useSelector(state=>state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()));
  let IVRLoginDetails=useSelector(state=>state.getIn(['ivr','login',siteDetails?.toJS()?.site_unid],Map()));
  let user =useSelector(state=> state.getIn(['Users', 'entities', 'users', loginId], Map()))
  let realLoginId =useSelector(state=> state.getIn(["Users", "realUser", "loginId"], ""))
  let realuser =useSelector(state=> state.getIn(['Users', 'entities', 'users', realLoginId], Map()))
  let realvendorId =realuser.get('vendor_id')
  const configData =useSelector(state=> state.getIn(['Users', 'configData', "configData"], Map()))
  const configDataObj = configData && configData.toJS() ? configData.toJS().configData : ''
    let vendorId = user.toJS().vendor_id
    let projectsList = useSelector(state=>state.getIn(["CapitalProjectDashboard", "getSNAPProjects", "snapProjects"], Map()))
    projectsList= projectsList ? projectsList.toJS().output : [];   
    let compDetails = useSelector(state=>state.getIn(['Users', 'getVendorUserAuthForVendorId', 'data']) ? state.getIn(['Users', 'getVendorUserAuthForVendorId', 'data']) : null)
    const appNotification =useSelector(state=> state.getIn(['AppNotificationReducer', 'appNotification'], Map()))
    const capitalProjectSelectedRowObj =useSelector(state=> state.getIn(["CapitalProjectDashboard", "getSNAPProjects", "selectedRow"], Map()))
    let events =useSelector(state=> state.getIn(["VendorDashboard", loginId, "events", "eventsDetails"], Map()))
    events = events.toJS().getEventDetails;   
  
  const [gloableSearchValue, setgloableSearchValue] = useState('')
  const [gloableSearchResult, setgloableSearchResult] = useState([])
  const [gloableSearch, setgloableSearch] = useState(true)
  const [isModalClicked, setisModalClicked] = useState(false)
  const [selectedRow, setselectedRow] = useState({})
  const [snapAndCBandProjects, setsnapAndCBandProjects] = useState([])
  const [projectTypeDropdown, setprojectTypeDropdown] = useState({ label: "", value: "" })
  const [dropdownValues, setdropdownValues] = useState([])
  const [pageLoading, setpageLoading] = useState(false)
  const [searchLoading, setsearchLoading] = useState(false)
  const [recentActivityData, setrecentActivityData] = useState([])
  const [calendarevents, setEvents] = useState([])
  const [calenderViewModal, setCalenderViewModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isSiteAccessExpandable, setisSiteAccessExpandable] = useState(false)
  const notificationSystem = useRef("notificationSystem")
  const search = useRef("search")
  const [ListOfProjects, setListOfProjects] = useState([])
  const [ProjectPanLoader, setProjectPanLoader] = useState(false)
  const [oswId, setOswId] = useState(null)

  let gridOptions = useRef()
  let gridApi = useRef()
  let gridColumnApi = useRef()

  useEffect(() => {
    fetchRecentActivity()
    dispatch(fetchEventDetails(loginId, vendorId))
  }, [])

  const clearResult = () => {
    setgloableSearchValue('')
    setgloableSearchResult([])
    setsnapAndCBandProjects([])
    setselectedRow({})
    setSelectedProject(null)
    setCalenderViewModal(false)
  }

  const setVendorCalenderViewClicked = (WR) => {
    setCalenderViewModal(true)
    setSelectedProject(fromJS(WR))
    setselectedRow(WR)
  }

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value.val
    }
    )
    ref.current
  }
   useEffect(() => {
    if (isModalClicked && appNotification.notificationClicked && appNotification.notificationType === "Project" && isModalClicked == false) {
      setTimeout(() => {
        openNewProjectForNotification()
      }, 1000)
    }
    if(!isModalClicked && IVRLoginDetails?.toJS()?.state_switch_cd && IVRLoginDetails?.toJS()?.cell_num && IVRLoginDetails?.toJS()?.message=="Login into site was successful"){
      let login={
        "loginId": loginId,
        "state_switch_cd":IVRLoginDetails?.toJS()?.state_switch_cd ,
        "generate_alarms": "yes",
        "cell_num": IVRLoginDetails?.toJS()?.cell_num
      }
      resetMessages()
      dispatch(attemptLogoutOfIVR(siteDetails?.toJS()?.site_unid,login)).then(action => {
        if (action.login && action.login.message && action.login.message.includes("successful"))
          dispatch(logActioninDB(loginId, user && user.get('email'), user && user.get('vendor_id'),capitalProjectSelectedRowObj?.proj_number, user && user.get('vendor_area'), user && user.get('vendor_region'), "Logout of IVR","IVRLogout","IVRLogout",""));
        var keys = [loginId, "site", "showLoginForm"]
        dispatch(resetProps(keys, true))
        var keys2 = [loginId, "site", "showLogoutForm"]
        dispatch(resetProps(keys2, false))
      })}
  }, [isModalClicked])

  const prevAppNotify = usePrevious({ val: appNotification.notificaionProject })
  const prevuser = usePrevious({ val: user.get("vendor_id") })

  useEffect(() => {
    // if (user.get("vendor_id") && user.get("vendor_id") != prevuser) {
    //   fetchRecentActivity()
    //   // fetchSNAPProjects()
    // } else 
    if (capitalProjectSelectedRowObj.proj_number && prevAppNotify && prevAppNotify !== capitalProjectSelectedRowObj.proj_number) {
      if (isModalClicked && appNotification.notificationClicked && appNotification.notificationType === "Project") {
        dispatch(CapitalProjectActions.capitalProjectSelectedRow({ proj_number: appNotification.notificaionProject }))
        setisModalClicked(false)
      }
    } else if (Object.keys(capitalProjectSelectedRowObj).length == 0 || capitalProjectSelectedRowObj.size === 0) {
      if (!isModalClicked && appNotification.notificationClicked && appNotification.notificationType === "Project") {
        dispatch(CapitalProjectActions.capitalProjectSelectedRow({ proj_number: appNotification.notificaionProject }))
        openNewProjectForNotification()
      }
    } else if (appNotification && capitalProjectSelectedRowObj && appNotification.notificaionProject == capitalProjectSelectedRowObj.proj_number) {
      if (isModalClicked && !isSiteAccessExpandable && appNotification.notificaionReceived && appNotification.notificationType === "Project" && appNotification.notificationAction == false) {
        setisSiteAccessExpandable(true)
      }
    }
  }, [user.get("vendor_id"), capitalProjectSelectedRowObj, appNotification])

  useEffect(()=>{
    fetchProjectsList()
  },[])

  const fetchProjectsList = () => {
    let currentdate = moment().format('YYYY-MM-DD')
    let startDt = moment(currentdate).subtract(1, 'month').startOf("month").format('YYYY-MM-DD')
    let endDt = moment(currentdate).add(1, 'month').endOf("month").format('YYYY-MM-DD')
    dispatch(CapitalProjectActions.getProjectsList(user.get("vendor_mdg_id"),startDt,endDt,user.get("vendor_region"))).then(res => {
     setProjectPanLoader(true)
     setListOfProjects(res)
    })
  }
  const fetchRecentActivity = () => {
    dispatch(getRecentActivity(user.get("userid")))
      .then(resp => {
        if (resp && resp.length > 0) {
          setrecentActivityData(resp)
        }
      })
  }
 const resetMessages=()=> {
    dispatch(clearIVRLogoutRequest(siteDetails?.toJS().site_unid))
  }
  const openNewProjectForNotification = () => {
    dispatch(CapitalProjectActions.getProjectInfoSlr(appNotification.notificaionProject))
      .then(response => {
        setisModalClicked(true)
        setselectedRow(response.getProjectInfoSlr)
        setisSiteAccessExpandable(true)

      })
  }
  const refreshTable = () => fetchSNAPProjects()
  const fetchSNAPProjects = async () => {
    setpageLoading(true)
    dispatch(CapitalProjectActions.getSNAPProjects(user.get("vendor_area"), user.get("vendor_region")))
      .then(async (action) => {
        if (action && action.type === "GET_SNAP_PROJECTS_SUCCESS") {
          let selectedValue = "";
          let dropdownValues = [];
          let filteredData = [];
          if (action.snapProjects && action.snapProjects.output.length > 0) {
            //Sort by Recent Activity
            let c = []
            if (recentActivityData && recentActivityData.length > 0) {
              c = recentActivityData.map(el => {
                if (el.WORK_TYPE && el.WORK_TYPE.toLowerCase() == 'project') {
                  return action.snapProjects.output.find(ele => ele.proj_number == el.WORK_ORDER_ID)
                }
              })
            }
            else {
              c = []
            }
            let currComp = compDetails && compDetails.companies.length > 0 && compDetails.companies.find(v => v.VENDOR_ID == user.get('vendor_id')) ? compDetails.companies.find(v => v.VENDOR_ID == user.get('vendor_id')) : {}
            let projectTypeItem = configDataObj && configDataObj.length > 0 ? configDataObj.filter(item => item.ATTRIBUTE_VALUE && item.ATTRIBUTE_VALUE.split(",").includes(String(currComp.VENDOR_PEOPLESOFTID))) : []
            dropdownValues = projectTypeItem.map(item => item.ATTRIBUTE_CATEGORY === "CBAND" ? "C-BAND" : item.ATTRIBUTE_CATEGORY === "5GR" ? "5G-Repeater" : item.ATTRIBUTE_CATEGORY)
            if (dropdownValues.length > 1) {
              dropdownValues.splice(0, 0, "ALL")
              selectedValue = "ALL"
              filteredData = filteredData
            } else {
              selectedValue = dropdownValues[0]
            }
            let otherProjectInitiatives = []
            action.snapProjects.output.forEach(element => {
              if (dropdownValues.includes(element.project_initiative)) {
                filteredData.push(element)
              } else if (!["C-BAND", "SNAP", "5G-Repeater"].includes(element.project_initiative)) {
                otherProjectInitiatives.push(element.project_initiative)
              }
            })
            otherProjectInitiatives.forEach(item => !dropdownValues.includes(item) && dropdownValues.push(item))
            c = [...c.filter(el => el), ...filteredData]
            filteredData = Array.from(new Set(c.map((Obj) => Obj)))
          }
          setsnapAndCBandProjects(filteredData)
          setprojectTypeDropdown({ label: selectedValue, value: selectedValue })
          setgloableSearchValue("")
          setdropdownValues(filteredData.length > 0 ? dropdownValues : [])
          setpageLoading(false)
          if (appNotification.notificationType == "Project" && appNotification.notificationClicked) {
            dispatch(CapitalProjectActions.getProjectInfoSlr(appNotification.notificaionProject))
              .then(response =>  {
                setisModalClicked(true)
                setselectedRow(response.getProjectInfoSlr)
                setisSiteAccessExpandable(true)
              })
          }
        } else {
          setpageLoading(false)
        }
      })
  }

  const handleGlobalSearch = (searchVal) => {
    var gloableSearchResult = []
    setgloableSearchValue(searchVal)
    setgloableSearchResult(gloableSearchResult)
    setgloableSearch(true)
  }

  const handleProjectSearch = async () => {
    let searchResult = [];
    setsearchLoading(true)
    setgloableSearch(false)
    await dispatch(CapitalProjectActions.getProjectDetails(gloableSearchValue, user.get("vendor_area"), user.get("vendor_region")))
      .then(async resp => {
     dispatch(getConflictkirkeEventsForSite(loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') , resp.output?.site_unid)) 
        if (resp && resp.output && resp.output.proj_number) {       
         await dispatch(getCalenderEventsForSite(loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') , resp.output.site_unid)).then(res=>{
            if(res.events && res.events.getCalenderEventsForSite && res.events.getCalenderEventsForSite.data){
              setEvents(res.events.getCalenderEventsForSite.data)
            }else{
              setEvents([])
            }
          })

          let proj = resp.output;
          if (proj.project_initiative.includes("CBAND")) {
            proj.project_initiative = 'C-BAND'
          } else if (proj.project_initiative.includes("SNAP")) {
            proj.project_initiative = 'SNAP'
          } else {
            proj.project_initiative = proj.project_initiative.length > 0 ? proj.project_initiative[0] : ''
          }
          searchResult.push(proj)
          setgloableSearchResult(searchResult)
          setsearchLoading(false)
        } else {
          setsearchLoading(false)
        }
      })
  }

  const onRowClicked = selectedrow => {
    setisModalClicked(true)
    setselectedRow(selectedrow)
    dispatch(CapitalProjectActions.capitalProjectSelectedRow(selectedrow))
  }
  const handleHideModal = () => {
    setisModalClicked(false)
    setProjectPanLoader(false)
    if (appNotification.notificaionReceived) {
      dispatch(AppNotificationActions.updateAppNotification({
        ...appNotification,
        notificationClicked: false
      }))
      dispatch(CapitalProjectActions.capitalProjectSelectedRow({}));
    }
    clearResult()
    fetchProjectsList()
    }

  const onModelClick = () => {
    resetMessages();
    return (
      <Modal title={calenderViewModal? "Vendor Schedule" :"Project Details"} handleHideModal={() => handleHideModal()} style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px" }}>
        <SnapModal
          notifref={notificationSystem.current}
          calendarevents={calendarevents}
          handleHideModal={() => handleHideModal()}
          selectedRow={selectedRow}
          workORderInfo={null}
          isSiteAccessExpandable={isSiteAccessExpandable}
          appNotification={appNotification}
          capitalProjectSelectedRowObj={capitalProjectSelectedRowObj}
          vendorCalenderViewModel={calenderViewModal}
          onLockUnlockReqReceived={onLockUnlockReqReceived}
        />
      </Modal>)
  }
  const onLockUnlockReqReceived = (lock_unlock_request_id) => {
    setOswId(lock_unlock_request_id)
  }

  const onGridReady = params => {
    gridOptions = params
    gridApi = params.api
    gridColumnApi = params.columnApi
    gridApi.setFilterModel(null)
    if (params.api && params.api.sizeColumnsToFit) { params.api.sizeColumnsToFit() }
    params.api.sizeColumnsToFit()
    gridApi.sizeColumnsToFit()
  };

  const generateOptinsForDropdown = (items) => {
    return items.map(i => {
      return { 'label': i, 'value': i }
    })
  }

  const projectTypeDropdowns = (e) => {
    setprojectTypeDropdown({ label: e.value, value: e.value })
    setsnapAndCBandProjects(e.value === "ALL" ? projectsList : projectsList.filter(project => project.project_initiative === e.value))
    setgloableSearchValue("")
  }

  const renderSearchFilter = () => {
    const customStyles = {
      control: base => ({
        ...base,
        height: 30,
        minHeight: 30
      })
    }
    return (
      <div className="row">
        <div className="col-md-12 col-sm-2 no-padding" style={{ display: "flex", marginBottom: "15px", maxWidth: "98%" }}>
          <div className="search-bar col-sm-2 " style={{ flexGrow: "1" }} >
            <div className="float-left" style={{ position: "relative" }}>
              <input
                placeholder="Enter Project Id"
                className="form-control"
                style={{ borderRadius: "0rem", borderBottom: "2px solid black", height: "32px" }}
                ref={search}
                value={gloableSearchValue}
                onChange={e => handleGlobalSearch(e.target.value.trim())}
              />

              {searchLoading ? "" :
                <a className="navbar-brand pointer float-left"
                  data-tip data-for="Search"
                  onClick={() => handleProjectSearch()}
                  style={{ position: "absolute", right: "0", top: "0", display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                  {/* <i className="fa fa-search" style={{ height: '27px', width: '25px', padding: '5px', background: gloableSearchValue && gloableSearchResult.length <= 0 ? '' : '' }}>
                  </i> */}
                  <img src={searchIcon} height={'16px'} />
                </a>
              }
              <ReactTooltip id="Search" place="top" effect="float">
                <span>Search Project</span>
              </ReactTooltip>
            </div>
          </div>

          {!(gloableSearch) && (gloableSearchResult.length <= 0) ?
            <div className="" style={{ border: "1px solid black", borderTop: "2px solid red", display: "flex", flexGrow: "3", alignItems: "center" }}>
              <p style={{ fontSize:'14px', textAlign: "center", marginBottom: "0px" }}>
                <i className="fa fa-exclamation-circle" style={{ marginLeft: "10px", marginRight: "10px" }}></i>No result to show for this project id please verify and try again using 8 Digit Project ID </p>
            </div> :
            <div className="" style={{ border: "1px solid black", borderTop: "1px solid black", display: "flex", flexGrow: "3", alignItems: "center" }}>
              <p style={{ fontSize: '14px', textAlign: "center", marginBottom: "0px" }}>
                <i className="fa fa-info-circle" style={{ marginLeft: "10px", marginRight: "10px" }}></i>To find a site please enter 8 digit project Id and click magnifying glass </p>
            </div>
          }
        </div>
      </div>
    )
  }
  const renderLoading = () => <Loader color="#cd040b" size="50px" margin="4px" className="text-center loader-centered" />
  const renderTitle = () => <div className="title-div-style" style={{ margin: "13px", paddingTop: "10px" }}><p style={{ fontSize: '16px', fontWeight: "bold" }}>Capital Project Dashboard</p></div>

  let projects = gloableSearchValue.length > 0 ? gloableSearchResult : snapAndCBandProjects;
  if(projects && projects.length>0){
    projects[0].events = calendarevents;
  }
  return (
    <div className="capital-project-dashboard">
      <MainContent>
        <DetectAppVersion />
        {renderTitle()}
        <div className="container-fluid" style={{ width: "100%" }}>
          {renderSearchFilter()}
          {pageLoading ? renderLoading() : (gloableSearchValue ? (gloableSearchResult.length <= 0 ?
            <div></div> : <CapitalProjectGrid
              projects={projects}
              onGridReady={(e) => onGridReady(e)}
              onRowClicked={(e) => onRowClicked(e)}
              calendarevents={calendarevents}
              vendorCalenderIconClicked={setVendorCalenderViewClicked}
              hideFooter={true}
              minHeight={0}
            />) : <div></div>)
          }
          {searchLoading ? <Loader color="#cd040b" size="25px" style={{ position: "absolute", right: "10px" }} /> :
            ""
          }
        </div>
        {ProjectPanLoader ?  <div>
          <ProjectPan  projects={ListOfProjects}
                  onGridReady={(e) => onGridReady(e)}
                  onRowClicked={(e) => onRowClicked(e)}
                  calendarevents={calendarevents}
                  vendorCalenderIconClicked={setVendorCalenderViewClicked}></ProjectPan>
        </div>: renderLoading() 
       
        }
      </MainContent>
      {(isModalClicked || calenderViewModal) && selectedRow && selectedRow.site_unid ? onModelClick() : null}

      <NotificationSystem ref={notificationSystem} />
    </div >
  )
}

export default CapitalProjectDashboard;