import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import moment from 'moment'
import config from '../../config'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils'
import { downloadElogFile } from '../actions'

export class FileAttachedTable extends React.Component {
  static get propTypes () {
    return {
      onRemoveClick: PropTypes.func,
      fileList: PropTypes.array,
      isRemoveBtnDisabled: PropTypes.bool
    }
  }

  constructor (props) {
    super(props)
  }

  getFormattedDate (dateVal) {
    return moment(dateVal).format('DD-MMM-YY hh:mm:ss A')
  }
  
  fileDownload = (file_name, file_Id) => {
    let { loginId, downloadElogFile } = this.props
    downloadElogFile(loginId, file_Id).then(action => {
      if (action.filedata && action.filedata.file_data) {
        let blob = dataURItoBlob(action.filedata.file_data)
        startDownload(blob, file_name)
      }
    })
  }

  render () {
    const {onRemoveClick} = this.props
    let rows_files = []
    this.props.fileList.forEach(file => {
      var index = this.props.fileList.indexOf(file)
      var row1 = file['preview'] ? <a target="_blank" href={file['preview']} style={{ color: '#2196f3', cursor: 'pointer' }}>{file['file_name']}</a> : <span style={{ color: '#FFF', cursor: 'pointer' }} onClick={() => this.fileDownload(file['file_name'], file['file_Id'])}>{file['file_name']}</span>
      rows_files.push(
                <span key={file['file_name']} className="file_tag_designe">
                    {row1}
                    {!this.props.isRemoveBtnDisabled && (<span  onClick={() => onRemoveClick(index)}><i className="fa fa-times-circle" style={{"position":"relative","top":"2px","fontSize":"15px","marginLeft":"10px","color":"rgb(255, 255, 255)","cursor":"pointer","display":"inline-block"}}></i></span>)}

                </span>)
    })

    return (<div>
            {rows_files}
        </div>)
  }
}

export default connect(null, { downloadElogFile })(FileAttachedTable)
