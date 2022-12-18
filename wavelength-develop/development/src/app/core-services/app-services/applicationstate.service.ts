import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs/internal/Subject';
import { LoadEvaluation } from '../../core-models/loadevaluation';
import { CallInfo } from '../../core-models/callinfo';
import { LoggedInUser } from 'src/app/core-models/loggedinuser';
import { AppEnum } from 'src/app/core-models/app-enum';
import { Tags } from 'src/app/core-models/evaluationform';


@Injectable()
export class ApplicationStateService {
    preDataSubject: BehaviorSubject<any> = new BehaviorSubject(null);
    loadEvaluation: BehaviorSubject<LoadEvaluation> = new BehaviorSubject(null);
    selectedCallInfo: BehaviorSubject<CallInfo> = new BehaviorSubject(null);
    isSiteAllowed: BehaviorSubject<any> = new BehaviorSubject(false);
    permissions: any;
    enums: AppEnum;
    objEvaluationFormInprogress = false;
    objSignature: any;
    objlstTags: Tags[];
    objPeriscopeFilters: any[];
    objPeriscopeFilterVisible: any[];
    dispositions:  BehaviorSubject<any> = new BehaviorSubject(null);
    agents: any[] = [];
    sites: any[];
    evaluationforms: any[];
    callSearchEvalForms: BehaviorSubject<any> = new BehaviorSubject(null);
    callEvalForms: any[];
    supervisors: any[];
    loggedInUser: LoggedInUser;
    callDetails: any;
    returnUrl = '';
    callSearchFilter: any;
    evaluationSearchFilter: any;
    ackSearchFilter: any;
    loggedInUserName = '';
    accessiblePages: string[] = [];
    menus: string[] = [];
    operations: string[] = [];
    isCallEditClicked = false;
    objAudioPlayerDisablePageList = ['/login', '/logout', '/acknowledgecalls'];
    objEvaluationsId;
    objEvaluationDetails;
    evaluation_status;
    status_list;
    callCampGrps;
    callCampSkills;
    evalCampGrps;
    evalCampSkills;
    evalAgents;
    callAgents;
    isDownload : BehaviorSubject<any> = new BehaviorSubject(null);
    unreadCount: BehaviorSubject<any> = new BehaviorSubject(null);
    constructor(
        private router: Router,
        private http: HttpClient) {
    }

    public IsAuthenticated() {
        const token = localStorage.getItem('jwtauthtoken');
        return token === undefined || token === null ? false : true;
    }
    public setupAccessiblePagesForUser() {
        const userRole = this.loggedInUser.role.trim().toLowerCase();
        this.accessiblePages = this.loggedInUser.pages.map(d => d.page);
        this.accessiblePages.push('reporting');
        this.accessiblePages.push('recordings');
        this.menus = this.loggedInUser.pages.map(d => d.page);
        const permissionObjects = [];
        this.loggedInUser.pages.forEach(p => {
            permissionObjects.push(...p.permissions);
        });
        this.operations = permissionObjects.map(p => p.name);
        /* switch (userRole) {
             case 'agent':
                 this.accessiblePages = ['callsearch', 'viewevaluation'];
                 this.menus = ['callsearch'];
                 this.operations = ['pdfdownload'];
                 break;
             case 'administrator':
                 this.accessiblePages = ['callsearch', 'callevaluation', 'viewevaluation', 'acknowledgecalls', 'settings'];
                 this.menus = ['callsearch', 'acknowledgecalls'];
                 this.operations = ['pdfdownload', 'exceldownload'];
                 break;
             case 'supervisor':
                 this.accessiblePages = ['callsearch', 'callevaluation', 'viewevaluation', 'acknowledgecalls'];
                 this.menus = ['callsearch', 'acknowledgecalls'];
                 this.operations = ['pdfdownload'];
                 break;
             case 'qa specialist':
                 this.accessiblePages = ['callsearch', 'callevaluation', 'viewevaluation'];
                 this.menus = ['callsearch'];
                 this.operations = ['pdfdownload'];
                 break;
             case 'qa manager':
                 this.accessiblePages = ['callsearch', 'callevaluation', 'viewevaluation', 'acknowledgecalls'];
                 this.menus = ['callsearch', 'acknowledgecalls'];
                 this.operations = ['pdfdownload', 'exceldownload'];
                 break;
             default:
                 this.accessiblePages = ['callsearch', 'callevaluation', 'viewevaluation'];
                 this.menus = ['callsearch'];
                 this.operations = ['pdfdownload', 'exceldownload'];
                 break;
         } */
    }

    public isPageAccessible(pageName: string) {
        return this.accessiblePages.map(d => d.trim().toLowerCase()).includes(pageName.trim().toLowerCase());
    }

    public isMenuAvailable(menuName: string) {
        return this.menus.map(d => d.trim().toLowerCase()).includes(menuName.trim().toLowerCase());
    }

    public isOperationAvailable(operationName: string) {
        return this.operations.map(d => d.trim().toLowerCase()).includes(operationName.trim().toLowerCase());
    }

    public createMultiselectValueFromFilter(value: string) {
        if (value && value.trim().length === 0) {
            return [];
        } else {
            return (value.trim().split(',')).filter(Boolean);
        }
    }

    public changeNullToEmptyString(value: string) {
        if (value && value != null) {
            return value;
        } else {
            return '';
        }
    }

    public changeNullToZero(value: string) {
        if (value && value != null) {
            return value;
        } else {
            return '0';
        }
    }
    public changeEmptyStringToNull(value: string) {
        if (value && value !== '' && value.length > 0) {
            return value;
        } else {
            return null;
        }
    }
}
