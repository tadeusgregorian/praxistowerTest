import React, { Component } from 'react';
import cN from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import composePopup from 'composers/popup';
import 'styles/popup.scss';


class PickColorPopup extends Component {
	constructor(props) {
		super(props);

		this.colors = [
			'#1abc9c',
			'#2ecc71',
			'#3498db',
			'#34495e',
			'#16a085',
			'#27ae60',
			'#2980b9',
			'#8e44ad',
			'#2c3e50',
			'#f1c40f',
			'#e67e22',
			'#e74c3c',
			'#95a5a6',
			'#f39c12',
			'#d35400',
			'#c0392b',
			'#7f8c8d'
		];

		this.state = {
			selectedColor: -1
		};
	}

	onFinish() {
		this.props.close(this);
	}

	colorClicked(e) {
		this.setState({selectedColor: e.target.id});
	}

	onButtonClicked() {
		this.props.onColorPicked(this.colors[this.state.selectedColor]);
		this.props.close(this);
	}

	render() {
		return (
			<div className="color-picker-popup">
				<header>Wählen Sie eine Benutzer-Farbe</header>
				<fb className="color-picker-content">
					{ this.colors.map((color, index)=> <div
							id={index}
							className = {cN({'color-box': true, 'round-color-box': (index == this.state.selectedColor)})}
							key={color}
							style={{backgroundColor: color}}
							onClick={this.colorClicked.bind(this)}
						></div>)}
				</fb>
				<footer>
					<button
						className={cN({'right': true, 'disabled': (this.state.selectedColor < 0)})}
						onClick={this.onButtonClicked.bind(this)}>
						Farbe wählen
					</button>
				</footer>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({
	}, dispatch);
};


export default composePopup(connect(null, mapDispatchToProps)(PickColorPopup));
