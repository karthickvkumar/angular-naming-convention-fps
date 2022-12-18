import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';
import { CallEvaluationService } from '../../call-evaluation.service';
import { finalize } from 'rxjs/operators';
import { ApplicationStateService } from 'src/app/core-services/app-services/applicationstate.service';
import { Tags } from 'src/app/core-models/evaluationform';
import * as _ from 'lodash';

@Component({
  selector: 'app-tagconfirmation',
  templateUrl: './tagconfirmation.component.html',
  styleUrls: ['./tagconfirmation.component.css']
})
export class TagconfirmationComponent implements OnInit, OnDestroy {

  objSelectedPriority = '';
  objSelectedAuditTags = '';
  objlstPriority: Tags[] = [];
  objlstAuditTags: Tags[] = [];
  objlstAllDisposition: Tags[] = [];
  alive = true;
  showModel = false;
  objLoadinTags = false;
  comment;
  evaluationStatus;
  constructor(private errorService: ErrorHandlerService,
    private callEvaluationService: CallEvaluationService,
    private applicationStateService: ApplicationStateService,
    public dialogRef: MatDialogRef<TagconfirmationComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.evaluationStatus = this.data['status_id'];
    if (this.applicationStateService.objlstTags) {
      this.initData(this.applicationStateService.objlstTags);
    } else {
      this.objLoadinTags = true;
      this.callEvaluationService.getAllTags()
        .pipe(
          finalize(() => {
            this.objLoadinTags = false;
          })
        )
        .takeWhile(() => this.alive)
        .subscribe(data => {
          this.showModel = true;
          this.initData(data);
        });
    }
  }

  initData(data) {
    this.objlstAllDisposition = data;
    this.objlstPriority = _.uniqBy(this.objlstAllDisposition, function (e) { return e.severity; });
    this.applicationStateService.objlstTags = data;
  }

  onSubmit() {
    try {
      this.dialogRef.close({
        'priority': this.objSelectedPriority,
        'audittags': this.objSelectedAuditTags,
        'comments': this.comment
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onPriorityChange() {
    try {
      this.objSelectedAuditTags = '';
      this.objlstAuditTags = this.objlstAllDisposition.filter(x => x.severity === this.objSelectedPriority);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onCancel() {
    try {
      this.dialogRef.close(false);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  ngOnDestroy() {
    try {
      this.alive = false;
      // tslint:disable-next-line:curly
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}
