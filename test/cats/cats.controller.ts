import { Controller, Get, Post } from 'routing-decorator'
import {
  ApiBearerAuth,
  ApiResponse,
  ApiOkResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiHeader,
  ApiConsumes,
  ApiParam,
  ApiProperty,
  ApiProduces,
  ApiPropertyOptional
} from '../../src';
import { CatsService } from './cats.service'
import { ApiBodyDto, CreateCatDto } from './dto/create-cat.dto'
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

class PersonApiParam {
  @ApiProperty()
  name: string
  @ApiProperty()
  age: number
}

class PersonApiHeader {
  @ApiProperty()
  firstname: string
  @ApiProperty()
  age: number
}

class PersonApiQuery {
  @ApiProperty()
  firstname: string
  @ApiProperty()
  age: number
}

class PersonBody {
  @ApiProperty()
  firstname: string
  @ApiPropertyOptional()
  age: number
}

class CompanyParam {
  @ApiProperty()
  address: string
}

class HomeHeader {
  @ApiProperty()
  postcode: string
  @ApiProperty()
  street: string
}


@ApiBearerAuth()
@ApiTags('cats')
@Controller('cats')
@ApiHeader({ name: 'kkk', enum: UserRole })
// @ApiConsumes('ddd/x-www-form-urlencoded')
// @ApiProduces('ddd/x-www-form-urlencoded')
export class CatsController {
  // constructor(private readonly catsService: CatsService) {}

  @Post('sd')
  //@ApiOperation({ summary: "summary: 'Create cat'" })
  @ApiBody({ type: ApiBodyDto })
  @ApiBody({ type: String })
  @ApiParam({ name: 'ApiParam_(type:basic)', type: String })
  @ApiParam({ type: PersonApiParam })
  @ApiHeader({ name: 'ApiHeader_(type:no)', type: String })
  @ApiQuery({ name: 'ApiQuery_(type:basic)', type: BigInt })
  @ApiQuery({ type: PersonApiQuery })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  // @ApiConsumes('aaa/x-www-form-urlencoded')
  // @ApiProduces('aaa/x-www-form-urlencoded')
  async create(@Body() createCatDto: PersonBody, @Body('body_hasname') createCompanyDto: PersonBody, @Param('he') param: CompanyParam, @Headers() header: HomeHeader, @IP() ip) {
    // return this.catsService.create(createCatDto);
  }

  // @Get(':id')
  // @ApiResponse({
  //   status: 200,
  //   description: 'The found record',
  //   type: [Cat],
  // })
  // findOne(id: string) {
  //   // return this.catsService.findOne(+id);
  // }
}