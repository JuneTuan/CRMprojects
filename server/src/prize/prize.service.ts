import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prize } from './prize.entity';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@Injectable()
export class PrizeService {
  constructor(
    @InjectRepository(Prize) private prizeRepository: Repository<Prize>,
  ) {}

  async findAll(page: number = 1, pageSize: number = 10, keyword?: string) {
    const queryBuilder = this.prizeRepository.createQueryBuilder('prize');

    if (keyword) {
      queryBuilder.andWhere(
        '(prize.prizeName LIKE :keyword OR prize.description LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    queryBuilder.orderBy('prize.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const prize = await this.prizeRepository.findOne({
      where: { prizeId: id },
    });
    if (!prize) {
      throw new NotFoundException(`Prize with ID ${id} not found`);
    }
    return prize;
  }

  async create(createPrizeDto: CreatePrizeDto) {
    const prize = this.prizeRepository.create(createPrizeDto);
    return this.prizeRepository.save(prize);
  }

  async update(id: number, updatePrizeDto: UpdatePrizeDto) {
    const prize = await this.findOne(id);
    Object.assign(prize, updatePrizeDto);
    return this.prizeRepository.save(prize);
  }

  async remove(id: number) {
    const prize = await this.findOne(id);
    return this.prizeRepository.remove(prize);
  }
}