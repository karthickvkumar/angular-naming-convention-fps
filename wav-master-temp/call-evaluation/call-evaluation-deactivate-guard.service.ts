import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CallEvaluationPageComponent } from './call-evaluation.page';
import { WindowDialogService } from 'src/app/core-services/app-services/window-dialog.service ';
import { ApplicationStateService } from 'src/app/core-services/app-services/applicationstate.service';
import { PageLoaderService } from 'src/app/core-services/ui-services/page-loader.service';

@Injectable()
export class CountryEditCanDeactivateGuard implements CanDeactivate<CallEvaluationPageComponent> {

    constructor(private dialogService: WindowDialogService,
        private applicationStateService: ApplicationStateService,
        private pageLoaderService: PageLoaderService) { }

    canDeactivate(component: CallEvaluationPageComponent, route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | boolean {

        const url: string = state.url;
        // console.log('Url: ' + url);

        if (this.applicationStateService.objEvaluationFormInprogress) {
            const responce = this.dialogService.confirm('Your unsaved changes will be discarded. Are you sure you want to go back?');
            if (!responce) {
                this.pageLoaderService.displayPageLoader(true);
            }
            return responce;
        }
        return true;
    }
}
