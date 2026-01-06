import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSitesBySubmarket } from '../../sites/actions';
import SiteToolTable from './siteToolTable';
import SiteToolInfo from './SiteToolInfo';
import Modal from '../../Layout/components/Modal';

import WorkOrderDetails from '../../VendorDashboard/components/WorkOrderDetails'; 
import { Map } from 'immutable';
import Loader from '../../Layout/components/Loader'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CellTowerIcon from '@mui/icons-material/CellTower';

const CenteredPopup = ({ onClose, children }) => (
    <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
    }}>
        <div style={{
            background: '#fff',
            padding: '24px 32px 24px 24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            border: '2px solid #1976d2',
            minWidth: '700px', 
            marginTop: '120px', 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* X icon */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                }}
                aria-label="Close"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#888">
                    <line x1="4" y1="4" x2="16" y2="16" stroke="#888" strokeWidth="2"/>
                    <line x1="16" y1="4" x2="4" y2="16" stroke="#888" strokeWidth="2"/>
                </svg>
            </button>
            {/* Header */}
            <div style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '2px', marginLeft: '2px' }}>
                Site Tools
            </div>
            {/* Info icon and text */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <InfoOutlinedIcon style={{ color: '#1976d2', fontSize: 21, marginRight: 4,marginTop:-14, flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: 'left', fontSize: '15px' }}>
                    {children}
                </div>
            </div>
        </div>
    </div>
);

function SiteTools() {
    const dispatch = useDispatch();
    const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
    const user = useSelector(state => state.getIn(['Users', 'entities', 'users', loginId]));
    const region = user && user.get('vendor_region');
    const sites = useSelector(state => state.getIn(["Sites", loginId, "sitesbysubmarket", "sites"], []));
    const sitesList = useMemo(() => (sites && sites.toJS ? sites.toJS() : []), [sites]);

    const [showPopup, setShowPopup] = useState(true);
    const [searchVal, setSearchVal] = useState('');
    const [selectedSites, setSelectedSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSiteInfo, setShowSiteInfo] = useState(false);
    const [selectedSiteInfo, setSelectedSiteInfo] = useState(null);
    const siteInfoRef = useRef(null);
    const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

useEffect(() => {
        if (showWorkOrderModal) {
            // Hide scrollbar on the main container or root element
            const rootElement = document.getElementById('root') || document.body;
            rootElement.classList.add('no-scroll');
        }
        
        return () => {
            // Clean up - remove the no-scroll class when modal closes or component unmounts
            const rootElement = document.getElementById('root') || document.body;
            rootElement.classList.remove('no-scroll');
        };
    }, [showWorkOrderModal]);

    // Also add CSS styles for the no-scroll class
    useEffect(() => {
        // Add CSS styles to the document
        const style = document.createElement('style');
        style.textContent = `
            .no-scroll {
                overflow: hidden !important;
            }
            
            /* Hide scrollbar while keeping scroll functionality for modal content */
            .modal-body {
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE and Edge */
            }
            
            .modal-body::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            // Clean up the style element when component unmounts
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    useEffect(() => {
        if (loginId && region) {
            setLoading(true);
            dispatch(fetchSitesBySubmarket(loginId, region)).finally(() => setLoading(false));
        }
    }, [dispatch, loginId, region]);

    useEffect(() => {
        if (sitesList.length > 0) setLoading(false);
    }, [sitesList]);

    // Filter by site name or site id
    const filteredSites = useMemo(() => {
        if (!searchVal) return sitesList;
        return sitesList.filter(
            site =>
                (site.site_name && site.site_name.toLowerCase().includes(searchVal.toLowerCase())) ||
                (site.site_id && site.site_id.toLowerCase().includes(searchVal.toLowerCase()))
        );
    }, [sitesList, searchVal]);

    const handleClose = () => setShowPopup(false);

    const handleSiteInfoClose = () => {
        setShowSiteInfo(false);
        setSelectedSiteInfo(null);
    };

    const handleSearchChange = (e) => {
        setSearchVal(e.target.value);
        setSelectedSites([]);
    };

    // Action handler for the Action column
    const handleActionClick = (site) => {
        setSelectedSiteInfo(site);
        setShowSiteInfo(true);
        setTimeout(() => {
            if (siteInfoRef.current) {
                siteInfoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Table columns definition
    const columns = [
        {
            label: 'Action',
            key: 'action',
            render: (row) => (
                <span
                    style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}
                    title="Non Service Affecting Actions"
                    onClick={() => handleActionClick(row)}
                >
                    <CellTowerIcon style={{ fontSize: 24, color: '#1976d2', verticalAlign: 'middle' }} />
                </span>
            )
        },
        { label: 'Site#', key: 'site_id' },
        { label: 'Site Name', key: 'site_name' },
        { label: 'Switch Name', key: 'switch' },
        { label: 'Site Engineer', key: 'tech_name' },
        { label: 'Site Manager', key: 'mgr_name' }
    ];

    // Prepare data with action column rendered
    const tableData = filteredSites.map(site => ({
        ...site,
        action: columns[0].render(site)
    }));
    const handleShowWorkOrderModal = (workOrder) => {
    setSelectedWorkOrder(Map(workOrder));
    setShowWorkOrderModal(true);
    setShowSiteInfo(false);
    setSelectedSiteInfo(null);
    };

    const handleHideWorkOrderModal = () => {
        setShowWorkOrderModal(false);
        setSelectedWorkOrder(null);
    };


    return (
    <div className="container-fluid">
        {/* Main content - always shown but dimmed when popup is visible */}
        <div 
            className="col-md-12"
            style={{
                opacity: showPopup ? 0.3 : 1,
                pointerEvents: showPopup ? 'none' : 'auto',
                transition: 'opacity 0.2s ease'
            }}
        >
            <div style={{ margin: '88px 0 16px 0', maxWidth: '100%', paddingLeft: '32px' }}>
               <div style={{ fontWeight: 'bold', fontSize: '19px',marginBottom: '10px' }}>
                Site Tools
               </div>
               
                <div style={{ position: 'relative', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="SiteName/Site#"
                        value={searchVal}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '8px 36px 8px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '15px'
                        }}
                    />
                    <span style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#888',
                        pointerEvents: 'none'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="2"/>
                            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </span>
                </div>
            </div>
            <div style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                {loading ? (
                    <Loader />
                ) : (
                    <SiteToolTable columns={columns} data={tableData} />
                )}
            </div>
            
            {/* Modals */}
            {showSiteInfo && selectedSiteInfo && (
                <Modal
                    title="Site Information"
                    handleHideModal={handleSiteInfoClose}
                    style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px"}}
              
                >
                    <SiteToolInfo
                        site={selectedSiteInfo}
                        onShowWorkOrderModal={handleShowWorkOrderModal}
                    />
                </Modal>
            )}
            {showWorkOrderModal && selectedWorkOrder && (
                <Modal
                    title="WORK ORDER DETAILS"
                    handleHideModal={handleHideWorkOrderModal}
                    style={{ width: "97%", maxWidth: "97%", display: "block", marginTop: "30px"}}
                >
                 <div style={{ 
            height: '80vh', // Use height instead of maxHeight to force scrollbar
            overflowY: 'scroll', // Use 'scroll' instead of 'auto' to always show scrollbar area
            overflowX: 'hidden'
        }}>
            <WorkOrderDetails
                workOrderInfo={selectedWorkOrder}
                getQuotes={false}
                isWorkInProgress={true}
                isCompleted={false}
                isQuoteReceived={false}
                isAcceptedWork={false}
                handleHideModal={handleHideWorkOrderModal}
                tableTitle={"Work order"}
                title="SEARCH"
                isSiteAccessExpandable={false}
                fromRecentActivity={true}
                userRole={"PORTALADMIN"}
            />
        </div>
                </Modal>
            )}
        </div>

        {/* Popup overlay - shown on top when needed */}
        {showPopup && (
            <CenteredPopup onClose={handleClose}>
                <p>
                    Please go to Work Orders or Capital Projects if you have a Work Order or Project
                </p>
            </CenteredPopup>
        )}
    </div>
);
}

export default SiteTools;
