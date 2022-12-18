import { Component, OnInit } from '@angular/core';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';
import { RecordingService } from '../../services/recordings.service';
import { Recording } from 'src/app/core-models/recording';
import { finalize } from 'rxjs/internal/operators/finalize';
import { ApplicationStateService } from 'src/app/core-services/app-services/applicationstate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { VideoPlayerModalComponent } from '../../modals/video-player-modal/video-player-modal.component';
import { PageLoaderService } from 'src/app/core-services/ui-services/page-loader.service';

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.css']
})
export class HistoryPageComponent implements OnInit {

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
  objRecordingSearchCriteria: Recording;

  objlstRecording: [] = [];

  objShowTotalCount = 0;
  noofrecordingsdisplayed = 0;
  callid: string;

  constructor(private recordingService: RecordingService,
    public appState: ApplicationStateService,
    private route: ActivatedRoute,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    public dialog: MatDialog,
    private errorService: ErrorHandlerService) {
    this.objRecordingSearchCriteria = new Recording();
  }

  ngOnInit() {
    this.getRouteParams();
  }

  getRouteParams() {
    try {
      this.route.queryParams.subscribe(queryValues => {
        this.callid = queryValues['callid'];
        if (!this.callid || this.callid === null) {
          this.router.navigateByUrl('/callsearch');
        } else {
          this.pageLoaderService.displayPageLoader(false);
          this.objRecordingSearchCriteria.callid = this.callid;
          this.getAllCalls();
          this.showPage = true;
        }
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  getAllCalls() {
    try {
      // this.totalCount = this.originaltotalCount;
      this.tableRows = [];
      this.tableLoadingIndicator = true;
      this.recordingService.getBySearchCriteria(this.objRecordingSearchCriteria.GetToStringOfSearchCriteria())
        .pipe(
          finalize(() => {
            this.tableLoadingIndicator = false;
          })
        ).subscribe(data => {
          if (data) {
            // .filter(d => d.audiofileurl !== null)
            this.objlstRecording = data.results.filter(x => {
              return x['state'] === 'SAVED' && x['metadata']['callid'] && x['metadata']['callid'] === this.callid;
            }).map(o => {
              return {
                workstation: (o.metadata.workstation === undefined || o.metadata.workstation.name === undefined)
                  ? '' : o.metadata.workstation.name,
                startedAt: (o.metadata === undefined || o.metadata.startedAt === undefined) ? '' : o.metadata.startedAt,
                endedAt: (o.metadata === undefined || o.metadata.endedAt === undefined) ? '' : o.metadata.endedAt,
                employee: (o.metadata.employee === undefined || o.metadata.employee.name === undefined) ? '' : o.metadata.employee.name,
                client: (o.metadata.client === undefined || o.metadata.client.id === undefined) ? '' : o.metadata.client.id,
                site: (o.metadata === undefined || o.metadata.site === undefined) ? '' : o.metadata.site,
                phoneNumber: (o.metadata === undefined || o.metadata.phoneNumber === undefined) ? '' : o.metadata.phoneNumber,
                duration: (o.metadata === undefined || o.metadata.duration === undefined) ? '' : o.metadata.duration,
                url: (o.url === undefined) ? '' : o.url
              };
            });
            console.log(this.objlstRecording);
            this.totalCount = data.totalResults;
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

  OnViewRecording(mediasource: any) {
    try {
      this.dialog.open(VideoPlayerModalComponent, {
        width: '900px',
        data: {
          mediasource: mediasource,
          title: 'Recording'
        }
      });
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

  getSelectedRow() {
    return this.selectedRow;
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

  onCallSearch() {
    try {
      this.pageSkipValue = 0;
      this.pageOffsetValue = 0;
      this.totalCount = 0;
      this.incrementalpageOffsetValue = -1;
      this.getAllCalls();
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}
