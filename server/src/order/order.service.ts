import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductService } from '../product/product.service';
import { CustomerService } from '../customer/customer.service';
import { PointsRecordService } from '../customer/points-record.service';
import { CouponService } from '../coupon/coupon.service';
import { MemberLevelService } from '../member-level/member-level.service';
import { LeadService } from '../leads/lead.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
    private productService: ProductService,
    private customerService: CustomerService,
    private pointsRecordService: PointsRecordService,
    private couponService: CouponService,
    private memberLevelService: MemberLevelService,
    @Inject(forwardRef(() => LeadService))
    private leadService: LeadService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    search?: string
  ) {
    const normalizedSortOrder = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    
    const queryBuilder = this.orderRepository.createQueryBuilder('o')
      .leftJoinAndSelect('o.customer', 'customer')
      .leftJoinAndSelect('customer.memberLevel', 'memberLevel')
      .leftJoinAndSelect('o.coupon', 'coupon')
      .leftJoinAndSelect('o.orderItems', 'orderItems');

    if (search) {
      queryBuilder.andWhere(
        '(o.orderNo LIKE :search OR customer.customerName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [orders, total] = await queryBuilder
      .orderBy(`o.${sort}`, normalizedSortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: orders,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { orderId: id },
      relations: ['customer', 'customer.memberLevel', 'coupon', 'orderItems'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByCustomer(customerId: number) {
    return this.orderRepository.find({
      where: { customerId },
      relations: ['coupon', 'orderItems'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createOrderDto: CreateOrderDto) {
    const customer = await this.customerService.findOne(createOrderDto.customerId);

    for (const item of createOrderDto.orderItems) {
      const product = await this.productService.findOne(item.productId);
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Product ${product.productName} has insufficient stock`);
      }
    }

    let couponDiscountAmount = 0;
    if (createOrderDto.couponId) {
      const coupon = await this.couponService.findOne(createOrderDto.couponId);
      couponDiscountAmount = coupon.value;
    }

    const actualAmount = createOrderDto.totalAmount - couponDiscountAmount;
    const points = Math.floor(actualAmount);

    const order = this.orderRepository.create({
      orderNo: createOrderDto.orderNo,
      customerId: createOrderDto.customerId,
      totalAmount: createOrderDto.totalAmount,
      actualAmount: actualAmount,
      couponId: createOrderDto.couponId || null,
      couponDiscountAmount: couponDiscountAmount || null,
      status: createOrderDto.status || '已完成',
      paymentMethod: createOrderDto.paymentMethod,
      shippingAddress: createOrderDto.shippingAddress,
      isPoints: createOrderDto.isPoints !== undefined ? createOrderDto.isPoints : true,
      points: points,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of createOrderDto.orderItems) {
      const product = await this.productService.findOne(item.productId);
      
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.orderId,
        productId: item.productId,
        productName: product.productName,
        productImage: product.imageUrl,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      });
      await this.orderItemRepository.save(orderItem);

      product.stock -= item.quantity;
      const updateProductDto: any = { stock: product.stock };
      await this.productService.update(product.productId, updateProductDto);
    }

    if (savedOrder.status === '已完成' && savedOrder.isPoints && savedOrder.points > 0) {
      await this.pointsRecordService.createPointsRecord(
        savedOrder.customerId,
        '订单完成',
        savedOrder.points,
        `订单 ${savedOrder.orderNo} 完成获得积分`,
      );
    }

    if (savedOrder.status === '已完成') {
      await this.customerService.updateConsumption(savedOrder.customerId, Number(savedOrder.actualAmount));

      await this.memberLevelService.checkAndUpgradeLevel(savedOrder.customerId);
    }

    // 如果是从线索转化，更新线索状态
    if (createOrderDto.leadId) {
      try {
        await this.leadService.convertLead(createOrderDto.leadId, {
          convertedAmount: savedOrder.actualAmount,
          convertedCustomerId: savedOrder.customerId,
        });
        console.log(`线索 ${createOrderDto.leadId} 已成功转化`);
      } catch (error) {
        console.error('转化线索失败:', error);
      }
    }

    return this.findOne(savedOrder.orderId);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);
    
    const previousStatus = order.status;
    
    let couponDiscountAmount = order.couponDiscountAmount || 0;
    if (updateOrderDto.couponId !== undefined) {
      if (updateOrderDto.couponId) {
        const coupon = await this.couponService.findOne(updateOrderDto.couponId);
        couponDiscountAmount = coupon.value;
      } else {
        couponDiscountAmount = 0;
      }
    }

    const totalAmount = updateOrderDto.totalAmount !== undefined ? updateOrderDto.totalAmount : order.totalAmount;
    const actualAmount = totalAmount - couponDiscountAmount;
    const points = Math.floor(actualAmount);
    
    const updateData: any = {};
    if (updateOrderDto.customerId !== undefined) updateData.customerId = updateOrderDto.customerId;
    if (updateOrderDto.totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (updateOrderDto.actualAmount !== undefined) updateData.actualAmount = actualAmount;
    if (updateOrderDto.couponId !== undefined) {
      updateData.couponId = updateOrderDto.couponId || null;
      updateData.couponDiscountAmount = couponDiscountAmount || null;
    }
    if (updateOrderDto.status !== undefined) updateData.status = updateOrderDto.status;
    if (updateOrderDto.paymentMethod !== undefined) updateData.paymentMethod = updateOrderDto.paymentMethod;
    if (updateOrderDto.shippingAddress !== undefined) updateData.shippingAddress = updateOrderDto.shippingAddress;
    if (updateOrderDto.isPoints !== undefined) updateData.isPoints = updateOrderDto.isPoints;
    if (updateOrderDto.points !== undefined) updateData.points = points;
    
    Object.assign(order, updateData);
    
    await this.orderRepository.save(order);
    
    if (updateOrderDto.orderItems && updateOrderDto.orderItems.length > 0) {
      await this.orderItemRepository.delete({ orderId: id });
      
      for (const item of updateOrderDto.orderItems) {
        const product = await this.productService.findOne(item.productId);
        
        const orderItem = this.orderItemRepository.create({
          orderId: id,
          productId: item.productId,
          productName: product.productName,
          productImage: product.imageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        });
        await this.orderItemRepository.save(orderItem);
      }
    }
    
    if (previousStatus !== '已完成' && updateOrderDto.status === '已完成') {
      if (order.isPoints && order.points > 0) {
        await this.pointsRecordService.createPointsRecord(
          order.customerId,
          '订单完成',
          order.points,
          `订单 ${order.orderNo} 完成获得积分`,
        );
      }

      await this.customerService.updateConsumption(order.customerId, Number(order.actualAmount));

      await this.memberLevelService.checkAndUpgradeLevel(order.customerId);
    }
    
    return this.findOne(id);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    return this.orderRepository.remove(order);
  }

  async payOrder(id: number, paymentMethod: string) {
    const order = await this.findOne(id);
    if (order.status !== '待支付') {
      throw new BadRequestException('Order is not in pending payment status');
    }

    order.status = '已支付';
    order.paymentMethod = paymentMethod;
    order.paymentTime = new Date();

    return this.orderRepository.save(order);
  }

  async cancelOrder(id: number, reason: string) {
    const order = await this.findOne(id);
    if (order.status === '已完成' || order.status === '已取消') {
      throw new BadRequestException('Order cannot be cancelled');
    }

    order.status = '已取消';

    for (const item of order.orderItems) {
      const product = await this.productService.findOne(item.productId);
      product.stock += item.quantity;
      await this.productService.update(product.productId, {
        productName: product.productName,
        productCode: product.productCode,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        status: product.status,
        imageUrl: product.imageUrl,
        deletedAt: product.deletedAt,
      });
    }

    return this.orderRepository.save(order);
  }
}