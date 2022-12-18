import { AudioControls } from '../../core-models/audio-controls';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class AudioPlayerService {
    
    isAudioPlaying = false;
    audioUrl = '';
    audios = [];
    is_Evaluate = true;
    private audioControls = AudioControls;
    private subAudioPlayerControl: BehaviorSubject<string> = new BehaviorSubject(null);
    constructor(
        private http: HttpClient
    ) {}

    startPlaying() {
        this.subAudioPlayerControl.next(this.audioControls.play);
    }

    stopPlaying() {
        this.subAudioPlayerControl.next(this.audioControls.stop);
    }

    pausePlaying() {
        this.subAudioPlayerControl.next(this.audioControls.pause);
    }

    resetPlaying() {
        this.subAudioPlayerControl.next(this.audioControls.reset);
    }
    playNext() {
        this.subAudioPlayerControl.next(this.audioControls.next);
    }
    playPrevious() {
        this.subAudioPlayerControl.next(this.audioControls.previous);
    }

    getAudioPlayerSubscription() {
        return this.subAudioPlayerControl;
    }
    acceptEvaluation(call_id: any, objSurvey: any) {
        return this.http.post<any>(environment.wavelengthApiUrl + `/call/${call_id}/evaluation`, objSurvey);
    }

}

