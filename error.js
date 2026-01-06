import config from './config'

export const coalesceErrors = errors => {
  if (config.environment !== 'testing') console.error(errors) // eslint-disable-line no-console

  if (!Array.isArray(errors)) {
    return [{
      "status": "500",
      "title": "Client error",
      "detail": "Client error"
    }]
  }

  return errors
}
