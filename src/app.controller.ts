import { Controller, Get, HttpException, Inject, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Pool } from 'pg';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('PG_CONNECTION') private pool: Pool,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('error')
  async throwError() {
    throw new HttpException('This is a test error', 400);
  }

  @Get('logs')
  getAppLog(@Res() res: Response) {
    const logFileName = `app-${new Date().toISOString().slice(0, 10)}.log`;
    const logFilePath = path.join(__dirname, '..', 'logs', logFileName);

    if (fs.existsSync(logFilePath)) {
      res.sendFile(logFilePath);
    } else {
      res.status(404).json({ message: 'Log file not found' });
    }
  }

  @Get('pg')
  async getPgRecrods() {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM "tUser"');
      return result.rows;
    } finally {
      client.release();
    }
  }
}
