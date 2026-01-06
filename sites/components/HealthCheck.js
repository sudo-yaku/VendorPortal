import React, { Component } from "react"
import PropTypes, { bool } from "prop-types"
import { connect } from "react-redux"
import { Map, fromJS, List } from "immutable"
import Modal from "../../Layout/components/Modal"
import moment from 'moment'
import Loader from '../../Layout/components/Loader'
import { fetchSiteDetails, downloadHcDetails, createHealthCheckReq, fetchHealthCheckReqs, healthCheckDisable, healthCheckEnable, fetchHealthCheckDetails, getSectorCarriers, getSpecHistory, createSpectrumRequest, viewSpectrumAnalysis,downloadSpectrumAnalysis,fetchSectorLockData ,fetchLockData} from "../actions"
import "../../PreventiveMaintenance/assets/pmstyles.css"
import { logActioninDB } from '../../VendorDashboard/actions'
import RefreshPage from '../images/RefreshIcon.png'
import ReactTooltip from 'react-tooltip'
import ViewHealthCheck from "./ViewHealthCheck"
import uniq from 'lodash/uniq'
import { Picky } from 'react-picky';
import 'react-picky/dist/picky.css';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup } from "@material-ui/core"
import { utcToLocal } from "../../date_utils"
import Select from 'react-select'
import * as VendorActions from "../actions"
import { DataGrid } from "@mui/x-data-grid"
import {postTaskType} from '../../SiteTools/actions'
import {startCase} from 'lodash';

class HealthCheck extends React.Component {
    static propTypes = {
        site: PropTypes.object,
        fetchSiteDetails: PropTypes.func,
        getHealthCheckReqs: PropTypes.object,
        getHealthCheckDetails: PropTypes.func,
        createHealthCheckReq: PropTypes.func,
        getHealthCheckReq: PropTypes.func,
        dispMessage: PropTypes.bool
    }
    constructor(props) {
        super(props)

        this.state = {
            pageLoading: false,
            healthCheckReqs: [],
            summary: [],
            summary_node: "",
            errorMessage: '',
            successMesssage: '',
            dispMessage: false,
            errMessage: false,
            isModalshown: false,
            data: [],
            inProgresError: "",
            inProgress: false,
            siteData: false,
            checkListHC: [],
            getHealthDetails: false,
            requestType: '',
            requestId: '',
            errors: false,
            errorHMessage: '',
            errMsg: '',
            regions: [],
            timeStamp: '',
            eNodeBOptionsSelected: [],
            healthCheckType: "",
            eNodeBOptions: [],
            isEricsson : null,
            sectorOptions : [],
            sectorOptionsSelected : [],
            specComments : '',
            targetedHCOptions: [],
            selectedEnodBVendor: "",
            showPostCheckPassSection: false,
            showPostCheckFailedSection: false,
            showWorkTaskNotesSection: false,
            workTaskNotes: "",
            display: "",
            // hcButtonDisable:false,
            selectedFaultCode: "",
            selectedResolutionCode: "",
            commentValue: "",
            PcCommentIsValid: false,
            errCommentMessage: false,
            showTargetteError: false,
            sectorLocked: false,
            sectorUnlocked: false,
            sectorUnlock2Min: false,
            disablePostHealthCheck: false,
            disableHCFor2Min: false,
            time: {},
            twoMinTimer: null,
            seconds: 900,
        }
        this.siteDetails = this.siteDetails.bind(this);
        this.hcReq = this.hcReq.bind(this);
        this.getHealthCheckReq = this.getHealthCheckReq.bind(this);
        this.enableBtn = this.enableBtn.bind(this);
        this.disableBtn = this.disableBtn.bind(this);
        this.checkRequestDisable = this.checkRequestDisable.bind(this);
        this.getHealthCheckDetails = this.getHealthCheckDetails.bind(this);
        this.timer = 0;
        this.startCountDownTimer = this.startCountDownTimer.bind(this);
        this.countDown = this.countDown.bind(this);
    }
    async siteDetailsForHC() {
        let { config, submarket, siteDetailsData, healthCheckInSiteAccess, getSectorCarriers ,lock_unlock_request_id} = this.props;
        if (healthCheckInSiteAccess) {
            let siteDetail = siteDetailsData
            this.setState({ siteData: true })
            if (siteDetail && siteDetail.node_details && siteDetail.node_details.length == 0) {
                this.disableBtn();
                this.setState({ errMessage: true, errorMessage: "E-nodebs doesn’t exist for this site" })
            }
            let enodeBData = siteDetail && siteDetail.node_details && siteDetail.node_details.length > 0 ? siteDetail.node_details : [];
            let isEricsson = enodeBData.find(i => i.vendor.toLowerCase() === 'ericsson')?.vendor || null

            let eNodeBOptions = enodeBData.map(item => {
                let nodeObj = {
                    ...item,
                    label: item.node,
                    value: item.node,
                    isChecked: false
                }
                return nodeObj;
            })
            let enodes = enodeBData.length > 0 ? enodeBData.filter(e => e.type === "4G") : [];
            let gnodes = enodeBData.length > 0 ? enodeBData.filter(e => e.type === "5G") : [];
            let config_data = config.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "HEALTHCHECK_INVD_SBMARKET")
            let submarkets_arr = []
            if (config_data && config_data.length > 0) {
                submarkets_arr = config_data[0].ATTRIBUTE_VALUE.split(",");
            }
            let submarketfilter = submarkets_arr.filter(_ => _ == submarket)
            this.setState({ regions: submarketfilter, eNodeBOptions: eNodeBOptions, isEricsson }, () => {
                if (submarketfilter && submarketfilter.length > 0) {
                    if (gnodes.length > 0 && enodes.length == 0) {
                        this.disableBtn();
                        this.setState({ errMessage: true, errorMessage: "G-nodebs exists for this site but cannot request Health check" })
                    }
                }
                let c1 = this.state.regions.length > 0 && this.state.regions[0] != siteDetail.region && gnodes.length > 0
                if (enodes.length > 0 || c1 || (this.state.regions.length == 0 && gnodes.length > 0)) {
                    this.getHealthCheckReq(siteDetail.site_unid)
                    this.setIntervalHCDetails(siteDetail.site_unid)
                }
            })
            await getSectorCarriers(siteDetailsData.site_unid);
            let sectorOptions = this.props.siteSectors.map(item => {
                let nodeObj = {
                    label: item.node,
                    value: item.node
                }
                return nodeObj;
            })
              this.setState({sectorOptions: sectorOptions, lock_unlock_request_id },() => this.disablePostHealthCheck())
        }
    }
    async siteDetails(site_unid) {
        let { config, submarket, siteDetailsData, healthCheckInSiteAccess, getSectorCarriers } = this.props;
        if ((this.props.siteDetailInfo && this.props.siteDetailInfo.size > 0) ||  this.props.SiteTools) {
             let res = this.props.SiteTools ? siteDetailsData : this.props.siteDetailInfo.toJS();
            this.setState({ siteData: true }, () => {
                if (res && res.node_details && res.node_details.length == 0) {
                    this.disableBtn();
                    this.setState({ errMessage: true, errorMessage: "E-nodebs doesn't exist for this site" })
                }
                let enodeBData = res && res.node_details && res.node_details.length > 0 ? res.node_details : [];
                let isEricsson = enodeBData.find(i => i.vendor.toLowerCase() === 'ericsson')?.vendor || null
                let eNodeBOptions = enodeBData.map(item => {
                    let nodeObj = {
                        ...item,
                        label: item.node,
                        value: item.node,
                        isChecked: false
                    }
                    return nodeObj;
                })
                let enodes = enodeBData.length > 0 ? enodeBData.filter(e => e.type === '4G') : [];
                let gnodes = enodeBData.length > 0 ? enodeBData.filter(e => e.type === '5G') : [];

                let config_data = config.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "HEALTHCHECK_INVD_SBMARKET")
                let submarkets_arr = []
                if (config_data && config_data.length > 0) {
                    submarkets_arr = config_data[0].ATTRIBUTE_VALUE.split(",");
                }
                let submarketfilter = submarkets_arr.filter(_ => _ == submarket)
                this.setState({ regions: submarketfilter, eNodeBOptions: eNodeBOptions, isEricsson : isEricsson }, () => {
                    if (submarketfilter && submarketfilter.length > 0) {
                        if (gnodes.length > 0 && enodes.length == 0) {
                            this.disableBtn();
                            this.setState({ errMessage: true, errorMessage: "G-nodebs exists for this site but cannot request Health check" })
                        }
                    }
                    let c1 = this.state.regions.length > 0 && this.state.regions[0] != res.region && gnodes.length > 0
                    if (enodes.length > 0 || c1 || (this.state.regions.length == 0 && gnodes.length > 0)) {
                        this.getHealthCheckReq(site_unid)
                        this.setIntervalHCDetails(res.site_unid)
                    }

                })

            })
        } else {
            await this.props.fetchSiteDetails(this.props.loginId, site_unid).then(res => {
                this.setState({ siteData: true }, () => {
                    if (res.site && res.site.node_details && res.site.node_details.length == 0) {
                        this.disableBtn();
                        this.setState({ errMessage: true, errorMessage: "E-nodebs doesn't exist for this site" })
                    }
                    let enodeBData = res.site && res.site.node_details && res.site.node_details.length > 0 ? res.site.node_details : [];
                    let isEricsson = enodeBData.find(i => i.vendor.toLowerCase() === 'ericsson')?.vendor || null

                    let eNodeBOptions = enodeBData.map(item => {
                        let nodeObj = {
                            ...item,
                            label: item.node,
                            value: item.node,
                            isChecked: false
                        }
                        return nodeObj;
                    })
                    let enodes = enodeBData.length > 0 ? enodeBData.filter(e => e.type === '4G') : [];
                    let gnodes = enodeBData.length > 0 ? enodeBData.filter(e => e.type === '5G') : [];

                    let config_data = config.toJS().configData.filter(e => e.ATTRIBUTE_NAME === "HEALTHCHECK_INVD_SBMARKET")
                    let submarkets_arr = []
                    if (config_data && config_data.length > 0) {
                        submarkets_arr = config_data[0].ATTRIBUTE_VALUE.split(",");
                    }
                    let submarketfilter = submarkets_arr.filter(_ => _ == submarket)
                    this.setState({ regions: submarketfilter, eNodeBOptions: eNodeBOptions, isEricsson : isEricsson }, () => {
                        if (submarketfilter && submarketfilter.length > 0) {
                            if (gnodes.length > 0 && enodes.length == 0) {
                                this.disableBtn();
                                this.setState({ errMessage: true, errorMessage: "G-nodebs exists for this site but cannot request Health check" })
                            }
                        }
                        let c1 = this.state.regions.length > 0 && res && this.state.regions[0] != res.site.region && gnodes.length > 0
                        if (enodes.length > 0 || c1 || (this.state.regions.length == 0 && gnodes.length > 0)) {
                            this.getHealthCheckReq(site_unid)
                            this.setIntervalHCDetails(res.site.site_unid)
                        }

                    })

                })
            })
        }
        await getSectorCarriers(site_unid);
        let sectorOptions = this.props.siteSectors.map(item => {
            let nodeObj = {
                label: item.node,
                value: item.node
            }
            return nodeObj;
        })
        this.setState({sectorOptions : sectorOptions})
        this.props.user.vendor_category != 'Nest Evaluation' && await this.props.fetchSectorLockData(this.props.vendorId, this.props.loginId, site_unid).then(async action => {

            if (action.type == "FETCH_SECTORLOCKDATA_SUCCESS") {
              const refData = !!action.sectorLockData && !!action.sectorLockData.getSectorLockData && !!action.sectorLockData.getSectorLockData.refData ? action.sectorLockData.getSectorLockData.refData : []
      
              var lock_unlock_request_id
              let woid=''
              const siteData = !!action.sectorLockData && !!action.sectorLockData.getSectorLockData && !!action.sectorLockData.getSectorLockData.siteData ? action.sectorLockData.getSectorLockData.siteData : null
              if (this.props.selectedWO) {
                woid = this.props.selectedWO.workORderInfo.toJS().workorder_id;
            }
            if (this.props.selectedRow) {
                woid = this.props.selectedRow.proj_number;
            }
              var statusArr = [
                "CANCELLED",
                "COMPLETED"]
              var workPendingStatus = ['NEW', 'IN_PROGRESS']
              let filteredLockData = siteData.filter(val => val.WORK_ORDER_ID == woid && ((!statusArr.includes(val.REQUEST_STATUS)) || (val.REQUEST_STATUS === 'HAND_OFF' && moment(val.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'))))
      
      
              if (siteData.filter(v => v.WORK_ORDER_ID != woid).length == 0 || siteData.filter(v => v.WORK_ORDER_ID != woid && ((workPendingStatus.includes(v.REQUEST_STATUS)) || (v.REQUEST_STATUS === 'HAND_OFF' && moment(v.CREATED_DATE).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')))).length == 0) {
      
                if (!!filteredLockData && filteredLockData.length === 0) {
                  lock_unlock_request_id = ''
                } else if (!!filteredLockData && filteredLockData.length > 0) {
                  lock_unlock_request_id = siteData.filter(val => !statusArr.includes(val.REQUEST_STATUS) && val.WORK_ORDER_ID == woid).sort((a, b) => {
                    if (new Date(a.CREATED_DATE) < new Date(b.CREATED_DATE)) {
                      return 1
                    } else if (new Date(a.CREATED_DATE) > new Date(b.CREATED_DATE)) {
                      return -1
                    } else {
                      return 0
                    }
                  })[0].LOCK_UNLOCK_REQUEST_ID.toString()
      
      
                } else {
                  lock_unlock_request_id = ''
                }
              } else {
      
                lock_unlock_request_id = ''
              }
              this.setState({ lock_unlock_request_id },() => this.disablePostHealthCheck())
            }
          })
    }
    setIntervalHCDetails = (site_unid) => {
        let { config } = this.props;
        let autoSLRRefresh = config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "OSW_REFRESH_INTERVAL")
        let intervalTime = 60000;
        if (autoSLRRefresh && Object.keys(autoSLRRefresh).length > 0 && autoSLRRefresh.ATTRIBUTE_VALUE) {
            intervalTime = autoSLRRefresh.ATTRIBUTE_VALUE
        }
        this.timerHC = setInterval(() => {
            this.getHealthCheckReq(site_unid);
             // Enable Post health check after the sector unlock success
           this.disablePostHealthCheck()
        }, intervalTime)
    }
    async disableBtn() {
        await this.props.healthCheckDisable()
    }
    async enableBtn() {
        await this.props.healthCheckEnable()
    }
    async getHealthCheckReq(unid) {
        this.setState({ errors: false, errorHMessage: "" })
        let { oswCreatedTime } = this.props
        let oswCreatedTimeDiffMinutes = moment.utc().diff(moment.utc(oswCreatedTime), 'minutes')
        await this.props.fetchHealthCheckReqs(this.props.loginId, unid).then(async res => {
            let enodeb_healthcheck = []
            if (res && res.type == "FETCH_HEALTHCHECK_SUCCESS" && res.healthCheckReqs) {
                enodeb_healthcheck = res.healthCheckReqs && res.healthCheckReqs.enodeb_healthcheck ? res.healthCheckReqs.enodeb_healthcheck : []
                if (enodeb_healthcheck?.length > 0) {
                    let postCheckResults = enodeb_healthcheck.filter(item => item.req_type == "Post-Check" && item.osw_request_id == this.props.lock_unlock_request_id)
                    let preCheckResults = enodeb_healthcheck.filter(item => item.req_type == "Pre-Check" && item.osw_request_id == this.props.lock_unlock_request_id)
                    // If no pre check triggered and OSW status is AUTO, then change the status to NEW
                    if (this.props.healthCheckInSiteAccess && preCheckResults?.length === 0 && this.props.oswStatus.toUpperCase() == "AUTO" && oswCreatedTimeDiffMinutes >= 2) {
                        let text = `VP: AUTO to NEW, No health check triggered. Please work with FAST, OSW Request ID: ${this.props.lock_unlock_request_id}`
                        await this.props.updateSLRStatus("NEW", text, "VP Error")
                    }
                    let preCheckFailedResult = this.findPrecheckStatus(preCheckResults)
                    // If pre check failed and OSW status is AUTO, then change the status to NEW
                    if (this.props.healthCheckInSiteAccess && this.props.oswStatus.toUpperCase() == "AUTO" && preCheckFailedResult && preCheckFailedResult.length > 0 && this.props.stay_as_auto != 'Y') {
                        let reqIds = preCheckFailedResult.map(item => item.request_id)
                        let text = `VP: AUTO to NEW, Pre check failed - Request ID: ${reqIds.toString()}, OSW Request ID: ${this.props.lock_unlock_request_id}`
                        await this.props.updateSLRStatus("NEW", text, "Failed PreCheck")
                    }
                    let postCheckCompleted = []
                    if (this.props.healthCheckInSiteAccess && this.props.oswStatus.toUpperCase() == "AUTO" && postCheckResults.length > 0) {
                        postCheckResults.map(item => {
                            if (item.hc_result !== null && ["COMPLETED", "PASSED"].includes(item.hc_result.toUpperCase())) {
                                postCheckCompleted.push(item)
                            }
                        })
                    }
                    let hcDetailsWithNodeType = this.addNodeTypeData(enodeb_healthcheck)
                    if (this.state.isEricsson) {
                        await this.props.getSpecHistory(unid);
                    }
                    this.setState({
                        showPostCheckPassSection: postCheckResults.length > 0 && postCheckResults.length == postCheckCompleted.length ? true : false,
                        getHealthDetails: true,
                        healthCheckReqs: hcDetailsWithNodeType && hcDetailsWithNodeType.length > 0 ? hcDetailsWithNodeType : enodeb_healthcheck,
                        commentValue: postCheckResults && postCheckResults.length > 0 && postCheckResults[0].notes ? postCheckResults[0].notes : ""
                    })
                    if (preCheckResults && preCheckResults.length > 0) {
                        this.props.showSectorLockAction()
                    }
                    this.checkRequestDisable(res.healthCheckReqs.enodeb_healthcheck)
                }else{
                    if (this.state.isEricsson) {
                        await this.props.getSpecHistory(unid);
                    }
                }
            }
            if (res.type == "FETCH_HEALTHCHECK_FAILURE") {
                this.setState({ errors: true, errorHMessage: res && res.errors && res.errors[0] && res.errors[0].message })
                if (this.state.isEricsson) {
                    await this.props.getSpecHistory(unid);
                }
            }
        })
    }

    findPrecheckStatus = (preChecks) => {
        let fourGprechecks = [];
        let fiveGprechecks = [];
        let node_details = this.props.site.node_details !== null ? this.props.site.node_details : []
        let fourGnodes = node_details.filter(item => ["4G", "C-BAND", "CBRS"].includes(item.type.toUpperCase()))
        let fiveGnodes = node_details.filter(item => ["5G", "5GMMW"].includes(item.type.toUpperCase()))
        let ericssonMMWnodes = node_details.filter(item => item?.vendor?.toLowerCase() === 'ericsson' && item?.type?.toUpperCase() === '5G' && item?.node?.length === 7 && !["7","9"].includes(item.node[3]));
        
        preChecks = preChecks?.filter(preCheck => {
            return preCheck?.enodeb_ids?.some(nodeId => 
                !ericssonMMWnodes.some(mmwNode => mmwNode.node === nodeId)
            ); });
            
        if (preChecks && preChecks.length > 1 && node_details.length > 1 && fourGnodes.length > 0 && fiveGnodes.length > 0) {
            fourGnodes.forEach(siteDetailsNodes => {
                fourGprechecks = preChecks.filter(preCheck => preCheck && preCheck.enodeb_ids && preCheck.enodeb_ids.length > 0 && preCheck.enodeb_ids.includes(siteDetailsNodes.node))
            })
            fiveGnodes.forEach(siteDetailsNodes => {
                fiveGprechecks = preChecks.filter(preCheck => preCheck && preCheck.enodeb_ids && preCheck.enodeb_ids.length > 0 && preCheck.enodeb_ids.includes(siteDetailsNodes.node))
            })
        }
        if (preChecks && preChecks.length > 1 && fourGnodes.length > 0 && fiveGnodes.length > 0) {
            let failed4G5GPrechecks = []
            if(fourGprechecks.length > 0 && ["failed", "errors", "completed with errors"].includes(fourGprechecks[0].status.toLowerCase())) {
                failed4G5GPrechecks.push(fourGprechecks[0])
            }
            if(fiveGprechecks.length > 0 && ["failed", "errors", "completed with errors"].includes(fiveGprechecks[0].status.toLowerCase())) {
                failed4G5GPrechecks.push(fiveGprechecks[0])
            }
            return failed4G5GPrechecks;
        } else {
            let preCheckFailed = preChecks.length > 0 && ["failed", "errors", "completed with errors"].includes(preChecks[0].status.toLowerCase())
            return preCheckFailed ? [preChecks[0]] : [];
        }
    }
    addNodeTypeData = (healthCheckData) => {
        let { siteDetailsData } = this.props;
        if (siteDetailsData && siteDetailsData.node_details && siteDetailsData.node_details.length > 0 && healthCheckData.length > 0) {
            const { node_details } = siteDetailsData;
            healthCheckData.forEach(healthCheck => {
                let newFieldData = "";
                healthCheck && healthCheck.enodeb_ids && healthCheck.enodeb_ids.forEach(id => {
                    const obj = node_details.find(item => item.node === id);
                    if (obj && Object.keys(obj).length > 0) {
                        const { vendor, type } = obj;
                        const newVal = vendor && type ? `${id}-${vendor}-${type}` : id + vendor;
                        newFieldData = newFieldData ? newFieldData + ', ' + newVal : newVal;
                    }
                })
                healthCheck.node_id_type = newFieldData;
            });
            return healthCheckData;
        } else {
            return healthCheckData;
        }
    }

    async getHealthCheckDetails(row) {
        if(row.req_type !== 'Spectrum Analyzer'){
            await this.props.fetchHealthCheckDetails(this.props.loginId, row.request_id).then(
                (res) => {
                    if (this.props.healthCheckDetails && this.props.healthCheckDetails.toJS().errors) {
                        let output = this.props.healthCheckDetails.toJS().errors.detail
                        return this.setState({ data: output })
                    }
                    else {
                        let enb_hc_result = this.props.healthCheckDetails.toJS().enodeb_healthcheck_result;
                        let ondemand = enb_hc_result && enb_hc_result.ondemand_info && enb_hc_result.ondemand_info.result;
                        let precheck = enb_hc_result && enb_hc_result.precheck_info && enb_hc_result.precheck_info.result;
                        let postcheck = enb_hc_result && enb_hc_result.postcheck_info && enb_hc_result.postcheck_info.result;
                        let output = ondemand.length > 0
                            ? ondemand
                            : ondemand.length == 0 && precheck.length > 0 ? precheck
                                : ondemand.length == 0 && precheck.length === 0 && postcheck.length > 0 ? postcheck
                                    : [];
                        let summary = enb_hc_result && enb_hc_result.summary && enb_hc_result.summary.length > 0 && enb_hc_result.summary
                        return this.setState({ data: output, summary: summary, requestType: enb_hc_result.req_type, requestId: enb_hc_result.request_id, timeStamp: row.created_on });

                    }
                }
            );
        }
        else {
            await this.props.viewSpectrumAnalysis(row.request_id)
            return this.setState({ data: [], summary: [], requestType: row.req_type, requestId: row.request_id, timeStamp: row.created_on });
        }
    }
    componentDidMount() {
        let site_unid = "";
        if (this.props.isErricson && this.props.isReplacingRETAntennaRadio?.toUpperCase() == 'NOT SURE') {
            this.setState({ checkListHC: [{ value: "RET(s)", checked: false }, { value: "Antenna(s)", checked: false }, { value: "CBRS(s)", checked: false }] });
        }
        console.log("the props in health check are", this.props)
        if (this.props.selectedRow) {
            console.log("selected row in health check", this.props.selectedRow)
            site_unid = this.props.selectedRow.site_unid
            this.siteDetails(site_unid)
        } else if (this.props.selectedWO) {
            console.log("selected wo in health check", this.props.selectedWO)
            site_unid = this.props.workORderInfo.toJS().site_unid
            this.siteDetails(site_unid)
        } else if (this.props.healthCheckInSiteAccess) {
            console.log("site details data in health check", this.props.siteDetailsData)
            this.siteDetailsForHC()
        }
        else if(this.props.SiteTools){
            this.siteDetails(this.props.siteDetailsData.site_unid)
        }
    }

    async hcReq(loginId, hc, unid,nodes) {
        this.setState({ errors: false, errorHMessage: "" })
        await this.props.createHealthCheckReq(loginId, hc, unid).then(async res => {
            if (res && res.type == "CREATE_HEALTHCHECK_SUCCESS" && res.reqhealthcheck && res.reqhealthcheck.enodeb_healthcheck) {
                let hcType = this.state.healthCheckType == 'FHC' ? 'Full' : this.state.healthCheckType == 'THC' ? 'Targeted' : 'Post Check';
                let targetedOptions = this.state.healthCheckType == "THC" ? this.state.targetedHCOptions.filter(item => item.isChecked).map(item => item.value): ""
                    targetedOptions = Array.isArray(targetedOptions) && targetedOptions.length ? targetedOptions.join(',') : "";
                logActioninDB(loginId, this.props.user && this.props.user.email, hc.vendor_id, hc.workorderid, this.props.user && this.props.user.vendor_area, this.props.user && this.props.user.vendor_region, "Request Health Check","Health Check", `${hcType} ${hcType =="Targeted" ? `- ${targetedOptions}` : ''}`, this.props.lock_unlock_request_id || "");

                if (res.reqhealthcheck.errors && res.reqhealthcheck.errors.length > 0) {
                    this.setState({ errors: true, errorHMessage: res.reqhealthcheck.errors[0].detail })
                }
                if (this.state.healthCheckType == "PostHC") {
                    let text = this.props.healthCheckInSiteAccess && this.props.oswStatus.toUpperCase() == "AUTO" ? `VP: Post Check HC started from VP-AUTO, request ID: ${res.reqhealthcheck.HLTH_REQUEST_ID}` : `VP: Post Check HC started, request ID: ${res.reqhealthcheck.HLTH_REQUEST_ID}`
                    text = `${text}  GC Comments:${this.state.commentValue}`
                    this.props.submitSLRNotes(text)
                }
                let hcDetailsWithNodeType = this.addNodeTypeData(res.reqhealthcheck.enodeb_healthcheck)
                if(this.state.isEricsson){
                    await this.props.getSpecHistory(unid);
                }
                this.setState({ healthCheckReqs: hcDetailsWithNodeType && hcDetailsWithNodeType.length > 0 ? hcDetailsWithNodeType : res.reqhealthcheck.enodeb_healthcheck }, () => {
                    this.checkRequestDisable(res.reqhealthcheck.enodeb_healthcheck);
                    this.setState({ inProgress: false })
                })
                if (this.props.healthCheck && res.reqhealthcheck.HLTH_REQUEST_ID && res.reqhealthcheck.HLTH_REQUEST_ID.length === 1 ) {
                    this.setState({ inProgress: false, dispMessage: true, successMesssage: "Health Check is running. Wait up to 15 minutes to receive it in an email." })
                    setTimeout(() => {
                        this.setState({ dispMessage: false, inProgress: true })
                    }, 10000)
                }
                if (this.props.stay_as_auto == "Y") {
                    this.props.updateStayAutoFlag(this.props.lock_unlock_request_id).then(response =>{
                          if(response?.data?.data?.updateStayAutoFlag) {
                            this.props.notifref.addNotification({
                              title: 'Success',
                              position: "br",
                              level: "success",
                              autoDismiss: 10,
                              message: response?.data?.data?.updateStayAutoFlag?.message
                            })
                          }
                  
                          if(response?.errors?.length > 0) {
                            this.props.notifref.addNotification({
                              title: 'Failure',
                              position: "br",
                              level: "error",
                              autoDismiss: 10,
                              message: "StayAuto Update Failed"
                            })
                          }
                      })
                }
            }
            if (res.type == "CREATE_HEALTHCHECK_FAILURE") {
                this.setState({ errors: true, errorHMessage: res.errors && res.errors[0].message })
                if (this.state.healthCheckType == "PostHC") {
                    let text = `VP: AUTO to NEW: Health check trigger failed, Issues found in health check PLEASE REVIEW.`;
                    this.props.submitSLRNotes(text)
                }
            }
            let targetHCSelectedOptions = this.state.targetedHCOptions.map(item => {
                return {
                    ...item,
                    isChecked: false
                }
            })
            this.setState({ eNodeBOptionsSelected: [], healthCheckType: "", targetedHCOptions: targetHCSelectedOptions })
            if(this.state.isReplaceAntenna?.toUpperCase() == "YES"){
                this.isReplacingRETAntennaRadio()
            }
            this.enableBtn();
        })
    }

    renderActionsColumn = (params) => {
        const  data = params.row
        if (['COMPLETED','FAILED','COMPLETED WITH ERRORS'].includes(data.status.toUpperCase())) {//failed,completed with errors
            return <div>
                <a onClick={() => this.onClickView(data)}> <i className="fa fa-eye" title="View Health Check" style={{ "color": "rgb(255, 167, 38)" , "fontSize": "18px", "cursor": "pointer", marginRight: "10px", pointerEvents: "all"  }}></i></a>
                <a onClick={() => this.onClickDownload(data)}><i className="fa fa-download" title="Download Health Check" style={{ "color": "rgb(255, 167, 38)" , "fontSize": "18px", "cursor": "pointer", pointerEvents: "all" }}></i></a>
            </div>
        }
        return <div>
            <a> <i className="fa fa-eye" title="View Health Check" style={{ "color": data.status === "Completed" ? "rgb(255, 167, 38)" : "rgb(128, 128, 128)", "fontSize": "18px", "cursor": "pointer", marginRight: "10px", pointerEvents: data.status === "Completed" ? "all" : "none" }}></i></a>
            <a><i className="fa fa-download" title="Download Health Check" style={{ "color": data.status === "Completed" ? "rgb(255, 167, 38)" : "rgb(128, 128, 128)", "fontSize": "18px", "cursor": "pointer", pointerEvents: data.status === "Completed" ? "all" : "none" }}></i></a>
        </div>
    }

    onClickView(row) {
        this.setState({ isModalshown: true, data: [], requestId: '', requestType: '', timeStamp: '' })
        this.getHealthCheckDetails(row)
    }

    async onClickDownload(row) {
        if(row.req_type !== 'Spectrum Analyzer'){
            await this.props.downloadHcDetails(this.props.loginId, row.request_id).then((res) => {
                let a = document.createElement("a");
                const blob = new Blob([window.atob(res.result)], { type: 'application/html' })
                a.href = window.URL.createObjectURL(blob);
                a.download = `Health_Check_Report_${row.request_id}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a)
            })
        }
        else{
            await this.props.downloadSpectrumAnalysis(row.request_id)
            let a = document.createElement("a");
            const blob = new Blob([window.atob(this.props.spectrumDownload.toJS().data)], { type: 'application/txt' })
            a.href = window.URL.createObjectURL(blob);
            a.download = `EricssonSpectrum_${row.request_id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a)
        }
    }


    handleHealthCheckModal = () => this.setState({ isModalshown: false })
    componentWillUnmount() {
        clearInterval(this.timerHC);
        clearInterval(this.timerRefresHC);
        clearInterval(this.timer)

    }

    checkRequestDisable(healthChecks) {
        let filterdByTime = 0;
        let hcObject = healthChecks.filter(hc => ["in progress", "new"].includes(hc.status.toLowerCase()) && hc.req_type !== "Scheduled");
        if (hcObject && hcObject.length > 0) {
            filterdByTime = moment.utc(moment.utc().format('YYYY-MM-DD HH:mm')).diff(moment.utc(moment.utc(hcObject[0].created_on, 'YYYY-MM-DD HH:mm')), 'minutes')
            if (filterdByTime != null && filterdByTime != undefined && filterdByTime < 15) {
                this.disableBtn();
                if (hcObject[0].req_type !== 'Spectrum Analyzer') {
                    this.setState({ inProgress: true, inProgresError: `${hcObject[0].req_type} has been running for ${filterdByTime} minutes` })
                }
            }
            // Disable the sector lock unlock while Health check is running
            if (this.props.healthCheckInSiteAccess && this.props.oswStatus?.toUpperCase() == "AUTO") {
                this.props.disableSectorlockActions(true)
            }
        } else if (this.props.site && this.props.site.node_details && this.props.site.node_details.length == 0) {
            this.disableBtn();
            clearInterval(this.timerRefresHC);
            // Disable the sector lock unlock while Health check is running
            if (this.props.healthCheckInSiteAccess && this.props.oswStatus.toUpperCase() == "AUTO") {
                this.props.disableSectorlockActions(false)
            }
        } else {
            this.setState({ inProgress: false })
            this.enableBtn();
            clearInterval(this.timerRefresHC);
            // Disable the sector lock unlock while Health check is running
            if (this.props.healthCheckInSiteAccess && this.props.oswStatus.toUpperCase() == "AUTO") {
                this.props.disableSectorlockActions(false)
            }
        }
    }
    handleRequest = async () => {
        let { site, user, selectedRow, selectedWO, createSpectrumRequest } = this.props
        let { regions, targetedHCOptions, eNodeBOptionsSelected, healthCheckType, commentValue, sectorOptionsSelected } = this.state
        if(healthCheckType!=='SA'){
            let email_ids = [];
            let enodeb_ids = [];
            let enodeBData = site && site.node_details && site.node_details.length > 0 ? site.node_details : [];
            let cbandNodes = site && site.nss_site_id_9 ? site.nss_site_id_9 : '';
            let workorder_id = "";
            let work_request_type = "";
            if (selectedWO) {
                workorder_id = selectedWO.workORderInfo.toJS().workorder_id;
                work_request_type = selectedWO.workORderInfo.toJS().work_type;
            }
            if (selectedRow) {
                workorder_id = selectedRow.proj_number;
                const firstMatchingInitiative = selectedRow.project_initiative && selectedRow.project_initiative.split(',').find(i => ['CBAND', 'C-BAND', 'SNAP'].includes(i.trim()));
                work_request_type = firstMatchingInitiative ? `${firstMatchingInitiative.trim()} Project ` : 'Project';
            }
            cbandNodes = cbandNodes.length == 7 && cbandNodes.charAt(3) == '7' ? cbandNodes : ''
            enodeBData = regions.length > 0 && regions[0] === site.region ? enodeBData.filter(e => e.type === "4G") : enodeBData
            enodeb_ids = enodeBData.map(e => e.node);

            if (cbandNodes.length > 0 && !enodeb_ids.includes(cbandNodes)) {
                enodeb_ids.push(cbandNodes)
            }
            let command_list = "regular";
            let command_list_5g = "regular";
            email_ids.push(user.email);

            if (enodeBData.length > 0) {
                let enodeb_vendor = enodeBData.map(e => e.vendor);
                if (enodeb_vendor[0].toLowerCase() === "samsung" || enodeb_vendor[0].toLowerCase() === "ericsson") {
                    command_list = "fast_extended";
                }
            }
            let targetedHCSelectedOptions = targetedHCOptions.filter(item => item.isChecked)
            let node_detais = site && site.node_details && site.node_details.length > 0 ? site.node_details : [];
            let all4GAndCbandNodes = node_detais.filter(item => ["4G", "C-BAND", "CBRS", "5G", "5GMMW"].includes(item.type.toUpperCase()))
            let nodes = all4GAndCbandNodes.length > 0 ? all4GAndCbandNodes.map(item => item.node) : []
            let enodeb_healthcheck = {
                "enodeb_ids": healthCheckType == "PostHC" ? nodes : eNodeBOptionsSelected.map(item => item.value),
                "req_type": healthCheckType == "THC" || healthCheckType == "FHC" ? "On-Demand" : healthCheckType == "PreHC" ? "Pre-Check" : "Post-Check",
                "email_ids": email_ids,
                "comments": commentValue,
                "command_list": command_list,
                "command_list_5g": command_list_5g,
                "created_by": this.props.loginId,
                "workorderid": workorder_id,
                "site_name": site.sitename,
                "work_request_type": work_request_type,
                "user_id": this.props.loginId,
                "user_name": user.fname + ' ' + user.lname,
                "vendor_id": user.vendor_id,
                "vendor_company": user.vendor_name,
                "created_by_name": user.fname + ' ' + user.lname,
                "last_updated_by": user.fname + ' ' + user.lname,
                "is_targeted": healthCheckType == "THC" ? true : false,
                "targeted_option": healthCheckType == "THC" && targetedHCSelectedOptions && targetedHCSelectedOptions.length > 0 ? targetedHCSelectedOptions.map(item => item.value) : [],
                "sector_lock_unlock_req_id": this.props.lock_unlock_request_id,
            "replace_antenna_work": this.props.isErricson && healthCheckType == "PostHC" && this.props?.isReplacingRETAntennaRadio?.toUpperCase() == 'NOT SURE' ?  (this.state.isReplaceAntenna ? this.state.isReplaceAntenna : null):this.props?.isReplacingRETAntennaRadio,
            }
            await this.disableBtn();
            this.hcReq(this.props.loginId, enodeb_healthcheck, this.props.site.site_unid,nodes);
        }
    else{
            let payload = {
                "request": {
                    "site_unid": this.props.site.site_unid,
                    "node_list": sectorOptionsSelected.map(i => i.value),
                    "email_list": [user.email],
                    "notes": this.state.specComments,
                    "createdBy": user.fname + ' ' + user.lname,
                    "source": "VP",
                    "osw_id": this.props.lock_unlock_request_id ? this.props.lock_unlock_request_id : ''
                }
            }
            this.disableBtn();
        await createSpectrumRequest(payload).then(res=>{
            if(res?.type === 'CREATE_SPECTRUM_SUCCESS' && res.createSpectrumAnalyzer?.requestId){
                                logActioninDB(this.props.loginId, this.props.user && this.props.user.email, this.props.vendorId, hc.workorderid, this.props.user && this.props.user.vendor_area, this.props.user && this.props.user.vendor_region,"Request Spectrum Analyzer","Health Check","Spectrum Analyzer", this.props.lock_unlock_request_id);

                if(!this.props.hcFromStandAloneToolsTab && this.state.specComments.length > 0){

                        this.props.submitSLRNotes('Spectrum Analyzer started, GC Comments:' + this.state.specComments)
                    }
                    this.enableBtn();
                this.setState({ healthCheckType: "", sectorOptionsSelected : [], dispMessage: true, specComments:'', successMesssage: res.createSpectrumAnalyzer.result })
                    setTimeout(() => {
                    this.setState({ dispMessage: false, successMesssage : '' })
                    }, 10000)
                }
                if (res.type == "CREATE_SPECTRUM_FAILURE") {
                    this.enableBtn();
                    this.setState({ errors: true, errorHMessage: res.errors && res.errors[0].message })
                }
            });
            this.getHealthCheckReq(this.props.site.site_unid)

        }
        // this.setState({hcButtonDisable : false});
    }
    handleRefresh = () => this.getHealthCheckReq(this.props.site.site_unid);
    renderStatusLoading = () => {
        return (<Loader color="#cd040b"
            size="35px"
            margin="4px"
            className="text-center" />
        )
    }
    onChangeEnodeBValue = (event) => {
        if (event.length == 1) {
            this.setState({ eNodeBOptionsSelected: event, selectedEnodBVendor: event[0].vendor })
        } else if (event.length == 0) {
            this.setState({ eNodeBOptionsSelected: event, selectedEnodBVendor: "" })
        } else {
            this.setState({ eNodeBOptionsSelected: event })
        }
        let { targetedHCOptions, healthCheckType } = this.state;
        if (healthCheckType === "THC" && event.length > 0) {
            let showTargetteError = false;
            event.map(item => {
                if(item?.targeted_commands?.length) {
                    targetedHCOptions = item.targeted_commands.map(targetted => {
                        let obj = { label: targetted, value: targetted, isChecked: false }
                        return obj;
                    })
                } else {
                    showTargetteError = true
                }
            })
            this.setState({ targetedHCOptions: targetedHCOptions, showTargetteError })
        }
    }
    onChangeSectorValue = (event) => {
        this.setState({ sectorOptionsSelected: event })
    }

    handleEqipmentValueHealthCheck = (value) => {
        let modifiedCheckList = this.state.checkListHC.map(item => {
            if (item.value === value) {
                return { ...item, checked: !item.checked }
            } else return item
        })
        this.setState({ checkListHC: modifiedCheckList })
    }

    handleHCChange = (event) => {

        this.setState({ healthCheckType: event.target.value })
        let { eNodeBOptionsSelected, targetedHCOptions } = this.state;
        if (event.target.value === "THC" && eNodeBOptionsSelected.length > 0) {
            let showTargetteError = false;
            eNodeBOptionsSelected.map(item => {
                if(item?.targeted_commands?.length) {
                    targetedHCOptions = item.targeted_commands.map(targetted => {
                        let obj = { label: targetted, value: targetted, isChecked: false }
                        return obj;
                    })
                } else {
                    showTargetteError = true
                }
            })
            this.setState({ targetedHCOptions: targetedHCOptions, showTargetteError })
        }
        if(event.target.value !== 'SA'){
            this.setState({ sectorOptionsSelected: [] })
        }
        else{
            this.setState({  eNodeBOptionsSelected : []})
        }
    }
    handleTHCOptionsChange = (event) => {
        let { targetedHCOptions } = this.state;
        targetedHCOptions = targetedHCOptions.length > 0 && targetedHCOptions.map(item => {
            if (event.target.value == item.value, event.target.name == item.label) {
                item.isChecked = event.target.checked
            }
            return item;
        })
        this.setState({ targetedHCOptions: targetedHCOptions })
    }

    isReplacingRETAntennaRadio = async () => {
        let list = [];
        this.state.checkListHC.filter(item => {
            if (item.checked) { list.push(item.value) }
        })
        let text = `${list.toString()} have been swapped. Please review to update accordingly.`
        await this.props.updateSLRStatus("NEW", text, "HW Replacement")
    }

    disableEnableReqCommentBox = () => {
        let { eNodeBOptionsSelected, healthCheckType, targetedHCOptions } = this.state;
        if (this.props.isRequested) {
            return true;
        } else if (eNodeBOptionsSelected.length > 0 && healthCheckType == "THC") {
            if (targetedHCOptions.find(item => item.isChecked)) {
                return true;
            } else {
                return true;
            }
        } else if (eNodeBOptionsSelected.length > 0 && healthCheckType == "FHC") {
            return true;
        } else if (healthCheckType == "PostHC") {
            return false
        }
        else {
            return true
        }
    }
    checkLatestSpectrumResult = () => {
        const { specHistory } = this.props;
        if (specHistory?.length > 0) {
            const latestSpectrum = specHistory[0];
            const status = latestSpectrum?.status?.toLowerCase() || '';
            
            if (['in progress', 'pending', 'new'].includes(status)) {
                const currentTime = moment.utc();
                const triggeredTime = moment.utc(latestSpectrum?.created_on);
                const timeDifferenceInHours = currentTime.diff(triggeredTime, 'hours');
                return timeDifferenceInHours < 1;
            }
        }
        return false;
    }
    disableEnableReqHCButton = () => {
        let { eNodeBOptionsSelected, healthCheckType, targetedHCOptions, sectorOptionsSelected } = this.state;
        let latestSpectrumResult = this.checkLatestSpectrumResult()
        if(this.props.oswStatus?.toUpperCase() == 'HAND OFF'){
            return true;
        }
        if (this.props.isRequested) {
            return true;
        }
        else if (eNodeBOptionsSelected.length > 0 && healthCheckType == "THC") {
            if (targetedHCOptions.find(item => item.isChecked) && !this.state.showTargetteError) {
                return false;
            } else {
                return true;
            }
        } else if (healthCheckType == "PostHC" && this.state.PcCommentIsValid) {
            return false;
        } else if (eNodeBOptionsSelected.length > 0 && healthCheckType == "FHC") {
            return false;

        } else if (sectorOptionsSelected.length > 0 && healthCheckType == "SA" && this.props.specCommentsReq === 'Y' && this.state.specComments.length>0 && !latestSpectrumResult ) {
            return false;
        } else if (sectorOptionsSelected.length > 0 && healthCheckType == "SA" && this.props.specCommentsReq === 'N' && !latestSpectrumResult ) {
            return false;
        } else {
            return true;
        }
    }
    handleComments = (e) => {
        const value = e.target.value,
              isValid = value.replace(/[^a-zA-Z0-9]/g, "").length >= 7;
        this.setState({ commentValue: value, PcCommentIsValid: isValid })
    }
    handleSpecComments = (e) => {
        this.setState({ specComments: e.target.value })
    }

    handleWorkTaskNotes = (e) => {
        if (e.target.value.length >= 1) {
            this.setState({ workTaskNotes: e.target.value })
        }
    }

    handleFaultCode = (state) => {
        this.setState({ selectedFaultCode: state.value });
    }

    handleResolutionCode = (state) => {
        this.setState({ selectedResolutionCode: state.value });
    }
    secondsToTime(secs) {
        let hours = Math.floor(secs / (60 * 60));
        let divisor_for_minutes = secs % (60 * 60);
        let minutes = Math.floor(divisor_for_minutes / 60);
        let divisor_for_seconds = divisor_for_minutes % 60;
        let seconds = Math.ceil(divisor_for_seconds);
        let obj = {
          "h": hours,
          "m": minutes,
          "s": seconds
        };
        return obj;
      }
    
      countDown() {
        // Remove one second, set state so a re-render happens
        let seconds = this.state.seconds - 1;
        if (seconds >= 0) {
          const time = this.secondsToTime(seconds)
          let postWaittime = Number(this.props.postWaittime) || 15
          if(time.m >= postWaittime){
            this.setState({
              seconds: 0,
              sectorLocked: false,
              sectorUnlocked: false,
              disablePostHealthCheck: false,
            })
            clearInterval(this.timer);
          }else{
            this.setState({
              time: time,
              seconds: seconds,
            });
          }
          
          // Check if we're at zero.
          if (seconds == 0) {
            clearInterval(this.timer);
            this.setState({
              disablePostHealthCheck: false,
              sectorUnlocked: false,
              disableHCFor2Min: false,
              sectorUnlock2Min: false,
            })
          }
        }
      }
      startCountDownTimer() {
        if (this.timer == 0 && this.state.seconds > 0) {
          this.timer = setInterval(this.countDown, 1000);
        }
    }
    disablePostHealthCheck = () => {
        let woid=''
        if (this.props.selectedWO) {
            woid = this.props.selectedWO.workORderInfo.toJS().workorder_id;
        }
        if (this.props.selectedRow) {
            woid = this.props.selectedRow.proj_number;
        }
        if(this.props.healthCheckInSiteAccess){
            this.calculateTimeDiff(this.props.lockData)
        }
        else{
        this.props.fetchLockData(this.props.loginId, this.props.vendorId, woid, this.state.lock_unlock_request_id)
            .then(async action => {
                if (action.type == "FETCH_LOCKDATA_SUCCESS") {
                    let lockData = action.lockReqData;
                    this.calculateTimeDiff(lockData)
                }
            })
        }
    }
    calculateTimeDiff = (lockData) => {
        let diff = 0;
        if (!!lockData && !!lockData.lockRequest && !!lockData.lockRequest.sectorlockdata && lockData.lockRequest.sectorlockdata.length > 0) {
            let sectorLockedObj = Object.keys(lockData.lockRequest).length > 0 && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata.find(item => item.SECTOR_LOCK_UNLOCK_REQ_ID == this.state.lock_unlock_request_id && item.ACTION.toUpperCase() == "LOCK" && item.ACTION_STATUS.toUpperCase() == "COMPLETED") : {}
            if (sectorLockedObj && Object.keys(sectorLockedObj).length > 0) {
                this.setState({ sectorLocked: true, sectorUnlocked: false, disablePostHealthCheck: true, disableHCFor2Min: true, sectorUnlock2Min: false })
            }
            let sectorUnLockInProgressObj = Object.keys(lockData.lockRequest).length > 0 && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata.find(item => item.SECTOR_LOCK_UNLOCK_REQ_ID == this.state.lock_unlock_request_id && ["UNLOCK", "UN LOCK"].includes(item.ACTION.toUpperCase()) && ["IN PROGRESS", "INPROGRESS", "NEW"].includes(item.ACTION_STATUS.toUpperCase())) : {}
            if (sectorUnLockInProgressObj && Object.keys(sectorUnLockInProgressObj).length > 0) {
                this.setState({ disablePostHealthCheck: true, sectorUnlocked: false, disableHCFor2Min: true, sectorUnlock2Min: false })
            }
            let sectorUnLockedObj = Object.keys(lockData.lockRequest).length > 0 && lockData.lockRequest.sectorlockdata.length > 0 ? lockData.lockRequest.sectorlockdata.find(item => item.SECTOR_LOCK_UNLOCK_REQ_ID == this.state.lock_unlock_request_id && ["UNLOCK", "UN LOCK"].includes(item.ACTION.toUpperCase()) && item.ACTION_STATUS.toUpperCase() == "COMPLETED") : {}
            if (sectorUnLockedObj && Object.keys(sectorUnLockedObj).length > 0) {
                diff = moment.utc().diff(moment.utc(sectorUnLockedObj.LAST_UPDATED_DATE), 'minutes')
                let postWaittime = Number(this.props.postWaittime) || 15
                let pimWaittime = Number(this.props.pimWaittime) || 2
                if (diff < postWaittime) {
                    if (diff < pimWaittime) {
                        let diffTime = pimWaittime - diff
                        this.setState({ disableHCFor2Min: true, sectorUnlock2Min: true,sectorUnlocked: true, twoMinTimer: diffTime })
                    } else {
                        this.setState({ disableHCFor2Min: false, sectorUnlock2Min: false, sectorUnlocked: false})
                    }
                    if(this.props.healthCheckInSiteAccess){
                    this.setState({
                        seconds: (postWaittime - diff) * 60,
                        time : this.secondsToTime((postWaittime - diff) * 60),
                        sectorLocked: false,
                        sectorUnlocked: true,
                        disablePostHealthCheck: true,
                    }, this.startCountDownTimer())
                    }
                } else {
                    this.setState({
                        seconds: 0,
                        sectorLocked: false,
                        sectorUnlocked: false,
                        disablePostHealthCheck: false,
                        disableHCFor2Min: false,
                        sectorUnlock2Min: false,
                    })
                }
            }
        }
    }
    saveTaskType = () => {
        if(!this.props.SiteTools) {
            return     
        }
        const { user, site } = this.props;
        const isSpectrum = this.state.healthCheckType === 'SA';
        const selectedNodeIds = (this.state?.eNodeBOptionsSelected || []).map(e => e.value);
        const payload = {
        "type_name": isSpectrum ? "Spectrum Analyzer" : "HealthCheck",
        "external_team_support": "",
        "users": [
            {
                "assigned_to": `${startCase(user?.vendor_name || '')}-${(this.props?.loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
                "name": `${startCase(user?.fname || '')} ${startCase(user?.lname || '')}`.trim()
            }
        ],
        "start_date": moment().format('YYYY-MM-DD'),
        "sites": [
            {
                "site_unid": site?.site_unid,
                "switch_name": site?.switch,
                "switch_unid": "",
                "site_id": site?.siteid,
                "site_name": site?.sitename,
                "assigned_to": `${startCase(user?.vendor_name || '')}-${(this.props?.loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`
            }
        ],
        "market_code": null,
        "create_date": moment().format('YYYY-MM-DD'),
        "email_address": null,
        "include_healthcheck": isSpectrum ? "0" : "1",
        "include_sites": "1",
        "due_date": moment().format('YYYY-MM-DD'),
        "market": user?.vendor_area,
        "submarket": user?.vendor_region,
        "description": isSpectrum
            ? `Vendor Portal Inquiry - Spectrum Analyzer`
: `Vendor Portal Inquiry - HealthCheck`,
        "command_list_5g": "",
        "user_id": `${startCase(user?.vendor_name || '')}-${(this.props?.loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
        "switches": [],
        "bucket_truck": "0",
        "drone": "0",
        "ladder": "0",
        "fuel_truck": "0",
        "gc_email": "",
        "created_by": `${startCase(user?.vendor_name || '')}-${(this.props?.loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
        "notify": false,
        "fromsystem": "OPSPORTAL"
    };

    if (!isSpectrum) {
        payload.enodeb_healthcheck = {
            "enodeb_ids": selectedNodeIds,
            "req_type": this.state?.healthCheckType === 'PostHC'
                ? 'Post-Check'
                : (this.state?.healthCheckType === 'THC' || this.state?.healthCheckType === 'FHC')
                    ? 'On-Demand'
                    : 'Pre-Check',
            "email_ids": [user?.email].filter(Boolean),
            "precheck_start_time": "",
            "postcheck_start_time": "",
            "include_pre_check_time": "no",
            "include_post_check_time": "no",
            "command_list": "fast_extended",
            "command_list_5g": "",
            "notes": this.state?.commentValue || "",
            "attachments": [],
            "vendor": "",
            "source": "OPSPORTAL",
            "hc_type": this.state?.healthCheckType === 'THC' ? 'targeted' : 'full',
            "isTargeted": this.state?.healthCheckType === 'THC',
            "targeted_hc_options": (this.state?.targetedHCOptions || [])
                .filter(t => t.isChecked)
                .map(t => t.value)
        };
    }
        this.props.postTaskType({ payload });
    };
    render() {
        const { healthloading,specViewLoading, siteDetaisLoading, site, healthdataloading, errorsHealthCheck, user, specLoading } = this.props;
        let { eNodeBOptions, eNodeBOptionsSelected, healthCheckType, targetedHCOptions, sectorOptions, sectorOptionsSelected } = this.state;
        let uniqueVendors = eNodeBOptions.length > 0 && eNodeBOptions.map(item => item.vendor)
        let includeSelectAll = false
        if (uniqueVendors && uniq(uniqueVendors).length == 1) {
            includeSelectAll = true
        }
        var getRes = [...this.state.healthCheckReqs,...this.props.specHistory?.map(s =>{
            return {...s,
                node_id_type: s.node_list.toString(),
               hc_result:'',
                status_color: s.statusColor,
               created_on : moment(s.created_on).format('YYYY-MM-DD HH:mm:ss'),
               errors: []}
        })]
         getRes.sort(function(a,b){
            return new Date(b.created_on) - new Date(a.created_on);
        });

        let columns = [
            {
                headerName: "Requested By",
                field: "created_by",
                flex: 1
            },
            {
                headerName: "Requested On",
                field: "created_on",
                flex: 1,
                renderCell: (row) => {
                    return utcToLocal(row.row.created_on);
                }
            },
            {
                headerName: "Request Type",
                field: "req_type",
                flex: 1
            },
            {
                headerName: "eNodeB - Vendor - Type",
                field: "node_id_type",
                flex: 1
            },
            {
                headerName: "Request Status",
                field: "status",
                flex: 1,
                renderCell: (row) =>{
                    let color = row.row.errors.length > 0 ? "red" : row?.row?.status_color?.toUpperCase() == "YELLOW" ? "darkorange" : row?.row?.status_color
                            return <span style={{ color }}>  {row?.row?.status}</span> 
                }
            }, 
            {
                headerName: "HC Result",
                field: "hc_result",
                flex: 1,
                renderCell: (row) =>{
                     let color = row.row.hc_result ? row.row.hc_result.toUpperCase() === 'FAILED' ? "red" : "green" : "black"
                    return <span style={{ color }}>{row.row.hc_result}</span>
            },
            },
        ]
        columns.push({
            headerName: "Actions",
            renderCell: (row) => this.renderActionsColumn(row),
        })

        let oswClosureCodes = this.props.oswClosureCodes.toJS()
        return (<div className="healthCheck" style={{ background: "#FFF", paddingTop: "15px" }}>
            <div>
                {(healthdataloading || healthloading || siteDetaisLoading || specLoading || specViewLoading) && this.renderStatusLoading()}
                {this.state.showPostCheckPassSection &&
                    <div className='row' style={{ display: "grid", border: "1px solid gray", margin: "5px", padding: "5px" }}>
                        <label>Post Health check completed, Did you complete the On Site Work today? </label>
                        <div>
                            <button
                                style={{ width: "fit-content", 'padding': '0.5em 2.14em' }}
                                className="Button--primary"
                                onClick={() => this.setState({ showWorkTaskNotesSection: true })}>Yes</button>
                            <button
                                style={{ width: "fit-content", 'padding': '0.5em 2.14em', margin: "5px" }}
                                className="Button--primary"
                                onClick={() => {
                                    this.setState({ showPostCheckPassSection: false })
                                }}>No</button>
                            <button
                                style={{ width: "fit-content", 'padding': '0.5em 2.14em', margin: "5px" }}
                                className="Button--primary"
                                onClick={async () => {
                                    let text = `OSW needs FAST assistance from ${user.vendor_name}`
                                    await this.props.updateSLRStatus("NEW", text, "Vendor Assist")
                                    this.setState({ showPostCheckPassSection: false })
                                }}>Message FAST</button>
                        </div>
                        {this.state.showWorkTaskNotesSection &&
                            <div style={{ display: "contents", margin: "5px" }}>
                                <textarea
                                    style={{ margin: "5px", width: "100%" }}
                                    rows={2}
                                    placeholder="Enter work task notes here"
                                    onChange={this.handleWorkTaskNotes}
                                ></textarea>
                                {this.props.isWorkOrder &&
                                    <>
                                        <label className="Form-label" style={{ marginTop: "10px" }}>Select Fault Code</label>
                                        <Select
                                            name="FaultCodes"
                                            className="col-12 col-md-12 no-padding float-left"
                                            style={{ margin: '5px' }}
                                            onChange={(e) => this.handleFaultCode(e)}
                                            options={Object.keys(oswClosureCodes).map((code) => { return { label: code, value: code } })}
                                            required
                                        />
                                        <br />
                                        {this.state.selectedFaultCode &&
                                            <>
                                                <label className="Form-label" style={{ marginTop: "10px" }}>Select Resolution Code</label>
                                                <Select
                                                    name="ResolutionCodes"
                                                    className="col-12 col-md-12 no-padding float-left"
                                                    style={{ margin: '5px' }}
                                                    onChange={(e) => this.handleResolutionCode(e)}
                                                    options={oswClosureCodes[this.state.selectedFaultCode].map((code) => { return { label: code, value: code } })}
                                                    required
                                                />
                                                <br />
                                            </>
                                        }
                                    </>
                                }
                                <button
                                    style={{ width: "fit-content", 'padding': '0.5em 2.14em', marginTop : '15px' }}
                                    className="Button--primary"
                                    disabled={this.props.isWorkOrder ? this.state.workTaskNotes.length == 0 || this.state.selectedFaultCode.length == 0 || this.state.selectedResolutionCode.length == 0 ? true : false : this.state.workTaskNotes.length == 0 ? true : false}
                                    onClick={async () => {
                                        this.setState({ showPostCheckPassSection: false })
                                        let text = `OSW completed from ${user.vendor_name}, GC comments: ${this.state.workTaskNotes}`
                                        await this.props.updateSLRStatus("COMPLETED", text, null, this.state.selectedFaultCode, this.state.selectedResolutionCode)
                                    }}>Submit</button>
                            </div>}
                    </div>}
                <div className="row" style={{ display: "flex", alignItems: "end" }}>
                    {healthCheckType !== "SA" ?
                        <div className="col-6">
                            <div style={{ width: "80%", marginLeft: "15px" }}>
                                {(healthCheckType == "THC" || healthCheckType == "FHC") && eNodeBOptionsSelected.length === 0 && <div style={{ color: "red" }}>Please select eNodeB</div>}
                                <Picky
                                    className="healthCheckeNodeB"
                                    placeholder="Select eNodeB"
                                    numberDisplayed={eNodeBOptions.length}
                                    options={eNodeBOptions}
                                    labelKey="label"
                                    valueKey="value"
                                    multiple={true}
                                    title="label"
                                    includeSelectAll={includeSelectAll}
                                    includeFilter={true}
                                    value={eNodeBOptionsSelected}
                                    onChange={this.onChangeEnodeBValue}
                                    dropdownHeight={800}
                                    disabled={this.state.healthCheckType == "PostHC"}
                                    render={({
                                        isSelected,
                                        item,
                                        selectValue,
                                        labelKey,
                                        valueKey,
                                    }) => {
                                        let lableName = `${item[labelKey]} - ${item.vendor} - ${item.type}`
                                        let disableCheckbox = false
                                        if (this.state.selectedEnodBVendor.length > 0) {
                                            if (item.vendor !== this.state.selectedEnodBVendor) {
                                                disableCheckbox = true
                                            }
                                        }
                                        return (
                                            <li
                                                style={{ opacity: disableCheckbox ? 0.5 : 1, pointerEvents: disableCheckbox ? "none" : "all" }} // required
                                                className={isSelected ? 'selected' : ''} // required to indicate is selected
                                                key={item[valueKey]} // required
                                                onClick={() => selectValue(item)}>
                                                {/* required to select item */}
                                                <input type="checkbox" checked={isSelected} readOnly disabled={disableCheckbox} />
                                                <span>{lableName}</span>
                                            </li>
                                        );
                                    }}
                                />
                            </div>
                    </div>:
                        <div className="col-6">
                            <div style={{ width: "80%", marginLeft: "15px" }}>
                                {(healthCheckType == "SA") && sectorOptionsSelected.length === 0 && <div style={{ color: "red" }}>Please select sector</div>}
                                <Picky
                                    className="healthCheckeNodeB"
                                    placeholder="Select Sector Carriers"
                                    numberDisplayed={5}
                                    options={sectorOptions}
                                    labelKey="label"
                                    valueKey="value"
                                    multiple={true}
                                    title="label"
                                    includeSelectAll={includeSelectAll}
                                    includeFilter={true}
                                    value={sectorOptionsSelected}
                                    onChange={this.onChangeSectorValue}
                                    dropdownHeight={200}

                                />
                            </div>
                        </div>}
                    <div className="col-6"></div>
                    <div className="col-12" style={{ display: "flex", marginTop: "15px" }}>
                        <div className="col-6" style={{ display: "grid" }}>
                            <FormControl component="fieldset">
                                {this.props.hcFromStandAloneToolsTab ? <FormLabel component="legend" style={{ fontSize: '14px', fontWeight: 'bold' }}>Health Check Options (The health check could take up to 15 mins to complete)</FormLabel> : <FormLabel component="legend" style={{ fontSize: '14px', fontWeight: 'bold' }}>Health Check Options</FormLabel>}
                                <RadioGroup
                                    aria-label="healthCheck"
                                    name="healthCheck1"
                                    value={healthCheckType}
                                    onChange={this.handleHCChange}
                                    style={{ flexDirection: "initial" }}>
                                    <FormControlLabel value="FHC" control={<Radio color="primary" />} label="Full" />
                                    <FormControlLabel value="THC" control={<Radio color="primary" />} label="Targeted" />
                                    {this.state.isEricsson && <FormControlLabel value="SA" disabled={this.state.disableHCFor2Min} control={<Radio color="primary" />} label="Spectrum Analyzer" />}
                                    {this.props.healthCheckInSiteAccess && <FormControlLabel value="PostHC" disabled={this.state.disablePostHealthCheck} control={<Radio color="primary" />} label={<div>
                                        <span>Post  </span>
                                    </div>} />}

                                </RadioGroup>
                            </FormControl>
                            {!this.props.isSnap && this.props.oswStatus=='AUTO' && this.props?.isReplacingRETAntennaRadio?.toUpperCase() == 'NOT SURE' && healthCheckType=='PostHC' && this.props.isErricson && <div style={{ marginTop: '25px', marginLeft: '2px' }}>
                                <label>Did You Replace RET/Antenna/CBRS Today?</label>
                            <input type="radio" onChange={(e)=>this.setState({isReplaceAntenna: e.target.value})} value="Yes" name="replacingRET/Antenna/Radio" /> Yes
                            <input type="radio" onChange={(e)=>this.setState({isReplaceAntenna: e.target.value})} value="No" name="replacingRET/Antenna/Radio" /> No
                            {this.state.isReplaceAntenna =='Yes' && <>
                                    <FormLabel component="legend" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'black' }}>Which equipment did you Replace?</FormLabel>
                                    <FormControl component="fieldset">
                                        <FormGroup style={{ flexDirection: "initial" }}>
                                            {this.state.checkListHC && this.state.checkListHC.length >= 1 && this.state.checkListHC.map(item => {
                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Checkbox
                                                            checked={item.checked}
                                                            color="primary"
                                                            onChange={() => this.handleEqipmentValueHealthCheck(item.value)}
                                                            inputProps={{ 'aria-label': 'controlled' }}
                                                        /> <span>{item.value}</span></div>)
                                            })}
                                        </FormGroup>
                                    </FormControl>
                                </>}
                            </div>}
                        </div>
                        {
                            <div className="col-6" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <div style={{ display: "flex", justifyContent: "end" }}>
                                    <button className="btn-sm " disabled={this.disableEnableReqHCButton()} onClick={() => {this.saveTaskType();this.handleRequest();}}>{this.state.healthCheckType === 'SA' ? 'Request Spectrum Analysis': 'Request Health Check'}</button>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="col-12" style={{ display: "flex" }}>
                        {this.props.healthCheckInSiteAccess && this.state.sectorLocked && this.props.oswStatus.toUpperCase() == "AUTO" && <span style={{ color: "#FF6700", fontWeight: "bold", paddingLeft: "15px" }}>
                            {this.state.isEricsson ? 'Note: Post check, Spectrum Analyzer and Targted HC with option of "PIM/NOISE" will be enabled after sector is unlocked at the site' : 'Note: Post check and Targted HC with option of "PIM/NOISE" will be enabled after sector is unlocked at the site'}
                        </span>}
                        {this.state.sectorUnlocked && <span style={{ color: "#FF6700", fontWeight: "bold", paddingLeft: "15px"  }}>Note:{this.state.sectorUnlock2Min ?`Targeted HC with option of "PIM/NOISE" ${this.state.isEricsson ? 'and Spectrum Analyzer' : ''} will be enabled in ${this.state.twoMinTimer} min.` : ''} {this.props.healthCheckInSiteAccess && ` Post-check will be enabled in ${this.state.time.m} : ${this.state.time.s} mins.`} </span>}
                    </div>
                    <div className="col-12" style={{ display: "flex" }}>
                        <div className="col-6" style={{ display: "flex", flexDirection: "column", justifyContent: "end" }}>
                               {this.disableEnableReqCommentBox() ? <div></div> : <div style={{ display: "flex", flexDirection: "column"}}><label htmlFor="comments">Add Comments post<span style={{ color: "red" }}>*</span><span style={{ fontWeight: "400" }}> Max. 499 characters allowed</span></label>
                                <textarea id="comments" maxLength={499} value={this.state.commentValue} onChange={this.handleComments} placeholder="Enter reason, Minimum 7 alphanumeric values"></textarea></div>}

                            {healthCheckType === "SA" && <div style={{ display: "flex", flexDirection: "column" }}><label htmlFor="comments">Add Comments {this.props.specCommentsReq === 'Y' && <span style={{ color: "red" }}>*</span>}<span style={{ fontWeight: "400" }}> Max. 499 characters allowed</span></label>
                                <textarea id="comments" maxLength={499} value={this.state.specComments} onChange={this.handleSpecComments} placeholder="Enter comments"></textarea></div>}
                        </div>
                    </div>
                </div>
                <div>
                    {healthCheckType == "THC" && eNodeBOptionsSelected.length > 0 &&
                        <div style={{ margin: "15px", padding: "10px", border: "2px solid gray" }}>
                            {this.state.showTargetteError && <div style={{ color: "red" }}>Targeted options are available for 4G nodes only</div>}
                            {targetedHCOptions.length > 0 && <div>Targeted Health Check Options</div>}
                            <FormControl component="fieldset">
                                <FormGroup
                                    style={{ flexDirection: "initial" }}>
                                    {targetedHCOptions.length > 0 &&
                                        targetedHCOptions.map(item => {
                                            return (
                                                <FormControlLabel
                                                    control={<Checkbox
                                                        checked={item.isChecked}
                                                        value={item.value}
                                                        onChange={this.handleTHCOptionsChange}
                                                        disabled={item.label == "PIM/NOISE" ? this.state.disableHCFor2Min : false}
                                                        name={item.label}
                                                        color="primary" />}
                                                    label={item.label}
                                                />
                                            )
                                        })}
                                </FormGroup>
                            </FormControl>
                        </div>}
                </div>
            </div>
            <div className="col-12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0px !important" }}>
                <div style={{ "padding": "0px !important" }}>
                    {this.props.healthCheckInSiteAccess ? <div className='text-primary'></div> : <div className='text-primary' style={{ display: "contents" }}>
                        <label style={{ fontSize: "13px", margin: "4px" }}> ATTENTION: If you are on site to work with FAST, please do not use this tab. Go to the "Site Access" tab to begin work today.  </label>
                    </div>}
                    {this.state.dispMessage ?
                        <div className='text-success'>
                            <label style={{ margin: "4px" }}>{this.state.successMesssage} </label>
                        </div> : null}
                    {this.state.errors ?
                        <div className='text-danger' style={{ display: "contents" }}>
                            <label style={{ margin: "4px" }}>{this.state.errorHMessage} </label>
                        </div> : null}
                    {this.state.errMessage ?
                        <div className='text-danger' style={{ display: "contents" }}>
                            <label style={{ margin: "4px" }}>{this.state.errorMessage}</label>
                        </div> : null}
                    {healthCheckType == "SA" && this.props.siteSectorsError?.errors?.length ?
                        <div className='text-danger' style={{ display: "contents" }}>
                            <label style={{ margin: "4px" }}>{this.props.siteSectorsError?.errors}</label>
                        </div> : null}
                    {this.state.isEricsson && this.props.siteHistoryError?.errors?.length ?
                        <div className='text-danger' style={{ display: "contents" }}>
                            <label style={{ margin: "4px" }}>{this.props.siteHistoryError?.errors}</label>
                        </div> : null}
                    {this.state.inProgress ?
                        <div className='text-warning' style={{ display: "contents" }}>
                            <label style={{ margin: "4px" }}>{this.state.inProgresError}</label>
                        </div> : null}
                </div>
                <div>
                    <a onClick={this.handleRefresh} className="pointer float-right" data-tip data-for="Refresh" style={{ margin: "10px", color: "black", textDecoration: "underline", fontSize: '14px', fontWeight: 'normal' }}>
                        <small>
                            <img src={RefreshPage} style={{ height: '20px' }} />
                        </small>
                        Refresh
                    </a>
                </div>
            </div>
            <div className="col-md-12" style={{ overflow: "hidden", marginBottom: "15px", minHeight : '200px', height: '300px'  }} >
                 <DataGrid 
                        columns={columns}
                        rows={getRes}
                        getRowId={(row) => row.request_id}
                        rowHeight={35}
                        columnHeaderHeight={35}
                        initialState={{
                            pagination: {
                              paginationModel: { page: 0, pageSize: 5}
                            },
                          }}
                        pageSizeOptions={[10, 15, 20]}
                        sx={{ 
                            '& .MuiTablePagination-toolbar > *': {fontSize: '1rem'},
                            '& .MuiTablePagination-toolbar': {alignItems: 'flex-end'},
                            '& .MuiTablePagination-input': {marginBottom: '7px'},
                            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                            fontSize:'13px',
                            minheight:'100px'  
                            }}
                        disableRowSelectionOnClick
                    />
            </div>
            {this.state.isModalshown ?
                <ViewHealthCheck
                    requestId={this.state.requestId}
                    requestType={this.state.requestType}
                    hcData={this.state.data || []}
                    specData={this.props.spectrumResult.toJS() || []}
                    timeStamp={utcToLocal(this.state.timeStamp)}
                    summary={this.state.summary}
                    close={() => this.setState({ isModalshown: false })}
                /> : null
            }
        </div>
        )
    }
}

function stateToProps(state, props) {
    let unid = props.selectedRow ? props.selectedRow.site_unid : props.selectedWO ? props.workORderInfo.get('site_unid') : ""
    let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
    let user = state.getIn(["Users", "entities", "users", loginId], Map()).toJS()
    let vendorId = user.vendor_id
    let getHealthCheckReqs = state.getIn(["Sites", loginId, "healthCheckReqs"], List())
    let siteDetailInfo = state.getIn(["Sites", loginId, "site", "siteDetails", unid], List())
    let siteDetailsData = state.getIn(["Sites", loginId, "site", "siteDetails"], List()).toJS()
    unid = unid === '' ? siteDetailsData.site_unid : unid
    let siteSectors = state.getIn(["Sites", unid, "siteSectors","nodes"], List()).toJS()
    let siteSectorsError = state.getIn(["Sites", unid, "siteSectors", "errors"],Map()).toJS()
    let sectorsLoading = state.getIn(["Sites", unid, "siteSectors","sectorsLoading"],false)

    let siteHistoryError = state.getIn(["Sites", unid, "specHistory", "errors"],Map()).toJS()
    let specHistory = state.getIn(["Sites", unid, "specHistory","spectrum_requests"], List()).toJS()
    let specLoading = state.getIn(["Sites", unid, "specHistory","specLoading"], false)

    let specCreateLoading = state.getIn(["Sites", "specHistory","specCreateLoading"], false)
    let configData = state.getIn(['Users', 'configData', 'configData'], List())
    let specCommentsReq = configData && configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "SPECAN_COMMENTS_REQUIRED")?.ATTRIBUTE_VALUE || 'N'
    let { lock_unlock_request_id = '' } = props
    const vendorWorkOrderSelectedRowObj = state.getIn(["VendorDashboard", loginId, "workOrders", "selectedRow"], Map())
    const capitalProjectSelectedRowObj =state.getIn(["CapitalProjectDashboard", "getSNAPProjects", "selectedRow"], Map())    
    let woid = props.isSnap ? capitalProjectSelectedRowObj?.proj_number : vendorWorkOrderSelectedRowObj?.workorder_id
    if (props.selectedWO) {
        woid = props.selectedWO.workORderInfo.toJS().workorder_id;
    }
    if (props.selectedRow) {
        woid = props.selectedRow.proj_number;
    }
    let lockData = state.getIn(["Sites", loginId, vendorId, woid, lock_unlock_request_id, "lockReqData"], Map())
    let stay_as_auto =""
    let oswCreatedTime = null
    if (lockData && lockData.size > 0) {
        lockData = lockData.toJS()
        if (lockData && lockData.lockRequest) {
             stay_as_auto =lockData?.lockRequest?.request_detail?.stay_as_auto
             oswCreatedTime = lockData?.lockRequest?.request_detail?.created_on
        }}
        let pimWaittime = configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "PIM_THC_WAITTIME")?.ATTRIBUTE_VALUE || 0;
        let postWaittime = configData.toJS().configData.find(e => e.ATTRIBUTE_NAME === "POST_HC_WAITTIME")?.ATTRIBUTE_VALUE || 0;
        
    return {
        site: state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List()).toJS(),
        siteDetaisLoading: state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false),
        healthCheck: state.getIn(["Sites", loginId, "healthCheck"], List()),
        isRequested: state.getIn(["Sites", "isRequested"], false),
        healthCheckDetails: state.getIn(["Sites", loginId, "siteDetails", "healthDetails"], List()),
        spectrumResult: state.getIn(["Sites", "siteSectors", "spectrum_result"], List()),
        spectrumDownload: state.getIn(["Sites", "siteSectors", "download"], Map()),
        specViewLoading: state.getIn(["Sites", "siteDetails", "specViewLoading"], false),
        healthloading: state.getIn(["Sites", loginId, "siteDetails", "healthDetailsLoading"], false),
        healthdataloading: state.getIn(["Sites", loginId, "siteDetails", "healthDataLoading"], false),
        errorsHealthCheck: state.getIn(["Sites", loginId, "siteDetails", "errors"], List()),
        config: state.getIn(['Users', 'configData', 'configData'], List()),
        submarket: state.getIn(["Users", "entities", "users", loginId, "vendor_region"], ""),
        hcDownload: state.getIn(["Sites", "HcDownloads"], Map()),
        oswClosureCodes: state.getIn(['Users', 'configData', 'oswClosureCodes'], List()),
        loginId,
        vendorId,
        siteDetailInfo,
        getHealthCheckReqs,
        user,
        siteDetailsData,siteSectors,sectorsLoading,specHistory,specLoading,
        specCreateLoading,
        specCommentsReq,
        siteSectorsError,
        siteHistoryError,
        stay_as_auto, oswCreatedTime,
        postWaittime,
        pimWaittime,
        woid
    }
}
export default connect(stateToProps, { fetchSiteDetails, downloadHcDetails, createHealthCheckReq,fetchSectorLockData,fetchLockData, fetchHealthCheckDetails, fetchHealthCheckReqs, healthCheckDisable, healthCheckEnable, getSectorCarriers, getSpecHistory, createSpectrumRequest, viewSpectrumAnalysis,downloadSpectrumAnalysis, ...VendorActions, postTaskType })(HealthCheck)
