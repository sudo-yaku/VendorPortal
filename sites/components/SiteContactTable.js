import React from 'react'
import PropTypes from 'prop-types'
import Loader from '../../Layout/components/Loader'

export default function SiteContactTable ({contacts, loading, filterProps, callOutZone, parentMenu}) {
  return loading ? <Loader color="#cd040b" size="75px" margin="4px" className="text-center" /> : (
   <div className="row">
    <div className="col-lg-12 col-12">
    <div className="table-responsive">
      <table className="vzwtable Table Table--striped Table--hoverr" style={{border:'1px solid #d8dada'}}>
        <thead>
          <tr>
            <th className="col-md-3" style={{padding:'5px', backgroundColor:'#f5f7f7'}}>Name</th>
            <th className="col-md-3" style={{padding:'5px', backgroundColor:'#f5f7f7'}}>Email</th>
            <th className="col-md-3" style={{padding:'5px', backgroundColor:'#f5f7f7'}}>Phone Number</th>
            <th className="col-md-3" style={{padding:'5px', backgroundColor:'#f5f7f7'}}>Role</th>
          </tr>
        </thead>
          <tbody>
            {contacts && contacts.count() === 0 && <tr><td colSpan="4" className="text-center">No Contact Info.</td></tr>}
            {contacts && contacts.map(contact => {
              if (parentMenu === 'NestEvaluation' || ["Site Technician", "Site Manager"].indexOf(contact.get('role')) > -1) {
                return (
                  <tr key={contact.get('name') + '-' + contact.get('role')}>
                    <td style={{padding:'5px', backgroundColor:"#fff"}} id="ContactName"><label style={{fontSize: '8pt'}}>{contact.get('name')?contact.get('name'):"-"}</label></td>
                    <td style={{padding:'5px', backgroundColor:"#fff"}}><label style={{fontSize:'8pt'}}><a href={`mailto:${contact.get('email')}`}>{contact.get('email')?contact.get('email'):"-"}</a></label></td>
                    <td style={{padding:'5px', backgroundColor:"#fff"}}><label style={{fontSize:'8pt'}}>{contact.get('phone')?contact.get('phone'):"-"}</label></td>
                    <td style={{padding:'5px', backgroundColor:"#fff"}}><label style={{fontSize:'8pt'}}>{contact.get('role')?contact.get('role'):"-"}</label></td>
                  </tr>


                )
              }
            })

            }

          </tbody>
      </table>
    </div>
    </div>
       {/*{(filterProps.quoteStatus===utils.QUOTEAPPROVED || filterProps.quoteStatus===utils.COMPLETED)?
    <CallOutZone callOutZoneValue={callOutZone} />:null}*/}
    </div>
  )
}

function CallOutZone ({callOutZoneValue}) {
  return (
      <div className="col-lg-6 col-12">
        <div className="table-responsive">
          <table className="vzwtable Table Table--noBorder Table--hover">

            <tbody className="vzwtable text-left">
             <tr>
                <td style={{fontSize:'15pt'}}>Callout Zone</td>
              </tr>
              <tr>
                <td><label style={{fontSize:'10pt'}}>{callOutZoneValue}</label></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  )
}





SiteContactTable.propTypes = {contacts: PropTypes.object.isRequired, loading: PropTypes.bool.isRequired, filterProps:PropTypes.object, callOutZone:PropTypes.string}
CallOutZone.propTypes = {callOutZoneValue:PropTypes.string}
