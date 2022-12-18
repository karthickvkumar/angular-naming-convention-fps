import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


@Injectable()
export class CallSearchService {
    constructor(
        private http: HttpClient
    ) {
    }

    getCallCount(filters) {
        return this.http.post<any[]>(environment.wavelengthApiUrl + '/getcallcount', filters);
    }

    getAllCalls(filters: any) {
        return this.http.post<any[]>(environment.wavelengthApiUrl + '/testcalls', filters);
    }

    getExportFile(filters: any) {
        return this.http.post<Blob>(environment.wavelengthApiUrl + '/survey/bulkimport', filters, {
            responseType: 'blob' as 'json'
        }
        );
    }
}

