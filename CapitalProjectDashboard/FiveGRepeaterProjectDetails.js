import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from "moment"
import * as pmActions from "./actions"
import Loader from '../Layout/components/Loader';
import info from '../Images/info.svg';
import ReactTooltip from 'react-tooltip'

class FiveGRepeaterProjectDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            fiveGRepeatersProjectDetailsList: [],
            expectedFormat: {},
            donarObject: {},
            disableOrEnableUpdateButton: false,
            disableIfSnNotValid: false,
        }
    }
    componentDidMount() {
        let { selectedRow, get5gRepeaterProjectDetails } = this.props
        get5gRepeaterProjectDetails(selectedRow.proj_number).then(response => {
            if (response && response.data && response.data.get5gRepeaterProjectDetails) {
                let resp = response.data.get5gRepeaterProjectDetails;
                let slNumberChangedAtoll_info = resp.atoll_info.map(item => {
                    let validSerialNumberFlag = this.validateSerialNumber(item, item.UNITSERIALNUMBER);
                    return {
                        ...item,
                        valiedNumberEntered: validSerialNumberFlag,
                        duplicateNumberEntered: false
                    }
                })
                let allValid = slNumberChangedAtoll_info.every(item => item.valiedNumberEntered && !item.duplicateNumberEntered)
                let donarObject = resp.atoll_info.find(item => item.UNITTYPE === "DONOR");
                this.setState({
                    isLoading: false,
                    fiveGRepeatersProjectDetailsList: slNumberChangedAtoll_info,
                    expectedFormat: resp.expected_format,
                    donarObject: donarObject,
                    disableIfSnNotValid: !allValid
                })
            } else {
                if (response && response.errors) {
                    this.props.notifref.addNotification({
                        title: response.errors[0].data.title,
                        position: "br",
                        level: 'error',
                        message: `${response.errors[0].data.detail}`
                    })
                }
                this.setState({
                    isLoading: false,
                    fiveGRepeatersProjectDetailsList: [],
                    expectedFormat: {},
                    donarObject: {}
                })
            }
        })
    }
    validateSerialNumber = (currentObj, slNumber) => {
        let regEx;
        let snLength;
        let { expectedFormat } = this.state;
        if (expectedFormat && expectedFormat.regex_format && expectedFormat.regex_format.serial_number) {
            regEx = new RegExp(expectedFormat.regex_format.serial_number)
            snLength = ["SURECALL", "FRTEK"].includes(expectedFormat.vendor.toUpperCase()) ? 14 : 20
        } else {
            if (currentObj.REPEATERMANUFACTURER.toUpperCase() === "PIVOTAL") {
                regEx = new RegExp('[0-9]{20}')
                snLength = 20;
            } else if (currentObj.REPEATERMANUFACTURER.toUpperCase() === "FRTEK") {
                regEx = new RegExp('FRC[0-9]{2}-[0-9]{3}-[0-9]{4}')
                snLength = 14;
            } else if (currentObj.REPEATERMANUFACTURER.toUpperCase() === "SURECALL") {
                regEx = new RegExp('SC[0-9]{6}-Z[0-9]{4}')
                snLength = 14;
            }
        }
        return (regEx.test(slNumber) && slNumber.length === snLength)
    }
    handleSerialNumberChange = (currentObj, event) => {
        let { fiveGRepeatersProjectDetailsList } = this.state;
        let slNumberChangedAtoll_info = fiveGRepeatersProjectDetailsList.map(item => {
            let duplicateSerialNumberFlag = fiveGRepeatersProjectDetailsList.some(item => item.UNITSERIALNUMBER === event.target.value)
            if (item.SI_ATOLL_INFO_5GR_ID === currentObj.SI_ATOLL_INFO_5GR_ID) {
                let validSerialNumberFlag = this.validateSerialNumber(currentObj, event.target.value);
                return {
                    ...item,
                    UNITSERIALNUMBER: event.target.value,
                    valiedNumberEntered: validSerialNumberFlag,
                    duplicateNumberEntered: duplicateSerialNumberFlag
                }
            } else {
                return item;
            }
        })
        let allValid = slNumberChangedAtoll_info.every(item => item.valiedNumberEntered && !item.duplicateNumberEntered)
        this.setState({ fiveGRepeatersProjectDetailsList: slNumberChangedAtoll_info, disableIfSnNotValid: !allValid })
    }
    handleUpdateButton = () => {
        let { fiveGRepeatersProjectDetailsList } = this.state;
        let donarObject = fiveGRepeatersProjectDetailsList.find(item => item.UNITTYPE === "DONOR");
        let atoll_info = fiveGRepeatersProjectDetailsList.map(item => {
            return {
                "SI_ATOLL_INFO_5GR_ID": item.SI_ATOLL_INFO_5GR_ID,
                "PROJECT_NUMBER": item.PROJECT_NUMBER,
                "UNITSERIALNUMBER": item.UNITSERIALNUMBER,
                "SERVINGDONORSERIALNO": item.UNITTYPE === "SERVING" ? donarObject.UNITSERIALNUMBER : item.SERVINGDONORSERIALNO,
                "DONORGNODEBID": item.DONORGNODEBID,
                "UNITTYPE": item.UNITTYPE,
                "DONORBANDINFO": item.DONORBANDINFO,
                "DONORBANDCLASS": item.DONORBANDCLASS,
                "DONORGNBDUID": item.DONORGNBDUID,
                "DONORGNBDUNUMBER": item.DONORGNBDUNUMBER,
                "REPEATERMANUFACTURER": item.REPEATERMANUFACTURER,
                "REPEATERMODEL": item.REPEATERMODEL
            }
        })
        let payLoad = {
            "atoll_info": atoll_info
        }
        this.setState({ disableOrEnableUpdateButton: true })
        this.props.updateSerialNumber(payLoad).then(action => {
            this.setState({ disableOrEnableUpdateButton: false })
            if (action.type === "UPDATE_SERIAL_NUMBER_SUCCESS" && action.updateSerialNumber.data.serialNumberUpdate !== null) {
                this.props.notifref.addNotification({
                    title: 'Success',
                    position: "br",
                    level: 'success',
                    message: `${action.updateSerialNumber.data.serialNumberUpdate.mesage} for ${action.updateSerialNumber.data.serialNumberUpdate.updatedAtollInfo}`
                })
            } else {
                this.props.notifref.addNotification({
                    title: action.updateSerialNumber.errors[0].data.title,
                    position: "br",
                    level: 'error',
                    message: `${action.updateSerialNumber.errors[0].data.detail}`
                })
            }
        })
    }
    renderLoading = () => <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />
    render() {
        let { fiveGRepeatersProjectDetailsList, disableOrEnableUpdateButton, isLoading, expectedFormat, disableIfSnNotValid } = this.state;
        let { DONORGNODEBID, DONORENODEBVENDOR, DONORBANDINFO, DONORBANDCLASS, DONORGNBDUID, DONORGNBDUNUMBER, REPEATERMANUFACTURER } = this.state.donarObject;
        let sampleImage = `data:image/png;base64,${expectedFormat !== null ? expectedFormat.encoded_image : ""}`
        return (
            <div>
                {isLoading && this.renderLoading()}
                <div className="container-fluid">
                    {fiveGRepeatersProjectDetailsList.length > 0 ? <table className="table  sortable" style={{ background: "#FFF", border: "none" }}>
                        <tbody className="vzwtable text-left">
                            <tr>
                                <td className="Form-group no-border">
                                    <div>
                                        <div ><b className="fontLarge">Donor Band Information</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{DONORBANDINFO}</b></div>
                                    </div>
                                </td>
                                <td className="Form-group no-border">
                                    <div>
                                        <div ><b className="fontLarge">Donor Band Class</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{DONORBANDCLASS}</b></div>
                                    </div>
                                </td>
                                <td className="Form-group no-border">
                                    <div>
                                        <div ><b className="fontLarge">Donor UID</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{DONORGNBDUID}</b></div>
                                    </div>
                                </td>
                                <td className="Form-group no-border">
                                    <div>
                                        <div ><b className="fontLarge">Donor Unit Number</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{DONORGNBDUNUMBER}</b></div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="Form-group no-border">
                                    <div>
                                        <div ><b className="fontLarge">GNODEB ID</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{DONORGNODEBID}</b></div>
                                    </div>
                                </td>
                                <td className="Form-group no-border">
                                    <div>
                                        <div ><b className="fontLarge">GNODEB Vendor</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{DONORENODEBVENDOR}</b></div>
                                    </div>
                                </td>
                                <td className="Form-group no-border">
                                    <div>
                                        <div ><b className="fontLarge">Repeater Manufacturer</b></div>
                                        <div style={{ "color": "#B6B6B6" }}><b className="fontLarge">{REPEATERMANUFACTURER}</b></div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table> : null}
                    <table className="table  sortable table-bordered text-center site-table mb-4">
                        <thead className="vzwtable text-left" style={{ background: "lightgray" }}>
                            <tr colSpan={"4"}>
                                <td className="Form-group" colSpan="4"><b>ID</b></td>
                                <td className="Form-group" colSpan="4"><b>Unit Type</b></td>
                                <td className="Form-group" colSpan="4"><b>Last Modified Date (UTC)</b></td>
                                <td className="Form-group" colSpan="4"><b>Repeater Model</b></td>
                                {expectedFormat !== null && expectedFormat.encoded_image ? <td className="Form-group" colSpan="4"><b>Serial Number</b>
                                    <img src={info} data-tip data-for="Info" style={{ height: '20px', margin: "5px" }}></img>
                                    <ReactTooltip id="Info" place="right" className="sn-image-tooltip">
                                        <img src={sampleImage}></img>
                                    </ReactTooltip>
                                </td> : <td className="Form-group" colSpan="4"><b>Serial Number</b></td>}
                            </tr>
                        </thead>
                        {fiveGRepeatersProjectDetailsList.length > 0 ? <tbody className="vzwtable text-left">
                            {fiveGRepeatersProjectDetailsList.map(item =>
                                <tr colSpan={"4"}>
                                    <td className="Form-group" colSpan="4">{item.SI_ATOLL_INFO_5GR_ID}</td>
                                    <td className="Form-group" colSpan="4">{item.UNITTYPE}</td>
                                    <td className="Form-group" colSpan="4">{item.MODIFIED_ON !== null ? moment.utc(item.MODIFIED_ON).format('MM/DD/YYYY HH:mm') : ""}</td>
                                    <td className="Form-group" colSpan="4">{item.REPEATERMODEL}</td>
                                    <td className="Form-group" colSpan="4">
                                        <input
                                            type={"text"}
                                            name={item.UNITSERIALNUMBER}
                                            className='form-control'
                                            defaultValue={item.UNITSERIALNUMBER}
                                            placeholder='Serial Number'
                                            style={{ height: '100%', width: '100%' }}
                                            onChange={this.handleSerialNumberChange.bind(this, item)}
                                        />
                                        {item.valiedNumberEntered === false && <div style={{ color: "red" }}>Serial number format is not valid</div>}
                                        {item.duplicateNumberEntered && <div style={{ color: "red" }}>Serial Number is already entered</div>}
                                    </td>
                                </tr>)}
                        </tbody> : <tbody className="vzwtable text-left"><tr style={{ textAlign: "center" }}>
                            <td className="Form-group" colSpan="4"></td>
                            <td className="Form-group" colSpan="4"></td>
                            <td className="Form-group" colSpan="4">No Records Found</td>
                            <td className="Form-group" colSpan="4"></td>
                            <td className="Form-group" colSpan="4"></td>
                        </tr></tbody>}
                    </table>
                    {disableOrEnableUpdateButton && this.renderLoading()}
                    <button
                        type="button"
                        className="Button--small"
                        onClick={(e) => this.handleUpdateButton()}
                        style={{ width: 'fit-content', float: "right", padding: "8px 15px", fontSize: "1rem" }}
                        disabled={disableOrEnableUpdateButton || fiveGRepeatersProjectDetailsList.length === 0 || disableIfSnNotValid}
                    >Update</button>
                </div>
            </div>
        )
    }
}

export default connect(null, { ...pmActions })(FiveGRepeaterProjectDetails)