import { Howl } from 'howler';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';
import { interval } from 'rxjs/internal/observable/interval';
import { AudioControls } from '../../core-models/audio-controls';
import { AudioPlayerService } from '../../core-services/ui-services/audio-player.service';
import { ApplicationStateService } from '../../core-services/app-services/applicationstate.service';
import { LoadEvaluation } from '../../core-models/loadevaluation';
import { Router, NavigationEnd } from '@angular/router';
import { PageLoaderService } from '../../core-services/ui-services/page-loader.service';
import { ErrorHandlerService } from '../../core-services/ui-services/error-handler.service';
import { CallInfo } from '../../core-models/callinfo';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from 'src/app/core-components/confirmation/confirmation.component';
import * as utils from 'lodash';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit {
  player: Howl;
  audioPlayer: Subject<String>;
  isAudioPlaying = false;
  audioPlayerDisabled = true;
  audioControls = AudioControls;
  currentUrl: string;
  playerTimer = '00:00 / 00:00';
  subAudioPlayerTimer: Subscription;
  audioPlayedDuration = 0;
  sliderValue = 0;
  disableEvaluate = false;
  loadEvaluation: LoadEvaluation;
  callInfo: CallInfo;
  hidePlayerBar = false;
  currentIndex: number;
  enableNext: boolean;
  enablePrevious: boolean;
  displayPlaylistPopup = false;
  playListVisible = false;
  agentname = '';
  alive = true;
  showPlayer = true;

  // audios =
  //   ['https://dialer-pq-apse1-lp2.citizensdisability.com/RECORDINGS/2019/08/23/20190823-185951_3185075131_OUTSOURC_TOG2542_V8231859390036405735_-all.wav',
  //     'https://dialer-pq-apse1-lp2.citizensdisability.com/RECORDINGS/2019/08/23/20190823-185919_5044737617_OUTSOURC_TOG2525_V8231859000036530715_-all.wav',
  //     'https://dialer-pq-apse1-lp2.citizensdisability.com/RECORDINGS/2019/08/23/20190823-185857_3472802477_OUTSOURC_OG181321_V8231858310036554361_-all.wav'
  // ];
  constructor(
    public audioPlayerService: AudioPlayerService,
    public stateService: ApplicationStateService,
    public router: Router,
    public dialog: MatDialog,
    private pageLoaderService: PageLoaderService,
    private errorService: ErrorHandlerService
  ) { }

  ngOnInit() {
    try {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // tslint:disable-next-line:max-line-length
          this.hidePlayerBar = (this.router.routerState.snapshot.url === '/login' || this.router.routerState.snapshot.url === '/logout');
        }
      });
      this.stateService.isDownload.subscribe(d => {
        this.showPlayer = d;
      })
      this.stateService.selectedCallInfo.subscribe(d => {
        this.callInfo = d;
        if (d && d['audioUrl']) {
          this.agentname = d['agentinfo'];
        }
      });
      this.currentIndex = 0;
      this.audioPlayer = this.audioPlayerService.getAudioPlayerSubscription();
      this.stateService.loadEvaluation.subscribe(d => {
        this.loadEvaluation = d;
      });
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.disableEvaluate = !(this.router.routerState.snapshot.url === '/callsearch');
        }
      });
      this.enableNextPrev();
      const that = this;
      this.setupControls();
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
  displayPlaylist() {
    this.displayPlaylistPopup = !this.displayPlaylistPopup;
  }
  loadAudioFromPlaylist(name, index) {
    this.currentUrl = this.audioPlayerService.audios[index]['url'];
    if (index) {
      this.currentIndex = index;
    } else if (index === 0) {
      this.currentIndex = index;
    }
    this.stopPlayer();
    this.enableNextPrev();
    this.audioPlayerService.audioUrl = this.audioPlayerService.audios[index]['url'];
    this.agentname = this.audioPlayerService.audios[index]['name'];
    this.resetPlayer();
    this.audioPlayerService.startPlaying();
    this.configurePlayer();
  }
  setupControls() {
    try {
      this.audioPlayer.subscribe(control => {
        switch (control) {
          case this.audioControls.play:
            this.enableNextPrev();
            this.playAudio();
            break;
          case this.audioControls.pause:
            if (this.player && this.player.playing()) {
              this.player.pause();
            }
            break;
          case this.audioControls.stop:
            this.stopPlayer();
            break;
          case this.audioControls.reset:
            this.resetPlayer();
            break;
          case this.audioControls.next:
            this.playNext();
            break;
          case this.audioControls.previous:
            this.playPrevious();
            break;
          default:
            break;
        }
      });
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  startPlayerTimer() {
    try {
      if (this.audioPlayedDuration === 0) {
        this.subAudioPlayerTimer = interval(100)
          .subscribe((d) => {
            if (this.player && this.player.playing()) {
              const currentTime = Math.ceil(+this.player.seek());
              const totalTime = Math.ceil(+this.player.duration());
              this.audioPlayedDuration = currentTime;
              // tslint:disable-next-line:max-line-length
              this.playerTimer = `${this.durationToMinutesSeconds(currentTime)} / ${this.durationToMinutesSeconds(totalTime)}`;
            }
          });
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  roundUpValues(value) {
    try {
      return Math.ceil(value);
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  seekPlayer(value) {
    try {
      value = value < 0 ? 0 : value;
      this.player.seek(value);
      if (!this.player.playing()) {
        this.audioPlayerService.startPlaying();
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }
  playPrevious() {
    this.currentIndex = this.currentIndex - 1;
    this.agentname = this.audioPlayerService.audios[this.currentIndex]['name'];
    this.stopPlayer();
    this.enableNextPrev();
    if (this.enablePrevious || this.currentIndex === 0) {
      this.currentUrl = this.audioPlayerService.audios[this.currentIndex]['url'];
      this.audioPlayerService.audioUrl = decodeURIComponent(this.audioPlayerService.audios[this.currentIndex]['url']);
      // this.playAudio();
      this.resetPlayer();
      this.configurePlayer();
      this.audioPlayerService.startPlaying();
    }
  }
  playNext() {
    this.currentIndex = this.currentIndex + 1;
    this.agentname = this.audioPlayerService.audios[this.currentIndex]['name'];
    this.stopPlayer();
    this.enableNextPrev();
    if (this.enableNext || (this.currentIndex === (this.audioPlayerService.audios.length - 1))) {
      this.currentUrl = this.audioPlayerService.audios[this.currentIndex]['url'];
      this.audioPlayerService.audioUrl = decodeURIComponent(this.audioPlayerService.audios[this.currentIndex]['url']);
      // this.playAudio();
      this.resetPlayer();
      this.configurePlayer();
      this.audioPlayerService.startPlaying();

    }
  }
  isPlaylistVisible() {
    if (this.audioPlayerService.audios && this.audioPlayerService.audios.length === 1) {
      this.playListVisible = false;
      this.currentIndex = 0;
      // this.currentUrl = this.audioPlayerService.audios[0]['url'];
    } else if (this.audioPlayerService.audios && this.audioPlayerService.audios.length > 1) {
      this.playListVisible = true;
    }
  }
  enableNextPrev() {
    this.isPlaylistVisible();
    if (this.currentIndex >= (this.audioPlayerService.audios.length - 1)) {
      this.enableNext = false;
      this.enablePrevious = true;
    } else if (this.currentIndex <= 0) {
      this.enableNext = true;
      this.enablePrevious = false;
    } else {
      this.enableNext = true;
      this.enablePrevious = true;
    }
  }
  onEvaluate() {
    try {
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
          this.audioPlayerService.acceptEvaluation(this.loadEvaluation['callid'], {
            'evaluation_form_id': this.loadEvaluation['formid'],
            'status': 'accepted',
            'assigned_to': this.stateService.loggedInUser.id
          })
            .takeWhile(() => this.alive)
            .subscribe(data => {
              if (data) {
                this.stateService.objEvaluationDetails = data.evaluation;
                if (this.callInfo && this.callInfo !== null) {
                  this.stateService.isCallEditClicked = true;
                  this.stateService.callSearchFilter = this.callInfo.searchFilter;
                  const queryParams = {};
                  queryParams['callid'] = this.callInfo.callId;
                  queryParams['evaluationid'] = data['evaluation']['id'];

                  if (this.callInfo.evaluationStatus === 'inprogress' || this.callInfo.evaluationStatus === 'assigned') {
                    // queryParams['evaluationid'] = this.callInfo.evaluationResponseId;
                    queryParams['evaluationid'] = data['evaluation']['id'];
                  } else if (this.callInfo.evaluationStatus === 'todo') {
                    queryParams['formid'] = this.callInfo.evaluationFormId;
                    queryParams['evaluationid'] = data['evaluation']['id'];
                  }
                  this.pageLoaderService.displayPageLoader(true);
                  this.router.navigate(['callevaluation'], { queryParams: queryParams });
                }
              };
            });
        }
      });

    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  durationToMinutesSeconds(duration: number) {
    try {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration - (minutes * 60));
      const min = minutes <= 9 ? `0${minutes}` : minutes;
      const sec = seconds <= 9 ? `0${seconds}` : seconds;
      return `${min}:${sec}`;
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  isPlaying() {
    return this.isAudioPlaying;
  }

  /*
  onNavigate(url) {
    try {
      this.pageLoaderService.displayPageLoader(true);
      this.router.navigateByUrl(url);
    } catch (e) {
      console.error(e);
    }
  }
  */
  findTheIndex(arr, url) {
    utils.findIndex(arr,
      function (o) { return o['url'] == url; });
  }
  playAudio() {
    try {
      if (this.currentUrl !== this.audioPlayerService.audioUrl) {
        this.currentUrl = this.audioPlayerService.audioUrl;
        this.agentname = this.audioPlayerService.audios[this.currentIndex]['name'];
        // this.currentIndex = this.findTheIndex(this.audioPlayerService.audios, this.currentUrl) ? this.findTheIndex(this.audioPlayerService.audios, this.currentUrl) : 0;
        this.audioPlayerDisabled = true;
        this.resetPlayer();
        this.configurePlayer();
      }
      if (!this.isAudioPlaying) {
        this.player.play();
      }
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  resetPlayer() {
    if (this.player) {
      this.player.stop();
    }
    //this.callInfo = null;
    this.audioPlayedDuration = 0;
  }

  stopPlayer() {
    if (this.player) {
      this.player.stop();
      //this.player = null;
      this.player = undefined;
    }
    this.audioPlayedDuration = 0;
    if (this.subAudioPlayerTimer) {
      this.subAudioPlayerTimer.unsubscribe();
    }
  }


  configurePlayer() {
    const that = this;
    this.player = new Howl({
      src: [this.audioPlayerService.audioUrl],
      volume: 0.5,
      html5: true,
      autoplay: true,
      onplayerror: function (error, mes) {
        if (that.player) {
          that.player.pause();
        }
      },
      onpause: function () {
        that.isAudioPlaying = false;
      },
      onplay: function () {
        that.startPlayerTimer();
        that.isAudioPlaying = true;
        that.audioPlayerDisabled = false;
      },
      onend: function () {
        that.isAudioPlaying = false;
        // tslint:disable-next-line:max-line-length
        that.playerTimer = `${that.durationToMinutesSeconds(Math.ceil(+that.player.duration()))} / ${that.durationToMinutesSeconds(Math.ceil(+that.player.duration()))}`;
        that.audioPlayerService.getAudioPlayerSubscription().next('stop');
      }
    });

    this.player.play();
  }

}
