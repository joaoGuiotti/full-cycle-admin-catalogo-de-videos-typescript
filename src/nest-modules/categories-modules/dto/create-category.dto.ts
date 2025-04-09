import { CreateCategoryInput } from "@core/category/application/use-cases/create-category/create-category.input";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto extends CreateCategoryInput {
  @ApiProperty({ required: true })
  override name: string;

  @ApiProperty()
  override description?: string;

  @ApiProperty({ type: 'boolean' })
  override is_active?: boolean;
}

