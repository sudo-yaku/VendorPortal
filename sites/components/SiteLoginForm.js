import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Map, List, fromJS } from 'immutable';
import * as ivrActions from '../../redux/src/ivr/actions';
import * as userUtils from '../../Users/utils';
import { fetchSiteDetails } from '../actions';
import MessageBox from '../../Forms/components/MessageBox';
import * as VendorActions from "../actions";
import { logActioninDB } from '../../VendorDashboard/actions';
import { updateIVRPin, getCurrentIvrPin, getUserIVRDetails, clearOpenOswData } from '../../Users/actions';
import PropTypes from 'prop-types';

const IVR_REASON_LIST = fromJS([
  { "login_reason_id": 11000, "login_reason": "Vendor Activity - Installation/Upgrade" },
  { "login_reason_id": 11001, "login_reason": "Vendor Activity - Repair" },
  { "login_reason_id": 11002, "login_reason": "Vendor Activity - PM" },
  { "login_reason_id": 11003, "login_reason": "Vendor Activity - Other" }
]);

const SiteLoginForm = (props) => {
  const dispatch = useDispatch();
  const site_unid = props.site_unid;
  const page = props.page;

  // Selectors
  const user = userUtils.getCurrentUser(useSelector(state => state));
  const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
  const userIvrProfile = useSelector(state => state.getIn(['ivr', 'profile', user.get('login_id')], Map()));
  const message = useSelector(state => state.getIn(['http', 'requests', `logIntoIVR-${site_unid}`, 'response', 'message'], ''));
  const cellNums = useSelector(state => state.getIn(['VendorDashboard', loginId, "site", 'siteDetails', 'cell_num_list'], List()));
  const switches = useSelector(state => state.getIn(['VendorDashboard', loginId, "site", 'siteDetails', 'state_switch_cds'], List()));
  const site = useSelector(state => page === 'switch'
    ? state.getIn(['SwitchOps', 'entities', 'switches', site_unid], Map())
    : state.getIn(['Sites', 'entities', site_unid], Map())
  );
  const siteIvrProfile = useSelector(state => state.getIn(['ivr', 'login', site_unid], Map()));
  const openOswData = useSelector(state => state.getIn(['Users', 'openOsw', 'data'], List()));
  const loading = useSelector(state => state.getIn(['http', 'requests', `logIntoIVR-${site_unid}`, 'loading'], false));
  const realLoginId = useSelector(state => state.getIn(['Users', 'realUser', 'loginId']));
  const realUser = useSelector(state => state.getIn(['Users', 'entities', 'users', realLoginId], Map()));
  const ivr_Details = useSelector(state => state.getIn(['Users', 'ivr_Details'], Map()));
  const ssoUrl = realUser ? realUser.get('ssoLogoutURL') : '';
  const isssouser = realUser ? realUser.get('isssouser') : '';

  // Error handling
  let errors = List();
  if (userIvrProfile.get('pin_expired') === "yes") {
    errors = errors.push(Map({
      "status": "400",
      "title": "Bad Ivr Pin",
      "detail": "Your IVR pin has expired, please reset your pin"
    }));
  }
  const otherErrors = useSelector(state => state.getIn(['http', 'requests', `logIntoIVR-${site_unid}`, 'response', 'errors'], List()));
  errors = errors.concat(otherErrors);

  // Local state
  const [showAlarmsTicketsModal, setShowAlarmsTicketsModal] = useState(false);
  const [reason, setReason] = useState(null);
  const [loginErr, setLoginErr] = useState(false);
  const [isIVRResetLoading, setIsIVRResetLoading] = useState(false);
  const [showConfirmPinModel, setShowConfirmPinModel] = useState(false);

  // Refs
  const cdRef = useRef();
  const cellRef = useRef();
  const descRef = useRef();
  const notificationSystem = useRef();

  // Default reason
  const workORderInfo = props.workORderInfo || Map();
  const defaultReason = workORderInfo.toJS().proj_number
    ? { "login_reason_id": 11000, "login_reason": "Vendor Activity - Installation/Upgrade" }
    : { "login_reason_id": 11001, "login_reason": "Vendor Activity - Repair" };

  // Effect: componentDidMount
  useEffect(() => {
    let reasonObj = {};
    if (workORderInfo && workORderInfo.toJS().proj_number) {
      reasonObj = { "login_reason_id": 11000, "login_reason": "Vendor Activity - Installation/Upgrade" };
    } else {
      reasonObj = { "login_reason_id": 11001, "login_reason": "Vendor Activity - Repair" };
    }
    setReason(reasonObj);

    if (switches && switches.size > 0 && cdRef.current) {
      let cdValue = switches.find(item => item.endsWith("77"));
      cdRef.current.value = cdValue || switches.toJS()[0];
    }
    if (cellNums && cellNums.size > 0 && cellRef.current) {
      let vellValue = cellNums.find(item => item.length === 6);
      cellRef.current.value = vellValue || cellNums.toJS()[0];
    }

    const oswData = openOswData?.toJS?.() || [];
    if (oswData.length > 0) {
      login({ target: { elements: { cd: cdRef.current, cell: cellRef.current, reason: reasonObj } } });
      dispatch(clearOpenOswData());
    }
    // eslint-disable-next-line
  }, []);

  // Effect: componentWillUnmount
  useEffect(() => {
    return () => {
      resetMessages();
    };
    // eslint-disable-next-line
  }, []);

  const resetMessages = useCallback(() => {
    setLoginErr(false);
    dispatch(ivrActions.clearIVRLoginRequest(site_unid));
  }, [dispatch, site_unid]);

  const resetIVRPin = useCallback((ivrData) => {
    setIsIVRResetLoading(true);
    const input = {
      "ivr_profile": {
        "ivr_techid": ivrData.ivr_tech_id,
        "pin": ivrData.pin,
        "pin_expired": ivrData.pin_expired,
        "next_pin": ivrData.new_pin,
        "ani": null
      }
    };
    dispatch(updateIVRPin(input)).then(response => {
      if (response.type === 'UPDATE_IVRPIN__SUCCESS') {
        dispatch(getCurrentIvrPin("S-iopvp", user && user.get('userid'))).then(action => {
          if (action && action.type !== "GET_CURRENT_IVRPIN_FAILURE" &&
            action.response && action.response.data
            && action.response.data.getCurrentPinByUserId && action.response.data.getCurrentPinByUserId.code == 200) {
            setIsIVRResetLoading(false);
            setShowConfirmPinModel(false);
            notificationSystem.current?.addNotification?.({
              title: 'Success',
              position: "br",
              level: 'success',
              message: "IVR PIN has been successfully Sent to your mobile"
            });
            dispatch(getUserIVRDetails(loginId));
          } else {
            setIsIVRResetLoading(false);
            setShowConfirmPinModel(false);
            notificationSystem.current?.addNotification?.({
              title: 'error',
              position: "br",
              level: 'error',
              message: "Sorry unable to retieve the Pin!"
            });
          }
        });
        logActioninDB(loginId, user && user.get('email'), user && user.get('vendor_id'), null, user && user.get('vendor_area'), user && user.get('vendor_region'), "Reset IVR PIN Successful","","","");
      }
    });
  }, [dispatch, user, loginId]);

  const login = useCallback((e) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    resetMessages();
    let loginReason = reason ? reason : e.target.elements.reason;
    const inputs = e?.target?.elements;
    const input = {
      loginId: loginId,
      state_switch_cd: inputs?.cd?.value,
      generate_alarms: "yes",
      cell_num: inputs?.cell?.value,
      login_reason: loginReason?.login_reason,
      login_reason_id: loginReason?.login_reason_id,
      login_description: (inputs?.Description && inputs?.Description?.value) ? inputs?.Description?.value : loginReason?.login_reason
    };

    dispatch(ivrActions.attemptLogIntoIVR(site_unid, input, props.lock_unlock_request_id)).then(async action => {
      if (action.type === "LOG_INTO_IVR") {
        logActioninDB(loginId, user && user.get('email'), user && user.get('vendor_id'), workORderInfo && workORderInfo.get('workorder_id'), user && user.get('vendor_area'), user && user.get('vendor_region'), "Login to IVR","IVRLogin","IVRLogin",'');
        setLoginErr(false);
        let keys = [loginId, "site", site_unid, "showLoginForm"];
        await dispatch(VendorActions.resetProps(keys, false));
        let keys2 = [loginId, "site", site_unid, "showLogoutForm"];
        await dispatch(VendorActions.resetProps(keys2, true));
      } else if (action && action.response && action.response.errors) {
        setLoginErr(true);
        let keys = [loginId, "site", site_unid, "showLoginForm"];
        await dispatch(VendorActions.resetProps(keys, true));
      }
    });
  }, [dispatch, loginId, site_unid, props.lock_unlock_request_id, user, workORderInfo, reason, resetMessages]);

  const setCellNumber = useCallback((value) => {
    resetMessages();
    if (cellRef.current) cellRef.current.value = value;
  }, [resetMessages]);

  const setSwitchStateCode = useCallback((value) => {
    resetMessages();
    if (cdRef.current) cdRef.current.value = value;
  }, [resetMessages]);

  const validateCell = (e) => {
    resetMessages();
    const key = String.fromCharCode(e.keyCode || e.which);
    const regex = /[0-9]|\./;
    if (!regex.test(key) || e.target.value.length > 8) {
      e.preventDefault();
    }
  };

  const onChange = (event) => {
    resetMessages();
    const reasonId = event.target.value;
    const foundReason = IVR_REASON_LIST.find(r => r.get("login_reason_id") == reasonId);
    setReason(foundReason ? foundReason.toJS() : null);
  };

  const setCellColor = (cell) => {
    if (cell === (cellRef.current && cellRef.current.value)) {
      return 'dodgerblue';
    }
    return 'white';
  };

  const setCodeColor = (cd) => {
    if (cd === (cdRef.current && cdRef.current.value)) {
      return 'dodgerblue';
    }
    return 'white';
  };

  // SSO/Offshore logic
  let issoCondition = false;
  let offShore = false;
  if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
    offShore = realUser.toJS().isUserOffShore;
  }
  if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.includes('ssologin') || offShore === "true") {
    issoCondition = true;
  }

  let errorMsg = [];
  if (errors && errors.toJS && errors.toJS().length > 0) {
    errorMsg.push(errors.toJS()[0].message);
  }

  return (
    <form onSubmit={login} style={{ "background": "#FFF", "padding": "10px", display: "grid" }} className="Col-sm-12">
      {!loginErr && <MessageBox messages={!!message && List([message]) ? List([message]) : null} onClear={resetMessages} className="Alert--success" iconClassName="fa-thumbs-up" />}
      {!loginErr && <MessageBox messages={!!errors && typeof (errors) !== 'string' ? errors.map(error => error.get('message')) : null} onClear={resetMessages} />}
      {loginErr && <MessageBox loginErr={loginErr} messages={errorMsg} onClear={resetMessages} />}
      <style>
        {`.width100 {
            width: 100%;
        }
        .width80 {
          width: 80%;
        }
        `}
      </style>
      <div className='row'>
        {ivr_Details && ivr_Details.toJS().length > 0 && ivr_Details.toJS()[0].pin_expired === 'yes' &&
          <div className='col-md-12'>
            <div className="Form-group width100">
              <div className="Alert" style={{ 'margin-bottom': '10px', background: "#FDBD3D" }}>
                <i className="fa fa-info-circle"></i>
                Your IVR PIN is expired. Please use the Reset IVR PIN action below.
              </div>
            </div>
          </div>}
        <div className='col-md-6'>
          <div className="Form-group width80">
            <label className="Form-label" htmlFor="cell" style={{ width: '380px' }}>Cell #</label>
            <input type="text" maxLength={8} ref={cellRef} name="cell" onKeyPress={validateCell} className="form-control" required /><br />
            {cellNums.map(cell => {
              return <span key={cell}><button style={{ padding: '6px', backgroundColor: setCellColor(cell), marginBottom: '3px', color: 'black' }} id={cell} type="button" className="Button--small" onClick={() => setCellNumber(cell)}>{cell}</button>&nbsp;</span>
            })}
          </div>
        </div>
        <div className='col-md-6'>
          <div className="Form-group width80">
            <label className="Form-label" htmlFor="switch">State Switch Code</label>
            <input type="text" maxLength={8} ref={cdRef} name="cd" onKeyPress={validateCell} className="form-control" required /><br />
            {switches.map(cd => {
              return <span key={cd}><button style={{ padding: '6px', backgroundColor: setCodeColor(cd), marginBottom: '3px', color: 'black' }} id={cd} type="button" className="Button--small" onClick={() => setSwitchStateCode(cd)}>{cd}</button>&nbsp;</span>
            })}
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-6'>
          <div className="Form-group width80">
            <label className="Form-label">Reason</label>
            <select
  style={{ height: '31px', padding: '0 0 0 20px', marginTop: '0' }}
  role="combobox"
  className="Form-input"
  onChange={onChange}
  required
  value={reason ? reason.login_reason_id : ""}
>
  <option disabled value="">Choose a reason</option>
  {IVR_REASON_LIST.map(reason => (
    <option key={reason} value={reason.get('login_reason_id')}>
      {reason.get('login_reason')}
    </option>
  ))}
</select>
          </div>
        </div>
        <div className='col-md-6'>
          {(reason && reason.login_reason === "Vendor Activity - Other") ? (<div className="Form-group width80">
            <label className="Form-label" htmlFor="Description">Description</label>
            <textarea ref={descRef} name="Description" className="form-control" required /><br />
          </div>) :
            <div className="Form-group width100">
              <button id="login" type="submit" style={{ paddingRight: '2rem', paddingLeft: '2rem' }} className="Button--secondary u-floatRight" disabled={loading || issoCondition || userIvrProfile.get('pin_expired') === "yes" || (ivr_Details && ivr_Details.toJS().length > 0 && ivr_Details.toJS()[0].pin_expired === 'yes')}>
                {loading ? 'Logging in...' : 'IVR Login'}
              </button>
              {ivr_Details && ivr_Details.toJS().length > 0 && ivr_Details.toJS()[0].pin_expired === 'yes' &&
                <button style={{ paddingRight: '2rem', paddingLeft: '2rem', marginRight: "0.35rem" }} className="Button--secondary u-floatRight" type="button" onClick={() => resetIVRPin(ivr_Details.toJS()[0])}>Reset IVR PIN</button>}
            </div>
          }
        </div>
      </div>
      <div className="Form-group width100">
        {(reason && reason.login_reason === "Vendor Activity - Other") &&
          <button id="IVR Login" type="submit" style={{ paddingRight: '2rem', paddingLeft: '2rem' }} className="Button--secondary u-floatRight log-in-out-button" disabled={loading || issoCondition || userIvrProfile.get('pin_expired') === "yes" || (ivr_Details && ivr_Details.toJS().length > 0 && ivr_Details.toJS()[0].pin_expired === 'yes')}>
            {loading ? 'Logging in...' : 'Login'}
          </button>}
      </div>
    </form>
  );
};

export default SiteLoginForm;

SiteLoginForm.propTypes = {
  site_unid: PropTypes.string.isRequired,
  page: PropTypes.string.isRequired,
  workORderInfo: PropTypes.object,
  lock_unlock_request_id: PropTypes.string,
};