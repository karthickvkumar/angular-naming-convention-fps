import { EvaluationQuestionGroup } from '../../../core-models/evaluationquestiongroup';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApplicationStateService } from '../../../core-services/app-services/applicationstate.service';
import { EvaluationForm, AllowedTransition } from '../../../core-models/evaluationform';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AcknowledgeModalComponent } from '../modals/acknowledge/acknowledge.modal';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEvaluationService } from '../services/view-evaluation.service';
import { ExcelService } from '../services/excel.service';
import { CommentsComponent } from '../modals/comments/comments.component';
import { NotificationService } from '../../../core-services/ui-services/notification.service';
import { PageLoaderService } from '../../../core-services/ui-services/page-loader.service';
import { ErrorHandlerService } from '../../../core-services/ui-services/error-handler.service';
import { CallInfo } from '../../../core-models/callinfo';
import { AudioPlayerService } from '../../../core-services/ui-services/audio-player.service';
import { DisputeComponent } from '../modals/dispute/dispute.component';
import { DisputeReviewComponent } from '../modals/dispute-review/dispute-review.component';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ViewWorkflowComponent } from '../modals/view-workflow/view-workflow.component';
import { AdminReleaseComponent } from '../modals/admin-release/admin-release.component';
import { ViewPreviousEvaluationComponent } from 'src/app/core-components/view-previous-evaluation/view-previous-evaluation.component';

declare var require: any;
@Component({
    templateUrl: './view-evaluation.page.html',
    styleUrls: ['./view-evaluation.page.css']
})
export class ViewEvaluationPageComponent implements OnInit, OnDestroy {

    objEvaluationForm: EvaluationForm;
    objShowQuestionGroups: EvaluationQuestionGroup[];
    objCallid: string;
    objAgentName: string;
    objHideAcknowledge = false;
    objHideComments = true;
    objDisableAcknowledge = false;
    objDisableDispute = false;
    objHideExport = false;
    varComment: string;
    varCommentDateTime: string;
    loggedInUser: any;
    evaluationId: number;
    disableAcknowledge = false;
    disableDispute = false;
    disableAdminRelease = false;
    backToUrl: string;
    showPage = false;
    showPdfDownload = false;
    showExcelDownload = false;
    alive = true;
    objAuditType = '';
    objAuditTag = '';
    objTransition: any;
    isAcknowledgeVisible: boolean;
    isActionButtonVisible: boolean;
    objActionButtonName = '';
    objAllowedTransition: AllowedTransition;
    access_from: '';

    historyButton: boolean;
    isDisputeVisible: boolean;
    isViewStatusVisible: boolean;
    dropStatusObj;
    predecessor_id;
    showPreviousEval = false;
    constructor(
        private appState: ApplicationStateService,
        private showEvaluationService: ViewEvaluationService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private excelService: ExcelService,
        private notificationService: NotificationService,
        private pageLoaderService: PageLoaderService,
        private errorService: ErrorHandlerService,
        private audioService: AudioPlayerService
    ) { }

    ngOnInit() {
        try {
            this.getRouteParams();
            this.getSubmittedEvaluationForm();
            // this.appState.returnUrl = '/acknowledgecalls';
            this.showExcelDownload = this.appState.isOperationAvailable('exceldownload');
            this.showPdfDownload = this.appState.isOperationAvailable('pdfdownload');
            this.pageLoaderService.getSubscription().subscribe(value => {
                this.showPage = !value;
            });
            this.loggedInUser = this.appState.loggedInUser;

        } catch (e) {
            console.error(e);
        }
    }

    setupInitialValues() {
        try {
            this.showExcelDownload = this.appState.isOperationAvailable('exceldownload');
            this.showPdfDownload = this.appState.isOperationAvailable('pdfdownload');
            this.pageLoaderService.getSubscription().subscribe(value => {
                this.showPage = !value;
            });

            this.loggedInUser = this.appState.loggedInUser;
            const role = this.loggedInUser.role.trim().toLowerCase();
            const isCommentsViewable = this.appState.isOperationAvailable('viewcomment');
            const isAcknowledgeOperation = this.appState.isOperationAvailable('acknowledge');
            this.objHideAcknowledge = !isAcknowledgeOperation;
            this.objHideComments = !isCommentsViewable;
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
    createCallInfo() {
        const callinfo = new CallInfo();
        const calldetails = this.objEvaluationForm['calldetails'];
        if (calldetails && calldetails != null) {
            const calldatetime = `${calldetails.created_at}`.split(':').join('-').split(' ').join('_');
            const agentInfo = `${calldetails.agentname}_${calldatetime}`;
            if (calldetails.audiofileurl) {
                callinfo.audioUrl = calldetails.audiofileurl[0]['url'];
            }
            callinfo.agentName = calldetails.agentname;
            callinfo.callId = calldetails.callid;
            callinfo.agentinfo = agentInfo;
        } else {
            const agentInfo = `${this.objEvaluationForm.agentname}_no_call_date_time`;
            callinfo.audioUrl = '';
            callinfo.agentName = '';
            callinfo.callId = '';
            callinfo.agentinfo = agentInfo;
        }
        callinfo.isEvaluationEditor = true;
        callinfo.evaluationStatus = 'submitted';
        callinfo.searchFilter = null;
        this.appState.selectedCallInfo.next(callinfo);

        if (calldetails && calldetails != null && calldetails.audiofileurl) {
            this.audioService.audioUrl = calldetails.audiofileurl[0]['url'];
            this.audioService.audios = calldetails['audiofileurl'];
            this.audioService.startPlaying();
        }
    }

    getRouteParams() {
        try {
            this.route.params.subscribe(paramValues => {
                if (paramValues['id'] && this.evaluationId !== paramValues['id']) {
                    this.evaluationId = +paramValues['id'];
                    this.route.queryParams.subscribe(queryValues => {
                        this.backToUrl = queryValues['from'];
                        this.access_from = queryValues['access_from'];
                    });
                    this.getSubmittedEvaluationForm();

                } else {
                    this.evaluationId = +paramValues['id'];
                    this.route.queryParams.subscribe(queryValues => {
                        this.backToUrl = queryValues['from'];
                        this.access_from = queryValues['access_from'];
                    });
                }
            });


        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getSubmittedEvaluationForm() {
        try {
            this.pageLoaderService.displayPageLoader(true);
            this.showEvaluationService.getEvaluationForm(this.evaluationId, this.access_from).takeWhile(() => this.alive)
                .pipe(
                    finalize(() => {
                        this.pageLoaderService.displayPageLoader(false);
                    }),
                ).subscribe(
                    data => {
                        if (data && data['evaluationcallresults']) {
                            this.objEvaluationForm = new EvaluationForm();
                            const postscore = data['evaluationcallresults'][0];
                            this.dropStatusObj = this.toObject(postscore['allowed_transition']);
                            const postevaluation = data[1];
                            const poststatus = data[2];
                            this.objTransition = {
                                'transition_id': postscore['allowed_transition']['TransitionId'],
                                'status_id': ''
                            };
                            // if (this.objEvaluationForm.status === 'dispute') {
                            //     this.objTransition['status_id'] = dropStatusObj['Dispute'];
                            // } else {
                            //     this.objTransition['status_id'] = dropStatusObj['Acknowledge'];
                            // }
                            // console.log(typeof postscore['allowed_transition']);
                            // console.log(postscore['allowed_transition'].length);
                            if (!Array.isArray(postscore['allowed_transition'])) {
                                this.objAllowedTransition = postscore['allowed_transition'];
                            }
                            // && this.objAllowedTransition.ButtonLabel.includes('Acknowledge' || 'Dispute')
                            //     if (this.objAllowedTransition.ButtonLabel.includes('Accept' || 'Reject')) {
                            //         this.historyButton = true;
                            //     } else {
                            //         this.historyButton = false;
                            //     }
                            // } else {
                            //     this.isActionButtonVisible = false;
                            //     this.historyButton = true;

                            if (this.objAllowedTransition) {
                                this.isActionButtonVisible = true;
                            }

                            this.isAcknowledgeVisible = ((parseInt(postscore['status']['id'])) >= 3) &&
                                this.checkKeyPresence(postscore['allowed_transition'], 'Acknowledge');
                            this.isViewStatusVisible =
                                !this.checkKeyPresence(postscore['allowed_transition'], 'Acknowledge') &&
                                !this.checkKeyPresence(postscore['allowed_transition'], 'Dispute');
                            this.isDisputeVisible = (((parseInt(postscore['status']['id'])) === 3 ? true : false)
                                && postscore['allow_dispute'].toLowerCase().trim() === 'true') &&
                                this.checkKeyPresence(postscore['allowed_transition'], 'Dispute');
                            this.objEvaluationForm.status = postscore['status'];
                            this.objEvaluationForm.questiongroups = postscore['answers']['questiongroups'];
                            this.objEvaluationForm.group_score = postscore['group_score'];
                            this.objEvaluationForm.finalscore = postscore['final_score'];
                            this.objEvaluationForm.ratings = postscore['ratings'];
                            this.objEvaluationForm.description = postscore['evaluation_form']['title'];
                            this.objEvaluationForm.severity_name = postscore['severity_name'];
                            this.objEvaluationForm.evaluation_disposition_name = postscore['evaluation_disposition_name'];
                            this.objEvaluationForm.calldetails = postscore['call_details'];
                            this.objEvaluationForm.calldetails['agentname'] = postscore['agent_name'];
                            this.objEvaluationForm.calldetails['created_at'] = postscore['created_at'];
                            this.objEvaluationForm.headers = postscore['headers'];
                            this.objEvaluationForm.call_id = postscore['call_id'];
                            this.objEvaluationForm.allow_dispute = postscore['allow_dispute'];
                            this.objEvaluationForm.agentid = postscore['agent_id'];
                            this.predecessor_id = postscore['predecessor_id'];
                            this.objEvaluationForm.assigned_to = postscore['assigned_to'];
                            if (this.predecessor_id) {
                                this.showPreviousEval = true;
                            } else {
                                this.showPreviousEval = false;
                            }

                            // tslint:disable-next-line:max-line-length
                            const canAcknowledge = (this.appState.isOperationAvailable('acknowledge') || this.appState.isOperationAvailable('dispute'));
                            this.objHideAcknowledge = !canAcknowledge;
                            // tslint:disable-next-line:max-line-length
                            this.disableAcknowledge = postscore['status_id'] === '4' || postscore['status_id'] === '5';

                            this.createCallInfo();
                            this.showPage = true;
                        }
                    },
                    error => {
                        this.errorService.logUnknownError(error);
                    }
                );

        } catch (e) {
            this.errorService.logUnknownError(e);
        } finally {
            // this.pageLoaderService.displayPageLoader(false);
        }
    }

    checkActionButtonVisible() {

    }

    checkKeyPresence(postscore, val) {
        if (postscore && postscore.length !== 0 && postscore['ButtonLabel'].includes(val)) {
            return true;
        } else {
            return false;
        }
    }
    toObject(transitionVal) {
        if (transitionVal && transitionVal.length !== 0) {
            const values = transitionVal['DropStatus'];
            const names = transitionVal['ButtonLabel'];
            const result = {};
            for (let i = 0; i < names.length; i++) {
                result[names[i]] = values[i];
            }
            return result;
        }
    }
    onShowComments(buttonVal?: string) {
        let buttonLabel = '';
        try {
            if (buttonVal) {
                buttonLabel = buttonVal;
            } else if (this.objAllowedTransition) {
                buttonLabel = this.objAllowedTransition.DropStatus[0];
            } else {
                buttonLabel = '10';
            }
            const dialogRef = this.dialog.open(ViewWorkflowComponent, {
                width: '900px',
                disableClose: true,
                data: {
                    evaluationId: this.evaluationId,
                    objAllowedTransition: this.objAllowedTransition,
                    isActionButtonVisible: this.isActionButtonVisible,
                    objbuttonLabel: buttonLabel,
                    statusID: this.objEvaluationForm.status['id'],
                    assigned_to: this.objEvaluationForm.assigned_to
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.isActionButtonVisible = false;
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onAcknowledge() {
        try {
            this.objTransition['status_id'] = this.dropStatusObj['Acknowledge'];
            const dialogRef = this.dialog.open(AcknowledgeModalComponent, {
                width: '600px',
                data: { 'evaluationid': this.evaluationId, 'objTransition': this.objTransition }
            });
            dialogRef.afterClosed().subscribe(result => {
                this.disableAcknowledge = result;
                if (result) {
                    this.goBack();
                    this.getSubmittedEvaluationForm();
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onDispute() {
        try {
            this.objTransition['status_id'] = this.dropStatusObj['Dispute'];
            const dialogRef = this.dialog.open(DisputeComponent, {
                width: '600px',
                data: { evaluationid: this.evaluationId, 'objTransition': this.objTransition }
            });
            dialogRef.afterClosed().subscribe(result => {
                this.disableDispute = result;
                if (result) {
                    this.getSubmittedEvaluationForm();
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onReviewDispute() {
        try {
            const dialogRef = this.dialog.open(DisputeReviewComponent, {
                width: '600px',
                data: { evaluationid: this.evaluationId }
            });
            dialogRef.afterClosed().subscribe(result => {
                this.disableDispute = result;
                if (result) {
                    this.goBack();
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onAdminRelease() {
        try {
            const dialogRef = this.dialog.open(AdminReleaseComponent, {
                width: "600px",
                disableClose: true,
                //data: { evaluationid: this.evaluationId }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.disableAdminRelease = true;
                    this.showEvaluationService.adminRelease(this.evaluationId)
                        .takeWhile(() => this.alive)
                        .subscribe(data => {
                            this.getSubmittedEvaluationForm();
                        });
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getGroupScore(groupid: number) {
        try {
            if (this.objEvaluationForm.group_score) {
                return this.objEvaluationForm.group_score.find(x => +x.groupid === groupid);
            } else {
                return undefined;
            }
        } catch (e) {
            this.errorService.logUnknownError(e);
            return undefined;
        }
    }

    goBack() {
        try {
            this.pageLoaderService.displayPageLoader(true);
            const url = this.backToUrl === null || this.backToUrl === undefined || !this.backToUrl ? 'callsearch' : this.backToUrl;
            this.router.navigateByUrl(`/${url}`);
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    downloadExcel() {
        try {
            this.excelService.exportSurveyToExcel(this.objEvaluationForm);
            this.notificationService.displayToaster('Excel downloaded successfully');
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    downloadAsPdf() {
        try {
            /// <reference types="node" />
            const jsPDF = require('jspdf');
            /// <reference types="node" />
            require('jspdf-autotable');
            const styles = {
                cellPadding: 3, // a number, array or object (see margin below)
                fontSize: 10,
                font: 'helvetica', // helvetica, times, courier
                fontStyle: 'normal', // normal, bold, italic, bolditalic
                overflow: 'linebreak', // visible, hidden, ellipsize or linebreak
                halign: 'left', // left, center, right
                valign: 'middle', // top, middle, bottom
                // columnWidth: 'auto' // 'auto', 'wrap' or a number
            };
            const doc = new jsPDF();
            doc.setFontType('bold');
            doc.text(10, 10, this.objEvaluationForm.description);
            doc.setTextColor('#00A65A');
            doc.text(doc.internal.pageSize.getWidth() - 40, 10, `${this.objEvaluationForm.finalscore} %`);

            doc.setFontSize(12);
            switch (this.objEvaluationForm.severity_name.toLowerCase()) {
                case 'high': {
                    doc.setTextColor('#F52C2C');
                    break;
                }
                case 'medium': {
                    doc.setTextColor('#FFBD13');
                    break;
                }
                case 'medium': {
                    doc.setTextColor('#25B93D');
                    break;
                }
            }
            doc.text(doc.internal.pageSize.getWidth() - 100, 10, `${this.objEvaluationForm.evaluation_disposition_name}`);
            doc.setTextColor('#000000');
            doc.line(0, 15, doc.internal.pageSize.getWidth(), 15);
            doc.setFontType('normal');
            doc.setFontSize(14);
            doc.text(10, 30, 'Basic Info');
            let line = 40;
            const tableRows = [];
            this.objEvaluationForm.headers.forEach(h => {
                const value = !h.value || h.value === null || h.value === undefined ? '' : h.value;
                tableRows.push([h.name, value]);
            });
            // tableRows.push(['Evaluated by', this.objEvaluationForm.evaluatorname]);
            doc.autoTable(['name', 'row'], tableRows, {
                startY: line,
                drawHeaderRow: function (row, data) {
                    return false;
                },
                theme: 'grid',
                columnStyles: {
                    0: { columnWidth: 40 },
                    1: { columnWidth: 80 }
                },
                margin: { horizontal: 10 }
            });

            line = doc.autoTable.previous.finalY + 10;
            this.objEvaluationForm.questiongroups.forEach(g => {
                line = line + 10;
                switch (g.groupmode.trim().toLowerCase()) {
                    case 'default': {
                        doc.text(10, line, `${g.groupname} - Score ${+(this.getGroupScore(g.groupid).obscore).toFixed(1)}%`);
                        break;
                    }
                    case 'auto-failure': {
                        doc.text(10, line, `${g.groupname} - Count ${+(this.getGroupScore(g.groupid).obscore)}`);
                        break;
                    }
                    default: {
                        doc.text(10, line, `${g.groupname}`);
                    }
                }
                if (g.groupmode.trim().toLowerCase() === 'no-score') {
                    line = line + 10;
                    const ttableRows = [];
                    g.questions.forEach(q => {
                        const value = !q.value || q.value === null || q.value === undefined ? '' : q.value;
                        ttableRows.push([q.questiontitle, value]);
                    });
                    doc.autoTable(['name', 'row'], ttableRows, {
                        startY: line,
                        drawHeaderRow: function (row, data) {
                            return false;
                        },
                        theme: 'grid',
                        columnStyles: {
                            0: { columnWidth: 40 },
                            1: { columnWidth: 80 }
                        },
                        margin: { horizontal: 10 }
                    });

                    line = doc.autoTable.previous.finalY + 10;
                } else {
                    g.questions.forEach(q => {
                        line = line + 10;
                        const tableDatas = [];
                        const tableColumns = [q.questiontitle, 'Answer', 'Comment'];
                        // console.log(q);
                        // console.log(q.subgroups);
                        q.subgroups.forEach(sq => {
                            const tableData = [sq.questiontitle, sq.value, sq.comment];
                            tableDatas.push(tableData);
                        });
                        doc.autoTable(tableColumns, tableDatas, {
                            startY: line,
                            styles: styles,
                            theme: 'grid',
                            headerStyles: {
                                textColor: '#ffffff',
                                fillColor: '#3c8dbc'
                            },
                            columnStyles: {
                                0: { columnWidth: 90 },
                                1: { columnWidth: 30 },
                                2: { columnWidth: 60 }
                            },
                            margin: { horizontal: 10 }
                        });
                        line = doc.autoTable.previous.finalY + 10;
                    });
                }
            });
            doc.setFontSize(8);
            const pageCount = doc.internal.getNumberOfPages();
            let lineheight = doc.internal.pageSize.getHeight();

            let calldatetime = `no_date_time`;
            let filename = `${this.objEvaluationForm.calldetails['agentname']}_${this.objEvaluationForm.calldetails['created_at']}`;

            // tslint:disable-next-line:max-line-length
            const calldetails = this.objEvaluationForm['calldetails'];
            if (calldetails && calldetails != null) {
                calldatetime = `${calldetails.callenddatetime}`.split(':').join('-').split(' ').join('_');
                filename = `${this.objEvaluationForm.calldetails['agentname']}_${this.objEvaluationForm.calldetails['created_at']}`;
            }

            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                lineheight = lineheight - 5;
                doc.text(5, doc.internal.pageSize.getHeight() - 5, filename);
                doc.text(doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 5, `Page ${i} of ${pageCount}`);
                lineheight = lineheight + doc.internal.pageSize.getHeight();
            }
            doc.save(`${filename}.pdf`);
            this.snackBar.open('PDF downloaded successfully', null, {
                duration: 2000
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getAllSavedData(response: any[]): Observable<any> {
        return forkJoin(response);
    }

    ngOnDestroy(): void {
        try {
            this.alive = false;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }
}
