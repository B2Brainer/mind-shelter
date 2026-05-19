import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { JournalEntryType } from '../../../domain/entities/journal-entry.entity';

export class ListJournalEntriesDto {
  @IsOptional()
  @IsEnum(['DAILY', 'GENERAL'])
  type?: JournalEntryType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize = 10;
}
