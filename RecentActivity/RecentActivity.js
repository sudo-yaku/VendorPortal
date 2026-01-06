import React, { useRef, useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Map, List, fromJS } from 'immutable'
import * as utils from "../../src/VendorDashboard/utils"
import * as RecentActivityActions from "./actions"
import * as VendorDashboardActions from "../VendorDashboard/actions"
import * as CapitalProjectActions from "../CapitalProjectDashboard/actions"
import RecentActivityGrid from './RecentActivityGrid';
import Loader from "../Layout/components/Loader"
import Modal from "../Layout/components/Modal"
import WorkOrderDetails from "../../src/VendorDashboard/components/WorkOrderDetails"
import SnapModal from "../CapitalProjectDashboard/SnapModal"
import NotificationSystem from "react-notification-system"
import moment from "moment"

const RecentActivity = (props) => {
  const dispatch = useDispatch();
  const notificationSystem = useRef(null);
  const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
  const user = useSelector(state => state.getIn(['Users', 'entities', 'users', loginId], Map()));
  const [recentActivityLoading, setrecentActivityLoading] = useState(false)
  let [recentActivityList, setrecentActivityList] = useState([])
  let [selectedWR, setselectedWR] = useState({})
  let [selectedProject, setselectedProject] = useState({})
  let [isModalshown, setisModalshown] = useState(false)
  let [getQuotes, setgetQuotes] = useState(false)
  let [isWorkInProgress, setisWorkInProgress] = useState(false)
  let [isAcceptedWork, setisAcceptedWork] = useState(false)
  let [isCompleted, setisCompleted] = useState(false)
  let [isQuoteReceived, setisQuoteReceived] = useState(false)
  let [projectViewModel, setprojectViewModel] = useState(false)
  let [selectedRecentActivity, setselectedRecentActivity] = useState({})
  let [calendarevents, setEvents] = useState([])

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = () => {
    setrecentActivityLoading(true)
    dispatch(RecentActivityActions.getRecentActivity(loginId))
      .then(async (response) => {
        if (response && response.length > 0) {
          setrecentActivityLoading(false)
          setrecentActivityList(response)
        } else {
          setrecentActivityLoading(false)
        }
      })
  }
  const onRowClicked = async (e) => {
    let  selectedRow = e.row
    setselectedRecentActivity(selectedRow)
    if (selectedRow.WORK_TYPE.toUpperCase() == "PROJECT") {
      dispatch(CapitalProjectActions.capitalProjectSelectedRow(selectedRow))
      dispatch(CapitalProjectActions.getProjectInfoSlr(selectedRow.WORK_ORDER_ID))
      .then(async response => {
        if(response && response.type == "GET_PROJECT_INFO_SLR_SUCCESS" && response.getProjectInfoSlr) {
          setselectedProject(response.getProjectInfoSlr)
          dispatch(VendorDashboardActions.getConflictkirkeEventsForSite(loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') ,response.getProjectInfoSlr.site_unid))
          await dispatch(VendorDashboardActions.getCalenderEventsForSite(loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') ,response.getProjectInfoSlr.site_unid)).then(res=>{
            if(res.events && res.events.getCalenderEventsForSite && res.events.getCalenderEventsForSite.data){
              setEvents(res.events.getCalenderEventsForSite.data)
            }else{
              setEvents([])
            }
            setprojectViewModel(true) 
          })
        }        
      })
    } else {
      let vendorId = user.get('vendor_id');
      let groupVendors = user.get('group_vendors') ? user.get('group_vendors').toJS() : null;
      let vendorIds = groupVendors ? groupVendors.map(g => g.vendor_id).toString() : vendorId
      dispatch(VendorDashboardActions.vendorWorkOrderSelectedRow(loginId, selectedRow))
      dispatch(VendorDashboardActions.fetchAdvancedHistory(loginId, vendorIds, selectedRow.WORK_ORDER_ID))
        .then(async action => {
          console.log("vendorWODetailsObj", action)
          if (action.type == 'FETCH_ADVANCED_HISTORY_SUCCESS' && action.searchHistoryData) {
            let vendorWODetailsObj = action.searchHistoryData.allHistoryData[0]
            onRowClickBackMethod(fromJS(vendorWODetailsObj))
          }
        })
    }
  }
  const onRowClickBackMethod = (currentObj) => {
    switch (currentObj.get("quote_statuses")) {
      case utils.QUOTEPENDING:
        selectedAwaitingWRCallBack(currentObj)
        break
      case utils.QUOTERECEIVED:
        selectedQuoteReceivedWrok(currentObj)
        break
      case utils.AWAITING_PO:
        if (currentObj.get("workorder_status") === utils.WORKPENDING || currentObj.get("workorder_status") === 'WORKDECLINED') {
          selectedWorkInProgresWRCallBack(currentObj)
          break
        } else {
          selectedQuoteReceivedWrok(currentObj)
          break
        }
      case utils.QUOTEAPPROVED:
        selectedWorkInProgresWRCallBack(currentObj)
        break
      case (utils.COMPLETED):
        if (currentObj.get("workorder_status") === utils.WORKPENDING || currentObj.get("workorder_status") === 'WORKDECLINED') {
          selectedWorkInProgresWRCallBack(currentObj)
          break;
        } else {
          selectedCompletedWRCallBack(currentObj)
          break;
        }
      case utils.PENDING_WOAPPROVAL:
        selectedQuoteReceivedWrok(currentObj)
        break
    }
    setWRAndRenderModal(currentObj)
  }
  const setWRAndRenderModal = (WR) => {
    setselectedWR(fromJS(WR))
    setisModalshown(true)
  }
  const selectedWorkInProgresWRCallBack = () => {
    setgetQuotes(false)
    setisWorkInProgress(true)
    setisAcceptedWork(false)
    setisCompleted(false)
    setisQuoteReceived(false)
    // this.setState({ getQuotes: false, isWorkInProgress: true, isAcceptedWork: false, isCompleted: false, isQuoteReceived: false })
  }
  const selectedCompletedWRCallBack = () => {
    setgetQuotes(false)
    setisWorkInProgress(false)
    setisAcceptedWork(false)
    setisCompleted(true)
    setisQuoteReceived(false)
    // this.setState({ getQuotes: false, isWorkInProgress: false, isAcceptedWork: false, isQuoteReceived: false, isCompleted: true })
  }
  const selectedQuoteReceivedWrok = () => {
    setgetQuotes(false)
    setisWorkInProgress(false)
    setisAcceptedWork(true)
    setisCompleted(false)
    setisQuoteReceived(true)
    // this.setState({ getQuotes: false, isWorkInProgress: false, isAcceptedWork: true, isQuoteReceived: true, isCompleted: false })
  }
  const selectedAwaitingWRCallBack = () => {
    setgetQuotes(true)
    setisWorkInProgress(false)
    setisAcceptedWork(false)
    setisCompleted(false)
    setisQuoteReceived(false)
    // this.setState({ getQuotes: true, isWorkInProgress: false, isAcceptedWork: false, isCompleted: false, isQuoteReceived: false })
  }
  const renderProjectViewModel = () => {
    return (<Modal title="Project Details" handleHideModal={handleHideModalForProject} style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px" }}>
      <SnapModal
        notifref={notificationSystem.current}
        calendarevents={calendarevents}
        handleHideModal={handleHideModalForProject}
        selectedRow={selectedProject}
        workORderInfo={null}
        isSiteAccessExpandable={false}
        appNotification={{}}
        capitalProjectSelectedRowObj={{}}
        fromRecentActivity={true}
        selectedRecentActivity={selectedRecentActivity}
      />
    </Modal>)
  }
  const renderWorkOrderModal = () => {
    return (
      <Modal title="WORK ORDER DETAILS" handleHideModal={handleHideModal} style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px" }}>
        <WorkOrderDetails
          workOrderInfo={selectedWR}
          getQuotes={getQuotes}
          isWorkInProgress={isWorkInProgress}
          isCompleted={isCompleted}
          isQuoteReceived={isQuoteReceived}
          isAcceptedWork={isAcceptedWork}
          // onDirtyChange={this.onDirtyChange.bind(this)}
          userRole={props.userRole}
          handleHideModal={handleHideModal}
          notifref={notificationSystem.current}
          tableTitle={"Work order"}
          title="SEARCH"
          isSiteAccessExpandable={false}
          fromRecentActivity={true}
        />
      </Modal>)
  }
  const handleHideModal = () => {
    setisModalshown(false)
    dispatch(VendorDashboardActions.vendorWorkOrderSelectedRow(loginId, {}))
  }
  const handleHideModalForProject = () => {
    setprojectViewModel(false)
    dispatch(CapitalProjectActions.capitalProjectSelectedRow({}))
  }
  const renderLoading = () => <Loader color="#cd040b" size="50px" margin="4px" className="text-center loader-centered" />
  return (
    <div style={{ marginTop: '1px', padding: '35px' }}>
      <div style={{ marginBottom: '15px' }}>
        <h4>Recent OnSiteWork</h4>
        <span>Your last twenty activities are listed, choose anyone for further details.</span>
      </div>
      {recentActivityLoading ? renderLoading() :
        <RecentActivityGrid
          recentActivityData={recentActivityList}
          onRowClicked={onRowClicked}
        />
      }
      {isModalshown ? renderWorkOrderModal() : null}
      {projectViewModel ? renderProjectViewModel() :  null}
      <NotificationSystem ref={notificationSystem} />
    </div>
  )
}
export default RecentActivity;