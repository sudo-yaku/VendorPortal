import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { List, Map } from "immutable";
import SiteDetailsSummaryTable from '../sites/components/SiteDetailsSummaryTable';
import SiteContactsTable from '../sites/components/SiteContactTable';
import SiteBucketTable from "../sites/components/SiteBucketTable";
import SiteBirdNestTable from '../sites/components/SiteBirdNestTable';
import SiteAccessTable from "../sites/components/SiteAccessTable";
import SiteSafetyInformation from "../sites/components/SiteSafetyInformation";
import SiteHeader from '../sites/components/SiteHeader';
import Loader from '../Layout/components/Loader';
import RootActive from '../Images/Root_Active.png';
import { fetchSiteData, getDangerousSite, fetchBucketCraneSiteDetails, resetProps } from "../sites/actions";
import { fetchMarketListEsso } from "../UserDashboard/actions";
import blackbird from '../Images/black-bird.png';
import VSI from '../Images/VSI.svg';

function SiteData(props) {
    const dispatch = useDispatch();

    // Selectors
    const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
    const site_unid = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails", "site_unid"]));
    const reason = useSelector(state => state.getIn(['ivr', 'login', site_unid, 'login_reason']));
    const user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], Map()));
    const vendorId = user.get('vendor_id');
    const unid = props.workORderInfo ? props.workORderInfo.get('site_unid') ? props.workORderInfo.get('site_unid') : null : props.selectedRow ? props.selectedRow.site_unid : '';
    const siteUnid = props.siteUnid ? props.siteUnid : unid;
    const siteDetail = useSelector(state => state.getIn(["Sites", loginId, "site", "siteDetails", siteUnid], List()));
    const site = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()));
    const siteDetaisLoading = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false));
    const showLoginForm = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", site_unid, "showLoginForm"], false));
    const showLogoutForm = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", site_unid, "showLogoutForm"], false));
    const loggedIn = reason && reason.length > 0 ? true : false;
    const ivrInfo = useSelector(state => state.getIn(['ivr', 'login'], false));
    const userRole = useSelector(state => state.getIn(['Users', 'entities', 'users', loginId, 'vendor_role']));
    const config = useSelector(state => state.getIn(['Users', 'configData', 'configData'], List()));
    const fastgroupMapping = useSelector(state => state.getIn(["UserDashboard", "marketListEsso", "markets"], List()));
    const dangerousSite = useSelector(state => {
        const ds = state.getIn(["Sites", loginId, "siteDetails", "dangerousSite"], List()).toJS();
        return ds.length > 0 ? ds : [];
    });
    const roofTopInfo = useSelector(state => state.getIn(["Sites", loginId, "siteDetails", "roofTopinfo"], Map()).toJS());

    // Local state
    const [lock_unlock_request_id, setLockUnlockRequestId] = useState('');
    const [vendorids, setVendorids] = useState([]);
    const [types, setTypes] = useState([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [enodeBData, setEnodeBData] = useState({});
    const [roofTopInfoErr, setRoofTopInfoErr] = useState(false);
    const [roofTopInfoError, setRoofTopInfoError] = useState('');
    const [fastGroup, setFastGroup] = useState([]);
    const [BucketCrane, setBucketCrane] = useState({});

    const loader = <Loader color="#cd040b" size="35px" margin="4px" className="text-center" />;

    const getBucketDetails = useCallback(async () => {
        if (props.workORderInfo?.get("site_unid")) {
            const res = await dispatch(fetchBucketCraneSiteDetails(props.workORderInfo.get("site_unid")));
            if (res?.fetchBucketCraneSiteDetails?.result) {
                let data = res?.fetchBucketCraneSiteDetails?.result;
                setBucketCrane({
                    bucket_required: data?.bucket_required === '1' ? "Yes" : data?.bucket_required === '0' ? "No" : null,
                    vendor_comments: data?.vendor_comments?.length ? data.vendor_comments : '',
                    crane_required: data?.crane_required === '1' ? "Yes" : data?.crane_required === '0' ? "No" : null,
                    bucket_required_height: data?.bucket_required_height,
                    is_tower_climable: data?.is_tower_climable === '1' ? "Yes" : data?.is_tower_climable === '0' ? "No" : null,
                });
            }
        }
    }, [dispatch, props.workORderInfo]);

    const initialiseComponent = useCallback(async () => {
        let unid = props.workORderInfo ? props.workORderInfo.get('site_unid') ? props.workORderInfo.get('site_unid') : null : props.selectedRow ? props.selectedRow.site_unid : '';
        unid = props.siteUnid ? props.siteUnid : unid;
        setPageLoading(true);
        if ((fastgroupMapping?.size === 0)) {
            const res = await dispatch(fetchMarketListEsso(vendorId, loginId));
            if (res?.essoMarkets?.marketRefData?.length > 0) {
                setFastGroup(res.essoMarkets.marketRefData);
            }
        }
        if (!(siteDetail && siteDetail.size > 0)) {
            await dispatch(fetchSiteData(loginId, unid));
        }
        await dispatch(getDangerousSite(loginId, unid));
        // Uncomment if needed:
        // await dispatch(getRoofTopInfo(loginId, unid)).then(res =>
        //     res.type === "FETCH_ROOFTOP_FAILURE" && res.errors && setRoofTopInfoErr(true) && setRoofTopInfoError(res.errors.message)
        // );
        var keys = [loginId, "site", unid, "showLoginForm"];
        dispatch(resetProps(keys, false));
        var keys2 = [loginId, "site", unid, "showLogoutForm"];
        setPageLoading(false);
    }, [dispatch, props, fastgroupMapping, vendorId, loginId, siteDetail]);

    useEffect(() => {
        initialiseComponent();
        if (props.workORderInfo && props.workORderInfo.get("site_unid")) {
            getBucketDetails();
        }
        // eslint-disable-next-line
    }, []);

    const renderCalloutzoneProjects = () => {
        let callZoneInfo = {};
        callZoneInfo = site.toJS();
        let callZoneColumns = [];
        let callOutZones = callZoneInfo.callOutZones;
        let tech_name = callZoneInfo.techname;
        if (callOutZones && callOutZones.length > 0) {
            for (let i = 0; i < callOutZones.length; i++) {
                let smsList = callOutZones[i]?.sms_active_list ? JSON.parse(callOutZones[i]?.sms_active_list).map(item => Object.values(item)[0]).filter(sms => sms) : [];
                callZoneColumns.push(
                    <tbody className="vzwtable text-left" key={i}>
                        <tr>
                            <td scope="row"><label>Zone Period</label></td><td scope="row">{callOutZones[i].period ? callOutZones[i].period : '-'}</td>
                            <td scope="row"><label>Start Time</label></td><td scope="row">{callOutZones[i].start_time ? callOutZones[i].start_time : '-'}</td>
                            <td scope="row"><label>Stop Time</label></td><td scope="row">{callOutZones[i].stop_time ? callOutZones[i].stop_time : '-'}</td>
                        </tr>
                        <tr>
                            <td scope="row"><label>SMS</label></td><td scope="row">{smsList.map((sms, idx) => <label key={idx}>{sms}</label>)}</td>
                            <td scope="row"><label>Manager</label></td><td scope="row">{callOutZones[i].manager ? callOutZones[i].mgr_name : '-'}</td>
                            <td scope="row"><label>Manager Phone</label></td><td scope="row">{callOutZones[i].mgr_phone ? callOutZones[i].mgr_phone : '-'}</td>
                        </tr>
                        <tr>
                            <td scope="row"><label>Engineer</label></td><td scope="row">{tech_name ? tech_name?.split(",")[0] + tech_name?.split(",")[1] : "-"}</td>
                            <td scope="row"><label>Engineer Phone</label></td><td scope="row">{callOutZones[i].tech_phone ? callOutZones[i].tech_phone : '-'}</td>
                            <td scope="row"><label>Notes</label></td><td scope="row" style={{ "padding": "2px" }}><pre wrap="HARD" style={{ "marginTop": "7px", "marginLeft": "6px" }}>{callOutZones[i].notes ? (callOutZones[i].notes).trim() : '-'}</pre></td>
                        </tr>
                        <tr>
                            <td scope="row"><label>Instructions</label></td><td scope="row" style={{ "padding": "2px" }} colSpan="6"><pre wrap="HARD" style={{ "marginTop": "7px", "marginLeft": "6px" }}>{callOutZones[i].instructions ? callOutZones[i].instructions : '-'}</pre></td>
                        </tr>
                        <br />
                    </tbody>
                );
            }
            return <table className="vzwtable Table Table--hover float-left">{callZoneColumns}</table>;
        }
        else return <table className="vzwtable Table Table--hover float-left"><tbody><tr><td colSpan="6" className="text-center">No On Call Information available</td></tr></tbody></table>;
    };

    // --- Render logic ---
    let siteProps = {};
    if (siteDetail && siteDetail.size > 0)
        siteProps = { site: siteDetail, loading: siteDetaisLoading };
    else
        siteProps = { site, loading: siteDetaisLoading };
    const siteUnidFinal = site.get('site_unid') || siteDetail.get('site_unid');
    const workORderInfo = props.workORderInfo;
    const quoteStatuses = workORderInfo ? workORderInfo.get('quote_statuses') : null;
    const workOrderStatuses = workORderInfo ? workORderInfo.get('workorder_status') : null;
    const filtersValue = { role: userRole, quoteStatus: quoteStatuses, workOrderStatus: workOrderStatuses };
    const infoIconStyle = { "float": "right", "margin": "0 8px", "fontSize": "16px", "cursor": "pointer", "color": "#FFF", "transition": "0.1s" };
    const IVRPanStyle = { "background": "#ECEFF1", "minHeight": "980px", "paddingTop": "20px" };
    if (siteDetaisLoading || pageLoading) return loader;
    const workType = workORderInfo ? workORderInfo.get('work_type') : null;
    const isPendingStatus = workORderInfo ? workORderInfo.get('workorder_status')?.toUpperCase() === 'WORKPENDING' : null;
    let bird_nest_activity = site.get('bird_nest_activity') || siteDetail.get('bird_nest_activity') ? site.get('bird_nest_activity') || siteDetail.get('bird_nest_activity') : null;
    let config_data = config?.toJS().configData?.filter(e => e.ATTRIBUTE_CATEGORY === "ONCALL-FAST");
    let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;
    let submarkets = [], contacts = [];
    if (config_data && config_data.length > 0) {
        submarkets = config_data[0].ATTRIBUTE_NAME?.split(",");
        contacts = config_data[0].ATTRIBUTE_VALUE?.split(",");
    }
    let contact = "";

    let site_area = site || siteDetail ? site || siteDetail : null;
    if (site_area?.get('region')) {
        let fast_group = fastGroup.length > 0 ? fastGroup : (fastgroupMapping && fastgroupMapping.toJS()?.marketRefData) ? fastgroupMapping.toJS()?.marketRefData : [];
        let mapping = fast_group.find(e => e.SUB_MARKET?.toLowerCase() === site_area.get('region')?.toLowerCase());
        let indexgroup = submarkets.indexOf(mapping?.FAST_GROUP);
        contact = contacts[indexgroup];
    }

    return (
        <div className="row" style={{ "margin": "0px" }}>
            <div className="col-md-12">
                <section className="design-process-section" id="process-tab">
                    <div className="">
                        <div className="row" style={{ "border": "1px solid #cecece" }}>
                            <div className="col-12" style={{ "padding": "10px", "background": "rgb(0, 0, 0)", "color": "#FFF" }}>
                                <SiteHeader
                                    site_unid={siteUnidFinal}
                                    user={user}
                                    techId={props.techId}
                                    showLogin={true}
                                    showMap={false}
                                    showELog={false}
                                    getQuotes={props.getQuotes}
                                    isWorkInProgress={props.isWorkInProgress}
                                    enableSectorLock={(vendorids.includes(props.vendorId?.toString()) || vendorids.includes('0')) && types && workType && types.includes(workType.toUpperCase().trim())}
                                    isSnap={true}
                                />
                            </div>
                            <div className="col-12 float-left">
                                <h3 className="semi-bold mt-3" style={{ fontSize: '14px' }}>Site Information <img hidden={site.get("root_drive") === false || siteDetail.get("root_drive") === false} data-toggle="tooltip" title="Root Active" src={RootActive} /><img hidden={site.get("is_donor") === false || siteDetail.get("is_donor") === false} src={VSI} width={25} /> <img hidden={siteDetail?.toJS().bird_nest_activity?.bird_restriction === 'no'} data-toggle="tooltip" title="Bird Nest Activity" src={blackbird} width={25} /></h3>
                                <div className="lt-tab-content-body" style={{ marginBottom: '40px' }}>
                                    <SiteDetailsSummaryTable {...siteProps} filterProps={filtersValue} esaFlag={esaFlag} parentMenu='NestEvaluation' />
                                </div>
                                <h3 className="semi-bold" style={{ fontSize: '14px' }}>Contacts</h3>
                                <div className="lt-tab-content-body" style={{ marginBottom: '50px' }}>
                                    <SiteContactsTable contacts={siteDetail.get('contact', List())} callOutZone={site.get('callout_zone_name') || siteDetail.get('callout_zone_name')} loading={siteDetaisLoading || pageLoading} filterProps={filtersValue} parentMenu='NestEvaluation' />
                                </div>
                                {(props.workORderInfo && props.workORderInfo?.get("site_unid")) && <div> <h3 className="semi-bold" style={{ fontSize: '14px' }}>Bucket/Crane Information</h3>
                                    <div className="lt-tab-content-body" style={{ marginBottom: '50px' }}>
                                        <SiteBucketTable BucketDetails={BucketCrane} />
                                    </div></div>}
                                <h3 className="semi-bold" style={{ fontSize: '14px' }}>Site Access</h3>
                                {!window.location.pathname.includes("nestEvaluation") && <div className="lt-tab-content-body" style={{ marginBottom: '40px' }}>
                                    <SiteAccessTable {...siteProps} filterProps={filtersValue} loginId={loginId} User={user.toJS()} />
                                </div>}
                                <h3 style={{ fontSize: '14px' }}>Bird Restriction</h3>
                                {<div className="lt-tab-content-body" style={{ marginBottom: '40px' }}>
                                    <SiteBirdNestTable nest_info={siteDetail} loading={siteDetaisLoading || pageLoading} parentMenu='NestEvaluation' />
                                </div>}
                                <h3 className="semi-bold" style={{ fontSize: '14px' }}>Safety Information</h3>
                                {/* {roofTopInfoErr && <label className="text-danger">{roofTopInfoError}</label>} */}
                                {<div className="lt-tab-content-body" style={{ marginBottom: '40px' }}>
                                    <SiteSafetyInformation {...siteProps} loading={siteDetaisLoading || pageLoading} />
                                </div>}
                                {dangerousSite.length > 0 ? <div>
                                    <h3 className="semi-bold" style={{ fontSize: '14px' }}>Event Hazard</h3>
                                    <div className="lt-tab-content-body" style={{ marginBottom: '40px' }}>
                                        <div className="col-lg-12 col-12">
                                            <div className="table-responsive">
                                                <table className="vzwtable Table Table--striped Table--hover">
                                                    <thead>
                                                        <tr>
                                                            <th className="">Comments</th>
                                                            <th className="">Created Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>{dangerousSite.map((d, idx) =>
                                                        <tr key={idx}>
                                                            <td className="">{d.SiteHazardComments ? d.SiteHazardComments : '-'}</td>
                                                            <td className="">{d.dCreated ? d.dCreated : '-'}</td>
                                                        </tr>)}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                    : null}

                                <h3 className="semi-bold" style={{ fontSize: '14px' }}>On Call Information</h3>
                                <div className="lt-tab-content-body">
                                    <div className="col-lg-12 col-12">
                                        <div className="table-responsive">
                                            {renderCalloutzoneProjects()}
                                        </div>
                                    </div>
                                </div>
                                <h6 className="ml-3"><b>FAST Contact Information :</b> {contact}</h6>
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
}

export default SiteData;

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
GraniteTable.propTypes = { info: PropTypes.object.isRequired };

SiteData.propTypes = {
    workORderInfo: PropTypes.object,
    selectedRow: PropTypes.object,
    siteUnid: PropTypes.string,
    techId: PropTypes.string,
    getQuotes: PropTypes.func,
    isWorkInProgress: PropTypes.bool,
    vendorId: PropTypes.string,
};