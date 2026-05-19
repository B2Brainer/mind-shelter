import { IsDateString, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { JournalEntryType } from '../../../domain/entities/journal-entry.entity';

export class CreateJournalEntryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsDateString()
  entryDate!: string;

  @IsEnum(['DAILY', 'GENERAL'])
  type!: JournalEntryType;
}
