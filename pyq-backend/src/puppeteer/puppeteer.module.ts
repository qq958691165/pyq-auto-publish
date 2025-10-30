import { Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { PublishModule } from '../publish/publish.module';

@Module({
  imports: [PublishModule],
  providers: [PuppeteerService],
  exports: [PuppeteerService],
})
export class PuppeteerModule {}

