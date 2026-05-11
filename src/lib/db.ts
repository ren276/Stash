import Dexie, { type EntityTable } from 'dexie';

export interface Link {
  id?: number;
  label: string;
  url: string;
  category: string;
  createdAt: string;
}

export interface Snippet {
  id?: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface Job {
  id?: number;
  title: string;
  company: string;
  url: string;
  status: string;
  timestamp: string;
  deadline?: string;
  notes?: string;
  location?: string;
  salary?: string;
}

const db = new Dexie('StashDatabase') as Dexie & {
  links: EntityTable<Link, 'id'>;
  snippets: EntityTable<Snippet, 'id'>;
  jobs: EntityTable<Job, 'id'>;
};

// Schema declaration:
db.version(1).stores({
  links: '++id, label, url, category, createdAt',
  snippets: '++id, title, content, *tags, createdAt',
  jobs: '++id, title, company, url, status, timestamp'
});

db.version(2).stores({
  jobs: '++id, title, company, url, status, timestamp, deadline, location, salary'
});

export { db };
