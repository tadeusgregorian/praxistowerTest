import thunk from 'redux-thunk';
import {createStore, applyMiddleware, compose} from 'redux';
import {routerMiddleware} from 'react-router-redux';
import {hashHistory} from "react-router";
import rootReducer from '../reducers';

export default function configureStore(initialState) {
	const middleware = process.env.NODE_ENV !== 'production' ?
	  [require('redux-immutable-state-invariant')(), thunk, routerMiddleware(hashHistory)] :
	  [thunk, routerMiddleware(hashHistory)];

    const store = createStore(
		rootReducer,
		initialState,
		compose(
			applyMiddleware(...middleware),
			window.devToolsExtension ? window.devToolsExtension() : f => f
		)
	);

    if (module.hot) {
        module.hot.accept('../reducers', () => {
			const nextRootReducer = require('../reducers').default;
			store.replaceReducer(nextRootReducer);
		});
    }
    return store;
}
