import { Injectable } from '@nestjs/common';
import { WorkspaceRepository } from './repositories/workspace.repository';

@Injectable()
export class GenerateSlugService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async generate(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.workspaceRepository.findBySlug(slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }
}
