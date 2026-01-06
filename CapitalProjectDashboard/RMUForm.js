import React, { useState,useEffect,useMemo } from "react";
import { TextField, Box, Typography, MenuItem, Button,CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import WarningSign from "../Images/Warning.png";
import Dropzone from "react-dropzone";
import { getHostnameMapping, searchHpovServer,pingHostAction,submitRMURequest } from "../CapitalProjectDashboard/actions";

const RMUForm = ({email,proj_number,username,companyName,siteDetails,vendorId,rmuLegacy}) => {
 
  const siteTechnicianEmail = siteDetails?.contacts?.find(person => person.role === "Site Technician")?.email || "";
  const siteTechnicianName = siteDetails?.contacts?.find(person => person.role === "Site Technician")?.name || "";
  const siteTechnicianPhone = siteDetails?.contacts?.find(person => person.role === "Site Technician")?.phone || "";
  const Area = siteDetails?.area;
  const Market = siteDetails?.region;
  const siteUnid = siteDetails?.site_unid;
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [removalStatus, setRemovalStatus] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [ipCheckPerformed, setIpCheckPerformed] = useState(false);
const [siteCheckPerformed, setSiteCheckPerformed] = useState(false);
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const combinedEmails = [email, siteTechnicianEmail].filter(Boolean).join(", ");
  const getDefaultComment = (requestType) => {
  const action = (requestType === "hpov_remove" || requestType === "snmp_remove") ? 'Removal' : 'Integration';
  return `RMU ${action} performed by ${username} from ${companyName} from OpsPortal.\n`;
};

  const [cursorPosition, setCursorPosition] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchedIpAddress, setSearchedIpAddress] = useState("");
  const [originalSiteId, setOriginalSiteId] = useState("");
  const [siteNumberTimer, setSiteNumberTimer] = useState(null);
  const dispatch = useDispatch();
  
 
  const [formData, setFormData] = useState({
    requestCategory: "new",
    requestApplication: "siteboss",
    requestPriority: "medium",
    requestorName: siteTechnicianName,
    requestorPhone: siteTechnicianPhone,
    requestorEmail: combinedEmails,
    requestType:  "hpov_add",
    comments:  getDefaultComment("hpov_add"),
    attachments: [],
    siteNumber:"",
    ipAddress:"",
  });
  const defaultComment = useMemo(() => {
  return getDefaultComment(formData.requestType);
}, [formData.requestType, username, companyName]);
 // Select hostname mapping data from redux store
 const hostnameMapping = useSelector(state => 
  state.getIn(["CapitalProjectDashboard", "hostnameMapping", originalSiteId, "data"]));
const hostnameIsLoading = useSelector(state => 
  state.getIn(["CapitalProjectDashboard", "hostnameMapping", originalSiteId, "loading"]));
const hpovServerData = useSelector(state => 
  state.getIn(["CapitalProjectDashboard", "hpovServer", originalSiteId, "data"]));
const hpovServerIsLoading = useSelector(state => 
  state.getIn(["CapitalProjectDashboard", "hpovServer", originalSiteId, "loading"]));
  const pingResult = useSelector(state => 
    state.getIn(["CapitalProjectDashboard", "pingHost", searchedIpAddress, "data"]));
const [isValidIpAddress, setIsValidIpAddress] = useState(false);
  const pingIsLoading = useSelector(state => 
    state.getIn(["CapitalProjectDashboard", "pingHost",searchedIpAddress, "loading"]));
  const ipSearchResult = useSelector(state => 
    state.getIn(["CapitalProjectDashboard", "hpovServer", searchedIpAddress, "data"]));

const submissionLoading = useSelector(state => 
  state.getIn(["CapitalProjectDashboard", "rmuSubmission", "loading"]));
const submissionError = useSelector(state => 
  state.getIn(["CapitalProjectDashboard", "rmuSubmission", "error"]));
const submissionData = useSelector(state => 
  state.getIn(["CapitalProjectDashboard", "rmuSubmission", "data"]));
const ipSearchIsLoading = useSelector(state => 
  searchedIpAddress ? 
  state.getIn(["CapitalProjectDashboard", "hpovServer", searchedIpAddress, "loading"]) : 
  false
);
  const updateCommentsForRequestType = (newRequestType, currentComments, currentRequestType) => {
  const newAction = (newRequestType === "hpov_remove" || newRequestType === "snmp_remove") ? 'Removal' : 'Integration';
  const newDefaultComment = `RMU ${newAction} performed by ${username} from ${companyName} from OpsPortal.\n`;
  
  const currentAction = (currentRequestType === "hpov_remove" || currentRequestType === "snmp_remove") ? 'Removal' : 'Integration';
  const currentDefaultComment = `RMU ${currentAction} performed by ${username} from ${companyName} from OpsPortal.\n`;
  
  const userContent = currentComments.replace(currentDefaultComment, '');
  return newDefaultComment + userContent;
};
    const isLoading = hostnameIsLoading || hpovServerIsLoading;
    // Update handleChange for siteNumber
const handleChange = (e) => {
  const { name, value } = e.target;
 
 if (name === "requestApplication") {
    const newRequestType = value === "siteboss" ? "hpov_add" : "snmp_add";
    const newComments = updateCommentsForRequestType(newRequestType, formData.comments, formData.requestType);
    setFormData(prev => ({
      ...prev,
      [name]: value,
      requestType: newRequestType,
      comments: newComments
    }));
   
    return;
  }
 if (name === "requestType") {
 const newComments = updateCommentsForRequestType(value, formData.comments, formData.requestType);
  
 
  
  setFormData(prev => ({
    ...prev,
    [name]: value,
    comments: newComments
  }));
  
  return;
}
 if (name === "ipAddress") {
  // Trim spaces and update form data
   const cleanedValue = value.replace(/\s+/g, '');
  setFormData(prev => ({ ...prev, [name]: cleanedValue }));
  
  // Validate IPv6 format
  setIsValidIpAddress(isValidIPv6(cleanedValue));
  
  // Reset IP check status when IP changes
  if (cleanedValue !== searchedIpAddress) {
    setIpCheckPerformed(false);
    if (searchedIpAddress && dispatch) {
      dispatch({ 
        type: 'RESET_PING_HOST_DATA', 
        ipAddress: searchedIpAddress 
      });
    }
  }
  return;
}
  
  if (name === "siteNumber") {
    
    // setFormData(prev => ({ ...prev, [name]: value }));
    if (formData.ipAddress) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        ipAddress: "" // Clear IP address
      }));
      
      // Also reset IP-related states
      setIpCheckPerformed(false);
      setSearchedIpAddress("");
      
      // Reset any IP-related messages in Redux
      if (dispatch && searchedIpAddress) {
        dispatch({ 
          type: 'RESET_PING_HOST_DATA', 
          ipAddress: searchedIpAddress 
        });
        
        dispatch({ 
          type: 'RESET_HPOV_SERVER_DATA', 
          hostname: searchedIpAddress 
        });
      }
    } else {
      // No IP to clear, just update site number
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (siteNumberTimer) {
      clearTimeout(siteNumberTimer);
    }
    
    // Check if we have exactly 6 digits
    if (value.length === 6 && /^\d{6}$/.test(value)) {
     
      setOriginalSiteId(value);
      setSiteCheckPerformed(true);
      const timer = setTimeout(() => {
        dispatch(getHostnameMapping(value));
        
        // Update this line to include the options
        dispatch(searchHpovServer(value, {
          flag: 0, 
          requestApplication:formData.requestApplication === "siteboss" ? "SiteBoss" : "Badger",
          siteUnid: siteUnid || "",
          requesterName: formData.requestorName || name || "" 
        }));
      }, 3000);
      
      setSiteNumberTimer(timer);
    }
    return;
  }
    
    // Special handling for comments
    if (name === "comments") {
      // If attempting to delete the default comment, preserve it
      if (!value.startsWith(defaultComment)) {
        // Keep the default comment and add whatever text the user has after it
        const userPart = value.replace(defaultComment, "");
        setFormData(prev => ({
          ...prev,
          [name]: defaultComment + userPart
        }));
      } else {
        // Default comment is intact, allow the change
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // For all other fields, handle normally
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

const isValidIPv6 = (ip) => {
  // Check for empty string
  if (!ip || ip.length === 0) {
    return false;
  }
  
  // Trim all whitespace (leading, trailing, and internal spaces)
  const trimmed = ip.replace(/\s+/g, '').trim();
  
  // Check for invalid characters (only hex digits, colons allowed)
  if (!/^[0-9a-fA-F:]+$/.test(trimmed)) {
    return false;
  }
  
  // Check for consecutive colons (only :: is allowed, not :::)
  if (trimmed.includes(':::')) {
    return false;
  }
  
  // Count double colons - only one :: is allowed
  const doubleColonCount = (trimmed.match(/::/g) || []).length;
  if (doubleColonCount > 1) {
    return false;
  }
  
  // Split by :: to handle compressed zeros
  const parts = trimmed.split('::');
  
  if (parts.length > 2) {
    return false;
  }
  
  // Helper function to validate hex groups
  const isValidHexGroup = (group) => {
    if (group.length === 0 || group.length > 4) {
      return false;
    }
    return /^[0-9a-fA-F]+$/.test(group);
  };
  
  // If no :: present, must have exactly 8 groups
  if (parts.length === 1) {
    const groups = trimmed.split(':');
    if (groups.length !== 8) {
      return false;
    }
    // Validate each group
    return groups.every(group => isValidHexGroup(group));
  }
  
  // If :: present, validate the parts
  const leftPart = parts[0];
  const rightPart = parts[1];
  
  // Check if starts or ends with single colon (invalid)
  if ((leftPart === '' && rightPart !== '' && rightPart.startsWith(':')) ||
      (rightPart === '' && leftPart !== '' && leftPart.endsWith(':'))) {
    return false;
  }
  
  // Validate left and right parts
  const leftGroups = leftPart ? leftPart.split(':').filter(g => g !== '') : [];
  const rightGroups = rightPart ? rightPart.split(':').filter(g => g !== '') : [];
  
  // Total groups cannot exceed 7 (since :: represents at least one zero group)
  if (leftGroups.length + rightGroups.length >= 8) {
    return false;
  }
  
  // Validate each group in both parts
  const allGroups = [...leftGroups, ...rightGroups];
  return allGroups.every(group => isValidHexGroup(group));
};

const expandIPv6 = (ip) => {
  if (!ip) return ip;
  
  // Remove ALL spaces (leading, trailing, and internal) then validate
  const cleanedIP = ip.replace(/\s+/g, '').trim();
  
  // Validate first
  if (!isValidIPv6(cleanedIP)) {
    return cleanedIP; // Return cleaned version even if invalid
  }
  
  try {
    // If it's already a full IPv6 address (no ::), just pad groups
    if (!cleanedIP.includes('::')) {
      const groups = cleanedIP.split(':');
      return groups.map(group => group.padStart(4, '0').toLowerCase()).join(':');
    }
    
    // Handle :: compression
    const parts = cleanedIP.split('::');
    const leftPart = parts[0];
    const rightPart = parts[1];
    
    // Get existing groups, filtering out empty strings
    const leftGroups = leftPart ? leftPart.split(':').filter(g => g !== '') : [];
    const rightGroups = rightPart ? rightPart.split(':').filter(g => g !== '') : [];
    
    // Calculate how many zero groups we need to add
    const totalGroups = 8;
    const existingGroups = leftGroups.length + rightGroups.length;
    const zeroGroups = totalGroups - existingGroups;
    
    // Ensure we don't have negative zero groups
    if (zeroGroups < 0) {
      return cleanedIP; // Invalid, return cleaned version
    }
    
    // Pad each existing group to 4 characters with leading zeros
    const paddedLeftGroups = leftGroups.map(group => group.padStart(4, '0').toLowerCase());
    const paddedRightGroups = rightGroups.map(group => group.padStart(4, '0').toLowerCase());
    
    // Create the zero groups
    const zeroGroupsArray = Array(zeroGroups).fill('0000');
    
    // Combine all groups
    const allGroups = [...paddedLeftGroups, ...zeroGroupsArray, ...paddedRightGroups];
    
    // Ensure we have exactly 8 groups
    if (allGroups.length !== 8) {
      return cleanedIP; // Invalid, return cleaned version
    }
    
    // Join with colons
    return allGroups.join(':');
  } catch (error) {
    // If expansion fails, return the cleaned IP
    return cleanedIP;
  }
};


const displaySiteNumber = React.useMemo(() => {
  if (hostnameMapping && hostnameMapping.toJS) {
    const mappingData = hostnameMapping.toJS();
    if (mappingData && mappingData.hostname) {
      const originalHostname = mappingData.hostname;
      let requestApp = formData.requestApplication.toUpperCase();
      if (requestApp === "BADGER") {
        requestApp = "BADGER";
      }
      return originalHostname
        .replace(/[_\s]/g, '-')  
        .concat(`-${requestApp}`);
    }
  }
  return formData.siteNumber;
}, [hostnameMapping, formData.requestApplication, formData.siteNumber]);
// Add this useEffect after your existing useEffect hooks
useEffect(() => {
  // Only auto-fill IP if we have hpovServerData and it's not "Not Found"
  if (hpovServerData && 
      hpovServerData.getIn && 
      hpovServerData.getIn(['status']) && 
      hpovServerData.getIn(['status']) !== "Not Found") {
    
    const statusString = hpovServerData.getIn(['status']);
    
    // Extract IPv6 address from the status string
    // The format appears to be: "IPv6_ADDRESS HOSTNAME_INFO"
    const ipv6Match = statusString.match(/^([0-9a-fA-F:]+)/);
    
    if (ipv6Match && ipv6Match[1]) {
      const extractedIP = ipv6Match[1];
      
      // Only auto-fill if the IP address field is currently empty
      if (!formData.ipAddress) {
        setFormData(prev => ({
          ...prev,
          ipAddress: extractedIP
        }));
        
        // Validate the extracted IP
        setIsValidIpAddress(isValidIPv6(extractedIP));
        
        // Reset IP check status since we have a new IP
        setIpCheckPerformed(false);
        setSearchedIpAddress("");
        
        // Clear any previous IP-related Redux data
        if (dispatch && searchedIpAddress) {
          dispatch({ 
            type: 'RESET_PING_HOST_DATA', 
            ipAddress: searchedIpAddress 
          });
          
          dispatch({ 
            type: 'RESET_HPOV_SERVER_DATA', 
            hostname: searchedIpAddress 
          });
        }
      }
    }
  }
}, [hpovServerData, formData.ipAddress, dispatch, searchedIpAddress]);

// ...existing code...

// useEffect(() => {
  
//   if (formData.requestApplication === "badger") {
//     setFormData(prev => ({
//       ...prev,
//       requestType: "snmp" 
//     }));
//   } else if (formData.requestApplication === "siteboss") {
//     setFormData(prev => ({
//       ...prev,
//       requestType: "hpov_add" 
//     }));
//   }
// }, [formData.requestApplication]);
  
const handleCommentsKeyDown = (e) => {
  const textarea = e.target;
  const currentPosition = textarea.selectionStart;
  const selectionEnd = textarea.selectionEnd;
  setCursorPosition(currentPosition);
  
  // Prevent backspace when it would affect the default comment
  if (e.key === 'Backspace' && currentPosition <= defaultComment.length) {
    e.preventDefault();
    return;
  }
  
  // Prevent delete key when it would affect the default comment
  if (e.key === 'Delete' && currentPosition < defaultComment.length) {
    e.preventDefault();
    return;
  }
  
  // Prevent cut operations that would include default text
  if ((e.ctrlKey && e.key === 'x') || (e.ctrlKey && e.key === 'X')) {
    if (selectionStart < defaultComment.length) {
      e.preventDefault();
      return;
    }
  }
  
  // Prevent newline insertion within the default comment
  if (e.key === 'Enter' && currentPosition < defaultComment.length) {
    e.preventDefault();
    return;
  }
};
// Clean up timer when component unmounts
useEffect(() => {
  return () => {
    if (siteNumberTimer) {
      clearTimeout(siteNumberTimer);
    }
  };
}, [siteNumberTimer]);

const handleClear = () => {
  // Clear form data fields
  setFormData(prev => ({
    ...prev,
    siteNumber: "",
    ipAddress: ""
  }));
  
  // Reset the check states
  setIpCheckPerformed(false);
  setSiteCheckPerformed(false);
  
  // Clear search-related states
  setSearchedIpAddress("");
  setOriginalSiteId(""); // Clear the original site ID

  setSubmissionStatus(null);
  setRemovalStatus(null);
  
  // Reset submission status if any
  setSubmissionStatus(null);
  if (dispatch) {
    if (originalSiteId) {
      // Reset HPOV server data to clear site number messages
      dispatch({ 
        type: 'RESET_HPOV_SERVER_DATA',
        hostname: originalSiteId 
      });
    }
    
    if (searchedIpAddress) {
      // Reset ping results to clear IP address messages
      dispatch({ 
        type: 'RESET_PING_HOST_DATA', 
        ipAddress: formData.ipAddress 
      });
      
      // Reset IP search results
      dispatch({ 
        type: 'RESET_HPOV_SERVER_DATA', 
        hostname: searchedIpAddress 
      });
    }
  }
  
  // Force component to re-render to clear messages (simpler approach)
  setForceUpdate(prev => !prev);
};


useEffect(() => {
  if (pingResult && pingResult.toJS) {
    const pingData = pingResult.toJS();
    

    // If ping status is 200, search HPOV server with the IP address
    if (pingData.status === 200) {
    
      dispatch(searchHpovServer(searchedIpAddress, {
        flag: 1, // 1 for IP address
        requestApplication: formData.requestApplication === "siteboss" ? "SiteBoss" : "Badger",
        siteUnid: siteUnid || "",
        requesterName: formData.requestorName || username || ""
      }));
    }
  }
}, [pingResult, searchedIpAddress, dispatch]);

useEffect(() => {
  // Only clear results when:
  // 1. We have a previously searched IP
  // 2. The current IP is different from the searched IP
  // 3. The user has completed typing (not on every keystroke)
  if (searchedIpAddress && 
      formData.ipAddress !== searchedIpAddress) {
    
    // Reset the IP check performed flag instead of dispatching on every change
    setIpCheckPerformed(false);if (dispatch) {
      // Reset ping results to remove "IP address is reachable" message
      dispatch({ 
        type: 'RESET_PING_HOST_DATA', 
        ipAddress: searchedIpAddress  // Use the previous IP that was checked
      });
    }
    
   
  }
}, [formData.ipAddress, searchedIpAddress, dispatch]);

const handleCheckIP = () => {
  
  if (formData.ipAddress) {
    const expandedIP = expandIPv6(formData.ipAddress);
      setSearchedIpAddress(expandedIP); // Save the IP we're searching for
    setIpCheckPerformed(true);
    // If the IP was expanded, update the form with the full format
    if (expandedIP !== formData.ipAddress) {
      setFormData(prev => ({
        ...prev,
        ipAddress: expandedIP
      }));
    }
    // First ping the host
  
    dispatch(pingHostAction(expandedIP));
  }
};
const handleSelectionChange = (e) => {
  const currentPosition = e.target.selectionStart;
  setCursorPosition(currentPosition);
  
  // Optional: prevent selection within the default comment
  if (currentPosition < defaultComment.length) {
    e.target.setSelectionRange(defaultComment.length, defaultComment.length);
  }
};

const handleSubmit = () => {
  // Format the data according to the API requirements
  const siteExists = hpovServerData?.getIn?.(['status']) !== "Not Found";
  const ipExists = ipSearchResult?.getIn?.(['status']) !== "Not Found";
  if (siteExists && ipExists) {
    // Show confirmation dialog for removal
    setShowConfirmDialog(true);
    return;
  }
  let requestType;
   if (formData.requestType === "hpov_add") {
    requestType = "HPOV Add";
  } else if (formData.requestType === "snmp_add") {
    requestType = "SNMP Add";
  } 
  setSubmissionStatus(null);
  const requestData = {
    spmProjectId: proj_number || "",
    siteUnid: siteUnid || "",
    hpovDeviceRegistration: {
      requestCategory: formData.requestCategory === "new" ? "New Request" : formData.requestCategory,
      requestApplication: formData.requestApplication === "siteboss" ? "SiteBoss" : "Badger",
      requesterName: formData.requestorName,
      requesterPhone: formData.requestorPhone,
      requestorEmail: formData.requestorEmail,
       requestorType: requestType,
        vendorId:vendorId || "",
        rmuLegacy:rmuLegacy,
      requestorPriority: formData.requestPriority === "medium" ? "Medium" : formData.requestPriority,
      comments: formData.comments,
      sourceSystem: "OpsPortal",
      hpovDevices: [
        {
          deviceId: originalSiteId,
          ipAddress: formData.ipAddress,
          area: Area || "",
          market: Market || ""
        }
      ]
    }
  };

  
  setIsSubmitting(true); // Set local loading state
  
  // Dispatch the action with the formatted data
  dispatch(submitRMURequest(requestData))
    .then((response) => {
    
      
      // Check if the response is an error action (contains type: CREATE_RMU_FAILURE)
      if (response && response.type === "CREATE_RMU_FAILURE") {
        console.error("Error submitting request:", response.errors);
        setSubmissionStatus('error');
      } else {
        // Check if there are nested errors in successful response
        const responseData = response?.response?.data;
        if (responseData && responseData.status && responseData.status !== "200") {
         
          setSubmissionStatus('error');
        } else {
          
          setSubmissionStatus('success');
        }
      }
    })
    .catch(err => {
      console.error("Submission error:", err);
      setSubmissionStatus('error');
    })
    .finally(() => {
      setIsSubmitting(false); // Reset loading state regardless of outcome
    });
};
  useEffect(() => {
  let timer;
  
  if (removalStatus === 'success' || submissionStatus === 'success') {
    // Set a timer to clear the form after 5 seconds
    timer = setTimeout(() => {
      handleClear();
    }, 5000);
  }
  
  // Cleanup timer on unmount or when removalStatus changes
  return () => {
    if (timer) {
      clearTimeout(timer);
    }
  };
}, [removalStatus,submissionStatus]);
const handleConfirmRemoval = () => {
  setShowConfirmDialog(false);
  submitRequest();
};

const submitRequest = () => {
  setSubmissionStatus(null);
  
  // Determine the request type based on formData.requestType
  let requestType;
  if (formData.requestType === "hpov_remove") {
    requestType = "HPOV Delete";
  } else if (formData.requestType === "snmp_remove") {
    requestType = "SNMP Delete";
  } 
  
  const requestData = {
    spmProjectId: proj_number || "",
    siteUnid: siteUnid || "",
    hpovDeviceRegistration: {
      requestCategory: formData.requestCategory === "new" ? "New Request" : formData.requestCategory,
      requestApplication: formData.requestApplication === "siteboss" ? "SiteBoss" : "Badger",
      requesterName: formData.requestorName,
      requesterPhone: formData.requestorPhone,
      requestorEmail: formData.requestorEmail,
      vendorId:vendorId || "",
      rmuLegacy:rmuLegacy,
      requestorType: requestType, // Use the determined request type
      requestorPriority: formData.requestPriority === "medium" ? "Medium" : formData.requestPriority,
      comments: formData.comments,
      sourceSystem: "OpsPortal",
      hpovDevices: [
        {
          deviceId: originalSiteId,
          ipAddress: formData.ipAddress,
          area: Area || "",
          market: Market || ""
        }
      ]
    }
  };

  setIsSubmitting(true); // Set local loading state
  
  // Dispatch the action with the formatted data
  dispatch(submitRMURequest(requestData))
    .then((response) => {
    // Check if the response is an error action (contains type: CREATE_RMU_FAILURE)
      if (response && response.type === "CREATE_RMU_FAILURE") {
       
        setRemovalStatus('error');
        return;
      }
      
      // Check the nested response structure for statusCode
      const responseData = response?.response?.data;
      const createHPOVData = responseData?.data?.createHPOVRegistration;
      
      if (createHPOVData) {
        const statusCode = createHPOVData.statusCode;
       
        
        // Check if statusCode is not 200
        if (statusCode && statusCode !== 200) {
          
          setRemovalStatus('error');
        } else {
          console.log("Request submitted successfully");
          setRemovalStatus('success');
        }
      } else {
        // Fallback to original logic if structure is different
        if (responseData && responseData.status && responseData.status !== "200") {
         
          setRemovalStatus('error');
        } else {
          setRemovalStatus('success');
        }
      }
    })
    .catch(err => {
      console.error("Submission error:", err);
      setRemovalStatus('error');
    })
    .finally(() => {
      setIsSubmitting(false); // Reset loading state regardless of outcome
    });
};
const handleCancelRemoval = () => {
  setShowConfirmDialog(false);
};
  const labelStyles = {
    fontWeight: 400,
    fontFamily: "Verizon NHG eDS",
    fontSize: "13px",
    color: "var(--blackl-000000-dffffff, #000000)",
    mb: "4px",
    display: "block",
  };



  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* -------- First Row (3 fields) -------- */}
      <Box sx={{ display: "flex", gap: "20px" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={labelStyles}><span style={{ color: 'red',padding:'2px' }}>*</span>Request Category</Typography>
          <TextField
            name="requestCategory"
            value={formData.requestCategory}
            onChange={handleChange}
            select
            variant="outlined"
            fullWidth
            size="small"
            disabled
          >
            <MenuItem value="new">New Request</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={labelStyles}><span style={{ color: 'red',padding:'2px' }}>*</span>Request Application</Typography>
          <TextField
            name="requestApplication"
            value={formData.requestApplication}
            onChange={handleChange}
            select
            variant="outlined"
            fullWidth
            size="small"
          >
          
            <MenuItem value="siteboss">SiteBoss</MenuItem>
            <MenuItem value="badger">Badger/Westell/RMX</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={labelStyles}><span style={{ color: 'red',padding:'2px' }}>*</span>Request Priority</Typography>
          <TextField
            name="requestPriority"
            value={formData.requestPriority}
            onChange={handleChange}
            select
            variant="outlined"
            fullWidth
            size="small"
            disabled
          >
         
            <MenuItem value="medium">Medium</MenuItem>
        
          </TextField>
        </Box>
      </Box>

      {/* -------- Second Row (3 fields) -------- */}
      <Box sx={{ display: "flex", gap: "20px" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={labelStyles}><span style={{ color: 'red',padding:'2px' }}>*</span>Requestor Name</Typography>
          <TextField
            name="requestorName"
            value={formData.requestorName}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            size="small"
            disabled
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={labelStyles}>Requestor Phone</Typography>
          <TextField
            name="requestorPhone"
            value={formData.requestorPhone}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            size="small"
            disabled
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={labelStyles}><span style={{ color: 'red',padding:'2px' }}>*</span>Requestor Email</Typography>
          <TextField
            name="requestorEmail"
            value={formData.requestorEmail}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            size="small"
            disabled
          />
        </Box>
      </Box>

      {/* -------- Third Row (Request Type + Comments) -------- */}
      <Box sx={{ display: "flex", gap: "20px" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={labelStyles}><span style={{ color: 'red',padding:'2px' }}>*</span>Request Type</Typography>
          <TextField
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
            select
            variant="outlined"
            fullWidth
            size="small"
           
          >
           {console.log("intial---->",formData.requestType)}
      {formData.requestApplication === "siteboss" ? (
  [
    <MenuItem key="hpov_add" value="hpov_add">HPOV Add</MenuItem>,
    <MenuItem key="hpov_remove" value="hpov_remove">HPOV Remove</MenuItem>
  ]
) : (
  [
    <MenuItem key="snmp_add" value="snmp_add">SNMP Add</MenuItem>,
    <MenuItem key="snmp_remove" value="snmp_remove">SNMP Remove</MenuItem>
  ]
)}
     
          
            
          </TextField>
        </Box>

        <Box sx={{ flex: 2 }}>
          <Typography sx={labelStyles}>Comments</Typography>
          <TextField
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            onKeyDown={handleCommentsKeyDown}
            onSelect={handleSelectionChange}
onClick={handleSelectionChange}
            variant="outlined"
            fullWidth
            multiline
            
            sx={{ 
              "& .MuiInputBase-root": {
                height: "70px",
                maxHeight: "70px",
                overflow: "auto"
              },
              "& .MuiInputBase-input": {
                maxHeight: "70px",
                overflow: "auto",
                "&::selection": {
                  backgroundColor: (theme) => cursorPosition < defaultComment.length ? 'transparent' : theme.palette.primary.light,
                }
              }
            }}
          />
        </Box>
      </Box>
      {/* -------- SiteBOSS Information -------- */}
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontFamily: "Verizon NHG eDS",
            fontSize: "16px",
            marginTop:"24px",
            color: "#000000",
            mb: "6px",
          }}
        >
          SiteBoss Information
        </Typography>

        <Box
          sx={{
            backgroundColor: "#F6F6F6",
            borderRadius: "3px",
            height: "50px",
            display: "flex",
            marginTop:"15px",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Neue Haas Grotesk Text Std",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: "12px",
              color: "#000000",
            }}
          >
            <img src={WarningSign} alt="Error" style={{ height: "14px", width: "14px", marginRight: "6px" }} />
            Attention WEST Area [ Mountains Plains, Northern California/
            Nevada, Pacific Northwest, Southwest, Southern California] : Please
            ensure PA6 IP addresses are added to the SiteBoss configuration
          </Typography>
        </Box>
      </Box>
{/* -------- New Row: Site Number + IP Address with Check -------- */}
<Box sx={{ display: "flex", gap: "20px", marginTop: "20px" }}>
  {/* Site Number field */}
  <Box sx={{ flex: 1 }}>
    <Typography sx={labelStyles}><span style={{ color: 'red',padding:'2px' }}>*</span>Site Number</Typography>
    <TextField
      name="siteNumber"
      value={displaySiteNumber}
      onChange={handleChange}
      variant="outlined"
      fullWidth
      size="small"
      placeholder="Enter a 6 or 7 digit site number (e.g., 123456)"
       disabled={hostnameMapping && hostnameMapping.toJS && hostnameMapping.toJS().hostname}
      helperText={isLoading ? "Searching... This may take some time..." : ""}
      InputProps={{
        endAdornment: isLoading && (
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px'
            }}
          >
            <div className="spinner" style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              borderLeft: '2px solid #000000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </Box>
        )
      }}
    />

   
    
    {/* Warning messages - only show when hpovServerData has status */}
    {hpovServerData && hpovServerData.getIn && hpovServerData.getIn(['status']) && 
    hpovServerData.getIn(['status']) !== "Not Found" &&(
      <>
        <Typography sx={{
          color: "#EE0000",
          fontFamily: "Verizon NHG eDS",
          fontWeight: 400,
          fontSize: "12px",
          padding: "8px",
          borderRadius: "4px"
        }}>
         {formData.requestApplication === "siteboss" ? "SiteBoss" : "Badger"} might be in use already.
        </Typography>
        
        <Typography sx={{
          color: "#000000",
          fontFamily: "Verizon NHG eDS",
          fontWeight: 400,
          fontSize: "12px",
          padding: "8px",
          borderRadius: "4px"
        }}>
          Verify record found in the server below. Continue if different from request otherwise please reach out to the Verizon local market project POC
        </Typography>
        
        <Box sx={{ 
          color: "#000000", 
          padding: "8px", 
          borderRadius: "4px",
          fontWeight: 400,
          fontSize: "12px",
          fontFamily: "Verizon NHG eDS",
          wordBreak: "break-all"
        }}>
          {hpovServerData.getIn(['status'])}
        </Box>
      </>
    )}
    
    {/* This text always appears regardless of data */}
    <Typography sx={{
      color: "#6F7171",
      fontFamily: "Neue Haas Grotesk Text Std",
      fontWeight: 500,
      fontStyle: "italic",
      fontSize: "12px",
      marginTop: "8px"
    }}>
      For Add Requests - If not found, please reach out to Verizon Manager
    </Typography>
  </Box>
  
  {/* IP Address field and Check button */}
  <Box sx={{ flex: 1 }}>
  <Typography sx={labelStyles}><span style={{ color: 'red',padding:'2px' }}>*</span>IP Address</Typography>
  <Box sx={{ display: "flex" }}>
    <TextField
      name="ipAddress"
      value={formData.ipAddress}
      onChange={handleChange}
      placeholder="Enter IPv6 address (e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334)"
      variant="outlined"
      size="small"
      sx={{ flex: 1, mr: 1 }}
   InputProps={{
      endAdornment: (pingIsLoading || ipSearchIsLoading) && (
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px'
          }}
        >
          <div className="spinner" style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            borderLeft: '2px solid #000000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </Box>
      )
    }}
  />
    <Button
      variant="contained"
      onClick={handleCheckIP}
      disabled={pingIsLoading || ipSearchIsLoading || !formData.ipAddress || !isValidIpAddress}
      sx={{
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: "Verizon NHG eDS",
        textTransform: "none",
        fontWeight: "bold",
        height: "32px",
        padding: "4px 16px",
        "&:hover": {
          backgroundColor: "#333333",
        },
      }}
    >
   Check
    </Button>
  </Box>
  {formData.ipAddress && !isValidIpAddress && (
  <Typography sx={{
    color: "#EE0000",
    fontFamily: "Verizon NHG eDS",
    fontWeight: 400,
    fontSize: "12px",
    marginTop: "4px"
  }}>
    Invalid IPv6 format. Please use format like 2001:0db8:85a3:0000:0000:8a2e:0370:7334
  </Typography>
)}
  {/* Show loading message while checking */}
  {(pingIsLoading || ipSearchIsLoading) && (
    <Typography sx={{
      color: "#6F7171",
      fontFamily: "Neue Haas Grotesk Text Std",
      fontSize: "12px",
      marginTop: "8px"
    }}>
      Attempting to reach the device. This may take some time..
    </Typography>
  )}
  
  {/* Show ping failure if applicable */}
  {pingResult && 
 pingResult.toJS && 
 pingResult.toJS().status !== 200 && 
 formData.ipAddress === searchedIpAddress && (
    <Typography sx={{
      color: "#EE0000",
      fontFamily: "Verizon NHG eDS",
      fontWeight: 400,
      fontSize: "12px",
      marginTop: "8px"
    }}>
      Unable to reach the IP address. Please verify and try again.
    </Typography>
  )}
  {/* Show ping success if applicable */}
{pingResult && 
 pingResult.toJS && 
 pingResult.toJS().status === 200 && 
 searchedIpAddress && 
 formData.ipAddress === searchedIpAddress &&  (
  <Typography sx={{
    color: "#006400", /* Dark green color for success */
    fontFamily: "Verizon NHG eDS",
    fontWeight: 400,
    fontSize: "12px",
    marginTop: "8px",
    padding: "8px",
    borderRadius: "4px"
  }}>
    IP address is reachable
  </Typography>
)}
  {/* Show IP already in use warning if available */}
  {ipSearchResult && ipSearchResult.getIn && ipSearchResult.getIn(['status']) && 
   ipSearchResult.getIn(['status']) !== "Not Found" && (
    <Typography sx={{
      color: "#EE0000",
      fontFamily: "Verizon NHG eDS",
      fontWeight: 400,
      fontSize: "12px",
      padding: "8px",
      borderRadius: "4px",
      marginTop: "0px"
    }}>
      IP already in use, see below record found in the server
    </Typography>
  )}
  
  {/* Show HPOV server search results if available */}
   {ipSearchResult && 
 ipSearchResult.getIn && 
 ipSearchResult.getIn(['status']) && 
 ipSearchResult.getIn(['status']) !== "Not Found" && (
   <Box sx={{ 
    color: "#000000", 
    padding: "8px", 
    borderRadius: "4px",
    fontWeight: 400,
    fontSize: "12px",
    fontFamily: "Verizon NHG eDS",
    wordBreak: "break-all"
  }}>
    {ipSearchResult.getIn(['status'])}
  </Box>

    
  )}
</Box>
</Box>
      {/* -------- Submit Button -------- */}
      <Box sx={{ 
  display: "flex", 
  justifyContent: "flex-end", 
  mt: 2,
  alignItems: "center" 
}}>
  {/* Success message */}
  {submissionStatus === 'success' && (
    <Typography sx={{
      color: "#006400", // Dark green for success
      fontFamily: "Verizon NHG eDS",
      fontWeight: 400,
      fontSize: "14px",
      marginRight: "500px"
    }}>
      Your RMU integration request has been submitted successfully
    </Typography>
  )}
  
  {/* Error message */}
  {submissionStatus === 'error' && (
    <Typography sx={{
      color: "#EE0000", // Red for error
      fontFamily: "Verizon NHG eDS",
      fontWeight: 400,
      fontSize: "14px",
      marginRight: "500px"
    }}>
      An error has occurred while processing your request. Please try again later or contact support if the issue persists.
    </Typography>
  )}

  {removalStatus === 'success' && (
  <Typography sx={{
    color: "#006400", // Dark green for success
    fontFamily: "Verizon NHG eDS",
    fontWeight: 400,
    fontSize: "14px",
    marginRight: "500px"
  }}>
    The RMU Device was removed successfully
  </Typography>
)}

{/* Error message for removal */}
{removalStatus === 'error' && (
  <Typography sx={{
    color: "#EE0000", // Red for error
    fontFamily: "Verizon NHG eDS",
    fontWeight: 400,
    fontSize: "14px",
    marginRight: "500px"
  }}>
    The RMU Device was not deleted
  </Typography>
)}
<Button
    variant="outlined"
    onClick={handleClear}
     disabled={!formData.siteNumber && !formData.ipAddress}
    sx={{
      color: "#ffffff",
      backgroundColor: "#000000",
      fontFamily: "Verizon NHG eDS",
      textTransform: "none",
      fontWeight: "bold",
      width: "138px",
      height: "32px",
      padding: "8px 24px",
      marginRight: "16px",
      "&:hover": {
        backgroundColor: "#333333"
      },
    }}
  >
    Clear
  </Button>

  <Button
    variant="contained"
    onClick={handleSubmit}
    disabled={
      // Basic field validation - both must be filled
      !formData.siteNumber || 
    !formData.ipAddress ||
    !formData.requestCategory ||
    !formData.requestApplication ||
    !formData.requestPriority ||
  !formData.requestorName ||
    !formData.requestorEmail ||
    !formData.requestType || 
      
      // Require both checks to have been performed
      !ipCheckPerformed || 
      !siteCheckPerformed ||
      
      // Check if search results indicate records were found (NOT "Not Found")
       !(pingResult && 
    pingResult.toJS && 
    pingResult.toJS().status === 200 && 
    formData.ipAddress === searchedIpAddress) ||
  
  // Different validation based on request type
  (formData.requestType === "hpov_remove" || formData.requestType === "snmp_remove" ? 
    // For REMOVE requests: ENABLE when both site AND IP exist
    !(hpovServerData?.getIn?.(['status']) !== "Not Found" && 
      ipSearchResult?.getIn?.(['status']) !== "Not Found" && !ipSearchIsLoading)
    :
    // For ADD requests: ENABLE when both site AND IP are NOT found
    !(hpovServerData?.getIn?.(['status']) === "Not Found" && 
      ipSearchResult?.getIn?.(['status']) === "Not Found")
  ) ||
  
  // Disable after submission until user clicks clear
  submissionStatus === 'success' || 
  submissionStatus === 'error' ||
  removalStatus === 'success' ||
  removalStatus === 'error'

    }
    sx={{
      backgroundColor: "#000000",
      color: "#ffffff",
      fontFamily: "Verizon NHG eDS",
      textTransform: "none",
      fontWeight: "bold",
      width: "138px",
      height: "32px",
      padding: "8px 24px",
      "&:hover": {
        backgroundColor: "#333333",
      },
      position: "relative"
    }}
  >
    {(isSubmitting || submissionLoading) ? (
      <>
        <CircularProgress 
          size={20} 
          sx={{ 
            color: "#ffffff",
            position: "absolute",
            left: "calc(50% - 10px)"
          }} 
        />
        <span style={{ visibility: "hidden" }}>
          {(formData.requestType === "hpov_remove" || formData.requestType === "snmp_remove") ? "Remove" : "Submit"}
        </span>
      </>
    ) : (
      (formData.requestType === "hpov_remove" || formData.requestType === "snmp_remove") ? "Remove" : "Submit"
    )}
     
  </Button>
</Box>
<Dialog
        open={showConfirmDialog}
        onClose={handleCancelRemoval}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
            padding: "16px"
          }
        }}
      >
        <DialogTitle sx={{
          fontFamily: "Verizon NHG eDS",
          fontWeight: 400,
          fontSize: "14px",
          color: "#000000"
        }}>
          Are you sure you want to remove the RMU registration?
        </DialogTitle>
      
        <DialogActions sx={{ gap: "12px", padding: "16px" }}>
          <Button
            onClick={handleConfirmRemoval}
            variant="outlined"
           sx={{
      color: "#ffffff",
      backgroundColor: "#000000",
      borderColor: "#000000",
      fontFamily: "Verizon NHG eDS",
      textTransform: "none",
      fontWeight: "bold",
      "&:hover": {
        backgroundColor: "#333333",
        borderColor: "#333333"
      }
    }}
          >
            Yes
          </Button>
         <Button
  onClick={handleCancelRemoval}
  variant="contained"
  sx={{
    backgroundColor: "#6F7171", // Grey background
    color: "#ffffff",
    fontFamily: "Verizon NHG eDS",
    textTransform: "none",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#000000" // Black on hover
    }
  }}
>
  No
</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RMUForm;