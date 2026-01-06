import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { fetchSiteDetails, getMetroRootSchedules } from "../../sites/actions"
import { downloadVSFile,getConflictkirkeEventsForSite,getCalenderEventsForSite } from '../../VendorDashboard/actions'
import * as formActions from "../../Forms/actions"
import { Calendar, momentLocalizer } from "react-big-calendar"
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from "moment"
import './style.css'
import "react-big-calendar/lib/css/react-big-calendar.css"
import Modal from "../../Layout/components/Modal"
import Loader from '../../Layout/components/Loader'
import Next from '@material-ui/icons/NavigateNext'
import Before from '@material-ui/icons/NavigateBefore'
import Dialog from '@material-ui/core/Dialog'
import FlatButton from '@material-ui/core/Button'
import RaisedButton from '@material-ui/core/Button'
import VSCreateScheduler from "./VSCreateScheduler"
import * as utils from './utils'
import { List, Map } from "immutable"
import isEqual from 'lodash/isEqual'
var NotificationSystem = require('react-notification-system')
import RescheduleIcon from '../../Calendar/assets/Rescheduled.png'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import CollapseButton from '@material-ui/icons/KeyboardArrowRight';
import OpsComments from "./OpsComments"
import '../assets/collapse.css';
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/AlarmAdd'
import VSMinimalCalendar from "./VSMinimalCalendar"

const localizer = momentLocalizer(moment)

// const DATE_TIME_FORMAT = "MM-DD-YYYY hh:mm A"
let momentGlobal = moment()

export class VSCalendar extends React.Component {


    constructor(props) {
        super(props)
        this.EventWeek = this.EventWeek.bind(this)
        this.state = {
            eventStatusDisplay: '', parent: '', showCreateEvent: false, currentEventObj: null,
            currentOnCallEventObject: null, eventOutOfLoc: '', moment: moment(),
            startDate: '', endDate: '', showDialog: false, applyFreeze: null, showNCC: false, events: [], eventWorkIds: [],
            NCCEvent: null, isTooltipActive: false, showEventOutOfLocation: false, eventUpdateFlag: false,
            metroRootScheduleDateRanges: [], isMetroRootLoading: false, isCalendarEventsLoading: false
        }
    }

    renderLoading() {
        return (<
            Loader color="#cd040b"
            size="75px"
            margin="4px"
            className="text-center" />
        )
    }

    // shouldComponentUpdate() {
    //     return true
    // }

    onHover = (props) => {
        this.setState({ isTooltipActive: true, parent: "test_tooltip" + props.event.eventId, eventStatusDisplay: props.event.status })
    }
    onLeave = () => {
        this.setState({ isTooltipActive: false, eventStatusDisplay: '', parent: '' })
    }

    getIcon(status) {
        switch (status) {
            case 'INPROGRESS':
                return (<div title="InProgress" style={{ display: 'inline' }}><a><i className="fas fa-chart-line fa-lg" style={{ color: 'rgb(234, 132, 23)' }} /></a></div>)
            case 'DONE':
                return (<div title="Done" style={{ display: 'inline' }}><a><i className="fa fa-thumbs-up fa-lg" style={{ color: '#009688' }} /></a></div>)
            case 'SCHEDULED':
                return (<div title="Scheduled" style={{ display: 'inline' }}><a><i className="fa fa fa-calendar fa-lg" style={{ color: 'rgb(3, 169, 244)' }} /></a></div>)
            case 'UNSCHEDULED':
                return (<div title="Unscheduled" style={{ display: 'inline' }}><a><i className="fa fa-times-circle fa-lg" style={{ color: '#D52B1E' }} /></a></div>)
            case 'RESCHEDULED':
                return (<div title="Rescheduled" style={{ display: 'inline' }}><img src={RescheduleIcon} style={{height: '19px'}} /></div>)
            default:
                return <div></div>
        }
    }

    EventWeek(props) {
        if (props.event.eventType === 'metroRoot') {
            return (
                <span style={{ textAlign: 'center', width: '100%', display: 'inline-block', backgroundColor: '#FF8C00', color: '#FFFFFF', padding: '2px 4px', borderRadius: '3px' }}>
                    <strong>
                        {props.event.title}
                    </strong>
                </span>
            )
        }

        return (
            <span id={"test_tooltip" + props.event.eventId} style={{ textAlign: 'left', width: '100%', display: 'inline-block' }} onMouseEnter={this.onHover.bind(this, props)} onMouseLeave={this.onLeave.bind(this)}>
                <strong >
                    {this.getIcon(props.event.status)}
                    {<i>&nbsp;&nbsp;&nbsp;</i>}
                    {props.event.title}
                </strong>
            </span>
        )
    }

    componentDidMount() {
        localStorage.setItem('moment', momentGlobal)
        let { Unid, loginId, fetchSiteDetails, typeWO, onloadevents, getMetroRootSchedules } = this.props
        if (typeWO == 'Site') {
            this.setState({ isMetroRootLoading: true, isCalendarEventsLoading: true })
            fetchSiteDetails(loginId, Unid).then(res => {
                if(res?.type == 'FETCH_SITEDETAILS_SUCCESS' && res?.site?.root_drive && res?.site?.root_drive_ca?.trim() != '') {
                    getMetroRootSchedules(res?.site?.root_drive_ca).then(metroRootRes => {
                        this.setState({ 
                            metroRootScheduleDateRanges: metroRootRes?.schedules?.dateRanges || [],
                            isMetroRootLoading: false 
                        })
                    }).catch(err => {
                        this.setState({ metroRootScheduleDateRanges: [], isMetroRootLoading: false })
                    })
                } else {
                    this.setState({ isMetroRootLoading: false })
                }
            }).catch(err => {
                this.setState({ isMetroRootLoading: false })
            })
        }
        let eventWorkIds = []
        let tempeventWorkIDs = onloadevents.map((events) => {
            eventWorkIds.push(events.workId)
            return events.workId
        })
        eventWorkIds = [...new Set(eventWorkIds)]
        this.props.getConflictkirkeEventsForSite(this.props.loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD') , Unid)
        this.props.getCalenderEventsForSite(this.props.loginId, moment().startOf('month').format('YYYY-MM-DD'), moment().add(2, 'months').endOf('month').format('YYYY-MM-DD'), Unid).then(() => {
            this.setState({ isCalendarEventsLoading: false })
        }).catch(() => {
            this.setState({ isCalendarEventsLoading: false })
        })

        this.setState({ events: onloadevents, eventWorkIds: eventWorkIds })
        setTimeout(function () {
            document.getElementById('calendar').scrollIntoView({ behavior: 'smooth' })
        }, 200)
        this._notificationSystem = this.refs.notificationSystem

    }

    componentDidUpdate(prevProps){
        if (!(isEqual(this.props.events, prevProps.events))) {
            if (this.props.typeWO == 'Switch') {
                var filteredEvents = this.props.events.filter((event) => event.switchUnid == this.props.Unid && event.siteUnid == null)
                let eventWorkIds = []
                filteredEvents.map((events) => {
                    eventWorkIds.push(events.workId)
                    return events.workId
                })
                eventWorkIds = [...new Set(eventWorkIds)]
                this.setState({ events: filteredEvents, eventWorkIds: eventWorkIds })
            }
            if (this.props.typeWO == 'Site') {
                var filteredEvents = this.props.events.filter((event) => event.siteUnid == this.props.Unid)
                let eventWorkIds = []
                filteredEvents.map((events) => {
                    eventWorkIds.push(events.workId)
                    return events.workId
                })
                eventWorkIds = [...new Set(eventWorkIds)]
                this.setState({ events: filteredEvents, eventWorkIds: eventWorkIds })
            }
        }
    }

    componentWillUnmount() {
        this.hideCreateEditEventModal()
    }

    onSelectSlot(slotInfo) {
        let initializedStartData = moment(new Date(slotInfo.start)).set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0).isBefore(moment()) ? moment().add(1, 'h').set('minute', 0).set('second', 0).set('millisecond', 0) : moment(new Date(slotInfo.start)).set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0).toISOString();
        let initializedEndData = moment(new Date(slotInfo.start)).set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0).isSameOrBefore(moment()) ? moment().add(2, 'h').set('minute', 0).set('second', 0).set('millisecond', 0) : moment(new Date(slotInfo.start)).set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0).toISOString();
        this.setState({
            startDate: initializedStartData,
            endDate: initializedEndData,
        })
        this.showCreateEditEventModal()
    }

    showCreateEditEventModal(event = null) {
        if(!event){
        this.closeEventOutOfLocation()
        }
        this.setState({ currentEventObj: (event ? event : null) })
        this.setState({ showCreateEvent: true })
    }

    hideCreateEditEventModal() {
        this.closeEventOutOfLocation()
        this.setState({ showCreateEvent: false })
    }
    

    renderCreateEditEventModal() {
        let { site, typeWO, switchInfo } = this.props
        if (site) {
            var siteno = site.siteid
            var sitename = site.sitename
        }
        if (switchInfo) {
            var switchname = switchInfo.switch_name
        }
        let title = typeWO == 'Site' ? 'Work Order Scheduling-' + siteno + '-' + sitename : 'Work order Scheduling-' + switchname
        let currentEventFromCalendar = this.props.calendarEvents?.filter(event => event.eventId == this.state.currentEventObj?.eventId)
        currentEventFromCalendar = currentEventFromCalendar && currentEventFromCalendar.length > 0 ? currentEventFromCalendar[0] : null;

        return (
            <Modal large={true} title={title} handleHideModal={this.hideCreateEditEventModal.bind(this)} >
                <VSCreateScheduler {...this.props} siteInfo={site} switchInfo={switchInfo} currentEventObj={currentEventFromCalendar} eventWorkIds={this.state.eventWorkIds}
                    hideCreateEditEventModal={this.hideCreateEditEventModal.bind(this)} startDate={this.state.startDate} endDate={this.state.endDate} notifref={this._notificationSystem} />
            </Modal>
        )
    }

    hideVSCreateSchedulerEventModal() {
        if (this.modal) {
            this.modal.close()
            this.setState({ showOnCallEventModal: false })
        }
    }

    closeEventOutOfLocation = () => {
        this.setState({
            showEventOutOfLocation: false, eventOutOfLoc: '', eventUpdateFlag: false
        })
    }

    eventStyleGetter(event) {
        let style = { color: '#FFFFFF', backgroundColor: '#333' }
        if (event.eventType === 'metroRoot') {
            style = { color: '#FFFFFF', backgroundColor: '#FF8C00' }
        }
        return { style: style }
    }

    onSelectEvent(event) {
        if (event.eventType === 'metroRoot') { return }
        this.setState({
            showEventOutOfLocation: true, eventOutOfLoc: event, eventUpdateFlag: true
        })
    }

    openDialog(applyFreeze) {
        this.setState({
            showDialog: true, applyFreeze: applyFreeze
        })
    }

    closeDialog() {
        this.setState({
            showDialog: false
        })
    }

    closeDialogAndOpen() {
        this.setState({
            showDialog: false
        })
        this.showCreateEditEventModal()
    }

    onNavigate = (date, view) => {
        
        this.setState({ moment: moment(date), todayClicked: false, isCalendarEventsLoading: true });
        const newMonth = moment(date);
        const startDate = newMonth.startOf('month').format('YYYY-MM-DD');
        const endDate = newMonth.clone().add(2, 'months').endOf('month').format('YYYY-MM-DD');
        
        this.props.getConflictkirkeEventsForSite(this.props.loginId, startDate, endDate, this.props.Unid);
        this.props.getCalenderEventsForSite(this.props.loginId, startDate, endDate, this.props.Unid).then(() => {
            this.setState({ isCalendarEventsLoading: false })
        }).catch(() => {
            this.setState({ isCalendarEventsLoading: false })
        });
    }

    getCustomToolbar = (toolbar) => {
        this.toolbarDate = toolbar.date
        const goToDayView = () => {
            toolbar.onViewChange('day')
        }
        const goToWeekView = () => {
            toolbar.onViewChange('week')
        }
        const goToMonthView = () => {
            toolbar.onViewChange('month')
        }
        const goToBack = () => {
            let mDate = this.state.moment
            if (toolbar.view === "month") {
                mDate = mDate.subtract(1, 'M')
            } else if (toolbar.view === "week") {
                mDate = mDate.subtract(1, 'w')
            } else if (toolbar.view === "day") {
                mDate = mDate.subtract(1, 'd')
            }
            this.setState({
                moment: mDate, todayClicked: false
            })
        }
        const goToNext = () => {
            let mDate = this.state.moment
            if (toolbar.view === "month") {
                mDate = mDate.add(1, 'M')
            } else if (toolbar.view === "week") {
                mDate = mDate.add(1, 'w')
            } else if (toolbar.view === "day") {
                mDate = mDate.add(1, 'd')
            }
            this.setState({
                moment: mDate, todayClicked: false
            })
        }

        return (
            <div className="row">
                <div >
                    <div className="pull-left" style={{ marginLeft: '20px', paddingBottom: 5 }}>
                        <RaisedButton
                            // label="Day"
                            onClick={goToDayView}
                            style={{ minWidth: 25 }}
                            // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                        >Day</RaisedButton>
                        <RaisedButton
                            // label="Week"
                            onClick={goToWeekView}
                            style={{ minWidth: 25 }}
                            // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                        >Week</RaisedButton>
                        <RaisedButton
                            // label="Month"
                            onClick={goToMonthView}
                            style={{ minWidth: 25 }}
                            // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                        >Month</RaisedButton>
                    </div>
                </div>
                <div className="col-md-6 col-sm-8">
                    {toolbar.view != "month" ?
                        <div className="row pull-right" style={{ paddingBottom: 5 }}>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <FlatButton
                                // label={"Previous " + toolbar.view}
                                // labelPosition="after"
                                startIcon={<Before></Before>}
                                onClick={goToBack}
                                style={{ minWidth: 25 }}
                                // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                            >{"Previous " + toolbar.view}</FlatButton>
                            <FlatButton
                                // label={"Next " + toolbar.view}
                                // labelPosition="before"
                                endIcon={<Next />}
                                onClick={goToNext}
                                style={{ minWidth: 25 }}
                                // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                            >{"Next " + toolbar.view}</FlatButton>
                        </div>
                        : null}
                </div>
            </div >
        )
    }

    getDates(startDate, endDate) {
        let datesBwRange = {}
        let currentDate = moment(startDate)
        let stopDate = moment(endDate)
        while (currentDate <= stopDate) {
            datesBwRange[moment(currentDate).format('YYYY-MM-DD')] = []
            currentDate = moment(currentDate).add(1, 'days')
        }
        return datesBwRange
    }

    showCreateEditOnCallEventModal(event) {
        this.setState({ currentOnCallEventObject: (event ? event : null) })
        this.setState({ showOnCallEventModal: true })
    }

    renderCreateEditOnCallEventModal() {
        return (
            <Modal ref={modal => this.modal = modal} large={false} title={this.state.currentOnCallEventObject.location_id ? "Update On-Call Schedule" : "Create On-Call Schedule"} handleHideModal={this.hideVSCreateSchedulerEventModal.bind(this)} >
                <VSCreateScheduler {...this.props} currentOnCallEventObject={this.state.currentOnCallEventObject ? this.state.currentOnCallEventObject : null}
                    hideVSCreateSchedulerEventModal={this.hideVSCreateSchedulerEventModal.bind(this)} notifref={this._notificationSystem} />
            </Modal>
        )
    }

    fetch() {
        let moment1 = localStorage.getItem('moment')
        this.setState({
            moment: moment(moment1)
        })
    }

    previousClicked(param) {
        let moment1 = localStorage.getItem('moment')
        let moment2
        if (param == 'Month') {
            moment2 = moment(moment1).subtract(1, 'M')
            this.setState({
                moment: this.state.moment.subtract(1, 'M'), todayClicked: false
            })
        }
        if (param == 'Year') {
            moment2 = moment(moment1).subtract(1, 'y')
            this.setState({
                moment: this.state.moment.subtract(1, 'y'), todayClicked: false
            })
        }
        localStorage.setItem('moment', moment2)
    }

    nextClicked(param) {
        let moment1 = localStorage.getItem('moment')
        let moment2
        if (param === 'Month') {
            moment2 = moment(moment1).add(1, 'M')
            this.setState({
                moment: this.state.moment.add(1, 'M'), todayClicked: false
            })
        }
        if (param === 'Year') {
            moment2 = moment(moment1).add(1, 'y')
            this.setState({
                moment: this.state.moment.add(1, 'y'), todayClicked: false
            })
        }
        localStorage.setItem('moment', moment2)
    }

    todayClicked() {
        let moment1 = localStorage.getItem('moment')
        moment1 = moment()

        localStorage.setItem('moment', moment1)
        this.setState({
            todayClicked: true, moment: moment()
        })
        localStorage.setItem('moment', moment1)
    }

    renderViewUpdateEventModal() {
        return (
            utils.renderEventViewUpdateWithoutDialog(this.state.eventOutOfLoc, this.state.showEventOutOfLocation, this.closeEventOutOfLocation.bind(this), this.state.eventUpdateFlag, this.showCreateEditEventModal.bind(this, this.state.eventOutOfLoc), this.props.loginId, this.props.downloadVSFile)
        )
    }

    getMetroRootEvents() {
        const { metroRootScheduleDateRanges } = this.state
        if (!metroRootScheduleDateRanges || metroRootScheduleDateRanges.length === 0) {
            return []
        }

        return metroRootScheduleDateRanges.map((dateRange, index) => ({
            eventId: `metro-root-${index}`,
            title: 'Root Metrics Active',
            start: moment(dateRange.start).toDate(),
            end: moment(dateRange.end).endOf('day').toDate(),
            eventType: 'metroRoot',
            allDay: false,
            resource: 'metroRoot'
        }))
    }

    render() {
        let formats = {
            dayFormat: "ddd MM/DD"
        }
        if (this.state.isMetroRootLoading || this.state.isCalendarEventsLoading) {
            return this.renderLoading()
        }
        let { events } = this.state
        let newData = events.map(function (data) {
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
        
        // Get metro root events and combine with work events
        const metroRootEvents = this.getMetroRootEvents()
        const EventData = currentWorkEvent ? [currentWorkEvent, ...metroRootEvents] : metroRootEvents
        let { eventOutOfLoc, showEventOutOfLocation } = this.state
       const styles = {
        container: {
            height: '500px',
            paddingBottom: '5vh',
            width: showEventOutOfLocation ? '70% ' : '100%',
            transition: showEventOutOfLocation ? 'opacity 5s ease-in-out ' : 'opacity 5s ease',
            float: 'left'
        },
        sidebar: {
            width: showEventOutOfLocation ? '29% ' : '0%',
            height: showEventOutOfLocation ? '450px' : '0%',
            overFlowX: 'scroll',
            overFlowY: 'scroll',
            float: 'left',
            marginTop: '8vh',
            marginLeft: '5px',
            display: showEventOutOfLocation ? 'inline-block ' : 'none',
            border: '1px solid',
            borderColor: '#D8DADA',
            textAlign : 'left'
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
            <>
            <div id="calendar" target='_collapseH' style={styles.container}>
                <br /><br />
                {/* <div className="row" style={{ position: 'absolute', zIndex: 45, left: '50%', transform: "translate('-50%','0')" }}>
                    <span style={{ padding: '10px 15px' }} className="iopStandard">
                        <strong>{this.state.moment.format('MMMM YYYY')}</strong>
                    </span>
                </div>
                <div className="row" style={{ position: 'absolute', right: 0, zIndex: 40 }}>
                    <div className="col-md-12">
                        <RaisedButton
                            // label="today"
                            style={{ minWidth: 25 }}
                            onClick={this.todayClicked.bind(this)}
                            // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                        >Today</RaisedButton>
                        <RaisedButton
                            // label="Year"
                            startIcon={<Before></Before>}
                            style={{ minWidth: 25 }}
                            onClick={this.previousClicked.bind(this, 'Year')}
                            // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                        >Year</RaisedButton>
                        <RaisedButton
                            // label="Month"
                            startIcon={<Before></Before>}
                            style={{ minWidth: 25 }}
                            onClick={this.previousClicked.bind(this, 'Month')}
                            // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                        >Month</RaisedButton>
                        <RaisedButton
                            // label="Month"
                            // labelPosition="before"
                            endIcon={<Next></Next>}
                            style={{ minWidth: 25 }}
                            onClick={this.nextClicked.bind(this, 'Month')}
                            // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                        >Month</RaisedButton>
                        <RaisedButton
                            // label="Year"
                            // labelPosition="before"
                            endIcon={<Next></Next>}
                            style={{ minWidth: 25 }}
                            onClick={this.nextClicked.bind(this, 'Year')}
                            // labelStyle={{ textTransform: 'capitalize', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                        >Year</RaisedButton>
                    </div>
                </div> */}
                <Calendar
                    localizer={localizer}
                    selectable
                    popup={false}
                    events={EventData}
                    defaultDate={this.state.todayClicked ? moment()._d : this.state.moment._d}
                    onSelectEvent={this.onSelectEvent.bind(this)}
                    onSelectSlot={this.onSelectSlot.bind(this)}
                    onNavigate={this.onNavigate}
                    eventPropGetter={this.eventStyleGetter}
                    components={{
                        event: this.EventWeek
                    }}
                    formats={formats}
                    messages={{ allDay: 'All Day' }}
                />
                {this.state.showOnCallEventModal ? this.renderCreateEditOnCallEventModal() : null}
                {this.state.showCreateEvent ? this.renderCreateEditEventModal() : null}
                <NotificationSystem ref="notificationSystem" />
            </div>
                {showEventOutOfLocation && eventOutOfLoc && eventOutOfLoc.eventId &&
                    <div>
                        <div style={styles.sidebar}>
                            <Paper style={styles.paper} >
                                <IconButton tooltip="collapse" tooltipPosition="bottom-right" onClick={this.closeEventOutOfLocation} style={{ marginLeft: '-10px' }}>
                                    <CollapseButton />
                                </IconButton>
                                { !eventOutOfLoc.category.includes('Project') && this.state?.events[0]?.status !=="UNSCHEDULED" && <Button variant="contained"  
                                    onClick={() => this.showCreateEditEventModal(eventOutOfLoc)}
                                    style={{ margin: '12px', color: "#FFFFFF", border: 'none', background: "black", float : 'right' }}
                                    endIcon={<AddIcon></AddIcon>}>Update Schedule</Button>}
                                   { this.renderViewUpdateEventModal()}
                            </Paper>
                        </div>
                    </div>
                }
            </>
        )
    }
}

function stateToProps(state) {

    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let user = state.getIn(["Users", "entities", "users", loginId], Map())
    let isEventsLoading = state.getIn(["VendorDashboard", loginId, 'events', 'eventsDetaisLoading'], false)
    let events = state.getIn(["VendorDashboard", loginId, "events", "eventsDetails"], Map())
    events = events.toJS().getEventDetails
    let site = state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List())
    site = site.toJS()
    let calendarEvents = state.getIn(["VendorDashboard", loginId, "eventsforSite", "eventsforSiteDetails"], Map())
    calendarEvents = calendarEvents?.toJS()?.getCalenderEventsForSite ? calendarEvents?.toJS()?.getCalenderEventsForSite?.data : [];
    return {
        loginId,
        siteDetaisLoading: state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false),
        isEventsLoading: isEventsLoading,
        site,
        user,
        events,
        calendarEvents
    }
}

export default connect(stateToProps, { ...formActions, fetchSiteDetails, getMetroRootSchedules, getConflictkirkeEventsForSite,getCalenderEventsForSite,downloadVSFile })(VSCalendar)
