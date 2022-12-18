import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApplicationStateService } from './applicationstate.service';
@Injectable()
export class AuthService {
  constructor(
    private http: HttpClient,
    private applicationStateService: ApplicationStateService,
    private router: Router,
  ) { }
  login() {
    this.saveReturnUrl();
    window.location.href = environment.wavelengthApiUrl + '/login';
  }
  getuserinfo() {
    return this.http.get(environment.wavelengthApiUrl + '/me');
  }
  getEnumInfo() {
    return this.http.get(environment.wavelengthApiUrl + '/enums');
  }
  getJwtToken() {
    return localStorage.getItem('jwtauthtoken');
  }

  getauthtoken(code: any, auth_type: any) {
    if (auth_type !== undefined && auth_type !== null && auth_type.toUpperCase() === 'JWT') {
      const body = new HttpParams()
        .set('auth', 'jwt')
        .set('code', code);
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        })
      };
      // this.sharedDataService.authtype = auth_type;
      return this.http.post(environment.wavelengthApiUrl + '/request/token', body, httpOptions);
    } else {
      const body = new HttpParams()
        .set('auth', 'adfs')
        .set('code', code);
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        })
      };
      return this.http.post(environment.wavelengthApiUrl + '/request/token', body, httpOptions);
    }
  }

  refreshToken() {
    const token = localStorage.getItem('jwtauthrefreshtoken');
    return this.http.post(environment.wavelengthApiUrl + '/refresh/token',
      { refresh_token: token, auth: 'jwt' });
  }

  saveReturnUrl() {
    localStorage.setItem('returnUrl', this.applicationStateService.returnUrl);
  }

  loadReturnUrl() {
    this.applicationStateService.returnUrl = localStorage.getItem('returnUrl');
  }
}
