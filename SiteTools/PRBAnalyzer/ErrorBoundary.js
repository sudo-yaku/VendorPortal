import React from 'react';
import {WarnIcon} from './icons';

const errorBoundaryStyle = {
  marginTop: '5rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={errorBoundaryStyle}>
          <span>
            <WarnIcon /> {this?.props?.errorMessage || "Something went wrong."}
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}
