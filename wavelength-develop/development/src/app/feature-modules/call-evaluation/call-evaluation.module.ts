import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CallEvaluationRoutingModule } from './call-evaluation-routing.module';
import { CallEvaluationPageComponent } from './call-evaluation.page';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CallEvaluationService } from './call-evaluation.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MomentModule } from 'ngx-moment';
import { CountryEditCanDeactivateGuard } from './call-evaluation-deactivate-guard.service';
import { CountryEditCanActivateGuard } from './call-evaluation-activate-guard.service';
import { TagconfirmationComponent } from './modals/tagconfirmation/tagconfirmation.component';
import { ViewEvaluationModule } from '../view-evaluation/view-evaluation.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FpsFormRendererModule } from 'fps-form-renderer';

@NgModule({
  imports: [
    CommonModule,
    CallEvaluationRoutingModule,
    ViewEvaluationModule,
    FormsModule,
    NgSelectModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatInputModule,
    MatDialogModule,
    MomentModule,
    MatProgressSpinnerModule,
    FpsFormRendererModule
  ],
  declarations: [
    CallEvaluationPageComponent,
    TagconfirmationComponent
  ],
  entryComponents: [
    TagconfirmationComponent
  ],
  providers: [
    CallEvaluationService,
    CountryEditCanDeactivateGuard,
    CountryEditCanActivateGuard
  ]
})
export class CallEvaluationModule { }
