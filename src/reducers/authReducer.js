import initialState from './initialState';

export default function authReducer(state = initialState.auth, action) {
  switch (action.type) {
    case "AUTH_INITIALIZED":
      return Object.assign({}, state, {initialized: true});

    case "AUTH_LOGGED_IN":
      return Object.assign({}, state, {
        isLogged: true,
        currentUserUID: action.userUID
      });

    case "AUTH_LOGGED_OUT":
      return Object.assign({}, state, {
        isLogged: false,
        currentUserUID: null
      });
    default:
      return state;
  }
}
