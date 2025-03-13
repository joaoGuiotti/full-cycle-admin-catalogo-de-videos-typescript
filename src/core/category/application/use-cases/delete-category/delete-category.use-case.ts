import { CategoryId } from "@core/category/domain/category.aggregate";
import { IUseCase } from "../../../../shared/application/use-case.interface"; 
import { ICategoryRepository } from "../../../domain/category.repository";

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput> {

  constructor(private readonly categoryRepo: ICategoryRepository) { }

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const uuid = new CategoryId(input.id);
    await this.categoryRepo.delete(uuid);
  }
}

export type DeleteCategoryInput = {
  id: string;
}

export type DeleteCategoryOutput = void;