import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageLoaderService } from 'src/app/core-services/ui-services/page-loader.service';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-online-help',
  templateUrl: './online-help.component.html',
  styleUrls: ['./online-help.component.css']
})
export class OnlineHelpComponent implements OnInit, OnDestroy {

  objLoadOptions;
  alive = true;

  urlSafe: SafeResourceUrl;

  @ViewChild('showfullimage')
  showfullimage: ElementRef;

  _showfullscreen = false;

  constructor(private route: ActivatedRoute,
    private pageLoaderService: PageLoaderService,
    private errorService: ErrorHandlerService,
    public sanitizer: DomSanitizer,
    private router: Router) { }

  ngOnInit() {
    
  }

  getRouteParams() {
    try {
      this.route.params.subscribe(paramValues => {
        this.objLoadOptions = paramValues['option'];
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  loadiFrameWithDoc() {
    try {
      let url = '';
      switch (this.objLoadOptions) {
        case 'userdoc':
          url = `https://angular.io/guide`;
          break;
        default:
          url = `https://angular.io/guide/releases`;
      }
      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  /*
  appendIframe() {
    var iframe = document.createElement('iframe');
    iframe.src = '/user-manual/user-doc.html';
    document.getElementById("userManual").appendChild(iframe);
  }
  */

  ngOnDestroy(): void {
    try {
      this.alive = false;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

}
