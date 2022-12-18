import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScreenPageComponent } from './pages/screen-page/screen-page.component';
import { HistoryPageComponent } from './components/history-page/history-page.component';

const routes: Routes = [
  {
    path: '', component: ScreenPageComponent, pathMatch: 'prefix', children: [
      { path: '', pathMatch: 'full', redirectTo: '/screencapture/recordings' },
      { path: 'recordings', component: HistoryPageComponent }
    ]
  },
];
/*
const routes: Routes = [
  {
    path: '', component: HistoryPageComponent
  }
];
*/
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScreenCaptureRoutingModule { }
