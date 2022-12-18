import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EvaluationForm } from '../../core-models/evaluationform';

@Injectable()
export class CallEvaluationService {

    constructor(private http: HttpClient) { }

    getById(callId: number) {
        return this.http.get<any>(environment.wavelengthApiUrl + `/surveyresponses/${callId}`);
    }

    create(objSurvey: any) {
        return this.http.post<any>(environment.wavelengthApiUrl + `/takesurvey`, objSurvey);
    }


    createSurvey(objSurvey: any) {
        return this.http.post(environment.wavelengthApiUrl + `/createsurvey`, objSurvey);
    }

    editSurvey(surveyid: number) {
        return this.http.get<EvaluationForm>(environment.wavelengthApiUrl + `/editsurvey/${surveyid}`);
    }

    getSurveyResponseById(responseId: number) {
        return this.http.get<EvaluationForm>(environment.wavelengthApiUrl + `/surveyresponse/${responseId}`);
    }

    getSurveyQuestionsById(id: number, callid: number) {
        return this.http.get<EvaluationForm>(environment.wavelengthApiUrl + `/surveyquestions/${id}?callid=${callid}`);
    }

    acknowledgeEvaluation(evaluationid: number, commentText: string) {
        return this.http.post(environment.wavelengthApiUrl + `/acknowledge`, { id: evaluationid, comment: commentText });
    }
}
