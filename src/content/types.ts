/** A stashed link row from the 'links' table */
export interface StashLink {
    id: string;
    label: string;
    url: string;
    category?: string;
}

/** A stashed snippet row from the 'snippets' table */
export interface StashSnippet {
    id: string;
    title: string;
    content: string;
    tags?: string[];
}

/** Union of the two — used in command palette search results */
export type StashItem = StashLink | StashSnippet;

/** Type guards */
export function isLink(item: StashItem): item is StashLink {
    return 'url' in item && !('content' in item);
}

export function isSnippet(item: StashItem): item is StashSnippet {
    return 'content' in item;
}

/** Message types sent from content scripts to the background */
export interface GetStashDataMessage {
    type: 'GET_STASH_DATA';
    context: string;
}

export interface SearchStashMessage {
    type: 'SEARCH_STASH';
    query: string;
}

export interface StashRoleMessage {
    type: 'STASH_ROLE';
    role: { title: string; company: string; url: string };
}

export type ContentMessage = GetStashDataMessage | SearchStashMessage | StashRoleMessage;

/** Generic background response shape */
export interface BackgroundResponse<T> {
    data?: T;
    success?: boolean;
}
