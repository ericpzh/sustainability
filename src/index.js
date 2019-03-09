import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route} from "react-router-dom";
import Table from './CSV/Table.js';
import registerServiceWorker from './registerServiceWorker';

//ReactDOM.render(<App />, document.getElementById('root'));



ReactDOM.render((
    <Router>
      <div>
        <Route exact path="/sustainability" component={App}/>
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
