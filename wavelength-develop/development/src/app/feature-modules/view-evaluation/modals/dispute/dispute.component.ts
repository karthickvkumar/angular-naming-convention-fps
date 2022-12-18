import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEvaluationService } from '../../services/view-evaluation.service';
import { ApplicationStateService } from '../../../../core-services/app-services/applicationstate.service';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';

@Component({
  selector: 'app-dispute',
  templateUrl: './dispute.component.html',
  styleUrls: ['./dispute.component.css']
})
export class DisputeComponent implements OnInit, OnDestroy {

  comment: string;
  evaluationid: number;
  userid: string;
  userRole: string;
  alive = true;
  objTransition: any;
  constructor(
    public appState: ApplicationStateService,
    private viewEvaluationService: ViewEvaluationService,
    private snackBar: MatSnackBar,
    private errorService: ErrorHandlerService,
    public dialogRef: MatDialogRef<DisputeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit() {
    try {
      this.userRole = this.appState.loggedInUser.role.trim().toLowerCase();
      this.userid = this.appState.loggedInUser.dim_user_id;
      this.evaluationid = this.data.evaluationid;
      this.objTransition = this.data.objTransition;
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  }

  onAcknowledge(value) {
    try {
      this.viewEvaluationService.acknowledgeEvaluation(this.evaluationid, this.comment, value)
        .takeWhile(() => this.alive)
        .subscribe(response => {
          // const message = value === 'acknowledge' ? : 'Dispute has been noted';
          const transitionObj = {};
          transitionObj['status_id'] = this.objTransition['status_id'];
          transitionObj['comment_id'] = response['id'];
          this.viewEvaluationService.saveTransition(this.evaluationid, this.objTransition['transition_id'], transitionObj)
            .takeWhile(() => this.alive)
            .subscribe(data => {
              console.log(data);
            });
          this.snackBar.open('Updated Successfully', null, { duration: 200 });
          this.dialogRef.close(true);
        });
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  }

  isOperationAvailable() {
    return this.appState.isOperationAvailable('dispute');
  }

  onCancel() {
    try {
      this.dialogRef.close(false);
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  }

  ngOnDestroy(): void {
    try {
      this.alive = false;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}
