import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


@Injectable()
export class CallReportingService {
    constructor(private http: HttpClient) {
    }

    getExportFile(filters: any) {
        return this.http.post<Blob>(environment.wavelengthApiUrl + '/survey/bulkExport', filters, {
            responseType: 'blob' as 'json'
        }
        );
    }
}

