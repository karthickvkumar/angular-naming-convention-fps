export class EvaluationQuestion {
    questionid: number;
    parent_question_id: number;
    questiontype: string;
    questionmode: string;
    questiontitle: string;
    rawvalues: string;
    title: string;
    type: string; // ['radio', 'lineitems', 'text']
    value: string; // ["yes", "no", "n/a"],
    comment: string;
    commentmandotory: boolean;
    mandatory: boolean;
    disabled: boolean;
    showcommentbox: boolean;
    radiooptions: string[];
    ddenumkey: string;
    subgroups: EvaluationQuestion[] = [];
    answers: any[];
    commentformcontrolkey: string;
    formcontrolkey: string;
    score: any = {}; // {"yes" : 100, "no": 70, "n/a": 100},
    actuals: any[]; // [{"yes" : 7.5, "no": 3, "n/a": 7.5}],
    commentmandatory: boolean;
    options: any[] = [];
    actualscore: number;
    selectedscore: number;
    showresponseid: number;
    weightage: number;
    percentage: number;
}
