import React from 'react';
import './AnimationAlert.css';

class  AnimationAlert extends React.Component {
  render() {
    return (
      <div className="alert alert-success fade" role="alert" ref={this.alert}
          onAnimationEnd={() => {this.onAlertAnimationEnd(this.alert.current)}}>
        <span>alertMessage</span>
        <button type="button" className="close" aria-label="Close"
            onClick={() => {this.hideAlert(this.alert.current)}}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    );
  }

  constructor() {
    super();
    this.alert = React.createRef();
  }

  componentDidMount() {
    this.alert.current.style.display = 'none';
  }

  showAlert(alertMessage, className, timeout) {
    var element = this.alert.current;
    element.firstChild.removeChild(element.firstChild.firstChild);
    className = className || 'alert-info';
    if (timeout === undefined) {
      timeout = 2500;
    } // if (timeout === null) {timeout = infinite}

    element.firstChild.append(alertMessage);
    for (const c of this.alertClasses) {
      element.classList.remove(c);
    }

    element.classList.add(className);
    element.style.display = 'block';

    element.classList.add('visible');  // start animation
    element.classList.remove('notvisible');
    if (element.timeout) {
      window.clearTimeout(element.timeout);
      delete element.timeout
    }

    if (timeout) {
      element.timeout = window.setTimeout( () => {
        this.hideAlert(element);
      }, timeout);
    }
  }

  hideAlert() {
    var element = this.alert.current;
    element.classList.add('notvisible');
    element.classList.remove('visible');
    if (element.timeout) {
      window.clearTimeout(element.timeout);
      delete element.timeout
    }
  }

  onAlertAnimationEnd(element) {
    if ( ! element.classList.contains('visible') ) {
      element.style.display = 'none';
    }
  }

  alertClasses = ['alert-primary', 'alert-secondary',
    'alert-success', 'alert-danger', 'alert-warning',
    'alert-info', 'alert-light', 'alert-dark'];
}
export default AnimationAlert;
