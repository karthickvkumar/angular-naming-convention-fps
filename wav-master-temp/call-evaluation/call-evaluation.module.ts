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
import { ConfirmationComponent } from '../view-evaluation/modals/confirmation/confirmation.component';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MomentModule } from 'ngx-moment';
import { CountryEditCanDeactivateGuard } from './call-evaluation-deactivate-guard.service';
import { CountryEditCanActivateGuard } from './call-evaluation-activate-guard.service';

@NgModule({
  imports: [
    CommonModule,
    CallEvaluationRoutingModule,
    FormsModule,
    NgSelectModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatInputModule,
    MatDialogModule,
    MomentModule
  ],
  declarations: [
    CallEvaluationPageComponent,
    ConfirmationComponent
  ],
  entryComponents: [
    ConfirmationComponent
  ],
  providers: [
    CallEvaluationService,
    CountryEditCanDeactivateGuard,
    CountryEditCanActivateGuard
  ]
})
export class CallEvaluationModule { }
