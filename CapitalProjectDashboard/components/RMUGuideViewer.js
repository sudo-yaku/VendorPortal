import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { fetchFileData } from "../../PreventiveMaintenance/actions";
import { dataURItoBlob, startDownload } from "../../VendorDashboard/utils"; // Import helper functions
import { Document, Page, pdfjs } from "react-pdf";
import "./RMUGuideViewer.css";

// Set the pdf.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const RMUGuideViewer = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [numPages, setNumPages] = useState(0);

  // Get identifiers from redux instead of props
  const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
  const vendorId = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "vendor_id"], ""));

  // Constants for document retrieval - updated to match required payload
  const pmListId = 0; 
  const pmListItemId = 0;
  const updateType = "VP_COMMON";
  const fileName = "RMU Training Guide";
  const isCommonFile = true;

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Call fetchFileData similar to how it's done in NavBar.js
    dispatch(fetchFileData(loginId, vendorId, pmListId, pmListItemId, updateType, fileName, isCommonFile))
      .then((action) => {
        if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && 
            !!action.fileDetails && 
            !!action.fileDetails.getFileDataForPmlist && 
            !!action.fileDetails.getFileDataForPmlist.result) {
          
          // Store the entire result in state
          setDocumentData(action.fileDetails.getFileDataForPmlist);
        } else {
          setError("Unable to retrieve the training guide document.");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching RMU training guide:", err);
        setError("An error occurred while fetching the training guide. Please try again later.");
        setIsLoading(false);
      });
  }, [dispatch, loginId, vendorId]);

  const handleDownload = () => {
    if (documentData && documentData.result && documentData.result.length > 0) {
      documentData.result.forEach(fd => {
        if (!!fd && !!fd.PM_FILE_TYPE && !!fd.PM_FILE_NAME && !!fd.PM_FILE_DATA) {
          // Use the same helper functions as in NavBar.js
          let blob = dataURItoBlob(fd.PM_FILE_DATA);
          startDownload(blob, `${fd.PM_FILE_NAME}.${fd.PM_FILE_TYPE}`);
        }
      });
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = () => {
    // You can add page-specific logic here if needed
  };

  const renderAllPages = () => {
    const pages = [];
    
    for (let i = 1; i <= numPages; i++) {
      // Add the page with bottom border for all except last page
      pages.push(
        <div 
          key={`page_wrap_${i}`} 
          className={`rmu-pdf-page-wrapper ${i < numPages ? 'with-bottom-border' : ''}`}
        >
          <Page
            key={`page_${i}`}
            pageNumber={i}
            onLoadSuccess={onPageLoadSuccess}
            width={Math.min(window.innerWidth - 100, 750)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={
              <div className="rmu-page-loading">
                <CircularProgress />
              </div>
            }
          />
        </div>
      );
      
      // Add a prominent separator div between pages
      if (i < numPages) {
        pages.push(
          <div key={`separator_${i}`} className="rmu-page-separator-prominent">
            <hr style={{ 
              height: '4px', 
              backgroundColor: '#000', 
              border: 'none', 
              margin: '0', 
              borderTop: '0.35rem solid #000' 
            }} />
          </div>
        );
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, border: "1px solid #f44336", borderRadius: "4px", bgcolor: "#ffebee" }}>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Please contact support if this issue persists.
        </Typography>
      </Box>
    );
  }

  // Check if we have document data to display
  const hasDocument = documentData && 
                      documentData.result && 
                      documentData.result.length > 0 && 
                      documentData.result[0] && 
                      documentData.result[0].PM_FILE_DATA;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          onClick={handleDownload}
          variant="contained"
          className="rmu-download-btn"
          disabled={!hasDocument}
        >
          Download
        </Button>
      </Box>    
      {hasDocument ? (
        <div style={{ 
            flexGrow: 1, 
            border: '4px solid #000', 
            borderRadius: '4px',
            height: '600px',
            overflow: 'auto'
          }}>
          <Document
            file={documentData.result[0].PM_FILE_DATA}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="rmu-pdf-loading">
                <CircularProgress />
              </div>
            }
            error={
              <div className="rmu-pdf-error">
                <Typography variant="body1">
                  Failed to load PDF document. Please try again later.
                </Typography>
              </div>
            }
          >
            {renderAllPages()}
          </Document>
        </div>
      ) : (
        <Box sx={{ p: 3, border: "1px solid #ddd", borderRadius: "4px", bgcolor: "#f9f9f9" }}>
          <Typography variant="body1">
            The training guide document is not available at this time. Please try again later.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RMUGuideViewer;