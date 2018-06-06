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
    window.decodeJWT = function(token){
        if (!token) return null;
        var payload = token.split('.')[1];
        if(!payload) return null;
        //If the payload is encoded in Base64URL, transform into Base64
        payload = payload.replace(/-/g, "+");
        payload = payload.replace(/_/g, "/");
        try {
          return JSON.parse(atob(payload));
        } catch (e) {
          return null;
        }
    };

    var objConfig   = window.canddi_developer.config,
    auth0       = new window.auth0.WebAuth({
        domain:         objConfig.domain,
        clientID:       objConfig.clientID,
        redirectUri:    objConfig.loginURL,
        responseType:   'token id_token'
    }),
    idToken     = store.get("id_token");

    // If we followed a callback from auth0's login page, there will be an id_token in the hash
    if(window.location.hash) {
        var matches = window.location.hash.match(new RegExp('id_token=([^&]*)'));
        if (matches) {
            // Save token locally
            store.set("id_token", matches[1]);
            var profile = decodeJWT(matches[1]);

            window.location.href = '/';
        }
        else {
            auth0.authorize();
        }
    } else {
        if (idToken) {
            var profile = decodeJWT(idToken);
            // If the profile expired from the store then show the auth0 login
            if(!profile || Math.floor(Date.now() / 1000) > profile.exp) {
                auth0.authorize();
            } else {
                window.location.href = '/';
            }
        } else {
            auth0.authorize();
        }
    }
  }

  render() {
    let { authSelectors } = this.props
    let isAuthorized = !!authSelectors.authorized().size

    return (
      <div className="auth-wrapper">
        <button className={isAuthorized ? "btn authorize locked" : "btn authorize unlocked"} onClick={ this.authenticateUser }>
          <span>Authenticate</span>
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
