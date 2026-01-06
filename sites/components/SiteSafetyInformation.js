import React from 'react'
import PropTypes from 'prop-types'
import Loader from '../../Layout/components/Loader'

export default function SiteSafetyInformation({ site, loading }) {
  return loading ? <Loader color="#cd040b" size="75px" margin="4px" className="text-center" /> : (
    <div className="col-lg-12 col-12">
      <div className="table-responsive">
        <table className="vzwtable Table Table--striped Table--hover">
          <tbody>
            <tr><label style={{ textDecoration: "underline" }}>Rooftop Safety:</label></tr>
            {site.get('safety_rooftop_emp_access') && <tr>
              <td className="col-md-4"><label>Can Employee Access?</label></td><td className="col-md-8">{site.get('safety_rooftop_emp_access') ? site.get('safety_rooftop_emp_access') : '-'}</td>
            </tr>}
            {site.get('safety_rooftop_emp_access') && site.get('safety_equip_light_required') && (site.get('safety_equip_light_required')=== "1" || site.get('safety_equip_light_required') === "0") && <tr>
              <td><label>Special Safety Equipment or Lighting Required?</label></td><td>{site.get('safety_equip_light_required') === "1" ? "Yes" : "No"}</td>
            </tr>}
            {site.get('safety_rooftop_emp_access') && site.get('safety_night_lighting') && (site.get('safety_night_lighting') === "1" || site.get('safety_night_lighting')  === "0") && <tr>
              <td><label>Additional Lighting Required for Night Work?</label></td><td>{site.get('safety_night_lighting')  === "1" ? "Yes" : "No"}</td>
            </tr>}
            {site.get('safety_rooftop_emp_access') && site.get('safety_fall_prot_req')  && (site.get('safety_fall_prot_req')  === "1" || site.get('safety_fall_prot_req')  === "0") && <tr>
              <td><label>Fall Protective Equipment Required?</label></td>
              <td>
                {site.get('safety_fall_prot_req')  && site.get('safety_fall_prot_req')  === "1" ? <div><p>Yes</p>
                  {site.get('safety_ladder_sclimb_type')  && <p><label>*Ladder Safety Climb(full-body harness and connecting device)</label>
                    <p> {site.get('safety_ladder_sclimb_type') }</p></p>}
                  {site.get('safety_ladder_sclimb_type_oth')  && <p> {site.get('safety_ladder_sclimb_type_oth') }</p>}
                  {site.get('safety_des_area_eqp_type')  && <p><label>*Designated Area Equipment(warning line system)</label>
                    <p> {site.get('safety_des_area_eqp_type')}</p></p>}
                  {site.get('safety_travel_restr_type') && <p><label>*Travel Restraint(full-body harness and restraint lanyard)</label>
                    <p> {site.get('safety_travel_restr_type')}</p></p>}
                </div> : 'No'}
              </td>
            </tr>}
            <tr>
              <td><label>Rooftop Safety Notes</label><p>(Restricted area details, Safety equipment details, Other notes)</p></td>
              <td>{site.get('safety_rooftop_notes') ? site.get('safety_rooftop_notes') : '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Hazardous Site Information */}
      {site?.get('is_hazardous_site') === true && (
        <div className="table-responsive">
          <table className="vzwtable Table Table--striped Table--hover">
            <tbody>
              <tr><label style={{ textDecoration: "underline" }}>Hazardous Info:</label></tr>
              <tr> 
                <td> 
                  <span>
                    <label style={{display: 'inline'}}>Warning:</label>
                    <span style={{color: 'red', marginLeft: '5px'}}>{site?.get('hazard_type') || '-'}</span>
                  </span>
                  <br />
                  <span>
                    <label style={{display: 'inline'}}>Description:</label>
                    <span style={{color: 'red', marginLeft: '5px'}}>{site?.get('hazard_justification') || '-'}</span>
                  </span> 
                </td> 
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

SiteSafetyInformation.propTypes = { site: PropTypes.object.isRequired, loading: PropTypes.bool.isRequired }
