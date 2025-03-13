import { ValueObject } from "../value-object";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";

//Quebra parcial da arquitetura
 // - Nesse caso adicionar essa lib uuid, é valido pois ele j´s esta consilidado
// - Caso precisa alterar a a lib, ficaria facil
export class Uuid extends ValueObject {
  readonly id: string;
  constructor(id?: string) {
    super();
    this.id = id || uuidv4();
    this.validate();
  }

  private validate() {
    const isValid = uuidValidate(this.id);
    if(!isValid)
        throw new InvalidUuidError()
  }

  static create() {
    return new Uuid();
  }

  toString() {
    return this.id;
  }
}

export class InvalidUuidError extends Error {
  constructor(message?: string) {
    super(message || 'ID must be a valid UUID');
    this.name = "InvalidUuidError";
  }
}

