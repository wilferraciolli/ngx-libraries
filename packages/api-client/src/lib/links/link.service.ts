import { Injectable } from '@angular/core';
import type { ILink } from '../http-client/envelope.js';

@Injectable({
  providedIn: 'root',
})
export class LinkService {
  /**
   * Determines if a link is present — i.e. whether the API is allowing this
   * action for the current caller.
   * @param link true if the link is defined.
   */
  public hasLink(link: ILink | undefined): boolean {
    return !!link;
  }

  /**
   * Checks whether the link is for a resource template.
   * @param link The link to check
   */
  public isTemplateLink(link: ILink): boolean {
    return link?.href.includes('template');
  }

  /**
   * Removes the template suffix from the link
   * @param link The link to get the create url from
   */
  public getCreateUrlFromTemplateUrl(link: ILink): string | null {
    if (this.isTemplateLink(link)) {
      const re: RegExp = /\/template/gi;

      return link.href.replace(re, '');
    } else {
      return null;
    }
  }
}
