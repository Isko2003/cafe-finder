import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CafesModule } from './cafes/cafes.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CafesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
