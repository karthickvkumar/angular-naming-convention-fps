import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { Router, NavigationEnd } from '@angular/router';
import { PageLoaderService } from '../../core-services/ui-services/page-loader.service';
import { AudioPlayerService } from 'src/app/core-services/ui-services/audio-player.service';
import { NotificationService } from 'src/app/core-services/ui-services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  selectedUrl = '';
  hideSideBar = false;
  @Output() sideBarToggle = new EventEmitter();
  counter: number = 0;
  unreadCount;
  constructor(
    public appState: ApplicationStateService,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private audioPlayerService: AudioPlayerService,
    private getNotificationsService: NotificationService
  ) { }

  ngOnInit() {
    this.appState.unreadCount.subscribe(data => {
      this.unreadCount = data;
      //console.log(this.unreadCount);
    });
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
    try {
      // this.pageLoaderService.displayPageLoader(true);
      this.router.navigateByUrl(url);
    } catch (e) {
      console.error(e);
    }
  }

  isMenuAvailable(menuName) {
    return this.appState.isMenuAvailable(menuName);
  }

  logout() {
    this.appState.returnUrl = '';
    this.router.navigateByUrl('/logout');
  }

  sideBarToggled() {
    //this.counter = this.counter + 1;
    this.sideBarToggle.emit();
    //console.log(this.counter + " is the count from header")
  }

  getUnreadCount() {
    this.unreadCount = this.appState.unreadCount;
    //(this.unreadCount);
  }
}
