import { EvaluationQuestionGroup } from './evaluationquestiongroup';
import { EvaluationHeader } from './evaluationheader';
import { EvaluationRating } from './evaluationrating';

export class Tags {
    id: string;
    name: string;
    severity: string;
    description: string;
    constructor() { }
}

export class EscalationPolicy {
    Threshold: string;
    NotifyTo: string[];
    constructor() { }
}

export class AllowedTransition {
    TransitionId?: string;
    PickUpStatus: string;
    DropStatus: string[];
    ButtonLabel: string[];
    Roles: string[];
    EscalationPolicy: EscalationPolicy;
    constructor() { }
}

export class EvaluationForm {
    surveyid: string;
    agentname: string;
    id: number;
    client_id: number;
    title: string;
    allow_dispute: boolean;
    headers: any[];
    headervalues: EvaluationHeader[]; // Used by create Survey
    ratings: EvaluationRating[];
    finalrating: string;
    questiongroups: EvaluationQuestionGroup[] = [];
    finalscore: number;
    evaluation_form: any;
    createdby: string;
    version: string;
    description: string;
    surveyresponseid: number;
    status: string;
    active: number;
    acknowledged_status: string;
    acknowledgeduserid: number;
    acknowledgedusername: string;
    agentid: number;
    commentbody: string;
    commentcreateddatetime: string;
    isacknowledged: boolean;
    responseid: number;
    callid: number;
    tag?: Tags;
    evaluatorname: string;
    group_score: EvaluationQuestionGroup[] = [];
    status_id: string;
    calldetails: any;
    call_id: string;
    agent_name: string;
    evaluation_disposition_name: string;
    severity_name: string;
    assigned_to: string;
}
