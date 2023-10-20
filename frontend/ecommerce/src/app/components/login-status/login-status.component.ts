import { Component, Inject, OnInit } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css'],
})
export class LoginStatusComponent implements OnInit {
  isAuthenticated: boolean = false;
  userFullName: string = '';
  storage: Storage = sessionStorage;

  constructor(
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
    private authStateService: OktaAuthStateService
  ) {}

  ngOnInit(): void {
    this.authStateService.authState$.subscribe((result) => {
      this.isAuthenticated = result.isAuthenticated!;
      this.getUserDetails();
    });
  }

  getUserDetails(): void {
    if (this.isAuthenticated) {
      this.oktaAuth.getUser().then((result) => {
        this.userFullName = result.name!;
        this.storage.setItem('userEmail', JSON.stringify(result.email!));
      });
    }
  }

  logout(): void {
    this.oktaAuth.signOut();
  }
}
