import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import Root from './root';
import Sugar from 'Sugar';
window["Sugar"] = Sugar;
import de from 'Sugar/locales';
Sugar.extend();
import helper from 'helpers/index';
import 'react-fastclick';
import $ from 'jquery';
window.$ = $
import sha1 from 'sha1';
window.sha1 = sha1;
import toastr from 'toastr';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();




// Get our root element
const rootEl = document.getElementById('react-root');

// And render our App into it, inside the HMR App Container which handles the reloading
render(
    <AppContainer>
        <Root />
    </AppContainer>,
    rootEl
)

// Handle hot reloading actions from Webpack
if (module.hot) {
    module.hot.accept('./root', () => {
        // If we receive a HMR action for our App container, then reload it
        // using require (we can't do this dynamically with import)
        const NextRoot = require('./root').default;

        // And render it into our root element again
        render(
            <AppContainer>
                <NextRoot />
            </AppContainer>,
            rootEl
        )
    })
}


window.Date = Date;
// Small helper (Put somewhere else later please)
Date.prototype.isSameDateAs = function(pDate) {
	if (typeof pDate.getMonth === 'function') {
		return (this.getFullYear() === pDate.getFullYear() && this.getMonth() === pDate.getMonth() && this.getDate() === pDate.getDate());
	} else if (typeof pDate === "string") {
		const qDateO = Date.create(pDate)
		return (this.getFullYear() === qDateO.getFullYear() && this.getMonth() === qDateO.getMonth() && this.getDate() === qDateO.getDate())
	}
    return false;
};

Date.prototype.shortISO = function() {
	return this.format('{yyyy}-{MM}-{dd}');
}

Date.setLocale('de');

// we want the page to refresh after the date changes
function refreshAt(hours, minutes, seconds) {
    let now = new Date();
    let then = new Date();

    if(now.getHours() > hours ||
       (now.getHours() == hours && now.getMinutes() > minutes) ||
        now.getHours() == hours && now.getMinutes() == minutes && now.getSeconds() >= seconds) {
        then.setDate(now.getDate() + 1);
    }
    then.setHours(hours);
    then.setMinutes(minutes);
    then.setSeconds(seconds);

    let timeout = (then.getTime() - now.getTime());
    setTimeout(function() { window.location.reload(true); }, timeout);
}

refreshAt(0,1,0);

toastr.options.showMethod = 'slideDown';
