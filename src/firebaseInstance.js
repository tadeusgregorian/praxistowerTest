import firebase from 'firebase';

let config;

if (process.env.NODE_ENV === 'production') {
	// Production config (STERSEMANN + ANDREAS DB)
	console.log("YOU are working with the produciton database - be cautious!");
	config = {
		apiKey: "AIzaSyA4eHe4Vg-HjoJJCchBi-ONyDwuNhcxpPE",
    authDomain: "praxistower.firebaseapp.com",
    databaseURL: "https://praxistower.firebaseio.com",
    storageBucket: "praxistower.appspot.com",
    messagingSenderId: "335392118284"
	};
	// config = {
	//     apiKey: "AIzaSyCRAE8D33cStZVlM_uGLKptrPA8EaCZC-w",
	//     authDomain: "apochecklistdemo.firebaseapp.com",
	//     databaseURL: "https://apochecklistdemo.firebaseio.com",
	//     storageBucket: "apochecklistdemo.appspot.com",
	// };
} else {
	// Development config (Demo DB)
	console.log("demo database - EVERYTHING FINE");
	config = {
		apiKey: "AIzaSyA4eHe4Vg-HjoJJCchBi-ONyDwuNhcxpPE",
    authDomain: "praxistower.firebaseapp.com",
    databaseURL: "https://praxistower.firebaseio.com",
    storageBucket: "praxistower.appspot.com",
    messagingSenderId: "335392118284"
	};
	// config = {
	//     apiKey: 'AIzaSyBwOP-NqDRYCw59ZdMlKAHK53sEnjG_l6s',
	//     authDomain: 'apochecklist2.firebaseapp.com',
	//     databaseURL: 'https://apochecklist2.firebaseio.com',
	//     storageBucket: 'apochecklist2.appspot.com'
	// };
}

const firebaseInstance = firebase.initializeApp(config);

export default firebaseInstance;
export const Storage = firebaseInstance.storage();
