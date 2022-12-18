import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class CallAcknowledgeService {
    constructor(
        private http: HttpClient
    ) {
    }

    getAllCalls(filters: any) {
        return this.http.post<any[]>(environment.wavelengthApiUrl + '/surveyres', filters);
    }
}
