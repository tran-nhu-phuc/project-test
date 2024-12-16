import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userEntity: Repository<User>,
    ) { }


    async getUserByEmail(email: string): Promise<User> {
        try {
            return await this.userEntity.findOne({ where: { email } });
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }



    async getUserById(id: any): Promise<User> {
        try {
            return await this.userEntity.findOne({
                where: { id },
            });
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }
}