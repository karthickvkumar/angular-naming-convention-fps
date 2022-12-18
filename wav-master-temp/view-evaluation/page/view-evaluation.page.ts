import { EvaluationQuestionGroup } from '../../../core-models/evaluationquestiongroup';
import { Component, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../../core-services/app-services/applicationstate.service';
import { EvaluationForm } from '../../../core-models/evaluationform';
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

declare var require: any;
@Component({
    templateUrl: './view-evaluation.page.html',
    styleUrls: ['./view-evaluation.page.css']
})
export class ViewEvaluationPageComponent implements OnInit {
    objEvaluationForm: EvaluationForm;
    objShowQuestionGroups: EvaluationQuestionGroup[];
    objCallid: string;
    objAgentName: string;
    objHideAcknowledge = false;
    objHideComments = true;
    objDisableAcknowledge = false;
    objHideExport = false;
    varComment: string;
    varCommentDateTime: string;
    loggedInUser: any;
    evaluationId: number;
    disableAcknowledge = false;
    backToUrl: string;
    showPage = false;
    showPdfDownload = false;
    showExcelDownload = false;

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
            this.setupInitialValues();
            this.getRouteParams();
            this.getSubmittedEvaluationForm();
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

    createCallInfo() {
        const callinfo = new CallInfo();
        const calldetails = this.objEvaluationForm['calldetails'];
        if (calldetails && calldetails != null) {
            const calldatetime = `${calldetails.callstartdatetime}`.split(':').join('-').split(' ').join('_');
            const agentInfo = `${this.objEvaluationForm.agentname}_${calldatetime}`;
            callinfo.audioUrl = calldetails.audiofileurl;
            callinfo.agentName = calldetails.employee.agentname;
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

        if (calldetails && calldetails != null) {
            this.audioService.audioUrl = calldetails.audiofileurl;
            this.audioService.startPlaying();
        }
    }

    getRouteParams() {
        try {
            this.route.params.subscribe(paramValues => {
                this.evaluationId = +paramValues['id'];
            });

            this.route.queryParams.subscribe(queryValues => {
                this.backToUrl = queryValues['from'];
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getSubmittedEvaluationForm() {
        try {
            this.showEvaluationService.getEvaluationForm(this.evaluationId)
                .subscribe(d => {
                    this.objEvaluationForm = d;
                    // tslint:disable-next-line:max-line-length
                    const canAcknowledge = (this.appState.isOperationAvailable('acknowledge') || this.appState.isOperationAvailable('dispute'));
                    this.objHideAcknowledge = !canAcknowledge;
                    // tslint:disable-next-line:max-line-length
                    this.disableAcknowledge = this.objEvaluationForm.acknowledged_status.toLowerCase() === 'acknowledged' || this.objEvaluationForm.acknowledged_status.toLowerCase() === 'disputed';
                    this.pageLoaderService.displayPageLoader(false);
                    this.createCallInfo();
                }, e => console.error(e));
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onShowComments() {
        try {
            this.dialog.open(CommentsComponent, {
                width: '600px',
                data: {
                    agentName: this.objEvaluationForm.acknowledgedusername, commentStartTime: '',
                    commentText: this.objEvaluationForm.commentbody
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onAcknowledge() {
        try {
            const dialogRef = this.dialog.open(AcknowledgeModalComponent, {
                width: '600px',
                data: { evaluationid: this.evaluationId }
            });
            dialogRef.afterClosed().subscribe(result => {
                this.disableAcknowledge = result;
                if (result) {
                    this.goBack();
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
            let filename = `${this.objEvaluationForm.agentname}_${calldatetime}`;

            // tslint:disable-next-line:max-line-length
            const calldetails = this.objEvaluationForm['calldetails'];
            if (calldetails && calldetails != null) {
                calldatetime = `${calldetails.callstartdatetime}`.split(':').join('-').split(' ').join('_');
                filename = `${this.objEvaluationForm.agentname}_${calldatetime}`;
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
                duration: 2000,
                horizontalPosition: 'right', verticalPosition: 'bottom'
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }
}
