import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { EvaluationQuestionGroup } from '../../core-models/evaluationquestiongroup';
import { EvaluationForm, AllowedTransition } from '../../core-models/evaluationform';
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
import { PlatformLocation } from '@angular/common';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Subscription, Observable, ObservableInput } from 'rxjs';
import { WindowDialogService } from 'src/app/core-services/app-services/window-dialog.service ';
import { NgFooterTemplateDirective } from '@ng-select/ng-select/ng-select/ng-templates.directive';
import { NgForm } from '@angular/forms';
import { TagconfirmationComponent } from './modals/tagconfirmation/tagconfirmation.component';
import { finalize } from 'rxjs/internal/operators/finalize';
import { ConfirmationComponent } from 'src/app/core-components/confirmation/confirmation.component';
import { forkJoin } from 'rxjs';
import { ViewWorkflowComponent } from '../view-evaluation/modals/view-workflow/view-workflow.component';
import { ViewPreviousEvaluationComponent } from 'src/app/core-components/view-previous-evaluation/view-previous-evaluation.component';
import { ViewEvaluationService } from '../view-evaluation/services/view-evaluation.service';
@Component({
    styleUrls: ['./call-evaluation.page.css'],
    templateUrl: './call-evaluation.page.html',
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})
export class CallEvaluationPageComponent implements OnInit, OnDestroy {

    //@ViewChild('surveyform') surveyform: NgForm;
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
    objEvaluationDetails: any;
    objEvaluationHeader: any;
    objSelectedPriority = '';
    objSelectedAuditTags = '';
    predecessor_id;
    objAllowedTransition: AllowedTransition;
    backToUrl;
    objFormvalueChangesSubscriber: any;
    objShowReevaluationButtons = false;
    objGivenComments;
    overAllScore: number = 0;
    surveyform: any = {
        valid: false
    };
    formType: string;
    result: any;
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
        private audioPlayerService: AudioPlayerService,
        private viewEvaluationService: ViewEvaluationService) {

    }

    ngOnInit() {
        try {
            // this.pageUrl = this.locationevent.path();
            this.route.queryParams.subscribe(queryValues => {
                this.backToUrl = queryValues['from'];
            });
            this.objEvaluationDetails = this.applicationStateService.objEvaluationDetails;
            this.objEvaluationHeader = this.applicationStateService.objEvaluationDetails && this.applicationStateService.objEvaluationDetails.headers ? this.applicationStateService.objEvaluationDetails.headers : false;
            this.applicationStateService.objEvaluationFormInprogress = true;
            this.pageLoaderService.getSubscription().subscribe(value => {
                this.showPage = !value;
            });
            // this.objEvaluationForm = new EvaluationForm();
            // this.objEvaluationForm.headers = [];
            this.route.params.subscribe(paramValues => {
                this.evaluationFormId = +paramValues['id'];
            });
            this.route.queryParams.subscribe(queryValues => {
                this.callid = queryValues['callid'];
                this.formId = queryValues['formid'];
                this.evaluationId = queryValues['evaluationid'];
                if (!this.callid || this.callid === null || (!this.formId && !this.evaluationId)) {
                    // || (this.formId && this.evaluationId)
                    this.router.navigateByUrl('/callsearch');
                } else {
                    if (this.formId) {
                        this.getSurveyQuestions();
                    }
                    if (this.evaluationId) {
                        this.getSavedEvaluation();
                    } else {
                        this.evaluationId = this.applicationStateService.objEvaluationsId;
                    }
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
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
            if (this.backToUrl) {
                this.router.navigateByUrl(`/${this.backToUrl}`);
            } else {
                this.router.navigateByUrl('/callsearch');
            }
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }
    saveCommentsAndTransition(comments) {
        if (comments) {
            const evalDisposition = {};
            evalDisposition['severityid'] = this.objSelectedPriority;
            evalDisposition['evaluationdispositionid'] = this.objSelectedAuditTags;
            this.viewEvaluationService.acknowledgeEvaluation(this.evaluationId, comments, 'evaluation')
                .takeWhile(() => this.alive)
                .subscribe((data) => {
                    const transitionObj = {};
                    transitionObj['status_id'] = this.getStatusForSubmitedEvaluation();
                    transitionObj['comment_id'] = data['id'];
                    const transitionId = this.objEvaluationDetails.allowed_transition.TransitionId;
                    this.viewEvaluationService.saveTransition(this.evaluationId, transitionId, transitionObj)
                        .takeWhile(() => this.alive)
                        .subscribe(res => {
                            if (res) {
                                this.callEvaluationService.saveDisposition(this.evaluationId, evalDisposition)
                                    .takeWhile(() => this.alive)
                                    .pipe().subscribe(response => {
                                        if (response) {
                                            this.applicationStateService.objEvaluationFormInprogress = false;
                                        }
                                    });
                                if (this.objEvaluationForm.status === 'Submit Reevaluation') {
                                    this.snackBar.open('Form has been submitted successfully', null, {
                                        duration: 2000,
                                    });
                                    this.goToCallSearch();
                                }
                            }

                        });
                });
        }
    }
    // onSubmit(status) {
    //     try {
    //         if (status !== 'inprogress') {
    //             const dialogRef = this.dialog.open(TagconfirmationComponent, {
    //                 width: '600px',
    //                 disableClose: true,
    //                 data: {
    //                     status_id: this.objAllowedTransition ? this.objAllowedTransition.TransitionId : 0
    //                 }
    //             });
    //             dialogRef.afterClosed().takeWhile(() => this.alive).subscribe(result => {
    //                 if (result) {
    //                     this.objSelectedPriority = result['priority'];
    //                     this.objSelectedAuditTags = result['audittags'];
    //                     this.objGivenComments = result['comments'];
    //                     // this.saveComments(result['comments']);
    //                     this.callEvaluationEndpoint(status);
    //                 }
    //             });
    //         } else {
    //             this.callEvaluationEndpoint(status);
    //         }
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // callEvaluationEndpoint(status) {
    //     try {
    //         this.objEvaluationForm.status = status;
    //         // this.objEvaluationForm.acknowledged_status = status === 'submitted' ? 'Yet To Be Acknowledged' : 'Yet to Evaluate';
    //         const questionAnswers: EvaluationQuestionAnswer[] = [];
    //         const questionGroupAnswers: EvaluationQuestionGroup[] = [];
    //         // let scorableQuestions = false;
    //         let groupTotal = 0;
    //         this.questiongroups.forEach(qgroup => {
    //             // scorableQuestions = false;
    //             groupTotal = 0;
    //             qgroup.questions.forEach(question => {
    //                 if (question.subgroups && question.subgroups.length > 0) {
    //                     if (question.questiontype === 'lineitems') {
    //                         // question.value = 'NA';
    //                         // question.score = 0;
    //                     }
    //                     questionAnswers.push(this.createQuestionAnswerObj(question));
    //                     question.subgroups.map(squestion => {
    //                         const squestionAnswer = this.createQuestionAnswerObj(squestion);
    //                         if (qgroup.groupmode === 'default') {
    //                             groupTotal += +squestionAnswer.score;
    //                         }
    //                         if (qgroup.groupmode === 'auto-failure' && squestionAnswer.answertext === 'Yes') {
    //                             groupTotal += 1;
    //                         }
    //                         questionAnswers.push(squestionAnswer);
    //                     });
    //                 } else {
    //                     questionAnswers.push(this.createQuestionAnswerObj(question));
    //                 }
    //             });
    //             if (qgroup.groupmode !== 'no-score') {
    //                 const questionGroupAnswer = this.createQuestionGroupAnswerObj(qgroup);
    //                 questionGroupAnswer.obscore = groupTotal;
    //                 questionGroupAnswer.questions = undefined;
    //                 questionGroupAnswers.push(questionGroupAnswer);
    //             }

    //         });
    //         this.createSurvey(questionAnswers, questionGroupAnswers);
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

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
                    .pipe(
                        finalize(() => {
                            this.pageLoaderService.displayPageLoader(false);
                        })
                    )
                    .takeWhile(() => this.alive)
                    .subscribe((data) => {
                        data.headers = this.objEvaluationForm && this.objEvaluationForm.headers.length > 0 ? this.objEvaluationForm.headers : data.headers;
                        this.formType = this.objEvaluationDetails && this.objEvaluationDetails.evaluation_form ? this.objEvaluationDetails.evaluation_form.type : '1';
                        this.questiongroups = data['questiongroups'];
                        this.callDetails = data['calldetails'];
                        this.objEvaluationForm = data;
                        if (this.surveyform && this.surveyform.valueChanges) {
                            setTimeout(() => {
                                this.objFormvalueChangesSubscriber = this.surveyform.valueChanges.subscribe(
                                    result => {
                                        this.applicationStateService.objEvaluationFormInprogress = true;
                                    }
                                );
                            }, 0);
                        }
                        if (this.objEvaluationHeader && this.objEvaluationForm.headers.length == 0 && JSON.parse(this.objEvaluationHeader)) {
                            this.objEvaluationForm.headers = JSON.parse(this.objEvaluationHeader);
                        }
                        // if (this.formType == '2') {
                        //     this.audioPlayerService.resetPlaying();
                        //     this.applicationStateService.isDownload.next(false);
                        // }
                        if (this.objEvaluationForm.headers && this.objEvaluationForm.headers.length == 0) {
                            this.addConstantHeaders();
                        }

                        // this.objEvaluationForm.id = this.formId;
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

    //512 - api
    getSavedEvaluation() {
        try {
            this.callEvaluationService.getEvaluationsById(this.evaluationId)
                .pipe(
                    finalize(() => {
                        this.pageLoaderService.displayPageLoader(false);
                    })
                )
                .takeWhile(() => this.alive)
                .subscribe((data) => {
                    this.pageLoaderService.displayPageLoader(false);
                    this.objEvaluationForm = data['evaluationcallresults'][0];
                    this.objEvaluationDetails = data['evaluationcallresults'][0];
                    this.callDetails = data['evaluationcallresults'][0]['call_details'];
                    this.questiongroups = data['evaluationcallresults'][0].answers.questiongroups;
                    this.formType = data['evaluationcallresults'][0]['evaluation_form']['type'];
                    this.formId = data['evaluationcallresults'][0]['evaluation_form_id'];
                    this.objAllowedTransition = data['evaluationcallresults'][0]['allowed_transition'];
                    this.predecessor_id = this.objEvaluationForm['predecessor_id'];
                    if (this.objAllowedTransition && this.objAllowedTransition.TransitionId === '8') {
                        this.objShowReevaluationButtons = true;
                    }

                    // this.addConstantHeaders();
                    //this.setGroupAndQuestionScore();
                    if (this.objEvaluationForm.status['id'] == 1) {
                        this.getSurveyQuestions();
                    }
                    this.objEvaluationForm.id = this.formId;
                    this.mode = 1;
                    if (this.surveyform && this.surveyform.valueChanges) {
                        setTimeout(() => {
                            this.surveyform.valueChanges.subscribe(
                                result => {
                                    this.applicationStateService.objEvaluationFormInprogress = true;
                                }
                            );
                        }, 0);
                    }
                    // if (this.callDetails.usr_grp === 'F9') {
                    //     this.audioPlayerService.resetPlaying();
                    //     this.applicationStateService.isDownload.next(false);
                    // }
                    if (this.applicationStateService.selectedCallInfo.value === null) {
                        this.createCallInfo('inprogress');
                    }
                });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onViewPreviousEvaluation() {
        try {
            this.dialog.open(ViewPreviousEvaluationComponent, {
                width: '1000px',
                disableClose: false,
                maxHeight: '90vh',
                data: {
                    evaluationId: this.predecessor_id,
                    // objAllowedTransition: this.objAllowedTransition,
                    isActionButtonVisible: false,
                    // objbuttonLabel: 0
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onShowComments() {
        try {
            this.dialog.open(ViewWorkflowComponent, {
                width: '900px',
                disableClose: true,
                data: {
                    evaluationId: this.predecessor_id,
                    objAllowedTransition: this.objAllowedTransition,
                    isActionButtonVisible: false,
                    objbuttonLabel: 0
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getStatusForSubmitedEvaluation() {
        try {
            const dropStatusObj = this.toObject(this.objEvaluationDetails.allowed_transition['ButtonLabel'],
                this.objEvaluationDetails.allowed_transition['DropStatus']);

            if (this.objShowReevaluationButtons) {
                if (this.objEvaluationForm.status === 'inprogress') {
                    return this.objAllowedTransition.TransitionId;
                } else {
                    return dropStatusObj[this.objEvaluationForm.status];
                }
            } else {
                if (this.objEvaluationForm.status === 'inprogress') {
                    return dropStatusObj['In Progress'];
                } else {
                    return dropStatusObj['Submit'];
                }
            }
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
            calldateheader.value = moment.utc(this.callDetails.callenddatetime.toString()).local().format('YYYY-MM-DD hh:mm:ss A') || '';
            calldateheader.type = 'text';
            calldateheader.disabled = true;
            this.objEvaluationForm.headers.push(calldateheader);

            const phoneneumberheader = new EvaluationHeader();
            phoneneumberheader.name = 'Phone Number';
            phoneneumberheader.value = this.callDetails.customer_num ? this.callDetails.customer_num.toString() : '';
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
            //const total = this.getTotalPercentage();
            const total = 0;
            const rating = this.objEvaluationForm.ratings.find(r => total <= r.max && total > r.min);
            return rating.name;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    saveAllData(response: any[]): Observable<any> {
        return forkJoin(response);
    }

    createSurvey(questionAnswers: EvaluationQuestionAnswer[], questionGroupAnswers: EvaluationQuestionGroup[]) {
        try {
            this.pageLoaderService.displayPageLoader(true);
            const autoFailureGroup = this.questiongroups.find(g => {
                return g.groupmode ? g.groupmode.toLowerCase() === 'auto-failure' : false;
            });

            // const postvalues = {};
            // postvalues['employeeid'] = this.callDetails.employee.user_id;
            // postvalues['finalscore'] = this.getTotalPercentage();
            // postvalues['auto-failure'] = autoFailureGroup ? this.calculateFailureCount(autoFailureGroup.groupid) : 0;
            // postvalues['surveyid'] = this.formId;
            // postvalues['callid'] = this.callDetails.callid;
            // postvalues['questiongroup'] = questionGroupAnswers;
            // postvalues['questions'] = questionAnswers;
            // postvalues['ratings'] = '';
            // postvalues['status'] = this.objEvaluationForm.status;
            // postvalues['headervalues'] = this.objEvaluationForm.headers;
            // postvalues['surveyresponseid'] = this.evaluationId || null;
            // postvalues['acknowledge_status'] = this.objEvaluationForm.acknowledged_status;
            // if (this.objEvaluationForm.acknowledged_status === 'Yet To Be Acknowledged') {
            //     postvalues['severityid'] = this.objSelectedPriority;
            //     postvalues['evaluationdispositionid'] = this.objSelectedAuditTags;
            // }

            // const postevaluation = {};
            // postevaluation['headers'] = this.objEvaluationForm.headers;
            // postevaluation['allow_dispute'] = false;
            // postevaluation['agent_id'] = this.callDetails.employee.user_id;

            // const poststatus = {};
            // poststatus['status'] = this.objEvaluationForm.status;
            // poststatus['updated_by'] = this.applicationStateService.loggedInUser.id;

            const postscore = {};
            postscore['group_score'] = questionGroupAnswers;
            postscore['answers'] = questionAnswers;
            //postscore['final_score'] = this.getTotalPercentage();
            postscore['final_score'] = this.result.totalscore;
            postscore['ratings'] = '';
            postscore['updated_by'] = this.applicationStateService.loggedInUser.id;

            const evalDisposition = {};
            evalDisposition['severityid'] = this.objSelectedPriority;
            evalDisposition['evaluationdispositionid'] = this.objSelectedAuditTags;
            const transitionId = this.objEvaluationDetails.allowed_transition.TransitionId;
            const dropStatusObj = this.toObject(this.objEvaluationDetails.allowed_transition['ButtonLabel'],
                this.objEvaluationDetails.allowed_transition['DropStatus']);
            const transitionObj = {};
            transitionObj['status_id'] = this.getStatusForSubmitedEvaluation()
            /*
            if (this.objEvaluationForm.status === 'inprogress') {
                transitionObj['status_id'] = dropStatusObj['In Progress'];
            } else {
                transitionObj['status_id'] = dropStatusObj['Submit'];
            }*/
            // this.callEvaluationService.saveTransition(this.evaluationId, transitionId, transitionObj).takeWhile(() => this.alive)
            //     .pipe().subscribe(Response => {
            this.saveAllData([
                this.callEvaluationService.saveScoreAnswers(this.evaluationId, postscore),
                // this.callEvaluationService.saveDisposition(this.evaluationId, evalDisposition)
            ]).takeWhile(() => this.alive)
                .pipe(
                    finalize(() => {
                        // this.loaderService.display(false);

                    })
                ).subscribe(
                    data => {
                        if (this.objEvaluationForm.status === 'Submit Reevaluation') {
                            this.saveCommentsAndTransition(this.objGivenComments);
                            this.afterScore();
                        } else {
                            this.callEvaluationService.saveTransition(this.evaluationId, transitionId, transitionObj)
                                .takeWhile(() => this.alive)
                                .pipe().subscribe(res => {
                                    if (res && this.objEvaluationForm.status !== 'inprogress') {
                                        this.callEvaluationService.saveDisposition(this.evaluationId, evalDisposition)
                                            .takeWhile(() => this.alive)
                                            .pipe().subscribe(response => {
                                                if (response) {
                                                    this.afterScore();
                                                }
                                            });
                                    } else {
                                        this.afterScore();
                                    }
                                });
                        }
                    },
                    error => {
                        this.errorService.logUnknownError(error);
                    }
                );
            // })

            /*
            this.callEvaluationService.saveScoreAnswers(this.evaluationId, postscore)
                .pipe(
                    finalize(() => {
                        this.pageLoaderService.displayPageLoader(false);
                    })
                )
                .takeWhile(() => this.alive)
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
                        this.snackBar.open('Form has been submitted successfully', null, {
                            duration: 2000,
                        });
                        this.router.navigateByUrl('/callsearch');
                    } else if (this.objEvaluationForm.status.toLowerCase() === 'inprogress') {
                        this.evaluationId = data.surveyresponses.id;
                        this.snackBar.open('Form has been saved successfully', null, {
                            duration: 2000,
                        });
                    }
                },
                    error => {
                        this.errorService.logUnknownError(error);
                    }
                );*/

        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }
    afterScore() {
        this.applicationStateService.objEvaluationFormInprogress = false;
        const callInfo = this.applicationStateService.selectedCallInfo.value;
        if (callInfo && callInfo !== null) {
            callInfo.evaluationStatus = this.objEvaluationForm.status.toLowerCase();
            this.applicationStateService.selectedCallInfo.next(callInfo);
        } else {
            this.createCallInfo(this.objEvaluationForm.status.toLowerCase());
        }
        if (this.objEvaluationForm.status.toLowerCase() === 'submitted') {
            this.snackBar.open('Form has been submitted successfully', null, {
                duration: 2000,
            });
            this.goToCallSearch();
        } else if (this.objEvaluationForm.status.toLowerCase() === 'inprogress') {
            // this.evaluationId = data.surveyresponses.id;
            this.snackBar.open('Form has been saved successfully', null, {
                duration: 2000,
            });
            this.goToCallSearch();
        } else if (this.objEvaluationForm.status.toLowerCase() === 'Submit Reevaluation') {
            this.snackBar.open('Form has been submitted successfully', null, {
                duration: 2000,
            });
            this.goToCallSearch();
        }
    }
    toObject(names, values) {
        const result = {};
        for (let i = 0; i < names.length; i++) {
            result[names[i]] = values[i];
        }
        return result;
    }

    // createQuestionAnswerObj(question: EvaluationQuestion) {
    //     try {
    //         const questionanswer = new EvaluationQuestionAnswer();
    //         questionanswer.questionid = question.questionid;
    //         questionanswer.answertext = question.value || ' ';
    //         questionanswer.body = question.comment;
    //         questionanswer.score = question.selectedscore || 0;
    //         return questionanswer;
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // createQuestionGroupAnswerObj(question: EvaluationQuestionGroup) {
    //     try {
    //         const questionanswer = new EvaluationQuestionGroup();
    //         questionanswer.groupid = +question.groupid;
    //         questionanswer.groupname = question.groupname;
    //         questionanswer.obscore = 0;
    //         return questionanswer;
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // setScoreAndValueForLineItems(groupid: number, questionid: number, value: string) {
    //     try {
    //         this.questiongroups.find(g => g.groupid === groupid)
    //             .questions.find(q => q.questionid === questionid)
    //             .subgroups.map(sq => {
    //                 sq.value = value;
    //                 if (sq.score) {
    //                     sq.selectedscore = (+sq.weightage * sq.score[value]) / 100;
    //                 }
    //             });
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    createCallInfo(status: string) {
        const callinfo = new CallInfo();
        this.applicationStateService.isDownload.next(true);

        const calldatetime = `${this.callDetails.call_date}`.split(':').join('-').split(' ').join('_');
        const agentInfo = `${this.objEvaluationForm.agent_name}_${calldatetime}`;
        // console.log(agentInfo);
        if (this.callDetails.audiofileurl) {
            callinfo.audioUrl = this.callDetails.audiofileurl[0]['url'];
        }
        callinfo.agentName = `${this.objEvaluationForm.agent_name}`;
        callinfo.callId = `${this.objEvaluationForm.call_id}`;
        callinfo.isEvaluationEditor = true;
        callinfo.evaluationStatus = status;
        callinfo.searchFilter = null;
        callinfo.agentinfo = agentInfo;
        // console.log(callinfo);
        if (status === 'todo') {
            callinfo.evaluationFormId = this.formId;
        } else if (status === 'inprogress' || status === 'in progress' || status === 'assigned') {
            callinfo.evaluationResponseId = this.evaluationId;
        }
        this.applicationStateService.selectedCallInfo.next(callinfo);
        this.startAudio();
    }

    startAudio() {
        if (this.callDetails.audiofileurl) {
            this.audioPlayerService.audios = this.callDetails['audiofileurl'];
            this.audioPlayerService.audioUrl = decodeURIComponent(this.callDetails.audiofileurl[0]['url']);
            this.audioPlayerService.startPlaying();
        }
    }

    // setLineItemScoreValue(groupid: number, questionid: number, squestionid: number, value: string, scoreoptions: any) {
    //     try {
    //         this.resetLineItemsSelectAllHeader(groupid, questionid, value);
    //         this.questiongroups.find(g => g.groupid === groupid)
    //             .questions.find(q => q.questionid === questionid)
    //             .subgroups.map(sq => {
    //                 if (sq.questionid === squestionid) {
    //                     sq.value = value;
    //                     if (sq.score) {
    //                         sq.selectedscore = (+sq.weightage * sq.score[value]) / 100;
    //                     }
    //                 }
    //             });
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // resetLineItemsSelectAllHeader(groupid: number, questionid: number, value: string) {
    //     try {
    //         const question = this.questiongroups.find(g => g.groupid === groupid)
    //             .questions.find(q => q.questionid === questionid);
    //         question.value = question.value === value ? value : '';
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // calculateFailureCount(groupid: number) {
    //     try {
    //         let count = 0;
    //         const grp = this.questiongroups.find(g => g.groupid === groupid);
    //         grp.questions.forEach(q => {
    //             if (q.questiontype === 'lineitems') {
    //                 q.subgroups.forEach(sq => {
    //                     if (sq.value && sq.value.toLowerCase() === 'yes') {
    //                         count = count + 1;
    //                     }
    //                 });
    //             }
    //         });
    //         return count;
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // getGroupScore(groupid: number) {
    //     try {
    //         let total = 0;
    //         let actual = 0;
    //         const grp = this.questiongroups.find(g => g.groupid === groupid);
    //         if (grp.percentage) {
    //             grp.questions.forEach(q => {
    //                 if (q.questiontype === 'lineitems') {
    //                     q.subgroups.forEach(sq => {
    //                         if (sq.score && sq.selectedscore) {
    //                             total = total + +sq.weightage;
    //                             actual = actual + sq.selectedscore;
    //                         }
    //                     });
    //                 } else {
    //                     if (q.score && q.selectedscore) {
    //                         total = total + +q.weightage;
    //                         actual = actual + q.selectedscore;
    //                     }
    //                 }
    //             });
    //         }
    //         this.questiongroups.find(g => g.groupid === groupid).scorepercentage = total;
    //         this.questiongroups.find(g => g.groupid === groupid).actualpercentage = total;
    //         return total;
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // getTotalPercentage() {
    //     try {
    //         let total = 0;
    //         this.questiongroups.forEach(group => {
    //             if (group.groupmode && group.groupmode.toLowerCase() === 'auto-failure') {
    //                 group.questions.forEach(q => {
    //                     if (q.questiontype === 'lineitems') {
    //                         q.subgroups.forEach(sq => {
    //                             if (sq.value && sq.value.toLowerCase() === 'yes') {
    //                                 total = -400;
    //                             }
    //                         });
    //                     }
    //                 });
    //             } else {
    //                 if (group.percentage) {
    //                     if (group.actualpercentage) {
    //                         const multiplier = this.getGroupPercentByName(group);
    //                         total = total + (group.actualpercentage * multiplier);
    //                     } else {
    //                         const value = this.getGroupScore(group.groupid);
    //                         total = total + value;
    //                     }
    //                 }
    //             }
    //         });
    //         return total < 0 ? 0 : total;
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // getGroupPercentByName(questiongroup: EvaluationQuestionGroup) {
    //     try {
    //         if (questiongroup.groupname.toUpperCase().includes('COMPLIANCE')) {
    //             return 0.30;
    //         }
    //         if (questiongroup.groupname.toUpperCase().includes('CUSTOMER EXPERIENCE')) {
    //             return 0.70;
    //         }
    //         return 1;
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    // setGroupAndQuestionScore() {
    //     try {
    //         this.questiongroups.map(group => {
    //             if (group.percentage) {
    //                 group.questions.map(question => {
    //                     if (question.questiontype === 'lineitems') {
    //                         question.value = '';
    //                         question.subgroups.map(squestion => {
    //                             squestion.selectedscore = squestion.score[squestion.value];
    //                         });
    //                     }
    //                 });
    //             }
    //             group.actualpercentage = this.getGroupScore(group.groupid);
    //         });
    //     } catch (e) {
    //         this.errorService.logUnknownError(e);
    //     }
    // }

    onFormSubmit(event) {
        this.result = {
            question: event.question,
            group: event.group,
            totalscore: event.totalScore
        }
        setTimeout(() => {
            this.surveyform = event.form ? event.form : this.surveyform;
        }, 5);
    }

    onSubmit(status) {
        try {
            this.objEvaluationForm.status = status;
            if (status !== 'inprogress') {
                const dialogRef = this.dialog.open(TagconfirmationComponent, {
                    width: '600px',
                    disableClose: true,
                    data: {
                        status_id: this.objAllowedTransition ? this.objAllowedTransition.TransitionId : 0
                    }
                });
                dialogRef.afterClosed().takeWhile(() => this.alive).subscribe(result => {
                    if (result) {
                        this.objSelectedPriority = result['priority'];
                        this.objSelectedAuditTags = result['audittags'];
                        this.objGivenComments = result['comments'];
                        this.createSurvey(this.result.question, this.result.group);
                    }
                });
            } else {
                this.createSurvey(this.result.question, this.result.group);
            }
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    // showTotalScore(event) {
    //     console.info(event)
    //     this.overAllScore = event.percentage;
    // }

    ngOnDestroy() {
        try {
            this.alive = false;
            // tslint:disable-next-line:curly
            if (this.objFormvalueChangesSubscriber) this.objFormvalueChangesSubscriber.unsubscribe();
            this.applicationStateService.objEvaluationFormInprogress = false;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }
}
