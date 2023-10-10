export class User {
    id!: number;
    username!: string;
    email!: string;
    role!: number;
    role_display!: string;
    company_name!: string;
    gaia_admin!: boolean;
    company_admin!: boolean
    gmail_auth!: boolean

    constructor(v: Partial<User> = {}) {
        Object.assign(this, v);
    }
}
