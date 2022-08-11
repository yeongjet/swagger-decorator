import { IsInt, IsString } from 'class-validator';

export class CreateCatDto {
  // @ApiProperty({ example: 1, description: 'The age of the Cat' })
  @IsString()
  readonly name!: string;

  // @ApiProperty({ example: 1, description: 'a age of the Cat' })
  @IsInt()
  readonly age!: number;

  @IsString()
  readonly breed!: string;
}