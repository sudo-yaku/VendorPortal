import React from "react";
import ErrorSign from '../../Images/error.png';

const InvoiceAuditFindings = ({ findings }) => {
  if (!findings || findings.length === 0) return null;

  return (
    <tr>
      <td colSpan="100%" style={{ padding: 0 }}>
        <div
          style={{
            background: "#FFF0E7",
            borderRadius: "4px",
            fontSize: "12px",
            padding: "10px 15px",
            fontFamily: "Verizon NHG eDS",
            textAlign: "start"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ 
              color: "#FF6600", 
              display: "flex", 
              alignItems: "center",
              marginRight: "8px",
              whiteSpace: "nowrap" 
            }}>
              <img src={ErrorSign} alt="Error" style={{ height: "14px", width: "14px", marginRight: "5px" }} />
              Invoice Review Findings:
            </div>
            
            <div style={{ flex: 1 }}>
            {findings.length > 0 && (
                <ul style={{ 
                  margin: "0", 
                  paddingLeft: "0", 
                  listStyleType: "disc",
                  listStylePosition: "inside" 
                }}>
                  {findings.map((f, idx) => (
                    <li key={idx} style={{ 
                      marginBottom: "5px",
                      textIndent: "-1.5em",
                      paddingLeft: "1.5em"
                    }}>
                      {f.issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default InvoiceAuditFindings;