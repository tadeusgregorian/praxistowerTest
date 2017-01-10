
import cN  from 'classnames';
import React  from 'react';
import './styles.scss';

// @props boolean checked
// @props function clickHandler

const RoundCheckbox = ({checked, clickHandler, invisible}) => (
	<fb className={cN({"roundCheckbox": true, invisible})} onClick={() => {if (!invisible) {clickHandler()}}}>
			<div className={cN({"checked": checked})}></div>
	</fb>
)

export default RoundCheckbox;
