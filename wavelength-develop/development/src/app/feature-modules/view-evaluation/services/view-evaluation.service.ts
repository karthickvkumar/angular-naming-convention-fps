import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { EvaluationForm } from '../../../core-models/evaluationform';


@Injectable()
export class ViewEvaluationService {
    constructor(
        private http: HttpClient
    ) { }

    acknowledgeEvaluation(evaluationId: number, commentText: string, type: string) {
        return this.http.post(environment.wavelengthApiUrl + `/${type}/${evaluationId}/comment`, {
            body: [{ comment: commentText }]
        });
    }

    disputeEvaluation(evaluationId: number, commentText: string, type: string) {
        return this.http.post(environment.wavelengthApiUrl + `/acknowledge`, { id: evaluationId, comment: commentText, type: type });
    }

    saveTransition(eval_id, stat_id, transitionObj) {
        return this.http.post<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/transition/${stat_id}`, transitionObj);
    }

    getEvaluationForm(evaluationId: number, access_from: string) {
        if (access_from && access_from === 'reevaluation') {
            return this.http.get<any>(environment.wavelengthApiUrl + `/evaluations/${evaluationId}?access_from=${access_from}`);
        } else if (!access_from && !(access_from === 'reevaluation')) {
            return this.http.get<any>(environment.wavelengthApiUrl + `/evaluations/${evaluationId}`);

        }
    }
    getPreviousEvaluationForm(evaluationId: number) {
        return this.http.get<any>(environment.wavelengthApiUrl + `/evaluations/${evaluationId}?access_from=reevaluation`);
    }
    getScoreAnswers(eval_id: number) {
        return this.http.get<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/score`);
    }

    getHeader(eval_id: number) {
        return this.http.get<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/basicinfo`);
    }

    getStatus(eval_id: number) {
        return this.http.get<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/status`);
    }

    getComments(type: string, eval_id: number) {
        return this.http.get<any>(environment.wavelengthApiUrl + `/comments/${type}/${eval_id}`);
    }
    getAnalysts() {
        return this.http.get<any>(environment.wavelengthApiUrl + `/users?role_id=7`);
    }
    SaveAndShowStatus(eval_id: number, objSurvey: any, show: boolean) {
        if (show) {
            return this.http.get<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/status`);
        } else {
            return this.http.post<any>(environment.wavelengthApiUrl + `/evaluation/${eval_id}/status`, objSurvey);
        }
    }
    assignQA(eval_id, user_id) {
        return this.http.post(environment.wavelengthApiUrl + `/evaluation/${eval_id}/assign`, { "user_id": user_id }
        );
    }

    adminRelease(eval_id) {
        return this.http.put(environment.wavelengthApiUrl + `/evaluation/${eval_id}/allowdispute`, {});
    }
}
