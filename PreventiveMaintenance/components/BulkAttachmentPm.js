import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import * as pmActions from "../actions"
import {Map, List} from 'immutable'
import {connect} from "react-redux"
import ListOfFiles from './ListOfFiles'
import Loader from '../../Layout/components/Loader'



class BulkAttachmentPm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            droppedFile: {},
            data: [],
            cols: [],
            invalidFileUpload: false,
            invalidFiles: [],
            validatedFiles: [],
            selectedLists:[]
        }
        this.totalFileCount = 0;
    }   
    componentDidMount(){
      const {pmListDetails} = this.props;
      let selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
      this.setState({selectedLists})
    }
    onFileDrop = (files) => {
        // clear previously selected files and errors
        this.setState({
          invalidFileUpload: false,
          invalidFiles: []
        }, function() {
          const {pmGridDetails, currentPmList, pmListDetails} = this.props;
          let selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
          this.setState({selectedLists})
          const locationIds = {};
          pmGridDetails.forEach(childGrid => {
            locationIds[childGrid.PS_LOCATION_ID] = {
              PM_LIST_ITEM_ID: childGrid.PM_LIST_ITEM_ID,
              PM_ITEM_UNID: childGrid.PM_ITEM_UNID,
              SITE_ID: childGrid.SITE_ID
            }
          });
          files.forEach(file => {
            const fileName = file.name.split('.')[0];
            const [PONum, locId] = fileName.split('_');
            if(PONum !== (selectedLists && selectedLists[0].PO_NUM) || !locationIds[locId]) {
              this.setState({
                invalidFiles: [
                  ...this.state.invalidFiles,
                  {
                    name: file.name,
                    reason: 'File name should follow PO-NUM_PS-LOCATION format for file'
                  }
                ],
                invalidFileUpload: true,
                validatedFiles: []
              })
              return;
            }
            if(!locationIds[locId].SITE_ID) {
              this.setState({
                invalidFiles: [
                  ...this.state.invalidFiles,
                  {
                    name: file.name,
                    reason: 'Site information is not available'
                  }
                ],
                invalidFileUpload: true,
                validatedFiles: []
              })
              return;
            }
            const fileType = file.name.split('.')[1];
            if(!(fileType === 'xlsx' || fileType === 'csv' || fileType === 'xls' || fileType === 'pdf' || fileType === 'JPG' || fileType === 'jpg' || fileType === 'JPEG' || fileType === 'jpeg' || fileType === 'svg')) {
              this.setState({
                invalidFiles: [
                  ...this.state.invalidFiles,
                  {
                    name: file.name,
                    reason: 'Please Upload a valid File format'
                  }
                ],
                invalidFileUpload: true,
                validatedFiles: []
              })
              return;
            }
            if(file.size > 45000000) {
              this.setState({
                invalidFiles: [
                  ...this.state.invalidFiles,
                  {
                    name: file.name,
                    reason: 'File size should not be more than 45MB'
                  }
                ],
                invalidFileUpload: true,
                validatedFiles: []
              })
              return;
            }
            let reader = new FileReader();
            reader.onload = function(e) {
              this.setState({
                validatedFiles: [
                  ...this.state.validatedFiles,
                  {
                    data: e.target.result,
                    file_name: fileName,
                    type: fileType,
                    file_size: file['size'],
                    PM_LIST_ITEM_ID: locationIds[locId].PM_LIST_ITEM_ID,
                    PM_ITEM_UNID: locationIds[locId].PM_ITEM_UNID,
                  }
                ]
              })
            }.bind(this);
            reader.readAsDataURL(file);
          });
        });
    }

    onAttachRemove = (index) => {
      this.setState({
        validatedFiles: this.state.validatedFiles.filter((_, i) => i !== index)
      })
    }

    uploadFiles = (vendorId, loginId, item_id, input) => {
      this.setState({
        isUploading: true
      });
      this.props.uploadFiles(vendorId, loginId, item_id, input).then((action) => {
        if (action.type === 'UPLOAD_FILES_SUCCESS') {
          this.totalFileCount --;
          if(this.totalFileCount === 0) {
            this.props.handleHideModal();
          }
          this.setState({
            isUploading: false
          });
          this.props.notiref.addNotification({
              title: 'success',
              position: "br",
              level: 'success',
              message: `Files upload successful`
          });
        }
        }).catch((error) => {
            this.setState({
              isUploading: false
            });
            if (!!error) {
                this.props.notiref.addNotification({
                    title: 'error',
                    position: "br",
                    level: 'error',
                    message: "Files upload failed"
                })
            }
        })
    }

    upload = () => {
      const validatedFiles = this.state.validatedFiles;
      const selectedLists = this.props.pmListDetails.filter(pl => !!pl.itemSelected)
      this.totalFileCount = Math.ceil(validatedFiles.length/2);
      const { currentPmList, loginId, vendorId } = this.props;
      for(let i=0; i<validatedFiles.length; i+=2) {
        if(validatedFiles[i] && validatedFiles[i+1]) {
          this.uploadFiles(vendorId, loginId, selectedLists && selectedLists[0] && selectedLists[0].PM_LIST_ITEM_ID, {fileList: this.formFilesPostRequest([validatedFiles[i], validatedFiles[i+1]])});
        } else {
          this.uploadFiles(vendorId, loginId,  selectedLists && selectedLists[0] && selectedLists[0].PM_LIST_ITEM_ID, {fileList: this.formFilesPostRequest([validatedFiles[i]])});
        }
      }
    }

    formFilesPostRequest = (files) => {
      const { currentPmList, loginId } = this.props;
      const selectedLists = this.props.pmListDetails.filter(pl => !!pl.itemSelected)
      let currentPmListID = selectedLists && selectedLists[0] && selectedLists[0].PM_LIST_ID
      return files.map(fd => {
          return {
              "PM_LIST_ID": currentPmListID,
              "ASSOCIATED_PM_LISTS": `${currentPmListID},`,
              "PM_LIST_ITEM_ID": fd.PM_LIST_ITEM_ID,
              "PM_LOCATION_UNID": fd.PM_ITEM_UNID,
              "PM_FILE_CATEGORY": "VP",
              "PM_FILE_NAME": fd.file_name,
              "PM_FILE_TYPE": fd.type,
              "PM_FILE_SIZE": fd.file_size,
              "PM_FILE_DATA": fd.data,
              "LAST_UPDATED_BY": loginId
          }

      })

    }

    renderLoading = () => {
      return (
        <Loader color="#cd040b"
          size="75px"
          margin="4px"
          className="text-center" />
      )
    }
  
    render() {
      let {selectedLists} = this.state
        return (<div className="table-responsive vp_stepper_content">
            <div className="mb-3">
                <h4 className='h4 mb-3'>Bulk Upload PM Result</h4>
                <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                    <thead className="vzwtable text-left">
                        <tr colSpan={"4"}>

                            <td className="Form-group" colSpan="4">
                                <div className={"col-md-3 text-center dropzone-width"}>
                                    <Dropzone onDrop={this.onFileDrop.bind(this)}>
                                        {({getRootProps, getInputProps}) => (
                                        <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <div style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</div>
                                            <div style={{ paddingTop: "30px" }}>Only jpeg, pdf, xls, xlsv, csv, jpg and svg</div>
                                        </div>
                                    </section>
                                    )}
                                    </Dropzone>
                                    {Object.keys(this.state.validatedFiles).length > 0 && <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.validatedFiles} />}
                                    {this.state.invalidFileUpload &&
                                      <h4 className="text-danger mt-3">
                                        <b>
                                          {this.state.invalidFiles.length > 0 && this.state.invalidFiles.map(file => (
                                            <div>
                                              {file.reason} : {file.name}
                                            </div>
                                          ))}
                                        </b>
                                      </h4>
                                    }
                                </div>
                            </td>
                            {selectedLists && selectedLists[0] && selectedLists[0].PO_NUM && <td className="Form-group" colSpan="4">
                              <b>{`PO : ${selectedLists[0].PO_NUM}`}<br />
                              {`PO status : ${selectedLists[0].PO_STATUS}`}<br />
                              {`PO Reference Name : ${selectedLists[0].PM_LIST_NAME}`}</b>
                              </td>
                            }
                        </tr>
                        <h4 style={{margin:0, color:"blue", fontSize:'11px'}}>Note* File name format should follow PONumber_PSLocationID_SiteName. For example: NAROXXXXX_XXXXX_SiteName.pdf</h4>
                        {
                          this.state.validatedFiles.length > 0 &&
                          <button style={{fontSize: '12px', right:'18px', position: "absolute"}} onClick={this.upload}>Upload</button>
                        }
                    </thead>
                </table>
                {this.state.isUploading && this.renderLoading()}
            </div>
        </div>)
    }
}

function stateToProps(state,ownProps) {
    
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
    let vendorId = user.toJS().vendor_id
    let pmGridDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List()).toJS()


    return {
        user,
        loginId,
        vendorId,
        pmGridDetails
    }

}
export default connect(stateToProps, { ...pmActions })(BulkAttachmentPm)

