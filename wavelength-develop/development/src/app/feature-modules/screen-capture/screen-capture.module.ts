import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScreenCaptureRoutingModule } from './screen-capture-routing.module';
import { HistoryPageComponent } from './components/history-page/history-page.component';
import { RecordingService } from './services/recordings.service';
import { ScreenPageComponent } from './pages/screen-page/screen-page.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MomentModule } from 'ngx-moment';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { VideoPlayerModalComponent } from './modals/video-player-modal/video-player-modal.component';

@NgModule({
  declarations: [
    HistoryPageComponent,
    ScreenPageComponent,
    VideoPlayerModalComponent
  ],
  imports: [
    CommonModule,
    ScreenCaptureRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MomentModule,
    NgxDatatableModule,
    NgSelectModule
  ],
  providers: [RecordingService],
  entryComponents: [VideoPlayerModalComponent]
})
export class ScreenCaptureModule { }
