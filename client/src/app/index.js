import React from 'react'
import { BrowserRouter as Router , Route, Switch} from 'react-router-dom'

import { RedaktionPage, MonitorPage, AdminPanel } from '../pages'
import { NavBar } from '../components'
import { RedaktionPageTest } from '../testsrc/pages'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'devextreme/dist/css/dx.light.css';

function App() {
    console.log("START",process.env.REACT_APP_REAL_API)
    return (
        <Router>
            {/* <NavBar /> */}
            <Switch className="switch-cont">
                <Route path="/" exact component={RedaktionPage} />
                <Route path="/test" exact component={RedaktionPageTest} />
                <Route path="/monitor" exact component={MonitorPage} />
                <Route path="/admin" exact component={AdminPanel} />
            </Switch>
        </Router>
    )
}

export default App