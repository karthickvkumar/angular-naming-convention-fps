import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SettingsService } from '../../services/settings.service';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';

@Component({
    templateUrl: './assign-role-modal.component.html',
    styleUrls: ['./assign-role-modal.component.css']
})
export class AssignRoleModalComponent implements OnInit {
    roles: any[] = [];
    username = '';
    userrole = '';
    useremailid = '';
    userid: string;
    userSelectedRoleId: Number = 0;
    userSelectedRoleName = '';
    constructor(
        public dialogRef: MatDialogRef<AssignRoleModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private settingsService: SettingsService,
        private errorService: ErrorHandlerService
    ) { }

    ngOnInit() {
        try {
            this.roles = this.data.roles;
            this.username = this.data.username;
            this.userrole = this.data.userrole;
            this.useremailid = this.data.useremailid;
            this.userid = this.data.userid;
            const role = this.roles.find(d => d.name.toLowerCase() === this.userrole.toLowerCase());
            this.userSelectedRoleId = role.id;
            this.userSelectedRoleName = role.name;
            //console.log(this.userSelectedRoleName);
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    onSaveChanges() {
        try {
            const postValues = {
                'user_id': this.userid,
                'role_name': this.userSelectedRoleName
                //'role_id': this.userSelectedRoleId

            };
            this.settingsService.assignRole(postValues).subscribe(() => {
                this.dialogRef.close(true);
            });
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
