import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  textModel: string;
  imageModel: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  timestamp: string;
  targetUrl: string;
  domain: string;
  excelFileName?: string;
  imageFileNames?: string[];
  recordIndex: number;
  totalRecords: number;
  mappedFieldsCount: number;
  successCount: number;
  failCount: number;
  status: 'success' | 'partial' | 'failed';
  details: Array<{
    sourceField: string;
    sourceValue: any;
    selector: string;
    targetLabel?: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}

interface DatabaseSchema {
  admin: AdminUser;
  config: ModelConfig;
  tasks: TaskRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Memory cache + file persistence with lock
let dbCache: DatabaseSchema | null = null;

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

export function getDatabase(): DatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  ensureDbDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (err) {
      console.error('Failed to parse db.json, reinitializing...', err);
    }
  }

  // Initialize with seed data
  // Salt password admin123
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('admin123', salt);

  const initialDb: DatabaseSchema = {
    admin: {
      id: 'admin_root',
      username: 'admin',
      passwordHash,
      createdAt: new Date().toISOString(),
    },
    config: {
      baseUrl: 'https://apihub.agnes-ai.com/v1',
      apiKey: 'sk-GUdpKQNIwwJSZQ5mYyrMnuCJBOwSbB73c2N6NcnNfk5LoKyq',
      textModel: 'agnes-2.5-flash',
      imageModel: 'agnes-2.5-flash',
      updatedAt: new Date().toISOString(),
    },
    tasks: [
      {
        id: 'task_demo_init',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        targetUrl: 'https://stats.gov.sample.cn/survey/form/enterprise',
        domain: 'stats.gov.sample.cn',
        excelFileName: '文化馆事业单位年度基础数据表.xlsx',
        recordIndex: 1,
        totalRecords: 3,
        mappedFieldsCount: 12,
        successCount: 12,
        failCount: 0,
        status: 'success',
        details: [
          { sourceField: '单位名称', sourceValue: '市群众艺术文化活动中心', selector: '#unitName', targetLabel: '单位名称', status: 'success' },
          { sourceField: '统一代码', sourceValue: '12310000400018892K', selector: '#creditCode', targetLabel: '统一社会信用代码', status: 'success' },
          { sourceField: '职工人数', sourceValue: 48, selector: '#employeeCount', targetLabel: '在编职工人数', status: 'success' },
          { sourceField: '机构类型', sourceValue: '公益一类事业单位', selector: '#orgType', targetLabel: '机构类型', status: 'success' }
        ]
      }
    ]
  };

  saveDatabase(initialDb);
  dbCache = initialDb;
  return dbCache;
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDbDirectory();
  dbCache = data;
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '****';
  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`;
}
