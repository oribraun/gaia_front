export class User {
    id!: number;
    username!: string;
    email!: string;
    role!: number;
    role_display!: string;
    company_name!: string;
    company_admin!: boolean
    gmail_auth!: boolean

    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    // @ts-ignore
                    this[key] = obj[key];
                }
            }
        }
    }
}
