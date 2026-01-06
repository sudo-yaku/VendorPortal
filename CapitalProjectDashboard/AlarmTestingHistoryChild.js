import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import StatusChip from './components/StatusChip';

const AlarmTestingHistoryChild = ({ data }) => {
  const [childData, setChildData] = useState([]);

  useEffect(() => {
    if (data && data.indiv_tests) {
      // Transform individual tests data
      const transformedData = data.indiv_tests.map((test, index) => ({
        id: test.eat_indv_test_id,
        test: test.eat_indv_test_name,
        severity: test.alarm_severity,
        alarmStatus: formatStatus(test.alarm_status),
        clearStatus: formatStatus(test.clear_status),
        alarmInformation: formatAlarmInformation(test.alarm_info),
        required: test.is_required === "1" ? "Yes" : "No"
      }));

      setChildData(transformedData);
    }
  }, [data]);

  const formatStatus = (status) => {
    if (!status) return "";
    
    switch (status.toUpperCase()) {
      case "PASS":
        return "Pass";
      case "FAIL":
        return "Fail";
      case "INPROGRESS":
        return "In Progress";
      case "TIMEOUT":
        return "Timeout";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };


  const formatAlarmInformation = (alarmInfo) => {
    if (!alarmInfo || alarmInfo.length === 0) return "";
    

    const formattedInfo = alarmInfo.map(alarm => 
      `${alarm.alarm_id}|${alarm.amo_name}`
    ).join(' | ');
    
    return formattedInfo;
  };

  // Column definitions for child table
  const childColumns = [
    {
      headerName: "Test",
      field: "test",
      flex: 1.5,
      minWidth: 150
    },
    {
      headerName: "Severity",
      field: "severity",
      flex: 1,
      minWidth: 100
    },
    {
      headerName: "Alarm Status",
      field: "alarmStatus",
      flex: 1,
      minWidth: 110,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    {
      headerName: "Clear Status",
      field: "clearStatus",
      flex: 1.2,
      minWidth: 130,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    {
      headerName: "Alarm Information",
      field: "alarmInformation",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <div style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '12px',
          fontFamily: 'Verizon NHG eDS'
        }}>
          {params.value}
        </div>
      )
    },
    {
      headerName: "Required",
      field: "required",
      flex: 0.8,
      minWidth: 80
    }
  ];

  if (!data || !data.indiv_tests || data.indiv_tests.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: 'white', 
        margin: '0',
        fontFamily: 'Verizon NHG eDS',
        fontSize: '12px',
        fontStyle: 'italic',
        color: '#666'
      }}>
        No individual test details available.
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '0', 
      backgroundColor: 'white', 
      margin: '0'
    }}>
      <DataGrid
        rows={childData}
        columns={childColumns}
        rowHeight={35}
        columnHeaderHeight={30}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnSeparator
        hideFooter
        autoHeight
        sx={{
          fontSize: '12px',
          fontFamily: 'Verizon NHG eDS',
          border: 'none',
          '& .MuiDataGrid-main': {
            border: 'none'
          },
          '& .MuiDataGrid-root': {
            border: 'none'
          },
          '& .MuiDataGrid-columnHeaders': {
            borderTop: 'none',
            borderBottom: '1px solid #000'
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: 'none'
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none'
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Verizon NHG eDS'
          },
          '& .MuiDataGrid-cell': {
            fontSize: '12px',
            fontWeight: 400,
            fontFamily: 'Verizon NHG eDS',
            borderBottom: '0.5px solid #e0e0e0',
            borderRight: 'none'
          },
          '& .MuiDataGrid-row': {
            borderLeft: 'none',
            borderRight: 'none'
          }
        }}
        slotProps={{
          basePopper: {
            disablePortal: true
          }
        }}
      />
    </div>
  );
};

export default AlarmTestingHistoryChild;