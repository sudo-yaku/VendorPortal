import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { List, Map } from 'immutable';
import * as ivrActions from '../../redux/src/ivr/actions';
import * as formActions from '../../Forms/actions';
import * as VendorActions from '../actions';
import { fetchLockData , fetchHealthCheckReqs, getOswIssueTypes} from '../actions';
import { siteAccessRefreshEnable } from '../actions';
import * as userUtils from '../../Users/utils';
import MessageBox from '../../Forms/components/MessageBox';
import Select from 'react-select';
import { logActioninDB } from '../../VendorDashboard/actions';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@material-ui/core";
import Loader from '../../Layout/components/Loader';

const formName = (site) => 'site-logout-form-' + site.get('siteid');

const SiteLogoutForm = (props) => {
    const dispatch = useDispatch();
    const site_unid = props.site_unid;
    const workORderInfo = props.workORderInfo;
    
    const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
    const user = useSelector(state => userUtils.getCurrentUser(state));
    const vendorId = useSelector(state => user.get('vendor_id'));
    const message = useSelector(state => state.getIn(['http', 'requests', `logoutOfIVR-${site_unid}`, 'response', 'message'], ''));
    const site = useSelector(state => state.getIn(['VendorDashboard', loginId, 'site', 'siteDetails'], Map()));
    const config = useSelector(state => state.getIn(['Users', 'configData', 'configData'], List()));
    const stateSwitch = useSelector(state => state.getIn(['ivr', 'login', site_unid, 'state_switch_cd']));
    const cellNum = useSelector(state => state.getIn(['ivr', 'login', site_unid, 'cell_num']));
    const AllcellNums = useSelector(state => state.getIn(['VendorDashboard', loginId, "site", 'siteDetails', 'cell_num_list'], List()));
    const AllStateSwitches = useSelector(state => state.getIn(['VendorDashboard', loginId, "site", 'siteDetails', 'state_switch_cds'], List()));
    const siteIvrProfile = useSelector(state => state.getIn(['ivr', 'login', site_unid], Map()));
    const errors = useSelector(state => {
      const err = state.getIn(['http', 'requests', `logoutOfIVR-${site_unid}`, 'response']);
      return !!err ? err.toJS() : {};
    });
    const loading = useSelector(state => state.getIn(['http', 'requests', `logoutOfIVR-${site_unid}`, 'loading'], false));
    const lockDataLoading = useSelector(state => state.getIn(["Sites", loginId, vendorId, workORderInfo.get('workorder_id'), props.lock_unlock_request_id, "lockDataLoading"]));
    const getHealthCheckReqs = useSelector(state => state.getIn(["Sites", loginId, "healthCheckReqs"], List()));
    const oswClosureCodes = useSelector(state => state.getIn(['Users', 'configData', 'oswClosureCodes'], List()));
    const oswIssueTypes = useSelector(state => state.getIn(["Sites", "oswIssueTypes", "issueTypes"]));
    const node_details = useSelector(state => {
      const s = state.getIn(['VendorDashboard', loginId, 'site', 'siteDetails'], Map());
      return s.toJS()?.node_details;
    });
    const userList = useSelector(state => state.getIn(['Users', 'userList'], List()));
    const vendorType = node_details ? node_details[0]?.vendor : "";
    const isEricsson = vendorType && vendorType.toLowerCase() === 'ericsson';
    const opexVendor = vendorType && vendorType.toLowerCase() === 'opex';


  // State hooks
  const [showHCResultCompletedSection, setShowHCResultCompletedSection] = useState(false);
  const [showHCResultFailedSection, setShowHCResultFailedSection] = useState(false);
  const [showHCResultNullSection, setShowHCResultNullSection] = useState(false);
  const [showWorkTaskNotesSectionVisible, setshowWorkTaskNotesSectionVisible] = useState(false);
  const [showHCResultInprogressSection, setShowHCResultInprogressSection] = useState(false);
  const [workTaskNotes, setWorkTaskNotes] = useState("");
  const [showActionButtons, setShowActionButtons] = useState(true);
  const [selectedFaultCode, setSelectedFaultCode] = useState("");
  const [selectedResolutionCode, setSelectedResolutionCode] = useState("");
  const [notes, setNotes] = useState(null);
  const [opexAutoCompleteOSW, setOpexAutoCompleteOSW] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ivrLogoutButtonDisabled, setIvrLogoutButtonDisabled] = useState(false);
  const [inputs, setInputs] = useState(null);
  const [displayStatus, setDisplayStatus] = useState(null);
  const [allowIvrLogoutYes, setAllowIvrLogoutYes] = useState(false);
  const [allowIvrLogoutNo, setAllowIvrLogoutNo] = useState(false);
  const [oswcomplete, setOswComplete] = useState(false);
  const [opexOSWCompleteNotes, setOpexOSWCompleteNotes] = useState("");
  const [showMessageFastNotes, setShowMessageFastNotes] = useState(false);
  const [selectedOswIssueTypes, setSelectedOswIssueTypes] = useState([]);
  const [oswOtherNotes, setOswOtherNotes] = useState("Other - ");
  const [oswNoneNotes, setOswNoneNotes] = useState("None - ");
  const [logoutInputs, setLogoutInputs] = useState(null);

  // Refs for cell and switch inputs
  const cellRef = useRef();
  const switchRef = useRef();

  // componentDidMount/componentWillUnmount
  useEffect(() => {
    setValue('cell_num', props.cellNum);
    setValue('state_switch_cd', props.stateSwitch);
    return () => {
      resetMessages();
    };
    // eslint-disable-next-line
  }, []);

  // Helper functions
  const resetMessages = () => {
    dispatch(ivrActions.clearIVRLogoutRequest(site_unid));
  };

  const setValue = (field, value) => {
    dispatch(formActions.setValue(formName(site), field, value));
  };

  const setCellNumber = (value) => {
    if (cellRef.current) cellRef.current.value = value;
  };

  const setSwitchStateCode = (value) => {
    if (switchRef.current) switchRef.current.value = value;
  };

  const validateCell = (e) => {
    const key = String.fromCharCode(e.keyCode || e.which);
    const regex = /[0-9]|\./;
    if (!regex.test(key) || e.target.value.length > 8) {
      e.preventDefault();
    }
  };

  const logout = (e) => {
    setIsLoading(true);
    e.preventDefault();
    setIvrLogoutButtonDisabled(true);
    const formInputs = e.target.elements;
    setLogoutInputs(formInputs);

    if (opexVendor && isEricsson && props.isWorkOrder === true) {
      setOpexAutoCompleteOSW(true);
      setIsLoading(false);
    } else if (props.lock_unlock_request_id) {
      dispatch(fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), props.lock_unlock_request_id)).then(resp => {
        let slrStatus = resp?.lockReqData?.lockRequest?.request_detail?.display_status?.toUpperCase();
        let allow_ivr_logout = resp?.lockReqData?.lockRequest?.request_detail?.allow_ivr_logout;
        setDisplayStatus(slrStatus);
        if (['COMPLETED', 'CANCELLED', 'HAND OFF'].includes(slrStatus)) {
          setIsLoading(false);
          logoutIVR(formInputs); // Pass formInputs directly
          return;
        }
        dispatch(fetchHealthCheckReqs(loginId, props.site_unid)).then(async res => {
          let enodeb_healthcheck = [];
          if (res && res.type === "FETCH_HEALTHCHECK_SUCCESS" && res.healthCheckReqs && res.healthCheckReqs.enodeb_healthcheck) {
            setIsLoading(false);
            enodeb_healthcheck = res.healthCheckReqs && res.healthCheckReqs.enodeb_healthcheck ? res.healthCheckReqs.enodeb_healthcheck : [];
            let postChecks = enodeb_healthcheck.filter(item => item.req_type === "Post-Check" && item.osw_request_id === props.lock_unlock_request_id);
            let latestPostHCResults = [];
            let nodes = node_details.map(item => item.node);
            let postCheckPassed = false;
            if (postChecks?.length > 0) {
              nodes.forEach(node => latestPostHCResults.push(postChecks.find(hcItem => hcItem.enodeb_ids.includes(node))));
              postCheckPassed = latestPostHCResults?.length > 0
                ? latestPostHCResults.every(item =>
                    item &&
                    item.hc_result != null &&
                    item.status !== null &&
                    ["COMPLETED", "PASSED"].includes(item.status.toUpperCase()) &&
                    ["COMPLETED", "PASSED"].includes(item.hc_result.toUpperCase())
                  )
                : false;
            }
            if (postCheckPassed || allow_ivr_logout === 'true') {
              dispatch(getOswIssueTypes())
              setAllowIvrLogoutYes(true);
            } else {
              setAllowIvrLogoutNo(true);
            }
          }
        });
      });
    } else {
      logoutIVR(formInputs); // Pass formInputs directly
    }
  };
  
  const logoutIVR = (inputs) => {
    resetMessages();
    if (!inputs) return;
    dispatch(ivrActions.attemptLogoutOfIVR(site_unid, {
      loginId: loginId,
      state_switch_cd: inputs.switch.value,
      generate_alarms: "yes",
      cell_num: inputs.cell.value
    })).then(action => {
      if (action.type === 'LOGOUT_OF_IVR') {
        if (props.onLogout) setTimeout(props.onLogout, 3000);
      }
      if (action.login && action.login.message && action.login.message.includes("successful")) {
        logActioninDB(
          loginId,
          user && user.get('email'),
          user && user.get('vendor_id'),
          workORderInfo && workORderInfo.get('workorder_id'),
          user && user.get('vendor_area'),
          user && user.get('vendor_region'),
          "Logout of IVR","IVRLogout","IVRLogout",""
        );
      }
      let keys = [loginId, "site", "showLoginForm"];
      dispatch(VendorActions.resetProps(keys, true));
      let keys2 = [loginId, "site", "showLogoutForm"];
      dispatch(VendorActions.resetProps(keys2, false));
    });
  };
  
  const handleWorkTaskNotes = (e) => {
    setWorkTaskNotes(e.target.value);
  };
  
  const triggerManualOSWReason = (actionCode, lock_unlock_request_id, workTaskNotes) => {
    let commentsForOSW = "";
    if (["Vendor Assist", "VP Error"].includes(actionCode)) {
      if (actionCode === 'Vendor Assist') {
        commentsForOSW = workTaskNotes;
      } else if (actionCode === "VP Error") {
        if (workTaskNotes.includes("Issues found in post check")) commentsForOSW = "Issues found in post check";
        else if (workTaskNotes.includes("Failed to pull health check results")) commentsForOSW = "Vendor IVR'd out. Failed to pull health check results for site";
        else if (workTaskNotes.includes("Post Check Results not available yet")) commentsForOSW = "Vendor IVR OUT while Post Check Results not available yet";
        else if (workTaskNotes.includes("Post health check still in progress")) commentsForOSW = "Post health check still in progress";
      }
    }
    let manualOSWPayload = {
      'manualoswrsn': actionCode,
      'manualoswrsn_comments': commentsForOSW,
      'user_id': site.get('managerid') // useSelector for site
    };
    if (actionCode) {
      dispatch(VendorActions.manualOSWReason(manualOSWPayload, lock_unlock_request_id)).then(response => {
        if (response?.data?.data?.updateManualOswReason) {
          props.notifref.addNotification({
            title: 'Success',
            position: "br",
            level: "success",
            autoDismiss: 10,
            message: response?.data?.data?.updateManualOswReason?.message
          });
        }
        if (response?.errors?.length > 0) {
          props.notifref.addNotification({
            title: 'Failure',
            position: "br",
            level: "error",
            autoDismiss: 10,
            message: "Manual OSW Reason Update Failed"
          });
        }
      });
    }
  };
  
  const updateSLRStatus = (slrStatus, workTaskNotes, actionCode) => {
    let workNoteforOpex = workTaskNotes;
    if (selectedFaultCode && selectedResolutionCode) {
      workNoteforOpex = `${workTaskNotes}^${selectedFaultCode}^${selectedResolutionCode}`;
    }
    let selectedIssueTypes = selectedOswIssueTypes?.toString() || ''
    if (selectedIssueTypes?.toLowerCase().includes('none')) {
      selectedIssueTypes = selectedIssueTypes.replace(/none/i, oswNoneNotes)
    } 
    if (selectedIssueTypes?.toLowerCase().includes('other')) {
      selectedIssueTypes = selectedIssueTypes.replace(/other/i, oswOtherNotes)
    }
    
    let workTaskNotesArray = [
      slrStatus === "COMPLETED"
        ? props.isWorkOrder === true
          ? (opexVendor && isEricsson)
            ? workNoteforOpex
            : `${workTaskNotes}^${selectedFaultCode}^${selectedResolutionCode}`
          : workTaskNotes
        : workTaskNotes
    ];
    
    if (selectedOswIssueTypes?.length > 0) {
      workTaskNotesArray.push(selectedIssueTypes);
    }
    
    let payload = {
      "status": slrStatus,
      "updated_by": user.get("fname") + ' ' + user.get("lname"),
      "work_task_notes": workTaskNotesArray
    };
    if (props.lock_unlock_request_id) {
      dispatch(VendorActions.updateSLRStatusRequest(payload, props.lock_unlock_request_id)).then(response => {
        if (actionCode) {
          triggerManualOSWReason(actionCode, props.lock_unlock_request_id, workTaskNotes);
        }
        if (response && response.data.data.updateLockStatus) {
          props.notifref.addNotification({
            title: 'Success',
            position: "br",
            level: 'success',
            autoDismiss: 10,
            message: response.data.data.updateLockStatus.iopUpdate.message
          });
          let text = slrStatus === "COMPLETED"
            ? `IVR Logout - OSW completed from ${user.get('vendor_name')}`
            : `${workTaskNotes}`;
          submitSLRNotes(text);
           if (selectedOswIssueTypes?.length > 0) {
              submitSLRNotes(selectedIssueTypes);
             }
        }
        dispatch(fetchLockData(loginId, vendorId, workORderInfo.get('workorder_id'), props.lock_unlock_request_id));
        dispatch(siteAccessRefreshEnable());
      });
    }
  };

  const submitSLRNotes = (message) => {
    // Get values from selectors
    const workOderId = workORderInfo.get('workorder_id');
    const userListJS = userList?.toJS?.() || [];
    const phone =
      userListJS.length > 0 &&
      userListJS.filter(val => val.userid == loginId.toString()).length > 0 &&
      !!userListJS.filter(val => val.userid == loginId.toString())[0].phone
        ? userListJS.filter(val => val.userid == loginId.toString())[0].phone
        : '';
  
    const notesPost = {
      "notesreqBody": {
        "site_unid": site_unid ? site_unid : '',
        "vp_req_id": props.lock_unlock_request_id,
        "text": message,
        "source": "VP",
        "created_by": user.get("fname") + ' ' + user.get("lname")
      },
      "notesAddedBy": {
        "user_id": loginId,
        "phone": phone,
      }
    };
  
    dispatch(VendorActions.submitNotes(vendorId, loginId, workOderId, notesPost, props.lock_unlock_request_id)).then(async action1 => {
      if (action1.type === 'SUBMIT_NOTES_SUCCESS') {
        props.notifref.addNotification({
          title: 'Success',
          position: "br",
          level: 'success',
          autoDismiss: 10,
          message: action1.submitNotesResp
        });
      }
    });
  };
  
  const setCellColor = (cell) => {
    if (cellRef.current && cell === cellRef.current.value) {
      return 'dodgerblue';
    }
    return 'white';
  };
  
  const setCodeColor = (cd) => {
    if (switchRef.current && cd === switchRef.current.value) {
      return 'dodgerblue';
    }
    return 'white';
  };
  
  const showNotes = () => (
    <div style={{ display: "contents", margin: "5px" }}>
      <textarea
        style={{ margin: "5px", width: "100%" }}
        rows={2}
        placeholder="Enter notes to message FAST"
        value={notes || ""}
        onChange={e => setNotes(e.target.value)}
      ></textarea>
      <div className='row' style={{ marginTop: "10px" }}>
        <div className='col-md-2'>
          <button
            style={{ width: "fit-content", padding: '0.5em 2.14em' }}
            className="Button--primary"
            disabled={!notes || notes.length === 0}
            onClick={() => {
              setShowMessageFastNotes(false);
              setNotes(null);
              setIvrLogoutButtonDisabled(false);
              setDisplayStatus(null);
              logActioninDB(
                loginId,
                user && user.get('email'),
                user && user.get('vendor_id'),
                workORderInfo && workORderInfo.get('workorder_id'),
                user && user.get('vendor_area'),
                user && user.get('vendor_region'),
                "IVR Logout - Message FAST","IVRLogout","IVRLogout - Message FAST",props.lock_unlock_request_id
              );
              if (displayStatus === 'AUTO') {
                updateSLRStatus("NEW", `VP: Auto To New: GC has completed work on site, please verify and enable IVR out, GC Comments: ${notes}`);
              } else {
                submitSLRNotes(`VP: GC has completed work on site, please verify and enable IVR out, GC Comments: ${notes}`);
              }
            }}
          >Submit</button>
        </div>
        <div className='col-md-2'>
          <button
            style={{ width: "fit-content", padding: '0.5em 2.14em' }}
            className="Button--secondary"
            onClick={() => {
              setShowMessageFastNotes(false);
              setNotes(null);
              setAllowIvrLogoutNo(true);
            }}>Back</button>
        </div>
      </div>
    </div>
  );
  
  const showWorkTaskNotesSection = (ivrLogoutType) => {
    // Use selector for oswClosureCodes
    const oswClosureCodesJS = oswClosureCodes?.toJS?.() || {};
  
    return (
      <div style={{ display: "contents", margin: "5px" }}>
        <textarea
          style={{ margin: "5px", width: "100%" }}
          rows={2}
          placeholder="Enter work task notes here"
          value={workTaskNotes}
          onChange={handleWorkTaskNotes}
        ></textarea>
        <br />
        {props.isWorkOrder && ivrLogoutType === 'success' &&
          <>
            {oswIssueTypes?.length > 0 && (
              <>
                <label className="Form-label" style={{ marginTop: "10px" }}>What did you work on today? <span style={{ color: 'red' }}>*</span></label>
                <div style={{ margin: "10px 0", display: "flex", flexWrap: "wrap", gap: "20px" }}>
                  {oswIssueTypes?.map((issueType, index) => (
                    <label key={index} style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedOswIssueTypes?.includes(issueType)}
                        disabled={isCheckboxDisabled(issueType)}
                        onChange={(e) => handleOswIssueTypeChange(issueType, e.target.checked)}
                        style={{ marginRight: "3px", cursor: "pointer" }}
                      />
                      {issueType}
                    </label>
                  ))}
                </div>
                {selectedOswIssueTypes?.includes('Other') ? (
                  <textarea
                    style={{ 
                      margin: "5px", 
                      width: "50%",
                      border:"1px solid #ccc"
                    }}
                    rows={2}
                    placeholder="Enter additional details for Other"
                    value={oswOtherNotes}
                    onChange={(e) => setOswOtherNotes(e.target.value)}
                  ></textarea>
                ) : selectedOswIssueTypes?.includes('None') ? (
                  <textarea
                    style={{ 
                      margin: "5px", 
                      width: "50%",
                      border:"1px solid #ccc"
                    }}
                    rows={2}
                    placeholder="Enter additional details for None"
                    value={oswNoneNotes}
                    onChange={(e) => setOswNoneNotes(e.target.value)}
                  ></textarea>
                ) : null}
                <br />
              </>
            )}
            <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
              <div style={{ flex: 1 }}>
                <label className="Form-label">Select Fault Code  <span style={{ color: 'red' }}>*</span> </label>
                <Select
                  name="FaultCodes"
                  style={{ margin: '5px 0' }}
                  onChange={handleFaultCode}
                  value={selectedFaultCode ? { label: selectedFaultCode, value: selectedFaultCode } : null}
                  options={Object.keys(oswClosureCodesJS).map(code => ({ label: code, value: code }))}
                  required
                />
              </div>
              {selectedFaultCode && (
                <div style={{ flex: 1 }}>
                  <label className="Form-label">Select Resolution Code <span style={{ color: 'red' }}>*</span> </label>
                  <Select
                    name="ResolutionCodes"
                    style={{ margin: '5px 0' }}
                    onChange={handleResolutionCode}
                    value={selectedResolutionCode ? { label: selectedResolutionCode, value: selectedResolutionCode } : null}
                    options={oswClosureCodesJS[selectedFaultCode]?.map(code => ({ label: code, value: code })) || []}
                    required
                  />
                </div>
              )}
            </div>
          </>
        }
        <div className='row' style={{ marginTop: "10px" }}>
          <div className='col-md-2'>
            <button
              style={{ width: "fit-content", padding: '0.5em 2.14em' }}
              className="Button--primary"
              disabled={
                props.isWorkOrder && ivrLogoutType === 'success'
                  ? (!workTaskNotes || !selectedFaultCode || !selectedResolutionCode)
                  : !workTaskNotes
              }
              onClick={() => {
                updateSLRStatus("COMPLETED", workTaskNotes, null);
                const IssueTypes = selectedOswIssueTypes?.length > 0 ? selectedOswIssueTypes.join(', ') : '';
                logActioninDB(
                  loginId,
                  user && user.get('email'),
                  user && user.get('vendor_id'),
                  workORderInfo && workORderInfo.get('workorder_id'),
                  user && user.get('vendor_area'),
                  user && user.get('vendor_region'),
                  `IVR Logout - ${ivrLogoutType === 'success' ? "OSW and WB360 Completed" : "OSW Completed"}`,"IVRLogout",`Issue Resolved- ${ivrLogoutType === 'success' ? `Yes - ${IssueTypes}` : "No"}`,props.lock_unlock_request_id
                );
                logoutIVR(logoutInputs);
                setSelectedFaultCode('');
                setSelectedResolutionCode('');
                setWorkTaskNotes('');
                setSelectedOswIssueTypes([]);
                setOswOtherNotes("Other - ");
                setOswNoneNotes("None - ");
              }}
            >Submit</button>
          </div>
          <div className='col-md-2'>
            <button
              style={{ width: "fit-content", padding: '0.5em 2.14em' }}
              className="Button--secondary"
              onClick={() => {
                setShowActionButtons(true);
                setshowWorkTaskNotesSectionVisible(false);
                setSelectedFaultCode('');
                setSelectedResolutionCode('');
                setWorkTaskNotes('');
                setSelectedOswIssueTypes([]);
                setOswOtherNotes("Other - ");
                setOswNoneNotes("None - ");
              }}>Back</button>
          </div>
        </div>
      </div>
    );
  };

  const showOpexIVRLogoutForm = () => {
    // lock_unlock_request_id comes from props
    return (
      <div style={{ border: '1.5px solid black', padding: 20, marginBlock: 10 }}>
        <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Is the Issue Resolved?</FormLabel>
        <FormControl component="fieldset">
          <RadioGroup style={{ flexDirection: "initial" }}>
            <FormControlLabel value="Yes" control={
              <Radio onChange={() => {
                setSelectedFaultCode("EQP-Radio Failure");
                setSelectedResolutionCode("Replaced Radio");
                setOpexOSWCompleteNotes("Work completed and WB360 completed");
              }} color="primary" />
            } label="Yes" />
            <FormControlLabel value="No" control={
              <Radio onChange={() => {
                setOpexOSWCompleteNotes("Work completed and WB360 remain open");
              }} color="primary" />
            } label="No" />
          </RadioGroup>
        </FormControl>
        <div className='row' style={{ marginTop: "15px" }}>
          <div className='col-md-1'>
            <button
              style={{ width: "fit-content", padding: '0.5em 2.14em' }}
              className="Button--primary"
              disabled={!(opexOSWCompleteNotes && opexOSWCompleteNotes.length > 0)}
              onClick={() => {
                if (props.lock_unlock_request_id) {
                  updateSLRStatus("COMPLETED", opexOSWCompleteNotes, null);
                }
                logoutIVR(logoutInputs);
                setOpexAutoCompleteOSW(false);
                setIvrLogoutButtonDisabled(false);
                setSelectedFaultCode('');
                setSelectedResolutionCode('');
                setOpexOSWCompleteNotes('');
              }}
            >Submit</button>
          </div>
          <div className='col-md-1' style={{ marginLeft: "35px" }}>
            <button
              style={{ width: "fit-content", padding: '0.5em 2.14em' }}
              className="Button--secondary"
              onClick={() => {
                setOpexAutoCompleteOSW(false);
                setIvrLogoutButtonDisabled(false);
                setSelectedFaultCode('');
                setSelectedResolutionCode('');
                setOpexOSWCompleteNotes('');
              }}>Back</button>
          </div>
        </div>
      </div>
    );
  };
  
  const handleFaultCode = (state) => {
    setSelectedFaultCode(state.value)
    setSelectedResolutionCode("")
  };
  const handleResolutionCode = (state) => setSelectedResolutionCode(state.value);

  const handleOswIssueTypeChange = (issueType, isChecked) => {
    if (issueType === 'None') {
      if (isChecked) {
        setSelectedOswIssueTypes(['None']);
      } else {
        setSelectedOswIssueTypes([]);
        setOswNoneNotes("None - ");
      }
    } else {
      let updatedTypes = [...selectedOswIssueTypes];
      if (isChecked) {
        updatedTypes = updatedTypes.filter(type => type !== 'None');
        updatedTypes.push(issueType);
        if (selectedOswIssueTypes?.includes('None')) {
          setOswNoneNotes("None - ");
        }
      } else {
        updatedTypes = updatedTypes?.filter(type => type !== issueType);
        if (issueType === 'Other') {
          setOswOtherNotes("Other - ");
        }
      }
      setSelectedOswIssueTypes(updatedTypes);
    }
  };

  const isCheckboxDisabled = (issueType) => {
    if (issueType === 'None') {
      return selectedOswIssueTypes?.some(type => type !== 'None');
    } else {
      return selectedOswIssueTypes?.includes('None');
    }
  };

  const renderLoading = () => (
    <Loader
      color="#cd040b"
      size={'20px'}
      margin="3px"
      className="text-center"
    />
  );


return (
    <form onSubmit={logout} className="Col-sm-12 text-left" style={{ background: "#FFF", padding: "10px", display: "grid" }}>
      <MessageBox messages={message && List([message]) ? List([message]) : null} onClear={resetMessages} className="alert-success" />
      <MessageBox messages={!!errors && errors.errors && typeof (errors) !== 'string' ? [errors.errors[0].message] : null} onClear={resetMessages} className="alert-danger" />
  
      <div className='row'>
        <div className='col-md-6'>
          <div className="Form-group width100">
            <label htmlFor="cell">Cell #</label>
            <input type="text" maxLength={8} ref={cellRef} name="cell" defaultValue={cellNum} onKeyPress={validateCell} className="form-control" /><br />
            {AllcellNums.map(cell => (
              <span key={cell}>
                <button style={{ padding: '6px', backgroundColor: setCellColor(cell), marginBottom: '3px', color: 'black' }} type="button" className="Button--small" onClick={() => setCellNumber(cell)}>{cell}</button>&nbsp;
              </span>
            ))}
          </div>
        </div>
        <div className='col-md-6'>
          <div className="Form-group width100">
            <label htmlFor="switch">State Switch Code</label>
            <input type="text" maxLength={8} ref={switchRef} name="switch" defaultValue={stateSwitch} onKeyPress={validateCell} className="form-control" /><br />
            {AllStateSwitches.map(cd => (
              <span key={cd}>
                <button style={{ padding: '6px', backgroundColor: setCodeColor(cd), marginBottom: '3px', color: 'black' }} type="button" className="Button--small" onClick={() => setSwitchStateCode(cd)}>{cd}</button>&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
  
      <div className='row'>
        {siteIvrProfile.get('lockcode') &&
          <div className='col-md-6'>
            <div className="Form-group width100">
              <label className="Form-label" htmlFor="lock-code">Lock Code</label>
              <input type="text" className="form-control" id="lock-code" placeholder="Lock Code" readOnly={true} disabled={true} value={siteIvrProfile.get('lockcode', '')} />
            </div>
          </div>
        }
        <div className={siteIvrProfile.get('lockcode') ? 'col-md-6' : 'col-md-12'}>
          <button type="submit" className="Button--secondary u-floatRight" style={{ paddingRight: '2rem', paddingLeft: '2rem' }} disabled={loading || ivrLogoutButtonDisabled}>
            {loading ? 'Logging out...' : 'IVR Logout'}
          </button>
        </div>
      </div>
      <div>
        {isLoading && renderLoading()}
      </div>
      {opexAutoCompleteOSW && props.isWorkOrder === true && showOpexIVRLogoutForm()}
      {allowIvrLogoutYes && props.isWorkOrder &&
        <div className='row' style={{ display: "grid", border: "1px solid gray", margin: "5px", padding: "5px" }}>
          <label>Was the issue resolved? {showWorkTaskNotesSectionVisible ? (<><span style={{ color: 'blue' }}> (Please summarize what you have done today.)</span><span style={{ color: 'red' }}>*</span></>) : ""}</label>
          {!showWorkTaskNotesSectionVisible &&
            <div>
              <button
                style={{ width: "fit-content", padding: '0.5em 2.14em' }}
                className="Button--primary"
                onClick={() => { setshowWorkTaskNotesSectionVisible(true); setOswComplete(false); }}>Yes</button>
              <button
                style={{ width: "fit-content", padding: '0.5em 2.14em', margin: "5px" }}
                className="Button--primary"
                onClick={() => { setOswComplete(true); setshowWorkTaskNotesSectionVisible(true); }}>No</button>
            </div>
          }
          {showWorkTaskNotesSectionVisible && !oswcomplete && showWorkTaskNotesSection('success')}
          {showWorkTaskNotesSectionVisible && oswcomplete && showWorkTaskNotesSection()}
        </div>
      }
      {allowIvrLogoutYes && !props.isWorkOrder &&
        <div className='row' style={{ display: "grid", border: "1px solid gray", margin: "5px", padding: "5px" }}>
          <label>Please summarize what you have done today.<span style={{ color: 'red' }}>*</span></label>
          <textarea
            style={{ margin: "5px", width: "100%" }}
            rows={2}
            placeholder="Enter work task notes here"
            value={workTaskNotes}
            onChange={handleWorkTaskNotes}
          ></textarea>
          <div className='row' style={{ marginTop: "10px" }}>
            <div className='col-md-2'>
              <button
                style={{ width: "fit-content", padding: '0.5em 2.14em' }}
                className="Button--primary"
                disabled={!workTaskNotes}
                onClick={() => {
                  setAllowIvrLogoutYes(false);
                  setWorkTaskNotes('');
                  logActioninDB(
                    loginId,
                    user && user.get('email'),
                    user && user.get('vendor_id'),
                    workORderInfo && workORderInfo.get('workorder_id'),
                    user && user.get('vendor_area'),
                    user && user.get('vendor_region'),
                    "IVR Logout- OSW Completed project","IVRLogout","Project - Issue post check passed", props.lock_unlock_request_id
                  );
                  updateSLRStatus("COMPLETED", workTaskNotes, null);
                  logoutIVR(logoutInputs);
                }}>Submit</button>
            </div>
            <div className='col-md-2'>
              <button
                style={{ width: "fit-content", padding: '0.5em 2.14em' }}
                className="Button--secondary"
                onClick={() => {
                  setAllowIvrLogoutYes(false);
                  setWorkTaskNotes('');
                  setIvrLogoutButtonDisabled(false);
                }}>Back</button>
            </div>
          </div>
        </div>
      }
      {allowIvrLogoutNo &&
        <div className='row' style={{ display: "grid", border: "1px solid gray", margin: "5px", padding: "5px" }}>
          <label>Must have a passing Post Check before IVR logout</label>
          {!showWorkTaskNotesSectionVisible &&
            <div style={{ display: "flex", justifyContent: "start" }}>
              <button
                style={{ width: "fit-content", padding: '0.5em 2.14em', margin: "5px" }}
                className="Button--primary"
                onClick={() => {
                  setIvrLogoutButtonDisabled(false);
                  setAllowIvrLogoutNo(false);
                  logActioninDB(
                    loginId,
                    user && user.get('email'),
                    user && user.get('vendor_id'),
                    workORderInfo && workORderInfo.get('workorder_id'),
                    user && user.get('vendor_area'),
                    user && user.get('vendor_region'),
                    "IVR Logout - Continue to Work","IVRLogout","Continue work",props.lock_unlock_request_id
                  );
                }}>Continue to work</button>
              <button
                style={{ width: "fit-content", padding: '0.5em 2.14em', margin: "5px" }}
                className="Button--primary"
                onClick={() => { setAllowIvrLogoutNo(false); setShowMessageFastNotes(true); }}>Message FAST</button>
            </div>
          }
        </div>
      }
      {showMessageFastNotes && showNotes()}
    </form>
  );
}
SiteLogoutForm.propTypes = {
  site_unid: PropTypes.string.isRequired,
  workORderInfo: PropTypes.object,
  lock_unlock_request_id: PropTypes.string,
  isSnap: PropTypes.bool,
  isWorkOrder: PropTypes.bool,
  notifref: PropTypes.object,
  onLogout: PropTypes.func,
};


export default SiteLogoutForm;

