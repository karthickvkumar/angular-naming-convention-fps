
import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { AppAuthGuard } from './core-services/app-services/auth-guard.service';
import { UnAuthorizedAccessComponent } from './core-components/unathorizedaccess/unauthorizedacess.component';
import { LogoutComponent } from './core-components/logout/logout.component';
import { CheckLoginGuard } from './core-services/app-services/check-login-guard.service';


const routes: Route[] = [
    { path: '', redirectTo: '/callsearch', pathMatch: 'full' },
    { path: 'callsearch', loadChildren: './feature-modules/call-search/call-search.module#CallSearchModule', canActivate: [AppAuthGuard] },
    // tslint:disable-next-line:max-line-length
    { path: 'reporting', loadChildren: './feature-modules/call-reporting/call-reporting.module#CallReportingModule', canActivate: [CheckLoginGuard] },
    // tslint:disable-next-line:max-line-length
    { path: 'screencapture', loadChildren: './feature-modules/screen-capture/screen-capture.module#ScreenCaptureModule', canActivate: [CheckLoginGuard] },
    // tslint:disable-next-line:max-line-length
    { path: 'callevaluation', loadChildren: './feature-modules/call-evaluation/call-evaluation.module#CallEvaluationModule', canActivate: [AppAuthGuard] },
    // tslint:disable-next-line:max-line-length
    { path: 'viewevaluation/:id', loadChildren: './feature-modules/view-evaluation/view-evaluation.module#ViewEvaluationModule', canActivate: [AppAuthGuard] },
    { path: 'settings', loadChildren: './feature-modules/settings/settings.module#SettingsModule', canActivate: [AppAuthGuard] },
    // tslint:disable-next-line:max-line-length
    { path: 'help', loadChildren: './feature-modules/help/help.module#HelpModule', canActivate: [CheckLoginGuard] },
    { path: 'acknowledgecalls', loadChildren: './feature-modules/call-acknowledge/call-acknowledge.module#CallAcknowledgeModule', canActivate: [AppAuthGuard] },
    { path: 'login', loadChildren: './feature-modules/login/login.module#LoginModule' },
    { path: 'unauthorizedaccess', component: UnAuthorizedAccessComponent },
    { path: 'logout', component: LogoutComponent },
    { path: '**', redirectTo: '/callsearch' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {
}
