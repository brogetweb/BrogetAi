import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { BookAuthService } from './book-auth.service';

class TravellerStatusDto {
  @IsIn(['active', 'inactive'])
  status!: 'active' | 'inactive';
}

@Controller('book/travellers')
@UseGuards(AccessTokenGuard)
export class BookAdminController {
  constructor(private readonly auth: BookAuthService) {}

  @Get()
  list() {
    return this.auth.listForAdmin();
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() body: TravellerStatusDto) {
    return this.auth.setStatusForAdmin(id, body.status);
  }
}
