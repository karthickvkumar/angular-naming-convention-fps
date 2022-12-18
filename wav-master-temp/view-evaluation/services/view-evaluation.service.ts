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
        return this.http.post(environment.wavelengthApiUrl + `/acknowledge`, { id: evaluationId, comment: commentText, type: type });
    }

    getEvaluationForm(responseId: number) {
        return this.http.get<EvaluationForm>(environment.wavelengthApiUrl + `/surveyresponse/${responseId}`);
    }
}
