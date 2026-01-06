import React, { Component } from 'react'
import RefreshPage from '../../sites/images/Reload.png'
import Dropzone from 'react-dropzone'
import ListOfFiles from './ListOfFiles'
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import { connect } from "react-redux"
import Checkbox from '@material-ui/core/Checkbox';
import { submitGenReadingsRequest } from '../../VendorDashboard/actions.js'
import { saveElogByWorkOrderID } from '../../Elog/actions.js'
import moment from 'moment'
import Loader from '../../Layout/components/Loader'


class RenderSiteDetails extends React.Component {
    constructor(props) {
        super(props)

        this.state = {

            filesData: [],
            totalAttachmentSizeObject: {},
            disableCheckBoxes: false,
            pm_unid: this.randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
            genData: [],
            submitpostRequest1: {},
            submitpostRequest2: {},
            disableSubmit: true

        }
        this.submitReadings = this.submitReadings.bind(this)
        this.formPostRequest1 = this.formPostRequest1.bind(this)
    }
    componentWillUnmount() {
        const { loginId, vendorId, storeTemplateData, currentPmList, pmListItemsTmplt } = this.props

        storeTemplateData(vendorId, loginId, currentPmList.PM_LIST_ID, [])

    }

    randomString(length, chars) {
        var result = ''
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
        return result
    }
    renderLoading = () => {

        return (
            <Loader color="#cd040b"
                size="20px"
                margin="4px"
                className="text-center" />
        )
    }

    onFileDrop = (locationId, files) => {
        const { loginId, vendorId, addAttachmentsToListItem, currentPmList } = this.props
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
                    addAttachmentsToListItem(vendorId, loginId, currentPmList.PM_LIST_ID, locationId, droppedFile).then((action) => {
                        if (action.type === 'ADD_ATTCH_TO_LISTITEM') {

                            //this.validateFileSize()
                        }
                    })



                    this.forceUpdate()
                }.bind(this)
                reader.readAsDataURL(file)
            }
        })
    }

    scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        return;
    }
    getAttchList = (locationId) => {

        return !!this.props.pmListItemsTmplt.filter(pli => pli.PS_LOCATION_ID === locationId)[0] && !!this.props.pmListItemsTmplt.filter(pli => pli.PS_LOCATION_ID === locationId)[0].attachmentList ? this.props.pmListItemsTmplt.filter(pli => pli.PS_LOCATION_ID === locationId)[0].attachmentList : []
    }
    onAttachRemove(locationId, index) {
        const { loginId, vendorId, removeAttachmentFromListItem, currentPmList } = this.props
        removeAttachmentFromListItem(vendorId, loginId, currentPmList.PM_LIST_ID, locationId, index).then((action) => {
            if (action.type === 'REMOVE_ATTCH_FROM_LISTITEM') {

                //this.validateFileSize()
            }
        })


        this.forceUpdate()
    }
    validateFileSize = () => {

        let totalAttachmentSizeObject = this.props.pmListItemsTmplt.filter(plt => !!plt.itemSelected).length > 0 ? this.props.pmListItemsTmplt.filter(plt => !!plt.itemSelected).reduce((total, currentItem) => ({ totalAttachmentsize: total.totalAttachmentsize + currentItem.totalAttachmentsize })) : {}

        this.setState({ totalAttachmentSizeObject }, () => {
            if (Object.keys(this.state.totalAttachmentSizeObject).length > 0 && this.state.totalAttachmentSizeObject.totalAttachmentsize > 2000000) {

                this.setState({ disableCheckBoxes: true })
            }
            else {
                this.setState({ disableCheckBoxes: false })
            }
        })
        return;
    }
    handleCheckBoxChange = (locationId, event) => {
        const { loginId, vendorId, addSelectionStatusToTemplateData, currentPmList } = this.props


        //const addSelectionStatusToTemplate =
        addSelectionStatusToTemplateData(vendorId, loginId, currentPmList.PM_LIST_ID, locationId, event.target).then(async action => {
            if (action.type === 'ADD_SELECTSTATUS_TO_LISTITEM') {
                //this.validateFileSize()
                if (this.props.pmListItemsTmplt.filter(plt => plt.pmItemStatus === 'PENDING' && plt.itemSelected).length === 0) {
                    await this.setState({ disableSubmit: true })
                }
                else {
                    await this.setState({ disableSubmit: false })
                }

            }
        })




    }
    getDate = () => {
        return moment().format('MM/DD/YYYY')
    }
    async formPostRequest1(CurrentElementToSubmit, submitStatus) {

        const { fetchPmModelAttributeDetails, fetchHvacDetails, fetchGenTankDetails } = this.props
        const { modelAttributes, userFname, currentPmList, vendorId, loginId } = this.props


        await fetchPmModelAttributeDetails(vendorId, loginId, currentPmList.PM_TYPE_NAME, null)
        if (this.props.currentPmList.PM_TYPE_NAME === 'GENERATOR PM') {
            await fetchGenTankDetails(vendorId, loginId, CurrentElementToSubmit.unid, CurrentElementToSubmit.pmListItemId).then(async action => {
                var genTankReadingInput = {}
                if (action.type === "FETCH_GENTANKDETAILS_SUCCESS") {
                    this.logResponse(CurrentElementToSubmit, 'responseTextCurrentSysRcrd', 'Current System records recieve success')


                    const genData = action.genTank
                    await this.setState({ genData })


                }
                else if (action.type === "FETCH_GENTANKDETAILS_FAILURE") {
                    this.logResponse(CurrentElementToSubmit, 'responseTextCurrentSysRcrd', 'Current System records recieve failed')


                }
            })
            var genAttMap = {}
            const { genData } = this.state
            this.props.modelAttributes.forEach(ma => {
                if (ma.PM_TMPLT_ATTR_NAME === "PM_DATE") {
                    genAttMap[ma.PM_TMPLT_ATTR_NAME] = [this.getDate(), CurrentElementToSubmit[ma.PM_TMPLT_ATTR_NAME]]
                }
                else if (ma.PM_TMPLT_ATTR_NAME === "GENREADINGUNID") {
                    genAttMap[ma.PM_TMPLT_ATTR_NAME] = ["", this.state.pm_unid]
                }
                else {
                    var currentSystemRecord = (!!genData && genData.length > 0 && ma.PM_TMPLT_ATTR_FLD_GROUP === '2' && !!ma.PM_TMPLT_ATTR_FLD_LBLMAP) && !!genData[0][ma.PM_TMPLT_ATTR_FLD_LBLMAP] ? genData[0][ma.PM_TMPLT_ATTR_FLD_LBLMAP] : ''
                    if (ma.PM_TMPLT_ATTR_FLD_TYPE !== 'RADIOBUTTON') {
                        genAttMap[ma.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, CurrentElementToSubmit[ma.PM_TMPLT_ATTR_NAME]]
                    }
                    else if (ma.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON' && !!ma.PM_TMPLT_ATTR_FLD_LBLMAP) {

                        genAttMap[ma.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, CurrentElementToSubmit[ma.PM_TMPLT_ATTR_NAME], CurrentElementToSubmit[ma.PM_TMPLT_ATTR_FLD_LBLMAP]]
                    }

                }
            })
        }



        if (this.props.currentPmList.PM_TYPE_NAME === 'HVAC PM') {
            let type = 'SITE'
            await fetchHvacDetails(vendorId, loginId, CurrentElementToSubmit.unid, CurrentElementToSubmit.pmListItemId, type).then(async action => {
                if (action.type === 'FETCH_HVACDETAILS_SUCCESS') {
                    await this.setState({ hvacData: action.hvacs })

                }
            })



            var hvacAttMap = {}
            this.props.modelAttributes.forEach(ma => {
                if (ma.PM_TMPLT_ATTR_NAME === "PM_DATE") {
                    hvacAttMap[ma.PM_TMPLT_ATTR_NAME] = [this.getDate(), CurrentElementToSubmit[ma.PM_TMPLT_ATTR_NAME]]
                }
                else {
                    const { hvacData } = this.state
                    var recordMapping = ma.PM_TMPLT_ATTR_FLD_GROUP === '2' && !!ma.PM_TMPLT_ATTR_FLD_LBLMAP ? ma.PM_TMPLT_ATTR_FLD_LBLMAP.split('-')[0] : ''
                    var hvacIndex = Number(ma.PM_TMPLT_ATTR_FLD_GROUP === '2' && !!ma.PM_TMPLT_ATTR_FLD_LBLMAP ? ma.PM_TMPLT_ATTR_FLD_LBLMAP.split('-')[1] : null)
                    var currentSystemRecord = (!!hvacData && hvacData.length > 0 && ma.PM_TMPLT_ATTR_FLD_GROUP === '2' && !!ma.PM_TMPLT_ATTR_FLD_LBLMAP && !!hvacData[hvacIndex] && !!hvacData[hvacIndex][recordMapping]) ? hvacData[hvacIndex][recordMapping] : ''
                    if (ma.PM_TMPLT_ATTR_FLD_TYPE !== 'RADIOBUTTON') {
                        hvacAttMap[ma.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, CurrentElementToSubmit[ma.PM_TMPLT_ATTR_NAME]]
                    }
                    else if (ma.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON' && !!ma.PM_TMPLT_ATTR_FLD_LBLMAP) {
                        hvacAttMap[ma.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, CurrentElementToSubmit[ma.PM_TMPLT_ATTR_NAME], CurrentElementToSubmit[ma.PM_TMPLT_ATTR_FLD_LBLMAP]]
                    }



                }
            })
        }






        const data = (this.props.currentPmList.PM_TYPE_NAME === 'HVAC PM') ? hvacAttMap : (this.props.currentPmList.PM_TYPE_NAME === 'GENERATOR PM') ? genAttMap : {}

        return fetchPmModelAttributeDetails(vendorId, loginId, currentPmList.PM_TYPE_NAME)
            .then(action => {

                if (action.type === 'FETCH_PMMODELATT_DETAILS_SUCCESS') {
                    var newData = Object.keys(data).map((udk) => {
                        if (!!action.pmModelAttDetails.getPmModelAttDetails.filter((mda) => udk === mda.PM_TMPLT_ATTR_NAME)[0]) {
                            const { PM_TEMPLATE_ID,
                                PM_TMPLT_ATTR_ID,
                                PM_TMPLT_ATTR_NAME } = action.pmModelAttDetails.getPmModelAttDetails.filter((mda) => udk === mda.PM_TMPLT_ATTR_NAME)[0]
                            const PM_TMPLT_ATTR_OLD_VALUE = data[udk][0]
                            const PM_TMPLT_ATTR_NEW_VALUE = data[udk][1]
                            const PM_TMPLT_ATTR_NEW_VALUE_SENT = !!data[udk][2] ? data[udk][2] : ''
                            return {
                                "PM_LIST_ID": this.props.currentPmList.PM_LIST_ID,
                                "PM_LIST_ITEM_ID": CurrentElementToSubmit.pmListItemId,
                                PM_TEMPLATE_ID,
                                PM_TMPLT_ATTR_ID,
                                PM_TMPLT_ATTR_NAME,
                                "PM_TMPLT_ATTR_UNID": CurrentElementToSubmit.unid,
                                PM_TMPLT_ATTR_OLD_VALUE,
                                PM_TMPLT_ATTR_NEW_VALUE,
                                PM_TMPLT_ATTR_NEW_VALUE_SENT,

                                "PM_TMPLT_ATTR_ACTION": submitStatus,
                                "LAST_UPDATED_BY": CurrentElementToSubmit["VENDORTECHNAME"]
                            }

                        }


                    })

                    return newData
                }
            })

    }
    formPostRequest2 = (CurrentElementToSubmit) => {
        const { loginId, vendorId, storeTemplateData, currentPmList, fetchGenTankDetails, fetchPmModelAttributeDetails } = this.props



        if (currentPmList.PM_TYPE_NAME === 'GENERATOR PM') {

            return fetchGenTankDetails(vendorId, loginId, CurrentElementToSubmit.unid, CurrentElementToSubmit.pmListItemId).then(async action => {

                var genTankReadingInput = {}
                if (action.type === "FETCH_GENTANKDETAILS_SUCCESS") {
                    this.logResponse(CurrentElementToSubmit, 'responseTextCurrentSysRcrd', 'Current System records recieve success')


                    const genData = action.genTank
                    this.setState({ genData })
                    let readings = []

                    let readingsObj = {

                        gen_meta_universalid: (!!genData && genData.length > 0 && !!genData[0].gen_meta_universalid) ? genData[0].gen_meta_universalid : '',
                        gen_emis_id: (!!genData && genData.length > 0 && !!genData[0].gen_emis_id) ? genData[0].gen_emis_id : '',
                        ac_voltage: parseFloat(CurrentElementToSubmit["AC Load (Volts):"], 10),
                        ac_current: parseFloat(CurrentElementToSubmit["AC Current (Amps)"], 10),
                        oil_level: parseFloat(CurrentElementToSubmit["Oil Level"], 10),
                        fuel_level1: parseInt(CurrentElementToSubmit["Fill Percentage (after fueling)"], 10) / 100,
                        fuel_gallonsadded1: parseInt(CurrentElementToSubmit["Amount of fuel added"], 10),
                        totalruntime: parseInt(CurrentElementToSubmit["Generator Runtime (hours)"], 10)
                    }
                    readings.push(readingsObj)

                    genTankReadingInput["source_sys"] = "iopvendorportal"
                    genTankReadingInput["source_unid"] = this.state.pm_unid
                    genTankReadingInput["readings"] = readings

                    await this.setState({ submitpostRequest2: genTankReadingInput })
                    return genTankReadingInput

                }
                else if (action.type === "FETCH_GENTANKDETAILS_FAILURE") {
                    this.logResponse(CurrentElementToSubmit, 'responseTextCurrentSysRcrd', 'Current System records recieve failed')


                }
            })


        }

    }

    formFilesPostRequest = (CurrentElementToSubmit) => {
        const { loginId, currentPmList } = this.props
        return CurrentElementToSubmit.attachmentList.map(fd => {
            let file_name = fd.file_name.split('.')[0]
            let file_type = fd.file_name.split('.')[1]
            return {
                "PM_LIST_ID": currentPmList.PM_LIST_ID,
                "ASSOCIATED_PM_LISTS": `${currentPmList.PM_LIST_ID},`,
                "PM_LIST_ITEM_ID": CurrentElementToSubmit.pmListItemId,
                "PM_LOCATION_UNID": CurrentElementToSubmit.unid,
                "PM_FILE_CATEGORY": "VP",
                "PM_FILE_NAME": file_name,
                "PM_FILE_TYPE": file_type,
                "PM_FILE_SIZE": fd.file_size,
                "PM_FILE_DATA": fd.file_data,
                "LAST_UPDATED_BY": loginId
            }

        })

    }
    async logResponse(CurrentElementToSubmit, respVariableName, respMsg) {

        const { vendorId, loginId, currentPmList, storeTemplateData } = this.props
        let newpmListItemsTmplt = this.props.pmListItemsTmplt.map(plt => {
            if (plt.PS_LOCATION_ID === CurrentElementToSubmit.PS_LOCATION_ID) {
                return {
                    ...plt,
                    [respVariableName]: respMsg
                }
            }
            else {
                return plt
            }
        })
        await storeTemplateData(vendorId, loginId, currentPmList.PM_LIST_ID, newpmListItemsTmplt)

        return;
    }
    async addingLoaders(CurrentElementToSubmit, loadingStatus, laodingStatusValue) {
        const { vendorId, loginId, currentPmList, storeTemplateData } = this.props
        let newpmListItemsTmplt = this.props.pmListItemsTmplt.map(plt => {
            if (plt.PS_LOCATION_ID === CurrentElementToSubmit.PS_LOCATION_ID) {
                return {
                    ...plt,
                    [loadingStatus]: laodingStatusValue
                }
            }
            else {
                return plt
            }
        })
        await storeTemplateData(vendorId, loginId, currentPmList.PM_LIST_ID, newpmListItemsTmplt)

        return;

    }
    formElogPostRequest = (CurrentElementToSubmit, loginId, vendorId, vendorName, pmType) => {
        let title = {

            PO: (!!CurrentElementToSubmit && !!CurrentElementToSubmit.PO_NUM) ? `PO : ${CurrentElementToSubmit.PO_NUM}` : '',
            Line: (!!CurrentElementToSubmit && !!CurrentElementToSubmit.LINE) ? `Line : ${CurrentElementToSubmit.LINE}` : '',
            Schedule: (!!CurrentElementToSubmit && !!CurrentElementToSubmit.SCHEDULE) ? `Schedule : ${CurrentElementToSubmit.SCHEDULE}` : '',
        }
        return {
            "oprtnType": "I",
            "shift": "Day",
            "sendemail": false,
            "privacyflag": "Public",
            "oncall": "No",
            "red_flag": "No",
            "contenttext": `${pmType.toUpperCase()} completed`,
            "files": [],
            "elogtype": "CELL_SITE",
            "login_id": loginId,
            "universalid": CurrentElementToSubmit.unid,
            "unvalue": CurrentElementToSubmit.locationName,
            "meta_createdname": CurrentElementToSubmit["VENDORTECHNAME"],
            "recorded_on": moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A'),
            "subtype": "VENDORPM",
            "subtypename": "WORKORDER",
            "subtypeid": `${title.PO}, ${title.Line}, ${title.Schedule}`,
            "fromsystem": "IOPLite",
            "subject": "",
            "element": "",
            "emailid": "",
            "worktype": "Vendor",
            "vendor": `${vendorId}-${vendorName}`
        }
    }
    async submitReadings(CurrentElementToSubmit, submitStatus) {


        const { vendorId, vendorName, loginId, submitPMQuote, uploadFiles, fetchPmGridDetails, currentPmList, submitGenReadingsRequest, saveElogByWorkOrderID } = this.props


        await this.formPostRequest1(CurrentElementToSubmit, submitStatus).then(postRequest1 => {
            const submitpostRequest1 = {
                updatedData: postRequest1
            }

            this.setState({ submitpostRequest1 })
        })



        var filesPostRequest = {
            "fileList": await this.formFilesPostRequest(CurrentElementToSubmit)
        }

        let elogInput = await this.formElogPostRequest(CurrentElementToSubmit, loginId, vendorId, vendorName, currentPmList.PM_TYPE_NAME)



        if (currentPmList.PM_TYPE_NAME === 'GENERATOR PM') {
            await this.formPostRequest2(CurrentElementToSubmit).then(async (postRequest2) => {




                await submitPMQuote(vendorId, loginId, CurrentElementToSubmit.pmListItemId, this.state.submitpostRequest1).then(async (action) => {

                    if (action.type === 'SUBMIT_PM_QUOTE_SUCCESS') {
                        await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitVpm', true)

                        await this.logResponse(CurrentElementToSubmit, 'respTxtSubmitVpm', 'Submission to vendor portal success')
                        await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitVpm', false)

                        if (CurrentElementToSubmit.attachmentList.length > 0) {
                            await uploadFiles(vendorId, loginId, CurrentElementToSubmit.pmListItemId, filesPostRequest).then(async (action) => {

                                if (action.type === 'UPLOAD_FILES_SUCCESS') {
                                    await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitFiles', true)
                                    await this.logResponse(CurrentElementToSubmit, 'respTxtSubmitFiles', 'Files Submission success')
                                    await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitFiles', false)
                                    if (submitStatus === 'COMPLETE' && submitStatus !== 'PENDING_DRAFT') {
                                        await submitGenReadingsRequest(this.state.pm_unid, this.state.submitpostRequest2).then(async (action) => {


                                            if (action.type === 'SUBMIT_GENTANKDETAILS_SUCCESS' && !!action.savedMessage && action.savedMessage.message === 'Generator Readings updated successfully') {
                                                await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusOpsTrkr', true)

                                                await this.logResponse(CurrentElementToSubmit, 'respTxtSubmitOpsTrkr', 'Submission to ops tracker success')

                                                await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusOpsTrkr', false)



                                            }
                                            else {
                                                await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusOpsTrkr', true)

                                                await this.logResponse(CurrentElementToSubmit, 'respTxtSubmitOpsTrkr', 'Submission to ops tracker failed')
                                                await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusOpsTrkr', false)

                                            }
                                        })
                                            .catch(async e => {
                                                await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusOpsTrkr', true)
                                                await this.logResponse(CurrentElementToSubmit, 'respTxtSubmitOpsTrkr', 'Submission to ops tracker failed')
                                                await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusOpsTrkr', false)
                                            })
                                    }
                                    if (submitStatus === 'COMPLETE' && submitStatus !== 'PENDING_DRAFT') {
                                        await saveElogByWorkOrderID(loginId, elogInput).then(async action => {
                                            if (action.type === 'FETCH_SAVE_ELOG_SUCCESS') {
                                                await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitElog', true)
                                                await this.logResponse(CurrentElementToSubmit, 'respTxtSubmitElog', 'Readings Submission to Elog success')
                                                await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitElog', false)
                                            }
                                        }).catch(async e => {
                                            await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitElog', true)
                                            await this.logResponse(CurrentElementToSubmit, 'respTxtSubmitElog', 'Readings Submission to Elog failed')
                                            await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitElog', false)

                                        })
                                    }
                                }

                            }).catch(async (error) => {

                                if (!!error) {
                                    await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitFiles', true)
                                    await this.logResponse(CurrentElementToSubmit, 'respTxtSubmitFiles', 'Files Submission failed')
                                    await this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitFiles', false)
                                }
                            })
                        }

                    }




                })
                    .catch(e => {
                        this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitVpm', true)
                        this.logResponse(CurrentElementToSubmit, 'respTxtSubmitVpm', 'Submission to vendor portal failed')
                        this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitVpm', false)
                    })

            })



        }
        else if (this.props.currentPmList.PM_TYPE_NAME === 'HVAC PM') {




            await submitPMQuote(vendorId, loginId, CurrentElementToSubmit.pmListItemId, this.state.submitpostRequest1).then(async (action) => {

                if (action.type === 'SUBMIT_PM_QUOTE_SUCCESS') {
                    this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitVpm', true)
                    this.logResponse(CurrentElementToSubmit, 'respTxtSubmitVpm', 'Submission to vendor portal success')
                    this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitVpm', false)


                    if (CurrentElementToSubmit.attachmentList.length > 0) {
                        await uploadFiles(vendorId, loginId, CurrentElementToSubmit.pmListItemId, filesPostRequest).then(async (action) => {

                            if (action.type === 'UPLOAD_FILES_SUCCESS') {
                                this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitFiles', true)

                                this.logResponse(CurrentElementToSubmit, 'respTxtSubmitFiles', 'Files Submission success')
                                this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitFiles', false)
                                if (submitStatus === 'COMPLETE' && submitStatus !== 'PENDING_DRAFT') {
                                    await saveElogByWorkOrderID(loginId, elogInput).then(action => {
                                        if (action.type === 'FETCH_SAVE_ELOG_SUCCESS') {
                                            this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitElog', true)

                                            this.logResponse(CurrentElementToSubmit, 'respTxtSubmitElog', 'Readings Submission to Elog success')
                                            this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitElog', false)

                                        }
                                    }).catch(e => {
                                        this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitElog', true)

                                        this.logResponse(CurrentElementToSubmit, 'respTxtSubmitElog', 'Readings Submission to Elog failed')
                                        this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitElog', false)

                                    })
                                }

                            }

                        }).catch((error) => {

                            if (!!error) {
                                this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitFiles', true)

                                this.logResponse(CurrentElementToSubmit, 'respTxtSubmitFiles', 'Files Submission failed')
                                this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitFiles', false)

                            }
                        })
                    }

                }




            })
                .catch(e => {
                    this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitVpm', true)

                    this.logResponse(CurrentElementToSubmit, 'respTxtSubmitVpm', 'Submission to vendor portal failed')
                    this.addingLoaders(CurrentElementToSubmit, 'loadingStatusSubmitVpm', false)

                })



        }


    }
    async submitUpload(submitStatus) {





        await this.setState({ disableSubmit: true })


        await this.scrollToTop()

        let initialElementToSubmit = this.props.pmListItemsTmplt.filter(plt => plt.itemSelected && plt.pmItemStatus === 'PENDING')[0]

        await this.submitReadings(initialElementToSubmit, submitStatus)

        while (this.props.pmListItemsTmplt.filter(plt => plt.itemSelected && !plt.respTxtSubmitVpm).length > 0) {

            await this.submitReadings(this.props.pmListItemsTmplt.filter(plt => plt.itemSelected && !plt.respTxtSubmitVpm && plt.pmItemStatus === 'PENDING')[0], submitStatus)
        }
        await this.refreshElementStatus()


        return;
    }
    refreshElementStatus = () => {

        const { loginId, vendorId, storeTemplateData, currentPmList, fetchPmGridDetails } = this.props
        fetchPmGridDetails(vendorId, loginId, currentPmList.PM_LIST_ID).then((action) => {
            this.props.fetchSearchedSites(this.props.vendorId, this.props.loginId).then(action => {

                this.props.filterSearchedSites(this.props.vendorId, this.props.loginId, this.props.searchString)
            })
            if (action.type === 'FETCH_PMGRIDDETAILS_SUCCESS') {
                const dataWithStatus = this.props.pmListItemsTmplt.map(dt => {
                    let currentSite = action.pmGridDetails.getPmGridDetails.pmlistitems
                        .filter(pd => pd.PS_LOCATION_ID === dt.PS_LOCATION_ID)[0]
                    if (currentPmList.PM_TYPE_NAME === 'GENERATOR PM')
                        return {
                            ...dt,
                            pmItemStatus: !!currentSite ? currentSite.PM_ITEM_STATUS : null,

                        }
                    else if (currentPmList.PM_TYPE_NAME === 'HVAC PM')
                        return {
                            ...dt,

                            pmItemStatus: !!currentSite ? currentSite.PM_ITEM_STATUS : null,


                        }

                })
                /* Update state */

                storeTemplateData(vendorId, loginId, currentPmList.PM_LIST_ID, dataWithStatus)



            }
        })

        return;
    }


    checkSelected = () => {
        const { pmListItemsTmplt, elogSaveLoading } = this.props
        if (pmListItemsTmplt.filter(plt => plt.itemSelected).length === 0)
            return true
        else if (pmListItemsTmplt.filter(plt => plt.itemSelected).length > 0)
            return false
    }
    render() {


        if (this.props.pmListItemsTmplt.every(plt => !plt.locationName)) {
            return <h4 className="text-danger mt-3 text-center"><b>No data to display</b></h4>
        }
        else {
            return (
                <div className='container'>
                    <a className="navbar-brand pointer float-right" data-tip data-for="Refresh" >
                        <small>
                            <img src={RefreshPage} style={{ height: '27px', cursor: 'pointer' }} onClick={this.props.storeDataPending} />
                        </small>
                    </a>
                    {this.state.disableCheckBoxes && <h4 className='h4 mb-3 text-danger text-center'>File size exceeded</h4>}

                    <table id="excel-detail" className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                        <tbody className="vzwtable text-left">
                            <tr colSpan={"4"}>

                                <th className="Form-group" colSpan="4"><b> SELECT </b> </th>

                                <th className="Form-group" colSpan="4"><b> PS Location ID </b> </th>

                                <th className="Form-group" colSpan="4"><b> Site Name </b> </th>


                                <th className="Form-group" colSpan="4"><b> Attachments </b> </th>


                                <th className="Form-group" colSpan="4"><b> Current submission Status / Error</b> </th>
                                <th className="Form-group" colSpan="4"><b> PM Item Status </b> </th>

                            </tr>
                            {this.props.pmListItemsTmplt.length > 0 && this.props.pmListItemsTmplt.map(ed => {

                                if (!!ed.locationName) {
                                    return (<tr colSpan={"4"} className={ed.pmItemStatus !== 'PENDING' ? "disable-row" : ''}>
                                        <td className="Form-group" colSpan="4">
                                            {!!ed.attachmentList && ed.attachmentList.length > 0 && ed.totalAttachmentsize <= 2000000 && ed.pmItemStatus === 'PENDING' &&
                                                <Checkbox
                                                    onChange={this.handleCheckBoxChange.bind(this, ed.PS_LOCATION_ID)}
                                                    color="default"
                                                    name={ed.PS_LOCATION_ID}
                                                    value={ed.PS_LOCATION_ID}
                                                    disabled={false}
                                                />}
                                            {((!ed.attachmentList || ed.attachmentList.length === 0) || ed.totalAttachmentsize > 2000000 || ed.pmItemStatus !== 'PENDING') &&
                                                <Checkbox
                                                    onChange={this.handleCheckBoxChange.bind(this, ed.PS_LOCATION_ID)}
                                                    color="default"
                                                    name={ed.PS_LOCATION_ID}
                                                    value={ed.PS_LOCATION_ID}
                                                    disabled={true}
                                                />}
                                        </td>
                                        <td className="Form-group" colSpan="4">{!!ed.PS_LOCATION_ID && ed.PS_LOCATION_ID.trim()}</td>
                                        <td className="Form-group" colSpan="4">{!!ed.locationName && ed.locationName.trim()}</td>
                                        <td className="Form-group" colSpan="4">
                                            <div className='row'>
                                                <div className={"col-md-4 text-left"}>

                                                    {ed.pmItemStatus !== 'PENDING' ?
                                                        (<ul>

                                                            {!!ed.attachmentList && ed.attachmentList.map(ad => (<li
                                                                style={{ "cursor": "pointer", "color": "#0000FF" }}><b>{`${ad.filename}`}</b></li>))}
                                                        </ul>) : (<Dropzone
                                                            disabled={true}
                                                            onDrop={this.onFileDrop.bind(this, ed.PS_LOCATION_ID)}>
                                                            {({ getRootProps, getInputProps }) => (
                                                                <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                                                    <div {...getRootProps()}>
                                                                        <input {...getInputProps()} />
                                                                        <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                                                    </div>
                                                                </section>
                                                            )}
                                                        </Dropzone>)}
                                                </div>
                                                <div className="col-md-8 text-center">
                                                    {ed.pmItemStatus === 'PENDING' && (<ListOfFiles onRemoveClick={this.onAttachRemove.bind(this, ed.PS_LOCATION_ID)} fileList={this.getAttchList(ed.PS_LOCATION_ID)} />)}
                                                </div>
                                            </div>
                                        </td>




                                        <td className="Form-group" colSpan="4">
                                            <ul>
                                                {ed.totalAttachmentsize > 2000000 && <li><span className='text-danger'><b>FILE SIZE EXCEEDED</b></span></li>}

                                                {ed.loadingStatusSubmitVpm ? (<Loader color="#cd040b"
                                                    size="20px"
                                                    margin="4px"
                                                    className="text-center" />) : (
                                                    !!ed.respTxtSubmitVpm && !ed.loadingStatusSubmitVpm && <li><span className={ed.respTxtSubmitVpm.includes('failed') ? "text-danger" : 'text-success'}><b>{ed.respTxtSubmitVpm}</b></span></li>)}
                                                {ed.loadingStatusSubmitFiles ? (<Loader color="#cd040b"
                                                    size="20px"
                                                    margin="4px"
                                                    className="text-center" />) : (
                                                    !!ed.respTxtSubmitFiles && !ed.loadingStatusSubmitFiles && <li><span className={ed.respTxtSubmitFiles.includes('failed') ? "text-danger" : 'text-success'}><b>{ed.respTxtSubmitFiles}</b></span></li>)}
                                                {ed.loadingStatusSubmitElog ? (<Loader color="#cd040b"
                                                    size="20px"
                                                    margin="4px"
                                                    className="text-center" />) : (
                                                    !!ed.respTxtSubmitElog && !ed.loadingStatusSubmitElog && <li><span className={ed.respTxtSubmitElog.includes('failed') ? "text-danger" : 'text-success'}><b>{ed.respTxtSubmitElog}</b></span></li>)}
                                                {ed.loadingStatusOpsTrkr ? (<Loader color="#cd040b"
                                                    size="20px"
                                                    margin="4px"
                                                    className="text-center" />) : (
                                                    !!ed.respTxtSubmitOpsTrkr && !ed.loadingStatusOpsTrkr && <li><span className={ed.respTxtSubmitOpsTrkr.includes('failed') ? "text-danger" : 'text-success'}><b>{ed.respTxtSubmitOpsTrkr}</b></span></li>)}
                                            </ul>

                                        </td>



                                        <td className="Form-group" colSpan="4">

                                            {ed.pmItemStatus === 'COMPLETED' ? (<li><span className="text-success"><b>{ed.pmItemStatus}</b></span></li>) : (<li><span className="text-danger"><b>{ed.pmItemStatus}</b></span></li>)}
                                        </td>
                                    </tr>)
                                }
                                else {
                                    return null
                                }
                            }


                            )}



                        </tbody>

                    </table>
                    <button
                        className="Button--secondary float-left"
                        onClick={this.submitUpload.bind(this, 'PENDING_DRAFT')}
                        disabled={this.state.disableSubmit}
                    >Save as Draft</button>
                    <button
                        className="Button--secondary float-right"
                        onClick={this.submitUpload.bind(this, 'COMPLETE')}
                        disabled={this.state.disableSubmit}
                    >Mark as Complete</button>

                </div>)
        }


    }
}

function stateToProps(state, ownProps) {



    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")

    let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
    let vendorId = user.toJS().vendor_id
    let pmListItemsTmplt = state.getIn(['PmDashboard', loginId, vendorId, "pm", 'PmlistItems', ownProps.currentPmList.PM_LIST_ID], List()).toJS()
    let userFname = state.getIn(['Users', 'entities', 'users', loginId, "fname"])
    let vendorName = user.toJS().vendor_name
    let modelAttributes = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'pmModelAttDetails', 'getPmModelAttDetails'], List()).toJS()
    let elogSaveLoading = state.getIn(['Elog', 'elogSaveLoading'])
    let pmListLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmListDetailsLoading"])

    //  let pmListItems =  state.getIn([action.loginId, action.vendorId, "pm", 'PmlistItems', action.pmListId ], fromJS(listItemsWithAttachments))




    // let hvacLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "hvacLoading",ownProps.PMDetails.PM_LIST_ITEM_ID])
    // let genDataLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm",  "genTankloading",ownProps.PMDetails.PM_LIST_ITEM_ID])

    // let genData = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'genTank', ownProps.PMDetails.PM_LIST_ITEM_ID], List()).toJS()
    // let hvacData = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'hvac', ownProps.PMDetails.PM_LIST_ITEM_ID], List()).toJS()
    // let hvacInfoErrors = state.getIn(['PmDashboard', loginId, vendorId, "pm", "hvacerrors", ownProps.PMDetails.PM_LIST_ITEM_ID])
    // let genTankInfoError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "genTankerrors", ownProps.PMDetails.PM_LIST_ITEM_ID])
    // let uploadSuccess = state.getIn(['PmDashboard', loginId, vendorId, "pm", "SubmitUploadDetailsResp", ownProps.PMDetails.PM_LIST_ITEM_ID])
    // let uploadFailure = state.getIn(['PmDashboard', loginId, vendorId, "pm", "SubmitUploadDetailsResp", ownProps.PMDetails.PM_LIST_ITEM_ID])
    // let submissionStatus = state.getIn(['PmDashboard', loginId, vendorId, "pm", "SubmitPMDetailsResp", ownProps.PMDetails.PM_LIST_ITEM_ID])
    // let fetchModelAttError = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmModelAttDetails", 'errors'])



    return {
        user,
        loginId,
        vendorId,
        pmListItemsTmplt,
        modelAttributes,
        elogSaveLoading,
        pmListLoading,
        userFname,
        vendorName
        // genData,
        // hvacData,
        // hvacLoading,
        // hvacInfoErrors,
        // genTankInfoError,
        // uploadSuccess,
        // uploadFailure,
        // submissionStatus,
        //modelAttributes,
        // isGenLoading: state.getIn(["VendorDashboard", "genReadingsRequest", "isloading"], false),
        // savedGenMessage: state.getIn(["VendorDashboard", "genReadingsRequest", "success"], null),
        // errorGenMessage: state.getIn(["VendorDashboard", "genReadingsRequest", "errors"], null),
        // genDataLoading,
        // fetchModelAttError
    }


}
export default connect(stateToProps, { ...pmActions, submitGenReadingsRequest, saveElogByWorkOrderID })(RenderSiteDetails)

