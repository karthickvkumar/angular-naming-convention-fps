import { Component, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { Router, NavigationEnd } from '@angular/router';
import { PageLoaderService } from '../../core-services/ui-services/page-loader.service';
import { AudioPlayerService } from 'src/app/core-services/ui-services/audio-player.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  selectedUrl = '';
  hideSideBar = false;
  constructor(
    public appState: ApplicationStateService,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private audioPlayerService: AudioPlayerService
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

  getUserName() {
    return this.appState.loggedInUserName;
  }

  checkForMenu() {
    return this.appState.menus.length < 2 ? false : true;
  }

  onNavigate(url) {
    this.router.navigateByUrl(url);
  }

  isMenuAvailable(menuName) {
    return this.appState.isMenuAvailable(menuName);
  }

  logout() {
    this.router.navigateByUrl('/logout');
  }

}
