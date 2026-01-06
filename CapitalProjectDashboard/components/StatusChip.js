import React from 'react';
import { Chip } from '@mui/material';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import WarningIcon from '@material-ui/icons/Warning';

const StatusChip = ({ status, size = "small" }) => {
  const renderStatusChip = (status) => {
    if (status === "Pass" || status === "PASS" ) {  
      return (
        <Chip 
          label="Pass" 
          size={size}
          icon={<CheckCircleOutlineIcon style={{ color: '#4caf50', fontSize: '16px' }} />}
          sx={{ 
            backgroundColor: "rgba(220, 245, 230, 1)",
            '& .MuiChip-icon': { marginLeft: '8px' },
            '& .MuiChip-label': { 
              fontSize: '12px', 
              fontWeight: 400, 
              fontFamily: 'Verizon NHG eDS' 
            }
          }} 
        />
      );
    } else if (status === "Completed" || status === "COMPLETED" ) {  
      return (
        <Chip 
          label="Completed" 
          size={size}
          icon={<CheckCircleOutlineIcon style={{ color: '#4caf50', fontSize: '16px' }} />}
          sx={{ 
            backgroundColor: "rgba(220, 245, 230, 1)",
            '& .MuiChip-icon': { marginLeft: '8px' },
            '& .MuiChip-label': { 
              fontSize: '12px', 
              fontWeight: 400, 
              fontFamily: 'Verizon NHG eDS' 
            }
          }} 
        />
      );
    } else if (status === "Fail") {
      return (
        <Chip 
          label="Fail" 
          size={size}
          icon={<CancelOutlinedIcon style={{ color: '#f44336', fontSize: '16px' }} />}
          sx={{ 
            backgroundColor: 'rgba(238, 0, 0, 0.1)',
            '& .MuiChip-icon': { marginLeft: '8px' },
            '& .MuiChip-label': { 
              fontSize: '12px', 
              fontWeight: 400, 
              fontFamily: 'Verizon NHG eDS' 
            }
          }} 
        />
      );
    } else if (status === "In Progress" || status === "INPROGRESS") {
      return (
        <Chip 
          label="In Progress" 
          size={size}
          icon={<AccessTimeIcon style={{ color: '#2196f3', fontSize: '16px' }} />}
          sx={{ 
            backgroundColor: 'rgba(227, 242, 253, 1)',
            '& .MuiChip-icon': { marginLeft: '8px' },
            '& .MuiChip-label': { 
              fontSize: '12px', 
              fontWeight: 400, 
              fontFamily: 'Verizon NHG eDS' 
            }
          }} 
        />
      );
    } else if (status === "Timeout" || status === "TIMEOUT") {
      return (
        <Chip 
          label="Timeout" 
          size={size}
          icon={<WarningIcon style={{ color: '#ff9800', fontSize: '16px' }} />}
          sx={{ 
            backgroundColor: 'rgba(255, 243, 224, 1)',
            '& .MuiChip-icon': { marginLeft: '8px' },
            '& .MuiChip-label': { 
              fontSize: '12px', 
              fontWeight: 400, 
              fontFamily: 'Verizon NHG eDS' 
            }
          }} 
        />
      );
    }
    
    return (
      <Chip 
        label={status} 
        size={size}
        sx={{ 
          backgroundColor: 'rgba(245, 245, 245, 1)',
          '& .MuiChip-label': { 
            fontSize: '12px', 
            fontWeight: 400, 
            fontFamily: 'Verizon NHG eDS' 
          }
        }} 
      />
    );
  };

  return renderStatusChip(status);
};

export default StatusChip;