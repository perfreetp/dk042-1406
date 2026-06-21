import { create } from 'zustand';
import type {
  TestRecord,
  SafetyNotice,
  ExceptionType,
  HandleResult,
  TodayTaskStatus,
  SupervisorStatus,
  SupervisorAction
} from '@/types';
import { mockRecords } from '@/data/mockRecords';
import { mockSafetyNotices } from '@/data/mockRecords';

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
  handleSafetyNotice: (params: {
    noticeId: string;
    handlerName: string;
    handleResult: HandleResult;
    handleRemark: string;
    retestValue?: number;
    retestPhoto?: string;
  }) => void;
  handleSupervisorReview: (params: {
    noticeId: string;
    supervisorName: string;
    action: SupervisorAction;
    remark: string;
  }) => void;
  getTodayTaskStatus: (driverName: string) => TodayTaskStatus;
  getTodayCloseLoopInfo: (driverName: string) => {
    hasException: boolean;
    currentStep: 'safety' | 'supervisor' | 'archived' | null;
    relatedNoticeId: string | null;
    relatedRecordId: string | null;
  };
  getTodaySupervisorNotices: () => SafetyNotice[];
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
      over_limit: alcoholValue !== undefined && alcoholValue >= 80 ? 'fail' : 'retest',
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
  },

  handleSafetyNotice: (params) => {
    const { noticeId, handlerName, handleResult, handleRemark, retestValue, retestPhoto } = params;
    const now = new Date().toISOString();
    set((state) => ({
      safetyNotices: state.safetyNotices.map((n) =>
        n.id === noticeId
          ? {
              ...n,
              handled: true,
              handleTime: now,
              handlerName,
              handleRemark,
              handleResult,
              retestValue,
              retestPhoto,
              retestTime: retestValue !== undefined ? now : undefined,
              supervisorStatus: 'pending_review' as SupervisorStatus
            }
          : n
      )
    }));
    console.log('[Store] 处理安全员通知', { noticeId, handleResult, retestValue, retestPhoto, handlerName });
  },

  handleSupervisorReview: (params) => {
    const { noticeId, supervisorName, action, remark } = params;
    const now = new Date().toISOString();
    const newStatus: SupervisorStatus = action === 'archive' ? 'archived' : 'returned';
    set((state) => ({
      safetyNotices: state.safetyNotices.map((n) =>
        n.id === noticeId
          ? {
              ...n,
              supervisorStatus: newStatus,
              supervisorTime: now,
              supervisorName,
              supervisorRemark: remark
            }
          : n
      )
    }));
    console.log('[Store] 主管处理', { noticeId, action, supervisorName });
  },

  getTodayTaskStatus: (driverName: string): TodayTaskStatus => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = state.records.find(
      (r) => r.date === today && r.driverName === driverName
    );
    if (!todayRecord) return 'pending';
    if (todayRecord.status === 'pass') return 'completed';
    const relatedNotice = state.safetyNotices.find((n) => n.taskId === todayRecord.id);
    if (!relatedNotice) return 'waiting';
    if (!relatedNotice.handled) return 'waiting';
    if (relatedNotice.supervisorStatus === 'archived') return 'archived';
    if (relatedNotice.supervisorStatus === 'returned') return 'returned';
    return 'waiting_supervisor';
  },

  getTodayCloseLoopInfo: (driverName: string) => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = state.records.find(
      (r) => r.date === today && r.driverName === driverName
    );
    if (!todayRecord || todayRecord.status === 'pass') {
      return { hasException: false, currentStep: null, relatedNoticeId: null, relatedRecordId: null };
    }
    const relatedNotice = state.safetyNotices.find((n) => n.taskId === todayRecord.id);
    if (!relatedNotice) {
      return {
        hasException: true,
        currentStep: 'safety' as const,
        relatedNoticeId: null,
        relatedRecordId: todayRecord.id
      };
    }
    if (!relatedNotice.handled) {
      return {
        hasException: true,
        currentStep: 'safety' as const,
        relatedNoticeId: relatedNotice.id,
        relatedRecordId: todayRecord.id
      };
    }
    if (relatedNotice.supervisorStatus === 'archived') {
      return {
        hasException: true,
        currentStep: 'archived' as const,
        relatedNoticeId: relatedNotice.id,
        relatedRecordId: todayRecord.id
      };
    }
    return {
      hasException: true,
      currentStep: 'supervisor' as const,
      relatedNoticeId: relatedNotice.id,
      relatedRecordId: todayRecord.id
    };
  },

  getTodaySupervisorNotices: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    return state.safetyNotices.filter((n) => {
      const noticeDate = n.createTime.split('T')[0];
      return noticeDate === today && n.handled;
    });
  }
}));

export default useAppStore;
