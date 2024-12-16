import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

dotenvConfig();

const options: TypeOrmModuleOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: +process.env.DB_PORT || 3306,
    username: process.env.DB_USER || 'black_ants',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'xxxxxxx',
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    autoLoadEntities: true,
    synchronize: true,
};

export default TypeOrmModule.forRoot(options);

export const connectionSource = new DataSource(options as DataSourceOptions);
