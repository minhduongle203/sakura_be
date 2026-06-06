import {Module} from "@nestjs/common";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {JwtStrategy} from "../common/strategies/jwt.strategy";
import {ConfigModule} from "@nestjs/config";
import {SessionsModule} from "../modules/session/session.module";
import {UsersModule} from "../modules/user/user.module";

@Module({
    imports: [
        ConfigModule,
        SessionsModule,
        UsersModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}