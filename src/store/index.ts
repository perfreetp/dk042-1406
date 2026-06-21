import { create } from 'zustand';
import type { TestRecord, SafetyNotice, ExceptionType } from '@/types';
import { mockRecords } from '@/data/mockRecords';
import { mockSafetyNotices } from '@/data/mockRecords';
import { generateId } from '@/utils';

interface AppStore {
  records: TestRecord[];
  safetyNotices: SafetyNotice[];
  addRecord: (record: Omit<TestRecord, 'id'>) => string;
  addSafetyNotice: (notice: Omit<SafetyNotice, 'id' | 'handled'>) => void;
  addExceptionRecord: (params: {
    type: ExceptionType;
    driverName: string;
    plateNo: string;
    routeName: string;
    remark: string;
    photos: string[];
    alcoholValue?: number;
    checkInPhoto?: string;
    testPhoto?: string;
  }) => string;
}

const useAppStore = create<AppStore>((set, get) => ({
  records: [...mockRecords],
  safetyNotices: [...mockSafetyNotices],

  addRecord: (record) => {
    const id = 'REC' + Date.now().toString(36);
    const newRecord: TestRecord = { ...record, id };
    set((state) => ({ records: [newRecord, ...state.records] }));
    console.log('[Store] 新增检测记录', { id, status: record.status, alcoholValue: record.alcoholValue });
    return id;
  },

  addSafetyNotice: (notice) => {
    const id = 'N' + Date.now().toString(36);
    const newNotice: SafetyNotice = { ...notice, id, handled: false };
    set((state) => ({ safetyNotices: [newNotice, ...state.safetyNotices] }));
    console.log('[Store] 新增安全员通知', { id, type: notice.exceptionType });
  },

  addExceptionRecord: (params) => {
    const { type, driverName, plateNo, routeName, remark, photos, alcoholValue, checkInPhoto, testPhoto } = params;
    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];

    const statusMap: Record<string, TestRecord['status']> = {
      over_limit: 'retest',
      device_error: 'exception',
      timeout: 'exception',
      other: 'exception'
    };
    const resultMap: Record<string, TestRecord['result'] | undefined> = {
      over_limit: alcoholValue !== undefined && alcoholValue >= 80 ? 'fail' : 'retest',
      device_error: undefined,
      timeout: undefined,
      other: undefined
    };

    const recordId = get().addRecord({
      date: dateStr,
      driverName,
      plateNo,
      routeName,
      firstStopTime: '--',
      status: statusMap[type] || 'exception',
      result: resultMap[type],
      alcoholValue,
      checkInPhoto: checkInPhoto || 'https://picsum.photos/id/177/400/300',
      testPhoto: testPhoto || 'https://picsum.photos/id/91/400/300',
      testTime: now,
      assistantName: '--',
      exceptionType: type,
      exceptionRemark: remark,
      exceptionPhotos: photos
    });

    get().addSafetyNotice({
      taskId: recordId,
      driverName,
      plateNo,
      routeName,
      exceptionType: type,
      exceptionRemark: remark,
      alcoholValue,
      photos,
      createTime: now
    });

    return recordId;
  }
}));

export default useAppStore;
