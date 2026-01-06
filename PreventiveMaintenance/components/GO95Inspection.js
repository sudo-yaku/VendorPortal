import React, { Component } from 'react'
import * as pmActions from "../actions"
import { List, Map } from "immutable"
import { connect } from "react-redux"
import moment from 'moment'

import Select from 'react-select'
import Loader from '../../Layout/components/Loader'
import { SingleDatePicker } from 'react-dates'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils.js'

class GO95Inspection extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            go95Info: null,
            PS_LOCATION_ID: "",
            SITE_NAME: "",
            SITE_ADDRESS: "",
            SITE_STATE: "",
            SITE_COUNTY: "",
            //pole information
            STRUCTURE_TYPE: null,
            STRUCTURE_MATERIAL: null,
            STRUCTURE_OWNER: null,
            POLE_CREATED_DATE: null,
            poleCreatedDateFocused: false,
            POLE_HEIGHT: null,
            ROW: null,
            FIRE_ZONE: null,
            LATITUDE: null,
            LONGITUDE: null,
            LAST_POLE_PATROL_INSP: "",
            NEXT_POLE_PATROL_INSP: "",
            LAST_POLE_DETAILED_INSP: "",
            NEXT_POLE_DETAILED_INSP: "",
            //inspection information
            INSPECTION_DATE: null,
            inspectionDateFocused: null,
            INSPECTOR_NAME: '',
            INSPECTION_TYPE: '',
            REMEDIATION_REQUIRED: '',
            GO95_REMEDIATION_DUE_DATE: null,
            remediationDueDateFocused: null,
            GO95_REMEDIATION_COMPLETED_DATE: null,
            remediationCompletedDateFocused: null,
            INSPECTION_COMMENTS: "",
            isLoading: true,
            compAttDetails: []
        };
        this.getPoleInfo();
    }
    async getPoleInspReport() {
        const { loginId, vendorId, fetchCompletedAttDetails, selectedGO95 } = this.props

        fetchCompletedAttDetails(loginId, vendorId, selectedGO95.PM_LIST_ITEM_ID)
            .then(action => {
                if (action.type === 'FETCH_CMPLTDATTDET_FAILURE') {
                    this.props.notiref.addNotification({
                        title: 'error',
                        position: "br",
                        level: 'error',
                        message: "Something went wrong please try again after sometime!"
                    })
                    this.setState({ compAttError: true, isLoading: false })
                }
                else if (action.type === 'FETCH_CMPLTDATTDET_SUCCESS') {
                    this.setState({
                        compAttError: false,
                        compAttDetails: action.pmCompAttDetails,
                        isLoading: false
                    })
                }
            })
    }

    async getPoleInfo() {
        const { fetchGO95PoleInfo, vendorId, loginId, selectedGO95, submarket } = this.props;
        if (selectedGO95.PM_ITEM_STATUS === "COMPLETED") {
            await this.getPoleInspReport();
        } else {
            await fetchGO95PoleInfo(loginId, vendorId, submarket, selectedGO95.EQUIPMENT_UNID, selectedGO95.PM_LIST_ITEM_ID, selectedGO95.PM_LIST_ID).then(async action => {
                let { go95Info } = this.props;
                if (action.type === 'FETCH_GO95POLEINFO_SUCCESS') {
                    let isPmItemStatusPendingDraftOrCompleted = ["COMPLETED", "PENDING_DRAFT"].includes(selectedGO95.PM_ITEM_STATUS);
                    let poleData = go95Info && go95Info.poleData && go95Info.poleData.length > 0 ? go95Info.poleData[0] : {};
                    this.setState({
                        // all data
                        go95Info,
                        PS_LOCATION_ID: poleData['PS_LOCATION_ID'] ? poleData['PS_LOCATION_ID'] : "",
                        SITE_NAME: poleData['SITE_NAME'] ? poleData['SITE_NAME'] : "",
                        SITE_ADDRESS: poleData['SITE_ADDRESS'] ? poleData['SITE_ADDRESS'] : "",
                        SITE_STATE: poleData['SITE_STATE'] ? poleData['SITE_STATE'] : "",
                        SITE_COUNTY: poleData['SITE_COUNTY'] ? poleData['SITE_COUNTY'] : "",
                        //pole information
                        STRUCTURE_TYPE: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("STRUCTURE_TYPE") :
                            poleData['EQUIPMENT_INFO'].length > 0 ? poleData['EQUIPMENT_INFO'][0]['structure_type'] : '',
                        STRUCTURE_OWNER: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("STRUCTURE_OWNER") :
                            poleData['EQUIPMENT_INFO'].length > 0 ? poleData['EQUIPMENT_INFO'][0]['structure_owner'] : '',
                        STRUCTURE_MATERIAL: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("STRUCTURE_MATERIAL") :
                            poleData['EQUIPMENT_INFO'].length > 0 ? poleData['EQUIPMENT_INFO'][0]['pole_type'] : '',
                        POLE_CREATED_DATE: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("POLE_CREATED_DATE") ? moment(this.setFieldValues("POLE_CREATED_DATE")) : null :
                            poleData['SITE_ONAIR_DATE'] ? moment(poleData['SITE_ONAIR_DATE']) : null,
                        POLE_HEIGHT: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("POLE_HEIGHT") :
                            poleData['EQUIPMENT_INFO'].length > 0 ? poleData['EQUIPMENT_INFO'][0]['structure_height'] : '',
                        ROW: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("ROW") :
                            poleData['EQUIPMENT_INFO'].length > 0 ? poleData['EQUIPMENT_INFO'][0]['pole_row_private'] : "",
                        LATITUDE: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("LATITUDE") :
                            poleData['SITE_LATITUDE'] ? poleData['SITE_LATITUDE'] : "",
                        LONGITUDE: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("LONGITUDE") :
                            poleData['SITE_LONGITITUDE'] ? poleData['SITE_LONGITITUDE'] : "",
                        FIRE_ZONE: selectedGO95['FIRE_ZONE_SECTOR'],

                        poleCreatedDateFocused: false,
                        LAST_POLE_PATROL_INSP: moment(poleData['EQUIPMENT_INFO'][0]['last_pole_patrol_insp']).format("MM/DD/YYYY"),
                        NEXT_POLE_PATROL_INSP: moment(poleData['EQUIPMENT_INFO'][0]['next_pole_patrol_insp']).format("MM/DD/YYYY"),
                        LAST_POLE_DETAILED_INSP: moment(poleData['EQUIPMENT_INFO'][0]['last_pole_detailed_insp']).format("MM/DD/YYYY"),
                        NEXT_POLE_DETAILED_INSP: moment(poleData['EQUIPMENT_INFO'][0]['next_pole_detailed_insp']).format("MM/DD/YYYY"),
                        // //inspection information
                        INSPECTION_DATE: isPmItemStatusPendingDraftOrCompleted ?
                            moment(this.setFieldValues("INSPECTION_DATE")) : moment(),
                        INSPECTION_TYPE: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("INSPECTION_TYPE") : "",
                        INSPECTOR_NAME: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("INSPECTOR_NAME") : "",
                        REMEDIATION_REQUIRED: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("REMEDIATION_REQUIRED") : "",
                        GO95_REMEDIATION_DUE_DATE: isPmItemStatusPendingDraftOrCompleted && this.setFieldValues("GO95_REMEDIATION_DUE_DATE") ?
                            moment(this.setFieldValues("GO95_REMEDIATION_DUE_DATE")) : null,
                        GO95_REMEDIATION_COMPLETED_DATE: isPmItemStatusPendingDraftOrCompleted && this.setFieldValues("GO95_REMEDIATION_COMPLETED_DATE") ?
                            moment(this.setFieldValues("GO95_REMEDIATION_COMPLETED_DATE")) : null,
                        INSPECTION_COMMENTS: isPmItemStatusPendingDraftOrCompleted ?
                            this.setFieldValues("INSPECTION_COMMENTS") : ""
                    })
                }
                this.setState({ isLoading: false })
            })
        }
    }

    setFieldValues(fieldName) {
        let { go95Info } = this.props;
        let poleAttrData = go95Info && go95Info.poleAttributeData ? go95Info.poleAttributeData : [];
        let obj = poleAttrData.find(item => item.ATTRIBUTE_NAME === fieldName)
        return obj && Object.keys(obj).length && obj.ATTRIBUTE_VALUE ? obj.ATTRIBUTE_VALUE : "";
    }

    generateOptinsForDropdown(items) {
        return items.map(i => {
            return { 'label': i, 'value': i }
        })
    }

    renderLoading = () => <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />

    formPostRequest = (attrAction) => {
        let { selectedGO95, go95Info } = this.props
        return {
            "updatedData": {
                "inspectionSummary": [
                    {
                        "PM_LIST_ID": Number(selectedGO95.PM_LIST_ID),
                        "PM_LIST_ITEM_ID": Number(selectedGO95.PM_LIST_ITEM_ID),
                        "SITE_UNID": go95Info.hasOwnProperty("poleData") ? go95Info.poleData[0]['SITE_UNID'] : '',
                        "EQUIPMENT_UNID": selectedGO95.EQUIPMENT_UNID,
                        "EQUIPMENT_TYPE": go95Info.hasOwnProperty("poleData") ? go95Info.poleData[0]['EQUIPMENT_TYPE'] : '',
                        "INSPECTION_UNID": null,
                        "OPSTRACKER_UNID": go95Info && go95Info.hasOwnProperty("poleAttributeData") && go95Info.poleAttributeData.length > 0 ? go95Info.poleAttributeData[0].OPSTRCK_INSP_UNID : null,
                        "INSP_STATUS": attrAction,
                        "INSP_COMPLETED_BY": this.state.INSPECTOR_NAME,
                        "INSP_COMPLETED_DATE": moment(this.state.INSPECTION_DATE).format('DD/MM/YYYY'),
                        "INSP_COMMENTS": this.state.INSPECTION_COMMENTS ? this.state.INSPECTION_COMMENTS : '',
                        "LAST_UPDATED_BY": this.state.INSPECTOR_NAME,
                        "VENDOR_ID": this.props.vendorId || ""
                    }
                ],
                "inspectionDetails": this.inspDetReq()
            },
            "opsTrackerCreateReqBody": null,
            "opsTrackerUpdateReqBody": null
        }
    }
    inspDetReq = () => {
        let { selectedGO95, go95Info } = this.props
        var reqAttrArr = []
        let fieldSet = [
            "PS_LOCATION_ID", "SITE_NAME", "SITE_ADDRESS", "SITE_STATE", "SITE_COUNTY",
            "STRUCTURE_TYPE", "STRUCTURE_MATERIAL", "STRUCTURE_OWNER",
            "POLE_CREATED_DATE", "POLE_HEIGHT", "ROW", "FIRE_ZONE", "LATITUDE", "LONGITUDE",
            "LAST_POLE_PATROL_INSP", "NEXT_POLE_PATROL_INSP", "LAST_POLE_DETAILED_INSP, NEXT_POLE_DETAILED_INSP",
            "INSPECTION_DATE", "INSPECTOR_NAME", "INSPECTION_TYPE", "REMEDIATION_REQUIRED",
            "GO95_REMEDIATION_DUE_DATE", "GO95_REMEDIATION_COMPLETED_DATE", "INSPECTION_COMMENTS"
        ]
        let datesArray = ["POLE_CREATED_DATE", "INSPECTION_DATE", "GO95_REMEDIATION_DUE_DATE", "GO95_REMEDIATION_COMPLETED_DATE"]
        fieldSet.forEach((item, index) => {
            reqAttrArr.push({
                "INSPECTION_UNID": null,
                "EQUIPMENT_UNID": selectedGO95.EQUIPMENT_UNID,
                "ATTRIBUTE_ID": index + 1,
                "ATTRIBUTE_NAME": item,
                "ATTRIBUTE_VALUE": datesArray.includes(item) ? this.state[item] ? moment(this.state[item]).format("MM/DD/YYYY") : null : this.state[item],
                "ATTRIBUTE_CATEGORY": "",
                "ATTRIBUTE_SUBCATEGORY": "",
                "ATTRIBUTE_FIELDS": "",
                "ATTRIBUTE_COMMENTS": "",
                "LAST_UPDATED_BY": this.state.INSPECTOR_NAME
            })
        })
        return [...reqAttrArr]
    }
    onSubmit = (attrAction) => {
        let postRequest = this.formPostRequest(attrAction)
        let { vendorId, loginId, submitTowerInsp, selectedGO95 } = this.props
        let pmListItemId = selectedGO95.PM_LIST_ITEM_ID
        // this.setState({ isLoading: true })
        submitTowerInsp(vendorId, loginId, pmListItemId, postRequest)
            .then(async (action) => {
                if (action.type === 'SUBMIT_TOWERINSP_SUCCESS') {
                    this.props.notiref.addNotification({
                        title: 'success',
                        position: "br",
                        level: 'success',
                        message: "Details Submission successful"
                    })
                    // this.setState({ isLoading: false })
                    this.props.handleHideModalGO95(attrAction)
                    if (attrAction === "COMPLETED") {
                        const { fetchGO95PoleInfo, vendorId, loginId, selectedGO95, submarket } = this.props;
                        await fetchGO95PoleInfo(loginId, vendorId, submarket, selectedGO95.EQUIPMENT_UNID, selectedGO95.PM_LIST_ITEM_ID, selectedGO95.PM_LIST_ID)
                            .then(async action => {
                                let { go95Info } = this.props;
                                if (action.type === 'FETCH_GO95POLEINFO_SUCCESS') {
                                    let inputData = {
                                        "data": {
                                            "getGO95PoleInfo": go95Info
                                        }
                                    }
                                    // let poleAttributeData = go95Info && go95Info.poleAttributeData && go95Info.poleAttributeData.length > 0 ? go95Info.poleAttributeData[0] : {};
                                    await this.props.generateInspPDF(vendorId, loginId, selectedGO95.PM_LIST_ITEM_ID, inputData, 'GO95')
                                        .then(action => {
                                            if (action.type == 'GENERATE_PDF_SUCCESS') {
                                                this.props.notiref.addNotification({
                                                    title: 'success',
                                                    position: "br",
                                                    level: 'success',
                                                    message: "PDF Generation successful"
                                                })
                                            }
                                            else {
                                                this.props.notiref.addNotification({
                                                    title: 'error',
                                                    position: "br",
                                                    level: 'error',
                                                    message: "PDF Generation failed"
                                                })
                                            }
                                        })
                                }
                            })
                        // this.props.handleHideModalGO95()
                    }
                }
            })
    }
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
    render() {
        let {
            PS_LOCATION_ID, SITE_NAME, SITE_ADDRESS, SITE_STATE, SITE_COUNTY,
            STRUCTURE_TYPE, STRUCTURE_OWNER, STRUCTURE_MATERIAL, POLE_CREATED_DATE, poleCreatedDateFocused, POLE_HEIGHT,
            ROW, FIRE_ZONE, LATITUDE, LONGITUDE,
            LAST_POLE_PATROL_INSP, NEXT_POLE_PATROL_INSP, LAST_POLE_DETAILED_INSP, NEXT_POLE_DETAILED_INSP,
            INSPECTION_DATE, inspectionDateFocused, INSPECTOR_NAME, INSPECTION_TYPE,
            REMEDIATION_REQUIRED, GO95_REMEDIATION_DUE_DATE, remediationDueDateFocused, GO95_REMEDIATION_COMPLETED_DATE, remediationCompletedDateFocused,
            INSPECTION_COMMENTS, isLoading
        } = this.state;
        let issoCondition = false
        let { realLoginId, loginId, isssouser, ssoUrl, realUser} = this.props

        //offshore condition

        let offShore = false;
        if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
            offShore = realUser.toJS().isUserOffShore
        }

    if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.includes('ssologin') || offShore === "true" ){
      issoCondition = true
    }
        let { selectedGO95 } = this.props;
        
        return (
            <div className="row" style={{ fontSize: '16px', display: "flex", justifyContent: "center" }}>
                {isLoading ? this.renderLoading() :
                    <div>
                        {
                            selectedGO95.PM_ITEM_STATUS === "COMPLETED" ?
                                <tr colSpan={"4"}>
                                    <td className="Form-group no-border" colSpan="4">
                                        <h4>Inspection Report</h4>
                                    </td>
                                    <td className="Form-group no-border" colSpan="4">
                                        <ul>
                                            {this.state.compAttDetails.attachmentsData.filter(v => v.PM_FILE_TYPE && v.PM_FILE_TYPE.toLowerCase() == 'pdf'
                                                && v.PM_FILE_NAME.includes('GO95InspReport')).map(ad =>
                                                    (<li onClick={this.downloadAttachments.bind(this, ad.PM_ATTACHMENTS_ID, ad.PM_LIST_ITEM_ID, ad.PM_LIST_ID)} style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.PM_FILE_NAME}`}</b></li>))}
                                        </ul>
                                    </td>
                                    <td className="Form-group no-border" colSpan="4"></td>
                                </tr> :
                                <div>
                                    <div className="row margin-left-right-50px">
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">PS Location ID</div>
                                            <div className="row padding-10top-25bottom font-color">{PS_LOCATION_ID}</div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Site Name</div>
                                            <div className="row padding-10top-25bottom font-color">{SITE_NAME}</div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Site Address</div>
                                            <div className="row padding-10top-25bottom font-color">{SITE_ADDRESS}</div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">County</div>
                                            <div className="row padding-10top-25bottom font-color">{SITE_COUNTY}</div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">State</div>
                                            <div className="row padding-10top-25bottom font-color">{SITE_STATE}</div>
                                        </div>
                                    </div>
                                    <hr className="go95-hr-line" />
                                    <div className="row margin-left-right-50px">
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Structure Type</div>
                                            <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={STRUCTURE_TYPE}
                                                    onChange={(e) => this.setState({ STRUCTURE_TYPE: e.target.value })}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Structure Material</div>
                                            <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={STRUCTURE_MATERIAL}
                                                    onChange={(e) => this.setState({ STRUCTURE_MATERIAL: e.target.value })}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Pole Owner</div>
                                            <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={STRUCTURE_OWNER}
                                                    onChange={(e) => this.setState({ STRUCTURE_OWNER: e.target.value })}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Pole Created Date</div>
                                            <div className="row padding-10top go95-select-dropdown">
                                                <SingleDatePicker
                                                    isOutsideRange={() => false}
                                                    orientation={'vertical'}
                                                    verticalHeight={380}
                                                    numberOfMonths={1}
                                                    showDefaultInputIcon={false}
                                                    onDateChange={POLE_CREATED_DATE => this.setState({ POLE_CREATED_DATE })}
                                                    focused={poleCreatedDateFocused}
                                                    onFocusChange={({ focused }) => this.setState({ poleCreatedDateFocused: focused })}
                                                    date={POLE_CREATED_DATE}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                            <div className="row">
                                                <a className="go95-reset-date-link" onClick={() => this.setState({ POLE_CREATED_DATE: null })}>Reset Date</a>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Pole Height</div>
                                            <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={POLE_HEIGHT}
                                                    onChange={(e) => this.setState({ POLE_HEIGHT: e.target.value })}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">ROW (right of way)</div>
                                            <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={ROW}
                                                    onChange={(e) => this.setState({ ROW: e.target.value })}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Fire Zone</div>
                                            {/* <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={`Tier ${FIRE_ZONE}`}
                                                    disabled
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div> */}
                                            <div className="row padding-10top-25bottom font-color">{`Tier ${FIRE_ZONE}`}</div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Latitude</div>
                                            <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={LATITUDE}
                                                    onChange={(e) => this.setState({ LATITUDE: e.target.value })}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Longitude</div>
                                            <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={LONGITUDE}
                                                    onChange={(e) => this.setState({ LONGITUDE: e.target.value })}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="go95-hr-line" />
                                    <div className="row margin-left-right-50px">
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                            <div className="row font-weight-bold">Last Patrol Inspection Date</div>
                                            <div className="row padding-10top-25bottom font-color">{LAST_POLE_PATROL_INSP}</div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                            <div className="row font-weight-bold">Next Patrol Inspection Date</div>
                                            <div className="row padding-10top-25bottom font-color">{NEXT_POLE_PATROL_INSP}</div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                            <div className="row font-weight-bold">Last Detailed Inspection Date</div>
                                            <div className="row padding-10top-25bottom font-color">{LAST_POLE_DETAILED_INSP}</div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                            <div className="row font-weight-bold">Next Detailed Inspection Date</div>
                                            <div className="row padding-10top-25bottom font-color">{NEXT_POLE_DETAILED_INSP}</div>
                                        </div>
                                    </div>

                                    <hr className="go95-hr-line" />
                                    <div className="row margin-left-right-50px">
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Inspection Date<span className="text-danger">*</span></div>
                                            <div className="row padding-10top-25bottom go95-select-dropdown">
                                                <SingleDatePicker
                                                    isOutsideRange={() => false}
                                                    orientation={'vertical'}
                                                    verticalHeight={380}
                                                    numberOfMonths={1}
                                                    showDefaultInputIcon={false}
                                                    onDateChange={INSPECTION_DATE => this.setState({ INSPECTION_DATE })}
                                                    focused={inspectionDateFocused}
                                                    onFocusChange={({ focused }) => this.setState({ inspectionDateFocused: focused })}
                                                    date={INSPECTION_DATE}
                                                    block
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Inspector Name<span className="text-danger">*</span></div>
                                            <div className="row padding-10top-25bottom">
                                                <input
                                                    type="text"
                                                    value={INSPECTOR_NAME}
                                                    onChange={(e) => this.setState({ INSPECTOR_NAME: e.target.value })}
                                                    style={{ width: '75%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Inspection Type<span className="text-danger">*</span></div>
                                            <div className="row padding-10top-25bottom go95-select-dropdown">
                                                <Select
                                                    name="INSPECTION_TYPE"
                                                    value={INSPECTION_TYPE}
                                                    className="col-12 col-md-12 no-padding float-left"
                                                    onChange={(e) => this.setState({ INSPECTION_TYPE: e.value })}
                                                    options={this.generateOptinsForDropdown(['PATROL', 'DETAILED'])}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">Remediation Required?<span className="text-danger">*</span></div>
                                            <div className="row padding-10top-25bottom go95-select-dropdown">
                                                <Select
                                                    name="REMEDIATION_REQUIRED"
                                                    value={REMEDIATION_REQUIRED}
                                                    className="col-12 col-md-12 no-padding float-left"
                                                    onChange={(e) => this.setState({ REMEDIATION_REQUIRED: e.value })}
                                                    options={this.generateOptinsForDropdown(['Yes', 'No'])} required />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">GO95 Remediation Due Date</div>
                                            <div className="row padding-10top go95-select-dropdown">
                                                <SingleDatePicker
                                                    isOutsideRange={() => false}
                                                    orientation={'vertical'}
                                                    verticalHeight={380}
                                                    numberOfMonths={1}
                                                    showDefaultInputIcon={false}
                                                    onDateChange={GO95_REMEDIATION_DUE_DATE => this.setState({ GO95_REMEDIATION_DUE_DATE })}
                                                    focused={remediationDueDateFocused}
                                                    onFocusChange={({ focused }) => this.setState({ remediationDueDateFocused: focused })}
                                                    date={GO95_REMEDIATION_DUE_DATE}
                                                    block
                                                />
                                            </div>
                                            <div className="row">
                                                <a className="go95-reset-date-link" onClick={() => this.setState({ GO95_REMEDIATION_DUE_DATE: null })}>Reset Date</a>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 ">
                                            <div className="row font-weight-bold">GO95 Remediation Completed Date</div>
                                            <div className="row padding-10top go95-select-dropdown">
                                                <SingleDatePicker
                                                    isOutsideRange={() => false}
                                                    orientation={'vertical'}
                                                    verticalHeight={380}
                                                    numberOfMonths={1}
                                                    showDefaultInputIcon={false}
                                                    onDateChange={GO95_REMEDIATION_COMPLETED_DATE => this.setState({ GO95_REMEDIATION_COMPLETED_DATE })}
                                                    focused={remediationCompletedDateFocused}
                                                    onFocusChange={({ focused }) => this.setState({ remediationCompletedDateFocused: focused })}
                                                    date={GO95_REMEDIATION_COMPLETED_DATE}
                                                    block
                                                />
                                            </div>
                                            <div className="row">
                                                <a className="go95-reset-date-link" onClick={() => this.setState({ GO95_REMEDIATION_COMPLETED_DATE: null })}>Reset Date</a>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8">
                                            <div className="row font-weight-bold">Inspection Comments</div>
                                            <div className="row padding-10top-25bottom">
                                                <textarea
                                                    cols={30}
                                                    rows={4}
                                                    name="comments"
                                                    style={{ height: '100%', width: '100%', border: "1px solid lightgray" }}
                                                    onChange={(e) => { this.setState({ INSPECTION_COMMENTS: e.target.value }) }}
                                                    defaultValue={INSPECTION_COMMENTS}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style={{ display: "flex", justifyContent: "center" }}>
                                            <button
                                                type="button"
                                                className="Button--big margin-right-15px"
                                                onClick={() => this.onSubmit('COMPLETED')}
                                                disabled={!(INSPECTOR_NAME && INSPECTION_TYPE && REMEDIATION_REQUIRED) || issoCondition}
                                            >Complete Inspection </button>
                                            <button
                                                type="button"
                                                className="Button--secondary"
                                                onClick={() => this.onSubmit('PENDING_DRAFT')}
                                                disabled={!(INSPECTOR_NAME && INSPECTION_TYPE && REMEDIATION_REQUIRED)|| issoCondition}
                                            >Save As Draft</button>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>
                }
            </div>
        )
    }
}
function stateToProps(state, ownProps) {
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "");
    let user = state.getIn(['Users', 'entities', 'users', loginId], Map());
    let vendorId = user.toJS().vendor_id;
    let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "");
    let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "");
    let unidVal = Object.keys(ownProps).length > 0 ? ownProps.selectedGO95.EQUIPMENT_UNID : '';
    let poleInfo = state.getIn(['PmDashboard', loginId, vendorId, "GO95", "GO95PoleInfo", unidVal], Map());
    let go95Info = poleInfo ? poleInfo.toJS() : {}
    const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
   const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
   let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
   let isssouser = realUser ? realUser.get('isssouser') : ''
    return {
        loginId,
        user,
        vendorId,
        market,
        submarket,
        go95Info,
         realLoginId,
        realUser,
        ssoUrl,
        isssouser
    }
}

export default connect(stateToProps, { ...pmActions })(GO95Inspection)
