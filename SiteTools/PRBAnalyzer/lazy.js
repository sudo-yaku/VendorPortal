import React from 'react'
import {WarnIcon} from './icons'

// eslint-disable-next-line
export function Lazy({children, fallback}) {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </ErrorBoundary>
  )
}

const defaultFallback = <>...</>

export default function lazy(Comp, fallback) {
  return (
    <ErrorBoundary>
      <Lazy fallback={fallback ?? defaultFallback}>
        <Comp />
      </Lazy>
    </ErrorBoundary>
  )
}

const errorBoundaryStyle = {
  marginTop: '5rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {hasError: false}
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return {hasError: true}
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={errorBoundaryStyle}>
          <span>
            <WarnIcon /> Something went wrong.
          </span>
        </div>
      )
    }

    // eslint-disable-next-line
    return <div>{this.props.children}</div>
  }
}
