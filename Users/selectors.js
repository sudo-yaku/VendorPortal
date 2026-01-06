import {createSelector} from 'reselect'
import {Map, List} from 'immutable'
import {formatDate, toLocalDateTime} from '../date_utils'
import {selectEntitiesInList} from '../redux_utils'
// import {mgr_tech_sitecounts} from '../Sites/selectors'
import {duein} from '../Layout/table_selectors'
// import {USER_PERM} from '../5G/utils'
// import {czones_by_user} from '../CalloutZones/selectors'

export const currentLoginId = state => state.getIn(['Users', 'currentUser', 'loginId'])
export const realUserId = state => state.getIn(['Users', 'realUser', 'loginId'])

export const user = (state, props) => state.getIn(['Users', 'entities', 'users', props.loginId], Map())
const users = state => state.getIn(['Users', 'entities', 'users'], Map())
const features = state => state.getIn(['Users', 'entities', 'features'], Map())
export const allContacts = state => state.getIn(['contact', 'entities', 'users'], Map())


export const currentUser = createSelector(
  [currentLoginId, users], (loginId, allUsers) => allUsers.get(loginId, Map())
)
export const currentFeatures = createSelector(
  [currentLoginId, features], (loginId, allFeatures) => allFeatures.get(loginId, Map())
)

export const realUser = createSelector(
  [realUserId, users], (loginId, allUsers) => allUsers.get(loginId, Map())
)

const UsersList = state => state.getIn(['Users', 'getVendorList', 'Users'], List())
const UsersListLoading = state => state.getIn(['Users', 'getVendorList', 'isLoading'], false)
const activationLoading = state => state.getIn(['Users', 'useractivation', 'isLoading'], false)
export const settingsForUser = createSelector(
  [currentUser, UsersList, realUserId, realUser, UsersListLoading, activationLoading, currentFeatures], 
    (curr_user, users, realUserId, realUser, isLoading, isCalling, features) => {
    const loginId = curr_user.get('login_id')
    // const isReadOnly = curr_user.get('isSuperAdmin') === USER_PERM.READONLY.code ? true : false
  let ssoUrl = realUser ? realUser.get('ssoLogoutURL') : ''
   let isssouser = realUser ? realUser.get('isssouser') : ''
    return {
      loginId,
      user: curr_user,
      UsersList:users,
      realLoginId : realUserId,
      isLoading,
      isCalling,
      // isReadOnly,
      ssoUrl,
      isssouser,
      realUser,
      features
    }
  }
)



export const locations = state => state.getIn(['Users', 'entities', 'locations'], Map())

const dir_mgrs = (state, props) => state.getIn(['contact', 'relationships', 'dir-mgrs', props.loginId], List())
const mgr_techs = (state, props) => {
  if (user(state, props).get('role') === 'CELL_SWITCH_MANAGER') {
    return state.getIn(['Users', 'relationships', 'mgr-celltechs', props.loginId], List())
  }

  return state.getIn(['Users', 'relationships', 'mgr-techs', props.loginId], List())
}
const mgr_celltechs = (state, props) => state.getIn(['Users', 'relationships', 'mgr-celltechs', props.loginId], List())
const mgr_switchtechs = (state, props) => state.getIn(['Users', 'relationships', 'mgr-mgrtechs', props.loginId], List())


const techLocationsForMgr = createSelector(
  [mgr_techs, locations],
  (idList, locations) => {
    return locations.filter(user => {
      return idList.includes(user.get('techid'))
    })
  }
)

export const mgrsForDir = selectEntitiesInList(dir_mgrs, allContacts)

export const techsForMgr = createSelector(
  [mgr_techs, users, techLocationsForMgr],
  (idList, allUsers, locations, sitecounts) => {
    const techs = allUsers.filter(user => {
      return idList.includes(user.get('techid'))
    })

    return techs.map(tech => {
      const techid = tech.get('techid')
      const location = locations.get(techid, Map())

      const timestampPrefix = location.get('loggedintosite') == 'yes' ? "Logged in at " : "Logged out at "
      let timestamp = formatDate(location.get('lastlogintime'))
      timestamp = toLocalDateTime(timestamp)
      const timestampToDisplay = timestamp !== '' ? timestampPrefix + timestamp : ''

      return tech.merge(Map({
        sitecount: sitecounts.get(techid, 0),
        location_name: location.get('name'),
        location_site_unid: location.get('site_unid'),
        lastlogintime: timestampToDisplay
      }))
    })
  }
)

export const cellTechsForMgr = selectEntitiesInList(mgr_celltechs, users)
export const switchTechsForMgr = selectEntitiesInList(mgr_switchtechs, users)

const alarmCountsByUser = state => state.getIn(['Alarms', 'countsByUser'], Map())
const ticketCountsByUser = state => state.getIn(['Tickets', 'countsByUser'], Map())
const woCountsByUser = state => state.getIn(['WorkOrders', 'countsByUser'], Map())
const taskCountsByUser = state => state.getIn(['Tasks', 'countsByUser'], Map())
const pmCountsByUser = state => state.getIn(['PMs', 'countsByUser'], Map())

export const techTableData = createSelector(
  [
    techsForMgr,
    alarmCountsByUser,
    ticketCountsByUser,
    woCountsByUser,
    taskCountsByUser,
    pmCountsByUser,
    duein
  ],
  (techs, alarmcounts, ticketcounts, wocounts, taskcounts, pmcounts, duein) => {
    return techs.map(tech => {
      const techid = tech.get('techid')
      const alarms = alarmcounts.get(techid, Map())
      const tickets = ticketcounts.get(techid, Map())
      const workorders = wocounts.getIn([techid, duein.get('woDue')], Map())
      const tasks = taskcounts.getIn([techid, duein.get('tasksDue')], Map())
      const pms = pmcounts.getIn([techid, duein.get('pmsDue')], Map())

      return tech.merge({
        alarms_minor: alarms.get('minor', 0),
        alarms_major: alarms.get('major', 0),
        alarms_critical: alarms.get('critical', 0),
        alarms_warning: alarms.get('warning', 0),
        alarms_total: alarms.get('total', 0),
        tickets_noc: tickets.get('noc', 0),
        tickets_nrb: tickets.get('nrb', 0),
        tickets_total: tickets.get('total', 0),
        work_orders_vendor: workorders.get('vendor', 0),
        work_orders_granite: workorders.get('transport', 0),
        work_orders_total: workorders.get('vendor', 0) + workorders.get('transport', 0),
        tasks_done: tasks.get('tasks_done', 0),
        tasks_total: tasks.get('tasks_total', 0),
        tasks_outstanding: tasks.get('tasks_outstanding', 0),
        pms_done: pms.get('done', 0),
        pms_total: pms.get('total', 0),
        pms_outstanding: pms.get('outstanding', 0)
      })
    })
  }
)

export const mgrsLoading = (state, props) => state.getIn(['Users', 'requests', 'fetchMgrsForDir', props.loginId, 'loading'], false)
export const techsLoading = (state, props) => state.getIn(['Users', 'requests', 'fetchTechsForMgr', props.loginId, 'loading'], false)
export const techGroupsLoading = (state, props) => state.getIn(['Users', 'requests', 'fetchTechGroupsForMgr', props.loginId, 'loading'], false)
export const techSiteCountsLoading = (state, props) => state.getIn(['Sites', 'requests', 'fetchSiteCountsForMgrTechs', props.loginId, 'loading'], false)
const techAlarmsLoading = (state, props) => state.getIn(['Alarms', 'requests', 'fetchAlarmCountsForMgrTechs', props.loginId, 'loading'], false)
const techTicketsLoading = (state, props) => state.getIn(['Tickets', 'requests', 'fetchTicketCountsForMgrTechs', props.loginId, 'loading'], false)
const techVWOLoading = (state, props) => state.getIn(['WorkOrders', 'requests', 'fetchVWOCountsForMgrTechs', props.loginId, 'loading'], false)
const techTWOLoading = (state, props) => state.getIn(['WorkOrders', 'requests', 'fetchTWOCountsForMgrTechs', props.loginId, 'loading'], false)
const techTasksLoading = (state, props) => state.getIn(['Tasks', 'requests', 'fetchTaskCountsForMgrTechs', props.loginId, 'loading'], false)
const techPMsLoading = (state, props) => state.getIn(['PMs', 'requests', 'fetchPMCountsForMgrTechs', props.loginId, 'loading'], false)

export const techTableLoading = createSelector(
  [
    techsLoading,
    techGroupsLoading,
    techSiteCountsLoading,
    techAlarmsLoading,
    techTicketsLoading,
    techVWOLoading,
    techTWOLoading,
    techTasksLoading,
    techPMsLoading
  ],
  (techs, tech_groups, locations, sitecounts, alarms, tickets, vwo, two, tasks, pms) => {
    return Map({
      techs,
      tech_groups,
      locations,
      sitecounts,
      alarms,
      tickets,
      vwo,
      two,
      tasks,
      pms
    })
  }
)

export const getPreferredSortColumn = (state, table) => {
  return currentUser(state).getIn(['preferences', 'Tables', table, 'sort', 'column'])
}

export const getPreferredSortOrder = (state, table) => {
  return currentUser(state).getIn(['preferences', 'Tables', table, 'sort', 'order'])
}

export const getPreferredCalloutZone = (state) => {
  return realUser(state).getIn(['preferences', 'App', 'selectedZone'])
}

export const getPreferredTableCriteriaValue = (state, table, key) => {
  return currentUser(state).getIn(['preferences', 'Tables', table, 'criteria', key])
}
