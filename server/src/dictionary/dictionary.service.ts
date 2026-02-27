import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dictionary } from './dictionary.entity';
import { CreateDictionaryDto, UpdateDictionaryDto, QueryDictionaryDto } from './dto/dictionary.dto';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Dictionary)
    private readonly dictionaryRepository: Repository<Dictionary>,
  ) {}

  async create(createDictionaryDto: CreateDictionaryDto): Promise<Dictionary> {
    const dictionary = this.dictionaryRepository.create(createDictionaryDto);
    return await this.dictionaryRepository.save(dictionary);
  }

  async findAll(query: QueryDictionaryDto): Promise<{ data: Dictionary[]; total: number }> {
    const { dictType, dictValue, dictLabel, status } = query;
    const queryBuilder = this.dictionaryRepository.createQueryBuilder('dictionary');

    if (dictType) {
      queryBuilder.andWhere('dictionary.dictType = :dictType', { dictType });
    }
    if (dictValue) {
      queryBuilder.andWhere('dictionary.dictValue LIKE :dictValue', { dictValue: `%${dictValue}%` });
    }
    if (dictLabel) {
      queryBuilder.andWhere('dictionary.dictLabel LIKE :dictLabel', { dictLabel: `%${dictLabel}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('dictionary.status = :status', { status });
    }

    queryBuilder.orderBy('dictionary.dictSort', 'ASC').addOrderBy('dictionary.id', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Dictionary> {
    return await this.dictionaryRepository.findOne({ where: { id } });
  }

  async findByType(dictType: string): Promise<Dictionary[]> {
    return await this.dictionaryRepository.find({
      where: { dictType, status: 1 },
      order: { dictSort: 'ASC', id: 'ASC' },
    });
  }

  async update(id: number, updateDictionaryDto: UpdateDictionaryDto): Promise<Dictionary> {
    await this.dictionaryRepository.update(id, updateDictionaryDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.dictionaryRepository.delete(id);
  }

  async getDictTypes(): Promise<string[]> {
    const result = await this.dictionaryRepository
      .createQueryBuilder('dictionary')
      .select('DISTINCT dictionary.dictType', 'dictType')
      .getRawMany();
    return result.map(item => item.dictType);
  }
}
