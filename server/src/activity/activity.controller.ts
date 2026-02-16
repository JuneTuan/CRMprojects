import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  async findAll() {
    return this.activityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.activityService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activityService.update(id, updateActivityDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.activityService.remove(id);
  }

  @Get('game-types/all')
  async findAllGameTypes() {
    return this.activityService.findAllGameTypes();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('game-types')
  async createGameType(@Body() createGameTypeDto: any) {
    return this.activityService.createGameType(createGameTypeDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/games')
  async addGameToActivity(@Param('id') activityId: number, @Body() addGameDto: any) {
    return this.activityService.addGameToActivity(activityId, addGameDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':activityId/games/:gameId/prizes')
  async addPrizeToGame(@Param('activityId') activityId: number, @Param('gameId') gameId: number, @Body() addPrizeDto: any) {
    return this.activityService.addPrizeToGame(activityId, gameId, addPrizeDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/games')
  async updateActivityGames(@Param('id') id: number, @Body() gamesData: any) {
    return this.activityService.updateActivityGames(id, gamesData);
  }
}