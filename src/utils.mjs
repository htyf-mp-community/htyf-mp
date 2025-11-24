import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取项目根目录
 * @returns {string} 项目根目录路径
 */
export function getProjectRoot() {
  let currentPath = process.cwd() || __dirname;
  return currentPath;
}