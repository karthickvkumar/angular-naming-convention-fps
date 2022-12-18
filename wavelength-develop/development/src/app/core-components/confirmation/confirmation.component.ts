import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';
@Component({
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {

  public content = `Your unsaved changes will be discarded. <br>  Are you sure you want to go back?`;
  public buttonKeywords = { Yes: 'Yes', No: 'No'};
  constructor(
    public dialogRef: MatDialogRef<ConfirmationComponent>,
    private errorService: ErrorHandlerService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.content = this.data.content;
    this.buttonKeywords = this.data.buttonKeywords;
  }

  ngOnInit() {
  }

  onCancel() {
    try {
      this.dialogRef.close(false);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onYes() {
    try {
      this.dialogRef.close(true);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}
