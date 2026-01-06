import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import config from '../../config'

const FileAttachedTable = ({
  onRemoveClick,
  fileList,
  isRemoveBtnDisabled
}) => {
  let baseURL = config.apiBaseUrl
  if (config.apiTempBaseUrl) {
    baseURL = config.apiTempBaseUrl
  }

  const getFormattedDate = (dateVal) => moment(dateVal).format('DD-MMM-YY hh:mm:ss A')

  const rows_files = []
  fileList.forEach(file => {
    var index = fileList.indexOf(file)
    var row1 = file['preview']
      ? <a target="_blank" rel="noopener noreferrer" href={file['preview']} style={{ color: '#FFF' }}>{file['filename']}</a>
      : <a href={baseURL + "/elog/getAttachment?elogAttachID=" + file['file_Id']} style={{ color: '#FFF' }}>{file['filename']}</a>
    rows_files.push(
      <span key={file['filename']} className="file_tag_designe">
        {row1}
        {!isRemoveBtnDisabled && (
          <span onClick={() => onRemoveClick(index)}>
            <i className="fa fa-times-circle" style={{
              position: "relative",
              top: "2px",
              fontSize: "15px",
              marginLeft: "10px",
              color: "rgb(255, 255, 255)",
              cursor: "pointer",
              display: "inline-block"
            }}></i>
          </span>
        )}
      </span>
    )
  })

  return (
    <div>
      {rows_files}
    </div>
  )
}

FileAttachedTable.propTypes = {
  onRemoveClick: PropTypes.func,
  fileList: PropTypes.array,
  isRemoveBtnDisabled: PropTypes.bool
}

export default FileAttachedTable
