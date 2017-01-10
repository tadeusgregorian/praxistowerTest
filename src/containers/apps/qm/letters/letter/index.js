import React from 'react';
import _ from 'lodash';
import cN from 'classnames';
import './styles.scss';
import miniUser from 'components/miniUser';
import AssignedUsers from 'components/assignedUsers';

const QmLetter = (props) => {
	let creator = props.users.find(u => u.ID && u.ID == props.data.creatorID);
	let qmData = props.data
	if (!creator)
		return null;
	let currentUserIsCreator = (props.currentUser.ID == qmData.creatorID)
	let currentUserIsCreatorOrAdmin = props.currentUser.adminHash || currentUserIsCreator;
	let currentUserHasRed = !!_.values(qmData.usersRed).find(u => props.currentUser.ID == u);

	return (
		<fb className={cN({letter: true, "hasRed": qmData.hasRed, needsBorderBottom: props.needsBorderBottom})} onClick={() => props.openReadUnreadQmModal(props.userID, currentUserHasRed, qmData)}>
			<fb className="author" style={{ color: creator.color }}>
				{creator.nameInitials}
			</fb>
			<fb className="subject">
			<fb className="isUrgentWrapper">
				{qmData.isUrgent ? <icon className="icon-error no-border a-center no-padding"></icon> : null }
			</fb>
				{qmData.files ? <icon className="icon-attachment no-border a-center no-padding" style={{ color: "grey" }}></icon> : null}
				<span className="subjectTextWrapper">{qmData.subject}</span>
			</fb>
			<fb className='assignedUsersWrapper'>
				<AssignedUsers assignedUsers={props.data.assignedUsers} usersRed={props.data.usersRed} maxDisplayedMiniUsers={5} />
			</fb>
			<fb className="date">{Date.create(qmData.date).format('{dd}. {Mon}.')}</fb>
		</fb>
	);
}

export default QmLetter;
