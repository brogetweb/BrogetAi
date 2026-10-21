import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AgentTokenGuard } from '../auth/agent-token.guard';
import { AccessPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Post()
  @UseGuards(AgentTokenGuard)
  create(@CurrentUser() user: AccessPayload, @Body() body: CreateCustomerDto) {
    return this.customers.create(user, body);
  }

  @Get('mine')
  @UseGuards(AgentTokenGuard)
  mine(@CurrentUser() user: AccessPayload) {
    return this.customers.mine(user);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  list() {
    return this.customers.list();
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.customers.remove(id);
  }
}
