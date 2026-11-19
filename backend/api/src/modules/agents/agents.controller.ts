import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AgentsService } from './agents.service';
import { AgentStatusDto } from './dto/agent-status.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { ResetAgentPasswordDto, UpdateAgentDto } from './dto/update-agent.dto';

@Controller('agents')
@UseGuards(AccessTokenGuard)
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  list() {
    return this.agents.list();
  }

  @Post()
  create(@Body() body: CreateAgentDto) {
    return this.agents.create(body);
  }

  @Patch(':id/status')
  status(@Param('id') id: string, @Body() body: AgentStatusDto) {
    return this.agents.setStatus(id, body.status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAgentDto) {
    return this.agents.update(id, body);
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  resetPassword(@Param('id') id: string, @Body() body: ResetAgentPasswordDto) {
    return this.agents.resetPassword(id, body.newPassword);
  }

  @Post(':id/logout-all')
  @HttpCode(200)
  logoutAll(@Param('id') id: string) {
    return this.agents.logoutAll(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agents.remove(id);
  }
}
