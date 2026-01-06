import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import ReactTooltip from 'react-tooltip';
import { List, Map } from "immutable";
import moment from 'moment';
import { deviceTestDetails, createDeviceTestReq, getDeviceTestHistory, deviceConfigView} from '../actions';
import uniq from 'lodash/uniq';
// import { Card, CardHeader, CardText } from 'material-ui/Card'
import * as DeviceTestActions from "../actions";
import Loader from "../../Layout/components/Loader";
import RefreshPage from '../../sites/images/RefreshIcon.png';
import NotStarted from '../../sites/images/NotStarted.png';
import Completed from '../../sites/images/Completed.png';
import Failed from '../../sites/images/Failed.png';
import InProgress from '../../sites/images/InProgress.png';
import InService from '../../sites/images/InService.png';
import HistoryIcon from '../../sites/images/HistoryIcon.svg';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';

const TEST_STATUS = {
    passed: "passed",
    failed: "failed",
    inprogress: "inprogress",
    notstarted: "notstarted",
    empty: ""
};

const DEVICE_TEST_TYPES = [
    { label: "iLo Ping", key: "ping_test" },
    { label: "Server Status", key: "server_status" },
    { label: "Firmware/BIOS Validation", key: "firmware_upgrade" },
];

const SamsungServerTest = (props) => {

    const { selectedRow, notifref } = props;
    // --- Redux selectors ---
    const dispatch = useDispatch();
    const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
    const user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], Map()));
    const vendorId = user && user.get('vendor_id') ? user.get('vendor_id') : '';
    const vendorName = user && user.get('vendor_name') ? user.get('vendor_name') : '';
    const market = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "vendor_area"], ""));
    const submarket = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "vendor_region"], ""));
    const loggedInUser = user ? user.get('fname') + ' ' + user.get('lname') : "";
    const configDataObj = useSelector(state => {
        const configData = state.getIn(['Users', 'configData', "configData"], Map());
        return configData && configData.toJS() ? configData.toJS().configData : '';
    });

    // --- Local state ---
    const [isLoading, setIsLoading] = useState(true);
    const [deviceTestStared, setDeviceTestStared] = useState(false);
    const [testInitiatiatedMessage, setTestInitiatiatedMessage] = useState(false);
    const [pingTestMockData, setPingTestMockData] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [retestTiggered, setRetestTiggered] = useState(false);
    const [historyClicked, setHistoryClicked] = useState(false);
    const [histoyClickedData, setHistoyClickedData] = useState({});
    const [deviceTestHistoryLoading, setDeviceTestHistoryLoading] = useState(false);
    const [deviceTestHistory, setDeviceTestHistory] = useState({});
    const [duIDList, setDuIDList] = useState([]);
    const [isRequestIDClicked, setIsRequestIDClicked] = useState(false);
    const [deviceTestResult, setDeviceTestResult] = useState({});
    const [deviceConfigViewData, setDeviceConfigViewData] = useState({});
    const [selectedDuId, setSelectedDuId] = useState("");
    const [showLoadingMessage, setShowLoadingMessage] = useState(false);
    const [pingTestConfigTime, setPingTestConfigTime] = useState("10");
    const [serverStatusConfigTime, setServerStatusConfigTime] = useState("40");

    // --- Refs ---
    const autorefresh = useRef();

    // --- Effects ---
    useEffect(() => {
        const proj_number = selectedRow?.proj_number;
        let pingTestConfigObj = configDataObj && configDataObj.length > 0 && configDataObj.find(item => item.ATTRIBUTE_NAME === "PING_TEST_TIMEOUT");
        let serverStatusConfigObj = configDataObj && configDataObj.length > 0 && configDataObj.find(item => item.ATTRIBUTE_NAME === "SERVER_STATUS_TIMEOUT");
        setPingTestConfigTime(pingTestConfigObj && pingTestConfigObj.ATTRIBUTE_VALUE ? pingTestConfigObj.ATTRIBUTE_VALUE : "10");
        setServerStatusConfigTime(serverStatusConfigObj && serverStatusConfigObj.ATTRIBUTE_VALUE ? serverStatusConfigObj.ATTRIBUTE_VALUE : "40");
        getDeviceTestDetails(proj_number);

        return () => {
            clearInterval(autorefresh.current);
        };
        // eslint-disable-next-line
    }, []);

    const getDeviceTestDetails = (proj_number, refresh) => {
        clearInterval(autorefresh.current);
        deviceTestDetailsFn(proj_number, refresh);
        autorefresh.current = setInterval(() => {
            if (deviceTestStared) {
                deviceTestDetailsFn(proj_number, "Refresh");
            }
        }, 30000);
    };

    const deviceTestDetailsFn = (proj_number, refresh) => {
        if (refresh === "Refresh") {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        dispatch(deviceTestDetails(proj_number)).then(response => {
            if (response.data.deviceTestDetails) {
                if (response.data.deviceTestDetails.errors && response.data.deviceTestDetails.errors.length > 0) {
                    showNotification(response.data.deviceTestDetails);
                    setIsLoading(false);
                    setIsRefreshing(false);
                } else {
                    let responseData = response.data.deviceTestDetails;
                    if (responseData && responseData.vdu_info && responseData.vdu_info.length > 0) {
                        formatDeviceTestResponse(responseData);
                        setIsLoading(false);
                        setIsRefreshing(false);
                        setDeviceTestStared(true);
                    } else if (responseData && responseData.ping_test && responseData.ping_test.length > 0) {
                        let vduInfoFromPingTest = responseData.ping_test.map(item => {
                            let vduid = item.vdu_id;
                            return {
                                "vdu_id": vduid,
                                "vdu_type": item.vdu_type,
                                "du_id": vduid.substring(vduid.length - 3, vduid.length),
                                "ilo_ip": item.iLoIp,
                                "oam_gw_ip": item.oam_gw_ip
                            }
                        });
                        responseData.vdu_info = vduInfoFromPingTest;
                        formatDeviceTestResponse(responseData);
                        setIsLoading(false);
                        setIsRefreshing(false);
                        setDeviceTestStared(true);
                    } else {
                        setIsLoading(false);
                        setIsRefreshing(false);
                        setDeviceTestStared(false);
                    }
                }
            } else {
                setIsLoading(false);
                setIsRefreshing(false);
                setDeviceTestStared(false);
            }
        });
    };

  // Add this inside your SamsungServerTest1 functional component

const startDeviceTest = (startOrRetest, { testType, vdu_type, vdu_id }) => {
    const { proj_number, project_initiative, project_type, site_unid } = selectedRow;
    // These come from Redux selectors above
    // market, submarket, loggedInUser, vendorName, vendorId, loginId

    const payload = {
        deviceReqBody: {
            request_type: `${project_initiative}-${project_type}`,
            test_type: testType ? testType : "ping_test",
            site_type: "Cabinet",
            site_unid: site_unid,
            band_type: vdu_type,
            device_bandId: vdu_id,
            project_id: proj_number,
            market,
            submarket,
            vendor_id: vendorId,
            vendor_company: vendorName,
            user_id: loginId,
            user_name: loggedInUser,
            created_by: loggedInUser
        }
    };

    setTestInitiatiatedMessage(true);
    setIsLoading(true);
    setRetestTiggered(true);

    dispatch(createDeviceTestReq(payload)).then(response => {
        if (response) {
            if (response.data.createDeviceTestRequest.errors && response.data.createDeviceTestRequest.errors.length > 0) {
                showNotification(response.data.createDeviceTestRequest);
                setIsLoading(false);
                setDeviceTestStared(startOrRetest === "Start" ? false : true);
                setTestInitiatiatedMessage(false);
                setRetestTiggered(false);
            } else {
                let responseData = response.data.createDeviceTestRequest.deviceTestRequest;
                if (responseData && responseData.vdu_info && responseData.vdu_info.length > 0) {
                    formatDeviceTestResponse(responseData);
                    setIsLoading(false);
                    setDeviceTestStared(true);
                    setRetestTiggered(false);
                } else if (responseData && responseData.ping_test && responseData.ping_test.length > 0) {
                    let vduInfoFromPingTest = responseData.ping_test.map(item => {
                        let vduid = item.vdu_id;
                        return {
                            "vdu_id": vduid,
                            "vdu_type": item.vdu_type,
                            "du_id": vduid.substring(vduid.length - 3, vduid.length),
                            "ilo_ip": item.iLoIp,
                            "oam_gw_ip": item.oam_gw_ip
                        }
                    });
                    responseData.vdu_info = vduInfoFromPingTest;
                    formatDeviceTestResponse(responseData);
                    setIsLoading(false);
                    setIsRefreshing(false);
                    setDeviceTestStared(true);
                } else {
                    setIsLoading(false);
                    setDeviceTestStared(startOrRetest === "Start" ? false : true);
                    setRetestTiggered(false);
                }
            }
        } else {
            setIsLoading(false);
            setDeviceTestStared(startOrRetest === "Start" ? false : true);
            setRetestTiggered(false);
        }
    });
};
// Add these inside your SamsungServerTest1 functional component

const formatDeviceTestResponse = (deviceTestResult) => {
    let pingTestMockData = [];
    let duIDList = deviceTestResult.vdu_info.map(item => item.du_id);
    pingTestMockData = deviceTestResult.vdu_info.map(vduType => {
        let testTypes = DEVICE_TEST_TYPES.map(type => {
            let testTypeArray = deviceTestResult[type.key] ? deviceTestResult[type.key] : [];
            let vduTypeObj = deviceTestResult.vdu_info.length > 2
                ? testTypeArray.find(item => item.vdu_type === vduType.vdu_type && item.vdu_id === vduType.vdu_id)
                : testTypeArray.find(item => item.vdu_type === vduType.vdu_type);
            if (vduTypeObj && Object.keys(vduTypeObj).length > 0) {
                let status = vduTypeObj.test_status ? vduTypeObj.test_status : vduTypeObj.status ? vduTypeObj.status : "";
                vduTypeObj.test_status = status === "In Progress" ? TEST_STATUS.inprogress : status.toLowerCase();
                return {
                    testTypeName: type.label,
                    testType: type.key,
                    ...vduTypeObj
                }
            } else {
                return {
                    testTypeName: type.label,
                    testType: type.key,
                    vdu_type: vduType.vdu_type,
                    vdu_id: vduType.vdu_id,
                    test_status: TEST_STATUS.notstarted
                }
            }
        });
        return {
            proj_number: deviceTestResult.project_num,
            vdu_type: vduType.vdu_type,
            status_types: testTypes,
            vdu_id: vduType.vdu_id,
            du_id: vduType.du_id,
            iLoIp: vduType.ilo_ip,
            oam_gw_ip: vduType.oam_gw_ip
        }
    });
    let pingTestMockDataWithRetest = pingTestMockData.map(item => {
        let showRetest = item.status_types.map(each => each.test_status);
        let failedPosition = showRetest.findIndex((ele) => ele === TEST_STATUS.failed);
        let status_types_with_retest = item.status_types.map((each, index) => {
            let differenceTime = moment(moment.utc().format('YYYY-MM-DD hh:mm:ss')).diff(moment(each.triggered_on).format("YYYY-MM-DD hh:mm:ss"));
            let durationTime = moment.duration(differenceTime);
            let diff = Math.abs(Math.round(durationTime.asMinutes()));
            if (each.testTypeName === 'iLo Ping') {
                if (each.test_status === 'inprogress' && diff > pingTestConfigTime) {
                    return { showRetest: true, ...each }
                } else if (each.test_status === 'failed') {
                    return { showRetest: true, ...each }
                } else {
                    return { showRetest: index <= failedPosition ? true : false, ...each }
                }
            } else if (each.testTypeName === 'Server Status') {
                if (each.test_status === 'inprogress' && diff > serverStatusConfigTime) {
                    return { showRetest: true, ...each }
                } else if (each.test_status === 'failed') {
                    return { showRetest: true, ...each }
                } else {
                    return { showRetest: index <= failedPosition ? true : false, ...each }
                }
            } else {
                return { showRetest: index <= failedPosition ? true : false, ...each }
            }
        });
        item.status_types = status_types_with_retest;
        return item;
    });
    setPingTestMockData(pingTestMockDataWithRetest);
    setDuIDList(uniq(duIDList));
    setDeviceTestResult(deviceTestResult);
    setRetestTiggered(false);
};

const showNotification = (response) => {
    let message = response.errors[0].detail ? response.errors[0].detail : "";
    let title = response.errors[0].title ? response.errors[0].title : "";
    notifref.addNotification({
        title: title,
        position: "br",
        level: 'error',
        autoDismiss: 10,
        message: message
    });
};
// Add this inside your SamsungServerTest1 functional component

const renderIcon = (icon) => {
    let iconType = "";
    switch (icon) {
        case TEST_STATUS.notstarted:
            iconType = NotStarted;
            break;
        case TEST_STATUS.failed:
            iconType = Failed;
            break;
        case TEST_STATUS.inprogress:
            iconType = InProgress;
            break;
        case TEST_STATUS.empty:
            iconType = InProgress;
            break;
        case TEST_STATUS.passed:
            iconType = Completed;
            break;
        case "Refresh":
            iconType = RefreshPage;
            break;
        case "InService":
            iconType = InService;
            break;
        case "History":
            iconType = HistoryIcon;
            break;
        default:
            break;
    }
    return <small><img src={iconType} style={{ height: ["Refresh"].includes(icon) ? '20px' : '25px' }} /></small>;
};
// Add these inside your SamsungServerTest1 functional component

const calculateInProgressTimeMsg = (triggeredOnTime, testTypeName, testStatus) => {
    let msg = "";
    if (triggeredOnTime && testTypeName) {
        const current = moment.utc().format('YYYY-MM-DD hh:mm:ss');
        const triggered_onTime = moment(triggeredOnTime).format("YYYY-MM-DD hh:mm:ss");
        const ms = moment(current).diff(triggered_onTime);
        const d = moment.duration(ms);
        if (
            testTypeName === 'iLo Ping' &&
            testStatus === TEST_STATUS.inprogress &&
            Math.abs(Math.round(d.asMinutes())) > pingTestConfigTime
        ) {
            msg = 'Timed Out';
        } else if (
            testTypeName === 'Server Status' &&
            testStatus === TEST_STATUS.inprogress &&
            Math.abs(Math.round(d.asMinutes())) > serverStatusConfigTime
        ) {
            msg = 'Timed Out';
        } else {
            msg = 'In Progress: ' + Math.abs(Math.round(d.asMinutes())) + " min";
        }
    }
    return msg;
};

const displayServerStatusFailed = (log, testTypeName) => {
    let msgsplit = log.split("\n");
    let serverErrs = [];
    // extracting the required params from log server error
    if (testTypeName === 'Server Status') {
        msgsplit.forEach((item) => {
            if (
                item.match(/vlan410/i) ||
                item.match(/vlan420/i) ||
                item.match(/vlan310/i) ||
                item.match(/probable_cause/i)
            ) {
                let testItem = item.replace(/['"]+/g, '');
                serverErrs.push(testItem);
            }
        });
        return serverErrs.length >= 1
            ? serverErrs.map((value, idx) => <div key={idx}>{value}</div>)
            : msgsplit.map((item, idx) => <div key={idx}>{item}</div>);
    } else {
        return msgsplit.map((item, idx) => <div key={idx}>{item}</div>);
    }
};
// Add this inside your SamsungServerTest1 functional component

const renderTableRows = (testData, du_id) => {
    return testData.length > 0 && testData.map((data, idx) => {
        const { testTypeName, test_status, log, triggered_on, showRetest, testType } = data;
        let triggeredOnTimeMsg = calculateInProgressTimeMsg(triggered_on, testTypeName, test_status);
        let retestStyles = {
            cursor: "pointer",
            pointerEvents: retestTiggered === true ? "none" : "all",
            color: retestTiggered === true ? "grey" : "black",
            textDecoration: "underline",
            margin: "3px"
        };
        let retestLable = test_status === TEST_STATUS.notstarted && testType === "ping_test" ? "Start Test" : "Retest";
        return (
            <tr key={idx} style={{ borderBottom: "1px solid lightgrey" }}>
                <td>
                    {triggeredOnTimeMsg === 'Timed Out' ? renderIcon(TEST_STATUS.failed) : renderIcon(test_status)}
                </td>
                <td style={{ textAlign: "left", color: test_status === TEST_STATUS.notstarted ? "gray" : "black" }}>
                    {testTypeName}
                    {test_status === TEST_STATUS.failed && (
                        <tr>
                            <span style={{ color: "orangered" }}>
                                {displayServerStatusFailed(log, testTypeName)}
                            </span>
                        </tr>
                    )}
                    {(test_status === TEST_STATUS.empty || test_status === TEST_STATUS.inprogress) && (
                        <tr>
                            <span style={{ color: triggeredOnTimeMsg === 'Timed Out' ? "orangered" : "steelblue" }}>
                                {triggeredOnTimeMsg}
                            </span>
                        </tr>
                    )}
                </td>
                <td style={{ paddingRight: "5px", float: "right", width: showRetest ? "100px" : "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                        {showRetest ? (
                            <span
                                onClick={() => startDeviceTest("Retest", data)}
                                style={retestStyles}
                            >
                                Retest
                            </span>
                        ) : (
                            <div>
                                {(test_status === TEST_STATUS.passed || test_status === TEST_STATUS.notstarted) && testType === "ping_test" && (
                                    <span
                                        onClick={() => startDeviceTest("Retest", data)}
                                        style={retestStyles}
                                    >
                                        {retestLable}
                                    </span>
                                )}
                            </div>
                        )}
                        <div
                            onClick={() => handleGetDeviceTestHistory(data, du_id)}
                            data-tip data-for="History"
                            style={{ cursor: "pointer", textAlign: "right" }}
                        >
                            {renderIcon("History")}
                        </div>
                        <ReactTooltip id="History" place="bottom" effect="float">
                            <span>History</span>
                        </ReactTooltip>
                    </div>
                </td>
            </tr>
        );
    });
};
// Add this inside your SamsungServerTest1 functional component

const renderTableHeader = (item, index) => {
    let vduId = item.vdu_id ? item.vdu_id : "";
    let iLoIp = item.iLoIp ? item.iLoIp : "";
    let iLoOamIp = item.oam_gw_ip ? item.oam_gw_ip : "";
    return (
        <tr style={{ height: "50px", fontWeight: "bold" }}>
            <td style={{ borderTop: "none" }}>{item.vdu_type}</td>
            <td style={{ borderTop: "none", textAlign: "left" }}>
                <div>VDU ID: {vduId}</div>
                <div>iLo IP: {iLoIp}</div>
                <div>iLo OAM gateway IP: {iLoOamIp}</div>
            </td>
            {item && item.hasOwnProperty("status_types") && item.status_types.length > 0 &&
                (item.status_types[index].vdu_active === "Yes" ||
                 item.status_types[index].vdu_active === true ||
                 item.status_types[index].vdu_active === "true") ? (
                <td style={{ borderTop: "none", paddingRight: "0px", margin: "5px", fontSize: "inherit" }} className="navbar-brand pointer float-right">
                    <div style={{ marginRight: "5px" }}>{renderIcon("InService")}</div>
                    <div style={{ color: "rgb(255, 188, 61)", fontWeight: "bold" }}>In Service</div>
                </td>
            ) : (
                <td style={{ borderBottom: "0.0625rem solid #d8dada" }}></td>
            )}
        </tr>
    );
};
// Add these inside your SamsungServerTest1 functional component

const renderTable = (du_id) => {
    const data = pingTestMockData.filter(item => item.du_id === du_id);
    return data.length > 0 && data.map((item, index) => (
        <table key={index} cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", textAlign: "center", margin: "5px", border: "1px solid lightgray" }}>
            <tbody>
                {renderTableHeader(item, index)}
                {renderTableRows(item.status_types, du_id)}
            </tbody>
        </table>
    ));
};

const renderLegend = () => (
    <div style={{ display: "flex", justifyContent: "center", margin: "10px" }}>
        <div>
            <small>
                <img src={InService} style={{ height: '27px' }} alt="In Service" />
                <span style={{ margin: "5px" }}>In Service</span>
            </small>
            <small>
                <img src={Completed} style={{ height: '27px' }} alt="Passed" />
                <span style={{ margin: "5px" }}>Passed</span>
            </small>
            <small>
                <img src={InProgress} style={{ height: '27px' }} alt="In Progress" />
                <span style={{ margin: "5px" }}>In Progress</span>
            </small>
            <small>
                <img src={Failed} style={{ height: '27px' }} alt="Failed" />
                <span style={{ margin: "5px" }}>Failed</span>
            </small>
            <small>
                <img src={NotStarted} style={{ height: '27px' }} alt="Not Started" />
                <span style={{ margin: "5px" }}>Not Started</span>
            </small>
        </div>
    </div>
);
// Add these inside your SamsungServerTest1 functional component

const renderLoading = () => (
    <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />
);

const handleGetDeviceTestHistory = (data, du_id) => {
    const { proj_number } = selectedRow;
    const { testType, vdu_type } = data;
    setHistoyClickedData(data);
    setHistoryClicked(true);
    setDeviceTestHistory({});
    setDeviceTestHistoryLoading(true);
    setSelectedDuId(du_id);
    setIsRequestIDClicked(false);

    dispatch(getDeviceTestHistory(proj_number, testType, vdu_type)).then(resp => {
        if (resp.data.getDeviceTestHistory) {
            setDeviceTestHistory(resp.data.getDeviceTestHistory);
            setDeviceTestHistoryLoading(false);
        } else {
            setDeviceTestHistory({});
            setDeviceTestHistoryLoading(false);
        }
    });
};

const requestIDClicked = (reqId) => {
    setShowLoadingMessage(true);
    setIsRequestIDClicked(false);
    dispatch(deviceConfigView(reqId)).then(resp => {
        if (resp.data) {
            setIsRequestIDClicked(true);
            setDeviceConfigViewData(resp.data.deviceConfigView);
            setShowLoadingMessage(false);
        }
    });
};

const renderDeviceTestHistoryTableHeaders = () => {
    if (deviceTestHistory.test_type === "server_status") {
        return (
            <tr>
                <th>Date Time (UTC)</th>
                <th>Name</th>
                <th>Status</th>
                {/* <th>Note</th> */}
                <th>Request ID</th>
            </tr>
        );
    } else {
        return (
            <tr>
                <th>Date Time</th>
                <th>Name</th>
                <th>Status</th>
                <th>Note</th>
            </tr>
        );
    }
};
// Add these inside your SamsungServerTest1 functional component

const renderDeviceTestHistoryTableRows = (val) => {
    let triggered_onTime = moment(val.triggered_on).format("MM-DD-YYYY hh:mm A");
    if (deviceTestHistory.test_type === "server_status") {
        return (
            <tr key={val.request_id || val.triggered_on}>
                <td>{triggered_onTime}</td>
                <td>{val.user_name ? val.user_name : ''}</td>
                <td>{val.test_status ? val.test_status : ''}</td>
                {/* <td style={{ textAlign: "left", marginLeft: "10px" }}>
                    <div><b>vDUID:</b> {val.vdu_id ? val.vdu_id : ""}</div>
                    <div><b>oam_gw_ip:</b> {val.oam_gw_ip ? val.oam_gw_ip : ""}</div>
                    <div><b>iLoIp:</b> {val.iLoIp ? val.iLoIp : ""}</div>
                </td> */}
                <td>
                    <div
                        onClick={() => requestIDClicked(val.request_id ? val.request_id : "")}
                        style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}>
                        <b>{val.request_id ? val.request_id : ""}</b>
                    </div>
                </td>
            </tr>
        );
    } else {
        return (
            <tr key={val.request_id || val.triggered_on}>
                <td>{val.triggered_on ? val.triggered_on : ''}</td>
                <td>{val.user_name ? val.user_name : ''}</td>
                <td>{val.test_status ? val.test_status : ''}</td>
                <td style={{ textAlign: "left", marginLeft: "10px" }}>
                    <div><b>vDUID:</b> {val.vdu_id ? val.vdu_id : ""}</div>
                    <div><b>oam_gw_ip:</b> {val.oam_gw_ip ? val.oam_gw_ip : ""}</div>
                    <div><b>iLoIp:</b> {val.iLoIp ? val.iLoIp : ""}</div>
                </td>
            </tr>
        );
    }
};

const renderDeviceTestHistory = () => (
    <div>
        <div style={{ border: "7px solid rgb(246, 246, 246)", background: "rgb(246, 246, 246)" }}>
            <span>
                <b>
                    Device Test History: {histoyClickedData.vdu_type} - {histoyClickedData.testTypeName} - {histoyClickedData.vdu_id}
                </b>
            </span>
            <span
                style={{
                    float: "right",
                    fontWeight: "bold",
                    fontSize: "small",
                    cursor: "pointer",
                    color: "blue",
                    textDecoration: "underline"
                }}
                onClick={() => {
                    setHistoryClicked(false);
                    setIsRequestIDClicked(false);
                }}
            >
                Close
            </span>
        </div>
        <table style={{ border: "7px solid #f6f6f6", borderCollapse: "collapse" }}>
            <thead>
                {renderDeviceTestHistoryTableHeaders()}
            </thead>
            <tbody>
                {deviceTestHistory &&
                Object.keys(deviceTestHistory).length > 0 &&
                deviceTestHistory.test_runs != null &&
                deviceTestHistory.test_runs.length > 0 ? (
                    deviceTestHistory.test_runs.map(val => renderDeviceTestHistoryTableRows(val))
                ) : (
                    <tr><td colSpan={4}>No Rows Found</td></tr>
                )}
            </tbody>
        </table>
    </div>
);
// Add these inside your SamsungServerTest1 functional component

const showConfigTxt = () => {
    let configTxt = deviceConfigViewData?.hasOwnProperty("req_details") && deviceConfigViewData?.req_details?.config_txt
        ? deviceConfigViewData.req_details.config_txt.split("\n")
        : [];
    let req_id = deviceConfigViewData?.hasOwnProperty("req_details")
        ? deviceConfigViewData.req_details.request_id
        : "";
    return (
        <div>
            <div style={{ textDecoration: "underline", color: "blue", fontWeight: "bold", marginLeft: "10px" }}>
                Request ID: {req_id}
            </div>
            <div style={{ border: "7px solid rgb(246, 246, 246)", padding: "10px" }}>
                {configTxt.length > 0
                    ? configTxt.map((item, idx) => <div key={idx}>{item}</div>)
                    : <div>No Data Found</div>
                }
            </div>
        </div>
    );
};

const renderAccordians = () => {
    return duIDList.map(item => (
        <Accordion
            key={item}
            defaultExpanded={true}
            style={{
                margin: 'auto',
                width: '96%',
                boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px",
                fontWeight: "bold"
            }}
            TransitionProps={{ unmountOnExit: true }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <span>DU Number: {item}</span>
            </AccordionSummary>
            <AccordionDetails>
                <div className="col-lg-12" style={{ float: 'left' }}>
                    {deviceTestStared ? <div style={{ display: "flex", width: "100%" }}>{renderTable(item)}</div> : null}
                    {deviceTestHistoryLoading && selectedDuId === item && renderLoading(item)}
                    {historyClicked && selectedDuId === item && renderDeviceTestHistory()}
                    {showLoadingMessage && <div>Loading...</div>}
                    {historyClicked && isRequestIDClicked && selectedDuId === item ? showConfigTxt() : null}
                </div>
            </AccordionDetails>
        </Accordion>
    ));
};
return (
    <div style={{ background: "#FFF" }}>
        <div style={{ padding: "10px 10px 0px 10px" }}>
            {deviceTestStared ? (
                <div
                    className="row"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "black",
                    }}
                >
                    <div className="col-md-4">
                        <b>VCP FE Server Reachability Test</b>
                    </div>
                    <div style={{ marginLeft: "50px" }}>
                        <div
                            onClick={() => getDeviceTestDetails(selectedRow?.proj_number, "Refresh")}
                            data-tip
                            data-for="Refresh"
                            style={{ cursor: "pointer" }}
                        >
                            {renderIcon("Refresh")}
                        </div>
                        <ReactTooltip id="Refresh" place="bottom" effect="float">
                            <span>Refresh</span>
                        </ReactTooltip>
                    </div>
                    {renderLegend()}
                </div>
            ) : null}
            {isLoading && renderLoading()}
            {isRefreshing && (
                <div style={{ display: "flex", justifyContent: "center", fontWeight: "bold", color: "red" }}>
                    Refreshing...
                </div>
            )}
            {deviceTestStared === false && isLoading === false ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "50px",
                        color: "blue",
                    }}
                >
                    <b>No VDU's Found</b>
                </div>
            ) : (
                renderAccordians()
            )}
        </div>
    </div>
);
};

export default SamsungServerTest;

SamsungServerTest.propTypes = {
    selectedRow: PropTypes.shape({
        proj_number: PropTypes.string,
        project_initiative: PropTypes.string,
        project_type: PropTypes.string,
        site_unid: PropTypes.string,
    }),
    notifref: PropTypes.object.isRequired,
  
};