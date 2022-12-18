import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AudioPlayerService } from 'src/app/core-services/ui-services/audio-player.service';

@Component({
    templateUrl: 'logout.component.html',
    styleUrls: ['logout.component.css']
})
export class LogoutComponent {

    constructor(private router: Router,
        private audioPlayerService: AudioPlayerService) {
        localStorage.clear();
        this.audioPlayerService.stopPlaying();
    }
    onLogin() {
        this.router.navigateByUrl('/login');
    }
}
