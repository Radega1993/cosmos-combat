import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService, RegisterDto, LoginDto } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetCurrentUser, CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@GetCurrentUser() user: CurrentUser) {
        return {
            userId: user.userId,
            username: user.username,
            role: user.role,
        };
    }
}

