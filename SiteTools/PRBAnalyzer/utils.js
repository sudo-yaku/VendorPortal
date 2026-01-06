import {Map, List, fromJS} from 'immutable'
import moment from 'moment'

// copy/pasted from airwave

export const formatData = (actioncontext, actionprbData) => {
  const contourX = []
  const trimmedContourX = []
  let contours = List()
  const rrcData = []
  const trimmedRRCData = []
  const rxData = {
    RX1_dBm: [],
    RX2_dBm: [],
    RX3_dBm: [],
    RX4_dBm: []
  }
  const sortFunc = (a, b) => {
    let aHr = '' + a.HR
    let bHr = '' + b.HR
    if (aHr.length === 1) aHr = '0' + aHr
    if (bHr.length === 1) bHr = '0' + bHr
    return JSON.parse(a.DAY.replaceAll('-', '') + aHr) - JSON.parse(b.DAY.replaceAll('-', '') + bHr)
  }

  const data = {}
  const nullData = {}
  let freqs = Map()
  let earliestStartDate = null

  if (actioncontext === 'elpt') {
    for (let i = 1; i <= 100; ++i) {
      nullData[`pmRadioRecInterferencePwrBrPrb${i}`] = null
      nullData.RRC_SETUP_FAILURE_DEN = null
    }
  } else if (actioncontext === 'alpt') {
    for (let i = 1; i <= 99; ++i) {
      nullData[`MEAN_UL_RIP_PER_PRB${i}`] = null
      nullData.RRC_SETUP_ATTEMPTS = null
    }
  } else if (actioncontext === 'samsung') {
    for (let i = 1; i <= 99; ++i) {
      nullData[`PRB_GRP${i}`] = null
      nullData.RRC_SETUP_ATTEMPTS = null
    }
  }

  let consolidatedData = {}

  if (actionprbData.prb1 && actionprbData.prb5) {
    consolidatedData.freq = actionprbData.freq
    consolidatedData.prb1 = actionprbData.prb1.concat(actionprbData.prb5).sort(sortFunc)
    consolidatedData.prb2 = actionprbData.prb2.concat(actionprbData.prb6).sort(sortFunc)
    consolidatedData.prb3 = actionprbData.prb3.concat(actionprbData.prb7).sort(sortFunc)
    consolidatedData.prb4 = actionprbData.prb4.concat(actionprbData.prb8).sort(sortFunc)
    consolidatedData.sectorCarrier = actionprbData.sectorCarrier
  } else {
    consolidatedData = actionprbData
  }

  // Establish start date of earliest dataset for reference
  Object.keys(consolidatedData).forEach((key) => {
    const data = consolidatedData[key]
    if (key === 'freq' || data.length === 0) return
    const startDate = moment(`${data[0].DAY} ${data[0].HR}`, 'YYYY-MM-DD HH')
    if (!earliestStartDate || startDate.isBefore(earliestStartDate)) earliestStartDate = moment(startDate)
  })

  const emptyPrbs = []
  let maxLengthIndex = null
  const consolidatedDataKeysSorted = Object.keys(consolidatedData).sort((a, b) => {
    if (a === 'freq') return 1
    if (b === 'freq') return -1
    return 0
  })

  consolidatedDataKeysSorted.forEach((key, i) => {
    const bin = consolidatedData[key]
    if (key === 'freq') {
      freqs = fromJS(bin[0])
      return
    }

    const binData = []

    let dataset
    if (key === 'sectorCarrier') {
      dataset = consolidatedData[key].map((data) => ({...data, RFBRANCHRX: 5}))
    } else {
      dataset = consolidatedData[key]
    }
    if (bin.length === 0) {
      emptyPrbs.push(i)
      data[key] = []
      return
      // Commented out April 1 '23. Delete after October 1 '23
      // dataset = consolidatedData[keyForDefault]
      //
      // const firstPoint = dataset[0]
      //
      // const startDate = moment(`${firstPoint.DAY} ${firstPoint.HR}`, 'YYYY-MM-DD HH')
      //
      // bin[0] = {
      //   ...nullData,
      //   ENODEB: firstPoint.ENODEB,
      //   RFBRANCHRX: firstPoint.RFBRANCHRX,
      //   DAY: startDate.format('YYYY-MM-DD'),
      //   HR: startDate.hour()
      // }
      //
      // startDate.add(dataset.length - 1, 'h')
      //
      // bin[dataset.length - 1] = Object.assign({}, bin[0])
      //
      // dataset = consolidatedData[key]
    } else if (maxLengthIndex === null && key !== 'sectorCarrier') {
      maxLengthIndex = i
    }

    const startDate = moment(`${bin[0].DAY} ${bin[0].HR}`, 'YYYY-MM-DD HH')
    const endDate = moment(`${bin[bin.length - 1].DAY} ${bin[bin.length - 1].HR}`, 'YYYY-MM-DD HH')

    const shouldHave = moment.duration(endDate.diff(startDate)).asHours()

    startDate.subtract(1, 'h')

    for (let i = 0; i < shouldHave + 1; ++i) {
      startDate.add(1, 'h')

      const index = dataset.findIndex((d) => d.DAY === startDate.format('YYYY-MM-DD') && d.HR === startDate.hour())

      const datum = dataset[index]

      if (index !== -1) {
        binData.push(datum)
      } else {
        const newData = {
          ...nullData,
          ENODEB: dataset[0].ENODEB,
          RFBRANCHRX: dataset[0].RFBRANCHRX,
          DAY: startDate.format('YYYY-MM-DD'),
          HR: startDate.hour()
        }

        if (actioncontext === 'alpt' || actioncontext === 'samsung') {
          delete newData.RFBRANCHRX
        }

        binData.push(newData)
      }
    }

    data[key] = binData
  })

  const contourData = fromJS(data)

  contourData.forEach((chart) => {
    const newData = []
    const formattedContour = []
    let currentDay = ''
    let hourOffset = -1
    let deleteNonPRBKeys = 0
    let startDiff = 0

    chart.forEach((hour, ind) => {
      const currDate = moment(`${hour.get('DAY')} ${hour.get('HR')}`, 'YYYY-MM-DD HH')
      if (ind === 0 && currDate.isAfter(earliestStartDate)) {
        // Check how many hours are between the start of the current dataset and the start of the "earliest" dataset
        startDiff = moment.duration(currDate.diff(earliestStartDate)).asHours()
      }
      const prevHour = chart.getIn([ind - 1, 'HR'])
      const currHour = hour.get('HR')

      if (currHour - 1 !== prevHour && currHour !== 0 && prevHour !== 23) {
        const index = currHour - 1 + 24 * hourOffset
        formattedContour[index] = [].fill(null, 0, hour.size - 5)
        contourX[index] = `${hour.get('DAY')} ${currHour - 1 < 0 ? 23 : currHour - 1}`
      }

      if (currentDay !== hour.get('DAY')) {
        hourOffset++
        currentDay = hour.get('DAY')
      }

      const hourData = []
      deleteNonPRBKeys = actioncontext === 'alpt' ? hour.size - 4 : hour.size - 5
      for (let i = 1; i <= deleteNonPRBKeys; i++) {
        let val = hour.get(
          actioncontext === 'alpt' // nokia starts from 1
            ? `MEAN_UL_RIP_PER_PRB${i - 1}`
            : actioncontext === 'samsung'
            ? `PRB_GRP${i}`
            : `pmRadioRecInterferencePwrBrPrb${i}`,
          null
        )

        if (val !== null) {
          val = val.toFixed(1)
        }

        hourData[i - 1] = val
      }

      const index = hour.get('HR') + 24 * hourOffset

      rrcData[index] = hour.get(
        actioncontext === 'alpt' || actioncontext === 'samsung' ? 'RRC_SETUP_ATTEMPTS' : 'RRC_SETUP_FAILURE_DEN'
      )

      if (actioncontext === 'alpt' || actioncontext === 'samsung') {
        rxData.RX1_dBm[index] = hour.get('RSSIRX1_Avg')
        rxData.RX2_dBm[index] = hour.get('RSSIRX2_Avg')
        rxData.RX3_dBm[index] = hour.get('RSSIRX3_Avg')
        rxData.RX4_dBm[index] = hour.get('RSSIRX4_Avg')
      } else {
        rxData.RX1_dBm[index] = hour.get('RX1_DBM')
        rxData.RX2_dBm[index] = hour.get('RX2_DBM')
        rxData.RX3_dBm[index] = hour.get('RX3_DBM')
        rxData.RX4_dBm[index] = hour.get('RX4_DBM')
      }

      formattedContour[index] = hourData
      contourX[index] = `${hour.get('DAY')} ${hour.get('HR', 0)}`
    })

    // Fill in any missing dates at start of dataset
    for (let i = 0; i < startDiff; i++) {
      formattedContour.unshift(Array(deleteNonPRBKeys).fill(null))
    }
    // Chart requires first datapoint to have data. Not sure why. This line is critical to support the for loop  just above
    if (formattedContour[0]?.[0] === null) formattedContour[0][0] = '999999'

    formattedContour.forEach((row, j) => {
      row.forEach((col, i) => {
        if (!newData[i]) {
          newData[i] = []
        }

        newData[i][j] = col
      })
    })

    // chop off nulls at the top of the bin
    const index = newData.reverse().findIndex((row) => {
      return row.some((d) => d !== null)
    })

    if (index !== -1) {
      newData.splice(0, index)
    }

    newData.reverse()

    const trimmedData = []

    newData.forEach((row, i) => {
      row.forEach((col) => {
        if (!trimmedData[i]) {
          trimmedData[i] = []
        }

        trimmedData[i].push(col)
      })
    })

    contours = contours.push(trimmedData)
  })

  contourX.forEach((d) => trimmedContourX.push(d))

  rrcData.forEach((d) => trimmedRRCData.push(d))

  contours = contours.map((each, i) => {
    if (emptyPrbs.includes(i)) return Array(50).fill([null])
    return each
  })

  return fromJS({
    data: contours,
    xLabel: trimmedContourX,
    rrcData: trimmedRRCData,
    rxData,
    contourFreq: freqs
  })
}
