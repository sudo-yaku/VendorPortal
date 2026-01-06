import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as pmActions from "../PreventiveMaintenance/actions"
import { Map } from 'immutable'
import Loader from '../Layout/components/Loader'
import {PropTypes} from 'prop-types'
import Modal from "../Layout/components/Modal"
import "../PreventiveMaintenance/assets/pmstyles.css"
import RefreshPage from '../sites/images/Reload.png'
import ReportIssue from '../Images/Report_Issue.png'
var NotificationSystem = require('react-notification-system')
import Reporter from '../VendorDashboard/components/Reporter'
import ReactTooltip from 'react-tooltip'
import moment from 'moment'
import NestEvalModel from './NestEvalModel'
import excel from '../Excel/images/Excel.svg'
import XLSX from 'xlsx'
import { saveAs } from "file-saver"
import 'react-dates/initialize'
import { DataGrid } from '@mui/x-data-grid';

const selectLoginId = state => state.getIn(["Users", "currentUser", "loginId"], "")
const selectUser = state => {
    const loginId = selectLoginId(state)
    return state.getIn(['Users', 'entities', 'users', loginId], Map())
}
const selectVendorId = state => {
    const user = selectUser(state)
    return user.toJS().vendor_id
}

const NestEvaluation = () => {
    const dispatch = useDispatch()
    const loginId = useSelector(selectLoginId)
    const user = useSelector(selectUser)
    const vendorId = useSelector(selectVendorId)

    const [isReportIssueShown, setIsReportIssueShown] = useState(false)
    const [isModalClicked, setIsModalClicked] = useState(false)
    const [searchVal, setSearchVal] = useState('')
    const [onClose, setOnClose] = useState(true)
    const [pageLoading, setPageLoading] = useState(false)
    const [questionnaireList, setQuestionnaireList] = useState([])
    const [visibleQnnaireList, setVisibleQnnaireList] = useState([])
    const [searchedList, setSearchedList] = useState([])
    const [status, setStatus] = useState('')
    const [selectedRow, setSelectedRow] = useState({})

    const notificationSystemRef = useRef(null)

    const renderLoading = () => <Loader color="#cd040b" size="40px" margin="4px" className="text-center" />

    const onRowClicked = (e) => {
        setIsModalClicked(true)
        setSelectedRow(e)
    }

    const handleHideModal = () => {
        setIsModalClicked(false)
    }

    const onModelClick = () => (
        <Modal title="Bird Nest Questionnaire Details" handleHideModal={handleHideModal} initNestDashBoard={initNestDashBoard} style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px" }}>
            <NestEvalModel
                notifref={notificationSystemRef.current}
                handleHideModal={handleHideModal}
                selectedRow={selectedRow}
                workORderInfo={null}
                refreshDashboard={initNestDashBoard}
            />
        </Modal>
    )

    const showReportIssue = () => setIsReportIssueShown(true)
    const hideReportSearchModal = () => setIsReportIssueShown(false)

    const renderReportIssue = () => (
        <Modal title="Report Issue" handleHideModal={hideReportSearchModal} style={{ width: "70%", maxWidth: "97%", top: "25%" }}>
            <Reporter notifref={notificationSystemRef.current} />
        </Modal>
    )

    const initNestDashBoard = useCallback(async () => {
        setPageLoading(true)
        setSearchVal('')
        setOnClose(true)
        setSearchedList([])
        setVisibleQnnaireList([])
        setStatus('')
        if (document.getElementById('search-bar')) {
            document.getElementById('search-bar').value = ''
        }
        const action = await dispatch(pmActions.fetchNestQs(vendorId, loginId))
        if (action.type === "FETCH_NESTEVALUATIONQS_SUCCESS" && action.nestData.length > 0) {
            setQuestionnaireList(action.nestData)
        } else {
            setQuestionnaireList([])
        }
        setPageLoading(false)
    }, [dispatch, vendorId, loginId])

    useEffect(() => {
        notificationSystemRef.current = notificationSystemRef.current
        initNestDashBoard()
    }, [initNestDashBoard])

    const handleSearch = (e) => {
        const value = e.target.value
        setSearchVal(value)
        let searched = []
        const targetValLowercase = value.toLowerCase()
        if (value.length > 2) {
            searched = questionnaireList.filter(questionnaire => {
                let marketMatch = questionnaire.area?.toLowerCase().includes(targetValLowercase)
                let submarketMatch = questionnaire.region?.toLowerCase().includes(targetValLowercase)
                let stateMatch = questionnaire.market?.toLowerCase().includes(targetValLowercase)
                let switchMatch = questionnaire.switch?.toLowerCase().includes(targetValLowercase)
                let site_idMatch = questionnaire.site_number?.toLowerCase().includes(targetValLowercase)
                let site_nameMatch = questionnaire.site_name?.toLowerCase().includes(targetValLowercase)
                let REPORTED_BYMatch = questionnaire.reported_by?.toLowerCase().includes(targetValLowercase)
                let REPORTED_DATEMatch = questionnaire.reported_on?.toLowerCase().includes(targetValLowercase)
                let statusMatch = questionnaire.status?.toLowerCase().includes(targetValLowercase)
                return marketMatch || submarketMatch || stateMatch || switchMatch || site_idMatch || site_nameMatch || REPORTED_BYMatch || REPORTED_DATEMatch || statusMatch
            })
        }
        setSearchedList(searched)
    }

    const handleRefresh = () => {
        initNestDashBoard()
    }

    const apiRef = params => {
        window.addEventListener('resize', function () {
            setTimeout(function () {
                params?.autosizeColumns({
                    includeHeaders: true,
                    includeOutliers: true,
                })
            })
        })
    }

    const getRowId = (row) => row.bna_metauniversal_id

    const onExcelDownload = () => {
        const data = []
        if (visibleQnnaireList.length > 0) {
            let input = visibleQnnaireList
            const pages = Array.isArray(input) ? input : [input]
            for (let page = Object.keys(pages), j = 0, end = page.length; j < end; j++) {
                let key = page[j], value = pages[key]
                let exceldata = {
                    "Area": value && value.area ? value.area : '',
                    "Market": value && value.region ? value.region : '',
                    "State": value && value.state ? value.state : '',
                    "City": value && value.city ? value.city : '',
                    "Site Id": value && value.site_number ? value.site_number : '',
                    "Site Name": value && value.site_name ? value.site_name : '',
                    "Reported by": value && value.reported_by ? value.reported_by : '',
                    "Reported date": value && value.reported_on ? moment(value.reported_on).format('MM/DD/YYYY') : '',
                    "Status": value && value.status ? value.status : ''
                }
                data.push(exceldata)
            }
        }
        let ws = XLSX.utils.json_to_sheet(data)
        let wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "NestEvaluation")
        let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' })
        let buf = new ArrayBuffer(wbout.length)
        let view = new Uint8Array(buf)
        for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF
        saveAs(new Blob([buf], { type: "application/octet-stream" }), status.toLowerCase().includes('open') ? `Open_NestEvaluationData.xlsx` : `Closed_NestEvaluationData.xlsx`)
    }

    const cardClicked = (statusVal) => {
        let visibleQnnaireList = []
        if (statusVal === "Open") {
            visibleQnnaireList = questionnaireList.filter(v => v.status && !v.status.toLowerCase().includes('close'))
        } else {
            visibleQnnaireList = questionnaireList.filter(v => v.status && v.status.toLowerCase().includes('close'))
        }
        setVisibleQnnaireList(visibleQnnaireList)
        setOnClose(false)
        setStatus(statusVal)
    }

    const modfdGridDetailsSearch = () => {
        return searchedList.map((questionnaire) => ({
            ...questionnaire,
            market: questionnaire.area ? questionnaire.area : '',
            submarket: questionnaire.region ? questionnaire.region : '',
            state: questionnaire.state ? questionnaire.state : '',
            city: questionnaire.city ? questionnaire.city : '',
            site_id: questionnaire.site_number ? questionnaire.site_number : '',
            site_name: questionnaire.site_name ? questionnaire.site_name : '',
            REPORTED_BY: questionnaire.reported_by ? questionnaire.reported_by : '',
            REPORTED_DATE: questionnaire.reported_on ? moment(questionnaire.reported_on).format('MM/DD/YYYY') : '',
            status: questionnaire.status ? questionnaire.status : '',
        }))
    }

    const modifyGridDetails = () => {
        return visibleQnnaireList.map((questionnaire) => ({
            ...questionnaire,
            market: questionnaire.area ? questionnaire.area : '',
            submarket: questionnaire.region ? questionnaire.region : '',
            state: questionnaire.state ? questionnaire.state : '',
            city: questionnaire.city ? questionnaire.city : '',
            site_id: questionnaire.site_number ? questionnaire.site_number : '',
            site_name: questionnaire.site_name ? questionnaire.site_name : '',
            REPORTED_BY: questionnaire.reported_by ? questionnaire.reported_by : '',
            REPORTED_DATE: questionnaire.reported_on ? moment(questionnaire.reported_on).format('MM/DD/YYYY') : '',
            status: questionnaire.status ? questionnaire.status : '',
        }))
    }

    const dateFormatter = (date) => {
        const formattedDate = date ? String(date.getMonth() + 1).padStart(2, '0') + '/' +
            String(date.getDate()).padStart(2, '0') + '/' +
            date.getFullYear() : null;
        return <span title={formattedDate || null}>{formattedDate || null}</span>;
    }

    const modfdGridDetails = modifyGridDetails()
    const modfdGridDetailsSearchData = modfdGridDetailsSearch()

    let columns = [
        {
            headerName: "Area", field: "market", flex: 1
        },
        {
            headerName: "Market", field: "submarket", flex: 1
        },
        {
            headerName: "State", field: "state", flex: 1
        },
        {
            headerName: "City", field: "city", flex: 1
        },
        {
            headerName: "Site Id", field: "site_id", flex: 1
        },
        {
            headerName: "Site Name", field: "site_name", flex: 1
        },
        {
            headerName: "Reported by", field: "REPORTED_BY", flex: 1
        },
        {
            headerName: "Reported date", field: "REPORTED_DATE", flex: 1,
            renderCell: (params) => {
                let data = params.value;
                const date = data ? new Date(params.value) : null;
                return dateFormatter(date);
            },
            valueGetter: function (value) {
                return value ? new Date(value) : null;
            },
            type: "date",
        },
        {
            headerName: "Status", field: "status", flex: 1
        }
    ]

    return (
        <div className="container-fluid" style={{ "paddingTop": "120px" }}>
            <div className="row">
                <div className="search-bar float-left col-md-4" >
                    <input
                        placeholder="Search Questionnaire"
                        className="form-control title-div-style"
                        style={{ "height": "5vh" }}
                        autoComplete='off'
                        onChange={handleSearch}
                        id="search-bar"
                    />
                </div>
                <div className="col-md-4"></div>
                <div className="col-md-4 float-right" >
                    <a onClick={showReportIssue} className="navbar-brand pointer float-right" data-tip data-for="ReportIssue">
                        <small>
                            <img src={ReportIssue} style={{ height: '27px' }} />
                        </small>
                    </a>
                    <ReactTooltip id="ReportIssue" place="top" effect="float">
                        <span>Report Issue</span>
                    </ReactTooltip>
                    <a onClick={handleRefresh} className="navbar-brand pointer float-right" data-tip data-for="Refresh" >
                        <small>
                            <img src={RefreshPage} style={{ height: '27px' }} />
                        </small>
                    </a>
                    <ReactTooltip id="Refresh" place="top" effect="float">
                        <span>Refresh</span>
                    </ReactTooltip>
                </div>
            </div>
            {searchVal.length > 0 && <div className="col-md-12 wo-content no-padding mt-3">
                <DataGrid
                    apiRef={apiRef}
                    checkboxSelection={false}
                    rows={!modfdGridDetailsSearchData ? [] : modfdGridDetailsSearchData}
                    columns={columns}
                    onRowClick={(params) => onRowClicked(params.row)}
                    hideFooterSelectedRowCount
                    rowHeight={30}
                    columnHeaderHeight={35}
                    getRowId={getRowId}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 }
                        }
                    }}
                    pageSizeOptions={[10, 15, 20]}
                    sx={{
                        fontSize: '1rem',
                        minHeight: 300,
                        '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', },
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
                />
            </div>}
            {pageLoading ? renderLoading() : <div className="container-fluid row mt-5">
                <div className="col-md-6">
                    <div className=" wo-header no-padding text-center">
                        <span>Open</span>
                    </div>
                    <div className="wo-content  hover-card" style={{ "cursor": "pointer" }} onClick={() => cardClicked('Open')}>
                        {questionnaireList.filter(v => v.status && !v.status.toLowerCase().includes('close')).length}
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="wo-header no-padding text-center">
                        <span>Closed</span>
                    </div>
                    <div className=" wo-content  hover-card-closed" style={{ "cursor": "pointer" }} onClick={() => cardClicked('Closed')}>
                        {questionnaireList.filter(v => v.status && v.status.toLowerCase().includes('close')).length}
                    </div>
                </div>
            </div>}
            {!onClose && <div className="container-fluid row mt-5">
                <div className="col-md-12 wo-header no-padding text-center">
                    <span>{status}</span>
                    <a onClick={() => setOnClose(true)}><i className="fa fa-times float-right vz-pointer" style={{ margin: '0.5rem 1rem 0 1rem' }}></i></a>
                    {visibleQnnaireList.length > 0
                        ?
                        <img className="float-right vz-pointer" style={{ height: "25px", width: "25px" }} src={excel} onClick={onExcelDownload} />
                        : null
                    }
                </div>
                <div className="col-md-12 wo-content no-padding">
                    <DataGrid
                        apiRef={apiRef}
                        checkboxSelection={false}
                        rows={!modfdGridDetails ? [] : modfdGridDetails}
                        columns={columns}
                        onRowClick={(params) => onRowClicked(params.row)}
                        hideFooterSelectedRowCount
                        rowHeight={30}
                        columnHeaderHeight={35}
                        getRowId={getRowId}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 }
                            }
                        }}
                        pageSizeOptions={[10, 15, 20]}
                        sx={{
                            fontSize: '1rem',
                            minHeight: 300,
                            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', },
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
                    />
                </div>
            </div>}
            <NotificationSystem ref={notificationSystemRef} />
            {isReportIssueShown ? renderReportIssue() : null}
            {isModalClicked ? onModelClick() : null}
        </div>
    )
}

export default NestEvaluation

NestEvaluation.propTypes = {
    loginId: PropTypes.string,
    user: PropTypes.object,
    vendorId: PropTypes.string,
    questionnaireList: PropTypes.array,
    visibleQnnaireList: PropTypes.array,
    searchedList: PropTypes.array,
    status: PropTypes.string,
    selectedRow: PropTypes.object,
    pageLoading: PropTypes.bool,
    isReportIssueShown: PropTypes.bool,
    isModalClicked: PropTypes.bool,
    searchVal: PropTypes.string,
    onClose: PropTypes.bool,
    initNestDashBoard: PropTypes.func,
    handleSearch: PropTypes.func,
    handleRefresh: PropTypes.func,
    cardClicked: PropTypes.func,
    onRowClicked: PropTypes.func,
    handleHideModal: PropTypes.func,
    onExcelDownload: PropTypes.func,
    showReportIssue: PropTypes.func,
    hideReportSearchModal: PropTypes.func,
    notificationSystemRef: PropTypes.object,
};