import {
  ProviderScope,
  Injectable,
  ProviderType,
  MultipartFile,
} from "@tsed/common";
import sharp, { Sharp } from "sharp";
import { createHash } from "crypto";
import { createReadStream, unlink } from "fs";
import { IMAGE_DIRECTORY } from "../Server";
import * as path from "path";

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON,
})
export class ImageService {
  async processParticipationImage(file: MultipartFile, id: string): Promise<string> {
    await Promise.all([
      this.createSquareImage(file).toFile(
        path.join(IMAGE_DIRECTORY, `${id}-square.jpg`)
      ),
      this.createResizedImage(file).toFile(
        path.join(IMAGE_DIRECTORY, `${id}-original.jpg`)
      ),
    ]);

    return `/images/${id}-square.jpg`;
  }

  async deleteImage(id: string) {
    unlink(
      path.join(IMAGE_DIRECTORY, `${id}-original.jpg`),
      (err) => err && console.error(err)
    );
    unlink(
      path.join(IMAGE_DIRECTORY, `${id}-square.jpg`),
      (err) => err && console.error(err)
    );
  }

  createSha1Hash(file: MultipartFile): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash("sha1").setEncoding("hex");
      createReadStream(file.path)
        .pipe(hash)
        .on("error", reject)
        .on("finish", function () {
          resolve(hash.read());
        });
    });
  }

  createResizedImage(file: MultipartFile): Sharp {
    return (
      sharp(file.path)
        // Auto rotate based on EXIF data
        .rotate()
        // Resize to a maximal size, keeping the aspect ratio
        .resize({
          width: 2048,
          height: 2048,
          fit: "inside",
          withoutEnlargement: true,
        })
        // Convert to jped, strips metadata (eg. EXIF data) automatically
        .jpeg({
          progressive: true,
        })
    );
  }

  createSquareImage(file: MultipartFile): Sharp {
    return (
      sharp(file.path)
        // Auto rotate based on EXIF data
        .rotate()
        // Resize to a square image, choosing the most "interesting" area
        .resize({
          width: 1024,
          height: 1024,
          fit: "cover",
          position: "attention",
          withoutEnlargement: false,
        })
        // Convert to jped, strips metadata (eg. EXIF data) automatically
        .jpeg({
          progressive: true,
        })
    );
  }
}
