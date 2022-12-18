import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEvaluationService } from '../../services/view-evaluation.service';
import { ApplicationStateService } from '../../../../core-services/app-services/applicationstate.service';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';
import { finalize } from 'rxjs/operators';
import { AllowedTransition } from 'src/app/core-models/evaluationform';
import * as utils from 'lodash';
@Component({
  selector: 'app-view-workflow',
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.css']
})
export class ViewWorkflowComponent implements OnInit, OnDestroy {
  agentName: string;
  commentStartTime: string;
  comment: string;
  evaluationId: number;

  alive = true;
  showLoading = false;
  objLstComments;
  objAllowedTransition: AllowedTransition;
  isActionButtonVisible: boolean;
  isActionButtonNum: number;
  buttonVal: string;
  disputeEvalHeading;
  isLoader: boolean;
  status_list: any;
  analystList;
  objSelectedAnalyst;
  isAssigned: boolean = false;
  objCommentStatus = false;
  newEvalId;
  assignedQA;
  isYTBVisible = false;
  actionClicked = false;
  assigned_to = '';
  pending_with = '';
  isAcceptClicked = false;
  constructor(
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ViewWorkflowComponent>,
    private applicationStateService: ApplicationStateService,
    private errorService: ErrorHandlerService,
    private viewEvaluationService: ViewEvaluationService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    try {
      this.status_list = this.applicationStateService.status_list;
      this.objAllowedTransition = this.data.objAllowedTransition;
      this.buttonVal = this.data.objbuttonLabel;
      // this.commentText = this.data.commentText;
      this.evaluationId = this.data.evaluationId;
      if (this.data.assigned_to && this.data.assigned_to.trim() !== '') {
        this.assigned_to = this.data.assigned_to;
        // this.objSelectedAnalyst = this.data.assigned_to;
      }
      this.isLoader = true;
      // this.isActionButtonVisible = this.actionButtonVisibility(this.data.isActionButtonVisible);
      this.isActionButtonVisible = this.actionButtonVisibility(this.data.isActionButtonVisible);
      this.isActionButtonNum = 1;
      // if (!this.data.objAllowedTransition) {
      //   this.getEvalDetails();
      // }
      this.getAnalysts();
      this.disputeEvalHeading = this.disputeHeading(this.buttonVal);
      this.getAllComments();

    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  }
  getAnalysts() {
    this.viewEvaluationService.getAnalysts()
      .takeWhile(() => this.alive).
      subscribe(data => {
        this.analystList = data;
        this.objSelectedAnalyst = this.analystList.find(elem => elem.eid == this.data.assigned_to);
      });
  }

  disputeHeading(buttonVal) {
    // switch (buttonVal) {
    //   case '4': {
    if (buttonVal === '10') {
      return { id: '10', name: 'Acknowledge' };
    } else {
      return this.status_list.find(el => el.id === buttonVal);
    }
    //   case '5': {
    //     return 'Dispute';
    //   }
    //   case '6': {
    //     return 'Review Dispute';
    //   }
    //   case '7': {
    //     return 'Review Dispute';
    //   }
    //   case '10': {
    //     return 'Acknowledge';
    //   }
    //   case '8': {
    //     return 'Dispute Accepted';
    //   }
    //   default: {
    //     return 'Acknowledge'
    //   }
    // }
  }

  actionButtonVisibility(val) {
    const buttonValue = parseInt(this.buttonVal);
    if (val) {
      return val;
    } else if (buttonValue >= 6) {
      return false;
    } else if (this.objAllowedTransition.ButtonLabel.includes('Accept' || 'Reject')) {
      return true;
    } else {
      return false;
    }
  }

  getAllComments() {
    try {
      this.viewEvaluationService.getComments('evaluation', this.evaluationId)
        .takeWhile(() => this.alive)
        .pipe(
          finalize(() => {
            this.showLoading = false;
            this.isLoader = false;
          }),
        ).subscribe(
          data => {
            this.pending_with = data['pending'][0];
            if (data && Array.isArray(data['comments'])) {
              this.objLstComments = utils.sortBy(data['comments'], [function (o) { return o.date; }]);
              this.isYTBVisible = false;
            } else if (this.data.statusID == 3 && !this.data.isActionButtonVisible) {
              this.isYTBVisible = true;
            }
          },
          error => {
            this.errorService.logUnknownError(error);
          }
        );

    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  }
  dropVal(status) {
    switch (status) {
      case 'agent_acknowledge': {
        return '10';
      }
      case 'acknowledge': {
        return '4';
      }
      case 'dispute': {
        return '5';
      }
      case 'reject': {
        return '7';
      }
      case 'accept': {
        return '6';
      }
      case 'assign': {
        return '8';
      }
    }
  }

  onSubmitButtonClicked(status, action = false) {
    try {
      this.actionClicked = true;
      if (status === 'accept' || status === 'reject') {
        this.isAcceptClicked = true;
        this.objCommentStatus = true;
      }
      this.viewEvaluationService.acknowledgeEvaluation(this.evaluationId, this.comment, 'evaluation')
        .takeWhile(() => this.alive)
        .subscribe(response => {
          // const dropVal = status === 'acknowledge' ? 0 : 1;
          const dropVal = this.dropVal(status);
          const transitionObj = {};
          transitionObj['status_id'] = dropVal;
          transitionObj['comment_id'] = response['id'];
          this.viewEvaluationService.saveTransition(this.evaluationId, this.objAllowedTransition.TransitionId, transitionObj)
            .takeWhile(() => this.alive)
            .subscribe(data => {
              // this.getEvalDetails();
              this.newEvalId = data['eval_id'];
              this.getAllComments();
              this.isActionButtonVisible = action;
              this.objCommentStatus = true;
              this.isAcceptClicked = false;
              this.isActionButtonNum++;
              if (status === 'reject') {
                this.buttonVal = '7';
              }
            });
          this.snackBar.open('Comment Updated Successfully', null, { duration: 200 });
          // this.dialogRef.close(true);
        });

    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
      this.actionClicked = false;
      this.isAcceptClicked = false;


    }
  }
  // getEvalDetails() {
  //   this.isLoader = true;
  //   this.viewEvaluationService.getEvaluationForm(this.evaluationId)
  //     .takeWhile(() => this.alive)
  //     .subscribe(res => {
  //       if (res) {
  //         this.reInitiateValues(res['evaluationcallresults'][0]);
  //       } else {
  //         this.isLoader = false;

  //       }
  //     });
  // }
  onCancel() {
    try {
      this.dialogRef.close(this.objCommentStatus);
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
  reInitiateValues(data) {
    this.objAllowedTransition = data['allowed_transition'];
    // if (this.objAllowedTransition.length === 0) {
    this.buttonVal = '0';
    this.disputeEvalHeading = this.disputeHeading(this.buttonVal);
    this.isLoader = false;

    // }
  }

  changeAnalyst() {

  }
  onAssignQA() {
    try {
      this.actionClicked = false;
      this.viewEvaluationService.assignQA(this.newEvalId, this.objSelectedAnalyst.eid).takeWhile(() => this.alive)
        .subscribe(res => {
          if (res) {
            this.isAssigned = true;
            this.isActionButtonNum++;
            this.assignedQA = this.analystList.find(elem => elem.eid == this.objSelectedAnalyst.eid);
          }
        });
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
      this.actionClicked = true;

    }
  }
}
