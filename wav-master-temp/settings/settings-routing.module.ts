import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsPageComponent } from './pages/settings.page';

import { AssignPermissionsComponent } from './components/assign-permissions/assign-permissions.component';
import { AssignRolesComponent } from './components/assign-roles/assign-roles.component';
import { AppAuthGuard } from 'src/app/core-services/app-services/auth-guard.service';

const routes: Routes = [
  {
    path: '', component: SettingsPageComponent, pathMatch: 'prefix', children: [
      { path: '', pathMatch: 'full', redirectTo: '/settings/assignrole' },
      { path: 'assignpermissions', component: AssignPermissionsComponent },
      { path: 'assignrole', component: AssignRolesComponent}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
