
import { Injectable, OnInit, Injector, ErrorHandler } from '@angular/core';
import { PageLoaderService } from './page-loader.service';
import { NotificationService } from './notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable()
export class ErrorHandlerService {
    constructor(
        private injector: Injector
    ) { }
    logUnknownError(error: any) {
        const pageLoaderService = this.injector.get(PageLoaderService);
        const notificationService = this.injector.get(NotificationService);
        pageLoaderService.displayPageLoader(false);

        if (!environment.production) {
            console.error(error);
        } else {
            console.error(error);
            notificationService.displayAlert('Unexpected error occured while processing request. Kindly contact your administrator');
        }
    }

    logKnownError(errorCode) {
        const pageLoaderService = this.injector.get(PageLoaderService);
        const notificationService = this.injector.get(NotificationService);
        pageLoaderService.displayPageLoader(false);
        if (+errorCode === 504) {
            notificationService.displayAlert('Unable to fetch calls due to heavy load. Kindly modify your search criteria and try again');
        }
    }

    logUserDataErrors(err: any) {
        const errorList = err.error.errors;
        const errorKeys: any[] = Object.keys(errorList);
        const errors = [];
        const message = err.error.message;
        const errormsgs = errorKeys.map(item => {
            const errorMessages: string[] = errorList[item];
            errorMessages.map(d => {
                errors.push(d);
            });
        });

        const notificationService = this.injector.get(NotificationService);
        notificationService.displayUserValidationErrors(errors, message);
    }

}

