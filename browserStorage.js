const hasSessionStore = !!typeof(sessionStorage)
const storagekey = 'VENDOR'
export default {
  set (data) {
    if (hasSessionStore) {
      const currentData = this.get()

      const newData = Object.assign({}, currentData || {}, data)

      window.sessionStorage.setItem(storagekey, JSON.stringify(newData))
    }
  },
  get (key) {
    const data = hasSessionStore ? JSON.parse(window.sessionStorage.getItem(storagekey)) : null

    return key && data ? data[key] : data
  },
  clear () {
    hasSessionStore && window.sessionStorage.removeItem(storagekey)
  }
}


export const ls = {
  set (data) {
    if (hasSessionStore) {
      const currentData = this.get()

      const newData = Object.assign({}, currentData || {}, data)

      localStorage.setItem(storagekey, JSON.stringify(newData))
    }
  },
  get (key) {
    const data = hasSessionStore ? JSON.parse(localStorage.getItem(storagekey)) : null

    return key && data ? data[key] : data
  },
  clear () {
    hasSessionStore && localStorage.removeItem(storagekey)
  }
}