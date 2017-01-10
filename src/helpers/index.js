import _ from 'lodash'

export * from './dataHelper';
export * from './GT_styles';
export * from './sounds';
export function createGuid() {
	let d = new Date().getTime();
	if (window.performance && typeof window.performance.now === 'function') {
		d = (d + performance.now());
	}
	let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		let r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x'
			? r
			: (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

export const formatHourAndMinute = (hour, minute) => {
	let hourString = hour.toString();
	hourString = hourString.length == 1
		? '0' + hourString
		: hourString;
	if (typeof minute == "undefined") {
		return hourString + ":00"
	}
	let minuteString = minute.toString();
	minuteString = minuteString.length == 1
		? '0' + minuteString
		: minuteString;
	return hourString + ':' + minuteString;
}

export const wizardStepStateGenerator = (props, properties) => {
	const propertyNames = properties.map(p => p.name);
	const propertyValues = properties.map(p => wizardStepStatePropertyGenerator(props, p.name, (typeof p.defaultValue == "undefined"
		? false
		: p.defaultValue), p.forceBool || false));
	return _.zipObject(propertyNames, propertyValues);
}

export const wizardStepStatePropertyGenerator = (props, propertyName, defaultValue, forceBool = false) => {
	if (forceBool) {
		return !!props.subState[propertyName] || props.initData && !!props.initData[propertyName] || defaultValue
	} else {
		return props.subState[propertyName] || props.initData && props.initData[propertyName] || defaultValue
	}
}

export const darkenColor = (p,c0,c1) => {
    let n=p<0?p*-1:p,u=Math.round,w=parseInt;
    if(c0.length>7){
        let f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
        return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    }else{
        let f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
        return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
}


export const downloadFile = (fileURL, fileName) => {
		// for non-IE
		if (!window.ActiveXObject) {
				var save = document.createElement('a');
				save.href = fileURL;
				save.target = '_blank';
				if (typeof save.download === 'string') {
					save.download = fileName || 'unknown';
					try {
							var evt = new MouseEvent('click', {
									'view': window,
									'bubbles': true,
									'cancelable': false
							});
							save.dispatchEvent(evt);
							(window.URL || window.webkitURL).revokeObjectURL(save.href);
					} catch (e) {
							window.open(fileURL, fileName);
					}
				} else {
					//Creating new link node.
					var link = document.createElement('a');
					link.href = fileURL;

					//Dispatching click event.
					if (document.createEvent) {
						var e = document.createEvent('MouseEvents');
						e.initEvent('click', true, true);
						link.dispatchEvent(e);
						return true;
					} else {
						window.open(fileURL,  '_self');
					}
				}
		}

		// for IE < 11
		else if (!!window.ActiveXObject && document.execCommand) {
				var _window = window.open(fileURL, '_blank');
				_window.document.close();
				_window.document.execCommand('SaveAs', true, fileName || fileURL)
				_window.close();
		}
}
