import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import LaunchIcon from '@material-ui/icons/Launch';

import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Box, 
  IconButton,
  CircularProgress,
  TablePagination
} from "@mui/material";
import AlarmTestingHistoryChild from './AlarmTestingHistoryChild';
import EatAuditPopup from './EatAuditPopup';
import { getTestHistory } from './actions';

const AlarmTestingHistory = ({ workORderInfo, selectedRow }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [auditPopupOpen, setAuditPopupOpen] = useState(false);
  const [selectedEatTestId, setSelectedEatTestId] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  

  const testHistoryData = useSelector(state => {
    const capitalProject = state.get('CapitalProjectDashboard');
    if (capitalProject) {
      return capitalProject.getIn(['getTestHistory', 'testHistory', 'eat_tests']) || 
             capitalProject.get('eat_tests');
    }
    return null;
  });

  const isLoading = useSelector(state => 
    state.getIn(['CapitalProjectDashboard', 'getTestHistory', 'isLoading']) || false
  );

  const errors = useSelector(state => 
    state.getIn(['CapitalProjectDashboard', 'getTestHistory', 'errors']) || null
  );

  const actualIsLoading = isLoading && !testHistoryData;

  useEffect(() => {
    let siteUnid = selectedRow?.site_unid ;
    if (siteUnid) {
      dispatch(getTestHistory(siteUnid));
    }
  }, [dispatch, selectedRow]);

  // Transform API data to table format
  const transformedData = React.useMemo(() => {
    if (!testHistoryData) {
      return [];
    }

    const eatTests = testHistoryData.toJS();
    
    if (!Array.isArray(eatTests)) {
      return [];
    }
    
    return eatTests.map(test => ({
      id: test.eat_test_id,
      testName: test.eat_test_num || 'N/A',
      testType: test.eat_test_type_name || 'N/A',
      isAdhoc: test.is_adhoc_test === "1" ? "True" : "False",
      siteType: test.site_type || 'N/A',
      testStatus: test.eat_test_status || 'N/A',
      createdTime: test.created_on ? 
        new Date(test.created_on).toLocaleString() : 'N/A',
      rawData: test
    }));
  }, [testHistoryData]);

  // Filter data based on search term
  const filteredData = transformedData.filter(item =>
    item.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.testStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.isAdhoc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.siteType?.toLowerCase().includes(searchTerm.toLowerCase())

  );

  // Paginated data
  const paginatedData = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, rowsPerPage]);

  
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle row expansion
  const handleToggleExpand = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Handle audit popup
  const handleOpenAuditPopup = (eatTestId) => {
    setSelectedEatTestId(eatTestId);
    setAuditPopupOpen(true);
  };

  const handleCloseAuditPopup = () => {
    setAuditPopupOpen(false);
    setSelectedEatTestId(null);
  };

  const headingStyles = {
    fontFamily: 'Verizon NHG eDS',
    fontWeight: 700,
    fontSize: '14px',
    margin: 0 
  };

  const contentStyles = {
    fontFamily: 'Verizon NHG eDS',
    fontWeight: 400
  };

  return (
    <Box sx={{ width: "100%", marginTop: "16px" }}>
      <Accordion 
        style={{ 
          margin: 'auto', 
          width: '100%', 
          boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", 
          fontWeight: "bold"
        }} 
        TransitionProps={{ unmountOnExit: true }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="alarm-testing-history-content"
          id="alarm-testing-history-header"
          style={{ 
            height: '34px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center' 
          }}
        >
          <h5 style={headingStyles}>Alarm Testing History</h5>
        </AccordionSummary>
        <AccordionDetails style={{ padding: "16px", display: "flex", flexDirection: "column", ...contentStyles }}>
          <div className="acc-container" style={{ margin: '0px', width: '100%' }}>
            {/* Header with title and search bar */}
            <div className="row mb-2 align-items-center" style={{ alignItems: 'center', marginTop: '0px', marginBottom: '8px' }}>
              <div className="col-md-6">
             
              </div>
              <div className="col-md-6 d-flex justify-content-end">
                <div className="search-bar" style={{ position: 'relative' }}>
                  <input
                    placeholder="Search..."
                    className="form-control"
                    value={searchTerm}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    id="alarm-history-search-bar"
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
                  />
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div style={{ minHeight: '200px', backgroundColor: 'white' }}>
              {/* Loading State */}
              {actualIsLoading && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  padding: '40px',
                  backgroundColor: 'white'
                }}>
                  <CircularProgress size={24} />
                  <span style={{ 
                    marginLeft: '10px', 
                    fontFamily: 'Verizon NHG eDS',
                    fontSize: '14px'
                  }}>
                    Loading alarm testing history...
                  </span>
                </div>
              )}

              {/* Error State */}
              {errors && !actualIsLoading && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  fontSize: '14px', 
                  color: '#d32f2f', 
                  fontFamily: 'Verizon NHG eDS',
                  backgroundColor: 'white'
                }}>
                  Error loading alarm testing history. Please try again.
                </div>
              )}

              {/* Table Headers */}
              {!actualIsLoading && !errors && (
                <div style={{ borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
                  <div style={{ 
                    display: 'flex', 
                    backgroundColor: 'white',
                    height: '35px', 
                    alignItems: 'center',
                    fontFamily: 'Verizon NHG eDS',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}>
                    <div style={{ width: '50px', padding: '0 8px', borderRight: 'none' }}></div>
                    <div style={{ 
                      flex: 2, 
                      minWidth: '150px', 
                      padding: '0 16px', 
                      marginLeft: '8px', 
                      borderRight: 'none' 
                    }}>Test Name</div>
                    <div style={{ flex: 1.5, minWidth: '120px', padding: '0 8px', borderRight: 'none' }}>Test Type</div>
                    <div style={{ flex: 1, minWidth: '100px', padding: '0 8px', borderRight: 'none' }}>Is Adhoc</div>
                    <div style={{ flex: 1, minWidth: '100px', padding: '0 8px', borderRight: 'none' }}>Site Type</div>
                    <div style={{ flex: 1.2, minWidth: '120px', padding: '0 8px', borderRight: 'none' }}>Test Status</div>
                    <div style={{ flex: 1.8, minWidth: '150px', padding: '0 8px', borderRight: 'none' }}>Created Time</div>
                  </div>
                </div>
              )}

              {/* Table Rows - Using paginatedData instead of filteredData */}
              {!actualIsLoading && !errors && (
                paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <div key={row.id}>
                      {/* Parent Row */}
                      <div style={{ 
                        display: 'flex', 
                        height: '30px', 
                        alignItems: 'center',
                        borderBottom: '0.5px solid #e0e0e0',
                        backgroundColor: 'white',
                        fontFamily: 'Verizon NHG eDS',
                        fontWeight: 400,
                        fontSize: '14px'
                      }}>
                        <div style={{ width: '50px', padding: '0 8px', display: 'flex', justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleExpand(row.id)}
                            sx={{ p: 0 }}
                          >
                            {expandedRows[row.id] ? 
                              <ArrowDropDownIcon sx={{ fontSize: 20 }} /> : 
                              <ArrowRightIcon sx={{ fontSize: 20 }} />
                            }
                          </IconButton>
                        </div>
                        <div style={{ 
                          flex: 2, 
                          minWidth: '150px', 
                          padding: '0 16px',
                          marginLeft: '8px',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between' 
                        }}>
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 'calc(100% - 30px)',
                            display: 'block'
                          }} title={row.testName}>
                            {row.testName}
                          </span>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenAuditPopup(row.id)}
                            sx={{ p: 0, ml: 1, flexShrink: 0 }}
                            title="View EAT Audit"
                          >
                            <LaunchIcon style={{ fontSize: 16, color: '#d32f2f' }} />
                          </IconButton>
                        </div>
                        <div style={{ flex: 1.5, minWidth: '120px', padding: '0 8px' }}>{row.testType}</div>
                        <div style={{ flex: 1, minWidth: '100px', padding: '0 8px' }}>{row.isAdhoc}</div>
                        <div style={{ flex: 1, minWidth: '100px', padding: '0 8px' }}>{row.siteType}</div>
                        <div style={{ flex: 1.2, minWidth: '120px', padding: '0 8px' }}>{row.testStatus}</div>
                        <div style={{ flex: 1.8, minWidth: '150px', padding: '0 8px' }}>{row.createdTime}</div>
                      </div>
                      
                      {/* Child Component */}
                      {expandedRows[row.id] && (
                        <AlarmTestingHistoryChild data={row.rawData} />
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px', 
                    fontSize: '14px', 
                    color: '#666', 
                    fontStyle: 'italic', 
                    fontFamily: 'Verizon NHG eDS',
                    backgroundColor: 'white'
                  }}>
                    No alarm testing history found matching your search.
                  </div>
                )
              )}

              {/* Pagination Component */}
              {!actualIsLoading && !errors && filteredData.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredData.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 15, 20, 25, 50]}
                  sx={{
                    '& .MuiTablePagination-toolbar': {
                      justifyContent: 'flex-start',
                      fontFamily: 'Verizon NHG eDS'
                    },
                    '& .MuiTablePagination-input': {
                      marginBottom: '7px',
                      fontFamily: 'Verizon NHG eDS'
                    },
                    '& .MuiTablePagination-selectLabel': {
                      fontFamily: 'Verizon NHG eDS'
                    },
                    '& .MuiTablePagination-displayedRows': {
                      fontFamily: 'Verizon NHG eDS'
                    }
                  }}
                />
              )}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <EatAuditPopup
        open={auditPopupOpen}
        onClose={handleCloseAuditPopup}
        eatTestId={selectedEatTestId}
      />
    </Box>
  );
};

export default AlarmTestingHistory;