import { Category, CategoryId } from "./category.aggregate";
import { ISearchableRepository } from "../../shared/domain/repository/repository-interface";
import { SearchParams } from "../../shared/domain/repository/search-params";
import { SearchResult } from "../../shared/domain/repository/search-result";

export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> { }

export class CategorySearchResult extends SearchResult<Category> { }

// Vernon fala no livro vermelho, que, 
// Enventualmente a gente precisa pasar aqui como parametro 
// Outras coisas que não sejam entidades, por exemplo pra fazer um filtro, eu posso 
// Trabalhar com objeto de valores, eles são auto validados
export interface ICategoryRepository
  extends ISearchableRepository<
    Category,
    CategoryId,
    CategoryFilter,
    CategorySearchParams,
    CategorySearchResult
  > {
  // O que não pode ter no repositório, é por exemplo o changeName(isso é regra de negocio), 
  // O repository esta preocupado apenas com uma questao, que é armazenamento, mas não armezanamento em BD,
  // Cabe a ele recuperar e mandar dados
}

// memoria
// sequelize