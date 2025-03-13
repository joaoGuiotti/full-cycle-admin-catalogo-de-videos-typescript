import { Entity } from "./entity";

export abstract class AggreagateRoot extends Entity {}
// Aggregate lida com algo que é uma raiz de agregação, ou seja, algo que é a raiz de um conjunto de entidades.
// Principalmente com os eventos de domínio