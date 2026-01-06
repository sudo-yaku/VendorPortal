export function getCookie (name) {
  const value = "; " + document.cookie
  const parts = value.split("; " + name + "=")
  if (parts.length == 2) return parts.pop().split(";").shift()
  return null
}

export function deleteCookie (name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.vzwnet.com;'
}

export function getHost () {
  const {protocol, hostname, port} = window.location
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`
}

export function setCookie (name, value) {
  const date = new Date()
  const minutes = 15
  date.setTime(date.getTime() + (minutes * 60 * 1000))
  const expires = date.toGMTString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; Domain=.vzwnet.com`
}

