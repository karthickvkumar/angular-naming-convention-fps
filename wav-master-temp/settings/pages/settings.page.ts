import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationStateService } from 'src/app/core-services/app-services/applicationstate.service';


@Component({
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.css']
})
export class SettingsPageComponent {

    constructor(
        private router: Router,
        public appState: ApplicationStateService
    ) {
        const segements = appState.returnUrl.split('/');
        this.activePage = segements[segements.length - 1];
    }

    activePage = 'assignrole';
    onNavigate(pageName) {
        this.activePage = pageName;
        this.router.navigateByUrl(`/settings/${pageName}`);
    }
}
