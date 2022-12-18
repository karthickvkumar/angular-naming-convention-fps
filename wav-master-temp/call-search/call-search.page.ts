import { Component, OnInit } from '@angular/core';
import { CallSearchService } from './call-search.service';
import { finalize, tap } from 'rxjs/operators';
import { AudioPlayerService } from '../../core-services/ui-services/audio-player.service';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { PageLoaderService } from '../../core-services/ui-services/page-loader.service';
import { LoadEvaluation } from '../../core-models/loadevaluation';
import { ErrorHandlerService } from '../../core-services/ui-services/error-handler.service';
import { CallInfo } from '../../core-models/callinfo';
import * as fs from 'file-saver';
import { Buffer } from 'buffer';
import { UserService } from 'src/app/core-services/app-services/user.service';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
  styleUrls: ['./call-search.page.css'],
  templateUrl: './call-search.page.html'
})
export class CallSearchPageComponent implements OnInit {

  pageUrl = '';
  tableRows = [
  ];
  varRowLimit = 25;
  tableLoadingIndicator = false;
  objlstAgents = [];
  objlstSite = [];

  objSite = [];
  objlstSelectedAgents = [];
  objlstClients = [];
  objlstSelectedClients = [];
  objlstEvaluationForms = [];
  objlstDisposition = [];
  objlstDispositionFiltered = [];
  objPhonenumber = '';

  objLoadinAgents = false;

  objSelectedEvaluationFormId: any;
  pageSkipValue = 0;
  pageOffsetValue = 0;
  incrementalpageOffsetValue = -1;

  isAudioPlaying = false;
  selectedRecordingFile: string;
  originaltotalCount = 25;
  totalCount = 0;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  showFilters = false;
  isPageLoaded = false;
  showAgents = false;
  sortOrderColumnName = 'callenddatetime';
  sortOrderDirection = 'desc';
  showPage = false;
  selectedRow = [];
  minduration = '15';
  objDisposition = [];
  objDispositionType = 'CG';

  objShowTotalCount = 0;

  constructor(
    private locationevent: Location,
    private callSearchService: CallSearchService,
    private audioService: AudioPlayerService,
    private otherService: UserService,
    public appState: ApplicationStateService,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private errorService: ErrorHandlerService) {
  }

  ngOnInit() {
    try {
      this.pageUrl = this.locationevent.path();
      this.locationevent.go(this.pageUrl);
      this.pageLoaderService.displayPageLoader(false);
      this.pageLoaderService.getSubscription().subscribe(value => {
        this.showPage = !value;
      });
      this.maxDate.setDate(this.maxDate.getDate() + 7);
      this.bsRangeValue = [this.bsValue, this.maxDate];
      this.objlstSite = this.appState.sites;
      this.objSite = [this.objlstSite[0]];
      this.objlstAgents = this.appState.agents;
      // this.objlstSelectedAgents = this.appState.agents.map(a => a.eid);
      this.objlstEvaluationForms = this.appState.evaluationforms.map(e => {
        e.id = e.id.toString();
        return e;
      });
      this.objlstDisposition = this.appState.dispositions;
      this.objSelectedEvaluationFormId = this.objlstEvaluationForms[0].id;
      this.objlstDispositionFiltered = this.objlstDisposition.filter(x =>
        x.usr_grp.toLowerCase() === this.objlstEvaluationForms[0].usr_grp.toLowerCase());

      this.setupFiltersBasedOnLoggedInUser();
      if (this.appState.callSearchFilter) {
        this.objlstSelectedAgents = this.appState.createMultiselectValueFromFilter(this.appState.callSearchFilter.agent_ids);
        this.bsRangeValue = [this.appState.callSearchFilter.actual_from_date, this.appState.callSearchFilter.actual_to_date];
        this.pageSkipValue = this.appState.callSearchFilter.skip;
        this.totalCount = this.appState.callSearchFilter.total;
        this.pageOffsetValue = this.appState.callSearchFilter.pageOffsetValue;
        this.objPhonenumber = this.appState.callSearchFilter.customer_num;
        this.objSelectedEvaluationFormId = this.appState.callSearchFilter.evaluation_form_id.toString();
        this.objSite = this.appState.createMultiselectValueFromFilter(this.appState.callSearchFilter.site);
        this.objDisposition = this.appState.createMultiselectValueFromFilter(this.appState.callSearchFilter.disposition);
        this.selectedRecordingFile = this.appState.callSearchFilter['audiofileurl'];
        this.minduration = this.appState.callSearchFilter['minduration'].toString();
        this.audioService.resetPlaying();
        this.getAllCalls(this.appState.callSearchFilter);
      } else {
        // const filter = this.createSearchFilter();
        // this.getAllCalls(filter);
        if (this.showAgents) {
          this.getAllAgents();
        }
      }

      this.setupPlayerSubscription();
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  setupFiltersBasedOnLoggedInUser() {
    try {
      const id = this.appState.loggedInUser.dim_user_id;
      this.showAgents = this.appState.isOperationAvailable('agentfilter');
      if (!this.showAgents) {
        this.objlstSelectedAgents = [id];
        // console.log(this.objlstSelectedAgents);
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  setupPlayerSubscription() {
    try {
      this.audioService.getAudioPlayerSubscription().subscribe(operation => {
        this.isAudioPlaying = !operation || operation === null ? false : operation.toLowerCase() === 'play';
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onCallSearch() {
    try {
      this.pageSkipValue = 0;
      this.pageOffsetValue = 0;
      const filter = this.createSearchFilter();
      filter.total = 0;
      this.totalCount = 0;
      this.incrementalpageOffsetValue = -1;
      this.getAllCalls(filter);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }

  onPageChange(pageInfo: any) {
    try {
      this.pageOffsetValue = +pageInfo.offset;
      this.pageSkipValue = +pageInfo.offset * this.varRowLimit;
      const filter = this.createSearchFilter();
      this.getAllCalls(filter);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onRowSelected(value: any) {
    this.selectedRow = this.selectedRow.filter(d => d.audiofileurl === this.selectedRecordingFile);
  }

  getRowClass = (row) => {
    return {
      'row-active': row.audiofileurl === this.selectedRecordingFile
    };
  }

  isCurrentRow(row) {
    return true;
  }

  createSearchFilter() {
    try {
      const filter = {
        'evaluation_form_id': +this.objSelectedEvaluationFormId,
        'customer_num': this.objPhonenumber,
        'actual_to_date': this.bsRangeValue[1],
        'actual_from_date': this.bsRangeValue[0],
        'to_date': `${moment(this.bsRangeValue[1]).format('YYYY-MM-DD')} 23:59:59`,
        'from_date': `${moment(this.bsRangeValue[0]).format('YYYY-MM-DD')} 00:00:00`,
        'skip': this.pageSkipValue,
        'take': this.varRowLimit,
        'agent_ids': this.objlstSelectedAgents.toString(),
        'total': this.totalCount,
        'disposition': this.objDisposition.join(','),
        'sortordercolumn': this.sortOrderColumnName,
        'sortorder': this.sortOrderDirection, // asc, desc
        'pageOffsetValue': this.pageOffsetValue,
        'audiofileurl': this.selectedRecordingFile,
        'minduration': +this.minduration,
        'site': this.objSite.join(',')
      };

      return filter;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onPlayAudio(index) {
    try {
      const row = this.tableRows[index];
      const loadevaluation = new LoadEvaluation();
      loadevaluation.callid = row.callid;
      loadevaluation.isEvaluationEditor = row['actionValues'].isEvaluationEditor;
      loadevaluation.callSearchFilter = this.createSearchFilter();
      if (row['actionValues'].evaluationStatus === 'todo') {
        loadevaluation.mode = 'todo';
        loadevaluation.formid = this.objSelectedEvaluationFormId;
      } else if (row['actionValues'].evaluationStatus === 'inprogress') {
        loadevaluation.mode = 'edit';
        loadevaluation.evaluationid = row['actionValues'].evaluationId;
      }
      this.appState.loadEvaluation.next(loadevaluation);
      this.selectedRecordingFile = row['audiofileurl'];
      this.selectedRow = [];
      this.selectedRow.push(row);
      this.audioService.audioUrl = decodeURIComponent(row['audiofileurl']);
      this.audioService.startPlaying();
      this.setCallInfo(row);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  getSelectedRow() {
    return this.selectedRow;
  }

  setCallInfo(row: any) {
    try {
      const callInfo = new CallInfo();
      const calldatetime = `${row.callstartdatetime}`.split(':').join('-').split(' ').join('_');
      const agentInfo = `${row.employee.agentname}_${calldatetime}`;
      callInfo.audioUrl = decodeURIComponent(row['audiofileurl']);
      callInfo.callId = row.callid;
      callInfo.evaluationStatus = row['actionValues'].evaluationStatus;
      callInfo.isEvaluationEditor = row['actionValues'].isEvaluationEditor;
      callInfo.agentinfo = agentInfo;
      callInfo.searchFilter = this.createSearchFilter();
      if (row['actionValues'].evaluationStatus === 'todo') {
        callInfo.evaluationFormId = this.objSelectedEvaluationFormId;
      } else if (row['actionValues'].evaluationStatus === 'inprogress') {
        callInfo.evaluationResponseId = row['actionValues'].evaluationId;
      }

      this.appState.selectedCallInfo.next(callInfo);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onPauseAudio() {
    try {
      this.audioService.pausePlaying();
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onDeleteUser(index, item) {
    try {
      this.objlstSelectedAgents = this.objlstSelectedAgents.filter((x, i) => {
        return i !== index;
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  isSearchButtonDisable() {
    if (!this.showAgents) {
      return false;
    }
    return this.objSite.length < 1;
  }

  onDeleteDisposition(index, item) {
    try {
      this.objDisposition = this.objDisposition.filter((x, i) => {
        return i !== index;
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onDeleteSites(index, item) {
    try {
      this.objSite = this.objSite.filter((x, i) => {
        return i !== index;
      });
      this.getAllAgents();
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onChangeSite() {
    try {
      this.getAllAgents();
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onTableSort(event) {
    try {
      const sortValues = event.sorts[0];
      const columnName = sortValues['prop'];
      if (columnName !== 'actionValues') {
        this.sortOrderDirection = sortValues['dir'];
        this.sortOrderColumnName = sortValues['prop'];
        this.onCallSearch();
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onCreateCallEvaluation(rowIndex: number) {
    try {
      this.appState.isCallEditClicked = true;
      const row = this.tableRows[rowIndex];
      this.onPlayAudio(rowIndex);
      this.appState.callSearchFilter = this.createSearchFilter();
      this.pageLoaderService.displayPageLoader(true);
      this.router.navigate(['callevaluation'], {
        queryParams:
          { callid: row.callid, formid: this.objSelectedEvaluationFormId }
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onEditCallEvaluation(evaluationId: number, rowIndex: number) {
    try {
      this.appState.isCallEditClicked = true;
      const row = this.tableRows[rowIndex];
      this.onPlayAudio(rowIndex);
      this.appState.callSearchFilter = this.createSearchFilter();
      this.pageLoaderService.displayPageLoader(true);
      this.router.navigate(['callevaluation'], {
        queryParams:
          { callid: row.callid, evaluationid: evaluationId }
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onScreenCapturePlayClick(rowIndex: number) {
    try {
      this.appState.isCallEditClicked = true;
      const row = this.tableRows[rowIndex];
      this.pageLoaderService.displayPageLoader(true);
      this.onPlayAudio(rowIndex);
      this.appState.callSearchFilter = this.createSearchFilter();
      this.router.navigate(['/screencapture/recordings'], {
        queryParams:
          { callid: row.callid }
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onViewEvaluation(evaluationId: number, rowIndex: number) {
    try {
      const row = this.tableRows[rowIndex];
      this.appState.callSearchFilter = this.createSearchFilter();
      this.pageLoaderService.displayPageLoader(true);
      this.router.navigate([`viewevaluation/${evaluationId}`], { queryParams: { from: 'callsearch' } });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  CheckForEvaluationEditor(status: string, creatorId: number) {
    try {
      if (!this.appState.isPageAccessible('callevaluation')) {
        return false;
      }
      switch (status) {
        case 'todo':
          return true;
        case 'inprogress':
          const user = this.appState.loggedInUser;
          return user['id'] === creatorId;
        default:
          return false;
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  getEmptyTableMessage() {
    try {
      const messages = {
        emptyMessage: `
          <div class="emptyMessage">
         No calls available to display
          </div>
        `
      };
      if (this.objShowTotalCount) {
        messages['totalMessage'] = ' - Calls';
      }

      return messages;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  OnDDLSelectAll(controlid: string) {
    try {
      switch (controlid.toUpperCase()) {
        case 'AGENT':
          this.objlstSelectedAgents = this.objlstAgents.map(x => x.eid);
          break;
        case 'CLIENT':
          this.objlstSelectedClients = this.objlstClients.map(x => x.name);
          break;
        case 'DISPOSITION':
          this.objDisposition = this.objlstDispositionFiltered.map(x => x.disposition);
          break;
        case 'SITE':
          this.objSite = this.objlstSite;
          this.onChangeSite();
          break;
        default:
          return;
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  OnDDLUnSelectAll(controlid: string) {
    try {
      switch (controlid.toUpperCase()) {
        case 'AGENT':
          this.objlstSelectedAgents = [];
          break;
        case 'CLIENT':
          this.objlstSelectedClients = [];
          break;
        case 'DISPOSITION':
          this.objDisposition = [];
          break;
        case 'SITE':
          this.objSite = [];
          this.onChangeSite();
          break;
        default:
          return;
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  getAllAgents() {
    try {
      this.objlstSelectedAgents = [];
      this.objlstAgents = [];
      this.appState.agents = [];
      if (this.objSite.length > 0) {
        this.objLoadinAgents = true;
        this.otherService.getAllAgents({
          'site': this.objSite.join(',')
        })
          .pipe(
            finalize(() => {
              this.objLoadinAgents = false;
            })
          )
          .subscribe(data => {
            this.objlstAgents = data;
            this.appState.agents = data;
          }, error => {
            this.objLoadinAgents = false;
            // this.errorService.logUnknownError(error);
          }
          );
      }
    } catch (e) {
      this.objLoadinAgents = false;
      this.errorService.logUnknownError(e);
      console.error(e);
    }
  }

  getAllCalls(filter) {
    try {
      // this.totalCount = this.originaltotalCount;
      this.tableRows = [];
      this.tableLoadingIndicator = true;
      this.callSearchService.getAllCalls(filter)
        .pipe(
          finalize(() => {
            this.tableLoadingIndicator = false;
          })
        )
        .subscribe(data => {
          if (data) {
            // .filter(d => d.audiofileurl !== null)
            this.objShowTotalCount = data['is_count'];
            if (this.objShowTotalCount === 1) {
              this.totalCount = data['callcount'];
            }
            this.tableRows = data['callresults']
              .map(d => {
                const evaluationStatus = d.surveyresponses ? d.surveyresponses.status.toLowerCase().trim() : 'todo';
                const creatorId = d.surveyresponses ? +d.surveyresponses['created_by'] : 0;
                const evaluationId = d.surveyresponses ? +d.surveyresponses['id'] : 0;
                const actionValues = {
                  evaluationStatus: evaluationStatus,
                  isEvaluationEditor: this.CheckForEvaluationEditor(evaluationStatus, creatorId),
                  audiofileurl: d['audiofileurl'],
                  evaluationId: evaluationId,
                  evaluationFormId: 1
                };
                d['actionValues'] = actionValues;
                return d;
              });
          }
          if (this.tableRows.length >= this.originaltotalCount &&
            this.incrementalpageOffsetValue < this.pageOffsetValue && this.objShowTotalCount === 0) {
            this.totalCount += this.originaltotalCount;
            this.incrementalpageOffsetValue = this.pageOffsetValue;
          }
          if (this.tableRows.length < this.originaltotalCount && this.objShowTotalCount === 0) {
            this.totalCount += this.tableRows.length;
            this.incrementalpageOffsetValue = this.pageOffsetValue;
          }
        },
          error => {
            this.tableLoadingIndicator = false;
          }
        );
    } catch (e) {
      this.tableLoadingIndicator = false;
      this.errorService.logUnknownError(e);
    }
  }

  resetCallDisposition() {
    try {
      const usertype = this.objlstEvaluationForms.find(x => x.id === this.objSelectedEvaluationFormId);
      this.objlstDispositionFiltered = this.objlstDisposition.filter(x => x.usr_grp.toLowerCase() === usertype.usr_grp.toLowerCase());
      if (!this.objlstDispositionFiltered.find(x => x.disposition === this.objDisposition)) {
        this.objDisposition = [];
      }
    } catch (e) {
      console.error(e);
    }
  }
}
