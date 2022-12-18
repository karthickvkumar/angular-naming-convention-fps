import { EvaluationQuestion } from './evaluationquestion';

export class EvaluationQuestionGroup {
    finalscore: number;
    obscore: number;
    groupid: number;
    groupname: string;
    groupdescription: string;
    groupmode: string;
    percentage: number;
    actualpercentage: number;
    scorepercentage: number;
    questions: EvaluationQuestion[] = [];
}
