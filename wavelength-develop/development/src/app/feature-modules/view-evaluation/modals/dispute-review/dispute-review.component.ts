import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEvaluationService } from '../../services/view-evaluation.service';
import { ApplicationStateService } from '../../../../core-services/app-services/applicationstate.service';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';


@Component({
  selector: 'app-dispute-review',
  templateUrl: './dispute-review.component.html',
  styleUrls: ['./dispute-review.component.css']
})
export class DisputeReviewComponent implements OnInit, OnDestroy {
  agentName: string;
    commentStartTime: string;
    commentText: string;


  comment: string;
  evaluationid: number;
  userid: string;
  userRole: string;
  alive = true;

  constructor(
    public appState: ApplicationStateService,
    private viewEvaluationService: ViewEvaluationService,
    private snackBar: MatSnackBar,
    private errorService: ErrorHandlerService,
    public dialogRef: MatDialogRef<DisputeReviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit() {
    try {
      this.userRole = this.appState.loggedInUser.role.trim().toLowerCase();
      this.userid = this.appState.loggedInUser.dim_user_id;
      this.evaluationid = this.data.evaluationid;

      this.agentName = this.data.agentName;
            this.commentStartTime = this.data.commentStartTime;
            this.commentText = this.data.commentText;
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  }

  onAcknowledge(value) {
    try {
      this.viewEvaluationService.disputeEvaluation(this.evaluationid, this.comment, value)
        .takeWhile(() => this.alive)
        .subscribe(d => {
          // const message = value === 'acknowledge' ? : 'Dispute has been noted';
          // this.snackBar.open('Updated Successfully', null, { duration: 200 });
          this.dialogRef.close(true);
        });
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  }

  /* onCancel() {
    try {
      this.dialogRef.close(false);
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  } */

  ngOnDestroy(): void {
    try {
      this.alive = false;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}
