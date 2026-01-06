import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import Accordion from "@mui/material/Accordion";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import CreateAlarmTest, {
  parseAlarmTestingData,
  prepareAlarmTestPayload,
} from "./AlarmTesting/CreateAlarmTest";
import CreatedTestDetails from "./AlarmTesting/CreatedTestDetails";
import CreatedAlarmDetailsTable from "./AlarmTesting/CreatedAlarmDetailsTable";
import {
  cancelEatTestRequest,
  completeEatTestRequest,
  createEatTestRequest,
  getAlarmTestInfo,
  getOpenTest,
  getTestStatusRequest,
  startEatTestRequest,
  stopEatTestRequest,
} from "./actions";
import AppThemeProvider from "./AppThemeProvider";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Map } from "immutable";

const Loading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      backgroundColor: "white",
      width: "100%",
    }}
  >
    <CircularProgress size={24} />
  </div>
);

export default function EnvironmentalAlarmTesting({
  selectedRow,
  loginId,
  statusApiDelay = 20,
  email,
  siteTechEmail
}) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = React.useState("panel1");
  const [selectedData, setSelectedData] = React.useState(null);
  const [openAlarmData, setOpenAlarmData] = React.useState(null);
  const [alarmTypes, setAlarmTypes] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [isRequiredOnly, setIsRequiredOnly] = React.useState(true);
  const [isStart, setIsStart] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [allRequiredTestsPassed, setAllRequiredTestsPassed] = React.useState(false);
  const intervalRef = React.useRef(null);
  const user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], Map()));

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const checkRequiredTestsStatus = (indivTests) => {
    if (!indivTests || indivTests.length === 0) return false;

    const requiredTests = indivTests.filter(test => test.is_required === "1");
    const includedTests = indivTests.filter(test => test.is_included === "1");

    if (requiredTests.length > 0) {
      return requiredTests.every(
        test => test.alarm_status === "PASS" && test.clear_status === "PASS"
      );
    } else if (includedTests.length > 0) {
      return includedTests.every(
        test => test.alarm_status === "PASS" && test.clear_status === "PASS"
      );
    }
    return false;
  };

  // Update the updateOpenAlarmsDataInterval function to preserve completed state
  const updateOpenAlarmsDataInterval = async () => {
    try {
      const payload = {
        eatTestId: Number(openAlarmData.eat_test_status.eat_test_id),
      };

      const data = await getTestStatusRequest(payload);
      
      // Check if status is COMPLETED in the response
      const isCompletedInResponse = 
        data?.getTestStatus?.eat_test_status?.run_info?.status === "COMPLETED" &&
        data?.getTestStatus?.eat_test_status?.run_info?.remaining_time === "";
      
      if (isCompletedInResponse) {
        setIsCompleted(true);
        setIsStart(false);
      } else if (
        !isCompleted && // Only change state if not already completed
        data?.getTestStatus?.eat_test_status?.run_info?.in_progress === "no"
      ) {
        setIsStart(false);
      } else if (
        !isCompleted && // Only change state if not already completed
        data?.getTestStatus?.eat_test_status?.run_info?.in_progress === "yes" &&
        data?.getTestStatus?.eat_test_status?.run_info?.remaining_time !== ""
      ) {
        setIsCompleted(false);
        setIsStart(true);
      }
      
      // Check if all required tests have passed and set state
      const testsCompleted = checkRequiredTestsStatus(data?.getTestStatus?.eat_test_status?.indiv_tests);
      setAllRequiredTestsPassed(testsCompleted);
      
      setOpenAlarmData(data.getTestStatus);
    } catch (error) {
      console.error("Error in updateOpenAlarmsDataInterval:", error);
    }
  };

  const fetchAlarmTestInfo = async () => {
    try {
      const data = await dispatch(
        getAlarmTestInfo(
          selectedRow.site_unid,
          selectedRow.proj_number,
          "getHostnameMappingV3"
        )
      );
      const tableData = parseAlarmTestingData(data);
      // Ensure all adhoc and include values are initialized to false
      const initializedData = tableData.map(item => ({
        ...item,
        adhoc: false,
        include: false
      }));
      setSelectedData(null);
      setAlarmTypes(initializedData);
    } catch (error) {
      console.error("Error fetching alarm test info:", error);
    }
  };
  // Update the fetchOpenTestInfo function to properly set completed state
  const fetchOpenTestInfo = async () => {
    try {
      const data = await getOpenTest(selectedRow.site_unid);
      if (Object.keys(data?.getOpenTest?.eat_test_status).length) {
        setIsCompleted(false); // <-- Reset completed state for new test
        setOpenAlarmData(data.getOpenTest);
        
        const isCompletedStatus = 
          data?.getOpenTest?.eat_test_status?.run_info?.status === "COMPLETED" &&
          data?.getOpenTest?.eat_test_status?.run_info?.remaining_time === "";
        
        if (isCompletedStatus) {
          setIsCompleted(true);
          setIsStart(false);
        } else if (
          data?.getOpenTest?.eat_test_status?.run_info?.in_progress === "no"
        ) {
          setIsStart(false);
        } else if (
          data?.getOpenTest?.eat_test_status?.run_info?.in_progress === "yes"
        ) {
          setIsCompleted(false);
          setIsStart(true);
        }
        
        // Check if all required tests have passed
        const testsCompleted = checkRequiredTestsStatus(data.getOpenTest?.eat_test_status?.indiv_tests);
        setAllRequiredTestsPassed(testsCompleted);
      } else {
        setOpenAlarmData(null);
        setIsStart(false);
        setIsCompleted(false);
        setAllRequiredTestsPassed(false);
      }
    } catch (error) {
      console.error("Error fetching open test info:", error);
    }
  };

  const handleCreateTestButton = async () => {
    const selectAlarmType = alarmTypes.find((e) => e.include);
    const rmuDeviceName = selectAlarmType.rmuDeviceName || "DEFAULT_RMU_DEVICE";
    const formattedHostname = rmuDeviceName
      .replace(/[_\s]/g, "-")
      .concat(`${selectAlarmType.requestApplication || "SITEBOSS"}`);

    // Use the utility function to prepare the payload
    const payload = prepareAlarmTestPayload(
      { ...selectAlarmType, rmuDeviceName: formattedHostname },
      selectedRow,
      loginId
    );

    setLoading(true);
    await createEatTestRequest(payload);
    await fetchOpenTestInfo();
    setLoading(false);
  };

  const handlePrimaryBtnClick = async () => {
    if (allRequiredTestsPassed) {
      try {
        const payload = {
          input: {
            eatTestId: openAlarmData.eat_test_status.eat_test_id,
            userId: loginId,
            source_system: "OPSPORTAL",
            email_list: [email, siteTechEmail].filter(Boolean),
            vendor_fname: user.get("fname"),
            vendor_lname: user.get("lname"),
            company_name: user.get("vendor_name")
          },
        };
        await completeEatTestRequest(payload);
        await refreshCreatedTestStatus(openAlarmData.eat_test_status.eat_test_id); 
        setOpenAlarmData(prevData => ({
          ...prevData,
          showFlag: false
        }));
        setIsCompleted(true);
        setIsStart(false);
        resetAlarmTypeSelections();
      } catch (error) {
        console.error("Error completeEatTestRequest:", error);
      }
      return;
    }

    // Then handle other cases
    if (isCompleted) {
      try {
        const payload = {
          input: {
            eatTestId: openAlarmData.eat_test_status.eat_test_id,
            userId: loginId,
            source_system: "OPSPORTAL",
            email_list: [email, siteTechEmail].filter(Boolean),
            vendor_fname: user.get("fname"),
            vendor_lname: user.get("lname"),
            company_name: user.get("vendor_name")
          },
        };
        await completeEatTestRequest(payload);
        setOpenAlarmData(prevData => ({
          ...prevData,
          showFlag: false
        }));
        resetAlarmTypeSelections();
      } catch (error) {
        console.error("Error completeEatTestRequest:", error);
      }
    } else if (!isStart) {
      const includedTests = openAlarmData.eat_test_status.indiv_tests.filter(test => test.is_included === "1");
      if (includedTests.length === 0) {
        return;
      }
      try {
        const payload = {
          input: {
            eatTestId: openAlarmData.eat_test_status.eat_test_id,
            userId: loginId,
            indiv_tests: openAlarmData.eat_test_status.indiv_tests.map(({eat_indv_test_id, eat_indv_test_name, is_required, is_included}) => ({
              eat_indv_test_id, eat_indv_test_name, is_required, is_included
            })),
          },
        };
        await startEatTestRequest(payload);
        setIsStart(true);
      } catch (error) {
        console.error("Error startEatTestRequest:", error);
      }
    } else {
      try {
        const payload = {
          input: {
            eatTestId: openAlarmData.eat_test_status.eat_test_id,
            userId: loginId,
          },
        };
        await stopEatTestRequest(payload);
        setIsStart(false);
      } catch (error) {
        console.error("Error stopEatTestRequest:", error);
      }
    }
  };

  const handleSecondaryBtnClick = async () => {
    try {
      const payload = {
        input: {
          eatTestId: openAlarmData.eat_test_status.eat_test_id,
          userId: loginId,
        },
      };
      await cancelEatTestRequest(payload);
      await refreshCreatedTestStatus(openAlarmData.eat_test_status.eat_test_id);
      setOpenAlarmData(prevData => ({
        ...prevData,
        showFlag: false
      }));
      resetAlarmTypeSelections();
    } catch (error) {
      console.error("Error cancelEatTestRequest:", error);
    }
  };

  const handleCheckBoxClick = () => {
    setIsRequiredOnly((prev) => !prev);
  };

  // Add this function before the return statement to check button state
  const isCreateTestEnabled = () => {
    // Check if any test type is selected (included), required, and adhoc
    return alarmTypes.some(test => 
      test.include === true &&
      test.adhoc === true &&
      test.is_enable === true 
    );
  };

  // Add resetAlarmTypeSelections function
  const resetAlarmTypeSelections = () => {
    setAlarmTypes((prevTypes) => 
      prevTypes.map(type => ({
        ...type,
        adhoc: false,
        include: false
      }))
    );
  };

  const refreshCreatedTestStatus = async (eatTestId) => {
    try {
      const payload = { eatTestId: Number(eatTestId) };
      const data = await getTestStatusRequest(payload);
      if (data?.getTestStatus?.eat_test_status) {
        setOpenAlarmData(prev => ({
          ...prev,
          eat_test_status: data.getTestStatus.eat_test_status
        }));
      }
    } catch (error) {
      console.error("Error refreshing created test status:", error);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchOpenTestInfo(), fetchAlarmTestInfo()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedRow?.site_unid) {
      fetchData();
    }
  }, [selectedRow, loginId]);

  React.useEffect(() => {
    if (isStart && !isCompleted) {
      updateOpenAlarmsDataInterval();
      // run on interval
      intervalRef.current = setInterval(() => {
        updateOpenAlarmsDataInterval();
      }, statusApiDelay * 1000);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStart, isCompleted]);

  // Add this useEffect after the other useEffects
  React.useEffect(() => {
    // Check test status whenever openAlarmData changes
    if (openAlarmData?.eat_test_status?.indiv_tests) {
      const testsCompleted = checkRequiredTestsStatus(openAlarmData.eat_test_status.indiv_tests);
      setAllRequiredTestsPassed(testsCompleted);
    }
  }, [openAlarmData]);

  React.useEffect(() => {
    const requiredExists = openAlarmData?.eat_test_status?.indiv_tests?.some(
      test => test.is_required === "1"
    );
    if (requiredExists) {
      setIsRequiredOnly(true);
    } else {
      setIsRequiredOnly(false);
    }
  }, [openAlarmData]);

  return (
    <AppThemeProvider>
      <Accordion
        TransitionProps={{ unmountOnExit: true }}
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          expandIcon={<KeyboardArrowDownIcon />}
          sx={{
            height: "48px",
            border: "1px solid #D8DADA",
            "&.Mui-expanded": {
              minHeight: "48px !important",
            },
          }}
        >
          <Typography fontWeight={"bold"}>Alarm Testing</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {isLoading && <Loading />}
          {!isLoading && (
            <Stack style={{ width: "100%" }}>
              
              <Stack
                direction={"row"}
                gap={2}
                justifyContent={"center"}
                alignContent={"center"}
                style={{ width: "100%" }}
              >
                <Card
                  style={{
                    flex: 1,
                    boxShadow: "none",
                    borderRadius: "7px",
                    border: "1px solid #A7A7A7",
                  }}
                >
                  <Box
                    sx={{
                      padding: "12px",
                      borderBottom: "1px solid #A7A7A7",
                      backgroundColor: "#F6F6F6",
                      fontSize: "12px !important",
                      fontWeight: "700 !important",
                    }}
                  >
                    <Typography fontSize={"14px"} fontWeight={"700"}>
                      Create Alarm Test
                    </Typography>
                  </Box>
                  <CreateAlarmTest
                    alarmTypes={alarmTypes}
                    setAlarmTypes={setAlarmTypes}
                    setSelectedData={setSelectedData}
                  />
                </Card>
                <Card
                  style={{
                    flex: 1,
                    boxShadow: "none",
                    borderRadius: "7px",
                    border: "1px solid #A7A7A7",
                  }}
                >
                  <Box
                    sx={{
                      padding: "12px",
                      borderBottom: "1px solid #A7A7A7",
                      backgroundColor: "#F6F6F6",
                    }}
                  >
                    <Typography fontSize={"14px"} fontWeight={"700"}>
                      Created Test Details
                    </Typography>
                  </Box>
                  <CreatedTestDetails openAlarmData={openAlarmData} />
                </Card>
              </Stack>
              <Stack
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingBottom: "16px",
                  paddingTop: "8px",
                }}
              >
                {(!openAlarmData || openAlarmData?.showFlag == false) && (<Button
                    variant="contained"
                    style={{
                      backgroundColor: "#000",
                      color: "#fff",
                      marginTop: "8px",
                      width: "138px",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                    onClick={handleCreateTestButton}
                    disabled={!isCreateTestEnabled()}
                  >
                    Create Test
                  </Button>
                )}
              </Stack>
              {(!!openAlarmData && (openAlarmData?.showFlag ?? true)) && (<CreatedAlarmDetailsTable
                  openAlarmData={openAlarmData}
                  isRequiredOnly={isRequiredOnly}
                  isStart={isStart}
                  isCompleted={isCompleted}
                  allRequiredTestsPassed={allRequiredTestsPassed}
                  handlePrimaryBtnClick={handlePrimaryBtnClick}
                  handleSecondaryBtnClick={handleSecondaryBtnClick}
                  handleCheckBoxClick={handleCheckBoxClick}
                  setOpenAlarmData={setOpenAlarmData}
                />
              )}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>
    </AppThemeProvider>
  );
}
