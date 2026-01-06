import {Map, fromJS, List} from 'immutable'


export default function columnFilterSelector (state) {
    
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
    let vendorId = user.toJS().vendor_id
    var pmList = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", "getPmListDetails", "pmLists"], List()).toJS();
    var pmFilters = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmFilters"], List()).toJS();
    
 
    return pmList.filter(element => {
 
    const pmTypeNameMatch = !pmFilters || !pmFilters.PM_TYPE_NAME || pmFilters.PM_TYPE_NAME.length === 0 || pmFilters.PM_TYPE_NAME === element.PM_TYPE_NAME;
        const pmListNameMatch = !pmFilters || !pmFilters.PM_LIST_NAME || pmFilters.PM_LIST_NAME.length === 0 || pmFilters.PM_LIST_NAME.includes(element.PM_LIST_NAME);
        const poNumMatch = !pmFilters || !pmFilters.PO_NUM || pmFilters.PO_NUM.length === 0 || pmFilters.PO_NUM.includes(element.PO_NUM);
        const s4poNumMatch = !pmFilters || !pmFilters.S4_PO_NUM || pmFilters.S4_PO_NUM.length === 0 || pmFilters.S4_PO_NUM.includes(element.S4_PO_NUM);
        const poStatus = !pmFilters || !pmFilters.PO_STATUS || pmFilters.PO_STATUS.length === 0 || pmFilters.PO_STATUS.includes(element.PO_STATUS)
        const pmListStatus =!pmFilters || !pmFilters.PM_LIST_STATUS || pmFilters.PM_LIST_STATUS.length === 0 || pmFilters.PM_LIST_STATUS.includes(element.PM_LIST_STATUS)
        const percentageMatch = !pmFilters || !pmFilters.PERCENTAGE || pmFilters.PERCENTAGE.length === 0 || pmFilters.PERCENTAGE.includes((100 - element.PERCENTAGE).toFixed(2));
        const buyerMatch = !pmFilters || !pmFilters.BUYER || pmFilters.BUYER.length === 0 || pmFilters.BUYER.includes(element.BUYER);
        const mnagerMatch = !pmFilters || !pmFilters.MANAGER || pmFilters.MANAGER.length === 0 || pmFilters.MANAGER.includes(element.MANAGER);
        return pmListNameMatch &&  pmTypeNameMatch && poNumMatch && poStatus && pmListStatus && percentageMatch && buyerMatch && mnagerMatch && s4poNumMatch

    });
}