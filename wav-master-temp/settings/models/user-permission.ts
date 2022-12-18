export class UserPermission {
    page: string;
    permissions: Permissions[];
}

export class Permissions {
    id: number;
    name: string;
    mandatory: number;
    page: string;
}

