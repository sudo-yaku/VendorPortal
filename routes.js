import React from 'react'
import { Navigate, Route, useLocation } from 'react-router-dom'
import AppLayout from './Layout/components/AppLayout'
import config from './config'
import store from './store'
import { getAuthLoading, getRealUser } from './Users/utils'
import Loader from './Layout/components/Loader'

const EssoVendorDashboard = React.lazy(() => import('./EssoVendorDashboard/VendorDashboard'));
const UserDashboard = React.lazy(() => import('./UserDashboard/components/UserDashboard'))
const RecentActivity = React.lazy(() => import('./RecentActivity/RecentActivity'))
const UserProfile = React.lazy(() => import('./Users/components/UserProfile'))
const PMDashboard = React.lazy(() => import('./PreventiveMaintenance/components/PMDashboard'))
const CapitalDashboard = React.lazy(() => import('./CapitalDashboard/components/CapitalDashboard'))
const VendorDashboard = React.lazy(() => import('./VendorDashboard/components/VendorDashboard'))
const LoggedOut = React.lazy(() => import('./Login/components/LoggedOut'))
const CapitalProjectDashboard = React.lazy(() => import('./CapitalProjectDashboard/CapitalProjectDashboard'))
const Login = React.lazy(() => import('./Login/components/Login'))
const SessionExpires = React.lazy(() => import('./Login/components/SessionExpires'))
const ErrorPage = React.lazy(() => import('./Login/components/ErrorPage'))
const CompanyProfTabs = React.lazy(() => import('./CompanyProfile/companyProfileTabs'))
const UnauthorizedPage = React.lazy(() => import('./Auth/components/UnauthorizedPage'))
const DispatchAddressDashboard = React.lazy(() => import('./Address/components/DispatchAddressDashboard'))
const NotFound = React.lazy(() => import('./Layout/components/NotFound'))
// const ReleaseNotes = React.lazy(() => import('./ReleaseNotes/components/ReleaseNotes'))
const NestEvaluation = React.lazy(() => import('./NestEvaluation/NestEvaluation'))
const TrainingVideo = React.lazy(() => import('./Training/TrainingVideo'))
const GenRunReportDashboard = React.lazy(() => import('./GenRunReport/GenRunReportDashbaord'))
const GenFuelReportDashboard = React.lazy(() => import('./GenRunReport/GenFuelReportDashboard'))
const VWRSSearch = React.lazy(() => import('./VWRSSearch/VWRSSearch'))
const GenRunAlarmsDashboard = React.lazy(() => import('./GenRunReport/GenRunAlarmsDashboard'))
const SiteTools = React.lazy(() => import('./SiteTools/components/siteTools'))
const SuspendedPage = React.lazy(() => import('./Login/components/SuspendedPage'))

const renderLoading = () => {
  return (
    <Loader color="#cd040b"
      size="50px"
      margin="4px"
      className="text-center loader-centered" />
  )
}

function AuthLoading({ children }) {
  const location = useLocation()
  if (global.NODE_ENV !== 'development') {
    return <Navigate to={global.NODE_ENV === 'staging' ? '/sso/vendorportaltest/authLoading' : '/sso/authLoading'} state={{ from: location }} replace />
  }
  return children
}

function RequireAuth({ children }) {
  const user = getRealUser(store.getState())
  const location = useLocation()
  const isAuthLoading = getAuthLoading(store.getState())
  const role = String(user.get('vendor_role', '')).toLowerCase()
  if (isAuthLoading) return renderLoading();
  if (isAuthLoading && global.NODE_ENV !== 'development') {
    return <Navigate to={global.NODE_ENV === 'staging' ? '/sso/vendorportaltest/authLoading' : '/sso/authLoading'} state={{ from: location }} replace />
  }
  else if (!role) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }
  return children;
}

// const rootRedirect = config.sso ? <IndexRoute component={HomeRedirect} /> : <IndexRedirect to="login" />


const routes = (
  <Route path={config.filepath} element={<AppLayout />}>
    <Route index element={<Navigate to='login' />} />
    <Route path="login" element={<AuthLoading><Login /></AuthLoading>} />
    <Route path="authLoading" element={<Loader color="#cd040b" size="50px" margin="4px" className="text-center loader-centered" />} />
    <Route path="capitalProject" element={<RequireAuth><CapitalProjectDashboard /></RequireAuth>} />
    {/* <Route path="release-notes" element={<RequireAuth><ReleaseNotes /></RequireAuth>} /> */}
    {/* <Route path="userdashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} /> */}
    <Route path="dashboard" element={<RequireAuth><VendorDashboard /></RequireAuth>} />
    <Route path="companyProfile" element={<RequireAuth><CompanyProfTabs selectedTab="users" /></RequireAuth>} />
    <Route path="userProfile" element={<RequireAuth><UserProfile /></RequireAuth>} />
    <Route path="pmdashboard" element={<RequireAuth><PMDashboard /></RequireAuth>} />
    <Route path="capitalDashboard" element={<RequireAuth><CapitalDashboard /></RequireAuth>} />
    <Route path="account" element={<RequireAuth><CompanyProfTabs /></RequireAuth>} />
    <Route path="companyProfile" element={<RequireAuth><CompanyProfTabs selectedTab="users" /></RequireAuth>} />
    <Route path="dispatchAddress" element={<RequireAuth><CompanyProfTabs selectedTab="address" /></RequireAuth>} />
    <Route path="ivrDomain" element={<RequireAuth><CompanyProfTabs selectedTab="ivrDomain" /></RequireAuth>} />
    <Route path="address" element={<RequireAuth><DispatchAddressDashboard /></RequireAuth>} />
    <Route path="logged-out" element={<LoggedOut />} />
    <Route path="genRunReport" element={<RequireAuth><GenRunReportDashboard /></RequireAuth>} />
    <Route path="unauthorized" element={<UnauthorizedPage />} />
    <Route path="sesion-expires" element={<SessionExpires />} />
    <Route path="error" element={<ErrorPage />} />
    {/* <Route path="release-notes" element={<RequireAuth><ReleaseNotes /></RequireAuth>} /> */}
    <Route path="videos/:id" element={<RequireAuth><TrainingVideo /></RequireAuth>} />
    <Route path="nestEvaluation" element={<RequireAuth><NestEvaluation /></RequireAuth>} />
    <Route path="recentActivity" element={<RequireAuth><RecentActivity /></RequireAuth>} />
    <Route path="genFuelReport" element={<RequireAuth><GenFuelReportDashboard /></RequireAuth>} />
    <Route path="userdashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
    <Route path="companymanagement" element={<RequireAuth><EssoVendorDashboard /></RequireAuth>} />
    <Route path='vwrsSearch' element={<RequireAuth><VWRSSearch /></RequireAuth>} />
    <Route path='genRunAlarms' element={<RequireAuth><GenRunAlarmsDashboard /></RequireAuth>} />
    <Route path="siteTools" element={<RequireAuth><SiteTools /></RequireAuth>} />
    <Route path='suspended' element={<SuspendedPage />} />

    <Route path='*' element={<NotFound />} />
  </Route>)

export default routes;