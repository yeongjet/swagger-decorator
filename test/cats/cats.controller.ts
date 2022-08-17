import { Controller, Get, Post } from 'routing-decorator'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiTags,
  ApiBody,
  ApiHeader,
  ApiConsumes,
  ApiParam,
} from '../../src';
import { CatsService } from './cats.service'
import { CreateCatDto } from './dto/create-cat.dto'
import { Cat } from './entities/cat.entity'
import { Param, Body, Headers, IP } from 'routing-decorator'

enum UserRole {
  Admin,
  Moderator,
  User,
}

enum Region {
  Country,
  Province,
  User,
}

class Person {
  name: string
  age: number
}

@ApiBearerAuth()
@ApiTags('cats')
@Controller('cats')
@ApiHeader({ name: 'kkk', enum: UserRole })
@ApiConsumes('ddd/x-www-form-urlencoded')
export class CatsController {
  // constructor(private readonly catsService: CatsService) {}

  @Post('sd')
  @ApiOperation({ summary: "summary: 'Create cat'" })
  @ApiBody({ type: CreateCatDto })
  @ApiParam({ name: 'hello' })
  @ApiHeader({ name: 'ddd', enum: Region })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createCatDto, @Param('he') param, @Headers() header, @IP() ip) {
    // return this.catsService.create(createCatDto);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [Cat],
  })
  findOne(id: string) {
    // return this.catsService.findOne(+id);
  }
}