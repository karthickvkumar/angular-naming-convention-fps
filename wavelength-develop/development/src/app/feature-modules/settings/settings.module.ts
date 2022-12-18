import { MatDialogModule } from '@angular/material/dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsPageComponent } from './pages/settings.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SettingsService } from './services/settings.service';
import { AssignPermissionsModalComponent } from './modals/assignpermissions/assign-permission-modal.component';
import { AssignRoleModalComponent } from './modals/assignrole/assign-role-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AssignRolesComponent } from './components/assign-roles/assign-roles.component';
import { AssignPermissionsComponent } from './components/assign-permissions/assign-permissions.component';
import {MatChipsModule} from '@angular/material/chips';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    MatCardModule,
    FormsModule,
    NgxDatatableModule,
    NgSelectModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatChipsModule
  ],
  declarations: [
    SettingsPageComponent,
    AssignRolesComponent,
    AssignPermissionsComponent,
    AssignPermissionsModalComponent,
    AssignRoleModalComponent
  ],
  providers: [SettingsService],
  entryComponents: [AssignPermissionsModalComponent, AssignRoleModalComponent]
})
export class SettingsModule { }
