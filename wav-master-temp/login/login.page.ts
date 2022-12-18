import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core-services/app-services/authentication.service';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../core-services/ui-services/error-handler.service';
import { UserService } from 'src/app/core-services/app-services/user.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { finalize } from 'rxjs/operators';
import 'rxjs/add/operator/takeWhile';

@Component({
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.css']
})
export class LoginPageComponent implements OnInit {
    code: any;
    alive = true;

    constructor(private authService: AuthService,
        private router: Router,
        private applicationStateService: ApplicationStateService,
        private otherService: UserService,
        private route: ActivatedRoute,
        private errorService: ErrorHandlerService) {
    }

    ngOnInit() {
        try {
            this.onLogin();
        } catch (e) {
            localStorage.clear();
            this.router.navigateByUrl('/logout');
            this.errorService.logUnknownError(e);
        }
    }

    onLogin() {
        try {
            if (this.applicationStateService.IsAuthenticated()) {
                this.getPreData();
            } else {
                this.code = this.route.snapshot.queryParams['code'] || null;
                if (environment.production) {
                    if (this.code === undefined || this.code === null) {
                        this.authService.login();
                    } else {
                        this.authService.getauthtoken(this.code, this.route.snapshot.queryParams['auth_type'] || null).
                            subscribe(
                                (data) => {
                                    this.FetchUserInfo(data);
                                },
                                error => {
                                    this.OnLoginFailedorError(error);
                                }
                            );
                    }
                } else {
                    // tslint:disable-next-line:max-line-length
                    this.FetchUserInfo({ 'access_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BvcnRhbC1kZXYuZnBzaW5jLmNvbS9sb2dpbiIsImlhdCI6MTU2MTcwMjQ2NCwiZXhwIjoxNTY5NDc4NDY0LCJuYmYiOjE1NjE3MDI0NjQsImp0aSI6IjRJMTRnR1h0NXlTNmExblQiLCJzdWIiOjIsInBydiI6Ijg3ZTBhZjFlZjlmZDE1ODEyZmRlYzk3MTUzYTE0ZTBiMDQ3NTQ2YWEiLCJVc2VydHlwZSI6ImNsaWVudCIsInJvbGVzIjpbIkdMTy1ST0xFLUFkbWluIl0sImRpbV91c2VyX2lkIjoiRUMwMDAxIiwic2l0ZV9pZCI6IjEiLCJtYW5hZ2VyX2lkIjpudWxsfQ.AeEXj8qTvqEou-yhJbvcDW62x2SlVHp0WtcjRfHnGjbLSYVn21h1APqAhZSt9SVttt17p6SOKzC5-WEcMuCPFSHZZSQ5hzjdkb_syOuIsiUXLJVoYeTPE1LYijLfyvWgtet_yjLX9SawOoJhbdBXt7jSmyhL2P1MX4LBvFKDIB4M1NWmU7_1Xke-gtdRwRdc3BAaPl0FRz-Cuz4O_sf8XdAk0wACi_5QXDKu0RBMi5EcI3qoVLLdBGFAuSoAYwnxzJIV657mulce4g7R3mkBxI4-4_0x1Eg4Pp-HwuLJE6FBJTv1Yf-IzFdOt7eTB2oMOaCW-EW-hrUt-yIf9SamJA', 'refresh_token': '' });
                }
            }
        } catch (e) {
            localStorage.clear();
            this.router.navigateByUrl('/logout');
            this.errorService.logUnknownError(e);
        }
    }

    FetchUserInfo(data: any) {
        try {
            localStorage.removeItem('jwtauthtoken');
            localStorage.removeItem('jwtauthrefreshtoken');
            localStorage.setItem('jwtauthtoken', data['access_token'].toString());
            localStorage.setItem('jwtauthrefreshtoken', data['refresh_token'].toString());
            this.getPreData();
        } catch (e) {
            localStorage.clear();
            this.router.navigateByUrl('/logout');
            this.errorService.logUnknownError(e);
        }
    }

    getPreData() {
        try {
            /*forkJoin(
                this.authService.getuserinfo(),
                this.otherService.getAllSite()
            )
                .takeWhile(() => this.alive)
                .pipe(
                    finalize(() => {
                        // this.loaderService.display(false);
                    }),
                )*/
            this.authService.getuserinfo().subscribe(
                data => {
                    const result = data;
                    this.applicationStateService.loggedInUser = result['0'];
                    this.applicationStateService.supervisors = result['supervisors'];
                    this.applicationStateService.evaluationforms = result['evaluationforms'];
                    this.applicationStateService.enums = result['enums'];
                    this.applicationStateService.dispositions = result['dispositions'];
                    this.applicationStateService.setupAccessiblePagesForUser();
                    this.getPeriscopeInfo(this.applicationStateService.loggedInUser.role);

                    this.otherService.getAllSite().subscribe((response) => {
                        this.applicationStateService.sites = response;
                        // console.log(data[1]);
                        // tslint:disable-next-line:max-line-length
                        if (this.applicationStateService.returnUrl && this.applicationStateService.returnUrl.trim() !== '' && !this.applicationStateService.returnUrl.trim().includes('login')) {
                            this.router.navigateByUrl(this.applicationStateService.returnUrl);
                        } else {
                            this.router.navigate(['/callsearch']);
                        }
                    });
                },
                error => {
                    this.OnLoginFailedorError(error);
                }
            );
        } catch (e) {
            localStorage.clear();
            this.router.navigateByUrl('/logout');
            this.errorService.logUnknownError(e);
        }
    }

    getPeriscopeInfo(role: String) {
        try {
            switch (role.toLowerCase().trim()) {
                case 'agent': {
                    this.applicationStateService.objPeriscopeFilters = [
                        { 'name': 'Agent_Name', 'value': this.applicationStateService.loggedInUser.name }
                    ];
                    this.applicationStateService.objPeriscopeFilterVisible = [
                        'daterange'
                    ];
                    break;
                }
                case 'supervisor': {
                    this.applicationStateService.objPeriscopeFilters = [];
                    this.applicationStateService.objPeriscopeFilterVisible = [
                        'Site', 'Agent_Name', 'daterange'
                    ];
                    break;
                }
                default: {
                    this.applicationStateService.objPeriscopeFilters = [];
                    this.applicationStateService.objPeriscopeFilterVisible = [
                        'Site', 'Agent_Name', 'daterange'
                    ];
                }
            }
        } catch (e) {
            this.errorService.logUnknownError(e);
        }

    }

    getAgentSiteDetals() {
        /*
        try {
            this.otherService.getAllSite()
        }*/
    }

    OnLoginFailedorError(error: any) {
        try {
            localStorage.clear();
            this.router.navigateByUrl('/logout');
            this.errorService.logUnknownError(error);
        } catch (e) {
        }
    }

}
