import { CommentsComponent } from './modals/comments/comments.component';
import { ViewEvaluationService } from './services/view-evaluation.service';
import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { ViewEvaluationPageComponent } from './page/view-evaluation.page';
import { ViewEvaluationRoutingModule } from './view-evaluation-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AcknowledgeModalComponent } from './modals/acknowledge/acknowledge.modal';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MomentModule } from 'ngx-moment';
import { ExcelService } from './services/excel.service';
import { DisputeComponent } from './modals/dispute/dispute.component';
import { DisputeReviewComponent } from './modals/dispute-review/dispute-review.component';
import { ViewWorkflowComponent } from './modals/view-workflow/view-workflow.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminReleaseComponent } from './modals/admin-release/admin-release.component';

@NgModule({
  imports: [
    CommonModule,
    ViewEvaluationRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MomentModule,
    MatProgressSpinnerModule,
    NgSelectModule
  ],
  declarations: [
    ViewEvaluationPageComponent,
    AcknowledgeModalComponent,
    CommentsComponent,
    DisputeComponent,
    DisputeReviewComponent,
    ViewWorkflowComponent,
    AdminReleaseComponent
  ],
  entryComponents: [
    AcknowledgeModalComponent,
    ViewWorkflowComponent,
    DisputeComponent,
    CommentsComponent,
    DisputeReviewComponent,
    AdminReleaseComponent
  ],
  providers: [
    ViewEvaluationService,
    ExcelService
  ]
})
export class ViewEvaluationModule { }
