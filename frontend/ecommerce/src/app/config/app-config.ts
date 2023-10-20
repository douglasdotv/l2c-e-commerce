import { environment } from 'src/environments/environment';

export default {
  oidc: {
    clientId: environment.clientId,
    issuer: environment.issuer,
    redirectUri: 'https://localhost:4200/login/callback',
    scopes: ['openid', 'profile', 'email'],
  },
};
