import io from 'socket.io-client'
import openSocket from 'socket.io-client'
import config from '../config'
import store from '../store'
import { updateAppNotification } from './actions'

let socket = null

export const establishSocket = loginId => {
  if (!socket) buildSocket(loginId)
  return socket
}

function buildSocket(loginId) {
  const socketConfig = {
    transports: ['polling', 'websocket'],
    query: `loginid=${loginId}`,
    reconnectionAttempts: 50,
    pingTimeout: 60000,
    pingInterval: 30000
  }
  if (config.notificationPath) {
    socketConfig.path = config.notificationPath
  }
  socket = openSocket(config.notificationUrl, socketConfig)
  // socket = io(config.notificationUrl, socketConfig)
  socket.on("slr_note_evt", (arg1, callback) => {
    // console.log("slr_note_evt==", arg1)
    let defaultData = {
      notificationId: Math.floor(Math.random() * 100),
      notificaionReceived: true,
      notificationClicked: false,
      notificationAction: false,
      notificaionMessage: arg1.slrNote,
      notificaionProject: arg1.workOrderId != null ? arg1.workOrderId : arg1.projectNumber,
      notificationType: arg1.workOrderId ? "Work" : "Project",
      notificationFrom: "slr_note_evt"
    }
    let action = updateAppNotification(defaultData)
    store.dispatch(action)
    callback("AckReceived")
    // socket.emit('slr_note_ack', { slrNoteReceived: true })
  });
  socket.on("slr_sector_lock_evt", (arg1, callback) => {
    // console.log("slr_sector_lock_evt==", arg1)
    let defaultData = {
      notificationId: Math.floor(Math.random() * 100),
      notificaionReceived: true,
      notificationClicked: false,
      notificationAction: false,
      notificaionMessage: arg1.message,
      notificaionProject: arg1.sectorLockID,
      notificationType: arg1.sectorLockID,
      notificationFrom: "slr_sector_lock_evt"
    }

    let action = updateAppNotification(defaultData)
    store.dispatch(action)
    callback("AckReceived")
    // socket.emit('slr_sector_lock_evt', { slrNoteReceived: true })
  });
}
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
