
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApplicationStateService } from './applicationstate.service';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class CheckLoginGuard implements CanActivate {
    constructor(
        private appState: ApplicationStateService,
        private router: Router,
        private injector: Injector) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        try {
            this.appState.returnUrl = state.url;
            if (!this.appState.IsAuthenticated() || !this.appState.loggedInUser || this.appState.loggedInUser === undefined) {
                this.router.navigateByUrl('/login');
                return false;
            }
            return true;
        } catch (e) {
            this.router.navigateByUrl('/logout');
            return false;
        }
    }
}
