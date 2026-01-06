import React, {PureComponent, Fragment} from 'react'
import PropTypes from 'prop-types'
import {Tabs as CTabs, TabPane as CanvasTab} from './tableTabs'

export function CanvasTabs({initialTabId, children}) {
  const tabs = React.Children.toArray(children).map((tab) => tab.props)
  const initialTabIndex = tabs.findIndex((t) => t.id === initialTabId)
  const [_active, _setActive] = React.useState(initialTabIndex || 0)
  return (
    <CTabs
      showTabCloseIcon={false}
      activeTabIndex={_active}
      onClick={(label, id, tabIndex) => {
        _setActive(tabIndex)
      }}
    >
      {tabs.map((tab) => (
        <CanvasTab key={tab.id} id={tab.id} label={tab.title}>
          {tab.children}
        </CanvasTab>
      ))}
    </CTabs>
  )
}

CanvasTabs.propTypes = {
  initialTabId: PropTypes.string,
  onChange: PropTypes.func,
  children: PropTypes.node
}

export class Tabs extends PureComponent {
  static propTypes = {
    children: PropTypes.any,
    headless: PropTypes.bool,
    active: PropTypes.string,
    onChange: PropTypes.func,
    border: PropTypes.bool,
    className: PropTypes.string,
    right: PropTypes.node
  }

  static defaultProps = {
    border: true,
    className: '',
    right: null
  }

  state = {
    active: ''
  }

  constructor(props) {
    super(props)
    let active = props.active
    const first = this.getTabs(props)[0]
    if (!active && first) {
      active = first.id
    }
    this.state = {active}
  }

  getTabs = (props) => React.Children.toArray(props ? props.children : this.props.children).map((tab) => tab.props)

  getActiveTab = () => this.props.active || this.state.active

  render() {
    const tabs = this.getTabs()
    const {headless, className, right} = this.props
    return (
      <Fragment>
        <div className='row'>
          <div className={`col-xs-12 ${className}`} style={right ? {display: 'flex'} : {}}>
            <ul className={`nav nav-tabs ${headless ? 'headless' : ''}`} role='tablist'>
              {tabs.map((tab) => {
                return (
                  <li
                    key={'tab-' + tab.id}
                    role='presentation'
                    className={`headlessTab ${tab.id === this.getActiveTab() ? 'active' : null}`}
                  >
                    <a
                      href={'#' + tab.id}
                      aria-controls={tab.id}
                      role='tab'
                      data-toggle='tab'
                      className='pointer'
                      onClick={() => {
                        if (!this.props.active) {
                          return this.setState({active: tab.id})
                        }
                        if (this.props.onChange) this.props.onChange(tab.id)
                      }}
                    >
                      {tab.title}{' '}{tab.count >=0 ? (
                        <span style={{ color: 'var(--color-red)', padding: 0 }}>({tab.count})</span>
                      ) : null}
                    </a>
                  </li>
                )
              })}
            </ul>
            {right}
          </div>
        </div>
        <div className='tab-content' style={!this.props.border ? {border: 'none', borderTop: '1px solid #C5D0DC'} : {}}>
          {tabs.map((tab) => {
            return (
              <div
                key={'panel-' + tab.id}
                role='tabpanel'
                className={`tab-pane ${tab.id === this.getActiveTab() ? 'active' : null}`}
                id={tab.id}
              >
                {this.getActiveTab() === tab.id ? tab.children : null}
              </div>
            )
          })}
        </div>
      </Fragment>
    )
  }
}

export class Tab extends PureComponent {
  static get propTypes() {
    return {
      title: PropTypes.any.isRequired,
      id: PropTypes.string.isRequired,
      children: PropTypes.node
    }
  }
}
