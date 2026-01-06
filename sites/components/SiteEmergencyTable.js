import React from 'react'
import PropTypes from 'prop-types'
import Loader from '../../Layout/components/Loader'

export default function SiteEmergencyTable ({emr_contact, loading}) {
  return loading ? <Loader color="#cd040b" size="75px" margin="4px" className="text-center" /> : (
    <div className="table-responsive">
      <table className="Table Table--striped Table--hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
          </tr>
        </thead>
          <tbody>
            {emr_contact.count() === 0 && <tr><td colSpan="2" className="text-center">No Contact Info.</td></tr>}
            {emr_contact.map(contact => {
                return (
                  <tr key={contact.get('name') + '-' + contact.get('value')}>
                    <td id="EmrContactName"><label style={{fontSize: '8pt'}}>{contact.get('name')}</label></td>
                    <td><label style={{fontSize:'8pt'}}>{contact.get('value')}</label></td>
                  </tr>)
            })}
          </tbody>
      </table>
   </div>
  )
}


SiteEmergencyTable.propTypes = {emr_contact: PropTypes.object.isRequired, loading: PropTypes.bool.isRequired}
