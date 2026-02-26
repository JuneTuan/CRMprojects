import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { RoleController } from './role.controller';
import { PermissionController } from './permission.controller';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { RolePermission } from './role-permission.entity';
import { Customer } from '../customer/customer.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuditLogModule } from '../audit/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, RolePermission, Customer]),
    PassportModule,
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    AuditLogModule,
  ],
  controllers: [AuthController, UserController, RoleController, PermissionController],
  providers: [AuthService, UserService, RoleService, PermissionService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}