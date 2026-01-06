import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import React from "react";
import SimpleTable from "../components/SimpleTable";
import StatusChip from "../components/StatusChip";


const getSeverityPriority = (severity) => {
  
  const normalizedSeverity = severity ? severity.trim() : "";
  
  const severityOrder = {
    'CRITICAL': 1,
    'MAJOR': 2,
    'MINOR': 3,
    'WARNING': 4,
    'Critical': 1,
    'Major': 2,
    'Minor': 3,
    'Warning': 4
  };
  
  
  const priority = severityOrder[normalizedSeverity];
    
  return priority || 999;
};

// Parse data with improved sorting
const parseAlarmDetailsData = (res = null, isRequiredOnly) => {
  if (!res) return [];

  const mapItem = (item) => {
    
    return {
      test: item.eat_indv_test_name,
      severity: item.alarm_severity,
      alarmStatus: item.alarm_status,
      clearStatus: item.clear_status,
      alarmInformation:
        item.alarm_info.length > 0 ? item.alarm_info.join(", ") : "",
      required: item.is_required === "1" ? "Yes" : "No",
      include: item.is_included === "1",
    };
  };

  // Filter if showing only required tests
  const filteredData = isRequiredOnly
    ? res.filter((item) => item.is_required === "1")
    : res;

  const mappedData = filteredData.map(mapItem);

  // Sort the data with improved logic:
  const sortedData = mappedData.sort((a, b) => {
    // First sort by required status
    if (a.required === "Yes" && b.required === "No") {
      return -1; 
    }
    if (a.required === "No" && b.required === "Yes") {
      return 1;
    }

    // Then sort by severity within the same required group
    const severityPriorityA = getSeverityPriority(a.severity);
    const severityPriorityB = getSeverityPriority(b.severity);
  
    return severityPriorityA - severityPriorityB;
  });

  return sortedData;
};

// Update the component signature to include allRequiredTestsPassed
const CreatedAlarmDetailsTable = ({
  openAlarmData,
  isRequiredOnly = true,
  isStart = false,
  isCompleted = false,
  allRequiredTestsPassed = false,
  handlePrimaryBtnClick = () => {},
  handleSecondaryBtnClick = () => {},
  handleCheckBoxClick = () => {},
  setOpenAlarmData = () => {},
}) => {
  const handleChangeRowCheckbox = (row, checked) => {
    setOpenAlarmData((prevData) => {
      if (!prevData) return prevData;
      const updatedTests = prevData?.eat_test_status?.indiv_tests.map((test) =>
        test.eat_indv_test_name === row.test
          ? { ...test, is_included: checked ? "1" : "0" }
          : test
      );
  
      return {
        ...prevData,
        eat_test_status: {
          ...prevData.eat_test_status,
          indiv_tests: updatedTests,
        },
      };
    });
  };

  const tableConfig = [
    { headerName: "Test", field: "test" },
    {
      headerName: "Severity",
      field: "severity",
    },
    {
      headerName: "Alarm Status",
      field: "alarmStatus",
      render: (value, row) => <StatusChip status={value} size="small" />,
    },
    {
      headerName: "Clear Status",
      field: "clearStatus",
      render: (value, row) => <StatusChip status={value} size="small" />,
    },
    {
      headerName: "Alarm Information",
      field: "alarmInformation",
      width: "120px",
    },
    {
      headerName: "Required",
      field: "required",
    },
    {
      headerName: "Include",
      field: "include",
      render: (value, row) => (
        <Checkbox
          checked={value}
          disabled={row.required === "Yes"}
          onChange={(e) => handleChangeRowCheckbox(row, e.target.checked)}
          size="small"
          sx={{ padding: "2px" }}
        />
      ),
    },
  ];

  const tableData = parseAlarmDetailsData(
    openAlarmData?.eat_test_status?.indiv_tests,
    isRequiredOnly
  );

  const hasIncludedTests = openAlarmData?.eat_test_status?.indiv_tests?.some(
    test => test.is_included === "1"
  );

  return (
    <>
      <Stack sx={{ marginTop: "12px" }}>
        <Stack direction={"row"} justifyContent={"space-between"} sx={{ mb: 1 }}>
          <Typography fontSize={"14px"} fontWeight={"700"}>
            All Schedule Alarm Status
          </Typography>
          {(isCompleted || isStart) && (
            <Stack
              justifyContent={"center"}
              alignItems={"center"}
              style={{
                width: "608px",
                height: "30px",
                backgroundColor: "#E3F2FD",
                borderRadius: "40px",
              }}
            >
              <Typography fontSize={"14px"} fontWeight={"700"}>
                {isCompleted ? (
                  <>Completed <span style={{color: "#006FC1"}}>0:00</span></>
                ) : (
                  <>Run In-progress <span style={{color: "#006FC1"}}>
                    {
                      openAlarmData?.eat_test_status?.run_info
                        ?.remaining_time ?? "0:00"
                    }</span> Remaining</>
                )}
              </Typography>
          </Stack>
           )}
          <FormControlLabel
            control={
              <Checkbox
                checked={isRequiredOnly}
                disabled={isStart}
                onChange={handleCheckBoxClick}
                size="small" 
                sx={{ padding: "2px" }}
              />
            }
            label={<Typography fontSize="14px">Show only required</Typography>}
            sx={{ margin: 0 }}
          />
        </Stack>
        <SimpleTable
          tableId={"created-alarm-details-table"}
          sx={{ 
            borderTop: "2px solid black",
           
            '& .MuiTableCell-root': {
              padding: '4px 8px',
              fontSize: '13px',
              lineHeight: 1.3
            },
            '& .MuiTableRow-root': {
              height: '36px'
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              padding: '6px 8px',
              fontWeight: 600
            }
          }}
          data={tableData}
          config={tableConfig}
          size="small" 
          dense={true} 
        />
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"end"}
          gap={2}
          sx={{ mt: 1.5 }} 
        >
          <Button 
            variant="contained"
            onClick={handlePrimaryBtnClick}
            size="small"
            sx={{ py: 0.75, minWidth: '100px', backgroundColor: "#000" }}
          >
            {allRequiredTestsPassed 
              ? "Test Complete" 
              : isStart 
                ? "Stop Run" 
                : "Start Run"}
          </Button>
          <Button
            variant="contained"
            disabled={isStart && !allRequiredTestsPassed}
            onClick={handleSecondaryBtnClick}
            size="small"
            sx={{ py: 0.75, minWidth: '80px', backgroundColor: "#000" }}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default CreatedAlarmDetailsTable;