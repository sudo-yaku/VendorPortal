import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import * as React from "react";
import SimpleTable from "../components/SimpleTable";
import Chip from "@mui/material/Chip";


export default function CreatedTestDetails({openAlarmData, isLoading = false}) {
  const demoConfig = [
    { headerName: "Test Name", field: "testName" },
    {
      headerName: "Test Type",
      field: "testType",
    },
    {
      headerName: "Is Adhoc",
      field: "isAdhoc",
    },
    {
      headerName: "Site Type",
      field: "siteType",
    },
    {
      headerName: "Created time",
      field: "createdTime",
    },
    {
      headerName: "Status",
      field: "status",
      render: (value, row) => <Chip label={value} size="small" />,
    },
  ];

  const parseTestDetails = (res = null) => {
    return res ? [{
      testName: res.eat_test_num,
      testType: res.eat_test_type_name,
      isAdhoc: res.is_adhoc_test === "1" ? "Yes" : "No",
      siteType: res.site_type,
      createdTime: res.created_on,
      status: res.eat_test_status,
      is_enable: res.is_required === "1",
    }] : [];
  };

  return (
    <TableContainer component={Paper} style={{ boxShadow: "none" }}>
      <SimpleTable 
        tableId={"created-test-details"} 
        data={parseTestDetails(openAlarmData?.eat_test_status)} 
        config={demoConfig} 
        onClickRow={() => {}}
        sx={{ 
          '& .MuiTableCell-root': {
            padding: '4px 8px',
            fontSize: '13px',
            lineHeight: 1.3
          },
          '& .MuiTableRow-root': {
            height: '36px'
          }
        }}
        size="small"
        dense={true}
      />
    </TableContainer>
  );
}
