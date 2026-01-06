import moment from 'moment'

let rfbranchcounter = 0
const freq = [
  {
    Block: '5230',
    BW: 10,
    prb1: '777.1 Mhz',
    prb2: '777.3 Mhz',
    prb3: '777.5 Mhz',
    prb4: '777.7 Mhz',
    prb5: '777.9 Mhz',
    prb6: '778.1 Mhz',
    prb7: '778.3 Mhz',
    prb8: '778.5 Mhz',
    prb9: '778.7 Mhz',
    prb10: '778.9 Mhz',
    prb11: '779.1 Mhz',
    prb12: '779.3 Mhz',
    prb13: '779.5 Mhz',
    prb14: '779.7 Mhz',
    prb15: '779.9 Mhz',
    prb16: '780.1 Mhz',
    prb17: '780.3 Mhz',
    prb18: '780.5 Mhz',
    prb19: '780.7 Mhz',
    prb20: '780.9 Mhz',
    prb21: '781.1 Mhz',
    prb22: '781.3 Mhz',
    prb23: '781.5 Mhz',
    prb24: '781.7 Mhz',
    prb25: '781.9 Mhz',
    prb26: '782.1 Mhz',
    prb27: '782.3 Mhz',
    prb28: '782.5 Mhz',
    prb29: '782.7 Mhz',
    prb30: '782.9 Mhz',
    prb31: '783.1 Mhz',
    prb32: '783.3 Mhz',
    prb33: '783.5 Mhz',
    prb34: '783.7 Mhz',
    prb35: '783.9 Mhz',
    prb36: '784.1 Mhz',
    prb37: '784.3 Mhz',
    prb38: '784.5 Mhz',
    prb39: '784.7 Mhz',
    prb40: '784.9 Mhz',
    prb41: '785.1 Mhz',
    prb42: '785.3 Mhz',
    prb43: '785.5 Mhz',
    prb44: '785.7 Mhz',
    prb45: '785.9 Mhz',
    prb46: '786.1 Mhz',
    prb47: '786.3 Mhz',
    prb48: '786.5 Mhz',
    prb49: '786.7 Mhz',
    prb50: '786.9 Mhz',
    prb51: '787.1 Mhz',
    prb52: '787.3 Mhz',
    prb53: '787.5 Mhz',
    prb54: '787.7 Mhz',
    prb55: '787.9 Mhz',
    prb56: '788.1 Mhz',
    prb57: '788.3 Mhz',
    prb58: '788.5 Mhz',
    prb59: '788.7 Mhz',
    prb60: '788.9 Mhz',
    prb61: '789.1 Mhz',
    prb62: '789.3 Mhz',
    prb63: '789.5 Mhz',
    prb64: '789.7 Mhz',
    prb65: '789.9 Mhz',
    prb66: '790.1 Mhz',
    prb67: '790.3 Mhz',
    prb68: '790.5 Mhz',
    prb69: '790.7 Mhz',
    prb70: '790.9 Mhz',
    prb71: '791.1 Mhz',
    prb72: '791.3 Mhz',
    prb73: '791.5 Mhz',
    prb74: '791.7 Mhz',
    prb75: '791.9 Mhz',
    prb76: '792.1 Mhz',
    prb77: '792.3 Mhz',
    prb78: '792.5 Mhz',
    prb79: '792.7 Mhz',
    prb80: '792.9 Mhz',
    prb81: '793.1 Mhz',
    prb82: '793.3 Mhz',
    prb83: '793.5 Mhz',
    prb84: '793.7 Mhz',
    prb85: '793.9 Mhz',
    prb86: '794.1 Mhz',
    prb87: '794.3 Mhz',
    prb88: '794.5 Mhz',
    prb89: '794.7 Mhz',
    prb90: '794.9 Mhz',
    prb91: '795.1 Mhz',
    prb92: '795.3 Mhz',
    prb93: '795.5 Mhz',
    prb94: '795.7 Mhz',
    prb95: '795.9 Mhz',
    prb96: '796.1 Mhz',
    prb97: '796.3 Mhz',
    prb98: '796.5 Mhz',
    prb99: '796.7 Mhz',
    prb100: '796.9 Mhz'
  }
]

export function generate(enb, sec, car, type) {
  const prbList = type === 'elpt' ? ['prb1', 'prb2', 'prb3', 'prb4', 'prb5', 'prb6', 'prb7', 'prb8'] : ['prb']
  const allData = {}

  function buildDataset(hrData, key, it, end) {
    for (it; it <= end; it++) {
      if (it <= 50) hrData[key + it] = +(Math.random() * -10 - 100).toFixed(2)
      else hrData[key + it] = null
    }
  }

  function makeData(isPrb, start, end) {
    const dataList = []
    for (let i = start; i > end; i = i - 4) {
      // days of PRB data
      const DAY = moment().subtract(i, 'd').format('YYYY-MM-DD')
      const ENODEB = `${enb}_${sec}${+car > 1 ? '_' + car : ''}`
      for (let h = 0; h < 24; h++) {
        // each hour of PRB data
        const hrData = {
          DAY,
          ENODEB,
          HR: h
        }
        if (type === 'elpt') {
          hrData.RRC_SETUP_FAILURE_DEN = Math.floor(Math.random() * 1000 + 2000)
          hrData.RX1_DBM = '' + Math.floor(Math.random() * 100 + 10)
          hrData.RX2_DBM = '' + Math.floor(Math.random() * 100 + 10)
          hrData.RX3_DBM = '' + Math.floor(Math.random() * 100 + 10)
          hrData.RX4_DBM = '' + Math.floor(Math.random() * 100 + 10)
          if (isPrb) hrData.RFBRANCHRX = rfbranchcounter
          buildDataset(hrData, 'pmRadioRecInterferencePwrBrPrb', 1, 100)
        } else {
          hrData.RRC_SETUP_ATTEMPTS = Math.floor(Math.random() * 1000 + 2000)
          hrData.RSSIRX1_Avg = '' + Math.floor(Math.random() * 100 + 10)
          hrData.RSSIRX2_Avg = '' + Math.floor(Math.random() * 100 + 10)
          hrData.RSSIRX3_Avg = '' + Math.floor(Math.random() * 100 + 10)
          hrData.RSSIRX4_Avg = '' + Math.floor(Math.random() * 100 + 10)
          if (type === 'nokia') buildDataset(hrData, 'MEAN_UL_RIP_PER_PRB', 0, 99)
          else buildDataset(hrData, 'PRB_GRP', 0, 12) // type === 'samsung' by default, this will need to change if another ALPT vendor is added
        }
        dataList.push(hrData)
      }
    }
    return dataList
  }

  prbList.forEach((prb, i) => {
    rfbranchcounter++
    if (rfbranchcounter > 4) {
      rfbranchcounter = 1
    }
    /**
     * The old system always used prb1-prb4. Recently the data converted to using prb5-prb8 and we need to handle
     * the new use-case where the dataset is partially prb1-4 and partially prb5-8. PRB Analyzer in general is only
     * expecting four prbs and the whole data processing stuff is very messy - we need this use-case present to ensure
     * the PRB can handle the oddities of this system
     */
    if (i < 4) allData[prb] = makeData(true, 12, 7)
    else allData[prb] = makeData(true, 4, 0)

    /** options for testing only some prbs but not others **/
    // if (prb === 'prb1' || prb === 'prb2') {
    //   allData[prb] = makeData(true, 12, 7)
    // } else if (prb === 'prb5' || prb === 'prb6') {
    //   allData[prb] = makeData(true, 4, 0)
    // } else {
    //   allData[prb] = []
    // }
  })

  if (type === 'elpt') allData.sectorCarrier = makeData(false, 12, 0)

  allData.freq = freq

  return allData
}
