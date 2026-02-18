import { Injectable } from '@nestjs/common';
import { prizeManager } from '../storage/database';

@Injectable()
export class PrizeService {
  async getPrizes(query: any) {
    const { skip, limit, ...filters } = query;
    return prizeManager.getPrizes({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      filters
    });
  }

  async getAvailablePrizes() {
    return prizeManager.getAvailablePrizes();
  }

  async getPrizeById(id: string) {
    return prizeManager.getPrizeById(id);
  }

  async createPrize(data: any) {
    return prizeManager.createPrize(data);
  }

  async updatePrize(id: string, data: any) {
    return prizeManager.updatePrize(id, data);
  }

  async deletePrize(id: string) {
    return prizeManager.deletePrize(id);
  }
}
