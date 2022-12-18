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
        return this.http.post<any[]>(environment.wavelengthApiUrl + '/evaluations/search', filters);
    }
    // getAllCalls(filters: any) {
    // const queryParams = Object.keys(filters).map(function(k) {
    //         return encodeURIComponent(k) + '=' + encodeURIComponent(filters[k]);
    //     }).join('&');
    //     return this.http.get<any[]>(environment.wavelengthApiUrl + `/evaluations/search/?${queryParams}`);
    // }
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
            return this.http.get<any>(`${environment.wavelengthApiUrl}/campaign/${type}/${type_ids}/forms`);
        }
    }
    getDispositions(type, type_ids) {
        if (type_ids && type_ids !== '') {
            return this.http.get<any>(`${environment.wavelengthApiUrl}/campaign/${type}/${type_ids}/disposition`);
        }
    }
}
