import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import { routerMiddleware } from 'react-router-redux';
import { hashHistory } from "react-router";

export default function configureStore(initialState) {
	const store = createStore(rootReducer, initialState, compose(
  	  applyMiddleware(thunk, routerMiddleware(hashHistory))
    ));
  return store;
}
