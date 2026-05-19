import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JournalEntriesService } from '../../application/services/journal-entries.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../infrastructure/auth/authenticated-user.interface';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ListJournalEntriesDto } from './dto/list-journal-entries.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';

type RequestWithUser = {
  user: AuthenticatedUser;
};

@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(@Req() request: RequestWithUser, @Body() body: CreateJournalEntryDto) {
    return this.journalEntriesService.create(request.user.sub, body);
  }

  @Get()
  list(@Req() request: RequestWithUser, @Query() query: ListJournalEntriesDto) {
    return this.journalEntriesService.list(request.user.sub, query);
  }

  @Get(':id')
  getById(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.journalEntriesService.getById(request.user.sub, id);
  }

  @Patch(':id')
  update(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateJournalEntryDto,
  ) {
    return this.journalEntriesService.update(request.user.sub, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Req() request: RequestWithUser, @Param('id') id: string) {
    await this.journalEntriesService.delete(request.user.sub, id);
  }
}
