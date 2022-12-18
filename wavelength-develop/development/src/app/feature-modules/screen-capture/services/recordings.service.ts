import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RecordingService {
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any>(environment.scUrl + '/recording');
  }

  getBySearchCriteria(searchcriteria: string) {
    return this.http.get<any>(environment.scUrl + '/recording' + searchcriteria);
  }
}
