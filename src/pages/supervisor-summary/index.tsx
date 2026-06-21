import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, TextInput } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import useAppStore from '@/store';
import type { SafetyNotice, SupervisorStatus, ExceptionType, HandleResult } from '@/types';
import {
  getExceptionTypeText,
  getHandleResultText,
  getSupervisorStatusText
} from '@/utils';
import styles from './index.module.scss';

type SupervisorFilter = 'all' | 'pending_review' | 'archived' | 'returned';

const FILTERS: { key: SupervisorFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending_review', label: '待确认' },
  { key: 'archived', label: '已归档' },
  { key: 'returned', label: '已退回' }
];

const SupervisorSummary: React.FC = () => {
  const notices = useAppStore((s) => s.safetyNotices);
  const handleSupervisorReview = useAppStore((s) => s.handleSupervisorReview);

  const [filter, setFilter] = useState<SupervisorFilter>('all');
  const [activeNotice, setActiveNotice] = useState<SafetyNotice | null>(null);
  const [modalType, setModalType] = useState<'archive' | 'return' | null>(null);
  const [supervisorRemark, setSupervisorRemark] = useState('');

  const todayNotices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return notices.filter((n) => {
      if (!n.handled) return false;
      return n.createTime.split('T')[0] === today;
    });
  }, [notices]);

  const stats = useMemo(() => ({
    total: todayNotices.length,
    pending: todayNotices.filter((n) => n.supervisorStatus === 'pending_review' || !n.supervisorStatus).length,
    archived: todayNotices.filter((n) => n.supervisorStatus === 'archived').length,
    returned: todayNotices.filter((n) => n.supervisorStatus === 'returned').length
  }), [todayNotices]);

  const filteredNotices = useMemo(() => {
    if (filter === 'all') return todayNotices;
    if (filter === 'pending_review') {
      return todayNotices.filter((n) => n.supervisorStatus === 'pending_review' || !n.supervisorStatus);
    }
    return todayNotices.filter((n) => n.supervisorStatus === filter);
  }, [todayNotices, filter]);

  const getTypeTagClass = (type: ExceptionType) => {
    const map: Record<ExceptionType, string> = {
      over_limit: styles.typeOver,
      device_error: styles.typeDevice,
      timeout: styles.typeTimeout,
      other: styles.typeOther
    };
    return map[type];
  };

  const getStatusTagClass = (status?: SupervisorStatus) => {
    if (status === 'archived') return styles.tagArchived;
    if (status === 'returned') return styles.tagReturned;
    return styles.tagPending;
  };

  const handleOpenArchiveModal = (notice: SafetyNotice) => {
    setActiveNotice(notice);
    setModalType('archive');
    setSupervisorRemark('异常处理流程完整，同意归档');
  };

  const handleOpenReturnModal = (notice: SafetyNotice) => {
    setActiveNotice(notice);
    setModalType('return');
    setSupervisorRemark('');
  };

  const closeModal = () => {
    setActiveNotice(null);
    setModalType(null);
    setSupervisorRemark('');
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSubmit = () => {
    if (!activeNotice || !modalType || !supervisorRemark.trim()) return;
    handleSupervisorReview({
      noticeId: activeNotice.id,
      supervisorName: '车队主管-王队',
      action: modalType === 'archive' ? 'archive' : 'return',
      remark: supervisorRemark.trim()
    });
    Taro.showToast({
      title: modalType === 'archive' ? '已归档' : '已退回',
      icon: 'success'
    });
    closeModal();
  };

  const canSubmit = supervisorRemark.trim().length >= 5;
  const isPending = (notice: SafetyNotice) =>
    !notice.supervisorStatus || notice.supervisorStatus === 'pending_review';

  const goToRecordDetail = (taskId: string) => {
    Taro.navigateTo({ url: `/pages/record-detail/index?id=${taskId}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={classnames(styles.num, styles.warn)}>{stats.pending}</Text>
            <Text className={styles.label}>待确认</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.num, styles.success)}>{stats.archived}</Text>
            <Text className={styles.label}>已归档</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.num, styles.danger)}>{stats.returned}</Text>
            <Text className={styles.label}>已退回</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {FILTERS.map((f) => (
          <View
            key={f.key}
            className={classnames(styles.tab, filter === f.key && styles.active)}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.list}>
        {filteredNotices.length === 0 ? (
          <View className={styles.empty}>暂无记录</View>
        ) : (
          filteredNotices.map((notice) => (
            <View key={notice.id} className={styles.card} onClick={() => goToRecordDetail(notice.taskId)}>
              <View className={styles.cardHeader}>
                <View className={styles.driverInfo}>
                  <Text className={styles.driverName}>{notice.driverName}</Text>
                  <Text className={styles.plateInfo}>
                    {notice.plateNo} · {notice.routeName}
                  </Text>
                </View>
                <View className={classnames(styles.typeTag, getTypeTagClass(notice.exceptionType))}>
                  {getExceptionTypeText(notice.exceptionType)}
                </View>
              </View>

              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>首次检测值</Text>
                <Text className={styles.infoValue}>
                  {notice.alcoholValue !== undefined ? (
                    <Text className={styles.valueHighlight}>
                      {notice.alcoholValue} mg/100ml
                    </Text>
                  ) : (
                    '无读数'
                  )}
                </Text>
              </View>

              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>异常说明</Text>
                <Text className={styles.infoValue}>{notice.exceptionRemark}</Text>
              </View>

              <View className={styles.photosRow}>
                {notice.photos.slice(0, 3).map((p, i) => (
                  <View key={i} className={styles.photoItem}>
                    <Image src={p} mode='aspectFill' className={styles.photo} />
                    <Text className={styles.photoLabel}>现场{i + 1}</Text>
                  </View>
                ))}
              </View>

              <View className={styles.safetySection}>
                <View className={styles.sectionTitle}>
                  <View className={classnames(styles.dot, styles.dotYellow)} />
                  安全员处理
                  <View className={classnames(styles.statusTag, getStatusTagClass(notice.supervisorStatus))}>
                    {getSupervisorStatusText(notice.supervisorStatus)}
                  </View>
                </View>

                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>处理结果</Text>
                  <Text className={styles.infoValue}>
                    {getHandleResultText(notice.handleResult as HandleResult)}
                  </Text>
                </View>

                {notice.handleResult === 'retest_pass' && (
                  <>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>复测读数</Text>
                      <Text className={styles.infoValue}>
                        {notice.retestValue !== undefined ? (
                          <Text className={styles.valuePass}>
                            {notice.retestValue} mg/100ml
                          </Text>
                        ) : (
                          '无'
                        )}
                      </Text>
                    </View>
                    <View className={styles.photosRow}>
                      {notice.retestPhoto ? (
                        <View className={styles.photoItem}>
                          <Image src={notice.retestPhoto} mode='aspectFill' className={styles.photo} />
                          <Text className={styles.photoLabel}>复测照</Text>
                        </View>
                      ) : (
                        <View className={styles.noPhoto}>未上传复测照片</View>
                      )}
                    </View>
                  </>
                )}

                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>处理意见</Text>
                  <Text className={styles.infoValue}>{notice.handleRemark || '-'}</Text>
                </View>

                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>处理人/时间</Text>
                  <Text className={styles.infoValue}>
                    {notice.handlerName || '-'}
                    {notice.handleTime ? ` · ${notice.handleTime.split('T')[1].slice(0, 5)}` : ''}
                  </Text>
                </View>
              </View>

              {notice.supervisorStatus && notice.supervisorStatus !== 'pending_review' && (
                <View className={styles.safetySection}>
                  <View className={styles.sectionTitle}>
                    <View className={classnames(styles.dot, notice.supervisorStatus === 'archived' ? styles.dotGreen : styles.dotBlue)} />
                    主管{notice.supervisorStatus === 'archived' ? '归档' : '退回'}
                  </View>
                  <View className={styles.supervisorInfo}>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>主管意见</Text>
                      <Text className={styles.infoValue}>{notice.supervisorRemark || '-'}</Text>
                    </View>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>处理人/时间</Text>
                      <Text className={styles.infoValue}>
                        {notice.supervisorName || '-'}
                        {notice.supervisorTime ? ` · ${notice.supervisorTime.split('T')[1].slice(0, 5)}` : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {isPending(notice) && (
                <View className={styles.actionRow}>
                  <View
                    className={classnames(styles.btn, styles.btnPrimary)}
                    onClick={(e) => { e.stopPropagation(); handleOpenArchiveModal(notice); }}
                  >
                    确认归档
                  </View>
                  <View
                    className={classnames(styles.btn, styles.btnDanger)}
                    onClick={(e) => { e.stopPropagation(); handleOpenReturnModal(notice); }}
                  >
                    退回补充
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {modalType && activeNotice && (
        <View className={styles.modalMask} onClick={closeModal}>
          <View className={styles.modalContent} onClick={handleModalContentClick}>
            <Text className={styles.modalTitle}>
              {modalType === 'archive' ? '确认归档' : '退回补充说明'}
            </Text>
            <Text className={styles.modalHint}>
              司机：{activeNotice.driverName} · {activeNotice.plateNo}
            </Text>
            <TextInput
              className={styles.modalTextarea}
              placeholder={modalType === 'archive' ? '请输入归档确认意见（至少5字）' : '请输入退回补充说明原因（至少5字）'}
              value={supervisorRemark}
              onInput={(e) => setSupervisorRemark(e.detail.value)}
              maxlength={200}
            />
            <View className={styles.modalBtnRow}>
              <View className={styles.modalCancel} onClick={closeModal}>取消</View>
              <View
                className={classnames(
                  styles.modalConfirm,
                  modalType === 'archive' ? styles.modalConfirmArchive : styles.modalConfirmReturn,
                  !canSubmit && styles.btnDisabled
                )}
                onClick={canSubmit ? handleSubmit : undefined}
              >
                {modalType === 'archive' ? '确认归档' : '确认退回'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SupervisorSummary;
