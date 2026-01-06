import React from 'react'
import PropTypes from 'prop-types'
import Loader from '../../Layout/components/Loader'

export default function SiteBirdNestTable ({nest_info, loading, parentMenu}) {
  return loading ? <Loader color="#cd040b" size="75px" margin="4px" className="text-center" /> : (
  <div className="col-lg-12 col-12">
    <div className="table-responsive">
      <table className="vzwtable Table Table--striped Table--hover"  style={{border:'1px solid #d8dada'}}>
        <thead>
          {nest_info && nest_info.size === 0 && <tr><td colSpan="6" className="text-center">No Bird Nest Activity info.</td></tr>}
          <tr>
            <th id="restricted" style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Restricted</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Bird Type</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Tower Access Allowed</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Ground Access Allowed</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Restrictions Updated</label></th>
            <th style={{padding:'5px', backgroundColor:'#f5f7f7'}}><label>Restriction Comments</label></th>
          </tr>
        </thead>
        <tbody>
          {parentMenu === 'NestEvaluation' ? 
          <tr>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('rstr_isrestricted') == "0" ? "NO": 'YES'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('rstr_birdtype')? nest_info.get('rstr_birdtype') : '-'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('rstr_toweraccess') == "1"? "YES": 'NO'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('rstr_groundaccess') == "1" ? "YES" : 'NO'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('rstr_lastupdatedate')? nest_info.get('rstr_lastupdatedate') : '-'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('rstr_comments')? nest_info.get('rstr_comments') : '-'}</td>
        </tr> : <tr>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('restricted')? nest_info && nest_info.get('restricted').toUpperCase(): '-'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('bird_type')? nest_info.get('bird_type') : '-'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('tower_access')? nest_info.get('tower_access').toUpperCase(): '-'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('ground_access')? nest_info.get('ground_access').toUpperCase() : '-'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('updated')? nest_info.get('updated') : '-'}</td>
            <td style={{padding:'5px', backgroundColor:"#fff"}}>{nest_info && nest_info.get('comments')? nest_info.get('comments') : '-'}</td>
          </tr>}
        </tbody>
      </table>
    </div>
  </div>
  )
}

SiteBirdNestTable.propTypes = {nest_info: PropTypes.object.isRequired, loading: PropTypes.bool.isRequired}
