import React, {Component} from 'react'

export default class SearchBar extends React.Component {
  render () {
    return (
			<div className="breadcrumbs ace-save-state" id="breadcrumbs">
				<div className="nav-search" id="nav-search">
					<form className="form-search">
						<span className="input-icon">
							<input type="text" placeholder="Search ..." className="nav-search-input" id="nav-search-input" autoComplete="off" />
							<i className="ace-icon fa fa-search nav-search-icon"></i>
						</span>
					</form>
				</div>
			</div>
    )
  }
}