import React, {Component} from "react"
import {connect} from "react-redux"
import {List, Map} from "immutable"
import * as formActions from "../../Forms/actions"
import { toast } from 'react-toastify';
import MessageBox from '../../Forms/components/MessageBox'
import Dropzone from 'react-dropzone'
import InvoiceComments from './InvoiceComments'
import InvoiceSubmit from './InvoiceSubmit'
import InvoiceAuditFindings from './InvoiceAuditFindings'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import * as VendorActions from "../actions"
import * as elogActions from "../../Elog/actions"
import moment from 'moment'
import FileAttachedTable from './FileAttachedTable'
import Tooltip from '@mui/material/Tooltip';
import {dataURItoBlob, startDownload} from '../utils.js'
import Loader from '../../Layout/components/Loader'
import { logActioninDB } from '../actions'
import {get} from 'lodash';
import { TextField } from "@mui/material"
import { FormLabel } from "@material-ui/core"
import ReactTooltip from 'react-tooltip'
import ServiceCatalog from './ServiceCatalog';
import { v4 as uuidv4 } from 'uuid';
import { ivrEmailNotify } from '../../Users/actions'
import { ivrEmailNotification } from '../../Users/schema'
import isEqual from 'lodash/isEqual';
import QuoteDeclineHistory from './QuoteDeclineHistory';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';

const incentiveBidUnits = ["MC-INC-01", "MC-INC-02", "SC-INC-01", "SC-INC-02"];

class WorkOrderFormFixedPricing extends Component {

  constructor (props) {
    super(props)
    this.state = {
      itemExpanded: false,
      fixedServicesData: [],
      catalogData: [],
      selectedServices: [],
      allRequiredFilesAttached: false,
      addedSelectedLists: [],
      qtyerr: false,
      costerr:false,
      raterr:false,
      formattedLnItems: [],
      comments: '', 
      distanceMob:null,    
      qtyChange:false,
      filesData: [],
      fileSizeError: false,
      quoteUnid: '',
      advSearchQuoteunid:'',
      unfilteredfixedServices: [],
      matrix_banner:[],
      fixedFlag:false,
      disaster:'',
      isworkCompleted:false,
      pageLoading:false,
      enableDeclined:false,
      invoiceNum:'',
      currentDropdownValue: {value: 'E', label: 'Emergency', isFixed: true},
      currentDropdownValueWorkType: {value: '', label: '', isFixed: true},
      pricing_matrix_cost_type:'E',
      drpdwnOptions: [{value: 'S', label: 'Standard', isFixed: true}, {value: 'E', label: 'Emergency', isFixed: true}],
      drpdwnOptionsWorkType: [],
      modfdGridDetails:[],
      pageLoadinggrid:false,
      initialMatTotal: 0, initialLabTotal:0, initialFuelTotal:0, initialRentTotal :0,
      initTotal:0,
      totalCostNoLn:0,
      totalCostPrev:0,
      quoteErr:null,
      laborCostNoLn:0,
      materialCostNoLn:0,
      fuelCostNoLn:0,
      rateTypeChange:false,
      rentCostNoLn:0,
      pipeLineOrder:false,
      declineData: [],
      showSection: false,
      sameDateErr: false,
      isFirstMob : false,
      oswdates : [],
      oswDatesAsc : [],
      lineItemResponse: [],
      attachmentsResponse: [],
      vendorWorkOrderResponse: [],
      inviceSubmitResponse: [],
      isFindings:false,
      enableAInDFlag: false,
      auditData: [],
      patchAuditInvoiceData: [],
      disregardReason: "",
      copyModfdGridDetails: [],
      flagToCheckModfdGrid: true,
      auditInvoiceData: null,
      bidUnitRulesResponse: [],
      disregardFlag:false,
      initialComments:'',
      initialLineItems:[],
      initialFilesData:[],
      serviceCatalogData: [],
      deletedIncentive: false,
      incentiveServiceType: '',
      incentiveBidUnitValue: '',
      eligibleForNotes: false,
      recalculateDistance : false,
      address : null,
      submissionInProgress: false,
      oswInfoData: [],
      showOswModal: false,
      selectedOswRows: [],
      oswTargetLineItem: null ,
      lineItemOswSelections: {},
      lineItemManualNotes: {},
      firstTroubleshootingDate: null,      // first selected troubleshooting date
      firstMobilizationDate: null,         // first selected mobilization date
      firstMobilizationLineItemId: null,   // line item id of first mobilization date
      showOswNotesViewModal: false,
      oswNotesViewData: []
    }
    this.initWOForm = this.initWOForm.bind(this)
    this.aList = List()
    this.mobCharge=false,
    this.fetchCatalogData = this.fetchCatalogData.bind(this)
    this.modifyGridDetails = this.modifyGridDetails.bind(this)
  }

  async componentDidMount() {

    this.initWOForm()
    let matrix_banner = this.props.banner && this.props.banner.toJS() && this.props.banner.toJS().configData && this.props.banner.toJS().configData.filter(attr => attr.ATTRIBUTE_NAME == "MATRIX_BANNER")
    this.setState({ matrix_banner })

    const updatedLineItems = this.addIncentiveLineItem(this.state.formattedLnItems, this.state.modfdGridDetails);
    this.setState({ formattedLnItems: updatedLineItems });
    const [
      bidUnitRulesResponse,
      fetchAuditWorkOrder
    ] = await Promise.all([
      this.props.fetchBidUnitRules(this.props.loginId),
      this.props.fetchAuditWorkOrder(this.props.loginId, this.props.workorderId)
    ]);

    if (bidUnitRulesResponse.type === "FETCH_BID_UNIT_RULES_SUCCESS") {
      this.setState({ bidUnitRulesResponse: bidUnitRulesResponse.bidUnitRules });
    } else if (bidUnitRulesResponse.type === "FETCH_BID_UNIT_RULES_FAILURE") {
      this.setState({ bidUnitRulesResponse: [] });
    }

    if (fetchAuditWorkOrder.type === "FETCH_AUDIT_WORK_ORDER_SUCCESS") {
      this.setState({ lineItemResponse: fetchAuditWorkOrder.auditWorkOrder.line_items, vendorWorkOrderResponse: fetchAuditWorkOrder.auditWorkOrder.vendorWorkOrder });
    } else if (fetchAuditWorkOrder.type === "FETCH_AUDIT_WORK_ORDER_FAILURE") {
      this.setState({ lineItemResponse: [], vendorWorkOrderResponse: [] });
    }

    await this.fetchAuditInvoiceData();
  }

   componentDidUpdate(prevProps, prevState) {
    if (
      prevState.formattedLnItems !== this.state.formattedLnItems ||
      prevState.modfdGridDetails !== this.state.modfdGridDetails
    ) {
      const updatedLineItems = this.addIncentiveLineItem(this.state.formattedLnItems, this.state.modfdGridDetails);
      // Only update if the contents are different
      if (!isEqual(updatedLineItems, this.state.formattedLnItems)) {
        this.setState({ formattedLnItems: updatedLineItems });
      }
    }
    if(!prevState.isFindings && this.state.isFindings) {
      this.setState({initialComments: this.state.comments})
    }  
   
    // Fetch bid unit rules when relevant properties change
    if (
      prevState.currentDropdownValueWorkType?.value !== this.state.currentDropdownValueWorkType?.value ||
      prevState.currentDropdownValue?.value !== this.state.currentDropdownValue?.value ||
      prevState.fixedFlag !== this.state.fixedFlag ||
      prevProps.workorderId !== this.props.workorderId
    ) {
      (async () => {
        const [
          bidUnitRulesResponse,
          fetchAuditWorkOrder
        ] = await Promise.all([
          this.props.fetchBidUnitRules(this.props.loginId),
          this.props.fetchAuditWorkOrder(this.props.loginId, this.props.workorderId)
        ]);
  
        if (bidUnitRulesResponse.type === "FETCH_BID_UNIT_RULES_SUCCESS") {
          this.setState({ bidUnitRulesResponse: bidUnitRulesResponse.bidUnitRules });
        } else if (bidUnitRulesResponse.type === "FETCH_BID_UNIT_RULES_FAILURE") {
          this.setState({ bidUnitRulesResponse: [] });
        }
  
        if (fetchAuditWorkOrder.type === "FETCH_AUDIT_WORK_ORDER_SUCCESS") {
          this.setState({ lineItemResponse: fetchAuditWorkOrder.auditWorkOrder.line_items, vendorWorkOrderResponse: fetchAuditWorkOrder.auditWorkOrder.vendorWorkOrder });
        } else if (fetchAuditWorkOrder.type === "FETCH_AUDIT_WORK_ORDER_FAILURE") {
          this.setState({ lineItemResponse: [] , vendorWorkOrderResponse: []});
        }
      })();
    }
  }
  handleChangeItemExpanded = (e) => {this.setState({itemExpanded: e})}
  hasLineItemRateChanged = () => {
    const { formattedLnItems = [], initialLineItems = [] } = this.state;

    // If lengths are different, line item was added or removed
    if (formattedLnItems.length !== initialLineItems.length) {
      return true;
    }

    for (let currentItem of formattedLnItems) {
      const matchingInitial = initialLineItems.find(
        item => item.cfdlineitemunid === currentItem.cfdlineitemunid
      );

      // New item added
      if (!matchingInitial) return true;
      // Rate changed
      const currPPU = String(currentItem.cfdlineitemppu ?? '').trim();
      const initPPU = String(matchingInitial.cfdlineitemppu ?? '').trim();
      if (currPPU != initPPU) return true;
    }
    return false;
  };
  isCostLimitBreached = () => {
    const { formattedLnItems = [] } = this.state;
    return formattedLnItems.some(item => {
      const isTargetBidUnit = item.cfdlineitembidunit === 'DC-006';
      const totalCost = parseFloat(item.cfdlineitemtotal ?? '0');
      return isTargetBidUnit && totalCost > 900;
    });
  }; 

  hasFileChanged = () => {
    const { filesData = [], initialFilesData = [] } = this.state;
  
    // Quick check: count mismatch
    if (filesData.length !== initialFilesData.length) return true;
  
    // Build sets of unique file keys for comparison
    const getFileKey = file => `${file.filename}-${file.bidUnit || ''}-${file.ruleId || ''}`;
  
    const currentKeys = new Set(filesData.map(getFileKey));
    const initialKeys = new Set(initialFilesData.map(getFileKey));
  
    // Check if both sets are equal
    if (currentKeys.size !== initialKeys.size) return true;
  
    for (let key of currentKeys) {
      if (!initialKeys.has(key)) return true;
    }
  
    return false;
  };
  handleRequiredFilesStatusChange = (status) => {
  
    if (this.state.allRequiredFilesAttached !== status) {
      this.setState({ allRequiredFilesAttached: status });
    }
  };
  handleChangeSearch = (e) => {
    let fixedServicesData

    if (e.target.value.length > 2) {

      fixedServicesData = this.state.unfilteredfixedServices.filter(val => {
        let listnameMatch = val.listname && val.listname.toLowerCase().includes(e.target.value.toLowerCase())
        let servicetypeMatch = val.service_type && val.service_type.toLowerCase().includes(e.target.value.toLowerCase())
        let unitMatch = val.unit && val.unit.toLowerCase().includes(e.target.value.toLowerCase())
        let rateMatch = val.price_per_unit && val.price_per_unit.toLowerCase().includes(e.target.value.toLowerCase())
        let ccMatch = val.cost_category && val.cost_category.toLowerCase().includes(e.target.value.toLowerCase())
        let bidMatch = val.bid_unit && val.bid_unit.toLowerCase().includes(e.target.value.toLowerCase())
        return listnameMatch || servicetypeMatch || unitMatch || rateMatch || ccMatch || bidMatch
      })

    } else {
      fixedServicesData = this.state.unfilteredfixedServices
    }
    this.setState({fixedServicesData}, () => {
      this.modifyGridDetails()
    })
  }
  getindexofVendor = (cfdQuotes) => {
    let currentVendor = cfdQuotes.filter(v => v.name && v.name.includes('cfd_quote_vendorid'));
    let currentVend =  currentVendor.find(v => v.value && v.value) || null;
    if (currentVend) {
      return currentVend.name.split('_')[currentVend.name.split('_').length - 1]
    } else {
      return 0
    }
  }

  getfilteredLineItems = (cfdQuotes, indexofVendor) => {

    let filteredReformattedQuotes = []

    cfdQuotes.forEach(curVal => {
      let currentVal = {}
      let filterCondition = false
      if (curVal.name && (curVal.name.includes('fueltotal') || curVal.name.includes('attachments') || curVal.name.includes('labortotal') || curVal.name.includes('quote_log') || curVal.name.includes('quote_materialstota') || curVal.name.includes('quote_numlineitems') || curVal.name.includes('quote_rentaltotal') || curVal.name.includes('quote_replydate') || curVal.name.includes('quote_status') || curVal.name.includes('quote_statusby') || curVal.name.includes('quote_statusdate') || curVal.name.includes('quote_total') || curVal.name.includes('quote_vendorcomments') || curVal.name.includes('quote_vendoremail') || curVal.name.includes('quote_vendorid') || curVal.name.includes('quote_vendorname') || curVal.name.includes('quote_vendorphone') || curVal.name.includes('quote_vendorpsid') || curVal.name.includes('quote_vzwcomments'))) {
        filterCondition = curVal.name.split('_')[curVal.name.split('_').length - 1] == indexofVendor
        currentVal['name'] = curVal.name.replace('_quote_', '_')
        currentVal['value'] = curVal.value
      } else if (curVal.name && (curVal.name.includes('quote_lineitem_bid_unit') || curVal.name.includes('quote_lineitem_cost_cat') || curVal.name.includes('quote_lineitem_is_matrix')  || curVal.name.includes('quote_lineitem_cost_type') || curVal.name.includes('quote_lineitem_deleteme') || curVal.name.includes('quote_lineitem_fixed') || curVal.name.includes('quote_lineitem_long_desc') || curVal.name.includes('quote_lineitem_notes') || curVal.name.includes('quote_lineitem_ppu') || curVal.name.includes('quote_lineitem_status') || curVal.name.includes('quote_lineitem_ps_item_id') || curVal.name.includes('quote_lineitem_mmid')|| curVal.name.includes('quote_lineitem_fuze_line_id') || curVal.name.includes('quote_lineitem_fuze_line_num') || curVal.name.includes('quote_lineitem_qty') || curVal.name.includes('quote_lineitem_service_type') || curVal.name.includes('quote_lineitem_total') || curVal.name.includes('quote_lineitem_unid') || curVal.name.includes('quote_lineitem_unit') || curVal.name.includes('quote_lineitem_work_type') || curVal.name.includes('quote_lineitem_long_desc') || curVal.name.includes('quote_lineitem_esa_line_num'))) {
        filterCondition = curVal.name.split('_')[curVal.name.split('_').length - 2] == indexofVendor
        currentVal['name'] = curVal.name.split('_', curVal.name.split('_').length - 2).concat(curVal.name.split('_')[curVal.name.split('_').length - 1]).join('_').replace('_quote_', '_')
        currentVal['value'] = curVal.value
      }
      if (filterCondition) {
        filteredReformattedQuotes.push(currentVal)
      }


    })
    if (!filteredReformattedQuotes.find(v => v.name && v.name.includes('lineitem_service_type'))) {


      let initialMatTotal = filteredReformattedQuotes.find(v => v.name && v.name.includes('materialstotal')) ? filteredReformattedQuotes.find(v => v.name && v.name.includes('materialstotal')).value : 0
      let initialLabTotal = filteredReformattedQuotes.find(v => v.name && v.name.includes('labortotal')) ? filteredReformattedQuotes.find(v => v.name && v.name.includes('labortotal')).value : 0
      let initialFuelTotal = filteredReformattedQuotes.find(v => v.name && v.name.includes('fueltotal')) ? filteredReformattedQuotes.find(v => v.name && v.name.includes('fueltotal')).value : 0
      let initialRentTotal = filteredReformattedQuotes.find(v => v.name && v.name.includes('rentaltotal')) ? filteredReformattedQuotes.find(v => v.name && v.name.includes('rentaltotal')).value : 0
      let initTotal = filteredReformattedQuotes.find(v => v.name && v.name.includes('cfd_total')) ? filteredReformattedQuotes.find(v => v.name && v.name.includes('cfd_total')).value : 0
      this.setState({initialMatTotal, initialLabTotal, initialFuelTotal, initialRentTotal, initTotal})
    }
    return filteredReformattedQuotes

  }

  getFixedFlag(antennaTowerPricingMatrixFlag, smallCellFlag) {
    const { user, workoderinfo } = this.props;
    
    let wotype = workoderinfo?.work_type;
    if((antennaTowerPricingMatrixFlag == '1' && this.state.currentDropdownValueWorkType.value == 'Antenna / Tower' && wotype.toLowerCase()?.includes("antenna"))|| (smallCellFlag == '1' && this.state.currentDropdownValueWorkType.value == 'Small Cell' && wotype.toLowerCase() == "small cell") ||( this.state.currentDropdownValueWorkType.value.toLowerCase() == 'ap radio' && wotype.toLowerCase() == "ap radio") || (this.state.currentDropdownValueWorkType.value.toLowerCase() == 'mdu' && wotype.toLowerCase() == "mdu") ){
      return true;
    }
    return false;
  }

  getOswArrayForLineItem = (lineItemId) => {
  const selectedOswIds = this.state.lineItemOswSelections[lineItemId] || [];
  return selectedOswIds.map(oswId => {
    const oswData = this.state.oswInfoData.find(r => r.oswId === oswId);
    if (oswData) {
      return {
        "OSW-ID": oswData.oswId,
        "OSW start datetime": oswData.createdDate,
        "OSW end datetime": oswData.lastUpdatedDate,
        "OSW duration": `${oswData.timeDuration ?? '-'} hours`
      };
    }
    return null;
  }).filter(Boolean);
};

formatOswArrayToDisplay = (oswArray = []) => {
    if (!Array.isArray(oswArray) || oswArray.length === 0) return '';
    return oswArray.map(o => {
      const id = o['OSW-ID'] ?? '';
      const start = o['OSW start datetime'] ?? '';
      const end = o['OSW end datetime'] ?? '';
      let duration = o['OSW duration'] ?? '';
      // Capitalize 'Hours' if present
      duration = duration.replace(/hours$/i, 'Hours');
      return `{OSW ID - ${id}, OSW Start Date Time - ${start}, OSW End Date Time - ${end}, OSW Duration - ${duration}}`;
    }).join(',');
  };

  getManualNotesForLineItem = (lineItemId, fallbackNotes = '') => {
  // Always use state as the source of truth
  const storedManualNotes = this.state.lineItemManualNotes?.[lineItemId];
  if (storedManualNotes !== undefined) {
    return storedManualNotes;
  }
  
  // Only for initial load - parse existing notes to extract manual part
  if (!fallbackNotes || typeof fallbackNotes !== 'string') return '';
  
  // Simple check: if it's pure JSON array, return empty (no manual notes)
  try {
    const parsed = JSON.parse(fallbackNotes);
    if (Array.isArray(parsed) && parsed.every(o => o && typeof o === 'object' && ('OSW-ID' in o))) {
      return '';
    }
  } catch (e) {
    // If not pure JSON, handle mixed format
    // Check for pattern: JSON + manual text
    const oswPattern = /^\[{"OSW-ID":[^}]+}(?:,{"OSW-ID":[^}]+})*\]\s*/;
    const match = fallbackNotes.match(oswPattern);
    
    if (match) {
      // Extract manual notes after OSW JSON
      const manualPart = fallbackNotes.substring(match[0].length).trim();
      return manualPart;
    }
    
    // If no OSW pattern found, return the whole thing as manual notes
    return fallbackNotes;
  }
  
  // If we reach here, it's not JSON, so return as manual notes
  return fallbackNotes;
};

  getOswDisplayText = (lineItem) => {
  const lineItemId = lineItem.cfdlineitemunid || lineItem.uniqueIdentifier;
    return this.getManualNotesForLineItem(lineItemId, lineItem.cfdlineitemnotes);
};

pruneOswSelectionsForDate = (lineItemId, selectedMoment, showToast = true) => {
    if (!selectedMoment || !moment.isMoment(selectedMoment)) return;

    const { oswInfoData, lineItemOswSelections, lineItemManualNotes, formattedLnItems } = this.state;
    const selectedIds = lineItemOswSelections[lineItemId] || [];
    if (selectedIds.length === 0) return;

    const targetDateStr = selectedMoment.format('YYYY-MM-DD');

    const oswRecords = oswInfoData.filter(r => selectedIds.includes(r.oswId));
    const toRemove = oswRecords.filter(r => {
      const recDate = moment(r.createdDate, 'MM/DD/YYYY HH:mm:ss');
      if (!recDate.isValid()) return true;
      return recDate.format('YYYY-MM-DD') !== targetDateStr;
    }).map(r => r.oswId);

    if (toRemove.length === 0) return;

    const newSelection = selectedIds.filter(id => !toRemove.includes(id));

    const newLineItemOswSelections = {
      ...lineItemOswSelections,
      [lineItemId]: newSelection
    };

    const remainingOswArray = newSelection.map(oswId => {
      const rec = oswInfoData.find(r => r.oswId === oswId);
      if (!rec) return null;
      return {
        "OSW-ID": rec.oswId,
        "OSW start datetime": rec.createdDate,
        "OSW end datetime": rec.lastUpdatedDate,
        "OSW duration": `${rec.timeDuration ?? '-'} hours`
      };
    }).filter(Boolean);

    const manualNotes = lineItemManualNotes[lineItemId] || '';
    let combinedNotes = remainingOswArray.length
      ? this.combineNotesAndOsw(manualNotes, remainingOswArray)
      : manualNotes;

    combinedNotes = this.deleteDuplicateOSWInfo(combinedNotes);

    const updatedFormatted = formattedLnItems.map(li => {
      const curId = li.cfdlineitemunid || li.uniqueIdentifier;
      if (curId !== lineItemId) return li;
      return {
        ...li,
        cfdlineitemnotes: combinedNotes,
        modifyNotes: true
      };
    });

    this.setState({
      lineItemOswSelections: newLineItemOswSelections,
      formattedLnItems: updatedFormatted
    }, () => {
      if (showToast) {
        toRemove.forEach(id => {
          toast.warning(`The On-Site Work with ${id} has been unselected as it's not performed on the date selected.`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
        });
      }
    });
  };

  finalizeDateSelection = (curObj, dateMoment) => {
    if (!dateMoment || !moment.isMoment(dateMoment)) return;
    const lineItemId = curObj.cfdlineitemunid || curObj.uniqueIdentifier;
    this.pruneOswSelectionsForDate(lineItemId, dateMoment, true);
  };


  formatNotesWithIcon = (notes, lineItem, lineIndex) => {
    if (!notes || typeof notes !== 'string') return notes || '';
    const oswRegex = /\[{"OSW-ID":[^}]+}(?:,{"OSW-ID":[^}]+})*\]/g;

    let match;
    let lastIndex = 0;
    const lines = []; // each element will become its own visual line
    let iconInserted = false;

    while ((match = oswRegex.exec(notes)) !== null) {
      // Text before JSON
      const before = notes.substring(lastIndex, match.index).trim();
      if (before) lines.push(before);

      // Parse JSON
      let parsed = [];
      try {
        parsed = JSON.parse(match[0]);
        if (!Array.isArray(parsed)) parsed = [];
      } catch (e) {
        // If parse fails treat as plain text
        lines.push(match[0]);
        lastIndex = oswRegex.lastIndex;
        continue;
      }

      const iconKey = `osw-notes-icon-${(lineItem.cfdlineitemunid || lineItem.uniqueIdentifier || lineIndex)}-${lines.length}`;

      // Icon line (only the icon + helper text)
      lines.push(
        <div
          key={iconKey}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <IconButton
            size="small"
            onClick={() => this.openOswNotesViewModal(parsed)}
            style={{ padding: 2, color: 'black' }}
          >
            <VisibilityIcon fontSize="inherit" />
          </IconButton>
          <span
            style={{ cursor: 'pointer', textDecoration: 'underline', fontSize: 12, color: '#000' }}
            onClick={() => this.openOswNotesViewModal(parsed)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                this.openOswNotesViewModal(parsed);
                e.preventDefault();
              }
            }}
          >
            View On-Site Work (OSW) Information
          </span>
        </div>
      );
      iconInserted = true;
      lastIndex = oswRegex.lastIndex;
    }

    // Remaining text after last match
    const after = notes.substring(lastIndex).trim();
    if (after) lines.push(after);

    // If no OSW arrays found return original notes unchanged
    if (!iconInserted) return notes;

    return (
      <div style={{ whiteSpace: 'normal' }}>
        {lines.map((ln, idx) =>
          typeof ln === 'string'
            ? <div key={`note-line-${idx}`}>{ln}</div>
            : ln
        )}
      </div>
    );
  };

  renderOswNotesViewModal = () => {
    const { showOswNotesViewModal, oswNotesViewData } = this.state;
    if (!showOswNotesViewModal) return null;

    const rows = (oswNotesViewData || []).map((r, idx) => ({
      id: r['OSW-ID'] || idx,
      oswId: r['OSW-ID'],
      createdDate: r['OSW start datetime'],
      lastUpdatedDate: r['OSW end datetime'],
      duration: (r['OSW duration'] || '').replace(/hours$/i, 'Hours')
    }));

    const columns = [
      { field: 'oswId', headerName: 'OSW ID', flex: 0.8, minWidth: 110 },
      { field: 'createdDate', headerName: 'OSW Start Date Time', flex: 1.3, minWidth: 170 },
      { field: 'lastUpdatedDate', headerName: 'OSW End Date Time', flex: 1.3, minWidth: 170 },
      { field: 'duration', headerName: 'OSW Duration', flex: 0.8, minWidth: 130 }
    ];

    return (
      <Dialog
        open={showOswNotesViewModal}
        onClose={this.closeOswNotesViewModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          On-Site Work (OSW) Information - Work Order {this.props.workorderId}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ maxHeight: 420, overflowY: 'auto', px: 2, pt: 2 }}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              density="compact"
              disableRowSelectionOnClick
              sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={this.closeOswNotesViewModal}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              minWidth: 100,
              '&:hover': { backgroundColor: '#000' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  openOswNotesViewModal = (parsedArray) => {
    this.setState({
      showOswNotesViewModal: true,
      oswNotesViewData: Array.isArray(parsedArray) ? parsedArray : []
    });
  };

  closeOswNotesViewModal = () => {
    this.setState({
      showOswNotesViewModal: false,
      oswNotesViewData: []
    });
  };

initializeLineItemStates = (lineItems) => {
  const manualNotes = {};
  const oswSelections = {};
  
  lineItems.forEach(item => {
    const lineItemId = item.cfdlineitemunid || item.uniqueIdentifier;
    if (lineItemId) {
      const notes = item.cfdlineitemnotes || '';
      
      // Initialize defaults
      manualNotes[lineItemId] = '';
      oswSelections[lineItemId] = [];
      
      if (notes) {
        try {
          // Check if it's pure JSON array (OSW data only)
          const parsed = JSON.parse(notes);
          if (Array.isArray(parsed) && parsed.every(o => o && typeof o === 'object' && ('OSW-ID' in o))) {
            oswSelections[lineItemId] = parsed.map(o => o['OSW-ID']).filter(Boolean);
          } else {
            manualNotes[lineItemId] = notes;
          }
        } catch (e) {
          // Not pure JSON, check for mixed OSW and manual notes
          const oswPattern = /\[{"OSW-ID":[^}]+}(?:,{"OSW-ID":[^}]+})*\]/g;
          const oswMatches = notes.match(oswPattern) || [];
          
          if (oswMatches.length > 0) {
            // Extract OSW IDs from the first match
            try {
              const parsed = JSON.parse(oswMatches[0]);
              if (Array.isArray(parsed)) {
                oswSelections[lineItemId] = parsed.map(o => o['OSW-ID']).filter(Boolean);
              }
            } catch (parseErr) {
              // Ignore parse errors
            }
            
            // Extract manual notes by removing OSW data
            const cleanText = notes
              .replace(oswPattern, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            manualNotes[lineItemId] = cleanText;
          } else {
            // No OSW data found, treat as manual notes
            manualNotes[lineItemId] = notes;
          }
        }
      }
    }
  });
  
  this.setState({
    lineItemManualNotes: manualNotes,
    lineItemOswSelections: oswSelections
  });
};

combineNotesAndOsw = (manualNotes, oswArray) => {
  // If no OSW data, just return clean manual notes
  if (!oswArray || oswArray.length === 0) {
    return manualNotes || '';
  }
  
  // If no manual notes, just return OSW data
  if (!manualNotes || manualNotes.trim() === '') {
    return JSON.stringify(oswArray);
  }
  
  // Combine: OSW data first, then manual notes
  return `${JSON.stringify(oswArray)} ${manualNotes}`.trim();
};

  deleteDuplicateOSWInfo = (inputString) => {
  if (!inputString || typeof inputString !== 'string') {
    return inputString || '';
  }

  // Regular expression to match JSON arrays containing OSW data
  const oswPattern = /\[{"OSW-ID":[^}]+}(?:,{"OSW-ID":[^}]+})*\]/g;
  
  // Find all OSW JSON arrays in the string
  const oswMatches = inputString.match(oswPattern) || [];
  
  if (oswMatches.length === 0) {
    return inputString;
  }

  // Parse and collect unique OSW entries
  const uniqueOswIds = new Set();
  let uniqueOswArray = [];

  oswMatches.forEach(match => {
    try {
      const parsed = JSON.parse(match);
      if (Array.isArray(parsed)) {
        parsed.forEach(osw => {
          if (osw && osw['OSW-ID'] && !uniqueOswIds.has(osw['OSW-ID'])) {
            uniqueOswIds.add(osw['OSW-ID']);
            uniqueOswArray.push(osw);
          }
        });
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });

  // Remove all OSW arrays from the original string to get the text parts
  let textParts = inputString.replace(oswPattern, '|||PLACEHOLDER|||');
  
  // Clean up multiple placeholders and extract the remaining text
  const cleanText = textParts
    .split('|||PLACEHOLDER|||')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Reconstruct the string with unique OSW data and cleaned text
  if (uniqueOswArray.length > 0) {
    const uniqueOswString = JSON.stringify(uniqueOswArray);
    return cleanText ? `${uniqueOswString} ${cleanText}` : uniqueOswString;
  }

  return cleanText;
};

extractManualFromNotes = (notes = '') => {
  if (!notes || typeof notes !== 'string') return '';
  const oswPattern = /\[{"OSW-ID":[^}]+}(?:,{"OSW-ID":[^}]+})*\]/g;
  // Remove all OSW JSON arrays
  const manual = notes.replace(oswPattern, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return manual;
};

  openOswModal = (lineItem = null) => {
  if (!lineItem) return;
  if ((this.state.oswInfoData || []).length > 0) {
    const lineItemId = lineItem.cfdlineitemunid || lineItem.uniqueIdentifier;
    
    // Initialize manual notes in state if not already done
    if (this.state.lineItemManualNotes[lineItemId] === undefined) {
      const manualNotes = this.getManualNotesForLineItem(lineItemId, lineItem.cfdlineitemnotes);
      this.setState(prevState => ({
        lineItemManualNotes: {
          ...prevState.lineItemManualNotes,
          [lineItemId]: manualNotes
        }
      }));
    }
    
    // Get stored OSW selections
    const preSelected = this.state.lineItemOswSelections[lineItemId] || [];
    
    this.setState({
      showOswModal: true,
      oswTargetLineItem: lineItem,
      selectedOswRows: preSelected
    });
  }
};

  closeOswModal = () => {
    this.setState({ showOswModal: false, selectedOswRows: [], oswTargetLineItem: null  });
  };

  getOswRows = () => {
    return (this.state.oswInfoData || []).map((r, idx) => ({
      id: r.oswId || idx,
      oswId: r.oswId,
      createdDate: r.createdDate,
      lastUpdatedDate: r.lastUpdatedDate,
      timeDuration: r.timeDuration
    }));
  };

 addSelectedOswToNotes = () => {
  const { selectedOswRows, oswInfoData, oswTargetLineItem, formattedLnItems } = this.state;
  if (!oswTargetLineItem) return;

  const lineItemId = oswTargetLineItem.cfdlineitemunid || oswTargetLineItem.uniqueIdentifier;
  
  // Update the OSW selections in state
  const newSelections = {
    ...this.state.lineItemOswSelections,
    [lineItemId]: selectedOswRows || []
  };

  // Get ALL selected OSW details (not just new ones)
  const allSelectedDetails = Array.isArray(selectedOswRows) && selectedOswRows.length > 0 
    ? (oswInfoData || []).filter(r => selectedOswRows.includes(r.oswId))
    : [];

  // Create OSW entries for ALL selected OSW items
  const allOswEntries = allSelectedDetails.map(r => ({
    "OSW-ID": r.oswId,
    "OSW start datetime": r.createdDate,
    "OSW end datetime": r.lastUpdatedDate,
    "OSW duration": `${r.timeDuration ?? '-'} hours`
  }));

  const latestStartMoment = allSelectedDetails.length > 0
    ? allSelectedDetails
        .map(r => moment(r.createdDate, 'MM/DD/YYYY HH:mm:ss'))
        .filter(m => m.isValid())
        .sort((a, b) => b.valueOf() - a.valueOf())[0] || null
    : null;

  // Get clean manual notes from state (this ensures we get the latest manual text)
  let currentManualNotes = this.state.lineItemManualNotes?.[lineItemId] ?? 
    this.getManualNotesForLineItem(lineItemId, oswTargetLineItem.cfdlineitemnotes);
  currentManualNotes = this.extractManualFromNotes(currentManualNotes);
  // Update the manual notes in state to ensure consistency
  this.setState(prevState => ({
    lineItemManualNotes: {
      ...prevState.lineItemManualNotes,
      [lineItemId]: currentManualNotes
    }
  }));
  
  // Combine clean manual notes with ALL selected OSW data
  let combinedNotes = allOswEntries.length === 0 
    ? currentManualNotes 
    : this.combineNotesAndOsw(currentManualNotes, allOswEntries);
  
  combinedNotes = this.deleteDuplicateOSWInfo(combinedNotes);

  // Update formattedLnItems with the new notes
  const updated = formattedLnItems.map(li => {
    const matchLine =
      (li.cfdlineitemunid && oswTargetLineItem.cfdlineitemunid && li.cfdlineitemunid === oswTargetLineItem.cfdlineitemunid) ||
      (li.uniqueIdentifier && oswTargetLineItem.uniqueIdentifier && li.uniqueIdentifier === oswTargetLineItem.uniqueIdentifier);

    if (!matchLine) return li;

    return {
      ...li,
      cfdlineitemnotes: combinedNotes,
      cfdlineitemdate: (latestStartMoment && allOswEntries.length > 0) ? latestStartMoment : li.cfdlineitemdate,
      action: li.action && li.action !== 'Add'
        ? (li.action === 'Del' ? 'Del' : 'Mod')
        : (li.action || 'Mod'),
      modifyNotes: true
    };
  });

  // Update state once
  this.setState({
    lineItemOswSelections: newSelections,
    formattedLnItems: updated,
    showOswModal: false,
    selectedOswRows: [],
    oswTargetLineItem: null
  }, () => {
    const actionMessage = allOswEntries.length > 0 ? 'OSW details updated' : 'OSW details removed';
    toast.success(actionMessage);
  });
};

  renderOswModal = () => {
    const rows = this.getOswRows();
    const columns = [
      { field: 'oswId', headerName: 'OSW ID', flex: 1, minWidth: 110 },
      { field: 'createdDate', headerName: 'OSW Start Time', flex: 1.3, minWidth: 170 },
      { field: 'lastUpdatedDate', headerName: 'OSW End Time', flex: 1.3, minWidth: 170 },
      { field: 'timeDuration', headerName: 'Time Duration (hrs)', flex: 1, minWidth: 160 }
    ];
    const { selectedOswRows, oswTargetLineItem, lineItemOswSelections } = this.state;

    const lineItemId = oswTargetLineItem
    ? (oswTargetLineItem.cfdlineitemunid || oswTargetLineItem.uniqueIdentifier)
    : null;

  const existingSelection = lineItemId
    ? (lineItemOswSelections[lineItemId] || [])
    : [];

  const isAdding = selectedOswRows.length > 0;
  const isClearing = existingSelection.length > 0 && selectedOswRows.length === 0;
  const buttonDisabled = !oswTargetLineItem || (!isAdding && !isClearing);
  const buttonLabel = isAdding ? 'Add' : (isClearing ? 'Clear' : 'Add');

  return (
    <Dialog open={this.state.showOswModal} onClose={this.closeOswModal} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        On-Site Work (OSW) Information - Work Order {this.props.workorderId}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ maxHeight: 420, overflowY: 'auto', px: 2, pt: 2 }}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedOswRows}
            onRowSelectionModelChange={(m) => this.setState({ selectedOswRows: m })}
            density="compact"
            sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          disabled={buttonDisabled}
          onClick={this.addSelectedOswToNotes}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            minWidth: 110,
            height: 38,
            px: 3,
            fontSize: '0.85rem',
            '&:hover': { backgroundColor: '#000' },
            '&.Mui-disabled': { backgroundColor: '#9e9e9e', color: '#fff' }
          }}
        >
          {buttonLabel}
        </Button>
        <Button
          variant="contained"
          onClick={this.closeOswModal}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            minWidth: 110,
            height: 38,
            px: 3,
            fontSize: '0.85rem',
            '&:hover': { backgroundColor: '#000' },
            '&.Mui-disabled': { backgroundColor: '#9e9e9e', color: '#fff' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

  async initWOForm () {
    if (this.props.user.get('vendor_pricing_macro_ant_tow') == '1' && this.props.workOrderDetailInfo.get("work_type")?.toLowerCase() == 'antenna / tower' && (this.props.formHeader == 'Invoice' || this.props.formHeader == 'Submit Invoice') && this.props.invoiceFlag == 'Y') {
      this.setState({enableAInDFlag: true});
    }
    let {market, submarket, workORderInfo, user, userList, vendorId, loginId, fetchFixedPricingServ, workorderId, wo_meta_universalid, fetchFixedPricingExistServ, site, groupVendors, isCompleted, isAcceptedWork, isQuoteReceived} = this.props
    let { s4_po_num, invoicing_oos} = this.props.workOrderDetailInfo && this.props.workOrderDetailInfo.toJS() 
    let {invoicingMsg} = this.state
    let groupVendorsJs = groupVendors ? groupVendors.toJS() : [];
    const antennaTowerPricingMatrixFlag = user && user.get('vendor_pricing_macro_ant_tow');
    let smallCellFlag = user && user.get('vendor_pricing_small_cell');

    await this.props.getLatestOswDate(loginId, workorderId).then(res=>{
      if(res.type == "GET_LATEST_OSW_SUCCESS"){
        this.setState({oswdates: res.oswdates.Osw_Date},()=>{
         let oswDatesasc =  [...this.state.oswdates].reverse();
         this.setState({oswDatesAsc : oswDatesasc})
        })
      }
    })

    await this.props.fetchOSWInfo(workorderId).then(res => {
      if (res.type == "OSW_INFO_SUCCESS") {
        const formatOswDateTime = (isoString) => {
          if (!isoString) return '';
          const m = moment(isoString);
          if (!m.isValid()) return '';
          return m.local().format('MM/DD/YYYY HH:mm:ss'); // system (browser) local time
        };

        let completedOswList = Array.isArray(res.oswInfoData)
          ? res.oswInfoData
              .filter(record => record.oswStatus?.trim().toUpperCase() === 'COMPLETED')
              .map(record => {
                const createdSource = record.createdDate;
                const updatedSource = record.lastUpdatedDate;

                let durationHours = null;
                const start = createdSource ? moment(createdSource) : null;
                const end = updatedSource ? moment(updatedSource) : null;
                if (start && end && start.isValid() && end.isValid() && end.diff(start) >= 0) {
                  durationHours = Number((end.diff(start, 'minutes') / 60).toFixed(2));
                }

                const createdMoment = start && start.isValid() ? start : null;

                return {
                  oswId: record.oswId,
                  createdDate: formatOswDateTime(createdSource),
                  lastUpdatedDate: formatOswDateTime(updatedSource),
                  oswStatus: record.oswStatus,
                  timeDuration: durationHours,
                  _createdTs: createdMoment ? createdMoment.valueOf() : -1 // temp for sorting
                };
              })
          : [];

        // Sort descending by createdDate
        completedOswList = completedOswList
          .sort((a, b) => b._createdTs - a._createdTs)
          .map(({ _createdTs, ...rest }) => rest); // remove temp key

        this.setState({ oswInfoData: completedOswList });
      }
    });

    let fixedFlag =  this.getFixedFlag(antennaTowerPricingMatrixFlag, smallCellFlag)
    await this.setState({fixedFlag, isworkCompleted : this.props.isCompleted || this.props.isAcceptedWork || this.props.isQuoteReceived, pageLoading:true})



    await fetchFixedPricingExistServ(vendorId, loginId, wo_meta_universalid).then(async action => {

      if (action && action.type == 'FETCH_FIXEDPRCEXTSERVICES_SUCCESS' && action.FixedPricingExtServ && action.FixedPricingExtServ.woInfo) {
        const res=action.FixedPricingExtServ.woInfo.cfd_quotes.filter(quote=>quote.name==='cfd_quote_vendor_distance_1');
        if(res[0]?.value==''){
          res[0].value=0;
        }
      this.setState({distanceMob:Number(res[0]?.value)})
        const declineData = action.FixedPricingExtServ.woInfo.work_declined_history_json ? JSON.parse(action.FixedPricingExtServ.woInfo.work_declined_history_json).sort((a, b) => new Date(b.declined_date) - new Date(a.declined_date)): [];
        this.setState({
          declineData
        });
        if(this.props.formName == "Invoice" && invoicing_oos == 'Yes' && this.props.workorderPriority.includes('BID')){
          invoicingMsg = `The invoice for the ${s4_po_num} has been submitted&completed to Ariba/Verizon Accounts Payable before the work order was completed in OpsPortal. This is flagged as a violation of the work order complete and invoice process. Please ensure that the right process is followed going forward`
        }
        this.setState({disaster: action.FixedPricingExtServ.woInfo.disaster_recovery, invoicingMsg})
        let indexofVendor = await this.getindexofVendor(action.FixedPricingExtServ.woInfo.cfd_quotes)
        let reformattedLineItems = []
        let filteredLineItems = []

        if (indexofVendor != 0) {
          filteredLineItems = await this.getfilteredLineItems(action.FixedPricingExtServ.woInfo.cfd_quotes, indexofVendor)
        
        }
        if (
          action.FixedPricingExtServ.woInfo.cfd_lineitems &&
          action.FixedPricingExtServ.woInfo.cfd_lineitems.length > 0
        ) {
          // Filter only keys that contain "cfd_lineitem_line"
          const onlyLineInfo = action.FixedPricingExtServ.woInfo.cfd_lineitems.filter(item =>
            item.name.includes('cfd_lineitem_line')
          );
        
          // Append those to filteredLineItems
          filteredLineItems = [...filteredLineItems, ...onlyLineInfo];
        }
       let totalCostNoLn = filteredLineItems.find(v => v.name && v.name.includes('_total_')) ? parseFloat(filteredLineItems.find(v => v.name && v.name.includes('_total_')).value) : 0
      let laborCostNoLn = filteredLineItems.find(v => v.name && v.name.includes('labortotal')) ? parseFloat(filteredLineItems.find(v => v.name && v.name.includes('labortotal')).value) : 0
      let materialCostNoLn = filteredLineItems.find(v => v.name && v.name.includes('materialstotal')) ? parseFloat(filteredLineItems.find(v => v.name && v.name.includes('materialstotal')).value) : 0
     let fuelCostNoLn = filteredLineItems.find(v => v.name && v.name.includes('fueltotal')) ? parseFloat(filteredLineItems.find(v => v.name && v.name.includes('fueltotal')).value) : 0
      let rentCostNoLn = filteredLineItems.find(v => v.name && v.name.includes('rentaltotal')) ? parseFloat(filteredLineItems.find(v => v.name && v.name.includes('rentaltotal')).value) : 0
      let totalCostPrev = filteredLineItems.find(v => v.name && v.name.includes('cfd_total_')) ? parseFloat(filteredLineItems.find(v => v.name && v.name.includes('cfd_total_')).value) : 0
    
        this.setState({totalCostNoLn, totalCostPrev, laborCostNoLn, materialCostNoLn, fuelCostNoLn, rentCostNoLn})

        let lineItems =[]
        this.setState({existFixed:action.FixedPricingExtServ.woInfo.cfd_quotes})
        if (action.FixedPricingExtServ.woInfo.cfd_lineitems && action.FixedPricingExtServ.woInfo.cfd_lineitems.length > 0 && this.props.workorderPriority == 'DIRECT AWARD' && this.props.formName != "SubmitQuote" && !action.FixedPricingExtServ.woInfo.cfd_quotes.find(v => v.name.includes('quote_lineitem_service_type'))) {

          lineItems = await this.formLineItems(action.FixedPricingExtServ.woInfo.cfd_lineitems)

        } else {
           
          lineItems = await this.formLineItems(filteredLineItems)
        }
        if(res[0]?.value == '9999'){
        await this.props.recalculateDistance(this.props.workorderId, this.props.loginId).then(res=>{
          if("RECALCULATE_MILEAGE_SUCCESS"===res.type){
            this.setState({distanceMob: res.recalculateDistance.distance,recalculateDistance : false, address: res.recalculateDistance?.closestDispatch?.address});
          }
        })
      }

        let pricing_matrix_cost_type = action.FixedPricingExtServ.woInfo.pricing_matrix_cost_type
        let drpdwnOptions = pricing_matrix_cost_type != 'S' ? this.state.drpdwnOptions : [{value: 'S', label: 'Standard', isFixed: true}];
        let currentDropdownValue = pricing_matrix_cost_type == 'E' ? {label:'Emergency', value:'E', isFixed:true} : {label:'Standard', value:'S', isFixed:true}
        let workTypes = []
        if (action.FixedPricingExtServ && action.FixedPricingExtServ.choices && action.FixedPricingExtServ.choices.length > 0) {
          
          workTypes = workTypes.concat({
            label: 'All',
            value: '*',
            isFixed: true
          })
          workTypes = workTypes.concat(action.FixedPricingExtServ.choices.map(v => ({
            label: v.alias,
            value: v.value,
            isFixed: true
          })))
        }
        let cfd_workorder_quotes = action.FixedPricingExtServ.woInfo && action.FixedPricingExtServ.woInfo.cfd_workorder_quotes !== null ? action.FixedPricingExtServ.woInfo.cfd_workorder_quotes : []
        await this.setState({formattedLnItems: lineItems, pricing_matrix_cost_type, currentDropdownValue, drpdwnOptions, drpdwnOptionsWorkType:workTypes, advSearchQuoteunid: cfd_workorder_quotes && cfd_workorder_quotes.length > 0 ? cfd_workorder_quotes.find(i=> i.name.includes('cfd_workorder_quote_id_1')).value : "", currentDropdownValueWorkType:{label: this.props.workORderInfo.get("work_type"), value: this.props.workORderInfo.get("work_type"), isFixed:true}})      
        
        
        
        await this.setState({quoteUnid: cfd_workorder_quotes && cfd_workorder_quotes.find(v => v.name.split('_')[v.name.split('_').length - 1] == indexofVendor) ? cfd_workorder_quotes.find(v => v.name.split('_')[v.name.split('_').length - 1] == indexofVendor).value : ''}, () => {
          this.getAttachmentList()
        })
        await this.fetchCatalogData()
      } else {
        await this.setState({formattedLnItems: []})
      }
    })
    if(this.props.formName != 'SubmitQuote' && this.props.workorderPriority != 'DIRECT AWARD' && this.state.formattedLnItems && this.state.formattedLnItems.filter(v => v.cfdlineitemservicetype).length == 0 ){
      await this.setState({pipeLineOrder:true})
    }
 
    await this.setState({pageLoading:false})

    this.initializeLineItemStates(this.state.formattedLnItems);

  }
  async fetchCatalogData () {
    let {market, submarket, siteArea, siteRegion, quoteVendorId, quoteVendorName, workORderInfo, user, userList, vendorId, loginId, fetchFixedPricingServ, workorderId, wo_meta_universalid, fetchFixedPricingExistServ, site, groupVendors, isCompleted, isAcceptedWork, isQuoteReceived, switchData} = this.props
    let groupVendorsJs = groupVendors ? groupVendors.toJS() : []
    const antennaTowerPricingMatrixFlag = user && user.get('vendor_pricing_macro_ant_tow');
    let smallCellFlag = user && user.get('vendor_pricing_small_cell');
    let fixedFlag =  this.getFixedFlag(antennaTowerPricingMatrixFlag, smallCellFlag)
    await this.setState({fixedFlag})
  
    //For advanced search with WO in other submarket
    if(quoteVendorId != vendorId){
     let vendObj =  groupVendorsJs.find(e=>e.vendor_id == quoteVendorId);
     let pricing_matrix =  vendObj && vendObj.is_pricing_matrix;
     let smallcellpricing = vendObj && vendObj.vendor_pricing_small_cell	
     fixedFlag = this.getFixedFlag(pricing_matrix, smallcellpricing)
      await this.setState({fixedFlag : pricing_matrix ? true : false});
    }
    let {disaster} = this.state;
    let area = market, region = submarket;
   
    if(siteArea){
    area =  market != siteArea ? siteArea : market;
    }
    if(siteRegion){
      region = submarket != siteRegion ? siteRegion : submarket
    }
    let requestParams = {
      market: area,
      submarket: region,
      national: '1',
      listname: '',
      worktype: '*',
      costtype: fixedFlag ? this.state.currentDropdownValue.value : 'S',
      sitetype: this.props.workoderinfo && this.props.workoderinfo.site_type == 'SWITCH' ? 'MSC' : 'CELL',
      fixed: fixedFlag ? '1' : '0',
      nonfixed: '1',
      zipcode: this.props.workoderinfo && this.props.workoderinfo.site_type == 'SWITCH' ? switchData.get('zip') ? switchData.get('zip') : '' : site.get('zip') ? site.get('zip') : '',
      matrix: fixedFlag || this.state.currentDropdownValueWorkType.value == '*' ? '1' : '0' ,
      nonmatrix: '1',
      matrixeligible:  fixedFlag ? (disaster && disaster == "1" ? '0' : '1') : '0' 
      
    }
    await this.setState({pageLoadinggrid:true})
    let serviceCatalogData= []

    if(this.state.catalogData.length==0 || this.state.rateTypeChange || this.state.currentDropdownValueWorkType.value == "Small Cell" || this.state.currentDropdownValueWorkType.value == "Antenna / Tower"||this.state.currentDropdownValueWorkType.value.toLowerCase() == "ap radio"||this.state.currentDropdownValueWorkType.value.toLowerCase() == "mdu"){
    await fetchFixedPricingServ(vendorId, loginId, workorderId, requestParams).then(async action => {
      if (action.type == 'FETCH_FIXEDPRICINGSERVICES_SUCCESS' && action.FixedPricingServ && action.FixedPricingServ.fixedPriceMatrixData && action.FixedPricingServ.fixedPriceMatrixData.length > 0) {
        fixedFlag = this.state.fixedFlag;
        let incentive_eligible = user && user.get('incentive_eligible');
        if(incentive_eligible == "1"){
          serviceCatalogData = action.FixedPricingServ.fixedPriceMatrixData;
        }else{
          serviceCatalogData = action.FixedPricingServ.fixedPriceMatrixData.filter(e=> !(e.service_type?.toLowerCase().includes("incentive")));
        }
        await this.setState({catalogData: serviceCatalogData})
      }
      else {
        this.setState({fixedServicesData: []})
      }
    })
  }
  else{
    serviceCatalogData= this.state.catalogData
    fixedFlag = this.state.fixedFlag
  }
      this.setState({serviceCatalogData})
       
        
        if (this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value == '*') {
          if (serviceCatalogData.filter(v => v.is_matrix == '1').length == 0) {
            fixedFlag = false
          } else {
            fixedFlag = true
          }
          await this.setState({fixedServicesData: serviceCatalogData, unfilteredfixedServices: serviceCatalogData, fixedFlag, catalogData: serviceCatalogData}, () => {
            this.modifyGridDetails()
          })
        }

         else {
         serviceCatalogData = serviceCatalogData.filter(w => (w.work_type).toLowerCase() == this.state.currentDropdownValueWorkType.value.toLowerCase()) 
         if (serviceCatalogData.filter(v => v.is_matrix == '1').length == 0) {
          fixedFlag = false
        } else {
          fixedFlag = true
        }
      
         await this.setState({fixedServicesData: serviceCatalogData.filter(v => fixedFlag ? v.is_matrix == '1' : v.is_matrix == '0'), unfilteredfixedServices: serviceCatalogData.filter(v => fixedFlag ? v.is_matrix == '1' : v.is_matrix == '0'), fixedFlag}, () => {  
            this.modifyGridDetails()
          })
        }
    await this.setState({pageLoadinggrid:false, rateTypeChange:false})
  }

  formLineItems = (lineItems) => {

    let itemCount = lineItems.filter(v => v.name && v.name.includes('service_type')).length
    var formattedArr = []
    if (itemCount > 0) {
      for (let i = 1; i <= itemCount; i++) {
        let currUnitItems = lineItems.filter(v => v.name && v.name.split('_')[v.name.split('_').length - 1] == i)
        let formattedObj = {}

        currUnitItems.forEach(v => {
          if (v.name && v.name.split('_')[v.name.split('_').length - 1] == i) {
            formattedObj[v.name.split('_', v.name.split('_').length - 1).join('')] = v.value
            formattedObj['cfdlineitemlongdesc'] = currUnitItems.find(val => val.name.includes('cfd_lineitem_long_desc')) ? currUnitItems.find(val => val.name.includes('cfd_lineitem_long_desc')).value != 'Vendor' ? 'VZ' : 'Vendor' : ''
            formattedObj['displayLongDesc'] = currUnitItems.find(val => val.name.includes('cfd_lineitem_long_desc')) ? currUnitItems.find(val => val.name.includes('cfd_lineitem_long_desc')).value : ''
            formattedObj['formattedLnItems'] = ''
            formattedObj['cfdlineitemppucopy'] = formattedObj['cfdlineitemppu']
          }

        })
        const isDeclined = this.props.workORderInfo.get("quote_statuses") === 'QUOTEDECLINED';
        if (isDeclined) {
          const isFixed = formattedObj.cfdlineitemfixed === '1' || formattedObj.is_matrix === '1';
          if (isFixed) {
            // For fixed price items, zero out the quantity
            formattedObj.cfdlineitemqty = 0;
          } else {
            // For non-fixed items, zero out the rate
            formattedObj.cfdlineitemppu = 0;
          }
          // Zero out the total and set an error flag to highlight the rate field for non-fixed items
          formattedObj.cfdlineitemtotal = 0;
          formattedObj.raterr = !isFixed;
        } 
        if (!!formattedObj['cfdlineitemppu'] && parseFloat(formattedObj['cfdlineitemppu']) > 0) {
          formattedObj['raterr'] = false;
          // if(this.props.workOrderDetailInfo.get("pricing_matrix_eligible") !== '1') {
          //   formattedObj['is_matrix'] = '0';
          //   formattedObj['pricing_fixed'] = '0';
          // }

        } else {
          formattedObj['cfdlineitemppu'] = 0
          formattedObj['cfdlineitemtotal'] = 0
          formattedObj['cfdlineitemqty'] = 1
          formattedObj['raterr'] = true


        }

        formattedArr.push(formattedObj)

      }
    } else {
      let comments = lineItems.find(v => v.name && v.name.includes('cfd_vendorcomments')) ? lineItems.find(v => v.name && v.name.includes('cfd_vendorcomments')).value : ''
      formattedArr.push({
        cfdvendorcomments:comments
      })
    }
    return formattedArr

  }
  addIncentiveLineItem(lineItems,serviceCatalogData) {
    const matrixCostType = this.props.workOrderDetailInfo.get("pricing_matrix_cost_type")?.toUpperCase();
    const {work_completed_timestamp, work_pending_timestamp,source_system}= this.props;
    const antennaTowerPricingMatrixFlag = this.props.user.get('vendor_pricing_macro_ant_tow');
    let smallCellFlag = this.props.user.get('vendor_pricing_small_cell');
    const serviceType = this.props.workOrderDetailInfo.get("work_type")?.toLowerCase();
    const incentive_eligible = this.props.user.get('incentive_eligible');
    const smallcell_incentive_eligible = this.props.user.get('smallcell_incentive_eligible');

    // Find the highest existing line number
let highestLineNumber = 0;
this.state.formattedLnItems.forEach(item => {
  
    const lineNum = item.cfdlineitemesalinenum ? parseInt(item.cfdlineitemesalinenum): parseInt(item.cfdlineitemlinenum);
    if (!isNaN(lineNum) && lineNum > highestLineNumber) {
      highestLineNumber = lineNum;
    }
  
});
    if(matrixCostType != 'E'){
      return lineItems;
    }
    const workOrderStatus = ((this.props.workORderInfo.get("workorder_status") === 'WORKPENDING' || this.props.workORderInfo.get("workorder_status") === 'WORKDECLINED') && this.props.workORderInfo.get("work_declined_count") > 0) ? 'workdeclined' : this.props.workOrderDetailInfo?.get("workorder_status")?.toLowerCase();
    if(serviceType == 'antenna / tower' && incentive_eligible != 1){
      return lineItems;
    }
    else if (serviceType == 'small cell' && smallcell_incentive_eligible != 1){
      return lineItems;

    }
    else if (serviceType != 'antenna / tower' && serviceType != 'small cell'){
      return lineItems;
    }
    // Ensure vendor status is "Pending Vendor Invoice"
    if ((workOrderStatus !== "workdeclined" && this.props.vendor_status !== "Pending Vendor Invoice") || source_system?.toLowerCase() !== "iop" || (antennaTowerPricingMatrixFlag != 1 && serviceType == 'antenna / tower') || (smallCellFlag != 1 && serviceType == 'small cell')) {
      return lineItems; // Return the original lineItems if no incentive is added
    }
  
    // Calculate time difference in hours
    const vendorStatusTime = new Date(work_completed_timestamp);
    const workPendingTime = new Date(work_pending_timestamp);
    const timeDifference = (vendorStatusTime - workPendingTime) / (1000 * 60 * 60); // Convert milliseconds to hours
  
    // Check if incentive line item already exists
    const incentiveExists = lineItems.some(
      (item) => item.cfdlineitembidunit?.startsWith("MC-INC-") || item.cfdlineitembidunit?.startsWith("SC-INC-")
    );
    if (incentiveExists) {

      // Remove incentive line items if their associated base line item is not valid
      const filteredLineItems = lineItems.filter(item => {
        // If not an incentive, keep as is
        if (!incentiveBidUnits.includes(item.cfdlineitembidunit)) return true;

        // Extract the associated service type (remove "INCENTIVE for " prefix)
        const baseServiceType = item.cfdlineitemservicetype?.replace(/^INCENTIVE for /, "");

        // Check if a valid associated line item exists
        const hasValidLineItem = lineItems.some(lineItem =>
          lineItem.cfdlineitemservicetype === baseServiceType &&
          Number(lineItem.cfdlineitemtotal) > 0 &&
          lineItem.action !== "Del"
        );

        // Only keep the incentive if its associated line item is valid
        return hasValidLineItem;
      });

      return filteredLineItems;
    }
  
    // Determine incentive amount and bid unit
    let incentiveAmount = 0;
    let bidUnit = "";
    let hours;
    const bidUnitMapping = this.getIncentiveBidUnit(serviceType);
    if (timeDifference <= 24) {
      incentiveAmount = 1000;
      bidUnit = bidUnitMapping["24"];
      hours=24;
    } else if (timeDifference <= 48) {
      incentiveAmount = 500;
      bidUnit = bidUnitMapping["48"];
      hours=48;
    }
    // Add incentive line item if applicable
    if (incentiveAmount > 0 && bidUnit) {
      let bidUnitObject = undefined;
for (const lineItem of lineItems) {
  if (Number(lineItem.cfdlineitemtotal) > 0 &&
    lineItem.action !== "Del") {
      bidUnitObject = serviceCatalogData.find(item =>
      item.bid_unit === bidUnit &&
      item.cfdlineitemservicetype === `INCENTIVE for ${lineItem.cfdlineitemservicetype}` &&
      item.cfdlineitemcosttype === lineItem.cfdlineitemcosttype
    );
    if (bidUnitObject) break;
  }
}
      if(bidUnitObject == undefined){
        return lineItems;
       } // Return the original lineItems if no incentive is added
      const incentiveItem = {
        cfdlineitemlongdesc: "Vendor",
        displayLongDesc: bidUnitObject?.displayLongDesc,
        formattedLnItems: "",
        cfdlineitemppucopy: bidUnitObject?.cfdlineitemppucopy,
        cfdlineitembidunit: bidUnitObject?.bid_unit,
        cfdlineitemcostcat: typeof bidUnitObject?.cfdlineitemcostcat === 'string' ? bidUnitObject?.cfdlineitemcostcat.split("/")[0] : bidUnitObject?.cfdlineitemcostcat,
        cfdlineitemcosttype: bidUnitObject?.cfdlineitemcosttype,
        cfdlineitemesalinenum: "",
        cfdlineitemfixed: "1",
        cfdlineitemismatrix: "1",
        cfdlineitemmmid: typeof bidUnitObject?.cfdlineitemmmid === 'string' ? bidUnitObject?.cfdlineitemmmid.split("/")[0] : bidUnitObject?.cfdlineitemmmid,
        cfdlineitemnotes: `The work order was completed within ${hours} hours`,
        cfdlineitemppu: bidUnitObject?.cfdlineitemppu, 
        cfdlineitempsitemid: typeof bidUnitObject?.cfdlineitempsitemid === 'string' ? bidUnitObject?.cfdlineitempsitemid.split("/")[0] : bidUnitObject?.cfdlineitempsitemid,
        cfdlineitemqty: "1",
        cfdlineitemservicetype: bidUnitObject?.cfdlineitemservicetype,
        cfdlineitemstatus: "A",
        cfdlineitemtotal: (parseFloat(bidUnitObject?.cfdlineitemppu || 0) * 1).toFixed(2),
        cfdlineitemunid: bidUnitObject?.meta_universalid,
        cfdlineitemunit: bidUnitObject?.cfdlineitemunit,
        cfdlineitemworktype: bidUnitObject?.work_type,
        cfdvendorcomments: "",
        raterr: false,
        is_matrix: bidUnitObject?.is_matrix,
        pricing_fixed: bidUnitObject?.pricing_fixed,
        cfdlineitemdate: null,
        cfdlineitemlinenum: (highestLineNumber + 1).toString(),
        
    };
    
        // Add the incentive item to the lineItems array
        lineItems.push(incentiveItem);
        this.setState({
          incentiveServiceType: bidUnitObject?.cfdlineitemservicetype,
          incentiveBidUnitValue: bidUnitObject?.bid_unit,
          eligibleForNotes: true
        });

    }

    return lineItems; // Return the original lineItems if no incentive is added
  }
  
  getIncentiveBidUnit(serviceType) {
    if (serviceType === "antenna / tower") {
      return {
        "24": "MC-INC-01",
        "48": "MC-INC-02",
      };
    } else if (serviceType === "small cell") {
      return {
        "24": "SC-INC-01",
        "48": "SC-INC-02",
      };
    }
    return {};
  }
  async modifyGridDetails () {
    let newFixedServData =[]
    if (this.state.fixedFlag && this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value == 'Antenna / Tower') {
      newFixedServData = this.state.fixedServicesData.map(v => ({...v, service_cat_type: v.service_cat + '^' + v.service_type}))
    } else {
      newFixedServData = this.state.fixedServicesData.map(v => ({...v, service_cat_type: v.service_type}))
    }
    if (this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value == '*') {

      let temp1 = this.state.fixedServicesData.filter(i => i.work_type && i.work_type == 'Antenna / Tower').map(v => ({...v, service_cat_type: v.service_cat + '^' + v.service_type}))
      let temp2 = this.state.fixedServicesData.filter(i => i.work_type && i.work_type != 'Antenna / Tower').map(v => ({...v, service_cat_type: v.service_type}))
      newFixedServData = [...temp1, ...temp2]
    }

    let uniqueServTypeRec = newFixedServData.map(v => v.service_cat_type).reduce((unique, item) => {
      return unique.includes(item) ? unique : [...unique, item]
    }, []).map(i => {
      return newFixedServData.find(val => val.service_cat_type == i)
    })
    let mergedServTypeRec = []
    uniqueServTypeRec.forEach(val => {
      let currentServType = newFixedServData.filter(i => i.service_cat_type == val.service_cat_type)
      if (currentServType.length > 1) {
        mergedServTypeRec.push({
          ...currentServType.find(value => value.cost_category == val.cost_category),
          cost_category: currentServType.map(v => v.cost_category).join('/'),
          ps_item_id: currentServType.map(v => v.ps_item_id).join('/'),
          mmid: currentServType.map(v => v.mmid).join('/')
        })
      } else if (currentServType.length == 1) {
        mergedServTypeRec.push(
                  currentServType[0]
               )
      }

    })

    let modfdGridDetails = mergedServTypeRec.sort((a, b) => {
      if (this.state.currentDropdownValueWorkType && this.state.currentDropdownValueWorkType.value != "*") {return a["service_cat_sort"] - b["service_cat_sort"] || a["line_item_sort"] - b["line_item_sort"]} else {
        if (a["work_type"] < b["work_type"]) {
          return -1
        } else if (a["work_type"] > b["work_type"]) {
          return 1
        } else {
          if (a["service_type"] > b["service_type"]) {
            return 1
          } else if (a["service_type"] < b["service_type"]) {
            return -1
          } else {
            return 0
          }
        }
              //  return a["work_type"] - b["work_type"] || a["service_type"] - b["service_type"]
      }

    }).map((service) => ({
      ...service,
      listname: !service.service_cat || service.service_cat == '*'? service.work_type: service.service_cat,
      cfdlineitemlongdesc: '',
      displayLongDesc:service.long_description ? service.long_description : '',
      cfdlineitemqty: 1,
      cfdlineitemservicetype: service.service_type ? service.service_type : '',
      cfdlineitemunit: service.unit ? service.unit : '',
      cfdlineitemcostcat: service.cost_category ? service.cost_category : '',
      cfdlineitemppu: service.price_per_unit && parseFloat(service.price_per_unit) > 0 ? service.price_per_unit : '',
      cfdlineitemdate : null,
      cfdlineitemsupplier :'',
      cfdlineitemothersupplier:'',
      cfdlineitemppucopy:service.price_per_unit && parseFloat(service.price_per_unit) > 0 ? service.price_per_unit : '',
      cfdlineitemtotal: '',
      cfdlineitemnotes: '',
      action: '',
      lineItemUnid: '',
      cfdlineitemcosttype: service.cost_type ? service.cost_type : '',
      cfdlineitempsitemid: service.ps_item_id ? service.ps_item_id : '',
      cfdlineitemmmid: service.mmid ? service.mmid : '',
      cfdlineitembidunit: service.bid_unit ? service.bid_unit : '',
      cfdlineitemismatrix: this.getRelatedMatrix(service.ps_item_id, service.bid_unit, service.work_type, service.cost_category) 
    }))
    await this.setState({modfdGridDetails})
    if (this.state.flagToCheckModfdGrid && this.state.enableAInDFlag) {
      await this.setState({ copyModfdGridDetails: modfdGridDetails, flagToCheckModfdGrid: false })
    }
  }


  getRelatedMatrix(ps_item_id, bid_unit, work_type, cost_category){
  let ismatrix= []
  let matrix= []
  if(ps_item_id.includes('/') && cost_category.includes('/')){
    cost_category.split('/').forEach(c => {
      ps_item_id.split('/').forEach(e => {
        matrix = this.state.fixedServicesData.filter(f =>f.ps_item_id == e && f.bid_unit == bid_unit && f.work_type == work_type && f.cost_category == c)
       if(matrix.length>0){
         ismatrix = matrix
       }
      })
      })
    }
 else if(ps_item_id.includes('/')){
  ps_item_id.split('/').forEach(e => {
   matrix = this.state.fixedServicesData.filter(f =>f.ps_item_id == e && f.bid_unit == bid_unit && f.work_type == work_type && f.cost_category == cost_category)
   if(matrix.length>0){
    ismatrix = matrix
  }
  })
  }
  else if(cost_category.includes('/')){
    cost_category.split('/').forEach(c => {
     matrix = this.state.fixedServicesData.filter(f =>f.ps_item_id == ps_item_id && f.bid_unit == bid_unit && f.work_type == work_type && f.cost_category == c)
     if(matrix.length>0){
      ismatrix = matrix
    }})
    }

  else
  ismatrix = this.state.fixedServicesData.filter(f =>f.ps_item_id == ps_item_id && f.bid_unit == bid_unit && f.work_type == work_type && f.cost_category == cost_category)
   
  if(ismatrix.length>0)
  return ismatrix[0].is_matrix;
  else return "";
  
}

  onGridReady = params => {
    this.gridOptions = params
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    this.gridApi.setFilterModel(null)

  }
  async onSelectionChanged (e) {

    const selectedServices = this.state.modfdGridDetails.filter(f=> e.includes(f.meta_universalid))

    const splittedRows = []
    selectedServices.forEach(v => {
      if (v.cfdlineitemcostcat && v.cfdlineitemcostcat.includes('/')) {
        v.cfdlineitemcostcat.split('/').forEach((i,index) => {
          splittedRows.push({
            ...v,
            cfdlineitemcostcat:i,
            cost_category:i,
            cfdlineitempsitemid:v.ps_item_id.split('/')[index],
            cfdlineitemmmid:v.mmid.split('/')[index],
          })
        })
      } else {
        splittedRows.push(v)
      }
    })

    // Check if all objects in array are identical and deduplicate if needed
const isDuplicate = (arr) => {
  if (arr.length <= 1) return false;
  
  // Convert first object to string for comparison
  const firstItem = JSON.stringify(arr[0]);
  
  // Check if all items are identical to the first
  return arr.every(item => JSON.stringify(item) === firstItem);
};

// If all rows are identical, keep only one
const finalRows = isDuplicate(splittedRows) ? [splittedRows[0]] : splittedRows;
  
    await this.setState({selectedServices: finalRows})

  }
  handleQtyChange = (curObj, erpConfigFlag, qtyEnableUnits, e,) => {
    var formattedLnItems =[]
    this.setState({qtyChange:true})

    let twoDecimals= String(e.target.value).split(".");
    let qtyVal = String(e.target.value);
    if(twoDecimals.length == 2){
      if(twoDecimals[1].length > 2){
        qtyVal = twoDecimals[0] +"."+ twoDecimals[1].substring(0,2);
      }
    }
    if(qtyVal < 0 || qtyVal == ""){
      qtyVal = 0;
    }
    
    if (curObj.action == 'Add') {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
          return {
            ...v,
            cfdlineitemqty: qtyVal,
            cfdlineitemtotal: (parseFloat(qtyVal) * parseFloat(v.cfdlineitemppu)).toFixed(2),
            action: v.action != 'Add' ? 'Mod' : v.action,
            qtyerr:false
          }
        } else {
          return v
        }   

      })
    } else {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            cfdlineitemqty: ((erpConfigFlag!="Y" ? qtyVal : qtyEnableUnits && qtyEnableUnits.length>0 && qtyEnableUnits.includes((v.cfdlineitemunit).toLowerCase()) ? qtyVal : (e.target.value > 0) ? 1 : 0)),
            cfdlineitemtotal: erpConfigFlag!="Y" ?  (parseFloat(qtyVal) * parseFloat(v.cfdlineitemppu)).toFixed(2) : qtyEnableUnits && qtyEnableUnits.length>0 && qtyEnableUnits.includes((v.cfdlineitemunit).toLowerCase())  ? (parseFloat(qtyVal) * parseFloat(v.cfdlineitemppu)).toFixed(2) : (parseFloat(e.target.value > 0 ? 1 : 0) * parseFloat(v.cfdlineitemppu)).toFixed(2),
            action: v.action != 'Add' ? 'Mod' : v.action,
            qtyerr:false
          }
        } else {
          return v
        }
       
      })
    }
    this.setState({formattedLnItems, qtyerr: false}, ()=>{
      if (this.getQuotesTotal() == 0) {
        this.setState({enableDeclined:true})
      }else{
        this.setState({enableDeclined:false})
      }
    })


  }
 handleRateChange = (curObj, e) => {
    var formattedLnItems =[]
    
    let twoDecimals= String(e.target.value).split(".");
    let rateVal = String(e.target.value);
    if(twoDecimals.length == 2){
      if(twoDecimals[1].length > 2){
        rateVal = twoDecimals[0] +"."+ twoDecimals[1].substring(0,2);
      }
    }
    if(rateVal < 0 || rateVal == ""){
      rateVal = 0;
    }
    if (curObj.action == 'Add') {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
          return {
            ...v,
            cfdlineitemppu: rateVal,
            cfdlineitemtotal: (parseFloat(rateVal) * parseFloat(v.cfdlineitemqty)).toFixed(2),
            action: v.action != 'Add' ? 'Mod' : v.action,
            raterr:false,
            cfdlineitemsupplier: '',
            cfdlineitemothersupplier: '',
            cfdlineitemnotes: ''
          }
        } else {
          return v
        }

      })
    } else {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            cfdlineitemppu: rateVal,
            cfdlineitemtotal: (parseFloat(rateVal) * parseFloat(v.cfdlineitemqty)).toFixed(2),
            action: v.action != 'Add' ? 'Mod' : v.action,
            raterr:false,
            modifyRate : true,
            cfdlineitemsupplier: '',
            cfdlineitemothersupplier: '',
            cfdlineitemnotes: ''
          }
        } else {
          return v
        }

      })
    }

    this.setState({formattedLnItems, raterr: false}, ()=>{
      if (this.getQuotesTotal() == 0) {
        this.setState({enableDeclined:true})
      }else{
        this.setState({enableDeclined:false})
      }
    })

  }

  handleDates = () => {
    let { troubleshooting_units, mobilization_units} = this.props;
    let bidunits = [...mobilization_units,...troubleshooting_units];
    let allunits = this.state.formattedLnItems?.filter(f=> {
      let totalDate = f.cfdlineitemtotal ? f.cfdlineitemtotal | 0 : 0;
      if(bidunits?.includes(f.cfdlineitembidunit) && f.action!='Del' && totalDate !=0){
        return true;
      }
    });
    let sameDate = allunits?.filter(m => (m.cfdlineitemdate!=null))
    sameDate = sameDate.map(e=> moment(e.cfdlineitemdate).format('YYYY-MM-DD'));
    let uniqueDates = new Set(sameDate);
    if(sameDate.length != uniqueDates.size){
      this.setState({sameDateErr : true})
    }else{
      this.setState({sameDateErr : false})
    }
 
  }

  recalcDateSequence = () => {
  const { troubleshooting_units = [], mobilization_units = [] } = this.props;
  const items = this.state.formattedLnItems || [];

  const active = items.filter(li => {
    if (!li) return false;
    if (li.action === 'Del' || li.cfdlineitemstatus === 'D') return false;
    const total = parseFloat(li.cfdlineitemtotal || 0);
    if (total <= 0) return false;
    return !!li.cfdlineitembidunit && li.cfdlineitemdate;
  });

  const trouble = active.filter(li =>
    troubleshooting_units.includes((li.cfdlineitembidunit || '').toUpperCase())
  );
  const mob = active.filter(li =>
    mobilization_units.includes((li.cfdlineitembidunit || '').toUpperCase())
  );

  let firstTroubleshootingDate = null;
  let firstMobilizationDate = null;
  let firstMobilizationLineItemId = null;

  if (trouble.length > 0) {
    trouble.sort((a, b) => moment(a.cfdlineitemdate).diff(moment(b.cfdlineitemdate)));
    firstTroubleshootingDate = trouble[0].cfdlineitemdate;
  }
  if (mob.length > 0) {
    // Keep the earliest as "first" (business rule), but allow editing that line freely.
    mob.sort((a, b) => moment(a.cfdlineitemdate).diff(moment(b.cfdlineitemdate)));
    firstMobilizationDate = mob[0].cfdlineitemdate;
    firstMobilizationLineItemId = mob[0].cfdlineitemunid || mob[0].uniqueIdentifier;
  }

  if (
    firstTroubleshootingDate !== this.state.firstTroubleshootingDate ||
    firstMobilizationDate !== this.state.firstMobilizationDate ||
    firstMobilizationLineItemId !== this.state.firstMobilizationLineItemId
  ) {
    this.setState({
      firstTroubleshootingDate,
      firstMobilizationDate,
      firstMobilizationLineItemId
    });
  }
};

 shouldDisableOswDate = (lineItem, dateMoment) => {
  if (!dateMoment || !moment.isMoment(dateMoment)) return false;

  const { troubleshooting_units = [], mobilization_units = [] } = this.props;
  const bidUnit = (lineItem.cfdlineitembidunit || '').toUpperCase();
  const isTrouble = troubleshooting_units.includes(bidUnit);
  const isMob = mobilization_units.includes(bidUnit);

  const {
    firstTroubleshootingDate,
    firstMobilizationDate,
    firstMobilizationLineItemId
  } = this.state;

  const troubleDate = firstTroubleshootingDate ? moment(firstTroubleshootingDate).startOf('day') : null;
  const mobDate = firstMobilizationDate ? moment(firstMobilizationDate).startOf('day') : null;
  const isFirstMobLine = isMob && (lineItem.cfdlineitemunid || lineItem.uniqueIdentifier) === firstMobilizationLineItemId;

  // No future dates at all
  if (dateMoment.isAfter(moment(), 'day')) return true;

  // Troubleshooting must be strictly BEFORE first mobilization if mobilization chosen first
  if (isTrouble && mobDate && !troubleDate) {
    // User is setting first troubleshooting after a mobilization already exists -> must be strictly before mob date
    if (!dateMoment.isBefore(mobDate, 'day')) return true;
  }

  // If troubleshooting date exists: mobilization must be strictly AFTER troubleshooting.
  if (isMob && troubleDate) {
    if (!dateMoment.isAfter(troubleDate, 'day')) return true;
  }

  // Additional mobilization (not the first) must be strictly AFTER first mobilization date.
  if (isMob && mobDate && !isFirstMobLine) {
    if (!dateMoment.isAfter(mobDate, 'day')) return true;
  }

  // For first mobilization line: allow any valid day after troubleshooting (if trouble exists)
  // (Handled above; no extra restriction)

  return false;
};

  handleDateChange = (curObj, e) => {
    let { troubleshooting_units, mobilization_units} = this.props;
    let bidunits = [...troubleshooting_units, ...mobilization_units]
    var formattedLnItems =[];

    if (curObj.action == 'Add') {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
          return {
            ...v,
            changed : true,
            cfdlineitemdate : e,
            action: v.action != 'Add' ? 'Mod' : v.action,
            daterr:false
          }
        } else {
          return v
        }
      })
    } else {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            changed : true,
            cfdlineitemdate : e,
            action:  v.action != 'Add' ? v.action == 'Del' ? 'Del' : 'Mod' : v.action,
            daterr:false
          }
        } else {
          return v
        }
      })
    }
    let allUnits = formattedLnItems?.filter(f=> {
      let totalDate = f.cfdlineitemtotal ? Number(f.cfdlineitemtotal) | 0 : 0;
      let curDate = curObj.cfdlineitemtotal ? Number(curObj.cfdlineitemtotal) | 0 : 0;
      // if(bidunits?.includes(f.cfdlineitembidunit) && f.action!='Del' && curObj.action!='Del' && totalDate !=0 && curDate!=0){
        return bidunits?.includes(f.cfdlineitembidunit) && f.action!='Del' && totalDate !=0 && curDate!=0;
      // }
    });
    let sameDate = allUnits?.filter(m => (m.cfdlineitemdate!=null))
    sameDate = sameDate.map(e=> moment(e.cfdlineitemdate).format('YYYY-MM-DD'));
    let uniqueDates = new Set(sameDate);
    if(sameDate.length != uniqueDates.size){
      this.setState({sameDateErr : true})
    }else{
      this.setState({sameDateErr : false})
    }
    // Determine if current line is troubleshooting or mobilization (for sequencing rules)
    const bidUnit = (curObj.cfdlineitembidunit || '').toUpperCase();
  const isTrouble = troubleshooting_units?.includes(bidUnit);
  const isMob = mobilization_units?.includes(bidUnit);

  this.setState(prevState => {
    let {
      firstTroubleshootingDate,
      firstMobilizationDate,
      firstMobilizationLineItemId
    } = prevState;

    if (!firstTroubleshootingDate && isTrouble && e) {
      firstTroubleshootingDate = e;
    }

    if (!firstMobilizationDate && isMob && e) {
      firstMobilizationDate = e;
      firstMobilizationLineItemId = curObj.cfdlineitemunid || curObj.uniqueIdentifier;
    }

    return {
      formattedLnItems,
      daterr: false,
      firstTroubleshootingDate,
      firstMobilizationDate,
      firstMobilizationLineItemId
    };
  }, () => {
    // Dynamic recompute (covers edits / re-sequencing)
    this.recalcDateSequence();

    if (this.getQuotesTotal() == 0) {
      this.setState({ enableDeclined: true });
    } else {
      this.setState({ enableDeclined: false });
    }
  });
};
  handleCostChange = (curObj, e) => {
    var formattedLnItems =[]

    formattedLnItems = this.state.formattedLnItems.map(v => {
      if (curObj.action == 'Add') {
        if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
          return {
            ...v,

            cfdlineitemtotal: parseFloat(e.target.value),
            action: v.action != 'Add' ? 'Mod' : v.action,
            costerr:false

          }
        } else {
          return v
        }
      } else {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            cfdlineitemppu: '',
            cfdlineitemtotal: parseFloat(e.target.value),
            action: v.action != 'Add' ? 'Mod' : v.action,
            costerr:false

          }
        } else {
          return v
        }
      }

    })
    this.setState({formattedLnItems, costerr: false})


  }
  hasIncentiveWithMatchingLineItem = () => {
  const { selectedServices, formattedLnItems } = this.state;
  return selectedServices.some(sel => {
    if (sel.cfdlineitemservicetype.startsWith("INCENTIVE for ")) 
    {
      const baseType = sel.cfdlineitemservicetype.replace("INCENTIVE for ", "");
      return formattedLnItems.some(
        item =>
          item.cfdlineitemservicetype === baseType &&
          Number(item.cfdlineitemtotal) > 0
      );
    }
    return false;
  });
}

  handleAddServices = async () => {
    this.mobCharge=false;
    var addedSelectedLists =[];
    let { recalculateDistance, distanceMob } = this.state;
    const {work_completed_timestamp, work_pending_timestamp}= this.props;
    const vendorStatusTime = new Date(work_completed_timestamp);
    const workPendingTime = new Date(work_pending_timestamp);
    const timeDifference = (vendorStatusTime - workPendingTime) / (1000 * 60 * 60);
    // Check if any of the selected services are incentives
  const existingIncentive = this.state.formattedLnItems.some(item => 
    incentiveBidUnits.includes(item.cfdlineitembidunit) && 
    item.cfdlineitemstatus !== "D" && 
    item.action !== "Del"
  );
  const selectedIncentives = this.state.selectedServices.filter(service => 
    incentiveBidUnits.includes(service.cfdlineitembidunit)
  );

// Find the highest existing line number
   // Find the highest existing line number
   let highestLineNumber = 0;
   this.state.formattedLnItems.forEach(item => {
     
       const lineNum = item.cfdlineitemesalinenum ? parseInt(item.cfdlineitemesalinenum): parseInt(item.cfdlineitemlinenum);
       if (!isNaN(lineNum) && lineNum > highestLineNumber) {
         highestLineNumber = lineNum;
       }
     
   });

// Block selection of multiple incentives - this is a strong validation
if (selectedIncentives.length > 1) {
  toast.warning("Only one incentive can be added per work order. Please select only one incentive.", {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
  this.setState({ selectedServices: [] });
  this.apiRef.current.setRowSelectionModel([]);
  return; // Exit the function early - don't add anything
}

// If an incentive already exists, prevent adding another one
if (existingIncentive && selectedIncentives.length > 0) {
  toast.warning("An incentive has already been added to this work order. You cannot add another incentive.", {
    position: "top-right", 
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
  this.setState({ selectedServices: [] });
  this.apiRef.current.setRowSelectionModel([]);
  return; // Exit the function early - don't add anything
}

if(selectedIncentives.length > 0){
  const eligibleSelection = this.hasIncentiveWithMatchingLineItem()
  if(!eligibleSelection){
    toast.warning(`Incentive with service type as ${selectedIncentives[0]['cfdlineitemservicetype']} and bid unit as ${selectedIncentives[0]['cfdlineitembidunit']} is not eligible.`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
    this.setState({ selectedServices: [] });
    this.apiRef.current.setRowSelectionModel([]);
    return; // Exit the function early - don't add anything
  }
}

// If adding a new incentive, reset the deletedIncentive state
if (selectedIncentives.length > 0) {
  this.setState({ deletedIncentive: false });
}


    // Assign incremented line numbers to new services
    addedSelectedLists = this.state.selectedServices.map((v, index) => ({
      ...v,
      cfdlineitemlongdesc: 'Vendor',
      cfdlineitemqty: 1,
      cfdlineitemppu: parseFloat(v.cfdlineitemppu) && parseFloat(v.cfdlineitemppu) > 0 ? parseFloat(v.cfdlineitemppu) : 0,
      cfdlineitemtotal: parseFloat(v.cfdlineitemppu) > 0 ? !!(parseFloat(v.cfdlineitemqty) * parseFloat(v.price_per_unit)) && (parseFloat(v.cfdlineitemqty) * parseFloat(v.price_per_unit)) > 0 ? parseFloat(v.cfdlineitemqty) * parseFloat(v.price_per_unit) : 0 : 0,
      lineItemUnid: v.meta_universalid,
      cfdlineitemunid:v.meta_universalid,
      cfdlineitemlinenum: (highestLineNumber + index + 1).toString(), // Assign incremented line number
      uniqueIdentifier: this.getRandomInt(1, 10000),
      action: 'Add',
      raterr: parseFloat(v.cfdlineitemppu) && parseFloat(v.cfdlineitemppu) > 0 ? false : true

    }))

      addedSelectedLists.forEach(val=>{
        if(this.state.fixedFlag && val.action === "Add" && val.unit==="Per Crew Per Mile" && (this.state.distanceMob===0 || this.state.distanceMob<50 || this.state.distanceMob===9999)){
          val.cfdlineitemqty='0';
          val.cfdlineitemtotal='0';
        }
        if(this.props.formName == "Invoice" && ["MMOB-020", "MMOB-021", "EMMOB-020", "EMMOB-021"].includes(val.cfdlineitembidunit)){
            recalculateDistance = true;
        }
      })
      addedSelectedLists.forEach(val => {
        if((val.cfdlineitembidunit == "MC-INC-01" || val.cfdlineitembidunit == "SC-INC-01") && this.state.eligibleForNotes) {
          val.cfdlineitemnotes = "The work order was completed within 24 hours";
        }
        else if((val.cfdlineitembidunit == "MC-INC-02" || val.cfdlineitembidunit == "SC-INC-02") && this.state.eligibleForNotes) {
          val.cfdlineitemnotes = "The work order was completed within 48 hours";
        }
        else if (incentiveBidUnits.includes(val.cfdlineitembidunit) && timeDifference > 48) {
          val.cfdlineitemnotes = "The work order was not completed within the expected time";
        }
      })
      if(distanceMob == 9999){
        await this.props.recalculateDistance(this.props.workorderId, this.props.loginId).then(res=>{
          if("RECALCULATE_MILEAGE_SUCCESS"===res.type){
            this.setState({distanceMob: res.recalculateDistance.distance,recalculateDistance : false, address: res.recalculateDistance?.closestDispatch?.address});
            if(res.recalculateDistance.distance > 50){
            addedSelectedLists.forEach(val => {
              if (["MMOB-020", "MMOB-021", "EMMOB-020", "EMMOB-021"].includes(val.cfdlineitembidunit) && val.action === "Add" && val.unit === "Per Crew Per Mile") {
                val.cfdlineitemqty = (parseInt(res.recalculateDistance.distance) - 50);
                val.cfdlineitemtotal = parseFloat(val.cfdlineitemppu) > 0 ? !!(parseFloat(val.cfdlineitemqty) * parseFloat(val.price_per_unit)) && (parseFloat(val.cfdlineitemqty) * parseFloat(val.price_per_unit)) > 0 ? Math.ceil((parseFloat(val.cfdlineitemqty) * parseFloat(val.price_per_unit)) * 100) / 100 : 0 : 0
              }
            });
          }
          }else{
            this.setState({distanceMob : 9999, recalculateDistance });
          }
        })
      }else if(distanceMob > 50){
        addedSelectedLists.forEach(val => {
          if (["MMOB-020", "MMOB-021", "EMMOB-020", "EMMOB-021"].includes(val.cfdlineitembidunit) && val.action === "Add" && val.unit === "Per Crew Per Mile") {
            val.cfdlineitemqty = (parseInt(distanceMob) - 50);
            val.cfdlineitemtotal = parseFloat(val.cfdlineitemppu) > 0 ? !!(parseFloat(val.cfdlineitemqty) * parseFloat(val.price_per_unit)) && (parseFloat(val.cfdlineitemqty) * parseFloat(val.price_per_unit)) > 0 ? Math.ceil((parseFloat(val.cfdlineitemqty) * parseFloat(val.price_per_unit)) * 100) / 100 : 0 : 0
          }
        });
        this.setState({ recalculateDistance :false});

      }
    this.setState({addedSelectedLists, formattedLnItems: this.state.formattedLnItems.filter(v => v.cfdlineitemservicetype).concat(addedSelectedLists), selectedServices: []}, () => {
      this.apiRef.current.setRowSelectionModel([])
      this.apiRef.current.setFilterModel({items : []})
    })
  }
  NotesMandatory = (bidUnits, anyIsMatrix) => {
    if (anyIsMatrix && this.props.formName == "Invoice") {
      let notesCondition = this.state.formattedLnItems?.some(val => {
        let totalForDate = val.cfdlineitemtotal ? (val.cfdlineitemtotal) | 0 : 0;
        return (val.cfdlineitemlongdesc != "VZ" &&  val.action!='Del' && (totalForDate!=0) && bidUnits.includes(val.cfdlineitembidunit) && val.cfdlineitemnotes?.length == 0) || ( val.cfdlineitembidunit.toLowerCase() == "dc-006" && (this.state.distanceMob <150 || this.state.distanceMob == 9999) && val.cfdlineitemnotes?.length == 0)         })
      if (notesCondition)
        return true
      else return false
    }
  }
  disableDate = (anyIsMatrix) => {
    if (anyIsMatrix && this.props.formName == "Invoice") {
     if(this.state.sameDateErr){
     return true
     }else{
      return false
     }
    }else{
      return false
    }
  }
  dateMandatory = (anyIsMatrix) => {
    let {troubleshooting_units, mobilization_units} = this.props;
    if (anyIsMatrix && this.props.formName == "Invoice") {
    let mobilization = [...troubleshooting_units,...mobilization_units];
     let datecondition = this.state.formattedLnItems?.some(val => {
      let totalForDate = val.cfdlineitemtotal ? (val.cfdlineitemtotal) | 0 : 0;
        return (mobilization?.includes(val.cfdlineitembidunit) && (!val.cfdlineitemdate) && (val.action!= 'Del') && (totalForDate!=0))
      });
      if (datecondition)
        return true
      else return false
    }else{
      return false;
    }
  }
                                    
  bidUnitDateMandatory = (lineItems) => {
    let isDateSelectedAll
    let bidUnitItems = lineItems.length>0 ? lineItems.filter(val =>  ["dc-006", "mmob-020", "mmob-021"].includes(val?.cfdlineitembidunit?.toLowerCase())) : []
    if(bidUnitItems.length === 0) {
      isDateSelectedAll = false
    }else {
      isDateSelectedAll = !bidUnitItems.every((el)=> el.cfdlineitemdate !== null)
    }
    return isDateSelectedAll
  }
    supplierMandatory = () => {
      const { mm_supplier_bidunit } = this.props;
      return this.state.formattedLnItems?.some(
        v =>
          mm_supplier_bidunit?.includes(v.cfdlineitembidunit) &&
          v.cfdlineitemcostcat == "Materials" &&
          v.cfdlineitemtotal > 0 &&
          (!v.cfdlineitemsupplier || (v.cfdlineitemsupplier == "Other" && !v.cfdlineitemothersupplier))
      );
  }                                
  handleNotesChange = (curObj, e) => {
  const newNotes = e.target.value;
  const lineItemId = curObj.cfdlineitemunid || curObj.uniqueIdentifier;
  const oswArray = this.getOswArrayForLineItem(lineItemId);
  const displayOsw = this.formatOswArrayToDisplay(oswArray);

  let newManualNotes = newNotes;
    if (displayOsw && newNotes.includes(displayOsw)) {
      // Remove the first occurrence of the formatted OSW string
      newManualNotes = newNotes.replace(displayOsw, '').trim();
    }
  
  // Update the manual notes in state
  this.setState(prevState => ({
    lineItemManualNotes: {
      ...prevState.lineItemManualNotes,
      [lineItemId]: newManualNotes
    }
  }));

  const formattedLnItems = this.state.formattedLnItems.map(v => {
    if (curObj.action == 'Add') {
      if (curObj.uniqueIdentifier == v.uniqueIdentifier) {
        let combinedNotes = this.combineNotesAndOsw(newManualNotes, oswArray);
        combinedNotes = this.deleteDuplicateOSWInfo(combinedNotes);
        return {
          ...v,
          cfdlineitemnotes: combinedNotes,
          action: v.action != 'Add' ? 'Mod' : v.action
        }
      } else {
        return v
      }
    } else {
      if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
        let combinedNotes = this.combineNotesAndOsw(newManualNotes, oswArray);
        combinedNotes = this.deleteDuplicateOSWInfo(combinedNotes);
        return {
          ...v,
          cfdlineitemnotes: combinedNotes,
          action:  v.action == 'Del' ? 'Del' : v.action != 'Add' ? 'Mod' : v.action,
          modifyNotes: true
        }
      } else {
        return v
      }
    }
  })

  this.setState({formattedLnItems})
}

  async handleDelete (curObj, anyIsMatrix) {
    var formattedLnItems

    // Check if the deleted item is an incentive
    const isIncentive = incentiveBidUnits.includes(curObj.cfdlineitembidunit);
    const associatedIncentive = this.state.formattedLnItems.find(
      v =>
        incentiveBidUnits.includes(v.cfdlineitembidunit) &&
        v.cfdlineitemservicetype === `INCENTIVE for ${curObj.cfdlineitemservicetype}`
    );

    if (curObj.action == 'Add') {
      const lineItemId = curObj.cfdlineitemunid || curObj.uniqueIdentifier;
    this.setState(prevState => ({
      lineItemOswSelections: {
        ...prevState.lineItemOswSelections,
        [lineItemId]: []
      }
    }));
      formattedLnItems = this.state.formattedLnItems.filter(v => !(curObj.uniqueIdentifier == v.uniqueIdentifier))


    } else {
      formattedLnItems = this.state.formattedLnItems.map(v => {
        if (curObj.cfdlineitemunid == v.cfdlineitemunid) {
          return {
            ...v,
            action: 'Del',
            cfdlineitemnotes: ''
          }
        } else {
          return v
        }
      })


    }
    if (associatedIncentive) {
      formattedLnItems = formattedLnItems.filter(
        v => !(associatedIncentive.cfdlineitemunid === v.cfdlineitemunid)
      );
    }
    // If we're deleting an incentive item, set the state flag
    if (isIncentive) {
      await this.setState({
        deletedIncentive: true,
        incentiveServiceType: curObj.cfdlineitemservicetype,
        incentiveBidUnitValue: curObj.cfdlineitembidunit
      });
    }
    await this.setState({formattedLnItems:[]})
    await this.setState({formattedLnItems},()=>{
      if(anyIsMatrix){
      this.handleDates();
      }
    })
    this.recalcDateSequence();
  }
  handleCommentsChange = (e) => {
    
    if (this.getQuotesTotal() == 0) {
      this.setState({enableDeclined:true})
    }else this.setState({enableDeclined:false})
    this.setState({comments: e.target.value})
  }
  handleInvoiceChange = (e) => {
    this.setState({invoiceNum: e.target.value})
  }
  onFileDrop (files) {
    let {formName} = this.props
    
    files.forEach(file => {

      if (file['size'] > 0) {

        var reader = new window.FileReader()
        reader.onload = function () {

          var dataURL = reader.result
          var droppedFile = {
            filename: file['name'],
            filetype: file['type'],
            file_size: file['size'] + '',
            content: dataURL,
            category: (formName == "SubmitQuote") ? "quote" : (file.attachmentType ? file.attachmentType.toLowerCase() : "invoice"),
            preview: file['preview'],
            last_modified: file['lastModifiedDate'],
            invoiceAuditLineNum:file.invoiceAuditLineNum || null,
            ruleId:file.ruleId || null,
            bidUnit:file.bidUnit || null

          }
          this.aList = this.aList.set(this.aList.size, droppedFile)
          if (this.aList.size > 0) {
            let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
            if (totalFileSize > 45000000) {
              this.setState({fileSizeError: true})
            }
            if (totalFileSize < 45000000) {
              this.setState({fileSizeError: false})
            }
          }


          this.setState({
            filesData: this.state.filesData.concat(droppedFile)
          })



          this.forceUpdate()
        }.bind(this)
        reader.readAsDataURL(file)
      }
    })
  }
  onInvoiceAttachRemove = (fileToRemove) => {

    const fileIndex = this.aList.findIndex(f =>
      f.filename === fileToRemove.filename &&
      f.invoiceAuditLineNum === fileToRemove.invoiceAuditLineNum &&
      f.ruleId === fileToRemove.ruleId
    );

    if (fileIndex > -1) {
      // remove from array (Immutable not needed if you're using plain JS array)
      this.aList.splice(fileIndex, 1); // mutate directly if it's an array

      const updatedFiles = [...this.aList]; // shallow copy to ensure immutability
      const totalFileSize = updatedFiles.reduce((a, b) => +a + +b.file_size, 0);

      this.setState({
        filesData: updatedFiles,
        fileSizeError: totalFileSize > 45000000
      });
    }

    if (fileIndex > -1) {
      this.aList = this.aList.delete(fileIndex); // update Immutable list

      const updatedFiles = this.aList.toJS(); // convert to plain JS
      const totalFileSize = updatedFiles.reduce((a, b) => +a + +b.file_size, 0);

      this.setState({
        filesData: updatedFiles,
        fileSizeError: totalFileSize > 45000000
      });
    }
  };
  onAttachRemove (index) {
    this.aList = this.aList.remove(index)
    if (this.aList.size < 1) {
      this.setState({fileSizeError: false})
    }
    if (this.aList.size > 0) {
      let totalFileSize = this.aList.toJS().reduce((a, b) => +a + +b.file_size, 0)
      if (totalFileSize > 45000000) {
        this.setState({fileSizeError: true})
      }
      if (totalFileSize < 45000000) {
        this.setState({fileSizeError: false})
      }
    }

    this.setState({
      filesData: this.state.filesData.filter((_, i) => i !== index)
    })

  }
  getQuotesTotal = () => {
    let totalCost = this.state.formattedLnItems.filter(i => i.action != 'Del').map(v => v.cfdlineitemtotal ? parseFloat(v.cfdlineitemtotal) : 0).reduce((total, currentItem) => {return total + currentItem}, 0)
    let initTotal = this.props.formName != 'SubmitQuote' && this.props.workorderPriority != 'DIRECT AWARD' && this.state.initTotal && parseFloat(this.state.initTotal) > 0 && !this.state.pipeLineOrder  ? parseFloat(this.state.initTotal) : 0
    return !isNaN(parseFloat(totalCost))  ? (initTotal + parseFloat(totalCost)).toFixed(2) : 0
  }
  getQuotesSubTotal = (costCat) => {
    
    let totalCost = this.state.formattedLnItems.filter(i => i.cfdlineitemcostcat && i.cfdlineitemcostcat.includes(costCat) && i.action != 'Del').map(v => v.cfdlineitemtotal ? parseFloat(v.cfdlineitemtotal) : 0).reduce((total, currentItem) => {return total + currentItem}, 0)
    let initialCost = 0
    if (this.props.formName != 'SubmitQuote' && this.props.workorderPriority != 'DIRECT AWARD' && !this.state.pipeLineOrder ) {
      if (costCat == 'Material') {initialCost = this.state.initialMatTotal} else if (costCat == 'Fuel') {initialCost = this.state.initialFuelTotal} else if (costCat == 'Rental') {initialCost = this.state.initialRentTotal} else {initialCost = this.state.initialLabTotal}
    }
    return !isNaN(parseFloat(totalCost))  ? (parseFloat(initialCost) + parseFloat(totalCost)).toFixed(2) : 0
  }

  formPostRequest = () => {
    let {config} = this.props
    let erpConfigFlag = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "ENABLE_ERP") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "ENABLE_ERP").ATTRIBUTE_VALUE
    if (this.props.formName == 'SubmitQuote') {
      return {
        "updateReqBody":{
          "data": {
            "quotetotal": this.getQuotesTotal(),
            "materialssubtotal": this.getQuotesSubTotal('Material'),
            "laborsubtotal": this.getQuotesSubTotal('Labor'),
            "genfuelsubtotal": this.getQuotesSubTotal('Fuel'),
            "rentalsubtotal": this.getQuotesSubTotal('Rental'),
            "quotecomments": this.state.comments,
            "disaster_recovery": this.state.disaster,
            "lineitems": this.state.formattedLnItems.filter(v => v.cfdlineitemservicetype).map(val => {
              if (val.action == 'Del') {
                return {

                  "unid": val.cfdlineitemunid,
                  "deleteme": "1",
                  "vp_line_num": val.cfdlineitemesalinenum || val.cfdlineitemlinenum
                }
              } else if (val.action == 'Add') {
                return {

                  "cost_type": val.cfdlineitemcosttype,
                  "ps_item_id": val.cfdlineitempsitemid,
                  "mmid": val.cfdlineitemmmid,
                  "is_matrix":val.is_matrix,
                  "bid_unit": val.cfdlineitembidunit,
                  "work_type": this.props.workORderInfo.get("work_type"),
                  "cost_cat": val.cfdlineitemcostcat,
                  "service_type": val.cfdlineitemservicetype,
                  "unit": val.cfdlineitemunit,
                  "ppu": parseFloat(val.cfdlineitemppu) ? val.cfdlineitemppu + '' : 0,
                  "long_desc": val.cfdlineitemlongdesc,
                  "fixed": val.cfdlineitemfixed ? val.cfdlineitemfixed : val.is_matrix,
                  "qty":  parseFloat(val.cfdlineitemqty) ? val.cfdlineitemqty + '' : 0,
                  "total": parseFloat(val.cfdlineitemtotal) ? val.cfdlineitemtotal + '' : 0,
                  "notes": val.cfdlineitemnotes,
                  "vp_line_num": val.cfdlineitemesalinenum || val.cfdlineitemlinenum

                }
              } else if (val.action == 'Mod' || !val.action) {
                return {// To update an existing line item, send it's UNID
                  "unid": val.cfdlineitemunid,
                  "cost_type": val.cfdlineitemcosttype,
                  "ps_item_id": val.cfdlineitempsitemid,
                  "mmid": val.cfdlineitemmmid ? val.cfdlineitemmmid : this.state.fixedServicesData && this.state.fixedServicesData.length>0 && this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid) && this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid).mmid ? this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid).mmid : "",
                  "is_matrix":val.cfdlineitemismatrix,
                  "bid_unit": val.cfdlineitembidunit,
                  "work_type": this.props.workORderInfo.get("work_type"),
                  "cost_cat": val.cfdlineitemcostcat,
                  "service_type": val.cfdlineitemservicetype,
                  "unit": val.cfdlineitemunit,
                  "ppu": parseFloat(val.cfdlineitemppu) ? val.cfdlineitemppu : 0,
                  "long_desc": val.cfdlineitemlongdesc,
                  "fixed": val.cfdlineitemfixed ? val.cfdlineitemfixed : val.is_matrix,
                  "qty":  parseFloat(val.cfdlineitemqty) ? val.cfdlineitemqty + '' : 0,
                  "total": parseFloat(val.cfdlineitemtotal) ? val.cfdlineitemtotal + '' : 0,
                  "notes": val.cfdlineitemnotes,
                  "vp_line_num": val.cfdlineitemesalinenum || val.cfdlineitemlinenum

                }
              }
            })


          }
        }
      }
    }
    else if(this.props.formName != 'SubmitQuote' && this.props.workorderPriority != 'DIRECT AWARD' && this.state.formattedLnItems && this.state.formattedLnItems.filter(v => v.cfdlineitemservicetype).length == 0 ) {

      return {
        "updateReqBody":{
          "data": {
            "invoicetotal": this.state.totalCostNoLn + '',
            "invoicematerials":  this.state.materialCostNoLn + '',
            "invoicelabor":  this.state.laborCostNoLn + '',
            "invoicegenfuel": this.state.fuelCostNoLn + '',
            "invoicerental":  this.state.rentCostNoLn + '',
            "invoicecomments": this.state.comments,
            "vendor_invoice_num": this.state.invoiceNum,
            "disaster_recovery": this.state.disaster,
            "lineitems": []


          }
        }}
    } 
    else {
      const minormaterial_supplier = this.state.formattedLnItems?.filter(v =>
        this.props.mm_supplier_bidunit?.includes(v.cfdlineitembidunit) && v.cfdlineitemcostcat == "Materials" && v.cfdlineitemtotal > 0 && (v.cfdlineitemsupplier || v.cfdlineitemothersupplier)
      ).map(v => ({
        bid_unit: v.cfdlineitembidunit,
        supplier: v.cfdlineitemsupplier !== "Other" ? v.cfdlineitemsupplier : v.cfdlineitemothersupplier
      }));

      return {
        "updateReqBody":{
          "data": {
            "invoicetotal": this.getQuotesTotal(),
            "invoicematerials": this.getQuotesSubTotal('Material'),
            "invoicelabor":  this.getQuotesSubTotal('Labor'),
            "invoicegenfuel": this.getQuotesSubTotal('Fuel'),
            "invoicerental": this.getQuotesSubTotal('Rental'),
            "invoicecomments": this.state.comments,
            "vendor_invoice_num": this.state.invoiceNum,
            "disaster_recovery": this.state.disaster,
            "minormaterial_supplier": minormaterial_supplier,
            "lineitems": this.state.formattedLnItems.filter(v => v.cfdlineitemservicetype).map(val => {
              if (val.action == 'Del') {
                return {

                  "unid": val.cfdlineitemunid,
                  "deleteme": "1",
                  "vp_line_num": val.cfdlineitemesalinenum || val.cfdlineitemlinenum
                }
              } else if (val.action == 'Add') {
                return {

                  "cost_type": val.cfdlineitemcosttype,
                  "ps_item_id": val.cfdlineitempsitemid,
                  "mmid": val.cfdlineitemmmid,
                  "is_matrix":val.is_matrix,
                  "bid_unit": val.cfdlineitembidunit,
                  "work_type": this.props.workORderInfo.get("work_type"),
                  "cost_cat": val.cfdlineitemcostcat,
                  "service_type": val.cfdlineitemservicetype,
                  "unit": val.cfdlineitemunit,
                  "ppu":  val.cfdlineitemppu,
                  "long_desc": val.cfdlineitemlongdesc,
                  "fixed": "1",
                  "qty":  val.cfdlineitemqty + '',
                  "total":  val.cfdlineitemtotal + '',
                  "notes": val.cfdlineitemdate && val.action!='Del'?  moment(val.cfdlineitemdate).format('YYYY-MM-DD')+";"+val.cfdlineitemnotes: val.cfdlineitemnotes,
                  "supplier": val.cfdlineitemsupplier !='Other' ? val.cfdlineitemsupplier : val.cfdlineitemothersupplier,
                  "vp_line_num": val.cfdlineitemesalinenum || val.cfdlineitemlinenum
                }
              } else if ((val.action == 'Mod' || !val.action) && typeof val.cfdlineitemfuzelinenum === "string" && typeof val.cfdlineitemfuzelineid === "string") {
                return {// To update an existing line item, send it's UNID
                  "unid": val.cfdlineitemunid,
                  "cost_type": val.cfdlineitemcosttype,
                  "ps_item_id": val.cfdlineitempsitemid,
                  "mmid": val.cfdlineitemmmid ? val.cfdlineitemmmid : this.state.fixedServicesData && this.state.fixedServicesData.length>0 && this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid) && this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid).mmid ? this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid).mmid : "",
                  "fuze_line_num":val.cfdlineitemfuzelinenum,
                  "fuze_line_id":val.cfdlineitemfuzelineid,
                  "is_matrix":val.cfdlineitemismatrix,
                  "bid_unit": val.cfdlineitembidunit,
                  "work_type": this.props.workORderInfo.get("work_type"),
                  "cost_cat": val.cfdlineitemcostcat,
                  "service_type": val.cfdlineitemservicetype,
                  "unit": val.cfdlineitemunit,
                  "ppu":  val.cfdlineitemppu,
                  "long_desc": val.cfdlineitemlongdesc,
                  "fixed": "1",
                  "qty":  val.cfdlineitemqty + '',
                  "total": val.cfdlineitemtotal + '',
                  "notes": val.cfdlineitemdate && val.action!='Del' ?  moment(val.cfdlineitemdate).format('YYYY-MM-DD') +";"+val.cfdlineitemnotes : val.cfdlineitemnotes,
                  "supplier": val.cfdlineitemsupplier !='Other' ? val.cfdlineitemsupplier : val.cfdlineitemothersupplier,
                  "vp_line_num": val.cfdlineitemesalinenum || val.cfdlineitemlinenum
                }
              }
              else if(val.action == 'Mod' || !val.action){
                return {// To update an existing line item, send it's UNID
                  "unid": val.cfdlineitemunid,
                  "cost_type": val.cfdlineitemcosttype,
                  "ps_item_id": val.cfdlineitempsitemid,
                  "mmid": val.cfdlineitemmmid ? val.cfdlineitemmmid : this.state.fixedServicesData && this.state.fixedServicesData.length>0 && this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid) && this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid).mmid ? this.state.fixedServicesData.find(e=>e.ps_item_id == val.cfdlineitempsitemid).mmid : "",
                  "is_matrix":val.cfdlineitemismatrix,
                  "bid_unit": val.cfdlineitembidunit,
                  "work_type": this.props.workORderInfo.get("work_type"),
                  "cost_cat": val.cfdlineitemcostcat,
                  "service_type": val.cfdlineitemservicetype,
                  "unit": val.cfdlineitemunit,
                  "ppu": val.cfdlineitemppu,
                  "long_desc": val.cfdlineitemlongdesc,
                  "fixed": "1",
                  "qty":  val.cfdlineitemqty + '',
                  "total": val.cfdlineitemtotal + '',
                  "notes": val.cfdlineitemdate && val.action!='Del' ? moment(val.cfdlineitemdate).format('YYYY-MM-DD')+';'+val.cfdlineitemnotes : val.cfdlineitemnotes,
                  "supplier": val.cfdlineitemsupplier !='Other' ? val.cfdlineitemsupplier : val.cfdlineitemothersupplier,
                  "vp_line_num": val.cfdlineitemesalinenum || val.cfdlineitemlinenum
                }
              }
            })


          }
        }}
    }


  }
  formFilesPostRequest = (fileData) => {
    return fileData.map(fd => {
      let file_name = fd.filename.split('.')[0]
      return {
        "data": fd.content,
        "description": `${file_name} uploaded from VP UI for Work Orders`,
        "size": fd.file_size,
        "name": fd.filename
      }
    })
  }
  formUploadFilesPostRequest = (fileData) => {
    return fileData.map(fd => {
      let file_name = fd.filename.split('.')[0]
      return {
        "content": fd.content,
        "preview": fd.preview,
        "file_size": fd.file_size,
        "filename": fd.filename,
        "filetype":fd.filetype,
        "last_modified":fd.last_modified,
        "category":(this.props.formName == "SubmitQuote") ? "quote" : (fd.category ? fd.category.toLowerCase() : "invoice"),
        "vendorWorkorderLineItemId": fd.vendorWorkorderLineItemId || null,
      }
    })
  }
  downloadFile = (file) => {
    let {loginId, downloadFile} = this.props
    downloadFile(loginId,  this.state.quoteUnid == '' ? this.state.advSearchQuoteunid : this.state.quoteUnid, file['file_name'], file['meta_universalid'], file["category"]).then(action => {
      if (action.filedata && action.filedata.file_data) {
        let blob = dataURItoBlob(action.filedata.file_data)
        startDownload(blob, file['file_name'])
      }
    })
  }

  getAttachmentList () {
    let {loginId, fetchFileList, wo_meta_universalid} = this.props
    if (this.state.quoteUnid) {
      let category = (this.props.formName === "SubmitQuote") ? "quote" : "invoice"

      fetchFileList(loginId, wo_meta_universalid, this.state.quoteUnid, category)
    }
  }

changeState = () =>{
  this.setState({showSection: false})
}
  getCatalogFromGridDetails = (lineItems) => {
    // Get all BID_UNIT_CATALOGE_ID from lineItemResponse for filtering
    const bidUnitCatalogeId = (lineItems || []).map(item => item.BID_UNIT_CATALOGE_ID);

    // Filter modfdGridDetails by meta_universalid
    const filtered = (this.state.copyModfdGridDetails || []).filter(
      item => bidUnitCatalogeId.includes(item.meta_universalid)
    );


    // Return as array of objects, not grouped
    return filtered.map(item => ({
      meta_universalid: item.meta_universalid,
      market: item.market,
      submarket: item.submarket,
      listname: item.listname,
      cost_type: item.cost_type,
      site_type: item.site_type,
      ps_item_id: item.ps_item_id,
      bid_unit: item.bid_unit,
      work_type: item.work_type,
      cost_category: item.cost_category,
      service_type: item.service_type,
      unit: item.unit,
      price_per_unit: item.price_per_unit,
      long_description: item.long_description,
      pricing_fixed: item.pricing_fixed,
      is_matrix: item.is_matrix,
      service_cat: item.service_cat,
      service_cat_sort: item.service_cat_sort,
      line_item_sort: item.line_item_sort,
      zipcode: item.zipcodes,
      mmid: item.mmid,
      display_name: "",
      ppu_editable: ""
    }));
  };

  getLineItems = () => {
    // Get the existing line items from state (make a copy)
    const existingLineItems = Array.isArray(this.state.lineItemResponse) ? [...this.state.lineItemResponse] : [];

    this.setState({
      initialLineItems: [...this.state.formattedLnItems],
    });
    // Build the new line items from formattedLnItems
    const newLineItems = this.state.formattedLnItems
      .map(val => {
        return {
          META_UNIVERSALID: "",
          META_CREATEDDATE: moment().format('YYYY-MM-DD'),
          META_CREATEDBY: this.props.loginId,
          META_LASTUPDATEDATE: moment().format('YYYY-MM-DD'),
          META_LASTUPDATEBY: this.props.loginId,
          WORKORDER_ID: this.props.workorderId || "",
          QUOTE_ID: "0", // Need to check
          LINE_NUM: val.cfdlineitemesalinenum || val.cfdlineitemlinenum || "",          
          COST_TYPE: val.cfdlineitemcosttype || "",
          PS_ITEM_ID: val.cfdlineitempsitemid || "",
          BID_UNIT: val.cfdlineitembidunit || "",
          WORK_TYPE: this.props.workORderInfo.get("work_type") || "",
          COST_CATEGORY: val.cfdlineitemcostcat || "",
          SERVICE_TYPE: val.cfdlineitemservicetype || "",
          UNIT: val.cfdlineitemunit || "",
          PRICE_PER_UNIT: val.cfdlineitemppu || "",
          LONG_DESCRIPTION: val.cfdlineitemlongdesc || "",
          PRICING_FIXED: "1",
          QTY: val.cfdlineitemqty + '',
          TOTAL_PRICE: val.cfdlineitemtotal + '',
          NOTES: val.cfdlineitemdate && val.action !== 'Del'
            ? moment(val.cfdlineitemdate).format('YYYY-MM-DD') + ";" + val.cfdlineitemnotes
            : val.cfdlineitemnotes,
          IS_MATRIX: val.is_matrix || "",
          MMID: val.cfdlineitemmmid || "",
          FUZE_LINE_ID: val.cfdlineitemfuzelineid || null,
          FUZE_LINE_NUM: val.cfdlineitemfuzelinenum || null,
          FUZE_STATUS: null,
          S4_STATUS: null,
          STATUS: val.cfdlineitemstatus || "A",
          ESA_ACCEPTANCE_DATE: null,
          ESA_ACCRUAL_AMT: null,
          ESA_GR_AMT: null,
          ESA_GR_QTY: null,
          ESA_INVOICED_AMT: null,
          ESA_LINE_ID: null,
          ESA_LINE_NUM: null,
          ESA_LINE_STATUS: null,
          PO_DUE_DATE: null,
          // Handle delete action
          ...(val.action === 'Del' ? { deleteme: "1" } : {})
        };
      });

    // Combine existing and new line items
    const combinedLineItems = existingLineItems.concat(newLineItems).map(item => {
      const match = (this.state.copyModfdGridDetails || []).find(
        detail =>
          detail.bid_unit === item.BID_UNIT &&
          detail.service_type === item.SERVICE_TYPE
      );
      return {
        ...item,
        BID_UNIT_CATALOGE_ID: match ? match.meta_universalid : null
      };
    });

    return combinedLineItems;
  }
  invoicePostRequest() {

    const lineItems = this.getLineItems();
    this.setState({
      initialFilesData: [...this.state.filesData],
    });
    const catalog = this.getCatalogFromGridDetails(lineItems)

    return {
      "input": {
        "metadata": {
          "session_id": uuidv4().replace(/-/g, ''),
          "transaction_id": uuidv4().replace(/-/g, ''),
          "user_id": this.props.loginId,
          "channel_name": "IOP",
          "agent_context": "vwrs-audit"
        },
        "body": {
          "workorder_id": this.props.workorderId,
          "userId": this.props.loginId,
          "line_items": lineItems,
          "attachments": this.state.filesData,
          "vendorWorkOrder": this.state.vendorWorkOrderResponse,
          "vendorcomments": this.state.comments,
          "distanceMob": this.state.distanceMob,
          "price_matrix": {
            "catalog": catalog,
            "is_matrix": false
          }
        }
      }
    }
  }
  handleDisregardReasonChange = (reason) => {
    this.setState({ disregardReason: reason });
  };
  inputPatchRequest = (auditData) => {
    let modfdGridDetails = this.state.copyModfdGridDetails
    return {
      "workOrderId": Number(this.props.workorderId),
      "isOverridden": !!this.state.disregardReason && this.state.disregardReason.trim() !== "",
      "overrideComments": this.state.disregardReason,
      "lineItems": auditData.lineItems.map(item => {
        const catalog = (modfdGridDetails || []).find(
          d => d.meta_universalid === item.bidUnitCatalogeId
        );
        return {
          auditLineItemId: Number(item.auditLineItemId),
          bidUnitCatalogId: item.bidUnitCatalogeId,
          catalogDetails: catalog
            ? {
              metaUniversalId: catalog.meta_universalid,
              psItemId: catalog.ps_item_id,
              bidUnit: catalog.bid_unit,
              serviceType: catalog.service_type,
            }
            : {},
          invoiceAuditLineNum: String(item.invoiceAuditLineNum),
        };
      })
    }
  }
  patchAuditRequest = () => {
    let auditData = this.state.auditData
    return {
      "auditId": Number(auditData.auditId),
      "input": this.inputPatchRequest(auditData),
      "userId": auditData.createdBy
    }
  }

  updateFilesDataWithVendorWorkorderLineItemId = (patchAuditInvoiceData) => {
    const updatedFilesData = this.state.filesData.map(file => {
      const matchingLineItem = patchAuditInvoiceData.find(
        item => item.invoiceAuditLineNum === file.invoiceAuditLineNum
      );
      if (matchingLineItem) {
        return {
          ...file,
          vendorWorkorderLineItemId: matchingLineItem.vendorWorkorderLineItemId
        };
      }
      return file;
    });
    return updatedFilesData;
  }

  async fetchAuditInvoiceData() {
    const { workorderId, loginId } = this.props;

    try {

      const auditInvoiceResponse = await this.props.fetchAuditInvoice(workorderId, loginId);

      if (auditInvoiceResponse.type === 'FETCH_AUDIT_INVOICE_SUCCESS') {
        this.setState({
          auditInvoiceData: auditInvoiceResponse.auditInvoiceData
        });

        // Process the audit invoice data as needed
      } else if (auditInvoiceResponse.type === 'FETCH_AUDIT_INVOICE_FAILURE') {
        this.setState({ auditInvoiceData: null });
        console.error("Failed to retrieve audit invoice data");
      }
    } catch (error) {
      console.error("Error fetching audit invoice data:", error);
      this.setState({ auditInvoiceData: null });
    }
  }






  
  onSubmission = async (actionstatus) => {
    const matchingItems = this.state.formattedLnItems.filter(
      item => incentiveBidUnits.includes(item.cfdlineitembidunit) && 
      item.cfdlineitemstatus !== "D" && 
      item.action !== "Del"
    );
     
    if(this.state.enableAInDFlag && !this.state.disregardFlag){
    const invoicePostReq = this.invoicePostRequest();
    const inviceSubmitResponse = await this.props.postInvoiceSubmit(invoicePostReq);
    let invoiceSubmitValue;
    if (inviceSubmitResponse.type === 'POST_INVOICE_SUBMIT_SUCCESS') {
      this.setState({ inviceSubmitResponse: inviceSubmitResponse.invoiceData.findings, pageLoading: false });
      invoiceSubmitValue = inviceSubmitResponse.invoiceData.findings;
    } else if (inviceSubmitResponse.type === 'POST_INVOICE_SUBMIT_FAILURE') {
      this.setState({ inviceSubmitResponse: [], pageLoading: false });
    }
    
    this.setState({auditData: inviceSubmitResponse?.invoiceData?.auditData})
  
    if(invoiceSubmitValue === undefined || invoiceSubmitValue === null || (invoiceSubmitValue?.workorder_findings?.length === 0 && invoiceSubmitValue?.bid_unit_findings?.length === 0)) {
      if (matchingItems.length > 0) {
        this.sendEmailNotification(matchingItems)
        }
      const postReq = this.formPostRequest()
    
    const { vendorId, loginId, submitFixedQuoteInvoice, logAction, uploadFilesWO, formName, market, submarket, workorderId, config } = this.props
    let routeToIop = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ROUTE_OPS_TO_IOP")?.ATTRIBUTE_VALUE;
    this.setState({ pageLoading: true,submissionInProgress:true })
    submitFixedQuoteInvoice(vendorId, loginId, this.state.quoteUnid == '' ? this.state.advSearchQuoteunid : this.state.quoteUnid, formName == 'SubmitQuote' ? actionstatus == 'DECLINE' ? 'rfqvendordecline' : 'rfqreply' : 'COMPLETE', postReq, this.props.wo_meta_universalid).then(async action => {
      if (action.type == 'SUBMIT_FPQUOTE_SUCCESS') {
        let category = this.props.formName === "SubmitQuote" ? "Quote" : "Invoice";
        logActioninDB(loginId, this.props.user && this.props.user.get('email'), vendorId, workorderId, market, submarket, category + " Submitted",'','','');
        this.props.handleHideModal("Details updated successfully")
        this.setState({ pageLoading: false,submissionInProgress:false })
        let updatedFilesFlag = false;
        let updatedFilesData;
        if(Array.isArray(this.state.auditData?.lineItems) && this.state.auditData?.lineItems.length > 0){
        const patchAuditReq = this.patchAuditRequest()
        const {auditId, userId,input}=patchAuditReq;
        const patchAuditResponse = await this.props.patchAudit(auditId,input, userId);
        if (patchAuditResponse.type === 'PATCH_AUDIT_SUCCESS') {
          this.setState({ patchAuditInvoiceData: patchAuditResponse.patchAuditData.data.lineItems});
        } else if (patchAuditResponse.type === 'PATCH_AUDIT_FAILURE') {
          this.setState({ patchAuditInvoiceData: [] });
        }
        if(patchAuditResponse?.patchAuditData.data.lineItems.length>0){
          updatedFilesData= this.updateFilesDataWithVendorWorkorderLineItemId(patchAuditResponse.patchAuditData.data.lineItems);
          this.setState({ filesData: updatedFilesData });
          updatedFilesFlag=true;
        }
      }
          this.setState({ disregardReason: "" });
          let filesPostRequest;
          if(updatedFilesFlag){
             filesPostRequest = {
              "files": routeToIop == "Y" ? this.formUploadFilesPostRequest(updatedFilesData) : this.formFilesPostRequest(updatedFilesData)
            }
          }else{
          filesPostRequest = {
            "files": routeToIop == "Y" ? this.formUploadFilesPostRequest(this.state.filesData) : this.formFilesPostRequest(this.state.filesData)
          }}
        if (this.state.filesData.length > 0) {
          if (routeToIop == "Y") {
            this.props.submitFilesInvoice(loginId, this.state.quoteUnid == '' ? this.state.advSearchQuoteunid : this.state.quoteUnid, filesPostRequest, this.state.filesData[0].category).then((action) => {
              if (action.type === 'SUBMIT_QUOTE_FILE_SUCCESS') {
                this.props.handleHideModal("files uploaded successfully")
              }
            }).catch(err => {
              console.log('err', err)
            })
          }
          else {
            uploadFilesWO(loginId, this.state.quoteUnid == '' ? this.state.advSearchQuoteunid : this.state.quoteUnid, this.state.filesData[0].category, filesPostRequest).then((action) => {
              if (action.type === 'UPLOAD_FILES_SUCCESS_WO') {
                this.props.handleHideModal("files uploaded successfully")
              }
            }).catch(err => {
              console.log('err', err)
            })
          }
        }
      } else {
        let err = this.props.submitquoteErr?.toJS();
        let quoteErr;
        if (err) {
          if (err.message) {
            quoteErr = err.message;
          } else {
            quoteErr = "Unable to submit. Please try later";
          }
        } else {
          quoteErr = "Unable to submit. Please try later";
        }
        this.setState({ pageLoading: false,submissionInProgress:false ,quoteErr });
      }
    }).catch(err => {
      let quoteErr;
        if (err) {
          if (err.message) {
            quoteErr = err.message;
          } else {
            quoteErr = "Unable to submit. Please try later";
          }
        } else {
          quoteErr = "Unable to submit. Please try later";
        }
        this.setState({ pageLoading: false,submissionInProgress:false, quoteErr });
    })
    if(this.state.invoicingMsg){
      let {invoiceOosVendor=null, invoiceOosNA=null} = this.props.config?.toJS()
      invoiceOosNA === 'Y' && this.sendEmailNotificationReq();
      invoiceOosVendor === 'Y' && this.sendEmailNotificationVendor()
    }
  
  }
  else{
        this.setState({ isFindings: true });
      
  }
  }
  else{
    if (matchingItems.length > 0) {
      this.sendEmailNotification(matchingItems)
      }
    const postReq = this.formPostRequest()
    const { vendorId, loginId, submitFixedQuoteInvoice, logAction, uploadFilesWO, formName, market, submarket, workorderId, config } = this.props
    let routeToIop = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ROUTE_OPS_TO_IOP")?.ATTRIBUTE_VALUE;
    this.setState({ pageLoading: true,submissionInProgress:true })
    let updatedFilesFlag = false;
    let updatedFilesData;
    submitFixedQuoteInvoice(vendorId, loginId, this.state.quoteUnid == '' ? this.state.advSearchQuoteunid : this.state.quoteUnid, formName == 'SubmitQuote' ? actionstatus == 'DECLINE' ? 'rfqvendordecline' : 'rfqreply' : 'COMPLETE', postReq, this.props.wo_meta_universalid).then(async action => {
      if (action.type == 'SUBMIT_FPQUOTE_SUCCESS') {
        let category = this.props.formName === "SubmitQuote" ? "Quote" : "Invoice";
        logActioninDB(loginId, this.props.user && this.props.user.get('email'), vendorId, workorderId, market, submarket, category + " Submitted",'','','');
        this.props.handleHideModal("Details updated successfully")
        this.setState({ pageLoading: false,submissionInProgress:false })
        if(Array.isArray(this.state.auditData?.lineItems) && this.state.auditData?.lineItems.length > 0){
        const patchAuditReq = this.patchAuditRequest()
        const {auditId, userId,input}=patchAuditReq;
        const patchAuditResponse = await this.props.patchAudit(auditId,input, userId);
        if (patchAuditResponse.type === 'PATCH_AUDIT_SUCCESS') {
          this.setState({ patchAuditInvoiceData: patchAuditResponse.patchAuditData.data.lineItems});
        } else if (patchAuditResponse.type === 'PATCH_AUDIT_FAILURE') {
          this.setState({ patchAuditInvoiceData: [] });
        }
        if(patchAuditResponse?.patchAuditData.data.lineItems.length>0){
          updatedFilesData= this.updateFilesDataWithVendorWorkorderLineItemId(patchAuditResponse.patchAuditData.data.lineItems);
          this.setState({ filesData: updatedFilesData });
          updatedFilesFlag=true;
        }
      }
      let filesPostRequest;
      if(updatedFilesFlag){
        filesPostRequest = {
          "files": routeToIop == "Y" ? this.formUploadFilesPostRequest(updatedFilesData) : this.formFilesPostRequest(updatedFilesData)
        }
      }else{
      filesPostRequest = {
        "files": routeToIop == "Y" ? this.formUploadFilesPostRequest(this.state.filesData) : this.formFilesPostRequest(this.state.filesData)
      }}
          this.setState({ disregardReason: "" });
        if (this.state.filesData.length > 0) {
          if (routeToIop == "Y") {
            this.props.submitFilesInvoice(loginId, this.state.quoteUnid == '' ? this.state.advSearchQuoteunid : this.state.quoteUnid, filesPostRequest, this.state.filesData[0].category).then((action) => {
              if (action.type === 'SUBMIT_QUOTE_FILE_SUCCESS') {
                this.props.handleHideModal("files uploaded successfully")
              }
            }).catch(err => {
              console.log('err', err)
            })
          }
          else {
            uploadFilesWO(loginId, this.state.quoteUnid == '' ? this.state.advSearchQuoteunid : this.state.quoteUnid, this.state.filesData[0].category, filesPostRequest).then((action) => {
              if (action.type === 'UPLOAD_FILES_SUCCESS_WO') {
                this.props.handleHideModal("files uploaded successfully")
              }
            }).catch(err => {
              console.log('err', err)
            })
          }
        }
      } else {
        let err = this.props.submitquoteErr?.toJS();
        let quoteErr;
        if (err) {
          if (err.message) {
            quoteErr = err.message;
          } else {
            quoteErr = "Unable to submit. Please try later";
          }
        } else {
          quoteErr = "Unable to submit. Please try later";
        }
        this.setState({ pageLoading: false,submissionInProgress:false, quoteErr });
      }
    }).catch(err => {
      let quoteErr;
        if (err) {
          if (err.message) {
            quoteErr = err.message;
          } else {
            quoteErr = "Unable to submit. Please try later";
          }
        } else {
          quoteErr = "Unable to submit. Please try later";
        }
        this.setState({ pageLoading: false,submissionInProgress:false, quoteErr });
    })
    if(this.state.invoicingMsg){
      let {invoiceOosVendor=null, invoiceOosNA=null} = this.props.config?.toJS()
      invoiceOosNA === 'Y' && this.sendEmailNotificationReq();
      invoiceOosVendor === 'Y' && this.sendEmailNotificationVendor()
    }
      }
    }
  
  sendEmailNotificationReq= () => {
    let { s4_po_num, workorder_id, requestor_email,site_name} = this.props.workOrderDetailInfo?.toJS()
    let bodyMessage =`<p>The SES for purchase order ${s4_po_num} for work order ${workorder_id}, site ${site_name} was approved before the work was completed in IOP OpsPortal. This is flagged as a violation of the work order accepted process. Please ensure that the right process is followed going forward</p>`;
    let emailNotification = {
        body: bodyMessage,
        from: 'Vendor Portal',
        recipients: [requestor_email],
        sourceName: 'Vendor Portal',
        subject: 'Purchase order SES approved before work accepted',
        transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
    }
    this.props.ivrEmailNotify(this.props.loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } })
       
}
  sendEmailNotificationVendor= () => {
    let { approved_vendor_email,s4_po_num, workorder_id, site_name} = this.props.workOrderDetailInfo?.toJS()
    let bodyMessage =`<p>The invoice was submitted for purchase order ${s4_po_num} for work order ${workorder_id}, site ${site_name} to Ariba/Verizon Accounts Payable before the work order was completed in OpsPortal. This is flagged as a violation of the work order complete and invoice process. Please ensure that the right process is followed going forward.</p>`;
    let emailNotification = {
        body: bodyMessage,
        from: 'Vendor Portal',
        recipients: approved_vendor_email?.split(';').filter(i => i.includes('@')),
        sourceName: 'Vendor Portal',
        subject: 'PO invoice submitted in Ariba before work completed in OpsPortal',
        transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
    }
    this.props.ivrEmailNotify(this.props.loginId, { query: ivrEmailNotification, variables: { ivr_email_request: emailNotification } })
       
}

  onSubmit = (actionstatus) => {
    if (actionstatus == 'CLEAR_MESSAGE') {
      this.setState({ invoicingMsg: null })
      return;
    }
    if (actionstatus == 'DISREGARD') {
      this.setState({ disregardFlag: true,initialComments: this.state.comments  }, () => {
        this.onSubmission(actionstatus);
      });
    }
    else {
      if (this.state.enableDeclined && this.props.formName == 'SubmitQuote' && actionstatus != 'DECLINE') {
        this.setState({ showSection: true })
      }
      else {
        this.setState({ showSection: false,initialComments: this.state.comments , pageLoading: true,submissionInProgress:true });
        this.onSubmission(actionstatus);
      }
    }
  }
  sendEmailNotification(matchingItems) {
    let userData = (this.props.userList && this.props.userList.toJS() && (this.props.userList.toJS().length > 0)) ? this.props.userList.toJS() : []
    let vendorServiceEmail = userData && userData.length > 0 ? userData[0].vendor_service_email : null;
    let requesterEmail = this.props.workOrderDetailInfo.get("requestor_email");
    let vendorEmails = vendorServiceEmail?.includes(';') ? 
      vendorServiceEmail.split(';').filter(email => email.trim() !== '') : 
      [vendorServiceEmail];
    let allRecipients = [requesterEmail, ...vendorEmails].filter(email => email);
    let messageBody = '';
      messageBody = `
        <div style="max-width:600px;margin:0 auto;background:#eceff1;min-height:600px">
          <h2 style="background:#ff9800;color:#ffffff;padding:10px;margin:0px">Incentive Summary</h2>
          <div style="padding:10px;color:#000">
          <p style="margin-bottom:20px;">
            Please be advised that an incentive has been included with your work order in recognition of its prompt completion.
            Please find the details regarding this incentive below. We appreciate your efficiency and dedication to completing the work order promptly.
          </p>
            <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse: collapse;text-align: center;">
              <thead style="background-color: #F6F6F6; color: black;">
                <tr>
                  <th style="border: 1px solid #999;">Requestor</th>
                  <th style="border: 1px solid #999;">Service Type</th>
                  <th style="border: 1px solid #999;">Bid Unit</th>
                  <th style="border: 1px solid #999;">Unit</th>
                  <th style="border: 1px solid #999;">Cost Type</th>
                  <th style="border: 1px solid #999;">Rate</th>
                  <th style="border: 1px solid #999;">Qty</th>
                  <th style="border: 1px solid #999;">Cost</th>
                  <th style="border: 1px solid #999;">Notes</th>
                </tr>
              </thead>
              <tbody>
                ${matchingItems.map(val => `
                  <tr>
                    <td style="border: 1px solid #999;">${val.cfdlineitemlongdesc || ''}</td>
                    <td style="border: 1px solid #999;">${val.cfdlineitemservicetype || ''}</td>
                    <td style="border: 1px solid #999;">${val.cfdlineitembidunit || ''}</td>
                    <td style="border: 1px solid #999;">${val.cfdlineitemunit || ''}</td>
                    <td style="border: 1px solid #999;">${val.cfdlineitemcostcat || ''}</td>
                    <td style="border: 1px solid #999;">$${val.cfdlineitemppu || ''}</td>
                    <td style="border: 1px solid #999;">${val.cfdlineitemqty || ''}</td>
                    <td style="border: 1px solid #999;">$${val.cfdlineitemtotal || 0}</td>
                    <td style="border: 1px solid #999;">${val.cfdlineitemnotes || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

    let emailNotification = {
      body: messageBody,
      from: 'Vendor Portal',
      recipients: allRecipients,
      sourceName: 'Vendor Portal',
      subject: 'Verizon Work Order - ' + this.props.workOrderDetailInfo.get("workorder_id")+' - '+this.props.workOrderDetailInfo.get("priority")+ ' - '+
      this.props.workOrderDetailInfo.get("work_type")+' - '+this.props.workOrderDetailInfo.get("site_name"),
      transactionId: 'VendorPortal_' + moment().format('DD-MMM-YY hh.mm.ss.SSSSSSSSS A')
    };

    this.props.ivrEmailNotify(this.props.loginId, {
      query: ivrEmailNotification,
      variables: { ivr_email_request: emailNotification }
    }).then(action => {
      if (action?.response?.data?.ivrEmailNotification?.code == 200) {
        toast.success("Email notification successfully delivered", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    });
}

submitAdditionalAttachments =() =>{
  
  const {  loginId, formName, config, vendorId, workorderId, market, submarket } = this.props
  var filesPostRequest = {
    "files": this.formUploadFilesPostRequest(this.state.filesData)
  }
  this.setState({ pageLoading: true })
      this.props.submitFilesInvoice(loginId, this.state.quoteUnid == '' ? this.state.advSearchQuoteunid : this.state.quoteUnid, filesPostRequest, this.state.filesData[0].category).then((action) => {
        this.setState({ pageLoading: false })
        if (action.type === 'SUBMIT_QUOTE_FILE_SUCCESS') {
          let category = this.props.formName === "SubmitQuote" ? "Quote" : "Invoice";
          logActioninDB(loginId, this.props.user && this.props.user.get('email'), vendorId, workorderId, market, submarket, category + " Additional Attachments Submitted",'','','');
          this.props.handleHideModal("files uploaded successfully")
        }
      }).catch(err => {
        this.setState({ pageLoading: false })
        console.log('err', err)
      })
}
  renderLoading = () => {
    const isSubmissionLoading = this.state.pageLoading && this.state.submissionInProgress;
  
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Loader 
        color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center" 
      />
     {isSubmissionLoading && (this.state.enableAInDFlag || this.state.disregardFlag) && (
        <div style={{ 
          marginTop: '20px', 
          fontSize: '18px', 
          fontWeight: 'bold',
          fontFamily: 'Verizon NHG eDS'
        }}>
          {this.state.disregardFlag 
            ? 'Submission is in progress...' 
            : (this.props.formName === 'Invoice' ? 'Invoice Review is in progress...' : 'Processing your request...')
          }
        </div>
      )}
    </div>
  )
  }
  getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  async handleDropdownChange (e) {
    document.getElementById('search-bar').value = ''
    
    await this.setState({currentDropdownValue: e, rateTypeChange: true}, async () => {
      await this.fetchCatalogData()
    })


  }
  async handleDropdownChangeWorkType (e) {
    document.getElementById('search-bar').value = ''
    

    await this.setState({currentDropdownValueWorkType: e}, async () => {
      await this.fetchCatalogData()
    })


  }
  handleCostChangeNoln =(e) => {
   
    this.setState({[e.target.name]: e.target.value })
  }

  setMatrixPriceFixed = (val) => {
    const service = this.state.fixedServicesData.find(s => s.service_type === val.cfdlineitemservicetype);
    val.is_matrix = get(service, 'is_matrix');
    val.pricing_fixed = get(service, 'pricing_fixed');
  }
  apiRef = params =>{
    window.addEventListener('resize', function() {
      setTimeout(function() {
        params?.autosizeColumns({
          includeHeaders: true,
          includeOutliers: true,
        })
      })
    })
  }
  getRowId =(row, index) => {
    return row.meta_universalid;
  }

  render () {
  let ismat = this.state.formattedLnItems?.filter(e=> e.cfdlineitemismatrix == "1")?.length;
  let anyIsMatrix = ismat ? true : false;
  const isunique = this.state.modfdGridDetails.length == new Set(this.state.modfdGridDetails.map(obj=>obj.meta_universalid)).size;
  let totalRate = this.getQuotesTotal();
  let materialCost = this.getQuotesSubTotal('Material');
  let {po_number, s4_po_num, invoicing_oos} = this.props.workOrderDetailInfo && this.props.workOrderDetailInfo.toJS() 
  let erp = false
  let bidUnits = []
  let selectedbidUnits = []
  let selectedEmailbidUnits = []
  let formatbidUnits = []
  let reqDocs = []
  let issoCondition = false
  let { realLoginId, loginId, isssouser, ssoUrl, config, realUser, troubleshooting_units, mobilization_units,mm_supplier_name,mm_supplier_bidunit} = this.props
  let emailBidUnits =  config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "BID_UNITS_REQUIRE_EMAIL_APPROVAL") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "BID_UNITS_REQUIRE_EMAIL_APPROVAL").ATTRIBUTE_VALUE.split(",")
  || []
  //offshore condition
  let offShore = false;
  let hasDc006 = this.state.formattedLnItems.some(e=> e.bid_unit == "DC-006");
  let hasmmob020 =  this.state.formattedLnItems.some(e=> e.bid_unit == "MMOB-020");
  let hasmmob021 = this.state.formattedLnItems.some(e=> e.bid_unit == "MMOB-021");
  let distance = this.state.distanceMob != 9999 && this.state.distanceMob > 150;
  let dc006 = false;
    const status = [
      "WORKFUNDINGAPPROVAL",
      "PO_REQUEST",
      "WORKACCEPTED",
      "UPFUNDED_PO_REQUEST"

    ];
    const shouldShowFindings = (workOrderInfo) => {
      return status.includes(workOrderInfo.get("workorder_status")?.toUpperCase());
    };

    const { formName } = this.props;
    const {
      comments,
      filesData,
      enableDeclined,
      showSection,
      fixedFlag,
      formattedLnItems,
      currentDropdownValueWorkType,
      totalCostNoLn,
      laborCostNoLn,
      fuelCostNoLn,
      materialCostNoLn,
      rentCostNoLn

    } = this.state;

    const { workOrderDetailInfo, workORderInfo } = this.props;
    const isDeclined = workORderInfo.get("quote_statuses") === 'QUOTEDECLINED';
    let declineHistory = [];
    const historyJson = workOrderDetailInfo.get("cfd_quote_decline_history_json_1");

    if (isDeclined && historyJson) {
      try {
        declineHistory = JSON.parse(historyJson);
        // Sort by datetime descending to show the latest decline first
        declineHistory.sort((a, b) => new Date(b.decline_datetime) - new Date(a.decline_datetime));
      } catch (e) {
        console.error("Failed to parse quote decline history:", e);
        declineHistory = [];
      }
    }

    let completedLineitems = this.state.auditInvoiceData?.lineItems;
    let completedWorkorders = this.state.auditInvoiceData?.workorderDetails;
    let disregardReason = this.state.auditInvoiceData?.overrideComments || "";
    let isOverridden = this.state.auditInvoiceData?.isOverridden;
    const costLimit = this.isCostLimitBreached();
    const {allRequiredFilesAttached}=this.state;
    const disableSubmit = !allRequiredFilesAttached ||
    this.NotesMandatory(bidUnits, anyIsMatrix) || !!costLimit ||
    this.dateMandatory(anyIsMatrix) ||
    (formName === "Invoice" && this.bidUnitDateMandatory(this.state.formattedLnItems)) ||
    this.disableDate(anyIsMatrix) ||
    issoCondition ||
    comments.trim().length === 0 ||
    (formName === "Invoice" && this.state.fixedFlag && this.state.filesData.length === 0 && (reqDocs.length > 0 || selectedEmailbidUnits.length > 0)) ||
    (formName === "Invoice" &&
      materialCost > 0 &&
      ["generator", "hvac"].includes(currentDropdownValueWorkType?.value?.toLowerCase()) &&
      filesData.length === 0) || (this.props.formName == 'Invoice' && this.state.recalculateDistance);
    const rateChanged = this.hasLineItemRateChanged();
    const fileChanged = this.hasFileChanged();
    const disableInvoiceReworkSubmit = disableSubmit || (this.state.isFindings && !rateChanged && !fileChanged && !costLimit ) ;
    const disableDecline = issoCondition || showSection || comments.trim().length === 0;
    if(this.props.formName == "Invoice"  && distance && ((hasDc006 && hasmmob020) || (hasDc006 && hasmmob021))){
    dc006 = true;
    }
    if (realUser && realUser.toJS() && realUser.toJS().isUserOffShore) {
      offShore = realUser.toJS().isUserOffShore
    }
    if (realLoginId && loginId && realLoginId != loginId && isssouser && ssoUrl && ssoUrl.includes('ssologin') || offShore === "true") {
      issoCondition = true
    }
    let esaFlag = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "ENABLE_ESA")?.ATTRIBUTE_VALUE;
    
    let mob_units = mobilization_units;
    let isAcceptedOrCompleted = ["work completed","work accepted","awaiting po"].includes(this.props.selectedWorkOrderTitle?.toLowerCase());
    bidUnits = [...mobilization_units, ...troubleshooting_units]
    if(!bidUnits){
      bidUnits = []
    }
    const applicableBidUnits = bidUnits;
    let bidUnitsReqDoc = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "BID_UNITS_REQUIRE_DOC") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "BID_UNITS_REQUIRE_DOC").ATTRIBUTE_VALUE.split(",")
    if(!bidUnitsReqDoc){
      bidUnitsReqDoc = []
    }
    let bidInvoiceZero = this.props.workorderPriority?.includes("BID") && this.props.formName == "Invoice" && (parseInt(this.state.totalCostPrev) == 0) || false;
    let erpConfigFlag = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "ENABLE_ERP") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "ENABLE_ERP").ATTRIBUTE_VALUE
    let MMIDLISTS = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "MOBILIZATION_MMIDS") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "MOBILIZATION_MMIDS").ATTRIBUTE_VALUE.split(",")
    let qtyEnableUnits = config && config.toJS() && config.toJS().configData && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "1ERP_QTY_ENABLE") && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "1ERP_QTY_ENABLE").ATTRIBUTE_VALUE && config.toJS().configData.find(e => e.ATTRIBUTE_NAME === "1ERP_QTY_ENABLE").ATTRIBUTE_VALUE.split(",").map(e=>e.toLowerCase());
    if(!qtyEnableUnits){
      qtyEnableUnits = ["half day", "hourly", "per foot", "per jumper", "per crew per mile" ];
    }
    if(!MMIDLISTS){
      MMIDLISTS=["000000001300040056","000000001300039948","000000001300040130","000000001300039968","000000001300040020","000000001300040031"];
    }
    if(erpConfigFlag == "Y"){
    if(this.props.formHeader == "Submit Invoice"){
      if((po_number && po_number.length>0 &&  s4_po_num && s4_po_num.length>0) || (s4_po_num && s4_po_num.length>0 && s4_po_num.startsWith("9000"))){ 
        erp = true
      }
    }
    }
    if(this.state.selectedServices?.length>0){
      selectedbidUnits = this.state.selectedServices.filter(e=> bidUnits?.includes(e.bid_unit))
    } 
    if(this.state.formattedLnItems?.length>0){
      formatbidUnits = this.state.formattedLnItems.filter(e=> bidUnits?.includes(e.bid_unit))
      reqDocs = this.state.formattedLnItems.filter(e=> bidUnitsReqDoc.includes(e.bid_unit))
      selectedEmailbidUnits = this.state.formattedLnItems.filter(e=> emailBidUnits?.includes(e.bid_unit))

    }
    if(this.state.selectedServices?.length>0 && MMIDLISTS.length>0)
    {
      this.state.selectedServices.forEach(val=>{
        if(val.cfdlineitemunit=='Per Crew Per Mile'&& MMIDLISTS.includes(val.cfdlineitemmmid) && this.state.fixedFlag){
          this.mobCharge=true;
        }
      })
    }
    
    const activeLineItems = (this.state.formattedLnItems || []).filter(li => {
      return !(li.action == 'Del' || li.cfdlineitemstatus == 'D' || li.deleteme == '1');
    });
    let hasTrouble = activeLineItems.some(li =>
      troubleshooting_units.includes((li.cfdlineitembidunit || li.bid_unit || '').toUpperCase())
    );
    let hasMob = activeLineItems.some(li =>
      mobilization_units.includes((li.cfdlineitembidunit || li.bid_unit || '').toUpperCase())
    );

    let submitButton = ''
    if(this.props.formName  == 'Invoice'){
      submitButton = 'Work Complete/Submit'
    }
    else{
      submitButton = 'Submit'
    }
    
    let quote_files = []
    this.props.attachedList.forEach(fileObj => {
      let file = fileObj.toJS()
      if (file["category"] == "quote") {
        quote_files.push(

                    <span key={file['file_name']} className="file_tag_designe" style={{cursor: 'pointer'}}>
                        <span style={{color: '#FFF'}} onClick={() => this.downloadFile(file)}>{file['file_name']}</span>
                    </span>)
      }

    })
    let invoice_files = []
    this.props.attachedList.forEach(fileObj => {
      let file = fileObj.toJS()
      if (file["category"] == "invoice") {
        invoice_files.push(

                    <span key={file['file_name']} className="file_tag_designe" style={{cursor: 'pointer'}}>
                        <span style={{color: '#FFF'}} onClick={() => this.downloadFile(file)}>{file['file_name']}</span>
                    </span>)
      }
    })

    const customStyles = {
      control: base => ({
        ...base,
        height: 30,
        minHeight: 30
      })
    }
  //   let selectall = erp && this.props.formHeader == "Submit Invoice" ?: { headerName: "", headerTooltip: "Select", tooltipField: "select", width: 10, checkboxSelection: false, headerCheckboxSelection: false, headerCheckboxSelectionFilteredOnly: false,}

    let columns = [
      {
        headerName: "", field: null,  flex:0.5,
        renderCell: function (row) {
         let params = row.row;
          if (params && params.displayLongDesc) {return <span><i class="fas fa-info-circle fa-2x" title={params.displayLongDesc ? params.displayLongDesc : ''} style={{cursor: "pointer"}}></i></span>} else return null
        }
      },
      {
        headerName: "Service Category/Work Type", field: "listname",  flex:2, 
      },
      {
        headerName: "Service Type", field: "cfdlineitemservicetype",    flex:2,
        renderCell: (row) => {
          let params = row.row;
          if (params.cfdlineitemservicetype) {
            return params.cfdlineitemservicetype.split('(Email Pre-approval by VZ Required)').map((part, index) => 
              <span key={index}>
                {part}
                {index === 1 ? <span style={{color: "red", fontWeight: "bold"}}>(Email Pre-approval by VZ Required)</span> : ''}
              </span>
            ); // Combine the parts into a single HTML string
          } else {
            return '';
          }
        }
        
      },
      {
        headerName: "Bid Unit", hide : !this.state.fixedFlag, field: "cfdlineitembidunit",  flex:0.7
      },
      {
        headerName: "Rate", field: "cfdlineitemppu", flex:0.7
      },
      {
        headerName: "Unit", field: "cfdlineitemunit",   flex:0.7
      },
      {
        headerName: "Cost Category", field: "cfdlineitemcostcat",   flex:0.7
      }
    ]
    if (this.state.isworkCompleted || (this.props.formName == "Invoice" && this.props.workoderinfo?.quote_statuses == "COMPLETED" && this.props.workoderinfo?.work_declined_count<1)) {
      return (<div style={{ position: 'relative' }}>
        {this.state.pageLoading && this.state.submissionInProgress && this.state.enableAInDFlag && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.5)', // Changed to grey for brighter appearance
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
     
        <Loader 
          color="#cd040b"
          size="55px"
          margin="4px"
          className="text-center" 
        />
        <div style={{ 
          marginTop: '20px', 
          fontSize: '18px', 
          fontWeight: 'bold',
          // color: '#ffffff',
          fontFamily: 'Verizon NHG eDS'
        }}>
            {this.state.disregardFlag 
            ? 'Submission is in progress...' 
            : (this.props.formName === 'Invoice' ? 'Invoice Review is in progress...' : 'Processing your request...')
          }
        </div>
     
    </div>
  )}
                {this.state.pageLoading && !this.state.submissionInProgress ? this.renderLoading() : 
  this.state.pageLoading && this.state.submissionInProgress && !this.state.enableAInDFlag ? this.renderLoading() :
  <div className="container-fluid" style={{
    opacity: this.state.pageLoading && this.state.submissionInProgress && this.state.enableAInDFlag ? 0.3 : 1,
    pointerEvents: this.state.pageLoading && this.state.submissionInProgress && this.state.enableAInDFlag ? 'none' : 'auto',
    transition: 'opacity 0.3s ease'
  }}>
                <div className="row">
                            <h4 className="col-md-3 float-left"></h4>
                            <div className="col-md-7 row">
                                <div className="col-md">
                                <h4>Labor: {this.state.laborCostNoLn	|| 0.00}</h4>
                                </div>
                                <div className="col-md">
                                <h4>Material : {this.state.materialCostNoLn || 0.00}</h4>
                                </div>
                                <div className="col-md">
                                <h4>Fuel : {this.state.fuelCostNoLn || 0.00}</h4>
                                </div>
                                <div className="col-md">
                                <h4>Rental : {this.state.rentCostNoLn	|| 0.00}</h4>
                                </div>
                            </div>
                            <div className="col-md-2"></div>

                        </div>
                         {(this.state.currentDropdownValueWorkType?.value === 'Antenna / Tower' || this.state.currentDropdownValueWorkType?.value === 'Small Cell') && (
                           <p style={{marginLeft:"19%",fontFamily: "BrandFont-Text, Helvetica, Arial, sans-serif",
fontSize:"1rem",color:"#000"}}>The Work Order Location is {this.state.distanceMob} Miles from {this.state.address ? this.state.address :'The Closest Vendor Dispatch Location'}. {this.state.distanceMob == 9999 && this.props.workOrderDetailInfo.get("work_type")?.toLowerCase() == 'antenna / tower' && <span style={{ color: 'red', fontWeight: 'bold' }}>No Vendor dispatch location stored in the system for mileage calculation</span>} </p>
                         )}
                    <table cellPadding="0" cellSpacing="0" style={{"borderCollapse": "collapse", "textAlign": "center"}} className="center-align-table">
                            <thead style={{"backgroundColor": "#f6f6f6", "color": "black"}}>
                                <tr>

                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Requestor</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Service Type</th>
                                    {this.state.fixedFlag &&  <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Bid Unit</th>}
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Unit</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Cost Type</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Rate</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Qty</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Cost</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Line No</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Notes</th>
                                    {isAcceptedOrCompleted && <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Status</th>}

                                </tr>
                            </thead>
                            <tbody className="text-center">
              {this.state.formattedLnItems.length > 0 && this.state.formattedLnItems.filter(i => i.cfdlineitemservicetype).length > 0 &&
                this.state.formattedLnItems.map((val, index) => {
                  // Get findings for this line item
                  const completedfindingsForThisLine = this.state.auditInvoiceData?.lineItems?.filter(item => {
                    if (item.esaLineNum && val.cfdlineitemesalinenum) {
                      return item.esaLineNum === val.cfdlineitemesalinenum;
                    } else {
                      const metaIdToCompare = item.poMetaUniversalId || item.invoiceMetaUniversalId;
                      return metaIdToCompare === val.cfdlineitemunid &&
                        item.bidUnit === val.cfdlineitembidunit;
                    }
                  })?.[0]?.auditFindings || [];


                  return (
                    <React.Fragment key={`lineitem-group-${index}`}>
                      {/* Line item row */}
                      <tr key={`lineitem-${index}`}>
                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemlongdesc ? val.cfdlineitemlongdesc : ''}</td>
                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemservicetype ? val.cfdlineitemservicetype : ''}</td>
                        {this.state.fixedFlag && <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitembidunit ? val.cfdlineitembidunit : ''}</td>}
                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemunit ? val.cfdlineitemunit : ''}</td>
                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemcostcat ? val.cfdlineitemcostcat : ''}</td>
                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemppu ? val.cfdlineitemppu : ''}</td>
                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemqty ? val.cfdlineitemqty : ''}</td>
                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemtotal ? val.cfdlineitemtotal : 0}</td>
                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemesalinenum ? val.cfdlineitemesalinenum : ''}</td>

                        <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>
                          {this.formatNotesWithIcon(val.cfdlineitemnotes || '', val, index)}
                        </td>
                        {isAcceptedOrCompleted && <td style={{ "border": "0.21px solid rgba(51, 51, 51, 0.41)" }}>{val.cfdlineitemstatus ? val.cfdlineitemstatus == "A" ? 'Active' : val.cfdlineitemstatus == "D" ? 'Deleted' : '' : ""}</td>}
                      </tr>

                      {/* Findings row - displayed immediately after its line item */}

                      {(completedfindingsForThisLine.length > 0 &&
                        (this.state.enableAInDFlag &&
                          shouldShowFindings(this.props.workORderInfo))) && (
                          <tr key={`findings-${index}`}>
                            <td colSpan={this.state.fixedFlag ? (anyIsMatrix && this.props.formName == "Invoice" ? 16 : 15) : (anyIsMatrix && this.props.formName == "Invoice" ? 15 : 14)}
                              style={{ padding: 0, width: '100%', backgroundColor: 'rgb(255, 240, 231)' }}>
                              <InvoiceAuditFindings findings={completedfindingsForThisLine} />
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  );
                })
              }
                            </tbody>
                        </table>

          {(this.state.enableAInDFlag &&
            shouldShowFindings(this.props.workORderInfo)) &&      
            (<InvoiceSubmit
              onDrop={this.onFileDrop.bind(this)}
              filesData={this.state.filesData}
              comments={this.state.comments}
              onCommentChange={this.handleCommentsChange.bind(this)}
              onRemoveFile={this.onInvoiceAttachRemove.bind(this)}
              onSubmit={this.onSubmit.bind(this)}
              isFindings={this.state.isFindings}
              onDecline={this.onSubmit.bind(this, 'DECLINE')}
              enableDeclined={this.state.enableDeclined}
              showSection={this.state.showSection}
              formName={this.props.formName}
              bidUnitRules={this.state.bidUnitRulesResponse}
              bidUnitLineItem={this.state.formattedLnItems}
              auditFindings={this.state.inviceSubmitResponse}
              workorderPriority={this.props.workorderPriority}
              disableSubmit={disableSubmit}
              disableDecline={disableDecline}
              submitButtonText={this.props.formName === 'Invoice' ? 'Work Complete/Submit' : 'Submit'}
              disregardReason={this.state.disregardReason}
              onDisregardReasonChange={this.handleDisregardReasonChange}
              isworkCompleted={this.state.isworkCompleted}
              completedLineitems={completedLineitems}
              completedWorkorders={completedWorkorders}
              statusConditions={status}
              workorderStatus={this.props.workORderInfo.get("workorder_status")}
              
            />)}


         {(this.state.enableAInDFlag && isOverridden === "Y")&& <div>
          <h4 style={{ fontWeight: "bold", fontFamily: 'Verizon NHG eDS ' }}>
              Reason For Disregard AI Audit Findings
          <textarea
              className="form-control"
              rows="3"
              value={disregardReason}
              style={{ marginTop: "10px", fontFamily: 'Verizon NHG eDS ', width: "100%",height: "88px", resize: 'none' }}
            />
            </h4>

          </div>
    }
                        {this.props.formName == "Invoice" && this.props.workoderinfo?.quote_statuses == "COMPLETED" && this.props.workoderinfo?.work_declined_count<1 && !this.state.isworkCompleted &&
                          <div className="col-md-12">
                              <div className="text-center" style={{ color: 'blue', fontWeight: 'bold' }}>The invoice has been submitted already. Please use Report Issue to report this out of sync condition to the application support team.</div>
                            </div> }
                        {this.state.formattedLnItems.find(v => !!v.cfdvendorcomments) && <div>
                            <h4>Vendor Comments</h4>
                            {this.props.wobyUnid && this.props.wobyUnid?.toJS()?.priority?.includes("BID") ?
                              <div> {this.state.formattedLnItems.find(v => v.cfdvendorcomments).cfdvendorcomments?.split("Completion Comments:")[0]} </div>
                              : null}
                            {this.props.wobyUnid && this.props.wobyUnid?.toJS()?.work_completed_comments ?  <div> Work Completion Comments: {this.props.wobyUnid.toJS().work_completed_comments} </div>: null}
                        </div>}
                        <div className="row mb-3">
                   {quote_files.length > 0 && (<div className="col-md-4 float-left" style={{marginTop: '20px'}}>
                        <div className="col-sm-12 no-padding float-left" style={{"fontSize": "1em", "fontWeight": "600", "textAlign": "left"}}>
                            <lable> Quote Attached Files :</lable>
                        </div>
                        <div className="col-sm-6 no-padding float-left" style={{"textAlign": "left"}}>
                            {quote_files}
                        </div>
                    </div>)}
                    {(invoice_files.length > 0 && !(this.state.enableAInDFlag ) && !shouldShowFindings(this.props.workORderInfo)) && (<div className="col-md-4 float-right" style={{marginTop: '20px'}}>
                      <div className="col-sm-12 no-padding float-right" style={{"fontSize": "1em", "fontWeight": "600", "textAlign": "left"}}>
                        {this.props.formHeader && this.props.formHeader.includes("Quote") ? (<lable> Quote Attached Files :</lable>) : <lable> Invoice Attached Files :</lable> }
                        </div>
                        <div className="col-sm-12 no-padding float-right" style={{"textAlign": "left"}}>
                            {invoice_files}
                        </div>
                    </div>)}
                    {this.props.user.get('vendor_role') == "PORTALADMIN" && 
                    <div className="col-md-8 float-right" style={{marginTop: '20px'}}>
                        <div style={{fontWeight : 'bold', marginBottom:'5px'}}>Add attachments{ <span style ={{'color':'red'}}>*</span>}
                    </div>
                    <div className="row">
                          <div className="col-md-5">
                            <div>
                            <Dropzone style={{width: '67%', minHeight: '5vh', lineHeight: '7vh', border: '2px dashed rgb(102, 102, 102)', 'borderRadius': '5px'}} onDrop={this.onFileDrop.bind(this)}>
                                {({ getRootProps, getInputProps }) => (
                                            <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                                </div>
                                            </section>
                                        )}</Dropzone>
                                        </div>
                            <div >
                                <FileAttachedTable fileList={this.state.filesData} onRemoveClick={this.onAttachRemove.bind(this)} />
                            </div>
                            </div>
                            <div className="col-md-4 mt-2">
                            <button id="Login" type="submit" className=" Button--secondary float-right mt-2"   onClick={this.submitAdditionalAttachments.bind(this)} disabled={issoCondition || this.state.filesData.length == 0 }>Submit</button>
                            </div>
                    </div> 
                  </div>
                   }
                   </div>
                   
                </div>}
                { this.renderOswModal() } 
                { this.renderOswNotesViewModal() }
                </div>
      )
    } else {
      return (
                 <div style={{ position: 'relative' }}>
                  {this.state.pageLoading && this.state.submissionInProgress && this.state.enableAInDFlag && (
         <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.5)', // Changed to grey for brighter appearance
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
     
        <Loader 
          color="#cd040b"
          size="55px"
          margin="4px"
          className="text-center" 
        />
        <div style={{ 
          marginTop: '20px', 
          fontSize: '18px', 
          fontWeight: 'bold',
          // color: '#ffffff',
          fontFamily: 'Verizon NHG eDS'
        }}>
         {this.state.disregardFlag 
            ? 'Submission is in progress...' 
            : (this.props.formName === 'Invoice' ? 'Invoice Review is in progress...' : 'Processing your request...')
          }
        </div>
          </div>
        )}
                {this.state.pageLoading && !this.state.submissionInProgress ? this.renderLoading() : 
  this.state.pageLoading && this.state.submissionInProgress && !this.state.enableAInDFlag ? this.renderLoading() :
  <div className="container-fluid" style={{
    opacity: this.state.pageLoading && this.state.submissionInProgress && this.state.enableAInDFlag ? 0.3 : 1,
    pointerEvents: this.state.pageLoading && this.state.submissionInProgress && this.state.enableAInDFlag ? 'none' : 'auto',
    transition: 'opacity 0.3s ease'
  }}>
                  {this.props.formHeader === "Submit Invoice" && this.state.declineData.length > 0 &&

                    <table cellPadding="0" cellSpacing="0" style={{"borderCollapse": "collapse", "textAlign": "center"}}>
                          <thead style={{"backgroundColor": "#f6f6f6", "color": "black"}}>
                            <tr>
                              <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Declined By</th>
                              <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Declined Date</th>
                              <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>
                                Work Decline Comments
                                {!this.state.viewAll && this.state.declineData.length > 2 && <span className="pull-right" style={{color: "blue", cursor: 'pointer'}} onClick={() => this.setState({viewAll: true})}>View All</span>}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-center">
                              {this.state.declineData.slice(0, this.state.viewAll ? declineData.length : 2).map(val =>
                              (<tr>
                                  <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.declined_by || ''}</td>
                                  <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.declined_date || ''}</td>
                                  <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.declined_comments || ''}</td>
                                </tr>)
                              )}
                          </tbody>
                        </table>
                  }
                  <div className="row">
                    <br></br>
                  {this.state.matrix_banner.length>0 && this.state.matrix_banner[0].ATTRIBUTE_DESCRIPTION == "Y" && this.props.user.get('vendor_pricing_macro_ant_tow') && this.props.user.get('vendor_pricing_macro_ant_tow') == "1" ?
                  <div className='col-md-12 button-class-addservice' style={{wordWrap:'break-word'}}>
                    <b>{this.state.matrix_banner[0].ATTRIBUTE_VALUE}</b>
                    </div>
                   : null }
                    </div>
                    {this.state.matrix_banner.length>0 && this.state.matrix_banner[0].ATTRIBUTE_DESCRIPTION == "Y" && this.props.user.get('vendor_pricing_macro_ant_tow') && this.props.user.get('vendor_pricing_macro_ant_tow') == "1"? <br></br> : null}
                    <div className="row">

                            <h4 className="col-md-3 float-left"></h4>
                            {this.props.formName != 'SubmitQuote' && this.props.workorderPriority != 'DIRECT AWARD' && this.state.formattedLnItems && this.state.formattedLnItems.filter(v => v.cfdlineitemservicetype).length == 0 ?
                            <div className="row">
                               
                               <div className="col-md-2"></div>
                              <div className="col-md-8 row">
                             
                              <div className="col-md">
                                <h4>Total : <input type="number" min={"0"} value={this.state.totalCostNoLn} onChange={this.handleCostChangeNoln.bind(this)} name='totalCostNoLn' style={{height: '100%', width: '70%'}}></input></h4>
                                </div>
                                <div className="col-md">
                                <h4>Labor : <input type="number" min={"0"} defaultValue={this.state.laborCostNoLn} onChange={this.handleCostChangeNoln.bind(this)} name='laborCostNoLn' style={{height: '100%', width: '70%'}}></input></h4>
                                </div>
                                <div className="col-md">
                                <h4>Material : <input type="number" min={"0"} defaultValue={this.state.materialCostNoLn} onChange={this.handleCostChangeNoln.bind(this)} name='materialCostNoLn' style={{height: '100%', width: '70%'}}></input></h4>
                                </div>
                                <div className="col-md">
                                <h4>Fuel : <input type="number" min={"0"} defaultValue={this.state.fuelCostNoLn} onChange={this.handleCostChangeNoln.bind(this)} name='fuelCostNoLn' style={{height: '100%', width: '70%'}}></input></h4>
                                </div>
                                <div className="col-md">
                                <h4>Rental : <input type="number" min={"0"} defaultValue={this.state.rentCostNoLn} onChange={this.handleCostChangeNoln.bind(this)} name='rentCostNoLn' style={{height: '100%', width: '70%'}}></input></h4>
                                </div>
                            </div> </div> :  <div className="col-md-7 row">
                                <div className="col-md">
                                <h4>Labor : {this.getQuotesSubTotal('Labor')}</h4>
                                </div>
                                <div className="col-md">
                                <h4>Material : {this.getQuotesSubTotal('Material')}</h4>
                                </div>
                                <div className="col-md">
                                <h4>Fuel : {this.getQuotesSubTotal('Fuel')}</h4>
                                </div>
                                <div className="col-md">
                                <h4>Rental : {this.getQuotesSubTotal('Rental')}</h4>
                                </div>
                            </div> }
                            <div className="col-md-2"></div>
                             {this.state.totalCostNoLn < (parseFloat(this.state.laborCostNoLn) + parseFloat(this.state.fuelCostNoLn) + parseFloat(this.state.materialCostNoLn)+ parseFloat(this.state.rentCostNoLn) ) && this.props.formName != 'SubmitQuote' && this.props.workorderPriority != 'DIRECT AWARD' && this.state.formattedLnItems && this.state.formattedLnItems.filter(v => v.cfdlineitemservicetype).length == 0 && <h4 className="text-danger"><b>Total cost value should be greater than sub totals</b></h4>}
                        </div>
                        {isDeclined && declineHistory.length > 0 && <QuoteDeclineHistory declineHistory={declineHistory} />}

                    <div className="row mt-3 mb-3" style={{padding: "10px 10px 60px 10px", minHeight: "200px"}}>
                    <h4 >Requested Service</h4>
                    {(this.state.currentDropdownValueWorkType?.value === 'Antenna / Tower' || this.state.currentDropdownValueWorkType?.value === 'Small Cell') && (
                      <p style={{marginLeft:"19%",fontFamily: "BrandFont-Text, Helvetica, Arial, sans-serif",
fontSize:"1rem",color:"#000"}}>The Work Order Location is {this.state.distanceMob} Miles From {this.state.address ? this.state.address :'The Closest Vendor Dispatch Location'}. {this.state.distanceMob == 9999 && this.props.workOrderDetailInfo.get("work_type")?.toLowerCase() == 'antenna / tower' &&<span style={{ color: 'red', fontWeight: 'bold' }}>No Vendor dispatch location stored in the system for mileage calculation</span>}  </p>
                    )}
                        <table cellPadding="0" cellSpacing="0" style={{"borderCollapse": "collapse", "textAlign": "center", "width": "100%"}}>
                            <thead className="text-center" style={{"backgroundColor": "#f6f6f6", "color": "black"}}>
                                <tr className="text-center">

                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}></th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Line No</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)", "paddingLeft":"12px"}}>Req</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Service Type</th>
                                    {this.state.fixedFlag &&  <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)","paddingLeft":"9px"}}>Bid Unit</th>}
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)","paddingLeft":"9px"}}>Unit</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Cost Type</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>Rate Type</th>
                                   <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)","paddingLeft":"7px"}}>Rate</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)","paddingLeft":"7px",minWidth: "60px",width: "60px"}}>Qty</th>
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)","paddingLeft":"7px"}}>Cost</th>
                                    {anyIsMatrix && this.props.formName == "Invoice" && <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)", width:'16%',"paddingLeft":"7px"}}>On-Site Work Date</th>}
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)",width:'16%'}}>Notes
                                      <div style={{fontWeight: 'normal', fontSize: '12px'}}>(* Max 999 characters allowed)</div>
                                    </th>
                                    { this.props.formName == "Invoice" ? <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)","paddingLeft":"7px"}}>Action/Status</th> :
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)","paddingLeft":"7px"}}>Action</th>}
                                    <th style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}></th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                    {this.state.formattedLnItems.length > 0 &&
                      this.state.formattedLnItems.filter((i) => {
                        // Filter out deleted incentive items
                        return (
                          i.cfdlineitemservicetype &&
                          !(
                            i.action === "Del" &&
                            incentiveBidUnits.includes(i.cfdlineitembidunit)
                          )
                        );
                      }).length > 0 &&
                      this.state.formattedLnItems
                        .filter((i) => {
                          // Apply the same filter for the mapping
                          return (
                            i.cfdlineitemservicetype &&
                            !(
                              i.action === "Del" &&
                              incentiveBidUnits.includes(i.cfdlineitembidunit)
                            )
                          );
                        })
                        .map((val, index) => {
                                  let showToolTip=false;let showQtyToolTip=false;
                                  const findingsForThisLine = this.state.inviceSubmitResponse?.bid_unit_findings?.filter(finding => {
                                    const lineNum = val.cfdlineitemesalinenum ? val.cfdlineitemesalinenum.toString() : val.cfdlineitemlinenum
                                    ;
                                    const findingLineNum = finding.line_num ? finding.line_num.toString() : '';
                                    
                                    // Compare both line number and bid unit
                                    return findingLineNum === lineNum && 
                                           finding.bid_unit === val.cfdlineitembidunit;
                                  }) || [];
                                  //For first occurrence of Mobilization
                                  let totalForDateNotes = val.cfdlineitemtotal ? (val.cfdlineitemtotal) | 0 : 0;
                                  if((this.state.fixedFlag && this.props.formName == "Invoice" && (val.action != 'Del') && (totalForDateNotes != 0)  && !(val.cfdlineitemnotes) && val.cfdlineitemlongdesc != "VZ" && bidUnits.includes(val.cfdlineitembidunit)) || this.state.formattedLnItems.indexOf(val)===index && this.state.fixedFlag && val.action == 'Add' && val.unit==="Per Crew Per Mile" && this.state.qtyChange && parseInt(val.cfdlineitemqty) > 0  && val.cfdlineitemnotes==0 && (this.state.distanceMob === 0 || this.state.distanceMob<50 || this.state.distanceMob===9999) || (this.state.fixedFlag && this.props.formName == "Invoice" && val.cfdlineitembidunit.toLowerCase() == "dc-006" && (this.state.distanceMob <150 || this.state.distanceMob == 9999) && val.cfdlineitemnotes==0)) { 
                                   showToolTip=true;
                                  }
                                  if(this.state.formattedLnItems.indexOf(val)===index && this.props.formName == "Invoice" &&  val.action == 'Add' && this.state.qtyChange && parseInt(val.cfdlineitemqty) > 0  && val.cfdlineitemnotes==0 &&  this.state.distanceMob<50 &&  ["MMOB-020", "MMOB-021", "EMMOB-020", "EMMOB-021"].includes(val.cfdlineitembidunit) ) { 
                                   showQtyToolTip=true;
                                   showToolTip=true;
                                  }
                                  if(this.state.formattedLnItems.indexOf(val)===index && this.props.formName == "Invoice" &&  val.action == 'Add'&&  this.state.distanceMob>50 &&  ["MMOB-020", "MMOB-021", "EMMOB-020", "EMMOB-021"].includes(val.cfdlineitembidunit) && this.state.qtyChange && parseInt(val.cfdlineitemqty) > (parseInt(this.state.distanceMob) - 50)  && val.cfdlineitemnotes==0  ) { 
                                   showToolTip=true;
                                  }

                                  if (val.is_matrix === undefined || val.pricing_fixed === undefined){
                                    this.setMatrixPriceFixed(val); 
                                  }
                                  let stat = val.cfdlineitemstatus == "A" ? "Active" : val.cfdlineitemstatus == "D" ?  "Deleted" : "";
                                  let totalForDate = val.cfdlineitemtotal ? (val.cfdlineitemtotal) | 0 : 0;
                                  return (
                                    <React.Fragment key={`lineitem-${index}`}>
                                  <tr >
  
                                       <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)", "textAlign": "center"}}>{val.displayLongDesc && <i className="fas fa-info-circle fa-2x" style={{cursor: 'pointer'}} title={val.displayLongDesc ? val.displayLongDesc : ''}></i>}</td>
                                       <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.cfdlineitemesalinenum ? val.cfdlineitemesalinenum : val.cfdlineitemlinenum
                                       }</td>
                                      <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.cfdlineitemlongdesc ? val.cfdlineitemlongdesc : ''}</td>
                                      <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>
                                        {val.cfdlineitemservicetype ? val.cfdlineitemservicetype.split('(Email Pre-approval by VZ Required)').map((part, index) => (
                                          <span key={index}>
                                            {part}
                                            {index === 1 && (
                                              <span style={{ color: 'red', fontWeight: 'bold' }}>(Email Pre-approval by VZ Required)</span>
                                            )}
                                          </span>
                                        )) : ''}
                                      </td>
                                      {this.state.fixedFlag && <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.cfdlineitembidunit ? val.cfdlineitembidunit : ''}</td>}
                                      <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.cfdlineitemunit ? val.cfdlineitemunit : ''}</td>
                                      <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.cfdlineitemcostcat ? val.cfdlineitemcostcat : ''}</td>
                                      <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.cfdlineitemcosttype && val.cfdlineitemcosttype != '*' ? val.cfdlineitemcosttype : ''}</td>
                                      { 
                                      (val.is_matrix == '1' && val.pricing_fixed == 1)
                                       && val.cfdlineitemppucopy && parseFloat(val.cfdlineitemppucopy) > 0 ?
                                       <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} :
                                        {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>
                                          {val.cfdlineitemppu ? val.cfdlineitemppu : ''}
                                      </td> :
                                      <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>
  <div>
    {val.cfdlineitembidunit &&
    incentiveBidUnits.includes(val.cfdlineitembidunit) ? (
      <span
        id={"rate-" + val.uniqueIdentifier}
        style={{
          height: "100%",
          width: "70%",
          display: "inline-block",
        }}
      >
        {val.cfdlineitemppu ? val.cfdlineitemppu : ""}
      </span>
    ) : (
      <input 
        type="number" 
        min={"0"} 
        value={val.cfdlineitemppu ? val.cfdlineitemppu : ''} 
        disabled={(val.cfdlineitemstatus == "D") || this.props.workorderPriority?.includes("BID") && this.props.formName == "Invoice" && (parseInt(this.state.totalCostPrev) == 0)} 
        onChange={this.handleRateChange.bind(this, val)} 
        id={'rate-' + val.uniqueIdentifier} 
        style={{
          height: '100%', 
          width: '70%',
          border: val.cfdlineitembidunit === 'DC-006' && parseFloat(val.cfdlineitemtotal || 0) > 900 ? '2px solid red' : undefined
        }}
      />
    )}
    
    {/* Add the tooltip for DC-006 cost limit */}
    <Tooltip 
      title={val.cfdlineitembidunit === 'DC-006' && parseFloat(val.cfdlineitemtotal || 0) > 900 ? '$900 limit applies' : ''} 
      open={val.cfdlineitembidunit === 'DC-006' && parseFloat(val.cfdlineitemtotal || 0) > 900} 
      className="tooltip-css" 
      placement='top' 
      arrow 
    >
      <span></span>
    </Tooltip>
  </div>
</td>}
                                    {erpConfigFlag == "Y" && qtyEnableUnits && qtyEnableUnits.length>0 && !qtyEnableUnits.includes((val.cfdlineitemunit).toLowerCase())  ?
                                      <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}><div>
                                      <input type="number" min={"0"} max={"1"} value={typeof val.cfdlineitemqty== "number" ? val.cfdlineitemqty : val.cfdlineitemqty ? val.cfdlineitemqty : ''}
                                       disabled={ (val.cfdlineitemstatus == "D") || ( parseInt(val.cfdlineitemqty) > 0 && qtyEnableUnits && qtyEnableUnits.length>0 && !qtyEnableUnits.includes((val.cfdlineitemunit).toLowerCase()) && val.cfdlineitemlongdesc != "VZ") || (((!val.action || (val.action == "Mod" && val.modifyRate) || (val.action == "Mod" && val.modifyNotes)) && val.cfdlineitemlongdesc == "VZ" && (parseInt(val.cfdlineitemqty) > 0 && qtyEnableUnits && qtyEnableUnits.length>0 && !qtyEnableUnits.includes((val.cfdlineitemunit).toLowerCase()))))} 
                                              onChange={this.handleQtyChange.bind(this, val, erpConfigFlag, qtyEnableUnits)} id={'qty-' + val.uniqueIdentifier} style={{ height: '100%', width: '3vw',textAlign : 'right' }}></input>
                                            <Tooltip title={'Based on system calculation, the mileage adder does not qualify for the starting dispatch location' } open={showQtyToolTip === true ? true : false} className="tooltip-css" placement='top' arrow >
                                              <span></span>
                                            </Tooltip>
                                          </div></td> : 
                                  
                                    <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}><div>
                                    <input type="number" min={"0"} value={val.cfdlineitemqty ? val.cfdlineitemqty : ''} disabled={ (val.cfdlineitemstatus == "D") || this.props.workorderPriority?.includes("BID") && this.props.formName == "Invoice" && (parseInt(this.state.totalCostPrev) == 0) }  onChange={this.handleQtyChange.bind(this, val, erpConfigFlag, qtyEnableUnits)} id={'qty-' + val.uniqueIdentifier} style={{height: '100%', width: '3vw', textAlign : 'right'}}></input>
                                            <Tooltip title={'Based on system calculation, the mileage adder does not qualify for the starting dispatch location'} open={showQtyToolTip === true ? true : false} className="tooltip-css" placement='top' arrow >
                                              <span></span>
                                            </Tooltip>
                                </div></td>}
                                  { 
                                  <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.cfdlineitemtotal ? val.cfdlineitemtotal : 0}</td>
                                  }
                                 
                               { this.props.formName == "Invoice" &&
                                  mm_supplier_bidunit?.includes(val.cfdlineitembidunit) &&
                                  val.cfdlineitemcostcat == "Materials" &&
                                  val.cfdlineitemtotal > 0 ? (
                                    <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)", paddingLeft:"8px", width:'16%'}}>
                                      <div style={{ width: '100%',paddingLeft:'10px',paddingRight:'10px' }}>
                                        <label htmlFor={`mm_supplier_select_${val.uniqueIdentifier}`}>Supplier <span style={{color:'red'}}>*</span></label>
                                        <select
                                          style={{ minWidth: 120,  width: '100%'}}
                                          value={val.cfdlineitemsupplier || ''}
                                          onChange={e => {
                                            const supplier = e.target.value;
                                            let formattedLnItems = this.state.formattedLnItems?.map(v => {
                                              if (v.uniqueIdentifier === val.uniqueIdentifier) {
                                                let notes = supplier && supplier !== 'Other' ? `The minor material supplier is ${supplier}.`: '';
                                                return { ...v, cfdlineitemsupplier: supplier, cfdlineitemothersupplier: '', cfdlineitemnotes: notes };
                                              }
                                              return v;
                                            });
                                            this.setState({ formattedLnItems });
                                          }}
                                          required
                                        >
                                          <option value="">Select Supplier</option>
                                          {Array.isArray(mm_supplier_name) && mm_supplier_name?.map(sup => (
                                            <option key={sup} value={sup}>{sup}</option>
                                          ))}
                                        </select>
                                        {val.cfdlineitemsupplier == 'Other' && (
                                          <div style={{  minWidth: 120,  width: '100%', marginTop: 8 }}>
                                            <label htmlFor={`cfdlineitemothersupplier_${val.uniqueIdentifier}`}>Other Supplier <span style={{color:'red'}}>*</span></label>
                                            <input
                                              type="text"
                                              placeholder="Enter other supplier"
                                              style={{minWidth: 120,  width: '100%', marginBottom: 4 ,paddingLeft:'10px',paddingRight:'10px'}}
                                              value={val.cfdlineitemothersupplier || ''}
                                              onChange={e => {
                                                const otherVal = e.target.value;
                                                let formattedLnItems = this.state.formattedLnItems?.map(v => {
                                                  if (v.uniqueIdentifier === val.uniqueIdentifier) {
                                                    let notes = otherVal? `The minor material supplier is Other: ${otherVal}.`: '';
                                                    return { ...v, cfdlineitemothersupplier: otherVal, cfdlineitemnotes: notes };
                                                  }
                                                  return v;
                                                });
                                                this.setState({ formattedLnItems });
                                              }}
                                              required
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  ) : (
                                    anyIsMatrix && this.props.formName == "Invoice" && val.cfdlineitemismatrix == "1" ? (
                                    <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)", paddingLeft:"8px", width:'16%'}}>
                                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', width:'100%' }}>
                                        {applicableBidUnits.includes(val.cfdlineitembidunit) && (this.state.oswInfoData && this.state.oswInfoData.length > 0) && (
                                          <div style={{ display:'flex', alignItems:'center', marginBottom:4 }}>
                                            <IconButton
                                              size="medium"
                                              onClick={() => this.openOswModal(val)}
                                              data-tip
                                              data-for={`OSWInfoSimple-${val.cfdlineitemunid || index}`}
                                              style={{ padding:0, marginRight:6, color:'black' }}
                                              sx={{
                                              opacity: 1,
                                              '&:hover': { opacity: 1 },
                                              '& .MuiSvgIcon-root': { opacity: 1 },
                                              '&:hover .MuiSvgIcon-root': { opacity: 1 }
                                            }}
                                            >
                                              <VisibilityIcon fontSize="inherit" />
                                            </IconButton>
                                            <span
                                              style={{ fontSize:'11px', fontWeight:350, cursor:'pointer', textDecoration:'underline' }}
                                              onClick={() => this.openOswModal(val)}
                                              role="button"
                                              tabIndex={0}
                                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { this.openOswModal(val); e.preventDefault(); } }}
                                            >
                                              Selectable On-Site Work Info
                                            </span>
                                          </div>
                                        )}
                                        <span
                                          data-tip
                                          data-for={`OSWDate-${val.cfdlineitemunid || index}`}
                                          style={{ display:'inline-flex', alignItems:'center', width:'100%' }}
                                        >
                                          <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DateTimePicker
                                              views={['year', 'month', 'day']}
                                              value={val.cfdlineitemdate}
                                              defaultValue={val.cfdlineitemdate}
                                              onChange={this.handleDateChange.bind(this,val)}
                                              onAccept={(acceptedMoment) => this.finalizeDateSelection(val, acceptedMoment)}
                                              closeOnSelect={true}
                                              style={{ color:'black' }}
                                              disabled={val.cfdlineitemstatus == "D"}
                                              minDate={(() => {
                                                const bidUnitUpper = (val.cfdlineitembidunit || '').toUpperCase();
                                                const isMob = mobilization_units.includes(bidUnitUpper);
                                                const isTrouble = troubleshooting_units.includes(bidUnitUpper);
                                                const isFirstMobLine = isMob && ((val.cfdlineitemunid || val.uniqueIdentifier) === this.state.firstMobilizationLineItemId);
                                                if (isMob) {
                                                  // First mobilization line: enforce strictly after troubleshooting (if it exists)
                                                  if (this.state.firstTroubleshootingDate && isFirstMobLine) {
                                                    return moment(this.state.firstTroubleshootingDate).add(1, 'day').startOf('day');
                                                  }
                                                  // Additional mobilization lines: strictly after first mobilization date
                                                  if (this.state.firstMobilizationDate && !isFirstMobLine) {
                                                    return moment(this.state.firstMobilizationDate).add(1, 'day').startOf('day');
                                                  }
                                                }
                                                if (isTrouble && this.state.firstMobilizationDate && !this.state.firstTroubleshootingDate) {
                                                  // Mobilization chosen first; troubleshooting must be before it -> no minDate (maxDate handles it)
                                                  return undefined;
                                                }
                                                return undefined;
                                              })()}
                                              maxDate={(() => {
                                                const bidUnitUpper = (val.cfdlineitembidunit || '').toUpperCase();
                                                const isTrouble = troubleshooting_units.includes(bidUnitUpper);
                                                // If mobilization chosen first, troubleshooting must be strictly before it.
                                                if (isTrouble && this.state.firstMobilizationDate && !this.state.firstTroubleshootingDate) {
                                                  return moment(this.state.firstMobilizationDate).subtract(1, 'day').endOf('day');
                                                }
                                                return moment(); // today
                                              })()}
                                              shouldDisableDate={(date) => this.shouldDisableOswDate(val, date)}
                                              sx={{
                                                width:'100%',
                                                color: 'black',
                                                '& .MuiOutlinedInput-root':{
                                                  border :  (!(bidUnits?.includes(val.cfdlineitembidunit)) || val.cfdlineitemdate) || (val.action == 'Del') || (totalForDate == 0)  ? null : '0.5px solid red'
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                  border: ["dc-006", "mmob-020", "mmob-021"].includes(val.cfdlineitembidunit.toLowerCase()) && val.cfdlineitemdate === null ? '1px solid red' : null
                                                },
                                                '& .MuiPickersDay-root': {
                                                  opacity: 1, color: 'black',
                                                  '&:hover': { opacity: 1, color: 'black' },
                                                  '&.Mui-selected': { opacity: 1 },
                                                  '&.Mui-disabled': { opacity: 0.38 }
                                                },
                                                '& .MuiButtonBase-root': {
                                                  color: 'black',
                                                  '&:hover': { opacity: 1, color: 'black' },
                                                  '&.Mui-selected': { opacity: 1 }
                                                }
                                              }}
                                              renderInput={(params)=>(
                                                <TextField
                                                  {...params}
                                                  size="small"
                                                  fullWidth
                                                  sx={{
                                                    '& .MuiInputBase-root': {
                                                      opacity: 1,
                                                      '&:hover': { opacity: 1 }
                                                    }
                                                  }}
                                                />
                                              )}
                                              slotProps={{
                                                textField: {
                                                  required: ["dc-006", "mmob-020", "mm0b-021"].includes(val.cfdlineitembidunit.toLowerCase()) ? true : false
                                                },
                                                day: {
                                                  sx: {
                                                    opacity: 1,
                                                    color: 'black',
                                                    '&:hover': { opacity: 1, color: 'black' },
                                                    '&.Mui-selected': { opacity: 1 }
                                                  }
                                                }
                                              }}
                                            />
                                          </LocalizationProvider>
                                        </span>
                                        {applicableBidUnits.includes(val.cfdlineitembidunit) && (
                                          <ReactTooltip
                                            id={`OSWDate-${val.cfdlineitemunid || index}`}
                                            place="top"
                                            effect="float"
                                          >
                                            <div>
                                              {this.state.oswInfoData?.length > 0
                                                ? 'Please select an On-Site Work date from the Selectable On-Site Work Info above'
                                                : 'Please provide the date the work was performed'}
                                            </div>
                                          </ReactTooltip>
                                        )}
                                      </div>
                                    </td>
                                  ) : null
                                  )
                                }
  
  
   <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>
   {val.cfdlineitembidunit && incentiveBidUnits.includes(val.cfdlineitembidunit) ? (
  <span id={'notes-' + val.uniqueIdentifier} style={{height: '100%', width: '80%', display: 'inline-block'}}>
  {this.getOswDisplayText(val)}
  </span>
  ) : (
  <textarea
  maxLength="985"
  type="number"
  disabled={val.cfdlineitemstatus === "D"}
  value={this.getOswDisplayText(val)}
  id={'notes-' + val.uniqueIdentifier}
  onChange={this.handleNotesChange.bind(this, val)}
  style={
  (!(this.getManualNotesForLineItem(val.cfdlineitemunid || val.uniqueIdentifier, val.cfdlineitemnotes)) &&
  val.cfdlineitemlongdesc !== "VZ" &&
  this.props.formName === "Invoice" &&
  val.action !== 'Del' &&
  totalForDate !== 0 &&
  this.state.fixedFlag &&
  bidUnits.includes(val.cfdlineitembidunit)) ||
  (this.state.fixedFlag &&
  val.action === 'Add' &&
  val.unit === "Per Crew Per Mile" &&
  this.state.qtyChange &&
  parseInt(val.cfdlineitemqty) > 0 &&
  !this.getManualNotesForLineItem(val.cfdlineitemunid || val.uniqueIdentifier, val.cfdlineitemnotes) &&
  (this.state.distanceMob === 0 ||
  this.state.distanceMob < 50 ||
  this.state.distanceMob === 9999)) ||
  (this.props.formName === "Invoice" &&
  val.cfdlineitembidunit?.toLowerCase() === "dc-006" &&
  (this.state.distanceMob < 150 || this.state.distanceMob === 9999) &&
  !this.getManualNotesForLineItem(val.cfdlineitemunid || val.uniqueIdentifier, val.cfdlineitemnotes)) || (showQtyToolTip &&  !this.getManualNotesForLineItem(val.cfdlineitemunid || val.uniqueIdentifier, val.cfdlineitemnotes))
  ? { height: '75px', width: '80%', border: '1px solid red' }
  : { height: '75px', width: '80%' }
  }
  ></textarea>
  )}
     <Tooltip  title={(showQtyToolTip ? 'Please provide a reason for Long Distance Adder charge': (this.state.fixedFlag && val.cfdlineitemlongdesc != "VZ" && val.action!='Del' && totalForDate!=0 && this.props.formName == "Invoice" && bidUnits.includes(val.cfdlineitembidunit) ) || (this.props.formName == "Invoice" && val.cfdlineitembidunit?.toLowerCase() == "dc-006" &&  (this.state.distanceMob <150 || this.state.distanceMob == 9999)) ? '* Please add Comments': '* Please add Reason in notes section')} open={showToolTip===true && !this.state.showOswModal?true:false } className="tooltip-css" placement='top' arrow >
       <span></span>
     </Tooltip>
     
     </td>
   { this.props.formName == "Invoice" ? <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.action && val.cfdlineitemstatus ? val.action+"/"+stat : val.action ? val.action : val.cfdlineitemstatus ?  "NA/"+stat: ''}</td>
   :
   <td style={val.action == 'Del' ? {"border": "0.21px solid rgba(51, 51, 51, 0.41)", color:'red'} : {"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}>{val.action ? val.action : ''}</td>}
   {erp ? <td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}></td> :<td style={{"border": "0.21px solid rgba(51, 51, 51, 0.41)"}}><a onClick={this.handleDelete.bind(this, val, anyIsMatrix)}><i className="fas fa-trash-alt fa-lg" style={{cursor: 'pointer'}}></i></a></td>}
  
  </tr>
  <InvoiceAuditFindings findings={findingsForThisLine} />
                                    </React.Fragment>
                                    )
                                  })
                                  }
  
                              </tbody>
                          </table>
{(this.state.deletedIncentive && this.state.eligibleForNotes) && 
                  <div className="col-md-12 mt-2">
                    <div
                      className="alert alert-warning"
                      role="alert"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#fff3cd",
                        color: "#856404",
                        border: "1px solid #ffeeba",
                        borderRadius: "0.25rem",
                        padding: "0.75rem 1.25rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <span>
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        You have deleted an incentive that you are eligible for with service type {this.state.incentiveServiceType} and bid unit {this.state.incentiveBidUnitValue}.
                        You can add it back from the service catalog below.
                      </span>
                      <button
                        type="button"
                        className="close"
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                        }}
                        onClick={() =>
                          this.setState({ deletedIncentive: false })
                        }
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                  </div>
                }
            <div className="col-md-2" style={{padding:'0px'}}>
                          <div id="Login" type="submit" className="float-left button-class-addservice" style={{width: '10vw'}} onClick={bidInvoiceZero ? null : () => {
  // Toggle the itemExpanded state
  this.setState({itemExpanded: !this.state.itemExpanded});
}} >{this.state.itemExpanded ? '-Hide Add a service' : '+Add a service'}</div>
</div>
                         {this.props.formName == "Invoice" && this.state.fixedFlag && hasTrouble && hasMob ?
                        <div  className="col-md-8" style={{padding:'0px'}}>
                        <div className="text-center" style={{color:'#FF7518', fontWeight:'bold'}}>Troubleshooting bid units include mobilization. Mobilization can only be added on a separate date post the troubleshooting date.</div>
                        {/* <div style={{color:'#FF7518', fontWeight:'bold', marginBottom:'1em'}}> Each bid unit's date must be entered in the line Notes.</div> */}
                        </div>: null
                        }
                         {this.props.formName == "Invoice" && this.state.fixedFlag && selectedEmailbidUnits.length > 0 &&
                            <div className="col-md-12">
                              <div className="text-center" style={{ color: 'red', fontWeight: 'bold' }}> Email Pre-approval by VZ Required</div>
                            </div>
                        }
                        {this.props.formName == "Invoice" && this.state.fixedFlag && this.state.formattedLnItems.filter(e=> e.bid_unit == "DC-006").length>0  && (this.state.distanceMob <150 || this.state.distanceMob == 9999) &&
                            <div className="col-md-12">
                              <div className="text-center" style={{color:'#FF7518', fontWeight:'bold'}}>{"DC-006 (Per Diem) cannot be used if mileage < 150 miles one-way from the job site and the Supplier's closest yard."}</div>
                            </div>
                        }
                        <div className="col-md-12" style={{padding:'2em'}}>
                        {this.state.recalculateDistance && this.props.workOrderDetailInfo.get("work_type")?.toLowerCase() == 'antenna / tower' ?
                          <div className="col-md-12">
                            <div className="text-center" style={{ color: 'red', fontWeight: 'bold', marginTop: '-2em' }}>Please go to your Company Profile and enter at least one dispatch location to enable mileage calculations.<br /></div>
                          </div> : null
                        }
                        { this.state.sameDateErr  ?  <div style={{color:'red', fontWeight:'bold'}}>Dates should not be on same day. Please select different date to proceed. </div>
                        : null}
                          {this.props.workorderPriority?.includes("BID") && this.props.formName == "Invoice" && (parseInt(this.state.totalCostPrev) == 0) &&
                          <div>
                            <div className="text-center" style={{color:'red', fontWeight:'bold', marginTop:'-2em'}}> This work order was submitted with a quote for $0 and no PO was generated, do not submit invoice dollars greater than $0 at this time.</div>
                            <div className="text-center" style={{color:'red', fontWeight:'bold'}}>Request a new work order if there are charges involved with the work.</div>
                        </div>
                      }
                     {dc006 ?  <div  className="text-center" style={{color:'darkorange', fontWeight:'bold'}}>DC-006 (Per Diem) cannot be used with Long distance adder MMOB-020 & MMOB-021. </div>
                        : null} 
                       {this.state.quoteErr ? <div className="text-center" style={{color:'red', fontWeight:'bold', marginTop:'-2em'}}>
                    {this.state.quoteErr}
                    </div> : null }
                        </div>
                    </div>
                  
            {(this.state.isFindings && this.state.enableAInDFlag)&&(<InvoiceComments comments={this.state.comments} onCommentChange={this.handleCommentsChange.bind(this)} />)}
            {(this.state.enableAInDFlag) ? <InvoiceSubmit
              onDrop={this.onFileDrop.bind(this)}
              filesData={this.state.filesData}
              invoicingMsg={this.state.invoicingMsg}
              comments={this.state.comments}
              onCommentChange={this.handleCommentsChange.bind(this)}
              onRemoveFile={this.onInvoiceAttachRemove.bind(this)}
              onSubmit={this.onSubmit.bind(this)}
              isFindings={this.state.isFindings}
              onDecline={this.onSubmit.bind(this, 'DECLINE')}
              enableDeclined={this.state.enableDeclined}
              showSection={this.state.showSection}
              formName={this.props.formName}
              initialComments={this.state.initialComments}
              bidUnitRules={this.state.bidUnitRulesResponse}
              bidUnitLineItem={this.state.formattedLnItems}
              auditFindings={this.state.inviceSubmitResponse}
              workorderPriority={this.props.workorderPriority}
              disableInvoiceReworkSubmit={disableInvoiceReworkSubmit}
              disableSubmit={disableSubmit}
              disableDecline={disableDecline}
              submitButtonText={this.props.formName === 'Invoice' ? 'Work Complete/Submit' : 'Submit'}
              disregardReason={this.state.disregardReason}
              onDisregardReasonChange={this.handleDisregardReasonChange}
              onRequiredFilesStatusChange={this.handleRequiredFilesStatusChange.bind(this)}
             hasRequiredFiles={allRequiredFilesAttached}
            /> :
              <>
                {this.state.invoicingMsg && <MessageBox messages={[this.state.invoicingMsg]} onClear={() => this.setState({ invoicingMsg: null })} className={"alert-danger"} marginTop={true} />}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div>
                      <h4>
                        <span style={{ 'color': 'red' }}>*</span>
                        Comments
                        <span style={{ fontWeight: 'normal', fontSize: '12px' }}>Max. 499 characters allowed </span></h4>
                    </div>
                    <div>
                      <textarea maxLength="499" type="text" defaultValue={this.state.comments} onChange={this.handleCommentsChange.bind(this)} style={{ width: '100%', minHeight: '5vh', lineHeight: '5vh' }}></textarea>
                    </div>
                  </div>

                  <div className="col-md-8">
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Add attachments{((this.props.formName == "Invoice" && this.state.fixedFlag && (reqDocs.length > 0 || selectedEmailbidUnits.length > 0)) || (this.props.formName == "Invoice" && (this.state.currentDropdownValueWorkType?.value?.toLowerCase() == 'generator' || this.state.currentDropdownValueWorkType?.value?.toLowerCase() == 'hvac') && materialCost > 0)) && <span style={{ 'color': 'red' }}>*</span>}{this.props.formName == "Invoice" && totalRate > 0 ?
                      <span style={{ color: 'red', fontWeight: 'bold', marginBottom: '15px', fontSize: '12px', marginTop: '-4em' }}>&nbsp;For direct cost reimbursement (eg. crane, materials) a paid invoice is required to be attached</span>
                      : null
                    }</div>
                    <div className="row">
                      <div className="col-md-5">
                        <div>
                          <Dropzone style={{ width: '67%', minHeight: '5vh', lineHeight: '7vh', border: '2px dashed rgb(102, 102, 102)', 'borderRadius': '5px' }} onDrop={this.onFileDrop.bind(this)}>
                            {({ getRootProps, getInputProps }) => (
                              <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                <div {...getRootProps()}>
                                  <input {...getInputProps()} />
                                  <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                </div>
                              </section>
                            )}</Dropzone>
                        </div>
                        <div >
                          <FileAttachedTable fileList={this.state.filesData} onRemoveClick={this.onAttachRemove.bind(this)} />
                        </div>
                      </div>
                      {this.state.enableDeclined && this.props.formName == 'SubmitQuote' && <div className="col-md-2 mt-4 mr-5">

                        <button id="Login" type="submit" className=" Button--secondary btn btn-lg" onClick={this.onSubmit.bind(this, 'DECLINE')} disabled={issoCondition || this.state.showSection || this.state.comments.trim().length == 0}>Decline</button>
                      </div>}

                      {this.props.workorderPriority == 'DIRECT AWARD' ? <div className={this.state.enableDeclined && this.props.formName == 'SubmitQuote' ? "col-md-3 mt-4" : "col-md-4 mt-2"}>
                        <button id="Login" type="submit" className=" Button--secondary float-right mt-2" style={{ marginRight: "5px", padding: "14px" }} onClick={this.onSubmit.bind(this)} disabled={this.NotesMandatory(bidUnits, anyIsMatrix) || this.dateMandatory(anyIsMatrix) || (this.props.formName == "Invoice" && this.bidUnitDateMandatory(this.state.formattedLnItems)) || this.disableDate(anyIsMatrix) || issoCondition || (this.state.comments.trim().length == 0) || (this.props.formName == "Invoice" && this.state.fixedFlag && this.state.filesData.length == 0 && (reqDocs.length > 0 || selectedEmailbidUnits.length > 0)) || (this.props.formName == "Invoice" && materialCost > 0 && (this.state.currentDropdownValueWorkType?.value?.toLowerCase() == 'generator' || this.state.currentDropdownValueWorkType?.value?.toLowerCase() == 'hvac') && this.state.filesData.length == 0) || (this.props.formName == 'Invoice' && this.state.recalculateDistance)}>{submitButton}</button>
                      </div> : <div className={this.state.enableDeclined && this.props.formName == 'SubmitQuote' ? "col-md-3 mt-4" : "col-md-4 mt-2"}>
                        <button id="Login" type="submit" className=" Button--secondary btn btn-lg" onClick={this.onSubmit.bind(this)} disabled={this.NotesMandatory(bidUnits, anyIsMatrix) || (this.props.formName == 'Invoice' && this.state.recalculateDistance)|| (this.props.formName == "Invoice" && this.bidUnitDateMandatory(this.state.formattedLnItems)) || this.dateMandatory(anyIsMatrix) || this.disableDate(anyIsMatrix) || issoCondition || (this.props.formName != "Invoice" && this.state.formattedLnItems.length == 0) || this.state.comments.trim().length == 0 || (this.state.totalCostNoLn < (parseFloat(this.state.laborCostNoLn) + parseFloat(this.state.fuelCostNoLn) + parseFloat(this.state.materialCostNoLn) + parseFloat(this.state.rentCostNoLn)) && this.props.formName != 'SubmitQuote' && this.props.workorderPriority != 'DIRECT AWARD' && this.state.formattedLnItems && this.state.formattedLnItems.filter(v => v.cfdlineitemservicetype).length == 0) || (this.props.formName == "Invoice" && this.state.fixedFlag && this.state.filesData.length == 0 && (reqDocs.length > 0 || selectedEmailbidUnits.length > 0)) || (this.props.formName == "Invoice" && materialCost > 0 && (this.state.currentDropdownValueWorkType?.value?.toLowerCase() == 'generator' || this.state.currentDropdownValueWorkType?.value?.toLowerCase() == 'hvac') && this.state.filesData.length == 0)}>{submitButton}</button>
                      </div>}
                    </div>
                  </div>
                </div>
              </>
            }
              {this.state.showSection ? 
                     <div style={{ marginTop: '25px', padding:'12px', border: '2px solid gray'}}>
                     <FormLabel component="legend" style={{ fontSize: '14px', fontWeight: 'bold', color:'black' }}> A quote for $0 will not generate a PO and you will no longer be able to submit dollar values greater than $0 at the invoice step. Do you wish to continue?</FormLabel>
                     <button type="button"
                     style={{ width: "fit-content", 'padding': '0.5em 1.12em', marginRight: "5px" }}
                className="Button--primary" onClick={this.onSubmission.bind(this)}
                >
                Yes
              </button>
              <button type="button"
                className="Button--secondary btn btn-md" onClick={this.changeState}
                style={{ marginRight: "5px" }}>
                No
              </button>
                 
                   </div>
                    : null}
                    {this.props.formName == "Invoice" && <div className="row mb-3">
                        <div className="col-md-5">
                            <div><h4>Invoice Number</h4></div>
                            <div>
                                <input type="text" defaultValue={this.state.invoiceNum} onChange={this.handleInvoiceChange.bind(this)} style={{width: '70%'}}></input>
                            </div>
                        </div>
                        <div className="col-md-5">

                        </div>
                        <div className="col-md-2">

                        </div>
                    </div>}
                   <div className="row mb-3">
                   {quote_files.length > 0 && (<div className="col-md-6 float-left" style={{marginTop: '20px'}}>
                        <div className="col-sm-12 no-padding float-left" style={{"fontSize": "1em", "fontWeight": "600", "textAlign": "left"}}>
                            <lable> Quote Attached Files :</lable>
                        </div>
                        <div className="col-sm-6 no-padding float-left" style={{"textAlign": "left"}}>
                            {quote_files}
                        </div>
                    </div>)}
                    {invoice_files.length > 0 && (<div className="col-md-6 float-right" style={{marginTop: '20px'}}>
                        <div className="col-sm-12 no-padding float-right" style={{"fontSize": "1em", "fontWeight": "600", "textAlign": "left"}}>
                       {this.props.formHeader && this.props.formHeader.includes("Quote") ? (<lable> Quote Attached Files :</lable>) : <lable> Invoice Attached Files :</lable> }
                        </div>
                        <div className="col-sm-12 no-padding float-right" style={{"textAlign": "left"}}>
                            {invoice_files}
                        </div>
                    </div>)}
                   </div>
                   <ServiceCatalog 
                     handleDropdownChangeWorkType={this.handleDropdownChangeWorkType.bind(this)}
                     handleDropdownChange={this.handleDropdownChange.bind(this)}
                     currentDropdownValueWorkType={this.state.currentDropdownValueWorkType}
                     currentDropdownValue={this.state.currentDropdownValue}
                     drpdwnOptionsWorkType={this.state.drpdwnOptionsWorkType}
                     bidUnitRules={this.state.bidUnitRulesResponse}
                     drpdwnOptions={this.state.drpdwnOptions}
                     handleChangeSearch={this.handleChangeSearch.bind(this)}
                     pageLoadinggrid={this.state.pageLoadinggrid}
                     modfdGridDetails={this.state.modfdGridDetails}
                     apiRef={this.apiRef}
                     onSelectionChanged={this.onSelectionChanged.bind(this)}
                     getRowId={this.getRowId}
                     handleAddServices={this.handleAddServices.bind(this)}
                     selectedServices={this.state.selectedServices}
                     erp={erp}
                     formattedLnItems={this.state.formattedLnItems}
                     fixedFlag={this.state.fixedFlag}
                     handleChangeItemExpanded={this.handleChangeItemExpanded.bind(this)}
                     itemExpanded={this.state.itemExpanded}
                   />
                </div>}
                { this.renderOswModal() } 
                { this.renderOswNotesViewModal() }
                </div>
      )
    }
  }
}

function stateToProps (state, props) {

  let workoderinfo = props.workORderInfo ? props.workORderInfo.toJS() : {}
  let workorderId = (props.workORderInfo && props.workORderInfo.get("workorder_id")) ? props.workORderInfo.get("workorder_id") + "" : null
  let workorderPriority = (props.workORderInfo && props.workORderInfo.get("priority")) ? props.workORderInfo.get("priority") + "" : null
  let attachedList = new List()
  let category = (props.formName === "SubmitQuote") ? "quote" : "invoice"

  let loginId = state.getIn(['Users', 'currentUser', 'loginId'], '')
  let user = state.getIn(["Users", "entities", "users", loginId], Map())
  let userList = state.getIn(['Users', 'getVendorList', 'Users'], List())
  let groupVendors = state.getIn(['Users', 'entities', 'users', loginId, 'group_vendors'], List())
  let site = state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], List())
  let workOrderDispatchDistance = state.getIn(["VendorDashboard","getWorkOrderDistanceDetails"], Map())
  attachedList = state.getIn(["VendorDashboard", loginId, "workOrderMap", props.wo_meta_universalid, 'files', category, 'attachments'], List())
  let vendorId = user.toJS().vendor_id
  let vendorName = user.toJS().vendor_name
  let market = state.getIn(["Users", "entities", "users", loginId, "vendor_area"], "")
  let submarket = state.getIn(["Users", "entities", "users", loginId, "vendor_region"], "")
  let currentValues = state.getIn(["Forms", "SubmitQuote", "currentValues"], List())
  let switchData = state.getIn(["Switch", loginId, "switch", "switchDetails"], Map())
  let banner = state.getIn(['Users','configData', 'configData'], List())
  let config= state.getIn(['Users', 'configData', 'configData'], List())
  const realLoginId = state.getIn(['Users', 'realUser', 'loginId'])
  const realUser = state.getIn(['Users', 'entities', 'users', realLoginId], Map())
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
  let isssouser = realUser ? realUser.get('isssouser') : ''
  let wobyUnid = state.getIn(["VendorDashboard", "workOrderDetail", props.wo_meta_universalid], Map())
  let submitquoteErr = state.getIn(["VendorDashboard", loginId, vendorId, props.wo_meta_universalid , "Fixed Pricing", "submitRes", "errors"], Map())

  let bidUnitRules = state.getIn(["bidUnitRules", "data"], List())
  let bidUnitRulesLoading = state.getIn(["bidUnitRules", "loading"], false)
  let bidUnitRulesErrors = state.getIn(["bidUnitRules", "errors"], null)

  let lineItems = state.getIn(["lineItems", "data"], List())
  let lineItemsLoading = state.getIn(["lineItems", "loading"], false)
  let lineItemsErrors = state.getIn(["lineItems", "errors"], null)

  let attachments = state.getIn(["attachments", "data"], List())
  let attachmentsLoading = state.getIn(["attachments", "loading"], false)
  let attachmentsErrors = state.getIn(["attachments", "errors"], null)

  let vendorWorkOrder = state.getIn(["vendorWorkOrder", "data"], List())
  let vendorWorkOrderLoading = state.getIn(["vendorWorkOrder", "loading"], false)
  let vendorWorkOrderErrors = state.getIn(["vendorWorkOrder", "errors"], null)
  
  let invoiceSubmitData = state.getIn(["invoiceSubmit", "data"], List())
  let invoiceSubmitLoading = state.getIn(["invoiceSubmit", "loading"], false)
  let invoiceSubmitError = state.getIn(["invoiceSubmit", "error"], null)

  let auditWorkOrderData = state.getIn(["auditWorkOrder", "data"], List())
  let auditWorkOrderLoading = state.getIn(["auditWorkOrder", "loading"], false)
  let auditWorkOrderError = state.getIn(["auditWorkOrder", "error"], null)

  let patchAuditData = state.getIn(["patchAuditData", "data"], List())
  let patchAuditDataLoading = state.getIn(["patchAuditData", "loading"], false)
  let patchAuditDataError = state.getIn(["patchAuditData", "error"], null)

  let oswInfo = state.getIn(["oswInfo", "data"], Map())
  let oswInfoLoading = state.getIn(["oswInfo", "loading"], false)
  let oswInfoError = state.getIn(["oswInfo", "error"], null)

  return {
    submitquoteErr,
    troubleshooting_units : config?.toJS()?.configData?.find(e => e.ATTRIBUTE_CATEGORY === "TROUBLE_BID_UNITS")?.ATTRIBUTE_VALUE? config?.toJS()?.configData?.find(e => e.ATTRIBUTE_CATEGORY === "TROUBLE_BID_UNITS")?.ATTRIBUTE_VALUE?.split(",") : [],
    mobilization_units : config?.toJS()?.configData?.find(e => e.ATTRIBUTE_CATEGORY === "MOB_BID_UNITS")?.ATTRIBUTE_VALUE ? config?.toJS()?.configData?.find(e => e.ATTRIBUTE_CATEGORY === "MOB_BID_UNITS")?.ATTRIBUTE_VALUE?.split(",") : [],
    invoiceFlag: (function() {
      const configValue = config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "VWRS_INVOICE_AUDIT_ENABLE")?.ATTRIBUTE_VALUE;
      if (!configValue) return 'N';
      return configValue.split(",").includes(user.get("vendor_region")) ? 'Y' : 'N';
    })(),
    mm_supplier_bidunit : config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "MINOR_MATERIAL_BID_UNITS")?.ATTRIBUTE_VALUE ? config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "MINOR_MATERIAL_BID_UNITS")?.ATTRIBUTE_VALUE?.split(",") : [],
    mm_supplier_name : config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "MM_SUPPLIER_NAME")?.ATTRIBUTE_VALUE ? config?.toJS()?.configData?.find(e => e.ATTRIBUTE_NAME === "MM_SUPPLIER_NAME")?.ATTRIBUTE_VALUE?.split(",") : [],
    loginId,
    vendorId,
    vendorName,
    market,
    attachedList,
    submarket,
    workorderId,
    site,
    user,
    userList,
    currentValues,
    groupVendors,
    workorderPriority,
    workoderinfo,
    switchData,
    banner,
    config,
    realLoginId,
    realUser,
    ssoUrl,
    isssouser,
    wobyUnid,
    workOrderDispatchesDistance: workOrderDispatchDistance && workOrderDispatchDistance.toJS(),
    bidUnitRules,
    bidUnitRulesLoading,
    bidUnitRulesErrors,
    lineItems,
    lineItemsLoading,
    lineItemsErrors,
    attachments,
    attachmentsLoading,
    attachmentsErrors,
    vendorWorkOrder,
    vendorWorkOrderLoading,
    vendorWorkOrderErrors,
    invoiceSubmitData,
    invoiceSubmitLoading,
    invoiceSubmitError,
    auditWorkOrderData,
    auditWorkOrderLoading,
    auditWorkOrderError,
    patchAuditData,
    patchAuditDataLoading,
    patchAuditDataError,
    oswInfo,
    oswInfoLoading,
    oswInfoError
  }
}
export default connect(stateToProps, {...formActions, ...VendorActions, ...elogActions,ivrEmailNotify})(WorkOrderFormFixedPricing)
