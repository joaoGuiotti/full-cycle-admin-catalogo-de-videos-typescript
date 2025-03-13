import { CastMemberOutput } from "@core/cast-member/application/use-cases/common/cast-member-output";
import { CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";
import { Transform } from "class-transformer";
import { CollectionPresenter } from "../shared-module/collection.presenter";
import { ListCastMembersOutput } from "@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case";

export class CastMemberPresenter {
  id: string;
  name: string;
  type: CastMemberTypes;

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at?: Date;

  constructor(output: CastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.created_at = output.created_at;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(outut: ListCastMembersOutput) {
    const { items, ...paginationProps } = outut;
    super(paginationProps);
    this.data = items.map((i) => new CastMemberPresenter(i));
  }
}
