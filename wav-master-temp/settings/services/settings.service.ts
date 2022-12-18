import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserWithRole } from '../models/user-with-role';
import { UserRole } from '../models/user-role';
import { UserPermission } from '../models/user-permission';
import { environment } from 'src/environments/environment';

@Injectable()
export class SettingsService {
    constructor(
        private http: HttpClient
    ) { }

    getAllUsers(postValues) {
        return this.http.post<{count: number, users: UserWithRole[]}>(`${environment.wavelengthApiUrl}/listusers`, postValues);
    }

    getAllUserRolesWithPermissions() {
        return this.http.get<UserRole[]>(`${environment.wavelengthApiUrl}/listroles`);
    }

    getAllAvailablePermissions() {
        return this.http.get<UserPermission[]>(`${environment.wavelengthApiUrl}/listpermissions`);
    }

    assignRole(postValues) {
        return this.http.post(`${environment.wavelengthApiUrl}/assignrole`, postValues);
    }

    assignpermissions(postvalues) {
        return this.http.post(`${environment.wavelengthApiUrl}/assignpermissions`, postvalues);
    }
}
