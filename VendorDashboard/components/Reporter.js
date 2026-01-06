import React, { useEffect, useRef, useState, useCallback } from 'react'
import TextField from '@material-ui/core/TextField'
import ajax from '../../ajax'
import { ComponentList } from '../utils'
import Select from 'react-select'
import Dropzone from 'react-dropzone'
import FileAttachedTable from './FileAttachedTable'
import { List, Map } from "immutable"
import { useSelector, useDispatch } from "react-redux"
import moment from 'moment'
import * as formActions from "../../Forms/actions"
import { ivrEmailNotify, issueReportRequest } from '../../Users/actions'
import { ivrEmailNotification, submitIssueReport } from '../../Users/schema'
import Loader from '../../Layout/components/Loader'
import MessageBox from '../../Forms/components/MessageBox'
import PropTypes from 'prop-types'

const formName = "ReporterForm"

const selectLoginId = state => state.getIn(["Users", "currentUser", "loginId"], "")
const selectUser = state => {
    const loginId = selectLoginId(state)
    return state.getIn(['Users', 'entities', 'users', loginId], Map())
}
const selectAllWorkOrders = state => {
    const loginId = selectLoginId(state)
    return state.getIn(["VendorDashboard", loginId, "allworkorders"], Map())
}
const selectCurrentValues = state => state.getIn(["Forms", formName, "currentValues"], List())

const Reporter = ({ notifref, close }) => {
    const dispatch = useDispatch()
    const loginId = useSelector(selectLoginId)
    const user = useSelector(selectUser)
    const allworkorders = useSelector(selectAllWorkOrders)
    const currentValues = useSelector(selectCurrentValues)

    const [summary, setSummary] = useState('')
    const [component, setComponent] = useState('')
    const [workOrderNumber, setWorkOrderNumber] = useState('')
    const [description, setDescription] = useState('')
    const [invalidWorkOrder, setInvalidWorkOrder] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSite, setIsSite] = useState(null)
    const [isFileSizeError, setIsFileSizeError] = useState(false)
   

    // Set initial values on mount
    useEffect(() => {
        setAList(List()) 
        dispatch(formActions.setInitialValues(formName, {
            "userName": user.get("fname") + ',' + user.get("lname"),
            "userEmail": user.get("email"),
            "vendorCompany": user.get("vendor_name"),
            "Site/SwitchName": "",
            "market": user.get("vendor_area"),
            "sub_market": user.get("vendor_region"),
            "summary": "",
            "component": "",
            "workOrderNumber": "",
            "description": ""
        }))
    }, [dispatch, user])

    const setValue = useCallback((field, value) => {
        dispatch(formActions.setValue(formName, field, value))
    }, [dispatch])

    const isWorkOderValid = useCallback((workOrderNum) => {
        try {
            let workOrders = (allworkorders.toJS()).filter(value => value.workorder_id == workOrderNum)
            if (workOrders.length === 1) {
                let name = workOrders[0].site_type === 'SWITCH' ? workOrders[0].switch : workOrders[0].site_name
                setValue("Site/SwitchName", name)
                setIsSite(workOrders[0].site_type !== 'SWITCH')
            }
            return workOrders.length > 0
        } catch (err) {
            return false
        }
    }, [allworkorders, setValue])

    const onChangeInput = (e) => {
        if (e.target) {
            setValue(e.target.name, e.target.value)
            if (e.target.name === "workOrderNumber") {
                if ((e.target.value && isWorkOderValid(e.target.value)) || (!e.target.value)) {
                    setInvalidWorkOrder(false)
                } else {
                    setInvalidWorkOrder(true)
                }
            }
        } else {
            setValue(e.name, e.value)
        }
    }


const [aList, setAList] = useState(List())

// ...existing code...

const onFileDrop = (files) => {
    !isFileSizeError && files.forEach(file => {
        if (file['size'] > 0) {
            var reader = new window.FileReader()
            reader.onload = function () {
                var dataURL = reader.result
                var droppedFile = {
                    filename: file['name'],
                    filetype: file['type'],
                    file_size: file['size'] + '',
                    content: dataURL,
                    preview: file['preview'],
                    last_modified: file['lastModifiedDate'],
                    fileName: file['name'].split('.')[0],
                    fileIn64Form: dataURL.toString().split('data:' + file['type'] + ';base64,')[1],
                    fileExtension: file['name'].split('.')[1]
                }
                setAList(prev => {
                    const updated = prev.set(prev.size, droppedFile)
                    let totalFileSize = updated.toJS().reduce((a, b) => +a + +b.file_size, 0)
                    if (totalFileSize >= 10000000) {
                        setIsFileSizeError(true)
                        return updated.remove(updated.size - 1)
                    } else {
                        setIsFileSizeError(false)
                        return updated
                    }
                })
            }
            reader.readAsDataURL(file)
        }
    })
}

const onAttachRemove = (index) => {
    setAList(prev => {
        const updated = prev.remove(index)
        let totalFileSize = updated.size > 0 ? updated.toJS().reduce((a, b) => +a + +b.file_size, 0) : 0
        setIsFileSizeError(totalFileSize >= 10000000)
        return updated
    })
}

// ...in JSX...
<FileAttachedTable fileList={aList.toJS()} onRemoveClick={onAttachRemove} />

    const validateTextFeilds = () => {
        let { description, summary, component } = currentValues.toJS()
        description = description ? description.trimStart() : ''
        summary = summary ? summary.trimStart() : ''
        return !(description.length > 0 && summary.length > 0 && component)
    }

    const renderLoading = () => (
        <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />
    )

   

    const onSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        let attachments = []
        if (aList.size > 0) {
            let uploadedList = aList.toJS()
            attachments = uploadedList.map(file => ({
                fileName: file.fileName,
                fileIn64Form: file.fileIn64Form,
                fileExtension: file.fileExtension
            }))
        }
        let name = isSite ? 'Site Name' : 'Switch Name'
        let bodyMessage =
            '<div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">' +
            '	<h1 style="background:#D52B1E;color:#ffffff;padding:5px;margin:0px">Issue Report Notification </h1>' +
            '	<div style="padding:10px;color:#607d8b">' +
            '		<div>UserName        : ' + currentValues.get("userName") + '</div>' +
            '		<div>User Email      : ' + currentValues.get('userEmail') + '</div>' +
            '		<div>Work Order #    : ' + currentValues.get("workOrderNumber") + '</div>' +
            '		<div>Vendor Company  : ' + currentValues.get("vendorCompany") + '</div>' +
            '		<div>' + name + ' :' + currentValues.get("Site/SwitchName") + '</div>' +
            '		<div>Area : ' + currentValues.get('market') + '</div>' +
            '		<div>Sub market : ' + currentValues.get('sub_market') + '</div>' +
            '		<div>Summary : ' + currentValues.get("summary") + '</div>' +
            '		<div>Component : ' + currentValues.get("component") + '</div>' +
            '		<div>Description   : ' + currentValues.get("description") + '</div>' +
            '</div>' +
            '</div>'
        let workOrderNumberForSubject = currentValues.get("workOrderNumber") ? " Issue (" + currentValues.get("workOrderNumber") + ")" : ' Issue'
        let subject = currentValues.get("component") + workOrderNumberForSubject
        let emailNotification = {
            body: bodyMessage,
            from: 'Vendor Portal',
            recipients: ['VENDORPORTALDEVEMAILS@one.verizon.com'],
            sourceName: 'Vendor Portal',
            subject,
            transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A'),
            attachments
        }

        try {
            // 1. Submit the issue report
            const issueReportData = await ajax.post('/graphql4g', {
                query: submitIssueReport,
                variables: {
                    submitIssueReportInput: {
                        source: 'WEB',
                        component: currentValues.get('component'),
                        task_id: currentValues.get("workOrderNumber") || '',
                        summary: currentValues.get('summary'),
                        description: currentValues.get('description'),
                        vendor_id: user.get('vendor_id'),
                        vendor_email: user.get('email'),
                        created_by: user.get('name')
                    }
                }
            })

            // 2. Send the email notification
            const emailData = await ajax.post('/graphql4g', {
                query: ivrEmailNotification,
                variables: { ivr_email_request: emailNotification }
            })

            // 3. Dispatch a plain action to update the store if needed
            dispatch({
                type: 'ISSUE_REPORT_SUCCESS',
                payload: {
                    issueReport: issueReportData,
                    email: emailData
                }
            })
            console.log('Email API response:', emailData)
            if ( emailData?.status === 200 || emailData?.data?.data?.ivrEmailNotification?.code === 200) {
                notifref.addNotification({
                    title: 'Success',
                    position: "br",
                    level: 'success',
                    message: emailData.data.data.ivrEmailNotification.message
                })
                setIsLoading(false)
                close && close()
            } else {
                setIsLoading(false)
            }
        } catch (error) {
            notifref.addNotification({
                title: 'Error',
                position: "br",
                level: 'error',
                message: error?.message || "Error submitting issue"
            })
            setIsLoading(false)
        }
    }

    const labelStyle = { "color": "black", "fontSize": "1em" }

    return (
        <div className="row margin-top-bottom-10 float-left" style={{ width: "100%" }}>
            <form id="reporterIssueForm" onSubmit={onSubmit} className="float-label">
                <div className="row" style={{ width: "100%" }}>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                        <div className="row" style={{ width: "100%", padding: "10px 0 0 2rem" }}>
                            <label style={labelStyle}><h5 style={{ float: 'left' }}>WorkOrderNumber</h5></label>
                            <TextField
                                name="workOrderNumber" multiLine={false} fullWidth={true}
                                value={currentValues.get("workOrderNumber")}
                                type="number" placeholder="Leave the field empty if not applicable"
                                onChange={onChangeInput}
                                error={invalidWorkOrder}
                                helperText={invalidWorkOrder ? "No Valid WorkOrder Found" : null}
                                inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }} />
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                        <div className="row" style={{ width: "100%", padding: "10px 0 0 2rem" }}>
                            <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Component</h5></label>
                            <Select
                                name="component"
                                value={{ label: currentValues.get("component"), value: currentValues.get("component") }}
                                className="col-12 col-md-12 no-padding float-left"
                                onChange={onChangeInput}
                                options={ComponentList}
                                required
                            />
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                        <div className="row" style={{ width: "100%", padding: "10px 0 0 2rem" }}>
                            <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Summary</h5></label>
                            <TextField
                                name="summary" multiLine={true} rows={2} rowsMax={4} fullWidth={true}
                                value={currentValues.get("summary")}
                                onChange={onChangeInput} required
                                inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }} />
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                        <div className="row" style={{ width: "100%", padding: "10px 0 0 2rem" }}>
                            <label style={labelStyle}><h5 style={{ color: 'red', float: 'left' }}>*</h5><h5 style={{ float: 'left' }}>Description</h5></label>
                            <TextField
                                name="description" multiLine={true} rows={2} rowsMax={4} fullWidth={true}
                                value={currentValues.get("description")}
                                onChange={onChangeInput} required
                                inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }} />
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                        <div className="row" style={{ width: "100%", padding: "10px 0 0 2rem" }}>
                            <Dropzone
                                disabled={false}
                                disableClick={false}
                                onDrop={onFileDrop}>
                                {({ getRootProps, getInputProps }) => (
                                    <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
                            <FileAttachedTable fileList={aList.toJS()} onRemoveClick={onAttachRemove} />
                            <div style={{ width: "100%", marginTop: "10px" }}>
                                {isFileSizeError && (<MessageBox messages={List(['Files Size should be less than 10MB.'])} onClear={() => setIsFileSizeError(false)} />)}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 float-right">
                        {isLoading ? renderLoading() : <div className="row" style={{ width: "100%", padding: "10px 0 0 2rem" }}>
                            <button type="submit"
                                style={{ width: "fit-content", 'padding': '0.5em 2.14em', marginTop: "25px" }}
                                disabled={invalidWorkOrder || validateTextFeilds()}>
                                Submit
                            </button>
                        </div>}
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Reporter

Reporter.propTypes = {
    notifref: PropTypes.shape({
        addNotification: PropTypes.func.isRequired
    }).isRequired,
    close: PropTypes.func
}