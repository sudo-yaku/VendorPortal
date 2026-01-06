import React, { Component } from "react"
import { connect } from "react-redux"
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import Loader from '../../Layout/components/Loader'
import { Picky } from 'react-picky';
import 'react-picky/dist/picky.css';
import { Accordion, AccordionSummary, AccordionDetails, Radio, RadioGroup, FormControlLabel, FormControl } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Dropzone from 'react-dropzone'
import ListOfFiles from './ListOfFiles'
import { SingleDatePicker } from 'react-dates'
import moment from 'moment'
import Select from 'react-select'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils.js'
import SiteInformation from "../../sites/components/SiteInformation"
import uniq from 'lodash/uniq'
import MessageBox from '../../Forms/components/MessageBox'
import { ivrEmailNotification } from "../../Users/schema.js"
import { ivrEmailNotify } from "../../Users/actions.js"


class DynamicHvacPm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            addHvac: { m: -1, u: 1 },
            modelAtts: [],
            techName: '',
            commentsVendor: '',
            inspectionDate: moment(),
            repairDrpdwn: [],
            showText: false,
            selectedOthers: [],
            filesData: [],
            csr: [],
            hvacEquipmentInfo:[],
            noRecErr: false,
            sectionCompleted: {},
            towerAttributeData: [],
            submittedUnitGrps: [],
            pageLoading: false,
            attchmnts: [],
            submarketUnidData: null,
            sitesInfo: null,
            hvacControllerType: '',
            hvacControllerModel: '',
            opsHvacType: '',
            opsHvacModel: '',
            loaderEnable: false,
            economizerValues: ['airsys', 'bard', 'marvair'],
            drpdwnOptions1: [{ value: 2.5, label: '2.5', isFixed: true }, { value: '2.6', label: '2.6', isFixed: true }, { value: '2.7', label: '2.7', isFixed: true }, { value: '2.8', label: '2.8', isFixed: true }, { value: '2.9', label: '2.9', isFixed: true }, { value: '3', label: '3', isFixed: true }, { value: '3.1', label: '3.1', isFixed: true }, { value: '3.2', label: '3.2', isFixed: true }, { value: '3.3', label: '3.3', isFixed: true }, { value: '3.4', label: '3.4', isFixed: true }, { value: '3.5', label: '3.5', isFixed: true }, { value: '3.6', label: '3.6', isFixed: true }, { value: '3.7', label: '3.7', isFixed: true }, { value: '3.8', label: '3.8', isFixed: true }, { value: '3.9', label: '3.9', isFixed: true }, { value: '4', label: '4', isFixed: true }, { value: '4.1', label: '4.1', isFixed: true }, { value: '4.2', label: '4.2', isFixed: true }, { value: '4.3', label: '4.3', isFixed: true }, { value: '4.4', label: '4.4', isFixed: true }, { value: '4.5', label: '4.5', isFixed: true }, { value: '4.6', label: '4.6', isFixed: true }, { value: '4.7', label: '4.7', isFixed: true }, { value: '4.8', label: '4.8', isFixed: true }, { value: '4.9', label: '4.9', isFixed: true }, { value: '5', label: '5', isFixed: true }, { value: '5.1', label: '5.1', isFixed: true }, { value: '5.2', label: '5.2', isFixed: true }, { value: '5.3', label: '5.3', isFixed: true }, { value: '5.4', label: '5.4', isFixed: true }, { value: '5.5', label: '5.5', isFixed: true }, { value: '5.6', label: '5.6', isFixed: true }, { value: '5.7', label: '5.7', isFixed: true }, { value: '5.8', label: '5.8', isFixed: true }, { value: '5.9', label: '5.9', isFixed: true }, { value: '6', label: '6', isFixed: true }, { value: '6.1', label: '6.1', isFixed: true }, { value: '6.2', label: '6.2', isFixed: true }, { value: '6.3', label: '6.3', isFixed: true }, { value: '6.4', label: '6.4', isFixed: true }, { value: '6.5', label: '6.5', isFixed: true }, { value: '6.6', label: '6.6', isFixed: true }, { value: '6.7', label: '6.7', isFixed: true }, { value: '6.8', label: '6.8', isFixed: true }, { value: '6.9', label: '6.9', isFixed: true }, { value: '7', label: '7', isFixed: true }, { value: '7.1', label: '7.1', isFixed: true }, { value: '7.2', label: '7.2', isFixed: true }, { value: '7.3', label: '7.3', isFixed: true }, { value: '7.4', label: '7.4', isFixed: true }, { value: '7.5', label: '7.5', isFixed: true }, { value: '7.6', label: '7.6', isFixed: true }, { value: '7.7', label: '7.7', isFixed: true }, { value: '7.8', label: '7.8', isFixed: true }, { value: '7.9', label: '7.9', isFixed: true }, { value: '8', label: '8', isFixed: true }, { value: '8.1', label: '8.1', isFixed: true }, { value: '8.2', label: '8.2', isFixed: true }, { value: '8.3', label: '8.3', isFixed: true }, { value: '8.4', label: '8.4', isFixed: true }, { value: '8.5', label: '8.5', isFixed: true }, { value: '8.6', label: '8.6', isFixed: true }, { value: '8.7', label: '8.7', isFixed: true }, { value: '8.8', label: '8.8', isFixed: true }, { value: '8.9', label: '8.9', isFixed: true }, { value: '9', label: '9', isFixed: true }, { value: '9.1', label: '9.1', isFixed: true }, { value: '9.2', label: '9.2', isFixed: true }, { value: '9.3', label: '9.3', isFixed: true }, { value: '9.4', label: '9.4', isFixed: true }, { value: '9.5', label: '9.5', isFixed: true }, { value: '9.6', label: '9.6', isFixed: true }, { value: '9.7', label: '9.7', isFixed: true }, { value: '9.8', label: '9.8', isFixed: true }, { value: '9.9', label: '9.9', isFixed: true }, { value: '10', label: '10', isFixed: true }],

            drpdwnOptions2: [{ value: 50, label: '50', isFixed: true }, { value: 51, label: '51', isFixed: true }, { value: 52, label: '52', isFixed: true }, { value: 53, label: '53', isFixed: true }, { value: 54, label: '54', isFixed: true }, { value: 55, label: '55', isFixed: true }, { value: 56, label: '56', isFixed: true }, { value: 57, label: '57', isFixed: true }, { value: 58, label: '58', isFixed: true }, { value: 59, label: '59', isFixed: true }, { value: 60, label: '60', isFixed: true }, { value: 61, label: '61', isFixed: true }, { value: 62, label: '62', isFixed: true }, { value: 63, label: '63', isFixed: true }, { value: 64, label: '64', isFixed: true }, { value: 65, label: '65', isFixed: true }, { value: 66, label: '66', isFixed: true }, { value: 67, label: '67', isFixed: true }, { value: 68, label: '68', isFixed: true }, { value: 69, label: '69', isFixed: true }, { value: 70, label: '70', isFixed: true }, { value: 71, label: '71', isFixed: true }, { value: 72, label: '72', isFixed: true }, { value: 73, label: '73', isFixed: true }, { value: 74, label: '74', isFixed: true }, { value: 75, label: '75', isFixed: true }, { value: 76, label: '76', isFixed: true }, { value: 77, label: '77', isFixed: true }, { value: 78, label: '78', isFixed: true }, { value: 79, label: '79', isFixed: true }, { value: 80, label: '80', isFixed: true }],
            additionalHVACUnitsDisplay: false,
            additionalHVACUnitsCount: [],
            inspectionDetailsDel: [],
            hvacUnitCount: 0,
            invoicingOos : 'N'
        }
        this.formAttributes = this.formAttributes.bind(this)
        this.initModal = this.initModal.bind(this)
        this.formDefaultValuePendingDraft = this.formDefaultValuePendingDraft.bind(this)
        this.generatePDFInitial = this.generatePDFInitial.bind(this)
    }
    componentDidMount() {
        this.initModal()
    }
    async initModal() {
        const { vendorId, loginId, fetchPmHVACModelAttributeDetails, fetchTowerInspItems, submarket, fetchCompletedAttDetails } = this.props
        let { PM_ITEM_UNID, PM_LIST_ITEM_ID, INVOICINGOOS } = this.props.PMDetails
        let pm_type = this.props.currentPmList.PM_TYPE_NAME
        let pmListId = this.props.currentPmList.PM_LIST_ID
        let pmTypeId = '2'
        
        this.setState({pageLoading : true, loaderEnable : true, invoicingOos : INVOICINGOOS})
        await fetchCompletedAttDetails(loginId, vendorId, this.props.PMDetails.PM_LIST_ITEM_ID).then(async action => {
          
            if (action.type == 'FETCH_CMPLTDATTDET_SUCCESS') {
                if (action.pmCompAttDetails.attachmentsData.length == 0) {
                    await this.setState({
                        pageLoading: false, attchmnts: action.pmCompAttDetails && action.pmCompAttDetails.attachmentsData.length > 0 ? action.pmCompAttDetails.attachmentsData : [],
                        submarketUnidData: action.pmCompAttDetails.submarketUnidData,
                        sitesInfo: action.pmCompAttDetails.sitesInfo,
                        opsHvacType : action.pmCompAttDetails.sitesInfo && action.pmCompAttDetails.sitesInfo.length>0 && action.pmCompAttDetails.sitesInfo[0].hvac_controller_type,
                        opsHvacModel : action.pmCompAttDetails.sitesInfo && action.pmCompAttDetails.sitesInfo.length>0 && action.pmCompAttDetails.sitesInfo[0].hvac_controller_model, 
                        hvacControllerType: action.pmCompAttDetails.sitesInfo && action.pmCompAttDetails.sitesInfo.length>0 && action.pmCompAttDetails.sitesInfo[0].hvac_controller_type,
                        hvacControllerModel: action.pmCompAttDetails.sitesInfo && action.pmCompAttDetails.sitesInfo.length>0 && action.pmCompAttDetails.sitesInfo[0].hvac_controller_model, 
                        hvacEquipmentInfo: action.pmCompAttDetails.sitesInfo && action.pmCompAttDetails.sitesInfo.length>0 && action.pmCompAttDetails.sitesInfo[0].equipmentinfo && action.pmCompAttDetails.sitesInfo[0].equipmentinfo, 
                        noRecErr: true
                    })
                }
                else {
                    await this.setState({
                        attchmnts: action.pmCompAttDetails && action.pmCompAttDetails.attachmentsData.length > 0 ? action.pmCompAttDetails.attachmentsData : [],
                        submarketUnidData: action.pmCompAttDetails.submarketUnidData,
                        sitesInfo: action.pmCompAttDetails.sitesInfo,
                        pageLoading: false,
                        hvacControllerType: action.pmCompAttDetails.sitesInfo && action.pmCompAttDetails.sitesInfo.length>0 && action.pmCompAttDetails.sitesInfo[0].hvac_controller_type,
                        hvacControllerModel: action.pmCompAttDetails.sitesInfo && action.pmCompAttDetails.sitesInfo.length>0 && action.pmCompAttDetails.sitesInfo[0].hvac_controller_model,
                        hvacEquipmentInfo: action.pmCompAttDetails.sitesInfo && action.pmCompAttDetails.sitesInfo.length>0 && action.pmCompAttDetails.sitesInfo[0].equipmentinfo && action.pmCompAttDetails.sitesInfo[0].equipmentinfo, 
                        noRecErr: false
                    })
                }

            }
        })
        if (this.props.PMDetails.PM_ITEM_STATUS.includes('PENDING') || this.props.PMDetails.COMPLETED_BY === "" ) {
            await fetchPmHVACModelAttributeDetails(vendorId, loginId, pm_type, PM_ITEM_UNID).then(async action => {
                if (action.type == 'FETCH_HVACPMMODELATT_DETAILS_SUCCESS' && action.HVACPMDetails && action.HVACPMDetails.getHVACPmModelAttDetails && action.HVACPMDetails.getHVACPmModelAttDetails.pmInspectionData && action.HVACPMDetails.getHVACPmModelAttDetails.pmInspectionData.attributeResult.length > 0) {
                    this.setState({
                        modelAtts: action.HVACPMDetails.getHVACPmModelAttDetails.pmInspectionData.attributeResult.map(v => ({
                            ...v,
                            enteredValue: ''
                        })),
                        modelAttsOriginal: action.HVACPMDetails.getHVACPmModelAttDetails.pmInspectionData.attributeResult.map(v => ({
                            ...v,
                            enteredValue: ''
                        })),
                        csr: action.HVACPMDetails.getHVACPmModelAttDetails.pmInspectionData.hvacs && action.HVACPMDetails.getHVACPmModelAttDetails.pmInspectionData.hvacs.length > 0 ? action.HVACPMDetails.getHVACPmModelAttDetails.pmInspectionData.hvacs : [0, 0]
                    }, async () => {
                        if (this.props.PMDetails.PM_ITEM_STATUS == 'PENDING'|| this.props.PMDetails.COMPLETED_BY === "") {
                            await this.formAttributes()
                        }
                    })
                }
            })
        }
        let dropdownTypes = this.state.modelAttsOriginal && this.state.modelAttsOriginal.length>0 && this.state.modelAttsOriginal.find(e=> e.PM_TMPLT_ATTR_ID == "60") && this.state.modelAttsOriginal.find(e=> e.PM_TMPLT_ATTR_ID == "60").PM_TMPLT_ATTR_FLD_VALUE &&  this.state.modelAttsOriginal.find(e=> e.PM_TMPLT_ATTR_ID == "60").PM_TMPLT_ATTR_FLD_VALUE.split(",");
        if(!dropdownTypes?.includes(this.state.hvacControllerType)){
            this.setState({hvacControllerType: ''})
        }
        let dropdownModels = this.state.modelAttsOriginal && this.state.modelAttsOriginal.length>0 && this.state.modelAttsOriginal.find(e=> e.PM_TMPLT_ATTR_ID == "67") && this.state.modelAttsOriginal.find(e=> e.PM_TMPLT_ATTR_ID == "67").PM_TMPLT_ATTR_FLD_VALUE &&  this.state.modelAttsOriginal.find(e=> e.PM_TMPLT_ATTR_ID == "67").PM_TMPLT_ATTR_FLD_VALUE.split(",");
                if(!dropdownModels?.includes(this.state.hvacControllerModel)){
                    this.setState({hvacControllerModel: ''})
                }
        await fetchTowerInspItems(vendorId, loginId, submarket, PM_LIST_ITEM_ID, PM_ITEM_UNID, pmListId, pmTypeId).then(action => {
            if (action.type == 'FETCH_TOWERINSP_SUCCESS' && action.inspData && action.inspData.getTowerInspItems && action.inspData.getTowerInspItems.output && action.inspData.getTowerInspItems.output.towerAttributeData.length > 0) {
                let actionRes = action.inspData.getTowerInspItems.output.towerAttributeData.length > 0 ? action.inspData.getTowerInspItems.output.towerAttributeData : []
                let { csr } = this.state;
                let newArray = []
                if (actionRes && actionRes.length) {
                    actionRes.forEach(item => item.ATTRIBUTE_COMMENTS && newArray.push(Number(item.ATTRIBUTE_COMMENTS.split(" ")[2])))
                    newArray = uniq(newArray)
                }
                this.setState({
                    towerAttributeData: actionRes,
                    techName: actionRes.length > 0 ? actionRes[0].LAST_UPDATED_BY : '', commentsVendor: actionRes.length > 0 ? actionRes[0].INSP_COMMENTS : '', inspectionDate: actionRes.length > 0 ? moment(actionRes[0].LAST_UPDATED_TIME) : ''
                }, async () => {
                    await this.formAttributes()
                    this.getUnitGrps()
                    newArray.map((item, i) => csr.length && !csr[i] && this.additionalHVACUnitsAdd("default", item))
                })
            }
        })
    }
    renderLoading = () => <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />
    resetinvoicingOos = () => this.setState({invoicingOos : 'N'})
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
    checkValueEntered = (hvacAttName) => {
        let curMatch = this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == hvacAttName)
        return curMatch && curMatch.ATTRIBUTE_VALUE ? curMatch.ATTRIBUTE_VALUE : ""
    }
    checkTextValueEntered = (hvacAttName) => {
        let curMatch = this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == hvacAttName)
        return curMatch && curMatch.ATTRIBUTE_VALUE ? curMatch.ATTRIBUTE_FIELDS : "";
    }
    getUnitGrps = () => {
        let submittedUnitGrps = this.state.towerAttributeData.filter(i => !!i.ATTRIBUTE_COMMENTS).map(v => v.ATTRIBUTE_COMMENTS).reduce((unique, item) => {
            return unique.includes(item) ? unique : [...unique, item]
        }, [])
        this.setState({ submittedUnitGrps })
    }
    async formAttributes() {
        if(this.state.csr && this.state.csr.length > 0 && this.state.csr[0] != 0 ){
            var csr = this.state.csr && this.state.csr.length > 0 && this.state.csr[0] != 0 && this.state.csr.map(e=> {
                var manufacturer = this.state.hvacEquipmentInfo && this.state.hvacEquipmentInfo.length>0 && this.state.hvacEquipmentInfo.find(he=> e.hvac_unit_id == he.hvac_unit_id) &&  this.state.hvacEquipmentInfo.find(he=> e.hvac_unit_id == he.hvac_unit_id).manufacturer
                 return {
                 ...e,
                 manufacturer
                 }
              })
        } else var csr = this.state.csr
       
        var modelAtts = this.state.modelAtts.filter(v => !v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && !v.PM_TMPLT_ATTR_FLD_GROUP.includes('2-') && v.PM_TMPLT_ATTR_FLD_GROUP !== '0').map(v => ({
            ...v,
            hvacIndex: null
        }))
       
       await this.setState({ csr },()=>{
        for (let i = 1; i <= this.state.csr.length; i++) {
            this.state.modelAtts.filter(v => (v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-')) || (v.PM_TMPLT_ATTR_FLD_GROUP.includes('2-') && v.PM_TMPLT_ATTR_ID != '59')).forEach((val) => {
                modelAtts.push({
                    ...val,
                    PM_TMPLT_ATTR_NAME: `HVAC Unit ${i} ${val.PM_TMPLT_ATTR_NAME}`,
                    hvacUnitIndex: i,
                    currSysRec: this.state.csr[i - 1] != 0 && !!val.PM_TMPLT_ATTR_FLD_LBLMAP ? this.state.csr[i - 1][val.PM_TMPLT_ATTR_FLD_LBLMAP] : ''
                })
            })
            this.state.modelAtts.filter(v => (v.PM_TMPLT_ATTR_FLD_GROUP.includes('2-')) && v.PM_TMPLT_ATTR_ID == '59').forEach((val) => {
                modelAtts.push({
                    ...val,
                    PM_TMPLT_ATTR_NAME: `HVAC Unit ${i} ${val.PM_TMPLT_ATTR_NAME}`,
                    hvacUnitIndex: i,
                    PM_TMPLT_ATTR_FLD_TYPE : "TEXT",
                    PM_TMPLT_ATTR_FLD_VALUE: null,
                    currSysRec: this.state.csr[i - 1] != 0 && !!val.PM_TMPLT_ATTR_FLD_LBLMAP ? this.state.csr[i - 1][val.PM_TMPLT_ATTR_FLD_LBLMAP] : ''
                })
            })
            this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP == '0').forEach((val) => {
                modelAtts.push({
                    ...val,
                    PM_TMPLT_ATTR_NAME: `HVAC Unit ${i} ${val.PM_TMPLT_ATTR_NAME}`,
                    hvacUnitIndex: i,
                    currSysRec: this.state.csr[i - 1] != 0 && !!val.PM_TMPLT_ATTR_FLD_LBLMAP ? this.state.csr[i - 1][val.PM_TMPLT_ATTR_FLD_LBLMAP] : '',
                    enteredValue: this.props.PMDetails.PM_ITEM_STATUS == 'PENDING' && (this.state.csr[0] != 0) ? 'Yes' : this.props.PMDetails.PM_ITEM_STATUS == 'PENDING_DRAFT' && (this.state.csr[0] == 0) ? this.checkValueEntered(`HVAC Unit ${i} ${val.PM_TMPLT_ATTR_NAME}`) : ''
                })
            })
        }

         this.setState({ modelAtts, pageLoading: false , loaderEnable: false}, () => {
            if (this.props.PMDetails.PM_ITEM_STATUS && this.props.PMDetails.PM_ITEM_STATUS == 'PENDING_DRAFT') {

                this.formDefaultValuePendingDraft(modelAtts)

            }
        })
       })



    }

    async formDefaultValuePendingDraft(modelAtts) {

        if (this.state.towerAttributeData.length > 0) {
            let { LAST_UPDATED_TIME } = this.state.towerAttributeData[0]

            var repairDrpdwn = []
            let modelAtts1 = modelAtts.map(currAtt => {
                let matchingObj = this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == currAtt.PM_TMPLT_ATTR_NAME)

                if (matchingObj) {
                    if (currAtt.PM_TMPLT_ATTR_FLD_GROUP == '0') {
                        return {
                            ...currAtt,
                            enteredValue: matchingObj.ATTRIBUTE_VALUE
                        }
                    }
                    else if (currAtt.PM_TMPLT_ATTR_FLD_GROUP.includes('2-')) {
                        return {
                            ...currAtt,
                            enteredValue: matchingObj.ATTRIBUTE_VALUE,
                            optionSelected: true,
                            enteredTextValue: matchingObj.ATTRIBUTE_FIELDS ? matchingObj.ATTRIBUTE_FIELDS : ''
                        }
                    }
                    else if (currAtt.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && (currAtt.PM_TMPLT_ATTR_FLD_TYPE == "TEXT" || currAtt.PM_TMPLT_ATTR_FLD_TYPE == "NUMBER")) {
                        return {
                            ...currAtt,
                            enteredValue: matchingObj.ATTRIBUTE_VALUE

                        }
                    }
                    else if (currAtt.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && currAtt.PM_TMPLT_ATTR_FLD_TYPE == "DROPDOWN") {
                        return {
                            ...currAtt,
                            enteredValue: { label: matchingObj.ATTRIBUTE_VALUE, value: matchingObj.ATTRIBUTE_VALUE, isFixed: true },
                            otherSelected: !!matchingObj.ATTRIBUTE_FIELDS,
                            enteredTextValue: matchingObj.ATTRIBUTE_FIELDS ? matchingObj.ATTRIBUTE_FIELDS : ''


                        }
                    }
                    else if (currAtt.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && currAtt.PM_TMPLT_ATTR_FLD_TYPE == "RADIOBUTTON") {
                        return {
                            ...currAtt,
                            enteredValue: matchingObj.ATTRIBUTE_VALUE,

                            enteredTextValue: matchingObj.ATTRIBUTE_FIELDS ? matchingObj.ATTRIBUTE_FIELDS : ''


                        }
                    }
                    else if (currAtt.PM_TMPLT_ATTR_FLD_GROUP.includes('4-1')) {
                        repairDrpdwn = matchingObj.ATTRIBUTE_VALUE ? matchingObj.ATTRIBUTE_VALUE.split(',').map(av => ({ label: av, value: av, isFixed: true })) : []

                        return currAtt
                    }
                    else if ((currAtt.PM_TMPLT_ATTR_FLD_GROUP == '4-2' || currAtt.PM_TMPLT_ATTR_FLD_GROUP == '4-3')) {
                        return {
                            ...currAtt,
                            enteredValue: matchingObj.ATTRIBUTE_VALUE

                        }


                    }

                    else {
                        return currAtt
                    }
                }
                else {
                    return currAtt
                }
            })

            await this.setState({ repairDrpdwn, modelAtts: modelAtts1 }, () => {
                [1, 2].forEach(hvacIndex => {
                    this.checkUnitCompleted(this.state.modelAtts.filter(i => i.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && i.hvacUnitIndex == hvacIndex)[0])
                })
            })

        }
        return;

    }

    formDropdownOptionsMulti = (currentObj) => {
        let currObj = [...currentObj.PM_TMPLT_ATTR_FLD_VALUE.split(','), ...this.state.repairDrpdwn.map(v => v.value)]

        const consolArr = currObj.filter(val => !!val).reduce((unique, item) => {
            return unique.includes(item) ? unique : [...unique, item]
        }, [])

        return consolArr.map(option => ({ value: option, label: option, isFixed: true })).concat({ value: 'Other', label: 'Other', isFixed: true })

    }
    onAttachRemove(index) {

        this.setState({
            filesData: this.state.filesData.filter((_, i) => i !== index)
        })
        this.forceUpdate()
    }
    async handleMultiDropdownChange(mdfdObj, e) {
        if (e.filter(arr => arr.value === 'Other').length > 0) {
            await this.setState({ repairDrpdwn: e, showText: true })
        }
        else {
            await this.setState({ repairDrpdwn: e, showText: false })
        }



    }

    handleAddToSel = (mdfdObj) => {
        const repairDrpdwn = document.getElementById('otherOption').value.split(',').map(val => ({
            value: val,
            label: val
        })).concat(this.state.repairDrpdwn.filter(val => val.value !== 'Other'))
        const selectedOthers = document.getElementById('otherOption').value.split(',').map(val => ({
            value: val,
            label: val,
            isFixed: true
        })).concat(this.state.selectedOthers)
        document.getElementById('otherOption').value = ''

        this.setState({ repairDrpdwn, selectedOthers, showText: false })

    }
    handleDropdownChange = (currObj, e) => {
        let modelAtts = this.state.modelAtts.map(val => {
            if (val.PM_TMPLT_ATTR_NAME == currObj.PM_TMPLT_ATTR_NAME) {
                return {
                    ...val,
                    enteredValue: e.value,
                    otherSelected: e.value == 'Other' ? true : false
                }
            }
            else {
                return val
            }
        })
        this.setState({ modelAtts }, () => {
            if (currObj.PM_TMPLT_ATTR_ID == '59') {
                this.clearDiffSetPt(currObj)
                this.checkUnitCompleted(currObj)
            }
        })
    }
    handleDropdownChangeControllerType = (currObj, e) => {
       this.setState({hvacControllerType : e.value})
    }
    handleDropdownChangeControllerModel = (currObj, e) => {
            this.setState({hvacControllerModel : e.value})
    }
    clearDiffSetPt = (currObj) => {
        const modelAtts = this.state.modelAtts.map(v => {
            if (v.PM_TMPLT_ATTR_ID == '68' && v.hvacUnitIndex == currObj.hvacUnitIndex) {
                return {
                    ...v,
                    enteredValue: null
                }
            }
            else {
                return v
            }
        })
        this.setState({ modelAtts })
    }
    handleButtonChange = (currObj, e) => {
        let modelAtts = this.state.modelAtts.map(val => {
            if (val.PM_TMPLT_ATTR_NAME == currObj.PM_TMPLT_ATTR_NAME) {
                return {
                    ...val,
                    enteredValue: e.target.value == 'Yes' && val.currSysRec ? val.currSysRec : '',
                    enteredTextValue: val.currSysRec ? val.currSysRec : '',
                    optionSelected: true

                }
            }
            else {
                return val
            }
        })
        this.setState({ modelAtts }, () => {
            this.checkUnitCompleted(currObj)
        })
    }
    handleButtonChangeNotfnd = (currObj, e) => {
        let { sectionCompleted, modelAtts } = this.state
        if (currObj) {
            let modelAttsNew = modelAtts.map(val => {
                if (val.PM_TMPLT_ATTR_NAME == currObj.PM_TMPLT_ATTR_NAME) {
                    // let model = !!this.state.modelAtts.find(i => i.PM_TMPLT_ATTR_ID == '54' && i.hvacUnitIndex == currObj.hvacUnitIndex) ? this.state.modelAtts.find(i => i.PM_TMPLT_ATTR_ID == '54' && i.hvacUnitIndex == currObj.hvacUnitIndex) : {}
                    // let serialNo = !!this.state.modelAtts.find(i => i.PM_TMPLT_ATTR_ID == '55' && i.hvacUnitIndex == currObj.hvacUnitIndex) ? this.state.modelAtts.find(i => i.PM_TMPLT_ATTR_ID == '55' && i.hvacUnitIndex == currObj.hvacUnitIndex) : {}
                    return {
                        ...val,
                        enteredValue: e.target.value
                    }
                }
                else if (val.PM_TMPLT_ATTR_NAME != currObj.PM_TMPLT_ATTR_NAME && (val.PM_TMPLT_ATTR_FLD_GROUP.includes('3-')) && val.hvacUnitIndex == currObj.hvacUnitIndex) {
                    return {
                        ...val,
                        enteredValue: '',
                        enteredTextValue: ''
                    }
                }
                else if (val.PM_TMPLT_ATTR_NAME != currObj.PM_TMPLT_ATTR_NAME && (val.PM_TMPLT_ATTR_FLD_GROUP.includes('2-')) && val.hvacUnitIndex == currObj.hvacUnitIndex) {
                    return {
                        ...val,
                        enteredValue: '',
                    }
                }
                else {
                    return val
                }
            })

            if (!currObj.PM_TMPLT_ATTR_FLD_GROUP.includes('4-')) {
                if (modelAttsNew.find(i => i.PM_TMPLT_ATTR_FLD_GROUP == '0' && i.hvacUnitIndex == currObj.hvacUnitIndex).enteredValue == 'No') {
                    sectionCompleted[currObj.hvacUnitIndex] = true
                }
                else if (this.checkpmDetVerfyFoundAtSite(currObj, modelAttsNew) && this.checkRadioInpFoundAtSite(currObj, modelAttsNew) && this.checkDrpdownInpFoundAtSite(currObj, modelAttsNew)) {
                    sectionCompleted[currObj.hvacUnitIndex] = true
                }
                else {
                    sectionCompleted[currObj.hvacUnitIndex] = false
                }
            }
            this.setState({ modelAtts: modelAttsNew, sectionCompleted: sectionCompleted })
        }
    }
    checkpmDetVerfyFoundAtSite = (currObj, modelAtts) => {
        return modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && (v.PM_TMPLT_ATTR_FLD_GROUP.includes('2-') || (v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_FLD_TYPE == 'TEXT' || v.PM_TMPLT_ATTR_FLD_TYPE == 'NUMBER')) && !v.enteredValue).length == 0
    }
    checkRadioInpFoundAtSite = (currObj, modelAtts) => {
        return modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_FLD_TYPE == 'RADIOBUTTON' && ((v.PM_TMPLT_ATTR_ID != '64' && (v.enteredValue == 'Yes' || (v.enteredValue == 'No' && v.enteredTextValue))) || (v.PM_TMPLT_ATTR_ID == '64' && (v.enteredValue == 'No' || (v.enteredValue == 'Yes' && v.enteredTextValue))))).length == modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_FLD_TYPE == 'RADIOBUTTON').length
    }
    checkDrpdownInpFoundAtSite = (currObj, modelAtts) => {
        let i = currObj.hvacUnitIndex
        return modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') &&  v.PM_TMPLT_ATTR_FLD_TYPE == 'DROPDOWN' && !!v.enteredValue && v.enteredValue && ((v.PM_TMPLT_ATTR_ID != '68' && (v.enteredValue != 'Other' || v.enteredTextValue)) || ((modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i) && modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue && economizerValues.includes(modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue.toLowerCase()))))).length == modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_ID!='59' && v.PM_TMPLT_ATTR_FLD_TYPE == 'DROPDOWN' && (v.PM_TMPLT_ATTR_ID != '68' || (modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i) && modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue && economizerValues.includes(modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue.toLowerCase())))).length
    }
    handleInputChange = (currObj, e) => {
        let modelAtts = this.state.modelAtts.map(val => {
            if (val.PM_TMPLT_ATTR_NAME == currObj.PM_TMPLT_ATTR_NAME) {
                return {
                    ...val,
                    enteredValue: e.target.value,
                    enteredTextValue: currObj.currSysRec && (currObj.PM_TMPLT_ATTR_FLD_GROUP.includes('2-')) ? currObj.currSysRec : '',
                }
            }
            else {
                return val
            }
        })
        this.setState({ modelAtts }, () => {
            let modelSerialDataSets = this.state.modelAtts.filter((item) => {
                return item.PM_TMPLT_ATTR_FLD_GROUP.includes('2-1') || item.PM_TMPLT_ATTR_FLD_GROUP.includes('2-2')
            })
            let modelSerialSetsFirstTwoUnits = modelSerialDataSets.filter((eachSet) => !!eachSet.currSysRec)
            let modelDataSets = modelSerialSetsFirstTwoUnits.filter((eachOne) => eachOne.PM_TMPLT_ATTR_FLD_LBLMAP.includes('model'));
            let modelSetsCurrRec = modelDataSets.map((eachRecord) => eachRecord.currSysRec)
            this.setState({ modelSetsCurrRec })
            let serialDataSets = modelSerialSetsFirstTwoUnits.filter(eachSerial => eachSerial.PM_TMPLT_ATTR_FLD_LBLMAP.includes('serial_no'));
            let serialSetsCurrRec = serialDataSets.map((eachSerial) => eachSerial.currSysRec)
            this.setState({ serialSetsCurrRec })
            if ((modelSetsCurrRec[0] || modelSetsCurrRec[1] !== undefined) && modelDataSets.length == 2) {
                if (modelDataSets && modelDataSets[1]?.enteredValue?.length > 0 &&
                    modelDataSets[0].currSysRec.length > 0 && (modelDataSets[0].currSysRec == modelDataSets[1].enteredValue)) {
                    this.setState({ hVac2: 2 });
                    this.setState({ hUnit1: 1 })
                }
                else if (modelDataSets[0].enteredValue?.length > 0 && modelDataSets[1].currSysRec.length > 0 && (modelDataSets[1].currSysRec == modelDataSets[0].enteredValue)) {
                    this.setState({ hVac1: 1 });
                    this.setState({ hUnit2: 2 })
                }
            };


            if ((serialSetsCurrRec[0] || serialSetsCurrRec[1] !== undefined) && serialDataSets.length == 2) {
                if (serialDataSets && serialDataSets[1]?.enteredValue?.length > 0 && serialDataSets[0].currSysRec.length > 0 && (serialDataSets[0].currSysRec == serialDataSets[1].enteredValue)) {
                    this.setState({ shVac2: 2 })
                    this.setState({ shUnit1: 1 })
                } else if (serialDataSets[0].enteredValue?.length > 0 && serialDataSets[1].currSysRec.length > 0 && (serialDataSets[1].currSysRec == serialDataSets[0].enteredValue)) {
                    this.setState({ shVac1: 1 })
                    this.setState({ shUnit2: 2 })
                }
            }
            let addUnitComp = modelSerialDataSets.slice(4);
            let addUnitModel = !!addUnitComp && addUnitComp.filter((mx) => mx.PM_TMPLT_ATTR_FLD_GROUP.includes('2-1'))
            let addUnitSerial = !!addUnitComp && addUnitComp.filter((sx) => sx.PM_TMPLT_ATTR_FLD_GROUP.includes('2-2'))
            if ((modelSetsCurrRec[0] && modelSetsCurrRec[1] !== undefined)) {
                if (!!addUnitComp && addUnitComp.length > 0) {
                    addUnitModel.map((everyUnit, index) => {
                        if (everyUnit.enteredValue?.length > 0 && (everyUnit.enteredValue == modelSetsCurrRec[0])) {
                            this.setState({ addHvac: { m: index + 3, u: 1 } })
                        } else if (everyUnit.enteredValue?.length > 0 && (everyUnit.enteredValue == modelSetsCurrRec[1])) {
                            this.setState({ addHvac: { m: index + 3, u: 2 } })
                        }
                    })
                }
                if ((serialSetsCurrRec[0] || serialDataSets[1] !== undefined)) {
                    if (!!addUnitComp && addUnitComp.length > 0) {
                        addUnitSerial.map((everySerial, ind) => {
                            if (everySerial.enteredValue?.length > 0 && (everySerial.enteredValue == serialSetsCurrRec[0])) {
                                this.setState({ addHvac1: { s: ind + 3, u: 1 } })
                            } else if (everySerial.enteredValue?.length > 0 && (everySerial.enteredValue == serialSetsCurrRec[1])) {
                                this.setState({ addHvac1: { s: ind + 3, u: 2 } })
                            }
                        })
                    }
                }
            }
            this.checkUnitCompleted(currObj)
        })
    }
    handleTextAreaChange = (currObj, e) => {
        let modelAtts = this.state.modelAtts.map(val => {
            if (val.PM_TMPLT_ATTR_NAME == currObj.PM_TMPLT_ATTR_NAME) {
                return {
                    ...val,
                    enteredTextValue: e.target.value
                }
            }
            else {
                return val
            }
        })
        this.setState({ modelAtts }, () => {
            this.checkUnitCompleted(currObj)
        })
    }
    formDropdownOptions = (currentObj) => {
        let manufactVal = this.state.modelAtts.find(v => v.PM_TMPLT_ATTR_ID == '59' && v.hvacUnitIndex == currentObj.hvacUnitIndex)
        if (currentObj.PM_TMPLT_ATTR_ID == '68') {
            if (manufactVal.enteredValue && manufactVal.enteredValue.toLowerCase() == 'airsys') {
                return this.state.drpdwnOptions1
            }
            else if ((manufactVal.enteredValue && manufactVal.enteredValue.toLowerCase() == 'marvair') || (manufactVal.enteredValue && manufactVal.enteredValue.toLowerCase() == 'bard')) {
                return this.state.drpdwnOptions2
            }
            else return []
        }

        else {     
            return currentObj.PM_TMPLT_ATTR_FLD_VALUE.split(',').map(option => ({ value: option, label: option, isFixed: true }))
        }

    }
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

                    this.setState({
                        filesData: this.state.filesData.concat(droppedFile)
                    })



                    this.forceUpdate()
                }.bind(this)
                reader.readAsDataURL(file)
            }
        })
    }
    formpostReqResubmit = () => {
        let { vendorId, loginId, currentPmList, submarket } = this.props
        let { PM_LIST_ITEM_ID, PM_ITEM_UNID, PM_LIST_ID, EQUIPMENT_UNID, PM_ITEM_STATUS } = this.props.PMDetails
        return {
            "updatedData": {
                "inspectionSummary": [
                    {
                        "PM_LIST_ID": Number(PM_LIST_ID),
                        "PM_LIST_ITEM_ID": Number(PM_LIST_ITEM_ID),
                        "SITE_UNID": PM_ITEM_UNID,
                        "EQUIPMENT_UNID": PM_ITEM_UNID,
                        "EQUIPMENT_TYPE": "HVAC",
                        "INSPECTION_UNID": null,
                        "OPSTRACKER_UNID": null,
                        "INSP_STATUS": PM_ITEM_STATUS == "DECLINED" ? "RESUBMITTED" : PM_ITEM_STATUS,
                        "INSP_COMPLETED_BY": this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].INSP_COMPLETED_BY ? this.state.towerAttributeData[0].INSP_COMPLETED_BY : '',
                        "INSP_COMPLETED_DATE": this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].PM_ITEM_COMPLETED_DATE ? moment(this.state.towerAttributeData[0].PM_ITEM_COMPLETED_DATE.split(' ')[0]).format('DD/MM/YYYY') : '',
                        "INSP_COMMENTS": this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].INSP_COMMENTS ? this.state.towerAttributeData[0].INSP_COMMENTS : '',
                        "LAST_UPDATED_BY": this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].INSP_COMPLETED_BY ? this.state.towerAttributeData[0].INSP_COMPLETED_BY : '',
                        "HVAC_CONTROLLER_TYPE": this.state.hvacControllerType,
                        "HVAC_CONTROLLER_MODEL" : this.state.hvacControllerModel
                    }
                ],
                "inspectionDetails": [{
                    "INSPECTION_UNID": null,
                    "EQUIPMENT_UNID": PM_ITEM_UNID,
                    "ATTRIBUTE_ID": 73,
                    "ATTRIBUTE_NAME": "Verizon Feedback",
                    "ATTRIBUTE_VALUE": this.state.towerAttributeData.length > 0 && this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == 'Verizon Feedback') ? this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == 'Verizon Feedback').ATTRIBUTE_VALUE : '',
                    "ATTRIBUTE_CATEGORY": "0",
                    "ATTRIBUTE_SUBCATEGORY": "MULTITEXT",
                    "ATTRIBUTE_FIELDS": '',
                    "ATTRIBUTE_COMMENTS": "",
                    "LAST_UPDATED_BY": this.state.towerAttributeData.length > 0 && this.state.towerAttributeData[0].INSP_COMPLETED_BY ? this.state.towerAttributeData[0].INSP_COMPLETED_BY : ''
                }]
            },
            "opsTrackerCreateReqBody": null,
            "opsTrackerUpdateReqBody": null
        }
    }
    formPostRequest = (attrAction) => {
        let { vendorId, loginId, currentPmList, submarket } = this.props
        let { PM_LIST_ITEM_ID, PM_ITEM_UNID, PM_LIST_ID, EQUIPMENT_UNID } = this.props.PMDetails
        return {
            "updatedData": {
                "inspectionSummary": [
                    {
                        "PM_LIST_ID": Number(PM_LIST_ID),
                        "PM_LIST_ITEM_ID": Number(PM_LIST_ITEM_ID),
                        "SITE_UNID": PM_ITEM_UNID,
                        "EQUIPMENT_UNID": PM_ITEM_UNID,
                        "EQUIPMENT_TYPE": "HVAC",
                        "INSPECTION_UNID": null,
                        "OPSTRACKER_UNID": null,
                        "INSP_STATUS": attrAction,
                        "INSP_COMPLETED_BY": this.state.techName,
                        "INSP_COMPLETED_DATE": moment(this.state.inspectionDate).format('DD/MM/YYYY'),
                        "INSP_COMMENTS": this.state.commentsVendor ? this.state.commentsVendor : '',
                        "LAST_UPDATED_BY": this.state.techName,
                        "HVAC_CONTROLLER_TYPE": this.state.hvacControllerType,
                        "HVAC_CONTROLLER_MODEL" : this.state.hvacControllerModel
                    }
                ],
                "inspectionDetails": this.inspDetReq(),
                "inspectionDetailsDel": this.state.inspectionDetailsDel.toString()
            },
            "opsTrackerCreateReqBody": null,
            "opsTrackerUpdateReqBody": null
        }
    }
    inspDetReq = () => {
        let { vendorId, loginId, currentPmList, submarket } = this.props
        let { PM_LIST_ITEM_ID, PM_ITEM_UNID, PM_LIST_ID, EQUIPMENT_UNID } = this.props.PMDetails
        var reqArr = []
        let { modelAtts, csr } = this.state;
        for (let i = 1; i <= csr.length; i++) {
            let fndAtSites = modelAtts.find(val => val.PM_TMPLT_ATTR_ID == '72' && val.hvacUnitIndex == i)
            let serialNumber = csr[(fndAtSites.hvacUnitIndex - 1)].serial_no;
            let modelNumber = csr[(fndAtSites.hvacUnitIndex - 1)].model
            if (fndAtSites.enteredValue == 'No') {
                reqArr.push({
                    "INSPECTION_UNID": null,
                    "EQUIPMENT_UNID": PM_ITEM_UNID,
                    "ATTRIBUTE_ID": fndAtSites.PM_TMPLT_ATTR_ID,
                    "ATTRIBUTE_NAME": fndAtSites.PM_TMPLT_ATTR_NAME,
                    "ATTRIBUTE_VALUE": fndAtSites.enteredValue == "Yes" ? 'Yes' : 'No',
                    "ATTRIBUTE_CATEGORY": fndAtSites.PM_TMPLT_ATTR_FLD_GROUP,
                    "ATTRIBUTE_SUBCATEGORY": fndAtSites.PM_TMPLT_ATTR_FLD_TYPE,
                    "ATTRIBUTE_FIELDS": fndAtSites.PM_TMPLT_ATTR_ID === '72' ? `REMOVE^${serialNumber}^${modelNumber}` : "",
                    "ATTRIBUTE_COMMENTS": `HVAC index ${fndAtSites.hvacUnitIndex}`,
                    "LAST_UPDATED_BY": this.state.techName
                })
            }
            else if (fndAtSites.enteredValue == 'Yes') {
                modelAtts.filter(val => val.hvacUnitIndex == i && (val.PM_TMPLT_ATTR_ID != '68' || (this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i) && this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue && this.state.economizerValues.includes(this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue.toLowerCase())))).forEach(inval => {
                    reqArr.push({
                        "INSPECTION_UNID": null,
                        "EQUIPMENT_UNID": PM_ITEM_UNID,
                        "ATTRIBUTE_ID": inval.PM_TMPLT_ATTR_ID,
                        "ATTRIBUTE_NAME": inval.PM_TMPLT_ATTR_NAME,
                        "ATTRIBUTE_VALUE": inval.PM_TMPLT_ATTR_ID=='67' ? this.state.hvacControllerModel : inval.PM_TMPLT_ATTR_ID=='60' ? this.state.hvacControllerType : !!inval.enteredValue && typeof inval.enteredValue == 'object' ? !!inval.enteredValue ? inval.enteredValue.value : '' : inval.enteredValue ? inval.enteredValue : '',
                        "ATTRIBUTE_CATEGORY": inval.PM_TMPLT_ATTR_FLD_GROUP,
                        "ATTRIBUTE_SUBCATEGORY": inval.PM_TMPLT_ATTR_FLD_TYPE,
                        "ATTRIBUTE_FIELDS": typeof inval.enteredTextValue == 'object' ? (inval.enteredTextValue && inval.enteredTextValue.value) ? inval.enteredTextValue.value : '' : inval.enteredTextValue ? inval.enteredTextValue : '',
                        "ATTRIBUTE_COMMENTS": `HVAC index ${inval.hvacUnitIndex}`,
                        "LAST_UPDATED_BY": this.state.techName
                    })
                })
            }
        }
        if (this.state.additionalHVACUnitsDisplay && this.state.additionalHVACUnitsCount.length > 0) {
            for (let i = 1; i <= this.state.additionalHVACUnitsCount.length; i++) {
                let { modelAtts, csr } = this.state
                let serialNumberObj = modelAtts.find(obj => obj.hvacUnitIndex === i + csr.length && obj.PM_TMPLT_ATTR_NAME === `HVAC Unit ${i + csr.length} Serial number`)
                let modelNumberObj = modelAtts.find(obj => obj.hvacUnitIndex === i + csr.length && obj.PM_TMPLT_ATTR_NAME === `HVAC Unit ${i + csr.length} Model`)
                let srNumber = serialNumberObj ? serialNumberObj.enteredValue : "";
                let mNumber = modelNumberObj ? modelNumberObj.enteredValue : ""
                let fndAtSites = modelAtts.find(val => val.PM_TMPLT_ATTR_ID == '72' && val.hvacUnitIndex == (i + csr.length))
                if (fndAtSites && fndAtSites.enteredValue == 'No') {
                    reqArr.push({
                        "INSPECTION_UNID": null,
                        "EQUIPMENT_UNID": PM_ITEM_UNID,
                        "ATTRIBUTE_ID": fndAtSites.PM_TMPLT_ATTR_ID,
                        "ATTRIBUTE_NAME": fndAtSites.PM_TMPLT_ATTR_NAME,
                        "ATTRIBUTE_VALUE": fndAtSites.enteredValue == "Yes" ? 'Yes' : 'No',
                        "ATTRIBUTE_CATEGORY": fndAtSites.PM_TMPLT_ATTR_FLD_GROUP,
                        "ATTRIBUTE_SUBCATEGORY": fndAtSites.PM_TMPLT_ATTR_FLD_TYPE,
                        "ATTRIBUTE_FIELDS": fndAtSites.PM_TMPLT_ATTR_ID === "72" ? `REMOVE^${srNumber}^${mNumber}` : "",
                        "ATTRIBUTE_COMMENTS": `HVAC index ${fndAtSites.hvacUnitIndex}`,
                        "LAST_UPDATED_BY": this.state.techName,
                    })
                }
                else if (fndAtSites && fndAtSites.enteredValue == 'Yes') {
                    modelAtts.filter(val => val.hvacUnitIndex == (i + this.state.csr.length) && (val.PM_TMPLT_ATTR_ID != '68' || (this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == (i + this.state.csr.length)) && this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == (i + this.state.csr.length)).enteredValue && this.state.economizerValues.includes(this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == (i + this.state.csr.length)).enteredValue.toLowerCase())))).forEach(inval => {
                        reqArr.push({
                            "INSPECTION_UNID": null,
                            "EQUIPMENT_UNID": PM_ITEM_UNID,
                            "ATTRIBUTE_ID": inval.PM_TMPLT_ATTR_ID,
                            "ATTRIBUTE_NAME": inval.PM_TMPLT_ATTR_NAME,
                            "ATTRIBUTE_VALUE": !!inval.enteredValue && typeof inval.enteredValue == 'object' ? !!inval.enteredValue ? inval.enteredValue.value : '' : inval.enteredValue ? inval.enteredValue : '',
                            "ATTRIBUTE_CATEGORY": inval.PM_TMPLT_ATTR_FLD_GROUP,
                            "ATTRIBUTE_SUBCATEGORY": inval.PM_TMPLT_ATTR_FLD_TYPE,
                            "ATTRIBUTE_FIELDS": inval.PM_TMPLT_ATTR_ID === '72' ? `ADD^${srNumber}^${mNumber}` : typeof inval.enteredTextValue == 'object' ? (inval.enteredTextValue && inval.enteredTextValue.value) ? inval.enteredTextValue.value : '' : inval.enteredTextValue ? inval.enteredTextValue : '',
                            "ATTRIBUTE_COMMENTS": `HVAC index ${inval.hvacUnitIndex}`,
                            "LAST_UPDATED_BY": this.state.techName
                        })
                    })

                }
            }
        }
        let repSelection = this.state.modelAtts.find(v => v.PM_TMPLT_ATTR_FLD_GROUP == '4-1')

        reqArr.push({
            "INSPECTION_UNID": null,
            "EQUIPMENT_UNID": PM_ITEM_UNID,
            "ATTRIBUTE_ID": repSelection.PM_TMPLT_ATTR_ID,
            "ATTRIBUTE_NAME": repSelection.PM_TMPLT_ATTR_NAME,
            "ATTRIBUTE_VALUE": this.state.repairDrpdwn.length > 0 ? this.state.repairDrpdwn.map(i => i.value).join(',') : '',
            "ATTRIBUTE_CATEGORY": repSelection.PM_TMPLT_ATTR_FLD_GROUP,
            "ATTRIBUTE_SUBCATEGORY": repSelection.PM_TMPLT_ATTR_FLD_TYPE,
            "ATTRIBUTE_FIELDS": '',
            "ATTRIBUTE_COMMENTS": "",
            "LAST_UPDATED_BY": this.state.techName
        })

        let repairArr = this.state.repairDrpdwn.length > 0 ? this.state.modelAtts.filter(v => (v.PM_TMPLT_ATTR_FLD_GROUP == '4-2' || v.PM_TMPLT_ATTR_FLD_GROUP == '4-3')).map(inval => ({
            "INSPECTION_UNID": null,
            "EQUIPMENT_UNID": PM_ITEM_UNID,
            "ATTRIBUTE_ID": inval.PM_TMPLT_ATTR_ID,
            "ATTRIBUTE_NAME": inval.PM_TMPLT_ATTR_NAME,
            "ATTRIBUTE_VALUE": !!inval.enteredValue && typeof inval.enteredValue == 'object' ? !!inval.enteredValue && inval.enteredValue?.length > 0 ? inval.enteredValue.map(vi => vi.value).join(',') : '' : inval.enteredValue ? inval.enteredValue : '',
            "ATTRIBUTE_CATEGORY": inval.PM_TMPLT_ATTR_FLD_GROUP,
            "ATTRIBUTE_SUBCATEGORY": inval.PM_TMPLT_ATTR_FLD_TYPE,
            "ATTRIBUTE_FIELDS": typeof inval.enteredTextValue == 'object' ? (inval.enteredTextValue.value) ? inval.enteredTextValue.value : '' : inval.enteredTextValue ? inval.enteredTextValue : '',
            "ATTRIBUTE_COMMENTS": "",
            "LAST_UPDATED_BY": this.state.techName
        })) : []
        return [...reqArr, ...repairArr]
    }
    formFilesPostRequest = () => {
        const { currentPmList, PMDetails, loginId } = this.props
        let currentPmListID = currentPmList.PM_LIST_ID
        return this.state.filesData.map(fd => {
            let file_name = fd.file_name.split('.')[0]
            let file_type = fd.file_name.split('.')[1]
            return {
                "PM_LIST_ID": currentPmListID,
                "ASSOCIATED_PM_LISTS": `${currentPmListID},`,
                "PM_LIST_ITEM_ID": PMDetails.PM_LIST_ITEM_ID,
                "PM_LOCATION_UNID": PMDetails.PM_ITEM_UNID,
                "PM_FILE_CATEGORY": "VP",
                "PM_FILE_NAME": file_name,
                "PM_FILE_TYPE": file_type,
                "PM_FILE_SIZE": fd.file_size,
                "PM_FILE_DATA": fd.file_data,
                "LAST_UPDATED_BY": loginId
            }

        })

    }
    onReSubmit = () => {
        let postRequest = this.formpostReqResubmit()
        let { vendorId, loginId, submitTowerInsp, PMDetails, fetchPmGridDetails, currentPmList, uploadFiles } = this.props
        let pmListItemId = this.props.PMDetails.PM_LIST_ITEM_ID
        var filesPostRequest = {
            "fileList": this.formFilesPostRequest()
        }
        this.setState({ pageLoading: true })
        submitTowerInsp(vendorId, loginId, pmListItemId, postRequest).then(async (action) => {
            if (action.type === 'SUBMIT_TOWERINSP_SUCCESS') {
                this.props.notiref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "Details Submission successful"
                })
                if (this.state.filesData.length > 0) {
                    uploadFiles(vendorId, loginId, PMDetails.PM_LIST_ITEM_ID, filesPostRequest).then((action) => {

                        if (action.type === 'UPLOAD_FILES_SUCCESS') {
                            this.props.handleHideModal()
                            this.props.fetchSearchedSites(vendorId, loginId).then(action => {
                                this.props.filterSearchedSites(vendorId, loginId, this.props.searchString)
                            })
                            fetchPmGridDetails(vendorId, loginId, currentPmList.PM_LIST_ID)
                            this.props.notiref.addNotification({
                                title: 'success',
                                position: "br",
                                level: 'success',
                                message: "Files upload successful"
                            })

                        }

                    }).catch((error) => {

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
            }
        })

        this.setState({ pageLoading: false })

    }
    formpostReqHvacpdf = () => {
        let { pmListNamepdf, vendorId, vendorName, poNum } = this.props
        let { PM_LIST_ID, PM_ITEM_STATUS, PM_LIST_ITEM_ID, PM_LIST_ITEM_ID_PS, PS_LOCATION_ID, PM_ITEM_UNID, PM_ITEM_COMPLETED_DATE, PM_LOCATION_NAME, PM_ITEM_COMPLETED_DATE_STAMP, SCHEDULE, LINE } = this.props.PMDetails

        return {
            "attributeData": this.state.towerAttributeData,
            "submarketUnidData": this.state.submarketUnidData,
            "sitesInfo": this.state.sitesInfo,
            "pmListData": {
                "PM_LIST_NAME": pmListNamepdf,
                PM_LIST_ID,
                "FREQUENCY": null,
                "EXPENSE_PROJ_ID": null,
                "COST_CENTER": "8600",
                "PO_BU": "NTSCA",
                "MANAGER_ID": null,
                "PO_ENTERED_DATE": null,
                "PO_EMAIL_DISTRO": null,
                "BUYER": null,
                "PRODUCT_CD": "200",
                "VENDOR_ID": vendorId,
                "VENDOR_NAME": vendorName,
                "PM_TYPE_ID": null,
                "PM_LIST_STATUS": PM_ITEM_STATUS,
                "PO_STATUS": null,
                "PO_NUM": poNum,//
                "PS_ITEM_ID": null,
                "MMID": null,
                "PM_LIST_STATUS_1": null,
                "CREATER": null,
                "CREATED_DATE": moment(),
                "PS_POLL_IND": null,
                "PM_LIST_STATUS_2": null,
                "APPLY_PM_VENDOR": null,
                "NOTIFY_POTEAM": null,
                "BUYER_ID": null,
                "EMP_ID": null,
                "PM_ATTACHMENTS_ID": null,
                "PM_FILE_NAME": null,
                "PM_FILE_CATEGORY": null,
                "PM_FILE_TYPE": null,
                "ASSOCIATED_TYPE_ID": null,
                "VENDOR_EMAIL": null,
                "IS_COMPLETED": null,
                "IS_VENDOR_REQUESTED": null,
                "PM_GROUP": "PM",
                "BUYER_EMAIL": null,
                "MANAGER_EMAIL": null
            },
            "pmItemInfo": {
                "PM_EQUIPMENTS_COUNT": null,
                "EQUIPMENT_UNIT_SIZE": null,
                "SITE_TYPE": null,
                "LAST_COMPLETED_DATE": null,
                PM_LIST_ID,
                "PM_ITEM_COMPLETED_DATE": moment().format('YYYY-MM-DD HH:mm:ss'),
                "COMPLETED_BY": this.state.techName,
                PM_LIST_ITEM_ID,
                "PO_ITEM_ID": null,
                "DESCRIPTION": null,
                "PM_LIST_ITEM_ID_PS": PM_LIST_ITEM_ID,
                "SWITCH_NAME": null,
                "PM_LOCATION_NAME": PM_LOCATION_NAME,
                "PM_SITE_ID": null,
                PS_LOCATION_ID,
                "PM_LOCATION_UNID": PM_ITEM_UNID,
                "PM_ITEM_STATUS": PM_ITEM_STATUS,
                "PM_EQUIPMENT_MAKER": null,
                "PM_LOCATION_STATUS": null,
                "FIELDENGINEER": null,
                "LOCATION_PRIORITY": null,
                "EQUIPMENT_STATUS": null,
                "PM_COST": null,
                "LINE": LINE,
                "SCHEDULE": SCHEDULE,
                "LINE_SCH_MATCH_STATUS": null,
                "PM_ITEM_DUE_DATE": null,
                "PO_ITEM_DESCRIPTION": null,
                "PM_ITEM_START_DATE": null
            }
        }
    }
    onSubmit = async (attrAction) => {
        let postRequest = this.formPostRequest(attrAction)
        let { vendorId, loginId, submitTowerInsp, submarket, PMDetails, fetchPmGridDetails, currentPmList, uploadFiles, currentPmListID } = this.props
        let { PM_ITEM_UNID, PM_LIST_ITEM_ID } = this.props.PMDetails
        let pm_type = this.props.currentPmList.PM_TYPE_NAME
        let pmListId = this.props.currentPmList.PM_LIST_ID
        let pmTypeId = '2'
        let pmListItemId = this.props.PMDetails.PM_LIST_ITEM_ID
        var filesPostRequest = {
            "fileList": this.formFilesPostRequest()
        }
        this.setState({ pageLoading: true })
        let hvacControllerRequest = {
            "data":{
                "hvac_controller_model": this.state.hvacControllerModel,
                "hvac_controller_type":this.state.hvacControllerType
            }
        }
        
        this.props.passHvacInfoToOpstracker(loginId, PM_ITEM_UNID, hvacControllerRequest)
        submitTowerInsp(vendorId, loginId, pmListItemId, postRequest).then(async (action) => {
            if (action.type === 'SUBMIT_TOWERINSP_SUCCESS') {
                this.props.notiref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "Details Submission successful"
                })
                if (attrAction == 'PENDING_DRAFT') {
                    this.setState({ pageLoading: false })
                    this.props.handleHideModal()
                    this.props.fetchPmGridDetails(vendorId, loginId, currentPmListID)
                    this.props.fetchSearchedSites(vendorId, loginId).then(action => {
                        this.props.filterSearchedSites(vendorId, loginId, this.props.searchString)
                    })
                }
                if (this.state.filesData.length > 0) {
                    uploadFiles(vendorId, loginId, PM_LIST_ITEM_ID, filesPostRequest).then(async (action) => {
                        if (action.type === 'UPLOAD_FILES_SUCCESS') {
                            await this.props.fetchTowerInspItems(vendorId, loginId, submarket, PM_LIST_ITEM_ID, PM_ITEM_UNID, pmListId, pmTypeId).then(async action => {
                                if (action.type == 'FETCH_TOWERINSP_SUCCESS' && action.inspData && action.inspData.getTowerInspItems && action.inspData.getTowerInspItems.output && action.inspData.getTowerInspItems.output.towerAttributeData.length > 0) {
                                    await this.setState({
                                        towerAttributeData: action.inspData.getTowerInspItems.output.towerAttributeData.length > 0 ? action.inspData.getTowerInspItems.output.towerAttributeData : [],
                                    }, async () => {
                                        if (attrAction == 'COMPLETED') {
                                            let pdfInputGen = await this.formpostReqHvacpdf()
                                            await this.props.generateInspPDF(vendorId, loginId, PM_LIST_ITEM_ID, pdfInputGen, 'HVAC').then(actionGen => {
                                                this.props.fetchPmGridDetails(vendorId, loginId, currentPmListID)
                                                if (actionGen.type == 'GENERATE_PDF_SUCCESS') {
                                                    this.setState({ pageLoading: false })
                                                    this.props.handleHideModal()
                                                    this.props.fetchSearchedSites(vendorId, loginId).then(action => {
                                                        this.props.filterSearchedSites(vendorId, loginId, this.props.searchString)
                                                    })
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
                                }
                            })
                            this.props.notiref.addNotification({
                                title: 'success',
                                position: "br",
                                level: 'success',
                                message: "Files upload successful"
                            })
                        }
                    }).catch((error) => {

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
                else if (this.state.attchmnts.length > 0 && this.state.filesData.length == 0) {
                    if (attrAction == 'COMPLETED') {
                        await this.generatePDFInitial()
                    }
                }
                if (attrAction == 'COMPLETED' && this.state.invoicingOos === 'Y' && this.props.invoiceOosVendor === 'Y') {
                    await this.sendEmailNotification()
                }
                if(this.props.initPMDashboard){
                    setTimeout(() => { this.props.initPMDashboard() }, 2200);
                }
            }
        })

    }
    sendEmailNotification= () => {
        let { VENDOR_EMAIL, PM_LIST_NAME, S4_PO_NUM} = this.props.currentPmList
        let bodyMessage =`<p>The invoice was submitted for PO ${S4_PO_NUM}, line ${this.props.PMDetails.LINE} for ${PM_LIST_NAME} to Ariba/Verizon Accounts Payable before the work order was completed in OpsPortal. This is flagged as a violation of the work order complete and invoice process. Please ensure that the right process is followed going forward.</p>`;
        let emailNotification = {
            body: bodyMessage,
            from: 'Vendor Portal',
            recipients: VENDOR_EMAIL?.split(';').filter(i => i.includes('@')),
            sourceName: 'Vendor Portal',
            subject: 'PO invoice submitted in Ariba before work completed in OpsPortal',
            transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
        }
        this.props.ivrEmailNotify(this.props.loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } })
           
    }
    async generatePDFInitial() {
        let pdfInputGen = await this.formpostReqHvacpdf()
        let { vendorId, loginId, submitTowerInsp, submarket, PMDetails, fetchPmGridDetails, currentPmList, uploadFiles, currentPmListID } = this.props

        let { PM_ITEM_UNID, PM_LIST_ITEM_ID } = this.props.PMDetails
        let pm_type = this.props.currentPmList.PM_TYPE_NAME
        let pmListId = this.props.currentPmList.PM_LIST_ID
        let pmTypeId = '2'

        let pmListItemId = this.props.PMDetails.PM_LIST_ITEM_ID
        await this.props.generateInspPDF(vendorId, loginId, PM_LIST_ITEM_ID, pdfInputGen, 'HVAC').then(actionGen => {

            this.props.fetchPmGridDetails(vendorId, loginId, currentPmListID)
            if (actionGen.type == 'GENERATE_PDF_SUCCESS') {
                this.setState({ pageLoading: false })

                this.props.fetchSearchedSites(vendorId, loginId).then(action => {
                    this.props.filterSearchedSites(vendorId, loginId, this.props.searchString)
                })
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

    checkDisable = () => {
        if (this.state.hvacControllerModel && this.state.hvacControllerModel.length> 0 && this.state.hvacControllerType && this.state.hvacControllerType.length> 0 && this.state.techName && this.state.techName.length > 0 && (this.state.filesData.length > 0 || this.state.attchmnts.length > 0) && (Object.values(this.state.sectionCompleted).filter(v => !!v).length == (this.state.csr.length + this.state.additionalHVACUnitsCount.length))) {
            return false
        } else {
            return true
        }
    }
    checkpmDetVerfy = (currObj) => {
        return this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && (v.PM_TMPLT_ATTR_FLD_GROUP.includes('2-') || (v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_FLD_TYPE == 'TEXT' || v.PM_TMPLT_ATTR_FLD_TYPE == 'NUMBER')) && !v.enteredValue).length == 0
    }
    checkRadioInp = (currObj) => {
        return this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_FLD_TYPE == 'RADIOBUTTON' && ((v.PM_TMPLT_ATTR_ID != '64' && (v.enteredValue == 'Yes' || (v.enteredValue == 'No' && v.enteredTextValue))) || (v.PM_TMPLT_ATTR_ID == '64' && (v.enteredValue == 'No' || (v.enteredValue == 'Yes' && v.enteredTextValue))))).length == this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_FLD_TYPE == 'RADIOBUTTON').length
    }
    checkDrpdownInp = (currObj) => {
        let i = currObj.hvacUnitIndex
        return this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_FLD_TYPE == 'DROPDOWN' && !!v.enteredValue && v.enteredValue && ((v.PM_TMPLT_ATTR_ID != '68' && (v.enteredValue != 'Other' || v.enteredTextValue)) || ((this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i) && this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue && this.state.economizerValues.includes(this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue.toLowerCase()))))).length == this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP && v.hvacUnitIndex == currObj.hvacUnitIndex && v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_FLD_TYPE == 'DROPDOWN' && (v.PM_TMPLT_ATTR_ID != '68' || (this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i) && this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue && this.state.economizerValues.includes(this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i).enteredValue.toLowerCase())))).length
    }

    checkUnitCompleted = (currObj) => {
        var sectionCompleted = this.state.sectionCompleted
        if (currObj) {
            if (!currObj.PM_TMPLT_ATTR_FLD_GROUP.includes('4-')) {
                if (this.state.modelAtts.find(i => i.PM_TMPLT_ATTR_FLD_GROUP == '0' && i.hvacUnitIndex == currObj.hvacUnitIndex).enteredValue == 'No') {
                    sectionCompleted[currObj.hvacUnitIndex] = true
                } else if (this.checkpmDetVerfy(currObj) && this.checkRadioInp(currObj)) {
                    sectionCompleted[currObj.hvacUnitIndex] = true
                } else {
                    sectionCompleted[currObj.hvacUnitIndex] = false
                }
                this.setState({ sectionCompleted })
            }
        }
    }
    async generatePDFOndemand() {
        await this.generatePDFInitial()
        await this.initModal()
    }
    additionalHVACUnitsAdd = (action, unitCount) => {
        let { additionalHVACUnitsCount, modelAttsOriginal, csr, modelAtts, hvacUnitCount } = this.state;
        if (additionalHVACUnitsCount.length < 5) {
            let unitsArray = []
            for (let i = 0; i <= additionalHVACUnitsCount.length; i++) {
                unitsArray.push(i + 1 + csr.length)
            }
            let modelAttsNew = [];

            modelAttsOriginal.filter(v => ((v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && (v.PM_TMPLT_ATTR_ID!= 67  && v.PM_TMPLT_ATTR_ID!= 60)) || (v.PM_TMPLT_ATTR_FLD_GROUP.includes('2-') ))).forEach((val) => {
                modelAttsNew.push({
                    ...val,
                    PM_TMPLT_ATTR_NAME: `HVAC Unit ${unitsArray.length + csr.length} ${val.PM_TMPLT_ATTR_NAME}`,
                    hvacUnitIndex: unitsArray.length + csr.length,
                    enteredValue: this.props.PMDetails.PM_ITEM_STATUS === "PENDING_DRAFT" && action === "default" ? this.checkValueEntered(`HVAC Unit ${unitsArray.length + csr.length} ${val.PM_TMPLT_ATTR_NAME}`) : "",
                    enteredTextValue: this.props.PMDetails.PM_ITEM_STATUS === "PENDING_DRAFT" && action === "default" ? this.checkTextValueEntered(`HVAC Unit ${unitsArray.length + csr.length} ${val.PM_TMPLT_ATTR_NAME}`) : ""
                })
            })
            modelAttsOriginal.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP == '0').forEach((val) => {
                modelAtts.push({
                    ...val,
                    PM_TMPLT_ATTR_NAME: `HVAC Unit ${unitsArray.length + csr.length} ${val.PM_TMPLT_ATTR_NAME}`,
                    hvacUnitIndex: unitsArray.length + csr.length,
                    enteredValue: "Yes"
                })
            })
            this.setState({
                additionalHVACUnitsDisplay: true,
                additionalHVACUnitsCount: unitsArray,
                modelAtts: [...modelAtts, ...modelAttsNew],
                hvacUnitCount: unitCount
            })
        }
    }
    additionalHVACUnitsRemove = (unitNumber, currObj) => {
        let { modelAtts, additionalHVACUnitsCount, inspectionDetailsDel } = this.state;
        let unitToDelete = [...inspectionDetailsDel, `HVAC index ${unitNumber}`]
        let removedUnitsArray = modelAtts.filter(obj => obj.hvacUnitIndex !== unitNumber)
        this.setState({
            modelAtts: removedUnitsArray,
            additionalHVACUnitsCount: additionalHVACUnitsCount.filter(unitNum => unitNum !== unitNumber),
            inspectionDetailsDel: unitToDelete
        })
        this.setState({ addHvac: { m: -1, u: 1 } })
        this.setState({ addHvac1: { s: -1, u: 2 } })
    }
    render() {
        let addHvac = this.state.addHvac;
        let addHvac1 = this.state.addHvac1;
        let issoCondition = false
        let { realLoginId, loginId, isssouser, ssoUrl, realUser } = this.props
        let { sectionCompleted } = this.state;

        //offshore condition
        let offShore = false;
        if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
            offShore = realUser.toJS().isUserOffShore
        }
        if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.includes('ssologin') || offShore === "true") {
            issoCondition = true
        }
        let renderTech = this.state.techName
        let renderCom = this.state.commentsVendor
        if (this.props.PMDetails.PM_ITEM_STATUS.includes('PENDING') || this.props.PMDetails.COMPLETED_BY === "") {
            return (
                <div className="container-fluid" style={{ "maxHeight": "108vh", "overflow": "scroll" }}>
                    {this.state.pageLoading || this.state.loaderEnable ? this.renderLoading() : <div>
                        <div style={{ margin: 'auto', width: '100%' }}>
                        {this.state.invoicingOos == 'Y' && <MessageBox messages={['The selected lines on the PO have been invoiced in Ariba/Verizon Accounts Payable before the work was completed in OpsPortal. This is flagged as a violation of the work complete and invoice process. Please ensure that the right process is followed going forward']} onClear={this.resetinvoicingOos} className={"alert-danger"} marginTop={true} />}

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
                                            <SiteInformation notifref={this.props.notifref} siteUnid={this.props.PMDetails.PM_ITEM_UNID} />
                                        </div>
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                            <br />
                        </div>

                        <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                            <thead className="Form-group text-left">
                                <tr colSpan={"4"}>
                                    <td className="Form-group no-border" colSpan="4"><b>PM Date<span className="text-danger">*</span></b></td>
                                    <td className="Form-group no-border" colSpan="4"><b>Vendor Tech Name <span className="text-danger">*</span></b></td>
                                    <td className="Form-group no-border" colSpan="4"><b>Comments</b></td>
                                </tr>
                            </thead>
                            <tbody className="Form-group text-left">
                                <tr colSpan={"4"}>
                                    <td className="Form-group no-border" colSpan="4">
                                        <SingleDatePicker orientation={'vertical'} verticalHeight={380}
                                            numberOfMonths={1} showDefaultInputIcon={false}
                                            onDateChange={inspectionDate => this.setState({ inspectionDate })}
                                            onFocusChange={({ focused }) => this.setState({ inspectionDateFocused: focused })}
                                            focused={this.state.inspectionDateFocused} isOutsideRange={() => false}
                                            date={this.state.inspectionDate} block
                                        />
                                    </td>
                                    <td className="Form-group no-border" colSpan="4"><b>
                                        <input type={"text"}
                                            name="Vendor Tech Name"
                                            style={{ width: '100%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }}
                                            value={renderTech ? renderTech : ''}
                                            onChange={(e) => { this.setState({ techName: e.target.value }) }} /></b>
                                    </td>
                                    <td className="Form-group no-border" colSpan="4"><b>
                                        <textarea cols={30} rows={4}
                                            name="comments"
                                            style={{ height: '100%', width: '100%', border: "1px solid lightgray" }}
                                            value={renderCom? renderCom:''}
                                            onChange={(e) => { this.setState({ commentsVendor: e.target.value }) }} /></b>
                                    </td>
                                </tr>
                                <tr colSpan={"4"}>
                                <td className="Form-group no-border" colSpan="4"><b>HVAC Controller Type<span className="text-danger">*</span></b></td>
                                <td className="Form-group no-border" colSpan="4"><b>HVAC Controller Model<span className="text-danger">*</span></b></td>
                                <td className="Form-group no-border" colSpan="4"><b></b></td>
                                </tr>
                                <tr colSpan={"4"}>
                                  
                                      <td className="Form-group no-border text-left" colSpan="4">
                                         {this.state.modelAttsOriginal && this.state.modelAttsOriginal.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_ID== 60).map(md => (     
                                                                      
                                                                      <div>

                                                                      {md.PM_TMPLT_ATTR_FLD_TYPE == "DROPDOWN" &&
                                                                       <div>

                                                                    <Select
                                                                        name="Controller Type"
                                                                        value={{value: this.state.hvacControllerType, label: this.state.hvacControllerType}}
                                                                        className="col-12 col-md-12 no-padding float-left"
                                                                        onChange={this.handleDropdownChangeControllerType.bind(this, md)}
                                                                        options={this.formDropdownOptions(md)}
                                                                        required
                                                                    />
                                                                        </div>
                                                                       }
                                                                       </div>
                                                  ))}
                                        </td>
                                       

                                <td className="Form-group no-border text-left" colSpan="4">
                                {this.state.modelAttsOriginal && this.state.modelAttsOriginal.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_ID== 67).map(md => (     
                                                             
                                                             <div>

                                                             {md.PM_TMPLT_ATTR_FLD_TYPE == "DROPDOWN" &&
                                                              <div>

                                                                      <Select
                                                                        name="Controller Model"
                                                                        value={{value: this.state.hvacControllerModel, label: this.state.hvacControllerModel}}
                                                                        className="col-12 col-md-12 no-padding float-left"
                                                                        options={this.formDropdownOptions(md)}
                                                                        onChange={this.handleDropdownChangeControllerModel.bind(this, md)}
                                                                        required
                                                                    />
                                                               </div>
                                                              }
                                                              </div>
                                         ))}
                               </td>
                                   
                                    <td className="Form-group no-border" colSpan="4"><b></b></td>
                                </tr>
                            </tbody>
                        </table>
                        {this.state.csr.length > 0 && this.state.csr.map((val, i) => (
                            <div style={{ margin: 'auto', width: '100%' }}>
                                <Accordion
                                    style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                                    TransitionProps={{ unmountOnExit: true }}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <div>
                                            <span >{`HVAC Unit ${i + 1} Details`}</span>
                                            {!!this.state.sectionCompleted[i + 1] && <span className="text-success"><i className="fa fa-check" aria-hidden="true"></i></span>}
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="container row mb-5">
                                            {this.state.modelAtts.length > 0 && this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP == "0" && v.hvacUnitIndex == i + 1).map(val => (
                                                <div className="col-lg-12">
                                                    <div className="col-md-4"></div>
                                                    <div className="col-md-6 row">
                                                        <div className="col-md-9"><b>{val.PM_TMPLT_ATTR_NAME}</b></div>
                                                        <div className="col-md-3">
                                                            <RadioGroup
                                                                name={val.PM_TMPLT_ATTR_NAME}
                                                                onChange={this.handleButtonChangeNotfnd.bind(this, val)}
                                                                style={{ display: "block ruby" }}
                                                                value={val.enteredValue}>
                                                                <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                                                                <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                                                            </RadioGroup>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2"></div>
                                                </div>
                                            ))}
                                            {this.state.modelAtts.length > 0 && this.state.modelAtts.find(v => v.PM_TMPLT_ATTR_FLD_GROUP == "0" && v.hvacUnitIndex == i + 1) && this.state.modelAtts.find(v => v.PM_TMPLT_ATTR_FLD_GROUP == "0" && v.hvacUnitIndex == i + 1).enteredValue == 'Yes' && <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                                <div className="col-lg-12" style={{ float: 'right' }}>
                                                    <h4 className='h4 mb-3'>PM details to Verify</h4>                                         <div>
                                                        {i + 1 == this.state.hVac2 &&
                                                            <span style={{ fontSize: "1em", color: "blue", float: 'right' }}> Entered Value Matching With HVAC Unit {this.state.hUnit1} Model Number</span>
                                                        }
                                                        {i + 1 == this.state.hVac1 && <span class="text" style={{ fontSize: "1em", color: "blue", float: 'right' }}>
                                                            Entered Value Matching With HVAC Unit {this.state.hUnit2} Model Number
                                                        </span>}
                                                        <br />
                                                        {i + 1 == this.state.shVac2 &&
                                                            <span class="text" style={{ fontSize: "1em", color: "blue", float: 'right' }}>
                                                                Entered Value Matching With HVAC Unit {this.state.shUnit1} Serial Number
                                                            </span>}
                                                        {i + 1 == this.state.shVac1 && <span style={{ fontSize: "1em", color: "blue", float: 'right' }}>
                                                            Entered Value Matching With HVAC Unit {this.state.shUnit2} Serial Number
                                                        </span>}
                                                    </div>
                                                    <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                                                        <thead className="vzwtable text-left">
                                                            <tr colSpan={"4"}>
                                                                <th className="Form-group no-border" colSpan="4">HVAC PM ATTRIBUTES</th>
                                                                <th className="Form-group no-border" colSpan="4">CURRENT SYSTEM RECORDS</th>
                                                                <th className="Form-group no-border" colSpan="4">PM INPUT</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {this.state.modelAtts.filter(v => ((v.PM_TMPLT_ATTR_FLD_GROUP.includes('2-')) && v.PM_TMPLT_ATTR_NAME.includes(`Unit ${i + 1}`))).map(md => (
                                                                <tr colSpan={"4"}>
                                                                    <th className="Form-group text-left" colSpan="4">{md.PM_TMPLT_ATTR_NAME}</th>
                                                                    <td className="Form-group text-left" colSpan="4">{md.currSysRec ? md.currSysRec : ''}</td>
                                                                    <td className="Form-group text-left" colSpan="4">
                                                                        {!md.optionSelected && (<div>
                                                                            <h6>Is the record correct?</h6>
                                                                            <RadioGroup
                                                                                name={md.PM_TMPLT_ATTR_NAME}
                                                                                onChange={this.handleButtonChange.bind(this, md)}
                                                                                style={{ flexDirection: "inherit" }}>
                                                                                <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                                                                                <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                                                                            </RadioGroup>
                                                                        </div>
                                                                        )}
                                                                        {md.optionSelected && <input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                                                                            defaultValue={md.enteredValue}
                                                                            onChange={this.handleInputChange.bind(this, md)} style={{ height: '100%', width: '100%' }} />}
                                                                    </td>

                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <h4 className='h4 mb-3'>PM details to Input</h4>
                                                    <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                                                        <thead className="vzwtable text-left">
                                                            <tr colSpan={"4"}>
                                                                <th className="Form-group no-border" colSpan="4">HVAC PM ATTRIBUTES</th>
                                                                <th className="Form-group no-border" colSpan="4">PM INPUT</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_ID!= 67 && v.PM_TMPLT_ATTR_ID!= 60 && v.PM_TMPLT_ATTR_NAME.includes(`Unit ${i + 1}`) && (v.PM_TMPLT_ATTR_ID != '68' || (this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i + 1) && this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i + 1).enteredValue && this.state.economizerValues.includes(this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == i + 1).enteredValue.toLowerCase())))).map(md => (
                                                                <tr colSpan={"4"}>
                                                                    <th className="Form-group text-left" colSpan="4">{md.PM_TMPLT_ATTR_NAME}</th>
                                                                    <td className="Form-group text-left" colSpan="4">
                                                                        <div>
                                                                            {(md.PM_TMPLT_ATTR_FLD_TYPE == 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE == 'NUMBER') && (<input type={md.PM_TMPLT_ATTR_FLD_TYPE.toLowerCase()} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md)} style={{ height: '100%', width: '100%' }} defaultValue={md.enteredValue} />)}

                                                                            {md.PM_TMPLT_ATTR_FLD_TYPE == 'RADIOBUTTON' && <div>
                                                                                <RadioGroup
                                                                                    aria-label="position"
                                                                                    name={md.PM_TMPLT_ATTR_NAME}
                                                                                    onChange={this.handleInputChange.bind(this, md)}
                                                                                    style={{ flexDirection: "inherit" }}
                                                                                    value={val.enteredValue}>
                                                                                    <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                                                                                    <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                                                                                </RadioGroup>
                                                                                {md.enteredValue && <textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                                                                                    defaultValue={md.enteredTextValue? md.enteredTextValue : ''}
                                                                                    onChange={this.handleTextAreaChange.bind(this, md)} style={{ height: '100%', width: '100%' }} placeholder="Reason for selection..." />}

                                                                            </div>}
                                                                            {md.PM_TMPLT_ATTR_FLD_TYPE == "DROPDOWN" &&
                                                                                <div>
                                                                                    <Select
                                                                                        className="basic-single"
                                                                                        classNamePrefix="select"
                                                                                        // value={{ "label": md.enteredValue, "value": md.enteredValue, isFixed : true }}
                                                                                        defaultValue={md.enteredValue}
                                                                                        isDisabled={false}
                                                                                        isLoading={false}
                                                                                        clearable={false}
                                                                                        isRtl={false}
                                                                                        isSearchable={false}
                                                                                        name={md.PM_TMPLT_ATTR_NAME}
                                                                                        options={this.formDropdownOptions(md)}
                                                                                        onChange={this.handleDropdownChange.bind(this, md)}
                                                                                    />
                                                                                    {md.otherSelected && <input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                                                                                        className='mt-3'
                                                                                        defaultValue={md.enteredTextValue}
                                                                                        placeholder='Input value'
                                                                                        onChange={this.handleTextAreaChange.bind(this, md)} style={{ height: '100%', width: '100%' }} />}
                                                                                </div>}
                                                                        </div>
                                                                    </td>

                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>}
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                                <br />
                            </div>
                        ))}
                        {this.state.additionalHVACUnitsDisplay &&
                            this.state.additionalHVACUnitsCount.length > 0 &&
                            this.state.additionalHVACUnitsCount.map((unitNumber, i) => (
                                <div style={{ margin: '20px', display: 'flex' }}>
                                    <Accordion
                                        style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                                        TransitionProps={{ unmountOnExit: true }}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <div className="col-lg-12" style={{ float: 'left' }}>
                                                <span>HVAC Unit {unitNumber} Details</span>
                                                {sectionCompleted[unitNumber] && <span className="text-success"><i className="fa fa-check" aria-hidden="true"></i></span>}
                                                <div>
                                                    {!!addHvac && unitNumber == addHvac.m &&
                                                        <span style={{ fontSize: "1em", color: "blue", float: 'right' }}>
                                                            Entered Value Matching With HVAC Unit {addHvac.u} Model Number
                                                        </span>}
                                                    <br />
                                                    {!!addHvac1 && unitNumber == addHvac1.s && <span style={{ fontSize: "1em", color: "blue", float: 'right' }}>
                                                        Entered Value Matching With HVAC Unit {addHvac1.u} Serial Number
                                                    </span>}
                                                </div>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {this.state.modelAtts.length > 0 &&
                                                <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                                    <div className="col-lg-12" style={{ float: 'left' }}>
                                                        <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                                                            <thead className="vzwtable text-left">
                                                                <tr colSpan={"4"}>
                                                                    <th className="Form-group no-border" colSpan="4">HVAC PM ATTRIBUTES</th>
                                                                    <th className="Form-group no-border" colSpan="4">PM INPUT</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP.includes('2-') && v.PM_TMPLT_ATTR_NAME.includes(`Unit ${unitNumber}`)).map(md => (
                                                                    <tr colSpan={"4"}>
                                                                        <th className="Form-group text-left" colSpan="4">{md.PM_TMPLT_ATTR_NAME}<span className="text-danger">*</span></th>
                                                                        <td className="Form-group text-left" colSpan="4">
                                                                            <input
                                                                                type={"text"}
                                                                                name={md.PM_TMPLT_ATTR_NAME}
                                                                                defaultValue={md.enteredValue}
                                                                                onChange={this.handleInputChange.bind(this, md)}
                                                                                style={{ height: '100%', width: '100%' }}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP.includes('3-') && v.PM_TMPLT_ATTR_NAME.includes(`Unit ${unitNumber}`) && (v.PM_TMPLT_ATTR_ID != '68' || (this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == unitNumber) && this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == unitNumber).enteredValue && this.state.economizerValues.includes(this.state.modelAtts.find(inval => inval.PM_TMPLT_ATTR_ID == '59' && inval.hvacUnitIndex == unitNumber).enteredValue.toLowerCase())))).map(md => (
                                                                    <tr colSpan={"4"}>
                                                                        <th className="Form-group text-left" colSpan="4">{md.PM_TMPLT_ATTR_NAME}<span className="text-danger">*</span></th>
                                                                        <td className="Form-group text-left" colSpan="4">
                                                                            <div>
                                                                                {(md.PM_TMPLT_ATTR_FLD_TYPE == 'TEXT' || md.PM_TMPLT_ATTR_FLD_TYPE == 'NUMBER')
                                                                                    && (<input type={md.PM_TMPLT_ATTR_FLD_TYPE.toLowerCase()} name={md.PM_TMPLT_ATTR_NAME} onChange={this.handleInputChange.bind(this, md)} style={{ height: '100%', width: '100%' }} defaultValue={md.enteredValue} />)}
                                                                                {md.PM_TMPLT_ATTR_FLD_TYPE == 'RADIOBUTTON' && <div>
                                                                                    <RadioGroup
                                                                                        aria-label="position"
                                                                                        name={md.PM_TMPLT_ATTR_NAME}
                                                                                        onChange={this.handleInputChange.bind(this, md)}
                                                                                        style={{ flexDirection: "inherit" }}
                                                                                        value={md.enteredValue}>
                                                                                        <FormControlLabel labelPlacement="start" value="Yes" control={<Radio color="primary" />} label="Yes" />
                                                                                        <FormControlLabel labelPlacement="start" value="No" control={<Radio color="primary" />} label="No" />
                                                                                    </RadioGroup>
                                                                                    {md.enteredValue && <div><textarea cols={30} rows={4} name={md.PM_TMPLT_ATTR_NAME}
                                                                                        defaultValue={md.enteredTextValue}
                                                                                        onChange={this.handleTextAreaChange.bind(this, md)} style={{ height: '100%', width: '100%' }} placeholder="Reason for selection..." /></div>}
                                                                                </div>}
                                                                                {md.PM_TMPLT_ATTR_FLD_TYPE == "DROPDOWN" &&
                                                                                    <div>
                                                                                        <Select
                                                                                            className="basic-single"
                                                                                            classNamePrefix="select"
                                                                                            // value={{ "label": md.enteredValue, "value": md.enteredValue, isFixed : true }}
                                                                                            defaultValue={md.enteredValue}
                                                                                            isDisabled={false}
                                                                                            isLoading={false}
                                                                                            clearable={false}
                                                                                            isRtl={false}
                                                                                            isSearchable={false}
                                                                                            name={md.PM_TMPLT_ATTR_NAME}
                                                                                            options={this.formDropdownOptions(md)}
                                                                                            onChange={this.handleDropdownChange.bind(this, md)}
                                                                                        />
                                                                                        {md.otherSelected && <input type={"text"} name={md.PM_TMPLT_ATTR_NAME}
                                                                                            className='mt-3'
                                                                                            defaultValue={md.enteredTextValue}
                                                                                            placeholder='Input value'
                                                                                            onChange={this.handleTextAreaChange.bind(this, md)} style={{ height: '100%', width: '100%' }} />}
                                                                                    </div>}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>}
                                        </AccordionDetails>
                                    </Accordion>
                                    <div>
                                        <button
                                            className="Button--primary float-right mt-2"
                                            style={{ padding: '10px' }}
                                            onClick={this.additionalHVACUnitsRemove.bind(this, unitNumber)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            {this.state.additionalHVACUnitsCount.length >= 5 && <span>Max number units has been added</span>}
                            <button
                                className="Button--primary float-right mt-2"
                                style={{ padding: '10px' }}
                                disabled={this.state.additionalHVACUnitsCount.length >= 5}
                                onClick={this.additionalHVACUnitsAdd.bind(this, "add")}>Add Unit</button>
                        </div>
                        <div className="container-fluid">
                            <h4 className='h4 mb-3'>Repair work (Optional)</h4>
                            <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                                <tbody className="vzwtable text-left">
                                    {this.state.modelAtts.length > 0 && this.state.modelAtts.filter(i => i.PM_TMPLT_ATTR_FLD_GROUP == '4-1').map(val => (
                                        <tr>
                                            <td className="Form-group no-border" colSpan="4"><b>{val.PM_TMPLT_ATTR_NAME}</b></td>
                                            <td className="Form-group no-border" colSpan="4">
                                                <div style={{ backgroundColor: 'white' }} >
                                                    <Picky

                                                        value={this.state.repairDrpdwn}
                                                        options={this.formDropdownOptionsMulti(val)}
                                                        onChange={this.handleMultiDropdownChange.bind(this, val)}
                                                        open={false}
                                                        valueKey="value"
                                                        labelKey="label"
                                                        multiple={true}
                                                        includeSelectAll={false}
                                                        includeFilter={true}
                                                        clearFilterOnClose={true}
                                                    />
                                                    {this.state.showText && <div className='row mt-2'><div className='col-md-7 '><input type="text" id='otherOption' style={{ height: '100%', width: '100%' }} placeholder="Enter parts..."></input></div>
                                                        <div className='col-md-5'><button className="Button--secondary btn btn-md" onClick={this.handleAddToSel.bind(this, val)}>Add Parts</button></div>
                                                    </div>}
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                    {this.state.repairDrpdwn.length > 0 && this.state.modelAtts.filter(v => v.PM_TMPLT_ATTR_FLD_GROUP == '4-2' || v.PM_TMPLT_ATTR_FLD_GROUP == '4-3').map(i => (<tr>
                                        <td className="Form-group no-border" colSpan="4"><b>{i.PM_TMPLT_ATTR_NAME}</b></td>
                                        <td className="Form-group no-border" colSpan="4"> <input type={"text"} name={i.PM_TMPLT_ATTR_NAME}
                                            defaultValue={i.enteredValue}
                                            onChange={this.handleInputChange.bind(this, i)} style={{ height: '100%', width: '100%' }} /></td>
                                    </tr>))}

                                </tbody>
                            </table>
                        </div>
                        {this.state.attchmnts.length > 0 && <div className="container-fluid">
                            <h4 className='h4 mb-3'>Attachments</h4>
                            <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                                <tbody className="vzwtable text-left">

                                    {this.state.attchmnts.length > 0 && (
                                        <tr colSpan={"4"}>

                                            <td className="Form-group no-border" colSpan="4" > <ul>

                                                {this.state.attchmnts.map(ad => (<li
                                                    onClick={this.downloadAttachments.bind(this, ad.PM_ATTACHMENTS_ID, ad.PM_LIST_ITEM_ID, ad.PM_LIST_ID)} style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.PM_FILE_NAME}.${ad.PM_FILE_TYPE}`}</b></li>))}
                                            </ul>

                                            </td>
                                            <td className="Form-group no-border" colSpan="4" ></td>
                                            <td className="Form-group no-border" colSpan="4" >

                                            </td>
                                        </tr>

                                    )}
                                </tbody>
                            </table>
                        </div>}
                        <div className="container row">
                            <div className="col-md-1"></div>
                            <div className="col-md-3">
                                <Dropzone onDrop={this.onFileDrop.bind(this)}>
                                    {({ getRootProps, getInputProps }) => (
                                        <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                            <div className="col-md-8">
                                <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />
                            </div>


                        </div>
                        <div className="container mt-3 mb-3">

                            <button type="submit"
                                className="Button--secondary float-right mt-2"
                                disabled={issoCondition}
                                style={{ marginRight: "5px" }}
                                onClick={this.onSubmit.bind(this, 'PENDING_DRAFT')}>
                                Save As Draft
                            </button>
                        </div>
                        <div className="container mt-3 mb-3">
                            <button type="submit"
                                className="Button--secondary float-right mt-2"
                                disabled={this.checkDisable() || issoCondition}
                                style={{ marginRight: "5px" }}
                                onClick={this.onSubmit.bind(this, 'COMPLETED')}>
                                Mark As Complete
                            </button>
                        </div>
                    </div>}
                </div>
            )
        }
        else {
            return (
                <div className="container-fluid">
                    {this.state.pageLoading ? this.renderLoading() : (
                        <div className="container-fluid">
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
                                                <SiteInformation notifref={this.props.notifref} siteUnid={this.props.PMDetails.PM_ITEM_UNID} />
                                            </div>
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                                <br />
                            </div>
                            {this.state.noRecErr && <h4 className="text-danger text-center">No Records Found</h4>}

                            <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                                <tbody className="vzwtable text-center">
                                    {!!this.state.towerAttributeData && this.state.towerAttributeData.length > 0 && this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == 'Verizon Feedback') && this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == 'Verizon Feedback').ATTRIBUTE_VALUE && (
                                        <tr colSpan={"4"}>
                                            <td className="Form-group no-border" colSpan="4" ><h4>{this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == 'Verizon Feedback').ATTRIBUTE_NAME}</h4></td>
                                            <td className="Form-group no-border" colSpan="4" >
                                                {this.state.towerAttributeData.find(v => v.ATTRIBUTE_NAME == 'Verizon Feedback').ATTRIBUTE_VALUE}
                                            </td>
                                            <td className="Form-group no-border" colSpan="4" >

                                            </td>
                                        </tr>

                                    )}

                                    {!!this.state.attchmnts.length > 0 && (
                                        <tr colSpan={"4"}>
                                            <td className="Form-group no-border" colSpan="4" ><h4>PM Report</h4></td>
                                            <td className="Form-group no-border" colSpan="4" > <ul>

                                                {this.state.attchmnts.filter(v => v.PM_FILE_TYPE && v.PM_FILE_TYPE.toLowerCase() == 'pdf' && v.PM_FILE_NAME.includes('HvacPMReport')).map(ad => (<li
                                                    onClick={this.downloadAttachments.bind(this, ad.PM_ATTACHMENTS_ID, ad.PM_LIST_ITEM_ID, ad.PM_LIST_ID)} style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.PM_FILE_NAME}.${ad.PM_FILE_TYPE}`}</b></li>))}
                                            </ul>

                                            </td>
                                            <td className="Form-group no-border" colSpan="4" >

                                            </td>
                                        </tr>

                                    )}




                                    {!!this.state.attchmnts.length > 0 && (

                                        <tr colSpan={"4"}>
                                            <td className="Form-group no-border" colSpan="4" ><h4>Attachments</h4></td>
                                            <td className="Form-group no-border" colSpan="4" > <ul>{this.state.attchmnts.filter(v => v.PM_FILE_TYPE && !['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(v.PM_FILE_TYPE.toLowerCase()) && !v.PM_FILE_NAME.includes('HvacPMReport')).map(ad => (
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
                        </div>

                    )}



                    {
                        <div className="pt-3 row">
                            <div className="col-md-4">
                                <Dropzone onDrop={this.onFileDrop.bind(this)}>
                                    {({ getRootProps, getInputProps }) => (
                                        <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                            <div className="col-md-4">
                                <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />
                            </div>
                            <div className="col-md-4">
                                <button type="submit"
                                    className="Button--secondary float-right mt-2"
                                    disabled={this.state.filesData.length == 0 || issoCondition}
                                    style={{ marginRight: "5px" }}
                                    onClick={this.onReSubmit.bind(this)}>
                                    Re-upload
                                </button>

                            </div>

                        </div>
                    }
                    {this.state.attchmnts.filter(v => v.PM_FILE_TYPE && v.PM_FILE_TYPE.toLowerCase() == 'pdf' && v.PM_FILE_NAME.includes('HvacPMReport')).length == 0 && <div className="text-center mt-3" style={{ display: 'flex', flexDirection: 'row-reverse' }}><b style={{ cursor: "pointer", color: "blue" }} onClick={this.generatePDFOndemand.bind(this)} >Generate Inspection Result</b></div>}
                </div>
            )
        }

    }
}
function stateToProps(state, ownProps) {

    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
    let vendorId = user.toJS().vendor_id
    let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
    let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
    const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
    const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
    let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
    let isssouser = realUser ? realUser.get('isssouser') : ''

    let vendorName = user.toJS().vendor_name
    let config= state.getIn(['Users', 'configData', 'configData'], List()).toJS()

    return {
        user,
        loginId,
        vendorId,
        market,
        submarket,
        vendorName,
        realLoginId,
        realUser,
        ssoUrl,
        isssouser,
        invoiceOosVendor : config.invoiceOosVendor || 'N'
    }

}
export default connect(stateToProps, { ...pmActions, ivrEmailNotify })(DynamicHvacPm)