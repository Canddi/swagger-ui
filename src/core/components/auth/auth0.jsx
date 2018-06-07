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

    idToken = idToken || store.get("id_token");
    if(idToken) {
        const schema = OrderedMap(schemaObj);
        let sendState = {[name]:{name,schema,idToken}};
        authActions.authorize(sendState)
    }
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

  authenticateUser =() => {
      var objConfig   = window.canddi_developer.config;

      if(window.location.hash) {
          var matches = window.location.hash.match(new RegExp('id_token=([^&]*)'));
          if(matches) {
            if(!idToken) {
              auth0.authorize();
            }
          } else {
            if(!idToken) {
              auth0.authorize();
            }
          }
      } else {
          if (idToken) {
              let profile = decodeJWT(idToken);
              // If the profile expired from the store then show the auth0 login
              if(!profile || Math.floor(Date.now() / 1000) > profile.exp) {
                  auth0.authorize();
              }
          } else {
              auth0.authorize();
          }
      }
  }

  render() {
    let { authActions, authSelectors } = this.props;
    let isAuthorized = window.isAuthorized;

    return (
      <div className="auth-wrapper">
        <button className={isAuthorized ? "btn authorize locked" : "btn authorize unlocked"} onClick={ this.authenticateUser }>
          <span>{ isAuthorized ? profile.email : "Authenticate" }</span>
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
