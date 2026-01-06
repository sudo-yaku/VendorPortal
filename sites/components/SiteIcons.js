import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import RedBird from '../images/bird-red.png';
import TowerLightIcon from '../images/twr_light_icon.png';
import EnvAlarmIcon from '../images/env_alarm_icon.png';
import TowerInspectionIcon from '../images/twr_inspection_icon.png';
import TowerLightIconYellow from '../images/twr_light_icon_yellow.png';
import EnvAlarmIconYellow from '../images/env_alarm_icon_yellow.png';
import TowerInspectionIconYellow from '../images/twr_inspection_icon_yellow.png';
import Truck_red from '../images/twr_inspection_icon.png';
import VZW_Truck from '../images/twr_inspection_icon.png';
import { utcToLocal } from '../../date_utils';

const SiteIcons = ({ site, baseLink, showLargeIcon }) => {
  console.log('SiteIcons component rendered with  props:', site, baseLink, showLargeIcon );
  const renderEmisVerification = () => {
    const tooltip = site.get('emis_tooltip');
    let color = 'transparent';

    if (site.get('emis_verification') === 'yellow') {
      color = '#d0d016';
    } else if (site.get('emis_verification') === 'red') {
      color = 'red';
    } else {
      return null;
    }

    const className = 'glyphicon glyphicon-warning-sign';

    return (
      <Link to={`${baseLink}/emis/summary`} className="site-link">
        <strong style={{ color, marginLeft: 5 }} title={tooltip}>
          <span className={className} aria-hidden="true"></span>
        </strong>
      </Link>
    );
  };

  const renderTowerLightIcon = () => {
    const tooltip = site.get('twr_light_tooltip');
    const color = site.get('twr_light_icon_color');
    const url = `${baseLink}/alarms/tests`;

    if (color === 'yellow') {
      return site.get('twr_light_icon') === 'yes' ? (
        <span title={tooltip}>
          <Link to={url} className="pointer site-link">
            <img src={TowerLightIconYellow} width="25" style={{ marginLeft: 5 }} />
          </Link>
        </span>
      ) : null;
    } else {
      return site.get('twr_light_icon') === 'yes' ? (
        <span title={tooltip}>
          <Link to={url} className="pointer site-link">
            <img src={TowerLightIcon} width="25" style={{ marginLeft: 5 }} />
          </Link>
        </span>
      ) : null;
    }
  };

  const renderEnvAlarmIcon = () => {
    const tooltip = site.get('env_alarm_tooltip');
    const color = site.get('env_alarm_icon_color');
    const url = `${baseLink}/alarms/tests`;

    const width = '25';
    const style = showLargeIcon
      ? { marginLeft: 5, marginBottom: 10 }
      : { marginLeft: 5 };

    if (color === 'yellow') {
      return site.get('env_alarm_icon') === 'yes' ? (
        <span title={tooltip}>
          <Link to={url} className="pointer site-link">
            <img src={EnvAlarmIconYellow} width={width} style={style} />
          </Link>
        </span>
      ) : null;
    } else {
      return site.get('env_alarm_icon') === 'yes' ? (
        <span title={tooltip}>
          <Link to={url} className="pointer site-link">
            <img src={EnvAlarmIcon} width={width} style={style} />
          </Link>
        </span>
      ) : null;
    }
  };

  const renderTowerInspectionIcon = () => {
    const tooltip = site.get('twr_inspection_tooltip');
    const color = site.get('twr_inspection_icon_color');

    if (color === 'yellow') {
      return site.get('twr_inspection_icon') === 'yes' ? (
        <span title={tooltip}>
          <img src={TowerInspectionIconYellow} width="25" style={{ marginLeft: 5 }} />
        </span>
      ) : null;
    } else {
      return site.get('twr_inspection_icon') === 'yes' ? (
        <span title={tooltip}>
          <img src={TowerInspectionIcon} width="25" style={{ marginLeft: 5 }} />
        </span>
      ) : null;
    }
  };

  const renderIvrLogins = () => {
    const name = `${site.get('ivr_fname')} ${site.get('ivr_lname')} `;
    const ani = site.get('ivr_ani') ? `${site.get('ivr_ani')}, ` : '';
    const company = `${site.get('ivr_function')}, ${site.get('ivr_company')} `;
    const logDisplay = site.get('ivr_currentlogin') === 'yes' ? 'Logged In' : 'Logged Out';
    const time = utcToLocal(site.get('ivr_timestamp'));
    const tooltip = `${name}, ${ani}${company}, ${logDisplay} ${time}`;
    const isLoggedIn = site.get('ivr_currentlogin') === 'yes';
    const iconToUse = site.get('ivr_company') === 'Verizon Wireless' ? VZW_Truck : Truck_red;

    if (isLoggedIn) {
      return (
        <span title={tooltip}>
          <img src={iconToUse} width="25" style={{ marginLeft: 5 }} />
        </span>
      );
    }
  };

  return (
    <span>
      {site.get('bird_restriction') === 'yes' && (
        <span title="Bird Nest Activity">
          <img src={RedBird} width="25" style={{ marginLeft: 5 }} />
        </span>
      )}
      {renderEmisVerification()}
      {renderTowerLightIcon()}
      {renderEnvAlarmIcon()}
      {renderTowerInspectionIcon()}
      {renderIvrLogins()}
    </span>
  );
};

SiteIcons.propTypes = {
  site: PropTypes.object.isRequired,
  baseLink: PropTypes.string.isRequired,
  showLargeIcon: PropTypes.bool,
};

SiteIcons.defaultProps = {
  showLargeIcon: false,
};

export default SiteIcons;