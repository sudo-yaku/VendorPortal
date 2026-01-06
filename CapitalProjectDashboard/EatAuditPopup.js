import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@material-ui/icons/Close';
import { getEatAudit } from './actions';

const EatAuditPopup = ({ open, onClose, eatTestId }) => {
  const dispatch = useDispatch();

  const auditData = useSelector(state => {
    const capitalProject = state.get('CapitalProjectDashboard');
    if (capitalProject) {
      return capitalProject.getIn(['getEatAudit', 'auditData']) || [];
    }
    return [];
  });

  const isLoading = useSelector(state => 
    state.getIn(['CapitalProjectDashboard', 'getEatAudit', 'isLoading']) || false
  );

  const errors = useSelector(state => 
    state.getIn(['CapitalProjectDashboard', 'getEatAudit', 'errors']) || null
  );

  useEffect(() => {
    
    if (open && eatTestId) {
      dispatch(getEatAudit(eatTestId));
    }
  }, [dispatch, open, eatTestId]);

  const transformedAuditData = React.useMemo(() => {
    if (!auditData) {
      return [];
    }

   
    let auditInfo;
    if (auditData.toJS) {
      auditInfo = auditData.toJS();
    } else {
      auditInfo = auditData;
    }

    let auditLogArray = [];
    if (auditInfo && auditInfo.audit_log && Array.isArray(auditInfo.audit_log)) {
      auditLogArray = auditInfo.audit_log;
    } else if (Array.isArray(auditInfo)) {
     
      auditLogArray = auditInfo;
    }

    return auditLogArray.map((audit, index) => ({
      id: audit.audit_id || index,
      createdTime: audit.create_Time ? 
        new Date(audit.create_Time).toLocaleString() : 'N/A',
      audit: audit.text || 'N/A'
    }));
  }, [auditData]);

  const headingStyles = {
    fontFamily: 'Verizon NHG eDS',
    fontWeight: 700,
    fontSize: '14px',
    margin: 0 
  };

  const contentStyles = {
    fontFamily: 'Verizon NHG eDS',
    fontWeight: 400,
    fontSize: '14px'
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '4px',
          fontFamily: 'Verizon NHG eDS'
        }
      }}
    >
      <DialogTitle
        style={{
          ...headingStyles,
          fontSize: '16px',
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        EAT Audit
        <IconButton
          onClick={onClose}
          size="small"
          style={{ padding: '4px' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent style={{ padding: '16px', minHeight: '300px' }}>
        {/* Loading State */}
        {isLoading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '40px'
          }}>
            <CircularProgress size={24} />
            <span style={{ 
              marginLeft: '10px', 
              ...contentStyles
            }}>
              Loading audit data...
            </span>
          </div>
        )}

        {/* Error State */}
        {errors && !isLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#d32f2f',
            ...contentStyles
          }}>
            Error loading audit data: {errors}
          </div>
        )}

        {/* Table Content */}
        {!isLoading && !errors && (
          <div style={{ margin: '0 16px' }}>
            {/* Table Headers */}
            <div style={{ borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
              <div style={{ 
                display: 'flex', 
                backgroundColor: 'white',
                height: '35px', 
                alignItems: 'center',
                ...headingStyles
              }}>
                <div style={{ flex: 1, padding: '0 16px', borderRight: 'none' }}>Created Time</div>
                <div style={{ flex: 2, padding: '0 16px', borderRight: 'none' }}>Audit</div>
              </div>
            </div>

            {/* Table Rows */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {transformedAuditData.length > 0 ? (
                transformedAuditData.map((row, index) => (
                  <div key={row.id} style={{ 
                    display: 'flex', 
                    minHeight: '40px', 
                    alignItems: 'center',
                    borderBottom: '0.5px solid #e0e0e0',
                    backgroundColor: 'white',
                    ...contentStyles
                  }}>
                    <div style={{ flex: 1, padding: '8px 16px', wordBreak: 'break-word' }}>
                      {row.createdTime}
                    </div>
                    <div style={{ flex: 2, padding: '8px 16px', wordBreak: 'break-word' }}>
                      {row.audit}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#666', 
                  fontStyle: 'italic',
                  ...contentStyles
                }}>
                  No audit data found.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
      
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          size="small"
          style={{
            ...contentStyles,
            textTransform: 'none',
            color: '#FFFFFF',
            backgroundColor: '#333333',
            borderColor: '#333333',
            minWidth: '80px',
            padding: '6px 16px',
            fontWeight: 500,
            fontSize: '14px',
            boxShadow: 'none',
            borderRadius: '4px'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EatAuditPopup;