import { CommentsComponent } from './modals/comments/comments.component';
import { ViewEvaluationService } from './services/view-evaluation.service';
import { NgModule } from '@angular/core';
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
    MomentModule
  ],
  declarations: [
    ViewEvaluationPageComponent,
    AcknowledgeModalComponent,
    CommentsComponent
  ],
  entryComponents: [
    AcknowledgeModalComponent,
    CommentsComponent
  ],
  providers: [
    ViewEvaluationService,
    ExcelService
  ]
})
export class ViewEvaluationModule { }
