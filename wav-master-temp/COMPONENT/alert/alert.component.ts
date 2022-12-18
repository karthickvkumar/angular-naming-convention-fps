import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  message: string;
  messages: string[];
  header = '';
  constructor(
    public dialogRef: MatDialogRef<AlertComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data.message) {
      this.messages = [];
      this.messages.push(this.data.message);
    } else if (this.data.messages) {
      this.messages = this.data.messages;
    }
    this.header = this.data.header ? this.data.header : '';
  }

  close() {
    this.dialogRef.close(false);
  }

}
