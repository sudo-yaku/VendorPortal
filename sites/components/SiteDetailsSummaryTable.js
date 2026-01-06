import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../../Layout/components/Loader';
import * as utils from '../utils';
import './style.css';

const SiteInfoTable = ({ site, role, esaFlag, parentMenu }) => {
  let bird_nest_activity = site.get('bird_nest_activity') ? site.get('bird_nest_activity').toJS() : null;

  return (
    <div className="col-12">
      <div className="table-responsive">
        <table className="vzwtable Table Table--hover col-12 float-left">
          <tbody className="vzwtable text-left">
            <tr>
              <td scope="row"><label>Address:</label></td>
              <td scope="row">
                <a
                  href={`http://maps.google.com/?q=${site.get('address')},${site.get('city')}, ${site.get('state')}, ${site.get('zip')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {site.get('address')},{site.get('city')}, {site.get('state')} {site.get('zip')}
                </a>
              </td>
              <td><label>County:</label></td>
              <td>{site.get('county') ? site.get('county') : '-'}</td>
              <td><label>Lat/Long:</label></td>
              <td>
                <a
                  href={`http://google.com/maps/place/${site.get('latitude')},${site.get('longitude')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {site.get('latitude') ? site.get('latitude') : '-'}, {site.get('longitude') ? site.get('longitude') : '-'}
                </a>
              </td>
            </tr>
            <tr>
              <td><label>Site Type:</label></td>
              {parentMenu === 'NestEvaluation' ? (
                <td>{site.get('site_type') ? site.get('site_type') : '-'}</td>
              ) : (
                <td>{site.get('sitetype') ? site.get('sitetype') : '-'}</td>
              )}
              <td><label>Status:</label></td>
              {parentMenu === 'NestEvaluation' ? (
                <td>{site.get('site_status') ? site.get('site_status') : '-'}</td>
              ) : (
                <td>{site.get('status') ? site.get('status') : '-'}</td>
              )}
              <td><label>Site Function:</label></td>
              {parentMenu === 'NestEvaluation' ? (
                <td>{site.get('site_function') ? site.get('site_function') : '-'}</td>
              ) : (
                <td>{site.get('sitefunction') ? site.get('sitefunction') : '-'}</td>
              )}
            </tr>
            <tr>
              <td><label>Equipment Type:</label></td>
              {parentMenu === 'NestEvaluation' ? (
                <td>{site.get('type') ? site.get('type') : '-'}</td>
              ) : (
                <td>{site.get('equipmenttype') ? site.get('equipmenttype') : '-'}</td>
              )}
              <td><label>Area:</label></td>
              <td id="area">{site.get('area') ? site.get('area') : '-'}</td>
              <td><label>Market:</label></td>
              <td>{site.get('region') ? site.get('region') : '-'}</td>
            </tr>
            {esaFlag === 'Y' ? (
              <tr>
                <td><label>Group:</label></td>
                <td>{site.get('market') ? site.get('market') : '-'}</td>
                <td><label>Switch:</label></td>
                <td>{site.get('switch') ? site.get('switch') : '-'}</td>
                <td><label>Tower Managed Phone:</label></td>
                <td>{site.get('tower_manager_phone') ? site.get('tower_manager_phone') : '-'}</td>
              </tr>
            ) : (
              <tr>
                <td><label>Group:</label></td>
                <td>{site.get('market') ? site.get('market') : '-'}</td>
                <td><label>Switch:</label></td>
                <td>{site.get('switch') ? site.get('switch') : '-'}</td>
                <td style={role === utils.PORTALADMIN ? { visibility: 'visible' } : { visibility: 'hidden' }}>
                  <label>PeopleSoft Id:</label>
                </td>
                <td style={role === utils.PORTALADMIN ? { visibility: 'visible' } : { visibility: 'hidden' }}>
                  {site.get('ps_loc_id') ? site.get('ps_loc_id') : '-'}
                </td>
              </tr>
            )}
            <tr>
              <td><label>MDGLC:</label></td>
              {parentMenu === 'NestEvaluation' ? (
                <td>{site.get('mdg_id') ? site.get('mdg_id') : '-'}</td>
              ) : (
                <td>{site.get('mdgid') ? site.get('mdgid') : '-'}</td>
              )}
              <td><label>LOCUS ID:</label></td>
              {parentMenu === 'NestEvaluation' ? (
                <td>{site.get('locus_id') ? site.get('locus_id') : '-'}</td>
              ) : (
                <td>{site.get('locusid') ? site.get('locusid') : '-'}</td>
              )}
              <td><label>Tower Access Restricted:</label></td>
              {parentMenu === 'NestEvaluation' ? (
                <td>{site.get("rstr_toweraccess") === '0' ? 'NO' : 'YES'}</td>
              ) : (
                <td>{bird_nest_activity && bird_nest_activity.tower_access && bird_nest_activity.tower_access === 'yes' ? 'NO' : 'YES'}</td>
              )}
            </tr>
            {(site.get('nss_site_id_1') && site.get('nss_site_id_1') !== 0) ? (
              <tr>
                <td style={site.get('nss_site_id_1') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #1:</label></td>
                <td style={site.get('nss_site_id_1') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id')}</td>
                <td style={site.get('nss_site_id_2') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #2:</label></td>
                <td style={site.get('nss_site_id_2') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id_2')}</td>
                <td style={site.get('nss_site_id_3') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #3:</label></td>
                <td style={site.get('nss_site_id_3') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id_3')}</td>
              </tr>
            ) : null}
            {(site.get('nss_site_id_4') && site.get('nss_site_id_4') !== 0) ? (
              <tr>
                <td style={site.get('nss_site_id_4') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #4:</label></td>
                <td style={site.get('nss_site_id_4') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id_4')}</td>
                <td style={site.get('nss_site_id_5') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #5:</label></td>
                <td style={site.get('nss_site_id_5') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id_5')}</td>
                <td style={site.get('nss_site_id_6') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #6:</label></td>
                <td style={site.get('nss_site_id_6') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id_6')}</td>
              </tr>
            ) : null}
            {(site.get('nss_site_id_7') && site.get('nss_site_id_7') !== 0) ? (
              <tr>
                <td style={site.get('nss_site_id_7') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #7:</label></td>
                <td style={site.get('nss_site_id_7') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id_7')}</td>
                <td style={site.get('nss_site_id_8') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #8:</label></td>
                <td style={site.get('nss_site_id_8') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id_8')}</td>
                <td style={site.get('nss_site_id_9') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}><label>Alt Cell #9:</label></td>
                <td style={site.get('nss_site_id_9') !== 0 ? { visibility: "visible" } : { visibility: "hidden" }}>{site.get('nss_site_id_9')}</td>
              </tr>
            ) : null}
            <tr>
              <td><label>Tower Type:</label></td>
              <td>{site.get('tower_type') ? site.get('tower_type') : '-'}</td>
              <td><label>Man Lift Requirements:</label></td>
              <td>{site.get('man_lift_requirements') ? site.get('man_lift_requirements') : '-'}</td>
              <td><label>RRH Antenna Access:</label></td>
              {parentMenu === 'NestEvaluation' ? (
                <td>{site.get('antenna_access') ? site.get('antenna_access') : '-'}</td>
              ) : (
                <td>{site.get('rrh_antenna_access') ? site.get('rrh_antenna_access') : '-'}</td>
              )}
            </tr>
            {esaFlag === "Y" ? (
              <tr>
                <td><label>Tower Managed By:</label></td>
                <td>{site.get('tower_managed_by') ? site.get('tower_managed_by') : '-'}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ) : (
              <tr>
                <td><label>Tower Managed By:</label></td>
                <td>{site.get('tower_managed_by') ? site.get('tower_managed_by') : '-'}</td>
                <td><label>Tower Managed Phone:</label></td>
                <td>{site.get('tower_manager_phone') ? site.get('tower_manager_phone') : '-'}</td>
                <td></td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 
      <div className='row' style={{marginBottom:'20px'}}>
        <div className='col-md-4'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Address:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>
            <a href={`http://maps.google.com/?q=${site.get('address')},${site.get('city')}, ${site.get('state')}, ${site.get('zip')}`} target="_blank" rel="noopener noreferrer">
              {site.get('address')}, {site.get('city')}, {site.get('state')} {site.get('zip')}
            </a>
          </p>
        </div>
        <div className='col-md-4'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Lock is NOC Integrated:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>
            {site.get('security_lock_noc_int') ? site.get('security_lock_noc_int').toUpperCase() : '-'}
          </p>
        </div>
        <div className='col-md-4'>
          <p style={{fontSize:'12px', fontWeight:'bold', marginBottom:'0px'}}>Access Restrictions:</p>
          <p style={{fontSize: '12px', fontWeight:'normal', border: '1px solid #d8dada', width:'90%', height:'25px', paddingTop:'3px', paddingLeft:'5px' }}>
            {site.get('accessrestriction') ? site.get('accessrestriction') : '-'}
          </p>
        </div>
      </div>
      */}
    </div>
  );
};

SiteInfoTable.propTypes = {
  site: PropTypes.object.isRequired,
  role: PropTypes.string,
  esaFlag: PropTypes.string,
  parentMenu: PropTypes.string,
};

const SiteDetailsSummaryTable = ({ site, loading, filterProps, esaFlag, parentMenu }) => {
  const loader = <Loader color="#cd040b" size="75px" margin="4px" className="text-center" />;

  if (loading) return loader;

  return (
    <div className="row">
      <SiteInfoTable site={site} role={filterProps.role} esaFlag={esaFlag} parentMenu={parentMenu} />
    </div>
  );
};

SiteDetailsSummaryTable.propTypes = {
  site: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  userRole: PropTypes.string,
  filterProps: PropTypes.object,
  esaFlag: PropTypes.string,
  parentMenu: PropTypes.string,
};

export default SiteDetailsSummaryTable;