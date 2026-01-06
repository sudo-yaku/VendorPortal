import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from "moment"
import { List, Map } from "immutable"
import Dropzone from 'react-dropzone'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import TextField from '@material-ui/core/TextField'
import { submitScheduleRequest, 
    resetProps, fetchEventDetails, 
    updateScheduleRequest, updateWorkorderStatus, fetchWorkOrder
} from "../../VendorDashboard/actions"
import VScheduleFileUpload from '../../VendorDashboard/components/VScheduleFileUpload'
import MessageBox from '../../Forms/components/MessageBox'
import Loader from '../../Layout/components/Loader'
import '../../../node_modules/react-datetime/css/react-datetime.css'
import '../assets/style.css'
import OpsComments from './OpsComments'
import { ivrEmailNotify } from '../../Users/actions'
import { ivrEmailNotification } from '../../Users/schema'
import { saveElogByWorkOrderID, saveElogCommentByWorkOrderID, fetchElogByWorkOrderID } from '../../Elog/actions'
import {getHolidayEvents} from "../../sites/actions"
import { makeStyles } from '@material-ui/core/styles';
const DATE_TIME_FORMAT = "MM-DD-YYYY hh:mm A"
const formName = "CreateVScheduleRequestForm"

const useStyles = makeStyles(theme => ({
textField:{
    '& .MuiInputBase-input':{
        height:'0.1vh'
    }
}
}))

const VSMinimalCreateScheduler = (props) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const labelStyle = { "marginTop": "8px", "marginBottom": "8px", "color": "black", "fontSize": "1em", "float": "left" }
    let loginId = useSelector(state => {return state.getIn(["Users", "currentUser", "loginId"])});
    let user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], Map()))
    let device_info = useSelector(state => state.getIn(["VendorDashboard", "workOrderDetail", "deviceInfo"], List()))
    let allworkorders = useSelector(state => state.getIn(["VendorDashboard", loginId, "allworkorders"], Map()))
    let userFullName = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "name"], ""))
    let currentValues = useSelector(state => state.getIn(["Forms", formName, "currentValues"], List()))
    let isLoading = useSelector(state => {return state.getIn(["VendorDashboard", loginId, 'schedulerequest', 'isloading'])})
    let errorsMessage = useSelector(state => state.getIn(["VendorDashboard", loginId, 'schedulerequest', 'errors'], Map()))
    let savedMessage = useSelector(state => state.getIn(["VendorDashboard", loginId, 'schedulerequest', "success"], Map()))
    let eventsDetaisLoading = useSelector(state => state.getIn(["VendorDashboard", loginId, "events", "eventsDetaisLoading"], false))
    let conflictEvents =useSelector(state => state.getIn(["VendorDashboard", loginId, "conflictEventsforSite", "conflictEventsforSiteDetails"], Map()))
    conflictEvents=conflictEvents?.toJS()?.getConflictEventDetails ? conflictEvents?.toJS()?.getConflictEventDetails?.data : [];
    let site = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()))
    let config = useSelector(state => state.getIn(['Users', 'configData', 'configData'], List()))
    savedMessage = savedMessage && typeof savedMessage == "object" ?  savedMessage.toJS() : savedMessage;
    errorsMessage = errorsMessage && errorsMessage?.toJS();
    let configData = config && config.toJS() && config.toJS().configData;
    let allowKirkeFreesEventWO = configData && configData?.find(e => e.ATTRIBUTE_NAME === "ALLOW_KIRKE_FREEZE_EVENTS_WO")?.ATTRIBUTE_VALUE;
    const [startDate, setDate] = useState('')
    const [oldData, setoldData] = useState('')
    const [holidays, setHolidays] = useState([])
    const [title, settitle] = useState('')
    const [description, setdescription] = useState('')
    const [ISOstart, setISOstart] = useState('')
    const [ISOend, setISOend] = useState('')
    const [endDate, setendDate] = useState('')
    const [momentEndDate, setMomentEndDate] = useState(null)
    const [momentStartDate, setMomentStartDate] = useState(null)
    const [startslotBookedError, setstartslotBookedError ] = useState(null)
    const [endslotBookedError, setendslotBookedError] = useState(null)
    const [startDateValErr, setstartDateValErr] = useState(null)
    const [endDateValErr, setendDateValErr] = useState(null)
    const [statusState, setstatusState] = useState('In Progress')
    const [isChangeStatusMessageShown, setisChangeStatusMessageShown] = useState(false)
    const [isInfoMessageShown, setisInfoMessageShown] = useState(false)
    const [isStatusChangeDone, setisStatusChangeDone] = useState(false)
    const [scheduleStatus, setscheduleStatus] = useState('Request For')
    const [statusMessage, setstatusMessage] = useState('UNSCHEDULED')
    const [filesData, setfilesData] = useState([])
    const [workIDarray, setworkIDarray] = useState([])
    const [isAlreadyScheduled, setisAlreadyScheduled] = useState(false)
    const [isFileSizeError, setisFileSizeError] = useState(false)
    const [elogFlag, setelogFlag] = useState(false)
    const [eLogInfoIds, seteLogInfoIds] = useState(null)
    const [comments,setComments]=useState(null);
    const [openCalenderStart, setOpenCalenderStart] = useState();
    const [showStartDateInvalid, setshowStartDateInvalid] = useState(false);
    const [showEndDateInvalid, setshowEndDateInvalid] = useState(false);
    const [kirkeFreezName, setkirkeFreezName] = useState("")
    const [showError, setShowError] = useState("")
    
    useEffect(() => {
        let { currentEventObj, startDate, endDate, work } = props
        dispatch(getHolidayEvents()).then(res => {
            if (res.type === 'FETCH_HOLIDAYEVENTS_SUCCESS') {
                const fastHolidays = res.holidayEvents && res.holidayEvents.length > 0 ? res.holidayEvents.map((hol) => hol.HOLIDAY_DATE && hol.HOLIDAY_DATE.length > 10 && hol.HOLIDAY_DATE.substring(0, 10)) : []
                setHolidays(fastHolidays)
            }else{
                setHolidays([])
            }
        })
        
        if (currentEventObj && currentEventObj.end && currentEventObj?.status !== "UNSCHEDULED" && (moment(currentEventObj.end).isAfter(moment().format('DD-MMM-YY')))) {
            setoldData(currentEventObj)
            settitle(currentEventObj?.title)
            setdescription(currentEventObj.description)
                        setISOstart(currentEventObj.start ? moment(currentEventObj.start).toISOString() : moment(startDate).toISOString())
            setISOend(currentEventObj.end ? moment(currentEventObj.end).toISOString() : moment(endDate).toISOString())
            setMomentStartDate(currentEventObj.start ? moment(currentEventObj.start) : moment(startDate))
            setMomentEndDate(currentEventObj.end ? moment(currentEventObj.end) : moment(endDate))
            if (currentEventObj.status == 'INPROGRESS') {
                setstatusState('Done')
                setisChangeStatusMessageShown(true)
            }
            if (currentEventObj.status == 'SCHEDULED' && (moment(props.currentEventObj.end).isAfter(moment().format('DD-MMM-YY')))) {
                setisChangeStatusMessageShown(true)
                setscheduleStatus('Update')
            }
            if (currentEventObj.status == 'RESCHEDULED' && (moment(props.currentEventObj.end).isAfter(moment().format('DD-MMM-YY')))) {
                setisChangeStatusMessageShown(true)
                setscheduleStatus('Update')
            }
            let workIDarray = []
            workIDarray.push({ label: currentEventObj.workId, value: currentEventObj.workId })
            setworkIDarray(workIDarray)
            // Edit or Add new
            updateForm()
        } else {
            initializeForm(false)
            let momenstStartDateDefault = moment().set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0).isBefore(moment()) ? moment().add(1, 'h').set('minute', 0).set('second', 0).set('millisecond', 0) : moment().set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0)
            let momentEndDateDefault = moment().set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0).isSameOrBefore(moment()) ? moment().add(2, 'h').set('minute', 0).set('second', 0).set('millisecond', 0) : moment().set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0)
            setDate(startDate ? validateDateStr(startDate) : momenstStartDateDefault)
            setendDate(endDate ? validateDateStr(endDate) : momentEndDateDefault)
            setISOstart(startDate ? validateDateStr(startDate) : momenstStartDateDefault)
            setISOend(endDate ? validateDateStr(endDate) : momentEndDateDefault)
            setMomentStartDate(momenstStartDateDefault)
            setMomentEndDate(momentEndDateDefault)
            if (momentEndDateDefault.isSameOrBefore(momenstStartDateDefault)) {
                setendDateValErr('End Date Time should be more than Start Date Time')
            } else {
                setendDateValErr(null)
            }
        }
        if(currentEventObj?.status === "UNSCHEDULED") {
            let momenstStartDateDefault = moment().set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0).isBefore(moment()) ? moment().add(1, 'h').set('minute', 0).set('second', 0).set('millisecond', 0) : moment().set('hour', 8).set('minute', 0).set('second', 0).set('millisecond', 0)
            let momentEndDateDefault = moment().set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0).isSameOrBefore(moment()) ? moment().add(2, 'h').set('minute', 0).set('second', 0).set('millisecond', 0) : moment().set('hour', 17).set('minute', 0).set('second', 0).set('millisecond', 0)
            setDate(momenstStartDateDefault)
            setendDate(momentEndDateDefault)
        }  
        //method trigger to open the calender or not
        openCalenderChange();
        return () => { resetInfo() };
    }, [])

    useEffect(() => {
        let totalFileSize = filesData.reduce((a, b) => +a + +b.file_size, 0);
        if (totalFileSize > 49000000) {
            setisFileSizeError(true)
        }
        if (totalFileSize < 49000000) {
            setisFileSizeError(false)
        }

    }, filesData.length)

    useEffect(() => {
        let { setInitialValues, setValue } = props
                setValue(formName, 'description', props.workOrderDetailInfo.get("work_scope") || props.selectedWR.project_name)
    }, [props.workOrderDetailInfo.get("work_scope") , props.selectedWR.project_name])

    useEffect(() => {
        let events = props.onloadevents && props.onloadevents.filter((event) => {
            return event.workId != (props.selectedWR.workorder_id || currentValues.get('workId'))
        })

        let eventsData = [];
        eventsData = [...events, ...conflictEvents]
        //end date should be morethan the current end time
        if (openCalenderStart == false) {
            //let endDiff = moment(momentEndDate, 'MM-DD-YYYY hh:mm a').diff(momentDate)
            let endDateFromProps = props.currentEventObj?.end ? moment(props.currentEventObj.end) : null;
            if (momentEndDate && momentEndDate.isBefore(endDateFromProps)) {
                setendDateValErr('End Date Time should not be less than the current End Date Time')
            } else if (momentEndDate && momentEndDate.isBefore(moment().format(DATE_TIME_FORMAT))) {
                setendDateValErr('End Date Time should not be less than the current Date Time')
            } else {
                setstartDateValErr(null);
                setendDateValErr(null)
            }
        }

        if (momentStartDate && momentStartDate.isSameOrBefore(moment())) {
            setstartDateValErr('Start Date Time should be more than Current Date Time')
        } else {
            setstartDateValErr(null)
        }

        if (momentEndDate && momentEndDate.isSameOrBefore(momentStartDate)) {
            setendDateValErr('End Date Time should be more than Start Date Time')
        }else if(momentEndDate && momentEndDate.isSameOrBefore(moment())) {
            setendDateValErr('End Date Time should not be less than the Current Date Time')
        } else {
            setendDateValErr(null)
        }

        for (const event of eventsData) {
            if (momentStartDate && (momentStartDate.isBetween(moment(event.start), moment(event.end), null, '[]') || (event?.conflictKirkeData && momentStartDate.isBetween(moment(event?.conflictKirkeData?.start), moment(event?.conflictKirkeData?.end), null, '[]')))) {
                if(allowKirkeFreesEventWO === 'No') {
                    setstartslotBookedError('Time slot is already booked')
                }
                let eventName = `Verizon Network freeze event: ${event?.name}, From Date- ${moment(event?.start).format(DATE_TIME_FORMAT)} To Date- ${moment(event?.end).format(DATE_TIME_FORMAT)}`
                setkirkeFreezName(eventName)
                return false;
            } else {
                setstartslotBookedError(null)
                setkirkeFreezName('')
            }
            if (momentEndDate && (momentEndDate.isBetween(moment(event.start), moment(event.end), null, '[]') || (event?.conflictKirkeData && momentStartDate.isBetween(moment(event?.conflictKirkeData?.start), moment(event?.conflictKirkeData?.end), null, '[]')))) {
                if(allowKirkeFreesEventWO === 'No') {
                    setendslotBookedError('Time slot is already booked')
                }
                let eventName = `Verizon Network freeze event: ${event?.name}, From Date - ${moment(event?.start).format(DATE_TIME_FORMAT)} To Date- ${moment(event?.end).format(DATE_TIME_FORMAT)}`
                setkirkeFreezName(eventName)
                return false;
            } else {
                setendslotBookedError(null)
                setkirkeFreezName('')
            }
        }
    }, [momentStartDate, momentEndDate]);

    const initializeForm = (isTriggerFromClear) => {
        let { setInitialValues, setValue, isProject } = props
        setInitialValues(formName, {})
        setValue(formName, 'category', { name: "category", label: isProject ? "Capital Project" : "Vendor Work Order", value: isProject ? "Capital Project" : "Vendor Work Order" })
        setValue(formName, 'workId', '')
        if(props.selectedWR && props.selectedWR.workorder_id)
        setValue(formName, 'workId', props.selectedWR.workorder_id)
        setValue(formName, 'workType', '')
        setValue(formName, 'description', currentValues.get('description') ? currentValues.get('description') : props.workOrderDetailInfo.get("work_scope") ? props.workOrderDetailInfo.get("work_scope") : props.selectedWR.project_name ? props.selectedWR.project_name: '')
        setValue(formName, 'newcomment', currentValues.get('newcomment') ? currentValues.get('newcomment') : '')
        if (isTriggerFromClear) {
            setDate('')
            setendDate('')
            settitle('')
            seteventStatusId('')
            setfilesData([])

            setValue(formName, 'start', '')
            setValue(formName, 'end', '')
        }
    }

    const setValue = (field, value) => {
        props.setValue(formName, field, value)
    }

    const updateForm = () => {
        let { currentEventObj, setInitialValues, setValue } = props

        if (currentEventObj.category) {
            setValue(formName, 'category', currentEventObj.category)
        }
        if (currentEventObj.files) {
            if (currentEventObj.files.length > 0 || currentEventObj.files.size > 0) {
                setfilesData(currentEventObj.files)
            }
        }
        if (currentEventObj.workId) {
            setValue(formName, 'workId', currentEventObj.workId)
        }
        if (currentEventObj.workType) {
            setValue(formName, 'workType', currentEventObj.workType)
        }
        // if (currentEventObj.description) {
        //     setValue(formName, 'description', this.props.workOrderDetailInfo.get("work_scope"))
        // }
        if (currentEventObj.comments) {
            setValue(formName, 'comments', '')
            setValue(formName, 'newcomment', '')
        }

        setInitialValues(formName, {})
        for (let key in currentEventObj) {
            setValue(formName, key, currentEventObj[key])
            if (key == 'start') {
                setDate(validateDateStr(currentEventObj[key]))
                let isoRepresentation = new Date(currentEventObj[key]).toISOString()
                setMomentStartDate(moment(isoRepresentation))
            }
            if (key == 'end') {
                setendDate(validateDateStr(currentEventObj[key]))
                let isoRepresentation = new Date(currentEventObj[key]).toISOString()
                setMomentEndDate(moment(isoRepresentation))
            }
        }

    }

    const validateDateStr = (dateObj) => {
        let result = ''
        if (dateObj) {
            result = moment(dateObj).format(DATE_TIME_FORMAT)
        }
        return result
    }

    const isValidDate = (current, isEndDate) => {
        let yesterday = moment().subtract(1, 'day');
        if(isEndDate){
            //end date should be greater in extend scenario
            if(openCalenderStart==false){
                return !(current.isAfter(moment().format(DATE_TIME_FORMAT)))
            }else{
            return !(current.format('MM-DD-YYYY') == momentStartDate?.format('MM-DD-YYYY') || current.isAfter(momentStartDate))
            }
        }else{
            return !(current.isAfter(yesterday) )
        }
    }

    const onEventDateChange = (isFromdate, milisecs) => {
        if (typeof milisecs === 'object') {
            let isoRepresentation = new Date(milisecs).toISOString()
            // let defaultHours = isFromdate ? '08' : '17'
            let momentDate = moment(isoRepresentation)
            if (isFromdate) {
                // setendDate(null)
                // setMomentEndDate(null)
                // setISOend(null)
                setDate(momentDate.format(DATE_TIME_FORMAT))
                setMomentStartDate(momentDate)
                setISOstart(isoRepresentation)
                if (endDate) {
                    let diff = moment(endDate, 'MM-DD-YYYY hh:mm a').diff(momentDate)
                    if (diff < 0) {
                        setstartDateValErr('Start Date Time should be less than End Date Time')
                    } else {
                        setstartDateValErr(null)
                        setendDateValErr(null)
                    }
                }
            } else {
                if (startDate) {
                    if (momentDate && momentDate && momentDate.isSameOrBefore(momentStartDate)) {
                        setendDateValErr('End Date Time should be more than Start Date Time')
                    } else {
                        setstartDateValErr(null) 
                        setendDateValErr(null)
                    }
                    setMomentEndDate(momentDate)
                    setendDate(momentDate.format(DATE_TIME_FORMAT))
                    setISOend(isoRepresentation)
                }
            }
        }
    }

    const onAttachRemove = (index) => {
        setfilesData(filesData.filter((_, i) => i !== index))
    }

    const onFileDrop = (files) => {
        if (savedMessage.size || errorsMessage.size || savedMessage.length > 0 || errorsMessage.length > 0) {
            resetInfo()
        }
        isFileSizeError == false && files.forEach(file => {
            if (file['size'] > 0) {
                let reader = new window.FileReader()
                reader.onload = function () {
                    let dataURL = reader.result
                    let droppedFile = {
                        file_name: file['name'],
                        file_type: file['type'],
                        file_size: file['size'] + '',
                        file_data: dataURL,
                        preview: file['preview'],
                        filename: file['name'],
                        last_modified: file['lastModifiedDate']
                    }
                    setfilesData(filesData.concat(droppedFile))
                } 
                reader.readAsDataURL(file)
            }
        })
    }

    const onDataChange = (e) => {
        if (savedMessage.size || errorsMessage.size || savedMessage.length > 0 || errorsMessage.length > 0) {
            resetInfo()
        }
        if (e && e.target) {
            setComments(e.target.value);
            if (e.target.name) { setValue(e.target.name, e.target.value) }
        } else {
            setValue(e.name, e.value)
        }
    }
    const onDescriptionChange = (e) => {
        if (e && e.target) {
            if (e.target.name) { setValue(e.target.name, e.target.value) }
        } else {
            setValue(e.name, e.value)
        }
    }

    const changeStatus = (changedVal) => {
        let self = this
        if (changedVal == 'inprogress') {
            setValue("status", 'INPROGRESS')
            setisChangeStatusMessageShown(false)
            setisInfoMessageShown(true)
            setisStatusChangeDone(true)
        }
        if (changedVal == 'done') {
            setValue("status", 'DONE')
            setisChangeStatusMessageShown(false)
            setisInfoMessageShown(true)
            setisStatusChangeDone(true)
        }
        if (changedVal == 'dismiss') {
            setisChangeStatusMessageShown(false)
            setisInfoMessageShown(true)
        }
        setTimeout(function () {
            setisInfoMessageShown(true)
        }, 2500)
    }

    const onSubmitVendorStatus = (status, workId) => {
        let { typeWO } = props
        let unscheduledWorkTypes = [];
        let unscheduledWork = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "UNSCHEDULED_SPLIT_WOTYPE").ATTRIBUTE_VALUE
        if(unscheduledWork){
          unscheduledWorkTypes = unscheduledWork && unscheduledWork.split(",");
        }
        allworkorders = allworkorders.toJS()
        let siteUnid = typeWO == 'SWITCH' ? null : props.siteSwitchInfo.site_unid
        let switchUnid = typeWO == 'SWITCH' ? props.siteSwitchInfo.switch_unid : null
        let selectedWorkOrder = []
        selectedWorkOrder = allworkorders.filter((el) => {
            return el.workorder_id == workId
        })
        let stDate = moment().subtract(7, 'days')
        let edDate = moment()
        let meta_univ_id = selectedWorkOrder[0].meta_universalid
        let vendorStatus = currentValues.toJS().status == 'DONE' ? 'Work Completed' : currentValues.toJS().status == 'INPROGRESS' ? 'In Progress' : status
        let o = {
            "vendor_status": vendorStatus,
            "userid": loginId,
            "vendor_wo_unid": meta_univ_id,
            "site_unid": typeWO == 'SWITCH' ? switchUnid : siteUnid
        }

        dispatch(updateWorkorderStatus(o, loginId, meta_univ_id, userFullName)).then((action) => {
            if (action.type === 'UPDATE_WORKORDER_STATUS_SUCCESS') {
                isStatusChangeDone ? sendEmailNotificationForVendorStatus(vendorStatus) : null;
                dispatch(fetchWorkOrder(loginId, stDate.format('YYYY-MM-DD'), edDate.format('YYYY-MM-DD'), null, null, unscheduledWorkTypes))
            }
        })
    }

    const formElogPostRequest = (values) => {
       let sites = props.siteSwitchInfo
        return {
            "oprtnType": "I",
            "shift": "Day",
            "sendemail": false,
            "privacyflag": "Public",
            "oncall": "No",
            "red_flag": "No",
            "contenttext": `Action: ${values.status} on site work for ${values.category} : ${values.workId} From: ${values.start} To: ${values.end}`,
            "files": [],
            "elogtype": sites && sites.sitetype ? sites.sitetype : 'CELL_SITE',
            "login_id": loginId,
            "universalid": values && values.siteUnid,
            "unvalue": values && values.siteName,
            "meta_createdname": '',
            "recorded_on": moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A'),
            "subtype": "WORKORDER",
            "subtypename": "WORKORDER",
            "subtypeid": values && values.workId,
            "fromsystem": "IOPLite",
            "subject": "",
            "element": "",
            "emailid": "",
            "worktype": "Vendor",
            "vendor": `${values && values.vendorId}-${values && values.vendorCompanyName}`
        }
    }
    
    const saveElogComments = (value) => {
        let elogCommentsInput = {
            "eLogInfoId": eLogInfoIds ? eLogInfoIds : props.eLogInfoId,
            "comments": `Action: ${value.status} on site work for ${value.category} : ${value.workId} From: ${value.start} To: ${value.end} `,
            "meta_createdby": loginId,
            "meta_lastupdatedate": moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A'),
            "meta_createdname": '',
            "from_system": "IOPLite",
            "fileData": List()
        }
        dispatch(saveElogCommentByWorkOrderID(loginId, elogCommentsInput)).then(action => {
            if (action && action.type === 'FETCH_SAVE_ELOGCOMMENT_SUCCESS') {
                props.notifref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "Readings submission to Elog comments succesful"
                })
            }
        })
    }
    const saveElog = (values) => {
        let elogInput = formElogPostRequest(values)
        dispatch(saveElogByWorkOrderID(loginId, elogInput)).then(action => {
            if (action.type === 'FETCH_SAVE_ELOG_SUCCESS') {
                seteLogInfoIds(action.elogsavemsg.eLogInfoId)
                setelogFlag(true)
                props.notifref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "Readings submission to Elog succesful"
                })
            }
        }).catch(e => {
            props.notifref.addNotification({
                title: 'error',
                position: "br",
                level: 'error',
                message: "Readings Submission to Elog failed"
            })
        })

    }
    const fetchElogData = (values) => {
        let vendor_id = `${values && values.vendorId}-${values && values.vendorCompanyName}`
        dispatch(fetchElogByWorkOrderID(vendor_id, values.workId))
            .then(async (action) => {
                if (action && action.type === 'FETCH_ELOG_SUCCESS') {
                    if (action && action.elogs && action.elogs.length > 0) {
                        setelogFlag(true)
                        seteLogInfoIds(action.elogs[0].eLogInfoId)
                        saveElogComments(values)
                    }
                    else {
                        seteLogInfoIds(0)
                        setelogFlag(false)
                        saveElog(values)
                    }
                }
            })
    }

    //open or disable the calender if the start date is same as current date or passed the current date 
    const openCalenderChange = () => {
        let startDate = props.currentEventObj?.start ? moment(props.currentEventObj.start).format(DATE_TIME_FORMAT) : null;
        let currentDate = moment().format(DATE_TIME_FORMAT);
        let woStatus = props?.currentEventObj?.status;
        if (woStatus != undefined && (woStatus == "SCHEDULED" || woStatus == "RESCHEDULED")) {
            if(startDate < currentDate){
                setOpenCalenderStart(false)
            }
            if(endDate < currentDate) {
                setOpenCalenderStart(null)
            }
        } 
    }
    const getRequiredFieldsError = () => {
        let { siteSwitchInfo } = props
        let requiredFields = ['site_unid','sitename']
        let errors = []
        requiredFields.forEach((field) => {
            if (!siteSwitchInfo || !siteSwitchInfo[field] || siteSwitchInfo[field] === null || siteSwitchInfo[field] === '') {
                errors.push(field)
            }
        })
        return errors;
    }
    const onSubmit = (cancelSchedule = false) => {
        let errors = getRequiredFieldsError()
        if (errors?.length > 0) {
            setShowError('Site information is missing due to network latency, Please close this window and retry again.')
            return
        }
                let { siteSwitchInfo, typeWO, workORderInfo, isProject, selectedWR } = props
        let userDetails = user? user?.toJS() :{}
        //let type = typeWO == 'SWITCH' ? 'switch' : 'cell'
        let workOrderDetailInfo = props.workOrderDetailInfo.toJS()
        let engineerLoginId = workOrderDetailInfo && workOrderDetailInfo.requested_by
        let ticketNumber = workOrderDetailInfo && workOrderDetailInfo.wb360_id
        let ticketSource = "WB360"
        let vendorId = userDetails.vendor_id
        let vendorStatus = 'Scheduled'
        let techName = userDetails.lname + ', ' + userDetails.fname
        const fileData = filesData

        let values = currentValues.toJS()
        if (typeof values.category == 'object') {
            values.category = values.category.value
        }
        values.description = currentValues.get('description').substring(0, 498)
        values.start = momentStartDate;
        values.end = momentEndDate;
        values.workId = props.selectedWR.workorder_id
        values.newcomment = currentValues.get('newcomment').substring(0, 999)
        values.files = fileData
        if(isProject && scheduleStatus!='Update'){
            values.mop = fileData
        }
        values.market = siteSwitchInfo.market
        values.submarket = siteSwitchInfo.region
        values.siteNo = typeWO == 'SWITCH' ? null : parseInt(siteSwitchInfo.siteid)
        values.siteName = typeWO == 'SWITCH' ? null : siteSwitchInfo.sitename
        values.siteUnid = typeWO == 'SWITCH' ? null : siteSwitchInfo.site_unid
        values.switchUnid = typeWO == 'SWITCH' ? siteSwitchInfo.switch_unid : null
        values.switchName = typeWO == 'SWITCH' ? siteSwitchInfo.switch_name : workORderInfo && workORderInfo.project_type ? siteSwitchInfo.switch : workORderInfo.get('switch')
        values.vendorCompanyName = userDetails.vendor_name
        values.vendorTechName = techName
        values.vendorId = vendorId
        values.loginId =  loginId;
        values.loginName = techName
        let devices = device_info;
        let deviceInfo = values.category == "Vendor Work Order" ? devices && JSON.parse(devices)  ? JSON.parse(devices) : null : null;
        let woDevices = deviceInfo && deviceInfo.length > 0 && deviceInfo.map(e => {
            return {
                "deviceId": e.tid,
                "devicename": e.name,
                "devicevendor": e.vendor
            }
        })
        if (scheduleStatus != 'Update') {
            values.status = 'SCHEDULED'
            values.engineerLoginId = isProject ? selectedWR.field_engineer_id.toLowerCase() : engineerLoginId
            values.ticketNo = ticketNumber
            values.ticketSource = ticketSource
            if(isProject){
                values.workType = selectedWR.project_initiative ?  selectedWR.project_initiative : "Project"
                values.projectType = selectedWR.project_type
                values.fieldEngineer = selectedWR.field_engineer
                // values.loginId =  selectedWR.field_engineer_id ? selectedWR.field_engineer_id.toLowerCase() : "";
            }else{
            values.workType = selectedWR.work_type
            }
            values.woDevices = woDevices ? woDevices : null;
            values.comments = values.newcomment;
            delete values.newcomment;
            dispatch(submitScheduleRequest(loginId, values)).then((async action => {
            if (action.type === 'SUBMIT_SCHEDULE_REQUEST_SUCCESS') {
            //initializeForm(false)
            if (values.category == "Vendor Work Order") {
            onSubmitVendorStatus('Scheduled', values.workId)
            }
                    setstatusMessage("SCHEDULED")
            setisAlreadyScheduled(true)
            //fetchEventDetails(loginId, vendorId, type)
            dispatch(fetchEventDetails(loginId, vendorId))
            if (action.savedMessage) {
            props.notifref.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            autoDismiss: 3,
            message: action.savedMessage
            })
            }
                    !isStatusChangeDone ? sendEmailNotification(values) : null;
            if (values.category != "Vendor Work Order") {
            await fetchElogData(values)
            }
                    props.refreshCalender ? props.refreshCalender(moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')) : null;
            props.createNewSchedule ? props.createNewSchedule() : null
            props.setCapitalModal ? props.setCapitalModal() : null
            props.goBack ? props.goBack() : null
            }
            }))
        }
        if (scheduleStatus == 'Update') {
            //sechdule extend to yes if only end date is modified
            let woStatus = props?.currentEventObj?.status;
            if (woStatus != undefined && (woStatus == "SCHEDULED" || woStatus == "RESCHEDULED") && openCalenderStart==false){
                values.scheduleExtend = 'yes';
            }
            values.engineerLogin =  isProject ? selectedWR.field_engineer_id ? selectedWR.field_engineer_id.toLowerCase() : "": engineerLoginId ;
            values.loginId = loginId;
            values.kirkeId = values?.autoCreatedKirkeRequest ? values.autoCreatedKirkeRequest:null;

            if (values.comments) {
                delete values.comments
            }
            if (oldData.status = "SCHEDULED") {
                values.status = 'RESCHEDULED'
                vendorStatus = 'Rescheduled'
            }
            if (oldData.status = "RESCHEDULED") {
                values.status = 'RESCHEDULED'
                vendorStatus = 'Rescheduled'
            }
            if (values.status == 'Rejected' || values.status == 'REJECTED') {
                values.status = 'RESCHEDULED'
                vendorStatus = 'Rescheduled'
            }
            if (values.status == 'DONE') {
                vendorStatus = 'Work Completed'
            }
            if (vendorStatus == 'INPROGRESS') {
                values.status = 'INPROGRESS'
                vendorStatus = 'In Progress'
            }
            if (values.category == "Vendor Work Order") {
                values.woDevices = woDevices || null;
            }
            if(cancelSchedule) {
                values.status = 'UNSCHEDULED'
                vendorStatus = 'Unscheduled'
            }
            let updateObj = {}
            updateObj.newData = values
            updateObj.oldData = oldData
            //console.log('update OBJ', updateObj)
            dispatch(updateScheduleRequest(loginId, updateObj)).then((async action => {
            if (action.type === 'UPDATE_SCHEDULE_REQUEST_SUCCESS') {
            initializeForm(false)
            //fetchEventDetails(loginId, vendorId, typeofWO)
            dispatch(fetchEventDetails(loginId, vendorId))
            if (action.savedMessage) {
            props.notifref.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            autoDismiss: 3,
            message: action.savedMessage
            })
            }
                    if (values.category == "Vendor Work Order") {
            onSubmitVendorStatus(vendorStatus, values.workId)
            }
                    !isStatusChangeDone ? sendEmailNotification(updateObj.newData) : null;
            if (values.category != "Vendor Work Order") { await fetchElogData(updateObj.newData) }
            if (action.errorsMessage) {
            props.notifref.addNotification({
            title: 'error',
            position: "br",
            level: 'error',
            autoDismiss: 3,
            message: action.errorsMessage
            })
            resetInfo()
            }
                    props.refreshCalender ? props.refreshCalender(moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')) : null;
            props.createNewSchedule ? props.createNewSchedule() : null
            props.setCapitalModal ? props.setCapitalModal() : null
            props.goBack ? props.goBack() : null
            }
            }))

        }
    }
           
    
    const sendEmailNotificationForVendorStatus = (status) => {
        let bodyMessage =
            '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
            '	<h1 style="background:#ff9800;color:#ffffff;padding:5px;margin:0px"> Vendor Status Notification </h1>' +
            '	<div style="padding:10px;color:#607d8b">' +
            '		<div>Vendor Status       : ' + status + '</div>' +
            '		<div>Work Order #       : ' + props.workOrderDetailInfo.get("workorder_id") + '</div>' +
            '		<div>Work Type: ' + props.workOrderDetailInfo.get("work_type") + '</div>' +
            '		<div>Work Order Status : ' + props.workOrderDetailInfo.get('workorder_status') + '</div>' +
            '		<div>Quote Status : ' + props.workORderInfo.get('quote_statuses') + '</div>' +
            '		<div>Requested By : ' + props.workORderInfo.get("requested_by_name") + '</div>' +
            '		<div>Requested Date : ' + props.workOrderDetailInfo.get("requested_date") + '</div>' +
            '		<div>Location   : ' + props.workORderInfo.get("switch") + '</div>' +
            '		<div>Site       : ' + props.workOrderDetailInfo.get("site_name") + '</div>' +
            '		<div>Work type   : ' + props.workOrderDetailInfo.get("work_type") + '</div>' +
            '		<div>Priority : ' + props.workOrderDetailInfo.get("priority") + '</div>' +
            '</div>' +
            '</div>';
        let requesterEmail = props.workOrderDetailInfo.get("requestor_email")
        let emailNotification = {
            body: bodyMessage,
            from: 'Vendor Portal',
            recipients: [requesterEmail],
            sourceName: 'Vendor Portal',
            subject: 'Vendor Status Update Notification - ' + props.workOrderDetailInfo.get("workorder_id"),
            transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
        }
        dispatch(ivrEmailNotify(loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } })).then(action => {
            if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
                props.notifref.addNotification({
                    title: 'Success',
                    position: "br",
                    level: 'success',
                    message: action.response.data.ivrEmailNotification.message + ' to ' + props.workOrderDetailInfo.get('requestor_email')
                })
            }
        })
    }

    const sendEmailNotification = async (data) => {
        site = site && site.toJS()
        const technicianDetails = site && site.contacts.find(e => { if (e.role == 'Site Technician') return e })
        let bodyMessage =
            '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
            '	<h1 style="background:#ff9800;color:#ffffff;padding:5px;margin:0px"> Vendor Schedule Notification </h1>' +
            '	<div style="padding:10px;color:#607d8b">' +
            '		<div>Work Description: ' + data.workType + ' - ' + (data.description ? data.description.toString() : '') + '</div>' +
            '		<div>Start Date : ' + (data.start ? moment(data.start).format(DATE_TIME_FORMAT) : '') + '</div>' +
            '		<div>End Date : ' + (data.end ? moment(data.end).format(DATE_TIME_FORMAT) : '') + '</div>' +
            '		<div>Vendor Company : ' + (data.vendorCompanyName ? data.vendorCompanyName.toString() : '') + '</div>' +
            '		<div>Created By : ' + (data.loginName ? data.loginName.toString() : '') + '</div>' +
            '		<div>Market : ' + (data.submarket ? data.submarket.toString() : '') + '</div>' +
            '		<div>Location   : ' + (data.switchName ? data.switchName.toString() : '') + '</div>' +
            '		<div>Site       : ' + (data.siteName ? data.siteName.toString() : '') + '</div>' +
            '		<div>Work Order #       : ' + (data.workId ? data.workId.toString() : '') + '</div>' +
            '		<div>Category   : ' + (data.category ? data.category.toString() : '') + '</div>' +
            '		<div>Event Status : ' + (data.status ? data.status.toString() : '') + '</div>' +
            '</div>' +
            '</div>';

        let requesterEmail = data && data.category && data.category == 'Vendor Work Order' ? props.workOrderDetailInfo.get("requestor_email") : technicianDetails.email
        if (requesterEmail && requesterEmail != 'null' && requesterEmail != 'undefined') {
            let emailNotification = {
                body: bodyMessage,
                from: 'Vendor Portal',
                recipients: [requesterEmail],
                sourceName: 'Vendor Portal',
                subject: 'Vendor Scheduling Notification - ' + data.workId,
                transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
            }
            await dispatch(ivrEmailNotify(loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } })).then(action => {
                if (action.response && action.response.data && action.response.data.ivrEmailNotification.code == 200) {
                    props.notifref.addNotification({
                        title: 'Success',
                        position: "br",
                        level: 'success',
                        message: action.response.data.ivrEmailNotification.message + ' to ' + requesterEmail
                    })
                } else {
                    props.notifref.addNotification({
                        title: 'error',
                        position: "br",
                        level: 'error',
                        message: action.response.data.ivrEmailNotification.message + ' to ' + requesterEmail
                    })
                }
            })
        }
    }
    const renderLoading = () => {
        return (<
            Loader color="#cd040b"
            size="75px"
            margin="4px"
            className="text-center" />
        )
    }

    const resetInfo = () => {
        dispatch(resetProps([loginId, "schedulerequest"], { isloading: false, errors: '', success: '' }))
    }


    const resetInfoMsg = () => {
        setisInfoMessageShown(false)
    }
    
    return (isLoading || eventsDetaisLoading && !(savedMessage && savedMessage.length > 0)) ? renderLoading() :  
        (<div className="row table-responsive vp_stepper_content" style={{ marginTop: '15px', marginLeft: '5px' }}>
            <div className="col-md-12">
                <div className="">
                    {/* {kirkeFreezName && <span style={{fontWeight: 'bold', color: 'orange'}}>{kirkeFreezName}</span>} */}
                    {isFileSizeError && (<MessageBox messages={List(["The size of attachments should be less than 50 MB!"])} />)}
                    {isInfoMessageShown && (<MessageBox messages={List(["Schedule Status changed! Please update your changes!"])} onClear={resetInfoMsg.bind(this)} className="alert-success" />)}
                    {savedMessage && savedMessage.size ? (<MessageBox messages={List([savedMessage.get("message")])} className="Alert--success" iconClassName="fa-thumbs-up" onClear={resetInfo} marginTop={true} />) : null}
                    {errorsMessage && errorsMessage.size ? (<MessageBox messages={List([errorsMessage.get("message")])} onClear={resetInfo} />) : null}
                    {savedMessage && savedMessage.length > 0 ? (<MessageBox messages={List([savedMessage])} className="Alert--success" iconClassName="fa-thumbs-up" onClear={resetInfo} marginTop={true} />) : null}
                    {errorsMessage && errorsMessage.length > 0 ? (<MessageBox messages={List([errorsMessage.message])} onClear={resetInfo} />) : null}
                    {/* {errorsMessage && errorsMessage.message && errorsMessage.message.length > 0 ? (<MessageBox messages={List([`Unable to create schedule, Please use Issue Report to report the error with the Work Order ID`])} onClear={resetInfo} />) : null} */}
                    {currentValues.toJS() && currentValues.toJS().autoCreatedKirkeRequest && errorsMessage && errorsMessage.message && errorsMessage.message.length > 0 ?
                        (<MessageBox messages={List([errorsMessage.message])} onClear={resetInfo} />) :
                        errorsMessage && errorsMessage.message && errorsMessage.message.length > 0?
                        (<MessageBox messages={List([errorsMessage.message])} onClear={resetInfo} />) :null
                      }
                    {showError?.length > 0 && <MessageBox messages={List([showError])} onClear={resetInfo} />}
                    <style>
                        {`
                .Form-label {
                    font-size: 1em;
                }
                input[disabled]{ background-color: #fff !important;}
            .lableMaterial{ margin: 11px 0px;font-size: 10px;font-weight: normal;color: rgba(0, 0, 0, 0.3);font-family: Roboto, sans-serif;}
            .rdt >  input{
                border-top: 0px;
                border-right: 0px;
                border-left: 0px;
                }`
                        }
                    </style>
                    <table className="table sortable table-bordered text-center site-table" style={{ minHeight: "288px", "background": "#FFF" }}>
                        <tbody className="vzwtable text-left">
                            <tr>
                                <td colSpan="1">
                                    <div className="col-md-9 form-group" style={{ paddingLeft: 0 }}>
                                        <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Category</h5></label>
                                        <input
                                            value={props.workORderInfo && props.workORderInfo.proj_number ? "Project" : "Vendor Work Order"}
                                            className="col-12 col-md-12 no-padding float-left"
                                            style={{
                                                borderRadius: "4px",
                                                border: "1px solid hsl(0, 0%, 80%)",
                                                height: "35px",
                                                paddingLeft: "7px",
                                                color: "hsl(0, 0%, 20%)",
                                                fontWeight: "unset"
                                            }}
                                            disabled
                                        />
                                    </div>
                                </td>
                                <td colSpan="1">
                                    <div className="col-md-9" style={{ paddingLeft: 0 }}>
                                        <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>{props.workORderInfo && props.workORderInfo.project_type ? "Project Type" : "Work Type"}</h5></label>
                                        <input
                                            value={props.workORderInfo && props.workORderInfo.project_type ? props.workORderInfo.project_type : props.workORderInfo && props.workORderInfo.toJS().work_type ? props.workORderInfo.toJS().work_type : null}
                                            className="col-12 col-md-12 no-padding float-left"
                                            style={{
                                                borderRadius: "4px",
                                                border: "1px solid hsl(0, 0%, 80%)",
                                                height: "35px",
                                                paddingLeft: "7px",
                                                color: "hsl(0, 0%, 20%)",
                                                fontWeight: "unset"
                                            }}
                                            disabled
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="1" style={{width: '50%'}}>
                                    <div className="col-md-9" style={{ paddingLeft: 0, display: 'inline-grid'}}>
                                        <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Start Date/Time <span style={{color: 'blue'}}>( 12 - Hour Clock )</span></h5></label>
                                        {startDate && startDateValErr && startDateValErr == 'Start Date Time should be more than Current Date Time' ? <span><h6 style={{ color: 'red', marginBottom: '8px', float: 'left', paddingLeft: '10px'  }}>{startDateValErr}</h6></span> : null} 
                                        {startslotBookedError ? <span><h6 style={{ color: 'red', marginBottom: '8px' }}>{startslotBookedError}</h6></span> : null} 
                                        {/* {showStartDateInvalid && <span><h6 style={{ color: 'red', marginBottom: '8px'  }}>Invalid Start Date</h6></span>} */}
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DateTimePicker
                                                disabled={openCalenderStart==false}
                                                defaultValue={startDate?moment(startDate):moment()}
                                                value={startDate?moment(startDate):moment()}
                                                onChange={(value) => onEventDateChange(true, value)}
                                                shouldDisableDate={(curr) => isValidDate(curr, false) && (holidays && !holidays.includes(curr.format('YYYY-MM-DD')))}
                                                views={['year', 'month', 'day', 'hours', 'minutes']}
                                                viewRenderers={{
                                                    hours: renderTimeViewClock,
                                                    minutes: renderTimeViewClock,
                                                    seconds: renderTimeViewClock,
                                                }}
                                                // onError={(error, value) => setshowStartDateInvalid(error ? true : false)}
                                                closeOnSelect={true}
                                            />
                                         </LocalizationProvider>
                                        </div>
                                </td>
                                <td colSpan="1">
                                    <div className="col-md-9" style={{ paddingLeft: 0, display: 'inline-grid' }} >
                                        <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>End Date/Time <span style={{color: 'blue'}}>( 12 - Hour Clock )</span></h5></label>
                                        {endDate && endDateValErr ? <span><h6 style={{ color: 'red',  marginBottom: '8px', float: 'left', paddingLeft: '10px'  }}>{endDateValErr}</h6></span> : null} 
                                        {endslotBookedError ? <span><h6 style={{ color: 'red', marginBottom: '8px', float: 'left', paddingLeft: '10px'  }}>{endslotBookedError}</h6></span> : null} 
                                        {/* {showEndDateInvalid && <span><h6 style={{ color: 'red', marginBottom: '8px'  }}>Invalid End Date</h6></span>} */}
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DateTimePicker
                                                defaultValue={endDate?moment(endDate):moment()}
                                                value={endDate?moment(endDate):moment()}
                                                onChange={value => onEventDateChange(false, value)}
                                                shouldDisableDate={(curr) => isValidDate(curr, true) && (holidays && !holidays.includes(curr.format('YYYY-MM-DD')))}
                                                views={['year', 'month', 'day', 'hours', 'minutes']}
                                                viewRenderers={{
                                                    hours: renderTimeViewClock,
                                                    minutes: renderTimeViewClock,
                                                    seconds: renderTimeViewClock,
                                                }}
                                                // onError={(error, value) => setshowEndDateInvalid(error ? true : false)}
                                            />
                                         </LocalizationProvider>
                                        {/* <Datetime timeFormat dateFormat="MM-DD-YYYY" value={endDate ? endDate : ''} closeOnSelect onChange={value => onEventDateChange(false, value)} isValidDate={(curr) => isValidDate(curr, true) && (holidays && !holidays.includes(curr.format('YYYY-MM-DD')))}
                                            renderInput={(props) => {
                                                return <input {...props} value={endDate != null ? props.value : ''} />
                                            }}
                                        /> */}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="1">
                                    <div className="col-md-9" style={{ paddingLeft: 0 }}>
                                        <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>{props.workORderInfo && props.workORderInfo.proj_number ? "Project Number" : "Work ID"}</h5></label>

                                        <input
                                            value={props.selectedWR.workorder_id}
                                            className="col-12 col-md-12 no-padding float-left"
                                            style={{
                                                borderRadius: "4px",
                                                border: "1px solid hsl(0, 0%, 80%)",
                                                height: "35px",
                                                paddingLeft: "7px",
                                                color: "hsl(0, 0%, 20%)",
                                                fontWeight: "unset"
                                            }}
                                            disabled
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr >
                                <td colSpan="2">
                                    <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Work Description</h5></label>
                                    <div style={{ margin: '10px' }}>
                                        <textarea 
                                        rows={2} 
                                        id="description" 
                                        name="description"
                                        style={{ padding: "10px", "borderRadius": "3px", width: '100%' }} 
                                        value={currentValues.get("description") || props.currentEventObj && props.currentEventObj.description} 
                                        onChange={(e) => onDescriptionChange(e)} 
                                        maxLength="500"/>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <span style={{color: 'blue', fontSize: "1rem"}}>Note: Only the first 500 characters of Work Description will be saved with the schedule request.</span>
                                            {currentValues.get('description') && <span style={{ fontSize: "1rem"}}>Characters count: {currentValues.get('description').length}</span>}
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                            <td colSpan="2">
                                <label style={{ color: "black", fontSize: "1em" }}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Comments</h5><span style={{paddingLeft: '10px'}}>Minimum of 7 characters required</span></label>
                                <div style={{ margin: '10px' }}>
                                        <textarea 
                                        rows={2} 
                                        id="newcomment"
                                        name="newcomment"
                                        style={{ padding: "10px", "borderRadius": "3px", width: '100%' }} 
                                        defaultvalue='' 
                                        onChange={(e) => onDataChange(e)}
                                        maxLength="999"/>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <span style={{color: 'blue', fontSize: "1rem"}}>Note: Comments length cannot exceed 999 characters, Please do not copy/paste the work description into the comments field</span>
                                            {currentValues.get('newcomment') && <span style={{ fontSize: "1rem"}}>Characters count: {currentValues.get('newcomment').length}</span>}
                                        </div>
                                </div> 
                            </td>
                            </tr>
                            <tr>
                            <td colSpan="2">
                                <tr style={{ border: 0 }}>
                                    <OpsComments comments={props?.currentEventObj?.comments || []} />
                                </tr>
                            </td>
                            </tr>
                            <tr>
                                <td colSpan="2">
                                    {scheduleStatus != 'Update'?
                                    <>
                                    <div className={"col-md-3 float-left"}>
                                        {props.isProject && scheduleStatus!='Update' ? <div style={{ marginBottom: '10px'}}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h6 style={{float: 'left'}}>
                                            </h6>Please attach MOP for review</div>: null}
                                        <Dropzone onDrop={onFileDrop}>
                                            {({ getRootProps, getInputProps }) => (
                                                <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                                    <div {...getRootProps()}>
                                                        <input {...getInputProps()} />
                                                        <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                                    </div>
                                                </section>
                                            )}
                                        </Dropzone>
                                        </div> 
                                    <div className="col-md-3 float-left">
                                        <VScheduleFileUpload fileList={filesData} loginId={loginId} onRemoveClick={onAttachRemove} />
                                    </div> 
                                        </>
                                    : null}
                                    <button type="submit"
                                        className="Button--secondary float-right"
                                        disabled={currentValues.get('category') === '' || !startDate || !endDate || (currentValues.get('workId') === '') || startDateValErr !== null || endDateValErr !== null || startslotBookedError !== null || endslotBookedError !== null || isAlreadyScheduled == true || currentValues.get('newcomment') == undefined || currentValues.get('newcomment')?.length <= 6 || comments==null || comments?.length<=6 || currentValues.get('description') == undefined || currentValues.get('description').length === 0 || (props.isProject && scheduleStatus!='Update' && filesData && filesData.length == 0) }
                                        style={{ marginRight: "5px" }}
                                        onClick={() => onSubmit(false)}>
                                        {scheduleStatus} Schedule
                                    </button>
                                    {scheduleStatus == 'Update' &&  !moment().isAfter(props?.currentEventObj?.start) && <button type="submit"
                                        className="Button--secondary float-right"
                                        disabled={currentValues.get('category') === '' || !startDate || !endDate || (currentValues.get('workId') === '') || startDateValErr !== null || endDateValErr !== null || startslotBookedError !== null || endslotBookedError !== null || isAlreadyScheduled == true || currentValues.get('newcomment') == undefined || currentValues.get('newcomment')?.length <= 6 || comments==null || comments?.length<=6 || currentValues.get('description') == undefined || currentValues.get('description').length === 0 || props.isProject && scheduleStatus!='Update' }
                                        style={{ marginRight: "5px" }}
                                        onClick= {() => onSubmit(true)}
                                        >Cancel Schedule
                                        </button>
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default VSMinimalCreateScheduler;