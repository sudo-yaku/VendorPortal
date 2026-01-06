import React, { useCallback, useEffect, useRef, useState } from "react";
import "./EssoVendorDashboard.css";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { DataGrid } from "@mui/x-data-grid"

const SummaryDashboardGrid = (props) => {
  const [rowData, setRowData] = useState([]);
  
  useEffect(() => {
    let data = props.vendorData.map((vendor, index) => {
      return (
        {...vendor, id: index}
      )
    })
    setRowData(data);
  }, [])

  let columns = [
    {
      headerName: "Area",
      field: "VENDOR_AREA",
      flex: 1
    },
    {
      headerName: "Market",
      field: "VENDOR_REGION",
      flex: 1
    },
    
    {
      headerName: "OSW Vendor",
      field: "OSW_VENDOR",
      flex: 1
    },

    {
      headerName: "Auto OSW Vendor",
      field: "OSW_ENABLED_COUNT",
      flex: 1
    },
    {
      headerName: "Auto OSW %",
      field: "AUTO_OSW_PERCENTAGE",
      flex: 1,
      valueGetter: value => {
        return value ? parseFloat(value.replace('%', '')) : null
      },
      valueFormatter: value => {
        return value ? `${value}%` : null
      }
    }
  ];

  const apiRef = params =>{
    // console.log("api--,",params)
    window.addEventListener('resize', function() {
      setTimeout(function() {
        params?.autosizeColumns({
          includeHeaders: true,
          includeOutliers: true,
        })
      })
    })
  }

  return (
    <div className="Col Col-12 no-padding">
      <div style={{ margin: "auto", width: "100%" }}>
        <Accordion
          style={{
            margin: "auto",
            width: "96%",
            boxShadow:
              "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px",
            fontWeight: "bold",
          }}
          TransitionProps={{ unmountOnExit: true }}
          defaultExpanded={false}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            Summary
          </AccordionSummary>
          <AccordionDetails>
            <div
              className="col-md-12 col-md-offset-3"
              style={{ display: "flex", alignItems: "center", margin: "auto" }}
            >
              <div className="col-lg-12" style={{ float: "left" }}>
                <DataGrid 
                  apiRef={apiRef}
                  columns={columns}
                  rows={rowData}
                  rowHeight={30}
                  columnHeaderHeight={35}
                  disableRowSelectionOnClick
                  hideFooter
                  autoHeight
                  sx={{ 
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' }
                  }}
                />
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
        <br />
      </div>
    </div>
  );
};
export default SummaryDashboardGrid;
