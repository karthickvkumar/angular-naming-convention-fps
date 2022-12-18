import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEvaluationService } from '../../services/view-evaluation.service';
import { ApplicationStateService } from '../../../../core-services/app-services/applicationstate.service';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';
@Component({
    templateUrl: './acknowledge.modal.html',
    styleUrls: ['./acknowledge.modal.css']
})
export class AcknowledgeModalComponent implements OnInit {
    comment: string;
    evaluationid: number;
    userid: string;
    userRole: string;
    constructor(
        public appState: ApplicationStateService,
        private viewEvaluationService: ViewEvaluationService,
        private snackBar: MatSnackBar,
        private errorService: ErrorHandlerService,
        public dialogRef: MatDialogRef<AcknowledgeModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }
    ngOnInit() {
        try {
            this.userRole = this.appState.loggedInUser.role.trim().toLowerCase();
            this.userid = this.appState.loggedInUser.dim_user_id;
            this.evaluationid = this.data.evaluationid;
        } catch (e) {
            console.error(e);
            this.errorService.logUnknownError(e);
        }
    }

    onAcknowledge(value) {
        try {
            this.viewEvaluationService.acknowledgeEvaluation(this.evaluationid, this.comment, value)
                .subscribe(d => {
                    // const message = value === 'acknowledge' ? : 'Dispute has been noted';
                    this.snackBar.open('Updated Successfully', null, { duration: 200 });
                    this.dialogRef.close(true);
                });
        } catch (e) {
            console.error(e);
            this.errorService.logUnknownError(e);
        }
    }

    isOperationAvailable() {
        return this.appState.isOperationAvailable('acknowledge');
    }

    onCancel() {
        try {
            this.dialogRef.close(false);
        } catch (e) {
            console.error(e);
            this.errorService.logUnknownError(e);
        }
    }
}
