import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserStatus } from './user-status.enum';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field(() => UserStatus)
  status!: UserStatus;
}
