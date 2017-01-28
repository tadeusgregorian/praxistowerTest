import firebase from 'firebase';

let config;

if (process.env.NODE_ENV === 'production') {
	// Production config (STERSEMANN + ANDREAS DB)
	console.log("YOU are working with the produciton database - be cautious!");
	config = {
		apiKey: "AIzaSyBwOP-NqDRYCw59ZdMlKAHK53sEnjG_l6s",
	    authDomain: "apochecklist2.firebaseapp.com",
	    databaseURL: "https://apochecklist2.firebaseio.com",
	    storageBucket: "apochecklist2.appspot.com",
	    messagingSenderId: "538290792451"
	};
} else {
	console.log("demo database - EVERYTHING FINE");
	config = {
		apiKey: "AIzaSyCGp1X-6ZofFdQBmVkkyHnGgJPODvH869I",
	    authDomain: "apochecklist2copy.firebaseapp.com",
	    databaseURL: "https://apochecklist2copy.firebaseio.com",
	    storageBucket: "apochecklist2copy.appspot.com",
	    messagingSenderId: "877461831816"
	}
}

const firebaseInstance = firebase.initializeApp(config);

export default firebaseInstance;
export const Storage = firebaseInstance.storage();
