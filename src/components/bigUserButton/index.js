import React from 'react';
import './styles.scss';


const BigUserButton = ({user, clickHandler, qmNotifications}) => {
	return (
		<fb className="bigUserButton" onClick={clickHandler} style={{backgroundColor:user.color}}>
			{ qmNotifications ? <fb className="qmNotifications">{qmNotifications}</fb> : null }
			{user.nameInitials}
		</fb>
	)
}

export default BigUserButton;
