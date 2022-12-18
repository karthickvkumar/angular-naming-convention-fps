import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { EvaluationQuestionGroup } from '../../core-models/evaluationquestiongroup';
import { EvaluationForm } from '../../core-models/evaluationform';
import { CallEvaluationService } from './call-evaluation.service';
import { EvaluationQuestionAnswer } from '../../core-models/evaluation-questionanswer';
import { EvaluationQuestion } from '../../core-models/evaluationquestion';
import { EvaluationHeader } from '../../core-models/evaluationheader';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageLoaderService } from '../../core-services/ui-services/page-loader.service';
import * as moment from 'moment';
import { ErrorHandlerService } from '../../core-services/ui-services/error-handler.service';
import { CallInfo } from '../../core-models/callinfo';
import { AudioPlayerService } from '../../core-services/ui-services/audio-player.service';
import { ConfirmationComponent } from '../view-evaluation/modals/confirmation/confirmation.component';
import { PlatformLocation } from '@angular/common';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { WindowDialogService } from 'src/app/core-services/app-services/window-dialog.service ';
import { NgFooterTemplateDirective } from '@ng-select/ng-select/ng-select/ng-templates.directive';
import { NgForm } from '@angular/forms';

@Component({
    styleUrls: ['./call-evaluation.page.css'],
    templateUrl: './call-evaluation.page.html',
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})
export class CallEvaluationPageComponent implements OnInit, OnDestroy {

    @ViewChild('surveyform') surveyform: NgForm;
    questiongroups: EvaluationQuestionGroup[];
    agentname = '';
    agentemail = '';
    calldate = '';
    callid: number;
    formId: number;
    evaluationId: number;
    agentOptions = [];
    mode = 0;
    alive = true;
    evaluationFormId: number;
    objSurveyName: string;
    objShowQuestionGroups: EvaluationQuestionGroup[];
    objEvaluationForm: EvaluationForm;
    isStatusVisibleForAgent = false;
    callDetails: any;
    showPage = false;
    subscription;
    pageUrl = '';

    objFormvalueChangesSubscriber: any;

    constructor(
        private locationevent: Location,
        private callEvaluationService: CallEvaluationService,
        private applicationStateService: ApplicationStateService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private router: Router,
        public snackBar: MatSnackBar,
        private dialogService: WindowDialogService,
        private pageLoaderService: PageLoaderService,
        private errorService: ErrorHandlerService,
        private audioPlayerService: AudioPlayerService) {

    }

    ngOnInit() {
        try {
            // this.pageUrl = this.locationevent.path();

            this.applicationStateService.objEvaluationFormInprogress = true;

            this.pageLoaderService.getSubscription().subscribe(value => {
                this.showPage = !value;
            });
            this.objEvaluationForm = new EvaluationForm();
            this.objEvaluationForm.headers = [];
            this.route.params.subscribe(paramValues => {
                this.evaluationFormId = +paramValues['id'];
            });
            this.route.queryParams.subscribe(queryValues => {
                this.callid = queryValues['callid'];
                this.formId = queryValues['formid'];
                this.evaluationId = queryValues['evaluationid'];
                if (!this.callid || this.callid === null || (!this.formId && !this.evaluationId) || (this.formId && this.evaluationId)) {
                    this.router.navigateByUrl('/callsearch');
                } else {
                    if (this.formId) {
                        this.getSurveyQuestions();
                    }
                    if (this.evaluationId) {
                        this.getSavedEvaluation();
                    }
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    startAudio() {
        this.audioPlayerService.audioUrl = decodeURIComponent(this.callDetails.audiofileurl);
        this.audioPlayerService.startPlaying();
    }

    onBackButtonClick() {
        try {
            const dialogRef = this.dialog.open(ConfirmationComponent, {
                width: '600px'
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.goToCallSearch();
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    goToCallSearch() {
        try {
            // this.pageLoaderService.displayPageLoader(true);
            this.router.navigateByUrl('/callsearch');
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onSubmit(status) {
        try {
            this.objEvaluationForm.status = status;
            this.objEvaluationForm.acknowledged_status = status === 'submitted' ? 'pending' : 'Yet to Evaluate';
            const questionAnswers: EvaluationQuestionAnswer[] = [];
            const questionGroupAnswers: EvaluationQuestionGroup[] = [];
            // let scorableQuestions = false;
            let groupTotal = 0;
            this.objEvaluationForm.questiongroups.forEach(qgroup => {
                // scorableQuestions = false;
                groupTotal = 0;
                qgroup.questions.forEach(question => {
                    if (question.subgroups && question.subgroups.length > 0) {
                        if (question.questiontype === 'lineitems') {
                            // question.value = 'NA';
                            // question.score = 0;
                        }
                        questionAnswers.push(this.createQuestionAnswerObj(question));
                        question.subgroups.map(squestion => {
                            const squestionAnswer = this.createQuestionAnswerObj(squestion);
                            if (qgroup.groupmode === 'default') {
                                groupTotal += +squestionAnswer.score;
                            }
                            if (qgroup.groupmode === 'auto-failure' && squestionAnswer.answertext === 'Yes') {
                                groupTotal += 1;
                            }
                            questionAnswers.push(squestionAnswer);
                        });
                    } else {
                        questionAnswers.push(this.createQuestionAnswerObj(question));
                    }
                });
                if (qgroup.groupmode !== 'no-score') {
                    const questionGroupAnswer = this.createQuestionGroupAnswerObj(qgroup);
                    questionGroupAnswer.obscore = groupTotal;
                    questionGroupAnswer.questions = undefined;
                    questionGroupAnswers.push(questionGroupAnswer);
                }

            });
            this.createSurvey(questionAnswers, questionGroupAnswers);
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    cancel() {
        try {
            this.mode = 0;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getSurveyQuestions() {
        try {
            if (this.formId && this.formId !== 0) {
                this.callEvaluationService.getSurveyQuestionsById(this.formId, this.callid)
                    .subscribe((data) => {
                        this.pageLoaderService.displayPageLoader(false);
                        this.objEvaluationForm = data;
                        this.callDetails = data['calldetails'];
                        setTimeout(() => {
                            this.objFormvalueChangesSubscriber = this.surveyform.valueChanges.subscribe(
                                result => {
                                    this.applicationStateService.objEvaluationFormInprogress = true;
                                }
                            );
                        }, 0);
                        this.addConstantHeaders();
                        this.objEvaluationForm.id = this.formId;
                        this.mode = 1;
                        if (this.applicationStateService.selectedCallInfo.value === null) {
                            this.createCallInfo('todo');
                        }
                    });
            }
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getSavedEvaluation() {
        try {
            this.callEvaluationService.getSurveyResponseById(this.evaluationId).subscribe((data) => {
                this.pageLoaderService.displayPageLoader(false);
                this.objEvaluationForm = data;
                this.callDetails = data['calldetails'];
                this.formId = data['evaluationformid'];
                // this.addConstantHeaders();
                this.setGroupAndQuestionScore();
                this.objEvaluationForm.id = this.formId;
                this.mode = 1;
                setTimeout(() => {
                    this.surveyform.valueChanges.subscribe(
                        result => {
                            this.applicationStateService.objEvaluationFormInprogress = true;
                        }
                    );
                }, 0);
                if (this.applicationStateService.selectedCallInfo.value === null) {
                    this.createCallInfo('inprogress');
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    addConstantHeaders() {
        try {
            const phoneextensionheader = new EvaluationHeader();
            phoneextensionheader.name = 'Phone Ext';
            phoneextensionheader.value = this.callDetails.extension;
            phoneextensionheader.mandatory = true;
            phoneextensionheader.type = 'text';
            phoneextensionheader.disabled = true;
            this.objEvaluationForm.headers.push(phoneextensionheader);

            const agentnameheader = new EvaluationHeader();
            agentnameheader.name = 'Agent Name';
            agentnameheader.value = (this.callDetails.employee && this.callDetails.employee.agentname) || '';
            agentnameheader.mandatory = true;
            agentnameheader.type = 'text';
            agentnameheader.disabled = true;
            this.objEvaluationForm.headers.push(agentnameheader);

            const managernameheader = new EvaluationHeader();
            managernameheader.name = 'Supervisor';
            managernameheader.value = (this.callDetails.employee.supervisor && this.callDetails.employee.supervisor.manager_name) || '';
            managernameheader.mandatory = true;
            managernameheader.type = 'text';
            managernameheader.disabled = true;
            this.objEvaluationForm.headers.push(managernameheader);

            const calldateheader = new EvaluationHeader();
            calldateheader.name = 'Call Date';
            // tslint:disable-next-line:max-line-length
            calldateheader.value = moment.utc(this.callDetails.callstartdatetime.toString()).local().format('YYYY-MM-DD hh:mm:ss A') || '';
            calldateheader.type = 'text';
            calldateheader.disabled = true;
            this.objEvaluationForm.headers.push(calldateheader);

            const phoneneumberheader = new EvaluationHeader();
            phoneneumberheader.name = 'Phone Number';
            phoneneumberheader.value = this.callDetails.customer_num.toString() || '';
            phoneneumberheader.type = 'text';
            phoneneumberheader.disabled = true;
            this.objEvaluationForm.headers.push(phoneneumberheader);

            const siteheader = new EvaluationHeader();
            siteheader.name = 'Site';
            siteheader.value = this.callDetails.employee.vendor || '';
            siteheader.type = 'text';
            siteheader.disabled = true;
            this.objEvaluationForm.headers.push(siteheader);

            const evaluatedheader = new EvaluationHeader();
            evaluatedheader.name = 'Evaluated by';
            evaluatedheader.value = this.applicationStateService.loggedInUser.name || '';
            evaluatedheader.type = 'text';
            evaluatedheader.disabled = true;
            this.objEvaluationForm.headers.push(evaluatedheader);

            const dispositionheader = new EvaluationHeader();
            dispositionheader.name = 'Disposition';
            dispositionheader.value = this.callDetails.disposition || '';
            dispositionheader.type = 'text';
            dispositionheader.disabled = true;
            this.objEvaluationForm.headers.push(dispositionheader);

        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getRating() {
        try {
            const total = this.getTotalPercentage();
            const rating = this.objEvaluationForm.ratings.find(r => total <= r.max && total > r.min);
            return rating.name;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    createSurvey(questionAnswers: EvaluationQuestionAnswer[], questionGroupAnswers: EvaluationQuestionGroup[]) {
        try {
            const autoFailureGroup = this.objEvaluationForm.questiongroups.find(g => {
                return g.groupmode ? g.groupmode.toLowerCase() === 'auto-failure' : false;
            });
            const postvalues = {};
            postvalues['employeeid'] = this.callDetails.employee.user_id;
            postvalues['finalscore'] = this.getTotalPercentage();
            postvalues['auto-failure'] = autoFailureGroup ? this.calculateFailureCount(autoFailureGroup.groupid) : 0;
            postvalues['surveyid'] = this.formId;
            postvalues['callid'] = this.callDetails.callid;
            postvalues['questiongroup'] = questionGroupAnswers;
            postvalues['questions'] = questionAnswers;
            postvalues['rating'] = '';
            postvalues['status'] = this.objEvaluationForm.status;
            postvalues['headervalues'] = this.objEvaluationForm.headers;
            postvalues['surveyresponseid'] = this.evaluationId || null;
            postvalues['acknowledge_status'] = this.objEvaluationForm.acknowledged_status;

            this.callEvaluationService.create(postvalues)
                .subscribe(data => {
                    this.applicationStateService.objEvaluationFormInprogress = false;
                    const callInfo = this.applicationStateService.selectedCallInfo.value;
                    if (callInfo && callInfo !== null) {
                        callInfo.evaluationStatus = this.objEvaluationForm.status.toLowerCase();
                        this.applicationStateService.selectedCallInfo.next(callInfo);
                    } else {
                        this.createCallInfo(this.objEvaluationForm.status.toLowerCase());
                    }
                    if (this.objEvaluationForm.status.toLowerCase() === 'submitted') {
                        this.snackBar.open('Form has been submitted successfuly', null, {
                            duration: 2000,
                        });
                        this.router.navigateByUrl('/callsearch');
                    } else if (this.objEvaluationForm.status.toLowerCase() === 'inprogress') {
                        this.evaluationId = data.surveyresponses.id;
                        this.snackBar.open('Form has been saved successfuly', null, {
                            duration: 2000,
                        });
                    }

                    // tslint:disable-next-line:max-line-length
                    const message = this.objEvaluationForm.status.toLowerCase() === 'submitted' ? 'Form has been submitted successfully' : 'Form has been saved successfully';

                },
                    error => {
                        this.errorService.logUnknownError(error);
                    }
                );
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    createQuestionAnswerObj(question: EvaluationQuestion) {
        try {
            const questionanswer = new EvaluationQuestionAnswer();
            questionanswer.questionid = question.questionid;
            questionanswer.answertext = question.value || ' ';
            questionanswer.body = question.comment;
            questionanswer.score = question.selectedscore || 0;
            return questionanswer;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    createQuestionGroupAnswerObj(question: EvaluationQuestionGroup) {
        try {
            const questionanswer = new EvaluationQuestionGroup();
            questionanswer.groupid = +question.groupid;
            questionanswer.groupname = question.groupname;
            questionanswer.obscore = 0;
            return questionanswer;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    setScoreAndValueForLineItems(groupid: number, questionid: number, value: string) {
        try {
            this.objEvaluationForm.questiongroups.find(g => g.groupid === groupid)
                .questions.find(q => q.questionid === questionid)
                .subgroups.map(sq => {
                    sq.value = value;
                    if (sq.score) {
                        sq.selectedscore = (+sq.weightage * sq.score[value]) / 100;
                    }
                });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    createCallInfo(status: string) {
        const callinfo = new CallInfo();
        const calldatetime = `${this.objEvaluationForm['calldetails'].callstartdatetime}`.split(':').join('-').split(' ').join('_');
        const agentInfo = `${this.objEvaluationForm.agentname}_${calldatetime}`;
        callinfo.audioUrl = this.callDetails.audiofileurl;
        callinfo.agentName = this.callDetails.employee.agentname;
        callinfo.callId = this.callDetails.callid;
        callinfo.isEvaluationEditor = true;
        callinfo.evaluationStatus = status;
        callinfo.searchFilter = null;
        callinfo.agentinfo = agentInfo;
        if (status === 'todo') {
            callinfo.evaluationFormId = this.formId;
        } else if (status === 'inprogress') {
            callinfo.evaluationResponseId = this.evaluationId;
        }
        this.applicationStateService.selectedCallInfo.next(callinfo);
        this.startAudio();
    }

    setLineItemScoreValue(groupid: number, questionid: number, squestionid: number, value: string, scoreoptions: any) {
        try {
            this.resetLineItemsSelectAllHeader(groupid, questionid, value);
            this.objEvaluationForm.questiongroups.find(g => g.groupid === groupid)
                .questions.find(q => q.questionid === questionid)
                .subgroups.map(sq => {
                    if (sq.questionid === squestionid) {
                        sq.value = value;
                        if (sq.score) {
                            sq.selectedscore = (+sq.weightage * sq.score[value]) / 100;
                        }
                    }
                });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    resetLineItemsSelectAllHeader(groupid: number, questionid: number, value: string) {
        try {
            const question = this.objEvaluationForm.questiongroups.find(g => g.groupid === groupid)
                .questions.find(q => q.questionid === questionid);
            question.value = question.value === value ? value : '';
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    calculateFailureCount(groupid: number) {
        try {
            let count = 0;
            const grp = this.objEvaluationForm.questiongroups.find(g => g.groupid === groupid);
            grp.questions.forEach(q => {
                if (q.questiontype === 'lineitems') {
                    q.subgroups.forEach(sq => {
                        if (sq.value && sq.value.toLowerCase() === 'yes') {
                            count = count + 1;
                        }
                    });
                }
            });
            return count;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getGroupScore(groupid: number) {
        try {
            let total = 0;
            let actual = 0;
            const grp = this.objEvaluationForm.questiongroups.find(g => g.groupid === groupid);
            if (grp.percentage) {
                grp.questions.forEach(q => {
                    if (q.questiontype === 'lineitems') {
                        q.subgroups.forEach(sq => {
                            if (sq.score && sq.selectedscore) {
                                total = total + +sq.weightage;
                                actual = actual + sq.selectedscore;
                            }
                        });
                    } else {
                        if (q.score && q.selectedscore) {
                            total = total + +q.weightage;
                            actual = actual + q.selectedscore;
                        }
                    }
                });
            }
            this.objEvaluationForm.questiongroups.find(g => g.groupid === groupid).scorepercentage = total;
            this.objEvaluationForm.questiongroups.find(g => g.groupid === groupid).actualpercentage = total;
            return total;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getTotalPercentage() {
        try {
            let total = 0;
            this.objEvaluationForm.questiongroups.forEach(group => {
                if (group.groupmode && group.groupmode.toLowerCase() === 'auto-failure') {
                    group.questions.forEach(q => {
                        if (q.questiontype === 'lineitems') {
                            q.subgroups.forEach(sq => {
                                if (sq.value && sq.value.toLowerCase() === 'yes') {
                                    total = -400;
                                }
                            });
                        }
                    });
                } else {
                    if (group.percentage) {
                        if (group.actualpercentage) {
                            const multiplier = this.getGroupPercentByName(group);
                            total = total + (group.actualpercentage * multiplier);
                        } else {
                            const value = this.getGroupScore(group.groupid);
                            total = total + value;
                        }
                    }
                }
            });
            return total < 0 ? 0 : total;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getGroupPercentByName(questiongroup: EvaluationQuestionGroup) {
        try {
            if (questiongroup.groupname.toUpperCase().includes('COMPLIANCE')) {
                return 0.70;
            }
            if (questiongroup.groupname.toUpperCase().includes('CUSTOMER EXPERIENCE')) {
                return 0.30;
            }
            return 1;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    setGroupAndQuestionScore() {
        try {
            this.objEvaluationForm.questiongroups.map(group => {
                if (group.percentage) {
                    group.questions.map(question => {
                        if (question.questiontype === 'lineitems') {
                            question.value = '';
                            question.subgroups.map(squestion => {
                                squestion.selectedscore = squestion.score[squestion.value];
                            });
                        }
                    });
                }
                group.actualpercentage = this.getGroupScore(group.groupid);
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    ngOnDestroy() {
        try {
            this.alive = false;
            // tslint:disable-next-line:curly
            if (this.objFormvalueChangesSubscriber) this.objFormvalueChangesSubscriber.unsubscribe();
            this.applicationStateService.objEvaluationFormInprogress = false;
            // this.subscription.unsubscribe();
            // this.location.pushState(null, null, null);
            // this.location = undefined;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }
}
