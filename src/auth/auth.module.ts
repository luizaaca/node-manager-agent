import { Module } from '@nestjs/common';
import type { StringValue } from "ms";
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

const jwtFactory = {
  global: true,
  useFactory: async (configService: ConfigService) => ( {
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.getOrThrow<StringValue>('JWT_SECRET_EXP'),
    },
  }),
  inject: [ConfigService],
};

@Module({
  imports: [UsersModule, JwtModule.registerAsync(jwtFactory)],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
