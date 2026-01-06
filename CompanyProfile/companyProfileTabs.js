import React, { useEffect, useState } from 'react';
import Users from '../Users/components/Users';
import DispatchAddress from '../Address/components/DispatchAddressDashboard';
import IVRDomainsDashboard from '../IVRDomains/components/IVRDomainsDashboard';
import config from '../config'
import {Link} from 'react-router-dom' 

function CompanyProfTabs(props) {
  const [selectedTab, setSelectedTab] = useState(props.selectedTab ? props.selectedTab : 'users')

  useEffect(() => {
    setSelectedTab(props.selectedTab)
  }, [props.selectedTab])

  const getTabs = () => {
    const bottomBorderStyle = "3px solid red";
    return (
      <div className="row" style={{ "background": "#FFF" }}>
        <div className="subnav" style={{ borderBottom: selectedTab == 'users' ? bottomBorderStyle : null }}>
          <Link className="subnavbtn" to={config.filepath + "companyProfile"} style={{ textDecoration: "none" }}>
            Manage Users
          </Link>
        </div>
        <div className="subnav" style={{ borderBottom: selectedTab == 'address' ? bottomBorderStyle : null }}>
          <Link className="subnavbtn" to={config.filepath + "dispatchAddress"} style={{ textDecoration: "none" }}>
            Manage Dispatch Address
          </Link>
        </div>
        <div className="subnav" style={{ borderBottom: selectedTab == 'ivrDomain' ? bottomBorderStyle : null }}>
          <Link className="subnavbtn" to={config.filepath + "ivrDomain"} style={{ textDecoration: "none" }}>
            Manage IVR Domains
          </Link>
        </div>
      </div>)
  }

  return (
    <div style={{ margin: "30px", paddingTop: "20px" }}>
      {getTabs()}
      {selectedTab == 'address' ? <DispatchAddress />
        : selectedTab == 'ivrDomain' ? <IVRDomainsDashboard />
          : <Users />}
    </div>
  )
}
export default (CompanyProfTabs)