import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs/internal/operators/finalize';
import { CallAcknowledgeService } from './call-acknowledge.service';
import { Router } from '@angular/router';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { PageLoaderService } from '../../core-services/ui-services/page-loader.service';
import { ErrorHandlerService } from '../../core-services/ui-services/error-handler.service';
import { UserService } from 'src/app/core-services/app-services/user.service';
import * as moment from 'moment';
import { Options } from 'ng5-slider';
import { Tags } from 'src/app/core-models/evaluationform';
import { CallEvaluationService } from '../call-evaluation/call-evaluation.service';
import * as _ from 'lodash';
import { forkJoin, Observable } from 'rxjs';

@Component({
  templateUrl: './call-acknowledge.page.html',
  styleUrls: ['./call-acknowledge.page.css']
})
export class CallAcknowledgePageComponent implements OnInit, OnDestroy {

  alive = true;
  tableRows: any[] = [];
  totalCount = 0;
  varRowLimit = 10;
  loggedInUser: any;
  sortOrderDirection = 'desc';
  sortOrderColumnName = 'created_at';
  objTabelSort = [
    { prop: this.sortOrderColumnName, dir: this.sortOrderDirection }
  ];

  objSelectedEvaluationFormId: any;
  objlstEvaluationForms = [];
  objlstDispositionFiltered = [];
  objlstDisposition = [];
  objDisposition = [];
  showAgents = false;
  showPage = false;
  pageSkipValue = 0;
  pageOffsetValue = 0;
  incrementalpageOffsetValue = -1;
  objPhonenumber = '';
  objLoadinAgents = false;
  objLoadinTags = false;
  tableLoadingIndicator = false;

  objlstAgents = [];
  objlstSelectedAgents = [];
  objSite = [];
  objlstSite = [];

  objToday = new Date();
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  objAcknowledgementStatus: any;
  objMinValue: Number = 0;
  objMaxValue: Number = 100;
  options: Options = {
    floor: 0,
    ceil: 100,
    animate: false
  };

  objlstPriority: Tags[] = [];
  objlstTags: Tags[] = [];
  objlstAllDisposition: Tags[] = [];
  objSelectedPriority;
  objPriority: any;
  objSelectedAuditTags;
  objlstacknowledgementStatus = [];
  objCampaignGrps = [];
  objlstCampaignGrps = [];
  objCampaignSkils = [];
  objlstCampaignSkills = [];

  constructor(
    private callAcknowledgeService: CallAcknowledgeService,
    private router: Router,
    private callEvaluationService: CallEvaluationService,
    private otherService: UserService,
    public appState: ApplicationStateService,
    private pageLoaderService: PageLoaderService,
    private errorService: ErrorHandlerService
  ) { }

  ngOnInit() {
    try {
      this.loadCampaignGrps();
      this.objlstacknowledgementStatus = this.appState.evaluation_status;
      this.bsValue.setDate(this.bsValue.getDate() - 7);
      this.bsRangeValue = [this.bsValue, this.maxDate];
      this.objlstSite = this.appState.sites;
      // this.objSite = [this.objlstSite[0]];
      this.pageLoaderService.getSubscription().subscribe(value => {
        this.showPage = !value;
      });
      this.loggedInUser = this.appState.loggedInUser;
      // this.objlstEvaluationForms = this.appState.callEvalForms.map(e => {
      //   e.id = e.id.toString();
      //   return e;
      // });
      // this.appState.returnUrl = '/acknowledgecalls';
      // this.appState.dispositions.subscribe(res => {
      //   if (res) {
      //     this.objlstDisposition = res;
      //     this.objlstDispositionFiltered = res.filter(x =>
      //       x.usr_grp.toLowerCase() === this.objlstEvaluationForms[0].usr_grp.toLowerCase());
      //   }
      // });
      // this.objSelectedEvaluationFormId = this.objlstEvaluationForms[0].id;
      this.setupFiltersBasedOnLoggedInUser();
      this.loadEvaluationDisposition();
      if (this.appState.evaluationSearchFilter) {
        if (this.appState.evalCampGrps) {
          this.objlstCampaignGrps = this.appState.evalCampGrps;
          this.onChangeCampaignGrps(false);
        }
        if (this.appState.evalAgents) {
          this.objlstAgents = this.appState.evalAgents;
        }
        this.objlstSite = this.appState.sites;
        this.objSite = this.appState.createMultiselectValueFromFilter(this.appState.evaluationSearchFilter.site);
        this.objlstSelectedAgents = (this.appState.createMultiselectValueFromFilter(this.appState.evaluationSearchFilter.agent_ids)).map(item => Number(item));
        this.bsRangeValue = [this.appState.evaluationSearchFilter.actual_from_date, this.appState.evaluationSearchFilter.actual_to_date];
        this.objDisposition = this.appState.createMultiselectValueFromFilter(this.appState.evaluationSearchFilter.disposition);
        this.objPhonenumber = this.appState.evaluationSearchFilter.customer_number;
        this.objSelectedEvaluationFormId = this.appState.evaluationSearchFilter.evaluation_form_id;
        this.objAcknowledgementStatus = this.appState.evaluationSearchFilter.acknowledge_status;
        this.objPriority = this.appState.changeNullToEmptyString(this.appState.evaluationSearchFilter.evaluation_disposition_id);
        this.objSelectedPriority = this.appState.changeNullToEmptyString(this.appState.evaluationSearchFilter.severity_id);
        this.sortOrderColumnName = this.appState.evaluationSearchFilter.sortordercolumn;
        this.sortOrderDirection = this.appState.evaluationSearchFilter.sortorder;
        this.varRowLimit = this.appState.evaluationSearchFilter.take;
        this.pageSkipValue = this.appState.evaluationSearchFilter.skip;
        this.pageOffsetValue = this.appState.evaluationSearchFilter.pageOffsetValue;
        this.objMinValue = this.appState.evaluationSearchFilter.minscore;
        this.objMaxValue = this.appState.evaluationSearchFilter.maxscore;
        this.objTabelSort = [
          { prop: this.sortOrderColumnName, dir: this.sortOrderDirection }
        ];
        this.getAllAgents(true);
        this.onPriorityChange(true);
        if (!this.appState.evalCampSkills) {
          this.onSearchButtonClick();
        }
      } else {
        if (this.showAgents) {
          this.getAllAgents(false);
        }
      }
      this.pageLoaderService.displayPageLoader(false);

    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
  loadCampaignGrps() {
    try {
      this.callAcknowledgeService.getCampaignGroups().subscribe(data => {
        if (data) {
          this.objCampaignGrps = data;
        }
      })
    } catch (e) {

    }
  }
  onChangeCampaignGrps(userEdited?: boolean) {
    try {
      if (this.objlstCampaignGrps.length > 0) {
        const group_ids = this.objlstCampaignGrps.join(',');
        if (group_ids) {
          this.getAllData([
            this.callAcknowledgeService.getCampaignSkils(group_ids),
            this.callAcknowledgeService.getEvalForms('group', group_ids),
            this.callAcknowledgeService.getDispositions('group', group_ids)
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
              if (this.appState.evalCampSkills && !userEdited) {
                this.objlstCampaignSkills = this.appState.evalCampSkills;
                this.onChangeCampaignSkills(false);
              }
            }
          });
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
          this.callAcknowledgeService.getEvalForms('skill', skill_ids),
          this.callAcknowledgeService.getDispositions('skill', skill_ids)
        ]).subscribe(data => {
          if (data) {
            this.objlstEvaluationForms = data[0];
            this.objlstDisposition = data[1];
            this.objlstDispositionFiltered = data[1];
            if (userEdited) {
              this.objDisposition = [];
              this.objSelectedEvaluationFormId = null;
            }
            if (!userEdited && this.appState.evalCampSkills) {
              this.onSearchButtonClick();
            }
          }
        });
      } else {
        this.onChangeCampaignGrps(true);
      }
    } catch (e) {

    }
  }
  createSearchFilter() {
    try {
      const filter = {
        // 'site': this.objSite.join(','),
        'skip': this.pageSkipValue,
        'take': this.varRowLimit,
        'agent_ids': this.objlstSelectedAgents.join(','),
        // 'actual_to_date': this.bsRangeValue[1],
        // 'actual_from_date': this.bsRangeValue[0],
        'to_date': `${moment(this.bsRangeValue[1]).format('YYYY-MM-DD')}`,
        'from_date': `${moment(this.bsRangeValue[0]).format('YYYY-MM-DD')}`,
        'disposition': this.objDisposition.join(','),
        'customer_number': this.appState.changeNullToZero(this.objPhonenumber),
        'evaluation_form_id': +this.objSelectedEvaluationFormId,
        'sortordercolumn': this.sortOrderColumnName,
        'pageOffsetValue': this.pageOffsetValue,
        'sortorder': this.sortOrderDirection, // asc, desc
        'status_id': this.appState.changeNullToZero(this.objAcknowledgementStatus),
        'severity_id': this.appState.changeNullToZero(this.objSelectedPriority),
        'evaluation_disposition_id': this.appState.changeNullToZero(this.objPriority),
        'minscore': this.objMinValue,
        'maxscore': this.objMaxValue,
        'group_campaign': this.objlstCampaignGrps.join(','),
        'skill_campaign_id': this.objlstCampaignSkills.join(',')
      };
      this.appState.evalCampSkills = this.objlstCampaignSkills;
      this.appState.evalCampGrps = this.objlstCampaignGrps;
      this.appState.evalAgents = this.objlstAgents;
      return filter;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
  // constructAckStatus(value){
  //   let  status_value = [];
  //   if (value && value != null){
  //     return value;
  //   }
  //   else{
  //     this.objlstacknowledgementStatus.forEach(el =>{
  //       status_value.push(el.id);
  //     });
  //     return status_value.join(",");
  //   }
  // }
  saveSearchFilter() {
    try {
      const filter = {
        'site': this.objSite.join(','),
        'skip': this.pageSkipValue,
        'take': this.varRowLimit,
        'agent_ids': this.objlstSelectedAgents.join(','),
        'actual_to_date': this.bsRangeValue[1],
        'actual_from_date': this.bsRangeValue[0],
        'to_date': `${moment(this.bsRangeValue[1]).format('YYYY-MM-DD')}`,
        'from_date': `${moment(this.bsRangeValue[0]).format('YYYY-MM-DD')}`,
        'disposition': this.objDisposition.join(','),
        'customer_number': this.objPhonenumber,
        'evaluation_form_id': +this.objSelectedEvaluationFormId,
        'sortordercolumn': this.sortOrderColumnName,
        'pageOffsetValue': this.pageOffsetValue,
        'sortorder': this.sortOrderDirection, // asc, desc
        'acknowledge_status': this.objAcknowledgementStatus,
        'status_id': this.appState.changeNullToZero(this.objAcknowledgementStatus),
        'severity_id': this.appState.changeNullToZero(this.objSelectedPriority),
        'evaluation_disposition_id': this.appState.changeNullToZero(this.objPriority),
        'minscore': this.objMinValue,
        'maxscore': this.objMaxValue,
        'group_campaign': this.objlstCampaignGrps.join(','),
        'skill_campaign_id': this.objlstCampaignSkills.join(',')
      };
      this.appState.evalCampSkills = this.objlstCampaignSkills;
      this.appState.evalCampGrps = this.objlstCampaignGrps;
      this.appState.evalAgents = this.objlstAgents;

      return filter;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onViewEvaluation(evaluationId: number, actionVal) {
    try {
      const row = actionVal;

      this.pageLoaderService.displayPageLoader(true);
      // this.router.navigate([`viewevaluation/${evaluationId}`], { queryParams: { from: 'acknowledgecalls' } });

      if (row['assigned_to'] == this.appState.loggedInUser.id) {
        this.router.navigate([`viewevaluation/${evaluationId}`], { queryParams: { from: 'acknowledgecalls' } });
      } else {
        this.router.navigate([`viewevaluation/${evaluationId}`], {
          queryParams: {
            from: 'acknowledgecalls',
            access_from: 'reevaluation'
          }
        });
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  async loadEvaluationDisposition() {
    if (this.appState.objlstTags) {
      this.initData(this.appState.objlstTags);
    } else {
      this.objLoadinTags = true;
      this.callEvaluationService.getAllTags()
        .pipe(
          finalize(() => {
            this.objLoadinTags = false;
          })
        )
        .takeWhile(() => this.alive)
        .subscribe(data => {
          this.initData(data);
        });
    }
  }

  initData(data) {
    this.objlstAllDisposition = data;
    this.objlstPriority = _.uniqBy(this.objlstAllDisposition, function (e) { return e.severity; });
    this.appState.objlstTags = data;
  }

  onSearchButtonClick() {
    this.pageSkipValue = 0;
    this.pageOffsetValue = 0;
    const filter = this.createSearchFilter();
    this.appState.evaluationSearchFilter = this.saveSearchFilter();
    this.getAllCalls(filter);
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

  onPriorityChange(preload: boolean) {
    try {
      this.objPriority = preload ? this.objPriority : null;
      this.objlstTags = this.objlstAllDisposition.filter(x => x.severity === this.objSelectedPriority);
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
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  async getAllAgents(preload: boolean) {
    try {
      this.objlstSelectedAgents = preload ? this.objlstSelectedAgents : null;
      this.objlstAgents = [];
      this.appState.agents = [];
      if (this.objSite.length > 0) {
        this.objLoadinAgents = true;
        this.otherService.getAllAgents({
          'site': this.objSite.join(','),
          'flag': 'evaluation'
        })
          .pipe(
            finalize(() => {
              this.objLoadinAgents = false;
            })
          )
          .takeWhile(() => this.alive)
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
    }
  }
  /*
  getAllAgents() {
    try {
      this.objlstSelectedAgents = [];
      this.objlstAgents = [];
      this.appState.agents = [];
      this.objLoadinAgents = true;
      this.otherService.getAllEvaluationAgents()
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
        });
    } catch (e) {
      this.objLoadinAgents = false;
      this.errorService.logUnknownError(e);
      console.error(e);
    }
  }*/

  onTableSort(event) {
    try {
      const sortValues = event.sorts[0];
      const columnName = sortValues['prop'];
      if (columnName !== 'actionValues') {
        this.sortOrderDirection = sortValues['dir'];
        this.sortOrderColumnName = sortValues['prop'];
        this.getAllCalls(this.createSearchFilter());
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  getAllCalls(filter) {
    try {
      this.tableRows = [];
      this.tableLoadingIndicator = true;

      this.callAcknowledgeService.getAllCalls(filter)
        .pipe(
          finalize(() => {
            this.tableLoadingIndicator = false;
          })
        )
        .takeWhile(() => this.alive)
        .subscribe(data => {
          /*
          this.objShowTotalCount = data['is_count'];
          if (this.objShowTotalCount === 1) {
            this.totalCount = data['callcount'];
          }*/
          this.totalCount = data['count'];
          this.tableRows = data['evaluationcallresults']
            .map(d => {
              const evaluationStatus = d.status ? d.status.status.toLowerCase().trim() : 'todo';
              const creatorId = d.created_by ? +d['assigned_to'] : 0;
              const evaluationId = d.evaluation_id ? +d.evaluation_id : 0;
              const actionValues = {
                evaluationStatus: evaluationStatus,
                isEvaluationEditor: this.CheckForEvaluationEditor(evaluationStatus, creatorId),
                audiofileurl: d['audiofileurl'],
                evaluationId: evaluationId,
                evaluationFormId: 1,
                call_id: d['call_id'],
                assigned_to: d['assigned_to']
              };
              d['actionValues'] = actionValues;
              return d;
            });
          /*
          if (this.tableRows.length >= this.originaltotalCount &&
            this.incrementalpageOffsetValue < this.pageOffsetValue && this.objShowTotalCount === 0) {
            this.totalCount += this.originaltotalCount;
            this.incrementalpageOffsetValue = this.pageOffsetValue;
          }
          if (this.tableRows.length < this.originaltotalCount && this.objShowTotalCount === 0) {
            this.totalCount += this.tableRows.length;
            this.incrementalpageOffsetValue = this.pageOffsetValue;
          }*/
        });
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
  onEditCallEvaluation(evaluationId: number, actionVal) {
    try {
      this.appState.isCallEditClicked = true;
      const row = actionVal;
      this.appState.evaluationSearchFilter = this.saveSearchFilter();
      this.pageLoaderService.displayPageLoader(true);
      this.router.navigate(['callevaluation'], {
        queryParams:
          { callid: row.call_id, evaluationid: evaluationId, from: 'acknowledgecalls' }
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
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

  OnDDLSelectAll(controlid: string) {
    try {
      switch (controlid.toUpperCase()) {
        case 'AGENT':
          this.objlstSelectedAgents = this.objlstAgents.map(x => x.eid);
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

  onChangeSite() {
    try {
      this.getAllAgents(false);
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

  onDeleteDisposition(index, item) {
    try {
      this.objDisposition = this.objDisposition.filter((x, i) => {
        return i !== index;
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  ngOnDestroy() {
    try {
      this.alive = false;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}
