
import { throwError as observableThrowError, Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { tap, catchError, switchMap, finalize, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './authentication.service';
import { ErrorHandlerService } from '../ui-services/error-handler.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AppInterceptor implements HttpInterceptor {
    isRefreshingToken = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    constructor(private injector: Injector) { }
    addToken(req: HttpRequest<any>): HttpRequest<any> {
        const jwttoken = localStorage.getItem('jwtauthtoken');
        if (req.url.match(environment.scUrl)) {
            return req;
        } else {
            return jwttoken ? req.clone({ setHeaders: { Authorization: 'Bearer ' + jwttoken } }) : req;
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the auth header from the service.
        const router = this.injector.get(Router);
        return next.handle(this.addToken(request))
            .pipe(
                tap((ev: HttpEvent<any>) => {
                }),
                catchError((err => {
                    console.log(err);
                    if (err instanceof HttpErrorResponse) {
                        switch (err.status) {
                            case 422:
                                const errorHandlerService = this.injector.get(ErrorHandlerService);
                                errorHandlerService.logUserDataErrors(err);
                                return throwError(err);
                            case 403:
                                const errorHandlerServices = this.injector.get(ErrorHandlerService);
                                errorHandlerServices.logUserDataErrors(err);
                                return throwError(err);
                            case 0:
                                // alert('iam in 504');
                                this.injector.get(ErrorHandlerService).logUnknownError(err);
                                return throwError(err);
                            case 500:
                                // alert('iam in 504');
                                this.injector.get(ErrorHandlerService).logUnknownError(err);
                                return throwError(err);
                            case 504:
                                this.injector.get(ErrorHandlerService).logUnknownError(err);
                                return throwError(err);
                            case 401:
                                localStorage.clear();
                                window.location.href = '/unauthorizedaccess';
                                return throwError(err);
                            case 400:
                                localStorage.clear();
                                window.location.href = '/unauthorizedaccess';
                                return throwError(err);
                            case 498:
                                return this.handleTokenExpire(request, next);
                        }
                    }
                })
                ));
    }

    handleTokenExpire(req: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;
            this.tokenSubject.next(null);
            const authenticationService = this.injector.get(AuthService);
            return authenticationService.refreshToken()
                .pipe(
                    switchMap((data: string) => {
                        if (data && data['access_token']) {
                            localStorage.setItem('jwtauthtoken', data['access_token']);
                            this.tokenSubject.next(data['access_token']);
                            return next.handle(this.addToken(this.reProcessRequest(req)));
                        }
                        // If we don't get a new token, we are in trouble so logout.
                        return observableThrowError('another some');
                    }),
                    finalize(() => {
                        this.isRefreshingToken = false;
                    }),
                    catchError(err => observableThrowError('some error'))
                );
        } else {
            return this.tokenSubject
                .pipe(
                    filter(token => token != null),
                    switchMap(token => {
                        return next.handle(this.addToken(this.reProcessRequest(req)));
                    }),
                    catchError(err => observableThrowError(''))
                );
        }
    }

    reProcessRequest(req: HttpRequest<any>): HttpRequest<any> {
        return new HttpRequest<any>(req.method, req.url, req.body);
    }

}

export const ApiInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: AppInterceptor,
    multi: true,
};
