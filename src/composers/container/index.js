import React from 'react';
import ReactDOM from 'react-dom'
import cN from 'classnames';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import TransitionGroup from 'react-addons-css-transition-group';

export default function containerComposer(styles = { flex: "1 1 auto" }) {
	return function(Comp) {
		class Component extends React.Component < any,
		any > {
			constructor(props) {
				super(props);
				this.state = {
					busy: false
				};
			}

			busyStyle = {
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				zIndex: 999999
			};

			busy = (b) => {
				this.setState({busy: b});
			}

			render() {
				return (
					<fb style={styles} className={cN({busy: this.state.busy, canBusy: true})}>
						<TransitionGroup transitionName="busyLoader" transitionAppear={true} transitionAppearTimeout={150} transitionEnterTimeout={0} transitionLeaveTimeout={100} max={2} min={2} size={2}>
							{this.state.busy
								? (<RefreshIndicator style={this.busyStyle} size={80} left={100} top={100} status="loading"/>)
								: null}
						</TransitionGroup>
						<Comp {...this.props} isBusy={this.state.busy} busy={this.busy}/>
					</fb>
				);
			}
		}

		return Component
	}
}
