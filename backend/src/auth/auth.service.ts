import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../database/schemas/user.schema';

export interface RegisterDto {
    username: string;
    email?: string;
    password: string;
}

export interface LoginDto {
    username: string;
    password: string;
}

export interface JwtPayload {
    sub: string;
    username: string;
    role: UserRole;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; token: string }> {
        const { username, email, password } = registerDto;

        // Check if user already exists
        const query: any = { username: username.toLowerCase() };
        if (email) {
            query.$or = [
                { username: username.toLowerCase() },
                { email: email.toLowerCase() },
            ];
        }

        const existingUser = await this.userModel.findOne(query);

        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userData: any = {
            username: username.toLowerCase(),
            password: hashedPassword,
            role: UserRole.USER,
            isActive: true,
        };

        if (email) {
            userData.email = email.toLowerCase();
        }

        const user = await this.userModel.create(userData);

        // Generate token
        // @ts-ignore - JWT sign returns string but TypeScript infers complex type
        const token = this.generateToken(user);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        return { user: userWithoutPassword, token };
    }

    async login(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
        const { username, password } = loginDto;

        // Find user
        const user = await this.userModel.findOne({
            username: username.toLowerCase(),
            isActive: true,
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        // @ts-ignore - JWT sign returns string but TypeScript infers complex type
        const token = this.generateToken(user);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        return { user: userWithoutPassword, token };
    }

    async validateUser(userId: string): Promise<User | null> {
        return await this.userModel.findById(userId).exec();
    }

    private generateToken(user: UserDocument): string {
        const payload: JwtPayload = {
            sub: user._id.toString(),
            username: user.username,
            role: user.role,
        };
        // @ts-ignore - JWT sign returns string but TypeScript infers complex type
        return this.jwtService.sign(payload);
    }
}

