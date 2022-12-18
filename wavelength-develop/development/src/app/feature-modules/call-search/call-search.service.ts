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

    acceptEvaluation(call_id: number, objSurvey: any) {
        return this.http.post<any>(environment.wavelengthApiUrl + `/call/${call_id}/evaluation`, objSurvey);
    }

    getAllCalls(filters: any) {
        return this.http.post<any[]>(environment.wavelengthApiUrl + '/calls', filters);
    }

    getExportFile(filters: any) {
        return this.http.post<Blob>(environment.wavelengthApiUrl + '/survey/bulkimport', filters, {
            responseType: 'blob' as 'json'
        }
        );
    }
    getCampaignGroups() {
        return this.http.get<any>(environment.wavelengthApiUrl + '/campaign/groups');
    }
    getCampaignSkils(group_ids) {
        if (group_ids !== '') {
            return this.http.get<any>(`${environment.wavelengthApiUrl}/campaign/group/${group_ids}/skills`);
        } else if (!group_ids) {
            return this.http.get<any>(`${environment.wavelengthApiUrl}/campaign/skills`);

        }
    }
    getEvalForms(type, type_ids) {
        if (type_ids && type_ids !== '') {
            return this.http.get<any>(`${environment.wavelengthApiUrl}/campaign/${type}/${type_ids}/forms?active=1`);
        }
    }
    getDispositions(type, type_ids) {
        if (type_ids && type_ids !== '') {
            return this.http.get<any>(`${environment.wavelengthApiUrl}/campaign/${type}/${type_ids}/disposition`);
        }
    }
}
