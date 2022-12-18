import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';


@Component({
  selector: 'app-admin-release',
  templateUrl: './admin-release.component.html',
  styleUrls: ['./admin-release.component.css']
})
export class AdminReleaseComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AdminReleaseComponent>, private errorService: ErrorHandlerService) {   }

  ngOnInit() {
  }

  /* onCancel() {
    try {
      this.dialogRef.close(false);
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  }

  onAdminRelease() {
    try {
      this.dialogRef.close();
    } catch (e) {
      console.error(e);
      this.errorService.logUnknownError(e);
    }
  } */

}
