import type { HandleResult, SupervisorStatus, TodayTaskStatus } from '@/types';

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (dateStr: string): string => {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待检测',
    testing: '检测中',
    pass: '可发车',
    retest: '需复测',
    fail: '禁止发车',
    exception: '异常上报'
  };
  return map[status] || status;
};

export const getExceptionTypeText = (type: string): string => {
  const map: Record<string, string> = {
    over_limit: '酒精超标',
    device_error: '设备故障',
    timeout: '未按时检测',
    other: '其他异常'
  };
  return map[type] || type;
};

export const getHandleResultText = (result: string): string => {
  const map: Record<string, string> = {
    retest_pass: '已复测放行',
    replace_driver: '安排替班',
    device_replaced: '设备已更换',
    retest_completed: '补检完成',
    other: '其他处理'
  };
  return map[result] || result;
};

export const getDefaultHandleResult = (type: string): HandleResult => {
  const map: Record<string, HandleResult> = {
    over_limit: 'retest_pass',
    device_error: 'device_replaced',
    timeout: 'retest_completed',
    other: 'other'
  };
  return map[type] || 'other';
};

export const getRecommendedActions = (type: string): HandleResult[] => {
  const map: Record<string, HandleResult[]> = {
    over_limit: ['retest_pass', 'replace_driver', 'other'],
    device_error: ['device_replaced', 'replace_driver', 'other'],
    timeout: ['retest_completed', 'retest_pass', 'other'],
    other: ['other', 'replace_driver']
  };
  return map[type] || ['other'];
};

export const getRecordFilterText = (key: string): string => {
  const map: Record<string, string> = {
    all: '全部',
    pending: '待处理',
    waiting: '待处理',
    handled: '已处理',
    retest_pass: '已放行',
    replace_driver: '已替班',
    retest_completed: '补检完成'
  };
  return map[key] || key;
};

export const getTodayTaskStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待检测',
    completed: '已完成',
    waiting: '等待安全员处理',
    handled: '等待主管确认',
    waiting_supervisor: '等待主管确认',
    archived: '已归档',
    returned: '被退回补充'
  };
  return map[status] || status;
};

export const getSupervisorStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending_review: '待主管确认',
    archived: '已归档',
    returned: '已退回'
  };
  return map[status] || status;
};

export const getCloseLoopStepText = (step: string): string => {
  const map: Record<string, string> = {
    safety: '待安全员处理',
    supervisor: '待主管确认',
    archived: '已归档'
  };
  return map[step] || step;
};

export const getAlcoholResult = (value: number): 'pass' | 'retest' | 'fail' => {
  if (value < 20) return 'pass';
  if (value < 80) return 'retest';
  return 'fail';
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const validatePlateNo = (plateNo: string): boolean => {
  const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}$/;
  return reg.test(plateNo);
};
