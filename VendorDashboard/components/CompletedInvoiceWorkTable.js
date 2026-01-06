import React from "react";
import FileInvoiceAttachment from "./FileInvoiceAttachment";
import { Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const centerAlignStyles = {
  cell: {
    textAlign: "center",
    fontFamily: "Verizon NHG eDS",
    fontSize: "12px",
    verticalAlign: "middle",
    border: "0.21px solid rgba(51, 51, 51, 0.41)",
    padding: "10px"
  },
  headerCell: {
    textAlign: "center",
    verticalAlign: "middle",
    border: "0.21px solid rgba(51, 51, 51, 0.41)",
    padding: "10px",
    fontWeight: "bold"
  },
  uploadHeaderCell: {
    textAlign: "center",
    verticalAlign: "middle",
    border: "0.21px solid rgba(51, 51, 51, 0.41)",
    padding: "10px",
    fontWeight: "bold",
    width: "200px"
  },
  table: {
    borderCollapse: "collapse",
    width: "100%"
  }
};

const CompletedInvoiceWorkTable = ({bidUnitRules,bidUnitLineItem,completedLineitems,completedWorkorders }) => {

  const completedFiles = (completedLineitems || []).map((item) => {
    return {
      poMetaUniversalId: item.poMetaUniversalId,
      invoiceMetaUniversalId: item.invoiceMetaUniversalId,
      esaLineNum: item.esaLineNum, 
      attachments: item.attachments?.map(attachment => ({
        category: attachment.category,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        file_Id: attachment.file_Id || null
      })) || []
    };
  });

  
  return (
    <>
     
      <div>
        <h4 style={{ fontFamily: "Verizon NHG eDS",fontWeight: 700, marginBottom: '10px' }}>
        <span style={{ color: 'red' }}>*</span>
          Work Order & Required Bid Unit Attachment
          <Tooltip
            title={
              <span style={{ fontSize: "14px" }}>
                Click to upload relevant files for this invoice/bid unit services.
              </span>
            }
            arrow
          >
            <HelpOutlineIcon
              fontSize="medium"
              sx={{ marginLeft: "5px", verticalAlign: "middle", color: "action.active" }}
            />
          </Tooltip>
        </h4>

        <table className="center-align-table" style={centerAlignStyles.table}>
          <thead style={{ backgroundColor: "#f6f6f6", color: "black" }}>
            <tr>
              <th style={centerAlignStyles.headerCell}>Line No</th>
              <th style={centerAlignStyles.headerCell}>Bid Unit</th>
              <th style={centerAlignStyles.headerCell}>Amount</th>
              <th style={centerAlignStyles.headerCell}>Attachment Type</th>
              <th style={centerAlignStyles.uploadHeaderCell}>Attached Files</th>
            </tr>
          </thead>
          <tbody>
 {/* Line Items  */}
{(() => {
 
  const bidUnitCategories = [];
  
  completedLineitems?.forEach(completedItem => {
    if (completedItem.attachments && completedItem.attachments.length > 0) {
     
      completedItem.attachments.forEach(attachment => {
        bidUnitCategories.push({
          poMetaUniversalId: completedItem.poMetaUniversalId,
          invoiceMetaUniversalId: completedItem.invoiceMetaUniversalId,
          category: attachment.category,
          fileName: attachment.fileName,
          esaLineNum: completedItem.esaLineNum 

        });
      });
    }
  });
  
  
  const rows = [];
  
  bidUnitLineItem?.forEach(bidUnit => {
    const matchingCategories = bidUnitCategories.filter(item => {
      if (item.esaLineNum && bidUnit.cfdlineitemesalinenum) {
        return item.esaLineNum === bidUnit.cfdlineitemesalinenum;
      } else {
        const metaIdToCompare = item.poMetaUniversalId || item.invoiceMetaUniversalId;
        return bidUnit.cfdlineitemunid === metaIdToCompare;
      }
    });
    
    if (matchingCategories.length > 0) {
      
      matchingCategories.forEach((categoryItem, index) => {
        rows.push({
          ...bidUnit,
          category: categoryItem.category,
          fileName: categoryItem.fileName,
          key: `${bidUnit.cfdlineitemunid}-${index}`
        });
      });
    } 
  });
  
 
  return rows.map((item, index) => {
    const bidUnit = item.cfdlineitembidunit || "";
    const amount = item.cfdlineitemtotal || "";
    const lineNumber = item.cfdlineitemesalinenum || "";

    
   
    const rule = bidUnitRules?.find(r => r.bidUnit === bidUnit) || {
      id: `default-${index}`,
      bidUnit: bidUnit
    };
    
    return (
      <tr key={item.key}>
        <td style={centerAlignStyles.cell}>{lineNumber}</td>
        <td style={centerAlignStyles.cell}>{bidUnit}</td>
        <td style={centerAlignStyles.cell}>{amount !== '' ? `$${parseFloat(amount).toFixed(2)}` : ''}</td>
        <td style={centerAlignStyles.cell}>
          {(() => {
            const category = item.category || '';
            return category.charAt(0).toUpperCase() + category.substring(1);
          })()}
        </td>
        <td style={centerAlignStyles.cell}>
  {(() => {
    // Find the completed file entry for this line item
    const completedFileEntry = completedFiles.find(cf => {
      if (cf.esaLineNum && item.cfdlineitemesalinenum) {
        return cf.esaLineNum === item.cfdlineitemesalinenum;
      } else {
        const metaIdToCompare = cf.poMetaUniversalId || cf.invoiceMetaUniversalId;
        return metaIdToCompare === item.cfdlineitemunid;
      }
    });
    
    
    const matchingAttachments = completedFileEntry?.attachments.filter(
      attachment => attachment.category === item.category
    ) || [];
    
    if (matchingAttachments.length > 0) {
      
      const fileListForComponent = matchingAttachments.map(attachment => ({
        filename: attachment.fileName,
        fileUrl: attachment.fileUrl,
        file_Id: attachment.file_Id || null,
        preview: null 
      }));
      
      return (
        <FileInvoiceAttachment
          fileList={fileListForComponent}
          onRemoveClick={() => {}} 
          isRemoveBtnDisabled={true} 
          isInvoiceAttachment={true} 
          onFileClick={(file) => {
            window.location.href = file.fileUrl;
          }}
        />
      );
    } else {
      return <span style={{ color: '#888' }}>No files attached</span>;
    }
  })()}
</td>
      </tr>
    );
  });
})()}

  {/* Work Order Level Attachment at the end */}
<tr>
  <td style={centerAlignStyles.cell}></td>
  <td style={centerAlignStyles.cell}></td>
  <td style={centerAlignStyles.cell}></td>
  <td style={centerAlignStyles.cell}>Work Order Level</td>
  <td style={centerAlignStyles.cell}>
    {(() => {
      
      const workOrderAttachments = completedWorkorders?.attachments || [];
        
      if (workOrderAttachments.length > 0) {
       
        const fileListForComponent = workOrderAttachments.map(attachment => ({
          filename: attachment.fileName,
          fileUrl: attachment.fileUrl,
          file_Id: attachment.file_Id || null,
          preview: null 
        }));
        
        return (
          <FileInvoiceAttachment
            fileList={fileListForComponent}
            onRemoveClick={() => {}}
            isRemoveBtnDisabled={true} 
            isInvoiceAttachment={true} 
            onFileClick={(file) => {
              window.location.href = file.fileUrl;
            }}
          />
        );
      } else {
        return <span style={{ color: '#888' }}>No files attached</span>;
      }
    })()}
  </td>
</tr>
</tbody>
        </table>
        <div style={{ 
          fontFamily: "Verizon NHG eDS", 
          fontSize: "12px", 
          marginTop: "5px", 
          color: "#666666",
        }}>
          <span style={{ fontWeight: "500" }}>Supported documents:</span> PDF (.pdf), Excel (.xls, .xlsx), Word (.doc, .docx), JPEG (.jpg, .jpeg), PNG (.png)
        </div>
      </div>
    </>
  );
};

export default CompletedInvoiceWorkTable;