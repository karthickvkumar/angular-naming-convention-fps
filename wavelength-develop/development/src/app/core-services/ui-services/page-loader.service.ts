import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';


@Injectable()
export class PageLoaderService {

    private showPageLoaderSub: BehaviorSubject<boolean> = new BehaviorSubject(false);

    getSubscription() {
        return this.showPageLoaderSub;
    }

    displayPageLoader(value: boolean) {
        this.showPageLoaderSub.next(value);
    }

}
