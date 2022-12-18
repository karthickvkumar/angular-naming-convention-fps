import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/internal/operators/finalize';
import { CallAcknowledgeService } from './call-acknowledge.service';
import { Router } from '@angular/router';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { PageLoaderService } from '../../core-services/ui-services/page-loader.service';
import { ErrorHandlerService } from '../../core-services/ui-services/error-handler.service';

@Component({
  templateUrl: './call-acknowledge.page.html',
  styleUrls: ['./call-acknowledge.page.css']
})
export class CallAcknowledgePageComponent implements OnInit {
  tableRows: any[] = [];
  totalCount = 0;
  varRowLimit = 10;
  loggedInUser: any;
  sortOrderDirection = 'asc';
  sortOrderColumnName = 'callstartdatetime';
  tableLoadingIndicator = false;
  showPage = false;
  pageSkipValue = 0;
  pageOffsetValue = 0;
  incrementalpageOffsetValue = -1;

  constructor(
    private callAcknowledgeService: CallAcknowledgeService,
    private router: Router,
    public appState: ApplicationStateService,
    private pageLoaderService: PageLoaderService,
    private errorService: ErrorHandlerService
  ) { }

  ngOnInit() {
    try {
      this.pageLoaderService.displayPageLoader(false);
      this.pageLoaderService.getSubscription().subscribe(value => {
        this.showPage = !value;
      });
      this.loggedInUser = this.appState.loggedInUser;
      this.getAllCalls(this.createSearchFilter());
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  createSearchFilter() {
    try {
      const filter = {
        'skip': 0,
        'take': 10,
        'agent_id': this.loggedInUser.dim_user_id,
        'sortordercolumn': this.sortOrderColumnName,
        'sortorder': this.sortOrderDirection, // asc, desc
        'acknowledge_status': 'pending'
      };
      return filter;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onViewEvaluation(evaluationId: number) {
    try {
      this.pageLoaderService.displayPageLoader(true);
      this.router.navigate([`viewevaluation/${evaluationId}`], { queryParams: { from: 'acknowledgecalls' } });
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
        .subscribe(data => {
          this.totalCount = data['count'];
          this.tableRows = data['surveyresponses']
            .map(d => {
              const evaluationStatus = d.surveyresponses ? d.surveyresponses.status.toLowerCase().trim() : 'todo';
              const creatorId = d.surveyresponses ? +d.surveyresponses['created_by'] : 0;
              const evaluationId = d.surveyresponses ? +d.surveyresponses['id'] : 0;
              const actionValues = {
                evaluationStatus: evaluationStatus,
                audiofileurl: d['audiofileurl'],
                evaluationId: evaluationId,
                evaluationFormId: 1
              };
              d['actionValues'] = actionValues;
              return d;
            });
        });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  onPageChange(pageInfo: any) {
    try {
      this.pageOffsetValue = +pageInfo.offset;
      this.pageSkipValue = +pageInfo.offset * this.varRowLimit;
      // const filter = this.createSearchFilter();
      // this.getAllCalls(filter);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
}
