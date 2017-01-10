import React, {Component} from 'react';
import {Router, Route, hashHistory, Redirect} from 'react-router';
import routes from './routes';
import {Provider} from 'react-redux';
import configureStore from './store/configureStore';
import initialState from './reducers/initialState';
import {syncHistoryWithStore} from 'react-router-redux'

import 'normalize.css/normalize.css';
import 'skeleton.css/skeleton.css';
import 'toastr/build/toastr.min.css';
import "./styles/main.scss";

const store = configureStore(initialState);
window.store = store;
const history = syncHistoryWithStore(hashHistory, store)

export default() => {
	return (
		<Provider store={store}>
			<Router history={history}>
				<Redirect from="/" to="/Apps/Tasks"/>
				{routes}
			</Router>
		</Provider>
	)
};

import areIntlLocalesSupported from 'intl-locales-supported';
let DateTimeFormat;
if (areIntlLocalesSupported(['de-DE'])) {
	window.DateTimeFormat = global.Intl.DateTimeFormat;
} else {
	const IntlPolyfill = require('intl');
	window.DateTimeFormat = IntlPolyfill.DateTimeFormat;
	require('intl/locale-data/jsonp/de-DE.js');
}
