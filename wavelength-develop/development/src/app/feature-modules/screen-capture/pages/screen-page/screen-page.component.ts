import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationStateService } from 'src/app/core-services/app-services/applicationstate.service';
import { Event as NavigationEvent } from '@angular/router';

@Component({
  selector: 'app-screen-page',
  templateUrl: './screen-page.component.html',
  styleUrls: ['./screen-page.component.css']
})
export class ScreenPageComponent implements OnInit {

  constructor(
    private router: Router,
    public appState: ApplicationStateService) {
    const segements = appState.returnUrl.split('/');
    this.activePage = segements[segements.length - 1];
    router.events.subscribe((event: NavigationEvent): void => {
      console.log(router.url);
    });
  }

  activePage = 'recordings';
  onNavigate(pageName) {
    this.activePage = pageName;
    this.router.navigate([`/screencapture/${pageName}`], { preserveQueryParams: true });
  }

  ngOnInit() {
    console.log('ScreenPageComponent');
  }

  goToCallSearch() {
    try {
      // this.pageLoaderService.displayPageLoader(true);
      this.router.navigateByUrl('/callsearch');
    } catch (e) {
      console.error(e);
    }
  }

}
