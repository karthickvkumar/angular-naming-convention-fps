import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorHandlerService } from '../../../../core-services/ui-services/error-handler.service';


@Component({
    templateUrl: 'comments.component.html',
    styleUrls: ['comments.component.css'],
})
export class CommentsComponent implements OnInit {
    agentName: string;
    commentStartTime: string;
    commentText: string;
    constructor(
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<CommentsComponent>,
        private errorService: ErrorHandlerService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit() {
        try {
            this.agentName = this.data.agentName;
            this.commentStartTime = this.data.commentStartTime;
            this.commentText = this.data.commentText;
        } catch (e) {
            console.error(e);
            this.errorService.logUnknownError(e);
        }
    }

    onCancel() {
        try {
            this.dialogRef.close(false);
        } catch (e) {
            console.error(e);
            this.errorService.logUnknownError(e);
        }
    }
}
