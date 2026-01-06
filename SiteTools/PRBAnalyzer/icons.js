import React from 'react'
import PropTypes from 'prop-types'

export const WarnIcon = ({style = {}, ...props}) => {
  style = {...WarnIcon.defaultProps.style, ...style}
  return (
    <svg viewBox='0 0 18 16.06' {...props} style={style}>
      <g id='Layer_2' data-name='Layer 2'>
        <g id='Layer_1-2' data-name='Layer 1'>
          <rect x='8.1' y='11.67' width='1.8' height='1.78'></rect>
          <polygon points='8.1 7.09 8.69 9.88 9.3 9.88 9.9 7.09 9.9 4.45 8.1 4.45 8.1 7.09'></polygon>
          <path d='M17.79,13.64,10.39.81A1.61,1.61,0,0,0,7.6.81L.21,13.64a1.62,1.62,0,0,0,0,1.61,1.59,1.59,0,0,0,1.39.81H16.39a1.59,1.59,0,0,0,1.39-.81A1.62,1.62,0,0,0,17.79,13.64Zm-1,1a.49.49,0,0,1-.42.24H1.61a.49.49,0,0,1-.42-.24.46.46,0,0,1,0-.48L8.58,1.37A.49.49,0,0,1,9,1.12a.47.47,0,0,1,.41.25l7.4,12.83A.48.48,0,0,1,16.81,14.69Z'></path>
        </g>
      </g>
    </svg>
  )
}

WarnIcon.defaultProps = {
  style: {
    verticalAlign: 'middle',
    width: 15,
    fill: 'black'
  }
}
