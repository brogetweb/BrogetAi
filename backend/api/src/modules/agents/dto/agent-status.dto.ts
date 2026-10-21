import { IsIn } from 'class-validator';

export class AgentStatusDto {
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}
