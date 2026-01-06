import React, { Component } from "react"
import { connect } from "react-redux"
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import Loader from '../../Layout/components/Loader'
import { Picky } from 'react-picky';
import 'react-picky/dist/picky.css';
import Checkbox from '@material-ui/core/Checkbox';
import Dropzone from 'react-dropzone'
import ListOfFiles from './ListOfFiles'
import { SingleDatePicker } from 'react-dates'
import moment from 'moment'
import Select from 'react-select'
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils.js'
import MessageBox from '../../Forms/components/MessageBox'


class GO95InspectionResult extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            groups: null,
            activeGroup: {},
            commentsVendor: '',
            pageLoading: false,
            attachLoading: false,
            techName: '',
            showSummary: false,
            currentIndex: 0,
            showmsg: false,
            go95InfoDev: [],
            go95completedInfo: props.go95completedInfo,
            visibledeviationsList: [],
            filesData: [],
            fileSizeError: false,
            drpdwnOptions: [{ value: '1', label: '1', isFixed: true }, { value: '2', label: '2', isFixed: true }, { value: '3', label: '3', isFixed: true }],
            inspectionDate: moment(),
            inspectionDateFocused: null,
            opsUnid: '',
            showLog: false,
            auditDetails: []


        }
        this.aList = List()
        this.formGroups = this.formGroups.bind(this)
        this.getPoleInfo = this.getPoleInfo.bind(this)
        this.filterActiveDeviation = this.filterActiveDeviation.bind(this)
        this.reUpload = this.reUpload.bind(this)
    }

    componentDidMount() {
        this.reviewFilter

        this.getPoleInfo()


    }
    formDefaultForDraft = () => {
        const inspectionDate = this.props.go95completedInfo.length > 0 && !!this.props.go95completedInfo[0].INSP_COMPLETION_DATE ? moment(this.props.go95completedInfo[0].INSP_COMPLETION_DATE) : ''
        const techName = this.props.go95completedInfo.length > 0 && !!this.props.go95completedInfo[0].INSP_TECH ? this.props.go95completedInfo[0].INSP_TECH : ''
        const commentsVendor = this.props.go95completedInfo.length > 0 && !!this.props.go95completedInfo[0].INSP_COMMENTS ? this.props.go95completedInfo[0].INSP_COMMENTS : ''
        var oldgo95InfoDev = this.props.go95InfoDev.map(val => {
            if (this.props.go95completedInfo.find(gci => gci.DEVIATION_ID == val.DEVIATION_ID)) {
                var cuurentItem = this.props.go95completedInfo.find(gci => gci.DEVIATION_ID == val.DEVIATION_ID)
                return {
                    ...val,
                    itemSelected: true,
                    currValues: !!cuurentItem.OTHER_DEVIATION_OWNERS ? cuurentItem.OTHER_DEVIATION_OWNERS.split(',').map(inval => ({ label: inval, value: inval })) : [],
                    REMEDIATION_LEVEL: { label: cuurentItem.REMEDIATION_LEVEL, value: cuurentItem.REMEDIATION_LEVEL, isFixed: true },
                    DEVIATION_LABEL: this.props.selectedGO95.PM_ITEM_STATUS === 'PENDING_DRAFT' && cuurentItem.DEVIATION_NAME.includes('Additional deviation - ') ? cuurentItem.DEVIATION_NAME.split('Additional deviation - ')[1] : cuurentItem.DEVIATION_NAME
                }
            }
            else {
                return val
            }
        })
        const opsUnid = this.props.go95completedInfo.length > 0 && !!this.props.go95completedInfo[0].OPSTRCK_INSP_UNID ? this.props.go95completedInfo[0].OPSTRCK_INSP_UNID : ''
        this.setState({ inspectionDate, opsUnid, techName, commentsVendor }, () => this.disableAllDevs(oldgo95InfoDev))
    }
    async getPoleInfo() {
        const { fetchGO95PoleInfo, submarket, vendorId, loginId, selectedGO95 } = this.props
        this.setState({ pageLoading: true })
        await fetchGO95PoleInfo(loginId, vendorId, submarket, this.props.selectedGO95.EQUIPMENT_UNID, this.props.selectedGO95.PM_LIST_ITEM_ID, this.props.selectedGO95.PM_LIST_ID).then(async action => {

            if (action.type === 'FETCH_GO95POLEINFO_SUCCESS') {
                if (this.props.selectedGO95.PM_ITEM_STATUS === 'PENDING_DRAFT')
                    await this.formDefaultForDraft()
                else
                    this.setState({ go95InfoDev: this.props.go95InfoDev, go95completedInfo: this.props.go95completedInfo })
            }
        })

        //this.formDefaultOwners()
        this.formGroups()
        this.setState({ pageLoading: false })
    }

    async formGroups() {

        const uniqueGroups = this.props.go95InfoDev.map(val => val.INSP_GROUP).reduce((unique, item) => {
            return unique.includes(item) ? unique : [...unique, item]
        }, [])
        var groups = uniqueGroups.map((uval, index) => ({
            groupName: uval,
            groupIndex: index
        }))

        await this.setState({ groups, activeGroup: groups[0], currentIndex: 0 }, () => this.filterActiveDeviation())
        return;

    }
    renderLoading = () => {
        return (
            <Loader color="#cd040b"
                size="75px"
                margin="4px"
                className="text-center" />
        )
    }
    async filterActiveDeviation() {

        const elemList = Array.from(document.querySelectorAll('.section-class'))

        elemList.forEach(elem => {


            elem.classList.remove('active-div')


        })
        elemList.forEach(elem => {

            if (elem.id === this.state.activeGroup.groupName) {
                elem.classList.remove('disable-div')
                elem.classList.add('active-div')
            }
        })


        const visibledeviationsList = this.state.go95InfoDev.filter(val => !!val.INSP_GROUP && val.INSP_GROUP === this.state.activeGroup.groupName)
        await this.setState({ visibledeviationsList })
    }

    handleNextClick = () => {
        const currentIndex = this.state.currentIndex + 1

        this.setState({ currentIndex, activeGroup: this.state.groups[currentIndex] }, () => this.filterActiveDeviation())
    }

    handlePrevClick = () => {
        const currentIndex = this.state.currentIndex - 1
        this.setState({ currentIndex, activeGroup: this.state.groups[currentIndex] }, () => this.filterActiveDeviation())
    }

    handleGrpClick = (grpName) => {
        const currentIndex = this.state.groups.find(val => val.groupName === grpName).groupIndex
        this.setState({ currentIndex, activeGroup: this.state.groups[currentIndex] }, () => this.filterActiveDeviation())
    }


    handleDrpDwnChge = (currDev, e) => {
        const go95InfoDev = this.state.go95InfoDev.map(val => {
            if (val.DEVIATION_ID === currDev.DEVIATION_ID) {
                return {
                    ...val,
                    currValues: e
                }
            }
            else {
                return val
            }
        })
        this.setState({ go95InfoDev }, () => this.filterActiveDeviation())
    }
    handleDrpDwnChgeRmdStatus = (currDev, e) => {
        const go95completedInfo = this.state.go95completedInfo.map(val => {
            if (val.DEVIATION_ID === currDev.DEVIATION_ID) {
                return {
                    ...val,
                    rmdStatusCurVal: e
                }
            }
            else {
                return val
            }
        })
        this.setState({ go95completedInfo })
    }
    handleDrpDwnChgeCmpltd = (currDev, e) => {
        const go95completedInfo = this.state.go95completedInfo.map(val => {
            if (val.DEVIATION_ID === currDev.DEVIATION_ID) {
                return {
                    ...val,
                    currValues: e

                }
            }
            else {
                return val
            }
        })
        this.setState({ go95completedInfo })
    }
    handleCheckBoxChangeCmpltd = (currDev, e) => {


        var go95completedInfo = this.state.go95completedInfo.map(val => {
            if (val.DEVIATION_ID === currDev.DEVIATION_ID) {
                return {
                    ...val,
                    itemSelected: e.target.checked,

                }
            }

            else {
                return val
            }

        })
        this.setState({ go95completedInfo })

    }
    handleCheckBoxChange = (currDev, e) => {


        var oldgo95InfoDev = this.state.go95InfoDev.map(val => {
            if (val.DEVIATION_ID === currDev.DEVIATION_ID) {
                return {
                    ...val,
                    itemSelected: e.target.checked,
                    currValues: e.target.checked ? currDev.currValues : []
                }
            }

            else {
                return val
            }

        })
        this.disableAllDevs(oldgo95InfoDev)
        // this.setState({go95InfoDev}, () => this.disableRemaining())
    }
    disableAllDevs = (oldgo95InfoDev) => {

        var go95InfoDev = oldgo95InfoDev
        if (oldgo95InfoDev.filter(val => val.DEVIATION_ID == 1 && !!val.itemSelected).length > 0) {
            go95InfoDev = oldgo95InfoDev.map(inval => {
                if (inval.DEVIATION_ID == 1) {
                    return {
                        ...inval,
                        disableDev: false
                    }
                }

                else {
                    return {
                        ...inval,
                        itemSelected: false,
                        currValues: [],
                        disableDev: true
                    }
                }
            })
        }
        else {
            go95InfoDev = oldgo95InfoDev.map(val => ({ ...val, disableDev: false }))
        }
        let showmsg = !!go95InfoDev.find(inval => inval.DEVIATION_ID == 58 && !!inval.itemSelected && (inval.DEVIATION_LABEL.trim() == 'Other' || inval.DEVIATION_LABEL.trim() == ''))
        this.setState({ go95InfoDev, showmsg }, () => this.filterActiveDeviation())
    }
    onAttachRemove(index) {
        this.aList = this.aList.remove(index)
        if (this.aList.size < 1) {
            this.setState({ fileSizeError: false })
        }
        if (this.aList.size > 0) {
            let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
            if (totalFileSize > 24500000) {
                this.setState({ fileSizeError: true })
            }
            if (totalFileSize < 24500000) {
                this.setState({ fileSizeError: false })
            }
        }
        this.setState({
            filesData: this.state.filesData.filter((_, i) => i !== index)
        })
        this.forceUpdate()
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
                    this.aList = this.aList.set(this.aList.size, droppedFile)
                    if (this.aList.size > 0) {
                        let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
                        if (totalFileSize > 24500000) {
                            this.setState({ fileSizeError: true })
                        }
                        if (totalFileSize < 24500000) {
                            this.setState({ fileSizeError: false })
                        }
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
    getunChekedDev = () => {
        let deviationIds = this.props.go95completedInfo.length > 0 ? this.props.go95completedInfo.map(val => val.DEVIATION_ID.toString()) : []

        return this.state.go95InfoDev.filter(val => !val.itemSelected && deviationIds.includes(val.DEVIATION_ID.toString())).length > 0 ? this.state.go95InfoDev.filter(val => !val.itemSelected && deviationIds.includes(val.DEVIATION_ID.toString())).map(val => val.DEVIATION_ID.toString()).join(',') : ''
    }
    formPostRequest = (subAction) => {
        const { selectedGO95, PMDetails, loginId, vendorId } = this.props
        if (subAction == 'PENDING_DRAFT') {
            var reqBodyDraft = this.state.opsUnid ? {
                "updatedData": {
                    "inspectionResult": [
                        {
                            "PM_LIST_ID": Number(selectedGO95.PM_LIST_ID),
                            "PM_LIST_ITEM_ID": Number(selectedGO95.PM_LIST_ITEM_ID),
                            "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                            "INSPECTION_UNID": null,
                            "INSP_TYP": !!selectedGO95.INSPECTION_TYPE ? selectedGO95.INSPECTION_TYPE : '',
                            "INSP_STATUS": subAction, // existing sites call
                            "INSP_COMPLETION_DATE": moment(this.state.inspectionDate).format('DD/MM/YYYY'),
                            "INSP_TECH": !!this.state.techName ? this.state.techName : '',
                            "INSP_VENDOR_ID": vendorId.toString(),
                            "INSP_COMMENTS": !!this.state.commentsVendor ? this.state.commentsVendor : '',
                            "DEVIATION_FOUND": this.state.go95InfoDev.filter(val => val.DEVIATION_ID == 1 && !!val.itemSelected).length == 0 ? "Y" : "N", //need to discuss
                            "LAST_UPDATED_BY": loginId,
                            "RMV_DEVIATIONS": this.getunChekedDev()
                        }
                    ],
                    "deviationResult": this.state.go95InfoDev.filter(val => !!val.itemSelected).map(val => {

                        return {
                            "INSPECTION_UNID": null,
                            "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                            "DEVIATION_ID": Number(val.DEVIATION_ID),
                            "DEVIATION_NAME": val.DEVIATION_ID == 58 ? 'Additional deviation - ' + val.DEVIATION_LABEL : val.DEVIATION_LABEL,
                            "DEVIATION_OWNBYVZ": val.currValues.length > 0 && val.currValues.filter(inval => inval.value === 'VZW' || inval.value === 'VZB').length > 0 ? 'Y' : 'N',
                            "DEVIATION_STATUS": "", // blank pending/awaiting
                            "OTHER_DEVIATION_OWNERS": val.currValues.length > 0 ? val.currValues.map(inval => inval.value).join(',') : '',
                            "REMEDIATION_LEVEL": Number(val.REMEDIATION_LEVEL.value),
                            "DEVIATION_COMMENTS": "",
                            "REMEDIATION": val.REMEDIATION,
                            "REMEDIATION_STATUS": "",
                            "REMEDIATION_COMMENTS": '',
                            "REMEDIATION_ACCPT": '',
                            "REMEDIATION_ACCPT_BY": '',
                            "REMEDIATION_ACCPT_DATE": '',
                            "LAST_UPDATED_BY": loginId
                        }
                    }),


                },
                "opsTrackerCreateReqBody": null,
                "opsTrackerUpdateReqBody": {
                    "meta_universalid": this.state.opsUnid ? this.state.opsUnid : '',
                    "recordtype": "c2poleinspection",
                    "retrieve": "*",
                    "retrieveformat": "simple",
                    "data": {
                        "status": "COMPLETED",
                        "notes": !!this.state.commentsVendor ? this.state.commentsVendor : '',
                        "cfd_deviations": [],
                    }
                },
                "opsTrackerBulkUpdateReqBody": null,
            } : {
                "updatedData": {
                    "inspectionResult": [
                        {
                            "PM_LIST_ID": Number(selectedGO95.PM_LIST_ID),
                            "PM_LIST_ITEM_ID": Number(selectedGO95.PM_LIST_ITEM_ID),
                            "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                            "INSPECTION_UNID": null,
                            "INSP_TYP": !!selectedGO95.INSPECTION_TYPE ? selectedGO95.INSPECTION_TYPE : '',
                            "INSP_STATUS": subAction, // existing sites call
                            "INSP_COMPLETION_DATE": moment(this.state.inspectionDate).format('DD/MM/YYYY'),
                            "INSP_TECH": !!this.state.techName ? this.state.techName : '',
                            "INSP_VENDOR_ID": vendorId.toString(),
                            "INSP_COMMENTS": !!this.state.commentsVendor ? this.state.commentsVendor : '',
                            "DEVIATION_FOUND": this.state.go95InfoDev.filter(val => val.DEVIATION_ID == 1 && !!val.itemSelected).length == 0 ? "Y" : "N", //need to discuss
                            "LAST_UPDATED_BY": loginId,
                            "RMV_DEVIATIONS": this.getunChekedDev()
                        }
                    ],
                    "deviationResult": this.state.go95InfoDev.filter(val => !!val.itemSelected).map(val => {

                        return {
                            "INSPECTION_UNID": null,
                            "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                            "DEVIATION_ID": Number(val.DEVIATION_ID),
                            "DEVIATION_NAME": val.DEVIATION_ID == 58 ? 'Additional deviation - ' + val.DEVIATION_LABEL : val.DEVIATION_LABEL,
                            "DEVIATION_OWNBYVZ": val.currValues.length > 0 && val.currValues.filter(inval => inval.value === 'VZW' || inval.value === 'VZB').length > 0 ? 'Y' : 'N',
                            "DEVIATION_STATUS": "", // blank pending/awaiting
                            "OTHER_DEVIATION_OWNERS": val.currValues.length > 0 ? val.currValues.map(inval => inval.value).join(',') : '',
                            "REMEDIATION_LEVEL": Number(val.REMEDIATION_LEVEL.value),
                            "DEVIATION_COMMENTS": "",
                            "REMEDIATION": val.REMEDIATION,
                            "REMEDIATION_STATUS": "",
                            "REMEDIATION_COMMENTS": '',
                            "REMEDIATION_ACCPT": '',
                            "REMEDIATION_ACCPT_BY": '',
                            "REMEDIATION_ACCPT_DATE": '',
                            "LAST_UPDATED_BY": loginId
                        }
                    }),


                },
                "opsTrackerCreateReqBody": {
                    "recordtype": "c2poleinspection",
                    "retrieve": "*",
                    "retrieveformat": "simple",
                    "data": {
                        "pole_unid": selectedGO95.EQUIPMENT_UNID,
                        "status": "COMPLETED",
                        "po_num": selectedGO95.PO_NUM,
                        "inspection_type": !!selectedGO95.INSPECTION_TYPE ? selectedGO95.INSPECTION_TYPE : '',
                        "inspection_date": moment(this.state.inspectionDate, 'DD/MM/YYYY').format('YYYY-MM-DD hh:mm A'),
                        "inspection_tech_name": !!this.state.techName ? this.state.techName : '',
                        "vendor_id": vendorId.toString(),
                        "deviations_found": this.state.go95InfoDev.filter(val => val.DEVIATION_ID == 1 && !!val.itemSelected).length == 0 ? "1" : "0",
                        "pole_latitude": !!this.props.go95PoleData.SITE_LATITUDE ? this.props.go95PoleData.SITE_LATITUDE : '',
                        "pole_longitude": !!this.props.go95PoleData.SITE_LONGITITUDE ? this.props.go95PoleData.SITE_LONGITITUDE : '',
                        "notes": !!this.state.commentsVendor ? this.state.commentsVendor : '',
                        "cfd_deviations": []
                    }
                }
                ,
                "opsTrackerUpdateReqBody": null,
                "opsTrackerBulkUpdateReqBody": null,
            }

            return reqBodyDraft
        }
        else if (subAction == 'COMPLETED') {
            var resBodyCompleted = this.state.opsUnid ?
                {
                    "updatedData": {
                        "inspectionResult": [
                            {
                                "PM_LIST_ID": Number(selectedGO95.PM_LIST_ID),
                                "PM_LIST_ITEM_ID": Number(selectedGO95.PM_LIST_ITEM_ID),
                                "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                                "INSPECTION_UNID": null,
                                "INSP_TYP": !!selectedGO95.INSPECTION_TYPE ? selectedGO95.INSPECTION_TYPE : '',
                                "INSP_STATUS": subAction, // existing sites call
                                "INSP_COMPLETION_DATE": moment(this.state.inspectionDate).format('DD/MM/YYYY'),
                                "INSP_TECH": !!this.state.techName ? this.state.techName : '',
                                "INSP_VENDOR_ID": vendorId.toString(),
                                "INSP_COMMENTS": !!this.state.commentsVendor ? this.state.commentsVendor : '',
                                "DEVIATION_FOUND": this.state.go95InfoDev.filter(val => val.DEVIATION_ID == 1 && !!val.itemSelected).length == 0 ? "Y" : "N", //need to discuss
                                "LAST_UPDATED_BY": loginId,
                                "RMV_DEVIATIONS": ""
                            }
                        ],
                        "deviationResult": this.state.go95InfoDev.filter(val => !!val.itemSelected).map(val => {

                            return {
                                "INSPECTION_UNID": null,
                                "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                                "DEVIATION_ID": Number(val.DEVIATION_ID),
                                "DEVIATION_NAME": val.DEVIATION_ID == 58 ? 'Additional deviation - ' + val.DEVIATION_LABEL : val.DEVIATION_LABEL,
                                "DEVIATION_OWNBYVZ": val.currValues.length > 0 && val.currValues.filter(inval => inval.value === 'VZW' || inval.value === 'VZB').length > 0 ? 'Y' : 'N',
                                "DEVIATION_STATUS": "", // blank pending/awaiting
                                "OTHER_DEVIATION_OWNERS": val.currValues.length > 0 ? val.currValues.map(inval => inval.value).join(',') : '',
                                "REMEDIATION_LEVEL": Number(val.REMEDIATION_LEVEL.value),
                                "DEVIATION_COMMENTS": "",
                                "REMEDIATION": val.REMEDIATION,
                                "REMEDIATION_STATUS": "",
                                "REMEDIATION_COMMENTS": '',
                                "REMEDIATION_ACCPT": '',
                                "REMEDIATION_ACCPT_BY": '',
                                "REMEDIATION_ACCPT_DATE": '',
                                "LAST_UPDATED_BY": loginId
                            }
                        }),


                    },
                    "opsTrackerCreateReqBody": null,

                    "opsTrackerUpdateReqBody": {
                        "meta_universalid": this.state.opsUnid ? this.state.opsUnid : '',
                        "recordtype": "c2poleinspection",
                        "retrieve": "*",
                        "retrieveformat": "simple",
                        "data": {
                            "status": "COMPLETED",
                            "notes": !!this.state.commentsVendor ? this.state.commentsVendor : '',
                            "cfd_deviations": this.state.go95InfoDev.filter(val => !!val.itemSelected).map(val => {

                                return {
                                    "deviation": val.DEVIATION_ID == 58 ? 'Additional deviation - ' + val.DEVIATION_LABEL : val.DEVIATION_LABEL,
                                    "deviation_owners": val.currValues.length > 0 ? val.currValues.map(inval => inval.value).join(',') : '',
                                    "deviation_status": "",
                                    "deviation_comments": "",
                                    "remediation_level": Number(val.REMEDIATION_LEVEL.value),
                                    "remediation": val.REMEDIATION,
                                    "remediation_complete_date": "",
                                    "remediation_status": "",
                                    "remediation_comments": "",
                                    "remediation_accepted_date": "",
                                    "remediation_accepted_by": ""

                                }
                            }),
                        }
                    },
                    "opsTrackerBulkUpdateReqBody": null
                } : {
                    "updatedData": {
                        "inspectionResult": [
                            {
                                "PM_LIST_ID": Number(selectedGO95.PM_LIST_ID),
                                "PM_LIST_ITEM_ID": Number(selectedGO95.PM_LIST_ITEM_ID),
                                "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                                "INSPECTION_UNID": null,
                                "INSP_TYP": !!selectedGO95.INSPECTION_TYPE ? selectedGO95.INSPECTION_TYPE : '',
                                "INSP_STATUS": subAction, // existing sites call
                                "INSP_COMPLETION_DATE": moment(this.state.inspectionDate).format('DD/MM/YYYY'),
                                "INSP_TECH": !!this.state.techName ? this.state.techName : '',
                                "INSP_VENDOR_ID": vendorId.toString(),
                                "INSP_COMMENTS": !!this.state.commentsVendor ? this.state.commentsVendor : '',
                                "DEVIATION_FOUND": this.state.go95InfoDev.filter(val => val.DEVIATION_ID == 1 && !!val.itemSelected).length == 0 ? "Y" : "N", //need to discuss
                                "LAST_UPDATED_BY": loginId,
                                "RMV_DEVIATIONS": ""
                            }
                        ],
                        "deviationResult": this.state.go95InfoDev.filter(val => !!val.itemSelected).map(val => {

                            return {
                                "INSPECTION_UNID": null,
                                "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                                "DEVIATION_ID": Number(val.DEVIATION_ID),
                                "DEVIATION_NAME": val.DEVIATION_ID == 58 ? 'Additional deviation - ' + val.DEVIATION_LABEL : val.DEVIATION_LABEL,
                                "DEVIATION_OWNBYVZ": val.currValues.length > 0 && val.currValues.filter(inval => inval.value === 'VZW' || inval.value === 'VZB').length > 0 ? 'Y' : 'N',
                                "DEVIATION_STATUS": "", // blank pending/awaiting
                                "OTHER_DEVIATION_OWNERS": val.currValues.length > 0 ? val.currValues.map(inval => inval.value).join(',') : '',
                                "REMEDIATION_LEVEL": Number(val.REMEDIATION_LEVEL.value),
                                "DEVIATION_COMMENTS": "",
                                "REMEDIATION": val.REMEDIATION,
                                "REMEDIATION_STATUS": "",
                                "REMEDIATION_COMMENTS": '',
                                "REMEDIATION_ACCPT": '',
                                "REMEDIATION_ACCPT_BY": '',
                                "REMEDIATION_ACCPT_DATE": '',
                                "LAST_UPDATED_BY": loginId
                            }
                        }),


                    },
                    "opsTrackerCreateReqBody": {
                        "recordtype": "c2poleinspection",
                        "retrieve": "*",
                        "retrieveformat": "simple",
                        "data": {
                            "pole_unid": selectedGO95.EQUIPMENT_UNID,
                            "status": "COMPLETED",
                            "po_num": selectedGO95.PO_NUM,
                            "inspection_type": !!selectedGO95.INSPECTION_TYPE ? selectedGO95.INSPECTION_TYPE : '',
                            "inspection_date": moment(this.state.inspectionDate, 'DD/MM/YYYY').format('YYYY-MM-DD hh:mm A'),
                            "inspection_tech_name": !!this.state.techName ? this.state.techName : '',
                            "vendor_id": vendorId.toString(),
                            "deviations_found": this.state.go95InfoDev.filter(val => val.DEVIATION_ID == 1 && !!val.itemSelected).length == 0 ? "1" : "0",
                            "pole_latitude": !!this.props.go95PoleData.SITE_LATITUDE ? this.props.go95PoleData.SITE_LATITUDE : '',
                            "pole_longitude": !!this.props.go95PoleData.SITE_LONGITITUDE ? this.props.go95PoleData.SITE_LONGITITUDE : '',
                            "notes": !!this.state.commentsVendor ? this.state.commentsVendor : '',
                            "cfd_deviations": this.state.go95InfoDev.filter(val => !!val.itemSelected).map(val => {

                                return {
                                    "deviation": val.DEVIATION_ID == 58 ? 'Additional deviation - ' + val.DEVIATION_LABEL : val.DEVIATION_LABEL,
                                    "deviation_owners": val.currValues.length > 0 ? val.currValues.map(inval => inval.value).join(',') : '',
                                    "deviation_status": "",
                                    "deviation_comments": "",
                                    "remediation_level": Number(val.REMEDIATION_LEVEL.value),
                                    "remediation": val.REMEDIATION,
                                    "remediation_complete_date": "",
                                    "remediation_status": "",
                                    "remediation_comments": "",
                                    "remediation_accepted_date": "",
                                    "remediation_accepted_by": ""
                                }
                            })
                        }
                    },

                    "opsTrackerUpdateReqBody": null,
                    "opsTrackerBulkUpdateReqBody": null
                }

            return resBodyCompleted
        }
        else {

            return {
                "updatedData": {
                    "inspectionResult": [
                        {
                            "PM_LIST_ID": Number(selectedGO95.PM_LIST_ID),
                            "PM_LIST_ITEM_ID": Number(selectedGO95.PM_LIST_ITEM_ID),
                            "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                            "INSPECTION_UNID": !!this.state.go95completedInfo[0].INSPECTION_UNID ? this.state.go95completedInfo[0].INSPECTION_UNID : '',
                            "INSP_TYP": !!selectedGO95.INSPECTION_TYPE ? selectedGO95.INSPECTION_TYPE : '',
                            "INSP_STATUS": 'COMPLETED', // existing sites call
                            "INSP_COMPLETION_DATE": this.state.go95completedInfo.length > 0 && !!this.state.go95completedInfo[0].INSP_COMPLETION_DATE ? moment(this.state.go95completedInfo[0].INSP_COMPLETION_DATE).format('DD/MM/YYYY') : '',
                            "INSP_TECH": this.state.go95completedInfo.length > 0 && !!this.state.go95completedInfo[0].INSP_TECH ? this.state.go95completedInfo[0].INSP_TECH : '',
                            "INSP_VENDOR_ID": vendorId.toString(),
                            "INSP_COMMENTS": this.state.go95completedInfo.length > 0 && !!this.state.go95completedInfo[0].INSP_COMMENTS ? this.state.go95completedInfo[0].INSP_COMMENTS : '',
                            "DEVIATION_FOUND": this.state.go95completedInfo.filter(val => val.DEVIATION_ID == 1 && !!val.itemSelected).length == 0 ? "Y" : "N", //need to discuss
                            "LAST_UPDATED_BY": loginId,
                            "RMV_DEVIATIONS": ""
                        }
                    ],
                    "deviationResult": this.state.go95completedInfo.filter(val => !!val.itemSelected).map(val => {

                        return {
                            "INSPECTION_UNID": val.INSPECTION_UNID ? val.INSPECTION_UNID : '',
                            "POLE_UNID": selectedGO95.EQUIPMENT_UNID,
                            "DEVIATION_ID": Number(val.DEVIATION_ID),
                            "DEVIATION_NAME": val.DEVIATION_NAME ? val.DEVIATION_NAME : '',
                            "DEVIATION_OWNBYVZ": val.currValues.length > 0 && val.currValues.filter(inval => inval.value === 'VZW' || inval.value === 'VZB').length > 0 ? 'Y' : 'N',
                            "DEVIATION_STATUS": val.DEVIATION_STATUS && val.DEVIATION_STATUS == 'RETURNED' ? '' : !val.DEVIATION_STATUS ? '' : val.DEVIATION_STATUS,
                            "OTHER_DEVIATION_OWNERS": val.currValues.length > 0 ? val.currValues.map(inval => inval.value).join(',') : '',
                            "REMEDIATION_LEVEL": Number(val.REMEDIATION_LEVEL),
                            "DEVIATION_COMMENTS": val.vendorCommentsDev ? (val.DEVIATION_COMMENTS ? val.DEVIATION_COMMENTS + ',' : '') + 'Vendor Comments - ' + val.vendorCommentsDev : '',
                            "REMEDIATION": val.REMEDIATION,
                            "REMEDIATION_STATUS": val.REMEDIATION_STATUS == 'VENDOR REVIEW' && val.rmdStatusCurVal && val.rmdStatusCurVal.value ? val.rmdStatusCurVal.value : !val.REMEDIATION_STATUS ? '' : val.REMEDIATION_STATUS,
                            "REMEDIATION_COMMENTS": val.vendorCommentsRmd ? (val.REMEDIATION_COMMENTS ? val.REMEDIATION_COMMENTS + ',' : '') + 'Vendor Comments - ' + val.vendorCommentsRmd : '',

                            "REMEDIATION_ACCPT": '',
                            "REMEDIATION_ACCPT_BY": '',
                            "REMEDIATION_ACCPT_DATE": '',
                            "LAST_UPDATED_BY": loginId
                        }
                    }),


                },
                "opsTrackerCreateReqBody": null,
                "opsTrackerUpdateReqBody": {
                    "meta_universalid": this.state.go95completedInfo.length > 0 && !!this.state.go95completedInfo[0].OPSTRCK_INSP_UNID ? this.state.go95completedInfo[0].OPSTRCK_INSP_UNID : '',
                    "recordtype": "c2poleinspection",
                    "retrieve": "*",
                    "retrieveformat": "simple",
                    "data": {
                        "status": "COMPLETED",
                        "notes": this.state.go95completedInfo.length > 0 && !!this.state.go95completedInfo[0].INSP_COMMENTS ? this.state.go95completedInfo[0].INSP_COMMENTS : '',
                        "cfd_deviations": this.state.go95completedInfo.filter(val => !!val.itemSelected).map(val => ({
                            "meta_universalid": val.OPSTRCK_DEVIATION_UNID ? val.OPSTRCK_DEVIATION_UNID : "",
                            "deviation": val.DEVIATION_NAME ? val.DEVIATION_NAME : "",
                            "deviation_owners": val.currValues.length > 0 ? val.currValues.map(inval => inval.value).join(',') : '',
                            "deviation_status": val.DEVIATION_STATUS && val.DEVIATION_STATUS == 'RETURNED' ? '' : !val.DEVIATION_STATUS ? '' : val.DEVIATION_STATUS,
                            "deviation_comments": val.vendorCommentsDev ? (val.DEVIATION_COMMENTS ? val.DEVIATION_COMMENTS + ',' : '') + 'Vendor Comments - ' + val.vendorCommentsDev : '',
                            "remediation_comments": val.vendorCommentsRmd ? (val.REMEDIATION_COMMENTS ? val.REMEDIATION_COMMENTS + ',' : '') + 'Vendor Comments - ' + val.vendorCommentsRmd : '',
                            "remediation_status": val.REMEDIATION_STATUS == 'VENDOR REVIEW' && val.rmdStatusCurVal && val.rmdStatusCurVal.value ? val.rmdStatusCurVal.value : !val.REMEDIATION_STATUS ? '' : val.REMEDIATION_STATUS,

                        }))
                    }
                },

                "opsTrackerBulkUpdateReqBody": null
            }
        }


    }
    formFilesPostRequest = () => {
        const { selectedGO95, PMDetails, loginId } = this.props
        return this.state.filesData.map(fd => {
            let file_name = fd.file_name.split('.')[0]
            let file_type = fd.file_name.split('.')[1]
            return {


                "name": fd.file_name,
                "description": `In description: ${file_name} from vendor portal upload on ${moment().format('MM/DD/YYYY')}`,
                "size": fd.file_size,
                "data": fd.file_data

            }
        })

    }
    async reUpload() {
        this.setState({ attachLoading: true })
        const { vendorId, loginId, uploadFilesGO95, submarket, fetchDraftGridDetails, fetchGO95PoleInfo } = this.props
        const opsUnid = this.state.go95completedInfo.length > 0 && !!this.state.go95completedInfo[0].OPSTRCK_INSP_UNID ? this.state.go95completedInfo[0].OPSTRCK_INSP_UNID : ''
        var filesPostRequest = {
            "files": this.formFilesPostRequest()
        }
        if (this.state.filesData.length > 0) {

            await uploadFilesGO95(vendorId, loginId, opsUnid, filesPostRequest).then(async action => {

                if (action.type === 'UPLOAD_FILES_SUCCESS_GO95') {
                    fetchDraftGridDetails(vendorId, loginId, this.props.selectedGO95.PM_LIST_ID, '', true, false)
                    this.props.notiref.addNotification({
                        title: 'success',
                        position: "br",
                        level: 'success',
                        message: "Attachments uploaded Succesfully"
                    })

                }
                await fetchGO95PoleInfo(loginId, vendorId, submarket, this.props.selectedGO95.EQUIPMENT_UNID, this.props.selectedGO95.PM_LIST_ITEM_ID, this.props.selectedGO95.PM_LIST_ID).then(action => {

                    if (action.type === 'FETCH_GO95POLEINFO_SUCCESS') {

                        this.setState({ filesData: [] })
                    }
                })


            }).catch((error) => {

                if (!!error) {
                    this.props.notiref.addNotification({
                        title: 'error',
                        position: "br",
                        level: 'error',
                        message: "Inspection failed"
                    })
                }
            })
        }
        await this.setState({ attachLoading: false })
    }

    async onSubmit(subAction) {
        this.setState({ pageLoading: true })
        const { vendorId, loginId, submitInspectionInfo, uploadFilesGO95, fetchDraftGridDetails } = this.props
        const submitpostRequest = this.formPostRequest(subAction)
        var filesPostRequest = {
            "files": this.formFilesPostRequest()
        }

        await submitInspectionInfo(vendorId, loginId, this.props.selectedGO95.PM_LIST_ITEM_ID, submitpostRequest).then(action => {

            if (action.type === 'SUBMIT_GO95INFO_SUCCESS') {
                let opsUnid = this.state.opsUnid ? this.state.opsUnid : !!action.submitInspectionInfoStatus.opstrackerResponse && !!action.submitInspectionInfoStatus.opstrackerResponse.meta_universalid ? action.submitInspectionInfoStatus.opstrackerResponse.meta_universalid : ''


                if (subAction == 'PENDING_DRAFT') {
                    this.props.handleHideModalGO95()
                    fetchDraftGridDetails(vendorId, loginId, this.props.selectedGO95.PM_LIST_ID, '', true, false)
                    this.props.notiref.addNotification({
                        title: 'success',
                        position: "br",
                        level: 'success',
                        message: "Draft saved Succesfully"
                    })
                }
                if (subAction == 'COMPLETED') {
                    this.props.handleHideModalGO95()
                    fetchDraftGridDetails(vendorId, loginId, this.props.selectedGO95.PM_LIST_ID, '', true, false)
                    this.props.notiref.addNotification({
                        title: 'success',
                        position: "br",
                        level: 'success',
                        message: "Inspection completion Succesful"
                    })
                }
                if (subAction == 'RESUBMIT') {
                    this.props.handleHideModalGO95()
                    fetchDraftGridDetails(vendorId, loginId, this.props.selectedGO95.PM_LIST_ID, '', true, false)
                    this.props.notiref.addNotification({
                        title: 'success',
                        position: "br",
                        level: 'success',
                        message: "Deviations updated succesfully"
                    })
                }


                if (this.state.filesData.length > 0) {

                    uploadFilesGO95(vendorId, loginId, opsUnid, filesPostRequest).then((action) => {

                        if (action.type === 'UPLOAD_FILES_SUCCESS_GO95') {
                            this.props.handleHideModalGO95()
                            fetchDraftGridDetails(vendorId, loginId, this.props.selectedGO95.PM_LIST_ID, '', true, false)
                            this.props.notiref.addNotification({
                                title: 'success',
                                position: "br",
                                level: 'success',
                                message: "Attachments uploaded Succesfully"
                            })

                        }

                    }).catch((error) => {

                        if (!!error) {
                            this.props.notiref.addNotification({
                                title: 'error',
                                position: "br",
                                level: 'error',
                                message: "Inspection failed"
                            })
                        }
                    })
                }
            }
        }).catch((error) => {

            if (!!error) {
                this.props.notiref.addNotification({
                    title: 'error',
                    position: "br",
                    level: 'error',
                    message: "Something went wrong please try again later"
                })
            }
        })

        this.setState({ pageLoading: false })
    }
    checkDisableDraft = () => {
        const elemList = Array.from(document.getElementsByClassName('disable-div'))

        if (this.state.fileSizeError || !!this.state.showmsg || this.state.go95InfoDev.filter(val => !!val.itemSelected).length === 0) {
            return true
        }
        else {
            return false
        }
    }
    checkDisableCmpld = () => {


        if (this.state.go95completedInfo.filter(val => !!val.itemSelected).length === 0 || this.state.go95completedInfo.filter(val => (!!val.itemSelected && val.rmdStatusCurVal && val.rmdStatusCurVal.value == 'VENDOR DECLINED' && !val.vendorCommentsRmd) || (!!val.itemSelected && !val.rmdStatusCurVal && val.REMEDIATION_STATUS == 'VENDOR REVIEW')).length > 0) {
            return true
        }
        else {
            return false
        }
    }
    checkDisable = () => {
        const elemList = Array.from(document.getElementsByClassName('disable-div'))
        const elemlist1 = Array.from(document.getElementsByClassName('section-class'))
        if (this.state.fileSizeError || !!this.state.showmsg || ((elemList.length > 0 || elemlist1.length == 0 || this.state.go95InfoDev.filter(val => !!val.itemSelected).length === 0)) || (this.state.filesData.length === 0 && this.props.attachmentList == 0) || !this.state.techName || this.state.go95InfoDev.filter(val => !!val.itemSelected && val.DEVIATION_ID !== '1').some(val => val.currValues.length == 0)) {
            return true
        }
        else {
            return false
        }
    }


    handleOtherChange = (curVal, e) => {
        const go95InfoDev = this.state.go95InfoDev.map(val => {
            if (curVal.DEVIATION_ID === val.DEVIATION_ID) {
                return {
                    ...val,
                    DEVIATION_LABEL: e.target.value
                }
            }
            else {
                return val
            }
        })
        const showmsg = e.target.value == 'Other' || e.target.value == '' ? true : false
        this.setState({ go95InfoDev, showmsg })
    }
    async handleDropdownChange(curVal, e) {

        const go95InfoDev = this.state.go95InfoDev.map(val => {
            if (curVal.DEVIATION_ID == val.DEVIATION_ID) {
                return {
                    ...val,
                    REMEDIATION_LEVEL: e
                }
            }
            else {
                return val
            }
        })
        this.setState({ go95InfoDev }, () => this.filterActiveDeviation())
    }
    handleViewSummary = () => {
        this.setState({ showSummary: !this.state.showSummary })
    }
    downloadAttachments = (currentAtt) => {

        let fileName = currentAtt.file_name
        let unid = !!currentAtt.source_universalid ? currentAtt.source_universalid : ''
        const { loginId, vendorId, fetchFileDataGO95 } = this.props
        fetchFileDataGO95(loginId, vendorId, fileName, unid).then(action => {
            if (action.type == "FETCH_FILE_DETAILSGO95_SUCCESS" && action.fileDetailsgo95 && action.fileDetailsgo95.getFileDataForGO95 && action.fileDetailsgo95.getFileDataForGO95.data) {

                let blob = dataURItoBlob(action.fileDetailsgo95.getFileDataForGO95.data)

                startDownload(blob, `${fileName}`)
            }
        })
    }
    handleChangeCommentsRmd = (inval, e) => {
        let go95completedInfo = this.state.go95completedInfo.map(cv => {

            if (cv.DEVIATION_ID == inval.DEVIATION_ID) {

                return {
                    ...cv,
                    vendorCommentsRmd: e.target.value
                }
            }
            else {

                return cv
            }
        })

        this.setState({ go95completedInfo })
    }
    handleChangeCommentsDev = (inval, e) => {
        let go95completedInfo = this.state.go95completedInfo.map(cv => {

            if (cv.DEVIATION_ID == inval.DEVIATION_ID) {

                return {
                    ...cv,
                    vendorCommentsDev: e.target.value
                }
            }
            else {

                return cv
            }
        })

        this.setState({ go95completedInfo })
    }
    async handleLogClick() {
        const { vendorId, loginId, fetchAuditDetails, selectedGO95 } = this.props
        await this.setState({ showLog: !this.state.showLog })
        if (this.state.showLog) {
            await fetchAuditDetails(vendorId, loginId, selectedGO95.PM_LIST_ITEM_ID).then(action => {
                if (action.type == "FETCH_AUDITDETAILS_SUCCESS")
                    this.setState({ auditDetails: action.auditDetails.auditLogs })
            })
        }

    }
    render() {

        const customStyles = {
            control: base => ({
                ...base,
                height: 30,
                minHeight: 30
            })
        };
        this.reviewFilter = (this.state.go95completedInfo.filter(val => (val.DEVIATION_STATUS == 'CONFIRMED' && (val.OTHER_DEVIATION_OWNERS.includes('VZB') || val.OTHER_DEVIATION_OWNERS.includes('VZW')))).length > 0 && this.state.go95completedInfo.filter(val => (val.DEVIATION_STATUS == 'CONFIRMED' && (val.OTHER_DEVIATION_OWNERS.includes('VZB') || val.OTHER_DEVIATION_OWNERS.includes('VZW'))) && val.REMEDIATION_STATUS == 'VENDOR REVIEW').length > 0)
        if (this.props.selectedGO95.PM_ITEM_STATUS === 'COMPLETED' || this.props.selectedGO95.PM_ITEM_STATUS === 'ACCEPTED' || this.props.selectedGO95.PM_ITEM_STATUS === 'RECEIVED' || this.props.selectedGO95.PM_ITEM_STATUS === 'INVOICED' || this.props.selectedGO95.PM_ITEM_STATUS === 'CLOSED') {
            return (<div className="container">
                {this.state.pageLoading ? this.renderLoading() : <div>
                    <div >

                        <div className="container">
                            <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                                <tbody className="vzwtable text-left">
                                    <tr>

                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Pole Number</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                                                {!!this.props.go95PoleData.PS_LOCATION_ID ? this.props.go95PoleData.PS_LOCATION_ID : ''}</b></div>
                                        </div></td>
                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Pole Owner</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.go95equipData.structure_owner ? this.props.go95equipData.structure_owner : ''}</b></div>
                                        </div></td>
                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Pole Type</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.go95equipData.structure_type ? this.props.go95equipData.structure_type : ''}</b></div>
                                        </div></td>
                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Lat/Long</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.go95PoleData.SITE_LATITUDE && !!this.props.go95PoleData.SITE_LONGITITUDE ? this.props.go95PoleData.SITE_LATITUDE + '/' + this.props.go95PoleData.SITE_LONGITITUDE : ''}</b></div>
                                        </div></td>
                                    </tr>
                                    <tr>
                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Address</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.go95PoleData.SITE_ADDRESS ? this.props.go95PoleData.SITE_ADDRESS : ''}</b></div>
                                        </div></td>
                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Fire Tier</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.selectedGO95.FIRE_ZONE_SECTOR ? this.props.selectedGO95.FIRE_ZONE_SECTOR : ''}</b></div>
                                        </div></td>
                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Inspection Type</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.props.selectedGO95.INSPECTION_TYPE ? this.props.selectedGO95.INSPECTION_TYPE : ''}</b></div>
                                        </div></td>

                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Inspection Date</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.props.go95completedInfo.length > 0 && !!this.props.go95completedInfo[0].INSP_COMPLETION_DATE ? moment(this.props.go95completedInfo[0].INSP_COMPLETION_DATE).format('DD/MM/YYYY') : ''}</b></div>
                                        </div></td>


                                    </tr>
                                    <tr>
                                        <td className="Form-group no-border"><div>
                                            <div ><b className="fontLarge">Vendor Tech Name</b></div>
                                            <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.props.go95completedInfo.length > 0 && !!this.props.go95completedInfo[0].INSP_TECH ? this.props.go95completedInfo[0].INSP_TECH : ''}</b></div>
                                        </div></td>
                                        <td className="Form-group no-border"></td>
                                        <td className="Form-group no-border"></td>
                                        <td className="Form-group no-border"></td>



                                    </tr>





                                </tbody>
                            </table>
                            <h4 className="h4 mb-3">Comments</h4>
                            <div style={{ "boxShadow": "3px 3px 5px 6px #ccc", "backgroundColor": "#FAFAFA", "height": "6vh", "color": "#B6B6B6", "lineHeight": "6vh" }}><b style={{ "color": "B6B6B6" }}>{this.props.go95completedInfo.length > 0 && !!this.props.go95completedInfo[0].INSP_COMMENTS ? this.props.go95completedInfo[0].INSP_COMMENTS : ''}</b></div>
                        </div>

                        <br />
                    </div>

                    {this.state.go95completedInfo.filter(val => !val.REMEDIATION_STATUS && !val.DEVIATION_STATUS && !!val.OTHER_DEVIATION_OWNERS && (val.OTHER_DEVIATION_OWNERS.includes('VZW') || val.OTHER_DEVIATION_OWNERS.includes('VZB'))).length > 0 && <div style={{ "padding": "7pt 10px 0px 10px" }}>
                        <div ><h4>Deviations yet to be actioned by verizon</h4></div>
                        <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                            <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                                <tr>

                                    <th scope="col">Deviation</th>
                                    <th scope="col">Remediation</th>
                                    <th scope="col">RMD LVL</th>
                                    <th scope="col">Selected Owners</th>

                                </tr>
                            </thead>
                            <tbody>
                                {this.state.go95completedInfo.filter(val => !val.REMEDIATION_STATUS && !val.DEVIATION_STATUS && !!val.OTHER_DEVIATION_OWNERS && (val.OTHER_DEVIATION_OWNERS.includes('VZW') || val.OTHER_DEVIATION_OWNERS.includes('VZB'))).length > 0 && this.state.go95completedInfo.filter(val => !val.REMEDIATION_STATUS && !val.DEVIATION_STATUS && !!val.OTHER_DEVIATION_OWNERS && (val.OTHER_DEVIATION_OWNERS.includes('VZW') || val.OTHER_DEVIATION_OWNERS.includes('VZB'))).map(inval => (
                                    <tr>

                                        <td>{!!inval.DEVIATION_NAME ? inval.DEVIATION_NAME : ''}</td>
                                        <td>{!!inval.REMEDIATION ? inval.REMEDIATION : ''}</td>
                                        <td>{!!inval.REMEDIATION_LEVEL ? inval.REMEDIATION_LEVEL : ''}</td>


                                        <td>{!!inval.OTHER_DEVIATION_OWNERS ? inval.OTHER_DEVIATION_OWNERS : ''}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}

                    {this.state.go95completedInfo.filter(val => (!val.OTHER_DEVIATION_OWNERS || (!!val.OTHER_DEVIATION_OWNERS && !val.OTHER_DEVIATION_OWNERS.includes('VZW') && !val.OTHER_DEVIATION_OWNERS.includes('VZB')))).length > 0 && <div style={{ "padding": "7pt 10px 0px 10px" }}>
                        <div className="mb-3"><h4>Deviations Not Owned by Verizon</h4></div>
                        <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                            <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                                <tr>

                                    <th scope="col">Deviation</th>

                                    <th scope="col">Deviation Owners</th>

                                </tr>
                            </thead>
                            <tbody>
                                {this.state.go95completedInfo.filter(val => ((!!val.OTHER_DEVIATION_OWNERS && !val.OTHER_DEVIATION_OWNERS.includes('VZW') && !val.OTHER_DEVIATION_OWNERS.includes('VZB')) || !val.OTHER_DEVIATION_OWNERS)).length > 0 && this.state.go95completedInfo.filter(val => ((!!val.OTHER_DEVIATION_OWNERS && !val.OTHER_DEVIATION_OWNERS.includes('VZW') && !val.OTHER_DEVIATION_OWNERS.includes('VZB')) || !val.OTHER_DEVIATION_OWNERS)).map(inval => (
                                    <tr>

                                        <td>{!!inval.DEVIATION_NAME ? inval.DEVIATION_NAME : ''}</td>


                                        <td>{!!inval.OTHER_DEVIATION_OWNERS ? inval.OTHER_DEVIATION_OWNERS : ''}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}


                    {this.state.go95completedInfo.filter(val => (val.DEVIATION_STATUS == 'CONFIRMED' && (val.OTHER_DEVIATION_OWNERS.includes('VZB') || val.OTHER_DEVIATION_OWNERS.includes('VZW')))).length > 0 && <div style={{ "padding": "7pt 10px 0px 10px" }}>
                        <div className="mb-3"><h4>Deviations confirmed by Verizon</h4></div>
                        <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                            <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                                <tr>
                                    <th scope="col">Select</th>
                                    <th scope="col">Deviation</th>

                                    <th scope="col">Deviation Owners</th>

                                    <th scope="col">Remediation / RMD LVL</th>

                                    <th scope="col">RMD Status</th>


                                    <th scope="col" style={{ "width": "170px" }} >RMD Action</th>
                                    <th scope="col">RMD Comments</th>
                                    <th scope="col">vendor Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.go95completedInfo.filter(val => (val.DEVIATION_STATUS == 'CONFIRMED' && (val.OTHER_DEVIATION_OWNERS.includes('VZB') || val.OTHER_DEVIATION_OWNERS.includes('VZW')))).length > 0 && this.state.go95completedInfo.filter(val => (val.DEVIATION_STATUS == 'CONFIRMED' && (val.OTHER_DEVIATION_OWNERS.includes('VZB') || val.OTHER_DEVIATION_OWNERS.includes('VZW')))).map(inval => (
                                    <tr>
                                        <td scope="row" className="text-center">
                                            <Checkbox
                                                onChange={this.handleCheckBoxChangeCmpltd.bind(this, inval)}
                                                className={'selection-box'}
                                                color="default"
                                                name={inval.DEVIATION_NAME}
                                                value={inval.DEVIATION_NAME}
                                                disabled={inval.REMEDIATION_STATUS !== 'VENDOR REVIEW'}
                                                checked={!!inval.itemSelected}
                                            />
                                        </td>
                                        <td>{!!inval.DEVIATION_NAME ? inval.DEVIATION_NAME : ''}</td>

                                        <td>{!!inval.OTHER_DEVIATION_OWNERS ? inval.OTHER_DEVIATION_OWNERS : ''}</td>

                                        <td>{!!inval.REMEDIATION ? inval.REMEDIATION : ''} / {!!inval.REMEDIATION_LEVEL ? inval.REMEDIATION_LEVEL : ''}</td>

                                        <td>{!!inval.REMEDIATION_STATUS ? inval.REMEDIATION_STATUS : ''}</td>




                                        <td style={{ "width": "170px" }}>

                                            <Select
                                                className="basic-single text-center title-div-style"
                                                classNamePrefix="select"

                                                value={!!inval.rmdStatusCurVal ? inval.rmdStatusCurVal : null}
                                                disabled={inval.REMEDIATION_STATUS !== 'VENDOR REVIEW'}
                                                isLoading={false}
                                                clearable={false}
                                                isRtl={false}
                                                isSearchable={false}
                                                styles={customStyles}
                                                options={inval.rmdStatusDrpDwn}
                                                onChange={this.handleDrpDwnChgeRmdStatus.bind(this, inval)}
                                            />
                                        </td>
                                        <td>{!!inval.REMEDIATION_COMMENTS ? <ul>{inval.REMEDIATION_COMMENTS.split(',').map(v => v.includes('Vendor Comments -') ? <li>{v}</li> : <li>{`VZ Comments - ${v}`}</li>)}</ul> : ''}</td>
                                        <td>{inval.REMEDIATION_STATUS == 'VENDOR REVIEW' && <textarea cols={30} rows={4} name='vendor comments' style={{ height: '100%', width: '100%' }}
                                            defaultValue={inval.vendorCommentsRmd}
                                            onChange={this.handleChangeCommentsRmd.bind(this, inval)} />}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
                    {this.state.go95completedInfo.filter(val => (val.DEVIATION_STATUS == 'RETURNED' && (val.OTHER_DEVIATION_OWNERS.includes('VZB') || val.OTHER_DEVIATION_OWNERS.includes('VZW')))).length > 0 && <div style={{ "padding": "7pt 10px 0px 10px" }}>
                        <div className="mb-3"><h4>Deviations Returned By Verizon</h4></div>
                        <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                            <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                                <tr>
                                    <th scope="col">Select</th>
                                    <th scope="col">Deviation</th>

                                    <th scope="col">Current Owners</th>
                                    <th scope="col">Select New Owners</th>
                                    <th scope="col">Dev Comments</th>
                                    <th scope="col">vendor Comments</th>



                                </tr>
                            </thead>
                            <tbody>
                                {this.state.go95completedInfo.filter(val => (val.DEVIATION_STATUS == 'RETURNED' && (val.OTHER_DEVIATION_OWNERS.includes('VZB') || val.OTHER_DEVIATION_OWNERS.includes('VZW')))).length > 0 && this.state.go95completedInfo.filter(val => (val.DEVIATION_STATUS == 'RETURNED' && (val.OTHER_DEVIATION_OWNERS.includes('VZB') || val.OTHER_DEVIATION_OWNERS.includes('VZW')))).map(inval => (
                                    <tr>
                                        <td scope="row" className="text-center">
                                            <Checkbox
                                                onChange={this.handleCheckBoxChangeCmpltd.bind(this, inval)}
                                                className={'selection-box'}
                                                color="default"
                                                name={inval.DEVIATION_NAME}
                                                value={inval.DEVIATION_NAME}
                                                checked={!!inval.itemSelected}
                                            />
                                        </td>
                                        <td>{!!inval.DEVIATION_NAME ? inval.DEVIATION_NAME : ''}</td>

                                        <td>{inval.currValues.length > 0 ? inval.currValues.map(invals => invals.value).join(',') : ''}</td>
                                        <td>
                                            <Picky
                                                value={!!inval.currValues ? inval.currValues : []}
                                                options={inval.ownerDrpdwn}
                                                onChange={this.handleDrpDwnChgeCmpltd.bind(this, inval)}
                                                open={false}
                                                valueKey="value"
                                                labelKey="label"
                                                multiple={true}
                                                includeSelectAll={true}
                                                includeFilter={true}
                                                dropdownHeight={100}
                                                clearFilterOnClose={true}

                                            />
                                        </td>
                                        <td>{!!inval.DEVIATION_COMMENTS ? inval.DEVIATION_COMMENTS : ''}</td>
                                        <td><textarea cols={30} rows={4} name='vendor comments' style={{ height: '100%', width: '100%' }}
                                            defaultValue={inval.vendorComments}
                                            onChange={this.handleChangeCommentsDev.bind(this, inval)} /></td>




                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}


                    <div style={{ "padding": "7pt 10px 0px 10px" }}>
                        <div className="mb-3"><h4>Attachments</h4> {this.state.fileSizeError && (<div colSpan="6" ><MessageBox messages={List(["The size of attachments should be less than 25 MB!"])} /></div>)} </div>

                    </div>
                    <div className="container" style={{ "backgroundColor": "#FAFAFA", "height": "20vh", "color": "#B6B6B6" }}><b style={{ "color": "B6B6B6" }}>
                        <div className="row" >
                            <div className="col-md-3" style={{ 'paddingTop': '1%' }}>
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
                            <div className="col-md-5">
                                <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />
                            </div>
                            <div className="col-md-4" style={{ 'paddingTop': '2%' }}>

                                <button type="submit"
                                    className="Button--secondary float-right mt-2"
                                    disabled={this.state.filesData.length === 0 || this.state.fileSizeError}
                                    style={{ marginRight: "5px" }}
                                    onClick={this.reUpload}>
                                    Re-upload
                                </button>
                            </div>
                        </div>
                    </b></div>

                    {this.state.attachLoading ? this.renderLoading() :
                        <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>

                            <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                                <tr>

                                    <th scope="col">Category</th>
                                    <th scope="col">Attachment Name</th>

                                </tr>
                            </thead>
                            <tbody>
                                {this.props.attachmentList.length > 0 && this.props.attachmentList.filter(i => !i.file_name.includes('pm_compressed')).map(inval => (
                                    <tr>
                                        <td>{inval.category ? inval.category : ''}</td>
                                        <td style={{ "cursor": "pointer", "color": "blue" }} onClick={this.downloadAttachments.bind(this, inval)}><b>{!!inval.file_name ? inval.file_name : ''}</b></td>

                                    </tr>
                                ))
                                }

                            </tbody>
                        </table>
                    }




                    <div className="container mt-3" style={{ 'paddingTop': '30px' }}>

                        <span style={{ "color": "blue", "cursor": "pointer" }} onClick={this.handleLogClick.bind(this)}><b>{!this.state.showLog ? 'View Audit Log' : 'Hide Audit Log'}</b></span>
                        <button type="submit"
                            className="Button--secondary float-right mt-2"
                            disabled={this.checkDisableCmpld()}
                            style={{ marginRight: "5px" }}
                            onClick={this.onSubmit.bind(this, 'RESUBMIT')}>
                            Update
                        </button>
                    </div>
                    {this.state.showLog && <div style={{ "padding": "7pt 10px 0px 10px" }}>
                        <div className="mb-3"><h4>Audit Log</h4></div>
                        <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }} className="text-left">
                            <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                                <tr>
                                    <th scope="col">Field</th>
                                    <th scope="col">Action</th>
                                    <th scope="col">Updated Value</th>
                                    <th scope="col">Updated By</th>
                                    <th scope="col">Updated Date</th>



                                </tr>
                            </thead>
                            <tbody>
                                {this.state.auditDetails.length > 0 && this.state.auditDetails.filter(val => val.LAST_UPDATED_BY && val.LAST_UPDATED_BY.substring(0, 3).toLowerCase() == "vp0" || val.NEW_VALUE == "CONFIRMED" || val.NEW_VALUE == "RETURNED") && this.state.auditDetails.filter(val => val.LAST_UPDATED_BY && val.LAST_UPDATED_BY.substring(0, 3).toLowerCase() == "vp0" || val.NEW_VALUE == "CONFIRMED" || val.NEW_VALUE == "RETURNED").map(inval => (
                                    <tr>
                                        <td scope="col">{!!inval.FIELD_NAME ? inval.FIELD_NAME : ''}</td>
                                        <td scope="col">{!!inval.ACTION ? inval.ACTION : ''}</td>
                                        {inval.FIELD_NAME == "REMEDIATION_COMMENTS" ? <td scope="col">{!!inval.NEW_VALUE ? <ul>
                                            {inval.NEW_VALUE.split(',').map(v => v.includes('Vendor Comments -') ? <li>{v}</li> : <li>{`VZ Comments - ${v}`}</li>)}
                                        </ul> : ''}</td> : <td scope="col">{!!inval.NEW_VALUE ? inval.NEW_VALUE : ''}</td>}
                                        <td scope="col">{!!inval.LAST_UPDATED_BY ? inval.LAST_UPDATED_BY.substring(0, 3).toLowerCase() == "vp0" ? this.props.go95completedInfo.length > 0 && !!this.props.go95completedInfo[0].INSP_TECH ? this.props.go95completedInfo[0].INSP_TECH : '' : inval.LAST_UPDATED_BY : ''}</td>
                                        <td scope="col">{!!inval.LAST_UPDATED_DATE ? moment(inval.LAST_UPDATED_DATE).format('MM/DD/YYYY') : ''}</td>



                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
                </div>}
            </div>)
        }
        else {
            return (<div className="container-fluid">
                {this.state.pageLoading ? this.renderLoading() : <div>
                    <div style={{ margin: 'auto', width: '100%' }}>
                        <table className="table  sortable" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                            <tbody className="vzwtable text-left">
                                <tr>
                                    <td className="Form-group no-border"><div>
                                        <div ><b className="fontLarge">Pole Number</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">
                                            {!!this.props.go95PoleData.PS_LOCATION_ID ? this.props.go95PoleData.PS_LOCATION_ID : ''}</b></div>
                                    </div></td>
                                    <td className="Form-group no-border"><div>
                                        <div ><b className="fontLarge">Pole Owner</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.go95equipData.structure_owner ? this.props.go95equipData.structure_owner : ''}</b></div>
                                    </div></td>
                                    <td className="Form-group no-border"><div>
                                        <div ><b className="fontLarge">Pole Type</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.go95equipData.structure_type ? this.props.go95equipData.structure_type : ''}</b></div>
                                    </div></td>
                                    <td className="Form-group no-border"><div>
                                        <div ><b className="fontLarge">Lat/Long</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.go95PoleData.SITE_LATITUDE && !!this.props.go95PoleData.SITE_LONGITITUDE ? this.props.go95PoleData.SITE_LATITUDE + '/' + this.props.go95PoleData.SITE_LONGITITUDE : ''}</b></div>
                                    </div></td>
                                </tr>
                                <tr>
                                    <td className="Form-group no-border"><div>
                                        <div ><b className="fontLarge">Address</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.go95PoleData.SITE_ADDRESS ? this.props.go95PoleData.SITE_ADDRESS : ''}</b></div>
                                    </div></td>
                                    <td className="Form-group no-border"><div>
                                        <div ><b className="fontLarge">Fire Tier</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{!!this.props.selectedGO95.FIRE_ZONE_SECTOR ? this.props.selectedGO95.FIRE_ZONE_SECTOR : ''}</b></div>
                                    </div></td>
                                    <td className="Form-group no-border"><div>
                                        <div ><b className="fontLarge">Inspection Type</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{this.props.selectedGO95.INSPECTION_TYPE ? this.props.selectedGO95.INSPECTION_TYPE : ''}</b></div>
                                    </div></td>

                                    <td className="Form-group no-border"></td>


                                </tr>






                            </tbody>
                        </table>


                        <br />
                    </div>
                    <div style={{ margin: 'auto', width: '100%' }}>

                        <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                            <thead className="vzwtable text-left">
                                <tr colSpan={"4"}>
                                    <td className="Form-group no-border" colSpan="4"><b className="fontLarge">Inspection Date<span className="text-danger">*</span></b></td>
                                    <td className="Form-group no-border" colSpan="4"><b className="fontLarge">Vendor Tech Name <span className="text-danger">*</span></b></td>

                                    <td className="Form-group no-border" colSpan="4"><b className="fontLarge">Comments</b></td>



                                </tr>


                            </thead>

                            <tbody className="vzwtable text-left">

                                <tr colSpan={"4"}>
                                    <td className="Form-group no-border" colSpan="4">
                                        <SingleDatePicker orientation={'vertical'} verticalHeight={380}
                                            numberOfMonths={1} showDefaultInputIcon={false}
                                            onDateChange={inspectionDate => this.setState({ inspectionDate })}
                                            onFocusChange={({ focused }) =>
                                                this.setState({ inspectionDateFocused: focused })
                                            }
                                            focused={this.state.inspectionDateFocused} isOutsideRange={() => false}
                                            date={this.state.inspectionDate} block
                                        />
                                    </td>
                                    <td className="Form-group no-border" colSpan="4"><b><input type={"text"} name='Vendor Tech Name' style={{ width: '100%', lineHeight: "28px", border: "1px solid lightgray", fontSize: "14px" }} onChange={(e) => {
                                        this.setState({ techName: e.target.value })
                                    }} defaultValue={this.state.techName} /></b></td>

                                    <td className="Form-group no-border" colSpan="4"><b><textarea cols={30} rows={4} name='comments' style={{ height: '100%', width: '100%', border: "1px solid lightgray" }} onChange={(e) => {
                                        this.setState({ commentsVendor: e.target.value })
                                    }} defaultValue={this.state.commentsVendor} /></b></td>



                                </tr>
                            </tbody>
                        </table>
                        <div className="container row">
                            {this.state.go95InfoDev.filter(val => !!val.itemSelected).length > 0 && <div className="col-md-3" style={{ "cursor": "pointer", "color": "blue" }} onClick={this.handleViewSummary.bind(this)}><b>{this.state.showSummary ? <span>Hide Deviation summary <i className="fas fa-chevron-up" style={{ "color": "#B6B6B6" }}></i></span> : <span>View Deviation summary <i className="fas fa-chevron-down" style={{ "color": "#B6B6B6" }}></i></span>}</b></div>}
                            <div className="col-md-1"></div>
                            <div className="col-md-4">

                            </div>
                            <div className="col-md-4">

                            </div>

                        </div>
                        {this.state.showSummary && (
                            <div className="container row">

                                <div className="col-md-2"></div>
                                <div className="col-md-8">
                                    <div style={{ "padding": "7pt 10px 0px 10px" }}>
                                        <div className="text-center mb-3"><h4>Selected Deviations Summary</h4></div>
                                        <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                                            <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                                                <tr>

                                                    <th scope="col">Deviation</th>
                                                    <th scope="col">Remediation</th>
                                                    <th scope="col">RMD LVL</th>
                                                    <th scope="col">Selected Owners</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.go95InfoDev.filter(val => !!val.itemSelected).map(inval => (
                                                    <tr>

                                                        <td>{inval.DEVIATION_LABEL}</td>
                                                        <td>{inval.REMEDIATION}</td>
                                                        <td>{inval.REMEDIATION_LEVEL.value}</td>


                                                        <td>{inval.currValues.length > 0 ? inval.currValues.map(i => i.value).join(',') : ''}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="col-md-3"></div>
                            </div>
                        )}
                        {!!this.state.groups && this.state.groups.length > 0 && <div className='container mt-5'>
                            <div className="row">
                                <div className="col-md section-class text-center active-div" onClick={this.handleGrpClick.bind(this, this.state.groups[0].groupName)} id={this.state.groups[0].groupName}><h4 style={{ "lineHeight": "10vh" }}>{this.state.groups[0].groupName}</h4></div>
                                <div className="col-md section-class text-center disable-div" onClick={this.handleGrpClick.bind(this, this.state.groups[1].groupName)} id={this.state.groups[1].groupName}><h4 style={{ "lineHeight": "10vh" }}>{this.state.groups[1].groupName}</h4></div>
                                <div className="col-md section-class text-center disable-div" onClick={this.handleGrpClick.bind(this, this.state.groups[2].groupName)} id={this.state.groups[2].groupName}><h4 style={{ "lineHeight": "10vh" }}>{this.state.groups[2].groupName}</h4></div>

                            </div>
                            <table className="table mt-5">
                                <thead>
                                    <tr style={{ "fontSize": "3vh" }}>
                                        <th scope="col" className="text-center">Select</th>

                                        <th scope="col" className="text-center">Deviation</th>
                                        <th scope="col" className="text-center">Remediation</th>
                                        <th scope="col" className="text-center">RMD LVL</th>
                                        <th scope="col" className="text-center">Please Select Owners</th>
                                        <th scope="col" className="text-center">Selected Owners</th>

                                    </tr>
                                </thead>
                                {this.state.visibledeviationsList.map((val, index) => {

                                    return (<tbody>
                                        <tr className="text-center">
                                            <td scope="row" className="text-center">
                                                <Checkbox
                                                    onChange={this.handleCheckBoxChange.bind(this, val)}
                                                    className={'selection-box'}
                                                    color="default"
                                                    name={val.title}
                                                    value={val.title}
                                                    checked={!!val.itemSelected}
                                                    disabled={!!val.disableDev}
                                                />
                                            </td>
                                            {val.DEVIATION_ID == '58' ? (<td >
                                                {this.state.showmsg && <div className="text-danger"><b>Please enter valid deviation</b></div>}
                                                <input type='text' defaultValue={val.DEVIATION_LABEL} onChange={this.handleOtherChange.bind(this, val)} /></td>) : <td>{val.DEVIATION_LABEL}</td>}
                                            <td>{val.REMEDIATION}</td>
                                            <td className="text-center">{val.DEVIATION_ID != 1 ? <Select
                                                className="basic-single text-center title-div-style"
                                                classNamePrefix="select"

                                                value={val.REMEDIATION_LEVEL}
                                                disabled={val.disableDev}
                                                isLoading={false}
                                                clearable={false}
                                                isRtl={false}
                                                isSearchable={false}
                                                styles={customStyles}
                                                options={this.state.drpdwnOptions}
                                                onChange={this.handleDropdownChange.bind(this, val)}
                                            /> : <b className="text-center" style={{ "fontSize": "3vh", "textAlign": "center" }}>{val.REMEDIATION_LEVEL.value}</b>}</td>

                                            <td>
                                                {val.DEVIATION_ID == '1' ? '' : <Picky
                                                    value={!!val.currValues ? val.currValues : []}
                                                    options={val.ownerDrpdwn}
                                                    onChange={this.handleDrpDwnChge.bind(this, val)}
                                                    open={false}
                                                    valueKey="value"
                                                    labelKey="label"
                                                    multiple={true}
                                                    includeSelectAll={true}
                                                    includeFilter={true}
                                                    dropdownHeight={100}
                                                    clearFilterOnClose={true}
                                                    disabled={val.disableDev}
                                                />}
                                            </td>
                                            <td className="text-center">{val.currValues.length > 0 ? val.currValues.map(i => i.value).join(',') : ''}</td>

                                        </tr>

                                    </tbody>)
                                })}

                            </table>
                            <div className="row" ><div onClick={this.handlePrevClick.bind(this)} className={this.state.currentIndex <= 0 ? 'col-md-2 float-left text-center prev-next-class-disable' : 'col-md-2 float-left text-center prev-next-class'} >{'<<< Previous'}</div>
                                <div className="col-md-8"></div>
                                <div onClick={this.handleNextClick.bind(this)} className={this.state.currentIndex >= this.state.groups.length - 1 ? 'col-md-2 float-left text-center prev-next-class-disable' : 'col-md-2 float-left text-center prev-next-class'} >{'Next >>>'}</div></div>
                        </div>}

                        <br />
                    </div>
                    {this.state.fileSizeError && (<div colSpan="6" ><MessageBox messages={List(["The size of attachments should be less than 25 MB!"])} /></div>)}
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
                        <div className="col-md-4">
                            <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={this.state.filesData} />
                        </div>

                        <div className="col-md-4"> {this.props.attachmentList.length > 0 && this.props.attachmentList.filter(i => !i.file_name.includes('pm_compressed')).map(inval => (
                            <div>

                                <td style={{ "cursor": "pointer", "color": "blue" }} onClick={this.downloadAttachments.bind(this, inval)}><b>{!!inval.file_name ? inval.file_name : ''}</b></td>

                            </div>
                        ))}</div>

                    </div>
                    {<div className="mt-3 container-fluid">

                        <div className="text_right text-info float-right">

                            <b>Please view the entire deviation list and verify deviation summary before completing the inspection form</b>
                        </div>
                    </div>}

                    <div className="container mt-3">

                        <button type="submit"
                            className="Button--secondary float-left mt-2"
                            disabled={this.checkDisableDraft()}
                            style={{ marginRight: "5px" }}
                            onClick={this.onSubmit.bind(this, 'PENDING_DRAFT')}>
                            Save as draft
                        </button>

                        <button type="submit"
                            className="Button--secondary float-right mt-2"
                            disabled={this.checkDisable()}
                            style={{ marginRight: "5px" }}
                            onClick={this.onSubmit.bind(this, 'COMPLETED')}>
                            Complete Inspection
                        </button>
                    </div>
                </div>}
            </div>)
        }

    }
}
function stateToProps(state, ownProps) {

    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
    let vendorId = user.toJS().vendor_id
    let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
    let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
    let go95Info = !!state.getIn(['PmDashboard', loginId, vendorId, "GO95", "GO95PoleInfo", Object.keys(ownProps).length > 0 ? ownProps.selectedGO95.EQUIPMENT_UNID : ''], Map()) ? state.getIn(['PmDashboard', loginId, vendorId, "GO95", "GO95PoleInfo", Object.keys(ownProps).length > 0 ? ownProps.selectedGO95.EQUIPMENT_UNID : ''], Map()).toJS() : {}
    let go95InfoDev = Object.keys(go95Info).length > 0 ? go95Info.go95DeviationsRefData.map(val => ({ ...val, OWNERLIST: 'VZW,VZB,ATT,Clearlink,Crown Castle,New Cingular Wireless,NextG,Omnipoint,PGE,SCE,Sprint NextTel' })).sort((a, b) => {
        if (parseInt(a.DEVIATION_ID) > parseInt(b.DEVIATION_ID)) {
            return 1
        }
        else if (parseInt(a.DEVIATION_ID) < parseInt(b.DEVIATION_ID)) {
            return -1
        }
        else {
            return 0
        }
    }).map(val => ({
        ...val,
        currValues: [],
        ownerDrpdwn: val.OWNERLIST.split(',').map(inval => ({ label: inval, value: inval })),
        REMEDIATION_LEVEL: { label: val.REMEDIATION_LEVEL, value: val.REMEDIATION_LEVEL, isFixed: true }
    })) : []
    let go95Loading = state.getIn(['PmDashboard', loginId, vendorId, "GO95", "GO95PoleInfoLoading", Object.keys(ownProps).length > 0 ? ownProps.selectedGO95.EQUIPMENT_UNID : ''], false)

    let go95PoleData = Object.keys(go95Info).length > 0 && Object.keys(go95Info.poleData).length > 0 ? go95Info.poleData[0] : {}
    let go95equipData = Object.keys(go95Info).length > 0 && Object.keys(go95Info.poleData).length > 0 && Object.keys(go95Info.poleData[0].EQUIPMENT_INFO) ? go95Info.poleData[0].EQUIPMENT_INFO[0] : {}
    let go95completedInfo = Object.keys(go95Info).length > 0 && go95Info.poleAttributeData.length > 0 ? go95Info.poleAttributeData.map(val => ({
        ...val,
        vendorCommentsDev: '',
        vendorCommentsRmd: '',
        ownerDrpdwn: 'VZW,VZB,ATT,Clearlink,Crown Castle,New Cingular Wireless,NextG,Omnipoint,PGE,SCE,Sprint NextTel'.split(',').map(inval => ({ label: inval, value: inval })),
        currValues: !!val.OTHER_DEVIATION_OWNERS ? val.OTHER_DEVIATION_OWNERS.split(',').map(inval => ({ label: inval, value: inval })) : [],
        rmdStatusDrpDwn: [{ label: 'ACCEPT', value: 'VENDOR ACCEPTED' }, { label: 'DECLINE', value: 'VENDOR DECLINED' }],
        rmdStatusCurVal: null
    })) : []
    let attachmentList = Object.keys(go95Info).length > 0 && go95Info.attachmentList.length > 0 ? go95Info.attachmentList : []

    return {
        user,
        loginId,
        vendorId,
        market,
        submarket,
        go95Info,
        go95InfoDev,
        go95Loading,
        go95PoleData,
        go95equipData,
        go95completedInfo,
        attachmentList




    }

}
export default connect(stateToProps, { ...pmActions })(GO95InspectionResult)
