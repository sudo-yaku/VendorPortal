import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

const QuoteDeclineHistory = ({ declineHistory }) => {
  // Return null if there's no history to display
  if (!declineHistory || declineHistory.length === 0) {
    return null;
  }

  return (
    <div className="row" style={{ padding: "10px", marginBottom: "15px" }}>
      <h4 style={{ fontWeight: 'bold', width: '100%' }}>Quote Decline History</h4>
      <table
        cellPadding="0"
        cellSpacing="0"
        style={{ "borderCollapse": "collapse", "textAlign": "center", "width": "100%" }}
        className="center-align-table"
      >
        <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
          <tr>
            <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Declined By</th>
            <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Declined Reason</th>
            <th style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>Declined Date</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {declineHistory.map((item, index) => (
            <tr key={index}>
              <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{item.declined_by || 'N/A'}</td>
              <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{item.decline_reason || 'Not Provided'}</td>
              <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>
                {moment(item.decline_datetime).format("MM/DD/YYYY hh:mm A")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

QuoteDeclineHistory.propTypes = {
  declineHistory: PropTypes.arrayOf(PropTypes.shape({
    declined_by: PropTypes.string,
    decline_reason: PropTypes.string,
    decline_datetime: PropTypes.string.isRequired,
  })).isRequired,
};

export default QuoteDeclineHistory;