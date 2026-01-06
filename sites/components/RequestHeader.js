/**
  Copyright: Verizon Data Services 

  File Name: RequestHeader.js
  ******************************************************************************************
  Release Date    Change Date      Name          Description
  MM/DD/2021      10/05/2021       shade86       Initial creation
 
 *******************************************************************************************/

  import React from 'react';
  import PropTypes from 'prop-types';
  
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #ddd',
    backgroundColor: '#e2e2e4',
    padding: 5,
  };
  
  const RequestHeader = ({ requestId, onClose, timeStamp, cbandTools }) => {
    const displayTimeStamp = cbandTools ? 'Job Start Date' : 'Time Stamp';
  
    return (
      <div>
        <div style={headerStyle}>
          <span style={{ fontWeight: 'bold' }}>
            Results: Request #{requestId}, {displayTimeStamp}: {timeStamp}
          </span>
          <span
            style={{ fontSize: '2rem', marginRight: 5, cursor: 'pointer' }}
            onClick={onClose}
          >
            &times;
          </span>
        </div>
      </div>
    );
  };
  
  RequestHeader.propTypes = {
    requestId: PropTypes.string,
    onClose: PropTypes.func,
    timeStamp: PropTypes.string,
    cbandTools: PropTypes.bool,
  };
  
  export default RequestHeader;