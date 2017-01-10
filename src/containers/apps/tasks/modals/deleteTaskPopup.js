import React, {Component} from 'react';
import cN from 'classnames';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {checkTask, uncheckTask, ignoreTask, unignoreTask} from 'actions/index';
import composePopup from 'composers/popup';
import toastr from 'toastr'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {deleteTask, updateTask} from 'actions/index';
import 'styles/modals.scss';

//@param task obj
//@param close function

class DeleteTaskPopup extends Component {

    deleteTask = () => {
        this.props.busy(true);
        const task = this.props.task;
        const isOnetimer = !!task.onetimerDate;
        let promise = null;
        if (isOnetimer || task.deadline || task.irregularDates) {
            promise = this.props.deleteTask(task.ID)
        }
        if (!isOnetimer) {
            promise = this.props.updateTask({
                ...task,
                endDate: Date.create().addDays(-1).shortISO(),
            })
        }

        promise.then(() => {
            this.props.close();
            toastr.success(`Aufgabe beendet`);
        }).catch((e) => {
            this.props.close();
            toastr.error("Ein Fehler ist aufgetreten: " + e)
        })
    }

    render() {
        const task = this.props.task;
        const isOnetimer = !!task.onetimerDate;
        let header = "";
        let infoText = "";
        let buttonLabel = "";

        if (isOnetimer) {
            header = "Möchten sie diese Aufgabe Entfernen?";
            infoText = "";
            buttonLabel = "Aufgabe entfernen"
        }

				if (task.irregularDates) {
						header = "Möchten sie alle Aufgaben des Multidatums löschen ";
						infoText = "Falls Sie nicht gleich alle Aufgaben löschen wollen, können Sie diese Aufgabe bearbeiten und einzelne Einheiten der Aufgabe entfernen";
						buttonLabel = "Multidatum löschen"
				}

        if (!isOnetimer) {
            header = "Möchten sie diese Aufgabe ab Heute beenden?";
            infoText = "Vergangene Einheiten dieser Aufgabe bleiben immer unverändert";
            buttonLabel = "Aufgabe beenden"
        }

        return (
            <fb>
                <header>
                    <h4>{header}</h4>
                </header>
                <content>
                    <p>{infoText}</p>
                </content>
                <footer>
                    <fb className="left">
                        <RaisedButton label={'abbrechen'} onClick={this.props.close} primary={true}/>
                    </fb>
                    <div className="content-right">
                        <RaisedButton primary={true} label={buttonLabel} onClick={this.deleteTask}/>
                    </div>
                </footer>
            </fb>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        updateTask,
        deleteTask
    }, dispatch);
};

export default composePopup(connect(null, mapDispatchToProps)(DeleteTaskPopup));
