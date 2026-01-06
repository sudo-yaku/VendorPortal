import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import SimpleTable from "../components/SimpleTable";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import { useSelector,useDispatch } from "react-redux";
import FormControl from "@mui/material/FormControl";
import { getSiteTypes} from "../actions";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";

export const parseAlarmTestingData = (data) => {
  const rmuDevicename = data.getHostnameMapping.data.hostname
  return data.getTestInfo.test_info.test_types.map((item, i) => ({
    id: item.test_type_id,
    testType: item.test_type_name,
    monitorBy: item.monitored_by,
    lastTestDate: item.last_test_date,
    nextTestDate: item.next_test_date,
    siteType: item.test_type_name === "Tower Light" ? "N/A" : "Cell",
    adhoc: false,
    include: false,
		testInfoText: `${item.test_type_name} test is not enabled for this site.`,
    is_enable: item.is_enabled === "yes",
    rmuDeviceName: rmuDevicename
  }));
};

export function prepareAlarmTestPayload(alarmType, selectedRow, loginId) {
  return {
    input: {
      siteUnid: selectedRow.site_unid,
      createdBy: loginId,
      testTypeNames: [alarmType.testType],
      siteType: alarmType.siteType === "N/A" ? "" : alarmType.siteType,
      isAdhocTest: alarmType.adhoc ? 1 : 0,
      spmId: Number(selectedRow.proj_number),
      rmuDeviceName: alarmType.rmuDeviceName,
      sourceSystem: "OpsPortal",
    }
  };
}

export default function CreatedAlarmTest({
  setSelectedData,
  alarmTypes,
  setAlarmTypes,
}) {
    const dispatch = useDispatch();
  
  // Get site types from Redux store
 const siteTypesData = useSelector(state => 
  state.getIn(["CapitalProjectDashboard", "siteTypes"])
);
 const siteTypes = React.useMemo(() => {
    if (siteTypesData && siteTypesData.get('data')) {
      const siteTypesArray = siteTypesData.get('data').toJS();
      return siteTypesArray.map(siteType => ({
        value: siteType.site_type_name,
        label: siteType.site_type_name
      }));
    }
    // Return empty array if no data available
    return [];
  }, [siteTypesData]);

  // Fetch site types when component mounts
  React.useEffect(() => {
    dispatch(getSiteTypes());
  }, [dispatch]);
  const updateFormData = (rowData, field, value) => {
    setAlarmTypes((prevState) => {
      const updatedData = prevState.map((item) => {
        if (field === "include" && value) {
          setSelectedData(rowData); // Set the selected row
          return { ...item, include: item.id === rowData.id };
        }
        return item.id === rowData.id ? { ...item, [field]: value } : item;
      });
      return updatedData;
    });
  };
  const tableColumns = [
    { headerName: "Test Type", field: "testType" },
    {
      headerName: "Monitor By",
      field: "monitorBy",
    },
    {
      headerName: "Last Test Date",
      field: "lastTestDate",
    },
    {
      headerName: "Next Test Date",
      field: "nextTestDate",
    },
    {
      headerName: "Site Type",
      field: "siteType",
      render: (value, row) =>
        value == "N/A" ? (
          "N/A"
        ) : (
          <FormControl fullWidth size="small">
            <Select
              value={value}
              size="small"
              disabled={!row.is_enable}
              onChange={(e) => updateFormData(row, "siteType", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: "4px",
                },
                "& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input": {
                  paddingRight: "12px",
                }
              }}
            >
              {siteTypes.length > 0 ? (
                siteTypes.map((siteType) => (
                  <MenuItem key={siteType.value} value={siteType.value}>
                    {siteType.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No site types available
                </MenuItem>
              )}
            </Select>
          </FormControl>
        ),
    },
    {
      headerName: (
        <span style={{ display: "flex", alignItems: "center" }}>
          Adhoc
          <Tooltip
            title="By marking this as an adhoc, a mock test will be created. That test won't impact the due date of the next test."
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  fontSize: '1.1rem',
                  maxWidth: 300,
                  lineHeight: 1.7,
                  padding: '8px 12px',
                }
              }
            }}
          >
            <InfoOutlinedIcon
              color="info"
              fontSize="small"
              style={{ marginLeft: 4, cursor: "pointer" }}
            />
          </Tooltip>
        </span>
      ),
      field: "adhoc",
      render: (value, row) => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            disabled={!row.is_enable}
            checked={value}
            onChange={(e) => updateFormData(row, "adhoc", e.target.checked)}
          />
        </span>
      ),
    },
    {
      headerName: "Include",
      field: "include",
      render: (value, row) => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <Radio
            checked={value}
            disabled={!row.is_enable}
            onChange={(e) => updateFormData(row, "include", e.target.checked)}
          />
          {!row.is_enable && (
            <Tooltip
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: '1.1rem',
                    maxWidth: 600,
                    whiteSpace: 'normal',
                    lineHeight: 1.7,
                    padding: '12px 16px',
                  }
                }
              }}
              title={
                <span
                  dangerouslySetInnerHTML={{
                    __html: (row.testInfoText || "")
                      .replace(/\n/g, "<br/>")
                      .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
                  }}
                />
              }
            >
              <InfoOutlinedIcon
                color="info"
                fontSize="small"
                style={{ marginLeft: 4, cursor: "pointer" }}
              />
            </Tooltip>
          )}
        </span>
      ),
    },
  ];

  return (
    <TableContainer component={Paper} style={{ boxShadow: "none" }}>
      <SimpleTable
        tableId={"created-alarm-test"}
        data={alarmTypes}
        config={tableColumns}
      />
    </TableContainer>
  );
}
