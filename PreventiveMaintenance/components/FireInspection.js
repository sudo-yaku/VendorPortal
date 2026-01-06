import { Accordion, AccordionSummary, AccordionDetails, Radio, RadioGroup, FormControlLabel } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import { red500 } from 'material-ui/styles/colors'
// import { black } from 'material-ui/styles/colors'
import TextField from '@material-ui/core/TextField'
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import Datetime from 'react-datetime'
import Dropzone from 'react-dropzone'
import React, { Component } from "react"
import { connect } from "react-redux"
import moment from 'moment'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils.js'
import ListOfFiles from './ListOfFiles'
import SiteInformation from '../../sites/components/SiteInformation'
// import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'


const styles = {
  errorStyle: {
    color: "red",
  },
  underlineStyle: {
    borderColor: "black",
  },
  floatingLabelStyle: {
    color: "black",
  },
  floatingLabelFocusStyle: {
    color: "black",
  },
};


class FireInspection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      completedDate: new Date(),
      lastServiceVendor: '',
      vendorTechName: '',
      comments: '',
      fireType: '',
      fireSize: '',
      isReplaced: '',
      pageLoading: false,
      replacementReason: "",
      filesData: [],
      isLand : props.pmType?.toUpperCase()?.includes("LANDSCAPING") ?  true : false
    }
  }

  onComplete = () => this.props.onSubmit('COMPLETED', this.state)

  downloadAttachments = (pmAttachmentId, pmListItemId, pmListId) => {
    const { user, loginId, vendorId, fetchFileData } = this.props
    fetchFileData(loginId, vendorId, pmListId, pmListItemId, 'VP').then(action => {
      if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
        let fileData = action.fileDetails.getFileDataForPmlist.result.filter(fd => fd.PM_ATTACHMENTS_ID === pmAttachmentId)[0]
        if (!!fileData && !!fileData.PM_FILE_TYPE && !!fileData.PM_FILE_NAME && !!fileData.PM_FILE_DATA) {
          let blob = dataURItoBlob(fileData.PM_FILE_DATA)
          startDownload(blob, `${fileData.PM_FILE_NAME}.${fileData.PM_FILE_TYPE}`)
        }
      }
    })
  }

  generatePDFOndemand = () => this.props.generatePDFOndemand()

  onFileDrop(files) {
    files.forEach(file => {
      if (file['size'] > 0) {
        var reader = new window.FileReader()
        reader.onload = function () {
          var dataURL = reader.result
          var droppedFile = {
            file_name: file['name'],
            file_type: file['type'],
            file_size: file['size'] + '',
            file_data: dataURL,
            preview: file['preview'],
            filename: file['name'],
            last_modified: file['lastModifiedDate']
          }

          this.setState({ filesData: this.state.filesData.concat(droppedFile) })
          this.forceUpdate()
        }.bind(this)
        reader.readAsDataURL(file)
      }
    })
  }

  onAttachRemove(index) {
    this.setState({ filesData: this.state.filesData.filter((_, i) => i !== index) })
    this.forceUpdate()
  }

  render() {
    let { vendorTechName, filesData, isReplaced, lastServiceVendor } = this.state;
    const labelStyle = {"color": "black", "fontSize": "1em" }
    return (
      <div className="container">
        {this.props.selectedPM && this.props.selectedPM.PM_ITEM_STATUS == 'COMPLETED' ?
          <div>
            <div style={{ margin: 'auto', width: '100%' }}>
            <Accordion 
              style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
              TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  Site Information
                </AccordionSummary>
                <AccordionDetails>
                  <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                    <div className="col-lg-12" style={{ float: 'left' }}>
                      <SiteInformation notifref={this.props.notiref} siteUnid={this.props.selectedPM.PM_ITEM_UNID} />
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              <br />
            </div>
            <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
              <tbody className="vzwtable text-center">
                {!!this.props.attchmnts.length > 0 && (
                  <tr colSpan={"4"}>
                    <td className="Form-group no-border" colSpan="4" ><h4>PM Report</h4></td>
                    <td className="Form-group no-border" colSpan="4" ><ul>
                      {this.props.attchmnts.filter(v => v.PM_FILE_TYPE && v.PM_FILE_TYPE.toLowerCase() == 'pdf' && v.PM_FILE_NAME.includes('PMReport')).map(ad => (<li
                        onClick={this.downloadAttachments.bind(this, ad.PM_ATTACHMENTS_ID, ad.PM_LIST_ITEM_ID, ad.PM_LIST_ID)} style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.PM_FILE_NAME}.${ad.PM_FILE_TYPE}`}</b></li>))}
                    </ul>
                    </td>
                    <td className="Form-group no-border" colSpan="4" >
                    </td>
                  </tr>
                )}
                {!!this.props.attchmnts.length > 0 && (
                  <tr colSpan={"4"}>
                    <td className="Form-group no-border" colSpan="4" ><h4>Attachments</h4></td>
                    <td className="Form-group no-border" colSpan="4" > <ul>{this.props.attchmnts.filter(v => v.PM_FILE_TYPE && !['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(v.PM_FILE_TYPE.toLowerCase()) && !v.PM_FILE_NAME.includes('PMReport')).map(ad => (
                      <li
                        onClick={this.downloadAttachments.bind(this, ad.PM_ATTACHMENTS_ID, ad.PM_LIST_ITEM_ID, ad.PM_LIST_ID)} style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.PM_FILE_NAME}.${ad.PM_FILE_TYPE}`}</b></li>
                    ))}</ul>
                    </td>
                    <td className="Form-group no-border" colSpan="4" >
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {!!this.props.attchmnts.length > 0 && this.props.attchmnts.filter(v => v.PM_FILE_TYPE && v.PM_FILE_TYPE.toLowerCase() == 'pdf' && v.PM_FILE_NAME.includes('PMReport')).length == 0 && <div className="text-center mt-3" style={{ display: 'flex', flexDirection: 'row-reverse' }}><b style={{ cursor: "pointer", color: "blue" }} onClick={this.generatePDFOndemand.bind(this)} >Generate Inspection Result</b></div>}
          </div> : 
          <div>
            <div className="row">
              <div style={{ margin: 'auto', width: '100%' }}>
              <Accordion 
                  style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }} 
                  TransitionProps={{ unmountOnExit: true }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    Site Information
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                      <div className="col-lg-12" style={{ float: 'left' }}>
                        <SiteInformation notifref={this.props.notiref} siteUnid={this.props.selectedPM.PM_ITEM_UNID} />
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
                <br />
              </div>
              {!this.props.pmType?.toUpperCase()?.includes("LANDSCAPING") &&
              <>
              <div className="col-sm">
                <label style={labelStyle}>Completed Date</label><br />
                <Datetime onChange={(e, date) => this.setState({ completedDate: date })} timeFormat={false} dateFormat="DD/MM/YYYY" defaultValue={new Date()} value={this.state.completedDate} closeOnSelect={true} />
              </div>
              <div className="col-sm">
              <label style={labelStyle}><h5 style={{ float: 'left' }}>Last Service Vendor</h5></label>
                <TextField
                  value={lastServiceVendor}
                  onChange={(e) => this.setState({ lastServiceVendor: e.target.value })}
                  inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                />
              </div>
              <div className="col-sm">
              <label style={labelStyle}><h5 style={{ float: 'left' }}>Vendor Tech Name</h5><h5 style={{ color: 'red', float: 'left' }}>*</h5></label>

                <TextField
                  value={vendorTechName}
                  onChange={(e) => this.setState({ vendorTechName: e.target.value })}
                  inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}

                  required
                />
              </div>
              <div className="col-sm">
                <label style={labelStyle}>Comments</label><br />
                <textarea rows={5} cols={20} ></textarea>
              </div>
              </>
            }
            
            </div>
            {!this.props.pmType?.toUpperCase()?.includes("LANDSCAPING") &&
            <>
            <hr />
            <div className="row">
              <div className="col-sm" >
                <label style={labelStyle}><h5 style={{ float: 'left' }}>Type of Fire Extinguisher</h5></label>

                <TextField
                  value={this.state.fireType}
                  onChange={(e) => this.setState({ fireType: e.target.value })}
                  inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                />
              </div>

              <div className="col-sm">
                <label style={labelStyle}><h5 style={{ float: 'left' }}>Size of Fire Extinguisher</h5></label>
                <TextField
                  value={this.state.fireSize}
                  onChange={(e) => this.setState({ fireSize: e.target.value })}
                  inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                />
              </div>
              <div className="col-sm" >
                <b>
                  <span style={{ "font-size": "2vh" }}>Fire Extinguiser Replaced?<span className='text-danger'>*</span></span>
                </b>
                <RadioGroup name={'fireExtinguisher'}
                  onChange={(e) => this.setState({ isReplaced: e.target.value })}
                  labelPosition="left"
                  value={this.state.isReplaced}
                  style={{ display: 'flex', maxWidth: '25%' }}>
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </div>
              <div className="col-sm" >
                <b>
                  <span style={{ "font-size": "2vh" }}>Reason for Replacement(Fire Extinguisher)</span>
                </b>
                <br />
                <textarea value={this.state.replacementReason}
                  onChange={e => this.setState({ replacementReason: e.target.value })}
                  rows={5} cols={50} ></textarea>
              </div>
            </div> 
            </>
           }  

            <div className="row">
            {this.props.pmType?.toUpperCase()?.includes("LANDSCAPING") && 
             <div className="col-md-3">
                <label style={labelStyle}>Comments</label><br />
                <textarea
                 value={this.state.comments ? this.state.comments : ""} 
                onChange={(e) => { this.setState({ comments: e.target.value }) }}
                 rows={5} cols={20}/>
              </div>
            }
              <div className="col-md-5">
                <Dropzone onDrop={this.onFileDrop.bind(this)}>
                  {({ getRootProps, getInputProps }) => (
                    <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p style={{ paddingTop: this.props.pmType?.toUpperCase()?.includes("LANDSCAPING") ? "5rem" : "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                      </div>
                    </section>
                  )}
                </Dropzone>
              </div>
              {this.props.pmType?.toUpperCase()?.includes("LANDSCAPING") ? <div className="col-md-4">
                <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />
              </div> : 
              <div className="col-md-8">
                <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />
              </div>
              }
              <div className="col-2"></div>
              <div className="col-sm" style={{ marginTop: '30px' }}>
                <button type="submit"
                  disabled={this.props.pmType?.toUpperCase()?.includes("LANDSCAPING") ? false : !(vendorTechName.length > 0 && isReplaced.length > 0 && filesData.length > 0) }
                  className="Button--primary float-right mt-2"
                  onClick={this.onComplete}
                  style={{ marginRight: "5px" }}
                >
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>}
      </div>
    )
  }
}

function stateToProps(state) {
  let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
  let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
  let vendorId = user.toJS().vendor_id
  let pmGridDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List()).toJS()
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let vendorName = user.toJS().vendor_name

  return {
    user,
    loginId,
    vendorId,
    pmGridDetails,
    submarket,
    vendorName
  }
}

export default connect(stateToProps, { ...pmActions })(FireInspection)