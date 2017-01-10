import cN  from 'classnames';
import React  from 'react';
import './styles.scss';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

const Paging = ({clickHandler, direction, children}) => (
	<fb className={cN({"paging":true,  "paging-left": direction == "left", "paging-right": direction == "right", })}>
		{children}
		<icon	onClick={clickHandler}
					className={cN({  "icon-arrow-left2": direction == "left", "icon-arrow-right2": direction == "right", })}
		/>
	</fb>
)

export default Paging;
