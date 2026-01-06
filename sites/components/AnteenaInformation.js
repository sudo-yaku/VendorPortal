import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../actions';
import Loader from '../../Layout/components/Loader'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Card, CardContent, Typography, Button, makeStyles } from '@material-ui/core';
import { GetApp } from "@material-ui/icons";
import { List } from "immutable";
import ReactTable from "react-table";

const useStyles = makeStyles(() => ({
  customCardContent: {
    '&.MuiCardContent-root:last-child': {
      paddingBottom: '5px'
    }
  },
  paginationButton: {
    minWidth: '30px',
    padding: '5px 10px',
    fontSize: '12px',
    background: 'black',
  },
}))

function AnteenaInformation(props) {
  const classes = useStyles()
  const dispatch = useDispatch();
  const { siteDetails,configData, isAnteenaInfoLoading, AnteenaInfoData } = useSelector(state => ({
    siteDetails: state.getIn(["Sites", props.loginId, "site", "siteDetails", props.unid], List()),
    configData: state.getIn(['Users', 'configData', 'configData'], List()),
    isAnteenaInfoLoading: state.getIn(["Sites", props.loginId, "AnteenaInformation", "AnteenaInformationLoading"]),
    AnteenaInfoData: state.getIn(["Sites", props.loginId, "AnteenaInformation", "AnteenaInformationData"]),
  }));
  let siteDetailsInfo = siteDetails?.toJS()
  const {APRadioInfoData, isAPRadioInfoLoading} = useSelector(state => ({
    APRadioInfoData: state.getIn(["Sites", "apRadio", siteDetailsInfo?.site_network_id, "apRadioInfo"]),
    isAPRadioInfoLoading: state.getIn(["Sites", "apRadio", siteDetailsInfo?.site_network_id, "apRadioLoading"]),
  }))

  const radioData = useSelector(state => state.getIn(["Sites", props.loginId, "RadioInformation", "RadioInformationData"], List())?.toJS())
  
  const [filteredAPRadioData, setFilteredAPRadioData] = useState([]);
  const [apGatewayAddress, setApGatewayAddress] = useState('');
  const defaultTab = props.isProject ? siteDetailsInfo.is_donor ? 'APRAD' : 'ANT' : 'ANT'
  const [deviceTestSelected, setDeviceTestSelected] = useState(defaultTab)
  let vendor = siteDetailsInfo?.node_details ? siteDetailsInfo?.node_details[0]?.vendor : ""
  const [searchTerm, setSearchTerm] = useState('')

  let apRadioServerIp = configData?.toJS().configData?.find(e => e.ATTRIBUTE_NAME === "AP_RADIO_DNS_SERVER_IP")?.ATTRIBUTE_VALUE
  let apRadioNmsServer = configData?.toJS().configData?.find(e => e.ATTRIBUTE_NAME === "AP_RADIO_NMS_SERVER_URL")?.ATTRIBUTE_VALUE
  let apRadioInstallerKey = configData?.toJS().configData?.find(e => e.ATTRIBUTE_NAME === "AP_RADIO_INSTALLER_KEY")?.ATTRIBUTE_VALUE

  useEffect(() => {
    if(!props.isProject) {
      dispatch(actions.getAnteenaInformationDetails(props.loginId, props.unid));
    }
    // if(!props.isProject) {
    //   dispatch(actions.getRadioInfoDetails(props.loginId, props.unid, vendor));
    // }
    if(siteDetailsInfo?.is_donor && siteDetailsInfo?.site_network_id && props.isProject) {
      dispatch(actions.getAPRadioDetails(siteDetailsInfo?.site_network_id, siteDetailsInfo?.managerid))
    }
  }, [])

  useEffect(() => {
    if (APRadioInfoData) {
      const filteredData = APRadioInfoData?.filter(device => device?.deviceType === 'AP RADIO');
      const gatewayAddress = APRadioInfoData?.find(device => device?.deviceType === 'ENSE CSR')?.deviceInfo?.apGatewayAddress || '';
      setFilteredAPRadioData(filteredData);
      setApGatewayAddress(gatewayAddress);
    }
  }, [APRadioInfoData])

  useEffect(() => {
    if(deviceTestSelected === "RAD" ){
        dispatch(actions.getRadioInfoDetails(props.loginId, props.unid));
      
    }else if(deviceTestSelected === "ANT" ){
      dispatch(actions.getAnteenaInformationDetails(props.loginId, props.unid));

    }else{
      if(siteDetailsInfo?.is_donor && siteDetailsInfo?.site_network_id && props.isProject) {
        dispatch(actions.getAPRadioDetails(siteDetailsInfo?.site_network_id, siteDetailsInfo?.managerid))
      }
    }
  },[deviceTestSelected])
  
  const handleDownloadAll = () => {
    if (!filteredAPRadioData?.length) return;
    
    let content = '';
    filteredAPRadioData.forEach((apradioInfo, index) => {
      content += `AP ${index + 1}\n\n`;
      content += `AP IP Address: ${apradioInfo?.deviceInfo?.['MANAGEMENT IP ADDRESS'] || '-'}/64\n`;
      content += `AP GATEWAY Address: ${apGatewayAddress || '-'}\n`;
      content += `DNS IP Address: ${apRadioServerIp || '-'}\n`;
      content += `NMS URL: ${apRadioNmsServer || '-'}\n`;
      content += `AUID: ${apradioInfo?.deviceId || '-'}\n`;
      content += `Installer Key: ${apRadioInstallerKey || '-'}\n`;
      
      if (index < filteredAPRadioData.length - 1) {
        content += `\n`;
      }
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `APRadio_Devices_Info.txt`;
    link.click();
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return radioData;
    }
    return radioData?.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [radioData, searchTerm]);

  if ((isAnteenaInfoLoading && !props.isProject) || (isAPRadioInfoLoading && props.isProject)) {
    return (
      <Loader
        color="#cd040b"
        size="75px"
        margin="4px"
        className="text-center"
      />
    );
  }

  let radioTableColumns = [
    {
      Header: "NodeID",
      accessor: "nodeId",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "Sector",
      accessor: "sector",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "DUID",
      accessor: "duid",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "RUName",
      accessor: "ruName",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "Technology",
      accessor: "technology",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "Vendor",
      accessor: "vendor",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "ProductName",
      accessor: "productName",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "PartCode",
      accessor: "partCode",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "SerialNumber",
      accessor: "serialNumber",
      headerStyle: { textAlign: 'left' }
    },
    {
      Header: "SoftwareVersion",
      accessor: "softwareVersion",
      headerStyle: { textAlign: 'left' }
    },
  ]

  return (
    <>
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }} >
      {!props.isProject && (
        <div style={{display: "flex"}}>
          <div className="subnav" style={{ borderBottom: deviceTestSelected === 'ANT' ? "3px solid black" : "3px solid #eceff1", marginBottom: '20px' }}>
            <button className="subnavbtn" onClick={() => setDeviceTestSelected('ANT')} >Antenna Information</button>
          </div>
          <div className="subnav" style={{ borderBottom: deviceTestSelected === 'RAD' ? "3px solid black" : "3px solid #eceff1", marginBottom: '20px' }}>
            <button className="subnavbtn" onClick={() => setDeviceTestSelected('RAD')} >Radio</button>
          </div>
                
        
      </div>
      )}
      
      {props.isProject && (
        <div style={{display: "flex"}}>
          {props.capitalProject && siteDetailsInfo.is_donor && (
          <div className="subnav" style={{ borderBottom: deviceTestSelected === 'APRAD' ? "3px solid black" : "3px solid #eceff1", marginBottom: '20px' }}>
            <button className="subnavbtn" onClick={() => setDeviceTestSelected('APRAD')} >AP Radio Information</button>
          </div>
          )}
          {props.capitalProject && (
          <div className="subnav" style={{ borderBottom: deviceTestSelected === 'ANT' ? "3px solid black" : "3px solid #eceff1", marginBottom: '20px' }}>
            <button className="subnavbtn" onClick={() => setDeviceTestSelected('ANT')} >Antenna Information</button>
          </div>
          )}
          {props.capitalProject && (
          <div className="subnav" style={{ borderBottom: deviceTestSelected === 'RAD' ? "3px solid black" : "3px solid #eceff1", marginBottom: '20px' }}>
            <button className="subnavbtn" onClick={() => setDeviceTestSelected('RAD')} >Radio</button>
          </div>
          )}
        </div>
          
      )}
      {deviceTestSelected === 'APRAD' && props.isProject && 
        <>
          {filteredAPRadioData?.length > 0 ?
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <div>
                  <Typography variant="body1" style={{ marginBottom: '10px' }}>
                    <strong>AP GATEWAY Address:</strong> {apGatewayAddress || '-'}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '10px' }}>
                    <strong>DNS IP Address:</strong> {apRadioServerIp || '-'}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '10px' }}>
                    <strong>NMS URL:</strong> {apRadioNmsServer || '-'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Installer Key:</strong> {apRadioInstallerKey || '-'}
                  </Typography>
                </div>
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadAll}
                    startIcon={<GetApp />}
                    disabled={!filteredAPRadioData?.length}
                    style={{ backgroundColor: 'black' }}
                  >
                    Download AP Radio Info
                  </Button>
                </div>
              </div>              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', rowGap: '10px' }}>
                {filteredAPRadioData.map((apradioInfo, index) => (
                  <Card key={index} style={{ marginBottom: '0px' }}>
                    <CardContent style={{ padding: '10px' }}>
                      <div>
                        <Typography variant="body1">
                          <strong>AUID:</strong> {apradioInfo?.deviceId || '-'}
                        </Typography>
                      </div>
                      <div style={{ marginTop: '10px' }}>
                        <Typography variant="body1">
                          <strong>AP IP Address:</strong> {`${apradioInfo?.deviceInfo?.['MANAGEMENT IP ADDRESS']}/64` || '-'}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            : <p style={{marginBottom:0, fontWeight: 'initial'}}>No Data Found</p>
          }
        </>
      }
          {deviceTestSelected === 'ANT' && AnteenaInfoData && AnteenaInfoData.toJS().map(anteenainfo => {
          return (
            <>
              <Accordion
                style={{
                  margin: 'auto', width: '99%',
                  boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold"
                }}
                TransitionProps={{ unmountOnExit: true }}
                defaultExpanded={(props.vendorWorkOrderSelectedRowObj?.work_type === "Antenna / Tower" || props.vendorWorkOrderSelectedRowObj?.work_type === "RF / Transport / Alarm/ Power / Grounding Equipment") ? true : false}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  EnodeB: {anteenainfo?.enodeb_id}
                </AccordionSummary>
                <AccordionDetails>
                  <div className="col-md-12" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                    <div className="col-lg-12" style={{ float: 'left' }}>
                      {anteenainfo?.antenna_info?.length > 0 ? (
                        <table className="table sortable table-bordered text-center site-table">
                          <tbody className="vzwtable text-left">
                            <tr className="rowColor">
                              <th>Sector</th>
                              <th>Band/Technology</th>
                              <th>Antenna Model</th>
                              <th>Antenna Azimuth(degrees)</th>
                              <th>Antenna Mech Tilt(degrees)</th>
                              <th>Antenna Height</th>
                            </tr>
                            {anteenainfo.antenna_info.map((data, index) => {
                              return (
                                <tr key={index}>
                                  <td style={{ fontWeight: "lighter" }}>{data.sector}</td>
                                  <td style={{ fontWeight: "lighter" }}>{data.band_tech}</td>
                                  <td style={{ fontWeight: "lighter" }}>{data.ant_model_no}</td>
                                  <td style={{ fontWeight: "lighter" }}>{data.ant_azimuth_deg}</td>
                                  <td style={{ fontWeight: "lighter" }}>{data.ant_mech_deg}</td>
                                  <td style={{ fontWeight: "lighter" }}>{data.ant_height}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : <h3>No Data Found</h3>}
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            </>
          );
        })}
        {deviceTestSelected === 'RAD' &&
           (
            <>
              <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control radio-search"
                  style={{
                    width: "248px",
                    height: "40px",
                    borderRadius: "4px",
                    fontFamily: 'Verizon NHG eDS',
                    fontWeight: 400,
                    fontSize: "14px",
                    paddingLeft: "10px",
                    paddingRight: "30px",
                    marginLeft: "6px",
                    marginBottom: "8px"
                  }}
                  autoComplete="off"
              />
              <Accordion
                style={{
                  margin: 'auto', width: '99%',
                  boxShadow: "rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px", fontWeight: "bold"
                }}
                TransitionProps={{ unmountOnExit: true }}
                defaultExpanded={true}
              >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    {radioData ? radioData[0]?.vendor : ""}
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="col-md-12" style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                      <div className="col-lg-12" style={{ float: 'left' }}>
                      <ReactTable
                        data={searchTerm.length > 0 ? filteredData: radioData}
                        columns={radioTableColumns}
                        defaultPageSize={radioData ? 10 : 3}
                        className="-striped -highlight"
                        enableGlobalFilter = {true}
                        
                      />
                      </div>
                    </div>
                  </AccordionDetails>
        
              </Accordion>
            </>
          )
        }
        </div>
    </>
  );
}

export default AnteenaInformation;
