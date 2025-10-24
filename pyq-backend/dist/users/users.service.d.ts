import { SupabaseService } from '../common/supabase.service';
export interface User {
    id: string;
    username: string;
    name: string;
    password: string;
    created_at: string;
}
export declare class UsersService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(username: string, name: string, password: string): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
    validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
