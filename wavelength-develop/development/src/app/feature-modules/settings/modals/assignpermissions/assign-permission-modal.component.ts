import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './assign-permission-modal.component.html',
    styleUrls: ['./assign-permission-modal.component.css']
})
export class AssignPermissionsModalComponent {
    objlstRoles: String[] = ['Admin', 'Agent', 'MAnager'];
    constructor(
        public dialogRef: MatDialogRef<AssignPermissionsModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

}
