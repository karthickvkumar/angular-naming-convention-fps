import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { UserService } from 'src/app/core-services/app-services/user.service';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from 'src/app/core-components/confirmation/confirmation.component';
import { forkJoin, Observable } from 'rxjs';

@Component({
  styleUrls: ['./call-search.page.css'],
  templateUrl: './call-search.page.html'
})
export class CallSearchPageComponent implements OnInit, OnDestroy {

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
  alive = true;
  selectedRecordingFile: string;
  originaltotalCount = 25;
  totalCount = 0;

  objToday = new Date();
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
  objCampaignGrps = [];
  objlstCampaignGrps = [];
  objShowTotalCount = 0;
  objCampaignSkils = [];
  objlstCampaignSkills = [];

  constructor(
    private locationevent: Location,
    private callSearchService: CallSearchService,
    private audioService: AudioPlayerService,
    private otherService: UserService,
    public dialog: MatDialog,
    public appState: ApplicationStateService,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private errorService: ErrorHandlerService) {
  }

  ngOnInit() {
    try {
      this.setupFiltersBasedOnLoggedInUser();
      this.loadCampaignGrps();
      this.pageUrl = this.locationevent.path();
      this.locationevent.go(this.pageUrl);
      this.pageLoaderService.displayPageLoader(false);
      this.pageLoaderService.getSubscription().subscribe(value => {
        this.showPage = !value;
      });
      this.appState.returnUrl = '/callsearch';
      // this.maxDate.setDate(this.maxDate.getDate() + 7);
      this.bsValue.setDate(this.bsValue.getDate() - 7);
      this.bsRangeValue = [this.bsValue, this.maxDate];
      // this.disabledDates = []
      this.objlstSite = this.appState.sites;
      // this.objSite = [this.objlstSite[0]];
      this.objlstAgents = this.appState.agents;
      // this.objlstSelectedAgents = this.appState.agents.map(a => a.eid);
      if (this.appState.callSearchFilter) {
        this.objlstSite = this.appState.sites;
        if (this.appState.callSearchFilter.site) {
          this.objSite = this.appState.createMultiselectValueFromFilter(this.appState.callSearchFilter.site);
        }
        if (this.appState.callCampGrps) {
          this.objlstCampaignGrps = this.appState.callCampGrps;
          this.onChangeCampaignGrps(false);
        }
        if (this.appState.callAgents) {
          this.objlstAgents = this.appState.callAgents;
        }
        this.objSelectedEvaluationFormId = this.appState.callSearchFilter.evaluation_form_id;
        this.objlstSelectedAgents = (this.appState.createMultiselectValueFromFilter(this.appState.callSearchFilter.agent_ids)).map(item => Number(item));
        this.bsRangeValue = [this.appState.callSearchFilter.actual_from_date, this.appState.callSearchFilter.actual_to_date];
        this.pageSkipValue = this.appState.callSearchFilter.skip;
        this.totalCount = this.appState.callSearchFilter.total;
        this.pageOffsetValue = this.appState.callSearchFilter.pageOffsetValue;
        this.objPhonenumber = this.appState.callSearchFilter.customer_num;
        this.objDisposition = this.appState.createMultiselectValueFromFilter(this.appState.callSearchFilter.disposition);
        this.selectedRecordingFile = this.appState.callSearchFilter['audiofileurl'];
        this.minduration = this.appState.callSearchFilter['minduration'].toString();
        this.audioService.resetPlaying();
        this.getAllAgents(true);
        this.getAllCalls(this.appState.callSearchFilter);
      } else {
        // const filter = this.createSearchFilter();
        // this.getAllCalls(filter);
        if (this.showAgents) {
          this.getAllAgents(false);
        }
      }
      this.setupPlayerSubscription();
      this.appState.isSiteAllowed.subscribe(data => {
        this.showAgents = data;
      });
      // this.appState.callSearchEvalForms.subscribe(data => {
      //   if (data) {
      //     this.objlstEvaluationForms = data;
      //     this.initialiseEvalForm(data);
      //   }
      // });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
  // initialiseEvalForm(data) {
  //   if (data) {
  //     if (!this.appState.callSearchFilter) {
  //       // this.objSelectedEvaluationFormId = data[0].id;
  //     } else if (this.appState.callSearchFilter) {
  //     
  //     }
  //     this.appState.dispositions.subscribe(res => {
  //       this.objlstDisposition = res;
  //       if (res) {
  //         this.objlstDispositionFiltered = res.filter(x =>
  //           x.usr_grp.toLowerCase() === data[0].usr_grp.toLowerCase());
  //       }
  //     });
  //   }
  // }
  loadCampaignGrps() {
    try {
      this.callSearchService.getCampaignGroups().subscribe(data => {
        if (data) {
          this.objCampaignGrps = data;
        }
      });
    } catch (e) {

    }
  }
  onChangeCampaignGrps(userEdited?: boolean) {
    try {
      if (this.objlstCampaignGrps.length > 0) {
        const group_ids = this.objlstCampaignGrps.join(',');
        if (group_ids) {
          this.getAllData([
            this.callSearchService.getCampaignSkils(group_ids),
            this.callSearchService.getEvalForms('group', group_ids),
            this.callSearchService.getDispositions('group', group_ids)
          ]).subscribe(data => {
            if (data) {
              this.objlstCampaignSkills = [];
              this.objCampaignSkils = data[0];
              this.objlstEvaluationForms = data[1];
              this.objlstDisposition = data[2];
              this.objlstDispositionFiltered = data[2];
              if (userEdited) {
                this.objDisposition = [];
                this.objSelectedEvaluationFormId = null;
              }
              if (this.appState.callCampSkills && !userEdited) {
                this.objlstCampaignSkills = this.appState.callCampSkills;
                this.onChangeCampaignSkills(false);
              }
            }
          })
        }
      } else {
        this.objlstCampaignGrps = [];
        this.objlstCampaignSkills = [];
        this.objCampaignSkils = [];
        this.objlstDispositionFiltered = [];
        this.objlstEvaluationForms = [];
        this.objDisposition = [];
        this.objSelectedEvaluationFormId = null;
      }
    } catch (e) {

    }
  }
  getAllData(response: any[]): Observable<any> {
    return forkJoin(response);
  }
  onChangeCampaignSkills(userEdited?: boolean) {
    try {
      const skill_ids = this.objlstCampaignSkills.join(',');
      if (skill_ids) {
        this.getAllData([
          this.callSearchService.getEvalForms('skill', skill_ids),
          this.callSearchService.getDispositions('skill', skill_ids)
        ]).subscribe(data => {
          if (data) {
            this.objlstEvaluationForms = data[0];
            this.objlstDisposition = data[1];
            this.objlstDispositionFiltered = data[1];
            if (userEdited) {
              this.objDisposition = [];
              this.objSelectedEvaluationFormId = null;
            }
          }
        });
      } else {
        this.onChangeCampaignGrps(true);
      }
    } catch (e) {

    }
  }
  setupFiltersBasedOnLoggedInUser() {
    try {
      const id = this.appState.loggedInUser.dim_user_id;
      this.showAgents = this.appState.isOperationAvailable('agentfilter');
      this.appState.isSiteAllowed.next(this.showAgents);
      if (!this.showAgents) {
        this.objlstSelectedAgents = [id];
      } else if (!this.appState.callSearchFilter) {
        this.getAllAgents(true);
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
      this.appState.callSearchFilter = filter;
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
      this.appState.callSearchFilter = filter;
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
        'agent_ids': this.objlstSelectedAgents.join(','),
        'total': this.totalCount,
        'disposition': this.objDisposition.join(','),
        'sortordercolumn': this.sortOrderColumnName,
        'sortorder': this.sortOrderDirection, // asc, desc
        'pageOffsetValue': this.pageOffsetValue,
        'audiofileurl': this.selectedRecordingFile,
        'minduration': +this.minduration,
        'site': this.objSite.join(','),
        'group_campaign': this.objlstCampaignGrps.join(','),
        'skill_campaign': this.objlstCampaignSkills.join(',')
      };
      this.appState.callCampSkills = this.objlstCampaignSkills;
      this.appState.callCampGrps = this.objlstCampaignGrps;
      // this.appState.callSearchFilter = filter;
      this.appState.callAgents = this.objlstAgents;

      return filter;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onPlayAudio(index) {
    try {
      this.appState.isDownload.next(true);
      const row = this.tableRows[index];
      const loadevaluation = new LoadEvaluation();
      loadevaluation.callid = row.callid;
      loadevaluation.isEvaluationEditor = row['actionValues'].isEvaluationEditor;
      loadevaluation.callSearchFilter = this.createSearchFilter();
      if (row['actionValues'].evaluationStatus === 'todo') {
        loadevaluation.mode = 'todo';
        this.audioService.is_Evaluate = true;
        loadevaluation.formid = this.objSelectedEvaluationFormId;
      } else if (row['actionValues'].evaluationStatus === 'in progress' || row['actionValues'].evaluationStatus === 'assigned') {
        this.audioService.is_Evaluate = false;
        loadevaluation.mode = 'edit';
        loadevaluation.evaluationid = row['actionValues'].evaluationId;
      }
      this.appState.loadEvaluation.next(loadevaluation);
      this.selectedRecordingFile = this.getURL(row['audiofileurl'][0]['url']);
      this.audioService.audioUrl = decodeURIComponent(this.selectedRecordingFile);
      this.audioService.audios = row['audiofileurl'];
      this.selectedRow = [];
      this.selectedRow.push(row);

      this.audioService.startPlaying();
      this.setCallInfo(row);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
  onDownload() {
    this.audioService.resetPlaying();
    this.appState.isDownload.next(false);
  }
  getURL(url) {
    if (url.includes('http')) {
      return url;
    } else {
      return null;
    }
  }
  getSelectedRow() {
    return this.selectedRow;
  }

  setCallInfo(row: any) {
    try {
      const callInfo = new CallInfo();
      const calldatetime = `${row.callenddatetime}`.split(':').join('-').split(' ').join('_');
      const agentInfo = `${row.employee.agentname}_${calldatetime}`;
      callInfo.audioUrl = decodeURIComponent(row['audiofileurl'][0]['url']);
      callInfo.callId = row.callid;
      callInfo.evaluationStatus = row['actionValues'].evaluationStatus;
      callInfo.isEvaluationEditor = row['actionValues'].isEvaluationEditor;
      callInfo.agentinfo = agentInfo;
      callInfo.searchFilter = this.createSearchFilter();
      if (row['actionValues'].evaluationStatus === 'todo') {
        callInfo.evaluationFormId = this.objSelectedEvaluationFormId;
      } else if (row['actionValues'].evaluationStatus === 'inprogress' || row['actionValues'].evaluationStatus === 'assigned') {
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
  onDeleteItem(index, item, field) {
    try {
      this[item] = this[item].filter((x, i) => {
        return i !== index;
      });
      this.onChange(field);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
  onChange(field) {
    try {
      switch (field.toUpperCase()) {
        case 'CAMPAIGNGROUPS':
          this.onChangeCampaignGrps(true);
          break;
        case 'CAMPAIGNSKILLS':
          this.onChangeCampaignSkills(true);
          break;
      }
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
      this.getAllAgents(false);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onChangeSite() {
    try {
      this.getAllAgents(false);
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
      const row = this.tableRows[rowIndex];
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '600px',
        data: {
          content: `To continue with this evaluation, click on Start Evaluating. This will assign the evaluations to you.`,
          buttonKeywords: { Yes: 'Start Evaluating', No: 'Cancel' }
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.pageLoaderService.displayPageLoader(true);
          this.callSearchService.acceptEvaluation(row.callid, {
            'evaluation_form_id': this.objSelectedEvaluationFormId,
            'status': 'accepted',
            'assigned_to': this.appState.loggedInUser.id
          })
            .takeWhile(() => this.alive)
            .subscribe(data => {
              if (data) {
                this.appState.objEvaluationDetails = data.evaluation;
                this.appState.objEvaluationsId = data.evaluation['id'];
                this.appState.isCallEditClicked = true;
                this.onPlayAudio(rowIndex);
                this.appState.callSearchFilter = this.createSearchFilter();
                this.router.navigate(['callevaluation'], {
                  queryParams:
                    { callid: row.callid, formid: this.objSelectedEvaluationFormId }
                });
              }
            },
              error => {
                this.pageLoaderService.displayPageLoader(false);
              }
            );
        }
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
      if (row['assigned_to'] == this.appState.loggedInUser.id) {
        this.router.navigate([`viewevaluation/${evaluationId}`], { queryParams: { from: 'callsearch' } });
      } else {
        this.router.navigate([`viewevaluation/${evaluationId}`], { queryParams: { from: 'callsearch', access_from: 'reevaluation' } });
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  CheckForEvaluationEditor(status: string, creatorId: number) {
    try {
      if (!this.appState.isPageAccessible('callevaluation')) {
        return false;
      }
      const user = this.appState.loggedInUser;
      switch (status) {
        case 'todo':
          return true;
        case 'in progress':
          return user['id'] === creatorId || user['role'] === 'Administrator';
        case 'assigned':
          return user['id'] === creatorId || user['role'] === 'Administrator';
        case 'in reevaluation':
          return user['id'] === creatorId || user['role'] === 'Administrator';
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
          this.objDisposition = this.objlstDispositionFiltered.map(x => x);
          break;
        case 'SITE':
          this.objSite = this.objlstSite;
          this.onChangeSite();
          break;
        case 'CAMPAIGNGROUPS':
          this.objlstCampaignGrps = this.objCampaignGrps.map(x => x.id);
          this.onChangeCampaignGrps(true);
          break;
        case 'CAMPAIGNSKILLS':
          this.objlstCampaignSkills = this.objCampaignSkils.map(x => x.id);
          this.onChangeCampaignSkills(true);
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
        case 'CAMPAIGNGROUPS':
          this.objlstCampaignGrps = [];
          this.objlstCampaignSkills = [];
          this.objlstDispositionFiltered = [];
          this.objlstEvaluationForms = [];
          this.loadCampaignGrps();
          break;
        case 'CAMPAIGNSKILLS':
          this.objlstCampaignSkills = [];
          this.onChangeCampaignSkills(true);
          break;
        default:
          return;
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  async getAllAgents(preload: boolean) {
    try {
      this.objlstSelectedAgents = preload ? this.objlstSelectedAgents : [];
      this.objlstAgents = [];
      this.appState.agents = [];
      if (this.objSite.length > 0) {
        this.objLoadinAgents = true;
        this.otherService.getAllAgents({
          'site': this.objSite.join(','),
          'flag': 'call'
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
                const evaluationStatus = d.evaluations ? d.evaluations.status.status.toLowerCase() : 'todo';
                const creatorId = d.evaluations ? +d.evaluations['assigned_to'] : 0;
                const evaluationId = d.evaluations ? +d.evaluations['id'] : 0;
                const actionValues = {
                  evaluationStatus: evaluationStatus,
                  isEvaluationEditor: this.CheckForEvaluationEditor(evaluationStatus, creatorId),
                  audiofileurl: d['audiofileurl'],
                  evaluationId: evaluationId,
                  evaluationFormId: 1,
                  usr_grp: d['usr_grp']
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

  // resetCallDisposition() {
  //   try {
  //     const usertype = this.objlstEvaluationForms.find(x => x.id === this.objSelectedEvaluationFormId);
  //     this.objlstDispositionFiltered = this.objlstDisposition.filter(x => x.usr_grp.toLowerCase() === usertype.usr_grp.toLowerCase());
  //     if (!this.objlstDispositionFiltered.find(x => x.disposition === this.objDisposition)) {
  //       this.objDisposition = [];
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
  ngOnDestroy() {
    try {
      this.alive = false;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
}
