import {Module} from "@nestjs/common";
import {UsersService} from "./user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../../entities/user.entity";
import {UserController} from "./user.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [UserController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}