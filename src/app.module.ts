import {Module} from '@nestjs/common';
import {DatabaseConfigModule} from './config/database/database-config.module';
import {ConfigModule} from '@nestjs/config';
import {AuthModule} from "./auth/auth.module";
import {SessionsModule} from "./modules/sesson/session.module";
import {UsersModule} from "./modules/user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseConfigModule,
        AuthModule,
        SessionsModule,
        UsersModule,
    ],
})
export class AppModule {
}
