import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CloudinaryService } from '../media/cloudinary.service';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongo: Connection,
    private readonly media: CloudinaryService,
  ) {}

  @Get()
  health() {
    return {
      status: 'ok',
      service: 'berogetai-api',
      database: this.mongo.readyState === 1 ? 'mongodb' : 'mongodb-disconnected',
      media: this.media.isConfigured() ? 'cloudinary' : 'cloudinary-unconfigured',
      timestamp: new Date().toISOString(),
    };
  }
}
