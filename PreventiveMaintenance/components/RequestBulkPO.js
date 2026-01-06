import React, { Component } from 'react'
import { Map, fromJS, List } from 'immutable'
import Loader from '../../Layout/components/Loader'
import Select from 'react-select'
import Checkbox from '@material-ui/core/Checkbox'
import { connect } from "react-redux"
import ListOfFiles from './ListOfFiles'
import Dropzone from 'react-dropzone'
import XLSX from 'xlsx';
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils'
import moment from 'moment'
import * as pmActions from "../actions"
import {getHolidayEvents} from "../../sites/actions"
import { typeAbbrMap } from '../utils'
import {DataGrid} from '@mui/x-data-grid';

class RequestBulkPO extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            manager_id: '',
            buyerId: '',
            buyerObj: {},
            selectedBuyer: { value: '', label: '' },
            selectedManagerId: { value: '', label: '' },
            uploadFileClicked: false,
            droppedFile: {},
            data: [],
            fileError: {
                isError: false,
                message: ''
            },
            ScheduleDateError: {
                isError: false,
                message: ''
            },
            locationIDError: {
                isError: false,
                message: ''
            },
            mdgIDError: {
                isError: false,
                message: ''   
            },
            sitesWithoutMDGId : [],

            pageLoading: false,
            optFilesData: [],
            buyersList: [],
            workCompleted: false,
            vendorName: ' ',
            isBuyerSelected: false,
            selectBuyerObj: {},
            managerObj: {},
            isRequestDisabled: true,
            buyerSelErr: false,
            buyerSelErrMsg: '',
            isDisabled: false,
            sitelistData: [],
            feGrouped: false,
            fastHolidays: null,
            fileUploadLoader:false
        }
        this.getBuyerDetails = this.getBuyerDetails.bind(this)
        this.validateData = this.validateData.bind(this)

    }
    componentDidMount() {

        this.getBuyerDetails()


        this.props.getHolidayEvents().then(res => {
            if (res.type === 'FETCH_HOLIDAYEVENTS_SUCCESS') {
                const fastHolidays = res.holidayEvents && res.holidayEvents.length > 0 ? res.holidayEvents.map((hol) => hol.HOLIDAY_DATE && hol.HOLIDAY_DATE.length > 10 && hol.HOLIDAY_DATE.substring(0, 10)) : []
                this.setState({fastHolidays: fastHolidays})
            }
        })

    }
    async getBuyerDetails() {
        const { loginId, vendorId, fetchBuyerListDetails, fetchSiteListDetails, market, submarket } = this.props
        await fetchBuyerListDetails(vendorId, loginId, market, submarket)
    }

    modifyGridDetails = () => {

        return this.state.data.map((fdata,i) => ({
            id: i+1,
            PS_LOCATION_ID: fdata.PS_LOCATION_ID ? fdata.PS_LOCATION_ID : '',
            MDGLC: fdata.MDGLC ? fdata.MDGLC : '',
            SITE_ID: fdata.SITE_ID ? fdata.SITE_ID : '',
            SITE_NAME: fdata.SITE_NAME ? fdata.SITE_NAME : '',
            PO_TYPE: fdata.PO_TYPE ? fdata.PO_TYPE : '',
            LABOUR_COST: fdata.LABOUR_COST ? fdata.LABOUR_COST : '',
            MATERIAL_COST: fdata.MATERIAL_COST ? fdata.MATERIAL_COST : '',
            GEN_FUEL_COST: fdata.GEN_FUEL_COST ? fdata.GEN_FUEL_COST : '',
            GEN_FUEL_LABOR_COST: fdata.GEN_FUEL_LABOR_COST ? fdata.GEN_FUEL_LABOR_COST : '',
            TOTAL_COST: fdata.TOTAL_COST ? fdata.TOTAL_COST : '',
            SCHEDULED_DATE: fdata.SCHEDULED_DATE ? moment(fdata.SCHEDULED_DATE).format('MM/DD/YYYY') : '',
            DESCRIPTION: fdata.DESCRIPTION ? fdata.DESCRIPTION : ''
        }))

    }
    onGridReady = params => {
        this.gridOptions = params
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
        this.gridApi.setFilterModel(null)
        if (params.api && params.api.sizeColumnsToFit) { params.api.sizeColumnsToFit() }
        params.api.sizeColumnsToFit();
        this.gridApi.sizeColumnsToFit();
    };

    renderLoading = () => {
        return (
            <div className="mb-3">
                <Loader color="#cd040b"
                    size="40px"
                    margin="4px"
                    className="text-center" />
            </div>
        )
    }
   
    handleCheckBox = (e) => {

        this.setState({
            workCompleted: e.target.checked
        }, () => {
            this.validateData()
        })


    }
    formPostRequest = () => {
        var firstElement = this.state.data[0]
        const { market, submarket, pmRefDetails, vendorId, user, expenseProjId, wbscodes, buyerListDetails } = this.props
        let mmid =!!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0].MMID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0].MMID : '';
        let vendor_mdgid= !!user && user.group_vendors.filter(i =>i.vendor_id == vendorId).length > 0 ? user.group_vendors.filter(i =>i.vendor_id == vendorId)[0].vendor_mdg_id : ''


        return {
            "createList": {
                "pmList": {
                    "pm_list_year": moment().format('YYYY'),
                    "pm_type": firstElement["PO_TYPE"],
                    "frequency": "Adhoc",
                    "market": market,
                    "sub_market": submarket,
                    "pm_group": pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0].PO_GROUP,
                    "manager": !!this.state.managerObj ? this.state.managerObj.lname + ', ' + this.state.managerObj.fname : '',
                    "manager_id": !!this.state.managerObj.userid ? this.state.managerObj.userid : '',
                    "location_type": "SITE",
                    "mmid":!!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0].MMID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0].MMID : '',
                    "ps_item_id": !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0] && !!pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0].PARTENT_ITEM_ID ? pmRefDetails.filter(prd => prd.PM_TYPE_NAME === firstElement.PO_TYPE)[0].PARTENT_ITEM_ID : '',
                    "buyer": !!this.state.selectedBuyer && !!this.state.selectedBuyer.label ? this.state.selectedBuyer.label : '',
                    "buyer_id": !!this.state.buyerObj.userid ? this.state.buyerObj.userid : '',
                    "emp_id": this.state.buyerObj.empid,
                    "enterprise_id": this.state.buyerObj.enterprise_id,
                    "createdBy_EID": this.state.buyerObj.enterprise_id,
                    "modifiedBy_EID":this.state.buyerObj.enterprise_id,
                    "creator": !!user ? user.vendor_name : '',
                    "approver": '',
                    "vendor_id": vendorId,
                    "vendor_name": !!user ? user.vendor_name : '',
                    "vendor_psid": !!this.props.userList && this.props.userList.length>0 && this.props.userList[0].vendor_peoplesoft_id ? this.props.userList[0].vendor_peoplesoft_id : '',
                    "vendor_mdgid" : !!vendor_mdgid ? vendor_mdgid : '',
                    "po_bu": '',
                    "cost_center": "8600",
                    "product_cd": "200",
                    "expense_proj_id": !!expenseProjId && expenseProjId.length == 1 ? expenseProjId[0] : !!expenseProjId && expenseProjId.length > 1 ? null : '',
                    "wbs_element": !!wbscodes && wbscodes.length == 1 ? wbscodes[0] : '' ,
                    "po_email_distro": !!buyerListDetails && !!buyerListDetails.po_info && buyerListDetails.po_info.poEmailDetails.length > 0 ? buyerListDetails.po_info.poEmailDetails[0].po_emails : '',
                    "po_num": '',
                    "pm_list_status": "REQUESTED",
                    "ps_poll_ind": "N",
                    "po_entered_date": '',
                    "apply_pm_vendor": "N",
                    "is_list_completed": !!this.state.workCompleted ? 'Y' : 'N',
                    "is_vendor_requested": 'Y',
                    "buyer_email": !!this.state.buyerObj ? this.state.buyerObj.email : '',
                    "vendor_email":  (this.props.userList?.length>0 && this.props.userList[0].vendor_service_email) ?  this.props.userList[0].vendor_service_email : "",//service email
                    "manager_email": this.state.managerObj.email, //didn't get manager email
                    "associated_type_id": []
                },
                "siteOrSwitchList": this.formSiteSwitchArr(mmid)
            }
        }
    }

    splitRow = (currentVal) => {
        var includeGenFuel = ['GENERATOR REPAIR', 'GENERATOR FUEL', 'TRANSFER SWITCH REPAIR']
        var GenFuelandRepair = ['GENERATOR REPAIR', 'GENERATOR FUEL']
        var costArr = []
        if (currentVal["PO_TYPE"] !== 'GENERATOR FUEL' && !!parseFloat(currentVal["MATERIAL_COST"]) && parseFloat(currentVal["MATERIAL_COST"]) > 0) {
            costArr.push("MATERIAL_COST")
        }
        if (includeGenFuel.includes(currentVal["PO_TYPE"]) && !!parseFloat(currentVal["GEN_FUEL_COST"]) && parseFloat(currentVal["GEN_FUEL_COST"]) > 0) {
            costArr.push("GEN_FUEL_COST")
        }
        if (GenFuelandRepair.includes(currentVal["PO_TYPE"]) && !!parseFloat(currentVal["GEN_FUEL_COST"]) && parseFloat(currentVal["GEN_FUEL_COST"]) > 0 && !!parseFloat(currentVal["GEN_FUEL_LABOR_COST"]) && parseFloat(currentVal["GEN_FUEL_LABOR_COST"]) > 0) {
            costArr.push("GEN_FUEL_LABOR_COST")
        }
        if (!!parseFloat(currentVal["LABOUR_COST"]) && parseFloat(currentVal["LABOUR_COST"]) > 0) {
            costArr.push("LABOUR_COST")
        }
        return costArr
    }
    getEmpId = (tech_id) => {
        return !!this.props.buyerListDetails.feandmgrs.find(data => data.userid.toLowerCase() === tech_id.toLowerCase()) ? this.props.buyerListDetails.feandmgrs.find(data => data.userid.toLowerCase() === tech_id.toLowerCase()) : null
    }
    getItemId = (currentRow, cost) => {
        var refDataWithoutGO95 = this.props.pmRefDetails.filter(data => data.PM_TYPE_NAME !== 'GO95')
        var currentRowMap = refDataWithoutGO95.find(prd => prd.PM_TYPE_NAME === currentRow.PO_TYPE)

        if (cost === 'GEN_FUEL_LABOR_COST') {
            cost = 'GEN_FUEL_COST'
        }
        if (currentRowMap.PO_GROUP === 'PM') {
            return currentRowMap.PARTENT_ITEM_ID
        }
        else if (currentRowMap.PO_GROUP === 'REPAIR') {
            return this.props.pmRefDetails.find(prd => prd.PM_TYPE_NAME === currentRow.PO_TYPE && prd.PO_DESCRIPTION === cost).CHILD_ITEM_ID
        }
    }
    formSiteSwitchArr = (mmid) => {
        const referenceElement = this.state.data[0]
        if (this.props.pmRefDetails.filter(prd => prd.PM_TYPE_NAME === referenceElement.PO_TYPE)[0].PO_GROUP === 'PM') {
            return this.state.data.map(val => {
                const currentSite = !!this.props.siteListDetails && this.props.siteListDetails.length > 0 ?
                this.props.erpFlag == 'N' ? this.props.siteListDetails.find(sld => sld.ps_loc === val.PS_LOCATION_ID.trim()) : this.props.siteListDetails.find(sld => sld.mdg_id === val.MDGLC.trim()) : {}
                const { site_id, site_name, site_status, meta_universalid,company_code, ps_loc, tech_id, tech_name, soa, site_priority, site_callout_zone, manager_id, manager_name } = currentSite
                return {
                    "name": `${site_id}^${site_name}`,
                    "status": site_status,
                    "unid": meta_universalid,
                    "ps_loc_id": ps_loc,
                    "locus_id" : currentSite.locus_id ? currentSite.locus_id : '',
                    "switch_name": currentSite.switch,
                    "location_manager": manager_name,
                    "location_manager_id": manager_id,
                    "fe": tech_name,
                    "fe_id": tech_id,
                    "emp_id": this.getEmpId(tech_id)?.empid || "",
                    "enterprise_id": this.getEmpId(tech_id)?.enterprise_id || "",
                    "buyer_email": this.getEmpId(tech_id)?.email || "",
                    "manufacturer": !!currentSite.equipmentinfo && currentSite.equipmentinfo.length > 0 ? currentSite.equipmentinfo[0].manufacturer : '',
                    "mdg_id" : currentSite.mdg_id ? currentSite.mdg_id : '',
                    "company_code" : company_code ? company_code : '',
                    "mmid": mmid,
                    "soa": moment(soa).format('DD/MM/YYYY'),
                    "pm_cost": val.TOTAL_COST ? val.TOTAL_COST : '',
                    "pm_item_start_date": moment().format('DD/MM/YYYY'),
                    "pm_item_due_date": val.NEW_SCHEDULED_DATE && val.NEW_SCHEDULED_DATE != null ? moment(val.NEW_SCHEDULED_DATE).format('DD/MM/YYYY') : moment(val.SCHEDULED_DATE).format('DD/MM/YYYY'),
                    "pm_item_status": '',
                    "default_pm_vendor_id": "",
                    "default_pm_vendor_name": "",
                    "site_priority": site_priority,
                    "equipment_status": "",
                    "site_callout_zone": site_callout_zone,
                    "included_in_pmlist": "Y",
                    "po_item_id": this.getItemId(val),
                    "description": val.DESCRIPTION,
                    "total_cost": val.TOTAL_COST ? val.TOTAL_COST : '',
                    "scheduled_date": val.NEW_SCHEDULED_DATE && val.NEW_SCHEDULED_DATE != null ? moment(val.NEW_SCHEDULED_DATE).format('DD/MM/YYYY') : moment(val.SCHEDULED_DATE).format('DD/MM/YYYY'),
                    "po_item_description": ''
                }
            })
        }
        else if (this.props.pmRefDetails.filter(prd => prd.PM_TYPE_NAME === referenceElement.PO_TYPE)[0].PO_GROUP === 'REPAIR') {
            let formedList = []
            this.state.data.forEach(val => {
                this.splitRow(val).forEach(cost => {
                   const currentSite = !!this.props.siteListDetails && this.props.siteListDetails.length > 0 ?
                    this.props.erpFlag == 'N' ? this.props.siteListDetails.find(sld => sld.ps_loc === val.PS_LOCATION_ID.trim()) : this.props.siteListDetails.find(sld => sld.mdg_id === val.MDGLC.trim()) : {}
                    const { site_id, site_name, site_status, meta_universalid,company_code, ps_loc, tech_id, tech_name, soa, site_priority, site_callout_zone, manager_name, manager_id } = currentSite
                    formedList.push({
                        "name": `${site_id}^${site_name}`,
                        "status": site_status,
                        "unid": meta_universalid,
                        "ps_loc_id": ps_loc,
                        "switch_name": currentSite.switch,
                        "location_manager": manager_name,
                        "location_manager_id": manager_id,
                        "fe": tech_name,
                        "fe_id": tech_id,
                        "emp_id": this.getEmpId(tech_id)?.empid || "",
                        "enterprise_id": this.getEmpId(tech_id)?.enterprise_id || "",
                        "buyer_email": this.getEmpId(tech_id)?.email || "",
                        "mdg_id" : currentSite.mdg_id ? currentSite.mdg_id : '',
                        "company_code" : company_code ? company_code : '',
                        "mmid": mmid,
                        "manufacturer": !!currentSite.equipmentinfo && currentSite.equipmentinfo.length > 0 ? currentSite.equipmentinfo[0].manufacturer : '',
                        "soa": moment(soa).format('DD/MM/YYYY'),
                        "pm_cost": val[cost],
                        "pm_item_start_date": moment().format('DD/MM/YYYY'),
                        "pm_item_due_date": val.NEW_SCHEDULED_DATE && val.NEW_SCHEDULED_DATE != null ? moment(val.NEW_SCHEDULED_DATE).format('DD/MM/YYYY') : moment(val.SCHEDULED_DATE).format('DD/MM/YYYY'),
                        "pm_item_status": '',
                        "default_pm_vendor_id": "",
                        "default_pm_vendor_name": "",
                        "site_priority": site_priority,
                        "equipment_status": "",
                        "site_callout_zone": site_callout_zone,
                        "included_in_pmlist": "Y",
                        "po_item_id": this.getItemId(val, cost),
                        "description": val.DESCRIPTION,
                        "total_cost": val.TOTAL_COST,
                        "scheduled_date": val.NEW_SCHEDULED_DATE && val.NEW_SCHEDULED_DATE != null ? moment(val.NEW_SCHEDULED_DATE).format('DD/MM/YYYY') : moment(val.SCHEDULED_DATE).format('DD/MM/YYYY'),
                        "po_item_description": cost === 'LABOUR_COST' ? 'LABOUR' : cost === 'MATERIAL_COST' ? 'MATERIAL' : cost === 'GEN_FUEL_COST' ? 'FUEL' : cost === 'GEN_FUEL_LABOR_COST' ? 'FUEL LABOUR' : ''
                    })
                })



            })

            return formedList


        }

    }

    getRefName = () => {
        let vendorNameProcessed = '', vendorName = this.props.user['vendor_name'].split('##')[0]
        vendorName = vendorName.includes('-') ? vendorName.substring(0, vendorName.indexOf('-')) : vendorName
        vendorName = (vendorName.includes('(') && vendorName.includes(')')) ?
            vendorName.substring(0, vendorName.indexOf('(')) + vendorName.substring(vendorName.indexOf(')') + 1, vendorName.length) : vendorName
        vendorName = (vendorName.includes('[') && vendorName.includes(']')) ?
            vendorName.substring(0, vendorName.indexOf('[')) + vendorName.substring(vendorName.indexOf(']') + 1, vendorName.length) : vendorName
        vendorName = vendorName.trimLeft()
        let vendorNameFirst = vendorName.split(' ')[0], vendorNameSecond = vendorName.split(' ')[1]
        vendorNameProcessed += (vendorNameFirst && vendorNameFirst.length > 4 ? vendorNameFirst.substring(0, 4) : vendorNameFirst)
        vendorNameProcessed += vendorNameSecond ? '-' : ''
        vendorNameProcessed += vendorNameSecond && vendorNameSecond.length > 8 - vendorNameProcessed.length ? vendorNameSecond.substring(0, 8 - vendorNameProcessed.length) : vendorNameSecond ? vendorNameSecond : ''
        let buyerName = this.state.selectedBuyer.label.split(',').map(i => i.trim()), buyerNameProcessed = ''
        buyerNameProcessed = buyerName.length && buyerName[0].length > 5 ? buyerName[0].substring(0, 5) : buyerName[0] ? buyerName[0] : ''
        buyerNameProcessed += buyerName[1] && buyerName[1].length > 2 ? buyerName[1].substring(0, 2) : buyerName[1] ? buyerName[1] : ''
        let mgrInitials = `${this.state.managerObj.lname ? this.state.managerObj.lname.substring(0, 1) : ''}${this.state.managerObj.fname ? this.state.managerObj.fname.substring(0, 1) : ''}`
        return `${typeAbbrMap[this.state.data[0].PO_TYPE]}_${vendorNameProcessed}-${buyerNameProcessed}${mgrInitials}${moment().year()}`
    }
    formFilesPostRequest = () => {
        const { currentPmListID, PMDetails, loginId } = this.props
        let combinedFileData = [this.state.droppedFile, ...this.state.optFilesData]

        return combinedFileData.map(fd => {
            let file_name = fd.file_name.split('.')[0]
            let file_type = fd.file_name.split('.')[1]
            return {
                "PM_LIST_ID": Number(this.props.createdPMList),
                "ASSOCIATED_PM_LISTS": `${this.props.createdPMList},`,
                "PM_LIST_ITEM_ID": null,
                "PM_LOCATION_UNID": null,
                "PM_FILE_CATEGORY": "IOP",
                "PM_FILE_NAME": file_name,
                "PM_FILE_TYPE": file_type || 'xlsx',
                "PM_FILE_SIZE": fd.file_size,
                "PM_FILE_DATA": fd.file_data,
                "LAST_UPDATED_BY": !!this.props.user ? this.props.user.vendor_name : '',
            }

        })

    }
    async onSubmit() {

        const { createPMList, vendorId, loginId } = this.props
        const postRequest = await this.formPostRequest()
        const refName = 'HVC1_ADVA-ENG-COLLJICJ2020'
        await createPMList(vendorId, loginId, this.props.refName, this.state.feGrouped, postRequest).then(action => {
            if (action.type === 'CREATE_PM_LIST_SUCCESS') {
                var filesPostRequest = {
                    "fileList": this.formFilesPostRequest()
                }
                this.props.notiref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "List creation successful"
                })
                this.props.handleHideRequestBulkPOModel()
                this.props.initPMDashboard()

                this.props.uploadFiles(vendorId, loginId, this.props.refName, filesPostRequest, true).then((action) => {

                    if (action.type === 'UPLOAD_FILES_SUCCESS_BULKPO') {

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
            else {
                this.props.notiref.addNotification({
                    title: 'error',
                    position: "br",
                    level: 'error',
                    message: "List creation failed"
                })
            }
        })




    }
    onOptionalFileDrop = (files) => {
        files.forEach(file => {

            if (file['size'] > 0) {

                var reader = new window.FileReader()
                reader.onload = function () {

                    var dataURL = reader.result

                    var optionalDropFile = {
                        file_name: file['name'],
                        file_type: file['type'],
                        file_size: file['size'] + '',
                        file_data: dataURL,
                        preview: file['preview'],
                        filename: file['name'],
                        last_modified: file['lastModifiedDate']
                    }

                    this.setState({
                        optFilesData: this.state.optFilesData.concat(optionalDropFile)
                    })
                    this.forceUpdate()
                }.bind(this)
                reader.readAsDataURL(file)
            }
        })
    }
    async onFileDrop(files) {
        var file = files[0]
        let file_name = file.name.split('.')[0]
        let file_type = file.name.split('.')[1]
        this.setState({ fileUploadLoader: true })
        if (file['size'] > 0) {

            var reader1 = new window.FileReader()
            reader1.onload = function () {

                var dataURL = reader1.result

                var droppedFile = {
                    file_name,
                    file_type: 'xlsx',
                    file_data: dataURL,
                    file_size: file['size'] + '',
                    preview: file['preview'],
                    filename: file['name'],
                    last_modified: file['lastModifiedDate']

                }

                this.setState({
                    droppedFile
                })
                this.forceUpdate()
            }.bind(this)
            await reader1.readAsDataURL(file)
        }


        if (file_type === 'xlsx' || file_type === 'csv' || file_type === 'xls') {


            const reader = new FileReader();
            const rABS = !!reader.readAsBinaryString;
            reader.onload = (e) => {



                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
                const make_cols = refstr => {
                    let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
                    for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i }
                    return o;
                };
                let newData =[]
                let sitesWithoutMDGId = []


                data.forEach((dat) => {
                    if(dat.MDG_ID){
                        dat["MDGLC"] = dat.MDG_ID
                        delete dat.MDG_ID
                    }
                })


                if(this.props.erpFlag == 'N'){
                    newData = data.filter(dt => !!dt["PS_LOCATION_ID"] && !!dt["SITE_ID"] && !!dt["SITE_NAME"]).map(val => ({
                    ...val,
                    PO_TYPE: val.PO_TYPE.trim().toUpperCase(),
                    TOTAL_COST: val.TOTAL_COST ? Math.round(Math.abs(val.TOTAL_COST) * 100) / 100 : null,
                    LABOUR_COST: val.LABOUR_COST ? val.LABOUR_COST > 0 ? Math.round(Math.abs(val.LABOUR_COST)* 100) / 100: val.LABOUR_COST : val.LABOR_COST ? val.LABOR_COST > 0 ? Math.round(Math.abs(val.LABOR_COST)* 100) / 100: val.LABOR_COST: null,
                    MATERIAL_COST: val.MATERIAL_COST ? val.MATERIAL_COST > 0 ? Math.round(Math.abs(val.MATERIAL_COST)* 100) / 100 : val.MATERIAL_COST : null ,
                    GEN_FUEL_COST: val.GEN_FUEL_COST ? val.GEN_FUEL_COST > 0 ? Math.round(Math.abs(val.GEN_FUEL_COST)* 100) / 100 : val.GEN_FUEL_COST : null,
                    GEN_FUEL_LABOR_COST: val.GEN_FUEL_LABOR_COST ? val.GEN_FUEL_LABOR_COST > 0 ? Math.round(Math.abs(val.GEN_FUEL_LABOR_COST)* 100) / 100: val.GEN_FUEL_LABOR_COST : null,
              }))
                }
                else{
                    newData = data.filter(dt => !!dt["MDGLC"] && !!dt["SITE_ID"] && !!dt["SITE_NAME"]).map(val => ({
                        ...val,
                        PO_TYPE: val.PO_TYPE.trim().toUpperCase(),
                        TOTAL_COST: val.TOTAL_COST ? Math.round(Math.abs(val.TOTAL_COST) * 100) / 100 : null,
                        LABOUR_COST: val.LABOUR_COST ? val.LABOUR_COST > 0 ? Math.round(Math.abs(val.LABOUR_COST)* 100) / 100: val.LABOUR_COST : val.LABOR_COST ? val.LABOR_COST > 0 ? Math.round(Math.abs(val.LABOR_COST)* 100) / 100: val.LABOR_COST: null,
                        MATERIAL_COST: val.MATERIAL_COST ? val.MATERIAL_COST > 0 ? Math.round(Math.abs(val.MATERIAL_COST)* 100) / 100 : val.MATERIAL_COST : null ,
                        GEN_FUEL_COST: val.GEN_FUEL_COST ? val.GEN_FUEL_COST > 0 ? Math.round(Math.abs(val.GEN_FUEL_COST)* 100) / 100 : val.GEN_FUEL_COST : null,
                        GEN_FUEL_LABOR_COST: val.GEN_FUEL_LABOR_COST ? val.GEN_FUEL_LABOR_COST > 0 ? Math.round(Math.abs(val.GEN_FUEL_LABOR_COST)* 100) / 100: val.GEN_FUEL_LABOR_COST : null,
                    }))
                    sitesWithoutMDGId= data.filter(dt => !dt["MDGLC"] && !!dt["SITE_ID"] && !!dt["SITE_NAME"])
                    }

                this.setState({
                    data: newData, buyerSelErr: false, sitesWithoutMDGId : sitesWithoutMDGId,fileUploadLoader:false
                }, async () => {
                    await this.validateWithSitesData()
                    await this.setState({ pageLoading: true })
                    await this.validateData()
                    await this.setState({ pageLoading: false })
                })
            };

            if (rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
        }
        else { }

    }


    async checkForDuplicatesSitesInOpstrackerAPI() {
        var siteLocationIdMap = {};
        var opstrackerSiteDetails = this.state.sitelistData;
        for (let i = 0; i < opstrackerSiteDetails.length; i++) {
            let psLocId = this.props.erpFlag == 'N' ? opstrackerSiteDetails[i].ps_loc.toLowerCase().trim() : opstrackerSiteDetails[i].mdg_id.toLowerCase().trim();
            let siteName = opstrackerSiteDetails[i].site_name.toLowerCase().trim();
            if (siteLocationIdMap[psLocId]) {
                let existingopstrackerSites = siteLocationIdMap[psLocId];
                existingopstrackerSites.add(siteName);
                siteLocationIdMap[psLocId] = existingopstrackerSites;
            } else {
                let opstrackerSites = new Set();
                opstrackerSites.add(siteName);
                siteLocationIdMap[psLocId] = opstrackerSites;
            }
        }

        var excelDetails = this.state.data;
        var duplicateSitesOpstracker = [];
        for (let i = 0; i < excelDetails.length; i++) {
            let psLocId = this.props.erpFlag == 'N' ? excelDetails[i].PS_LOCATION_ID.toLowerCase().trim() : excelDetails[i].MDGLC.toLowerCase().trim() ;
            let siteNames = siteLocationIdMap[psLocId];
            if (siteNames) {
                let siteNamesLength = siteNames.size;
                if (siteNamesLength > 1) {
                    duplicateSitesOpstracker.push(psLocId);
                }
            }
        }

        return duplicateSitesOpstracker;
    }

    async checkForDuplicateSitesInExcel() {
        var siteLocationIdMap = {};
        var excelData = this.state.data;
        for (let i = 0; i < excelData.length; i++) {
            let psLocationId = this.props.erpFlag == 'N' ? excelData[i].PS_LOCATION_ID.toLowerCase().trim() : excelData[i].MDGLC.toLowerCase().trim() ;
            let poType = excelData[i].PO_TYPE.toLowerCase().trim();
            let siteNameExcelToLowerCase = excelData[i].SITE_NAME.toLowerCase().trim()
            if (siteLocationIdMap[psLocationId]) {
                let existingSitesNames = siteLocationIdMap[psLocationId];
                existingSitesNames.add(siteNameExcelToLowerCase + poType);
                siteLocationIdMap[psLocationId] = existingSitesNames;
            } else {
                let sitesNameInExcel = new Set();
                sitesNameInExcel.add(siteNameExcelToLowerCase + poType);
                siteLocationIdMap[psLocationId] = sitesNameInExcel;
            }
        }

        var excelDetails = this.state.data;
        var duplicateSitesInExcel = new Set();
        for (let i = 0; i < excelDetails.length; i++) {
            let psLocationId = this.props.erpFlag == 'N' ? excelDetails[i].PS_LOCATION_ID.toLowerCase().trim() : excelDetails[i].MDGLC.toLowerCase().trim();
            let siteNames = siteLocationIdMap[psLocationId];
            if (siteNames) {
                let siteNamesLength = siteNames.size;
                if (siteNamesLength > 1) {
                    duplicateSitesInExcel.add(psLocationId);
                }
            }
        }

        return duplicateSitesInExcel;
    }

    async validateWithSitesData() {

        let selectedSiteListlocId = this.state.sitelistData.map(data => data.ps_loc.toLowerCase().trim())
        let selectedSiteListsiteId = this.state.sitelistData.map(data => data.site_name.toLowerCase().trim())
        var mismatchedLocId = [], isDataValid = false, mismatchedSiteNames = [], mismatchedMdgId = []

        
        if(this.props.erpFlag == 'Y'){
            if(this.state.sitesWithoutMDGId.length > 0){
                const mdgIDError = {
                        isError: true,
                        message: `${this.state.sitesWithoutMDGId.length} site(s) are missing MDGLC : ${this.state.sitesWithoutMDGId.map(s => s.SITE_NAME).toString()}` 
                }
                this.setState({ mdgIDError })
            }else{
                let selectedSiteListMdgId = this.state.sitelistData.map(data => data.mdg_id.toLowerCase().trim())
                this.state.data.map((rowdata, index) => {
                    if (!(selectedSiteListMdgId.includes(rowdata.MDGLC.toLowerCase().trim()))) {
                        mismatchedMdgId.push(rowdata.MDGLC);
                    }
                });

                // console.log(mismatchedMdgId)

                if(mismatchedMdgId.length > 0){
                    const mdgIDError = {
                        isError: true,
                        message: 'The MDGLC(s) ' + mismatchedMdgId + ' in the uploaded file do not belong to the selected manager '
                    }
                    this.setState({ mdgIDError })
                }
            }
        }
        else{
        this.state.data.map((rowdata, index) => {
            if (selectedSiteListlocId.includes(rowdata.PS_LOCATION_ID?.toLowerCase().trim())) {
                isDataValid = true
                this.setState({ buyerSelErr: false });

            } else {
                mismatchedLocId.push(rowdata.PS_LOCATION_ID);
                isDataValid = false;
            }
        });
        }
        if (mismatchedMdgId.length == 0) {
            this.state.data.map((rowdata, index) => {
                if (selectedSiteListsiteId.includes(rowdata.SITE_NAME.toLowerCase().trim())) {
                    isDataValid = true
                    this.setState({ buyerSelErr: false });
                } else {
                    mismatchedSiteNames.push(rowdata.SITE_NAME);
                    isDataValid = false
                }
            });
        }

        let isMultipleSitesPresentInOpstrackerforLocId = await this.checkForDuplicatesSitesInOpstrackerAPI();
        let isMultipleSitesPresentInExcelForLocId = await this.checkForDuplicateSitesInExcel();
        if (this.props.erpFlag == 'N' && mismatchedLocId.length > 0) {
            const locationIDError = {
                isError: true,
                message: 'The pslocid(s) ' + mismatchedLocId + ' in the uploaded file do not belong to the selected manager '
            }
            this.setState({ locationIDError })
        }
        //     else if(mismatchedSiteNames.length > 0){
        //         const locationIDError = {
        //               isError: true,
        //               message: 'The sitename(s) '+mismatchedSiteNames+' in the uploaded file do not belong to the selected manager '
        //              }
        //       this.setState({ locationIDError })
        //   }

        else if (isMultipleSitesPresentInOpstrackerforLocId.length > 0) {
            const locationIDError = {
                isError: true,
                message: 'Following Location ID(s) have multiple sites mapped in opstracker: ' + isMultipleSitesPresentInOpstrackerforLocId
            }
            this.setState({ locationIDError })
        }
        else if (isMultipleSitesPresentInExcelForLocId.size > 0) {
            const locationIDError = {
                isError: true,
                message: 'Following Location ID(s) have multiple sites mapped in uploaded file : ' + Array.from(isMultipleSitesPresentInExcelForLocId).join(' ') + '. Multiple sites cannot be allocated for a location ID'
            }
            this.setState({ locationIDError })
        } else {
            const locationIDError = {
                isError: false,
                message: ''
            }
            this.setState({ locationIDError })
        }




        {
            (!this.state.selectedBuyer.value.length > 0 || Object.keys(this.state.droppedFile).length < 1 || !isDataValid || this.state.fileError.isError) ? (this.setState({ isRequestDisabled: true })) : (this.setState({ isRequestDisabled: false }))
        }





    }
    async validateData() {

        var referenceElement = this.state.data[0]
        if (this.state.data.length >= 2000 || this.state.data.length < 1) {
            const fileError = {
                isError: true,
                message: 'File should contain minimum 1 row and should not exceed 2000 rows'
            }
            await this.setState({ fileError, isDisabled: false, workCompleted: false })
        }

        else if (this.props.erpFlag == 'N' &&
            this.state.data.filter(val => !(val.PS_LOCATION_ID) || !(val.SITE_ID) || !(val.SITE_NAME) || !(val.PO_TYPE) || !(val.SCHEDULED_DATE) || !(val.DESCRIPTION)).length > 0) {
            const fileError = {
                isError: true,
                message: 'Please enter all the required details'
            }
            await this.setState({ fileError, isDisabled: true })
        }
        else if (this.props.erpFlag == 'Y' &&
            this.state.data.filter(val => !(val.MDGLC) || !(val.SITE_ID) || !(val.SITE_NAME) || !(val.PO_TYPE) || !(val.SCHEDULED_DATE) || !(val.DESCRIPTION)).length > 0) {
            const fileError = {
                isError: true,
                message: 'Please enter all the required details'
            }
            await this.setState({ fileError, isDisabled: true })
        }
        // else if (this.props.erpFlag == 'Y' && this.state.sitesWithoutMDGId.length > 0 ) {
        // const fileError = {
        //     isError: true,
        //     message: `${this.state.sitesWithoutMDGId.length} site(s) are missing MDG_ID : ${this.state.sitesWithoutMDGId.map(s => s.SITE_NAME).toString()}` 
        // }
    //     await this.setState({ fileError, isDisabled: true })
    // }
        else if (this.state.data.filter(val => isNaN(val.LABOUR_COST) || isNaN(val.MATERIAL_COST) || isNaN(val.GEN_FUEL_COST) || isNaN(val.TOTAL_COST)).length > 0) {
            const fileError = {
                isError: true,
                message: 'Please enter the valid cost in numeric value without $ or other special characters'
            }
            await this.setState({ fileError, isDisabled: false, workCompleted: false })
        }

        else if (this.state.data.filter(val => val.TOTAL_COST == 0).length > 0) {
            const fileError = {
                isError: true,
                message: 'Total cost should be more than zero'
            }
            await this.setState({ fileError, isDisabled: false, workCompleted: false })
        }

        else if (this.props.pmRefDetails.filter(prd => prd.PM_TYPE_NAME === referenceElement.PO_TYPE)[0].PO_GROUP === 'PM' || this.state.data.filter(val => val.PO_TYPE === 'GENERATOR PM' || val.PO_TYPE === 'HVAC PM').length > 0) {
            if (!this.state.data.every(val => val.PO_TYPE === referenceElement.PO_TYPE)) {

                const fileError = {
                    isError: true,
                    message: 'Cannot request PO for multiple PO Types'
                }
                await this.setState({ fileError, isDisabled: true })
            }
            else if (referenceElement.PO_TYPE === 'GENERATOR PM') {
                if (!this.state.data.every(val => !Number(val.LABOUR_COST) && !Number(val.MATERIAL_COST) && !Number(val.GEN_FUEL_COST) && !!Number(val.TOTAL_COST))) {
                    const fileError = {
                        isError: true,
                        message: 'Only total cost is allowed for selected PO Type'
                    }
                    await this.setState({ fileError, isDisabled: true })
                }
                else {
                    const fileError = {
                        isError: false,
                        message: ''
                    }
                    await this.setState({ fileError, isDisabled: true, workCompleted: false })
                }


            }
            else if (referenceElement.PO_TYPE === 'HVAC PM') {
                if (!this.state.data.every(val => !Number(val.LABOUR_COST) && !Number(val.MATERIAL_COST) && !!Number(val.TOTAL_COST))) {
                    const fileError = {
                        isError: true,
                        message: 'Only total cost is allowed for selected PO Type'
                    }
                    await this.setState({ fileError, isDisabled: true })
                }
                else {
                    const fileError = {
                        isError: false,
                        message: ''
                    }
                    await this.setState({ fileError, isDisabled: true, workCompleted: false })
                }
            }
            else {
                const fileError = {
                    isError: false,
                    message: ''
                }
                await this.setState({ fileError, isDisabled: false })
            }




        }
        else if (this.props.pmRefDetails.filter(prd => prd.PM_TYPE_NAME === referenceElement.PO_TYPE)[0].PO_GROUP === 'REPAIR') {
            if (!this.state.data.every(val => !!Number(val.LABOUR_COST) || !!Number(val.MATERIAL_COST) || !!Number(val.GEN_FUEL_COST))) {
                const fileError = {
                    isError: true,
                    message: 'Atleast one cost needs to be entered for selected PO Type'
                }
                await this.setState({ fileError, isDisabled: true })
            }
            else {
                const fileError = {
                    isError: false,
                    message: ''
                }
                await this.setState({ fileError, isDisabled: false })
            }
        }
        else {
            const fileError = {
                isError: false,
                message: ''
            }
            await this.setState({ fileError, isDisabled: false })
        }
        this.validateScheduleDate()

    }

    addDate = (date) => {

        //if saturday, become monday
        if (moment(date).day() == 6) {
            date = moment(date).add(2, 'd');
        }

        //if sunday, become monday
        if (moment(date).day() == 0 || moment(date).day() == 7) {
            date = moment(date).add(1, 'd');
        }

        //if still a fast holiday loop continously and increment until date is not a holiday.
        while (true) {
            if (this.state.fastHolidays && this.state.fastHolidays.length > 0 && this.state.fastHolidays.includes(moment(date).format("YYYY-MM-DD")) || [0,6].includes(moment(date).day())) {
                date = moment(date).add(1, 'd');
            }
            if (this.state.fastHolidays && this.state.fastHolidays.length > 0 && !this.state.fastHolidays.includes(moment(date).format("YYYY-MM-DD")) && !([0,6].includes(moment(date).day()))) {            
                break;
            } 
        }
        
        return moment(date).format("MM/DD/YYYY")
    }

    validateScheduleDate = () => {
        
        if (!!this.state.workCompleted) {
            const ScheduleDateError = {
                isError: false,
                message: ''
            }
            let dateModData = [];
            dateModData = this.state.data.map(val => {
               return {
                   ...val, 
                    NEW_SCHEDULED_DATE: moment().format("YYYY-MM-DD") >= moment(val.SCHEDULED_DATE).format("YYYY-MM-DD") ? this.addDate(moment().add(30, 'd')) : null
                };
            })
            this.setState({data: dateModData, ScheduleDateError})
            
            if (this.state.data.filter(val => moment(val.SCHEDULED_DATE).format("YYYY-MM-DD") > moment().format("YYYY-MM-DD")).length > 0) {
                if (this.state.data.filter(val => [0, 6].includes(moment(val.SCHEDULED_DATE).day())).length > 0) {
                    const ScheduleDateError = {
                        isError: true,
                        message: 'Schedule date(s) should not be on weekends'
                    }
                    this.setState({ ScheduleDateError })
                } else if (this.state.data.filter(val => this.state.fastHolidays && this.state.fastHolidays.length > 0 && this.state.fastHolidays.includes(moment(val.SCHEDULED_DATE).format("YYYY-MM-DD"))).length > 0) {
                    const ScheduleDateError = {
                        isError: true,
                        message: 'Schedule date(s) includes Verizon holiday'
                    }
                    this.setState({ ScheduleDateError })
                }
            }
            // }else if (this.state.data.filter(val => [0, 6].includes(moment(val.SCHEDULED_DATE).day())).length > 0) {
            //     const ScheduleDateError = {
            //         isError: true,
            //         message: 'Schedule date(s) should not be on weekends'
            //     }

            //     this.setState({ ScheduleDateError })

            // }
            // else if (this.state.data.filter(val => this.state.fastHolidays && this.state.fastHolidays.length > 0 && this.state.fastHolidays.includes(moment(val.SCHEDULED_DATE).format("MM-DD-YYYY"))).length > 0) {
            //     const ScheduleDateError = {
            //         isError: true,
            //         message: 'Schedule date(s) includes VERIZON holiday'
            //     }
            //     this.setState({ ScheduleDateError })
            // }
            // else {
            //     const ScheduleDateError = {
            //         isError: false,
            //         message: ''
            //     }
            //     this.setState({ ScheduleDateError })
            // }
            //scheduled date is past and work is completed
            // if(){
            //     //logic : current date _ 30 days for PO due date
            //     this.state.data.map((val) => {
            //         if(){

            //         }
            //     })
            // }
        }

        if (!this.state.workCompleted) {
            // console.log(this.state.data.filter(val => [0, 6].includes(moment(val.SCHEDULED_DATE).day())).length > 0)
            // console.log(this.state.data.filter(val => moment(val.SCHEDULED_DATE).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")))
            if (this.state.data.filter(val => moment(val.SCHEDULED_DATE).format("YYYY-MM-DD") < moment().format("YYYY-MM-DD")).length > 0) {
                var errmessage = this.state.data[0].PO_TYPE === 'GENERATOR PM' || this.state.data[0].PO_TYPE === 'HVAC PM' ? 'Schedule date should be greater than current date for the selected PO type' : "Please select 'Work has been completed' checkbox if the work has been completed"
                const ScheduleDateError = {
                    isError: true,
                    message: errmessage
                }
                this.setState({ ScheduleDateError })
            } else if(this.state.data.filter(val => moment(val.SCHEDULED_DATE).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")).length > 0) {
                let dateModData = this.state.data.map(val => {
                    return {
                        ...val, 
                         NEW_SCHEDULED_DATE: moment(val.SCHEDULED_DATE).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") ? this.addDate(moment().add(30, 'd')) : null
                     };
                 })
                 this.setState({data: dateModData})
            }else if (this.state.data.filter(val => [0, 6].includes(moment(val.SCHEDULED_DATE).day())).length > 0) {
                const ScheduleDateError = {
                    isError: true,
                    message: 'Schedule date(s) should not be on weekends'
                }
                this.setState({ ScheduleDateError })
            }
            else if (this.state.data.filter(val => this.state.fastHolidays && this.state.fastHolidays.length > 0 && this.state.fastHolidays.includes(moment(val.SCHEDULED_DATE).format("YYYY-MM-DD"))).length > 0) {
                const ScheduleDateError = {
                    isError: true,
                    message: 'Schedule date(s) includes Verizon holiday'
                }
                this.setState({ ScheduleDateError })
            }else {
                const ScheduleDateError = {
                    isError: false,
                    message: ''
                }
                this.setState({ ScheduleDateError })
            }

        }
        return;
    }
    async onAttachRemoveOptional(index) {

        await this.setState({
            optFilesData: this.state.optFilesData.filter((_, i) => i !== index)
        })
    }

    onAttachRemove = () => {
        const fileError = {
            isError: false,
            message: ''
        }
        const ScheduleDateError = {
            isError: false,
            message: ''
        }
        const locationIDError = {
            isError: false,
            message: ''
        }

        const mdgIDError = {
            isError: false,
            message: ''
        }

        this.setState({
            droppedFile: {},
            data: [],
            fileError,
            selectedBuyer: { value: '', label: '' },
            ScheduleDateError,
            locationIDError,
            mdgIDError,
            isBuyerSelected: false,
            isDisabled: false, workCompleted: false
        })
    }
    handleDownloadClick = () => {
        const { user, loginId, vendorId, fetchFileData } = this.props
        const fileName = 'Create Bulk PO Template'
        const isCommonFile = true
        fetchFileData(loginId, vendorId, 0, 0, 'VP_COMMON', fileName, isCommonFile).then(action => {
            if (action.type === 'FETCH_FILE_DETAILS_SUCCESS' && !!action.fileDetails && !!action.fileDetails.getFileDataForPmlist && !!action.fileDetails.getFileDataForPmlist.result) {
                action.fileDetails.getFileDataForPmlist.result.forEach(fd => {

                    if (!!fd && !!fd.PM_FILE_TYPE && !!fd.PM_FILE_NAME && !!fd.PM_FILE_DATA) {
                        let blob = dataURItoBlob(fd.PM_FILE_DATA)
                        startDownload(blob, `${fd.PM_FILE_NAME}.${fd.PM_FILE_TYPE}`)
                    }
                })
            }



        })


    }
    handleUploadClick = () => {
        this.setState({
            uploadFileClicked: true
        })
    }
    renderManagerOptions = (managerList) => {
        let rows = []
        managerList.map((manager) => {
            rows.push({ 'value': manager.userid, 'label': manager.lname + ', ' + manager.fname })
        })
        return rows
    }
    renderBuyerOptions = () => {
        let rows = [], buyerList
        buyerList = !!this.props.buyerListDetails && !!this.props.buyerListDetails.feandmgrs ? this.props.buyerListDetails.feandmgrs.filter(data => (data.title !== "Sr Mgr-Ntwk Operations" || data.title !=="Sr Mgr-Ntwk Perf") && data.managerid === this.state.selectedManagerId.value) : []
        rows.push({ 'value': this.state.selectedManagerId.value, 'label': this.state.selectedManagerId.label })
        buyerList.map((item) => {

            rows.push({ 'value': item.userid, 'label': item.lname + ', ' + item.fname })


        })
        rows.push({ 'value': 'FE_Grouped', 'label': 'FE_Grouped' })
        return rows
    }
    async handleBuyerSelChange(managerList, e) {
        let buyerObj, feGrouped = false
        if (e.value == 'FE_Grouped') {
            buyerObj = this.state.managerObj
            feGrouped = true
        }
        else if (!!managerList && !!managerList.find(val => val.userid == e.value) && (managerList.find(val => val.userid == e.value).title === "Sr Mgr-Ntwk Operations" || managerList.find(val => val.userid == e.value).title === "Sr Mgr-Ntwk Perf" )) {
            buyerObj = this.state.managerObj
            feGrouped = false
        }
        else {
            buyerObj = this.props.buyerListDetails.feandmgrs.find(val => val.userid == e.value)
            feGrouped = false
        }
        await this.setState({ selectedBuyer: { value: e.value, label: e.label }, buyerObj, feGrouped, isBuyerSelected: true })
        const refName = await this.getRefName().toUpperCase()
        this.props.passRefname(refName)
        await this.setState({refName})

    }
    async handleManSelChange(managerList, e) {
        var managerObj = managerList.find(data => data.userid == e.value)
        this.setState({ pageLoading: true, selectedManagerId: { value: e.value, label: e.label }, managerObj })
        const { loginId, vendorId, fetchExpenseProjIdData, fetchSiteListDetails, market, submarket } = this.props
        if (e && e.value) { await fetchExpenseProjIdData(vendorId, loginId, submarket, e.value) }
        if (e && e.value) await fetchSiteListDetails(vendorId, loginId, market, submarket, e.value, 'generator').then((action) => {
            if (action && action.type === "FETCH_SITELISTDETAILS_SUCCESS" && action.siteListDetails.getSiteListDetails.filteredList.length > 0) {
                this.setState({ sitelistData: action.siteListDetails.getSiteListDetails.filteredList })
            }
        })
        this.setState({ pageLoading: false })
    }
    apiRef = params =>{
        window.addEventListener('resize', function() {
          setTimeout(function() {
            params?.autosizeColumns({
              includeHeaders: true,
              includeOutliers: true,
            })
          })
        })
      }
      
    render() {
        const { loginId, vendorId, fetchExpenseProjIdData, fetchSiteListDetails, market, submarket, buyerListDetailsLoading, createPmListLoading } = this.props
        let managerList = []

        managerList = !!this.props.buyerListDetails && !!this.props.buyerListDetails.feandmgrs ? this.props.buyerListDetails.feandmgrs.filter(femgr => (femgr.title === "Sr Mgr-Ntwk Operations" || femgr.title ==="Sr Mgr-Ntwk Perf")) : []

        // buyerNames = !!this.props.buyerListDetails && !!this.props.buyerListDetails.feandmgrs ? this.props.buyerListDetails.feandmgrs.filter(femgr => femgr.lname + ', ' + femgr.fname) : []
        let fileData = this.state.data[0]
        const modfdGridDetails = this.modifyGridDetails()
        let columns = [
            {
                headerName: "PS Loc ID", field: "PS_LOCATION_ID", flex: 1
            },
            {
                headerName: "MDGLC", field: "MDGLC", flex: 1
            },
            {
                headerName: "Site ID", field: "SITE_ID", flex: 1
            },

            {
                headerName: "Site Name", field: "SITE_NAME", flex: 1
            },
            {
                headerName: "PO Type", field: "PO_TYPE", flex: 1
            },
            {
                headerName: "Labor Cost", field: "LABOUR_COST", flex: 1
            },
            {
                headerName: "Material Cost ",  field: "MATERIAL_COST", flex: 1
            },
            {
                headerName: "Gen Fuel Cost", field: "GEN_FUEL_COST", flex: 1
            },
            {
                headerName: "Gen Fuel Labor Cost", field: "GEN_FUEL_LABOR_COST", flex: 1
            },
            {
                headerName: "Total Cost",  field: "TOTAL_COST", flex: 1
            },
            // {
            //     headerName: "Due Date ",  field: "DUE_DATE", flex: 1
            // },
            {
                headerName: "Scheduled Date ",  field: "SCHEDULED_DATE", flex: 1
            },
            {
                headerName: "Description ", field: "DESCRIPTION", flex: 1
            },
        ]
        if(this.props.esaFlag === "Y") {
            columns = columns.filter(obj => obj.headerName!== 'PS Loc ID')
        }
        let customStyle = { fontSize: '12px', marginTop: '5px' }
        return (
            <div className="container-fluid">
                <div className="table-responsive vp_stepper_content">
                {createPmListLoading || buyerListDetailsLoading ? this.renderLoading() :
                        <div className="mb-3">
                            {this.state.buyerSelErr ? (<div className=" text-center text-danger"><h3>{this.state.buyerSelErrMsg}</h3></div>) : this.state.fileError.isError ? (<div className=" text-center text-danger"><h4>{this.state.fileError.message}</h4></div>) : null}
                            {this.state.ScheduleDateError.isError && !this.state.fileError.isError && <div className=" text-center text-danger mt-2"><h4>{this.state.ScheduleDateError.message}</h4></div>}
                            {!this.state.fileError.isError && !this.state.ScheduleDateError.isError && this.state.locationIDError.isError && <div className="text-center text-danger mt-2" style={{overflowWrap : 'break-word'}}><h4>{this.state.locationIDError.message}</h4></div>}
                            {this.state.mdgIDError.isError && <div className=" text-center text-danger mt-2"  style={{overflowWrap : 'break-word'}}><h4>{this.state.mdgIDError.message}</h4></div>}

                            <div className="row">
                                <hr className="col-md-12" style={{ marginTop: "2px", border: "1px" }} />
                            </div>
                            <div className="row">
                                <div className="col-md-4 row">
                                    <div className="col-md-4" style={{ "lineHeight": "5vh" }}>Manager*</div>
                                    <div className="col-md-8">
                                        <Select
                                            // styles={customStyle}
                                            name="Manager"
                                            value={this.state.selectedManagerId}
                                            onChange={this.handleManSelChange.bind(this, managerList)}
                                            options={this.renderManagerOptions(managerList)}
                                            placeholder="Select manager"
                                            clearable={false}
                                            disabled={Object.keys(this.state.droppedFile).length > 0 || this.state.pageLoading}
                                        />
                                    </div>

                                </div>

                                <div className="col-md-3 row">
                                    <div className='col-md-0.5 mt-3' >
                                        <Checkbox
                                            style={{padding : '0px'}}
                                            onChange={this.handleCheckBox.bind(this)}
                                            checked={this.state.workCompleted}
                                            color="default"
                                            name={"Work has been completed"}
                                            value={"Work has been completed"}
                                            disabled={this.state.isDisabled || !Object.keys(this.state.droppedFile).length > 0}
                                        />
                                    </div>

                                    <div className='col-md-11.5 row text-center mt-3 ml-2'><strong>Work has been completed</strong></div>

                                </div>
                                <div></div>
                                <div className={!this.state.selectedManagerId.value.length > 0 || this.state.pageLoading ? "col-md-2 row text-center summary-link-disable" : "col-md-2 row text-center summary-link-active"} onClick={this.handleUploadClick.bind(this)}  ><b>Upload File</b></div>

                                {Object.keys(this.state.droppedFile).length > 0 && <div className='col-md-2 row'>  <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={[this.state.droppedFile]} /> </div>}

                                <div className='col-md-2 row text-center summary-link-active ml-2'> <span style={{ fontSize: '13px', color: "blue", cursor: "pointer" }} onClick={this.handleDownloadClick.bind(this)}  ><b> Download Template</b> </span>
                                </div>

                            </div>
                            <div className="text-info" style={{ fontFamily: 'cursive' }}>
                                Please ensure the sites included in the file belong to the selected manager
                            </div>
                            <div className="row">
                                <hr className="col-md-12" style={{ marginTop: "2px", border: "1px" }} />
                            </div>
                            <div className="row">
                                <div className="col-md-4 row">
                                    <div className={ this.props.esaFlag=='Y'?"col-md-4":"col-md-2" }hidden={!this.state.selectedManagerId.value.length > 0 || Object.keys(this.state.droppedFile).length < 1 || !!this.state.fileError.isError || this.state.ScheduleDateError.isError || this.state.mdgIDError.isError || !!this.state.locationIDError.isError} style={{ "lineHeight": "5vh" }}> {this.props.esaFlag=='Y'? 'Requisitioner*':'Buyer*'}</div>
                                    <div className="col-md-8" hidden={!this.state.selectedManagerId.value.length > 0 || Object.keys(this.state.droppedFile).length < 1 || !!this.state.fileError.isError || this.state.ScheduleDateError.isError || this.state.mdgIDError.isError || !!this.state.locationIDError.isError}>
                                        <Select

                                            styles={customStyle}
                                            name="Buyer"
                                            value={this.state.selectedBuyer}
                                            onChange={this.handleBuyerSelChange.bind(this, managerList)}
                                            options={this.renderBuyerOptions()}
                                            placeholder="Select buyer"
                                            clearable={false}
                                            disabled={false}
                                        />
                                    </div>

                                </div>
                                <div className="col-md-8" style={{ marginTop: '11px' }}>
                                    {Object.keys(this.state.droppedFile).length > 0 && this.state.isBuyerSelected && !this.state.locationIDError.isError && !this.state.fileError.isError && !this.state.ScheduleDateError.isError && <span className="select-label"  ><b>{`PO Reference Name : ${this.props.refName}`}</b></span>}
                                </div>
                            </div>
                            {this.state.uploadFileClicked && Object.keys(this.state.droppedFile).length < 1 && <div className="row col-md-12">
                                <div className="col-md-2"> </div>
                                <div className={"col-md-3 dropzone-width"}>
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

                                <div className="col-md-7" style={{ marginTop: '20px', color: 'green' }}>
                                    <ul className="text-info" style={{ fontFamily: 'cursive' }}>  Note :
                                        <li> The file should contain the cell sites mapped to the same manager </li>
                                        <li> Please do not use special charaters in the file name (example: comma(,), full stop(.)) </li>
                                        <li> The file extension can be .xlsx, .csv or .xls (example: CreateBulkPOFile1.xlsx / CreateBulkPOFile1.xls / CreateBulkPOFile1.csv ) </li>
                                    </ul>
                                </div>


                            </div>

                            }
                            <div style={{ "paddingTop": "15px" }}>
                                {this.state.uploadFileClicked && <div className="col-md-4"></div>}
                                { this.state.pageLoading || this.state.fileUploadLoader ? this.renderLoading() :
                                
           <DataGrid
           apiRef={this.apiRef}
           checkboxSelection={false}
           rows={!modfdGridDetails ? [] : modfdGridDetails}
           columns={columns}
           hideFooterSelectedRowCount
           rowHeight={30}
           columnHeaderHeight={35}
           initialState={{
             pagination: {
               paginationModel: { page: 0, pageSize: 10}
             }
           }}
           pageSizeOptions={[10, 15, 20]}
           sx={{
             fontSize: '1rem',
             minHeight: 300,
             '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold',  },
             '& .MuiTablePagination-toolbar > *': {
                 fontSize: '1rem'
             },
             '& .MuiTablePagination-toolbar': {
                 alignItems: 'flex-end'
             },
             '& .MuiTablePagination-input': {
                 marginBottom: '7px'
             }
         }}
         />}
                            </div>
                            <div className="row">
                                <div className={"col-md-3 text-center dropzone-width"}>
                                    <Dropzone onDrop={this.onOptionalFileDrop.bind(this)}>
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
                                    <ListOfFiles onRemoveClick={this.onAttachRemoveOptional.bind(this)} fileList={this.state.optFilesData} />
                                </div>
                                <div className="col-md-5" style={{ marginTop: '8px' }}> <i>*Please update the file with any change and reupload the file to replace the table </i>
                                    <button type="button"
                                        className="Button--secondary float-right mt-2"
                                        style={{ right: "5px", marginTop: '8px' }}
                                        onClick={this.onSubmit.bind(this)}
                                        disabled={!!this.state.fileError.isError || !!this.state.ScheduleDateError.isError || !!this.state.locationIDError.isError || !!this.state.mdgIDError.isError || Object.keys(this.state.droppedFile).length === 0 || !this.state.selectedBuyer.value.length > 0}>
                                        Request
                                    </button>
                                </div>
                            </div>


                        </div>
                    }
                </div>
            </div>)
    }
}
function stateToProps(state, ownProps) {

    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
    let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
    let user = !!state.getIn(['Users', 'entities', 'users', loginId], Map()) ? state.getIn(['Users', 'entities', 'users', loginId], Map()).toJS() : []
    let vendorId = user.vendor_id
    let pmRefDetails = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmRefList'], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmRefList'], List()).toJS() : []
    let buyerListDetails = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', "buyerListDetails", 'getBuyerList', 'fieldsList'], List()) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "buyerListDetails", 'getBuyerList', 'fieldsList'], List()).toJS() : []
    let buyerListDetailsLoading = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'buyerListDetailsLoading'])
    let siteListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "siteListDetails", 'getSiteListDetails', 'filteredList'], List()).toJS()
    let expenseProjId = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "expenseProjId", 'getExpenseProjIdData', 'expenseProjIdData'], List()).toJS()
    let pmGridDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List()).toJS()
    let pmSystemRecordsLoading = state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSystemRecordsLoading", ownProps.currentPmList.PM_LIST_ID])
    let pmSystemRecords = !!state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSystemRecords", ownProps.currentPmList.PM_LIST_ID]) ? state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSystemRecords", ownProps.currentPmList.PM_LIST_ID]).toJS() : []
    let userList = state.getIn(['Users', 'getVendorList', 'Users'], List()).toJS()
    let pmListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()
    let createdPMList = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreatePMDetailsResp", ownProps.refName]) ? state.getIn(['PmDashboard', loginId, vendorId, 'pm', "CreatePMDetailsResp", ownProps.refName], '') : ''
    let createPmListLoading = !!state.getIn(['PmDashboard', loginId, vendorId, 'pm', "createPmListLoading"])
    let wbscodes = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "expenseProjId", 'getExpenseProjIdData', 'wbscodes'], List()).toJS()
    let config= state.getIn(['Users', 'configData', 'configData'], List())
    let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;
    return {
        user,
        loginId,
        vendorId,
        market,
        submarket,
        pmRefDetails,
        buyerListDetails,
        buyerListDetailsLoading,
        siteListDetails,
        expenseProjId,
        wbscodes,
        pmGridDetails,
        pmSystemRecordsLoading,
        pmSystemRecords,
        userList,
        pmListDetails,
        createdPMList,
        createPmListLoading,
        esaFlag
    }
}

export default connect(stateToProps, { ...pmActions, getHolidayEvents })(RequestBulkPO)
