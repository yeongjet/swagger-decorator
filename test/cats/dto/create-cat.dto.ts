import { IsInt, IsString } from 'class-validator';

const a = 123

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

export class ApiBodyDto {
  // @ApiProperty({ example: 1, description: 'The age of the Cat' })
  @IsString()
  readonly name!: string;

  // @ApiProperty({ example: 1, description: 'a age of the Cat' })
  @IsInt()
  readonly age!: number;

  @IsString()
  readonly breed!: string;
}