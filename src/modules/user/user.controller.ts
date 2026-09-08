import {Controller, Get, Param, UseGuards} from "@nestjs/common";
import {UsersService} from "./user.service";
import {JwtAuthGuard} from "../../common/guards/jwt-auth.guard";

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private usersService: UsersService) {
    }

    //Tìm kiếm người dùng theo id — yêu cầu đăng nhập
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    //Tìm kiếm người dùng theo username — yêu cầu đăng nhập, không trả hashedPassword
    @Get('name/:username')
    findByUsername(@Param('username') username: string) {
        return this.usersService.findByUsernamePublic(username);
    }

}