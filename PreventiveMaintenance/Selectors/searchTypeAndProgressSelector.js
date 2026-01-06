import {Map, fromJS, List} from 'immutable'


export default function searchTypeAndProgressSelector (state) {
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    let user = state.getIn(['Users', 'entities', 'users', loginId], Map())
    let vendorId = user.toJS().vendor_id
    var pmList = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmListDetails", "getPmListDetails", "pmLists"], List()).toJS();
    var pmFilters = state.getIn(['PmDashboard', loginId, vendorId, 'pm', "pmFilters"], List()).toJS();
    
 
    return pmList.filter(element => {

        const typeMatch = !pmFilters.pmType || pmFilters.pmType === 'PM Summary' || element.PM_TYPE_NAME.toLowerCase() === pmFilters.pmType.toLowerCase();
        const searchTextMatch = element.PM_LIST_NAME.toLowerCase().includes(pmFilters.searchText.toLowerCase());
        const progressMatch = !element.PMLISTSTATUS  || element.PMLISTSTATUS === pmFilters.completionStatus ||  !pmFilters.completionStatus
        return typeMatch &&  progressMatch;

    });
}