import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import RenderSiteDetails from './RenderSiteDetails'
import * as pmActions from "../actions"
import { Map, fromJS, List } from 'immutable'
import XLSX from 'xlsx';
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils'
import { connect } from "react-redux"
import ListOfFiles from './ListOfFiles'
import moment from 'moment'
import Loader from '../../Layout/components/Loader'

class BulkUploadPm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            droppedFile: {},
            data: [],
            cols: [],
            invalidFileUpload: false,
            invalidFileUploadMessage: '',
            pm_unid: this.randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
            isUploading: false,
            syncedSites:[],
            templateData:[]
        }
    }
    componentDidMount() {
        const { vendorId, loginId, submarket, pmListDetails} = this.props
        const selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
        const listIds = selectedLists.map(sl => sl.PM_LIST_ID).join(',')
        this.setState({listIds})
        const managerIds = selectedLists.map(sl => sl.MANAGER_ID)
        let po_nums = selectedLists.map(sl => sl.PO_NUM).join(' ,')
        this.setState({ po_nums })
        const pmtype = selectedLists && selectedLists[0] && selectedLists[0].PM_TYPE_NAME
        const managerId= [...new Set(managerIds)].join(' ,')
        // let selectedList = selPOList.filter(({ itemSelected }) => !!itemSelected)
        // const equipment = pmRefDetails.find(item => item.PM_TYPE_ID === selectedList[0].PM_TYPE_ID)
        this.props.fetchSyncedSitesInfo(vendorId, loginId, submarket, managerId, pmtype).then(res=>{
            if(res && res.syncedSitesInfo && res.syncedSitesInfo.getSyncedSitesInfo && res.syncedSitesInfo.getSyncedSitesInfo.siteinfo)
        
           this.setState({ syncedSites : res.syncedSitesInfo.getSyncedSitesInfo.siteinfo })
        })
      
        this.props.fetchPmModelAttributeDetails(vendorId, loginId, pmtype, null)
        this.props.fetchPmGridDetails(vendorId, loginId, listIds)
    }
    validateDataHvac = (excelData) => {
let postRequestArray = excelData.map((eachArray, index) => {
      return eachArray["POST_REQUEST"];
    });
    let requiredVal = postRequestArray.map((eachArray) => {
      return eachArray.filter((eachObject) => {
        if (eachObject["ATTRIBUTE_CATEGORY"] === "3-1") {
          return eachObject["ATTRIBUTE_VALUE"];
        }
      });
    });

    let requiredConMod = postRequestArray.map((eachMod) => {
      return eachMod.filter((eachItem) => {
        return eachItem["ATTRIBUTE_CATEGORY"] === "3-8";
      });
    });



        let {pmListDetails} = this.props;
        const selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
        const po_nums = selectedLists.map(sl => sl.PO_NUM)
        const mdgIds = this.props.pmGridDetails.map(sl => sl.MDG_ID)

        if (excelData.length === 0 || excelData.every((val, i, arr) => val.PO_NUM === '')) {
            this.setState({
                invalidFileUpload: true,
                invalidFileUploadMessage: 'Please fill the readings before uploading template'
            })
        }

        else {
            for (let i = 0; i < excelData.length; i++) {

                if(this.props.erpFlag == "Y"){
                    if (!excelData[i].MDG_ID) {
                        this.setState({
                            invalidFileUpload: true,
                            invalidFileUploadMessage: `Please fill the mandatory field MDGLC of site with Site id ${excelData[i].SITE_ID} -  ${this.props.syncedSitesInfo.find((site) => excelData[i].SITE_ID == site.SITE_ID) != undefined ? this.props.syncedSitesInfo.find((site) => excelData[i].SITE_ID == site.SITE_ID).SITE_NAME : ''}`
                        })
                        break;
                    }

                    if (!mdgIds.includes(excelData[i].MDG_ID)) {
                        this.setState({
                            invalidFileUpload: true,
                            invalidFileUploadMessage: 'Sites donot belong to current List'
                        })
                        break;
                    }
                }

                if (excelData[i].POST_REQUEST.filter(value => !value["ATTRIBUTE_VALUE"]).length > 0) {

                    this.setState({
                        invalidFileUpload: true,
                        invalidFileUploadMessage: `Please fill all mandatory fields of site with Site id ${excelData[i].SITE_ID}`
                    })
                    break;
                }
                else if (moment(excelData[i].PM_DATE).format('MM/DD/YYYY') == 'Invalid date') {
                    this.setState({
                        invalidFileUpload: true,
                        invalidFileUploadMessage: `Please enter valid PM_DATE for Site with Site Id ${excelData[i].SITE_ID}`
                    })
                    break;
                }
                // else if (!(excelData.every((val, i, arr) => (val.PO_NUM.trim() === arr[0].PO_NUM.trim() || val.PO_NUM.trim() === '')))) {
                //     this.setState({
                //         invalidFileUpload: true,
                //         invalidFileUploadMessage: 'PO number should be same for all sites'
                //     })
                //     break;
                // }
                else if (!po_nums.includes(excelData[i].PO_NUM)) {
                    this.setState({
                        invalidFileUpload: true,
                        invalidFileUploadMessage: 'Sites donot belong to current List'
                    })
                    break;
                }
                else if (!!requiredVal) {
          requiredVal.map((arrayObject) => {
            let tmp = [];
            arrayObject.map((val, index) => {
              tmp.push(val["ATTRIBUTE_VALUE"]);
            });
            let result = tmp.every((val, i, tmp) => val === tmp[0]);
            if (result == false) {
              this.setState({
                invalidFileUpload: true,
                invalidFileUploadMessage:
                  "Controller Type Should Match For Same SiteId,Please Ensure Before Uploading",
              });
            }
          });
          break;
        } 
                else {
                    this.setState({
                        invalidFileUpload: false,
                        invalidFileUploadMessage: ''
                    })
                }
            }
        } 
        requiredConMod.map((arrayObject) => {
      let tmp1 = [];
      arrayObject.map((val, index) => {
        tmp1.push(val["ATTRIBUTE_VALUE"]);
      });
      let result1 = tmp1.every((val, i, tmp1) => val === tmp1[0]);
      if (result1 == false) {
        this.setState({
          invalidFileUpload: true,
          invalidFileUploadMessage:
            "Controller Model Should Match For Same SiteId,Please Ensure Before Uploading",
        });
      }
    });
    }
    
    onFileDrop = (files) => {

        const { loginId, vendorId, storeTemplateData, pmGridDetails, currentPmList, pmListDetails } = this.props
        const selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
        var file = files[0]
        let file_name = file.name.split('.')[0]
        let file_type = file.name.split('.')[1]

        var droppedFile = {
            file_name,
            file_type,
            file_size: file['size'] + '',
            filename: file['name']

        }

        if (file_type === 'xlsx' || file_type === 'csv' || file_type === 'xls') {

            const reader = new FileReader();
            const rABS = !!reader.readAsBinaryString;

            reader.onload = (e) => {
                /* Parse data */

                const bstr = e.target.result;

                const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });

                /* Get first worksheet */
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                /* Convert array of arrays */
                const data = XLSX.utils.sheet_to_json(ws, { defval: "" }).filter(v => v.PO_NUM)
                const make_cols = refstr => {
                    let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
                    for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i }
                    return o;
                };
                if (selectedLists.length > 0 && selectedLists[0].PM_TYPE_NAME.includes('GENERATOR')) {
                    this.setState({ droppedFile, data }, async () => {
                        await this.validateData(data)

                        await this.storeDataPending()


                    })
                }
                else if (selectedLists.length > 0  && selectedLists[0].PM_TYPE_NAME.includes('HVAC')) {


 
                    const filterRef = this.props.erpFlag == "Y" ? "MDG_ID": "PS_LOCATION_ID"
                    let uniqRecs = [...new Set(data.map(i => i[filterRef]))]
                    let modifiedData = []

                    console.log('uniqRecs', uniqRecs)

                    uniqRecs.forEach(val => {

                        let currentlocs = data.filter(v => {
                            return v[filterRef] == val
                        })
                        let objToRet = {
                            PO_NUM: currentlocs[0].PO_NUM,
                            PM_DATE: moment(currentlocs[0].PM_DATE).format('MM/DD/YYYY'),
                            Comments: currentlocs[0].Comments,
                            VENDORTECHNAME: currentlocs[0]['VENDOR TECH NAME'],
                            SITE_ID: currentlocs[0].SITE_ID,
                            PS_LOCATION_ID: currentlocs[0].PS_LOCATION_ID,
                            MDG_ID : currentlocs[0].MDG_ID,
                            POST_REQUEST: []
                        }


                        let currentSite = {}
                        if(this.props.erpFlag == "N"){
                            currentSite=this.props.pmGridDetails.find(pd => pd.PS_LOCATION_ID === currentlocs[0].PS_LOCATION_ID && pd.PM_ITEM_STATUS === 'PENDING') ? this.props.pmGridDetails.find(pd => pd.PS_LOCATION_ID === currentlocs[0].PS_LOCATION_ID && pd.PM_ITEM_STATUS === 'PENDING') : {}
                        }
                        else{
                            currentSite=this.props.pmGridDetails.find(pd => pd.MDG_ID === currentlocs[0].MDG_ID && pd.PM_ITEM_STATUS === 'PENDING') ? this.props.pmGridDetails.find(pd => pd.MDG_ID === currentlocs[0].MDG_ID && pd.PM_ITEM_STATUS === 'PENDING') : {}

                        }
                        for (let i = 0; i < currentlocs.length; i++) {
                            this.props.modelAttributes.forEach(val => {
                                let csr = this.props.syncedSitesInfo.find(ind => ind.SITE_ID && ind.SITE_ID == currentlocs[i].SITE_ID) && this.props.syncedSitesInfo.find(ind => ind.SITE_ID && ind.SITE_ID == currentlocs[i].SITE_ID).EQUIPMENT_INFO && 
                                this.props.syncedSitesInfo.find(ind => ind.SITE_ID && ind.SITE_ID == currentlocs[i].SITE_ID).EQUIPMENT_INFO[i] && this.props.syncedSitesInfo.find(ind => ind.SITE_ID && ind.SITE_ID == currentlocs[i].SITE_ID).EQUIPMENT_INFO[i][val.PM_TMPLT_ATTR_FLD_LBLMAP] ? this.props.syncedSitesInfo.find(ind => ind.SITE_ID && ind.SITE_ID == currentlocs[i].SITE_ID).EQUIPMENT_INFO[i][val.PM_TMPLT_ATTR_FLD_LBLMAP] : ''
                                if (val.PM_TMPLT_ATTR_FLD_GROUP == '0') {
                                    objToRet["POST_REQUEST"].push({
                                            "INSPECTION_UNID": null,
                                            "EQUIPMENT_UNID": currentSite.PM_ITEM_UNID,
                                            "ATTRIBUTE_ID": val.PM_TMPLT_ATTR_ID,
                                            "ATTRIBUTE_NAME": `HVAC Unit ${i + 1} ${val.PM_TMPLT_ATTR_NAME}`,
                                            "ATTRIBUTE_VALUE": "Yes",
                                            "ATTRIBUTE_CATEGORY": val.PM_TMPLT_ATTR_FLD_GROUP,
                                            "ATTRIBUTE_SUBCATEGORY": val.PM_TMPLT_ATTR_FLD_TYPE,
                                            "ATTRIBUTE_FIELDS": '',
                                            "ATTRIBUTE_COMMENTS": `HVAC index ${i+1}`,
                                            "LAST_UPDATED_BY": objToRet.VENDORTECHNAME
                                        })
                                        
                                  

                                }
                                else if (val.PM_TMPLT_ATTR_FLD_GROUP.includes('2-')) {
                                    objToRet["POST_REQUEST"].push({
                                            "INSPECTION_UNID": null,
                                            "EQUIPMENT_UNID": currentSite.PM_ITEM_UNID,
                                            "ATTRIBUTE_ID": val.PM_TMPLT_ATTR_ID,
                                            "ATTRIBUTE_NAME": `HVAC Unit ${i + 1} ${val.PM_TMPLT_ATTR_NAME}`,
                                            "ATTRIBUTE_VALUE": currentlocs[i][val.PM_TMPLT_ATTR_NAME],
                                            "ATTRIBUTE_CATEGORY": val.PM_TMPLT_ATTR_FLD_GROUP,
                                            "ATTRIBUTE_SUBCATEGORY": val.PM_TMPLT_ATTR_FLD_TYPE,
                                            "ATTRIBUTE_FIELDS": csr,
                                            "ATTRIBUTE_COMMENTS": `HVAC index ${i+1}`,
                                            "LAST_UPDATED_BY": objToRet.VENDORTECHNAME
                                        })
                                        
                                  

                                }
                                else if (val.PM_TMPLT_ATTR_FLD_TYPE != "RADIOBUTTON" && !val.PM_TMPLT_ATTR_FLD_GROUP.includes('4-') && !val.PM_TMPLT_ATTR_FLD_GROUP.includes('1-')&& !(val.PM_TMPLT_ATTR_FLD_GROUP == '0')) {
                                     objToRet["POST_REQUEST"].push(
                                    {
                                            "INSPECTION_UNID": null,
                                            "EQUIPMENT_UNID": currentSite.PM_ITEM_UNID,
                                            "ATTRIBUTE_ID": val.PM_TMPLT_ATTR_ID,
                                            "ATTRIBUTE_NAME": `HVAC Unit ${i + 1} ${val.PM_TMPLT_ATTR_NAME}`,
                                            "ATTRIBUTE_VALUE": currentlocs[i][val.PM_TMPLT_ATTR_NAME],
                                            "ATTRIBUTE_CATEGORY": val.PM_TMPLT_ATTR_FLD_GROUP,
                                            "ATTRIBUTE_SUBCATEGORY": val.PM_TMPLT_ATTR_FLD_TYPE,
                                            "ATTRIBUTE_FIELDS": '',
                                            "ATTRIBUTE_COMMENTS": `HVAC index ${i+1}`,
                                            "LAST_UPDATED_BY": objToRet.VENDORTECHNAME
                                        })
                                   
                                }
                                else if (val.PM_TMPLT_ATTR_FLD_TYPE == "RADIOBUTTON") {
                                    switch (val.PM_TMPLT_ATTR_ID) {
                                        case 64:
                                             objToRet["POST_REQUEST"].push(
                                            {
                                            "INSPECTION_UNID": null,
                                            "EQUIPMENT_UNID": currentSite.PM_ITEM_UNID,
                                            "ATTRIBUTE_ID": val.PM_TMPLT_ATTR_ID,
                                            "ATTRIBUTE_NAME": `HVAC Unit ${i + 1} ${val.PM_TMPLT_ATTR_NAME}`,
                                            "ATTRIBUTE_VALUE": currentlocs[i][val.PM_TMPLT_ATTR_NAME],
                                            "ATTRIBUTE_CATEGORY": val.PM_TMPLT_ATTR_FLD_GROUP,
                                            "ATTRIBUTE_SUBCATEGORY": val.PM_TMPLT_ATTR_FLD_TYPE,
                                            "ATTRIBUTE_FIELDS": currentlocs[i]["Unit_Recommended_for_replacement_Reason_for_selection"],
                                            "ATTRIBUTE_COMMENTS": `HVAC index ${i+1}`,
                                            "LAST_UPDATED_BY": objToRet.VENDORTECHNAME
                                        })
                                            break;
                                        case 65:
                                           objToRet["POST_REQUEST"].push(
                                            {
                                            "INSPECTION_UNID": null,
                                            "EQUIPMENT_UNID": currentSite.PM_ITEM_UNID,
                                            "ATTRIBUTE_ID": val.PM_TMPLT_ATTR_ID,
                                            "ATTRIBUTE_NAME": `HVAC Unit ${i + 1} ${val.PM_TMPLT_ATTR_NAME}`,
                                            "ATTRIBUTE_VALUE": currentlocs[i][val.PM_TMPLT_ATTR_NAME],
                                            "ATTRIBUTE_CATEGORY": val.PM_TMPLT_ATTR_FLD_GROUP,
                                            "ATTRIBUTE_SUBCATEGORY": val.PM_TMPLT_ATTR_FLD_TYPE,
                                            "ATTRIBUTE_FIELDS": currentlocs[i]["HVAC_Unit_Equipped_with_an_economizer_Reason_for_selection"],
                                            "ATTRIBUTE_COMMENTS": `HVAC index ${i+1}`,
                                            "LAST_UPDATED_BY": objToRet.VENDORTECHNAME
                                        })
                                          
                                            break
                                        case 66:
                                            objToRet["POST_REQUEST"].push( 
                                              {
                                            "INSPECTION_UNID": null,
                                            "EQUIPMENT_UNID": currentSite.PM_ITEM_UNID,
                                            "ATTRIBUTE_ID": val.PM_TMPLT_ATTR_ID,
                                            "ATTRIBUTE_NAME": `HVAC Unit ${i + 1} ${val.PM_TMPLT_ATTR_NAME}`,
                                            "ATTRIBUTE_VALUE": currentlocs[i][val.PM_TMPLT_ATTR_NAME],
                                            "ATTRIBUTE_CATEGORY": val.PM_TMPLT_ATTR_FLD_GROUP,
                                            "ATTRIBUTE_SUBCATEGORY": val.PM_TMPLT_ATTR_FLD_TYPE,
                                            "ATTRIBUTE_FIELDS": currentlocs[i]["HVAC_Unit_Economizer_enabled_to_run_Reason_for_selection"],
                                            "ATTRIBUTE_COMMENTS": `HVAC index ${i+1}`,
                                            "LAST_UPDATED_BY": objToRet.VENDORTECHNAME
                                        })
                                         
                                            break
                                        case 63:
                                         objToRet["POST_REQUEST"].push( {
                                            "INSPECTION_UNID": null,
                                            "EQUIPMENT_UNID": currentSite.PM_ITEM_UNID,
                                            "ATTRIBUTE_ID": val.PM_TMPLT_ATTR_ID,
                                            "ATTRIBUTE_NAME": `HVAC Unit ${i + 1} ${val.PM_TMPLT_ATTR_NAME}`,
                                            "ATTRIBUTE_VALUE": currentlocs[i][val.PM_TMPLT_ATTR_NAME],
                                            "ATTRIBUTE_CATEGORY": val.PM_TMPLT_ATTR_FLD_GROUP,
                                            "ATTRIBUTE_SUBCATEGORY": val.PM_TMPLT_ATTR_FLD_TYPE,
                                            "ATTRIBUTE_FIELDS": currentlocs[i]["Unit_Filter_Change_Completed_Reason_for_selection"],
                                            "ATTRIBUTE_COMMENTS": `HVAC index ${i+1}`,
                                            "LAST_UPDATED_BY": objToRet.VENDORTECHNAME
                                        })
                                        
                                            break

                                    }

                                }

                            })

                           
                        }
                        modifiedData.push(objToRet)
                    })


                    this.setState({ droppedFile, data: modifiedData }, async () => {

                        await this.validateDataHvac(modifiedData)

                        await this.storeDataPending()


                    })
                }



            };
            if (rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
        }
        else {
            this.setState({
                invalidFileUpload: true,
                invalidFileUploadMessage: 'Please Upload a valid File...'
            })
        }


    }
    storeDataPending = () => {

        const { loginId, vendorId, storeTemplateData, fetchPmGridDetails, pmListDetails} = this.props
        let { listIds } = this.state
        const selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
        const filterRef = this.props.erpFlag == "Y" ? "MDG_ID": "PS_LOCATION_ID"

        // console.log('this.state.data', this.state.data)
        fetchPmGridDetails(vendorId, loginId, listIds).then((action) => {

            if (action.type === 'FETCH_PMGRIDDETAILS_SUCCESS') {
                const dataWithStatus = this.state.data.filter(i => action.pmGridDetails.getPmGridDetails.pmlistitems.find(pd => pd[filterRef] === i[filterRef] && pd.PM_ITEM_STATUS.includes('PENDING'))).map(dt => {
                    let currentSite = action.pmGridDetails.getPmGridDetails.pmlistitems.filter(pd => pd[filterRef] === dt[filterRef] && pd.PM_ITEM_STATUS === 'PENDING')[0]
                    if (selectedLists.length > 0 && selectedLists[0].PM_TYPE_NAME === 'GENERATOR PM')
                        return {
                            ...dt,
                            locationName: !!currentSite ? currentSite.PM_LOCATION_NAME : null,
                            pmItemStatus: !!currentSite ? currentSite.PM_ITEM_STATUS : null,
                            unid: !!currentSite ? currentSite.PM_ITEM_UNID : null,
                            pmListItemId: !!currentSite ? currentSite.PM_LIST_ITEM_ID : null,
                            PM_LIST_ID: !!currentSite ? currentSite.PM_LIST_ID : null,
                            LINE: !!currentSite ? currentSite.LINE : null,
                            SCHEDULE: !!currentSite ? currentSite.SCHEDULE : null

                        }
                    else if (selectedLists.length > 0 && selectedLists[0].PM_TYPE_NAME === 'HVAC PM')
                        return {
                            ...dt,
                            locationName: !!currentSite ? currentSite.PM_LOCATION_NAME : null,
                            pmItemStatus: !!currentSite ? currentSite.PM_ITEM_STATUS : null,
                            unid: !!currentSite ? currentSite.PM_ITEM_UNID : null,
                            pmListItemId: !!currentSite ? currentSite.PM_LIST_ITEM_ID : null,
                            LINE: !!currentSite ? currentSite.LINE : null,
                            SCHEDULE: !!currentSite ? currentSite.SCHEDULE : null,
                            PM_LIST_ITEM_ID: !!currentSite ? currentSite.PM_LIST_ITEM_ID : null,
                            PM_ITEM_UNID: !!currentSite ? currentSite.PM_ITEM_UNID : null,
                            PM_LIST_ID: !!currentSite ? currentSite.PM_LIST_ID : null,
                            EQUIPMENT_UNID: !!currentSite ? currentSite.PM_ITEM_UNID : null

                        }

                })
                /* Update state */
                console.log("dataWithStatus",dataWithStatus,this.state.data)
                if (dataWithStatus && dataWithStatus.length == 0) {
                    this.setState({
                        invalidFileUpload: true,
                        invalidFileUploadMessage: 'Uploaded file donot contain pending sites'
                    })
                }
                storeTemplateData(vendorId, loginId, listIds, dataWithStatus).then(action => {
                
                    if (action.type === 'STORE_TEMPLATE_DATA') {
                        this.setState({templateData : action.PmlistItems})
                        if (selectedLists.length > 0 && selectedLists[0].PM_TYPE_NAME.includes('GENERATOR'))
                            this.mapCurrSysRecords()
                    }
                })


            }
        })

        return;
    }
    validateData = (excelData) => {
        let {pmListDetails} = this.props
        const selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
        const po_nums = selectedLists.map(sl => sl.PO_NUM)
        function toObject(pairs) {
            return Array.from(pairs).reduce(
                (acc, [key, value]) => Object.assign(acc, { [key]: value }),
                {},
            );
        }

        if (excelData.length === 0 || excelData.every((val, i, arr) => val.PO_NUM === '')) {
            this.setState({
                invalidFileUpload: true,
                invalidFileUploadMessage: 'Please fill the readings before uploading template'
            })
        }

        else {

            const { fetchPmModelAttributeDetails, currentPmList, vendorId, loginId } = this.props

            fetchPmModelAttributeDetails(vendorId, loginId, selectedLists[0].PM_TYPE_NAME, null).then(action => {

                if (action.type === 'FETCH_PMMODELATT_DETAILS_SUCCESS') {
                    let modelAtts = action.pmModelAttDetails.getPmModelAttDetails
                    let mandAttKeys = modelAtts.map((att) => {
                        if (att.IS_MANDATORY === "Y") return att.PM_TMPLT_ATTR_NAME
                        else return null
                    })

                    for (let i = 0; i < excelData.length; i++) {

                        let mandateFields = (Object.entries(excelData[i])).filter(pair => {
                            if (mandAttKeys.includes(pair[0]) || pair[0] === 'PO_NUM' || pair[0] === 'SITE_ID' || pair[0] === 'PS_LOCATION_ID') {
                                return pair
                            }
                        })

                        if (Object.values(toObject(mandateFields)).filter(value => !value).length > 0 && Object.values(toObject(mandateFields)).filter(value => !value).length !== Object.keys(toObject(mandateFields)).length) {

                            this.setState({
                                invalidFileUpload: true,
                                invalidFileUploadMessage: `Please fill all mandatory fields of site with Site id ${excelData[i].SITE_ID}`
                            })
                            break;
                        }
                        else if(this.props.erpFlag == "Y" && !excelData[i].MDG_ID){
                            this.setState({
                                invalidFileUpload: true,
                                invalidFileUploadMessage: `Please enter MDGLC for Site with Site Id ${excelData[i].SITE_ID}`
                            })
                            break;
                        }
                        else if (moment(excelData[i].PM_DATE).format('MM/DD/YYYY') == 'Invalid date') {
                            this.setState({
                                invalidFileUpload: true,
                                invalidFileUploadMessage: `Please enter valid PM_DATE for Site with Site Id ${excelData[i].SITE_ID}`
                            })
                            break;
                        }
                        // else if (!(excelData.every((val, i, arr) => (val.PO_NUM.trim() === arr[0].PO_NUM.trim() || val.PO_NUM.trim() === '')))) {
                        //     this.setState({
                        //         invalidFileUpload: true,
                        //         invalidFileUploadMessage: 'PO number should be same for all sites'
                        //     })
                        //     break;
                        // }
                        else if (!po_nums.includes(excelData[i].PO_NUM)) {
                            this.setState({
                                invalidFileUpload: true,
                                invalidFileUploadMessage: 'Sites donot belong to current List'
                            })
                            break;
                        }
                        else {
                            this.setState({
                                invalidFileUpload: false,
                                invalidFileUploadMessage: ''
                            })
                        }
                    }





                } else if (action.type === 'FETCH_PMMODELATT_DETAILS_FAILURE') {

                    this.props.notiref.addNotification({
                        title: 'error',
                        position: "br",
                        level: 'error',
                        message: "Something went wrong please try again after sometime!"
                    })
                }
            })
        }
        return;
    }
    getDate = () => {
        return moment().format('MM/DD/YYYY')
    }
    randomString(length, chars) {
        var result = ''
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
        return result
    }
    mapCurrSysRecords = (excelData) => {
        let { vendorId, loginId } = this.props
       let { listIds } = this.state
        let newData = this.props.pmListItemsTmplt.map(v => {
    
            let syncedSitesInfo = this.props.syncedSitesInfo && this.props.syncedSitesInfo.find(i => i.SITE_ID && i.SITE_ID == v.SITE_ID) && this.props.syncedSitesInfo.find(i => i.SITE_ID && i.SITE_ID == v.SITE_ID).EQUIPMENT_INFO && this.props.syncedSitesInfo.find(i => i.SITE_ID && i.SITE_ID == v.SITE_ID).EQUIPMENT_INFO.length > 0 ? this.props.syncedSitesInfo.find(i => i.SITE_ID && i.SITE_ID == v.SITE_ID).EQUIPMENT_INFO[0] : {}
         
            return {
                ...v,
                ...syncedSitesInfo
            }
        })
        let newDataTosubmit = newData.map(val => {

            return {
                ...val,
                datatoSubmit: this.props.modelAttributes.map(ma => {
                    let genAttMap = {}
                    if (ma.PM_TMPLT_ATTR_NAME === "PM_DATE") {
                        genAttMap[ma.PM_TMPLT_ATTR_NAME] = [this.getDate(), moment(val[ma.PM_TMPLT_ATTR_NAME]).format('MM/DD/YYYY')]
                    }
                    if (ma.PM_TMPLT_ATTR_NAME === "") {
                        genAttMap[ma.PM_TMPLT_ATTR_NAME] = [this.getDate(), moment(val[ma.PM_TMPLT_ATTR_NAME]).format('MM/DD/YYYY')]
                    }
                    else if (ma.PM_TMPLT_ATTR_NAME === "GENREADINGUNID") {
                        genAttMap[ma.PM_TMPLT_ATTR_NAME] = ["", this.state.pm_unid]
                    }
                    else {
                        var currentSystemRecord = val[ma.PM_TMPLT_ATTR_FLD_LBLMAP] ? val[ma.PM_TMPLT_ATTR_FLD_LBLMAP] : ''
                        if (ma.PM_TMPLT_ATTR_FLD_TYPE !== 'RADIOBUTTON') {
                            genAttMap[ma.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, val[ma.PM_TMPLT_ATTR_NAME]]
                        }
                        else if (ma.PM_TMPLT_ATTR_FLD_TYPE === 'RADIOBUTTON' && !!ma.PM_TMPLT_ATTR_FLD_LBLMAP) {
                            var currentSystemRecord = val[ma.PM_TMPLT_ATTR_NAME] ? val[ma.PM_TMPLT_ATTR_NAME] : ''
                            genAttMap[ma.PM_TMPLT_ATTR_NAME] = [currentSystemRecord, val[ma.PM_TMPLT_ATTR_NAME], val[ma.PM_TMPLT_ATTR_FLD_LBLMAP]]
                        }

                    }
                    const { PM_TEMPLATE_ID,
                        PM_TMPLT_ATTR_ID,
                        PM_TMPLT_ATTR_NAME } = ma
                    const PM_TMPLT_ATTR_OLD_VALUE = genAttMap[ma.PM_TMPLT_ATTR_NAME][0]
                    const PM_TMPLT_ATTR_NEW_VALUE = genAttMap[ma.PM_TMPLT_ATTR_NAME][1]
                    const PM_TMPLT_ATTR_NEW_VALUE_SENT = !!genAttMap[ma.PM_TMPLT_ATTR_NAME][2] ? genAttMap[ma.PM_TMPLT_ATTR_NAME][2] : ''

                    return {
                        "PM_LIST_ID": val.PM_LIST_ID,
                        "PM_LIST_ITEM_ID": val.pmListItemId,
                        PM_TEMPLATE_ID,
                        PM_TMPLT_ATTR_ID,
                        PM_TMPLT_ATTR_NAME,
                        "PM_TMPLT_ATTR_UNID": val.unid,
                        PM_TMPLT_ATTR_OLD_VALUE,
                        PM_TMPLT_ATTR_NEW_VALUE,
                        PM_TMPLT_ATTR_NEW_VALUE_SENT,

                        "PM_TMPLT_ATTR_ACTION": 'COMPLETE',
                        "LAST_UPDATED_BY": val["VENDORTECHNAME"]
                    }
                })
            }
        })

        // if(this.props.erpFlag == 'Y'){
        //     newDataTosubmit.forEach(val => {
        //         val.datatoSubmit.push( 
        //                     {
        //                         "PM_LIST_ID": val.PM_LIST_ID,
        //                         "PM_LIST_ITEM_ID": val.pmListItemId,
        //                         PM_TEMPLATE_ID:null,
        //                         PM_TMPLT_ATTR_ID:null,
        //                         PM_TMPLT_ATTR_NAME:"MDG_ID",
        //                         "PM_TMPLT_ATTR_UNID": val.unid,
        //                         PM_TMPLT_ATTR_OLD_VALUE: "",
        //                         PM_TMPLT_ATTR_NEW_VALUE: val.MDG_ID,
        //                         PM_TMPLT_ATTR_NEW_VALUE_SENT: "",
        //                         "PM_TMPLT_ATTR_ACTION": 'COMPLETE',
        //                         "LAST_UPDATED_BY": val["VENDORTECHNAME"]
        //                     }
        //         )
        //     })
        // }
        this.setState({ data: newDataTosubmit })


       

        this.props.storeTemplateData(vendorId, loginId, listIds, newDataTosubmit).then(action => {
            if (action.type === 'STORE_TEMPLATE_DATA') {
                this.setState({templateData : action.PmlistItems})

            }
        })
    }
    componentWillUnmount() {
        const { loginId, vendorId, storeTemplateData } = this.props
        storeTemplateData(vendorId, loginId, this.state.listIds, [])
    }

    onAttachRemove(attMap, radioInputs, index) {
        const { loginId, vendorId, storeTemplateData, currentPmList} = this.props
        storeTemplateData(vendorId, loginId, this.state.listIds, [])
        this.setState({
            droppedFile: {},
            data: []
        })
        this.forceUpdate()
    }
    onSubmit = () => {
        const { vendorId, loginId, submitPMQuote, fetchPmGridDetails, submitTowerInsp ,pmListDetails} = this.props
        const selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
        let { listIds } = this.state
        let currentPmListID = listIds
        this.setState({
            isUploading: true
        });
        if(selectedLists.length > 0 && selectedLists[0].PM_TYPE_NAME.includes('GENERATOR')){
            let datatoSubmit = []
        this.props.pmListItemsTmplt.forEach(v => {
            v.datatoSubmit.forEach(i => datatoSubmit.push(i))
        })

        // console.log(datatoSubmit)
        // if(this.props.erpFlag == "N"){
        //     datatoSubmit.forEach(object => {
        //         if(object.MDG_ID){
        //             delete object.MDG_ID;
        //         }
        //       });
        // }
        const submitpostRequest1 = {
            updatedData: datatoSubmit
        }



        submitPMQuote(vendorId, loginId, 'bulkSubmission', submitpostRequest1).then((action) => {

            if (action.type === 'SUBMIT_PM_QUOTE_SUCCESS') {
                this.props.notiref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "Details Submission successful"
                })
                this.props.generatePDFData()

                this.props.fetchSearchedSites(vendorId, loginId).then(action => {
                    this.props.filterSearchedSites(vendorId, loginId, '')
                })

                fetchPmGridDetails(vendorId, loginId, currentPmListID)
                 this.props.handleHideModal()
            }
            else {
                this.props.notiref.addNotification({
                    title: 'error',
                    position: "br",
                    level: 'error',
                    message: "Details Submission failed"
                })
            }
        }).catch(e => {
            this.props.notiref.addNotification({
                title: 'error',
                position: "br",
                level: 'error',
                message: "Details Submission failed"
            })
        }).finally(() => {
            this.setState({
                isUploading: false
            });
        });
    }
    else if(selectedLists.length > 0 && selectedLists[0].PM_TYPE_NAME.includes('HVAC')){
        let postRequest = this.formPostRequest()

        // console.log('postRequest', postRequest)
       
        submitTowerInsp(vendorId, loginId, 'bulkSubmission', postRequest).then(async (action) => {
          
            if (action.type === 'SUBMIT_TOWERINSP_SUCCESS') {
                 this.props.fetchSearchedSites(vendorId, loginId).then(action => {
                    this.props.filterSearchedSites(vendorId, loginId, '')
                })

                fetchPmGridDetails(vendorId, loginId, currentPmListID)
                 this.props.handleHideModal()
                this.props.notiref.addNotification( {
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "Details Submission successful"
                })
                this.props.generatePDFData()
            }
     else {
                this.props.notiref.addNotification({
                    title: 'error',
                    position: "br",
                    level: 'error',
                    message: "Details Submission failed"
                })
            }    
    }).catch(err => {
                this.props.notiref.addNotification({
                title: 'error',
                position: "br",
                level: 'error',
                message: "Details Submission failed"
            })
            }).finally(() => {
                this.setState({
                    isUploading: false
                });
            });
            
    }
        

    }
    formPostRequest = () => {
        let { vendorId, loginId, currentPmList, submarket } = this.props
       
        let inspectionObj = this.props.pmListItemsTmplt.map(val => {
            return {
            "PM_LIST_ID": Number(val.PM_LIST_ID),
            "PM_LIST_ITEM_ID": Number(val.PM_LIST_ITEM_ID),
            "SITE_UNID": val.PM_ITEM_UNID,
            "EQUIPMENT_UNID": val.PM_ITEM_UNID,
            "EQUIPMENT_TYPE": "HVAC",
            "INSPECTION_UNID": null,
            "OPSTRACKER_UNID": null,
            "INSP_STATUS": 'COMPLETED',
            "INSP_COMPLETED_BY": val.VENDORTECHNAME,
            "MDG_ID": val.MDG_ID,
            "INSP_COMPLETED_DATE": moment(val.PM_DATE).format('DD/MM/YYYY'),
            "INSP_COMMENTS": val.Comments? val.Comments: '',
            "LAST_UPDATED_BY": val.VENDORTECHNAME
        }
    })




    if(this.props.erpFlag == "N"){
        inspectionObj.forEach(object => {
            if(object.MDG_ID){
                delete object.MDG_ID;
            }
          });
    }
    
        // inspectionObj = this.props.erpFlag == "Y" ? inspectionObj.map(val => {
        //     return {
        //     ...val,
        //     "MDG_ID": val.MDG_ID,
        // }
        // }) : inspectionObj
        // console.log(inspectionObj)

        return {
            "updatedData": {
                "inspectionSummary":  inspectionObj,
                "inspectionDetails": this.inspDetReq()
            },
            "opsTrackerCreateReqBody": null,
            "opsTrackerUpdateReqBody": null
        }
    }
    inspDetReq = () => {
        let { vendorId, loginId, currentPmList } = this.props
     
        var reqArr = []
      
           
              this.props.pmListItemsTmplt.forEach(inval => {
                   inval.POST_REQUEST.forEach(val => {
                       reqArr.push(val)
                   }) 
              })
              return reqArr
              
        }
 updateNumber = () => {
    let { pmListItemsTmplt } = this.props;
    if (pmListItemsTmplt == null || pmListItemsTmplt.length == 0) {
      return [[], []];
    }
    let requiredList =
      !!this.state.po_nums &&
      pmListItemsTmplt.map((template) => {
        return template.PO_NUM;
      });
    let counter = [];
    requiredList.forEach((eachElement) => {
      counter[eachElement] =
        counter[eachElement] == undefined ? 1 : counter[eachElement] + 1;
    });
    return [Object.entries(counter), Object.entries(counter)];
  };


    renderLoading = () => {
        return (
            <Loader color="#cd040b"
            size="75px"
            margin="4px"
            className="text-center" />
        )
    }        
        
        
        
    
    render() {
        const [poNames, poCount] = this.updateNumber();
        return (<div className="table-responsive vp_stepper_content">
            <div className="mb-3">
                <h4 className='h4 mb-3'>Bulk Upload PM Result</h4>
                <table className="table  sortable table-bordered text-center site-table mb-4" style={{ minHeight: "100px", maxHeight: "100px", "background": "#FFF", "border": "none" }}>
                    <thead className="vzwtable text-left">
                        <tr colSpan={"4"}>

                            <td className="Form-group" colSpan="4"><b> Upload Site Checklist  </b></td>

                            <td className="Form-group" colSpan="4">
                                <div className={"col-md-3 text-center dropzone-width"}>
                                <Dropzone
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
                                    {Object.keys(this.state.droppedFile).length > 0 && !this.state.invalidFileUpload && <ListOfFiles onRemoveClick={this.onAttachRemove.bind(this)} fileList={[this.state.droppedFile]} />}
                                    {this.state.invalidFileUpload && <h4 className="text-danger mt-3"><b>{this.state.invalidFileUploadMessage}</b></h4>}
                                </div>
                            </td>
                            {!!this.state.po_nums && (
                  <td className="Form-group" colSpan="4">
                    <tr>
                      <strong>
                        Total Included Sites: 
                        {poNames.length > 0 &&
                          poNames.reduce((acc, [name, count]) => {
                            return acc + count;
                          }, 0)}
                      </strong>
                    </tr>
                    {/* <tr>Selected Sites:{poNames.length}</tr> */}
                    {poNames && poNames.length > 0
                      ? poNames.map(([name, count]) => (
                          <tr>
                            <strong>
                              {name} : Sites Included: {count}
                            </strong>
                          </tr>
                        ))
                      : null}
                  </td>
                )}


                        </tr>
                    </thead>
                </table>
                {!this.state.invalidFileUpload && this.props.pmListItemsTmplt.filter(plt => !!plt.PO_NUM).length > 0 && <div>

                    <table style={{ "border": "7pt solid #f6f6f6", "borderCollapse": "collapse", "textAlign": "center" }}>
                        <thead style={{ "backgroundColor": "#f6f6f6", "color": "black" }}>
                            <tr>
                                
                                <th>PO Number</th>
                                <th>Site Name</th>
                                <th>Site Id</th>
                                <th>PS Location Id</th>
                                <th>MDGLC</th>
                                <th>PM Date</th>
                                <th>Vendor Techname</th>

                            </tr>
                        </thead>
                        <tbody>
                            {this.props.pmListItemsTmplt.filter(plt => !!plt.PO_NUM).map(val => {
                                return (<tr>
                                    <td>{val.PO_NUM? val.PO_NUM : ''}</td>
                                    <td>{val.locationName? val.locationName : ''}</td>
                                    <td>{val.SITE_ID ? val.SITE_ID : ''}</td>
                                    <td>{val.PS_LOCATION_ID ? val.PS_LOCATION_ID : ''}</td>
                                    <td>{val.MDG_ID ? val.MDG_ID : ''}</td>
                                    <td>{val.PM_DATE ? val.PM_DATE : ''}</td>
                                    <td>{val.VENDORTECHNAME ? val.VENDORTECHNAME : ''}</td>

                                </tr>)
                            })}
                        </tbody>
                    </table>
                </div>}
                <button className="btn btn-danger btn button-class float-right" onClick={this.onSubmit} disabled={this.state.invalidFileUpload}>Submit</button>
                {this.state.isUploading && this.renderLoading()}
            </div>
        </div>)
    }
}

function stateToProps(state, ownProps) {
    const selectedLists = ownProps.pmListDetails.filter(pl => !!pl.itemSelected)
    const listIds = selectedLists.map(sl => sl.PM_LIST_ID).join(',')
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
    let vendorId = user.toJS().vendor_id
    let pmGridDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List()).toJS()
    let pmListItemsTmplt = state.getIn(['PmDashboard', loginId, vendorId, "pm", 'PmlistItems', listIds], List()).toJS()
    let modelAttributes = state.getIn(['PmDashboard', loginId, vendorId, 'pm', 'pmModelAttDetails', 'getPmModelAttDetails'], List()).toJS()
    let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
    let syncedSitesInfo = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "syncedSitesInfo", 'getSyncedSitesInfo', 'siteinfo'], List()).toJS()
    let erpFlag = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails'], Map()).toJS().erpFlag

    return {
        user,
        loginId,
        vendorId,
        pmGridDetails,
        pmListItemsTmplt,
        modelAttributes,
        submarket,
        syncedSitesInfo,
        erpFlag
    }

}
export default connect(stateToProps, { ...pmActions })(BulkUploadPm)

