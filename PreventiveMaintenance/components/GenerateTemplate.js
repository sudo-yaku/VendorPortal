import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from "react-redux";
import * as pmActions from "../actions";
import { Map, List } from 'immutable';
import moment from 'moment';
import { dataURItoBlob, startDownload } from '../../VendorDashboard/utils';
import Loader from '../../Layout/components/Loader';
import { DataGrid } from "@mui/x-data-grid";

const GenerateTemplate = (props) => {
    const dispatch = useDispatch();

    // Redux selectors
    const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
    const user = useSelector(state => state.getIn(['Users', 'entities', 'users', loginId], Map()));
    const vendorId = user && user.toJS().vendor_id;
    const submarket = useSelector(state => state.getIn(["Users", "entities", "users", loginId, "vendor_region"], ""));
    const config = useSelector(state => state.getIn(['Users', 'configData', 'configData'], List()));
    const esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;

    // pmListDetails is still expected as a prop
    const { pmListDetails, handleHideTemplateModel } = props;

    // Derived values from pmListDetails
    const selectedLists = useMemo(
        () => pmListDetails.filter(pl => !!pl.itemSelected),
        [pmListDetails]
    );
    const listIds = useMemo(
        () => selectedLists.map(sl => sl.PM_LIST_ID).join(','),
        [selectedLists]
    );
    const poNums = useMemo(
        () => selectedLists.map(sl => sl.PO_NUM).join(' ,'),
        [selectedLists]
    );

    // Redux selectors for PM data
    const gridDetailsLoading = useSelector(state => state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmGridDetailsLoading"], false));
    const pmGridDetails = useSelector(state => state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmGridDetails", 'getPmGridDetails', 'pmlistitems'], List())).toJS();
    const pmSystemRecordsLoading = useSelector(state => state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSystemRecordsLoading", listIds]));
    const pmSystemRecords = useSelector(state => state.getIn(['PmDashboard', loginId, vendorId, "pm", "pmSystemRecords", listIds], List())).toJS();
    const syncedSitesInfo = useSelector(state => state.getIn(['PmDashboard', loginId, vendorId, 'pm', "syncedSitesInfo", 'getSyncedSitesInfo', 'siteinfo'], List())).toJS();
    const syncedSitesLoading = useSelector(state => state.getIn(['PmDashboard', loginId, vendorId, "pm", "syncedSitesInfoLoading"], false));

    // Local state
    const [cols, setCols] = useState([]);
    const [disableButton, setDisableButton] = useState(true);
    const [unidQuery, setUnidQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [pmGridDetailsState, setPmGridDetails] = useState([]);
    const [syncedSites, setSyncedSites] = useState([]);
    const [poNumsState, setPoNums] = useState('');
    const [listIdsState, setListIds] = useState('');

    // Fetch actions
    const fetchPmGridDetails = (vendorId, loginId, listIds) =>
        dispatch(pmActions.fetchPmGridDetails(vendorId, loginId, listIds));
    const fetchSyncedSitesInfo = (vendorId, loginId, submarket, managerId, pmtype) =>
        dispatch(pmActions.fetchSyncedSitesInfo(vendorId, loginId, submarket, managerId, pmtype));
    const fetchTemplateData = (vendorId, loginId, pmtype, listIds, postReq) =>
        dispatch(pmActions.fetchTemplateData(vendorId, loginId, pmtype, listIds, postReq));

    useEffect(() => {
        if (!listIds) return; 
    
        setListIds(listIds);
        setPoNums(poNums);
    
        fetchPmGridDetails(vendorId, loginId, listIds).then(res => {
            if (res?.pmGridDetails?.getPmGridDetails?.pmlistitems) {
                setPmGridDetails(res.pmGridDetails.getPmGridDetails.pmlistitems);
            }
        });
    
        const managerIds = selectedLists.map(sl => sl.MANAGER_ID);
        const managerId = [...new Set(managerIds)].join(',');
        const pmtype = selectedLists[0]?.PM_TYPE_NAME;
    
        fetchSyncedSitesInfo(vendorId, loginId, submarket, managerId, pmtype).then(res => {
            if (res?.syncedSitesInfo?.getSyncedSitesInfo?.siteinfo) {
                setSyncedSites(res.syncedSitesInfo.getSyncedSitesInfo.siteinfo);
            }
        });
    }, [listIds]);

    const formPostRequestGen = useCallback(() => {
        const pmtype = selectedLists[0]?.PM_TYPE_NAME;
        return selectedRows.map(sr => {
            const currentItem = syncedSites.find(psr => psr.SITE_ID === sr.SITE_ID);
            return {
                "PO_NUM": sr.PO_NUMBER || '',
                "PM_TYPE": pmtype || '',
                "SITE_ID": sr.SITE_ID || '',
                "PS_LOCATION_ID": sr.PS_LOCATION_ID || '',
                "MDG_ID": sr.MDG_ID || '',
                "PO_LINE_NUM": sr.LINE_NUMBER || '',
                "manufacturer": currentItem?.EQUIPMENT_INFO?.[0]?.manufacturer || '',
                "ac_voltage": currentItem?.EQUIPMENT_INFO?.[0]?.ac_voltage || '',
                "ac_current": currentItem?.EQUIPMENT_INFO?.[0]?.ac_current || '',
                "model": currentItem?.EQUIPMENT_INFO?.[0]?.model || '',
                "serialnum": currentItem?.EQUIPMENT_INFO?.[0]?.serialnum || '',
                "oil_level": currentItem?.EQUIPMENT_INFO?.[0]?.oil_level || '',
                "fuel_type1": currentItem?.EQUIPMENT_INFO?.[0]?.fuel_type1 || '',
                "fuel_tank1": currentItem?.EQUIPMENT_INFO?.[0]?.fuel_tank1 || '',
                "fuel_level1": currentItem?.EQUIPMENT_INFO?.[0]?.fuel_level1 || '',
                "fuel_total1": currentItem?.EQUIPMENT_INFO?.[0]?.fuel_total1 || ''
            };
        });
    }, [selectedRows, syncedSites, selectedLists]);

    const formPostRequestHvac = useCallback(() => {
        const pmtype = selectedLists[0]?.PM_TYPE_NAME;
        return selectedRows.map(sr => {
            const currentItem = syncedSites.find(psr => psr.SITE_ID === sr.SITE_ID);
            const objTOReturn = {
                "PO_NUM": sr.PO_NUMBER || '',
                "PM_TYPE": pmtype || '',
                "SITE_ID": sr.SITE_ID || '',
                "PS_LOCATION_ID": sr.PS_LOCATION_ID || '',
                "MDG_ID": sr.MDG_ID || '',
                "PO_LINE_NUM": sr.LINE_NUMBER || '',
                "HVAC_CONTROLLER_TYPE": currentItem?.EQUIPMENT_INFO?.[0]?.hvac_controller_type || '',
                "HVAC_CONTROLLER_MODEL": currentItem?.EQUIPMENT_INFO?.[0]?.hvac_controller_model || ''
            };

            if (currentItem?.EQUIPMENT_INFO?.length > 0) {
                currentItem.EQUIPMENT_INFO.forEach((val, index) => {
                    objTOReturn[`MODEL_${index + 1}`] = val.model;
                    objTOReturn[`SERIAL_${index + 1}`] = val.serial_number;
                    objTOReturn[`SIZE_${index + 1}`] = val.unit_size;
                    objTOReturn[`TYPE_${index + 1}`] = val.unit_type;
                    objTOReturn[`REFRIGERENT_${index + 1}`] = val.refrigerant;
                });
            } else {
                objTOReturn[`MODEL_1`] = '';
                objTOReturn[`SERIAL_1`] = '';
                objTOReturn[`SIZE_1`] = '';
                objTOReturn[`TYPE_1`] = '';
                objTOReturn[`REFRIGERENT_1`] = '';
            }

            return objTOReturn;
        });
    }, [selectedRows, syncedSites, selectedLists]);

    const onSubmit = useCallback(() => {
        const pmtype = selectedLists[0]?.PM_TYPE_NAME;
        const postReq = pmtype === 'HVAC PM'
            ? { postRequestItems: formPostRequestHvac() }
            : pmtype === 'GENERATOR PM'
                ? { postRequestItems: formPostRequestGen() }
                : {};

        postReq.postRequestItems.sort((e1, e2) => e1.PO_LINE_NUM - e2.PO_LINE_NUM);

        fetchTemplateData(vendorId, loginId, pmtype, listIds, postReq).then(action => {
            if (action.type === "FETCH_TMPLTDATA_SUCCESS" && action.fileData?.templateData) {
                handleHideTemplateModel();
                const blob = dataURItoBlob(action.fileData.templateData);
                startDownload(blob, `${action.fileData.templateName}.${action.fileData.templateType}`);
            }
        });
    }, [formPostRequestHvac, formPostRequestGen, fetchTemplateData, vendorId, loginId, listIds, handleHideTemplateModel, selectedLists]);

    const modifyGridDetails = useCallback(() => {
        return pmGridDetails.filter(pg => pg.PM_ITEM_STATUS === 'PENDING' || pg.PM_ITEM_STATUS === 'PENDIN_DRAFT').map(pmGridDetail => ({
            ...pmGridDetail,
            PM_ITEM_STATUS: pmGridDetail.PM_ITEM_STATUS,
            PM_ITEM_DUE_DATE: pmGridDetail.PM_ITEM_DUE_DATE ? moment(pmGridDetail.PM_ITEM_DUE_DATE).format('MM/DD/YYYY') : '',
            PM_ITEM_COMPLETED_DATE: pmGridDetail.PM_ITEM_COMPLETED_DATE ? moment(pmGridDetail.PM_ITEM_COMPLETED_DATE).format('MM/DD/YYYY') : '',
            LAST_UPDATED_DATE: pmGridDetail.LAST_UPDATED_DATE ? moment(pmGridDetail.LAST_UPDATED_DATE).format('MM/DD/YYYY') : '',
            COMPLETED_BY: pmGridDetail.COMPLETED_BY || '',
            PS_LOCATION_ID: pmGridDetail.PS_LOCATION_ID || '',
            PO_NUMBER: selectedLists.find(e => e.PM_LIST_ID === pmGridDetail.PM_LIST_ID)?.PO_NUM || '',
            MDG_ID: pmGridDetail.MDG_ID,
            LINE_NUMBER: pmGridDetail.LINE_NUMBER || ''
        }));
    }, [pmGridDetails, selectedLists]);

    const onSelectionChanged = useCallback((e, data) => {
        const selectedRows = data.filter(row => e.includes(row.PM_LIST_ITEM_ID));
        setDisableButton(selectedRows.length === 0 || selectedRows.length > 200);
        setUnidQuery(selectedRows.map(sr => sr.PM_ITEM_UNID).join(','));
        setSelectedRows(selectedRows);
    }, []);

    const renderLoading = () => (
        <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />
    );

    const modfdGridDetails = modifyGridDetails();
    modfdGridDetails.sort((e1, e2) => e1.LINE_NUMBER - e2.LINE_NUMBER);

    const columns = esaFlag === 'Y' ? [
        { headerName: "PO Number", field: "PO_NUMBER", flex: 1 },
        { headerName: "Line", field: "LINE_NUMBER", flex: 0.5 },
        { headerName: "Site ID", field: "SITE_ID", flex: 1 },
        { headerName: "MDGLC", field: "MDG_ID", flex: 1 },
        { headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 1.5 },
        { headerName: "Status", field: "PM_ITEM_STATUS", flex: 1 }
    ] : [
        { headerName: "PO Number", field: "PO_NUMBER", flex: 1 },
        { headerName: "MDGLC", field: "MDG_ID", flex: 1 },
        { headerName: "PS Location ID", field: "PS_LOCATION_ID", flex: 1 },
        { headerName: "Site ID", field: "SITE_ID", flex: 1 },
        { headerName: "Site Name", field: "PM_LOCATION_NAME", flex: 1 },
        { headerName: "Status", field: "PM_ITEM_STATUS", flex: 1 }
    ];

    return (
        <div className="table-responsive vp_stepper_content">
            {pmSystemRecordsLoading || gridDetailsLoading || syncedSitesLoading ? renderLoading() : (
                <div className="mb-3">
                    <h4 className='h4 mb-3 text-center'>
                        Generate template for bulk PM result upload
                        <span style={{ textAlign: "right", paddingLeft: '50px' }}>PO: {poNums}</span>
                    </h4>
                    <DataGrid
                        columns={columns}
                        rows={modfdGridDetails || []}
                        getRowId={(row) => row.PM_LIST_ITEM_ID}
                        checkboxSelection={true}
                        onRowSelectionModelChange={(row) => onSelectionChanged(row, modfdGridDetails)}
                        rowHeight={27}
                        columnHeaderHeight={35}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 20 }
                            },
                        }}
                        pageSizeOptions={[10, 15, 20]}
                        sx={{
                            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                            fontSize: '1rem',
                            minHeight: 200,
                            '& .highlight': { background: '#FFD580' },
                            '& .MuiTablePagination-toolbar > *': {
                                fontSize: '1rem'
                            },
                            '& .MuiTablePagination-toolbar': {
                                alignItems: 'flex-end'
                            },
                            '& .MuiTablePagination-input': {
                                marginBottom: '7px'
                            },
                        }}
                    />
                    <div className="text-center">
                        {disableButton ? (
                            <h4 className="text-danger mt-3">
                                <b>Select sites in range 1 to 200 to generate template...</b>
                            </h4>
                        ) : (
                            <h4 className="text-primary mt-3">
                                <b>{`No of rows selected: ${selectedRows.length}`}</b>
                            </h4>
                        )}
                        <button
                            type="submit"
                            className="Button--secondary mt-3"
                            style={{ center: "5px" }}
                            onClick={onSubmit}
                            disabled={disableButton}
                        >
                            Generate template with current system records
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateTemplate;