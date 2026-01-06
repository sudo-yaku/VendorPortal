import React, { useState, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, momentLocalizer } from "react-big-calendar"
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from "moment"
import Loader from '../../Layout/components/Loader'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import ReactTooltip from 'react-tooltip'
import RefreshIcon from '@material-ui/icons/Refresh';
import CollapseButton from '@material-ui/icons/KeyboardArrowRight';
import { List, Map } from "immutable"
import { downloadVSFile, resetProps } from '../../VendorDashboard/actions'
import { getMetroRootSchedules } from "../../sites/actions";
import '../assets/collapse.css';
import RescheduleIcon from '../../Calendar/assets/Rescheduled.png'
import OpsComments from "./OpsComments"
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils'
import MessageBox from "../../Forms/components/MessageBox";

const VSMinimalCalendar = (props) => {
    const localizer = momentLocalizer(moment)
    const dispatch = useDispatch();
    const loginId = useSelector((state) => state.getIn(['Users', 'currentUser', 'loginId'], ''));
    const user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], Map()))
    let conflictEventsLoading =useSelector((state)=>state.getIn(["VendorDashboard", loginId, "conflictEventsforSite", "conflictEventsforSiteLoading"], false))

    let { onloadevents } = props;
    let momentGlobal = moment()
    const [parent, setparent] = useState('')
    const [currentEventObj, setcurrentEventObj] = useState({})
    const [momentDate, setmomentDate] = useState(moment())
    const [startDate, setstartDate] = useState('')
    const [endDate, setendDate] = useState('')
    const [events, setevents] = useState([])
    const [isTooltipActive, setisTooltipActive] = useState(false)
    const [eventStatusDisplay, seteventStatusDisplay] = useState('')
    const [isShowingSidebar, setisShowingSidebar] = useState(false)
    const [showEventOutOfLocation, setshowEventOutOfLocation] = useState(false)
    const [eventOutOfLoc, seteventOutOfLoc] = useState('')
    const [eventUpdateFlag, seteventUpdateFlag] = useState(false)
    const [todayClicked, settodayClicked] = useState(false)
    const [metroRootdateRanges, setMetroRootdateRanges] = useState([])
    const eventsLoading = useSelector((state) => state.getIn(["VendorDashboard", loginId, "events", "eventsDetaisLoading"], false))
    const eventsSiteLoading = useSelector((state) => state.getIn(["VendorDashboard", loginId, "eventsforSite", "eventsforSiteLoading"], false))
    const eventsError = useSelector((state) => state.getIn(["VendorDashboard", loginId, "events", "errors"], Map()))
    const siteDetails = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()))
    const metroRootSchedulesLoading = useSelector((state) => state.getIn(["Sites", "metroRootSchedules", "loading"], false))
    let formats = { dayFormat: "ddd MM/DD" }
    useEffect(() => {
        localStorage.setItem('moment', momentGlobal)
        if (onloadevents && onloadevents.length > 0) {
            setevents(onloadevents)
        } else {
            setevents([])
        }
    }, [])

    useEffect(() => {
        let siteData = siteDetails?.toJS()
        if (siteData?.site_unid == props.Unid && siteData?.root_drive) {
            dispatch(getMetroRootSchedules(siteData?.root_drive_ca)).then(res => {
                setMetroRootdateRanges(res?.schedules?.dateRanges || [])
            }).catch(err => {
                setMetroRootdateRanges([])
            })
        }
    }, [siteDetails])

    const fileDownload = (file_name, file_Id) => {
        dispatch(downloadVSFile(loginId, file_Id)).then(action => {
            if (action.filedata && action.filedata.file_data) {
                let blob = dataURItoBlob(action.filedata.file_data)
                startDownload(blob, file_name)
            }
        })
    }

    const rowsFiles = () => {
        const rows_files = []
        if (eventOutOfLoc.files && eventOutOfLoc.files.length > 0) {
            eventOutOfLoc.files.map(function (file) {
                let row1 = file['preview'] ? <a target="_blank" href={file['preview']} style={{ color: '#2196F3', cursor: 'pointer' }}>{file['file_name']}</a> : <span style={{ color: '#FFF', cursor: 'pointer' }} onClick={() => fileDownload(file['file_name'], file['file_Id'])}>{file['file_name']}</span>
                rows_files.push(
                    <span key={file['file_name']} className="file_tag_designe">
                        {row1}
                    </span>)
            })
        }
        return rows_files;
    }

    const newData = onloadevents && onloadevents.map(function (data) {
        data.start = moment(data.start).toDate()
        data.end = moment(data.end).toDate()
        return data
    })
    let currentWorkEvent = newData && newData.sort((a, b) => {
        const aPostedOn = a.comments && a.comments.length > 0 ? a.comments[a.comments.length - 1].postedDate : null;
        const bPostedOn = b.comments && b.comments.length > 0 ? b.comments[b.comments.length - 1].postedDate : null;
        if (aPostedOn && bPostedOn) {
         return Date.parse(bPostedOn) - Date.parse(aPostedOn);
        } else if (aPostedOn) {
         return 1;
        } else if (bPostedOn) {
         return -1;
        } else {
         return 0;
        }
    })[0];

    const metroRootEvents = metroRootdateRanges?.length > 0 ? metroRootdateRanges.map((range) => ({
        eventId: `banner-metro-root`,
        title: 'Root Metrics Active',
        status: 'BANNER',
        start: moment(range.start).toDate(),
        end: moment(range.end).endOf('day').toDate(),
        allDay: true
    })) : [];

    const EventData = currentWorkEvent ? [currentWorkEvent, ...metroRootEvents] : metroRootEvents;
    const onHover = (props) => {
        setisTooltipActive(true)
        setparent("test_tooltip" + props.event.eventId)
        seteventStatusDisplay(props.event.status)
    }
    const onLeave = () => {
        setisTooltipActive(false)
        seteventStatusDisplay('')
        setparent('')
    }
    const eventStyleGetter = (event) => {
        if (event.status === 'BANNER') {
            return {style: { backgroundColor: 'transparent',border: 'none',outline: 'none' }};
        }
        let style = { color: '#FFFFFF', backgroundColor: '#333' }
        return { style: style }
    }
    const getIcon = (status) => {
        switch (status) {
            case 'INPROGRESS':
                return (<div title="InProgress" style={{ display: 'inline' }}><i className="fas fa-chart-line fa-lg" style={{ color: 'rgb(234, 132, 23)' }} /></div>)
            case 'DONE':
                return (<div title="Done" style={{ display: 'inline' }}><i className="fa fa-thumbs-up fa-lg" style={{ color: '#009688' }} /></div>)
            case 'SCHEDULED':
                return (<div title="Scheduled" style={{ display: 'inline' }}><i className="fa fa fa-calendar fa-lg" style={{ color: 'rgb(3, 169, 244)' }} /></div>)
            case 'UNSCHEDULED':
                return (<div title="Unscheduled" style={{ display: 'inline' }}><i className="fa fa-times-circle fa-lg" style={{ color: '#D52B1E' }} /></div>)
            case 'RESCHEDULED':
                return (<div title="Rescheduled" style={{ display: 'inline' }}><img src={RescheduleIcon} style={{ height: '19px' }} /></div>)
            case 'BANNER':
                return null;
            default:
                return null;      
            }
    }

    const onSelectEvent = async (event) => {
        if (event.status === 'BANNER') return;
        
        await seteventOutOfLoc(event)
        await setisShowingSidebar(true)
        await setshowEventOutOfLocation(true)
    }
      const eventWeek = (props) => {
        if (props.event.status === 'BANNER') {            
            return (
                <div style={{
                    backgroundColor: 'orange',
                    color: 'white',
                    padding: '8px 12px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: '100%',
                    height: '25px',
                    minHeight: '25px',
                    border: 'none',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {props.event.title}
                </div>
            );
        }
        
        return (
            <span id={"test_tooltip" + props.event.eventId} style={{ textAlign: 'left', width: '100%', display: 'inline-block' }} onMouseEnter={onHover(props)} onMouseLeave={onLeave}>
                <strong>
                    {getIcon(props.event.status)}
                    {<i>&nbsp;&nbsp;&nbsp;</i>}
                    {props.event.title}
                </strong>
            </span>
        )
    }

    const previousClicked = (date, param) => {
        let moment2
        if (param == 'month') {
            moment2 = moment(date)
            setmomentDate(moment2)
            settodayClicked(false)
            refreshCalender(moment2)
        }
        localStorage.setItem('moment', moment2)
    }
    const nextClicked = (date, param) => {
        let moment2
        if (param === 'month') {
            moment2 = moment(date)
            setmomentDate(moment2)
            settodayClicked(false)
            refreshCalender(moment2)
        }
        localStorage.setItem('moment', moment2)
    }

    const todayDateClicked = () => {
        let moment1 = moment()
        setmomentDate(moment1)
        settodayClicked(true)
        localStorage.setItem('moment', moment1)
        refreshCalender(moment1)
    }
    const onSelectSlot = (slotInfo) => {
        let initializedStartData = moment(new Date(slotInfo.start)).set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0).toISOString();
        let initializedEndData = moment(new Date(slotInfo.end)).set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0).toISOString();
        setstartDate(initializedStartData)
        setendDate(initializedEndData)
    }

    const handleSidebarClose = () => setisShowingSidebar(false)
    const refreshCalender = (moment) => {
        let stDate = moment.startOf('month').format('YYYY-MM-DD')
        let endDate = moment.endOf('month').format('YYYY-MM-DD');
        props.refreshCalender(stDate, endDate)
    }
    const resetInfo = () => {
        dispatch(resetProps(["VendorDashboard", loginId, "events"], { eventsDetaisLoading: false, errors: '' }))
    }
    const styles = {
        container: {
            height: '400px',
            marginTop: '12px',
            width: isShowingSidebar ? '70% ' : '100%',
            transition: isShowingSidebar ? 'opacity 5s ease-in-out ' : 'opacity 5s ease',
            float: 'left'
        },
        sidebar: {
            width: isShowingSidebar ? '29% ' : '0%',
            height: isShowingSidebar ? '360px' : '0%',
            overFlowX: 'scroll',
            overFlowY: 'scroll',
            float: 'left',
            marginTop: '15px',
            marginLeft: '5px',
            display: isShowingSidebar ? 'inline-block ' : 'none',
            border: '1px solid',
            borderColor: '#D8DADA'
        },
        paper: {
            height: '100%',
            width: '100%',
            overflowX: 'auto',
            overFlowY: 'auto',
            marginLeft: '1px',
            marginRight: '1px',
            marginTop: '1px',
            marginBottom: '1px'
        }
    };
    return (
        <div>
            {(eventsLoading || eventsSiteLoading || conflictEventsLoading || metroRootSchedulesLoading) && <Loader color="#cd040b" size="35px" margin="4px" className="text-center" />}
            {eventsError && !(_.isEmpty(eventsError)) ? (<MessageBox messages={List([`Unable to fetch schedules, Please use Issue Report to report the error with the Work Order ID`])} />) : null}
            
            <a onClick={() => refreshCalender(momentDate)} className="navbar-brand pointer float-right" data-tip data-for="Refresh" >
                <RefreshIcon fontSize="large" style={{ fill: 'black' }}></RefreshIcon>
            </a>
            <ReactTooltip id="Refresh" place="top" effect="float">
                <span>Refresh Calender</span>
            </ReactTooltip>
            <div id="calendar" target='_collapseH' style={styles.container}>
                <Calendar
                    localizer={localizer}
                    selectable
                    popup={false}
                    events={EventData}
                    defaultDate={momentDate._d}
                    onSelectEvent={onSelectEvent}
                    onSelectSlot={onSelectSlot}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        event: eventWeek
                    }}
                    formats={formats}
                    messages={{ allDay: 'All Day' }}
                    onNavigate={(a,b,c) => { 
                        if(c == "PREV") {
                            previousClicked(a, b)
                        }
                        if(c == "NEXT") {
                            nextClicked(a, b)
                        }
                        if(c == "TODAY") {
                            todayDateClicked()
                        }
                    }}
                />
            </div>
            <div style={styles.sidebar}>
                <Paper style={styles.paper} >
                    <IconButton tooltip="collapse" tooltipPosition="bottom-right" onClick={handleSidebarClose} style={{ marginLeft: '-10px' }}>
                        <CollapseButton />
                    </IconButton>
                    {isShowingSidebar &&
                        <div style={{ overflowX: 'scroll', marginLeft: '10px' }}>
                            <tbody>
                                <div className="row">
                                    <div className="col-md-12 col-sm-12">
                                        <tr><p className="iopStandard" style={{ paddingTop: 15 }}><strong>Status:</strong> {eventOutOfLoc.status}</p> </tr>
                                        <tr><p className="iopStandard"><strong>Category:</strong> {eventOutOfLoc.category}</p> </tr>
                                        <tr><p className="iopStandard"><strong>Start Date:</strong> {moment(eventOutOfLoc.start).format('MM-DD-YYYY hh:mm A')} </p></tr>
                                        <tr><p className="iopStandard"><strong>End Date:</strong> {moment(eventOutOfLoc.end).format('MM-DD-YYYY hh:mm A')} </p></tr>
                                        {eventOutOfLoc.vendorId == user.toJS().vendor_id && 
                                            <>
                                            <tr><p className="iopStandard"><strong>Work ID:</strong> {eventOutOfLoc.workId} </p></tr>
                                            <tr><p className="iopStandard"><strong>Work Type:</strong> {eventOutOfLoc.workType} </p></tr>
                                            </>
                                        }
                                    </div>
                                </div>
                                {
                                eventOutOfLoc.vendorId == user.toJS().vendor_id &&
                                <>
                                <div className="row" >
                                    <div className="col-md-12 col-sm-12">
                                        <tr><p className="iopStandard"><strong>Description:</strong> {eventOutOfLoc.description} </p></tr>
                                        <tr><p className="iopStandard"><strong>Attachments:</strong></p>
                                            {eventOutOfLoc.files && eventOutOfLoc.files.length > 0
                                                ? rowsFiles() : <p className="iopStandard"> No Attachments </p>}</tr>
                                    </div>
                                </div>
                                <div className="row" >
                                    <div className="col-md-12 col-sm-12">
                                        <tr>
                                            <OpsComments comments={eventOutOfLoc.comments} />
                                        </tr>
                                    </div>
                                </div>
                                </>
                                }
                            </tbody>
                        </div>
                    }
                </Paper>
            </div>

        </div>
    )
}
export default VSMinimalCalendar;