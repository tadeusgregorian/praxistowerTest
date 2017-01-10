import React from 'react';
import classNames from 'classnames';
import './styles.scss'

//@param obj user
//@param bool optional! grayedOut
//@param bool optional! isReplacement
// If user.Replacement is true -> Replacemtndesign


const miniUser = (props) => {
	const classes = classNames({
		'user': true,
		'superMini': true,
		'has-red': props.grayedOut,
		'isReplacement': props.isReplacement
	});

	const colorfulStyle = {
		border: '1px solid',
		borderColor: props.user.color,
		backgroundColor: props.user.color,
		color: 'white'
	}
	const liteStyle = {
		border: "1px solid",
		borderColor: props.user.color,
		color: props.user.color
	}
	const blackAndWhiteStyle = {
		border: "1px solid",
		borderColor: '#c1c1c1',
		color: '#c1c1c1'
	}

	let colorStyle = liteStyle // default is liteStyle
	if ( props.colorStyle == 'colorful' ) colorStyle = colorfulStyle
	if ( props.colorStyle == 'blackAndWhite' ) colorStyle = blackAndWhiteStyle

	return (
		<fb key={props.user.ID} className={classes} style={ colorStyle }>
			{props.isReplacement ? <fb className="isReplacementName">{props.user.nameInitials}</fb> : props.user.nameInitials}
			{props.isReplacement ? <fb className="isReplacementIcon" style={{color:props.user.color}}>v</fb> : null}
		</fb>
	);
}

export default miniUser;
