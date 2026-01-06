import React from 'react';
import moment from 'moment';

const RMAComponent = ({ rmaDataForWO }) => {
  const displayData = rmaDataForWO?.length > 0 ? rmaDataForWO : [];

  if (!displayData || displayData.length === 0) {
    return (
      <div className="col-md-12" style={{ textAlign: 'center', padding: '20px' }}>
        <p>No RMA data available for this work order.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const formatted = moment(dateString).isValid()
      ? moment(dateString).format('MM/DD/YYYY')
      : '-';
    return formatted;
  };

  return (
    <div className="col-md-12" style={{padding:'0px'}}>
      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped table-bordered">
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <th>RMA ID</th>
              <th>SAP Return Request ID</th>
              <th>Status</th>
              <th>Part Code</th>
              <th>Defective Serial Number</th>
              <th>Replacement Serial Number</th>
              <th>Forward Shipping Tracking ID</th>
              <th>Return Shipping Tracking ID</th>
              <th>Last Business Day To Receive</th>
              <th>Scan On Time</th>
            </tr>
          </thead>
          <tbody style={{fontSize: '12px'}} >
            {displayData.map((rma, index) => (
              <tr key={index}>
                <td>{rma?.RMA_DETAILS_ID || '-'}</td>
                <td>{rma?.S4_SAP_RETURN_REQUEST || '-'}</td>
                <td>{rma?.STATUS || '-'}</td>
                <td>{rma?.RMA_PART_CODE || '-'}</td>
                <td>{rma?.REPLACEMENT_SERIAL_NO || '-'}</td>
                <td>{rma?.REPLACEMENT_SERIAL_NO || '-'}</td>
                <td>{rma?.S4_FORWARD_TRACKING_ID || '-'}</td>
                <td>{rma?.S4_REVERSE_TRACKING_ID || '-'}</td>
                <td>{formatDate(rma?.LAST_BUSINESS_DAY_TO_RECEIVE)}</td>
                <td>{rma?.DELIVERY_SCANNED_ON_TIME || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RMAComponent;
