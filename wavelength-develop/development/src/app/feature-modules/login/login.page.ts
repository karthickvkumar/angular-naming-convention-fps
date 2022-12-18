import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core-services/app-services/authentication.service';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../core-services/ui-services/error-handler.service';
import { UserService } from 'src/app/core-services/app-services/user.service';
import { NotificationService } from 'src/app/core-services/ui-services/notification.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { finalize } from 'rxjs/operators';
import 'rxjs/add/operator/takeWhile';
import * as LogRocket from 'logrocket';
import { Subscription, Observable, ObservableInput } from 'rxjs';

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
        private getNotificationsService: NotificationService,
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
                        this.authService.loadReturnUrl();
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
                    this.FetchUserInfo({ 'access_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BvcnRhbC1kZXYuZnBzaW5jLmNvbS9sb2dpbiIsImlhdCI6MTU5NDI5MjcxNiwiZXhwIjoxNjAyMDY4NzE2LCJuYmYiOjE1OTQyOTI3MTYsImp0aSI6IjFORTZHc2tJNGNPQXZwYkciLCJzdWIiOjEwMDAsInBydiI6Ijg3ZTBhZjFlZjlmZDE1ODEyZmRlYzk3MTUzYTE0ZTBiMDQ3NTQ2YWEiLCJVc2VydHlwZSI6ImNsaWVudCIsImdyb3VwcyI6WyJBZG1pbmlzdHJhdG9yIl0sImRpbV91c2VyX2lkIjpbIkVDMDAwMSIsIjAwNTZnMDAwMDAyTmRhSEFBUyJdLCJzaXRlX2lkIjoiRlBTL0NTIiwibWFuYWdlcl9pZCI6WyJUT0MxNzEyMzkiXX0.hBJ7aFLe6AD4KiqJYf-IyH-6wNiBzxpH83SZ-V983XVWuk2JlhmlT8aIVRILwNbIlSPrBXj3LmBLZStQqjPmw-u6J-2JiRBLCyAvX_m9T4yaTXr0QJrXSB-LVeuGm4YDk7h4WMFIU38l559S9ipDBDVh8p0yNY-1MDIYJk67xXKF4GmJus_1P8UUKDjXjQVHO8yO9gBEDx-AllKtgVkJBjGb8Q7L6MoytkNH6WjzD8Up3Ll1LLRS7iEfRmSAsKG1AX-cXDoKwML4jSKp1FkfNErUfoLhVd_Llh1goKOTJq-LSTFmx1fH0Q5djiUrDnoYZMbCcsjRi-e8YksnT_yD7Q', 'refresh_token': '' });
                }
            }
        } catch (e) {
            localStorage.clear();
            this.router.navigateByUrl('/logout');
            this.errorService.logUnknownError(e);
        }
    }
    saveAllData(response: any[]): Observable<any> {
        return forkJoin(response);
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
            this.saveAllData([this.authService.getuserinfo()])
                .subscribe(
                    data => {
                        if (data) {
                            this.authService.getEnumInfo().subscribe(
                                res => {
                                    const enumResult = res;
                                    // this.applicationStateService.callSearchEvalForms.next(enumResult['evaluationforms']['callsearch']);
                                    // this.applicationStateService.callEvalForms = enumResult['evaluationforms']['evaluationsearch'];
                                    // this.applicationStateService.dispositions.next(enumResult['dispositions']);
                                    this.applicationStateService.evaluation_status = enumResult['evaluation_status'];
                                    this.applicationStateService.status_list = enumResult['status_list'];
                                });
                        }
                        const userResult = data[0];
                        this.applicationStateService.loggedInUser = userResult['0'];
                        // this.applicationStateService.supervisors = result['supervisors'];

                        this.applicationStateService.setupAccessiblePagesForUser();
                        const agentPermission = this.applicationStateService.isOperationAvailable('agentfilter');
                        this.applicationStateService.isSiteAllowed.next(agentPermission);
                        this.getPeriscopeInfo(this.applicationStateService.loggedInUser.role);

                        this.otherService.getAllSite().subscribe((response) => {
                            this.applicationStateService.sites = response;
                            // console.log(data[1]);
                            // tslint:disable-next-line:max-line-length
                            if (this.applicationStateService.returnUrl && this.applicationStateService.returnUrl.trim() !== '' && !this.applicationStateService.returnUrl.trim().includes('login') && this.applicationStateService.returnUrl.trim().includes('viewevaluation')) {
                                this.router.navigateByUrl(this.applicationStateService.returnUrl);
                            } else {
                                this.router.navigate(['/callsearch']);
                            }
                        });


                        this.getNotificationsService.getNotifications().subscribe(data => {
                            if (data) {
                                this.applicationStateService.unreadCount.next(data["unreadcount"]);
                                //console.log(this.applicationStateService.unreadCount);
                            }
                            error => {
                                console.error(error);
                            }
                        })

                        LogRocket.identify(this.applicationStateService.loggedInUser.dim_user_id, {
                            name: this.applicationStateService.loggedInUser.name,
                            // Insert custom properties called "User Traits" below
                            role: this.applicationStateService.loggedInUser.role
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
                        { 'name': 'DateRange', 'value': '30 Days' },
                        { 'name': 'Period', 'value': 'Daily' },
                        { 'name': 'PQ_user_id', 'value': this.applicationStateService.loggedInUser.dim_user_id },
                        { 'name': 'Prequal_Partners', 'value': this.applicationStateService.sites },
                        { 'name': 'QA_Date', 'value': 'Evaluation_Date' },
                        { 'name': 'QA_Attributes', 'value': 'Prequal_Agent' },
                        { 'name': 'QA_Audit_Source__', 'value': 'External' }
                    ];
                    this.applicationStateService.objPeriscopeFilterVisible = [
                        'Period', 'Quality_Eval_Status', 'Agent_Tenure_Band', 'daterange', 'DateRange',
                        'Disposition_QA__', 'QA_Date', 'QA_Attributes', 'QA_Audit_Source__', 'Evaluator'
                    ];
                    break;
                }
                case 'supervisor': {
                    this.applicationStateService.objPeriscopeFilters = [
                        { 'name': 'DateRange', 'value': '30 Days' },
                        { 'name': 'Period', 'value': 'Daily' },
                        { 'name': 'Prequal_Partners', 'value': this.applicationStateService.sites },
                        { 'name': 'Prequal_Supervisors', 'value': this.applicationStateService.loggedInUser.name },
                        { 'name': 'QA_Date', 'value': 'Evaluation_Date' },
                        { 'name': 'QA_Attributes', 'value': 'Prequal_Agent' },
                        { 'name': 'QA_Audit_Source__', 'value': 'External' }];
                    this.applicationStateService.objPeriscopeFilterVisible = [
                        'Period', 'Quality_Eval_Status', 'Agent_Tenure_Band', 'daterange', 'DateRange',
                        'Disposition_QA__', 'QA_Date', 'QA_Attributes', 'QA_Audit_Source__', 'Evaluator'
                    ];
                    break;
                }
                default: {
                    this.applicationStateService.objPeriscopeFilters = [
                        { 'name': 'DateRange', 'value': '30 Days' },
                        { 'name': 'Period', 'value': 'Daily' },
                        { 'name': 'QA_Date', 'value': 'Evaluation_Date' },
                        { 'name': 'QA_Attributes', 'value': 'Prequal_Agent' },
                        { 'name': 'QA_Audit_Source__', 'value': 'External' }];
                    this.applicationStateService.objPeriscopeFilterVisible = [
                        'Period', 'Quality_Eval_Status', 'Agent_Tenure_Band', 'daterange', 'Prequal_Supervisors',
                        'DateRange', 'Prequal_Partners', 'Disposition_QA__', 'QA_Date', 'QA_Attributes', 'QA_Audit_Source__', 'Evaluator'];
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
