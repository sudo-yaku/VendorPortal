import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactTooltip from 'react-tooltip'
import { List, Map } from "immutable";
import * as DeviceTestActions from "../actions";
import Loader from "../../Layout/components/Loader";
import RefreshPage from '../../sites/images/RefreshIcon.png';
import NotStarted from '../../sites/images/NotStarted.png';
import Completed from '../../sites/images/Completed.png';
import Failed from '../../sites/images/Failed.png';
import InProgress from '../../sites/images/InProgress.png';
import HistoryIcon from '../../sites/images/HistoryIcon.svg';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

class EricssonServerTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            deviceTestStared: false,
            isRefreshing: false,
            retestTiggered: false,
            historyClicked: false,
            deviceTestHistoryLoading: false,
            serverTestLoading:false,
            duIDList: {},
            requestIDClicked: false,
            deviceConfigViewData: {},
            selectedDuId: "",
            showLoadingMessage: false,
            historyResponse: [],
            selectedReqID: "",
            selectedConfigtxt: {},
            ls3testresult: "",
            ls6testresult: "",
            selectedBand: "",
            selectedAccordion: "",
        }
    }
    componentDidMount() {
        let { proj_number } = this.props.selectedRow;
        this.ericssonDeviceTestDetails(proj_number);
    }
     getEricssonDeviceTestDetails = (refresh) => {
        if (refresh === "Refresh") {
            console.log("if blockk")
            this.setState({ isRefreshing: true })
        }
         this.getDeviceResults(this.state.selectedAccordion)
        
    }
    ericssonDeviceTestDetails = (proj_number) => {
        let { loginId } = this.props
        let cqdata = {
            "user_id": loginId,
            "cfg_request": {
                "test_type": "Skinny OS",
                "project_id": proj_number
            }
        }
        this.props.getLoadCqData(cqdata).then(response => {
            if (response) {
                let data = response?.getLoadCqData?.cfg_request?.sel_config
                if (response?.getLoadCqData?.errors?.length > 0) {
                    this.setState({ isLoading: false, isRefreshing: false })
                } else {
                    if (data?.length > 0) {

                        this.formatDeviceTestResponse(data);
                        this.getDeviceResults()
                        this.setState({ isLoading: false, isRefreshing: false, deviceTestStared: true })
                    } else {
                        this.setState({ isLoading: false, isRefreshing: false, deviceTestStared: false })
                    }
                }
            } else {
                this.setState({ isLoading: false, isRefreshing: false, deviceTestStared: false })
            }
        })
    }
    formatDeviceTestResponse = (data) => {
        let devices = {}
        data.forEach(result => {
            let vdu_id = String(result.vdu_id)
            let du_id = vdu_id.substring(vdu_id.length - 3)
            if (!devices.hasOwnProperty(du_id)) {
                devices[du_id] = { 'LS3': [], 'LS6': [] }

            }
        })

        data.forEach(result => {
            let vdu_id = String(result.vdu_id)
            let du_id = vdu_id.substring(vdu_id.length - 3)
            if (devices.hasOwnProperty(du_id)) {
                if (vdu_id.charAt(vdu_id.length - 4) == '2') {
                    devices[du_id]['LS3'].push(result)

                } else if (vdu_id.charAt(vdu_id.length - 4) == '3') {
                    devices[du_id]['LS6'].push(result)
                } else {
                    delete devices[du_id]
                }
            }
                    })
        this.setState({ duIDList: devices, selectedAccordion: this.state.selectedAccordion? this.state.selectedAccordion : Object.keys(devices)[0] })
    }
    getDeviceResults = (key) => {
        let { duIDList } = this.state     
        if (!key) {
            key = Object.keys(duIDList)[0]
        }
        if (!key) {
            return
        }
        Object.keys(duIDList[key]).map(id => {
            let vduIdobj = duIDList[key][id][0]
            if (!vduIdobj) {
                return
            }
            let vduID = vduIdobj.vdu_id
            this.props.getSkinnyOsHistoryData(vduID).then(res => {
                if (res?.getvduHistoryForProject?.req_details){
                    let data = res.getvduHistoryForProject.req_details
                    let deviceresult = data[0].test_status
                        if (vduID.charAt(vduID.length - 4) == '2') {
                            this.setState({ ls3testresult: deviceresult })
                        } else if (vduID.charAt(vduID.length - 4) == '3') {
                            this.setState({ ls6testresult: deviceresult })
                        }                       
                }
                this.setState({ isRefreshing: false })
            })  

        })
    }
    handleAccordion = (key, index) => {
        if (key == this.state.selectedAccordion) {
            this.setState({ selectedAccordion: null, selectedReqID: '', historyClicked: false })
        } else {
            this.setState({ selectedAccordion: key, selectedReqID: '', historyClicked: false })
            this.getDeviceResults(key)
        }
    }
    getSkinnyOSTestHistory = (vdu_id, key) => {
        this.setState({ deviceTestHistoryLoading: true, selectedBand: key, selectedReqID: '', historyClicked: true })
        this.props.getSkinnyOsHistoryData(vdu_id).then(res => {
            let data = res.getvduHistoryForProject.req_details
            if (res) {
                if (res?.errors?.length > 0) {
                    this.setState({ isLoading: false, isRefreshing: false, deviceTestHistoryLoading: false, historyResponse: [] })
                } else {
                    if (data?.length > 0) {
                        this.setState({ deviceTestHistoryLoading: false, historyResponse: data, selectedDuId: key })
                    } else {
                        this.setState({ deviceTestHistoryLoading: false, historyResponse: [] })
                    }
                }
            } else {
                this.setState({ deviceTestHistoryLoading: false, historyResponse: [] })
            }

        })
    }
    skinnyOsServerTest = (vdu_ID) => {
        this.setState({serverTestLoading:true})  
        let { proj_number } = this.props.selectedRow;
        let { loginId } = this.props
        let payload = {
            "user_id": loginId,
            "cfg_request": {
                "project_id": proj_number,
                "test_type": "Skinny OS",
                "vdu_id": vdu_ID,
                "vendorportal": "yes"
            }
        }
        let du_id = vdu_ID.substring(vdu_ID.length - 3)
        this.props.triggerEricssonTest(payload).then(res => {
            if (res?.errors) {
                let responseMsg = null
                this.setState({serverTestLoading:false})
                if (res?.errors?.length > 0) {
                    responseMsg = res?.errors[0].message
                } else {
                    responseMsg = 'Failed to trigger test'
                }
                return;
            } else if (res?.ericssionServerTest) {
                this.setState({serverTestLoading:false})
                this.getDeviceResults(du_id)
            }
        })
    }
    renderIcon = (icon) => {
        let iconType = ""
        switch (icon) {
            case "notstarted":
                iconType = NotStarted
                break;
            case "failed":
                iconType = Failed
                break;
            case "running":
                iconType = InProgress
                break;
            case "successful":
                iconType = Completed
                break;
            case "Refresh":
                iconType = RefreshPage
                break;
            case "History":
                iconType = HistoryIcon
                break;
            default:
                break;
        }
        return <small><img src={iconType} style={{ height: ["Refresh"].includes(icon) ? '20px' : '25px' }} /></small>
    }
    renderTableRows = (testData, key) => {
        if (!testData[0]) {
            return
        }
        let vdu_ID = testData[0].vdu_id
        let du_id = vdu_ID.substring(vdu_ID.length - 3)
        let test_status = key == "LS3" ? this.state.ls3testresult : key == "LS6" ? this.state.ls6testresult : null
        return testData.length > 0 && testData.map(data => {
            let retestStyles = {
                cursor: "pointer",
                pointerEvents: this.state.retestTiggered === true ? "none" : "all",
                color: this.state.retestTiggered === true ? "grey" : "black",
                textDecoration: "underline",
                margin: "3px",
                whiteSpace: "no-wrap",
                pointerEvents: this.state.serverTestLoading ? "none" :"auto"
            }
            let retestLable = test_status === "failed" ? "Retest" : test_status === "successful" ? "Start Test" : " "
            return (
                <tr style={{ borderBottom: "1px solid lightgrey", }}>
                    <td>
                        {this.renderIcon(test_status)}
                    </td>
                    <td style={{ textAlign: "left", color: "black" }}>Skinny OS Support
                    </td>
                    <td style={{ textAlign: "right", color: "#1386c0",fontWeight:"normal" ,whiteSpace:"nowrap"}}>{test_status === "running" ? "In Progress":""}
                    </td>
                    <td style={{ paddingRight: "5px", float: "right", width: "100px" }}>
                        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>

                            <span
                                onClick={() => this.skinnyOsServerTest(vdu_ID)}
                                style={retestStyles}>{retestLable}
                            </span>
                            <div
                                onClick={() => this.getSkinnyOSTestHistory(data.vdu_id, key)}
                                data-tip data-for="History"
                                style={{ cursor: "pointer", textAlign: "right" }}>
                                {this.renderIcon("History")}
                            </div>
                            <ReactTooltip id="History" place="bottom" effect="float">
                                <span>History</span>
                            </ReactTooltip>
                        </div>
                    </td>
                </tr>
            )
        })
    }
    renderTableHeader = (item, key) => {
        item = item[0]
        if (!item) {
            return <tr> {key}: No VDU's found</tr>
        }
        let vduId = item.vdu_id ? item.vdu_id : "";
        let iLoIp = item.ilo_ip ? item.ilo_ip : "";
        let iLoOamIp = item.oam_gw_ip ? item.oam_gw_ip : "";
        return <tr style={{ paddingLeft: "10px", height: "50px", fontWeight: "bold" }}>
            <td style={{ borderTop: "none" }}>{key}</td>
            <td style={{ borderTop: "none", textAlign: "left" }}>
                <div>VDU ID: {vduId}</div>
                <div>iLo IP: {iLoIp}</div>
                <div>iLo OAM gateway IP: {iLoOamIp}</div>
            </td>

        </tr>
    }
    renderTable = (du_id) => {
        let data = this.state.duIDList[du_id]
        return Object.keys(data).length > 0 && Object.keys(data).map((key) => {

            return <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", textAlign: "center", margin: "5px", border: "1px solid lightgray" }}>
                <tbody>
                    {this.renderTableHeader(data[key], key)}
                    {this.renderTableRows(data[key], key)}
                </tbody>
            </table>
        })
    }
    renderLegend = () => {
        return <div style={{ display: "flex", justifyContent: "center", margin: "10px" }}>
            <div>
                <small>
                    <img src={Completed} style={{ height: '27px' }} />
                    <span style={{ margin: "5px" }}>Passed</span>
                </small>
                <small>
                    <img src={InProgress} style={{ height: '27px' }} />
                    <span style={{ margin: "5px" }}>In Progress</span>
                </small>
                <small>
                    <img src={Failed} style={{ height: '27px' }} />
                    <span style={{ margin: "5px" }}>Failed</span>
                </small>
                <small>
                    <img src={NotStarted} style={{ height: '27px' }} />
                    <span style={{ margin: "5px" }}>Not Started</span>
                </small>
            </div>
        </div>
    }
    renderLoading = () => <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />

    renderDeviceTestHistoryTableHeaders = () => {
        return <tr>
            <th>Date Time (UTC)</th>
            <th>Name</th>
            <th>Status</th>
            <th>Request ID</th>
        </tr>
    }
    reqIDClicked = (reqID) => {
        if (reqID && this.state.selectedReqID === reqID) {
            this.setState({ selectedReqID: "", selectedConfigtxt: {} })
        } else {
            let configtxt = this.state.historyResponse.find(res => res?.request_id == reqID)

            this.setState({ selectedReqID: reqID, selectedConfigtxt: configtxt?.config_txt ? JSON.parse(configtxt?.config_txt) : null})
        }
    }
    renderDeviceTestHistoryTableRows = (val) => {

        return <tr>
            <td style ={{fontWeight:"normal"}}>{val?.request_date ? val.request_date : ''}</td>
            <td style ={{fontWeight:"normal"}}>{val?.request_user ? val.request_user : val?.request_user_id }</td>
            <td style ={{fontWeight:"normal"}}>{val?.test_status ? val.test_status : ''}</td>
            <td>
                <div
                    onClick={() => this.reqIDClicked(val?.request_id)}
                    style={{ textDecoration: "underline", color: `${this.state.selectedReqID == val?.request_id ? 'red' : val?.config_txt ? 'blue' : 'black'}`,cursor : `${val?.config_txt ? 'pointer' : 'default'}`, pointerEvents: `${val?.config_txt ? 'auto' : 'none'}`  }}>
                    <b>{val?.request_id ? val.request_id : ""}</b>
                </div>
            </td>
        </tr>
    }
    renderDeviceTestHistory = () => {
        let { historyResponse, selectedBand } = this.state;
        return <div>
            <div style={{ border: "7px solid rgb(246, 246, 246)", background: "rgb(246, 246, 246)" }}>
                <span><b>Device Test History: {selectedBand}</b></span>
                <span style={{
                    float: "right",
                    fontWeight: "bold",
                    fontSize: "small",
                    cursor: "pointer",
                    color: "blue",
                    textDecoration: "underline"
                }} onClick={() => this.setState({ historyResponse: [], historyClicked: false, requestIDClicked: false, selectedDuId: '', selectedReqID: '' })}>Close</span>
            </div>
            <table style={{ "border": "7px solid #f6f6f6", "borderCollapse": "collapse" }}>
                <thead>
                    {this.renderDeviceTestHistoryTableHeaders()}

                </thead>
                {historyResponse.length == 0 && <tbody>
                    <tr>No Rows Found</tr>
                </tbody>}
                {historyResponse.length > 0 && historyResponse.map(result => {
                    return <tbody>
                        {this.renderDeviceTestHistoryTableRows(result)}
                        {
                            result?.request_id === this.state.selectedReqID && <tr style={{ whiteSpace: 'pre-line', margin: '10px', padding: "10px", border: '1px solid black', wordBreak: 'break-word', background: 'lightgray' }}>
                                {Object.keys(this.state.selectedConfigtxt).map(key => {
                                    return <p style={{ marginBottom: '2px' }}>{key}: {this.state?.selectedConfigtxt[key]? this.state?.selectedConfigtxt[key] : ""}</p>
                                })}
                            </tr>
                        }

                    </tbody>
                })}
            </table>
        </div>
    }
    showConfigTxt = () => {
        let { deviceConfigViewData } = this.state;
        let configTxt = deviceConfigViewData.hasOwnProperty("req_details") && deviceConfigViewData.req_details.config_txt ? deviceConfigViewData.req_details.config_txt.split("\n") : [];
        let req_id = deviceConfigViewData.hasOwnProperty("req_details") ? deviceConfigViewData.req_details.request_id : "";
        return <div>
            <div style={{ textDecoration: "underline", color: "blue", fontWeight: "bold", marginLeft: "10px" }}>Request ID: {req_id}</div>
            <div style={{ border: "7px solid rgb(246, 246, 246)", padding: "10px" }}>
                {configTxt.length > 0 ? configTxt.map(item => <div>{item}</div>) : <div>No Data Found</div>}
            </div>
        </div>
    }
    renderAccordians = () => {
        let { duIDList, deviceTestStared, deviceTestHistoryLoading, historyClicked, selectedDuId, requestIDClicked, showLoadingMessage, selectedAccordion, isLoading, serverTestLoading } = this.state;
        if (!isLoading && Object.keys(duIDList).length == 0) {
            return <p> No VDU's Found</p>
        }
        return Object.keys(duIDList).map((key, index) =>
            <Accordion
                defaultExpanded={index == 0 ? true : false}
                style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                TransitionProps={{ unmountOnExit: true }}
                expanded={selectedAccordion == key}
                onChange={() => this.handleAccordion(key, index)}  >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <span>DU Number: {key}</span>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="col-lg-12" style={{ float: 'left' }}>
                        {deviceTestStared ? <div style={{ display: "flex", width: "100%" }}>{this.renderTable(key)}</div> : null}
                        {deviceTestHistoryLoading && this.renderLoading(key)}
                        {serverTestLoading && this.renderLoading()}
                        {historyClicked && !deviceTestHistoryLoading && this.renderDeviceTestHistory()}
                        {showLoadingMessage && <div>Loading...</div>}
                        {historyClicked && requestIDClicked && selectedDuId === key ? this.showConfigTxt() : null}
                    </div>
                </AccordionDetails>
            </Accordion>)
    }
    render() {
        let { deviceTestStared, isLoading, isRefreshing } = this.state;
        let { proj_number } = this.props.selectedRow;
        return (
            <div style={{ "background": "#FFF" }}>
                <div style={{ "padding": "10px 10px 0px 10px" }}>
                    {deviceTestStared && Object.keys(this.state.duIDList).length !== 0 ? <div className="row"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            color: "black",
                        }}>
                        <div className="col-md-4"><b>VCP FE Server Reachability Test</b></div>
                        <div style={{ marginLeft: "50px" }}>
                            <div onClick={() => this.getEricssonDeviceTestDetails("Refresh")} data-tip data-for="Refresh" style={{ cursor: "pointer" }}>
                                {this.renderIcon("Refresh")}
                            </div>
                            <ReactTooltip id="Refresh" place="bottom" effect="float">
                                <span>Refresh</span>
                            </ReactTooltip>
                        </div>
                        {this.renderLegend()}
                    </div> : null}
                    {isLoading && this.renderLoading()}
                    {isRefreshing && <div style={{ display: "flex", justifyContent: "center", fontWeight: "bold", color: "red" }}>Refreshing...</div>}
                    {deviceTestStared === false && isLoading === false ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "50px", color: "blue" }}><b>No VDU's Found</b></div> : this.renderAccordians()}
                </div>
            </div >
        )
    }
}
function stateToProps(state) {
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    return {
        loginId: loginId,
    }
}

export default connect(stateToProps, { ...DeviceTestActions })(EricssonServerTest)