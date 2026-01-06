import { Map } from 'immutable';
import React from 'react';
import NotificationSystem from 'react-notification-system'
import { connect } from 'react-redux';
import * as actions from './actions';
import { withRouter } from '../withRouter';

class AppNotification extends React.Component {

    componentDidMount() {
        this.displayNotification();
    }
    componentDidUpdate(prevProps) {
        let { appNotification } = this.props;
        if (prevProps && appNotification && prevProps.appNotification.notificationId != appNotification.notificationId) {
            this.displayNotification();
        }
    }
    displayNotification = () => {
        // this._notificationSystem.clearNotifications()
        this._notificationSystem = this.refs.notificationSystem
        let { appNotification, capitalProjectSelectedRow, vendorWorkOrderSelectedRow } = this.props;
        let capitalProjectSelectedRowJS = capitalProjectSelectedRow.hasOwnProperty("size") ? capitalProjectSelectedRow.toJS() : capitalProjectSelectedRow
        let vendorWorkOrderSelectedRowJS = vendorWorkOrderSelectedRow.hasOwnProperty("size") ? vendorWorkOrderSelectedRow.toJS() : vendorWorkOrderSelectedRow
        let workOrderNumber = vendorWorkOrderSelectedRowJS.WORK_ORDER_ID || vendorWorkOrderSelectedRowJS.workorder_id;
        let projectNumber = capitalProjectSelectedRowJS.WORK_ORDER_ID || capitalProjectSelectedRowJS.proj_number || capitalProjectSelectedRowJS.workorder_id;
        if (appNotification.notificaionReceived) {
            let fromFast = appNotification.notificationFrom == "slr_note_evt" ? "From FAST: " : ""
            let notificaion = {
                position: "tc",
                level: 'info',
                autoDismiss: 30,
                message: 
                <div>
                    <div style={{ color: "darkblue" }}>Verizon FAST Notification - <span>{appNotification.notificationType} </span><span>{appNotification.notificaionProject}</span></div>
                    <div style={{ color: "black" }}>{fromFast}{appNotification.notificaionMessage}</div>
                </div>
            }
            if ((appNotification.notificationType === "Project" && projectNumber != appNotification.notificaionProject) || (appNotification.notificationType === "Work" && workOrderNumber  != appNotification.notificaionProject)) {
                let { appNotification } = this.props;
                let updatedData = {
                    ...appNotification,
                    notificationAction: true
                }
                this.props.updateAppNotification(updatedData)
                this._notificationSystem.addNotification({
                    ...notificaion,
                    action: {
                        label: 'Click To Navigate',
                        callback: () => this.navigateToSLRScreen()
                    }
                })
            } else {
                let updatedData = {
                    ...appNotification,
                    notificationDisplayed: true
                }
                this.props.updateAppNotification(updatedData)
                this._notificationSystem.addNotification(notificaion)
            }
        }
    }
    navigateToSLRScreen = () => {
        let { appNotification } = this.props;
        let updatedData = {
            ...appNotification,
            notificationClicked: true,
        }
        this.props.updateAppNotification(updatedData)
        if (appNotification && appNotification.notificationType === "Project") {
            if (!window.location.pathname.includes("capitalProject")) {
                this.props.redirectOnClickOfNotification('capitalProject', this.props.navigate)
            }
        } else if (appNotification.notificationType === "Work") {
            if (!window.location.pathname.includes("dashboard")) {
                this.props.redirectOnClickOfNotification('dashboard', this.props.navigate)
            }
        }
    }

    render() {
        let style = {
            NotificationItem: { // Override the notification item
                DefaultStyle: { // Applied to every notification, regardless of the notification level
                    width: "125%",
                    height: "auto",
                    fontWeight: "bold",
                    margin: "0px",
                    padding: "5px"
                }
            }
        }
        return (
            <NotificationSystem ref="notificationSystem" style={style} />
        )
    }
}
function mapStateToProps(state) {
    let loginId = state.getIn(["Users", "currentUser", "loginId"], "")
    const appNotification = state.getIn(['AppNotificationReducer', 'appNotification'], Map())
    const capitalProjectSelectedRow = state.getIn(["CapitalProjectDashboard", "getSNAPProjects", "selectedRow"], Map())
    const vendorWorkOrderSelectedRow = state.getIn(["VendorDashboard", loginId, "workOrders", "selectedRow"], Map())
    return {
        loginId,
        appNotification,
        capitalProjectSelectedRow,
        vendorWorkOrderSelectedRow
    }
}
export default connect(mapStateToProps, { ...actions })(withRouter(AppNotification))
