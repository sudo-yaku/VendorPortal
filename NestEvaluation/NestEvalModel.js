import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { List, Map } from "immutable";
import { fetchNestDetails, fetchAttachmentContent } from "../PreventiveMaintenance/actions.js";
import * as formActions from "../Forms/actions.js";
import * as VendorActions from "../PreventiveMaintenance/actions.js";
import * as pmActions from "../PreventiveMaintenance/actions.js";
import { fetchSiteDetails } from "../sites/actions.js";
import { Step, Stepper, StepLabel, StepContent, AccordionDetails, Accordion, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Loader from '../Layout/components/Loader.js';
import '../../node_modules/react-datetime/css/react-datetime.css';
import { dataURItoBlob, startDownload } from '../VendorDashboard/utils.js';
import Questionnaire from "./Questionnaire.js";
import SiteData from "./SiteData.js";

const NestEvalModel = (props) => {
    const dispatch = useDispatch();

    // Selectors for Redux state
    const loginId = useSelector(state => state.getIn(['Users', 'currentUser', 'loginId'], ''));
    const user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], Map()));
    const vendorId = user && user.toJS().vendor_id;
    const submarket = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "vendor_region"], ""));
    const realLoginId = useSelector(state => state.getIn(['Users', 'realUser', 'loginId']));
    const realUser = useSelector(state => state.getIn(['Users', 'entities', 'users', realLoginId], Map()));
    const ssoUrl = realUser ? realUser.get('ssoLogoutURL') : '';
    const isssouser = realUser ? realUser.get('isssouser') : '';
    const siteDetaisLoading = useSelector(state => state.getIn(["VendorDashboard", loginId, "site", "siteDetaisLoading"], false));

    // Local state
    const [nestDetails, setNestDetails] = useState({});
    const [attachmentsList, setAttachmentsList] = useState([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [downloadingAttchment, setDownloadingAttachment] = useState(false);

    const {  workORderInfo, selectedRow } = props;

    useEffect(() => {
        initializeForm();
        // eslint-disable-next-line
    }, []);

    const initializeForm = async () => {
        setPageLoading(true);
        await dispatch(fetchNestDetails(vendorId, loginId, selectedRow.bna_metauniversal_id)).then(async (action) => {
            if (action.type === "FETCH_NESTDETAILS_SUCCESS") {
                setNestDetails(action.nestDetails);
                setStatus(action.nestDetails.status);
                setAttachmentsList(action.nestDetails.files);
            }
        });
        setPageLoading(false);
    };

    const downloadAttachments = (file) => {
        setDownloadingAttachment(true)
        let fileName = file.file_name, unid = file.id ? file.id : '';

        dispatch(fetchAttachmentContent(loginId, unid)).then((action) => {
            if (action.type === "FETCH_ATTACHMENTCONTENT_SUCCESS") {
                let img = action?.attachmentsList?.data?.find(e => e.BNA_ATTACHMENTS_ID === unid);
                let blob = null;
                let ext = fileName.lastIndexOf('.');
                let extension = fileName.substring(ext + 1);
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
                    blob = dataURItoBlob(`data:image/png;base64,` + img.FILE_CONTENT);
                } else {
                    blob = dataURItoBlob(`data:application/${extension};base64,` + img.FILE_CONTENT);
                }
                startDownload(blob, `${fileName}`);
                setDownloadingAttachment(false)
            } else {
                setDownloadingAttachment(false)
            }
        }).catch(err => {
            setDownloadingAttachment(false)
        });
    };

    const renderLoading = () => {
        return <Loader color="#cd040b" size="50px" margin="4px" className="text-center" />;
    };

    const onStatusChange = (status) => {
        setStatus(status);
    };

    let offShore = false;
    if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
        offShore = realUser.toJS().isUserOffShore;
    }

    return (
        <div>
            {pageLoading ? renderLoading() :
                <div>
                    <div style={{ margin: 'auto', width: '100%' }} className="container-fluid">
                        <table className="table sortable" style={{ minHeight: "100px", maxHeight: "100px", background: "#FFF", border: "none" }}>
                            <tbody className="vzwtable text-left">
                                <tr>
                                    <td className="Form-group no-border"><div>
                                        <div><b className="fontLarge">Site Name:</b></div>
                                        <div style={{ color: "#B6B6B6" }}><b className="fontLarge">
                                            {selectedRow ? selectedRow.site_name : ''}</b></div>
                                    </div></td>
                                    <td className="Form-group no-border"><div>
                                        <div><b className="fontLarge">Site ID:</b></div>
                                        <div style={{ color: "#B6B6B6" }}><b className="fontLarge"> {selectedRow ? selectedRow.site_id : ''}</b></div>
                                    </div></td>
                                    <td className="Form-group no-border"><div>
                                        <div><b className="fontLarge">Site Address:</b></div>
                                        <div style={{ color: "#B6B6B6" }}><b className="fontLarge">{nestDetails.address + ', ' + nestDetails.city + ', ' + nestDetails.state + ' ' + nestDetails.zip}</b></div>
                                    </div></td>
                                    <td className="Form-group no-border"><div>
                                        <div><b className="fontLarge">Status:</b></div>
                                        <div style={{ color: "#B6B6B6" }}><b className="fontLarge">{status ? status : ''}</b></div>
                                    </div></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Site Details card component */}
                    <div className="row">
                        <div style={{ margin: 'auto', width: '100%' }}>
                            <Accordion
                                style={{ margin: 'auto', width: '96%', boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold" }}
                                TransitionProps={{ unmountOnExit: true }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    Show Site Data
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="col-md-12 col-md-offset-3" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                                        <div className="col-lg-12" style={{ float: 'left' }}>
                                            <SiteData notifref={props.notifref} isWorkInProgress={true} getQuotes={false} workORderInfo={workORderInfo} selectedRow={selectedRow} />
                                        </div>
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                            <br />
                        </div>
                        <br /><br />

                        {/* Stepper component */}
                        <div className="col-sm col-6" style={{ float: 'left' }}>
                            <Questionnaire
                                refreshDashboard={props.refreshDashboard}
                                nestDetails={nestDetails}
                                isLoading={props.isLoading}
                                loginId={loginId}
                                vendorId={vendorId}
                                updateQuestionnaireAttachments={props.updateQuestionnaireAttachments}
                                fetchNestDetails={props.fetchNestDetails}
                                initNestDashBoard={props.initNestDashBoard}
                                notifref={props.notifref}
                                selectedRow={selectedRow}
                                validatePONum={props.validatePONum}
                                attachmentsList={attachmentsList}
                                handleHideModal={props.handleHideModal}
                                downloadAttachments={downloadAttachments}
                                renderLoading={renderLoading}
                                onStatusChange={onStatusChange}
                                downloadingAttchment={downloadingAttchment}
                            />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default NestEvalModel;

NestEvalModel.propTypes = {
    fetchNestDetails: PropTypes.func.isRequired,
    updateQuestionnaireAttachments: PropTypes.func.isRequired,
    initNestDashBoard: PropTypes.func.isRequired,
    validatePONum: PropTypes.func.isRequired,
    refreshDashboard: PropTypes.func.isRequired,
    handleHideModal: PropTypes.func.isRequired,
    notifref: PropTypes.object.isRequired,
    workORderInfo: PropTypes.object.isRequired,
    selectedRow: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired
    };