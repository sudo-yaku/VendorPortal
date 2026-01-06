import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DataGrid } from '@mui/x-data-grid';
import Select from 'react-select';
import Loader from '../../Layout/components/Loader';
import { get } from 'lodash';
const incentiveBidUnits = ["MC-INC-01", "MC-INC-02", "SC-INC-01", "SC-INC-02"];
export async function fetchCatalogData(props, state, setState) {
    let { market, submarket, siteArea, siteRegion, quoteVendorId, quoteVendorName, workORderInfo, user, userList, vendorId, loginId, fetchFixedPricingServ, workorderId, wo_meta_universalid, fetchFixedPricingExistServ, site, groupVendors, isCompleted, isAcceptedWork, isQuoteReceived, switchData } = props;
    let groupVendorsJs = groupVendors ? groupVendors.toJS() : [];
    const antennaTowerPricingMatrixFlag = user && user.get('vendor_pricing_macro_ant_tow');
    let smallCellFlag = user && user.get('vendor_pricing_small_cell');
    let fixedFlag = getFixedFlag(props, state, antennaTowerPricingMatrixFlag, smallCellFlag);
    await setState({ fixedFlag });

    if (quoteVendorId !== vendorId) {
        let vendObj = groupVendorsJs.find(e => e.vendor_id === quoteVendorId);
        let pricing_matrix = vendObj && vendObj.is_pricing_matrix;
        let smallcellpricing = vendObj && vendObj.vendor_pricing_small_cell;
        fixedFlag = getFixedFlag(props, state, pricing_matrix, smallcellpricing);
        await setState({ fixedFlag: pricing_matrix ? true : false });
    }

    let { disaster } = state;
    let area = market, region = submarket;
    if (siteArea) {
        area = market !== siteArea ? siteArea : market;
    }
    if (siteRegion) {
        region = submarket !== siteRegion ? siteRegion : submarket;
    }

    let requestParams = {
        market: area,
        submarket: region,
        national: '1',
        listname: '',
        worktype: '*',
        costtype: fixedFlag ? state.currentDropdownValue.value : 'S',
        sitetype: workORderInfo && workORderInfo.site_type === 'SWITCH' ? 'MSC' : 'CELL',
        fixed: fixedFlag ? '1' : '0',
        nonfixed: '1',
        zipcode: workORderInfo && workORderInfo.site_type === 'SWITCH' ? switchData.get('zip') || '' : site.get('zip') || '',
        matrix: fixedFlag || state.currentDropdownValueWorkType.value === '*' ? '1' : '0',
        nonmatrix: '1',
        matrixeligible: fixedFlag ? (disaster && disaster === "1" ? '0' : '1') : '0'
    };

    await setState({ pageLoadinggrid: true });
    let serviceCatalogData = [];

    if (state.catalogData.length === 0 || state.rateTypeChange || state.currentDropdownValueWorkType.value === "Small Cell" || state.currentDropdownValueWorkType.value === "Antenna / Tower") {
        await fetchFixedPricingServ(vendorId, loginId, workorderId, requestParams).then(async action => {
            if (action.type === 'FETCH_FIXEDPRICINGSERVICES_SUCCESS' && action.FixedPricingServ && action.FixedPricingServ.fixedPriceMatrixData && action.FixedPricingServ.fixedPriceMatrixData.length > 0) {
                fixedFlag = state.fixedFlag;
                let incentive_eligible = user && user.get('incentive_eligible');
                if (incentive_eligible === "1") {
                    serviceCatalogData = action.FixedPricingServ.fixedPriceMatrixData;
                } else {
                    serviceCatalogData = action.FixedPricingServ.fixedPriceMatrixData.filter(e => !(e.service_type?.toLowerCase().includes("incentive")));
                }
                await setState({ catalogData: serviceCatalogData });
            } else {
                setState({ fixedServicesData: [] });
            }
        });
    } else {
        serviceCatalogData = state.catalogData;
        fixedFlag = state.fixedFlag;
    }

    if (state.currentDropdownValueWorkType && state.currentDropdownValueWorkType.value === '*') {
        if (serviceCatalogData.filter(v => v.is_matrix === '1').length === 0) {
            fixedFlag = false;
        } else {
            fixedFlag = true;
        }
        await setState({
            fixedServicesData: serviceCatalogData,
            unfilteredfixedServices: serviceCatalogData,
            fixedFlag,
            catalogData: serviceCatalogData
        });
    } else {
        serviceCatalogData = serviceCatalogData.filter(w => (w.work_type).toLowerCase() === state.currentDropdownValueWorkType.value.toLowerCase());
        if (serviceCatalogData.filter(v => v.is_matrix === '1').length === 0) {
            fixedFlag = false;
        } else {
            fixedFlag = true;
        }
        await setState({
            fixedServicesData: serviceCatalogData.filter(v => fixedFlag ? v.is_matrix === '1' : v.is_matrix === '0'),
            unfilteredfixedServices: serviceCatalogData.filter(v => fixedFlag ? v.is_matrix === '1' : v.is_matrix === '0'),
            fixedFlag
        });
    }
    await setState({ pageLoadinggrid: false, rateTypeChange: false });
}

function getFixedFlag(props, state, antennaTowerPricingMatrixFlag, smallCellFlag) {
    const { user, workoderinfo } = props;
    let wotype = workoderinfo?.work_type;
    if ((antennaTowerPricingMatrixFlag === '1' && state.currentDropdownValueWorkType.value === 'Antenna / Tower' && wotype.toLowerCase()?.includes("antenna")) ||
        (smallCellFlag === '1' && state.currentDropdownValueWorkType.value === 'Small Cell' && wotype.toLowerCase() === "small cell")) {
        return true;
    }
    return false;
}

const ServiceCatalog = forwardRef(({
  handleDropdownChangeWorkType,
  handleDropdownChange,
  currentDropdownValueWorkType,
  currentDropdownValue,
  drpdwnOptionsWorkType,
  drpdwnOptions,
  handleChangeSearch,
  pageLoadinggrid,
  bidUnitRules,
  modfdGridDetails,
  apiRef,
  onSelectionChanged,
  getRowId,
  handleAddServices,
  selectedServices,
  erp,
  formattedLnItems,
  fixedFlag,
  handleChangeItemExpanded,
  itemExpanded
}, ref) => {
  const dataGridRef = useRef(null);

  const [searchValue, setSearchValue] = React.useState('');
  const searchInputRef = React.useRef(null);

  // Pass the dataGridRef to the parent component via apiRef
  React.useEffect(() => {
    if (apiRef) {
      apiRef.current = {
        setRowSelectionModel: (model) => {
          if (dataGridRef.current) {
            dataGridRef.current.setRowSelectionModel(model);
          }
        },
        setFilterModel: (model) => {
          if (dataGridRef.current) {
            dataGridRef.current.setFilterModel(model);
          }
        },
        clearSelection: () => {
          if (dataGridRef.current) {
            dataGridRef.current.setRowSelectionModel([]);
          }
        }
      };
    }
  }, [apiRef, dataGridRef.current]);
  const isServiceAlreadyAdded = (catalogItem) => {
    if (!formattedLnItems || formattedLnItems.length === 0) return false;
  
    const bidUnit = catalogItem.bid_unit;
  
    // Find all applicable rules for this bid unit
    const rulesForBidUnit = (bidUnitRules || []).filter(
      rule => rule.bidUnit === bidUnit && rule.isEnabled === "1"
    );
  
    for (const rule of rulesForBidUnit) {
      const conditions = rule.ruleCondition?.condition || [];
      for (const cond of conditions) {
        if (parseBidUnitRule(catalogItem, formattedLnItems, cond)) {
          return true; // condition violated => already added
        }
      }
    }
  
    return false;
  };

  const parseBidUnitRule = (catalogItem, formattedLnItems, rule) => {
    const type = rule.type;
    const r = rule.rule;
    const bidUnit = catalogItem.bid_unit;
  
    switch (type) {
      case "limit":
        if (r.operand === "bid_unit_count_per_workorder" && r.operator === "=") {
          const existingCount = formattedLnItems.filter(item =>
            item.cfdlineitembidunit === bidUnit && item.action !== 'Del'
          ).length;
          return existingCount >= parseInt(r.value);
        }
        return false;
  
      case "related_bid_unit_valiadation":
        // Handle new OR logic
        if (r.operator === "OR" && Array.isArray(r.operands)) {
          // Allow only if any operand's base_bid_unit is already present
          return !r.operands.some(op =>
            formattedLnItems.some(item =>
              item.cfdlineitembidunit === op.value && item.action !== 'Del'
            )
          );
        }
  
        // Handle older NOT logic
        if (r.operand === "base_bid_unit" && r.operator === "NOT") {
          const restrictedUnits = Array.isArray(r.value)
            ? r.value
            : r.value.split(',').map(s => s.trim());
          return formattedLnItems.some(item =>
            restrictedUnits.includes(item.cfdlineitembidunit) && item.action !== 'Del'
          );
        }
  
        return false;
  
      default:
        return false;
    }
  };
  const isRowSelectable = (params) => {
    const rowBidUnit = params.row?.cfdlineitembidunit;
  
    // Check incentive restriction
    if (incentiveBidUnits.includes(rowBidUnit)) {
      const isIncentiveAlreadyUsed = formattedLnItems.some(
        (item) =>
          incentiveBidUnits.includes(item.cfdlineitembidunit) &&
          item.cfdlineitemstatus === "A" &&
          item.action !== "Del"
      );
      if (isIncentiveAlreadyUsed) return false;
    }
  
    // Default bid-unit-based rules
    return !isServiceAlreadyAdded(params.row);
  };
  const getRowClassName = (params) => {
    const rowBidUnit = params.row?.cfdlineitembidunit;
  
    // Incentive rows
    if (incentiveBidUnits.includes(rowBidUnit)) {
      const isIncentiveAlreadyUsed = formattedLnItems.some(
        (item) =>
          incentiveBidUnits.includes(item.cfdlineitembidunit) &&
          item.cfdlineitemstatus === "A" &&
          item.action !== "Del"
      );
      if (isIncentiveAlreadyUsed) {
        return "incentive-disabled-row";
      }
    }
  
    // Existing already-added-service logic
    return isServiceAlreadyAdded(params.row) ? "already-added-service" : "";
  };
  const renderLoading = () => {
    return (
      <Loader color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center" />
    );
  };

  const customStyles = {
    control: base => ({
      ...base,
      height: 30,
      minHeight: 30
    })
  };

  const headingStyles = {
    fontFamily: 'Verizon NHG eDS',
    fontWeight: 700,
    fontSize: '14px'
  };

  const contentStyles = {
    fontFamily: 'Verizon NHG eDS',
    fontWeight: 400
  };

  const columns = [
    {
      headerName: "", field: null, flex: 0.5,
      renderCell: function (row) {
        let params = row.row;
        if (params && params.displayLongDesc) {
          return <span><i className="fas fa-info-circle fa-2x" title={params.displayLongDesc ? params.displayLongDesc : ''} style={{ cursor: "pointer" }}></i></span>;
        } else return null;
      }
    },
    {
      headerName: "Service Category/Work Type", field: "listname", flex: 2.5,
    },
    {
      headerName: "Service Type", field: "cfdlineitemservicetype", flex: 2.5,
      renderCell: (row) => {
        let params = row.row;
        if (params.cfdlineitemservicetype) {
          return params.cfdlineitemservicetype.split('(Email Pre-approval by VZ Required)').map((part, index) =>
            <span key={index} style={contentStyles}>
              {part}
              {index === 1 ? <span style={{ color: "red", fontWeight: "bold" }}>(Email Pre-approval by VZ Required)</span> : ''}
            </span>
          );
        } else {
          return '';
        }
      }
    },
    {
      headerName: "Bid Unit", hide: !fixedFlag, field: "cfdlineitembidunit", flex: 0.7
    },
    {
      headerName: "Rate", field: "cfdlineitemppu", flex: 0.7
    },
    {
      headerName: "Unit", field: "cfdlineitemunit", flex: 0.7
    },
    {
      headerName: "Cost Category", field: "cfdlineitemcostcat", flex: 0.7
    }
  ];

 
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    handleChangeSearch(e);
  };
  
  
  const clearSearch = () => {
    setSearchValue('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    handleChangeSearch({ target: { value: '' } });
  };
  
  
  const handleAccordionChange = () => {
    const newExpanded = !itemExpanded;
    handleChangeItemExpanded(newExpanded);
    if (!newExpanded) {
      clearSearch();
    }
  };
  
  return (
    <Accordion expanded={itemExpanded} onChange={handleAccordionChange}>
    <AccordionSummary 
      expandIcon={<ExpandMoreIcon />} 
      aria-controls="panel1a-content" 
      id="serviceCatalogAccordion"
      style={{ backgroundColor: '#fff' }}
    >
      <h5 style={headingStyles}>Service Catalog</h5>
    </AccordionSummary>
    <AccordionDetails style={{ display: "flex", flexDirection: "column", ...contentStyles }}>
      <div className="acc-container" style={{ margin: '0px', width: '100%' }}>
        <div className="row mb-5 align-items-center" style={{ alignItems: 'center'}}>
          <div className="col-md-3">
            <span style={{fontSize:'12px', fontWeight: 'normal', fontFamily: 'Verizon NHG eDS'}}>Work Type</span>
            <Select
              className="basic-single text-center"
              classNamePrefix="select"
              id="work_Type"
              value={currentDropdownValueWorkType}
              isDisabled={false}
              isLoading={false}
              clearable={false}
              isRtl={false}
              isSearchable={false}
              styles={{
                ...customStyles,
                control: (base) => ({
                  ...base,
                  width: "248px",
                  height: "32px",
                  borderRadius: "4px",
                  textAlign: "left"
                }),
                singleValue: (base) => ({
                  ...base,
                  ...contentStyles,
                  color: '#6F7171',
                  textAlign: "left'"
                }),
                option: (base) => ({
                  ...base,
                  ...contentStyles,
                  color: '#6F7171',
                  textAlign: "left"
                })
              }}
              options={drpdwnOptionsWorkType}
              onChange={handleDropdownChangeWorkType}
            />
          </div>
          <div className="col-md-3">
            {fixedFlag && currentDropdownValueWorkType && currentDropdownValueWorkType.value != '*' && <span style={{ fontSize:'12px', fontWeight: 'normal', fontFamily:'Verizon NHG eDS' }}>Rate Type</span>}
            {fixedFlag && currentDropdownValueWorkType && currentDropdownValueWorkType.value != '*' && <Select
              className="basic-single text-center"
              classNamePrefix="select"
              id="rate_Type"
              value={currentDropdownValue}
              isDisabled={false}
              isLoading={false}
              clearable={false}
              isRtl={false}
              isSearchable={false}
              styles={{
                ...customStyles,
                control: (base) => ({
                  ...base,
                  width: "248px",
                  height: "32px",
                  borderRadius: "4px",
                  textAlign: "left"
                }),
                singleValue: (base) => ({
                  ...base,
                  ...contentStyles,
                  color: '#6F7171',
                  textAlign: "left"
                }),
                option: (base) => ({
                  ...base,
                  ...contentStyles,
                  color: '#6F7171',
                  textAlign: "left"
                })
              }}
              options={drpdwnOptions}
              onChange={handleDropdownChange}
            />}
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <div className="search-bar" style={{ position: 'relative', marginTop: "20px"}}>
              <input
                placeholder="Search"
                className="form-control"
                ref={searchInputRef}
                value={searchValue}
                style={{
                  width: "248px",
                  height: "40px",
                  borderRadius: "4px",
                  fontFamily: 'Verizon NHG eDS',
                  fontWeight: 400,
                  fontSize: "14px",
                  paddingLeft: "10px",
                  paddingRight: "30px"
                }}
                autoComplete="off"
                onChange={handleSearchChange}
                id="search-bar"
              />
              <i 
                className="fas fa-search" 
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  fontSize: '16px',
                  color: '#666',
                  fontWeight: 'normal'
                }}
              ></i>
            </div>
          </div>
        </div>
        {pageLoadinggrid ? renderLoading() : (
          <div>
            <DataGrid
              className="service-catalog-grid"
              checkboxSelection={erp ? false : true}
              apiRef={dataGridRef}
              rows={!modfdGridDetails ? [] : modfdGridDetails}
              columns={columns}
              onRowSelectionModelChange={(params) => onSelectionChanged(params)}
              rowHeight={30}
              disableMultipleRowSelection={false}
              disableSelectionOnClick
              columnHeaderHeight={35}
              getRowId={getRowId}
              isRowSelectable={isRowSelectable}
              getRowClassName={getRowClassName}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 }
                }
              }}
              pageSizeOptions={[10, 15, 20]}
              sx={{
                fontSize: '1rem',
                minHeight: 300,
                fontFamily: 'Verizon NHG eDS',
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'Verizon NHG eDS'
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '14px',
                  fontWeight: 400,
                  fontFamily: 'Verizon NHG eDS'
                },
                '& .already-added-service': {
                  backgroundColor: '#f5f5f5',
                  color: '#999',
                  textDecoration: 'none',
                  pointerEvents: 'none'
                },
                '& .MuiTablePagination-toolbar': {
                  justifyContent: 'flex-start' ,
                  fontFamily: 'Verizon NHG eDS'
                },
                '& .MuiTablePagination-input': {
                  marginBottom: '7px',
                  fontFamily: 'Verizon NHG eDS'
                },
                '& .incentive-disabled-row': {
      opacity: 0.6,
      cursor: 'not-allowed',
      backgroundColor: '#f5f5f5',
      position: 'relative',
      '&:hover::before': {
        content: '""',
        position: 'absolute',
        top: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: '5px',
        borderStyle: 'solid',
        borderColor:
          'transparent transparent rgba(0,0,0,0.8) transparent',
        zIndex: 9999
      },
      '&:hover::after': {
        content:
          '"Incentive has already been added to this work order"',
        position: 'absolute',
        top: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '5px 10px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#fff',
        fontSize: '14px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        zIndex: 9999
      }
    },
                '& .MuiTablePagination-selectLabel': {
                  fontFamily: 'Verizon NHG eDS'
                },
                '& .MuiTablePagination-displayedRows': {
                  fontFamily: 'Verizon NHG eDS'
                }
              }}
              slotProps={{
                basePopper: {
                  disablePortal: true
                }
              }}
            />
            {/* Add a message to show users why some rows are disabled */}
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', fontStyle: 'italic', fontFamily: 'Verizon NHG eDS' }}>
              Greyed-out services have already been added to your order.
            </div>
            
            {erp && <span style={{ color: 'blue', fontWeight: 'bold', marginLeft: '5em', ...contentStyles }}>The PO has been converted from peoplesoft to 1ERP. Please contact your network assurance POC for any change needed.</span>}
            <button 
              id="Login" 
              type="submit" 
              style={{ marginTop: "1em", ...contentStyles }} 
              className="Button--secondary btn btn-md u-floatRight" 
              onClick={() => {
                handleAddServices();
               
                if (dataGridRef.current) {
                  dataGridRef.current.setRowSelectionModel([]);
                }
                clearSearch();
                handleChangeItemExpanded(false);
              }}
              disabled={erp || selectedServices.length === 0}
            >
              Add Service
            </button>
          </div>
        )}
      </div>
    </AccordionDetails>
  </Accordion>
);
});

export default ServiceCatalog;