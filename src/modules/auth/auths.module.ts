import { Module } from '@nestjs/common';
import { AuthService } from './auths.service';

@Module({
    controllers: [AbortController],
    providers: [AuthService]
})
export class AuthModule { }
