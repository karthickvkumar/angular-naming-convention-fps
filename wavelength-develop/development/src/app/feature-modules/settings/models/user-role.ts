import { UserPermission } from './user-permission';

export class UserRole {
    id: number;
    name: string;
    pages: UserPermission[];
}
