import React, { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Loader from "../../Layout/components/Loader";
import { deviceTestDetails, vduReplacementStepStatusGet, vduReplacement } from "../actions";
import { uniq } from "lodash";
import ReactTooltip from "react-tooltip";
import RefreshPage from '../../sites/images/RefreshIcon.png';
import InfoIcon from '@material-ui/icons/Info';
import { Map } from "immutable";

const VDUReplacement = (props) => {
    const dispatch = useDispatch();
    const [vduInfoLoading, updatevduInfoLoading] = useState(false)
    const [displayLogView, updatedisplayLogView] = useState(false)
    const [displayLogViewObject, updatedisplayLogViewObject] = useState({})
    const [vduInfoData, updatevduInfoData] = useState([])
    const [duIDList, updateduIDList] = useState([])
    const [vduReplaceButtonClicked, updatevduReplaceButtonClicked] = useState(false)
    const [vduTypeSected, updatevduTypeSected] = useState("")
    const userInfo = useSelector(state => { return state.getIn(["Users", "entities", "users", props.loginId], Map()) })
    useEffect(() => deviceTestDetailsFetch(), [])

    const deviceTestDetailsFetch = () => {
        updatevduInfoLoading(true)
        updatedisplayLogView(false)
        dispatch(deviceTestDetails(props.selectedRow.proj_number))
            .then(deviceTestDetailsResp => {
                if (deviceTestDetailsResp && deviceTestDetailsResp.data && deviceTestDetailsResp.data.deviceTestDetails) {
                    let responseData = deviceTestDetailsResp.data.deviceTestDetails;
                    let du_id_list = responseData.vdu_info ? responseData.vdu_info.map(item => item.du_id) : []
                    let uniqDUIDList = uniq(du_id_list);
                    updatevduInfoLoading(false)
                    updatevduInfoData(responseData.vdu_info)
                    updateduIDList(uniqDUIDList)
                    vduReplacementStepStatusFetch(responseData.vdu_info)
                } else {
                    updatevduInfoLoading(false)
                }
            })
    }

    const vduReplacementStepStatusFetch = async (vduInfoList) => {
        if (vduInfoList && vduInfoList.length > 0) {
            let { proj_number, site_unid, sitename, } = props.selectedRow;
            let user = userInfo.toJS()
            let execList = []
            await vduInfoList.map(async item => {
                let resp = await dispatch(vduReplacementStepStatusGet(proj_number, item.vdu_id, site_unid, sitename, user.vendor_id, user.vendor_name))
                if (resp && resp.stepStatus) {
                    let stepsObj = resp.stepStatus.step_status;
                    let combinedObj = stepsObj ? { ...stepsObj, ...item } : { ...item }
                    await execList.push(combinedObj)
                    if (vduInfoList.length == execList.length) {
                        await updatevduInfoData(execList)
                    }
                }
            })
        }
    }

    const vduReplacementMethod = (vduId) => {
        let payLoad = {
            user_id: props.loginId,
            cfg_request: {
                config_type: "vDU replacement VP",
                sel_config: [
                    {
                        du_id: vduId,
                        project_id: props.selectedRow.proj_number
                    }
                ]
            }
        }
        let { site_unid, sitename, } = props.selectedRow;
        let user = userInfo.toJS()
        updatevduReplaceButtonClicked(true)
        updatedisplayLogView(false)
        dispatch(vduReplacement(payLoad, site_unid, sitename, user.vendor_id, user.vendor_name))
            .then(response => {
                if (response && response.stepStatus && response.stepStatus.step_status) {
                    updatevduReplaceButtonClicked(false)
                    let step_status = response.stepStatus.step_status;
                    let updatedData = vduInfoData.map(item => {
                        if (item.vdu_id == step_status.vdu_id) {
                            return { ...item, ...step_status }
                        } else {
                            return item;
                        }
                    })
                    updatevduInfoData(updatedData)
                }
            })
    }
    const renderExecLogView = (item, vduType) => {
        updatedisplayLogView(true)
        updatedisplayLogViewObject(item)
        updatevduTypeSected(vduType)
    }
    const renderVduBladeReplacementTable = (item) => {
        let executionRunning = item && item.exec_info && item.exec_info.length > 0 && item.exec_info.find(item1 => item1.action_name == "Run Skinny OS" && item1.status && item1.status.toUpperCase().indexOf("PROGRESS") > 0)
        let disableReplaceButton = executionRunning && Object.keys(executionRunning).length > 0 ? true : false
        let vduType = item.vdu_type ? item.vdu_type : ""
        let vduId = item.vdu_id ? item.vdu_id : "";
        let iLoIp = item.ilo_ip ? item.ilo_ip : "";
        let iLoOamIp = item.oam_gw_ip ? item.oam_gw_ip : "";
        let statusColor = {
            "COMPLETED": "green",
            "IN PROGRESS": "blue",
            "NEW": "darkorange",
            "FAILED": "red",
            "ERROR": "red"
        }
        return <div>
            <div style={{ fontWeight: "bolder" }}>{vduType}</div>
            <div>
                <div><span style={{ fontWeight: "bolder" }}>VDU ID:</span> {vduId}</div>
                <div><span style={{ fontWeight: "bolder" }}>iLo IP:</span> {iLoIp}</div>
                <div><span style={{ fontWeight: "bolder" }}>iLo OAM gateway IP:</span> {iLoOamIp}</div>
                <span style={{ float: 'right', margin: "5px" }}>
                    <button
                        disabled={disableReplaceButton}
                        onClick={() => vduReplacementMethod(vduId)}
                        style={{ padding: "5px" }}>Replace</button>
                </span>
            </div>
            {item && item.exec_info && item.exec_info.length > 0 &&
                <table cellPadding="0" cellSpacing="0" id={item.vdu_id}>
                    <thead>
                        <tr style={{ borderBottom: "3px solid gray" }}>
                            <th scope="col">Step Name</th>
                            <th scope="col">Step Status</th>
                            <th scope="col">Executed On (UTC)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {item.exec_info.map(exec => {
                            let status = exec.status && exec.status.toUpperCase().indexOf("PROGRESS") > 0 ? "In Progress" : exec.status;
                            return <tr>
                                {exec.action_name == "Run Skinny OS" ? <td style={{ color: "rgb(106, 104, 104)" }}>{exec.action_name}<InfoIcon style={{ fontSize: 20, cursor: "pointer", marginLeft: "5px" }} onClick={() => renderExecLogView(exec, vduType)} /></td> : <td style={{ color: "rgb(106, 104, 104)" }}>{exec.action_name}</td>}
                                <td style={{ color: statusColor[status.toUpperCase()] }}>{status}</td>
                                <td style={{ color: "rgb(106, 104, 104)" }}>{exec.executed_on}</td>
                            </tr>
                        })}
                    </tbody>
                </table>}
        </div>
    }

    const renderVDUinfoTable = (duIDNumber) => {
        let vduInfoList = vduInfoData.filter(item => item.du_id === duIDNumber);
        if (vduInfoList.length > 0) {
            return vduInfoList.map(item => {
                return <div style={{ width: "100%", padding: "5px", margin: "5px", boxShadow: "0 5px 3px rgba(0,0,0,0.12), 0 1px 7px rgba(0,0,0,0.24)" }}>
                    {renderVduBladeReplacementTable(item)}
                </div>
            })
        }
    }
    const renderAccordians = () => {
        return duIDList.map(duIDNumber =>
            <Accordion
                defaultExpanded={true}
                style={{ margin: 'auto', width: '96%', boxShadow: "0 5px 3px rgba(0,0,0,0.12), 0 1px 7px rgba(0,0,0,0.24)", fontWeight: "bold" }}
                TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <span>DU Number: {duIDNumber}</span>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="col-lg-12" style={{ float: 'left' }}>
                        <div style={{ display: "flex", width: "100%" }}>{renderVDUinfoTable(duIDNumber)}</div>
                    </div>
                </AccordionDetails>
            </Accordion>)
    }

    const displayLogViewSection = () => {
        let log = displayLogViewObject.hasOwnProperty("status") ? displayLogViewObject.log.split("\n") : [];
        let exec_id = displayLogViewObject.hasOwnProperty("status") ? displayLogViewObject.exec_id : "";
        let gnodeb_id = displayLogViewObject.hasOwnProperty("status") ? displayLogViewObject.gnodeb_id : "";
        return <div>
            <div style={{ padding: "10px", boxShadow: "0 5px 3px rgba(0,0,0,0.12), 0 1px 7px rgba(0,0,0,0.24)", margin: "20px" }}>
                <div style={{ border: "7px solid rgb(246, 246, 246)", background: "rgb(246, 246, 246)", marginBottom: "10px" }}>
                    <span style={{ margin: "5px" }}>VDU Type: {vduTypeSected}</span>
                    <span style={{ margin: "5px" }}>VDU ID: {gnodeb_id} </span>
                    <span style={{ margin: "5px" }}>Execution ID: {exec_id}</span>
                    <span style={{
                        float: "right",
                        fontWeight: "bold",
                        fontSize: "small",
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline"
                    }} onClick={() => updatedisplayLogView(false)}>Close</span>
                </div>
                {log.length > 0 ? log.map(item => <div>{item}</div>) : <div>No Data Found</div>}
            </div>
        </div>
    }

    const renderIcon = () => <small><img src={RefreshPage} style={{ height: '20px' }} /></small>

    const renderLoading = () => <Loader color="#cd040b" size="50px" margin="4px" className="text-center" />

    return (
        <div style={{ background: "#FFF" }}>
            {(vduInfoLoading || vduReplaceButtonClicked) && renderLoading()}
            {duIDList.length > 0 && <div style={{ padding: "10px", marginLeft: "10px" }}>
                <div style={{ display: "flex" }}>
                    <h5>VDU Replacement</h5>
                    <div
                        onClick={() => deviceTestDetailsFetch()}
                        data-tip data-for="Refresh"
                        style={{ cursor: "pointer", marginLeft: "5px", marginBottom: "5px" }}>{renderIcon()}
                    </div>
                    <ReactTooltip id="Refresh" place="bottom" effect="float">
                        <span>Refresh</span>
                    </ReactTooltip>
                </div>
            </div>}
            {duIDList.length > 0 && renderAccordians()}
            {displayLogView && displayLogViewSection()}
        </div>
    )
}
export default VDUReplacement