import { CategoryId } from "../../../../category/domain/category.aggregate";
import { Genre, GenreId } from "../../../../genre/domain/genre.aggregate";
import { GenreCategoryModel, GenreModel } from "./genre-model";
import { Notification } from "../../../../shared/domain/validators/notification";
import { LoadEntityError } from "../../../../shared/domain/validators/validation.error";

export class GenreModelMapper {

  static toEntity(model: GenreModel): Genre {
    const { genre_id: id, categories_id = [], ...otherData } = model.toJSON();
    const categoriesId = categories_id.map(
      (c) => new CategoryId(c.category_id)
    );

    const notification = new Notification();
    if (!categoriesId.length) {
      notification.addError(
        'categories_id should not be empty',
        'categories_id',
      );
    }

    const genre = new Genre({
      ...otherData,
      genre_id: new GenreId(id),
      categories_id: new Map(categoriesId.map((c) => [c.id, c])),
    });

    genre.validate();
    notification.copyErrors(genre.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return genre;
  }

  static toModel(aggregate: Genre) {
    const { categories_id, ...otherData } = aggregate.toJSON();
    return {
      ...otherData,
      categories_id: categories_id.map(
        (categories_id) => new GenreCategoryModel({
          genre_id: aggregate.genre_id.id,
          category_id: categories_id
        }),
      ),
    };
  }
  
}