import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';

@Injectable()
export class WindowDialogService {
    confirm(message?: string): Observable<boolean> {
        const confirmation = window.confirm(message || 'Are you sure?');
        return Observable.of(confirmation);
    }
}
