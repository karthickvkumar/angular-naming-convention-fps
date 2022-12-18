import { Component, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { Router, NavigationEnd } from '@angular/router';
import { PageLoaderService } from 'src/app/core-services/ui-services/page-loader.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {
  showMenu = false;
  hideSideBar = true;
  selectedUrl = '';
  constructor(
    private appState: ApplicationStateService,
    private pageLoaderService: PageLoaderService,
    private router: Router
  ) { }
  ngOnInit() {
    this.router.events.subscribe((event) => {
      this.selectedUrl = this.router.routerState.snapshot.url;
      if (event instanceof NavigationEnd) {
        // tslint:disable-next-line:max-line-length
        this.hideSideBar = (this.router.routerState.snapshot.url === '/login' || this.router.routerState.snapshot.url === '/logout');
      }
    });
  }

  InitiateLoader() {
    try {
      this.pageLoaderService.displayPageLoader(true);
    } catch (e) {
      console.error(e);
    }
  }
}
