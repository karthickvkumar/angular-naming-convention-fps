
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable, Injector } from '@angular/core';
import { ApplicationStateService } from 'src/app/core-services/app-services/applicationstate.service';

@Injectable()
export class CountryEditCanActivateGuard implements CanActivate {
    constructor(
        private appState: ApplicationStateService) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        try {
            this.appState.returnUrl = '';
            if (this.appState.isCallEditClicked) {
                this.appState.isCallEditClicked = false;
                return true;
            }
            return false;

        } catch (e) {
            return false;
        }
    }
}
