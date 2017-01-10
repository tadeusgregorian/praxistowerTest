import React from 'react';
import cN from 'classnames';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import TransitionGroup from 'react-addons-css-transition-group';
import 'styles/modals.scss';

export default function composeWizard(stepComponents) {
    class Wizard extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                busy: false,
				activeStepIndex: 0,
				subState: {}
            };
            this.busy = this.busy.bind(this);
        }

        busy(b) {
            this.setState({busy: b});
        }

		busyStyle = {
		    top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			zIndex: 10
		};


		shouldComponentUpdate(nextProps, nextState) {
			let busyOrActiveStepIndexChnaged = nextState.activeStepIndex != this.state.activeStepIndex || nextState.busy != this.state.busy
			return busyOrActiveStepIndexChnaged || nextState.subState != this.state.subState;
		}

		nextStep() {
			this.setState({activeStepIndex: (++this.state.activeStepIndex)});
		}

		previousStep() {
			this.setState({activeStepIndex: (--this.state.activeStepIndex)});
		}

		setSubState(subState) {
			this.setState({ subState: {...this.state.subState, ...subState} })
		}

        render() {
			const CurrentStepComponent = stepComponents[this.state.activeStepIndex]
            return (
				<fb className={cN({modal: true, wizard: true, "busy": this.state.busy, canBusy: true})}>
					{this.state.busy ? (<RefreshIndicator
					      size={80}
					      left={100}
					      top={100}
					      status="loading"
						  style={this.busyStyle}
					    />) : null}
					<div className="close" onClick={() => this.props.close()}>X</div>
					<CurrentStepComponent
						subState={this.state.subState}
						setSubState={this.setSubState.bind(this)}
						{...this.props}
						busy={this.busy}
						nextStep={this.nextStep.bind(this)}
						previousStep={this.previousStep.bind(this)}
					/>
				</fb>
			);
        }
    }

    return Wizard;
}
