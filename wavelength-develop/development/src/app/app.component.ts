import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from './core-services/app-services/authentication.service';
import { ApplicationStateService } from './core-services/app-services/applicationstate.service';
import { Router, ActivatedRouteSnapshot, ActivatedRoute, NavigationEnd } from '@angular/router';
import { PageLoaderService } from './core-services/ui-services/page-loader.service';
// import LogRocket from 'logrocket';
import * as LogRocket from 'logrocket';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Wavelength';
  showPageLoader = false;
  
  loadNotifications;

  constructor(
    private pageLoader: PageLoaderService) {
      // LogRocket.init('bfk6pu/wavelength');
     }

  ngOnInit() {
    try {
      setTimeout(() => {
        this.pageLoader.getSubscription().subscribe(value => {
          this.showPageLoader = value;
        });
      });
    } catch (e) {
      console.error(e);
    }
  }
  
  loadNotificationsData(){
    this.loadNotifications = true;
  }

  ngAfterViewInit() {
    /*
    setTimeout(() => {
      this.pageLoader.getSubscription().subscribe(value => {
        console.log(value);
        this.showPageLoader = value;
      });
    });*/
  }
}
