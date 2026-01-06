import React, { useEffect, useState,useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { Tabs, Tab } from '@mui/material';
import { fetchSiteDetails } from '../../sites/actions';
import { fetchWorkOrderForSite } from '../actions';
import CbandTools from '../../CapitalProjectDashboard/CbandTools';
import HealthCheck from "../../sites/components/HealthCheck"
import { PrbAnalyzer }  from '../PRBAnalyzer/PrbAnalyzer';
var NotificationSystem = require('react-notification-system');
import Loader from '../../Layout/components/Loader'

const SiteToolInfo = ({ site, onShowWorkOrderModal }) => {
    const dispatch = useDispatch();
    const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
    const [siteLoading, setSiteLoading] = useState(true);
    const [samsung5gnodes, setSamsung5gnodes] = useState([]);
    const [workOrderLoading, setWorkOrderLoading] = useState(true);
    const [workOrders, setWorkOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('health');
 const notificationSystem = useRef("notificationSystem");
    useEffect(() => {
        let isMounted = true;
        if (loginId && site?.site_unid) {
            setSiteLoading(true);
            dispatch(fetchSiteDetails(loginId, site.site_unid)).then(() => {
                if (isMounted) setSiteLoading(false);
            });
        }
        return () => { isMounted = false; };
    }, [dispatch, loginId, site?.site_unid]);

    const siteList = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], new Map()));

    useEffect(() => {
        let isMounted = true;
        if (
            loginId &&
            !siteLoading &&
            siteList &&
            typeof siteList.get === 'function' &&
            siteList.get('siteid')
        ) {
            setWorkOrderLoading(true);
            const startdate = moment().subtract(7, 'days').format('YYYY-MM-DD');
            const enddate = moment().format('YYYY-MM-DD');
            const mdgId = "";
            const siteId = siteList.get('siteid');
            if (siteList && siteList.size > 0) {
            let siteDetails = siteList.toJS();
            let allnodeDetails = siteDetails.node_details;
            let nodes = allnodeDetails && allnodeDetails.length > 0 
                ? allnodeDetails.filter(i => 
                    i.vendor?.toLowerCase() === 'samsung' && 
                    i.type?.toUpperCase() === "5G" && 
                    i.node && 
                    i.node.length > 0 && 
                    i.node[i.node?.length - 4] === '3'
                  ) 
                : [];
            
            if (isMounted) {
                setSamsung5gnodes(nodes);
            }
        }else {
            // Call fetchSiteDetails if siteList is empty or doesn't have required data
            if (site?.site_unid) {
                dispatch(fetchSiteDetails(loginId, site.site_unid)).then(res => {
                    if (isMounted) {
                        if (res.type === "FETCH_SITEDETAILS_SUCCESS") {
                            let allnodeDetails = res.site?.node_details;
                            let nodes = allnodeDetails && allnodeDetails.length > 0 
                                ? allnodeDetails.filter(i => 
                                    i.vendor?.toLowerCase() === 'samsung' && 
                                    i.type?.toUpperCase() === "5G" && 
                                    i.node && 
                                    i.node.length > 0 && 
                                    i.node[i.node?.length - 4] === '3'
                                  ) 
                                : [];
                            setSamsung5gnodes(nodes);
                        } else {
                            setSamsung5gnodes([]);
                        }
                    }
                });
            }
        }
            dispatch(fetchWorkOrderForSite({ loginId, startdate, enddate, mdgId, siteId })).then((action) => {
                if (isMounted) setWorkOrderLoading(false);
                const data = Array.isArray(action?.payload?.data) ? action.payload.data : [];
                setWorkOrders(data);
                console.log(data, "WorkOrderForSite API response");
            });
        }
        return () => { isMounted = false; };
    }, [dispatch, loginId, siteLoading, siteList,site?.site_unid]);

    if (siteLoading || workOrderLoading) {
        return <Loader />;
    }

    const workOrderScreenCheck = () => {
        if (workOrders.length === 0) {
        return (
                <div style={{ border: '1px solid #ccc', margin: '113px 0', borderRadius: '4px' }}>
            <h2 style={{
                fontSize:"20px", 
                backgroundColor: '#f5f5f5', 
                padding: '12px 16px', 
                margin: '0 0 16px 0',
                borderRadius: '4px 4px 0 0'
            }}>
                Non Service Affecting Action
            </h2>
                <Tabs
                    value={activeTab}
                    onChange={(event, newValue) => setActiveTab(newValue)}
                    aria-label="site tools tabs"
                    TabIndicatorProps={{ style: { display: "none" } }} // Hide default indicator
                    sx={{
                        "& .MuiTabs-flexContainer": {
                            gap: "32px",
                        },
                        "& .MuiTab-root": {
                            fontFamily: "Verizon NHG eDS",
                            fontWeight: 700,
                            fontSize: "16px",
                            textTransform: "none",
                            color: "#6F7171", // Inactive tab color
                            minHeight: "40px",
                            padding: "10px 16px",
                            minWidth: "unset",
                            borderRadius: "0 !important", // Force box shape with no rounded corners
                            "&:hover": {
                                backgroundColor: "transparent" 
                            },
                            // Add custom bottom border for each tab
                            position: 'relative',
                            "&::after": {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                borderRadius: "0 !important", // Ensure the border has no rounding
                                backgroundColor: 'transparent' // Default transparent border
                            }
                        },
                        "& .Mui-selected": {
                            color: "#000000 !important", // Active tab color
                            "&::after": {
                                backgroundColor: "#EE0000", // Red border only for active tab
                                borderRadius: "0 !important", // Force no rounding on the border
                                width: "100%", // Ensure the border spans the full width of the tab
                                left: "0", 
                                right: "0"
                            }
                        }
                    }}
                >
                    <Tab label="Health Check" value="health" />
                    <Tab label="PRB Heat Map" value="prb" />
                    {samsung5gnodes.length > 0 && (
                        <Tab label="CBAND Tools" value="cband" />
                    )}
                </Tabs>
                <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 4 }}>
                    {activeTab === 'health' && 
                    <div><HealthCheck siteDetailInfo={siteList} osw_id={""} siteDetailsData={siteList} oswStatus={""}
            SiteTools={true} hcFromStandAloneToolsTab={true}  notifref={notificationSystem.current}/></div>}
                    {activeTab === 'prb' && (<PrbAnalyzer siteUnid={site?.site_unid || ''} SiteTools={true} mode="in-place" />)}
                    {activeTab === 'cband'  && samsung5gnodes.length > 0 &&<div><CbandTools sitetools={true} selectedRow={siteList} isWO={true} samsung5gnodes={samsung5gnodes}/></div>}
                </div>
            </div>
        );
    }
        const workOrder = workOrders[0];
    return (
            <h2>
                This site has a work order in '{workOrder.workorder_status}' status, click &nbsp;
                <a
                    href="#"
                    onClick={e => {
                        e.preventDefault();
                        if (onShowWorkOrderModal) onShowWorkOrderModal(workOrder);
                    }}
                    style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
                >
                    here
                </a>
                &nbsp;to be redirected to it.
            </h2>
        );
    };

    return (
    <div 
            className="col-sm-12 no-padding float-left" 
            style={{ 
                paddingLeft: '12px',
                border: 'none !important',
                margin: '0',
                padding: '12px 0 0 12px'
            }}
        >
        <div className="col-sm-12 no-padding float-left" style={{ paddingLeft: '12px' }}>
            <div className="col-sm-12 no-padding float-left">
                <div className="col-sm-3 no-padding Form-group float-left">
                    <label className="Form-label" style={{ fontSize: '16px' }}>Site Name</label>
                    {siteList.get("sitename")}
                </div>
                <div className="col-sm-3 no-padding Form-group float-left">
                    <label className="Form-label" style={{ fontSize: '16px' }}>Switch Name</label>
                    {siteList.get("switch")}
                </div>
                <div className="col-sm-3 no-padding Form-group float-left">
                    <label className="Form-label" style={{ fontSize: '16px' }}>City</label>
                    {siteList.get('city')}
                </div>
                <div className="col-sm-3 no-padding Form-group float-left">
                    <label className="Form-label" style={{ fontSize: '16px' }}>State</label>
                    {siteList.get('state')}
                </div>
            </div>
            <div className="col-sm-12 no-padding">
                <div className="col-sm-3 no-padding Form-group float-left">
                    <label className="Form-label" style={{ fontSize: '16px' }}>Site Manager</label>
                    {site?.mgr_name || 'N/A'}
                </div>
                <div className="col-sm-3 no-padding Form-group float-left">
                    <label className="Form-label" style={{ fontSize: '16px' }}>Site Engineer</label>
                    {site?.tech_name || 'N/A'}
                </div>
                <div className="col-sm-3 no-padding Form-group float-left">
                    <label className="Form-label" style={{ fontSize: '16px' }}>Site #</label>
                    {siteList.get('siteid')}
                </div>
            </div>
        </div>
        {workOrderScreenCheck()}
          <NotificationSystem ref={notificationSystem} />
    </div>
);
};

export default SiteToolInfo;
