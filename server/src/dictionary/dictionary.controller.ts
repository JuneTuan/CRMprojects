import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto, UpdateDictionaryDto, QueryDictionaryDto } from './dto/dictionary.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v6/dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createDictionaryDto: CreateDictionaryDto) {
    return this.dictionaryService.create(createDictionaryDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Query() query: QueryDictionaryDto) {
    return this.dictionaryService.findAll(query);
  }

  @Get('types')
  @UseGuards(AuthGuard('jwt'))
  getDictTypes() {
    return this.dictionaryService.getDictTypes();
  }

  @Get('type/:dictType')
  findByType(@Param('dictType') dictType: string) {
    return this.dictionaryService.findByType(dictType);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.dictionaryService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateDictionaryDto: UpdateDictionaryDto) {
    return this.dictionaryService.update(+id, updateDictionaryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.dictionaryService.remove(+id);
  }
}
