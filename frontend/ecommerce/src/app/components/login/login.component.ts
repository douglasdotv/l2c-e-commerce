import { Component, OnInit, Inject } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import OktaSignIn from '@okta/okta-signin-widget';
import AppConfig from 'src/app/config/app-config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  oktaSignIn: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    this.oktaSignIn = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: AppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: AppConfig.oidc.clientId,
      redirectUri: AppConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: AppConfig.oidc.issuer,
        scopes: AppConfig.oidc.scopes,
      },
    });
  }

  ngOnInit(): void {
    this.oktaSignIn.remove();
    this.oktaSignIn.renderEl(
      {
        el: '#okta-signin-widget',
      },
      (resp: any) => {
        if (resp.status === 'SUCCESS') {
          this.oktaAuth.signInWithRedirect();
        }
      },
      (err: any) => {
        throw err;
      }
    );
  }
}
