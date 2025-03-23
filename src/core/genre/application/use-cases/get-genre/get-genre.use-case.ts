import { IUseCase } from "../../../../shared/application/use-case.interface";
import { GenreOutput, GenreOutputMapper } from "../common/genre-output";
import { Genre, GenreId } from "../../../../genre/domain/genre.aggregate";
import { IGenreRepository } from "../../../../genre/domain/genre.repository";
import { ICategoryRepository } from "../../../../category/domain/category.repository";
import { NotFoundError } from "../../../../shared/domain/errors/not-found.error";

export type GetGenreInput = { id: string; }

export type GetGenreOutput = GenreOutput;

export class GetGenreUseCase
  implements IUseCase<GetGenreInput, GetGenreOutput> {

  constructor(
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
  ) { }

  async execute(input: GetGenreInput): Promise<GenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepo.findById(genreId);

    if(!genre) 
      throw new NotFoundError(input.id, Genre);

    const categories = await this.categoryRepo.findByIds([
      ...genre.categories_id.values(),
    ]);

    return GenreOutputMapper.toOutput(genre, categories)
  }
}