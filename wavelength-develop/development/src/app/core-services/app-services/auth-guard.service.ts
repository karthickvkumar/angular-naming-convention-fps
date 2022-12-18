
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApplicationStateService } from './applicationstate.service';
import { Injectable, Injector } from '@angular/core';
import { NotificationService } from '../ui-services/notification.service';

@Injectable()
export class AppAuthGuard implements CanActivate {
    constructor(
        private appState: ApplicationStateService,
        private router: Router,
        private injector: Injector) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        try {
            if (state.url && state.url.includes('viewevaluation')) {
                this.appState.returnUrl = state.url;
            }
            if (!this.appState.IsAuthenticated() || !this.appState.loggedInUser || this.appState.loggedInUser === undefined) {
                this.router.navigateByUrl('/login');
                return false;
            }

            const path = state.url.split('?')[0];
            const segments = path.split('/');
            const url = segments[1];
            const isUserHasPageAccess = this.appState.isPageAccessible(url);

            if (!isUserHasPageAccess) {
                const notificationService = this.injector.get(NotificationService);
                // tslint:disable-next-line:max-line-length
                notificationService.displayAlert('You dont have permission to access this page. Kindly contact your administrator for permission', 'Permission Denied');
                this.router.navigateByUrl('/callsearch');
                return false;
            }
            return true;
        } catch (e) {
            this.router.navigateByUrl('/unauthorizedaccess');
            return false;
        }
    }
}
