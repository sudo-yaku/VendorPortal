import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SuspendedPage = () => {
    const location = useLocation();
    const data = location.state;
    const list = [];
    const [adminData, setAdminData] = React.useState([]);
    useEffect(() => {
        if(data?.portalAdminList){
            data?.portalAdminList.forEach((item) => {
                if(item.userid !== data?.loggedInId && item.user_status === 'Active')
                list.push(item.fname + ' ' + item.lname + ' (' + item.email + ')');
            });
            setAdminData(list);
        }
    }, [])

    return (
        <div className="text-center" style={{marginTop: 100}}>
            <p style={{fontSize:'20px'}}>Your access to Opsportal has not been certified for the current quarter.</p>
            <p>{`Please contact your company portal admin `}<b>{adminData.join(', ')}</b>{` to recertify your access`}</p><br/>
        </div>
    );
};

export default SuspendedPage;