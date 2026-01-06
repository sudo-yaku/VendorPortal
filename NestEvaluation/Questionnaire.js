import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import Select from 'react-select';
import { List } from "immutable";
import MessageBox from '../Forms/components/MessageBox.js';
import Dropzone from 'react-dropzone';
import { Step, Stepper, StepLabel, StepContent } from '@material-ui/core';
import moment from "moment";
import { SingleDatePicker } from 'react-dates';
import {updateQuestionnaireAttachments, sendEmailNotificationForAvianUpdate, uploadAvianAttachment} from '../PreventiveMaintenance/actions.js'
import ListOfFiles from '../PreventiveMaintenance/components/ListOfFiles.js';
import imageCompression from "browser-image-compression";
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

const OPTIONS = [
    { label: "Open", value: "OPEN" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Acknowledged", value: "ACKNOWLEDGED" },
    { label: "Closed", value: "CLOSED" }
];

const Questionnaire = (props) => {

      // --- Redux selectors ---
      const loginId = useSelector(state => state.getIn(['Users', 'currentUser', 'loginId'], ''));
      const user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], List()));
      const vendorId = user.toJS().vendor_id;
      const submarket = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "vendor_region"], ""));
      const realLoginId = useSelector(state => state.getIn(['Users', 'realUser', 'loginId']));
      const realUser = useSelector(state => state.getIn(['Users', 'entities', 'users', realLoginId], List()));
      const ssoUrl = realUser ? realUser.get('ssoLogoutURL') : '';
      const isssouser = realUser ? realUser.get('isssouser') : '';
      const siteDetaisLoading = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false));
  
      // --- Redux dispatch ---
      const dispatch = useDispatch();


    const [showLog, setShowLog] = useState(false);
    const [followupDate, setFollowupDate] = useState(props.nestDetails?.rstr_follow_up ? moment(props.nestDetails.rstr_follow_up) : "");
    const [evaluationDate, setEvaluationDate] = useState(props.nestDetails?.evaluation_date ? moment(props.nestDetails.evaluation_date) : "");
    const [expirationDate, setExpirationDate] = useState(props.nestDetails?.expiration_date ? moment(props.nestDetails.expiration_date) : "");
    const [statusSelected, setStatusSelected] = useState(OPTIONS.find(item => item.value === props.nestDetails?.status) || {});
    const [followupDateFocused, setFollowupDateFocused] = useState(null);
    const [evaluationDateFocused, setEvaluationDateFocused] = useState(null);
    const [expirationDateFocused, setExpirationDateFocused] = useState(null);
    const [filesDataAR, setFilesDataAR] = useState([]);
    const [status, setStatus] = useState(props.nestDetails?.status);
    const [siteRestrRadio, setSiteRestrRadio] = useState(props.nestDetails?.rstr_isrestricted === "yes" ? 'Site is Restricted - Bird/Nest Activity is Present' : 'Site is Not Restricted');
    const [birdType, setBirdType] = useState(props.nestDetails?.rstr_birdtype || '');
    const [biologistName, setBiologistName] = useState(props.nestDetails?.rstr_biologist_name || '');
    const [towerRadio, setTowerRadio] = useState(props.nestDetails?.rstr_toweraccess === "no" ? 'No' : 'Yes');
    const [groundRadio, setGroundRadio] = useState(props.nestDetails?.rstr_groundaccess === "no" ? 'No' : 'Yes');
    const [restrComments, setRestrComments] = useState(props.nestDetails?.rstr_comments);
    const [pageLoadingComplete, setPageLoadingComplete] = useState(false);
    const [addonAlert, setAddonAlert] = useState(false);
    const [addonAlertMsg, setAddonAlertMsg] = useState('');
    const [attachmentsList, setAttachmentsList] = useState(props.attachmentsList);
    const [uploadStatus, setUploadStatus] = useState({});
    const [totalFileSize, setTotalFileSize] = useState(0);
    const [errMessage, setErrMessage] = useState('');

   // In your functional component

const clearAddonAlert = () => {
    setAddonAlert(false);
};

const formUpdateQuesInput = (typeOfReq) => {
    const inputDetails = props.nestDetails;
    const rstr_isrestrictedValue = siteRestrRadio === 'Site is Restricted - Bird/Nest Activity is Present' ? "yes" : "no";
    const rstr_toweraccessValue = towerRadio === 'Yes' ? "yes" : "no";
    const rstr_groundaccessValue = groundRadio === 'Yes' ? "yes" : "no";
    const input = {
        ...inputDetails,
        status: typeOfReq,
        rstr_toweraccess: rstr_toweraccessValue,
        rstr_groundaccess: rstr_groundaccessValue,
        rstr_isrestricted: rstr_isrestrictedValue,
        rstr_follow_up: followupDate ? followupDate.format('YYYY-MM-DD') + 'T23:59:00.000Z' : null,
        evaluation_date: evaluationDate ? evaluationDate.format('YYYY-MM-DD') + 'T23:59:00.000Z' : null,
        expiration_date: expirationDate ? expirationDate.format('YYYY-MM-DD') + 'T23:59:00.000Z' : null,
        files: [],
        rstr_biologist_name: biologistName,
        rstr_birdtype: birdType,
        rstr_comments: restrComments
    };
    return input;
};

const onComplete = async () => {
    setPageLoadingComplete(true);
    setUploadStatus(filesDataAR.reduce((acc, file) => ({ ...acc, [file.file_name]: 'loading' }), {}))

    const { selectedRow, refreshDashboard, handleHideModal, nestDetails } = props;
    const input = formUpdateQuesInput(statusSelected?.value);

    // Use dispatch and await the result if your thunk returns a promise
    const action = await dispatch(updateQuestionnaireAttachments(loginId, input, selectedRow.site_unid));
    if (action && action.type === "FETCH_UPDATEQUESTIONNAIREATTACHMENT_SUCCESS") {
        // Upload files in parallel
        const uploadPromises = filesDataAR.map(async (file) => {
          try {
            let attachmentinput = {
              bnaMetaUniversalId: nestDetails?.meta_universalid,
              attachmentName: file?.file_name,
              fileContent: file?.file_data
            }
            await dispatch(uploadAvianAttachment(attachmentinput));
            setUploadStatus(prevStatus => ({...prevStatus, [file.file_name]: 'completed'}))
          } catch (uploadError) {
            setUploadStatus(prevStatus => ({...prevStatus, [file.file_name]: 'failed'}))
          }
        });
        await Promise.all(uploadPromises);

        const emailInput = {
            ...input,
            files: filesDataAR.map(file => ({
                file_name: file.file_name
            }))
        };
        
        const emailRes = await dispatch(sendEmailNotificationForAvianUpdate(nestDetails?.meta_universalid, emailInput));
        showNotification('success', 'Site Restriction Details updated successfully');
        if(emailRes?.success) {
            showNotification('success', 'Email notification sent successfully');
        } else {
            showNotification('error', 'Failed to send email notification');
        }
        setTimeout(() => refreshDashboard(), 2000);
    } else {
        showNotification('error', 'Site Restriction Details updation failed');
    }
    await handleHideModal();
    setPageLoadingComplete(false);
};

const showNotification = (type, message) => {
    const { notifref } = props;
    notifref.addNotification({
        title: type,
        position: "br",
        level: type,
        message: message
    });
}

const handleInputChangeRadio = (e) => {
    accessCheck();
    setSiteRestrRadio(e.target.value);
    if (e.target.value === 'Site is Not Restricted') {
        const value = 'Yes';
        const event = { target: { value } };
        handleTowerRadioChange(event);
        handleGroundRadioChange(event);
    } else {
        const value = 'No';
        const event = { target: { value } };
        handleTowerRadioChange(event);
        handleGroundRadioChange(event);
    }
};
const handleBirdChange = (e) => {
    accessCheck();
    setBirdType(e.target.value);
};

const handleBiologistChange = (e) => {
    accessCheck();
    setBiologistName(e.target.value);
};

const handleTowerRadioChange = (e) => {
    setTowerRadio(e.target.value);
    accessCheck();
};

const handleGroundRadioChange = (e) => {
    setGroundRadio(e.target.value);
    accessCheck();
};

const handleRestrictionCommentsChange = (e) => {
    setRestrComments(e.target.value);
};

const handleLogClick = () => {
    setShowLog(prev => !prev);
};

const readFileAsBase64 = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new window.FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const onFileDrop = async (type, files) => {
    setErrMessage('');
    const newFiles = [];
    const rejectedFiles = [];
    let currentTotalSize = totalFileSize;
    const processedFiles = [];
    
    for (const file of files) {
        const fileSizeMBLimit = file.size / (1024 * 1024);
        if (fileSizeMBLimit > 20) {
            rejectedFiles.push(file.name);
        } else {
            newFiles.push(file);
        }
    }
    
    // Show error for rejected files but continue with valid ones
    if (rejectedFiles.length > 0) {
        setErrMessage(`${rejectedFiles.join(', ')} attachments should not exceed 20MB`);
    }
    
    // If no valid files, return early
    if (newFiles.length === 0) {
        return;
    }
    
    // Check total file count limit
    if (filesDataAR.length + newFiles.length > 10) {
        setErrMessage(`Maximum of 10 attachments allowed. You have selected ${filesDataAR.length + newFiles.length}.`);
        return;
    }
    
    for (const file of newFiles) {
        try {
            // Check if file with same name already exists in current files or processed files
            const existingFile = filesDataAR.find(existing => existing.file_name === file.name);
            const processingFile = processedFiles.find(existing => existing.file_name === file.name);
            
            if (existingFile || processingFile) {
                setErrMessage(`File '${file.name}' is already added. Please remove the existing file first or rename the new file.`);
                continue; // Skip this file
            }
            
            const fileType = file.type.split('/')[0];
            let droppedFile = {
                file_name: file.name,
                filename: file.name,
            };

            if (fileType === 'image') {
                const compressedFile = await imageCompression(file, {
                    maxSizeMB: 10,
                    maxWidthOrHeight: 3840,
                    useWebWorker: false,
                });
                
                let imageURI = await readFileAsBase64(compressedFile);
                imageURI = imageURI.toString().split("data:" + file.type + ";base64,")[1];
                droppedFile = { ...droppedFile, file_data: imageURI };
            } else {
                const dataURL = await readFileAsBase64(file);
                droppedFile = {
                    ...droppedFile,
                    file_data: dataURL.split("data:" + file.type + ";base64,")[1],
                    preview: file.preview,
                };
            }

            const fileSize = (droppedFile.file_data.length * 3) / (4 * 1024 * 1024);
            
            // Check if adding this file would exceed the size limit
            const newTotalSize = currentTotalSize + fileSize;
            if (newTotalSize > 100) {
                setErrMessage(`Total attachments size cannot exceed 100MB.`);
                break; // Stop processing remaining files
            }
            
            // Update running total and add to processed files
            currentTotalSize = newTotalSize;
            processedFiles.push(droppedFile);
            
        } catch (error) {
            setErrMessage(`Error processing file '${file.name}'. Please try again.`);
        }
    }
    
    // Update state once with all processed files
    if (processedFiles.length > 0) {
        setFilesDataAR(prev => prev.concat(...processedFiles));
        setTotalFileSize(currentTotalSize);
    }
};
const onAttachRemove = (type, indexOrFileName) => {
    let updatedFiles;
    
    if (typeof indexOrFileName === 'number') {
        updatedFiles = filesDataAR.filter((_, i) => i !== indexOrFileName);
    } else {
        updatedFiles = filesDataAR.filter(file => file.file_name !== indexOrFileName);
    }
    
    const newTotalSize = updatedFiles.reduce((total, file) => {
        if (file.file_data) {
            const fileSize = (file.file_data.length * 3) / (4 * 1024 * 1024);
            return total + fileSize;
        }
        return total;
    }, 0);
    setFilesDataAR(updatedFiles);
    setTotalFileSize(newTotalSize);
};

const accessCheck = async () => {
    if (
        siteRestrRadio === 'Site is Restricted - Bird/Nest Activity is Present' &&
        towerRadio === 'Yes' &&
        groundRadio === 'Yes'
    ) {
        setAddonAlert(true);
        setAddonAlertMsg('Both Tower and Ground cannot have access when site is restricted');
        setTimeout(() => setAddonAlert(false), 6000);
    }
};

const { nestDetails, downloadAttachments } = props;
let offShore = false;
if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
    offShore = realUser.toJS().isUserOffShore
}
// Build questionnaire_files using functional state
const questionnaire_files = (attachmentsList || []).map(file => (
    <span key={file['file_name']} className="file_tag_designe" style={{ cursor: 'pointer' }}>
        <span style={{ color: '#FFF' }} onClick={() => downloadAttachments(file)}>{file['file_name']}</span>
        {/* {status !== "CLOSED" && <span onClick={() => onRemoveClick(file)}><i className="fa fa-times-circle" style={{ ... }}></i></span>} */}
    </span>
));

const renderFilesWithStatus = () => {
    return filesDataAR.map((file, index) => {
        const status = uploadStatus[file.file_name];
        let icon = null;

        if (status === 'loading') {
            icon = <CircularProgress size={20} style={{ marginLeft: '10px' }} />;
        } else if (status === 'completed') {
            icon = <CheckCircleOutlineIcon style={{ color: 'green', marginLeft: '10px' }} />;
        } else if (status === 'failed') {
            icon = <ErrorOutlineIcon style={{ color: 'red', marginLeft: '10px' }} />;
        }

        return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
                <span style={{ marginRight: '10px' }}>{file.file_name}</span>
                {icon}
            </div>
        );
    });
};

// Build the step array
const stepArray = [
    <Step active={true} key="Questionnaire">
        <StepLabel>Questionnaire </StepLabel>
        <StepContent>
            <div className="vp_stepper_content" style={{ overflow: 'hidden' }}>
                <div className="row ">
                    <div className="col-md-12 align-middle" style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>
                        <h4>Questionnaire View</h4>
                    </div>
                </div>
                <table className="table sortable table-bordered text-center site-table" style={{ maxHeight: "100px", background: "#FFF" }}>
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Response</th>
                        </tr>
                    </thead>
                    <tbody className="vzwtable text-left" style={{ fontSize: "2vh" }}>
                        <tr>
                            <td><b> 1. Work Type and Priority </b></td>
                            <td>{nestDetails ? nestDetails.work_type : ''} </td>
                        </tr>
                        <tr>
                            <td><b>2. Field Contact Information (person completing this NQ) </b></td>
                            <td>Name : {nestDetails.field_contact_name} <br /> Office Number : {nestDetails.field_office_number} <br /> Mobile Number : {nestDetails.field_mobile_number} <br /> Email Address : {nestDetails.field_email_address}  </td>
                        </tr>
                        <tr>
                            <td><b>3. Alternate Contact Information </b> </td>
                            <td>Name : {nestDetails.alt_name} <br /> Office Number : {nestDetails.alt_office_number} <br /> Mobile Number : {nestDetails.alt_mobile_number} <br /> Email Address : {nestDetails.alt_email_address} </td>
                        </tr>
                        <tr>
                            <td><b>4. Latitude Longitude</b> </td>
                            <td>Latitude : {nestDetails.lat} <br /> Longitude : {nestDetails.long} </td>
                        </tr>
                        <tr>
                            <td><b>5. Structure Type <br /> {nestDetails.structure_type === "Other" ? nestDetails.other_structure_type : ""} </b> </td>
                            <td>{nestDetails.structure_type} <br /> {nestDetails.other_structure_type}</td>
                        </tr>
                        <tr>
                            <td><b>6. Structure Height</b> </td>
                            <td>{nestDetails.structure_height} </td>
                        </tr>
                        <tr>
                            <td><b>7. Is the structure VZW owned and managed? <br />
                                If "No", the structure is owned by a third party and their avian policy must be followed to get an NTP<br />
                                If you answered 'No', has the structure owner provided permission to use Verizon's Avian Protection Program?</b> </td>
                            <td>{nestDetails.is_owned} <br />{nestDetails.owner_comment} <br />{nestDetails.is_vapp_permission}</td>
                        </tr>
                        <tr>
                            <td><b>8. Does the antenna site support critical infrastructure and/or
                                emergency <br /> services (i.e. E911, local law enforcement)?</b> </td>
                            <td>{nestDetails.antenna_site_support} </td>
                        </tr>
                        <tr>
                            <td><b>9. What work activities will be performed and where? <br />
                                If ground work is to be performed, will it be INSIDE or OUTSIDE the shelter?<br />
                                If heavy equipment is to be utilized, please specify what (man lift, crane, etc.)</b> </td>
                            <td>{nestDetails.work_activities} <br /> {nestDetails.type_of_ground_work} </td>
                        </tr>
                        <tr>
                            <td><b> 10. Will the work create disturbances in the form of:</b> </td>
                            <td>Human activity within view of the nest? {nestDetails.disturbance_human_activity} <br /> Short duration of noise? {nestDetails.disturbance_noise} <br /> Constant Noise? {nestDetails.disturbance_constant_noises} <br /> Ground Vibration?  {nestDetails.disturbance_ground_vibration} </td>
                        </tr>
                        <tr>
                            <td><b>11. What distance (approximately) is the work area from the nest? </b></td>
                            <td>{nestDetails.nest_distance} </td>
                        </tr>
                        <tr>
                            <td><b>12. What duration of time will the work require?</b> </td>
                            <td>{nestDetails.duration_of_time} </td>
                        </tr>
                        <tr>
                            <td><b>13. Is there currently bird activity at or near the nest?</b> </td>
                            <td>{nestDetails.current_bird_activity} </td>
                        </tr>
                        <tr>
                            <td><b>14. Has a biologist determined the bird species occupying the nest? <br /> If yes, what type of bird?</b> </td>
                            <td>{nestDetails && nestDetails.biologist_birdtype ? "Yes" : "No"} <br /> {nestDetails.biologist_birdtype} </td>
                        </tr>
                        <tr>
                            <td><b>15. What is the current surrounding land use? </b></td>
                            <td>{nestDetails.current_land_use} </td>
                        </tr>
                        <tr>
                            <td><b>16. Request Bird Nest Removal Instructions (Subject to additional fees and time for processing and approval)</b> </td>
                            <td>{nestDetails.nest_removal_permit_req} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </StepContent>
    </Step>,

    // ...Add your SiteAccessRestriction step here, as previously converted...
   <Step active={true} key="SiteAccessRestriction">
        <StepLabel>Site Access Restriction</StepLabel>
        <StepContent>
            <div className="vp_stepper_content custom-table-responsive">
                <table className="table sortable table-bordered text-center site-table" style={{ maxHeight: "100px", "background": "#FFF", overflowX: 'hidden' }}>
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="vzwtable text-left" >
                        <div style={{ 'paddingTop': '20px', 'paddingLeft': '10px' }}>
                            <div className="row ">
                                <div className="col-md-12 float-left" style={{ 'paddingLeft': '30px' }}>
                                    <div className="radio" onChange={handleInputChangeRadio} value={siteRestrRadio} style={{ display: 'flex', maxWidth: '100%', flexDirection: "column" }} >
                                        <label className="Form-label" style={{ "font-size": "16px" }} >
                                            <input type="radio" name="siteRestriction" value='Site is Not Restricted' className="Form-check" checked={siteRestrRadio === 'Site is Not Restricted' ? true : false} style={{ marginRight: "5px", marginTop: "4px" }} disabled={status === "CLOSED"} /> Site is Not Restricted
                                        </label>
                                        <label className="Form-label" style={{ "font-size": "16px" }} >
                                            <input type="radio" name="siteRestriction" value='Site is Restricted - Bird/Nest Activity is Present' className="Form-check" checked={siteRestrRadio === 'Site is Restricted - Bird/Nest Activity is Present' ? true : false} style={{ marginRight: "5px", marginTop: "4px" }} disabled={status === "CLOSED"} /> Site is Restricted - Bird/Nest Activity is Present
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12" style={{ fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', paddingTop: '10px' }}>
                                    <div className="col-md-4" id="Work_Order_Status">Status<span className='text-danger'>*</span>
                                        <Select
                                            name="filterWorkStatus"
                                            value={statusSelected}
                                            placeholder={"Select Status"}
                                            options={OPTIONS}
                                            onChange={(value) => setStatusSelected(value)}
                                            isDisabled={status === "CLOSED"}
                                            className="col-12 col-md-12 no-padding float-left"
                                            required
                                            styles={{ padding: '0px !important' }}
                                        />
                                    </div>
                                    <div className="col-md-4 float-left"><span className='text-danger'>*</span> Bird Identified
                                        <input
                                            className="form-control title-div-style"
                                            style={{ height: "35px" }}
                                            name="Bird"
                                            disabled={status === "CLOSED"}
                                            defaultValue={birdType}
                                            onChange={handleBirdChange}
                                        />
                                    </div>
                                    <div className="col-md-4 float-left"><span className='text-danger'>*</span> Biologist’s Name
                                        <input
                                            className="form-control title-div-style"
                                            style={{ height: "35px" }}
                                            name="BiologistName"
                                            disabled={status === "CLOSED"}
                                            defaultValue={biologistName}
                                            onChange={handleBiologistChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 float-left" style={{ 'paddingTop': '20px', "font-size": "16px", fontWeight: "bold" }}>
                                    <div className="col-md-4 float-left"> Tower Access Allowed<span className='text-danger'>*</span>
                                        <div className="radio" onChange={handleTowerRadioChange} value={towerRadio} style={{ display: 'flex' }} >
                                            <label className="Form-label" >
                                                <input type="radio" name="towerAccess" value='Yes' className="Form-check" checked={towerRadio === 'Yes'} style={{ marginRight: "5px" }} disabled={status === "CLOSED"} /> Yes
                                            </label>
                                            <label className="Form-label">
                                                <input type="radio" name="towerAccess" value='No' className="Form-check" checked={towerRadio === 'No'} style={{ marginRight: "5px", marginLeft: "12px" }} disabled={status === "CLOSED"} /> No
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-4 float-left"> Ground Access Allowed<span className='text-danger'>*</span>
                                        <div className="radio" onChange={handleGroundRadioChange} value={groundRadio} style={{ display: 'flex' }} >
                                            <label className="Form-label" >
                                                <input type="radio" name="groundAccess" value='Yes' className="Form-check" checked={groundRadio === 'Yes'} style={{ marginRight: "5px" }} disabled={status === "CLOSED"} /> Yes
                                            </label>
                                            <label className="Form-label">
                                                <input type="radio" name="groundAccess" value='No' className="Form-check" checked={groundRadio === 'No'} style={{ marginRight: "5px", marginLeft: "12px" }} disabled={status === "CLOSED"} /> No
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {addonAlert && <div className="row"><div className="col-md-4 float-right" ><MessageBox messages={List([addonAlertMsg])} onClear={clearAddonAlert} /> </div> </div>}
                            <div className="row col-md-12" style={{ paddingTop: '20px', fontSize: 'medium' }}>
                                <div className="col-md-4"><b>Follow-up Date</b>
                                    <SingleDatePicker
                                        orientation={'vertical'}
                                        verticalHeight={380}
                                        disabled={status === "CLOSED"}
                                        numberOfMonths={1}
                                        showDefaultInputIcon={false}
                                        onDateChange={followupDate => setFollowupDate(followupDate)}
                                        onFocusChange={({ focused }) => setFollowupDateFocused(focused)}    
                                        focused={followupDateFocused}
                                        isOutsideRange={() => false}
                                        date={followupDate}
                                        block
                                        placeholder='Follow-up Date'
                                    />
                                </div>
                                <div className="col-md-4"><b>Evaluation Date</b>
                                    <SingleDatePicker
                                        orientation={'vertical'}
                                        verticalHeight={380}
                                        disabled={status === "CLOSED"}
                                        numberOfMonths={1}
                                        showDefaultInputIcon={false}
                                        onDateChange={evaluationDate => setEvaluationDate(evaluationDate)}
                                        onFocusChange={({ focused }) => setEvaluationDateFocused(focused)}
                                        focused={evaluationDateFocused}
                                        isOutsideRange={() => false}
                                        date={evaluationDate}
                                        block
                                        placeholder='Evaluation Date'
                                    />
                                </div>
                                <div className="col-md-4"><b>Expiration Date</b>
                                    <SingleDatePicker
                                        orientation={'vertical'}
                                        verticalHeight={380}
                                        disabled={status === "CLOSED"}
                                        numberOfMonths={1}
                                        showDefaultInputIcon={false}
                                        onDateChange={expirationDate => setExpirationDate(expirationDate)}
                                        onFocusChange={({ focused }) => setExpirationDateFocused(focused)}
                                        focused={expirationDateFocused}
                                        isOutsideRange={() => false}
                                        date={expirationDate}
                                        block
                                        placeholder='Expiration Date'
                                    />
                                </div>
                            </div>
                            <div className="row ">
                                <div className="col-md-12 float-left" style={{ paddingTop: '20px' }}>
                                    <div className="col-md-6 float-left">
                                        <div style={{ fontWeight: 'bold', fontSize: 'medium' }}>Restriction Comments</div>
                                        <textarea cols={30} rows={4}
                                            name="restrictionComments"
                                            defaultValue={restrComments}
                                            onChange={handleRestrictionCommentsChange}
                                            style={{ height: '100px', width: '100%' }}
                                            disabled={status === "CLOSED"} />
                                    </div>
                                    <div className="col-md-6 float-left">
                                        <div style={{ fontWeight: 'bold', fontSize: 'medium' }}>Restriction Log</div>
                                        <div className="row">
                                            <div className="col-md-12" style={{ height: '100px', overflowY: 'scroll', border: '1px solid gray' }} >
                                                {nestDetails?.rstr_log &&
                                                    <div>
                                                        {nestDetails?.rstr_log.split('\n').map((item, index) => <div key={index}>{item}</div>)}
                                                    </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row ">
                            <div className="col-md-12 float-left" style={{ 'paddingLeft': '10px' }}>
                                {status != "CLOSED" && <div style={{ fontWeight: 'bold', fontSize: 'medium', paddingLeft: '30px' }}>Upload Attachments</div>}
                                {errMessage && <div style={{paddingLeft: '30px'}}>
                                    <span style={{color: 'red'}}>{errMessage}</span>
                                </div>}
                                <div className={"col-md-3 float-left"} style={{ 'paddingLeft': '30px', 'paddingTop': '10px', 'paddingBottom': '10px' }}>
                                    {(status === "CLOSED") ? null : (
                                        <>
                                            <Dropzone onDrop={(files) => onFileDrop('AccessRestriction', files)}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                                        <div {...getRootProps()}>
                                                            <input {...getInputProps()} />
                                                            <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                                        </div>
                                                    </section>
                                                )}
                                            </Dropzone>
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px', textAlign: 'center' }}>
                                                * You can only upload max 10 files with each 20MB size and total size must not exceed 100MB
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <ListOfFiles onRemoveClick={(index) => onAttachRemove('AccessRestriction', index)} fileList={filesDataAR} />
                                </div>
                            </div>
                            {/* {uploadAttachmentAlert && <div style={{ fontWeight: 'bold', fontSize: 'medium', paddingLeft: '40px', color: 'red' }}>{uploadAttachmentAlertMsg}</div>} */}
                        </div>

                        {(pageLoadingComplete && filesDataAR?.length > 0) && (
                            <div className="row">
                                <div className="col-md-12 float-left" style={{ 'paddingLeft': '10px', 'paddingTop': '20px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: 'medium', paddingLeft: '30px', marginBottom: '10px' }}>Uploading Attachments</div>
                                    <div style={{ paddingLeft: '30px' }}>
                                        {renderFilesWithStatus()}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="row ">
                            <div className="col-md-12 float-left" style={{ margin: '10px' }}>
                                <div className={"col-md-2 float-right"}>
                                    <button type="button"
                                        className="Button--secondary u-floatRight"
                                        onClick={onComplete}
                                        disabled={status == 'CLOSED' || biologistName == "" || birdType == "" || Object.keys(statusSelected).length == 0 || pageLoadingComplete}
                                        style={{ marginRight: "5px" }}>{pageLoadingComplete ? "Submitting" : "Submit"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {questionnaire_files.length > 0 &&
                            <div className="row">
                                <div className="col-md-12 float-left" style={{ marginTop: '20px', paddingBottom: '20px' }}>
                                    <div className="col-sm-12 no-padding float-left" style={{ "fontSize": "medium", "fontWeight": "600", "textAlign": "left", borderBottom: '2px solid gray' }}>
                                        <lable>Attached Files</lable>
                                    </div>
                                    <div className="col-sm-6 no-padding float-left" style={{ display: 'contents' }}>{questionnaire_files}</div>
                                    {props.downloadingAttchment && <div style={{paddingTop: '10px', display: 'flex', justifyContent: 'flex-start', marginLeft: '10px'}}>
                                        <CircularProgress size={20} style={{ color: 'red' }} />
                                        <span style={{color:'blue', paddingLeft: '5px'}}>Downloading Attachment, please wait...</span>
                                    </div>}
                                </div>
                            </div>
                        }
                    </tbody>
                </table>
            </div>
        </StepContent>
    </Step >
];

// Render the Stepper
return (
    <div>
        <style>
            {`td.Form-group>label { display:block }`}
        </style>
        <Stepper
            activeStep={
                status === 'OPEN'
                    ? 0
                    : (status === 'ACK' || status === 'PO_REQUESTED')
                    ? 1
                    : 2
            }
            orientation="vertical"
        >
            {stepArray.map((component) => component)}
        </Stepper>
    </div>
);
};

Questionnaire.propTypes = {
    nestDetails: PropTypes.object.isRequired,
    attachmentsList: PropTypes.array,
    notifref: PropTypes.shape({
        addNotification: PropTypes.func.isRequired
    }).isRequired,
    refreshDashboard: PropTypes.func.isRequired,
    handleHideModal: PropTypes.func.isRequired,
    selectedRow: PropTypes.object.isRequired,
    downloadAttachments: PropTypes.func.isRequired,
    deleteAvianAttachment: PropTypes.func,
};

export default Questionnaire;