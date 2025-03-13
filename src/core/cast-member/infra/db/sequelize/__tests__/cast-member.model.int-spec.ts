import { DataType } from "sequelize-typescript"
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";
import { CastMemberModel } from "../cast-member.model";
import { CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";

// Teste de integração 
describe('CastMemberModel Integration Test', () => {

  setupSequelize({ models: [CastMemberModel] });

  test('Mapping props', () => {
    const attributesMap = CastMemberModel.getAttributes();
    const attributes = Object.keys(attributesMap);
    expect(attributes).toStrictEqual([
      'cast_member_id',
      'name',
      'type',
      'created_at'
    ]);

    const categoryIdAttr = attributesMap.cast_member_id;
    expect(categoryIdAttr).toMatchObject({
      field: 'cast_member_id',
      fieldName: 'cast_member_id',
      primaryKey: true,
      type: DataType.UUID()
    });

    const nameAttr = attributesMap.name;
    expect(nameAttr).toMatchObject({
      field: 'name',
      fieldName: 'name',
      allowNull: false,
      type: DataType.STRING(255)
    });

    const typeAttr = attributesMap.type;
    expect(typeAttr).toMatchObject({
      field: 'type',
      fieldName: 'type',
      allowNull: false,
      type: DataType.SMALLINT()
    });

    const createdAtAttr = attributesMap.created_at;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'created_at',
      allowNull: false,
      type: DataType.DATE(3)
    });

  });

  test('Should create a category', async () => {
    const arrange = {
      cast_member_id: '879878-80989-9080a8s9d-da8s797',
      name: 'Test',
      type: CastMemberTypes.ACTOR,
      created_at: new Date()
    }
    const category = await CastMemberModel.create(arrange);
    expect(category.toJSON()).toStrictEqual(arrange);
  })
})