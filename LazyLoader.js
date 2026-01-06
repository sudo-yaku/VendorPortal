import React, { Component } from 'react'
import Loader from './Layout/components/Loader'
import './Fonts/NHaasGroteskDSStd-55Rg.ttf'
import NavBar from './Navigation/components/NavBar'
import './App.css'

class LazyLoader extends Component { 

  render() {
    return (
        <React.Fragment>
            <NavBar />
            <div className='lazy_loader_container'>
              <div className='lazy_loader_row'>
                <div className='lazy_loader_item'>
                <Loader color="#cd040b"
                  size="60px"
                  margin="4px"
                  className="text-center loader-centered" />
                </div>
              </div>
            </div>
            
        </React.Fragment>
    )
  }
}
export default LazyLoader;