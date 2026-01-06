import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import moment from 'moment'
import config from '../../config'
import FileIcon from '../../Images/Vector.png'
import CloseIcon from '../../Images/close.png'


export class FileInvoiceAttachment extends React.Component {
  static get propTypes () {
    return {
      onRemoveClick: PropTypes.func,
      onFileClick: PropTypes.func,
      fileList: PropTypes.object,
      isRemoveBtnDisabled: PropTypes.bool
    }
  }

  constructor (props) {
    super(props)
  }

  getFormattedDate (dateVal) {
    return moment(dateVal).format('DD-MMM-YY hh:mm:ss A')
  }

  render () {
    var baseURL = config.apiBaseUrl
    if (config.apiTempBaseUrl) {
      baseURL = config.apiTempBaseUrl
    }

    const {onRemoveClick} = this.props


    const rows_files = []
this.props.fileList.forEach(file => {
  
  var fileUrl = file['fileUrl'] 

  const fileNameElement = this.props.onFileClick ? (
    <span 
      onClick={() =>{
         this.props.onFileClick(file)}} 
      style={{ 
        color: this.props.isInvoiceAttachment ? '#0077B4' : '#FFF', 
        cursor: 'pointer', 
        textDecoration: 'underline' 
      }}
    >
      {file['filename']}
    </span>
  ) : (
    <a 
      target="_blank" 
      rel="noopener noreferrer" 
      href={fileUrl} 
      style={{ color: this.props.isInvoiceAttachment ? '#0077B4' : '#FFF' }}
    >
      {file['filename']}
    </a>
  )

  rows_files.push(
    <div
      key={file['filename']}
      className={
        this.props.isInvoiceAttachment
          ? "file_tag_invoice_attachment"
          : "file_tag_designe"
      }
      style={
        this.props.isInvoiceAttachment
          ? {
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f2f2f2",
              borderRadius: "4px",
              padding: "4px 8px",
              margin: "5px 5px 0 0",
              fontSize: "12px",
              color: "#0077B4",
              fontFamily: "Verizon NHG eDS",
              justifyContent: "space-between",
              width: '210px',
              wordBreak: "break-all"
            }
          : {}
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {this.props.isInvoiceAttachment && (
          <img src={FileIcon} alt="file" style={{ height: "14px", width: "14px" }} />
        )}
        {fileNameElement}
      </div>
  
      {!this.props.isRemoveBtnDisabled && (
        <span onClick={() => onRemoveClick(file)} style={{ cursor: "pointer" }}>
          <img src={CloseIcon} alt="remove" style={{ width: "8px", height: "8px" }} />
        </span>
      )}
    </div>
  )
})

    return (<div>
            {rows_files}
        </div>)


  }
}

export default connect(null)(FileInvoiceAttachment)
