import { Component, OnInit } from '@angular/core';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {

  objLstInputItems = [];

  objId = 0;
  objName: String;
  objLabel: String;
  objKey: String;
  objMultiple: Number;
  objSeparator: String;
  objInputtype: String;
  objNoofitemtodisplay: Number;
  objNotifyonselect: Number;
  objMandatory: Number;
  objClearable: Number;
  objSelectall: Number;
  objCloseall: Number;
  objCloseOnSelect: Number;

  ObjOutput;

  objTooltip = '';

  constructor(private errorService: ErrorHandlerService) { }

  ngOnInit() {
    if (this.objMandatory && this.objMandatory === 1) {
      this.objTooltip = 'This field is Mandatory';
    }
  }

  OnDDLSelectAll() {
    try {
      if (this.ObjOutput) {
        this.ObjOutput = this.objLstInputItems;
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  OnDDLUnSelectAll() {
    try {
      if (this.ObjOutput) {
        this.ObjOutput = [];
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onDeleteSites(index) {
    try {
      if (this.ObjOutput) {
        this.ObjOutput = this.ObjOutput.filter((x, i) => {
          return i !== index;
        });
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onChangeSite() {

  }

}
