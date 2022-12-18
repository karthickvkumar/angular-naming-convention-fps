import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { CallReportingService } from './call-reporting.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import * as crypto from 'crypto';
// import * as screenfull from 'screenfull/dist/screenfull.js';

declare var require: any;

@Component({
  selector: 'app-call-reporting',
  templateUrl: './call-reporting.component.html',
  styleUrls: ['./call-reporting.component.css']
})
export class CallReportingComponent implements OnInit {

  tableRows = [
  ];
  varRowLimit = 10;
  tableLoadingIndicator = false;
  objlstAgents = [];
  objlstSelectedAgents = [];
  objlstClients = [];
  objlstSelectedClients = [];
  objlstEvaluationForms = [];
  objlstDisposition = [];
  objlstDispositionFiltered = [];


  objSelectedEvaluationFormId: any;
  pageSkipValue = 0;
  pageOffsetValue = 0;
  isAudioPlaying = false;
  selectedRecordingFile: string;
  totalCount = 0;
  bsValue = new Date();
  bsRangeValue: Date[];
  minDate = new Date();
  maxDate = new Date();
  showFilters = false;
  isPageLoaded = false;
  showAgents = false;
  sortOrderColumnName = 'callstartdatetime';
  sortOrderDirection = 'asc';
  showPage = false;
  selectedRow = [];
  minduration = '15';
  objDisposition = '';
  objDispositionType = 'CG';

  urlSafe: SafeResourceUrl;

  @ViewChild('showfullimage')
  showfullimage: ElementRef;

  _showfullscreen = false;

  constructor(
    private callReportingService: CallReportingService,
    private audioService: AudioPlayerService,
    public appState: ApplicationStateService,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private errorService: ErrorHandlerService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    try {

      const json_input = { 'dashboard': '410160', 'embed': 'v2', 'filters': [], 'visible': [] };

      json_input.filters = this.appState.objPeriscopeFilters;
      json_input.visible = this.appState.objPeriscopeFilterVisible;

      // console.log(JSON.stringify(json_input));

      const encoded_json = encodeURIComponent(JSON.stringify(json_input));

      const periscopeurl = '/api/embedded_dashboard?data=' + encoded_json;

      if (!this.appState.objSignature) {

        const api_key = '5db095bc-3efa-4537-88ef-fdc844636';

        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', api_key);

        hmac.update(periscopeurl);
        const sig = hmac.digest('hex');
        this.appState.objSignature = sig;
        // console.log(sig);
        // console.log(`https://www.periscopedata.com${periscopeurl}&signature=${sig}`);
      }

      const url = `https://www.periscopedata.com${periscopeurl}&signature=${this.appState.objSignature}`;
      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  showFullScreen(event): void {
    try {
      const _that = this;
      const screenfull = require('screenfull');
      if (screenfull.enabled) {
        screenfull.on('change', () => {
          // console.log('Am I fullscreen?', screenfull.isFullscreen ? 'Yes' : 'No');
          if (!screenfull.isFullscreen) {
            _that._showfullscreen = false;
          }
          if (screenfull.isFullscreen) {
            _that._showfullscreen = true;
          }
        });
        screenfull.request(this.showfullimage.nativeElement);
        screenfull.exit();
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  appendIframe() {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.height = '768';
      iframe.style.width = '1024';
      iframe.src = 'https://app.periscopedata.com/shared/b2b16bec-eff7-442f-9cf1-1134f747ca6d';
      document.body.appendChild(iframe);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}

