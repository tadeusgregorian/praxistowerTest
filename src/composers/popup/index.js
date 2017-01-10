import React from 'react';
import cN from 'classnames';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import TransitionGroup from 'react-addons-css-transition-group';
import 'styles/modals.scss';

export default function composePopup(Comp) {
	class Popup extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				busy: false
			};
		}

		busy = (b) => {
			this.setState({busy: b});
		}

		busyStyle = {
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			zIndex: 999999
		};

		shouldComponentUpdate(nextProps, nextState) {
			return nextState.busy != this.state.busy;
		}

		render() {
			return (
				<fb className={cN({modal: true, "busy": this.state.busy, "canBusy": true})}>
					<TransitionGroup transitionName="busyLoader" transitionAppear={true} transitionAppearTimeout={150} transitionEnterTimeout={0} transitionLeaveTimeout={100}>
						{this.state.busy
							? (<RefreshIndicator size={80} left={100} top={100} status="loading" style={this.busyStyle}/>)
							: null}
					</TransitionGroup>
					<div className="close" onClick={() => this.props.close()}>X</div>
					<Comp {...this.props} isBusy={this.state.busy} busy={this.busy}/>
				</fb>
			);
		}
	}

	return Popup;
}
