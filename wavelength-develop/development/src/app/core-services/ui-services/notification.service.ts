import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../../core-components/alert/alert.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable()
export class NotificationService {

    constructor(
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private http: HttpClient
    ) { }
    displayToaster(message: string, duration = 2000) {
        this.snackBar.open(message, null, {
            duration: duration
        });
    }

    displayAlert(message: string, header = '') {
        this.dialog.open(AlertComponent, {
            width: '500px',
            data: { message: message, header: header }
        });
    }

    displayUserValidationErrors(messages: string[], header = '') {
        this.dialog.open(AlertComponent, {
            width: '500px',
            data: { messages: messages, header: header }
        });
    }

    getNotifications() {
        return this.http.get(environment.wavelengthApiUrl + `/notifications/latest`);
    }

    markNotificationAsRead(not_id) {
        return this.http.put(environment.wavelengthApiUrl + `/notification/${not_id}/markasread`, {});
    }

    markAllNotificationAsRead() {
        return this.http.put(environment.wavelengthApiUrl + `/notifications/markallasread`, {});
    }

}
