import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route} from "react-router-dom";
import Table from './Table/Table.js';
import registerServiceWorker from './registerServiceWorker';
import Home3 from './ThreeD/Home3.js';
//ReactDOM.render(<App />, document.getElementById('root'));



ReactDOM.render((
    <Router>
      <div>
        <Route exact path="/sustainability" component={App}/>
        <Route exact path="/sustainability/3d" component={Home3}/>
        <Route exact path="/sustainability/Table" component={Table}/>
      </div>
    </Router>
    ),
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorker.unregister();
registerServiceWorker();
