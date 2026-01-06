import React,{useEffect,useState} from "react";
import Dropzone from "react-dropzone";
import FileAttachedTable from "./FileAttachedTable";
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

const InvoiceFileUploadTable = ({ onDrop, filesData, onRemoveFile, bidUnitRules,bidUnitLineItem,onRequiredFilesStatusChange  }) => {

  const [lineItemAttachmentStatus, setLineItemAttachmentStatus] = useState({});
  const [allRequiredFilesAttached, setAllRequiredFilesAttached] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});

  const bidUnitLineItemUnits = bidUnitLineItem?.map(item => item.cfdlineitembidunit) || [];

// Filter rules for document_type AND matching bid units
const documentTypeRules = bidUnitRules?.filter(rule =>
  rule.ruleCondition?.condition?.some(cond => cond.type === "document_type") &&
  bidUnitLineItemUnits.includes(rule.bidUnit)
) || [];

// Store corresponding line items for later use
const filteredBidLineItems = bidUnitLineItem?.filter(item =>
  documentTypeRules.some(rule => rule.bidUnit === item.cfdlineitembidunit)
) || [];

useEffect(() => {
  const newAttachmentStatus = {};

  documentTypeRules.forEach(rule => {
    const matchingLineItems = bidUnitLineItem?.filter(item =>
      item.cfdlineitembidunit === rule.bidUnit &&
      item.cfdlineitemtotal !== 0 &&
      item.cfdlineitemtotal !== "0" &&
      item.cfdlineitemtotal !== "0.00" &&
      item.action !== "Del" 
    ) || [];

    matchingLineItems.forEach(item => {
      const lineItemKey = `${item.cfdlineitemesalinenum || item.cfdlineitemlinenum}-${rule.id}`;
      const hasAttachedFiles = filesData.some(file =>
        file.invoiceAuditLineNum === (item.cfdlineitemesalinenum || item.cfdlineitemlinenum) &&
        file.bidUnit === item.cfdlineitembidunit &&
        file.ruleId === rule.id
      );
      newAttachmentStatus[lineItemKey] = hasAttachedFiles;
    });
  });

  // Set this state only if it has changed
  if (JSON.stringify(newAttachmentStatus) !== JSON.stringify(lineItemAttachmentStatus)) {
    setLineItemAttachmentStatus(newAttachmentStatus);
  }

   
   const requiredLineItems = [];
   documentTypeRules.forEach(rule => {
    const matchingLineItems = bidUnitLineItem?.filter(item =>
      item.cfdlineitembidunit === rule.bidUnit &&
      item.cfdlineitemtotal !== 0 &&
      item.cfdlineitemtotal !== "0" &&
      item.cfdlineitemtotal !== "0.00" &&
      item.action !== "Del" // Add this condition
    ) || [];
 
     matchingLineItems.forEach(item => {
       requiredLineItems.push({
         item,
         rule,
         hasFile: filesData.some(file =>
           file.invoiceAuditLineNum === (item.cfdlineitemesalinenum||item.cfdlineitemlinenum) &&
           file.bidUnit === item.cfdlineitembidunit &&
           file.ruleId === rule.id
         )
       });
     });
   });
 
   const allAttached = 
   requiredLineItems.length === 0 || 
   requiredLineItems.every(item => item.hasFile);

   

 
   if (bidUnitLineItem?.length > 0 && allAttached !== allRequiredFilesAttached) {
    setAllRequiredFilesAttached(allAttached);
    
    if (typeof onRequiredFilesStatusChange === "function") { 
      onRequiredFilesStatusChange(allAttached);
    }
  }
}, [filesData, documentTypeRules, bidUnitLineItem,allRequiredFilesAttached,onRequiredFilesStatusChange]);

const isFileAttached = (lineItem, rule) => {
  const lineItemKey = `${lineItem.cfdlineitemesalinenum || lineItem.cfdlineitemlinenum}-${rule.id}`;
  return lineItemAttachmentStatus[lineItemKey] || false;
};

  const handleLineItemDrop = (acceptedFiles, invoiceAuditLineNum, rule, attachmentType) => {
    const allowedExtensions = ['.pdf','.jpg', '.jpeg', '.png','.html'];
    const validFiles = [];
    const invalidFiles = [];
    
    acceptedFiles.forEach(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (allowedExtensions.includes(extension)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });
    
    const errorKey = `${invoiceAuditLineNum}-${rule.id}`;
    
    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map(file => file.name).join(', ');
      setUploadErrors(prev => ({
        ...prev,
        [errorKey]: `Unsupported file format: ${invalidFileNames}. Please convert the file to PDF or JPG format.`
      }));
      
      setTimeout(() => {
        setUploadErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }, 50000);
      
      return;
    } else {
      setUploadErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
    
    if (validFiles.length > 0) {
      const filesWithMetadata = validFiles.map(file => {
        file.invoiceAuditLineNum = invoiceAuditLineNum;
        file.bidUnit = rule.bidUnit;
        file.ruleId = rule.id;
        file.attachmentType = attachmentType;
        return file;
      });
      
      onDrop(filesWithMetadata);
    }
  };
  
  const handleWorkOrderDrop = (acceptedFiles) => {
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors['workorder'];
      return newErrors;
    });
    
    if (acceptedFiles.length > 0) {
      onDrop(acceptedFiles);
    }
  };
  
  return (
    <>
     
      <div>
        <h4 style={{ fontFamily: "Verizon NHG eDS",fontWeight: 700, marginBottom: '10px' }}>
        {!allRequiredFilesAttached && <span style={{ color: 'red' }}>*</span>}
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
              <th style={centerAlignStyles.uploadHeaderCell}>Upload Files</th>
            </tr>
          </thead>
          <tbody>
  {/* Line Items First - Sorted by line number */}
  {(() => {
   
    const allRows = documentTypeRules.flatMap((rule, ruleIndex) => {
      const matchingLineItems = bidUnitLineItem?.filter(item => 
        item.cfdlineitembidunit === rule.bidUnit && 
        item.cfdlineitemtotal !== 0 && 
        item.cfdlineitemtotal !== "0" &&
        item.cfdlineitemtotal !== "0.00" &&
        item.action !== "Del" // Add this condition
      ) || [];

      return matchingLineItems.map((item, itemIndex) => {
        const lineNumber = item.cfdlineitemesalinenum || item.cfdlineitemlinenum;
        const amount = item.cfdlineitemtotal ?? "";

        const attachmentType = rule.ruleCondition?.condition
          .filter(cond => cond.type === "document_type")
          .map(cond => {
            const value = cond.rule?.value || '';
            return value.charAt(0).toUpperCase() + value.substring(1);
          })
          .join(', ');
          const hasFileAttached = isFileAttached(item, rule);
        // Return row data with its components
        return {
          lineNumber: parseInt(lineNumber), // Ensure it's a number for sorting
          component: (
            <tr key={`rule-${rule.id}-item-${item.uniqueIdentifier || itemIndex}`}>
              <td style={centerAlignStyles.cell}>{lineNumber}</td>
              <td style={centerAlignStyles.cell}>{item.cfdlineitembidunit || ''}</td>
              <td style={centerAlignStyles.cell}>{amount !== '' ? `$${parseFloat(amount).toFixed(2)}` : ''}</td>
              <td style={centerAlignStyles.cell}>
                {attachmentType}
                {(attachmentType.toLowerCase().includes('invoice') || attachmentType.toLowerCase().includes('approval')) && (
                  <div style={{ 
                    fontFamily: "Verizon NHG eDS", 
                    fontSize: "10px", 
                    marginTop: "3px", 
                    color: "#666666",
                    textAlign: "center"
                  }}>
                    <span style={{ fontWeight: "500" }}>Supported documents:</span> PDF (.pdf), JPEG (.jpg, .jpeg), PNG (.png), HTML files (.html)
                  </div>
                )}
              </td>
              <td style={centerAlignStyles.cell}>
                <Dropzone onDrop={(acceptedFiles) => handleLineItemDrop(acceptedFiles, lineNumber, rule,attachmentType)}>
                  {({ getRootProps, getInputProps }) => (
                    <section
                      style={{
                        width: "210px",
                        height: "25px",
                        border: "2px dashed rgb(102, 102, 102)",
                        borderRadius: "5px",
                        textAlign: "center"
                      }}
                    >
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p style={{ paddingTop: "2px", fontFamily: "Verizon NHG eDS", fontSize: "12px" }}>
                          + Upload
                        </p>
                      </div>
                    </section>
                  )}
                </Dropzone>
                {uploadErrors[`${lineNumber}-${rule.id}`] && (
                  <div style={{
                    color: '#d32f2f',
                    fontSize: '11px',
                    marginTop: '5px',
                    fontFamily: "Verizon NHG eDS",
                    wordWrap: 'break-word',
                    maxWidth: '210px',
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    padding: '5px'
                  }}>
                    {uploadErrors[`${lineNumber}-${rule.id}`]}
                  </div>
                )}
                
                <FileInvoiceAttachment
                  fileList={filesData.filter(file => 
                    file.invoiceAuditLineNum === (item.cfdlineitemesalinenum || item.cfdlineitemlinenum) && 
                    file.bidUnit === item.cfdlineitembidunit &&
                    file.ruleId === rule.id
                  )}
                  onRemoveClick={onRemoveFile}
                  isInvoiceAttachment={true}
                />
              </td>
            </tr>
          )
        };
      });
    });

    // Sort all rows by line number
    allRows.sort((a, b) => a.lineNumber - b.lineNumber);

    // Return just the row components in sorted order
    return allRows.map(row => row.component);
  })()}

  {/* Work Order Level Attachment at the end */}
  <tr>
    <td style={centerAlignStyles.cell}></td>
    <td style={centerAlignStyles.cell}></td>
    <td style={centerAlignStyles.cell}></td>
    <td style={centerAlignStyles.cell}>Work Order Level Attachment</td>
    <td style={centerAlignStyles.cell}>
      <Dropzone onDrop={handleWorkOrderDrop}>
        {({ getRootProps, getInputProps }) => (
          <section
            style={{
              width: "210px",
              height: "25px",
              border: "2px dashed rgb(102, 102, 102)",
              borderRadius: "5px",
              textAlign: "center"
            }}
          >
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p style={{ paddingTop: "2px", fontFamily: "Verizon NHG eDS", fontSize: "12px" }}>
                + Upload
              </p>
            </div>
          </section>
        )}
      </Dropzone>
      {uploadErrors['workorder'] && (
        <div style={{
          color: '#d32f2f',
          fontSize: '11px',
          marginTop: '5px',
          fontFamily: "Verizon NHG eDS",
          wordWrap: 'break-word',
          maxWidth: '210px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          padding: '5px'
        }}>
          {uploadErrors['workorder']}
        </div>
      )}
      <FileInvoiceAttachment 
        fileList={filesData.filter(file => !file.invoiceAuditLineNum && !file.ruleId)} 
        onRemoveClick={onRemoveFile} 
        isInvoiceAttachment={true}
      />
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
        </div>
      </div>
    </>
  );
};

export default InvoiceFileUploadTable;