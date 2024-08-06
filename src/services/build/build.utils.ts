import { existsSync } from "fs";
import { mkdir } from "fs/promises"
import { repositoryBlobUrl, repositoryLink, repositoryRawUrl } from "../../utils";

export async function checkFolder(path: string) {
  try {
    if (!existsSync(path)) {
      await mkdir(path)
    }
  }
  catch (e) {
  }
}

export function formatRepositoryLinks(combined: Record<string, any>): Record<string, any> {
  for (const [key, value] of Object.entries(combined)) {
    if (key.endsWith('repository') && typeof value === 'string') {
      combined[`${key}-link`] = repositoryLink(value)
      combined[`${key}-raw`] = repositoryRawUrl(value)
      combined[`${key}-blob`] = repositoryBlobUrl(value)
    }
  }

  return combined
}
