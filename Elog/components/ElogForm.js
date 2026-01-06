import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { List, Map } from "immutable"
import moment from "moment"
import TextField from '@material-ui/core/TextField'
import Dropzone from 'react-dropzone'
import * as ElogActions from "../actions"
import {updateAcknowledgeStatus , fetchWorkOrder} from "../../VendorDashboard/actions"
import * as formActions from "../../Forms/actions"
import MessageBox from '../../Forms/components/MessageBox'
import Loader from '../../Layout/components/Loader'
import FileAttachedTable from './FileAttachedTable'
import ReactTable from "react-table"
import "react-table/react-table.css"
import { formatDate, toLocalDateTime, utcToLocal } from '../../date_utils'

const formName = "ElogForm"
class ElogForm extends React.Component {
  static propTypes = {
    elog: PropTypes.object,
    elogComments: PropTypes.object,
    aList: PropTypes.object,
    currentValues: PropTypes.object,
    elogSaveMsg: PropTypes.object,
    elogcommentsavemsg: PropTypes.object,
    elogCommentLoading: PropTypes.bool,
    fetchElogCommentByInfoID: PropTypes.func,
    setValue: PropTypes.func,
    setInitialValues: PropTypes.func,
    deletElogMsg: PropTypes.func,
    deleteElogCommentMsg: PropTypes.func,
    saveElogByWorkOrderID: PropTypes.func,
    fetchElogByWorkOrderID: PropTypes.func,
    saveElogCommentByWorkOrderID: PropTypes.func,
    updateAcknowledgeStatus : PropTypes.func,
    fetchWorkOrder : PropTypes.func,
    handleNext: PropTypes.func,
    elogSaveLoading: PropTypes.bool,
    elogCommentSaveLoading: PropTypes.bool,
    isAcceptedWork: PropTypes.bool,
    isWorkInProgress: PropTypes.bool,
    isQuoteReceived: PropTypes.bool,
    isCompleted: PropTypes.bool,
    loginId: PropTypes.string,
    workOrderInfo: PropTypes.object,
    UserInfo: PropTypes.object,
    isWRFEditable: PropTypes.bool,
    setIsElogEmpty: PropTypes.func,
    setElogState: PropTypes.func
  };

  constructor(props) {
    super(props)
    this.aList = List()
    this.state = { hasElog: false, hasElogComment: false, eLogInfoId: '', newcomment: '', isFileSizeError: false ,startDate: moment().subtract(7, 'days'),
    endDate: moment()}
  }

  componentDidMount() {
    let { setInitialValues, elog, fetchElogCommentByInfoID, loginId } = this.props
    setInitialValues(formName, {})
    this.aList = this.aList.clear()
    let elogs = elog.toJS()
    let elogdata = (elogs && elogs.length > 0) ? elogs[0] : null
    if (elogdata && elogdata.eLogInfoId) {
      fetchElogCommentByInfoID(loginId, elogdata.eLogInfoId, "IOPLite").then((action) => {
        if (action.type === 'FETCH_ELOGCOMMENT_SUCCESS') {
          if (action.elogcomments && action.elogcomments.length > 0) { this.setState({ hasElogComment: true }) }
        }
      })
      setInitialValues(formName, elogdata)
      this.setState({ hasElog: true })
      this.setState({ eLogInfoId: elogdata.eLogInfoId })
    }
    this.resetInfo()
  }

  setValue(field, value) {
    this.props.setValue(formName, field, value)
  }

  onAttachRemove(index) {
    this.aList = this.aList.remove(index)
    if (this.aList.size < 1) {
      this.setState({ isFileSizeError: false })
    }
    if (this.aList.size > 0) {
      let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0);
      if (totalFileSize > 49000000) {
        this.setState({ isFileSizeError: true })
      }
      if (totalFileSize < 49000000) {
        this.setState({ isFileSizeError: false })
      }
    }
    this.forceUpdate()
  }

  onSubmit(e) {
    e.preventDefault()
    let { currentValues, loginId, workOrderInfo, UserInfo, fetchElogCommentByInfoID, bannerName, isAcknowledgementPending} = this.props
    let formValues = currentValues.toJS()
    let wrkComments = this.state.newcomment && this.state.newcomment.trim()
  
 if(this.props.vendor_status != "Acknowledged" && this.props.vendor_status != "Declined"){
   this.props.onSubmitVendorStatus(null,null,null,null,this.state.newcomment);
  }

 else if((this.props.vendor_status == "Acknowledged" || this.props.vendor_status == "Declined")){
 
        let vendorStatusInput = {
          "data": {
            "vendorstatuscomments" : this.state.newcomment
          }
        }
    this.props.updateAcknowledgeStatus(loginId, vendorStatusInput, workOrderInfo.get('cfd_workorder_quote_id_1'), this.props.vendor_status).then(response=>{
      
      if(response.type =='UPDATE_VENDORSTATUS_SUCCESS'){
        this.props.handleHideModal("Updated Details Successfully");
      }else {
        this.props.handleHideModal("");
      }
     });
  }
    if(wrkComments){
    let input = {
      "oprtnType": this.state.hasElog ? 'U' : "I",
      "shift": formValues.shift || "Day",
      "sendemail": formValues.sendemail || false,
      "privacyflag": formValues.privacyflag || "Public",
      "oncall": formValues.oncall || "No",
      "red_flag": formValues.red_flag || "No",
      "contenttext": wrkComments,
      "files": this.aList,
      "elogtype": formValues.elogtype || workOrderInfo.get("site_type") == 'SITE' ? "CELL_SITE" : "SWITCH",
      "login_id": loginId,
      "universalid": workOrderInfo.get("site_key"),
      "unvalue": workOrderInfo.get("site_name"),
      "meta_createdname": UserInfo.get("name"),
      "recorded_on": moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A'),
      "subtype": "WORKORDER",
      "subtypename": "WORKORDER",
      "subtypeid": workOrderInfo.get("workorder_id"),
      "fromsystem": "IOPLite",
      "subject": "",
      "element": "",
      "emailid": "",
      "worktype": "Vendor",
      "vendor": `${UserInfo.get("vendor_id")}-${UserInfo.get("vendor_name")}`
    }
    let elogCommentsInput = {
      "comments": wrkComments,
      "meta_createdby": loginId,
      "meta_lastupdatedate": moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A'),
      "meta_createdname": UserInfo.get("name"),
      "from_system": "IOPLite",
      "fileData": this.aList
    }
    if (formValues.eLogInfoId) {
      input['eLogInfoId'] = formValues.eLogInfoId
    }
    if (this.state.hasElog) {
      elogCommentsInput['eLogInfoId'] = this.state.eLogInfoId
      this.props.saveElogCommentByWorkOrderID(loginId, elogCommentsInput).then(action => {
        if (action && action.type === 'FETCH_SAVE_ELOGCOMMENT_SUCCESS') {
          this.setValue("eLogInfoId", action.elogcommentsavemsg.eLogInfoId)
          fetchElogCommentByInfoID(loginId, this.state.eLogInfoId, "IOPLite").then((action1) => {
            if (action1.type === 'FETCH_ELOGCOMMENT_SUCCESS') {
              if (action1.elogcomments && action1.elogcomments.length > 0) {
                this.setState({ hasElogComment: true })
                this.emptyFileTable()
                this.clearComment()
              }
            }
          })
        }
      })
    } else {
      this.props.saveElogByWorkOrderID(loginId, input).then(action => {
        if (action.type === 'FETCH_SAVE_ELOG_SUCCESS') {
          //this.props.initializeWOForm()
          this.props.setElogState()
          if (!this.state.hasElog) {
            this.props.handleNext(1)
            this.emptyFileTable()
          }
          this.setValue("eLogInfoId", action.elogsavemsg.eLogInfoId)
          this.setState({ hasElog: true })
          this.props.setIsElogEmpty(false)
          this.clearComment()
        }
      })
    }
  }

  }

  emptyFileTable() {
    this.aList = List()
    this.forceUpdate()
  }

  onFileDrop(files) {
    if (!this.props.isWRFEditable) { return }
    this.state.isFileSizeError == false && files.forEach(file => {
      if (file['size'] > 0) {
        var reader = new window.FileReader()
        reader.onload = (function () {
          var dataURL = reader.result
          var droppedFile = {
            file_name: file['name'],
            file_type: file['type'],
            file_size: file['size'] + '',
            file_data: dataURL,
            preview: file['preview'],
            last_modified: file['lastModifiedDate']
          }
          this.aList = this.aList.set(this.aList.size, droppedFile)
          if (this.aList.size > 0) {
            let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0);
            if (totalFileSize > 49000000) {
              this.setState({ isFileSizeError: true })
            }
            if (totalFileSize < 49000000) {
              this.setState({ isFileSizeError: false })
            }
          }
          this.forceUpdate()
        }).bind(this)
        reader.readAsDataURL(file)
      }
    })
  }
  handleInputChange(event) {
    this.setValue("contenttext", event.target.value)
    this.setState({ newcomment: event.target.value })
  }

  validateCommentLength(comment) {
    if (!comment) return false;
    const trimmedComment = comment.replace(/\s/g, ''); // Remove all spaces
    return trimmedComment.length >= 7;
  }
  clearComment() {
    this.setState({ newcomment: '' })
  }
  resetInfo() {
    this.props.deletElogMsg()
    this.props.deleteElogCommentMsg()
  }

  renderLoading() {
    return (<
      Loader color="#cd040b"
      size="75px"
      margin="4px"
      className="text-center" />
    )
  }
  getTimeDifference(date) {
    if (date) {
      const currentMoment = moment();
      const requestMoment = moment(date, 'YYYY-MM-DD HH:mm:ss');
      const diffInMinutes = currentMoment.diff(requestMoment, 'minutes');
      return diffInMinutes;
    }
    return null;
  }

  checkAcceptedSLA(pendingAckTime) {
    if (!pendingAckTime) return false;
    const timeDiff = this.getTimeDifference(pendingAckTime);
    return timeDiff && timeDiff > 30
  }

  checkOnSiteSLA(scheduledTime) {
    if (!scheduledTime) return false;
    const timeDiff = this.getTimeDifference(scheduledTime);
    return timeDiff && timeDiff > 60;
  }

  checkResolvedSLA(onSiteTime) {
    if (!onSiteTime) return false;
    const timeDiff = this.getTimeDifference(onSiteTime);
    return timeDiff && timeDiff > 120;
  }

  isApRadioOrMdu(workType) {
    return workType && (workType.toLowerCase() === 'ap radio' || workType.toLowerCase() === 'mdu');
  }

  //            {hasElog ? <button type="button"  onclick={handleNext()} className="Button--secondary u-floatRight">Next</button>:null}

  render() {
    let issoCondition = false
    let { realLoginId, loginId, isssouser, ssoUrl, bannerName , isAcknowledgementPending, workOrderInfo, acknowledgeLoading, realUser} = this.props
   
    //offshore condition
    let offShore = false;
    if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
      offShore = realUser.toJS().isUserOffShore
    }

    if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.includes('ssologin') || offShore === "true") {
      issoCondition = true
    }
    let { currentValues, elogSaveMsg, elogcommentsavemsg, isCompleted, elogSaveLoading, elogCommentSaveLoading, elogComments, errorComments, elogCommentLoading, elog, fetchElogCommentByInfoID, isWRFEditable } = this.props
    let { hasElog } = this.state
    let eLogs = elog.toJS()
    let wrcomments = elogComments.toJS()
    let elogColumn = eLogs && eLogs.length > 0 ? [eLogs[0]] : []
    if (elogColumn.length > 0 && elogColumn[0] && elogColumn[0].files && elogColumn[0].files.length > 0) { elogColumn[0]["hasAttachment"] = true }
    let tableColumns = []
    if (wrcomments && wrcomments.length > 0) {
      for (let i = 0; i < wrcomments.length; i++) {
        tableColumns.push(wrcomments[i])
      }
      if (elogColumn.length > 0) {
        tableColumns.push(elogColumn[0])
      }
    } else {
      if (elogColumn.length > 0) {
        tableColumns.push(elogColumn[0])
      }
    }
    let columns = [
      {
        Header: "DateTime",
        accessor: "meta_lastupdatedate",
        width: 120,
        Cell: row => (
          <div>{row && row.value && row.value.length > 0 ? toLocalDateTime(formatDate(row.value)) : ""}</div>)
      },
      {
        Header: "VendorTech",
        accessor: "meta_createdname",
        width: 200,
        Cell: row => (
          <div>{row && row.value}</div>)
      },
      {
        Header: "Tech Comments",
        accessor: "contenttext",
        style: { 'white-space': 'unset' },
        Cell: row => {
          return (
            row.original['hasAttachment'] && hasElog ?
              <div
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: row && row.value &&  row.value.trim().replace(/\n/g, "<br/>") }}>
                </div>
                <FileAttachedTable fileList={List(row.original['files'])} isRemoveBtnDisabled={true} />
              </div> : <div
                style={{
                  width: '100%',
                  height: '100%',
                }}
                dangerouslySetInnerHTML={{ __html: row && row.value && row.value.trim().replace(/\n/g, "<br/>") }} ></div>)
        }
      }

    ]
    let slaViolated = false;
    let workType = workOrderInfo?.get('work_type')?.toLowerCase();
    let isApRadioMdu = this.isApRadioOrMdu(workType);
    let vendorStatus = workOrderInfo?.get('vendor_status');
    
    if(workOrderInfo && isApRadioMdu) {
      if(isAcknowledgementPending) {
        let woRequestDate = workOrderInfo?.toJS()?.requested_date ? moment(utcToLocal(formatDate(workOrderInfo?.toJS()?.requested_date))).format('YYYY-MM-DD HH:mm:ss') : null;
        // Check SLA for Accepted status
        if(this.props.vendor_status == 'Accepted' && this.props.vendor_status != vendorStatus) {
          const acceptedSLA = this.checkAcceptedSLA(woRequestDate);
          if(acceptedSLA) {
            slaViolated = true;
          }
        }
      } else {
        // Check SLA for OnSite Now status
        if(this.props.vendor_status == 'OnSite Now' && this.props.vendor_status != vendorStatus) {
          let scheduledDate = this.props.currentWorkOrderOEvent?.start ? moment(utcToLocal(formatDate(this.props.currentWorkOrderOEvent?.start))).format('YYYY-MM-DD HH:mm:ss') : null;
          const onSiteSLA = this.checkOnSiteSLA(scheduledDate);
          if(onSiteSLA) {
            slaViolated = true;
          }
        }
        // Check SLA for Service Restored status
        if(this.props.vendor_status == 'Service Restored' && this.props.vendor_status != vendorStatus) {
          let onSiteDate = workOrderInfo?.toJS()?.vendor_status_date ? moment(utcToLocal(formatDate(workOrderInfo?.toJS()?.vendor_status_date))).format('YYYY-MM-DD HH:mm:ss') : null;
          const resolvedSLA = this.checkResolvedSLA(onSiteDate);
          if(resolvedSLA) {
            slaViolated = true;
          }
        }
      }
    }

    return (
      <div className="col-md-12" style={{ background: "#FFF", "padding": "0px" }}>
        <div className="card" style={{ "marginBottom": "20px" }}>
          <div className="card-body">
            {elogSaveLoading || elogCommentSaveLoading || elogCommentLoading || acknowledgeLoading ? this.renderLoading() : null}
            {elogSaveMsg && elogSaveMsg.get("message") && (<MessageBox messages={List([elogSaveMsg.get("message")])} onClear={this.resetInfo.bind(this)} className="Alert--success" iconClassName="fa-thumbs-up" />)}
            {elogcommentsavemsg && elogcommentsavemsg.get("message") && (<MessageBox messages={List([elogcommentsavemsg.get("message")])} onClear={this.resetInfo.bind(this)} className="Alert--success" iconClassName="fa-thumbs-up" />)}
            {errorComments && errorComments.get("message") && (<MessageBox messages={List([errorComments.get("message")])} onClear={this.resetInfo.bind(this)} />)}
            {this.state.isFileSizeError && (<MessageBox messages={List(["The size of attachments should be less than 50 MB!"])} />)}
            <div className="col-md-12 float-left">
              <form onSubmit={this.onSubmit.bind(this)} className="form-group" style={{ "marginTop": "15px" }}>
                <div className="col-md-6 float-left">
                  <TextField
                    helperText={!isAcknowledgementPending ? (slaViolated ? "Please provide reason for missing SLA (min 7 characters)" : "New Comments") : (this.props.vendor_status == "Declined" || slaViolated) ? (slaViolated ? "Please provide reason for missing SLA (min 7 characters)" : "Reason") : "Comments"}
                    multiLine={true}
                    rows={2}
                    rowsMax={4}
                    fullWidth={true}
                    className={(this.props.vendor_status == "Declined" || slaViolated) ? "required" : ""}
                    onChange={this.handleInputChange.bind(this)}
                    inputStyle={{ color: '#333', fontSize: 14, fontFamily: 'Arial, Helvetica, sans-serif' }}
                    value={this.state.newcomment}
                    disabled={!isWRFEditable}
                    FormHelperTextProps={{
                      style: (this.props.vendor_status == "Declined" || slaViolated) ? { color: 'red' } : {}
                    }}
                  />
                </div>
                {!isAcknowledgementPending ? <div className="col-3 float-left">
                  <Dropzone
                    disabled={!isWRFEditable}
                    disableClick={!isWRFEditable}
                    onDrop={this.onFileDrop.bind(this)}>
                    {({ getRootProps, getInputProps }) => (
                      <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                  <FileAttachedTable fileList={this.aList} onRemoveClick={this.onAttachRemove.bind(this)} isRemoveBtnDisabled={!isWRFEditable} />
                </div> : null}
                
                {/* Special button for AP Radio and MDU work types */}
                {(workOrderInfo && isApRadioMdu) && isWRFEditable && this.props.isWodEditable ? 
                  <>
                    <div className="col-3 row_top_space float-right">
                      <button type="submit" disabled={(this.props.vendor_status == workOrderInfo.get("vendor_status")) || (slaViolated && (this.state.newcomment == '' || !this.validateCommentLength(this.state.newcomment)))} className="Button--primary u-floatRight">Submit</button>
                    </div>
                  </>
                  :
                  <>
                    {!isAcknowledgementPending  && isWRFEditable 
                    &&  this.props.vendor_status != 'Scheduled'
                    && this.props.vendor_status != 'Rescheduled' && this.props.isWodEditable ? <div className="col-3 row_top_space float-right">
                        <button type="submit" disabled={(this.state.newcomment == '' && this.aList.length === 0) || this.state.isFileSizeError || issoCondition || ((this.props.vendor_status_wo?.toLowerCase() == 'pending vendor invoice' || this.props.vendor_status_wo?.toLowerCase() == 'work completed') && this.state.newcomment == '') } className="Button--secondary u-floatRight">{hasElog ? 'Submit' : 'Submit'}</button>
                      </div> : null}

                    {!isAcknowledgementPending && (this.props.vendor_status == 'Scheduled' || this.props.vendor_status == 'Rescheduled') && isWRFEditable && this.props.isWodEditable && this.props.startDate !== '' && this.props.endDate !== '' && this.props.startDateValErr == null && this.props.endDateValErr == null ? <div className="col-3 row_top_space float-right">
                        <button type="submit" disabled={(this.state.newcomment == '' && this.aList.length === 0) || this.state.isFileSizeError || issoCondition || ((this.props.vendor_status_wo?.toLowerCase() == 'pending vendor invoice' || this.props.vendor_status_wo?.toLowerCase() == 'work completed') && this.state.newcomment == '')} className="Button--secondary u-floatRight">{hasElog ? 'Submit' : 'Submit'}</button>
                      </div> : null}
                      
                    {isAcknowledgementPending  && isWRFEditable ? <div className="col-3 row_top_space float-right">
                        <button type="submit" disabled={(this.props.vendor_status == "Acknowledge Pending") || (this.state.newcomment == '' && this.props.vendor_status == "Declined") || (!this.props.vendor_status) || ((this.props.vendor_status_wo?.toLowerCase() == 'pending vendor invoice' || this.props.vendor_status_wo?.toLowerCase() == 'work completed') && this.state.newcomment == '')} className="Button--primary u-floatRight">{hasElog ? 'Submit' : 'Submit'}</button>
                      </div> : null}
                  </>
                }
              </form>
            </div>
            {hasElog ?
              <div className="col-md-12 float-right">
                <label>Historic Work Request Comments</label>
                <style>
                  {`
                    .rt-resizable-header-content {
                        font-weight: 600;
                            color: #060606;
                            padding: 8px;
                    }
                    .ReactTable .rt-thead .rt-th.-sort-asc, .ReactTable .rt-thead .rt-td.-sort-asc {
                        box-shadow: inset 0 3px 0 0 rgb(2, 2, 2);
                    }
                    `}
                </style>
                <ReactTable
                  data={tableColumns}
                  columns={columns}
                  defaultPageSize={5}
                  className="-striped -highlight"
                />
              </div> : null}
          </div>
        </div>
      </div>
    )
  }
}

function stateToProps(state) {

  let loginId = state.getIn(["Users", "currentUser", "loginId"])
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''
  return {
    currentValues: state.getIn(["Forms", formName, "currentValues"], List()),
    elogSaveMsg: state.getIn(['Elog', 'elogSaveMsg'], List()),
    elogcommentsavemsg: state.getIn(['Elog', 'elogcommentsavemsg'], List()),
    UserInfo: state.getIn(['Users', 'entities', 'users', loginId], List()),
    elogSaveLoading: state.getIn(['Elog', 'elogSaveLoading'], false),
    elogCommentSaveLoading: state.getIn(['Elog', 'elogCommentSaveLoading'], false),
    elogCommentLoading: state.getIn(['Elog', 'elogCommentLoading'], false),
    loginId,
    acknowledgeLoading : state.getIn(['VendorDashboard', "vendorStatus", "loading"], false),
    elogComments: state.getIn(['Elog', 'elogComments'], List()),
    errorComments: state.getIn(['Elog', 'elogCommenterrors'], List()),
    realLoginId,
    realUser,
    ssoUrl,
    isssouser,
  }
}

export default connect(stateToProps, { ...ElogActions, ...formActions, updateAcknowledgeStatus, fetchWorkOrder})(ElogForm)
