export class User {
    id!: number;
    username!: string;
    email!: string;
    role!: number;
    role_display!: string;
    company_name!: string;
    gaia_admin!: boolean;
    is_teacher!: boolean;
    company_admin!: boolean;
    gmail_auth!: boolean;
    birthday!: string;
    first_name!: string;
    last_name!: string;
    login_provider!: string;
    last_logged_platform!: string;
    last_lesson_id!: number;

    constructor(v: Partial<User> = {}) {
        Object.assign(this, v);
    }
}
