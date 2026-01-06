import React,{useEffect, useState,useRef} from "react";
import InvoiceFileUploadTable from "./InvoiceFileUploadTable";
import ErrorSign from '../../Images/error.png'; 
import { Tooltip } from "@mui/material";
import MessageBox from '../../Forms/components/MessageBox'
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CompletedInvoiceWorkTable from "./CompletedInvoiceWorkTable";

const InvoiceSubmit = ({
  onDrop,
  onSubmit,
  invoicingMsg,
  filesData,
  onRemoveFile,
  enableDeclined,
  bidUnitRules,
  bidUnitLineItem,
  comments,
  isFindings,
  auditFindings,
  onCommentChange,
  initialComments,
  onRequiredFilesStatusChange,
  disableInvoiceReworkSubmit,
  hasRequiredFiles,
  showSection,
  formName,
  workorderPriority,
  disableSubmit,
  disableDecline,
  submitButtonText,
  disregardReason,
  onDisregardReasonChange,
  isworkCompleted,
  completedLineitems,
  completedWorkorders,
  statusConditions,
  workorderStatus
}) => {
  
  const [showDisregardSection, setShowDisregardSection] = useState(false);
  const [characterCount, setcharacterCount] = useState(0);
  const [charactercommCount, setcharactercommCount] = useState(0);
  
  const maxCharacters = 499;
  const handleDisregardClick = () => {
    setShowDisregardSection(true);
  };
  const handleDisregardSubmit = () => {
    setShowDisregardSection(false);
    onSubmit('DISREGARD');
  };
 
  
  useEffect(() => {
    setcharacterCount(disregardReason.length);
    setcharactercommCount(comments.length);
  }, [disregardReason,comments]);
 
  const checkStatusConditions = () => {
    if (!statusConditions || statusConditions.length === 0) return false;
        
    return statusConditions.some(status => {
      return workorderStatus === status || 
             workorderStatus?.includes(status);
    });
  };

  return (
    
    <>
    <div>
    {invoicingMsg && <MessageBox messages={[invoicingMsg]} onClear={() => onSubmit('CLEAR_MESSAGE')}  className={"alert-danger"} marginTop={true} />}
    </div>

    <div className="mb-4" style={{ marginTop: '25px' }}>
      <div className="row">
      {/* Left Side: Table */}
      <div className="col-md-6">
        
      {(isworkCompleted || checkStatusConditions()) ? (
    <CompletedInvoiceWorkTable
    onDrop={onDrop}
    filesData={filesData}
    onRemoveFile={onRemoveFile}
    bidUnitRules={bidUnitRules}
    bidUnitLineItem={bidUnitLineItem}
    completedLineitems={completedLineitems}
    completedWorkorders={completedWorkorders}
    isworkCompleted={isworkCompleted}
    statusConditions={statusConditions}
    workorderStatus={workorderStatus}


    />
  ) : (
    <InvoiceFileUploadTable
      onDrop={onDrop}
      filesData={filesData}
      onRemoveFile={onRemoveFile}
      bidUnitRules={bidUnitRules}
      bidUnitLineItem={bidUnitLineItem}
      onRequiredFilesStatusChange={onRequiredFilesStatusChange}
    />
  )}
      </div>

      {/* Right Side: Comments + Buttons */}
      <div className="col-md-6" style={{ fontFamily: 'Verizon NHG eDS ' }}>
         
          {(isFindings || isworkCompleted || checkStatusConditions()) ? (
            <div
              style={{
                background: "#FFF0E7",
                borderRadius: "4px",
                fontFamily: "Verizon NHG eDS",
                padding: "12px",
                marginBottom: "20px",
                border: "1px solid #FF6600"
              }}
        >
          <div
            style={{
              color: "#FF6600",
              fontSize: "14px",
              marginBottom: "8px",
              fontFamily: 'Verizon NHG eDS ',
            }}
          >
            <img src={ErrorSign} alt="Error" style={{ height: "14px", width: "14px", marginRight: "5px" }} />
            Invoice Review Finding Summary
          </div>
          <ul style={{ fontSize: "13px", paddingLeft: "16px", listStyleType: "disc", fontFamily: 'Verizon NHG eDS ' }}>
  {isworkCompleted ? (
    // When work is completed, get findings from completedWorkorders
    completedWorkorders?.auditFindings?.length > 0 ? (
      completedWorkorders.auditFindings.map((finding, index) => (
        <li key={index} style={{ color: "#555", marginBottom: "8px", fontFamily: 'Verizon NHG eDS ' }}>
          {finding.issue}
        </li>
      ))
    ) : (
      <li style={{ color: "#555", fontFamily: 'Verizon NHG eDS ' }}>No findings identified.</li>
    )
  ) : (
    // Normal flow: use the existing auditFindings prop
    auditFindings?.workorder_findings?.length > 0 ? (
      auditFindings.workorder_findings.map((finding, index) => (
        <li key={index} style={{ color: "#555", marginBottom: "8px", fontFamily: 'Verizon NHG eDS ' }}>
          {finding.issue}
        </li>
      ))
    ) : (
      <li style={{ color: "#555", fontFamily: 'Verizon NHG eDS ' }}>No findings identified.</li>
    )
  )}
</ul>
        </div>
      ) : (
        <div className="mb-3">
          <h4 style={{ fontWeight: '700', fontFamily: 'Verizon NHG eDS ' }}>
          <span style={{ color: 'red' }}>*</span>
            Work Complete/Invoice Comments 
          </h4>
          <textarea
        maxLength={maxCharacters}
        className="form-control"
        value={comments}
        onChange={onCommentChange}
        placeholder="All work completed"
        style={{ width: '100%',height: "88px", resize: 'none' , fontFamily: 'Verizon NHG eDS ' }}
      />
        <div style={{ textAlign: 'right', fontSize: '12px', marginTop: '5px', color: charactercommCount > maxCharacters * 0.8 ? 'red' : 'gray', fontFamily: 'Verizon NHG eDS ' }}>
        {charactercommCount} / {maxCharacters} characters
      </div>
        </div>
      )}


{!(isworkCompleted || checkStatusConditions()) && (
  isFindings ? (
    <div className="mt-3 d-flex flex-column">
    <div className="d-flex justify-content-start">
      <button
        id="Login"
        type="submit"
        className="btn"
        style={{
          backgroundColor: "#000000",
          color: "#ffffff",
          fontWeight: "bold",
          height: "32px",
          width: "205px",
          display: "flex",
          marginRight: "8px",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: 'Verizon NHG eDS ',
          fontSize: '14px'
        }}
        onClick={onSubmit}
        disabled={disableInvoiceReworkSubmit &&
          (initialComments?.trim()===comments?.trim()) 
         }
      >
        Invoice Rework/Resubmit
      </button>
      <button
        className="btn"
        style={{
          backgroundColor: "#000000",
          color: "#ffffff",
          fontWeight: "bold",
          height: "32px",
          width: "205px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: 'Verizon NHG eDS ',
          fontSize: '14px'
        }}
        onClick={handleDisregardClick}
       disabled={!(disableInvoiceReworkSubmit && (initialComments?.trim() === comments?.trim())) || !hasRequiredFiles}

      >
        Override Invoice Review 
      </button>
    </div>
    <div style={{ 
      fontFamily: "Verizon NHG eDS", 
      fontSize: "12px", 
      marginTop: "8px", 
      color: "#666666",
      width: "100%"
    }}>
      <span style={{ fontWeight: "500" }}>
      Use 'Invoice Rework/Resubmit' to adjust the invoice based on review findings, noting that this button will remain disabled until changes are made, or select 'Override Invoice Review' to proceed without adjustments and submit.
      </span>
    </div>
  </div>
        
      ) : (
        <div className="mt-3 d-flex justify-end">
           <button
            id="Login"
            type="submit"
            className="btn"
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              fontWeight: "bold",
              height: "32px",
              width: "228px",
              display: "flex",
              marginRight: "8px",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: 'Verizon NHG eDS ',
              fontSize: '14px'
            }}
            onClick={onSubmit}
            disabled={disableSubmit}
          >
            Work Complete/Submit Invoice
          </button>
        </div>
      )
)}

    </div>
  </div>
    {/* Disregard reason section (full width, below everything) */}
    {(showDisregardSection && (disableInvoiceReworkSubmit && (initialComments?.trim() === comments?.trim()))  && hasRequiredFiles) &&(
        <div className="row mt-4">
          <div className="col-12">
            <h4 style={{ fontWeight: "bold", fontFamily: 'Verizon NHG eDS ' }}>
            <span style={{ color: 'red' }}>*</span>
              Reason For Overriding the Invoice Review
        <Tooltip
          title={
            <span style={{ fontSize: "14px", fontFamily: 'Verizon NHG eDS ' }}>
              Enter a clear justification for why rework is not needed.This will be reviewed for approval.
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
            <textarea
              className="form-control"
              maxLength={maxCharacters}
              rows="3"
              value={disregardReason}
              onChange={e => onDisregardReasonChange(e.target.value)}
              placeholder="Enter reason..."
              style={{ marginTop: "10px", fontFamily: 'Verizon NHG eDS ', width: "100%",height: "88px", resize: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '5px', fontFamily: 'Verizon NHG eDS ' }}>
        <span style={{ color: characterCount < 7 ? 'red' : 'transparent' }}>
          {characterCount < 7 ? '*Minimum of 7 characters required' : ''}
        </span>
        <span style={{ color: characterCount > maxCharacters * 0.8 ? 'red' : 'gray' }}>
          {characterCount} / {maxCharacters} characters
        </span>
      </div>

            <div className="d-flex justify-content-end mt-2">
            <button
              className="btn mt-2"
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                fontWeight: "bold",
                height: "32px",
                width: "147px",
                fontFamily: 'Verizon NHG eDS ',
                fontSize: '14px'
              }}
              onClick={handleDisregardSubmit}
              disabled={disregardReason.replace(/\s/g,'').length <= 6}
            >
              Submit 
            </button>
              </div>
            
          </div>
        </div>
      )}
    </div>
    
    </>
  );
};

export default InvoiceSubmit;