import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OnlineHelpComponent } from './online-help/online-help.component';

const routes: Routes = [
  { path: 'online/:option', component: OnlineHelpComponent, pathMatch: 'prefix' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule { }
