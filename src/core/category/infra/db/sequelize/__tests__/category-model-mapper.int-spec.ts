import { CategoryModel } from "../category.model";
import { EntityValidationError } from "../../../../../shared/domain/validators/validation.error";
import { CategoryModelMapper } from "../category-model-mapper";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../../domain/category.aggregate";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";


describe('CategoryModelMapper Integration Test', () => {

  setupSequelize({ models: [CategoryModel] });

  it('Should throw error when category is invalid', () => {
    expect.assertions(2);
    const model = CategoryModel.build({
      category_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      name: 'a'.repeat(256),
      is_active: false,
      created_at: new Date()
    });
    try {
      CategoryModelMapper.toEntity(model)
      fail('The Category is valid, but it needs throw a EntityValidationError');
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);
      expect((e as EntityValidationError).error).toMatchObject([
        {
          'name': ['name must be shorter than or equal to 255 characters'],
        }
      ]);
    }
  });

  it('should convert a category model to a category entity', () => {
    const created_at = new Date();
    const model = CategoryModel.build({
      category_id: '5490020a-e866-4229-9adc-aa44b83234c4',
      name: 'some value',
      description: 'some description',
      is_active: true,
      created_at,
    });
    const entity = CategoryModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(
      new Category({
        category_id: new Uuid('5490020a-e866-4229-9adc-aa44b83234c4'),
        name: 'some value',
        description: 'some description',
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });

});