import { throwError as observableThrowError, Observable, BehaviorSubject, of } from 'rxjs';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, switchMap, finalize, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {

    constructor(private http: HttpClient) {
    }

    getAllSite() {
        return this.http.get<any[]>(environment.wavelengthApiUrl + '/sites');
    }

    getAllAgents(selectedSites: any) {
        return this.http.post<any[]>(environment.wavelengthApiUrl + '/sites/agent', selectedSites);
    }
    getAllEvaluationAgents() {
        return this.http.get<any[]>(environment.wavelengthApiUrl + '/evaluation/agentslist');
    }
}
