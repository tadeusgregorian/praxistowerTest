import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import './styles.scss';

const AnimationWrapperElement = ({children}) => (<fb className="animationWrapperElement">{children}</fb>)

const DaysTransitionGroup = ({movingDirection, children}) => (
	<ReactCSSTransitionGroup
		component={AnimationWrapperElement}
		transitionName={`tasksDayAnimation-${movingDirection ? "backward" : "forward"}`}
		transitionEnterTimeout={350}
		transitionLeaveTimeout={350}>
		{children}
	</ReactCSSTransitionGroup>
)

export default DaysTransitionGroup;
