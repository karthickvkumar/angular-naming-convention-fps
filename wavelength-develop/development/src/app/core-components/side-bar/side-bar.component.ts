import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { NotificationService } from '../../core-services/ui-services/notification.service';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  objNotification;

  isLoader;

  showNoNotDiv;
  unreadCount;

  @Output() sideBarClose = new EventEmitter();
  @Input() sideBarLoad;

  constructor(
    private getNotificationsService: NotificationService,
    public appState: ApplicationStateService,
    public router: Router
  ) { }

  ngOnInit() {
    this.isLoader = true;
    this.showNoNotDiv = false;
  }

  ngOnChanges() {
    if (this.sideBarLoad) {
      this.getAllNotifications();
    }
  }

  getAllNotifications() {
    this.getNotificationsService.getNotifications().subscribe(data => {
      if (data) {
        this.objNotification = data["notifications"];
        this.unreadCount = data["unreadcount"];
        this.appState.unreadCount.next(data["unreadcount"]);

        if (this.objNotification.length === 0) {
          this.showNoNotDiv = true;
          //console.log("true");
        }

        //console.log(this.objNotification);
        this.isLoader = false;
      }
      error => {
        console.error(error);
      }
    })
  }

  sideBarClosed() {
    this.sideBarClose.emit();
  }

  markAsRead(not_id, eval_id?) {
    this.isLoader = true;
    this.getNotificationsService.markNotificationAsRead(not_id).subscribe(
      data => {
        if (data) {
          this.getAllNotifications();
          this.isLoader = false;
          if (eval_id) {
            this.router.navigate([`viewevaluation/${eval_id}`], {});
            this.sideBarClosed();
          }
        }
        error => {
          console.error(error);
        }
      }
    )
  }

  markAllAsRead() {
    this.isLoader = true;
    this.getNotificationsService.markAllNotificationAsRead().subscribe(
      data => {
        if (data) {
          this.getAllNotifications();
          this.isLoader = false;
        }
        error => {
          console.error(error);
        }
      }
    )
  }


}
