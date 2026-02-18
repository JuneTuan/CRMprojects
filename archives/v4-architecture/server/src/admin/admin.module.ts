import { Module } from "@nestjs/common";
import { AuthModule } from "@/auth/auth.module";
import { StaffModule } from "@/staff/staff.module";
import { StatisticsModule } from "@/statistics/statistics.module";
import { ImportModule } from "@/import/import.module";
import { CleanupModule } from "@/cleanup/cleanup.module";
import { AdminController } from "./admin.controller";

@Module({
  imports: [
    AuthModule,
    StaffModule,
    StatisticsModule,
    ImportModule,
    CleanupModule
  ],
  controllers: [AdminController],
  providers: []
})
export class AdminModule {}
