import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { UserRole } from '../../models/user-role';
import { MatDialog } from '@angular/material/dialog';
import { AssignPermissionsModalComponent } from '../../modals/assignpermissions/assign-permission-modal.component';
import { UserPermission } from '../../models/user-permission';
import { PageLoaderService } from 'src/app/core-services/ui-services/page-loader.service';
import { NotificationService } from 'src/app/core-services/ui-services/notification.service';
import { ErrorHandlerService } from 'src/app/core-services/ui-services/error-handler.service';

@Component({
    templateUrl: './assign-permissions.component.html',
    styleUrls: ['./assign-permissions.component.css']
})
export class AssignPermissionsComponent implements OnInit {
    objlstRoles: UserRole[] = [];
    checked = true;
    step = -1;
    selectedPanel = '';
    pages = [
    ];

    progress = false;
    progressMessage = 'Please wait....';
    showPage = false;
    objlstRolesWithPermissions: UserRole[] = [];
    objlstAllUserPermissions: UserPermission[] = [];
    objlstRoleNamesAndId: { name: string, id: number }[] = [];
    objSelectedRoleName = '';
    constructor(
        private settingsService: SettingsService,
        public dialog: MatDialog,
        private pageLoaderService: PageLoaderService,
        private notificationService: NotificationService,
        private errorService: ErrorHandlerService
    ) { }

    ngOnInit() {

        try {
            this.pageLoaderService.displayPageLoader(false);
            this.pageLoaderService.getSubscription().subscribe(value => {
                this.showPage = !value;
            });
            this.setupPage();
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    async setupPage() {
        try {
            this.objlstRolesWithPermissions = await this.settingsService.getAllUserRolesWithPermissions().toPromise();
            this.objlstAllUserPermissions = await this.settingsService.getAllAvailablePermissions().toPromise();
            this.objlstRoleNamesAndId = this.objlstRolesWithPermissions
                .filter((d => d.id !== 1))
                .map(a => {
                    const value = {
                        name: a.name,
                        id: a.id
                    };

                    return value;
                });
            this.objSelectedRoleName = this.objlstRoleNamesAndId[0].name;
            this.setDefaultValues();
            this.onRoleChanged();
        } catch (e) {
            this.errorService.logUnknownError(e);
        }

    }


    setDefaultValues() {
        try {
            this.pages = [];
            this.objlstAllUserPermissions.map(data => {
                const page = {
                    name: data.page,
                    isChecked: false,
                    permissions: data.permissions.map(p => {
                        const permission = {
                            name: p.name,
                            id: p.id,
                            mandatory: p.mandatory === 0 ? false : true,
                            isChecked: p.mandatory === 1 ? true : false,
                        };
                        return permission;
                    })
                };

                this.pages.push(page);
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }

    }

    onRoleChanged() {
        try {
            this.setDefaultValues();
            // tslint:disable-next-line:max-line-length
            const selectedRolePermissions = this.objlstRolesWithPermissions.find(d => d.name.toLowerCase() === this.objSelectedRoleName.toLowerCase());
            const selectedPages = selectedRolePermissions.pages;
            const selectedPageNames = selectedPages.map(p => p.page);
            this.pages.forEach(p => {
                if (selectedPageNames.includes(p.name)) {
                    const selectedPage = selectedPages.find(pa => pa.page === p.name);
                    const selectedPermissions = selectedPage.permissions.map(s => s.name);
                    p.isChecked = true;
                    p.permissions.map(pe => {
                        pe.isChecked = selectedPermissions.includes(pe.name);
                    });
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }

    }

    onSaveChanges() {
        try {
            const selectedPages = this.pages.filter(p => p.isChecked === true);
            const selectedpermissions = [];
            selectedPages.forEach(p => {
                const checkedPermissions = p.permissions.filter(pe => pe.isChecked === true);
                checkedPermissions.forEach(pe => {
                    selectedpermissions.push(pe.id);
                });
            });

            const selectedRole = this.objlstRoleNamesAndId.find(r => r.name === this.objSelectedRoleName);
            const postValues = {
                'role_id': selectedRole.id,
                'permissions': selectedpermissions
            };

            this.settingsService.assignpermissions(postValues).subscribe((result) => {
                this.objlstRolesWithPermissions = result['permissions'];
                this.notificationService.displayToaster('Changed has been saved successfully');
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }


    }

    onPermissionChanged(pageIndex, permissionIndex) {
        try {
            const page = this.pages[pageIndex];
            const permission = page.permissions[permissionIndex];
            if (!permission.mandatory) {
                permission.isChecked = !permission.isChecked;
            }
            page[permissionIndex] = permission;
            const ps: any[] = page.permissions;
            const totalChecked = ps.filter(p => p.isChecked).length;
            if (totalChecked === 0) {
                page.isChecked = false;
            }
            this.pages[pageIndex] = page;
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }
    setstep(value) {
        try {
            if (this.checked) {
                this.step = value;
            }
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    checkAllPermissionsForPage(pageIndex) {
        try {
            const page = this.pages[pageIndex];
            if (page.isChecked) {
                page.permissions.forEach(p => {
                    p.isChecked = true;
                });
                this.pages[pageIndex] = page;
            }
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }

    openPanel(page) {
        try {
            if (page.isChecked) {
                this.selectedPanel = page.name;
            }
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }


    onOpenDialog(index) {
        try {
            const tableRow = this.objlstRoles[index];
            this.dialog.open(AssignPermissionsModalComponent, {
                width: '700px',
                data: {
                }
            });
        } catch (e) {
            this.errorService.logUnknownError(e);
        }
    }
    
    onChipsToggle(toggleChipsEvent) {
    toggleChipsEvent.isChecked = !toggleChipsEvent.isChecked;
  }
}

