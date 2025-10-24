import { SupabaseService } from '../common/supabase.service';
export declare class ConfigService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getConfig(key: string): Promise<string | null>;
    setConfig(key: string, value: string, description?: string): Promise<boolean>;
    getAllConfigs(): Promise<any[]>;
    getSyncInterval(): Promise<number>;
    setSyncInterval(minutes: number): Promise<boolean>;
}
