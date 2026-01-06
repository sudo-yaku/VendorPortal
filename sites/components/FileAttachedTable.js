import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import moment from 'moment'
import config from '../../config'

export class FileAttachedTable extends React.Component {
  static get propTypes () {
    return {
      onRemoveClick: PropTypes.func,
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
      var index = this.props.fileList.indexOf(file)
      var row1 = file['preview'] ? <a target="_blank" href={file['preview']} style={{color: '#2196f3'}}>{file['file_name']}</a> : <a href={baseURL + "/elog/getAttachment?elogAttachID=" + file['file_Id']} style={{color: 'rgb(33, 150, 243)'}}>{file['file_name']}</a>
      rows_files.push(
                <span key={file['file_name']} className="file_tag_designe">
                    {row1}
                    {!this.props.isRemoveBtnDisabled && (<button type="button" className="remove_btn" onClick={() => onRemoveClick(index)}><i className="fa fa-close"></i></button>)}

                </span>)
    })

    return (<div>
            {rows_files}
        </div>)


  }
}

export default connect(null)(FileAttachedTable)
