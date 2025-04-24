import { IVideoRepository } from "../../../../video/domain/video.repository";
import { UploadAudioVideoMediasUseCase } from "../upload-audio-video-medias.use-case";
import { ICategoryRepository } from "../../../../category/domain/category.repository";
import { IGenreRepository } from "../../../../genre/domain/genre.repository";
import { ICastMemberRepository } from "../../../../cast-member/domain/cast-member.repository";
import { UnitOfWorkSequelize } from "../../../../shared/infra/db/sequelize/unit-of-work-sequelize";
import { IStorage } from "../../../../shared/application/storage.interafce";
import { setupSequelizeForVideo } from "../../../../video/infra/db/sequelize/testing/helpers";
import { CategorySequelizeRepository } from "../../../../category/infra/db/sequelize/category-sequelize.repository";
import { GenreSequelizeRepository } from "../../../../genre/infra/db/sequelize/genre-sequelize.repository";
import { CastMemberSequelizeRepository } from "../../../../cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { VideoSequelizeRepository } from "../../../../video/infra/db/sequelize/video-sequelize.repository";
import { InMemoryStorage } from "../../../../shared/infra/storage/in-memory.storage";
import { CastMemberModel } from "../../../../cast-member/infra/db/sequelize/cast-member.model";
import { GenreModel } from "../../../../genre/infra/db/sequelize/genre-model";
import { CategoryModel } from "../../../../category/infra/db/sequelize/category.model";
import { VideoModel } from "../../../../video/infra/db/sequelize/video.model";
import { Category } from "../../../../category/domain/category.aggregate";
import { Genre } from "../../../../genre/domain/genre.aggregate";
import { CastMember } from "../../../../cast-member/domain/cast-member.aggregate";
import { Video } from "../../../../video/domain/video.aggregate";
import { EntityValidationError } from "../../../../shared/domain/validators/validation.error";

describe('UploadAudioVideoMediasUseCase Integration Tests', () => {
  let uploadAudioVideoMediasUseCase: UploadAudioVideoMediasUseCase;
  let videoRepo: IVideoRepository;
  let categoryRepo: ICategoryRepository;
  let genreRepo: IGenreRepository;
  let castMemberRepo: ICastMemberRepository;
  let uow: UnitOfWorkSequelize;
  let storageService: IStorage;
  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    storageService = new InMemoryStorage();
    // const storageSdk = new GoogleCloudStorageSdk({
    //   credentials: Config.googleCredentials(),
    // });
    // storageService = new GoogleCloudStorage(storageSdk, Config.bucketName());

    uploadAudioVideoMediasUseCase = new UploadAudioVideoMediasUseCase(
      uow,
      videoRepo,
      storageService,
    );
  });

  it('should throw error when video not found', async () => {
    await expect(
      uploadAudioVideoMediasUseCase.execute({
        video_id: '4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b',
        field: 'trailer',
        file: {
          raw_name: 'trailer.mp4',
          mime_type: 'video/mp4',
          data: Buffer.from(''),
          size: 100,
        },
      }),
    ).rejects.toThrow(
      new Error('Video Not Found using ID 4e9e2e4e-4b4a-4b4a-8b8b-8b8b8b8b8b8b'),
    );
  });

  it('should throw error when image is invalid', async () => {
    expect.assertions(2);
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    await videoRepo.insert(video);

    try {
      await uploadAudioVideoMediasUseCase.execute({
        video_id: video.video_id.id,
        field: 'trailer',
        file: {
          raw_name: 'banner.jpg',
          data: Buffer.from(''),
          mime_type: 'image/jpg',
          size: 100,
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.error).toEqual([
        {
          trailer: [
            'Invalid media file mime type: video/mp4 not in video/mp4',
          ],
        },
      ]);
    }
  }, 10000);

  it('should upload trailer image', async () => {
    const storeSpy = jest.spyOn(storageService, 'store');
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    await videoRepo.insert(video);

    await uploadAudioVideoMediasUseCase.execute({
      video_id: video.video_id.id,
      field: 'trailer',
      file: {
        raw_name: 'trailer.mp4',
        data: Buffer.from('test data'),
        mime_type: 'video/mp4',
        size: 100,
      },
    });

    const videoUpdated = await videoRepo.findById(video.video_id);
    expect(videoUpdated!.trailer).toBeDefined();
    expect(videoUpdated!.trailer!.name.includes('.mp4')).toBeTruthy();
    expect(videoUpdated!.trailer!.raw_url).toBeDefined();
    expect(storeSpy).toHaveBeenCalledWith({
      data: expect.any(Buffer),
      mime_type: 'video/mp4',
      id: expect.stringMatching(
        new RegExp(`^videos/${video.video_id.id}/videos/`),
      ),
    });
    expect(storeSpy).toHaveBeenCalledTimes(1);
     
  }, 10000);
});


