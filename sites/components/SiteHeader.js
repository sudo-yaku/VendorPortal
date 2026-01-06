import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { List } from 'immutable';
import SiteLoginForm from './SiteLoginForm';
import SiteLogoutForm from './SiteLogoutForm';
import Modal from '../../Layout/components/Modal';
import { getCurrentUser } from '../../Users/utils';
import Loader from '../../Layout/components/Loader';
import SiteIcons from './SiteIcons';

const SiteHeader = (props) => {

  // Redux selectors
  const { site_unid, textLeft, resetProps } = props;
  const loginId = useSelector(state => state.getIn(['Users', 'currentUser', 'loginId'], ''));
  const userid = useSelector(state => state.getIn(['Users', 'currentUser', 'loginId']));
  const user = useSelector(getCurrentUser);
  const site = useSelector(state =>
    state.getIn(['VendorDashboard', loginId, 'site', 'siteDetails'], List())
  );
  const loading = useSelector(state =>
    state.getIn(['Sites', 'details', site_unid, 'loading'], false)
  );
  const reason = useSelector(state =>
    state.getIn(['ivr', 'login', site_unid, 'login_reason'])
  );
  const loggedIn = reason && reason.length > 0;
  const lockcode = useSelector(state =>
    state.getIn(['ivr', 'login', site_unid, 'lockcode'])
  );

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const onClose = () => {
    setShowLoginModal(false);
  };

  const onLogoutClose = () => {
    setShowLogoutModal(false);
  };

  const renderLoginModal = () => (
    <Modal
      title="Log into site"
      handleHideModal={() => setShowLoginModal(false)}
      style={{ color: '#393939' }}
    >
      <SiteLoginForm
        site_unid={site.get('site_unid')}
        onLogin={onClose}
        enableSectorLock={
          props.vendorids.includes(props.vendorId?.toString()) &&
          props.types.includes(props.workType?.toUpperCase()?.trim())
        }
      />
    </Modal>
  );

  const renderLogoutModal = () => (
    <Modal
      title="Log out of site"
      handleHideModal={() => setShowLogoutModal(false)}
      style={{ color: '#393939' }}
    >
      <SiteLogoutForm
        site_unid={site.get('site_unid')}
        onLogout={onLogoutClose}
      />
    </Modal>
  );

  const openLoginForm = (site_unid) => {
    const keys = [loginId, 'site', site_unid, 'showLoginForm'];
    resetProps(keys, true);
  };

  const openLogoutForm = (site_unid) => {
    const keys = [loginId, 'site', site_unid, 'showLogoutForm'];
    resetProps(keys, true);
  };

  const loader = (
    <div
      className="pull-left"
      style={{ marginTop: 5, marginLeft: 10 }}
    >
      <Loader
        color="#cd040b"
        size="15px"
        margin="4px"
        className="text-center"
      />
    </div>
  );

  const baseLink = props.techId
    ? `/techs/${props.techId}/sites/${site.get('site_unid')}`
    : `sites/${site.get('site_unid')}`;

  return (
    <div>
      {showLoginModal && renderLoginModal()}
      {showLogoutModal && renderLogoutModal()}

      <div className="Grid">
        <div className="Col Col-6 u-floatLeft">
          {loading ? (
            loader
          ) : (
            <strong>
              # {site.get('siteid')} - {site.get('switch')} -{' '}
              {site.get('name')}
              {!loading && <SiteIcons baseLink={baseLink} site={site} />}
              {textLeft}
            </strong>
          )}
        </div>
        {user.get('vendor_category') !== 'Nest Evaluation' &&
          !props.isSnap && (
            <div className="Col Col-6 u-floatLeft">
              <span className="Col Col-8 u-floatLeft">
                {lockcode !== undefined ? (
                  <div>Lock Code: {lockcode}</div>
                ) : (
                  ''
                )}
              </span>
              <a
                id="IvrLogin"
                className="Col Col-8 u-floatRight pointer"
                onClick={() =>
                  loggedIn
                    ? openLogoutForm(site.get('site_unid'))
                    : openLoginForm(site.get('site_unid'))
                }
                style={{
                  marginLeft: '20px',
                  color: '#efefef',
                  textDecoration: 'underline',
                }}
              >
                {!loggedIn ? 'IVR Login' : 'IVR Logout'}
              </a>
            </div>
          )}
      </div>
    </div>
  );
};

SiteHeader.propTypes = {
  site: PropTypes.object,
  site_unid: PropTypes.string,
  loading: PropTypes.bool,
  techId: PropTypes.string,
  loggedIn: PropTypes.bool,
  lockcode: PropTypes.string,
  showLogin: PropTypes.bool,
  showMap: PropTypes.bool,
  textLeft: PropTypes.string,
  user: PropTypes.object,
  disableFilters: PropTypes.func,
  editing: PropTypes.bool,
  getQuotes: PropTypes.bool,
  onEditToggle: PropTypes.func,
  resetProps: PropTypes.func,
  loginId: PropTypes.string,
  isSnap: PropTypes.bool,
  vendorids: PropTypes.array,
  vendorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  types: PropTypes.array,
  workType: PropTypes.string,
};

export default SiteHeader;