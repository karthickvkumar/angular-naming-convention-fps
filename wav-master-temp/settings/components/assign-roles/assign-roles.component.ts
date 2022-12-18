import { Component, OnInit, ViewChild } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { UserWithRole } from '../../models/user-with-role';
import { UserRole } from '../../models/user-role';
import { MatDialog } from '@angular/material/dialog';
import { AssignRoleModalComponent } from '../../modals/assignrole/assign-role-modal.component';
import { NotificationService } from 'src/app/core-services/ui-services/notification.service';
import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PageLoaderService } from 'src/app/core-services/ui-services/page-loader.service';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
    templateUrl: './assign-roles.component.html',
    styleUrls: ['./assign-roles.component.css']
})
export class AssignRolesComponent implements OnInit {

    @ViewChild(DatatableComponent) table: DatatableComponent;
    objlstUserWithRoles: UserWithRole[] = [];
    objTextSearch = '';
    showPage = false;
    objlstSelectedUsers: any[] = [];
    objlstUserRoles: UserRole[] = [];
    objlstSelectedUserRoles: any[] = [];
    tableRowCount = 0;
    skipCount = 0;
    takeCount = 10;
    pageOffsetValue = 0;
    tableLoadingIndicator = false;
    sortOrderColumnName = 'name';
    sortOrderDirection = 'asc';
    subTextSearch: Subject<string> = new Subject();

    constructor(
        private settingsService: SettingsService,
        public dialog: MatDialog,
        private notificationService: NotificationService,
        private pageLoaderService: PageLoaderService,
        private errorService: ErrorHandlerService) { }

    ngOnInit() {
        try {
            this.pageLoaderService.getSubscription().subscribe(value => {
                this.showPage = !value;
            });
            this.setupPage();
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    setPage(value) {
        try {
            this.skipCount = value.offset * 10;
            this.getUsersList().subscribe((d) => {
                this.objlstUserWithRoles = d.users;
                this.tableRowCount = +d.count;
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }

    }

    onPageChange(pageInfo: any) {
        try {
            this.pageOffsetValue = +pageInfo.offset;
            this.skipCount = +pageInfo.offset * this.takeCount;
            this.getUsersList().subscribe((d) => {
                this.objlstUserWithRoles = d.users;
                this.tableRowCount = +d.count;
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    removeRole(index) {
        this.objlstSelectedUserRoles = this.objlstSelectedUserRoles.filter((d, i) => i !== index);
    }

    OnDDLSelectAll(controlid: string) {
        try {
            this.objlstSelectedUserRoles = this.objlstUserRoles.map(d => d.id);
            this.tableLoadingIndicator = true;
            this.getFinalSearchedData().subscribe((d) => {
                this.objlstUserWithRoles = d.users;
                this.tableRowCount = d.count;
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    OnDDLUnSelectAll(controlid: string) {
        try {
            this.objlstSelectedUserRoles = [];
            this.tableLoadingIndicator = true;
            this.getFinalSearchedData().subscribe((d) => {
                this.objlstUserWithRoles = d.users;
                this.tableRowCount = d.count;
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    async setupPage() {
        try {
            this.objlstUserRoles = await this.settingsService.getAllUserRolesWithPermissions().toPromise();
            this.objlstSelectedUserRoles = this.objlstUserRoles.map(d => d.id);
            this.tableLoadingIndicator = true;
            this.getFinalSearchedData().subscribe((d) => {
                this.objlstUserWithRoles = d.users;
                this.tableRowCount = d.count;
            });

            this.subTextSearch.
                pipe(
                    debounceTime(800),
                    distinctUntilChanged(),
                    switchMap(v => {
                        this.tableLoadingIndicator = true;
                        this.skipCount = 0;
                        this.takeCount = 10;
                        return this.getUsersList();
                    })
                )
                .subscribe(d => {
                    this.objlstUserWithRoles = d.users;
                    this.tableRowCount = d.count;
                });

        } catch (e) {
            this.errorService.logUnknownError(e);
        }

    }

    setupDataTable(data) {
        try {
            this.objlstUserWithRoles = data.users;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }


    onUserListChange() {
        try {
            this.getFinalSearchedData()
                .subscribe(d => {
                    this.objlstUserWithRoles = d.users;
                    this.tableRowCount = d.count;
                    this.table.recalculate();
                });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }

    }

    onTableSort(event) {
        try {
            const sortValues = event.sorts[0];
            const columnName = sortValues['prop'];
            if (columnName !== 'actionValues') {
                this.sortOrderDirection = sortValues['dir'];
                this.sortOrderColumnName = sortValues['prop'];
            }
            this.skipCount = 0;
            this.objlstUserWithRoles = [];
            this.tableLoadingIndicator = true;
            this.getUsersList().subscribe((d) => {
                this.objlstUserWithRoles = d.users;
                this.tableRowCount = +d.count;
                this.tableLoadingIndicator = false;
            });
        } catch (e) {
            this.tableLoadingIndicator = false;
            this.errorService.logUnknownError(e);
        }
    }

    getEmptyTableMessage() {
        try {
            const messages = {
                emptyMessage: `
              <div class="emptyMessage">
              User not found
              </div>
            `
            };
            if (this.tableRowCount) {
                messages['totalMessage'] = '';
            }

            return messages;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    getFinalSearchedData() {
        this.tableLoadingIndicator = true;
        this.skipCount = 0;
        this.takeCount = 10;
        this.tableRowCount = 0;
        this.pageOffsetValue = 0;
        return this.getUsersList();
    }

    getUsersList() {
        try {
            const postvalues = {
                roleids: this.objlstSelectedUserRoles,
                skip: this.skipCount,
                take: this.takeCount,
                sortordercolumn: this.sortOrderColumnName,
                sortorder: this.sortOrderDirection, // asc, desc
                username: this.objTextSearch
            };
            return this.settingsService.getAllUsers(postvalues).pipe(
                finalize(() => {
                    this.tableLoadingIndicator = false;
                })
            );
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }


    onOpenDialog(index) {
        try {
            const tableRow = this.objlstUserWithRoles[index];
            const result = this.dialog.open(AssignRoleModalComponent, {
                width: '400px',
                data: {
                    roles: this.objlstUserRoles,
                    username: tableRow.name,
                    userrole: tableRow.role,
                    userid: tableRow.user_id,
                    useremailid: tableRow.email
                }
            });

            result.afterClosed().subscribe(d => {
                if (d === true) {
                    this.notificationService.displayToaster('Changes saved successfully');
                    this.getUsersList().subscribe((da) => {
                        this.objlstUserWithRoles = da.users;
                        this.tableRowCount = da.count;
                        this.pageOffsetValue = 0;
                    });
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }

    }
}
