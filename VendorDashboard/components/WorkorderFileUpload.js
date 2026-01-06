import React, { Component } from "react"
import { connect } from "react-redux"
import { List, Map } from "immutable"
import * as VendorActions from "../actions"
import MessageBox from '../../Forms/components/MessageBox'
import Loader from '../../Layout/components/Loader'
import { dataURItoBlob, startDownload } from '../utils.js'
import Dropzone from 'react-dropzone'
import FileAttachedTable from './FileAttachedTable'

class WorkorderFileUpload extends React.Component {

  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )
  }

  componentDidMount() {
    this.resetInfo()
    this.aList = this.aList.clear()
    let { fetchFileList, loginId, meta_universalid } = this.props
    fetchFileList(loginId, meta_universalid, meta_universalid, "workorder")
  }

  constructor(props) {
    super(props)
    this.state = {
      isFileSizeError: false
    }
    this.aList = List()
  }

  onAttachRemove = (index) => {
    this.aList = this.aList.remove(index)
    if (this.aList.size < 1) {
      this.setState({ isFileSizeError: false })
    }
    if (this.aList.size > 0) {
      let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
      if (totalFileSize > 24500000) {
        this.setState({ isFileSizeError: true })
      }
      if (totalFileSize < 24500000) {
        this.setState({ isFileSizeError: false })
      }
    }
    this.forceUpdate()
  }

  onFileDrop = (files) => {
    files.forEach(file => {
      if (file['size'] > 0) {
        var reader = new window.FileReader()
        reader.onload = (function () {
          var dataURL = reader.result
          var droppedFile = {
            filename: file['name'],
            filetype: file['type'],
            file_size: file['size'] + '',
            content: dataURL,
            category: "workorder",
            preview: file['preview'],
            last_modified: file['lastModifiedDate'],

          }
          this.aList = this.aList.set(this.aList.size, droppedFile)
          if (this.aList.size > 0) {
            let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
            if (totalFileSize > 24500000) {
              this.setState({ isFileSizeError: true })
            }
            if (totalFileSize < 24500000) {
              this.setState({ isFileSizeError: false })
            }
          }
          this.forceUpdate()
        }).bind(this)
        reader.readAsDataURL(file)
      } else {
        // alert('Can`t attach 0 Bytes file')
      }

    })
  }
  formFilesPostRequest = (fileData) => {
    return fileData.map(fd => {
      let file_name = fd.filename.split('.')[0]
      return {
        "data": fd.content,
        "description": `${file_name} uploaded from VP UI for Work Orders`,
        "size": fd.file_size,
        "name": fd.filename
      }
    })
  }
  formUploadFilesPostRequest = (fileData) => {
    return fileData.map(fd => {
      return {
        "content": fd.content,
        "preview": fd.preview,
        "file_size": fd.file_size,
        "filename": fd.filename,
        "filetype":fd.filetype,
        "last_modified":fd.last_modified,
        "category": "workorder"
      }
    })
  }
  onSubmit = () => {
    let {config} = this.props;
    let routeToIop = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ROUTE_OPS_TO_IOP").ATTRIBUTE_VALUE;
    this.resetInfo()
    const fileData = this.aList.toJS()
    var filesPostRequest = {
      "files": routeToIop == "Y" ? this.formUploadFilesPostRequest(fileData) : this.formFilesPostRequest(fileData)
    }
    const { meta_universalid, loginId, uploadFilesWO, fetchFileList } = this.props
    if (fileData && fileData.length) {
      if(routeToIop == "Y"){
        this.props.submitFilesInvoice(loginId, meta_universalid, filesPostRequest, "workorder").then((action)=> {
          if (action.type === 'SUBMIT_QUOTE_FILE_SUCCESS') {
            this.aList = this.aList.clear()
            fetchFileList(loginId, meta_universalid, meta_universalid, "workorder")
            this.forceUpdate()
          } 
        }).catch(err => {
          console.log('err', err)
        })
      }else{
        uploadFilesWO(loginId, meta_universalid, "workorder", filesPostRequest).then(action => {
          if (action.type === 'UPLOAD_FILES_SUCCESS_WO') {
            this.aList = this.aList.clear()
            fetchFileList(loginId, meta_universalid, meta_universalid, "workorder")
            this.forceUpdate()
          }
        })
      }
    }

    if (this.props.selectedWorkOrderTitle && this.props.selectedWorkOrderTitle.length > 0 && this.props.selectedWorkOrderTitle.toLowerCase().includes('work pending')) {
      this.props.genTankReadingInput()
    }
  }

  downloadFile = (file) => {
    let { loginId, meta_universalid, downloadFile } = this.props
    downloadFile(loginId, meta_universalid, file["file_name"], file["meta_universalid"], file["category"]).then(action => {
      if (action.filedata && action.filedata.file_data) {
        let blob = dataURItoBlob(action.filedata.file_data)
        startDownload(blob, file["file_name"])
      }
    })
  }

  resetInfo() {
    let { deleteMsgFileUpload, loginId } = this.props
    deleteMsgFileUpload(loginId)
  }
  render() {
    const { savedMessage, errorMessage, isLoading, isListloading, attachedList, isWodEditable, isSaveEnabled, woWorkType } = this.props
    if (isLoading || isListloading) {
      return this.renderLoading()
    }
    let rows_files = []
    attachedList.forEach(fileObj => {
      let file = fileObj.toJS()
      rows_files.push(
        <span key={file['file_name']} className="file_tag_designe" style={{ cursor: 'pointer' }}>
          <span style={{ color: '#FFF' }} onClick={() => this.downloadFile(file)}>{file['file_name']}</span>
        </span>)
    })
    return (<div className="col-md-12 no-padding float-left">
      {savedMessage && savedMessage.get("message") && (<MessageBox messages={List([savedMessage.get("message")])} onClear={this.resetInfo.bind(this)} className="Alert--success" iconClassName="fa-thumbs-up" />)}
      {errorMessage && errorMessage.get("message") && (<MessageBox messages={List([errorMessage.get("message")])} onClear={this.resetInfo.bind(this)} />)}

      {/* <div className="col-md-9">
        {rows_files.length > 0 && (<div className="col-md-12 float-left" style={{ marginTop: '5px' }}>
          <div className="col-sm-12 no-padding float-left" style={{ "fontSize": "1em", "fontWeight": "600", "textAlign": "left" }}>
            <lable> Attachments :</lable>
          </div>
          <div className="col-sm-12 no-padding float-left" style={{ "textAlign": "left" }}>
            {rows_files}
          </div>
        </div>)}
      </div>
      {!isSaveEnabled && isWodEditable && (woWorkType && woWorkType.length > 0 && woWorkType.toLowerCase().includes('generator')) ? <button type="button"
        className="Button--secondary u-floatRight"
        onClick={this.onSubmit}
        style={{ marginRight: "5px" }}>
        Save
              </button> : null} */}
      {/* {this.props.selectedWorkOrderTitle && this.props.selectedWorkOrderTitle.includes('Pending Approval') ? (<div className="col-md-6 float-left">
        {this.state.isFileSizeError && (<div><div colSpan="6"><MessageBox messages={List(["The size of attachments should be less than 25 MB!"])} /></div></div>)}
        <Dropzone disabled={!isWodEditable} disableClick={!isWodEditable} onDrop={this.onFileDrop}>
          {({ getRootProps, getInputProps }) => (
            <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
      </div>) : null}
      {this.props.selectedWorkOrderTitle && this.props.selectedWorkOrderTitle.includes('Pending Approval') ? (<div className="col-md-3 float-left">
        <FileAttachedTable fileList={this.aList} onRemoveClick={this.onAttachRemove} />
      </div>) : null}


      {!isSaveEnabled && isWodEditable && ((woWorkType && woWorkType.length > 0 && (woWorkType.toLowerCase().includes('generator') || woWorkType == 'ENGIE-FUEL')) || this.props.selectedWorkOrderTitle && this.props.selectedWorkOrderTitle.includes('Pending Approval')) ? <button type="button"
        className="Button--secondary u-floatRight" onClick={this.onSubmit}
        style={{ marginRight: "5px" }}>
        Save
      </button> : null} */}
      {rows_files.length > 0 && (<div className="col-md-12 float-left" style={{ marginTop: '20px' }}>
        <div className="col-sm-12 no-padding float-left" style={{ "fontSize": "1em", "fontWeight": "600", "textAlign": "left" }}>
          <lable> Attached Files :</lable>
        </div>
        <div className="col-sm-12 no-padding float-left" style={{ "textAlign": "left" }}>
          {rows_files}
        </div>
      </div>)}

    </div>)
  }
}

function stateToProps(state, props) {
  let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
  let attachedList = state.getIn(["VendorDashboard", loginId, "workOrderMap", props.meta_universalid, 'files', 'workorder', 'attachments'], List())
  let config= state.getIn(['Users', 'configData', 'configData'], List())

  return {
    isLoading: state.getIn(["VendorDashboard", loginId, "workOrderFileUpload", "loading"], false),
    savedMessage: state.getIn(["VendorDashboard", loginId, "workOrderFileUpload", "savedMessage"], null),
    errorMessage: state.getIn(["VendorDashboard", loginId, "workOrderFileUpload", "errorMessage"], null),
    isListloading: state.getIn(["VendorDashboard", loginId, "workOrderMap", props.meta_universalid, 'files', 'workorder', 'isLoading'], false),
    errorMessageList: state.getIn(["VendorDashboard", loginId, "workOrderMap", props.meta_universalid, 'files', 'workorder', 'message'], Map()),
    attachedList,
    loginId,
    config
  }
}
export default connect(stateToProps, { ...VendorActions })(WorkorderFileUpload)