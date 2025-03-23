import { GenreId } from "@core/genre/domain/genre.aggregate";
import { IGenreRepository } from "@core/genre/domain/genre.repository";
import { IUseCase } from "@core/shared/application/use-case.interface";
import { IUnitOfWork } from "@core/shared/domain/repository/unit-of-work.interface";

export type DeleteGenreInput = { id: string; };
export type DeleteGenreOutput = void;

export class DeleteGenreUseCase
  implements IUseCase<DeleteGenreInput, DeleteGenreOutput> {

  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
  ) { }

  async execute(input: DeleteGenreInput): Promise<void> {
    const genreId = new GenreId(input.id);
    return this.uow.do(async () => {
      return this.genreRepo.delete(genreId);
    })
  }

}

