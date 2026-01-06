import React, { useState } from 'react';
import Loader from '../../Layout/components/Loader'
import { Map } from "immutable"
import moment from "moment"
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/AlarmAdd'
import BackIcon from '@material-ui/icons/Undo'
import RescheduleIcon from '../../Calendar/assets/Rescheduled.png'
import VSMinimalCalendar from './VSMinimalCalendar';
import VSMinimalCreateScheduler from './VSMinimalCreateScheduler';
import { useSelector } from 'react-redux';
import '../assets/collapse.css';

const VendorScheduleCalender = (props) => {
    const loginId = useSelector((state) => state.getIn(['Users', 'currentUser', 'loginId'], ''));
    const eventsLoading = useSelector((state) => state.getIn(["VendorDashboard", loginId, "eventsforSite", "eventsforSiteLoading"], Map()))
    let conflictEventsLoading =useSelector((state)=>state.getIn(["VendorDashboard", loginId, "conflictEventsforSite", "conflictEventsforSiteLoading"], Map()))
    let events = useSelector((state) => state.getIn(["VendorDashboard", loginId, "eventsforSite", "eventsforSiteDetails"], Map()))
    events = events?.toJS()?.getCalenderEventsForSite ? events?.toJS()?.getCalenderEventsForSite?.data : [];
    let recentCurrentWorkOrderOEvent = events.filter((elem) => elem.workId == props.workorderId)
    let recentEventId = recentCurrentWorkOrderOEvent.sort((a,b) => a.eventId - b.eventId)
    let currentWorkOrderOEvent = recentEventId[recentEventId.length-1]
    const [createScheduleClicked, setcreateScheduleClicked] = useState(false)
    const refreshCalender = (stDate, endDate) => {
        props.refreshCalender(stDate, endDate)
    }
    
    
    return (
        <div style={{ padding: '10px' }}>
            <div>
                <div>
                    {createScheduleClicked ?
                        <div>
                            <div className='row'>
                               <div className='col-md-9'>
  <div style={{ fontWeight: 'bold' }}>Calender for Site: {props.selectedWR.site_name}</div>
  <div style={{ width: "100%" }}>
    <span style={{ marginRight: "20px" }}>Current workorder ID: {props.selectedWR.workorder_id}</span>
    {props.selectedWR.work_due_date && (
      <span>The work order due date is
        <strong style={(() => {
          const due = moment(props.selectedWR.work_due_date)
          if (due.isBefore(moment())) return { color: 'red' }
          return props.urgencyColor ? { color: props.urgencyColor } : {}
        })()}
          data-tip
          data-for="dueDateTooltip"
        >
          {' '}{moment(props.selectedWR.work_due_date).format('MMMM DD, YYYY hh:mm:ss A')}
        </strong>
      </span>
    )}
    {props.selectedWR.work_urgency && (
      <span style={{ marginLeft: "20px" }}>
        Work Urgency: 
        <strong style={{ 
          color: props.urgencyColor || 'inherit',
          marginLeft: "5px"
        }}>
          {props.selectedWR.work_urgency.toUpperCase()}
        </strong>
      </span>
    )}
  </div>
</div>
                                <div className='col-md-3'><Button variant="contained"
                                    onClick={() => setcreateScheduleClicked(false)}
                                    style={{ marginLeft: '5px', color: "#FFFFFF", border: 'none', background: "black" }}
                                    endIcon={<BackIcon></BackIcon>}>RETURN TO MY CALENDAR</Button></div>
                            </div>

                        </div> : <div>
                            {["SCHEDULED", "RESCHEDULED"].includes(props.currentWorkOrderOEventStatus) && (moment(props.currentEventObj.end).isAfter(moment().format('DD-MMM-YY'))) ?
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ width: "100%" }}>
      <div style={{ fontWeight: 'bold' }}>Calender for Site: {props.selectedWR.site_name}</div>
      <div style={{ width: "100%" }}>
        <span style={{ marginRight: "20px" }}>Current workorder ID: {props.selectedWR.workorder_id}</span>
        {props.selectedWR.work_due_date && (
          <span>The work order due date is
            <strong style={(() => {
              const due = moment(props.selectedWR.work_due_date)
              if (due.isBefore(moment())) return { color: 'red' }
              return props.urgencyColor ? { color: props.urgencyColor } : {}
            })()}
              data-tip
              data-for="dueDateTooltip"
            >
              {' '}{moment(props.selectedWR.work_due_date).format('MMMM DD, YYYY hh:mm:ss A')}
            </strong>
          </span>
        )}
        {props.selectedWR.work_urgency && (
          <span style={{ marginLeft: "20px" }}>
            Work Urgency: 
            <strong style={{ 
              color: props.urgencyColor || 'inherit',
              marginLeft: "5px"
            }}>
              {props.selectedWR.work_urgency.toUpperCase()}
            </strong>
          </span>
        )}
      </div>
    </div>
                                    <Button variant="contained"
                                        onClick={() => setcreateScheduleClicked(true)}
                                        style={{ marginLeft: '5px', color: "#FFFFFF", border: 'none', background: "black", float : 'right' }}
                                        endIcon={<AddIcon></AddIcon>}> Update Schedule</Button>
                                </div> : <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                     <div style={{ width: "100%" }}>
      <div style={{ fontWeight: 'bold' }}>Calender for Site: {props.selectedWR.site_name}</div>
      <div style={{ width: "100%" }}>
        <span style={{ marginRight: "20px" }}>Current workorder ID: {props.selectedWR.workorder_id}</span>
        {props.selectedWR.work_due_date && (
          <span>The work order due date is
            <strong style={(() => {
              const due = moment(props.selectedWR.work_due_date)
              if (due.isBefore(moment())) return { color: 'red' }
              return props.urgencyColor ? { color: props.urgencyColor } : {}
            })()}
              data-tip
              data-for="dueDateTooltip"
            >
              {' '}{moment(props.selectedWR.work_due_date).format('MMMM DD, YYYY hh:mm:ss A')}
            </strong>
          </span>
        )}
        {props.selectedWR.work_urgency && (
          <span style={{ marginLeft: "20px" }}>
            Work Urgency: 
            <strong style={{ 
              color: props.urgencyColor || 'inherit',
              marginLeft: "5px"
            }}>
              {props.selectedWR.work_urgency.toUpperCase()}
            </strong>
          </span>
        )}
      </div>
    </div>
                                    <Button variant="contained"
                                        onClick={() => setcreateScheduleClicked(true)}
                                        style={{ marginLeft: '5px', color: "#FFFFFF", border: 'none', background: "black" }}
                                        endIcon={<AddIcon></AddIcon>}>CREATE SCHEDULE</Button>
                                </div>}
                        </div>
                    }
                </div>
            </div>
            {/* {eventsLoading && <Loader color="#cd040b" size="35px" margin="4px" className="text-center" />} */}
            {createScheduleClicked ?
                <VSMinimalCreateScheduler
                    notifref={props.notifref}
                    isProject={props.isProject}
                    workORderInfo={props.workORderInfo}
                    workOrderDetailInfo={props.workOrderDetailInfo}
                    siteSwitchInfo={props.siteSwitchInfo}
                    currentEventObj={currentWorkOrderOEvent}
                    deviceInfo={props.deviceInfo}
                    setInitialValues={props.setInitialValues}
                    setValue={props.setValue}
                    typeWO={props.typeWO}
                    selectedWR={props.selectedWR}
                    onloadevents={props.onloadevents}
                    goBack={() => setcreateScheduleClicked(false)}
                    refreshCalender={refreshCalender}
                    workId={props.selectedWR.workorder_id} /> :
                <VSMinimalCalendar
                    onloadevents={props.onloadevents}
                    Unid={props.selectedWR.site_unid}
                    refreshCalender={refreshCalender} />}
        </div>
    )
}

export default VendorScheduleCalender;