import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AgentsService } from './agents.service';
import { AgentStatusDto } from './dto/agent-status.dto';
import { CreateAgentDto } from './dto/create-agent.dto';

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agents.remove(id);
  }
}
