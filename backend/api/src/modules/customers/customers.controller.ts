import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AgentTokenGuard } from '../auth/agent-token.guard';
import { AccessPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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

  @Patch('mine/:id')
  @UseGuards(AgentTokenGuard)
  updateMine(@CurrentUser() user: AccessPayload, @Param('id') id: string, @Body() body: UpdateCustomerDto) {
    return this.customers.updateForAgent(user, id, body);
  }

  @Delete('mine/:id')
  @UseGuards(AgentTokenGuard)
  removeMine(@CurrentUser() user: AccessPayload, @Param('id') id: string) {
    return this.customers.removeForAgent(user, id);
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
