import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AgentTokenGuard } from '../auth/agent-token.guard';
import { AccessPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { KycService } from './kyc.service';

@Controller('kyc-documents')
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Post()
  @UseGuards(AgentTokenGuard)
  create(@CurrentUser() user: AccessPayload, @Body() body: CreateKycDocumentDto) {
    return this.kyc.create(user, body);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  list() {
    return this.kyc.list();
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.kyc.remove(id);
  }
}
