import { Component, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { Router, NavigationEnd } from '@angular/router';

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
}
