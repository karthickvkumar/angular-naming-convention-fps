import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    templateUrl: 'unathorizedaccess.component.html',
    styleUrls: ['unathorizedaccess.component.css']
})
export class UnAuthorizedAccessComponent {
    constructor(
        private router: Router
    ) { }

    onNavigate(url) {
        try {
            // this.pageLoaderService.displayPageLoader(true);
            this.router.navigateByUrl(url);
        } catch (e) {
            console.error(e);
        }
    }
}

