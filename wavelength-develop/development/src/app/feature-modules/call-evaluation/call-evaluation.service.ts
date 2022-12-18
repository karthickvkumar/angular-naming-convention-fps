import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EvaluationForm } from '../../core-models/evaluationform';

@Injectable()
export class CallEvaluationService {

    constructor(private http: HttpClient) { }

    getById(callId: number) {
        return this.http.get<any>(environment.wavelengthApiUrl + `/evaluationresponses/${callId}`);
    }
    saveTransition(eval_id, stat_id, transitionObj) {
        return this.http.post<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/transition/${stat_id}`, transitionObj);
    }
    getAllTags() {
        return this.http.get<any>(environment.wavelengthApiUrl + `/evaluation/disposition`);
    }
    saveDisposition(eval_id: number, evalDisposition: any) {
        return this.http.post<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/disposition`, evalDisposition);
    }

    saveScoreAnswers(eval_id: number, objSurvey: any) {
        return this.http.put<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/score`, objSurvey);
    }

    saveHeader(eval_id: number, objSurvey: any) {
        return this.http.post<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/basicinfo`, objSurvey);
    }

    saveStatus(eval_id: number, objSurvey: any) {
        return this.http.post<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/status`, objSurvey);
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

    getEvaluationsById(responseId: number) {
        return this.http.get<EvaluationForm>(environment.wavelengthApiUrl + `/evaluations/${responseId}`);
    }

    getSurveyQuestionsById(id: number, callid: number) {
        return this.http.get<EvaluationForm>(environment.wavelengthApiUrl + `/evaluationform/${id}/questions?callid=${callid}`);
    }

    acknowledgeEvaluation(evaluationid: number, commentText: string) {
        return this.http.post(environment.wavelengthApiUrl + `/acknowledge`, { id: evaluationid, comment: commentText });
    }

    getCallById(id: any) {
        return this.http.get<any>(environment.wavelengthApiUrl + `/call/${id}`);
    }
}
