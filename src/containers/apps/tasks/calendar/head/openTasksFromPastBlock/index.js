import React from 'react';
import './styles.scss';

const OpenTasksFromPastBlock = ({numberOfForgottenTasks, clickHandler}) => (
	<fb className="openTasksFromPastBlock" onClick={clickHandler}>
			<fb className="numberOfForgottenTasks">{numberOfForgottenTasks}</fb>
			<fb className="forgottenTasksText">UNERLEDIGT</fb>
	</fb>
)

export default OpenTasksFromPastBlock;



// unerledigte {numberOfForgottenTasks > 1
// 	? "Aufgaben "
// : "Aufgabe "}
