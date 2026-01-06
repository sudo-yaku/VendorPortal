import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Tab, Box, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector, useDispatch } from "react-redux";
import RMUForm from "./RMUForm";
import AlarmTestingHistory from "./AlarmTestingHistory";
import EnvironmentalAlarmTesting from "./EnvironmentalAlarmTesting";
import SiteLoginForm from "../sites/components/SiteLoginForm";
import SiteLogoutForm from "../sites/components/SiteLogoutForm";
import RMUGuideViewer from "./components/RMUGuideViewer"; // Import the new component
import * as SiteActions from "../sites/actions";
import { Map } from 'immutable';

const RMUIntegration = ({ email, username, companyName, vendorId, proj_number, siteDetails, workORderInfo, selectedRow, loginId, statusApiDelay = 20, rmuLegacy }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showLogoutForm, setShowLogoutForm] = useState(false);
  const [lock_unlock_request_id, setLockUnlockRequestId] = useState('');
  
  const safeWorkOrderInfo = workORderInfo && typeof workORderInfo.get === 'function' ? workORderInfo : Map();
  
  const site_unid = safeWorkOrderInfo.get('site_unid') || (selectedRow ? selectedRow.site_unid : '');

  // Check if user is logged in with IVR
  const loggedIn = useSelector(state => {
    const reason = state.getIn(['ivr', 'login', site_unid, 'login_reason']);
    return (reason && reason.length > 0) ? true : false;
  });

  const resetProps = useCallback((keys, value) => {
    dispatch(SiteActions.resetProps(keys, value));
  }, [dispatch]);

  const openLoginForm = useCallback(() => {
    if (!loginId || !site_unid) return;
    
    var keys = [loginId, "site", site_unid, "showLoginForm"];
    resetProps(keys, '');
    resetProps(keys, true);
    setShowLoginForm(true);
    setShowLogoutForm(false);
  }, [loginId, site_unid, resetProps]);

  const openLogoutForm = useCallback(() => {
    if (!loginId || !site_unid) return; 
    
    var keys = [loginId, "site", site_unid, "showLogoutForm"];
    resetProps(keys, '');
    resetProps(keys, true);
    setShowLogoutForm(true);
    setShowLoginForm(false);
  }, [loginId, site_unid, resetProps]);

  const openLoginLogoutForm = useCallback(() => {
    if (loggedIn) {
      openLogoutForm();
    } else {
      openLoginForm();
    }
  }, [loggedIn, openLoginForm, openLogoutForm]);

  useEffect(() => {
    if (!loginId || !site_unid) return; 
    
    openLoginLogoutForm();
    
    
    var keys = [loginId, "site", site_unid, "showLoginForm"];
    resetProps(keys, false);
    var keys2 = [loginId, "site", site_unid, "showLogoutForm"];
    if (loggedIn) {
      resetProps(keys2, true);
      setShowLogoutForm(true);
      setShowLoginForm(false);
    } else {
      resetProps(keys, true);
      resetProps(keys2, false);
      setShowLoginForm(true);
      setShowLogoutForm(false);
    }
  }, [loginId, site_unid, loggedIn, resetProps, openLoginLogoutForm]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const canShowForms = !!loginId && !!site_unid;

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="rmu integration tabs"
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          "& .MuiTabs-flexContainer": {
            gap: "32px",
          },
          "& .MuiTab-root": {
            fontFamily: "Verizon NHG eDS",
            fontWeight: 700,
            fontSize: "14px",
            textTransform: "none",
            color: "var(--gray-44-l-6-f-7171-da-7-a-7-a-7, #6F7171)",
            minHeight: "40px",
            padding: "10px 16px",
            minWidth: "unset",
            borderRadius: "0 !important",
            "&:hover": {
              backgroundColor: "transparent" 
            },
            position: 'relative',
            "&::after": {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              borderRadius: "0 !important",
              backgroundColor: 'transparent'
            }
          },
          "& .Mui-selected": {
            color: "var(--blackl-000000-dffffff, #000000) !important", 
            "&::after": {
              backgroundColor: "#EE0000",
              borderRadius: "0 !important",
              width: "100%",
              left: "0", 
              right: "0"
            }
          }
        }}
      >
        <Tab label="RMU Integration" />
        <Tab label="Environmental Alarm Testing" />
        <Tab label="RMU Training Guide" />
      </Tabs>

      <Box sx={{ padding: "10px 5px", borderTop: "1px solid #e0e0e0" }}>
        {activeTab === 0 && (
          <RMUForm 
            email={email} 
            proj_number={proj_number} 
            username={username} 
            companyName={companyName} 
            siteDetails={siteDetails}
            vendorId={loginId}
            rmuLegacy={rmuLegacy}
          />
        )}
        
        {activeTab === 1 && (
          <>
            {/* IVR Login/Logout Section inside Environmental Alarm Testing tab */}
            <Box sx={{ mb: 3, bgcolor: "#ECEFF1", padding: "20px", border: "1px solid #cecece" }}>
              {canShowForms && !loggedIn && showLoginForm && (
                <div>
                  <div style={{ padding: "10px 0px", background: "black", color: "#FFF", textAlign: "center", marginBottom: "15px" }}>
                    IVR LOGIN 
                   
                  </div>
                  <SiteLoginForm
                    site_unid={site_unid}
                    enableSectorLock={true}
                    lock_unlock_request_id={lock_unlock_request_id}
                    workORderInfo={safeWorkOrderInfo}
                  />
                </div>
              )}

              {canShowForms && loggedIn && showLogoutForm && (
                <div>
                  <div style={{ padding: "10px 0px", background: "black", color: "#FFF", textAlign: "center", marginBottom: "15px" }}>
                    IVR LOGOUT 
                  </div>
                  <SiteLogoutForm
                    site_unid={site_unid}
                    workORderInfo={safeWorkOrderInfo}
                    lock_unlock_request_id={lock_unlock_request_id}
                    isSnap={true}
                  />
                </div>
              )}
            </Box>
            
            {/* Only show alarm testing components when logged in */}
            {loggedIn ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <EnvironmentalAlarmTesting
                    loginId={loginId}
                    selectedRow={selectedRow}
                    statusApiDelay={statusApiDelay}
                    email={email}
                    siteTechEmail={(siteDetails?.contacts?.find(person => person.role === "Site Technician")?.email || "")}
                  />
                </Box>
                
                    <AlarmTestingHistory
                      workORderInfo={safeWorkOrderInfo}
                      selectedRow={selectedRow}
                    />
              </>
            ) : (
              <Box sx={{ 
                padding: "20px", 
                border: "1px solid #ddd", 
                borderRadius: "4px", 
                textAlign: "center",
                marginTop: "16px", 
                backgroundColor: "#f9f9f9" 
              }}>
                <Typography variant="body1" sx={{ fontWeight: "500" }}>
                  Please login with IVR to access Alarm Testing functionality.
                </Typography>
              </Box>
            )}
          </>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <RMUGuideViewer />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RMUIntegration;
