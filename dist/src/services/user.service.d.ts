import { RegisterInput, LoginInput, SafeUser } from "../types";
declare class UserService {
    private findUserByEmail;
    private sanitizeUser;
    register(data: RegisterInput): Promise<{
        user: SafeUser;
        token: string;
    }>;
    login(data: LoginInput): Promise<{
        user: SafeUser;
        token: string;
    }>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=user.service.d.ts.map