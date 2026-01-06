import React from 'react'
import { useNodesQuery } from './nodes.data'
import {z} from 'zod'
import Loader from '../../Layout/components/Loader'
import Modal from '../../Layout/components/Modal'
import {ENodeBAnalazyerTabs} from './ENodebAnalyzerTabs'
import {useDispatch, useSelector } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';
import {postTaskType} from '../actions'
import moment from "moment" 
import {startCase} from 'lodash';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  controlsContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: '20px',
    gap: '15px'
  },
  formGroup: {
    flex: '0 0 25%',
    marginBottom: '0'
  },
  select: {
    display: 'block',
    width: '100%',
    padding: '0.375rem 0.75rem',
    fontSize: '1rem',
    lineHeight: '1.5',
    backgroundColor: '#fff',
    backgroundClip: 'padding-box',
    border: '1px solid #ced4da',
    borderRadius: '0.25rem',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
  },
  button: {
    display: 'inline-block',
    fontWeight: '400',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    userSelect: 'none',
    border: '1px solid transparent',
    padding: '0.375rem 0.75rem',
    fontSize: '1rem',
    lineHeight: '1.5',
    borderRadius: '0.25rem',
    color: '#fff',
    backgroundColor: '#000000', 
    borderColor: '#000000', 
    cursor: 'pointer'
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
    cursor: 'not-allowed',
    opacity: '0.65'
  },
  heatMapContainer: {
    marginTop: '20px'
  }
}

export function InPlaceSitePrbAnalyzer({siteUnid,SiteTools}) {
  const dispatch = useDispatch();
  const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
  const user = useSelector(state => {
    const user_value = state.getIn(["Users", "entities", "users", loginId], ImmutableMap());
    return user_value && user_value.toJS ? user_value.toJS() : {};
  });
    const siteList = useSelector(state => {
    const sites = state.getIn(["VendorDashboard", loginId, "site", "siteDetails"], ImmutableMap());
    return sites && sites.toJS ? sites.toJS() : {};
  });
  const query = useNodesQuery(siteUnid)
  const [selectedNode, setSelectedNode] = React.useState(null)
  const [showHeatMap, setShowHeatMap] = React.useState(false)

  if (query.loading) {
    return <Loader />
  }
  if (!query.data) {
    return null
  }

  const handleNodeSelect = (e) => {
    const selectedNodeId = e.target.value;
    const nodeRow = query.data.nodes.find(node => node.node === selectedNodeId);
    setSelectedNode(nodeRow);
    setShowHeatMap(false);
  };

  const triggerPRBTaskType = () => {
if ( !SiteTools) return;
    const payload = {
      payload: {
        type_name: "PRB Heat Map",
        external_team_support: "",
        users: [
          {
            assigned_to: `${startCase(user?.vendor_name || '')}-${(loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
            name: `${startCase(user?.fname || '')} ${startCase(user?.lname || '')}`.trim()
          }
        ],
        start_date: moment().format('YYYY-MM-DD'),
        sites: [
          {
            site_unid: siteList?.site_unid,
            switch_name: siteList?.switch,
            switch_unid: "",
            site_id: siteList?.site_id,
            site_name: siteList?.site_name,
            assigned_to: `${startCase(user?.vendor_name || '')}-${(loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`
          }
        ],
        market_code: null,
        create_date: moment().format('YYYY-MM-DD'),
        email_address: null,
        include_healthcheck: "0",
        include_sites: "1",
        due_date: moment().format('YYYY-MM-DD'),
        market: user?.vendor_area,
        submarket: user?.vendor_region,
        description: `Vendor Portal Inquiry - PRB Heat Map`,
        command_list_5g: "",
        user_id: `${startCase(user?.vendor_name || '')}-${(loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
        switches: [],
        bucket_truck: "0",
        drone: "0",
        ladder: "0",
        fuel_truck: "0",
        gc_email: "",
        created_by: `${startCase(user?.vendor_name || '')}-${(loginId).toLowerCase()}-${startCase(user?.lname || '')}, ${startCase(user?.fname || '')}`,
        notify: false,
        fromsystem: "OPSPORTAL"
      }
    };

    dispatch(postTaskType(payload));
  };

  const generateHeatMap = () => {
    if (selectedNode) {
      setShowHeatMap(true);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.controlsContainer}>
        <div style={styles.formGroup}>
          <select 
            style={styles.select} 
            onChange={handleNodeSelect} 
            value={selectedNode?.node || ''}
          >
            <option value="">Select a Node</option>
            {query.data.nodes.map(node => (
              <option key={node.node} value={node.node}>
                {node.node} - {node.vendor}
              </option>
            ))}
          </select>
        </div>
        <button 
          style={selectedNode ? styles.button : {...styles.button, ...styles.buttonDisabled}}
          onClick={() => { generateHeatMap(); triggerPRBTaskType(); }}
          disabled={!selectedNode}
        >
          Generate PRB Heat Map
        </button>
      </div>
      
      {showHeatMap && selectedNode && (
        <div style={styles.heatMapContainer}>
          <ENodeBAnalazyerTabs type='enodeb' id={selectedNode.node} />
        </div>
      )}
    </div>
  )
}

export function SitePrbAnalyzer({siteUnid}) {
  const query = useNodesQuery(siteUnid)
  const [selectedNode, setSelectedNode] = React.useState(null)
  const [showHeatMap, setShowHeatMap] = React.useState(false)

  if (query.loading) {
    return <Loader />
  }
  if (!query.data) {
    return null
  }

  const handleNodeSelect = (e) => {
    const selectedNodeId = e.target.value;
    const nodeRow = query.data.nodes.find(node => node.node === selectedNodeId);
    setSelectedNode(nodeRow);
    setShowHeatMap(false);
  };

  const generateHeatMap = () => {
    if (selectedNode) {
      setShowHeatMap(true);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.controlsContainer}>
        <div style={styles.formGroup}>
          <select 
            style={styles.select} 
            onChange={handleNodeSelect} 
            value={selectedNode?.node || ''}
          >
            <option value="">Select a Node</option>
            {query.data.nodes.map(node => (
              <option key={node.node} value={node.node}>
                {node.node} - {node.vendor}
              </option>
            ))}
          </select>
        </div>
        <button 
          style={selectedNode ? styles.button : {...styles.button, ...styles.buttonDisabled}}
          onClick={() => { generateHeatMap();}}
          disabled={!selectedNode}
        >
          Generate PRB Heat Map
        </button>
      </div>
      
      {showHeatMap && selectedNode && (
        <div style={styles.heatMapContainer}>
          <ENodeBAnalazyerTabs type='enodeb' id={selectedNode.node} />
        </div>
      )}
    </div>
  )
}
