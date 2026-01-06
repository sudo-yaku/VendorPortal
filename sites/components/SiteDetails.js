import React, { useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { List, Map } from "immutable";
import * as SiteActions from "../actions";
import SiteLoginForm from './SiteLoginForm';
import WorkWithFAST from './WorkWithFAST';
import SiteLogoutForm from './SiteLogoutForm';
import Loader from '../../Layout/components/Loader';
import IVRInstruction from '../../IVRLoginInstruction.docx';
import moment from 'moment-timezone';
import SiteAlarms from "./SiteAlarms";
import ajax from '../../ajax';

const fetchVSMAlarmsForSite = (unid) => {
  if (!unid) return Promise.resolve({ type: "FETCH_VSM_ALARMS_FOR_SITE_FAILURE" });
  return ajax.post('/graphql4g', {
    query: `
      query($site_unid:String!){
        getAlarm(site_unid:$site_unid){
          alarms {
            alertid
            amo_name
            description
            correlates_count
            count
            created
            updated
            severity
            name
            manager_name
            site_unid
            siteid
            cell_number
            site_name
            switch
            source
            alarmsource
            remedyticket
            device_name
            group_name
            techid
          }
          unmapped_alarms {
            amo_name
            description
            created
            updated
            severity
            market
            enodeb_id
            name
            manager_name
          }
        }
      }
    `,
    variables: { site_unid: unid }
  }).then(res => {
    const alarms = res.data?.data?.getAlarm?.alarms || [];
    return {
      type: "FETCH_VSM_ALARMS_FOR_SITE_SUCCESS",
      alarms
    };
  }).catch(() => ({
    type: "FETCH_VSM_ALARMS_FOR_SITE_FAILURE"
  }));
};

const selectLoginId = state => state.getIn(["Users", "currentUser", "loginId"], "");
const selectSite = (state, loginId) => state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List());
const selectSiteDetail = (state, loginId, unid) => state.getIn(["Sites", loginId, "site", "siteDetails", unid], List());
const selectShowLoginForm = (state, loginId, site_unid) => state.getIn(["VendorDashboard", loginId, "site", site_unid, "showLoginForm"]);
const selectShowLogoutForm = (state, loginId, site_unid) => state.getIn(["VendorDashboard", loginId, "site", site_unid, "showLogoutForm"]);
const selectSiteDetaisLoading = (state, loginId) => state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false);
const selectUser = (state, loginId) => state.getIn(["Users", "entities", "users", loginId], Map());
const selectUserRole = (state, loginId) => state.getIn(['Users', 'entities', 'users', loginId, 'vendor_role']);
const selectConfig = state => state.getIn(['Users', 'configData', 'configData'], List());
const selectSubmarket = (state, loginId) => state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "");
const selectIvrInfo = state => state.getIn(['ivr', 'login'], false);

const SiteDetails = (props) => {
  const dispatch = useDispatch();
  const [lock_unlock_request_id, setLockUnlockRequestId] = useState('');
  const [vendorids, setVendorIds] = useState([]);
  const [types, setTypes] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [enodeBData, setEnodeBData] = useState({});
  const [alarmsSelected, setAlarmsSelected] = useState(true);
  const [isAHoliday, setIsAHoliday] = useState(false);
  const [holidayEventError, setHolidayEventError] = useState(false);
  const [isOffHours, setIsOffHours] = useState(true);
  const [offHoursMessage, setOffHoursMessage] = useState('');
  const [businessHoursMessage, setBusinessHoursMessage] = useState("");
  const [timeZone, setTimeZone] = useState("");

  const vendoridsRef = useRef(vendorids);
  const typesRef = useRef(types);
  useEffect(() => { vendoridsRef.current = vendorids }, [vendorids]);
  useEffect(() => { typesRef.current = types }, [types]);

  const loginId = useSelector(selectLoginId);
  const workORderInfo = props.workORderInfo;
  const selectedRow = props.selectedRow;
  const unid = workORderInfo ? (workORderInfo.get('site_unid') ? workORderInfo.get('site_unid') : null) : selectedRow ? selectedRow.site_unid : '';
  const site = useSelector(state => selectSite(state, loginId));
  const siteDetail = useSelector(state => selectSiteDetail(state, loginId, unid));
  const site_unid = site.get('site_unid');
  const showLoginForm = useSelector(state => selectShowLoginForm(state, loginId, site_unid));
  const showLogoutForm = useSelector(state => selectShowLogoutForm(state, loginId, site_unid));
  const siteDetaisLoading = useSelector(state => selectSiteDetaisLoading(state, loginId));
  const user = useSelector(state => selectUser(state, loginId));
  const userRole = useSelector(state => selectUserRole(state, loginId));
  const config = useSelector(selectConfig);
  const submarket = useSelector(state => selectSubmarket(state, loginId));
  const ivrInfo = useSelector(selectIvrInfo);
  const vendorId = user.get('vendor_id');
  const reason = useSelector(state => state.getIn(['ivr', 'login', site_unid, 'login_reason']));
  const loggedIn = (reason && reason.length > 0) ? true : false;

  const loader = <Loader color="#cd040b" size="35px" margin="4px" className="text-center" />;

  const resetProps = useCallback((keys, value) => {
    dispatch(SiteActions.resetProps(keys, value));
  }, [dispatch]);

  const openLoginForm = useCallback((site_unid) => {
    const loginKeys = [loginId, "site", site_unid, "showLoginForm"];
    const logoutKeys = [loginId, "site", site_unid, "showLogoutForm"];
    resetProps(logoutKeys, false); // Always close logout form
    resetProps(loginKeys, true);   // Always open login form
  }, [loginId, resetProps]);
  
  const openLogoutForm = useCallback((site_unid) => {
    const loginKeys = [loginId, "site", site_unid, "showLoginForm"];
    const logoutKeys = [loginId, "site", site_unid, "showLogoutForm"];
    resetProps(loginKeys, false);  // Always close login form
    resetProps(logoutKeys, true);  // Always open logout form
  }, [loginId, resetProps]);

  const openLoginLogoutForm = useCallback((site_unid) => {
    if (loggedIn) {
      openLogoutForm(site_unid);
    } else {
      openLoginForm(site_unid);
    }
    return;
  }, [loggedIn, openLoginForm, openLogoutForm]);

  const getLockUnlockReq = (lock_unlock_request_id) => {
    if (props.getLockUnlockReq) {
      props.getLockUnlockReq(lock_unlock_request_id);
    } else {
    }
    setLockUnlockRequestId(lock_unlock_request_id);
    return;
  };

  const initialiseComponent = useCallback(
    async (isMounted = true) => {
      let switch_name = '';
      openLoginLogoutForm(unid);

      if (siteDetail && siteDetail.size > 0) {
        let action = siteDetail.toJS();
        switch_name = action && action.switch || '';
        let enodeBDataArr = action.node_details && action.node_details.length > 0 ? action.node_details : [];
        let config_data = config.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "HEALTHCHECK_INVD_SBMARKET");
        let submarkets_arr = [];
        if (config_data && config_data.length > 0 && config_data[0].ATTRIBUTE_VALUE) {
          submarkets_arr = config_data[0].ATTRIBUTE_VALUE.split(",");
        }
        let submarketfilter = submarkets_arr.filter(_ => _ == action.region);
        if (submarketfilter.length > 0) {
          enodeBDataArr = enodeBDataArr.filter(e => e.type === "4G");
        }
        let radio_cell_list = enodeBDataArr.length > 0 ? enodeBDataArr.map(inval => ({
          "enodeb_id": inval.node ? inval.node : '',
          "radio_units": [],
          "cell_list": [],
          "vendor": inval.vendor ? inval.vendor : ''
        })) : [];
        if (isMounted) setEnodeBData({ radio_cell_list: radio_cell_list });
        if (isMounted) setPageLoading(false);
      } else {
        if (isMounted) setPageLoading(true);
        await dispatch(SiteActions.fetchSiteDetails(loginId, unid)).then(async action => {
          if (action && action.type === "FETCH_SITEDETAILS_SUCCESS") {
            let switch_name = action && action.site && action.site.switch || '';
            let enodeBDataArr = action && action.site && action.site.node_details && action.site.node_details.length > 0 ? action.site.node_details : [];
            let config_data = config.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "HEALTHCHECK_INVD_SBMARKET");
            let submarkets_arr = [];
            if (config_data && config_data.length > 0) {
              submarkets_arr = config_data[0].ATTRIBUTE_VALUE.split(",");
            }
            let submarketfilter = submarkets_arr.filter(_ => _ == action.site.region);
            if (submarketfilter.length > 0) {
              enodeBDataArr = enodeBDataArr.filter(e => e.type === "4G");
            }
            let radio_cell_list = enodeBDataArr.length > 0 ? enodeBDataArr.map(inval => ({
              "enodeb_id": inval.node ? inval.node : '',
              "radio_units": [],
              "cell_list": [],
              "vendor": inval.vendor ? inval.vendor : ''
            })) : [];
            if (isMounted) setEnodeBData({ radio_cell_list: radio_cell_list });
            if (isMounted) setPageLoading(false);
          } else {
            if (isMounted) setPageLoading(false);
          }
        });
      }

      if (user.get('vendor_category') !== 'Nest Evaluation') {
        await dispatch(SiteActions.fetchSectorLockData(vendorId, loginId, unid)).then(async action => {
          if (action.type === "FETCH_SECTORLOCKDATA_SUCCESS") {
            const refData = !!action.sectorLockData && !!action.sectorLockData.getSectorLockData && !!action.sectorLockData.getSectorLockData.refData ? action.sectorLockData.getSectorLockData.refData : [];
            var lock_unlock_request_id;
            const _vendorids = refData.map(val => val.VENDOR_ID);
            const siteData = !!action.sectorLockData && !!action.sectorLockData.getSectorLockData && !!action.sectorLockData.getSectorLockData.siteData ? action.sectorLockData.getSectorLockData.siteData.filter(v => v.SECTOR_REQUEST_TYPE == "Breakfix"|| v.SECTOR_REQUEST_TYPE == "Breakfix-Ericsson Opex" ) : [];
            var statusArr = ["CANCELLED", "COMPLETED"];
            var workPendingStatus = ['NEW', 'IN_PROGRESS'];
            let filteredLockData = siteData.filter(val => val.WORK_ORDER_ID == workORderInfo.get('workorder_id') && ((!statusArr.includes(val.REQUEST_STATUS)) || (val.REQUEST_STATUS === 'HAND_OFF' && moment(val.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'))));
            if (siteData.filter(v => v.WORK_ORDER_ID != workORderInfo.get('workorder_id')).length == 0 || siteData.filter(v => v.WORK_ORDER_ID != workORderInfo.get('workorder_id') && ((workPendingStatus.includes(v.REQUEST_STATUS)) || (v.REQUEST_STATUS === 'HAND_OFF' && moment(v.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')))).length == 0) {
              if (!!filteredLockData && filteredLockData.length === 0) {
                lock_unlock_request_id = '';
              } else if (!!filteredLockData && filteredLockData.length > 0) {
                lock_unlock_request_id = siteData.filter(val => !statusArr.includes(val.REQUEST_STATUS) && val.WORK_ORDER_ID == workORderInfo.get('workorder_id')).sort((a, b) => {
                  if (new Date(a.CREATED_DATE) < new Date(b.CREATED_DATE)) {
                    return 1;
                  } else if (new Date(a.CREATED_DATE) > new Date(b.CREATED_DATE)) {
                    return -1;
                  } else {
                    return 0;
                  }
                })[0].LOCK_UNLOCK_REQUEST_ID.toString();
              } else {
                lock_unlock_request_id = '';
              }
            } else {
              lock_unlock_request_id = '';
            }
            const _types = refData.map(val => val.WORK_TYPE.toUpperCase().trim()).join(',').split(',');
            if (isMounted) setVendorIds(_vendorids);
            if (isMounted) setTypes(_types);
            if (isMounted) setLockUnlockRequestId(lock_unlock_request_id);
            vendoridsRef.current = _vendorids;
            typesRef.current = _types;
          }
        });
      }

      var keys = [loginId, "site", unid, "showLoginForm"];
      resetProps(keys, false);
      var keys2 = [loginId, "site", unid, "showLogoutForm"];
      const currentVendorIds = vendoridsRef.current || [];
      const currentTypes = typesRef.current || [];
      if (
        loggedIn &&
        (currentVendorIds.includes(vendorId?.toString()) || currentVendorIds.includes('0')) &&
        workORderInfo &&
        currentTypes.includes(workORderInfo.get('work_type')?.toUpperCase().trim())
      ) {
        resetProps(keys2, true);
      } else {
        resetProps(keys, true);
        resetProps(keys2, false);
      }
    },
    [
      dispatch,
      loginId,
      unid,
      siteDetail,
      config,
      user,
      vendorId,
      workORderInfo,
      loggedIn,
      resetProps,
      openLoginLogoutForm
    ]
  );

  useEffect(() => {
    let isMounted = true;
    const safeInitialiseComponent = async () => {
      await initialiseComponent(isMounted);
    };
    safeInitialiseComponent();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const safeInitialiseComponent = async () => {
      await initialiseComponent(isMounted);
      if(!loggedIn && !alarmsSelected){
        setAlarmsSelected(true)
      }else if(loggedIn){
        setAlarmsSelected(false)   
      }
    };
    safeInitialiseComponent();
    return () => {
      isMounted = false;
    };
  }, [loggedIn]);

  const getAlarmsAndFastTabs = useCallback(() => {
    let isPendingStatus = workORderInfo ? workORderInfo.get('workorder_status')?.toUpperCase() === 'WORKPENDING' : null;
    let workType = workORderInfo ? workORderInfo.get('work_type') : null;
    return (
      <div className="row" style={{ background: "#FFF", margin: "0px 0px 25px 0px" }}>
        <div className="subnav" style={{ borderBottom: alarmsSelected ? "3px solid black" : "3px solid white" }}>
          <button className="subnavbtn" onClick={() => setAlarmsSelected(true)}>Site Alarms</button>
        </div>
        {(loggedIn && showLogoutForm && isPendingStatus && (vendorids.includes(vendorId?.toString()) || vendorids.includes('0')) && types.includes(workType?.toUpperCase().trim())) ?
          <div className="subnav" style={{ borderBottom: alarmsSelected ? "3px solid white" : "3px solid black" }}>
            <button className="subnavbtn" onClick={() => setAlarmsSelected(false)}>Work with FAST</button>
          </div> : null}
      </div>
    );
  },[loggedIn,showLogoutForm,alarmsSelected]);

  if (siteDetaisLoading || pageLoading || (user && user.get('vendor_name') == null)) return loader;
  const workType = workORderInfo ? workORderInfo.get('work_type') : null;
  const isPendingStatus = workORderInfo ? workORderInfo.get('workorder_status')?.toUpperCase() === 'WORKPENDING' : null;

  return (
    <div className="row" style={{ margin: "0px" }}>
      <div className="col-md-12">
        <section className="design-process-section" id="process-tab">
          <div className="">
            <div className="row" style={{ border: "1px solid #cecece" }}>
              <style>
                {`
                  a.info-ivr:hover,a.info-ivr:active{
                    color: #ed3e44 !important;
                  }
                `}
              </style>
              {user.get('vendor_category') !== 'Nest Evaluation' ? !loggedIn && showLoginForm && (
                <div className="col-12" style={{ background: "#ECEFF1", padding: "20px" }}>
                  <div className="col-md-12" style={{ padding: "10px 0px", background: "black", color: "#FFF", textAlign: "center" }}>
                    IVR LOGIN <a href={IVRInstruction} className="info-ivr" download="IVRLoginInstruction.docx" style={{ float: "right", margin: "0 8px", fontSize: "16px", cursor: "pointer", color: "#FFF", transition: "0.1s" }}><i className="fa fa-info-circle"></i></a>
                  </div>
                  <SiteLoginForm lock_unlock_request_id={lock_unlock_request_id} site_unid={site.get('site_unid')} workORderInfo={workORderInfo} enableSectorLock={(vendorids.includes(vendorId?.toString()) || vendorids.includes('0')) && types.includes(workType?.toUpperCase().trim())} />
                  { getAlarmsAndFastTabs()}
                  {!global.NODE_ENV.includes('production') && !alarmsSelected &&
                    (isPendingStatus &&
                      (vendorids.includes(vendorId?.toString()) || vendorids.includes('0')) &&
                      types.includes(workType?.toUpperCase().trim())) ?
                    <WorkWithFAST IS_WORK_DAY={false} isSnap={false} site_unid={site.get('site_unid')} workORderInfo={workORderInfo}
                      notifref={props.notifref} getLockUnlockReq={getLockUnlockReq} lock_unlock_request_id={lock_unlock_request_id}
                      businessHoursMessage={businessHoursMessage}
                      enodeBData={enodeBData} isHoliday={isAHoliday} isOffHours={isOffHours} offHoursMessage={offHoursMessage}
                      timeZone={timeZone}
                      fromRecentActivity={props.fromRecentActivity}
                      selectedRecentActivity={props.selectedRecentActivity} />
                    : null}
                  { alarmsSelected &&
                    <SiteAlarms
                      workORderInfo={workORderInfo}
                      selectedRow={props.selectedRow}
                      fetchVSMAlarmsForSite={fetchVSMAlarmsForSite}
                    />}
                </div>
              ) : null}

              {user.get('vendor_category') !== 'Nest Evaluation' ? loggedIn && showLogoutForm && (
                <div className="col-12" style={{ background: "#ECEFF1", padding: "20px" }}>
                  <div className="col-md-12" style={{ padding: "10px 0px", background: "black", color: "#FFF", textAlign: "center" }}>
                    IVR LOGOUT <a href={IVRInstruction} className="info-ivr" download="IVRLoginInstruction.docx" style={{ float: "right", margin: "0 8px", fontSize: "16px", cursor: "pointer", color: "#FFF", transition: "0.1s" }}><i className="fa fa-info-circle"></i></a>
                  </div>
                  <SiteLogoutForm
                    site_unid={site.get('site_unid')}
                    workORderInfo={workORderInfo}
                    lock_unlock_request_id={lock_unlock_request_id}
                    isSnap={true}
                    isWorkOrder={true}
                    notifref={props.notifref}
                  />
                  {getAlarmsAndFastTabs()}
                  {!alarmsSelected && (isPendingStatus && (vendorids.includes(vendorId?.toString()) || vendorids.includes('0')) && types.includes(workType?.toUpperCase().trim())) ?
                    <WorkWithFAST
                      site_unid={site.get('site_unid')}
                      workORderInfo={workORderInfo}
                      notifref={props.notifref}
                      getLockUnlockReq={getLockUnlockReq}
                      lock_unlock_request_id={lock_unlock_request_id}
                      enodeBData={enodeBData}
                      isSnap={false}
                      selectedRow={props.selectedRow}
                      fromRecentActivity={props.fromRecentActivity}
                      selectedRecentActivity={props.selectedRecentActivity} /> : null}
                  {alarmsSelected &&
                    <SiteAlarms
                      workORderInfo={workORderInfo}
                      selectedRow={props.selectedRow}
                      fetchVSMAlarmsForSite={fetchVSMAlarmsForSite}
                    />}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

SiteDetails.propTypes = {
  site: PropTypes.object,
  fetchSiteDetails: PropTypes.func,
  loginId: PropTypes.string,
  siteDetaisLoading: PropTypes.bool,
  showLoginForm: PropTypes.bool,
  showLogoutForm: PropTypes.bool,
  loggedIn: PropTypes.bool,
  getQuotes: PropTypes.bool,
  workORderInfo: PropTypes.object,
  ivrInfo: PropTypes.bool,
  isWorkInProgress: PropTypes.bool,
  user: PropTypes.object,
  techId: PropTypes.string,
  userRole: PropTypes.string,
  resetProps: PropTypes.func,
  notifref: PropTypes.any,
  fromRecentActivity: PropTypes.any,
  selectedRecentActivity: PropTypes.any,
  selectedRow: PropTypes.any
};

export default SiteDetails;

function GraniteTable({ info }) {
  return (
    <div className="col-lg-12 col-12">
      <div className="table-responsive">
        <table className="vzwtable Table Table--hover">
          <tbody className="text-left">
            <tr><td><label>Restrictions:</label>{info.get('restrictions')}</td></tr>
            <tr><td><label>Directions:</label><pre style={{ fontSize: 14 }}>{info.get('directions')}</pre></td></tr>
            <tr><td><label>Comments:</label>{info.get('comments')}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
GraniteTable.propTypes = { info: PropTypes.object.isRequired }