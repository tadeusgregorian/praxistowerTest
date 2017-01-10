export default {
  routesPermissions: {
    requireAuth: [
      '/Apps'
    ],
  },
  routing: {},
  // user: {
  //   adminHash: undefined
  // },
  auth: {
    isLogged: false,
    currentUserUID: null,
    initialized: false
  },
};
