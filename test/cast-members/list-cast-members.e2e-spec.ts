import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import qs from 'qs';
import { ListCastMembersFixture } from 'src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.provider';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { startApp } from 'src/nest-modules/shared-module/testing/helper';
import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';

// Ignorar esse teste e2e 
describe('CastMembersController (e2e)', () => {
  describe('/cast-members (GET)', () => {
    describe('should return cast members sorted by created_at when request query is empty', () => {
      let castMemberRepo: ICastMemberRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } =
        ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        castMemberRepo = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await castMemberRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .authenticate(nestApp.app)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('should return cast members using paginate, filter and sort', () => {
      let castMemberRepo: ICastMemberRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        castMemberRepo = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await castMemberRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each([arrange[0]])(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = qs.stringify(send_data as any);
          return request(nestApp.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .authenticate(nestApp.app)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});
