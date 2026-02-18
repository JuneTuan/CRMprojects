import { Controller, Post, Get, UseInterceptors, UploadedFile, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { Response } from 'express';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('customers')
  @UseInterceptors(FileInterceptor('file'))
  async importCustomers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('只支持Excel文件格式');
    }

    const result = await this.importService.importCustomers(file);
    return {
      code: 200,
      msg: '导入完成',
      data: result
    };
  }

  @Post('products')
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('只支持Excel文件格式');
    }

    const result = await this.importService.importProducts(file);
    return {
      code: 200,
      msg: '导入完成',
      data: result
    };
  }

  @Get('template/customers')
  async downloadCustomerTemplate(@Res() res: Response) {
    const buffer = this.importService.getCustomerTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=customer-template.xlsx');
    res.send(buffer);
  }

  @Get('template/products')
  async downloadProductTemplate(@Res() res: Response) {
    const buffer = this.importService.getProductTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=product-template.xlsx');
    res.send(buffer);
  }
}
