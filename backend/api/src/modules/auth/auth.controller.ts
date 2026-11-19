import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';
import { AgentTokenGuard } from './agent-token.guard';
import { AuthService } from './auth.service';
import { AccessPayload } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { ChangePasswordDto, UpdateAgentProfileDto } from './dto/agent-profile.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Post('agent/login')
  agentLogin(@Body() body: LoginDto) {
    return this.auth.loginAgent(body.email, body.password);
  }

  @Post('refresh')
  refresh(@Body() body: RefreshDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  logout(@Body() body: RefreshDto) {
    return this.auth.logout(body.refreshToken);
  }

  /** Agent profile (cibil.brogetai.com → Profile). */
  @Get('agent/me')
  @UseGuards(AgentTokenGuard)
  agentProfile(@CurrentUser() user: AccessPayload) {
    return this.auth.agentProfile(user.sub);
  }

  @Patch('agent/me')
  @UseGuards(AgentTokenGuard)
  updateAgentProfile(@CurrentUser() user: AccessPayload, @Body() body: UpdateAgentProfileDto) {
    return this.auth.updateAgentProfile(user.sub, body);
  }

  /** Changes the password, signs out every other device and returns a fresh session for this one. */
  @Post('agent/change-password')
  @HttpCode(200)
  @UseGuards(AgentTokenGuard)
  changeAgentPassword(@CurrentUser() user: AccessPayload, @Body() body: ChangePasswordDto) {
    return this.auth.changeAgentPassword(user.sub, body.currentPassword, body.newPassword);
  }

  @Post('agent/logout-all')
  @HttpCode(200)
  @UseGuards(AgentTokenGuard)
  logoutAllAgent(@CurrentUser() user: AccessPayload) {
    return this.auth.logoutAllAgent(user.sub);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: AccessPayload) {
    return this.auth.me(user.sub);
  }
}
