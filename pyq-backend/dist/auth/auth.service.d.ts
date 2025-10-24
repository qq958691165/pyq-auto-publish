import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(username: string, name: string, password: string): Promise<{
        message: string;
        user: {
            id: string;
            username: string;
            name: string;
        };
    }>;
    login(username: string, password: string): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            name: string;
        };
    }>;
    validateUser(userId: string): Promise<{
        userId: string;
    }>;
}
