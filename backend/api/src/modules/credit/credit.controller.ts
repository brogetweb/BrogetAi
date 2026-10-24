import { Body, Controller, Delete, Get, Param, Post, StreamableFile, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AgentTokenGuard } from '../auth/agent-token.guard';
import { AccessPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreditService } from './credit.service';
import { CreateCreditReportDto } from './dto/create-credit-report.dto';

@Controller('credit-reports')
export class CreditController {
  constructor(private readonly credit: CreditService) {}

  @Post()
  @UseGuards(AgentTokenGuard)
  create(@CurrentUser() user: AccessPayload, @Body() body: CreateCreditReportDto) {
    return this.credit.create(user, body);
  }

  @Get('mine')
  @UseGuards(AgentTokenGuard)
  mine(@CurrentUser() user: AccessPayload) {
    return this.credit.mine(user);
  }

  @Get('mine/:id/download')
  @UseGuards(AgentTokenGuard)
  async downloadMine(@CurrentUser() user: AccessPayload, @Param('id') id: string) {
    const file = await this.credit.downloadForAgent(user, id);
    return new StreamableFile(file.body, {
      type: 'application/pdf',
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  list() {
    return this.credit.list();
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.credit.remove(id);
  }

  @Get(':id/download')
  @UseGuards(AccessTokenGuard)
  async download(@Param('id') id: string) {
    const file = await this.credit.download(id);
    return new StreamableFile(file.body, {
      type: 'application/pdf',
      disposition: `attachment; filename="${file.filename}"`,
    });
  }
}
