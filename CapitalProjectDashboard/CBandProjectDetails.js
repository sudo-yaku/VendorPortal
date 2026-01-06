import React, { Component } from "react"
import { connect } from "react-redux"
import Select from 'react-select'
import * as formActions from "../Forms/actions"
import { Map, fromJS, List } from "immutable"
import moment from "moment"
import * as pmActions from "./actions"
import Loader from "../Layout/components/Loader"

class CBandProjectDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            cBandProjectDetails: {},
            sectorsSelected: "",
            selectedEnodebId: "",
            noOfSectorsSelected: [],
            devicesObjs: [],
            selectedEnodebIdList: [],
            groupByEnodebId: {},
            showSectorsDropdown: false,
            showAddSectorButton: false,
            showEnodebList: true,
            showSectorsListForEnodeb: false,
            isLoading: true
        }
    }

    componentDidMount() {
        this.getCbandProjDetails();
    }
    getCbandProjDetails() {
        let { selectedRow, getCbandProjDetails } = this.props
        getCbandProjDetails(selectedRow.proj_number).then(resp => {
            let nodeObjs = resp && resp.project_details && resp.project_details.devices && resp.project_details.devices.length > 0 ? resp.project_details.devices : [];
            // nodeObjs = []
            this.setState({
                isLoading: false,
                cBandProjectDetails: resp,
                showSectorsDropdown: nodeObjs.length === 0 ? true : false,
                showEnodebList: nodeObjs.length === 0 ? false : true,
                groupByEnodebId: this.groupByEnodebId(nodeObjs)
            })
        })
    }

    groupByEnodebId = (devices) =>
        devices.reduce((r, a) => {
            r[a.enodeb_id] = [...r[a.enodeb_id] || [], a];
            return r;
        }, {});

    generateOptinsForDropdown(items) {
        return items.map(i => {
            return { 'label': i, 'value': i }
        })
    }

    handleSectorsDropdown = (e) => {
        let newDevices = {};
        let sectors = [];
        for (let i = 1; i <= e.value; i++) {
            let obj = {
                "sector_id": String(i),
                "serial_num": "",
                "enodeb_id": "",
                "comments": ""
            }
            sectors.push(obj);
        }
        newDevices[""] = sectors
        this.setState({
            sectorsSelected: e.value,
            selectedEnodebId: "",
            selectedEnodebIdList: sectors,
            groupByEnodebId: newDevices,
            showSectorsListForEnodeb: true
        })
    }

    handleSerialNumberInput = (e, sector_id, enodeb_id) => {
        let { groupByEnodebId } = this.state;
        let data = [];
        data = groupByEnodebId[enodeb_id].map(item => item.serial_num)
        groupByEnodebId[enodeb_id] = groupByEnodebId[enodeb_id].map(item => {           
            if (item.sector_id === sector_id) {
                item.serial_num = e.target.value;
                item.error_message = data.includes(e.target.value) ? "Serial Number already used, it should be unique" : item.serial_num !== "" && !/^[S][A-Za-z0-9]{9}/i.test(item.serial_num) ? "Serial Number should start with S followed by 9 Alphanumeric characters" : "";
                return item;
            } else {
                return item;
            }
        })
        this.setState({ groupByEnodebId: groupByEnodebId })
    }
    handleSerialNumberComments = (e, sector_id, enodeb_id) => {
        let { groupByEnodebId } = this.state;
        groupByEnodebId[enodeb_id] = groupByEnodebId[enodeb_id].map(item => {
            if (item.sector_id === sector_id) {
                item.comments = e.target.value;
                return item;
            } else {
                return item;
            }
        })
        this.setState({ groupByEnodebId: groupByEnodebId })
    }

    handleAddSectorButton = (enodeb) => {
        let { groupByEnodebId } = this.state;
        let sectors = groupByEnodebId[enodeb];
        let obj = {
            "sector_id": String(groupByEnodebId[enodeb].length + 1),
            "serial_num": "",
            "enodeb_id": enodeb,
            "comments": ""
        }
        sectors.push(obj);
        groupByEnodebId[enodeb] = sectors
        this.setState({
            groupByEnodebId: groupByEnodebId,
            selectedEnodebIdList: groupByEnodebId[enodeb],
            showAddSectorButton: groupByEnodebId[enodeb].length < 3 ? true : false
        })
    }

    handleUpdateButton = (enodeb) => {
        let { groupByEnodebId } = this.state;
        let selectedEnodebIdList = groupByEnodebId[enodeb];
        this.setState({
            showEnodebList: false,
            showSectorsListForEnodeb: true,
            selectedEnodebId: enodeb,
            selectedEnodebIdList: selectedEnodebIdList,
            showAddSectorButton: groupByEnodebId[enodeb].length < 3 ? true : false,
        })
    }

    handleCloseSectorsPage = () => this.setState({ showEnodebList: true, showSectorsListForEnodeb: false })
    renderLoading = () => <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />

    handleSubmitButton = (enodeb) => {
        let { site_unid, siteid, proj_number, sitename, project_type, project_status, ps_loc_code } = this.props.selectedRow;
        let { loginId, vendorId, user, saveDeviceToEnodeb } = this.props;
        let { groupByEnodebId } = this.state;
        let serialNumList = [];
        serialNumList = groupByEnodebId[enodeb].map(item => {
            return {
                "SITE_UNID": site_unid,
                "SITE_ID": siteid,
                "SITE_NAME": sitename,
                "PROJECT_NUMBER": proj_number,
                "PROJECT_TYPE": project_type,
                "PROJECT_STATUS": project_status,
                "PS_LOCATION_ID": ps_loc_code,
                "SECTOR_ID": item.sector_id ? item.sector_id : "",
                "ENODEB_ID": item.enodeb_id ? item.enodeb_id : "",
                "SERIAL_NUMBER": item.serial_num ? item.serial_num : "",
                "USER_ID": loginId,
                "COMMENTS": item.comments ? item.comments : "",
                "VENDOR_ID": vendorId,
                "VENDOR_NAME": user.get("vendor_name"),
                "LAST_UPDATED_BY": user.get("name"),
                "SOURCE": "WEB"
            }
        })

        saveDeviceToEnodeb(serialNumList).then(async (action) => {
            if (action.type === "SAVE_DEVICE_TO_ENODEB_SUCCESS") {
                this.setState({
                    showEnodebList: !this.state.showEnodebList,
                    showSectorsListForEnodeb: !this.state.showSectorsListForEnodeb,
                    isLoading: true
                }, this.getCbandProjDetails())
                this.props.notifref.addNotification({
                    title: 'success',
                    position: "br",
                    level: 'success',
                    message: action.saveDeviceToEnodeb.output.iop_data.message
                })
            }
        })
    }

    validateSerialNumber = () => {
        let { groupByEnodebId, selectedEnodebId } = this.state;
        let regEx = /^[S][A-Za-z0-9]{9}/i
        return !groupByEnodebId[selectedEnodebId].every(item => item.serial_num !== "" ? regEx.test(item.serial_num) : false);
    }

    render() {
        let {
            selectedEnodebId, groupByEnodebId, showSectorsDropdown, showEnodebList,
            showSectorsListForEnodeb, sectorsSelected, showAddSectorButton, isLoading
        } = this.state;
        const customStyles = {
            control: base => ({
                ...base,
                height: 30,
                minHeight: 30,
                width: 20
            })
        }
        return (
            <div>
                {isLoading && this.renderLoading()}
                {showSectorsDropdown &&
                    <div style={{ marginBottom: "15px", width: "25%" }}>
                        <label>Select No Of Sectors</label>
                        <Select
                            className="basic-single text-center title-div-style"
                            classNamePrefix="select"
                            value={sectorsSelected}
                            placeholder={"Select Sectors"}
                            isSearchable={false}
                            styles={customStyles}
                            onChange={(e) => this.handleSectorsDropdown(e)}
                            options={this.generateOptinsForDropdown([1, 2, 3])}
                            required
                            clearable={false}
                        />
                    </div>
                }
                {showEnodebList && Object.keys(groupByEnodebId).map(enodeb =>
                    <div style={{ border: "1px solid gray", padding: "10px" }}>
                        <table style={{ marginBottom: "0px" }}>
                            <tbody>
                                <tr>
                                    <td>
                                        <div><b>Enodeb ID #{enodeb && enodeb !== null && enodeb !== "null" ? enodeb : "NA"}</b></div>
                                    </td>
                                    <td>
                                        <div><b>No Of Sectors : {groupByEnodebId[enodeb].length}</b></div>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="Button--small"
                                            onClick={(e) => this.handleUpdateButton(enodeb)}
                                            style={{ width: 'fit-content', float: "right", padding: "8px 15px", fontSize: "1rem" }}
                                        >Update</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table style={{ marginBottom: "0px" }}>
                            <thead style={{ background: "gray", fontWeight: "bold", color: "white" }}>
                                <td style={{ paddingLeft: "10px", color: "white" }}>Sector ID</td>
                                <td style={{ paddingLeft: "10px", color: "white" }}>Serial Number</td>
                            </thead>
                            <tbody style={{ border: "0.0625rem solid #d8dada" }}>
                                {groupByEnodebId[enodeb].map((sector, index) =>
                                    <tr>
                                        <td style={{ paddingLeft: "10px" }}>{sector.sector_id}</td>
                                        <td style={{ paddingLeft: "10px" }}>{sector.serial_num ? sector.serial_num : "NA"}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showSectorsListForEnodeb &&
                    <div style={{ border: "1px solid gray", padding: "5px" }}>
                        <div>
                            <div style={{ fontWeight: "bold", padding: "10px", background: "gray", color: "white" }}>
                                <span>Enodeb ID #{selectedEnodebId && selectedEnodebId !== "null" ? selectedEnodebId : "NA"}</span>
                                {!showSectorsDropdown &&
                                    <span style={{ float: "right", cursor: "pointer", fontSize: "medium" }} onClick={this.handleCloseSectorsPage}>X</span>}
                            </div>
                            <table style={{marginBottom: "0px"}}>
                                <tbody>
                                    {groupByEnodebId[selectedEnodebId].map((item, index) =>
                                        <tr style={{ paddingBottom: "0px" }}>
                                            <td style={{ display: "inline-grid", width: "50%" }}>
                                                <label htmlFor="serialNumber">Sector {item.sector_id ? item.sector_id : "NA"}</label>
                                                <input
                                                    id={index}
                                                    type="text"
                                                    ref="serialNumber"
                                                    name="serialNumber"
                                                    maxLength={10}
                                                    value={item.serial_num}
                                                    onChange={(e) => this.handleSerialNumberInput(e, item.sector_id, item.enodeb_id)}
                                                    placeholder="Serial Number"
                                                    style={{ lineHeight: "30px", border: "1px solid lightgray", fontSize: "14px" }}
                                                />
                                                <div style={{color: "red"}}>{item.error_message ? item.error_message : ""}</div>
                                                {/* {item.serial_num !== "" && !/^[S][A-Za-z0-9]{9}/i.test(item.serial_num) ? <div style={{ color: "red" }}>Serial Number should start with "S" followed by 9 Alphanumeric characters</div> : null} */}
                                                {!showSectorsDropdown && 
                                                <div style={{marginTop: "5px", display: "flex", justifyContent: "space-around"}}>
                                                    <span><b>Last Scanned By:</b> {item.scanned_by}</span>
                                                    <span><b>Last Scanned Date:</b> {moment(item.scanned_on).format("MM/DD/YYYY")}</span>
                                                </div>}
                                            </td>
                                            <td style={{ display: "inline-grid", width: "50%", paddingBottom: "0px" }}>
                                                <label htmlFor="comments">Comments:</label>
                                                <textarea
                                                    cols={30}
                                                    rows={4}
                                                    name="comments"
                                                    style={{ border: "1px solid lightgray", height: "60%" }}
                                                    onChange={(e) => this.handleSerialNumberComments(e, item.sector_id, item.enodeb_id)}
                                                    defaultValue={item.comments}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            {showAddSectorButton &&
                                <button
                                    type="button"
                                    className="Button--small"
                                    onClick={(e) => this.handleAddSectorButton(selectedEnodebId)}
                                    style={{ width: 'fit-content', margin: '10px', padding: "8px 15px", fontSize: "1rem" }}
                                >Add Sector</button>}
                            <button
                                type="button"
                                className="Button--small"
                                onClick={(e) => this.handleSubmitButton(selectedEnodebId)}
                                disabled={this.validateSerialNumber()}
                                style={{ width: 'fit-content', margin: '10px', padding: "8px 15px", fontSize: "1rem" }}
                            >Submit</button>
                        </div>
                    </div>
                }
            </div>
        )
    }
}
function stateToProps(state, props) {
    let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
    let user = state.getIn(["Users", "entities", "users", loginId], Map())
    let vendorId = user.toJS().vendor_id
    let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
    let cBandProjectDetails = state.getIn(["CapitalProjectDashboard", "getCbandProjDetails", "cBandProjectDetails"], Map())
    let cBandProjectDetailsLoading = state.getIn(["CapitalProjectDashboard", "getCbandProjDetails", "isloading"])
    return {
        siteDetaisLoading: state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false),
        loginId,
        vendorId,
        user,
        submarket,
        cBandProjectDetailsLoading,
        cBandProjectDetails
    }
}
export default connect(stateToProps, { ...formActions, ...pmActions })(CBandProjectDetails)