// 用于管理本地存储的pcap/log文件和容器/题目信息
export interface LocalFileStoreData {
  containerId: number;
  questionId: number;
  pcapFiles: string[];
  logFiles: string[];
}

const KEY_PREFIX = 'defend_files_';

export function saveFilesToLocal(data: LocalFileStoreData) {
  const key = KEY_PREFIX + data.containerId;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getFilesFromLocal(containerId: number): LocalFileStoreData | null {
  const key = KEY_PREFIX + containerId;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export interface DefendContext {
  containerId: number;
  questionId: number;
}

export function saveCurrentContext(context: DefendContext) {
  localStorage.setItem('defend_current_container', String(context.containerId));
  localStorage.setItem('defend_current_question', String(context.questionId));
}

export function getCurrentContext(): DefendContext {
  return {
    containerId: Number(localStorage.getItem('defend_current_container')),
    questionId: Number(localStorage.getItem('defend_current_question')),
  };
}

export interface AnalysisReport {
  pcapReport: string;
  logReport: string;
}

export function saveAnalysisReport(containerId: number, report: AnalysisReport) {
  const key = `defend_analysis_${containerId}`;
  localStorage.setItem(key, JSON.stringify(report));
}

export function getAnalysisReport(containerId: number): AnalysisReport | null {
  const key = `defend_analysis_${containerId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
