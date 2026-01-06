import React, {Component} from 'react'
import PropTypes from 'prop-types'
import PanVZRF from '../../Layout/components/PanVZRF'
import MessageBox from '../../Forms/components/MessageBox'
import {List} from 'immutable'

class WOPan extends React.Component {
  static propTypes = {
    data:PropTypes.object,
    title:PropTypes.string,
    onPanClick:PropTypes.func,
  }
  constructor (props) {
    super(props)
    this.state= {total:0, allData:[]}
  }

  componentDidMount () {

  }
  constructChildPan () {
    let {data, onPanClick, role} = this.props
    let size = data.size
    let width = size > 0? Math.max(100/size, 15):100
    let pan =[]
    let total = 0
    let allData =[]
    let className = `float-left wo-footpan no-padding vz-pointer on-hover-gray`
    data.map((v) => {
      let iData = v.toJS()
      if(role && role.toUpperCase() == "PORTALADMIN" && iData.name == "Work Pending Unscheduled" && iData.data && iData.data.length > 0){
        onPanClick(iData)
      }
      let o = iData.data
      total+=o.length
      let color = `5px solid var(${v.get('color')})`
      allData = allData.concat(iData.data)
      pan.push(
                <div className={className} style={{
                  "width":`${width}%`,
                  "borderTop": color,
                  "fontSize": '11px'}} onClick = {() => {onPanClick(iData)}}>
                <div className="col-md-12 font-title-1" style={{
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                  overflow: 'hidden',
                  paddingLeft: '5px',
                  paddingRight: '5px'
                }}>{v.get('name')}</div>
                <div className="col-md-12 numberfont2" style={{
                  paddingLeft: '5px',
                  paddingRight: '5px'
                }}>{o.length}</div>
                </div>)
    })
    return {total, allData, pan}

  }

  render () {
    let {data, onPanClick, title} = this.props
    let result = data?.size >= 1?this.constructChildPan():data?.size?{total:data.getIn(["0", 'data']).size, allData:data?.getIn(["0", 'data']).toJS()}:null

    return (
          <PanVZRF title={title}>
            {!result ? <MessageBox messages={List(["No record(s) found."])}/> : (<div className="">
              <div className="col-md-12 numberfont1 vz-pointer on-hover-gray" style={{
                paddingLeft: '5px',
                paddingRight: '5px',
                fontSize: '5rem'
              }} onClick={() => {onPanClick({name:title, data:result?.allData})}}>
                <span>{result?.total}</span>
              </div>
              {result?.pan && <div className="col-md-12 no-padding float-left" style={{overflowX: 'auto'}}>
                {result?.pan}
              </div>}
            </div>)}
          </PanVZRF>
    )
  }
}

export default WOPan
