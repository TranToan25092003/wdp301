import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './utils/decorators/public.decorator';
import { ClerkAuthGuard } from './utils/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('test')
@ApiBearerAuth('bearerAuth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Public()
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary: 'test',
  })
  @Post('/check')
  checkHealth(@Request() req) {
    console.log(req.user);
    return this.appService.checkHealth();
  }
}
