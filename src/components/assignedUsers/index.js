import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import cN from 'classnames';
import MiniUser from 'components/miniUser';
import './styles.scss';


// @param obj 		assignedUsers - {userID:userID,userID:userID,...}
// @param obj 		usersRed (optional) - {userID:userID,userID:userID,...}
// @param number 	maxDisplayedMiniUsers optional! - Use this if you want to limit displayed miniUsers.
//																								 A small number like ( +3 ) appears if Userscount exceeds Max.
// @param str 		colorStyle optional! here you can provide colorStyles for MiniUser for ex. 'colorful' , 'blackAndWhite'
// @param bool		showReplacements optional! - if you want to show replacements.
//																					 - MiniUser in that case displays the replacerUser instead of the apsentUser
//																					 - and a small [v] symbol appears next to User.
//@param arr     	usersWithReplacementSet optional ! - userIDs of users who have a replacement set for the task.
//@param obj 		  isDoneBy optional! - a obj of the user.ID {userID:userID} who has done the task

const AssignedUsers = (props) => {
	let maxDisplayedMiniUsers = props.maxDisplayedMiniUsers || 100 ;

	let assignedUsersArr = () => {
		if (props.showReplacements){

			// Replaceing apsent users with repalcer-user and
			// convert assignedUsers from {userID:userID, ...} to [ obj user, obj user, ...]

			// -> props.assignedUsers has following format { userID_1 : userID_2 , ... }
			// userID_1 and userID_2 are usually identical. the ID of the same User. But:
			// if there is a replacement set for this task, and the assignedUser is apsent
			// userID_1 is the ID of the assigned User and userID_2 is the ID of the replacer.
			// the following operation creates a Array of users with the userID_2.

			return (
				_.values(props.assignedUsers).unique().map( userID => {
					let isReplacement = !(_.keys(props.assignedUsers).includes(userID));
					let assignedUser = { ...props.users.find(user => user.ID == userID) } // cloning that MOFO
					assignedUser['isReplacement'] = isReplacement;
					return assignedUser
				}).filter(u => !!u)
			)
		} else {
			return _.keys(props.assignedUsers).unique().map( userID =>  props.users.find(user => user.ID == userID)).filter( u => !!u )
		}
	}


	let assignedUsersExt = assignedUsersArr().map(assignedUser => {
		let clonedAssignedUser = { ...assignedUser }
		let userHasRed = !!_.values(props.usersRed).find(urID => urID == clonedAssignedUser.ID);
		clonedAssignedUser['hasRed'] = userHasRed;
		return clonedAssignedUser;
	});

	let assignedUsersSorted = assignedUsersExt.sortBy(u => String(u.hasRed));

	// optionally you can limit the number of shown MiniUsers.
	// A number like ( +3 ) is appended at the end to indicate
	// how many are not displayd.
	let hiddenMiniUsersCount = 0;
	if ( assignedUsersSorted.length > maxDisplayedMiniUsers ){
		hiddenMiniUsersCount = assignedUsersSorted.length -  maxDisplayedMiniUsers;
		assignedUsersSorted = assignedUsersSorted.slice(0, maxDisplayedMiniUsers);
	}

	return (
		<fb className="userWrapper mini no-grow no-shrink">
			{ hiddenMiniUsersCount ? <fb className={cN({"hiddenMiniUsersCount":true, "nothingToHide": !hiddenMiniUsersCount  })} key="counter"> {`+${hiddenMiniUsersCount}`} </fb> : null}
			{ assignedUsersSorted.map(assignedUser => (
				<MiniUser user={assignedUser}
					grayedOut={ ( props.isDoneBy == assignedUser.ID ) || assignedUser.hasRed }
					isReplacement={assignedUser.isReplacement}
					colorStyle={props.colorStyle}
					key={assignedUser.ID} />))}
		</fb>
	)
}


const mapStateToProps = (state) => {
	return { users: state.data.users };
};

export default connect(mapStateToProps)(AssignedUsers);
