import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CallEvaluationPageComponent } from './call-evaluation.page';
import { CountryEditCanDeactivateGuard } from './call-evaluation-deactivate-guard.service';
import { CountryEditCanActivateGuard } from './call-evaluation-activate-guard.service';

const routes: Routes = [
  {
    path: '', component: CallEvaluationPageComponent,
    canActivate: [CountryEditCanActivateGuard],
    canDeactivate: [CountryEditCanDeactivateGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallEvaluationRoutingModule { }
