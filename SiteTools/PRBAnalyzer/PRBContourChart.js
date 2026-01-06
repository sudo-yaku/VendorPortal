import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {List, Map, Set} from 'immutable'
import Plotly from 'plotly.js/dist/plotly.min'

const HOVERINFO_MODE = 'none'
const _RXANDAGGCOLORS = ['red', 'green', 'orange', 'blueviolet']


export class PRBContourChart extends Component {
  static propTypes = {
    contourData: PropTypes.object,
    enb: PropTypes.string.isRequired,
    sec: PropTypes.string.isRequired,
    car: PropTypes.string.isRequired,
    context: PropTypes.string, // 'alpt' or 'elpt'. if context isn't alpt, assumes elpt.
    width: PropTypes.number,
    height: PropTypes.number,
    cluster: PropTypes.object,
    displayOptions: PropTypes.object
  }

  static defaultProps = {
    width: 500,
    height: 500,
    cluster: Map()
  }

  constructor(props) {
    super(props)
    this.state = {
      charts: Map(),
      isAlpt: props.context === 'alpt'
    }
  }

  componentDidMount() {
    if (this.props.displayOptions && this.props.displayOptions.size > 0) {
      this.props.displayOptions.forEach((value, key) => {
        this.setState(() => ({[key]: value}))
      })
    }
    this.calculateChartData(this.props.contourData.get(this.getDataKey()))
  }

  getDataKey = () => {
    return `${this.props.enb}-${this.props.sec}-${this.props.car}`
  }

  componentDidUpdate(oldProps, oldState) {
    if (this.props.contourData !== oldProps.contourData && this.props.contourData !== null) {
      this.unsetLayoutAndData()
      if (this.props.contourData && this.props.contourData.get(this.getDataKey())) {
        // this.props.rrcData &&
        this.calculateChartData(this.props.contourData.get(this.getDataKey()))
      }
    }
  }

  unsetLayoutAndData = () => this.setState(() => ({layout: undefined, data: undefined}))

  nContours = () => (this.state.isAlpt ? 1 : 5)

  nX1Charts = () => this.nContours() + 2 // total graphs plotted on x1 axis. the +2 is to count the rrc and rx graphs

  rxIndex = () => this.nX1Charts()

  rrcIndex = () => this.nX1Charts() - 1

  sectorCarrierIndex = () => this.nX1Charts() - 2

  drawChart = (data = this.state.data, layout = this.state.layout, style = this.state.style) => {
    if (!data || data.length === 0) return
    Plotly.newPlot(this.container, data, layout, style)
    const chart = document.getElementById('prb-contour-plot')
    const hoverInfo = document.getElementById('hoverinfo')
    chart.on('plotly_hover', (data) => {
      if (data.points.length === 1 && (data.points[0].z === null || data.points[0].z === 999999)) return
      let chartName = ''
      const infotext = data.points.map((d) => {
        if (d.data.name) {
          chartName = d.data.name.slice(0, 3).toLowerCase()
          const validHoverCharts = Set(['prb', 'rfb', 'sec'])
          if (d.data.name && validHoverCharts.has(chartName)) {
            hoverInfo.style.left = data.event.clientX + window.pageXOffset + 'px'
            hoverInfo.style.top = data.event.pointerY - 40 + 'px' // 40? tries to vertically center hover tooltip
            if (chartName === 'rfb') {
              // contour charts hover text
              const freqMap = this.props.contourData.getIn([this.getDataKey(), 'contourFreq'], Map())
              hoverInfo.style.backgroundColor = '#CD5B45'
              const index = this.props.cluster.get('vendor', '') === 'Samsung' ? d.y.split(' ')[2] : d.y.split(' ')[1]

              return `  ${d.y}<br/>  Freq: ${freqMap.get(`prb${index}`, 'No Data')}<br/>  Value: ${d.z}<br/>  Date: ${
                d.x
              }<br />  ` // eslint-disable-line max-len
            }
            if (chartName === 'sec') {
              // sector carrier charts hover text
              const freqMap = this.props.contourData.getIn([this.getDataKey(), 'contourFreq'], Map())
              hoverInfo.style.backgroundColor = '#9F2B68'
              const index = d.y.split(' ')[1]

              return `  ${d.y}<br/>  Freq: ${freqMap.get(`prb${index}`, 'No Data')}<br/>  Value: ${d.z}<br/>  Date: ${
                d.x
              }<br />  ` // eslint-disable-line max-len
            }
          }
        }
        return ''
      })
      hoverInfo.innerHTML = infotext.join('')
    })

    chart.on('plotly_unhover', () => {
      hoverInfo.innerHTML = ''
    })

    this.loading = false
  }

  calculateChartData = (contourData = Map()) => {
    const contours = contourData.get('data', List())
    const contourX = contourData.get('xLabel', List())
    const rrcData = contourData.get('rrcData', List())
    const rxData = contourData.get('rxData', List())

    const data = this.createTraceObjects(contours, contourX, rrcData, rxData)
    const yaxis = this.createYaxis()
    const annotations = []
    const layout = {
      annotations,
      title: this.getTitle(),
      showlegend: true,
      autosize: true,
      // width: this.props.width,
      // height: this.props.height,
      margin: {t: 40, l: 50, b: 75},
      // hovermode: "none",
      hoverinfo: HOVERINFO_MODE,
      // paper_bgcolor: 'rgba(206,206,206,1)',
      plot_bgcolor: 'rgba(237,237,237,1)',
      bargap: 0,
      xaxis: {
        domain: [0.05, 1],
        showgrid: false,
        zeroline: false,
        title: `PRB`
      },
      ...yaxis
    }
    const style = {width: '100%', height: this.props.height}
    this.setState((state) => ({
      charts: state.charts.setIn([false, `${this.props.enb}-${this.props.sec}-${this.props.car}`], {
        data: data,
        layout: layout,
        style: style
      })
    }))
    this.drawChart(data, layout, style)
  }

  getTitle = () => {
    const {enb, sec, car} = this.props
    let channelNo

    if (this.props.contourData) {
      const enbSecCar = this.getDataKey()
      channelNo = this.props.contourData.getIn([enbSecCar, 'contourFreq', 'Block'], '')
    }

    let title = `PRB Analysis for ${enb}-${sec}-${car}`

    if (channelNo) title += `, Channel: ${channelNo}`

    return title
  }

  createYLabels = (data) => {
    const y = []
    for (let i = 0; i < data.length; ++i) {
      if (this.props.cluster.get('vendor', '') === 'Samsung') {
        y.push(`PRB Grp ${i + 1}`)
      } else {
        y.push(`PRB ${i + 1}`)
      }
    }
    return y
  }

  // pass in a list of objects created with formatContourData()
  // returns an array of trace objects that can be passed directly to chartly
  createTraceObjects = (formattedDataList, contourX, rrcData, rxData) => {
    const y = this.createYLabels(formattedDataList.first())
    const elptContour = {
      start: -100,
      end: -130,
      size: 2
    }
    const alptContour = {
      start: -80,
      end: -130,
      size: 3
    }
    const prbformattedDataList = this.state.isAlpt
      ? formattedDataList
      : formattedDataList.size === 5
      ? formattedDataList.pop()
      : formattedDataList
    const sectorCarrierformattedDataList = this.state.isAlpt
      ? ''
      : formattedDataList.size === 5
      ? formattedDataList.last()
      : []

    let data = List()
    prbformattedDataList.reverse().forEach((set, i) => {
      const trace = {
        z: set,
        x: contourX.toArray(),
        y,
        yaxis: `y${i + 1}`,
        type: 'contour',
        colorscale: 'Jet',
        hoverinfo: HOVERINFO_MODE,
        name: `RFB ${this.nContours() - (i + 1)}`,
        autocontour: false,
        contours: this.props.cluster.get('market-type', 'ELPT') === 'ALPT' ? alptContour : elptContour
      }
      data = data.push(trace)
    })
    if (sectorCarrierformattedDataList) {
      data = data.push({
        z: sectorCarrierformattedDataList,
        x: contourX.toArray(),
        y,
        yaxis: `y${this.sectorCarrierIndex()}`,
        type: 'contour',
        colorscale: 'Jet',
        hoverinfo: HOVERINFO_MODE,
        name: 'Sector Carrier',
        autocontour: false,
        // contours: elptContour
        contours: this.props.cluster.get('market-type', 'ELPT') === 'ALPT' ? alptContour : elptContour
      })
    }
    if (rrcData) {
      data = data.push({
        x: contourX.toArray(),
        y: rrcData.toArray(),
        yaxis: `y${this.rrcIndex()}`,
        type: 'line',
        showlegend: false,
        marker: {colorscale: 'Jet'},
        name: this.state.isAlpt ? 'RRC Setup Attempts' : 'RRC Setup Failure Den'
      })
    }

    if (rxData) {
      rxData.forEach((rx, rxName) => {
        data = data.push({
          x: contourX.toArray(),
          y: rx.toArray(),
          yaxis: `y${this.rxIndex()}`,
          type: 'line',
          showlegend: false,
          line: {color: _RXANDAGGCOLORS[+rxName.split('_')[0].slice(-1) - 1]},
          name: rxName
        })
      })
    }
    return data.toArray()
  }

  createYaxis = () => {
    const domainStep = 1 / this.nX1Charts()
    let yaxis = Map()
    // add aggregate y axis
    yaxis = yaxis.set('yaxis', {
      domain: [0, domainStep - 0.01],
      showgrid: false,
      zeroline: false,
      title: this.state.isAlpt ? '' : `RFB 4`
    })
    for (let i = 2; i <= this.nX1Charts(); i++) {
      yaxis = yaxis.set(`yaxis${i}`, {
        domain: [domainStep * (i - 1) + 0.005, domainStep * i - 0.01],
        showgrid: false,
        zeroline: false,
        title: `RFB ${5 - i}`
      })
    }
    if (!this.state.isAlpt) {
      yaxis = yaxis.set(`yaxis${this.sectorCarrierIndex()}`, {
        domain: [domainStep * 4 + 0.005, domainStep * 5 - 0.01],
        showgrid: false,
        zeroline: false,
        title: 'Sector Carrier'
      })
    }

    const rxbranchY = yaxis.get(`yaxis${this.rxIndex()}`)
    rxbranchY.title = 'RX_dBm'
    yaxis.set(`yaxis${this.rxIndex()}`, rxbranchY)

    const rrcY = yaxis.get(`yaxis${this.rrcIndex()}`)
    rrcY.title = this.state.isAlpt ? 'RRC Setup Att' : 'RRC Setup Fail'
    yaxis.set(`yaxis${this.rrcIndex()}`, rrcY)

    return yaxis.toJS()
  }

  hasData = () =>
    Boolean(this.props.contourData && !this.props.contourData.getIn([this.getDataKey(), 'data'], List()).isEmpty())

  render() {
    return (
      <div>
        <div style={{position: 'relative'}}>
          {!this.hasData() && <h2 className='text-center'>No data</h2>}
          <div style={{display: 'flex'}}>
            <div
              ref={(container) => {
                this.container = container
              }}
              id='prb-contour-plot'
              // eslint-disable-next-line max-len
              style={{height: this.props.height + 10, width: '100%', opacity: this.hasData() ? 1 : 0}}
            />
          </div>
          <div
            id='hoverinfo'
            style={{
              position: 'absolute',
              // backgroundColor: 'coral',
              border: '2px solid white',
              color: 'white'
            }}
          />
        </div>
      </div>
    )
  }
}
