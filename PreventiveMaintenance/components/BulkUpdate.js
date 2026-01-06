import React, { Component } from 'react'
import { Map, fromJS, List } from 'immutable'
import Loader from '../../Layout/components/Loader'
import Select from 'react-select'
import Checkbox from '@material-ui/core/Checkbox';
import { connect } from "react-redux"
import ListOfFiles from './ListOfFiles'
import Dropzone from 'react-dropzone'
import XLSX from 'xlsx';
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils'
import moment from 'moment'
import * as pmActions from "../actions"
import { getHolidayEvents } from "../../sites/actions"
import { SingleDatePicker } from 'react-dates'
import { ivrEmailNotify } from '../../Users/actions'
import ContactSupportOutlined from '@material-ui/icons/ContactSupportOutlined'
import { DataGrid } from '@mui/x-data-grid'

class BulkUpdate extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

            pendingSitesForUpdate: [],
            selectedSites: [],
            scheduleDate: moment().add(1, 'd'),
            scheduleDateFocused: null,
            selectedId: [],
            pageLoading: false,
            disableSave: true,
            fastHolidays: null,
            enableVzReview: false,
            vzReviewBanner: false
        }
    }
    componentDidMount() {
        this.bulkUpdateinit()
        const { vendorId, loginId, submarket, fetchSyncedSitesInfo } = this.props
        if (this.props.selPOList && this.props.selPOList[0].PM_TYPE_NAME === 'GO95') {
            this.setState({ pageLoading: true })
            fetchSyncedSitesInfo(vendorId, loginId, submarket, "bxcoyne").then(async action => {
                this.setState({ pageLoading: false })
                if (action && action.type === "FETCH_SYNCEDSITESINFO_SUCCESS") {
                }

            })
        }
        this.props.getHolidayEvents().then(res => {
            if (res.type === 'FETCH_HOLIDAYEVENTS_SUCCESS') {
                const fastHolidays = res.holidayEvents && res.holidayEvents.length > 0 ? res.holidayEvents.map((hol) => hol.HOLIDAY_DATE && hol.HOLIDAY_DATE.length > 10 && hol.HOLIDAY_DATE.substring(0, 10)) : []
                this.setState({ fastHolidays: fastHolidays })
            }
        })
    }
    bulkUpdateinit = () => {
        const { vendorId, loginId, submarket, pmListDetails, fetchPendingSitesForUpdate, selPOList, pmRefDetails } = this.props
        const selectedLists = pmListDetails.filter(pl => !!pl.itemSelected)
        const listIds = selectedLists.map(sl => sl.PM_LIST_ID).join(',')
        let selectedList = selPOList.filter(({ itemSelected }) => !!itemSelected)
        const equipment = pmRefDetails.find(item => item.PM_TYPE_ID === selectedList[0].PM_TYPE_ID)
        fetchPendingSitesForUpdate(vendorId, loginId, listIds, equipment.EQUIPMENT_TYPE).then(async action => {
            if (action.type === 'FETCH_PNDGSITES_SUCCESS') {
                await this.setState({ pendingSitesForUpdate: action.PendingSitesForUpdate.getPendingItemsForUpdate.listItems })

            }
        })

    }
    lastInspType = (val) => {
        let derived_last_inspection_type = ''
        let eqipInfo = this.props.syncedSitesInfo.find((site) => site.EQUIPMENT_INFO[0].pole_unid === val.EQUIPMENT_UNID) ? this.props.syncedSitesInfo.find((site) => site.EQUIPMENT_INFO[0].pole_unid === val.EQUIPMENT_UNID).EQUIPMENT_INFO : ''
        if (eqipInfo.length > 0) {
            let todayYear = moment().year()
            let patrol = todayYear - moment(eqipInfo[0].last_pole_patrol_insp.split(' ')[0], 'YYYY-MM-DD').year()
            let detailed = todayYear - moment(eqipInfo[0].last_pole_detailed_insp.split(' ')[0], 'YYYY-MM-DD').year()
            detailed > patrol ? derived_last_inspection_type = 'PATROL' : (detailed < patrol ? derived_last_inspection_type = 'DETAILED' : derived_last_inspection_type = 'DETAILED')
        }

        return derived_last_inspection_type
    }
    modifyGridDetails = () => {
        return this.state.pendingSitesForUpdate.map((val) => ({
            id: !!val.PM_LIST_ITEM_ID ? val.PM_LIST_ITEM_ID : '',
            PM_LIST_ITEM_ID: !!val.PM_LIST_ITEM_ID ? val.PM_LIST_ITEM_ID : '',
            PM_LIST_ID: !!val.PM_LIST_ID ? val.PM_LIST_ID : '',
            INCLUDED_IN_PMLIST: !!val.INCLUDED_IN_PMLIST ? val.INCLUDED_IN_PMLIST : '',
            PM_ITEM_STATUS: !!val.PM_ITEM_STATUS ? val.PM_ITEM_STATUS : '',
            BUYER: !!this.props.pmListDetails.find(inval => inval.PM_LIST_ID === val.PM_LIST_ID) ? this.props.pmListDetails.find(inval => inval.PM_LIST_ID === val.PM_LIST_ID).BUYER : '',
            LOCATION_PRIORITY: !!val.LOCATION_PRIORITY ? val.LOCATION_PRIORITY : '',
            PO_NUM: !!val.PO_NUM ? val.PO_NUM : '',
            PS_LOCATION_ID: !!val.PS_LOCATION_ID ? val.PS_LOCATION_ID : '',
            MDG_ID: !!val.MDG_ID ? val.MDG_ID : '',
            PM_SITE_ID: !!val.PM_SITE_ID ? val.PM_SITE_ID : '',
            PM_LOCATION_NAME: !!val.PM_LOCATION_NAME ? val.PM_LOCATION_NAME : '',
            PM_LOCATION_STATUS: !!val.PM_LOCATION_STATUS ? val.PM_LOCATION_STATUS : '',
            DESCRIPTION: !!val.DESCRIPTION ? val.DESCRIPTION : '',
            PO_ITEM_ID: !!val.PO_ITEM_ID ? val.PO_ITEM_ID : '',
            SCHEDULED_DATE: !!val.SCHEDULED_DATE ? moment(val.SCHEDULED_DATE).format('MM/DD/YYYY') : '',
            PM_COST: !!val.PM_COST ? val.PM_COST : '',
            PM_ITEM_DUE_DATE: !!val.PM_ITEM_DUE_DATE ? moment(val.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : '',
            SITE_COUNTY: !!val.SITE_COUNTY ? val.SITE_COUNTY : '',
            SITE_CITY: !!val.SITE_CITY ? val.SITE_CITY : '',
            FIRE_ZONE_SECTOR: !!val.FIRE_ZONE_SECTOR ? val.FIRE_ZONE_SECTOR : '',
            STRUCTURE_TYPE: (this.props.syncedSitesInfo.find((site) => site.EQUIPMENT_INFO[0].pole_unid === val.EQUIPMENT_UNID)) ? (this.props.syncedSitesInfo.find((site) => site.EQUIPMENT_INFO[0].pole_unid === val.EQUIPMENT_UNID).EQUIPMENT_INFO[0].structure_type) : '',
            Address: this.props.syncedSitesInfo.find((site) => site.EQUIPMENT_INFO[0].pole_unid === val.EQUIPMENT_UNID) ? (this.props.syncedSitesInfo.find((site) => site.EQUIPMENT_INFO[0].pole_unid === val.EQUIPMENT_UNID).SITE_ADDRESS) : '',
            //LAST_INSP_DATE:  '',
            //(this.lastInspType(val)==='PATROL')? moment(this.props.syncedSitesInfo.find((site)=>site.EQUIPMENT_INFO[0].pole_unid===val.EQUIPMENT_UNID).last_pole_patrol_insp).format('MM/DD/YYYY') : (this.lastInspType(val)==='DETAILED')? moment(this.props.syncedSitesInfo.find((site)=>site.EQUIPMENT_INFO[0].pole_unid===val.EQUIPMENT_UNID).last_pole_detailed_insp).format('MM/DD/YYYY') : '' ,
            //Last_Insp_Type: ''
            //this.lastInspType(val) ? this.lastInspType(val) : ''

        }))

    }

    renderLoading = () => {
        return (
            <Loader color="#cd040b"
                size="75px"
                margin="4px"
                className="text-center" />
        )
    }
    onSelectionChanged = async (selectedId) => {
        const selectedSites = this.state.pendingSitesForUpdate.filter(val => selectedId.includes(val.PM_LIST_ITEM_ID))
        await this.setState({ selectedSites, selectedId, enableVzReview: false, vzReviewBanner: false })
    }
    getUpdateList = () => {
        return this.state.selectedSites.map(({ PM_LIST_ITEM_ID, PM_LIST_ID, PM_ITEM_DUE_DATE, PM_COST, INCLUDED_IN_PMLIST, PM_ITEM_STATUS }) => ({
            PM_LIST_ITEM_ID,
            PM_LIST_ID,
            PM_ITEM_DUE_DATE: moment(PM_ITEM_DUE_DATE).format('DD/MM/YYYY'),
            PM_COST,
            INCLUDED_IN_PMLIST,
            LAST_UPDATED_BY: this.props.user['vendor_name'],//vendorname
            ACTION: 'UPDATE',
            PM_ITEM_STATUS,
            SCHEDULED_DATE: moment(this.state.pendingSitesForUpdate.find((site) => site.PM_LIST_ITEM_ID === PM_LIST_ITEM_ID).SCHEDULED_DATE).format('DD/MM/YYYY'),
            declinedComment: null
        }))
    }
    formPostRequest = () => {
        return {
            "pmListitemsCount": null,
            "updateList": this.getUpdateList(),
            "addList": [],
            "pmList": []
        }
    }

    onApply = () => {
        let pendingSitesForUpdate = [], selSites = this.state.selectedSites, pendSites = this.state.pendingSitesForUpdate

        for (var j = 0; j < pendSites.length; j++) {
            for (var i = 0; i < selSites.length; i++) {
                if (pendSites[j].PM_LIST_ITEM_ID === selSites[i].PM_LIST_ITEM_ID) {
                    pendSites[j].SCHEDULED_DATE = (moment(this.state.scheduleDate, 'DD/MM/YYYY').isValid()) ? this.state.scheduleDate : moment(this.state.scheduleDate).format('DD/MM/YYYY')
                }
            }
            this.setState({ pendingSitesForUpdate: [...pendSites], disableSave: false })
        }

    }
    async onSubmit() {
        const postRequest = await this.formPostRequest()
        const refName = 'updatePM'
        const { vendorId, loginId } = this.props
        await this.props.createPMList(vendorId, loginId, refName, false, postRequest, true).then(action => {
            this.setState({ disableSave: true })
            if (action.type === 'CREATE_PM_LIST_SUCCESS') {
                this.setState({ enableVzReview: true, vzReviewBanner: true })
                this.props.notiref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "Date Updated successfully"
                })
                this.bulkUpdateinit()
            }
            else {
                this.props.notiref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: "Date updation failed"
                })
            }
        })
    }

    validateAndSetDate = (date) => {
        if ([0, 6].includes(date.day())) {
            this.props.notiref.addNotification({
                title: 'Error',
                position: "br",
                level: 'error',
                message: "Weekends are not allowed"
            })
            return
        }
        if (moment(date).format("YYYY-MM-DD") < moment().format("YYYY-MM-DD")) {
            this.props.notiref.addNotification({
                title: 'Error',
                position: "br",
                level: 'error',
                message: "Cannot pick previous dates"
            })
            return
        }
        if (this.state.fastHolidays && this.state.fastHolidays.includes(moment(date).format("YYYY-MM-DD"))) {
            this.props.notiref.addNotification({
                title: 'Error',
                position: "br",
                level: 'error',
                message: "Selected date is a Verizon Holiday"
            })
            return
        }
        this.setState({ scheduleDate: date, enableVzReview: false, vzReviewBanner: false })
    }
    render() {
        const modfdGridDetails = this.modifyGridDetails();
        let columns = [
            {
                headerName: "PO Number", field: "PO_NUM", flex: 1, minWidth: 100
            },
            {
                headerName: "MDGLC", field: "MDG_ID", flex: 1
            },
            {
                headerName: "Site ID", field: "PM_SITE_ID", flex: 1
            },
            {
                headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 1, minWidth: 150
            },
            {
                headerName: "Site Status", field: "PM_LOCATION_STATUS", flex: 1
            },
            {
                headerName: "City", field: "SITE_CITY", flex: 1
            },
            {
                headerName: "County", field: "SITE_COUNTY", flex: 1
            },
            {
                headerName: "Proposed Due Date ", field: "SCHEDULED_DATE", flex: 1, minWidth: 100
            },
            {
                headerName: "Current Due Date", field: "PM_ITEM_DUE_DATE", flex: 1, minWidth: 100
            },
            {
                headerName: "Cost", field: "PM_COST", flex: 1
            },
            {
                headerName: "PO Item Id", field: "PO_ITEM_ID", flex: 1
            },
            {
                headerName: `${this.props.esaFlag === "Y" ? 'Requisitioner' : "Buyer"}`, field: "BUYER", flex: 1
            },
            {
                headerName: "Site Priority", field: "LOCATION_PRIORITY", flex: 1
            }
        ]
        let go95Columns = [
            {
                headerName: "PO Number", field: "PO_NUM", tooltipField: "PO_NUM", flex: 1
            },
            {
                headerName: "PS Loc ID", field: "PS_LOCATION_ID", flex: 1
            },
            {
                headerName: "SITE ID", field: "PM_SITE_ID", flex: 1
            },
            {
                headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 1
            },
            {
                headerName: "Site Status", field: "PM_LOCATION_STATUS", flex: 1
            },
            {
                headerName: "City", field: "SITE_CITY", flex: 1
            },
            {
                headerName: "County", field: "SITE_COUNTY", flex: 1
            },
            {
                headerName: "Pole Type", field: "STRUCTURE_TYPE", flex: 1
            },
            {
                headerName: "Tier", field: "FIRE_ZONE_SECTOR", flex: 1
            },
            {
                headerName: "Schedule Date ", field: "SCHEDULED_DATE", flex: 1

            },
            // {
            //     headerName: "Last Insp Type", headerTooltip: "Last Insp Type", field: "Last_Insp_Type", tooltipField: "Last_Insp_Type", flex:1
            // },
            // {
            //     headerName: "Last Insp Date", headerTooltip: "Last Insp Date", field: "LAST_INSP_DATE", tooltipField: "LAST_INSP_DATE", flex:1
            // },
            {
                headerName: "Address", field: "Address", flex: 1
            },
            {
                headerName: "List Item ID", field: "PM_LIST_ITEM_ID", flex: 1
            },
        ]
        if (this.props.esaFlag === "Y") {
            columns = columns.filter(obj => obj.headerName !== 'PS Loc ID')
            go95Columns = go95Columns.filter(obj => obj.headerName !== 'PS Loc ID')
        }

        let customStyle = { fontSize: '12px', marginTop: '5px' }
        return (<div className="App container-fluid">
            <div className="row">
                <div className="col-md-6 row text-left">
                    <span style={{ paddingRight: "5px" }}>
                        {
                            this.props.selPOList && this.props.selPOList[0].PM_TYPE_NAME === 'GO95' ? (<b>Schedule Date</b>) : (<b>Due Date</b>)
                        }
                    </span>
                    <SingleDatePicker orientation={'vertical'} verticalHeight={380}
                        numberOfMonths={1} showDefaultInputIcon={false}
                        onDateChange={scheduleDate => this.validateAndSetDate(scheduleDate)}
                        onFocusChange={({ focused }) =>
                            this.setState({ scheduleDateFocused: focused })
                        }
                        focused={this.state.scheduleDateFocused} isOutsideRange={() => false}
                        date={this.state.scheduleDate} block
                    />
                    {
                        this.props.selPOList && this.props.selPOList[0].PM_TYPE_NAME === 'GO95' ? null : (
                            <div style={{ "padding": "5px" }}>
                                <p className="text-left" style={{ marginTop: "5px", color: "red" }}>We recommend that you pick the last business day of the month</p>
                                <p className="text-left" style={{ marginTop: "5px", color: "red" }}>Dates in past, Weekends and VERIZON holidays will be rejected by the system</p>
                            </div>
                        )
                    }
                </div>

            </div>

            {this.state.pageLoading ? this.renderLoading() :
                <div style={{ "paddingTop": "15px", "paddingBottom": "15px" }}>
                    {
                        this.props.selPOList && this.props.selPOList[0].PM_TYPE_NAME === 'GO95' ?
                            (<DataGrid
                                checkboxSelection={true}
                                rows={!modfdGridDetails ? [] : modfdGridDetails}
                                columns={go95Columns}
                                rowHeight={30}
                                columnHeaderHeight={35}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 10 }
                                    },
                                }}
                                sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' } }}
                                onRowSelectionModelChange={this.onSelectionChanged}
                            />)
                            : (
                                <DataGrid
                                    checkboxSelection={true}
                                    rows={!modfdGridDetails ? [] : modfdGridDetails}
                                    columns={columns}
                                    rowHeight={30}
                                    columnHeaderHeight={35}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 10 }
                                        },
                                    }}
                                    sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' } }}
                                    onRowSelectionModelChange={this.onSelectionChanged}
                                />
                            )
                    }
                </div>}
            <div className="row">
                <div className="col-md-10" />
                <div className="col-md-6 row" />
                <div className="col-md-6 float-right">
                    <div className="float-right">
                        <button className="btn btn-danger btn button-class ml-2" disabled={this.state.enableVzReview == false} style={{width : 'max-content'}}
                            onClick={this.props.onVzReviewClick.bind(this)}>Submit to VZ for approval</button>
                    </div>
                    <div className="float-right">
                        <button className="btn btn-danger btn button-class ml-2" disabled={this.state.selectedSites.length === 0 || this.state.disableSave}
                            onClick={this.onSubmit.bind(this)}>Save</button>
                    </div>
                    <div className="float-right">
                        <button className="btn btn-danger btn button-class" disabled={this.state.selectedSites.length === 0 || this.state.scheduleDate === 0 || this.state.enableVzReview == true}
                            onClick={this.onApply.bind(this)}>Apply</button>
                    </div>
                </div>
            </div>
            {this.state.vzReviewBanner ? <div style={{color:'#FF7518', fontWeight:'bold', paddingTop:'10px'}}>Save and Continue with More Changes -OR- Submit to VZ for Approval </div> : null}
            <div className="row" style={{ "paddingTop": "15px" }}> <div className="col-md-10" /><div className="col-md-6 row" /><div className="col-md-6 float-right"><div className="col-lg-7 float-right" style={{ color: '#007bff' }}>Please only click on "Submit to VZ for Approval" after you have saved all the changes</div></div></div>
        </div>)
    }
}

function stateToProps(state, ownProps) {

    // rowData={!modfdGridDetails ? [] : modfdGridDetails}  
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
    let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
    let user = !!state.getIn(['Users', 'entities', 'users', loginId], Map()) ? state.getIn(['Users', 'entities', 'users', loginId], Map()).toJS() : []
    let vendorId = user.vendor_id
    let pmListDetails = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", 'getPmListDetails', 'pmLists'], List()).toJS()
    let syncedSitesInfo = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "syncedSitesInfo", 'getSyncedSitesInfo', 'siteinfo'], List()).toJS()
    let config = state.getIn(['Users', 'configData', 'configData'], List())
    let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;
    return {
        user,
        loginId,
        vendorId,
        market,
        submarket,
        pmListDetails,
        syncedSitesInfo,
        esaFlag
    }
}

export default connect(stateToProps, { ...pmActions, getHolidayEvents, ivrEmailNotify })(BulkUpdate)