import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';

@Injectable()
export class H5OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) {}

  async getOrders(customerId: number) {
    const orders = await this.orderRepository.find({
      where: { customerId },
      relations: ['orderItems', 'orderItems.product', 'coupon'],
      order: { createdAt: 'DESC' },
    });

    return orders.map(order => ({
      orderId: order.orderId,
      orderNo: order.orderNo,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      items: order.orderItems.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice
      }))
    }));
  }

  async getOrderDetail(id: number, customerId: number) {
    const order = await this.orderRepository.findOne({
      where: { orderId: id, customerId },
      relations: ['orderItems', 'orderItems.product', 'coupon', 'customer'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return {
      orderId: order.orderId,
      orderNo: order.orderNo,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentTime: order.paymentTime,
      createdAt: order.createdAt,
      customer: {
        customerName: order.customer.customerName,
        phone: order.customer.phone,
        address: order.customer.address
      },
      items: order.orderItems.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        subtotal: item.quantity * item.unitPrice
      })),
      coupon: order.coupon ? {
        couponName: order.coupon.couponName,
        discountAmount: order.coupon.value
      } : null
    };
  }
}