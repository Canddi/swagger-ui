import React from "react"
import PropTypes from "prop-types"
import Auth0Lock from "auth0-lock"
import  { OrderedMap } from "immutable"

export default class Auth0 extends React.Component {
  static propTypes = {
    className: PropTypes.string
  }

  componentDidMount() {
    let {
      authActions,
      authSelectors
    } = this.props
    this.showOptions = {};

    let definitions = authSelectors.definitionsToAuthorize();
    //Look for first api_key security def and use that. We're assuming only one is required
    let definitionObj = definitions.toJS().find(authDef => this.checkTypekey(authDef))
    let objNameScheme = this.getNameScheme(definitionObj);
    if (false === objNameScheme) {
      //If non found show error message
      this.showOptions.flashMessage = {
        type: 'error',
        text: 'No security definition with type "api_key" found in swagger definition'
      };
    }

    const name = objNameScheme.name;
    const schemaObj = objNameScheme.schema;

    const lockOptions = {
      allowAutocomplete: true,
      allowSignUp: false,
      autoclose: true
    };
    this.lock = new Auth0Lock('@client-id', '@client-domain', lockOptions);

    this.lock.on("authenticated", function(authResult) {
      let value = authResult.idToken;
      const schema = OrderedMap(schemaObj);
      let sendState = {[name]:{name,schema,value}};
      authActions.authorize(sendState)
    });
  }

  checkTypekey =(authObj) => {
    for ( let authVal in authObj) {
      if ('apiKey' === authObj[authVal].type) return true;
    }
    return false;
  }

  getNameScheme =(authObj) => {
    if (false === authObj) return false;
    for ( let authVal in authObj) {
      if ('apiKey' === authObj[authVal].type) {
        return {
          name: authVal,
          schema: authObj[authVal]
        };
      }
    }
    return false;
  }

  showLock =() => {
    this.lock.show(this.showOptions);
  }

  render() {
    let { authSelectors } = this.props
    let isAuthorized = !!authSelectors.authorized().size

    return (
      <div className="auth-wrapper">
        <button className={isAuthorized ? "btn authorize locked" : "btn authorize unlocked"} onClick={ this.showLock }>
          <span>Auth0</span>
          <svg width="20" height="20">
            <use href={ isAuthorized ? "#locked" : "#unlocked" } xlinkHref={ isAuthorized ? "#locked" : "#unlocked" } />
          </svg>
        </button>
      </div>
    )
  }


  static propTypes = {
    getComponent: PropTypes.func.isRequired,
    authSelectors: PropTypes.object.isRequired,
    errActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
  }
}
