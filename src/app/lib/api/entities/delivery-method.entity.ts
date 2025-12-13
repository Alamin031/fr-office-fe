import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity('delivery_methods')
export class DeliveryMethod {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  minDays: number;

  @Column()
  maxDays: number;

  @Column({ default: 0 })
  extraFee: number;
}
