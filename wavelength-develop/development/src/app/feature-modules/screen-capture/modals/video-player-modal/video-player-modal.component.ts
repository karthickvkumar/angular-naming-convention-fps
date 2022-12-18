import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';

@Component({
  selector: 'app-video-player-modal',
  templateUrl: './video-player-modal.component.html',
  styleUrls: ['./video-player-modal.component.css']
})
export class VideoPlayerModalComponent implements OnInit {

  mediasource: any;
  title: String;

  constructor(
    public dialogRef: MatDialogRef<VideoPlayerModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private errorService: ErrorHandlerService) { }

  ngOnInit() {
    try {
      this.title = this.data.title;
      this.mediasource = this.data.mediasource;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onClose() {
    try {
      this.dialogRef.close();
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}
