import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { List, Map } from "immutable";
import * as SiteActions from "../actions";
import SiteDetailsSummaryTable from "./SiteDetailsSummaryTable";
import SiteContactsTable from "./SiteContactTable";
import SiteBucketTable from "./SiteBucketTable";
import SiteBirdNestTable from "./SiteBirdNestTable";
import SiteHeader from "./SiteHeader";
import Loader from "../../Layout/components/Loader";
import SiteAccessTable from "./SiteAccessTable";
import RootActive from "./../../Images/Root_Active.png";
import { getDangerousSite, fetchBucketCraneSiteDetails } from "../actions";
import { fetchMarketListEsso } from "../../UserDashboard/actions";
import SiteSafetyInformation from "./SiteSafetyInformation";
import blackbird from "./../../Images/black-bird.png";
import VSI from "./../../Images/VSI.svg";
import { FaSnowflake } from 'react-icons/fa';


const SiteInformation = (props) => {
  const dispatch = useDispatch();
 const { workORderInfo, selectedRow, getQuotes, isWorkInProgress, techId } = props;
  // Redux selectors
  const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
  const site_unid = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails", "site_unid"]));
  const reason = useSelector(state => state.getIn(["ivr", "login", site_unid, "login_reason"]));
  const user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], Map()));
  const vendorId = user.get("vendor_id");
  const unid = props.workORderInfo
    ? props.workORderInfo.get("site_unid")
      ? props.workORderInfo.get("site_unid")
      : null
    : props.selectedRow
    ? props.selectedRow.site_unid
    : "";
  const siteUnid = props.siteUnid ? props.siteUnid : unid;
  const siteDetail = useSelector(state => state.getIn(["Sites", loginId, "site", "siteDetails", siteUnid], List()));
  const site = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()));
  const siteDetaisLoading = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false));
  const showLoginForm = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", site_unid, "showLoginForm"], false));
  const showLogoutForm = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", site_unid, "showLogoutForm"], false));
  const loggedIn = reason && reason.length > 0 ? true : false;
  const ivrInfo = useSelector(state => state.getIn(["ivr", "login"], false));
  const userRole = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "vendor_role"]));
  const config = useSelector(state => state.getIn(["Users", "configData", "configData"], List()));
  const fastgroupMapping = useSelector(state => state.getIn(["UserDashboard", "marketListEsso", "markets"], List()));
  const dangerousSite = useSelector(state => {
    const ds = state.getIn(["Sites", loginId, "siteDetails", "dangerousSite"], List());
    const filteredDs = ds.toJS().length > 0 ? ds.toJS().filter(d => d.bSiteHazard === "yes") : [];
    return filteredDs;
  });
  const roofTopInfo = useSelector(state => state.getIn(["Sites", loginId, "siteDetails", "roofTopinfo"], Map()).toJS());

  const [state, setState] = useState({
    lock_unlock_request_id: "",
    vendorids: [],
    types: [],
    pageLoading: false,
    enodeBData: {},
    roofTopInfoErr: false,
    roofTopInfoError: "",
    fastGroup: [],
    BucketCrane: {},
  });

  const loader = <Loader color="#cd040b" size="35px" margin="4px" className="text-center" />;

  const initialiseComponent = useCallback(async () => {
    let { workORderInfo, vendorId, loggedIn, selectedRow, siteUnid } = props;
    let unid = workORderInfo
      ? workORderInfo.get("site_unid")
        ? workORderInfo.get("site_unid")
        : null
      : selectedRow
      ? selectedRow.site_unid
      : "";
    unid = siteUnid ? siteUnid : unid;
    setState((prevState) => ({ ...prevState, pageLoading: true }));

    if (fastgroupMapping?.size === 0) {
      await dispatch(fetchMarketListEsso(vendorId, loginId)).then((res) => {
        if (res?.essoMarkets?.marketRefData?.length > 0) {
          setState((prevState) => ({
            ...prevState,
            fastGroup: res.essoMarkets.marketRefData,
          }));
        }
      });
    }

    if (!siteDetail || siteDetail.size === 0) {
      await dispatch(SiteActions.fetchSiteDetails(loginId, unid));
    }

    await dispatch(getDangerousSite(loginId, unid));

    // Reset props like in the class component
    if (typeof props.resetProps === 'function') {
      var keys = [loginId, "site", unid, "showLoginForm"];
      props.resetProps(keys, false);
      var keys2 = [loginId, "site", unid, "showLogoutForm"];
      props.resetProps(keys2, false);
    }

    setState((prevState) => ({ ...prevState, pageLoading: false }));
  }, [dispatch, fastgroupMapping, loginId, props, siteDetail]);

  const getBucketDetails = useCallback(async () => {
    await dispatch(fetchBucketCraneSiteDetails(props.workORderInfo?.get("site_unid"))).then((res) => {
      if (res?.fetchBucketCraneSiteDetails?.result) {
        let data = res?.fetchBucketCraneSiteDetails?.result;
        setState((prevState) => ({
          ...prevState,
          BucketCrane: {
            bucket_required: data?.bucket_required === "1" ? "Yes" : data?.bucket_required === "0" ? "No" : null,
            vendor_comments: data?.vendor_comments?.length ? data.vendor_comments : "",
            crane_required: data?.crane_required === "1" ? "Yes" : data?.crane_required === "0" ? "No" : null,
            bucket_required_height: data?.bucket_required_height,
            is_tower_climable: data?.is_tower_climable === "1" ? "Yes" : data?.is_tower_climable === "0" ? "No" : null,
          },
        }));
      }
    });
  }, [dispatch, props.workORderInfo]);

  useEffect(() => {
    if (!siteDetail || siteDetail.size === 0) {
      initialiseComponent();
    }
    if (props.workORderInfo && props.workORderInfo.get("site_unid")) {
      getBucketDetails();
    }
    // eslint-disable-next-line
  }, [siteDetail, props.workORderInfo]);

  const getLockUnlockReq = (lock_unlock_request_id) => {
    setState(prevState => ({ ...prevState, lock_unlock_request_id }));
    return;
  };

  const renderCalloutzoneProjects = () => {
    let callZoneInfo = site.toJS();
    let callZoneColumns = [];
    let callOutZones = callZoneInfo.callout_zones;
    let tech_name = callZoneInfo.techname;

    if (callOutZones && callOutZones.length > 0) {
      for (let i = 0; i < callOutZones.length; i++) {
        callZoneColumns.push(
          <tbody className="vzwtable text-left" key={i}>
            <tr>
              <td scope="row"><label>Zone Period</label></td><td scope="row">{callOutZones[i].period? callOutZones[i].period : '-'}</td>
              <td scope="row"><label>Start Time</label></td><td scope="row">{callOutZones[i].start_time ? callOutZones[i].start_time : '-'}</td>
              <td scope="row"><label>Stop Time</label></td><td scope="row">{callOutZones[i].stop_time? callOutZones[i].stop_time: '-'}</td>
            </tr>
            <tr>
              <td scope="row"><label>SMS</label></td><td scope="row">{callOutZones[i].sms ? callOutZones[i].sms: '-'}</td>
              <td scope="row"><label>Manager</label></td><td scope="row">{callOutZones[i]?.mgr_name? callOutZones[i].mgr_name: '-'}</td>
              <td scope="row"><label>Manager Phone</label></td><td scope="row">{callOutZones[i].phone_no_mgr? callOutZones[i].phone_no_mgr: '-'}</td>
            </tr>
            <tr>
              <td scope="row"><label>Engineer</label></td><td scope="row">{tech_name.split(",")[0]+tech_name.split(",")[1] }</td>
              <td scope="row"><label>Engineer Phone</label></td><td scope="row">{callOutZones[i].phone_no ? callOutZones[i].phone_no: '-'}</td>
              <td scope="row"><label>Notes</label></td><td scope="row" style={{"padding": "2px"}}><pre wrap="HARD" style={{"marginTop" : "7px", "marginLeft":"6px"}}>{callOutZones[i].notes? (callOutZones[i].notes).trim(): '-'}</pre></td>
            </tr>
            <tr>
              <td scope="row"><label>Instructions</label></td><td scope="row" style={{"padding": "2px"}} colSpan="6"><pre wrap="HARD" style={{"marginTop" : "7px", "marginLeft":"6px"}}>{callOutZones[i].instructions? callOutZones[i].instructions: '-'}</pre></td>
            </tr>
            <br></br>
          </tbody>
        );
      }
      return <table className="vzwtable Table Table--hover float-left">{callZoneColumns}</table>;
    } else {
      return (
        <table className="vzwtable Table Table--hover float-left">
          <tbody>
            <tr>
              <td colSpan="6" className="text-center">
                No On Call Information available
              </td>
            </tr>
          </tbody>
        </table>
      );
    }
  };

  if (siteDetaisLoading || state.pageLoading) return loader;

  const siteProps = siteDetail && siteDetail.size > 0 ? { site: siteDetail, loading: siteDetaisLoading } : { site, loading: siteDetaisLoading };
  
  // Calculate filter props and FAST contact information
  const quoteStatuses = workORderInfo ? workORderInfo.get('quote_statuses') : null;
  const workOrderStatuses = workORderInfo ? workORderInfo.get('workorder_status') : null;
  const filtersValue = { role: userRole, quoteStatus: quoteStatuses, workOrderStatus: workOrderStatuses };
  
  let config_data = config?.toJS().configData.filter(e => e.ATTRIBUTE_CATEGORY === "ONCALL-FAST");
  let submarkets = [], contacts = [];
  if (config_data && config_data.length > 0) {
    submarkets = config_data[0].ATTRIBUTE_NAME.split(",");
    contacts = config_data[0].ATTRIBUTE_VALUE.split(",");
  }
  let contact = "";

  let site_area = site || siteDetail ? site || siteDetail : null;
  if (site_area?.get('region')) {
    let fast_group = state.fastGroup.length > 0 ? state.fastGroup : (fastgroupMapping && fastgroupMapping.toJS()?.marketRefData) ? fastgroupMapping.toJS()?.marketRefData : [];
    let mapping = fast_group.find(e => e.SUB_MARKET?.toLowerCase() == site_area.get('region')?.toLowerCase());
    let indexgroup = submarkets.indexOf(mapping?.FAST_GROUP);
    contact = contacts[indexgroup];
  }

  return (
    <div className="row" style={{ margin: "0px" }}>
      <div className="col-md-12">
        <section className="design-process-section" id="process-tab">
          <div className="">
            <div className="row" style={{ border: "1px solid #cecece" }}>
              <div className="col-12" style={{ padding: "10px", background: "rgb(0, 0, 0)", color: "#FFF" }}>
                <SiteHeader
                  site_unid={site.get("site_unid") || siteDetail.get("site_unid")}
                  user={user}
                  techId={props.techId}
                  showLogin={true}
                  showMap={false}
                  showELog={false}
                  getQuotes={props.getQuotes}
                  isWorkInProgress={props.isWorkInProgress}
                  enableSectorLock={
                    (state.vendorids.includes(vendorId?.toString()) || state.vendorids.includes("0")) &&
                    state.types &&
                    props.workORderInfo?.get("work_type") &&
                    state.types.includes(props.workORderInfo.get("work_type").toUpperCase().trim())
                  }
                  isSnap={true}
                />
              </div>
              <div className="col-12 float-left">
              <h3 className="semi-bold mt-3" style={{fontSize:'14px'}}>Site Information <img hidden={site.get("root_drive")===false || siteDetail.get("root_drive")===false} data-toggle="tooltip" title="Root Active" src={RootActive} /><img hidden={site.get("is_donor")===false || siteDetail.get("is_donor")===false} src={VSI} width={25} /> <img hidden={siteDetail?.toJS().bird_nest_activity?.bird_restriction === 'no'} data-toggle="tooltip" title="Bird Nest Activity" src={blackbird} width={25} /> {site?.get("osw_freeze") === true || siteDetail?.get("osw_freeze") === true ? (<FaSnowflake style={{ marginLeft: 5, color: '#00bcd4' }} title="Scheduled Freeze" />) : null}</h3> 
                <div className="lt-tab-content-body" style={{ marginBottom: "40px" }}>
                  <SiteDetailsSummaryTable {...siteProps} filterProps={filtersValue} esaFlag={config?.toJS()?.configData?.find((e) => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE} />
                </div>
                <h3 className="semi-bold" style={{ fontSize: "14px" }}>
                  Contacts
                </h3>
                <div className="lt-tab-content-body" style={{ marginBottom: "50px" }}>
                  <SiteContactsTable
                    contacts={site.get("contacts", List()) || siteDetail.get("contacts", List())}
                    callOutZone={site.get("callout_zone_name") || siteDetail.get("callout_zone_name")}
                    loading={siteDetaisLoading || state.pageLoading}
                    filterProps={filtersValue}
                  />
                </div>
                {workORderInfo?.get("site_unid") && (
                  <div>
                    <h3 className="semi-bold" style={{ fontSize: "14px" }}>
                      Bucket/Crane Information
                    </h3>
                    <div className="lt-tab-content-body" style={{ marginBottom: "50px" }}>
                      <SiteBucketTable BucketDetails={state.BucketCrane} />
                    </div>
                  </div>
                )}
                <h3 className="semi-bold" style={{ fontSize: "14px" }}>
                  Site Access
                </h3>
                {!window.location.pathname.includes("nestEvaluation") && (
                  <div className="lt-tab-content-body" style={{ marginBottom: "40px" }}>
                    <SiteAccessTable {...siteProps} filterProps={filtersValue} loginId={loginId} User={user.toJS()} />
                  </div>
                )}
                <h3 style={{ fontSize: "14px" }}>Bird Restriction</h3>
                <div className="lt-tab-content-body" style={{ marginBottom: "40px" }}>
                  <SiteBirdNestTable nest_info={site.get("bird_nest_activity") || siteDetail.get("bird_nest_activity")} loading={siteDetaisLoading || state.pageLoading} />
                </div>
                <h3 className="semi-bold" style={{ fontSize: "14px" }}>
                  Safety Information
                </h3>
                <div className="lt-tab-content-body" style={{ marginBottom: "40px" }}>
                  <SiteSafetyInformation {...siteProps} loading={siteDetaisLoading || state.pageLoading} />
                </div>
                {dangerousSite.length > 0 && (
                  <div>
                    <h3 className="semi-bold" style={{ fontSize: "14px" }}>
                      Event Hazard
                    </h3>
                    <div className="lt-tab-content-body" style={{ marginBottom: "40px" }}>
                      <div className="col-lg-12 col-12">
                        <div className="table-responsive">
                          <table className="vzwtable Table Table--striped Table--hover">
                            <thead>
                              <tr>
                                <th className="">Comments</th>
                                <th className="">Created Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dangerousSite.map((d, index) => (
                                <tr key={`${d.SiteHazardComments || ''}-${d.dCreated || ''}-${index}`}>
                                  <td className="">{d.SiteHazardComments ? d.SiteHazardComments : "-"}</td>
                                  <td className="">{d.dCreated ? d.dCreated : "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <h3 className="semi-bold" style={{ fontSize: "14px" }}>
                  On Call Information
                </h3>
                <div className="lt-tab-content-body">
                  <div className="col-lg-12 col-12">
                    <div className="table-responsive">{renderCalloutzoneProjects()}</div>
                  </div>
                </div>
                <h6 className="ml-3">
                  <b>FAST Contact Information :</b> {contact}
                </h6>
              </div>
              
              <style>
                {`
                a.info-ivr:hover,a.info-ivr:active{
                  color: #ed3e44 !important;
                }
                `}
              </style>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

SiteInformation.propTypes = {
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
  selectedRow: PropTypes.object,
  siteUnid: PropTypes.string,
  siteDetail: PropTypes.object,
  vendorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  config: PropTypes.object,
  fastgroupMapping: PropTypes.object,
  dangerousSite: PropTypes.array,
  roofTopInfo: PropTypes.object,
  fetchMarketListEsso: PropTypes.func,
  fetchBucketCraneSiteDetails: PropTypes.func,
  getDangerousSite: PropTypes.func,
  getRoofTopInfo: PropTypes.func,
};

export default SiteInformation;