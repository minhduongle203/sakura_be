import {Controller, Get, Param} from "@nestjs/common";
import {UsersService} from "./user.service";

@Controller('user')
export class UserController {
    constructor(private usersService: UsersService) {
    }

    //Tìm kiếm người dùng theo id
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    //Tìm kiếm người dùng theo username
    @Get('name/:username')
    findByUsername(@Param('username') username: string) {
        return this.usersService.findByUsername(username);
    }

}