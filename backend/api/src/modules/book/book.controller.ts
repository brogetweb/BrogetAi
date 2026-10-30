import { Body, Controller, Get, HttpCode, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BookAuthService } from './book-auth.service';
import { BookLoginDto, BookRegisterDto } from './dto/book-auth.dto';
import { TravellerAccessPayload } from './book.types';
import { TravellerTokenGuard } from './traveller-token.guard';

@Controller('book/auth')
export class BookController {
  constructor(private readonly auth: BookAuthService) {}

  @Post('register')
  @HttpCode(200)
  register(@Body() body: BookRegisterDto) {
    return this.auth.register(body);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: BookLoginDto) {
    return this.auth.login(body);
  }

  @Get('me')
  @UseGuards(TravellerTokenGuard)
  me(@Req() req: { traveller: TravellerAccessPayload }) {
    return this.auth.me(req.traveller.sub);
  }

  @Patch('me')
  @UseGuards(TravellerTokenGuard)
  update(@Req() req: { traveller: TravellerAccessPayload }, @Body() body: Partial<BookRegisterDto>) {
    return this.auth.updateProfile(req.traveller.sub, body);
  }
}
