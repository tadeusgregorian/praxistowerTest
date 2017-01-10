import React from 'react';
import './styles.scss';
import { darkenColor } from 'helpers/index';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router';

const Navbar = ({routes, children, user}) => {
	return (
		<fb id="navbar" style={{backgroundColor: darkenColor(-0.2, user.color), borderBottom: `solid 1px ${darkenColor(-0.35, user.color)}`}}>
			<fb className='navbarContentWrapper'>
				<left>
					{ routes.map(r =>
						<FlatButton
							key={r.path}
							rippleColor="white"
							className="linkButton"
							containerElement={<Link activeClassName="active" to={r.path} />}
							label={r.name} />
					)}
				</left>
				<right>
					{children}
				</right>
			</fb>
		</fb>
	)
}



export default Navbar;
