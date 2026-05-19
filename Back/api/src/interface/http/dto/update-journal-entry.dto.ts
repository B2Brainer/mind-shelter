import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { JournalEntryType } from '../../../domain/entities/journal-entry.entity';

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsEnum(['DAILY', 'GENERAL'])
  type?: JournalEntryType;
}
