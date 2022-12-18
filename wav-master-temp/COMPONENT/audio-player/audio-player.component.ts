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
  constructor(
    public audioPlayerService: AudioPlayerService,
    public stateService: ApplicationStateService,
    public router: Router,
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
      this.stateService.selectedCallInfo.subscribe(d => {
        this.callInfo = d;
      });
      this.audioPlayer = this.audioPlayerService.getAudioPlayerSubscription();
      this.stateService.loadEvaluation.subscribe(d => {
        this.loadEvaluation = d;
      });
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.disableEvaluate = !(this.router.routerState.snapshot.url === '/callsearch');
        }
      });
      const that = this;
      this.setupControls();
    } catch (e) {
      this.errorService.logUnknownError(e);
    }
  }

  setupControls() {
    try {
      this.audioPlayer.subscribe(control => {
        switch (control) {
          case this.audioControls.play:
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

  onEvaluate() {
    try {
      if (this.callInfo && this.callInfo !== null) {
        this.stateService.isCallEditClicked = true;
        this.stateService.callSearchFilter = this.callInfo.searchFilter;
        const queryParams = {};
        queryParams['callid'] = this.callInfo.callId;

        if (this.callInfo.evaluationStatus === 'inprogress') {
          queryParams['evaluationid'] = this.callInfo.evaluationResponseId;
        } else if (this.callInfo.evaluationStatus === 'todo') {
          queryParams['formid'] = this.callInfo.evaluationFormId;
        }
        this.pageLoaderService.displayPageLoader(true);
        this.router.navigate(['callevaluation'], { queryParams: queryParams });
      }
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

  playAudio() {
    try {
      if (this.currentUrl !== this.audioPlayerService.audioUrl) {
        this.currentUrl = this.audioPlayerService.audioUrl;
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
    this.callInfo = null;
    this.audioPlayedDuration = 0;
  }

  stopPlayer() {
    if (this.player) {
      this.player.stop();
      this.player = null;
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
